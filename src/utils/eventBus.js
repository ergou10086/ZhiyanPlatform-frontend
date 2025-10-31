/**
 * 全局事件总线
 * 用于跨组件通信，采用精确的事件类型
 */

// 事件类型常量
export const EventTypes = {
  // 用户相关
  USER_AVATAR_UPDATED: 'user:avatar:updated',
  USER_PROFILE_UPDATED: 'user:profile:updated',
  USER_NICKNAME_UPDATED: 'user:nickname:updated',
  
  // 项目相关
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  PROJECT_MEMBER_ADDED: 'project:member:added',
  PROJECT_MEMBER_REMOVED: 'project:member:removed',
  
  // 任务相关
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  
  // 知识库相关
  KNOWLEDGE_CREATED: 'knowledge:created',
  KNOWLEDGE_UPDATED: 'knowledge:updated',
  KNOWLEDGE_DELETED: 'knowledge:deleted',
  
  // Wiki相关
  WIKI_PAGE_CREATED: 'wiki:page:created',
  WIKI_PAGE_UPDATED: 'wiki:page:updated',
  WIKI_PAGE_DELETED: 'wiki:page:deleted'
}

/**
 * 事件总线类
 * 带防抖功能，避免频繁触发
 */
class EventBus {
  constructor() {
    this.listeners = new Map()
    this.debounceTimers = new Map()
  }

  /**
   * 监听事件
   * @param {string} eventType - 事件类型
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 选项
   * @param {number} options.debounce - 防抖延迟（毫秒）
   */
  on(eventType, handler, options = {}) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    
    this.listeners.get(eventType).push({
      handler,
      debounce: options.debounce || 0
    })
  }

  /**
   * 取消监听
   */
  off(eventType, handler) {
    if (!this.listeners.has(eventType)) return
    
    const handlers = this.listeners.get(eventType)
    const index = handlers.findIndex(h => h.handler === handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  /**
   * 触发事件
   * @param {string} eventType - 事件类型
   * @param {any} data - 事件数据
   */
  emit(eventType, data) {
    if (!this.listeners.has(eventType)) return
    
    const handlers = this.listeners.get(eventType)
    
    handlers.forEach(({ handler, debounce }) => {
      if (debounce > 0) {
        // 带防抖
        const timerId = `${eventType}_${handler.name || 'anonymous'}`
        
        if (this.debounceTimers.has(timerId)) {
          clearTimeout(this.debounceTimers.get(timerId))
        }
        
        const timer = setTimeout(() => {
          handler(data)
          this.debounceTimers.delete(timerId)
        }, debounce)
        
        this.debounceTimers.set(timerId, timer)
      } else {
        // 立即执行
        handler(data)
      }
    })
  }

  /**
   * 清除所有监听器
   */
  clear() {
    this.listeners.clear()
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }
}

// 创建全局单例
export const eventBus = new EventBus()

// Vue插件安装方法
export default {
  install(Vue) {
    // 将事件总线挂载到Vue原型，方便所有组件使用
    Vue.prototype.$eventBus = eventBus
    Vue.prototype.$EventTypes = EventTypes
  }
}
