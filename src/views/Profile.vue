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
        <button class="back-btn" @click="goToHome" title="返回首页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                <div class="nickname-info">
                  <span class="nickname-display">{{ userInfo.nickname }}</span>
                  <span v-if="userInfo.id" class="user-id-display">ID: {{ userInfo.id }}</span>
                </div>
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

        <!-- 机构信息卡片 -->
        <div class="info-card">
          <div class="info-item">
            <h3 class="info-label">所属机构</h3>
            <p class="info-value">{{ userInfo.organization }}</p>
          </div>
        </div>

        <!-- 个人简介卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">个人简介</h3>
              <button v-if="!editingIntro && isLoggedIn" @click="editIntro" class="edit-btn">
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

        <!-- 游客登录提示卡片 -->
        <div v-if="!isLoggedIn" class="info-card login-prompt-card">
          <div class="info-item">
            <h3 class="info-label">登录账号</h3>
            <p class="info-value">请登录您的账号以查看完整个人信息</p>
            <button @click="goToLogin" class="login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="10,17 15,12 10,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
              立即登录
            </button>
          </div>
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
    </div>

    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
      </div>
    
    <!-- 头像裁切Modal -->
    <div v-if="showAvatarCropModal" class="avatar-crop-modal-overlay">
      <div class="avatar-crop-modal-content" @click.stop>
        <div class="avatar-crop-modal-header">
          <h3>裁切头像</h3>
          <p class="avatar-crop-hint">请拖拽选择裁切区域，头像将显示为圆形</p>
    </div>
        <div class="avatar-crop-modal-body">
          <div class="avatar-crop-container">
            <canvas ref="avatarCropCanvas" class="avatar-crop-canvas"></canvas>
            <div class="avatar-crop-overlay" ref="avatarCropOverlay">
              <div class="avatar-crop-selection" ref="avatarCropSelection">
                <!-- 调整大小的控制点 -->
                <div class="avatar-resize-handle avatar-resize-handle-se"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="avatar-crop-modal-footer">
          <button class="btn-cancel" @click="closeAvatarCropModal">重新选择图片</button>
          <button class="btn-confirm" @click="applyAvatarCrop">完成裁切</button>
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
      isLoggedIn: false,
      showModal: false,
      modalMessage: '',
      showAvatarCropModal: false,
      originalAvatarData: null,
      avatarCropData: {
        x: 0,
        y: 0,
        size: 0
      },
      userInfo: {
        id: null,
        username: '',
        email: '',
        nickname: '',
        avatar: '',
        organization: '',
        introduction: '',
        role: '',
        status: ''
      }
    }
  },
  mounted() {
    this.loadUserInfo()
    this.loadUserAvatar()
    document.addEventListener('click', this.handleClickOutside)
    // 监听用户信息更新事件
    this.$root.$on('userInfoUpdated', this.loadUserInfo)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$root.$off('userInfoUpdated', this.loadUserInfo)
  },
  methods: {
    loadUserInfo() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const savedUserInfo = localStorage.getItem('user_info')
      this.isLoggedIn = !!(token && savedUserInfo)
      
      if (this.isLoggedIn && savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          this.userInfo = {
            id: userData.id || userData.userId,
            username: userData.username || userData.name || '',
            email: userData.email || '',
            nickname: userData.nickname || userData.name || '未设置昵称',
            avatar: userData.avatar || '',
            organization: userData.organization || userData.institution || '未设置机构',
            introduction: userData.introduction || '这个人很懒，什么都没有留下...',
            role: userData.role || 'MEMBER',
            status: userData.status || 'ACTIVE'
          }
          console.log('加载用户信息:', this.userInfo)
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.isLoggedIn = false
        }
      } else {
        // 游客模式
        this.isLoggedIn = false
        this.userInfo = {
          id: null,
          username: '',
          email: '',
          nickname: '游客',
          avatar: '',
          organization: '',
          introduction: '您还未登录，请登录后查看个人信息',
          role: 'GUEST',
          status: 'GUEST'
        }
      }
    },
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
    goToHome() {
      this.$router.push('/home')
    },
    goToLogin() {
      this.$router.push('/login')
    },
    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      // 1秒后自动隐藏
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 1000)
    },
    closeModal() {
      this.showModal = false
      this.modalMessage = ''
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
      
      // 清除所有认证信息
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('remember_me_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('userAvatar')
      localStorage.removeItem('globalUserInfo')
      
      // 清除所有以userData_开头的用户数据
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('userData_')) {
          localStorage.removeItem(key)
        }
      })
      
      this.showSuccessToast('退出登录成功！')
      
      // 延迟跳转到登录页面，让用户看到提示
      setTimeout(() => {
      this.$router.push('/login')
      }, 1000)
    },
    // 头像裁切相关方法
    closeAvatarCropModal() {
      // 如果用户取消裁切，清空文件输入
      this.$refs.avatarUpload.value = ''
      this.showAvatarCropModal = false
      this.originalAvatarData = null
    },
    initAvatarCropCanvas() {
      const canvas = this.$refs.avatarCropCanvas
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 设置画布尺寸，保持图片比例
        const maxSize = 400
        let { width, height } = img
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)
        
        // 初始化圆形裁切区域
        const cropSize = Math.min(width, height) * 0.6
        this.avatarCropData = {
          x: (width - cropSize) / 2,
          y: (height - cropSize) / 2,
          size: cropSize
        }
        
        this.updateAvatarCropSelection()
        this.setupAvatarCropInteraction()
      }
      
      img.src = this.originalAvatarData
    },
    updateAvatarCropSelection() {
      const selection = this.$refs.avatarCropSelection
      if (selection) {
        selection.style.left = this.avatarCropData.x + 'px'
        selection.style.top = this.avatarCropData.y + 'px'
        selection.style.width = this.avatarCropData.size + 'px'
        selection.style.height = this.avatarCropData.size + 'px'
      }
    },
    setupAvatarCropInteraction() {
      const selection = this.$refs.avatarCropSelection
      const canvas = this.$refs.avatarCropCanvas
      
      if (!selection || !canvas) return
      
      let isDragging = false
      let isResizing = false
      let startX = 0
      let startY = 0
      let startCropX = 0
      let startCropY = 0
      let startCropSize = 0
      
      const startDrag = (e) => {
        if (e.target.classList.contains('avatar-resize-handle')) {
          isResizing = true
        } else {
          isDragging = true
        }
        
        const rect = canvas.getBoundingClientRect()
        startX = e.clientX - rect.left
        startY = e.clientY - rect.top
        startCropX = this.avatarCropData.x
        startCropY = this.avatarCropData.y
        startCropSize = this.avatarCropData.size
      }
      
      const drag = (e) => {
        if (!isDragging && !isResizing) return
        
        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top
        
        const deltaX = currentX - startX
        const deltaY = currentY - startY
        
        if (isDragging) {
          // 移动圆形裁切框
          const newX = Math.max(0, Math.min(canvas.width - this.avatarCropData.size, startCropX + deltaX))
          const newY = Math.max(0, Math.min(canvas.height - this.avatarCropData.size, startCropY + deltaY))
          
          this.avatarCropData.x = newX
          this.avatarCropData.y = newY
        } else if (isResizing) {
          // 调整圆形裁切框大小
          const deltaSize = deltaX + deltaY
          const newSize = Math.max(50, Math.min(Math.min(canvas.width, canvas.height), startCropSize + deltaSize))
          
          // 保持圆形居中
          const newX = Math.max(0, Math.min(canvas.width - newSize, startCropX + (startCropSize - newSize) / 2))
          const newY = Math.max(0, Math.min(canvas.height - newSize, startCropY + (startCropSize - newSize) / 2))
          
          this.avatarCropData.x = newX
          this.avatarCropData.y = newY
          this.avatarCropData.size = newSize
        }
        
        this.updateAvatarCropSelection()
      }
      
      const endDrag = () => {
        isDragging = false
        isResizing = false
      }
      
      selection.addEventListener('mousedown', startDrag)
      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', endDrag)
      
      // 清理事件监听器
      this.$once('hook:beforeDestroy', () => {
        selection.removeEventListener('mousedown', startDrag)
        document.removeEventListener('mousemove', drag)
        document.removeEventListener('mouseup', endDrag)
      })
    },
    applyAvatarCrop() {
      if (!this.originalAvatarData) return
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置圆形头像的尺寸（与页面显示尺寸一致）
      const avatarSize = 80
      canvas.width = avatarSize
      canvas.height = avatarSize
      
      // 创建圆形裁切路径
      ctx.beginPath()
      ctx.arc(avatarSize / 2, avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI)
      ctx.clip()
      
      // 获取原始图片的实际尺寸
      const img = new Image()
      img.onload = () => {
        // 计算裁切区域在原图中的实际位置和尺寸
        const canvasWidth = this.$refs.avatarCropCanvas.width
        const canvasHeight = this.$refs.avatarCropCanvas.height
        
        const sourceX = (this.avatarCropData.x / canvasWidth) * img.width
        const sourceY = (this.avatarCropData.y / canvasHeight) * img.height
        const sourceSize = (this.avatarCropData.size / canvasWidth) * img.width
        
        // 绘制裁切后的图片
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, avatarSize, avatarSize
        )
        
        // 转换为DataURL并更新头像
        const croppedAvatar = canvas.toDataURL('image/jpeg', 0.9)
        this.userInfo.avatar = croppedAvatar
        this.userAvatar = croppedAvatar
        localStorage.setItem('userAvatar', croppedAvatar)
        
        // 更新user_info中的头像信息
        const savedUserInfo = localStorage.getItem('user_info')
        if (savedUserInfo) {
          try {
            const userData = JSON.parse(savedUserInfo)
            userData.avatar = croppedAvatar
            localStorage.setItem('user_info', JSON.stringify(userData))
            console.log('头像已更新到user_info:', userData.avatar)
          } catch (error) {
            console.error('更新user_info头像失败:', error)
          }
        }
        
        // 触发全局更新事件
        this.$root.$emit('userInfoUpdated')
        this.closeAvatarCropModal()
      }
      img.src = this.originalAvatarData
    },
    // 头像相关方法
    triggerAvatarUpload() {
      if (!this.isLoggedIn) {
        this.modalMessage = '请先登录才能修改头像'
        this.showModal = true
        return
      }
      this.$refs.avatarUpload.click()
    },
    handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          this.showErrorModal('请选择图片文件')
          return
        }
        
        // 检查文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.showErrorModal('图片文件大小不能超过5MB')
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.originalAvatarData = e.target.result
          // 立即显示圆形裁切模态
          this.showAvatarCropModal = true
          this.$nextTick(() => {
            this.initAvatarCropCanvas()
          })
        }
        reader.readAsDataURL(file)
      }
    },
    // 昵称编辑方法
    editNickname() {
      if (!this.isLoggedIn) {
        this.modalMessage = '请先登录才能修改昵称'
        this.showModal = true
        return
      }
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
          
          // 更新user_info中的昵称信息
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            try {
              const userData = JSON.parse(savedUserInfo)
              userData.nickname = trimmedNickname
              localStorage.setItem('user_info', JSON.stringify(userData))
              console.log('昵称已更新到user_info:', userData.nickname)
            } catch (error) {
              console.error('更新user_info昵称失败:', error)
            }
          }
          
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

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
  margin-right: 8px;
}

.back-btn:hover {
  background-color: #f8f9fa;
  color: #333;
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

.nickname-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.nickname-display {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  padding: 8px 16px;
  display: inline-block;
}

.user-id-display {
  font-size: 14px;
  font-weight: 400;
  color: #6c757d;
  background-color: #f8f9fa;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
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

.login-prompt-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.login-prompt-card .info-label {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.login-prompt-card .info-value {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-btn:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.login-btn svg {
  color: #667eea;
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

/* 头像裁切模态弹窗样式 */
.avatar-crop-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  pointer-events: all;
}

.avatar-crop-modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

.avatar-crop-modal-header {
  padding: 20px 24px 16px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-crop-modal-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.avatar-crop-hint {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.avatar-crop-modal-body {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.avatar-crop-container {
  position: relative;
  display: inline-block;
}

.avatar-crop-canvas {
  display: block;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.avatar-crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.avatar-crop-selection {
  position: absolute;
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  cursor: move;
  pointer-events: all;
  border-radius: 50%;
}

.avatar-crop-selection::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px dashed rgba(59, 130, 246, 0.5);
  border-radius: 50%;
}

/* 头像调整大小的控制点 */
.avatar-resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
}

.avatar-resize-handle-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.avatar-crop-modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e8e8e8;
}

.btn-confirm {
  background: #007bff;
  color: white;
}

.btn-confirm:hover {
  background: #0056b3;
}
</style>

