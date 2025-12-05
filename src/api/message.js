import { proxyRequest as request } from '@/utils/request'

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
  return request({
    url: '/zhiyan/message/list',
    method: 'get',
    params
  })
}

/**
 * 获取未读消息数量
 */
export function getUnreadCount() {
  return request({
    url: '/zhiyan/message/unread/count',
    method: 'get'
  })
}

/**
 * 获取未读消息列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从0开始）
 * @param {number} params.size - 每页数量
 */
export function getUnreadMessages(params) {
  return request({
    url: '/zhiyan/message/unread',
    method: 'get',
    params
  })
}

/**
 * 标记消息为已读
 * @param {number} messageId - 消息ID
 */
export function markAsRead(messageId) {
  return request({
    url: `/zhiyan/message/read/${messageId}`,
    method: 'put'
  })
}

/**
 * 批量标记消息为已读
 * @param {Array<number>} messageIds - 消息ID列表
 */
export function batchMarkAsRead(messageIds) {
  return request({
    url: '/zhiyan/message/read/batch',
    method: 'put',
    data: messageIds
  })
}

/**
 * 标记所有消息为已读
 */
export function markAllAsRead() {
  return request({
    url: '/zhiyan/message/read/all',
    method: 'put'
  })
}

/**
 * 清空所有已读消息（真删除）
 */
export function clearReadMessages() {
  return request({
    url: '/zhiyan/message/clear',
    method: 'delete'
  })
}

/**
 * 删除消息
 * @param {number} messageId - 消息ID
 */
export function deleteMessage(messageId) {
  return request({
    url: `/zhiyan/message/${messageId}`,
    method: 'delete'
  })
}

/**
 * 批量删除消息
 * @param {Array<number>} messageIds - 消息ID列表
 */
export function batchDeleteMessages(messageIds) {
  return request({
    url: '/zhiyan/message/batch-delete',
    method: 'delete',
    data: messageIds
  })
}

/**
 * 获取消息详情
 * @param {number} messageId - 消息ID
 */
export function getMessageDetail(messageId) {
  return request({
    url: `/zhiyan/message/${messageId}`,
    method: 'get'
  })
}

/**
 * 按场景分组统计未读消息
 */
export function getUnreadCountByScene() {
  return request({
    url: '/zhiyan/message/unread/count-by-scene',
    method: 'get'
  })
}

/**
 * 发送自定义消息给指定用户（私信）
 * @param {Object} data
 * @param {string} data.receiverUsername - 接收者用户名
 * @param {string} data.title - 消息标题
 * @param {string} data.content - 消息内容
 */
export function sendMessageToUser(data) {
  return request({
    url: '/zhiyan/message/send/to-user',
    method: 'post',
    data
  })
}

/**
 * 向项目内所有成员（除自己外）群发自定义消息
 * @param {Object} data
 * @param {number} data.projectId - 项目ID
 * @param {string} data.title - 消息标题
 * @param {string} data.content - 消息内容
 */
export function sendMessageToProject(data) {
  return request({
    url: '/zhiyan/message/send/to-project',
    method: 'post',
    data
  })
}

/**
 * 同意项目邀请（受邀人点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function acceptProjectInvitation(recipientId) {
  return request({
    url: `/zhiyan/message/project/invite/${recipientId}/accept`,
    method: 'post'
  })
}

/**
 * 拒绝项目邀请（受邀人点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function rejectProjectInvitation(recipientId) {
  return request({
    url: `/zhiyan/message/project/invite/${recipientId}/reject`,
    method: 'post'
  })
}

/**
 * 同意项目加入申请（管理员点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function approveProjectJoin(recipientId) {
  return request({
    url: `/zhiyan/message/project/apply/${recipientId}/approve`,
    method: 'post'
  })
}

/**
 * 拒绝项目加入申请（管理员点击）
 * @param {number} recipientId - 消息收件记录ID
 */
export function rejectProjectJoin(recipientId) {
  return request({
    url: `/zhiyan/message/project/apply/${recipientId}/reject`,
    method: 'post'
  })
}
