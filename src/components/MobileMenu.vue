<template>
  <div class="mobile-menu">
    <!-- 汉堡菜单按钮 -->
    <button 
      class="menu-button"
      @click="toggleMenu"
      :class="{ 'menu-open': isOpen }"
    >
      <span class="menu-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <!-- 遮罩层 -->
    <transition name="fade">
      <div 
        v-if="isOpen" 
        class="menu-overlay"
        @click="closeMenu"
      ></div>
    </transition>

    <!-- 侧边菜单 -->
    <transition name="slide">
      <div v-if="isOpen" class="menu-drawer">
        <!-- 菜单头部 -->
        <div class="menu-header">
          <div class="menu-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>智研平台</span>
          </div>
          <button class="close-button" @click="closeMenu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 菜单列表 -->
        <nav class="menu-nav">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="menu-item"
            @click.native="closeMenu"
          >
            <component :is="item.icon" class="menu-item-icon" />
            <span class="menu-item-text">{{ item.name }}</span>
            <svg v-if="item.badge" class="menu-item-badge" width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="4" fill="#ef4444"/>
            </svg>
          </router-link>
        </nav>

        <!-- 菜单底部 -->
        <div class="menu-footer">
          <div class="menu-version">
            <span>版本 {{ version }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'MobileMenu',
  
  data() {
    return {
      isOpen: false,
      version: '1.0.0'
    }
  },

  computed: {
    menuItems() {
      return [
        {
          name: '首页',
          path: '/home',
          icon: {
            template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
          }
        },
        {
          name: '项目广场',
          path: '/project-square',
          icon: {
            template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
          }
        },
        {
          name: '知识库',
          path: '/knowledge-base',
          icon: {
            template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
          }
        },
        {
          name: 'AI助手',
          path: '/ai-assistant',
          icon: {
            template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
          }
        },
        {
          name: '我的活动',
          path: '/my-activity',
          icon: {
            template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
          }
        },
        {
          name: '个人资料',
          path: '/profile',
          icon: {
            template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
          }
        }
      ]
    }
  },

  watch: {
    isOpen(val) {
      // 打开菜单时禁止背景滚动
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },

  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen
    },

    closeMenu() {
      this.isOpen = false
    }
  },

  beforeDestroy() {
    // 组件销毁时恢复滚动
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.mobile-menu {
  position: relative;
  z-index: 1000;
}

/* 汉堡菜单按钮 */
.menu-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.menu-icon {
  position: relative;
  width: 24px;
  height: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.menu-button.menu-open .menu-icon span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.menu-button.menu-open .menu-icon span:nth-child(2) {
  opacity: 0;
}

.menu-button.menu-open .menu-icon span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* 遮罩层 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

/* 侧边菜单 */
.menu-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  background: var(--bg-primary);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1002;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 菜单头部 */
.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-primary);
}

.menu-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--primary-color);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.close-button {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* 菜单导航 */
.menu-nav {
  flex: 1;
  padding: var(--space-4) 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.menu-item.router-link-active {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: var(--font-medium);
}

.menu-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-color);
}

.menu-item-icon {
  flex-shrink: 0;
}

.menu-item-text {
  flex: 1;
  font-size: var(--text-base);
}

.menu-item-badge {
  flex-shrink: 0;
}

/* 菜单底部 */
.menu-footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-primary);
}

.menu-version {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  text-align: center;
}

/* 动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translateX(-100%);
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .menu-drawer {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  }
}

/* 横屏优化 */
@media (max-width: 767px) and (orientation: landscape) {
  .menu-drawer {
    width: 240px;
  }
  
  .menu-nav {
    padding: var(--space-2) 0;
  }
  
  .menu-item {
    padding: var(--space-3) var(--space-4);
  }
}
</style>
