<template>
  <div class="profile-container">
    <!-- 侧边栏 -->
    <Sidebar :isOpen="sidebarOpen" @close="closeSidebar" />
    
     <!-- 顶部导航栏 -->
     <div class="top-header">
       <div class="header-left">
         <button class="menu-btn" @click="toggleSidebar">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>
         </button>
         <span class="page-title">个人信息</span>
       </div>
     </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="profile-content">
        <!-- 个人信息标题 -->
        <h1 class="profile-title">个人信息</h1>
        
        <!-- 头像和昵称卡片 -->
        <div class="info-card">
          <div class="avatar-section">
            <div class="avatar-container" @click="triggerAvatarUpload">
              <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="用户头像" class="avatar-image" />
              <div v-else class="avatar-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="camera-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="nickname-section">
              <div v-if="editingNickname" class="nickname-edit">
                <input 
                  v-model="tempNickname" 
                  @keyup.enter="saveNickname"
                  @keyup.escape="cancelEditNickname"
                  class="nickname-input"
                  ref="nicknameInput"
                  placeholder="请输入昵称"
                />
                <div class="nickname-actions">
                  <button @click="saveNickname" class="save-btn-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button @click="cancelEditNickname" class="cancel-btn-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div v-else class="nickname-display-container">
                <span class="nickname-display">{{ userInfo.nickname }}</span>
                <button @click="editNickname" class="edit-nickname-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 邮箱地址卡片 -->
        <div class="info-card">
          <div class="info-item">
            <h3 class="info-label">邮箱地址</h3>
            <p class="info-value">{{ userInfo.email }}</p>
          </div>
        </div>

        <!-- 职位信息卡片 -->
        <div class="info-card">
          <div class="info-item">
            <h3 class="info-label">职位信息</h3>
            <div class="job-details">
              <div class="job-item">
                <span class="job-label">职称/职位:</span>
                <span class="job-value">{{ userInfo.position }}</span>
              </div>
              <div class="job-item">
                <span class="job-label">所属机构:</span>
                <span class="job-value">{{ userInfo.organization }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 个人简介卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">个人简介</h3>
              <button v-if="!editingIntro" @click="editIntro" class="edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                编辑
              </button>
            </div>
            <div v-if="editingIntro" class="intro-edit">
              <textarea 
                v-model="tempIntro" 
                @blur="saveIntro" 
                class="intro-textarea"
                placeholder="请输入个人简介..."
                ref="introTextarea"
              ></textarea>
              <div class="intro-actions">
                <button @click="saveIntro" class="save-btn">保存</button>
                <button @click="cancelEditIntro" class="cancel-btn">取消</button>
              </div>
            </div>
            <p v-else class="info-value intro-content">{{ userInfo.introduction }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件上传输入 -->
    <input 
      ref="avatarUpload" 
      type="file" 
      accept="image/*" 
      @change="handleAvatarUpload" 
      style="display: none"
    />
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'Profile',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      userMenuOpen: false,
      userAvatar: null,
      editingNickname: false,
      editingIntro: false,
      tempNickname: '',
      tempIntro: '',
      userInfo: {
        id: 1, // 添加用户ID
        username: 'limingxuan', // 添加用户名字段
        email: 'limingxuan@example.com',
        nickname: '李明轩',
        avatar: '',
        position: '高级前端工程师',
        organization: '腾讯科技有限公司',
        introduction: '资深前端开发工程师,拥有8年以上 Web应用开发经验。专注于Vue.js 和 React 生态系统,擅长构建高性能、可扩展的用户界面。热爱技术分享,定期在技术社区发表文章。目前就职于一家知名互联网公司,担任前端技术负责人。',
        role: 'MEMBER', // 添加角色字段
        status: 'ACTIVE' // 添加状态字段
      }
    }
  },
  mounted() {
    this.loadUserAvatar()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    loadUserAvatar() {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        this.userAvatar = savedAvatar
      }
    },
    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    goToProfile() {
      this.userMenuOpen = false
      // 已经在个人信息页面，不需要跳转
    },
    logout() {
      this.userMenuOpen = false
      alert('退出登录成功！')
      this.$router.push('/login')
    },
    // 头像相关方法
    triggerAvatarUpload() {
      this.$refs.avatarUpload.click()
    },
    handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.userInfo.avatar = e.target.result
          this.userAvatar = e.target.result
          localStorage.setItem('userAvatar', e.target.result)
          // 同时保存到全局用户信息
          localStorage.setItem('globalUserInfo', JSON.stringify(this.userInfo))
          // 同时保存到用户数据中，供登录页面使用
          localStorage.setItem('userData_' + this.userInfo.email, JSON.stringify(this.userInfo))
          // 触发全局更新事件
          this.$root.$emit('userInfoUpdated')
        }
        reader.readAsDataURL(file)
      }
    },
    // 昵称编辑方法
    editNickname() {
      this.editingNickname = true
      this.tempNickname = this.userInfo.nickname
      this.$nextTick(() => {
        this.$refs.nicknameInput.focus()
        this.$refs.nicknameInput.select()
      })
    },
    saveNickname() {
      const trimmedNickname = this.tempNickname.trim()
      if (trimmedNickname && trimmedNickname !== this.userInfo.nickname) {
        // 验证昵称长度
        if (trimmedNickname.length < 2) {
          alert('昵称至少需要2个字符')
          return
        }
        if (trimmedNickname.length > 20) {
          alert('昵称不能超过20个字符')
          return
        }
        // 确认修改
        if (confirm(`确定要将昵称修改为"${trimmedNickname}"吗？`)) {
          this.userInfo.nickname = trimmedNickname
          this.editingNickname = false
          // 保存到localStorage，实现全局同步
          localStorage.setItem('globalUserInfo', JSON.stringify(this.userInfo))
          // 同时保存到用户数据中，供登录页面使用
          localStorage.setItem('userData_' + this.userInfo.email, JSON.stringify(this.userInfo))
          // 触发全局更新事件
          this.$root.$emit('userInfoUpdated')
          console.log('昵称已更新:', trimmedNickname)
        }
      } else if (trimmedNickname === this.userInfo.nickname) {
        // 没有变化，直接退出编辑
        this.editingNickname = false
      } else {
        alert('昵称不能为空')
      }
    },
    cancelEditNickname() {
      this.tempNickname = this.userInfo.nickname
      this.editingNickname = false
    },
    // 个人简介编辑方法
    editIntro() {
      this.editingIntro = true
      this.tempIntro = this.userInfo.introduction
      this.$nextTick(() => {
        this.$refs.introTextarea.focus()
      })
    },
    saveIntro() {
      this.userInfo.introduction = this.tempIntro
      this.editingIntro = false
    },
    cancelEditIntro() {
      this.tempIntro = this.userInfo.introduction
      this.editingIntro = false
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.menu-btn:hover {
  background-color: #f8f9fa;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-profile:hover {
  background-color: #f8f9fa;
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

.main-content {
  flex: 1;
  padding: 40px;
  background-color: #f8f9fa;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 32px 0;
  text-align: left;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: none;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border: none;
}

.camera-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.nickname-section {
  /* Centered by parent .avatar-section */
  display: block;
}

.nickname-display-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-left: 32px; /* 微调左内边距来达到最佳视觉平衡 */
}

.nickname-display {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  padding: 8px 16px;
  display: inline-block;
}

.edit-nickname-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0;
}

.nickname-display-container:hover .edit-nickname-btn {
  opacity: 1;
}

.edit-nickname-btn:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.nickname-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.nickname-input {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  border: 2px solid #007bff;
  border-radius: 6px;
  padding: 8px 16px;
  outline: none;
  width: 200px;
  text-align: center;
}

.nickname-actions {
  display: flex;
  gap: 8px;
}

.save-btn-small, .cancel-btn-small {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.save-btn-small {
  background-color: #28a745;
  color: white;
}

.save-btn-small:hover {
  background-color: #1e7e34;
  transform: scale(1.1);
}

.cancel-btn-small {
  background-color: #dc3545;
  color: white;
}

.cancel-btn-small:hover {
  background-color: #c82333;
  transform: scale(1.1);
}

.info-item {
  width: 100%;
}

.info-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.info-value {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.job-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.job-label {
  font-size: 14px;
  color: #6c757d;
  min-width: 80px;
}

.job-value {
  font-size: 14px;
  color: #2c3e50;
}

.intro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.intro-edit {
  width: 100%;
}

.intro-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.intro-textarea:focus {
  border-color: #007bff;
}

.intro-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.save-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-btn:hover {
  background-color: #1e7e34;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover {
  background-color: #545b62;
}

.intro-content {
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>

