<template>
  <div id="app">
    <router-view/>
    <!-- 全局用户信息组件，悬浮在右上角，但在登录相关页面不显示 -->
    <GlobalUserProfile 
      v-if="!isAuthPage" 
      :floating="true" 
    />
  </div>
</template>

<script>
import GlobalUserProfile from '@/components/GlobalUserProfile.vue'

export default {
  name: 'App',
  components: {
    GlobalUserProfile
  },
  computed: {
    isAuthPage() {
      // 判断当前路由是否为认证相关页面
      const authRoutes = ['/login', '/register', '/forgot-password']
      return authRoutes.includes(this.$route.path)
    }
  }
}
</script>

<style>
@import './assets/styles/variables.css';

#app {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}
</style>
