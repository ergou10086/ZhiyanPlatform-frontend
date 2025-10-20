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

// 简单的状态管理
Vue.prototype.$auth = authStore

new Vue({
  router,
  render: h => h(App),
  created() {
    // 初始化认证状态
    this.$auth.dispatch('initAuth')
  }
}).$mount('#app')
