import axios from 'axios'
import config from '@/config'

/**
 * 自定义JSON解析函数 - 将大整数转换为字符串以避免精度丢失
 */
function parseJSONWithBigInt(data) {
  if (typeof data !== 'string') return data
  // 处理空字符串或null
  if (!data || data.trim() === '') {
    console.warn('收到空响应数据')
    return null
  }
  try {
    return JSON.parse(data.replace(/:(\s*)(\d{16,})/g, ':$1"$2"'))
  } catch (e) {
    console.error('JSON解析错误:', e)
    console.error('原始数据:', data)
    return null
  }
}

// 创建axios实例
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  // 自定义响应转换，将大整数转换为字符串
  transformResponse: [function (data) {
    return parseJSONWithBigInt(data)
  }]
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 确保Content-Type正确设置
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API错误详情:', error)
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      console.error('服务器错误:', status, data)
      if (status === 401) {
        // token过期，清除本地存储并跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      return Promise.reject(data || error)
    } else if (error.request) {
      // 网络错误
      console.error('网络错误详情:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查后端服务'))
    } else {
      // 其他错误
      console.error('其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

/**
 * 消息模块API
 */

/**
 * 获取用户收件箱消息列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从0开始）
 * @param {number} params.size - 每页数量
 * @param {string} params.scene - 消息场景（可选）
 * @param {boolean} params.isRead - 是否已读（可选）
 */
export function getInboxMessages(params) {
  return api.get('/zhiyan/message/list', { params })
}

/**
 * 获取未读消息数量
 */
export function getUnreadCount() {
  return api.get('/zhiyan/message/unread/count')
}

/**
 * 获取未读消息列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从0开始）
 * @param {number} params.size - 每页数量
 */
export function getUnreadMessages(params) {
  return api.get('/zhiyan/message/unread', { params })
}

/**
 * 标记消息为已读
 * @param {number} messageId - 消息ID
 */
export function markAsRead(messageId) {
  return api.put(`/zhiyan/message/read/${messageId}`)
}

/**
 * 批量标记消息为已读
 * @param {Array<number>} messageIds - 消息ID列表
 */
export function batchMarkAsRead(messageIds) {
  return api.put('/zhiyan/message/read/batch', messageIds)
}

/**
 * 标记所有消息为已读
 */
export function markAllAsRead() {
  return api.put('/zhiyan/message/read/all')
}

/**
 * 清空所有已读消息（真删除）
 */
export function clearReadMessages() {
  return api.delete('/zhiyan/message/clear')
}

/**
 * 删除消息
 * @param {number} messageId - 消息ID
 */
export function deleteMessage(messageId) {
  return api.delete(`/zhiyan/message/${messageId}`)
}

/**
 * 批量删除消息
 * @param {Array<number>} messageIds - 消息ID列表
 */
export function batchDeleteMessages(messageIds) {
  return api.delete('/zhiyan/message/batch-delete', { data: messageIds })
}

/**
 * 获取消息详情
 * @param {number} messageId - 消息ID
 */
export function getMessageDetail(messageId) {
  return api.get(`/zhiyan/message/${messageId}`)
}

/**
 * 按场景分组统计未读消息
 */
export function getUnreadCountByScene() {
  return api.get('/zhiyan/message/unread/count-by-scene')
}

/**
 * 发送自定义消息给指定用户（私信）
 * @param {Object} data
 * @param {string} data.receiverUsername - 接收者用户名
 * @param {string} data.title - 消息标题
 * @param {string} data.content - 消息内容
 */
export function sendMessageToUser(data) {
  return api.post('/zhiyan/message/send/to-user', data)
}

/**
 * 向项目内所有成员（除自己外）群发自定义消息
 * @param {Object} data
 * @param {number} data.projectId - 项目ID
 * @param {string} data.title - 消息标题
 * @param {string} data.content - 消息内容
 */
export function sendMessageToProject(data) {
  return api.post('/zhiyan/message/send/to-project', data)
}

/**
 * 同意项目邀请（受邀人点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function acceptProjectInvitation(recipientId) {
  return api.post(`/zhiyan/message/project/invite/${recipientId}/accept`)
}

/**
 * 拒绝项目邀请（受邀人点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function rejectProjectInvitation(recipientId) {
  return api.post(`/zhiyan/message/project/invite/${recipientId}/reject`)
}

/**
 * 同意项目加入申请（管理员点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function approveProjectJoin(recipientId) {
  return api.post(`/zhiyan/message/project/apply/${recipientId}/approve`)
}

/**
 * 拒绝项目加入申请（管理员点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function rejectProjectJoin(recipientId) {
  return api.post(`/zhiyan/message/project/apply/${recipientId}/reject`)
}
