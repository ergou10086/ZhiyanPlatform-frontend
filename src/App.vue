<template>
  <div id="app">
    <router-view/>
    <!-- 全局消息通知组件，悬浮在右上角用户信息左侧 -->
    <GlobalMessageNotification v-if="!isAuthPage" />
    <!-- 全局用户信息组件，悬浮在右上角，但在登录相关页面不显示 -->
    <GlobalUserProfile 
      v-if="!isAuthPage" 
      :floating="true"
      :show-theme-toggle="!isAuthPage"
      :is-dark-mode="isDarkMode"
      @theme-toggle="handleThemeToggle"
    />
    <!-- 悬浮消息提醒组件，在页面右侧 -->
    <FloatingMessageReminder v-if="!isAuthPage" />
    <!-- 全局错误弹窗 -->
    <GlobalErrorDialog />
  </div>
</template>

<script>
import GlobalUserProfile from '@/components/GlobalUserProfile.vue'
import GlobalErrorDialog from '@/components/GlobalErrorDialog.vue'
import GlobalMessageNotification from '@/components/GlobalMessageNotification.vue'
import FloatingMessageReminder from '@/components/FloatingMessageReminder.vue'

export default {
  name: 'App',
  components: {
    GlobalUserProfile,
    GlobalErrorDialog,
    GlobalMessageNotification,
    FloatingMessageReminder
  },
  data() {
    return {
      isDarkMode: false,
      isTransitioning: false // 切换动画状态
    }
  },
  computed: {
    isAuthPage() {
      // 判断当前路由是否为认证相关页面
      const authRoutes = ['/login', '/register', '/forgot-password']
      return authRoutes.includes(this.$route.path)
    }
  },
  mounted() {
    // 加载主题设置
    this.loadTheme()
    // 监听主题变化事件（用于同步状态）
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
      // 直接处理主题切换，不需要通过事件总线
      this.toggleTheme(event)
    },
    toggleTheme(event) {
      // 防止重复点击
      if (this.isTransitioning) return
      
      // 获取点击位置（按钮中心）
      const rect = event.currentTarget.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      
      // 计算需要覆盖整个屏幕的半径（使用屏幕对角线）
      const maxRadius = Math.sqrt(
        Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
      ) * 1.2
      
      // 创建圆形遮罩
      const circle = document.createElement('div')
      circle.className = 'theme-transition-circle'
      circle.style.left = x + 'px'
      circle.style.top = y + 'px'
      document.body.appendChild(circle)
      
      // 开始过渡动画
      this.isTransitioning = true
      
      // 使用 requestAnimationFrame 确保动画流畅
      requestAnimationFrame(() => {
        const isToDark = !this.isDarkMode
        
        // 添加扩展动画类
        requestAnimationFrame(() => {
          circle.classList.add(isToDark ? 'expand-dark' : 'expand-light')
        })
        
        // 在动画中期切换主题（动画进行到约50%时）
        setTimeout(() => {
          this.isDarkMode = !this.isDarkMode
          localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
          
          if (this.isDarkMode) {
            document.documentElement.classList.add('dark-mode')
          } else {
            document.documentElement.classList.remove('dark-mode')
          }
          
          // 通知所有组件主题已改变
          if (this.$eventBus) {
            this.$eventBus.emit('theme-changed', this.isDarkMode)
          }
        }, 425) // 动画进行到一半时切换主题（约50%）
        
        // 动画结束后清理
        setTimeout(() => {
          if (circle.parentNode) {
            circle.remove()
          }
          this.isTransitioning = false
        }, 900)
      })
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

/* 主题切换动画 - 圆形扩散效果（全局样式） */
.theme-transition-circle {
  position: fixed;
  width: 0;
  height: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 999999;
  transform: translate(-50%, -50%);
  will-change: width, height, opacity, transform;
}

.theme-transition-circle.expand-dark {
  background: radial-gradient(circle, 
    rgba(15, 23, 42, 0.98) 0%, 
    rgba(15, 23, 42, 0.9) 50%,
    rgba(15, 23, 42, 0.75) 100%);
  box-shadow: 0 0 100px 80px rgba(15, 23, 42, 0.4);
  animation: expandDark 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.theme-transition-circle.expand-light {
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(241, 245, 249, 0.9) 50%,
    rgba(226, 232, 240, 0.75) 100%);
  box-shadow: 0 0 100px 80px rgba(255, 255, 255, 0.4);
  animation: expandLight 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes expandDark {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  30% {
    opacity: 1;
  }
  100% {
    width: 300vh;
    height: 300vh;
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes expandLight {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  30% {
    opacity: 1;
  }
  100% {
    width: 300vh;
    height: 300vh;
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
