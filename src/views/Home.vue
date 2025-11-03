<template>
  <div class="home-container" :class="{ 'dark-mode': isDarkMode }">
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
         <span class="page-title">首页</span>
       </div>
       <div class="header-right">
         <!-- 主题切换按钮 -->
         <button class="theme-toggle-btn" @click="toggleTheme" :title="isDarkMode ? '切换到白天模式' : '切换到黑夜模式'">
           <svg v-if="!isDarkMode" class="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
             <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           </svg>
           <svg v-else class="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>
         </button>
       </div>
     </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 快捷操作 - 独立顶部一行 -->
      <div class="quick-actions">
        <div class="section-card">
          <h2 class="section-title">快捷操作</h2>
          <div class="action-cards">
          <div class="action-card" @click="handleNewProject">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="card-label">新建项目</span>
          </div>
          <div class="action-card" @click="handleProjectSquare">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="8.5" cy="7.5" r="2.5" stroke="currentColor" stroke-width="2"/>
                <path d="M20 8V6C20 4.93913 19.5786 3.92172 18.8284 3.17157C18.0783 2.42143 17.0609 2 16 2H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="card-label">项目广场</span>
          </div>
          <div class="action-card" @click="handleKnowledgeBase">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9H15V15H9V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="card-label">知识库</span>
          </div>
          <div class="action-card" @click="handleAIAssistant">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="card-label">AI实验分析助手</span>
          </div>
          </div>
        </div>
      </div>

      <!-- 工作项、我参与的项目、日历 - 三列布局在同一行 -->
      <div class="three-column-row">
        <!-- 工作项 -->
        <div class="work-items">
          <div class="section-card">
            <div class="section-header">
              <h2 class="section-title">工作项</h2>
            </div>
            <div class="work-item-list">
            <div class="work-item high-priority">
              <div class="priority-bar"></div>
              <div class="item-content">
                <h3 class="item-title">智能推荐系统优化</h3>
                <p class="item-description">重构推荐算法模块,提升准确率</p>
                <div class="item-meta">
                  <span class="priority">高优先级</span>
                  <span class="deadline">截止:2023-06-15</span>
                </div>
              </div>
            </div>
            <div class="work-item medium-priority">
              <div class="priority-bar"></div>
              <div class="item-content">
                <h3 class="item-title">用户界面改版</h3>
                <p class="item-description">重新设计用户交互流程</p>
                <div class="item-meta">
                  <span class="priority">中优先级</span>
                  <span class="deadline">截止:2023-06-20</span>
                </div>
              </div>
            </div>
            <div class="work-item low-priority">
              <div class="priority-bar"></div>
              <div class="item-content">
                <h3 class="item-title">数据库性能优化</h3>
                <p class="item-description">优化查询索引,提升响应速度</p>
                <div class="item-meta">
                  <span class="priority">低优先级</span>
                  <span class="deadline">截止:2023-06-30</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- 我参与的项目 -->
        <div class="my-projects">
          <div class="section-card">
            <h2 class="section-title">我参与的项目</h2>
            <div v-if="isLoadingProjects" class="loading-projects">
              <p>正在加载项目...</p>
            </div>
            <div v-else class="project-list">
              <div 
                v-for="project in myProjects" 
                :key="project.id" 
                class="project-card"
                @click="goToProjectDetail(project.id)"
              >
                <div class="project-icon blue-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="project-content">
                  <h3 class="project-title">{{ project.title }}</h3>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-meta">
                    <span :class="['status-badge', `status-${project.status}`]">{{ getStatusText(project.status) }}</span>
                    <span class="progress-text">{{ project.progress }}% 完成</span>
                  </div>
                </div>
              </div>
              
              <!-- 如果没有项目，显示提示 -->
              <div v-if="myProjects.length === 0" class="no-projects">
                <p>暂无参与的项目</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧边栏（日历和任务提醒） -->
        <div class="right-sidebar-column">
          <RightSidebar :isDarkMode="isDarkMode" />
        </div>
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
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import { authAPI } from '@/api/auth'
import { projectAPI } from '@/api/project'
import '@/assets/styles/Home.css'

export default {
  name: 'Home',
  components: {
    Sidebar,
    RightSidebar
  },
  data() {
    return {
      sidebarOpen: false,
      userMenuOpen: false,
      userAvatar: null, // 用户头像URL，可以从localStorage或API获取
      globalUserInfo: {
        nickname: '张伟',
        avatar: ''
      },
      showModal: false,
      modalMessage: '',
      myProjects: [], // 我参与的项目列表
      isLoadingProjects: false, // 是否正在加载项目
      isDarkMode: false, // 黑夜模式状态
      isTransitioning: false // 切换动画状态
    }
  },
  mounted() {
    // 页面加载时尝试获取用户头像
    this.loadUserAvatar()
    
    // 加载全局用户信息
    this.loadGlobalUserInfo()
    
    // 加载我参与的项目
    this.loadMyProjects()
    
    // 加载主题设置
    this.loadTheme()
    
    // 添加点击外部关闭菜单的事件监听
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    loadUserAvatar() {
      // 从localStorage或API获取用户头像
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        this.userAvatar = savedAvatar
      }
    },
    loadGlobalUserInfo() {
      // 从localStorage加载全局用户信息
      const savedUserInfo = localStorage.getItem('globalUserInfo')
      if (savedUserInfo) {
        this.globalUserInfo = JSON.parse(savedUserInfo)
      }
    },
    setUserAvatar(avatarUrl) {
      // 设置用户头像的方法
      this.userAvatar = avatarUrl
      localStorage.setItem('userAvatar', avatarUrl)
    },
    handleClickOutside(event) {
      // 如果点击的不是用户菜单相关元素，则关闭菜单
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
    },
    toggleUserMenu() {
      console.log('点击用户菜单，当前状态:', this.userMenuOpen)
      this.userMenuOpen = !this.userMenuOpen
      console.log('切换后状态:', this.userMenuOpen)
    },
    goToProfile() {
      console.log('跳转到个人信息页面')
      this.userMenuOpen = false
      this.$router.push('/profile')
    },
    async logout() {
      console.log('退出登录')
      this.userMenuOpen = false
      
      try {
        // 获取当前token
        const token = localStorage.getItem('access_token')
        if (token) {
          // 调用后端登出接口
          await authAPI.logout(token)
          console.log('后端登出成功')
        }
      } catch (error) {
        console.error('后端登出失败:', error)
        // 即使后端登出失败，也要清除前端数据
      }
      
      // 清除前端认证数据
      this.clearAuthData()
      console.log('前端数据已清除')
      
      // 显示成功消息
      alert('退出登录成功！')
      
      // 使用setTimeout确保数据清除完成后再跳转
      setTimeout(() => {
        console.log('准备跳转到登录页面')
        window.location.href = '/login'
      }, 100)
    },
    clearAuthData() {
      // 清除所有认证相关的本地存储
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('remember_me_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('userAvatar')
      localStorage.removeItem('globalUserInfo')
      
      // 清除组件状态
      this.userAvatar = null
      this.globalUserInfo = {
        nickname: '',
        avatar: ''
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    loadTheme() {
      // 从localStorage加载主题设置
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        this.isDarkMode = true
        document.documentElement.classList.add('dark-mode')
      } else {
        this.isDarkMode = false
        document.documentElement.classList.remove('dark-mode')
      }
    },
    toggleTheme(event) {
      // 防止重复点击
      if (this.isTransitioning) return
      
      // 获取点击位置（按钮中心）
      const rect = event.currentTarget.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      
      // 计算需要覆盖整个屏幕的半径（使用屏幕对角线）
      const maxRadius = Math.sqrt(
        Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
      ) * 1.2
      
      // 创建圆形遮罩
      const circle = document.createElement('div')
      circle.className = 'theme-transition-circle'
      circle.style.left = x + 'px'
      circle.style.top = y + 'px'
      document.body.appendChild(circle)
      
      // 开始过渡动画
      this.isTransitioning = true
      
      // 使用 requestAnimationFrame 确保动画流畅
      requestAnimationFrame(() => {
        const isToDark = !this.isDarkMode
        
        // 添加扩展动画类
        requestAnimationFrame(() => {
          circle.classList.add(isToDark ? 'expand-dark' : 'expand-light')
        })
        
        // 在动画中期切换主题（动画进行到约50%时）
        setTimeout(() => {
          this.isDarkMode = !this.isDarkMode
          localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
          
          if (this.isDarkMode) {
            document.documentElement.classList.add('dark-mode')
          } else {
            document.documentElement.classList.remove('dark-mode')
          }
        }, 425) // 动画进行到一半时切换主题（约50%）
        
        // 动画结束后清理
        setTimeout(() => {
          if (circle.parentNode) {
            circle.remove()
          }
          this.isTransitioning = false
        }, 900)
      })
    },
    handleNewProject() {
      console.log('新建项目')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (isAuthenticated) {
        this.$router.push({ path: '/project-create', query: { from: 'home' } })
      } else {
        this.showLoginModal('请先登录才能创建项目')
      }
    },
    handleProjectSquare() {
      console.log('项目广场')
      this.$router.push('/project-square')
    },
    handleKnowledgeBase() {
      console.log('知识库')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (isAuthenticated) {
        this.$router.push('/knowledge-base')
      } else {
        this.showLoginModal('请先登录才能访问知识库')
      }
    },
    handleAIAssistant() {
      console.log('AI实验分析助手')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (isAuthenticated) {
        this.$router.push('/ai-assistant')
      } else {
        this.showLoginModal('请先登录才能访问AI助手')
      }
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
    async loadMyProjects() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        console.log('用户未登录，不加载项目数据')
        // 如果用户未登录，使用示例数据
        this.myProjects = this.getDefaultProjects()
        return
      }
      
      this.isLoadingProjects = true
      
      try {
        console.log('开始加载我参与的项目...')
        
        // 调用API获取我参与的项目
        const response = await projectAPI.getMyProjects(0, 5) // 获取前5个项目
        
        console.log('我参与的项目API响应:', response)
        
        // 处理API返回的数据，兼容多种数据结构
        let projects = []
        if (Array.isArray(response)) {
          // 直接是数组
          projects = response
        } else if (response && response.data) {
          // 有data字段
          if (Array.isArray(response.data)) {
            projects = response.data
          } else if (Array.isArray(response.data.content)) {
            // Spring分页数据
            projects = response.data.content
          } else if (Array.isArray(response.data.list)) {
            // 自定义list字段
            projects = response.data.list
          } else if (Array.isArray(response.data.records)) {
            // 自定义records字段
            projects = response.data.records
          }
        }
        
        if (projects.length > 0) {
          this.myProjects = projects.map(project => ({
            id: project.id || project.projectId || project.project_id,
            title: project.title || project.name || project.projectName || '未命名项目',
            description: project.description || project.desc || '',
            status: this.mapStatus(project.status),
            progress: this.calculateProgress(project.status)
          }))
          
          console.log('成功加载项目:', this.myProjects)
        } else {
          console.log('未获取到项目数据，使用示例数据')
          this.myProjects = this.getDefaultProjects()
        }
      } catch (error) {
        console.error('加载项目失败:', error)
        // 如果加载失败，使用示例数据
        this.myProjects = this.getDefaultProjects()
      } finally {
        this.isLoadingProjects = false
      }
    },
    getDefaultProjects() {
      // 返回默认的示例项目数据
      return [
        {
          id: 1,
          title: '量子计算算法优化研究',
          description: '量子计算算法优化研究',
          status: 'in-progress',
          progress: 65
        },
        {
          id: 2,
          title: '多模态医学影像数据平台',
          description: '多模态医学影像数据平台',
          status: 'in-progress',
          progress: 45
        },
        {
          id: 3,
          title: '气候变化预测模型研究',
          description: '气候变化预测模型研究',
          status: 'completed',
          progress: 100
        }
      ]
    },
    mapStatus(status) {
      // 将后端状态映射到前端状态
      const statusMap = {
        'ACTIVE': 'in-progress',
        'COMPLETED': 'completed',
        'PAUSED': 'in-progress',
        'ARCHIVED': 'completed',
        '进行中': 'in-progress',
        '已完成': 'completed',
        '已暂停': 'in-progress'
      }
      return statusMap[status] || 'in-progress'
    },
    calculateProgress(status) {
      // 根据状态计算进度
      if (status === 'completed' || status === 'Completed' || status === '已完成') {
        return 100
      } else if (status === 'ACTIVE' || status === 'Paused' || status === '进行中') {
        return 50 // 默认进行中状态显示50%
      }
      return 0
    },
    getStatusText(status) {
      const statusMap = {
        'in-progress': '进行中',
        'completed': '已完成',
        'pending': '待开始',
        'paused': '已暂停'
      }
      return statusMap[status] || '进行中'
    },
    goToProjectDetail(projectId) {
      console.log('跳转到项目详情:', projectId)
      this.$router.push(`/project-detail/${projectId}`)
    }
  }
}
</script>

