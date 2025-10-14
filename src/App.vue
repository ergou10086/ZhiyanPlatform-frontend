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
export default {
  name: 'App',
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}
</style>
