import Vue from 'vue'
import App from './App.vue'
import router from './router'
import GlobalUserProfile from './components/GlobalUserProfile.vue'

Vue.config.productionTip = false

// 全局注册用户信息组件
Vue.component('GlobalUserProfile', GlobalUserProfile)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
