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
@import './assets/styles/variables.css';

#app {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* 隐藏浏览器翻译插件的悬浮按钮 */
.translate-tooltip-mtz,
.skiptranslate,
.goog-te-banner-frame,
.goog-te-menu-frame,
#google_translate_element {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* Edge 翻译面板 */
edge-translate-panel {
  display: none !important;
}

/* 隐藏各浏览器的翻译提示气泡 */
body > div[style*="position: fixed"][style*="z-index"] > div[class*="translate"],
body > div[style*="position: fixed"][style*="z-index"] > div[class*="translator"] {
  display: none !important;
}
</style>
