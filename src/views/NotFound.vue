<template>
  <div class="not-found-container">
    <div class="brand-corner">智研</div>
    
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>

    <!-- 主要内容 -->
    <div class="not-found-content">
      <!-- 404数字动画 -->
      <div class="error-code">
        <span class="digit" :class="{ animated: isAnimated }">4</span>
        <span class="digit" :class="{ animated: isAnimated }">0</span>
        <span class="digit" :class="{ animated: isAnimated }">4</span>
      </div>

      <!-- 错误图标 -->
      <div class="error-icon" :class="{ animated: isAnimated }">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="4" fill="none" opacity="0.2"/>
          <path d="M100 60 L100 100 M100 100 L100 140" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
          <circle cx="100" cy="50" r="8" fill="currentColor"/>
        </svg>
      </div>

      <!-- 错误信息 -->
      <div class="error-message" :class="{ animated: isAnimated }">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移动。
          <br />
          请检查URL是否正确，或返回首页继续浏览。
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons" :class="{ animated: isAnimated }">
        <button @click="goHome" class="btn-primary">
          <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          返回首页
        </button>
        <button @click="goBack" class="btn-secondary">
          <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回上一页
        </button>
      </div>

      <!-- 快速链接 -->
      <div class="quick-links" :class="{ animated: isAnimated }">
        <p class="quick-links-title">您可能想要访问：</p>
        <div class="links-grid">
          <a @click.prevent="navigateTo('/home')" class="quick-link">
            <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span>首页</span>
          </a>
          <a @click.prevent="navigateTo('/project-square')" class="quick-link">
            <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>项目广场</span>
          </a>
          <a @click.prevent="navigateTo('/knowledge-base')" class="quick-link">
            <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>知识库</span>
          </a>
          <a @click.prevent="navigateTo('/ai-assistant')" class="quick-link">
            <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>AI助手</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  data() {
    return {
      isAnimated: false
    }
  },
  mounted() {
    // 延迟触发动画，确保DOM已渲染
    setTimeout(() => {
      this.isAnimated = true
    }, 100)
  },
  methods: {
    goHome() {
      this.$router.push('/home')
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/home')
      }
    },
    navigateTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/NotFound.css';
</style>

