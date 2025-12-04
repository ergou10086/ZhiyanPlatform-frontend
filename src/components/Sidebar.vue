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
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="6" y="8" width="12" height="10" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="13" r="1" fill="currentColor"/>
              <circle cx="15" cy="13" r="1" fill="currentColor"/>
              <path d="M9 18H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-text">AI 实验分析助手</span>
        </div>

        <div class="nav-item" :class="{ active: currentRoute === '/my-activity' }" @click="navigateTo('/my-activity')">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 7H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="nav-text">我的活动</span>
        </div>
      </nav>
    </div>

    <!-- 自定义弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>需要登录</h3>
          <button @click="closeModal" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="modal-btn modal-btn-cancel">取消</button>
          <button @click="goToLogin" class="modal-btn modal-btn-confirm">去登录</button>
        </div>
      </div>
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
  data() {
    return {
      showModal: false,
      modalMessage: ''
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
      const samePath = this.$route.path === route || (route === '/knowledge-base' && this.$route.path.startsWith('/knowledge-base'))
      const isProfileResetNeeded = route === '/profile' && this.$route.query && this.$route.query.userId

      // 对于大多数页面，如果已经在目标路径，只需要关闭侧边栏即可。
      // 但当从他人档案页返回到自己的档案页时，需要清理 query 中的 userId。
      if (samePath && !isProfileResetNeeded) {
        this.closeSidebar()
        return
      }
      
      // 检查需要认证的页面
      const authRequiredPages = ['/knowledge-base', '/ai-assistant', '/project-create', '/my-activity']
      if (authRequiredPages.includes(route)) {
        const token = localStorage.getItem('access_token')
        const userInfo = localStorage.getItem('user_info')
        const isAuthenticated = !!(token && userInfo)
        
        if (!isAuthenticated) {
          this.showLoginModal(this.getLoginMessage(route))
          this.closeSidebar()
          return
        }
      }
      
      this.$router.push(route)
      this.closeSidebar()
    },
    showLoginModal(message) {
      this.modalMessage = message
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.modalMessage = ''
    },
    goToLogin() {
      this.$router.push('/login')
    },
    getLoginMessage(route) {
      const messages = {
        '/knowledge-base': '请先登录才能访问知识库',
        '/ai-assistant': '请先登录才能访问AI助手',
        '/project-create': '请先登录才能创建项目'
      }
      return messages[route] || '请先登录才能访问此功能'
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

/* 自定义弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0;
  font-size: 16px;
  color: #374151;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn-cancel:hover {
  background: #e5e7eb;
}

.modal-btn-confirm {
  background: #3b82f6;
  color: white;
}

.modal-btn-confirm:hover {
  background: #2563eb;
}

/* ========== 黑暗模式样式 ========== */
.dark-mode .sidebar {
  background: #1e293b;
  border-right-color: #475569;
}

.dark-mode .sidebar-header {
  background: #1e293b;
  border-bottom-color: #475569;
}

.dark-mode .sidebar-title {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .close-btn {
  color: #94a3b8;
}

.dark-mode .close-btn:hover {
  background-color: #334155;
  color: #f1f5f9;
}

.dark-mode .nav-item {
  color: #cbd5e1;
}

.dark-mode .nav-item:hover {
  background-color: #334155;
  color: #f1f5f9;
}

.dark-mode .nav-item.active {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: #60a5fa;
}

.dark-mode .nav-item.active::before {
  background: #60a5fa;
}

.dark-mode .nav-item.active .nav-icon {
  color: #60a5fa;
}

.dark-mode .nav-icon {
  color: #94a3b8;
}

.dark-mode .nav-item:hover .nav-icon {
  color: #f1f5f9;
}

.dark-mode .modal-content {
  background: #1e293b;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.dark-mode .modal-close {
  color: #94a3b8;
}

.dark-mode .modal-close:hover {
  background: #334155;
  color: #f1f5f9;
}

.dark-mode .modal-body p {
  color: #cbd5e1;
}

.dark-mode .modal-btn-cancel {
  background: #334155;
  color: #cbd5e1;
}

.dark-mode .modal-btn-cancel:hover {
  background: #475569;
  color: #f1f5f9;
}
</style>
