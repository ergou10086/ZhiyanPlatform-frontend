import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/styles/responsive.css'
import GlobalUserProfile from './components/GlobalUserProfile.vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'
import Input from './components/Input.vue'
import authStore from './store/auth'
import tokenManager from './utils/tokenManager'
import EventBus, { eventBus } from './utils/eventBus'
import { responsiveMixin, device, preventIOSBounce } from './utils/responsive'

Vue.config.productionTip = false

// ==================== 全局错误捕获 ====================
/**
 * 格式化错误信息为可读字符串
 */
function formatError(error, errorInfo = {}) {
  let message = '发生未知错误'
  let stack = ''
  let details = ''

  // 处理不同类型的错误
  if (error instanceof Error) {
    message = error.message || '发生错误'
    stack = error.stack || ''
  } else if (typeof error === 'string') {
    message = error
  } else if (error && error.message) {
    message = error.message
  }

  // 处理 Vue 错误信息
  if (errorInfo.componentName) {
    details += `组件: ${errorInfo.componentName}\n`
  }
  if (errorInfo.propsData) {
    details += `Props: ${JSON.stringify(errorInfo.propsData, null, 2)}\n`
  }
  if (errorInfo.lifecycleHook) {
    details += `生命周期钩子: ${errorInfo.lifecycleHook}\n`
  }

  // 处理网络错误
  if (error && error.response) {
    const status = error.response.status
    const statusText = error.response.statusText
    const url = error.config?.url || '未知URL'
    message = `网络请求失败: ${status} ${statusText}`
    details += `请求URL: ${url}\n`
    details += `状态码: ${status}\n`
    if (error.response.data) {
      details += `响应数据: ${JSON.stringify(error.response.data, null, 2)}\n`
    }
  }

  // 处理 Axios 错误
  if (error && error.isAxiosError) {
    if (error.code === 'ECONNABORTED') {
      message = '请求超时，请检查网络连接'
    } else if (error.code === 'NETWORK_ERROR') {
      message = '网络错误，请检查网络连接'
    }
  }

  return { message, stack, details: details.trim() }
}

/**
 * 显示错误弹窗（已禁用弹窗，仅输出到控制台）
 */
function showErrorDialog(error, errorInfo = {}) {
  const formatted = formatError(error, errorInfo)
  
  // 禁用错误弹窗显示，只输出到控制台
  // 格式化错误信息并输出到控制台
  console.error('🔴 [全局错误捕获]', {
    message: formatted.message,
    stack: formatted.stack,
    details: formatted.details,
    errorInfo: errorInfo,
    originalError: error
  })
  
  // 不再显示弹窗，只保留控制台输出
  // 注释掉弹窗相关代码
  // if (eventBus && eventBus.emit) {
  //   eventBus.emit('global-error', formatted)
  // } else {
  //   alert(`错误: ${formatted.message}\n\n详情请查看控制台`)
  // }
}

// Vue 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  console.error('🔴 [Vue错误处理器]', err, info)
  showErrorDialog(err, {
    componentName: vm?.$options?.name || vm?.$options?.__name || '未知组件',
    lifecycleHook: info,
    propsData: vm?.$props
  })
}

// Vue 警告处理（可选，也可以捕获警告）
Vue.config.warnHandler = (msg, vm, trace) => {
  // 可以选择是否显示警告，这里只记录到控制台
  console.warn('⚠️ [Vue警告]', msg, trace)
  // 如果需要将警告也显示在弹窗，可以取消下面的注释
  // showErrorDialog(new Error(msg), { componentName: vm?.$options?.name, trace })
}

// 捕获全局 JavaScript 错误
window.onerror = (message, source, lineno, colno, error) => {
  console.error('🔴 [全局错误捕获]', message, source, lineno, colno, error)
  
  const errorInfo = {
    source: source || '未知文件',
    line: lineno,
    column: colno
  }
  
  showErrorDialog(error || new Error(message), errorInfo)
  
  // 返回 false 表示不阻止默认的错误处理（仍然会在控制台显示）
  return false
}

// 捕获未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 [未处理的Promise拒绝]', event.reason)
  
  // 阻止默认行为（在控制台显示错误）
  event.preventDefault()
  
  const error = event.reason instanceof Error 
    ? event.reason 
    : new Error(String(event.reason))
  
  showErrorDialog(error, {
    type: 'Unhandled Promise Rejection'
  })
})

// 捕获资源加载错误（图片、脚本等）
window.addEventListener('error', (event) => {
  // 只处理资源加载错误，忽略脚本执行错误（已由 window.onerror 处理）
  if (event.target && event.target !== window) {
    const elementType = event.target.tagName?.toLowerCase() || '未知元素'
    const resourceSrc = event.target.src || event.target.href || '未知资源'
    
    // 过滤掉图片加载失败的错误（这些不应该作为系统错误显示）
    // 特别是占位符图片和外部图片服务的错误
    if (elementType === 'img' && resourceSrc && (
        resourceSrc.includes('via.placeholder.com') ||
        resourceSrc.includes('placeholder') ||
        resourceSrc.startsWith('data:') // Data URI 不应该触发加载错误
    )) {
      // 图片加载失败是正常的，只在控制台记录，不显示错误弹窗
      console.warn('⚠️ [图片加载失败]', resourceSrc, '- 这是正常的，将使用默认图片')
      return
    }
    
    console.error('🔴 [资源加载错误]', elementType, resourceSrc)
    
    showErrorDialog(new Error(`资源加载失败: ${resourceSrc}`), {
      type: 'Resource Load Error',
      elementType,
      resourceSrc
    })
  }
}, true) // 使用捕获阶段

// ==================== 拦截 console.error 捕获所有错误 ====================
// 保存原始的 console.error
const originalConsoleError = console.error

// 错误去重：记录最近显示的错误，避免重复显示
const recentErrors = new Set()
const ERROR_DEDUP_DURATION = 5000 // 5秒内相同错误不重复显示

// 防抖：避免短时间内频繁触发弹窗
let errorDialogTimer = null
let isErrorDialogShowing = false

// 重写 console.error，捕获所有通过 console.error 输出的错误
console.error = function(...args) {
  // 先调用原始 console.error，确保错误仍然输出到控制台
  originalConsoleError.apply(console, args)
  
  // 如果弹窗正在显示，不重复触发
  if (isErrorDialogShowing) {
    return
  }
  
  // 检查是否有错误相关的信息
  let errorMessage = ''
  let errorStack = ''
  let errorDetails = ''
  
  // 尝试从参数中提取错误信息
  for (const arg of args) {
    if (arg instanceof Error) {
      errorMessage = arg.message || ''
      errorStack = arg.stack || ''
      
      // 过滤掉图片加载失败的错误（这些不应该作为系统错误显示）
      if (errorMessage && (
          errorMessage.includes('via.placeholder.com') || 
          (errorMessage.includes('资源加载失败') && (errorMessage.includes('placeholder') || errorMessage.includes('image') || errorMessage.includes('img')))
      )) {
        // 图片加载失败是正常的，不需要显示错误弹窗
        return
      }
      
      // 检查是否有响应信息（网络错误）
      if (arg.response) {
        errorDetails += `状态码: ${arg.response.status}\n`
        errorDetails += `响应数据: ${JSON.stringify(arg.response.data, null, 2)}\n`
      }
    } else if (typeof arg === 'string') {
      // 过滤掉图片加载失败的错误（这些不应该作为系统错误显示）
      if (arg.includes('via.placeholder.com') || 
          arg.includes('资源加载失败') && (arg.includes('placeholder') || arg.includes('image') || arg.includes('img'))) {
        // 图片加载失败是正常的，不需要显示错误弹窗
        return
      }
      
      // 如果是字符串，可能是错误消息
      if (arg.includes('错误') || arg.includes('error') || arg.includes('Error') || 
          arg.includes('失败') || arg.includes('失败') || arg.includes('500') ||
          arg.includes('ECONNREFUSED') || arg.includes('Proxy error')) {
        if (!errorMessage) {
          errorMessage = arg
        } else {
          errorDetails += arg + '\n'
        }
      }
    } else if (arg && typeof arg === 'object') {
      // 如果是对象，尝试提取错误信息
      if (arg.message) {
        errorMessage = arg.message
      }
      if (arg.stack) {
        errorStack = arg.stack
      }
      if (arg.response) {
        errorDetails += `状态码: ${arg.response.status}\n`
        errorDetails += `响应数据: ${JSON.stringify(arg.response.data, null, 2)}\n`
      }
    }
  }
  
  // 过滤掉 Wiki 相关的错误，不显示全局错误弹窗
  const isWikiError = args.some(arg => {
    const argStr = typeof arg === 'string' ? arg : (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
    return argStr.includes('[loadWikiTree]') || 
           argStr.includes('[selectDocument]') ||
           argStr.includes('Wiki') ||
           argStr.includes('wiki') ||
           argStr.includes('知识库') ||
           argStr.includes('项目wiki文档') ||
           argStr.includes('KnowledgeBaseCabinet') ||
           argStr.includes('ProjectKnowledge')
  }) || errorStack?.includes('KnowledgeBaseCabinet') || 
      errorStack?.includes('ProjectKnowledge') ||
      errorStack?.includes('wiki') ||
      errorStack?.includes('Wiki')
  
  // 如果检测到错误信息，触发弹窗（但排除 Wiki 相关错误）
  if (!isWikiError && (errorMessage || errorStack || args.some(arg => 
    typeof arg === 'string' && (
      arg.includes('错误') || arg.includes('error') || arg.includes('Error') ||
      arg.includes('失败') || arg.includes('500') || 
      arg.includes('ECONNREFUSED') || arg.includes('Proxy error')
    )
  ))) {
    // 生成错误唯一标识（用于去重）
    const errorKey = errorMessage + (errorStack ? errorStack.substring(0, 100) : '')
    
    // 检查是否最近显示过相同错误
    if (recentErrors.has(errorKey)) {
      return // 最近显示过，跳过
    }
    
    // 标记为已显示
    recentErrors.add(errorKey)
    // 5秒后从记录中移除
    setTimeout(() => {
      recentErrors.delete(errorKey)
    }, ERROR_DEDUP_DURATION)
    
    // 构建错误对象
    // 安全地将 args 转换为字符串，避免对象类型导致的 join 错误
    const safeArgsString = args.map(arg => {
      if (arg === null || arg === undefined) return String(arg)
      if (typeof arg === 'string') return arg
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg)
        } catch (e) {
          return String(arg)
        }
      }
      return String(arg)
    }).join(' ')
    
    const error = errorStack ? new Error(errorMessage || '发生错误') : new Error(errorMessage || safeArgsString)
    if (errorStack) {
      error.stack = errorStack
    }
    
    // 清除之前的定时器
    if (errorDialogTimer) {
      clearTimeout(errorDialogTimer)
    }
    
    // 防抖：延迟显示，避免频繁弹窗
    errorDialogTimer = setTimeout(() => {
      isErrorDialogShowing = true
      showErrorDialog(error, {
        type: 'Console Error',
        details: errorDetails || safeArgsString
      })
      
      // 监听弹窗关闭事件，重置标志
      if (eventBus) {
        const resetFlag = () => {
          isErrorDialogShowing = false
          if (eventBus) {
            eventBus.off('error-dialog-closed', resetFlag)
          }
        }
        eventBus.on('error-dialog-closed', resetFlag)
      } else {
        // 降级方案：3秒后重置
        setTimeout(() => {
          isErrorDialogShowing = false
        }, 3000)
      }
    }, 300)
  }
}

// 注册事件总线
Vue.use(EventBus)

// 注册 Element UI
Vue.use(ElementUI)

// 全局混入响应式支持
Vue.mixin(responsiveMixin)

// 如果是iOS设备，防止橡皮筋效果
if (device.isIOS()) {
  preventIOSBounce()
}

// 开发环境：启用事件调试
if (process.env.NODE_ENV === 'development') {
  const { eventBus } = require('./utils/eventBus')
  const originalEmit = eventBus.emit.bind(eventBus)
  eventBus.emit = function(eventType, data) {
    console.log(`📢 [EventBus] ${eventType}`, data)
    return originalEmit(eventType, data)
  }
}

// 全局注册组件
Vue.component('GlobalUserProfile', GlobalUserProfile)
Vue.component('Button', Button)
Vue.component('Card', Card)
Vue.component('Input', Input)

// 创建简单的状态管理包装器
const authState = {
  ...authStore.state
}

const authWrapper = {
  state: authState,
  dispatch(action, payload) {
    if (authStore.actions[action]) {
      // 模拟 Vuex 的 context 对象
      const context = {
        state: authState,
        commit: (mutation, data) => {
          if (authStore.mutations[mutation]) {
            authStore.mutations[mutation](authState, data)
          }
        }
      }
      return authStore.actions[action](context, payload)
    }
  },
  getters: authStore.getters
}

Vue.prototype.$auth = authWrapper

new Vue({
  router,
  render: h => h(App),
  async created() {
    console.log('🚀 应用启动')
    
    // 初始化Token管理器（恢复自动刷新定时器）
    tokenManager.initialize()
    
    // 初始化认证状态
    this.$auth.dispatch('initAuth')
    
    // 检查自动登录（如果当前未登录，但有RememberMe token）
    const isAuthenticated = !!localStorage.getItem('access_token') && !!localStorage.getItem('user_info')
    if (!isAuthenticated) {
      console.log('🔍 当前未登录，检查RememberMe自动登录...')
      try {
        const autoLoginSuccess = await this.$auth.dispatch('checkAutoLogin')
        if (autoLoginSuccess) {
          console.log('✅ 自动登录成功')
          // 自动登录成功后，触发token刷新以获取新的accessToken和refreshToken
          await tokenManager.refreshAccessToken()
        } else {
          console.log('ℹ️ 没有有效的RememberMe token，需要手动登录')
        }
      } catch (error) {
        console.error('❌ 自动登录检查失败:', error)
      }
    } else {
      console.log('✅ 用户已登录，跳过自动登录检查')
    }
  }
}).$mount('#app')
