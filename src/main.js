import Vue from 'vue'
import App from './App.vue'
import router from './router'
import GlobalUserProfile from './components/GlobalUserProfile.vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'
import Input from './components/Input.vue'
import authStore from './store/auth'

Vue.config.productionTip = false

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
  created() {
    // 初始化认证状态
    this.$auth.dispatch('initAuth')
  }
}).$mount('#app')
