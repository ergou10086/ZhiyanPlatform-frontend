<template>
  <div class="project-create-container">
    <!-- 侧边栏弹窗 -->
    <Sidebar :isOpen="sidebarOpen" @close="closeSidebar" />
    
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="menu-btn" @click="toggleSidebar" aria-label="open sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="back-btn" @click="goBack" :title="fromPage === 'home' ? '返回首页' : '返回项目广场'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">创建项目</span>
      </div>
      <div class="header-right">
        <div class="user-profile">
          <div class="user-avatar">
            <img v-if="userAvatar" :src="userAvatar" alt="用户头像" />
            <div v-else class="avatar-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 - 左右分栏布局 -->
    <div class="main-content">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <!-- 项目基本信息 -->
        <div class="form-group">
          <h3 class="section-title">项目基本信息</h3>
          
          <div class="form-field">
            <label class="form-label">项目名称</label>
            <input
              type="text"
              v-model="formData.projectName"
              class="form-input"
              placeholder="请输入项目名称"
            />
          </div>

          <div class="form-field">
            <label class="form-label">项目简介</label>
            <textarea
              v-model="formData.projectDescription"
              class="form-textarea"
              placeholder="请简要介绍您的项目目标和预期成果"
              rows="4"
            ></textarea>
          </div>

          <div class="form-field">
            <label class="form-label">项目图片</label>
            <div class="image-upload-container">
              <div class="image-upload-area" @click="triggerImageUpload" :class="{ 'has-image': projectImage }">
                <div v-if="!projectImage" class="upload-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p class="upload-text">点击上传项目图片</p>
                  <p class="upload-hint">支持 JPG、PNG 格式</p>
                </div>
                <div v-else class="image-preview">
                  <img :src="projectImage" alt="项目图片预览" />
                  <button class="remove-image" @click.stop="removeImage" title="删除图片">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                style="display: none"
                id="imageInput"
              />
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">项目可见性</label>
            <div class="visibility-options">
              <div 
                class="visibility-option" 
                :class="{ 'active': formData.visibility === 'PUBLIC' }"
                @click="formData.visibility = 'PUBLIC'"
              >
                <div class="option-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="option-content">
                  <div class="option-title">公开</div>
                  <div class="option-desc">项目对所有用户可见</div>
                </div>
              </div>
              <div 
                class="visibility-option" 
                :class="{ 'active': formData.visibility === 'PRIVATE' }"
                @click="formData.visibility = 'PRIVATE'"
              >
                <div class="option-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="option-content">
                  <div class="option-title">私有</div>
                  <div class="option-desc">项目仅对成员可见</div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">项目周期</label>
            <div class="date-range">
              <input
                type="date"
                v-model="formData.startDate"
                class="form-input date-input"
                @change="validateStartDate"
              />
              <span class="date-separator">-</span>
              <input
                type="date"
                v-model="formData.endDate"
                :min="today"
                class="form-input date-input"
                @change="validateEndDate"
              />
            </div>
            <div v-if="dateError" class="error-message">{{ dateError }}</div>
          </div>

          
          <div class="form-field">
            <label class="form-label">自定义标签</label>
            <div class="tag-input-container">
              <input
                type="text"
                v-model="newTag"
                @keyup.enter="addTag"
                class="form-input tag-input"
                placeholder="输入标签后按回车添加（可选）"
              />
              <button type="button" @click="addTag" class="add-tag-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="tags-display" v-if="formData.tags.length > 0">
              <span v-for="(tag, index) in formData.tags" :key="index" class="tag">
                {{ tag }}
                <button @click="removeTag(index)" class="tag-remove">×</button>
              </span>
            </div>
          </div>
        </div>


      </div>

      <!-- 右侧实时预览区域 -->
      <div class="preview-section">
        <h3 class="preview-title">实时预览</h3>
        
        <div class="preview-content">
          <div class="preview-item">
            <label class="preview-label">项目名称</label>
            <div class="preview-value">{{ formData.projectName || '项目名称' }}</div>
          </div>

          <div class="preview-item">
            <label class="preview-label">项目简介</label>
            <div class="preview-value">{{ formData.projectDescription || '项目简介将在此显示' }}</div>
          </div>

          <div class="preview-item">
            <label class="preview-label">项目可见性</label>
            <div class="preview-value">
              <span v-if="formData.visibility === 'PUBLIC'" class="visibility-badge visibility-public">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                公开
              </span>
              <span v-else class="visibility-badge visibility-private">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                私有
              </span>
            </div>
          </div>

          <div class="preview-item">
            <label class="preview-label">自定义标签</label>
            <div class="preview-tags">
              <span v-if="formData.tags.length === 0" class="preview-placeholder">标签将在此显示</span>
              <span v-else v-for="(tag, index) in formData.tags" :key="index" class="preview-tag">{{ tag }}</span>
            </div>
          </div>

          <div class="preview-item">
            <label class="preview-label">项目周期</label>
            <div class="preview-value">
              <div v-if="getProjectPeriod()">{{ getProjectPeriod() }}</div>
              <div v-else-if="dateError" class="preview-error">{{ dateError }}</div>
              <div v-else class="preview-placeholder">项目周期: 未设置</div>
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="footer-actions">
      <button type="button" @click="saveDraft" class="btn btn-secondary">
        保存草稿
      </button>
      <button type="button" @click="publishProject" class="btn btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? '发布中...' : '发布项目' }}
      </button>
    </div>
    
    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
    </div>
    
    <!-- 错误提示Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>提示</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          {{ modalMessage }}
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-confirm" @click="closeModal">确定</button>
        </div>
      </div>
    </div>
    
    <!-- 图片裁切Modal -->
    <div v-if="showCropModal" class="crop-modal-overlay">
      <div class="crop-modal-content" @click.stop>
        <div class="crop-modal-header">
          <h3>裁切项目图片</h3>
          <p class="crop-hint">请拖拽选择裁切区域，确保比例与项目广场显示一致</p>
        </div>
        <div class="crop-modal-body">
          <div class="crop-container">
            <canvas ref="cropCanvas" class="crop-canvas"></canvas>
            <div class="crop-overlay" ref="cropOverlay">
              <div class="crop-selection" ref="cropSelection">
                <!-- 调整大小的控制点 -->
                <div class="resize-handle resize-handle-nw" data-handle="nw"></div>
                <div class="resize-handle resize-handle-ne" data-handle="ne"></div>
                <div class="resize-handle resize-handle-sw" data-handle="sw"></div>
                <div class="resize-handle resize-handle-se" data-handle="se"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="crop-modal-footer">
          <button class="btn-cancel" @click="closeCropModal">重新选择图片</button>
          <button class="btn-confirm" @click="applyCrop">完成裁切</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'ProjectCreate',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      isSubmitting: false,
      userAvatar: null,
      newTag: '',
      fromPage: '', // 记录来源页面
      projectImage: null, // 项目图片
      dateError: '', // 项目周期日期错误信息
      formData: {
        projectName: '',
        projectDescription: '',
        visibility: 'PRIVATE', // 默认为私有
        startDate: '',
        endDate: '',
        tags: [],
      },
      showToast: false,
      toastMessage: '',
      showModal: false,
      modalMessage: '',
      showCropModal: false,
      originalImage: null,
      originalImageData: null,
      cropData: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    }
  },
  computed: {
    // 获取今天的日期，格式为 YYYY-MM-DD
    today() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    }
  },
  mounted() {
    this.loadUserAvatar()
    this.detectFromPage()
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    detectFromPage() {
      // 检测来源页面
      const referrer = document.referrer
      const currentPath = this.$route.path
      
      // 如果是从项目广场进入的
      if (referrer.includes('/project-square') || this.$route.query.from === 'project-square') {
        this.fromPage = 'project-square'
      } 
      // 如果是从首页进入的
      else if (referrer.includes('/home') || this.$route.query.from === 'home') {
        this.fromPage = 'home'
      }
      // 默认从项目广场进入
      else {
        this.fromPage = 'project-square'
      }
    },
    goBack() {
      if (this.fromPage === 'home') {
        this.$router.push('/home')
      } else {
        this.$router.push('/project-square')
      }
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
    showErrorModal(message) {
      this.modalMessage = message
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.modalMessage = ''
    },
    triggerImageUpload() {
      // 尝试多种方式触发文件选择
      const input = document.getElementById('imageInput')
      if (input) {
        input.click()
      } else if (this.$refs.imageInput) {
        this.$refs.imageInput.click()
      } else {
        console.error('无法找到文件输入元素')
      }
    },
    handleImageUpload(event) {
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
        
        // 创建预览URL并立即进入裁切模式
        const reader = new FileReader()
        reader.onload = (e) => {
          this.originalImageData = e.target.result
          // 立即显示裁切模态，用户必须完成裁切
          this.showCropModal = true
          this.$nextTick(() => {
            this.initCropCanvas()
          })
        }
        reader.readAsDataURL(file)
      }
    },
    removeImage() {
      this.projectImage = null
      this.$refs.imageInput.value = ''
    },
    closeCropModal() {
      // 如果用户取消裁切，清空文件输入
      this.$refs.imageInput.value = ''
      this.showCropModal = false
      this.originalImage = null
      this.originalImageData = null
    },
    initCropCanvas() {
      const canvas = this.$refs.cropCanvas
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 设置画布尺寸，保持图片比例
        const maxWidth = 600
        const maxHeight = 400
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)
        
        // 保存原始图片数据
        this.originalImage = img
        
        // 初始化裁切区域（项目广场比例：约16:9）
        const cropRatio = 16 / 9
        const cropWidth = Math.min(width * 0.8, height * cropRatio * 0.8)
        const cropHeight = cropWidth / cropRatio
        
        this.cropData = {
          x: (width - cropWidth) / 2,
          y: (height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight
        }
        
        this.updateCropSelection()
        this.setupCropInteraction()
      }
      
      img.src = this.originalImageData
    },
    updateCropSelection() {
      const selection = this.$refs.cropSelection
      if (selection) {
        selection.style.left = this.cropData.x + 'px'
        selection.style.top = this.cropData.y + 'px'
        selection.style.width = this.cropData.width + 'px'
        selection.style.height = this.cropData.height + 'px'
      }
    },
    setupCropInteraction() {
      const selection = this.$refs.cropSelection
      const overlay = this.$refs.cropOverlay
      const canvas = this.$refs.cropCanvas
      
      if (!selection || !overlay || !canvas) return
      
      let isDragging = false
      let isResizing = false
      let resizeHandle = null
      let startX = 0
      let startY = 0
      let startCropX = 0
      let startCropY = 0
      let startCropWidth = 0
      let startCropHeight = 0
      
      const cropRatio = 16 / 9
      
      const startDrag = (e) => {
        if (e.target.classList.contains('resize-handle')) {
          isResizing = true
          resizeHandle = e.target.dataset.handle
        } else {
          isDragging = true
        }
        
        const rect = canvas.getBoundingClientRect()
        startX = e.clientX - rect.left
        startY = e.clientY - rect.top
        startCropX = this.cropData.x
        startCropY = this.cropData.y
        startCropWidth = this.cropData.width
        startCropHeight = this.cropData.height
      }
      
      const drag = (e) => {
        if (!isDragging && !isResizing) return
        
        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top
        
        const deltaX = currentX - startX
        const deltaY = currentY - startY
        
        if (isDragging) {
          // 移动裁切框
          const newX = Math.max(0, Math.min(canvas.width - this.cropData.width, startCropX + deltaX))
          const newY = Math.max(0, Math.min(canvas.height - this.cropData.height, startCropY + deltaY))
          
          this.cropData.x = newX
          this.cropData.y = newY
        } else if (isResizing) {
          // 调整裁切框大小
          let newWidth = startCropWidth
          let newHeight = startCropHeight
          let newX = startCropX
          let newY = startCropY
          
          if (resizeHandle === 'se') {
            // 右下角调整
            newWidth = Math.max(50, Math.min(canvas.width - startCropX, startCropWidth + deltaX))
            newHeight = newWidth / cropRatio
            if (startCropY + newHeight > canvas.height) {
              newHeight = canvas.height - startCropY
              newWidth = newHeight * cropRatio
            }
          } else if (resizeHandle === 'sw') {
            // 左下角调整
            newWidth = Math.max(50, Math.min(startCropX + startCropWidth, startCropWidth - deltaX))
            newHeight = newWidth / cropRatio
            newX = startCropX + startCropWidth - newWidth
            if (newX < 0) {
              newX = 0
              newWidth = startCropX + startCropWidth
              newHeight = newWidth / cropRatio
            }
          } else if (resizeHandle === 'ne') {
            // 右上角调整
            newWidth = Math.max(50, Math.min(canvas.width - startCropX, startCropWidth + deltaX))
            newHeight = newWidth / cropRatio
            newY = startCropY + startCropHeight - newHeight
            if (newY < 0) {
              newY = 0
              newHeight = startCropY + startCropHeight
              newWidth = newHeight * cropRatio
            }
          } else if (resizeHandle === 'nw') {
            // 左上角调整
            newWidth = Math.max(50, Math.min(startCropX + startCropWidth, startCropWidth - deltaX))
            newHeight = newWidth / cropRatio
            newX = startCropX + startCropWidth - newWidth
            newY = startCropY + startCropHeight - newHeight
            if (newX < 0) {
              newX = 0
              newWidth = startCropX + startCropWidth
              newHeight = newWidth / cropRatio
              newY = startCropY + startCropHeight - newHeight
            }
            if (newY < 0) {
              newY = 0
              newHeight = startCropY + startCropHeight
              newWidth = newHeight * cropRatio
              newX = startCropX + startCropWidth - newWidth
            }
          }
          
          this.cropData.x = newX
          this.cropData.y = newY
          this.cropData.width = newWidth
          this.cropData.height = newHeight
        }
        
        this.updateCropSelection()
      }
      
      const endDrag = () => {
        isDragging = false
        isResizing = false
        resizeHandle = null
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
    applyCrop() {
      if (!this.originalImage) return
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置裁切后的画布尺寸（项目广场比例）
      const targetRatio = 16 / 9
      const targetWidth = 400
      const targetHeight = targetWidth / targetRatio
      
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      // 计算裁切区域在原图中的位置和尺寸
      const sourceX = (this.cropData.x / this.$refs.cropCanvas.width) * this.originalImage.width
      const sourceY = (this.cropData.y / this.$refs.cropCanvas.height) * this.originalImage.height
      const sourceWidth = (this.cropData.width / this.$refs.cropCanvas.width) * this.originalImage.width
      const sourceHeight = (this.cropData.height / this.$refs.cropCanvas.height) * this.originalImage.height
      
      // 绘制裁切后的图片
      ctx.drawImage(
        this.originalImage,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetWidth, targetHeight
      )
      
      // 转换为DataURL并更新项目图片
      this.projectImage = canvas.toDataURL('image/jpeg', 0.9)
      this.closeCropModal()
    },
    loadUserAvatar() {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) this.userAvatar = savedAvatar
    },
    getCurrentUserId() {
      // 从localStorage获取当前用户ID
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userInfo = JSON.parse(savedUserInfo)
          return userInfo.id || null
        } catch (error) {
          console.error('解析用户信息失败:', error)
          return null
        }
      }
      return null
    },
    getCurrentUserName() {
      // 从localStorage获取当前用户姓名
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userInfo = JSON.parse(savedUserInfo)
          return userInfo.name || userInfo.nickname || '用户'
        } catch (error) {
          console.error('解析用户信息失败:', error)
          return '用户'
        }
      }
      return '用户'
    },
    getStatusDisplay(status) {
      // 将数据库的英文状态转换为中文显示
      const statusMap = {
        'PLANNING': '规划中',
        'ONGOING': '进行中',
        'COMPLETED': '已完成',
        'ARCHIVED': '已归档',
        // 兼容旧数据
        'IN_PROGRESS': '进行中',
        'PAUSED': '已暂停',
        'CANCELLED': '已取消'
      }
      return statusMap[status] || status || '进行中'
    },
    getPriorityValue(priority) {
      // 将中文优先级转换为数据库的英文值
      const valueMap = {
        '高': 'HIGH',
        '中': 'MEDIUM',
        '低': 'LOW'
      }
      return valueMap[priority] || 'MEDIUM'
    },
    getPriorityDisplay(priority) {
      // 将数据库的英文优先级转换为中文显示
      const displayMap = {
        'HIGH': '高',
        'MEDIUM': '中',
        'LOW': '低'
      }
      return displayMap[priority] || '中'
    },
    addTag() {
      if (this.newTag.trim() && !this.formData.tags.includes(this.newTag.trim())) {
        this.formData.tags.push(this.newTag.trim())
        this.newTag = ''
      }
    },
    removeTag(index) {
      this.formData.tags.splice(index, 1)
    },
    addPosition() {
      this.formData.positions.push({
        id: Date.now(),
        name: '',
        description: '',
        requirements: '', // 修改为与数据库字段一致
        count: 1,
        skills: '', // 保留前端字段
        status: 'OPEN', // 添加状态字段
        created_at: new Date().toISOString() // 添加创建时间
      })
    },
    removePosition(index) {
      this.formData.positions.splice(index, 1)
    },
    getProjectPeriod() {
      if (this.formData.startDate && this.formData.endDate) {
        return `${this.formData.startDate} - ${this.formData.endDate}`
      }
      return null
    },
    // 验证项目开始日期
    validateStartDate() {
      this.dateError = ''
      if (this.formData.startDate && this.formData.endDate) {
        if (new Date(this.formData.startDate) > new Date(this.formData.endDate)) {
          this.dateError = '项目开始日期不能晚于结束日期'
          return false
        }
      }
      // 开始日期可以随便选择，不进行限制
      return true
    },
    // 验证项目结束日期
    validateEndDate() {
      this.dateError = ''
      if (this.formData.startDate && this.formData.endDate) {
        if (new Date(this.formData.startDate) > new Date(this.formData.endDate)) {
          this.dateError = '项目结束日期不能早于开始日期'
          return false
        }
      }
      if (this.formData.endDate && new Date(this.formData.endDate) < new Date(this.today)) {
        this.dateError = '项目结束日期不能早于今天'
        return false
      }
      return true
    },
    // 验证任务截止日期
    async saveDraft() {
      try {
        // 模拟保存草稿
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('草稿保存成功！')
      } catch (error) {
        console.error('保存草稿失败:', error)
        alert('保存草稿失败，请重试')
      }
    },
    async createProjectAPI(projectData) {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          throw new Error('用户未登录，请先登录')
        }
        
        console.log('调用创建项目API，token:', token ? '已获取' : '未获取')
        console.log('Token内容:', token.substring(0, 50) + '...')
        
        // 检查Token格式
        if (!token.startsWith('eyJ')) {
          throw new Error('Token格式不正确，请重新登录')
        }
        
        // 检查Token是否过期（简单检查）
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const now = Math.floor(Date.now() / 1000)
          if (payload.exp && payload.exp < now) {
            throw new Error('Token已过期，请重新登录')
          }
          console.log('Token用户信息:', payload)
        } catch (e) {
          console.warn('Token解析失败:', e.message)
        }
        
        // 先测试Token是否有效 - 使用一个简单的认证检查接口
        console.log('测试Token有效性...')
        
        // 使用项目API模块进行调用
        const { projectAPI } = await import('@/api/project')
        
        console.log('使用项目API模块创建项目...')
        const response = await projectAPI.createProject(projectData)
        
        console.log('projectAPI.createProject返回结果:', response)
        console.log('返回结果类型:', typeof response)
        console.log('返回结果是否为null:', response === null)
        console.log('返回结果是否为undefined:', response === undefined)
        
        if (response) {
          console.log('返回结果code:', response.code)
          console.log('返回结果msg:', response.msg)
          console.log('返回结果data:', response.data)
        }
        
        // 检查API返回结果
        if (!response) {
          throw new Error('API返回空结果')
        }
        
        if (response.code !== 200) {
          throw new Error(response.msg || '项目创建失败')
        }
        
        return response
      } catch (error) {
        console.error('创建项目API调用失败:', error)
        throw error
      }
    },
    async publishProject() {
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      
      try {
        // 验证表单数据
        if (!this.formData.projectName || this.formData.projectName.trim() === '') {
          alert('请输入项目名称')
          this.isSubmitting = false
          return
        }
        
        if (!this.formData.startDate) {
          alert('请选择项目开始日期')
          this.isSubmitting = false
          return
        }
        
        if (!this.formData.endDate) {
          alert('请选择项目结束日期')
          this.isSubmitting = false
          return
        }
        
        // 验证日期逻辑
        if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
          alert('项目结束日期必须晚于开始日期')
          this.isSubmitting = false
          return
        }
        
        // 验证项目结束日期不能早于今天
        if (new Date(this.formData.endDate) < new Date(this.today)) {
          alert('项目结束日期不能早于今天')
          this.isSubmitting = false
          return
        }
        
        
        
        console.log('表单数据:', this.formData)
        
        // 调用后端API创建项目
        const createProjectData = {
          name: this.formData.projectName,
          description: this.formData.projectDescription,
          visibility: this.formData.visibility, // 使用用户选择的可见性
          imageUrl: this.projectImage || 'https://via.placeholder.com/400x225?text=Project+Image', // 添加必需的imageUrl字段
          startDate: this.formData.startDate,
          endDate: this.formData.endDate
        }
        
        console.log('发送到后端的项目数据:', createProjectData)
        
        const response = await this.createProjectAPI(createProjectData)
        
        console.log('createProjectAPI返回的完整响应:', response)
        console.log('响应类型:', typeof response)
        console.log('响应code:', response?.code)
        console.log('响应msg:', response?.msg)
        console.log('响应data:', response?.data)
        
        if (!response) {
          throw new Error('API返回空响应')
        }
        
        if (response.code !== 200) {
          throw new Error(response.msg || '项目创建失败')
        }
        
        if (!response.data) {
          throw new Error('API返回数据为空')
        }
        
        console.log('后端返回的项目数据:', response.data)
        console.log('后端返回的项目ID:', response.data.id, '类型:', typeof response.data.id)
        
        
        // 使用后端返回的项目数据，并添加前端特有的字段
        const newProject = {
          ...response.data, // 使用后端返回的项目数据（包括id）
          id: response.data.id, // 确保项目ID被正确保存
          // 添加前端显示需要的字段
          title: response.data.name, // 保留title字段用于前端显示
          status: this.getStatusDisplay(response.data.status), // 转换为中文状态显示
          teamSize: 1,
          dataAssets: this.formData.projectDescription || '暂无描述',
          direction: this.formData.projectDescription || '暂无描述',
          aiCore: '待定',
          category: '其他', // 默认分类
          // 添加前端特有的字段
          tags: this.formData.tags,
          image: this.projectImage, // 添加项目图片
          // 使用后端返回的任务数据（如果有的话）
          tasks: [],
          // 添加默认团队成员信息
          teamMembers: [
            { 
              id: 1, 
              user_id: 1, // 添加数据库字段名
              name: this.getCurrentUserName(), 
              project_role: 'LEADER', // 修改为与数据库枚举一致
              role: '项目负责人', // 保留前端显示字段
              avatar: null,
              joined_at: new Date().toISOString() // 添加加入时间
            }
          ],
          inviteSlots: [],
        }
        
        console.log('新项目数据:', newProject)
        console.log('项目周期数据:', this.formData.startDate, this.formData.endDate)
        
        // 从localStorage获取现有项目
        let existingProjects = []
        try {
          const projectsData = localStorage.getItem('projects')
          if (projectsData) {
            existingProjects = JSON.parse(projectsData)
          }
        } catch (parseError) {
          console.error('解析现有项目数据失败:', parseError)
          existingProjects = []
        }
        
        // 添加新项目到列表开头
        existingProjects.unshift(newProject)
        
        // 保存到localStorage
        try {
          localStorage.setItem('projects', JSON.stringify(existingProjects))
          console.log('项目数据已保存到localStorage')
        } catch (storageError) {
          console.error('保存到localStorage失败:', storageError)
          throw new Error('数据保存失败，请检查浏览器存储空间')
        }
        
        // 显示成功消息
        this.showSuccessToast('项目发布成功！')
        
        // 延迟跳转到项目广场，让用户看到Toast提示
        setTimeout(() => {
          this.$router.push('/project-square')
        }, 1000)
      } catch (error) {
        console.error('发布项目失败:', error)
        console.error('错误对象:', error)
        console.error('错误详情:', error.message)
        console.error('错误代码:', error.code)
        console.error('错误数据:', error.data)
        console.error('表单数据:', this.formData)
        console.error('项目图片:', this.projectImage)
        
        // 构建详细的错误信息
        let errorMsg = '发布项目失败，请重试。'
        if (error.message) {
          errorMsg += `\n错误信息: ${error.message}`
        }
        if (error.code) {
          errorMsg += `\n错误代码: ${error.code}`
        }
        
        this.showErrorModal(errorMsg)
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.project-create-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: block;
  position: relative;
}

.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e9ecef;
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
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
  gap: 24px;
}


.image-upload-container {
  margin-top: 8px;
}

.image-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 135px; /* 与预览区域高度一致 */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  pointer-events: auto;
  user-select: none;
  max-width: 300px; /* 限制最大宽度 */
  margin: 0 auto; /* 居中显示 */
}

.image-upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.image-upload-area.has-image {
  border-style: solid;
  border-color: #10b981;
  background: #f0fdf4;
  padding: 0;
  min-height: 135px; /* 保持与上传区域一致的高度 */
  max-width: 300px; /* 保持与上传区域一致的宽度 */
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-placeholder svg {
  color: #9ca3af;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 135px; /* 调整高度，与项目广场比例一致 */
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px; /* 限制最大宽度，保持比例 */
  margin: 0 auto; /* 居中显示 */
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.remove-image:hover {
  background: rgba(0, 0, 0, 0.9);
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

.main-content {
  flex: 1;
  margin: 64px auto 0; /* 为固定页眉留出顶部空间，水平居中 */
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  width: 100%;
}

.form-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preview-section {
  width: 300px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 88px; /* 页眉高度64px + 顶部间距24px */
}

.form-group {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}


.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #5b6bff;
  box-shadow: 0 0 0 3px rgba(91, 107, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  flex: 1;
}

.date-separator {
  color: #6c757d;
  font-weight: 500;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.tag-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-input {
  flex: 1;
}

.add-tag-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #5b6bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-tag-btn:hover {
  background: #4c5ce6;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #e8f3ff;
  color: #2c6df2;
  border-radius: 16px;
  font-size: 12px;
  border: 1px solid #cfe2ff;
}

.tag-remove {
  background: none;
  border: none;
  color: #2c6df2;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 可见性选择器样式 */
.visibility-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.visibility-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.visibility-option:hover {
  border-color: #5b6bff;
  background: #f8f9ff;
}

.visibility-option.active {
  border-color: #5b6bff;
  background: #f0f2ff;
  box-shadow: 0 0 0 3px rgba(91, 107, 255, 0.1);
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8f9fa;
  color: #666;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.visibility-option.active .option-icon {
  background: #5b6bff;
  color: white;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

/* 预览区域的可见性徽章样式 */
.visibility-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.visibility-badge svg {
  width: 14px;
  height: 14px;
}

.visibility-public {
  background: #e7f5ff;
  color: #1971c2;
  border: 1px solid #a5d8ff;
}

.visibility-private {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}


.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.preview-value {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

.preview-placeholder {
  font-size: 13px;
  color: #adb5bd;
  font-style: italic;
}

.preview-error {
  font-size: 13px;
  color: #dc3545;
  font-style: italic;
}


.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  padding: 4px 12px;
  background: #e8f3ff;
  color: #2c6df2;
  border-radius: 16px;
  font-size: 12px;
  border: 1px solid #cfe2ff;
}


.preview-positions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-position {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
}

.position-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.position-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
}

.position-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.position-skills {
  color: #6c757d;
}

.position-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.position-title {
  font-weight: 500;
  color: #333;
}

.delete-position-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.delete-position-btn:hover {
  background: #c82333;
}

.add-position-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-position-btn:hover {
  background: #218838;
}

.preview-task {
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}


.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.btn-secondary {
  background: white;
  color: #5b6bff;
  border-color: #5b6bff;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.btn-primary {
  background: #5b6bff;
  color: white;
  border-color: #5b6bff;
}

.btn-primary:hover:not(:disabled) {
  background: #4c5ce6;
  border-color: #4c5ce6;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .preview-section {
    order: -1;
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  
  .visibility-options {
    grid-template-columns: 1fr;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-section,
  .preview-section {
    padding: 20px;
  }
}

/* Toast样式 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 10000;
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

/* 图片裁切模态弹窗样式 */
.crop-modal-overlay {
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
  /* 不允许点击背景关闭 */
  pointer-events: all;
}

.crop-modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

.crop-modal-header {
  padding: 20px 24px 16px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.crop-modal-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.crop-hint {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.crop-modal-body {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.crop-container {
  position: relative;
  display: inline-block;
}

.crop-canvas {
  display: block;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.crop-selection {
  position: absolute;
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  cursor: move;
  pointer-events: all;
  border-radius: 4px;
}

.crop-selection::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px dashed rgba(59, 130, 246, 0.5);
  border-radius: 4px;
}

/* 调整大小的控制点 */
.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
}

.resize-handle-nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.resize-handle-ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.resize-handle-sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.resize-handle-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.crop-modal-footer {
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

/* Modal样式 */
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
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #666;
}

.modal-body {
  padding: 0 24px 20px;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn-confirm {
  background: #007bff;
  color: white;
}

.modal-btn-confirm:hover {
  background: #0056b3;
}
</style>
