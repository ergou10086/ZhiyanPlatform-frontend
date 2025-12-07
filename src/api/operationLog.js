import request from '@/utils/request'

/**
 * 获取我的活动操作日志（聚合所有类型）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从0开始
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getMyActivityLogs(params) {
  return request({
    url: '/zhiyan/activelog/myself/all',
    method: 'get',
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
  return request({
    url: '/zhiyan/activelog/myself/project-logs',
    method: 'get',
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
  return request({
    url: '/zhiyan/activelog/myself/task-logs',
    method: 'get',
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
  return request({
    url: '/zhiyan/activelog/myself/wiki-logs',
    method: 'get',
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
  return request({
    url: '/zhiyan/activelog/myself/achievement-logs',
    method: 'get',
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
  return request({
    url: '/zhiyan/activelog/myself/login-logs',
    method: 'get',
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
  return request({
    url: `/zhiyan/activelog/project/${projectId}`,
    method: 'get',
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
  return request({
    url: `/zhiyan/activelog/projects/${projectId}/all`,
    method: 'get',
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
  return request({
    url: `/zhiyan/activelog/projects/${projectId}/project-logs`,
    method: 'get',
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
  return request({
    url: `/zhiyan/activelog/projects/${projectId}/task-logs`,
    method: 'get',
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
  return request({
    url: `/zhiyan/activelog/projects/${projectId}/wiki-logs`,
    method: 'get',
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
  return request({
    url: `/zhiyan/activelog/projects/${projectId}/achievement-logs`,
    method: 'get',
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
  return request({
    url: `/zhiyan/activelog/export/projects/${projectId}/project-logs`,
    method: 'get',
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
  return request({
    url: '/zhiyan/activelog/export/my-logs',
    method: 'get',
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
