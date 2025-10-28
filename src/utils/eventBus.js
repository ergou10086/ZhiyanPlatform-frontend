// 事件总线工具
import Vue from 'vue'

// 创建一个新的Vue实例作为事件总线
export const EventBus = new Vue()

// 导出事件名称常量
export const EVENTS = {
  LOGIN_SUCCESS: 'login-success',
  USER_INFO_UPDATED: 'user-info-updated',
  LOGOUT: 'logout'
}
