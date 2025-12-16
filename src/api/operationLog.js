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
 * 获取我的活动操作日志（聚合所有类型）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从0开始
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getMyActivityLogs(params) {
  return api.get('/zhiyan/activelog/myself/all', {
    params: {
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取我的项目操作日志
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMyProjectLogs(params) {
  return api.get('/zhiyan/activelog/myself/project-logs', {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取我的任务操作日志
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMyTaskLogs(params) {
  return api.get('/zhiyan/activelog/myself/task-logs', {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取我的Wiki操作日志
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMyWikiLogs(params) {
  return api.get('/zhiyan/activelog/myself/wiki-logs', {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取我的成果操作日志
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMyAchievementLogs(params) {
  return api.get('/zhiyan/activelog/myself/achievement-logs', {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取我的登录日志
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMyLoginLogs(params) {
  return api.get('/zhiyan/activelog/myself/login-logs', {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取项目操作日志
 * @param {string} projectId - 项目ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProjectOperationLogs(projectId, params) {
  return api.get(`/zhiyan/activelog/project/${projectId}`, {
    params: {
      page: params.page || 0,
      size: params.size || 20,
      operationType: params.operationType
    }
  })
}

/**
 * 获取项目内所有类型的操作日志（聚合查询）
 * @param {string} projectId - 项目ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProjectAllLogs(projectId, params) {
  return api.get(`/zhiyan/activelog/projects/${projectId}/all`, {
    params: {
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取项目内项目操作日志（带筛选）
 * @param {string} projectId - 项目ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProjectProjectLogs(projectId, params) {
  return api.get(`/zhiyan/activelog/projects/${projectId}/project-logs`, {
    params: {
      operationType: params.operationType,
      username: params.username,
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取项目内任务操作日志（带筛选）
 * @param {string} projectId - 项目ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProjectTaskLogs(projectId, params) {
  return api.get(`/zhiyan/activelog/projects/${projectId}/task-logs`, {
    params: {
      taskId: params.taskId,
      operationType: params.operationType,
      username: params.username,
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取项目内Wiki操作日志（带筛选）
 * @param {string} projectId - 项目ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProjectWikiLogs(projectId, params) {
  return api.get(`/zhiyan/activelog/projects/${projectId}/wiki-logs`, {
    params: {
      wikiPageId: params.wikiPageId,
      operationType: params.operationType,
      username: params.username,
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 获取项目内成果操作日志（带筛选）
 * @param {string} projectId - 项目ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProjectAchievementLogs(projectId, params) {
  return api.get(`/zhiyan/activelog/projects/${projectId}/achievement-logs`, {
    params: {
      achievementId: params.achievementId,
      operationType: params.operationType,
      username: params.username,
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 0,
      size: params.size || 20
    }
  })
}

/**
 * 导出项目操作日志
 * @param {string} projectId - 项目ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportProjectLogs(projectId, params) {
  return api.get(`/zhiyan/activelog/export/projects/${projectId}/project-logs`, {
    params: {
      operationType: params.operationType,
      username: params.username,
      startTime: params.startTime,
      endTime: params.endTime,
      limit: params.limit
    },
    responseType: 'blob'
  })
}

/**
 * 导出我的操作日志
 * @param {Object} params - 查询参数
 * @param {string} params.startTime - 开始时间，格式：yyyy-MM-dd HH:mm:ss
 * @param {string} params.endTime - 结束时间，格式：yyyy-MM-dd HH:mm:ss
 * @param {number} params.limit - 导出条数限制，不传则导出全部
 * @returns {Promise}
 */
export function exportMyLogs(params = {}) {
  return api.get('/zhiyan/activelog/export/my-logs', {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      limit: params.limit
    },
    responseType: 'blob'
  })
}

/**
 * 操作类型枚举
 */
export const OperationType = {
  // 任务操作
  TASK_CREATE: 'TASK_CREATE',
  TASK_UPDATE: 'TASK_UPDATE',
  TASK_DELETE: 'TASK_DELETE',
  TASK_SUBMIT: 'TASK_SUBMIT',
  TASK_REVIEW: 'TASK_REVIEW',
  
  // 项目操作
  PROJECT_CREATE: 'PROJECT_CREATE',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
  PROJECT_DELETE: 'PROJECT_DELETE',
  
  // 文件操作
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DELETE: 'FILE_DELETE',
  
  // 评论操作
  COMMENT_CREATE: 'COMMENT_CREATE',
  COMMENT_DELETE: 'COMMENT_DELETE',
  
  // 成员操作
  MEMBER_ADD: 'MEMBER_ADD',
  MEMBER_REMOVE: 'MEMBER_REMOVE'
}

/**
 * 获取操作类型的中文描述
 * @param {string} type - 操作类型
 * @returns {string} 中文描述
 */
export function getOperationTypeText(type) {
  const typeMap = {
    'TASK_CREATE': '创建任务',
    'TASK_UPDATE': '更新任务',
    'TASK_DELETE': '删除任务',
    'TASK_SUBMIT': '提交任务',
    'TASK_REVIEW': '审核任务',
    'PROJECT_CREATE': '创建项目',
    'PROJECT_UPDATE': '更新项目',
    'PROJECT_DELETE': '删除项目',
    'FILE_UPLOAD': '上传文件',
    'FILE_DELETE': '删除文件',
    'COMMENT_CREATE': '创建评论',
    'COMMENT_DELETE': '删除评论',
    'MEMBER_ADD': '添加成员',
    'MEMBER_REMOVE': '移除成员'
  }
  return typeMap[type] || type
}
