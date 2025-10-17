import Vue from 'vue'
import App from './App.vue'
import router from './router'
import GlobalUserProfile from './components/GlobalUserProfile.vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'
import Input from './components/Input.vue'

Vue.config.productionTip = false

// 全局注册组件
Vue.component('GlobalUserProfile', GlobalUserProfile)
Vue.component('Button', Button)
Vue.component('Card', Card)
Vue.component('Input', Input)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
