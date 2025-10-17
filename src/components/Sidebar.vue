<template>
  <div class="sidebar-overlay" v-if="isOpen" @click="closeSidebar">
    <div class="sidebar" @click.stop>
      <div class="sidebar-header">
        <h2 class="sidebar-title">智研</h2>
        <button class="close-btn" @click="closeSidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-item" :class="{ active: currentRoute === '/home' }" @click="navigateTo('/home')">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-text">首页</span>
        </div>

        <div class="nav-item" :class="{ active: currentRoute === '/project-square' }" @click="navigateTo('/project-square')">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-text">项目广场</span>
        </div>
        
        <div class="nav-item" :class="{ active: currentRoute.startsWith('/knowledge-base') }" @click="navigateTo('/knowledge-base')">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 2C8.11929 2 7 3.11929 7 4.5C7 5.88071 8.11929 7 9.5 7H14.5C15.8807 7 17 5.88071 17 4.5C17 3.11929 15.8807 2 14.5 2H9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 9C8.11929 9 7 10.1193 7 11.5C7 12.8807 8.11929 14 9.5 14H14.5C15.8807 14 17 12.8807 17 11.5C17 10.1193 15.8807 9 14.5 9H9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 16C8.11929 16 7 17.1193 7 18.5C7 19.8807 8.11929 21 9.5 21H14.5C15.8807 21 17 19.8807 17 18.5C17 17.1193 15.8807 16 14.5 16H9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-text">知识库</span>
        </div>
        
        <div class="nav-item" :class="{ active: currentRoute === '/ai-assistant' }" @click="navigateTo('/ai-assistant')">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 2C8.11929 2 7 3.11929 7 4.5C7 5.88071 8.11929 7 9.5 7H14.5C15.8807 7 17 5.88071 17 4.5C17 3.11929 15.8807 2 14.5 2H9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 9C8.11929 9 7 10.1193 7 11.5C7 12.8807 8.11929 14 9.5 14H14.5C15.8807 14 17 12.8807 17 11.5C17 10.1193 15.8807 9 14.5 9H9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 16C8.11929 16 7 17.1193 7 18.5C7 19.8807 8.11929 21 9.5 21H14.5C15.8807 21 17 19.8807 17 18.5C17 17.1193 15.8807 16 14.5 16H9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-text">AI 实验分析助手</span>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentRoute() {
      return this.$route.path
    }
  },
  methods: {
    closeSidebar() {
      this.$emit('close')
    },
    navigateTo(route) {
      // 如果已经在目标路径，只关闭侧边栏
      if (this.$route.path === route || (route === '/knowledge-base' && this.$route.path.startsWith('/knowledge-base'))) {
        this.closeSidebar()
        return
      }
      
      this.$router.push(route)
      this.closeSidebar()
    }
  }
}
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-overlay);
  z-index: var(--z-modal);
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  backdrop-filter: blur(4px);
}

.sidebar {
  width: 280px;
  height: 100vh;
  background: var(--bg-primary);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  animation: slideIn var(--transition-normal) ease-out;
  border-right: 1px solid var(--border-primary);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-header {
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
}

.sidebar-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transform: scale(1.05);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  color: var(--text-secondary);
  margin: 0 var(--space-2);
  border-radius: var(--radius-lg);
}

.nav-item:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--primary-light), var(--info-light));
  color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.nav-item.active .nav-icon {
  color: var(--primary-color);
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: all var(--transition-normal);
}

.nav-text {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  flex: 1;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    max-width: 320px;
  }
  
  .sidebar-header {
    padding: var(--space-5) var(--space-4);
  }
  
  .nav-item {
    padding: var(--space-3) var(--space-4);
    margin: 0 var(--space-1);
  }
  
  .nav-text {
    font-size: var(--text-sm);
  }
}
</style>
