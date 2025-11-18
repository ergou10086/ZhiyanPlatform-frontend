import request from '@/utils/request'

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
    url: '/zhiyan/message/inbox',
    method: 'get',
    params
  })
}

/**
 * 获取未读消息数量
 */
export function getUnreadCount() {
  return request({
    url: '/zhiyan/message/inbox/unread-count',
    method: 'get'
  })
}

/**
 * 标记消息为已读
 * @param {number} messageId - 消息ID
 */
export function markAsRead(messageId) {
  return request({
    url: `/zhiyan/message/inbox/${messageId}/read`,
    method: 'put'
  })
}

/**
 * 批量标记消息为已读
 * @param {Array<number>} messageIds - 消息ID列表
 */
export function batchMarkAsRead(messageIds) {
  return request({
    url: '/zhiyan/message/inbox/batch-read',
    method: 'put',
    data: messageIds
  })
}

/**
 * 标记所有消息为已读
 */
export function markAllAsRead() {
  return request({
    url: '/zhiyan/message/inbox/read-all',
    method: 'put'
  })
}

/**
 * 删除消息
 * @param {number} messageId - 消息ID
 */
export function deleteMessage(messageId) {
  return request({
    url: `/zhiyan/message/inbox/${messageId}`,
    method: 'delete'
  })
}

/**
 * 批量删除消息
 * @param {Array<number>} messageIds - 消息ID列表
 */
export function batchDeleteMessages(messageIds) {
  return request({
    url: '/zhiyan/message/inbox/batch-delete',
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
    url: `/zhiyan/message/inbox/${messageId}`,
    method: 'get'
  })
}

/**
 * 按场景分组统计未读消息
 */
export function getUnreadCountByScene() {
  return request({
    url: '/zhiyan/message/inbox/unread-count-by-scene',
    method: 'get'
  })
}
