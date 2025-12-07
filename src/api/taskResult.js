import api from './knowledge'

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










