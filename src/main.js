import Vue from 'vue'
import App from './App.vue'
import router from './router'
import GlobalUserProfile from './components/GlobalUserProfile.vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'
import Input from './components/Input.vue'
import authStore from './store/auth'
import tokenManager from './utils/tokenManager'
import EventBus from './utils/eventBus'

Vue.config.productionTip = false

// 注册事件总线
Vue.use(EventBus)

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
