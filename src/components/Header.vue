<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">智研</span>
        </div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <span class="user-name">{{ userNickname }}</span>
          <span class="account-label">账户管理</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { EventBus, EVENTS } from '@/utils/eventBus'

export default {
  name: 'Header',
  data() {
    return {
      userNickname: '用户'
    }
  },
  mounted() {
    this.loadUserInfo()
    // 监听用户信息更新事件
    EventBus.$on(EVENTS.LOGIN_SUCCESS, this.loadUserInfo)
    EventBus.$on(EVENTS.USER_INFO_UPDATED, this.loadUserInfo)
    // 监听Vue全局事件
    this.$root.$on('userInfoUpdated', this.loadUserInfo)
  },
  beforeDestroy() {
    // 清理事件监听器
    EventBus.$off(EVENTS.LOGIN_SUCCESS, this.loadUserInfo)
    EventBus.$off(EVENTS.USER_INFO_UPDATED, this.loadUserInfo)
    this.$root.$off('userInfoUpdated', this.loadUserInfo)
  },
  methods: {
    loadUserInfo() {
      // 从localStorage获取用户信息
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          this.userNickname = userData.nickname || userData.name || '用户'
          console.log('Header加载用户昵称:', this.userNickname)
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.userNickname = '用户'
        }
      } else {
        this.userNickname = '用户'
      }
    }
  }
}
</script>

<style scoped>
.header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  transition: all var(--transition-normal);
}

.header-content {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--primary-color);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
}

.logo svg {
  color: var(--primary-color);
}

.logo-text {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-name {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  padding: var(--space-2) var(--space-3);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-color);
}

.account-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--space-3) var(--space-4);
  }
  
  .logo {
    font-size: var(--text-base);
  }
  
  .account-label {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
  }
}
</style>
