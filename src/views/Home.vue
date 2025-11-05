<template>
  <div class="home-container">
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
       <!-- header-right 已移除，切换按钮现在在 GlobalUserProfile 组件内部 -->
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
            <div v-if="isLoadingTasks" class="loading-tasks">
              <p>正在加载任务...</p>
            </div>
            <div v-else class="work-item-list">
              <div 
                v-for="task in myTasks" 
                :key="task.id" 
                :class="['work-item', `${task.priority}-priority`]"
              >
                <div class="priority-bar"></div>
                <div class="item-content">
                  <div class="item-header">
                    <h3 class="item-title">{{ task.title }}</h3>
                    <!-- 临近截止警示图标 -->
                    <div v-if="isOverdue(task.dueDate)" class="deadline-alert overdue" title="任务已逾期">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="alert-text">已逾期</span>
                    </div>
                    <div v-else-if="isNearDeadline(task.dueDate)" class="deadline-alert near" title="即将到期">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="alert-text">即将到期</span>
                    </div>
                  </div>
                  <p class="item-description">{{ task.description || '暂无描述' }}</p>
                  <div class="item-meta">
                    <span class="priority">{{ getPriorityText(task.priority) }}</span>
                    <span class="deadline">{{ formatDate(task.dueDate) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 如果没有任务，显示提示 -->
              <div v-if="myTasks.length === 0" class="no-tasks">
                <p>暂无工作项</p>
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
          <RightSidebar />
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
import { taskAPI } from '@/api/task'
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
        nickname: '',
        avatar: ''
      },
      showModal: false,
      modalMessage: '',
      myProjects: [], // 我参与的项目列表
      isLoadingProjects: false, // 是否正在加载项目
      myTasks: [], // 我的任务列表
      isLoadingTasks: false // 是否正在加载任务
    }
  },
  mounted() {
    // 页面加载时尝试获取用户头像
    this.loadUserAvatar()
    
    // 加载全局用户信息
    this.loadGlobalUserInfo()
    
    // 加载我参与的项目
    this.loadMyProjects()
    
    // 加载我的任务
    this.loadMyTasks()

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
        // 如果用户未登录，显示空数组
        this.myProjects = []
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
          console.log('未获取到项目数据')
          this.myProjects = []
        }
      } catch (error) {
        console.error('加载项目失败:', error)
        this.myProjects = []
      } finally {
        this.isLoadingProjects = false
      }
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
    },
    async loadMyTasks() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        console.log('用户未登录，不加载任务数据')
        this.myTasks = []
        return
      }
      
      this.isLoadingTasks = true
      
      try {
        console.log('开始加载我的任务...')
        
        // 调用API获取我的任务（获取前5个最新的任务）
        const response = await taskAPI.getMyAssignedTasks(0, 5)
        
        console.log('我的任务API响应:', response)
        
        // 处理API返回的数据
        let tasks = []
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            tasks = response.data
          } else if (response.data.content && Array.isArray(response.data.content)) {
            // Spring分页数据
            tasks = response.data.content
          } else if (response.data.list && Array.isArray(response.data.list)) {
            tasks = response.data.list
          } else if (response.data.records && Array.isArray(response.data.records)) {
            tasks = response.data.records
          }
        }
        
        if (tasks.length > 0) {
          this.myTasks = tasks.map(task => ({
            id: task.id || task.taskId,
            title: task.title || '未命名任务',
            description: task.description || '',
            priority: this.mapTaskPriority(task.priority),
            dueDate: task.dueDate || null,
            status: task.status || 'TODO',
            projectId: task.projectId
          }))
          
          // 按优先级排序：高 > 中 > 低
          this.sortTasksByPriority()
          
          console.log('成功加载任务:', this.myTasks)
        } else {
          console.log('未获取到任务数据')
          this.myTasks = []
        }
      } catch (error) {
        console.error('加载任务失败:', error)
        this.myTasks = []
      } finally {
        this.isLoadingTasks = false
      }
    },
    mapTaskPriority(priority) {
      // 将后端优先级映射到前端显示
      const priorityMap = {
        'HIGH': 'high',
        'MEDIUM': 'medium',
        'LOW': 'low'
      }
      return priorityMap[priority] || 'medium'
    },
    getPriorityText(priority) {
      const textMap = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
      }
      return textMap[priority] || '中优先级'
    },
    formatDate(dateStr) {
      if (!dateStr) return '无截止日期'
      const date = new Date(dateStr)
      return `截止:${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    sortTasksByPriority() {
      // 定义优先级权重：高优先级 = 3, 中优先级 = 2, 低优先级 = 1
      const priorityWeight = {
        'high': 3,
        'medium': 2,
        'low': 1
      }
      
      this.myTasks.sort((a, b) => {
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })
    },
    isNearDeadline(dueDate) {
      // 判断任务是否临近截止（3天内）
      if (!dueDate) return false
      
      const now = new Date()
      const deadline = new Date(dueDate)
      const diffTime = deadline - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // 0-3天内截止或已逾期返回true
      return diffDays >= 0 && diffDays <= 3
    },
    isOverdue(dueDate) {
      // 判断任务是否已逾期
      // 截止日期当天不算逾期，只有在截止日期之后（即第二天）才算逾期
      if (!dueDate) return false
      
      const today = new Date()
      today.setHours(0, 0, 0, 0) // 设置为今天的0:00:00
      
      const deadline = new Date(dueDate)
      deadline.setHours(0, 0, 0, 0) // 设置为截止日期的0:00:00
      
      // 只有截止日期在今天之前（不包括今天）才算逾期
      return deadline < today
    }
  }
}
</script>

