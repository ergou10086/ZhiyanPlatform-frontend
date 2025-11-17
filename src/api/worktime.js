import axios from 'axios'
import config from '@/config'

/**
 * 自定义JSON解析函数 - 将大整数转换为字符串以避免精度丢失
 */
function parseJSONWithBigInt(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data.replace(/:(\s*)(\d{16,})/g, ':$1"$2"'))
  } catch (e) {
    console.error('JSON解析错误:', e)
    return data
  }
}

/**
 * 工时管理服务API客户端
 * 
 * 注意：所有工时相关的API请求都通过Vue开发服务器的代理转发到8095端口（项目服务）
 * 代理配置在 vue.config.js 中：
 * - /zhiyan/api/projects → http://localhost:8095
 * 
 * 使用相对路径（baseURL为空），让代理服务器处理路由
 */
const api = axios.create({
  baseURL: '', // 使用相对路径，通过Vue代理转发到8095端口（项目服务）
  timeout: config.api.timeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
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
    
    console.log('[工时API] 请求:', config.method?.toUpperCase(), config.url)
    console.log('[工时API] 请求数据:', config.data)
    
    return config
  },
  error => {
    console.error('[工时API] 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('[工时API] 响应:', response.status, response.data)
    // 后端返回的response.data就是R对象，包含code、msg、data字段
    // 直接返回response.data，这样前端就能访问到R对象的完整结构
    return response.data
  },
  error => {
    console.error('[工时API] 错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      console.error('[工时API] 服务器错误:', status, data)
      
      if (status === 401) {
        // token过期，跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      if (status === 403) {
        console.error('[工时API] ❌ 403 Forbidden - 认证失败')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      // 返回后端返回的错误数据（R对象），如果没有则返回error对象
      return Promise.reject(data || error)
    } else if (error.request) {
      console.error('[工时API] 网络错误:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查后端服务'))
    } else {
      console.error('[工时API] 其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

/**
 * 工时相关API
 */
export const worktimeAPI = {
  /**
   * 提交任务工时（通过任务提交接口）
   * @param {Number} taskId - 任务ID
   * @param {Object} worktimeData - 工时数据
   * @param {Number|String} worktimeData.actualWorktime - 实际工时（单位：小时，支持小数）
   * @param {String} worktimeData.submissionContent - 提交说明（必填，至少10字符）
   * @param {Array<String>} worktimeData.attachmentUrls - 附件URL列表（可选）
   * @returns {Promise} 返回提交结果
   * 
   * @example
   * worktimeAPI.submitWorktime(123, {
   *   actualWorktime: 8.5,
   *   submissionContent: '完成了数据库设计和接口开发，耗时8.5小时',
   *   attachmentUrls: ['https://example.com/file.pdf']
   * })
   */
  submitWorktime(taskId, worktimeData) {
    console.log('[worktimeAPI.submitWorktime] 提交任务工时, 任务ID:', taskId, '数据:', worktimeData)
    
    // 验证工时数据
    if (!worktimeData.submissionContent || worktimeData.submissionContent.trim().length < 10) {
      return Promise.reject(new Error('提交说明至少需要10个字符'))
    }
    
    // 构建请求数据
    const payload = {
      submissionContent: worktimeData.submissionContent.trim(),
      attachmentUrls: worktimeData.attachmentUrls || []
    }
    
    // 处理工时数据
    if (worktimeData.actualWorktime !== undefined && worktimeData.actualWorktime !== null && worktimeData.actualWorktime !== '') {
      const parsed = Number(worktimeData.actualWorktime)
      if (Number.isNaN(parsed)) {
        return Promise.reject(new Error('提交工时必须是数字'))
      }
      if (parsed < 0) {
        return Promise.reject(new Error('提交工时不能为负数'))
      }
      // 保留2位小数
      payload.actualWorktime = Number(parsed.toFixed(2))
    }
    
    return api({
      url: `/zhiyan/api/projects/tasks/submissions/${taskId}/submit`,
      method: 'post',
      data: payload
    })
  },

  /**
   * 获取任务的最新工时信息
   * @param {Number} taskId - 任务ID
   * @returns {Promise} 返回最新提交记录中的工时信息
   * 
   * @example
   * worktimeAPI.getLatestWorktime(123).then(response => {
   *   if (response.code === 200 && response.data) {
   *     const worktime = response.data.actualWorktime
   *     console.log('最新工时:', worktime)
   *   }
   * })
   */
  getLatestWorktime(taskId) {
    console.log('[worktimeAPI.getLatestWorktime] 获取任务最新工时, 任务ID:', taskId)
    return api({
      url: `/zhiyan/api/projects/tasks/submissions/task/${taskId}/latest`,
      method: 'get'
    })
  },

  /**
   * 获取任务的所有工时记录
   * @param {Number} taskId - 任务ID
   * @returns {Promise} 返回任务的所有提交记录（包含工时信息）
   * 
   * @example
   * worktimeAPI.getTaskWorktimeHistory(123).then(response => {
   *   if (response.code === 200 && response.data) {
   *     const submissions = response.data
   *     submissions.forEach(sub => {
   *       if (sub.actualWorktime) {
   *         console.log('工时:', sub.actualWorktime, '提交时间:', sub.submissionTime)
   *       }
   *     })
   *   }
   * })
   */
  getTaskWorktimeHistory(taskId) {
    console.log('[worktimeAPI.getTaskWorktimeHistory] 获取任务工时历史, 任务ID:', taskId)
    return api({
      url: `/zhiyan/api/projects/tasks/submissions/task/${taskId}`,
      method: 'get'
    })
  },

  /**
   * 获取提交记录的工时详情
   * @param {Number} submissionId - 提交记录ID
   * @returns {Promise} 返回提交记录的详细信息（包含工时）
   * 
   * @example
   * worktimeAPI.getSubmissionWorktime(456).then(response => {
   *   if (response.code === 200 && response.data) {
   *     const submission = response.data
   *     console.log('工时:', submission.actualWorktime)
   *     console.log('提交人:', submission.submitter)
   *     console.log('提交时间:', submission.submissionTime)
   *   }
   * })
   */
  getSubmissionWorktime(submissionId) {
    console.log('[worktimeAPI.getSubmissionWorktime] 获取提交记录工时, 提交ID:', submissionId)
    return api({
      url: `/zhiyan/api/projects/tasks/submissions/${submissionId}`,
      method: 'get'
    })
  }
}

/**
 * 导出默认对象（兼容性）
 */
export default worktimeAPI

