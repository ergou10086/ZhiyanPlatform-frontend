import axios from 'axios'
import config from '@/config'

/**
 * 自定义JSON解析函数 - 将大整数转换为字符串以避免精度丢失
 * 增强健壮性：只有在看起来是 JSON 字符串时才尝试解析，
 * 避免对错误页/纯文本执行 JSON.parse 导致控制台频繁 SyntaxError。
 */
function parseJSONWithBigInt(data) {
  if (typeof data !== 'string') return data

  const trimmed = data.trim()
  if (!trimmed) return data

  // 仅当响应内容以 "{" 或 "[" 开头时，才视为 JSON 尝试解析
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return data
  }

  try {
    // ⚠️ 必须在 JSON.parse 之前用正则替换大整数！
    // 因为一旦 JSON.parse 执行，大整数就已经被转换成 Number，精度已丢失
    const processedData = trimmed
      // 匹配对象属性值中的大整数: "key": 数字 (16位及以上)
      .replace(/:(\s*)(\d{16,})(\s*[,}\]])/g, ':$1"$2"$3')
      // 匹配数组开头的大整数: [数字
      .replace(/\[(\s*)(\d{16,})(\s*[,\]])/g, '[$1"$2"$3')
      // 匹配数组中间的大整数: ,数字
      .replace(/,(\s*)(\d{16,})(\s*[,\]])/g, ',$1"$2"$3')
    
    return JSON.parse(processedData)
  } catch (e) {
    console.error('JSON解析错误:', e)
    console.error('原始数据前500字符:', trimmed.substring(0, 500))
    // 尝试找到出错位置
    if (e.message && e.message.includes('position')) {
      const match = e.message.match(/position (\d+)/)
      if (match) {
        const pos = parseInt(match[1])
        console.error(`出错位置附近的内容: ...${trimmed.substring(Math.max(0, pos - 50), Math.min(trimmed.length, pos + 50))}...`)
      }
    }
    return data
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
    
    // 对于FormData，不要手动设置Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else if (!config.headers['Content-Type']) {
      // 对于非 FormData 数据，设置默认的 Content-Type
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
    // 后端返回的response.data就是R对象，包含code、msg、data字段
    // 直接返回response.data，这样前端就能访问到R对象的完整结构
    return response.data
  },
  error => {
    console.error('API错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      console.error('服务器错误:', status, data)
      
      if (status === 401) {
        // token过期，跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      // ✅ 处理 403 Forbidden - 可能是 token 过期或无效
      if (status === 403) {
        console.error('[API响应拦截器] ❌ 403 Forbidden - 认证失败')
        console.error('[API响应拦截器] 清除所有认证信息并跳转到登录页')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      return Promise.reject(data || error)
    } else if (error.request) {
      console.error('网络错误:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查后端服务'))
    } else {
      console.error('其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

/**
 * 任务成果相关API
 * 用于AI生成任务成果草稿、关联任务等功能
 */

/**
 * 生成任务成果AI草稿
 * @param {Object} request - 生成请求
 * @param {Number} request.projectId - 项目ID
 * @param {String} request.achievementTitle - 成果标题（可选）
 * @param {Array<Number>} request.taskIds - 关联的任务ID列表
 * @param {String} request.targetAudience - 目标读者
 * @param {Boolean} request.includeAttachments - 是否包含附件
 * @param {Array<String>} request.attachmentFilters - 附件过滤（文件类型）
 * @returns {Promise} 返回生成任务ID
 */
export function generateTaskResultDraft(request) {
  console.log('[taskResultAPI.generateTaskResultDraft] 生成任务成果草稿, 数据:', request)
  return api.post('/zhiyan/ai/achievement/generate/draft', request)
}

/**
 * 批量查询任务附件
 * @param {Array<Number>} taskIds - 任务ID列表
 * @returns {Promise} Map<任务ID(字符串), 附件URL列表>
 */
export function getTasksAttachments(taskIds) {
  console.log('[taskResultAPI.getTasksAttachments] 批量查询任务附件, taskIds:', taskIds)
  return api.post('/zhiyan/projects/tasks/submissions/tasks/attachments/batch', taskIds)
}

/**
 * 查询AI生成任务状态
 * @param {String} jobId - 生成任务ID
 * @returns {Promise} 返回任务状态和结果
 */
export function getGenerateStatus(jobId) {
  console.log('[taskResultAPI.getGenerateStatus] 查询生成状态, jobId:', jobId)
  return api.get(`/zhiyan/ai/achievement/generate/status/${jobId}`)
}

/**
 * 取消AI生成任务
 * @param {String} jobId - 生成任务ID
 * @returns {Promise}
 */
export function cancelGenerate(jobId) {
  console.log('[taskResultAPI.cancelGenerate] 取消生成, jobId:', jobId)
  return api.delete(`/zhiyan/ai/achievement/generate/cancel/${jobId}`)
}

/**
 * 关联任务到成果
 * @param {Number|String} achievementId - 成果ID
 * @param {Array<Number>} taskIds - 任务ID列表
 * @returns {Promise}
 */
export function linkTasksToAchievement(achievementId, taskIds) {
  console.log('[taskResultAPI.linkTasksToAchievement] 关联任务, achievementId:', achievementId, 'taskIds:', taskIds)
  return api.post(`/zhiyan/achievement/${achievementId}/tasks/link`, taskIds)
}

/**
 * 取消关联任务
 * @param {Number|String} achievementId - 成果ID
 * @param {Array<Number>} taskIds - 任务ID列表
 * @returns {Promise}
 */
export function unlinkTasksFromAchievement(achievementId, taskIds) {
  console.log('[taskResultAPI.unlinkTasksFromAchievement] 取消关联任务, achievementId:', achievementId, 'taskIds:', taskIds)
  return api.delete(`/zhiyan/achievement/${achievementId}/tasks/unlink`, { data: taskIds })
}

/**
 * 获取成果关联的任务列表
 * @param {Number|String} achievementId - 成果ID
 * @returns {Promise} 返回任务列表
 */
export function getLinkedTasks(achievementId) {
  console.log('[taskResultAPI.getLinkedTasks] 获取关联任务, achievementId:', achievementId)
  return api.get(`/zhiyan/achievement/${achievementId}/tasks`)
}

/**
 * 获取用户的AI草稿列表
 * @returns {Promise} 返回草稿列表
 */
export function getAIDrafts() {
  console.log('[taskResultAPI.getAIDrafts] 获取AI草稿列表(当前登录用户)')
  return api.get('/zhiyan/ai/achievement/generate/drafts')
}

/**
 * 保存AI草稿
 * @param {Object} draftData - 草稿数据
 * @returns {Promise}
 */
export function saveAIDraft(draftData) {
  console.log('[taskResultAPI.saveAIDraft] 保存AI草稿, 数据:', draftData)
  return api.post('/zhiyan/achievement/ai-drafts', draftData)
}

/**
 * 创建任务成果
 * @param {Object} achievementData - 成果数据
 * @returns {Promise}
 */
export function createTaskResultAchievement(achievementData) {
  console.log('[taskResultAPI.createTaskResultAchievement] 创建任务成果, 数据:', achievementData)
  return api.post('/zhiyan/achievement/task-result', achievementData)
}

/**
 * 获取任务成果详情
 * @param {Number|String} achievementId - 成果ID
 * @returns {Promise}
 */
export function getTaskResultDetail(achievementId) {
  console.log('[taskResultAPI.getTaskResultDetail] 获取任务成果详情, achievementId:', achievementId)
  return api.get(`/zhiyan/achievement/${achievementId}/task-result`)
}

export default {
  generateTaskResultDraft,
  getGenerateStatus,
  cancelGenerate,
  linkTasksToAchievement,
  unlinkTasksFromAchievement,
  getLinkedTasks,
  getAIDrafts,
  saveAIDraft,
  createTaskResultAchievement,
  getTaskResultDetail,
  getTasksAttachments
}
