<template>
  <div id="app">
    <router-view/>
    <!-- 全局用户信息组件，悬浮在右上角，但在登录相关页面不显示 -->
    <GlobalUserProfile 
      v-if="!isAuthPage" 
      :floating="true"
      :show-theme-toggle="isHomePage"
      :is-dark-mode="isDarkMode"
      @theme-toggle="handleThemeToggle"
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
  data() {
    return {
      isDarkMode: false
    }
  },
  computed: {
    isAuthPage() {
      // 判断当前路由是否为认证相关页面
      const authRoutes = ['/login', '/register', '/forgot-password']
      return authRoutes.includes(this.$route.path)
    },
    isHomePage() {
      // 判断是否为首页
      return this.$route.path === '/home' || this.$route.path === '/'
    }
  },
  mounted() {
    // 加载主题设置
    this.loadTheme()
    // 监听主题变化事件
    if (this.$eventBus) {
      this.$eventBus.on('theme-changed', this.handleThemeChanged)
    }
  },
  beforeDestroy() {
    if (this.$eventBus) {
      this.$eventBus.off('theme-changed', this.handleThemeChanged)
    }
  },
  methods: {
    loadTheme() {
      // 从localStorage加载主题设置
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        this.isDarkMode = true
        document.documentElement.classList.add('dark-mode')
      } else {
        this.isDarkMode = false
        document.documentElement.classList.remove('dark-mode')
      }
    },
    handleThemeChanged(isDark) {
      this.isDarkMode = isDark
    },
    handleThemeToggle(event) {
      // 将事件传递给 Home 组件处理
      // 通过事件总线通知主题切换
      if (this.$eventBus) {
        this.$eventBus.emit('toggle-theme', event)
      }
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
