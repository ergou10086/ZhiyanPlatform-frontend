<template>
  <div class="global-user-profile" :class="{ 'floating': floating }">
    <div class="user-profile" @click="toggleUserMenu">
      <div class="user-avatar">
        <img v-if="globalUserInfo.avatar" :src="globalUserInfo.avatar" alt="用户头像" />
        <div v-else class="avatar-placeholder">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <span class="username">{{ globalUserInfo.nickname || '游客' }}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotate': userMenuOpen }">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    
    <!-- 用户菜单下拉 -->
    <div class="user-menu" v-if="userMenuOpen">
      <div class="menu-item" @click="goToProfile">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        个人信息
      </div>
      <div v-if="!isLoggedIn" class="menu-item" @click="goToLogin">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="10,17 15,12 10,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        登录账号
      </div>
      <div v-if="isLoggedIn" class="menu-item" @click="logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        退出登录
      </div>
    </div>

    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { clearAuthData } from '@/utils/auth'

export default {
  name: 'GlobalUserProfile',
  props: {
    floating: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userMenuOpen: false,
      isLoggedIn: false,
      globalUserInfo: {
        nickname: '游客',
        avatar: ''
      },
      showToast: false,
      toastMessage: ''
    }
  },
  mounted() {
    this.loadGlobalUserInfo()
    document.addEventListener('click', this.handleClickOutside)
    // 监听localStorage变化，实现实时同步
    window.addEventListener('storage', this.handleStorageChange)
    // 监听自定义事件，实现同页面实时更新
    this.$root.$on('userInfoUpdated', this.loadGlobalUserInfo)
    
    // 🎯 监听精确的头像更新事件
    this.$eventBus.on(this.$EventTypes.USER_AVATAR_UPDATED, this.handleAvatarUpdated)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('storage', this.handleStorageChange)
    this.$root.$off('userInfoUpdated', this.loadGlobalUserInfo)
    
    // 取消事件监听
    this.$eventBus.off(this.$EventTypes.USER_AVATAR_UPDATED, this.handleAvatarUpdated)
  },
  methods: {
    loadGlobalUserInfo() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const savedUserInfo = localStorage.getItem('user_info')
      this.isLoggedIn = !!(token && savedUserInfo)
      
      if (this.isLoggedIn && savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          
          // 优先使用 avatar，其次使用 avatarUrl
          const avatarUrl = userData.avatar || userData.avatarUrl || ''
          
          this.globalUserInfo = {
            nickname: userData.nickname || userData.name || '用户',
            avatar: avatarUrl  // 确保有值
          }
          
          console.log('GlobalUserProfile加载用户信息:', {
            nickname: this.globalUserInfo.nickname,
            avatar: this.globalUserInfo.avatar,
            hasAvatar: !!this.globalUserInfo.avatar,
            avatarLength: this.globalUserInfo.avatar.length
          })
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.isLoggedIn = false
          this.globalUserInfo = {
            nickname: '游客',
            avatar: ''
          }
        }
      } else {
        this.isLoggedIn = false
        this.globalUserInfo = {
          nickname: '游客',
          avatar: ''
        }
      }
    },
    handleStorageChange(event) {
      // 监听localStorage中user_info的变化
      if (event.key === 'user_info') {
        this.loadGlobalUserInfo()
      }
    },
    handleAvatarUpdated({ userId, avatarUrl }) {
      // 只在是当前用户时更新头像
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          const currentUserId = userData.id || userData.userId
          
          if (String(currentUserId) === String(userId)) {
            // 💡 直接更新头像，无需重新请求
            this.$set(this.globalUserInfo, 'avatar', avatarUrl)
            console.log('✅ GlobalUserProfile头像已更新')
          }
        } catch (error) {
          console.error('处理头像更新事件失败:', error)
        }
      }
    },
    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    goToProfile() {
      this.userMenuOpen = false
      // 检查当前路由，避免重复导航
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile')
      }
    },
    goToLogin() {
      this.userMenuOpen = false
      this.$router.push('/login')
    },
    logout() {
      this.userMenuOpen = false
      
      // 清除所有认证信息
      clearAuthData()
      
      // 显示成功提示
      this.showSuccessToast('退出登录成功！')
      
      // 延迟跳转到登录页面，让用户看到提示
      setTimeout(() => {
        this.$router.push('/login')
      }, 1000)
    },
    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      // 1秒后自动隐藏
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 1000)
    }
  }
}
</script>

<style scoped>
.global-user-profile {
  position: relative;
  z-index: 1000;
}

.global-user-profile.floating {
  position: fixed;
  top: 8px;
  right: 20px;
  z-index: 9999;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.username {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.user-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  min-width: 160px;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  color: #333;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.menu-item svg {
  color: #666;
}

.rotate {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* 成功提示Toast样式 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 9999;
  animation: fadeInOut 1s ease-in-out;
  pointer-events: none;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}
</style>
