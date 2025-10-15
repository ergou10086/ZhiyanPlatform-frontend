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
        
        <div class="nav-item" :class="{ active: currentRoute === '/knowledge-base' }" @click="navigateTo('/knowledge-base')">
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
      if (this.$route.path === route) {
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
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #f5f5f5;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
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
  padding: 24px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #f8f9fa;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  color: #666;
}

.nav-item:hover {
  background-color: #f8f9fa;
  color: #333;
}

.nav-item.active {
  background-color: #e0f2f7;
  color: #007bff;
  border-left: 4px solid #007bff;
}

.nav-item.active .nav-icon {
  color: #007bff;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.3s ease;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    max-width: 320px;
  }
  
  .sidebar-header {
    padding: 20px 16px;
  }
  
  .nav-item {
    padding: 14px 16px;
  }
  
  .nav-text {
    font-size: 15px;
  }
}
</style>
