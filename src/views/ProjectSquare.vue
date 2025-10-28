<template>
  <div class="project-square-container">
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
        <button class="back-btn" @click="goToHome" title="返回首页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">项目广场</span>
      </div>
      <div class="header-right">
        <div class="user-area">
          <div class="user-profile" @click="toggleUserMenu">
            <div class="user-avatar">
              <img v-if="userAvatar" :src="userAvatar" alt="用户头像" />
              <div v-else class="avatar-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span class="username">{{ getCurrentUserName() }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotate': userMenuOpen }">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="user-menu" v-if="userMenuOpen">
            <div class="menu-item" @click="goToProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              个人信息
            </div>
            <div class="menu-item" @click="logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              退出登录
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤与内容区域 -->
    <div class="main-content">
      <div class="toolbar">
        <input v-model="searchText" class="search-input" type="text" placeholder="搜索项目名称" />
        <div class="toolbar-actions">
          <div class="dropdown" @click.stop="toggleStatusDropdown">
            <button class="btn secondary">
              <span>项目状态</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <ul class="dropdown-menu" v-if="statusOpen">
              <li class="dropdown-item" :class="{ active: selectedStatus === '' }" @click="selectStatus('')">全部</li>
              <li class="dropdown-item" :class="{ active: selectedStatus === '进行中' }" @click="selectStatus('进行中')">进行中</li>
              <li class="dropdown-item" :class="{ active: selectedStatus === '已完成' }" @click="selectStatus('已完成')">已完成</li>
              <li class="dropdown-item" :class="{ active: selectedStatus === '稳健中' }" @click="selectStatus('稳健中')">稳健中</li>
            </ul>
          </div>

          <button class="btn" @click="resetFilters">重置筛选</button>
          <button class="btn primary" @click="createNewProject">新建项目</button>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">正在加载项目数据...</p>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="projects.length === 0" class="empty-state">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3 class="empty-title">暂无公开项目</h3>
          <p class="empty-description">目前还没有公开的项目，快去创建第一个项目吧！</p>
          <button class="btn primary" @click="createNewProject">新建项目</button>
        </div>
        
        <!-- 项目列表 -->
        <div v-else class="grid">
          <div v-for="(project, index) in paginatedProjects" :key="project.id" class="card" @click="viewProjectDetail(project)">
            <div class="card-media" :class="`gradient-${(project.id % 6) + 1}`">
              <img v-if="project.image" :src="project.image" :alt="project.title" class="project-image" />
            </div>
            <div class="card-body">
              <div class="card-title-row">
                <h3 class="card-title">{{ project.title }}</h3>
                <div class="badge-group">
                  <span v-if="project.visibility === 'PUBLIC'" class="visibility-badge visibility-public" title="公开项目">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span class="status-badge" :class="statusClass(project.status)">{{ project.status }}</span>
                </div>
              </div>
              <ul class="meta-list">
                <li>
                  <span class="meta-label">创建者：</span>
                  <span class="meta-value">{{ project.creatorName }}</span>
                </li>
                <li>
                  <span class="meta-label">团队规模：</span>
                  <span class="meta-value">{{ getTeamSize(project) }}人</span>
                </li>
                <li v-if="project.startDate && project.endDate">
                  <span class="meta-label">项目周期：</span>
                  <span class="meta-value">{{ formatDateRange(project.startDate, project.endDate) }}</span>
                </li>
                <li v-if="project.tags && project.tags.length > 0">
                  <span class="meta-label">标签：</span>
                  <span class="meta-value">
                    <span v-for="(tag, index) in project.tags" :key="index" class="tag-item">
                      {{ tag }}{{ index < project.tags.length - 1 ? '、' : '' }}
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="pagination">
          <button class="pager" :disabled="currentPage === 1" @click="goPrev">◀</button>
          <button v-for="p in totalPages" :key="p" class="page-num" :class="{ active: p === currentPage }" @click="goPage(p)">{{ p }}</button>
          <button class="pager" :disabled="currentPage === totalPages" @click="goNext">▶</button>
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

    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'ProjectSquare',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      searchText: '',
      selectedStatus: '',
      statusOpen: false,
      currentPage: 1,
      pageSize: 8, // 每页显示8个项目（2行，每行4个）
      userMenuOpen: false,
      userAvatar: null,
      projects: [],
      showModal: false,
      modalMessage: '',
      isLoading: true, // 添加加载状态
      showToast: false,
      toastMessage: ''
    }
  },
  computed: {
    categories() {
      const set = new Set(this.projects.map(p => p.category))
      return Array.from(set)
    },
    filteredProjects() {
      const text = this.searchText.trim().toLowerCase()
      return this.projects.filter(p => {
        const matchText = text ? p.title.toLowerCase().includes(text) : true
        const matchStatus = this.selectedStatus ? p.status === this.selectedStatus : true
        // 只显示公开项目
        const isPublic = p.visibility === 'PUBLIC'
        return matchText && matchStatus && isPublic
      })
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredProjects.length / this.pageSize))
    },
    paginatedProjects() {
      const start = (this.currentPage - 1) * this.pageSize
      const result = this.filteredProjects.slice(start, start + this.pageSize)
      console.log('当前页:', this.currentPage, '每页大小:', this.pageSize, '过滤后项目数:', this.filteredProjects.length, '当前页项目数:', result.length)
      return result
    }
  },
  mounted() {
    this.loadUserAvatar()
    this.loadProjects()
    document.addEventListener('click', this.handleClickOutside)
    // 监听用户信息更新事件
    this.$root.$on('userInfoUpdated', this.loadUserAvatar)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$root.$off('userInfoUpdated', this.loadUserAvatar)
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    goToHome() {
      this.$router.push('/home')
    },
    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
      if (!event.target.closest('.dropdown')) {
        this.statusOpen = false
      }
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    loadUserAvatar() {
      // 优先从user_info获取头像
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          if (userData.avatar) {
            this.userAvatar = userData.avatar
            return
          }
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
      
      // 如果user_info中没有头像，则从userAvatar获取
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) this.userAvatar = savedAvatar
    },
    getCurrentUserName() {
      // 从localStorage获取当前用户信息
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userInfo = JSON.parse(savedUserInfo)
          return userInfo.nickname || userInfo.name || '用户'
        } catch (error) {
          console.error('解析用户信息失败:', error)
          return '用户'
        }
      }
      return '用户'
    },
    async loadProjects() {
      this.isLoading = true
      
      try {
        console.log('====== 开始加载项目广场数据 ======')
        
        // 从后端API加载公开项目
        const { projectAPI } = await import('@/api/project')
        
        console.log('调用后端API获取公开活跃项目...')
        const response = await projectAPI.getPublicActiveProjects(0, 100) // 获取前100个公开项目
        
        console.log('API响应:', response)
        console.log('响应code:', response?.code)
        console.log('响应data类型:', typeof response?.data)
        
        if (response && response.code === 200) {
          console.log('成功获取公开项目数据')
          
          // 处理后端返回的分页数据
          let backendProjects = []
          if (response.data && response.data.content) {
            // Spring Data Page对象
            backendProjects = response.data.content
            console.log('从Page对象获取项目列表，数量:', backendProjects.length)
          } else if (Array.isArray(response.data)) {
            // 直接返回数组
            backendProjects = response.data
            console.log('直接获取项目数组，数量:', backendProjects.length)
          } else {
            console.warn('未知的数据格式:', response.data)
            backendProjects = []
          }
          
          // 转换后端数据格式为前端格式，并过滤掉私有项目
          this.projects = backendProjects
            .map(project => ({
              id: project.id,
              name: project.name,
              title: project.name, // 前端显示用title
              description: project.description || '暂无描述',
              status: this.getStatusDisplay(project.status),
              visibility: project.visibility,
              teamSize: project.teamSize || 1,
              dataAssets: project.description || '暂无描述',
              direction: project.description || '暂无描述',
              aiCore: '待定',
              category: project.category || '其他',
              tags: project.tags || [],
              image: project.imageUrl || null,
              imageUrl: project.imageUrl || null,
              startDate: project.startDate,
              endDate: project.endDate,
              start_date: project.startDate,
              end_date: project.endDate,
              created_by: project.creatorId,
              creatorId: project.creatorId,
              creatorName: project.creatorName || '未知用户', // 后端已填充创建者名称
              createdAt: project.createdAt,
              updatedAt: project.updatedAt
            }))
            .filter(project => {
              // 只保留公开项目，记录被过滤的私有项目
              if (project.visibility !== 'PUBLIC') {
                console.warn('过滤掉非公开项目:', project.id, project.name, '可见性:', project.visibility)
                return false
              }
              return true
            })
          
          console.log('转换后的项目数量:', this.projects.length)
          if (this.projects.length > 0) {
            console.log('项目数据示例:', this.projects[0])
            console.log('所有项目的状态:', this.projects.map(p => ({ id: p.id, name: p.name, status: p.status, visibility: p.visibility })))
          }
          
          // 只保存后端数据到localStorage（覆盖旧数据）
          // 这样可以确保显示的都是数据库中真实存在的公开项目
          localStorage.setItem('projects', JSON.stringify(this.projects))
          
          console.log('====== 项目加载完成，显示', this.projects.length, '个公开项目 ======')
        } else {
          console.error('获取公开项目失败，code:', response?.code, 'msg:', response?.msg)
          // 失败时从localStorage加载
          this.loadProjectsFromLocalStorage()
        }
      } catch (error) {
        console.error('====== 加载项目失败 ======')
        console.error('错误类型:', error.constructor.name)
        console.error('错误信息:', error.message)
        console.error('错误详情:', error)
        
        // 发生错误时从localStorage加载
        this.loadProjectsFromLocalStorage()
      } finally {
        this.isLoading = false
      }
    },
    
    loadProjectsFromLocalStorage() {
      console.log('从localStorage加载项目数据...')
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const allProjects = JSON.parse(savedProjects)
        // 只保留公开项目，并确保状态正确转换
        this.projects = allProjects.filter(project => {
          if (project.visibility !== 'PUBLIC') {
            console.warn('从localStorage过滤掉非公开项目:', project.id, project.name || project.title, '可见性:', project.visibility)
            return false
          }
          return true
        }).map(project => ({
          ...project,
          status: this.getStatusDisplay(project.status) // 确保状态正确转换
        }))
        console.log('从localStorage加载的项目数量:', allProjects.length, '过滤后项目数量:', this.projects.length)
        console.log('localStorage中所有项目的状态:', allProjects.map(p => ({ id: p.id, title: p.title || p.name, status: p.status, visibility: p.visibility })))
      } else {
        console.log('localStorage中没有项目数据，使用空数组')
        this.projects = []
      }
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
        'CANCELLED': '已取消',
        'DONE': '已完成',
        'STEADY': '稳健中'
      }
      return statusMap[status] || status || '进行中'
    },
    setUserAvatar(url) {
      this.userAvatar = url
      localStorage.setItem('userAvatar', url)
    },
    goToProfile() {
      this.userMenuOpen = false
      this.$router.push('/profile')
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
    statusClass(status) {
      if (status === '进行中') return 'ongoing'
      if (status === '已完成') return 'done'
      return 'steady'
    },
    getTeamSize(project) {
      // 计算真实的团队成员数量
      if (project.teamMembers && project.teamMembers.length > 0) {
        return project.teamMembers.length
      }
      // 如果没有团队成员信息，返回默认值
      return project.teamSize || 1
    },
    formatDateRange(startDate, endDate) {
      if (!startDate || !endDate) return ''
      
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      const formatDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      return `${formatDate(start)} 至 ${formatDate(end)}`
    },
    toggleStatusDropdown() {
      this.statusOpen = !this.statusOpen
    },
    selectStatus(s) {
      this.selectedStatus = s
      this.statusOpen = false
      this.currentPage = 1
    },
    resetFilters() {
      this.searchText = ''
      this.selectedStatus = ''
      this.currentPage = 1
    },
    createNewProject() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (isAuthenticated) {
        this.$router.push({ path: '/project-create', query: { from: 'project-square' } })
      } else {
        this.showLoginModal('请先登录才能创建项目')
      }
    },
    goPrev() {
      if (this.currentPage > 1) this.currentPage--
    },
    goNext() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    goPage(p) {
      this.currentPage = p
    },
    viewProjectDetail(project) {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (isAuthenticated) {
        // 跳转到项目详情页面
        this.$router.push(`/project-detail/${project.id}`)
      } else {
        // 游客显示登录提示弹窗
        this.showLoginModal('请先登录才能查看项目详情')
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
.project-square-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  height: 64px;
  padding: 0 var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
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

.header-right { display: flex; align-items: center; gap: 24px; position: relative; }


.user-profile { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px; border-radius: 6px; transition: background-color 0.3s ease; }
.user-profile:hover { background-color: #f8f9fa; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #666; }
.rotate { transform: rotate(180deg); transition: transform 0.3s ease; }
.user-menu { position: absolute; top: calc(100% + 4px); right: 0; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e9ecef; min-width: 160px; z-index: 100; }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background-color 0.3s ease; font-size: 14px; color: #333; }
.menu-item:hover { background-color: #f8f9fa; }

.main-content {
  flex: 1;
  margin-top: 64px; /* 为固定页眉留出空间 */
  padding: var(--space-5) var(--space-6) 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px); /* 减去顶部导航栏高度 */
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  padding: var(--space-3);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.search-input {
  flex: 1;
  height: 40px;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 0 var(--space-4);
  outline: none;
  font-size: var(--text-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.toolbar-actions { display: flex; gap: 10px; position: relative; }

.btn {
  height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn.secondary { 
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

.btn.primary { 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-color: var(--primary-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn.primary:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-dark));
  box-shadow: var(--shadow-lg);
}
.btn-block { width: 100%; margin-top: 10px; }

.dropdown { position: relative; }
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 120px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0;
}
.dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.dropdown-item:hover { background: #f8f9fa; }
.dropdown-item.active { color: #5b6bff; background: #eef1ff; }

.grid {
  margin-top: var(--space-4);
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 调整为每行4个卡片 */
  gap: var(--space-4); /* 增加间距 */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  align-content: start; /* 内容从顶部开始排列 */
  padding-bottom: var(--space-3); /* 底部留白 */
}

.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-normal);
  height: 280px; /* 固定卡片高度，确保所有页面一致 */
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color), var(--success-color));
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-color);
}

.card:hover::before {
  transform: scaleX(1);
}

.card-media {
  height: 180px; /* 增大媒体区域高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  border-radius: 10px 10px 0 0;
}

.gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.gradient-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.gradient-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.gradient-6 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

.card-media::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.card-media span {
  position: relative;
  z-index: 2;
}

.card-body { 
  padding: 12px 16px; /* 进一步减少内边距 */
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px; /* 减少底部间距 */
  gap: 8px;
}

.card-title {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  margin: 0;
  line-height: var(--leading-snug);
  flex: 1;
}

.badge-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.visibility-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  border: 1px solid transparent;
}

.visibility-badge.visibility-public {
  background: #e7f5ff;
  color: #1971c2;
  border-color: #a5d8ff;
}

.visibility-badge.visibility-public svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
}

.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: 1;
  border: 1px solid transparent;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.ongoing { 
  background: var(--warning-light); 
  color: var(--warning-color); 
  border-color: var(--warning-color);
}
.status-badge.done { 
  background: var(--success-light); 
  color: var(--success-color); 
  border-color: var(--success-color);
}
.status-badge.steady { 
  background: var(--info-light); 
  color: var(--info-color); 
  border-color: var(--info-color);
}

.meta-list { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.meta-list li { 
  display: flex; 
  align-items: center; 
  padding: 2px 0; /* 进一步减少内边距 */
  font-size: var(--text-xs); 
  color: var(--text-secondary);
  line-height: 1.2;
}
.meta-label { 
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}
.meta-value { 
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}

.tag-item {
  display: inline;
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}

.pagination {
  margin-top: auto; /* 自动推到底部 */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0; /* 防止分页按钮被压缩 */
  padding: var(--space-5) 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-primary);
  margin-bottom: 0; /* 确保贴底 */
}
.pager, .page-num {
  height: 32px;
  min-width: 32px;
  padding: 0 var(--space-2);
  border: 2px solid var(--border-primary);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.pager:hover, .page-num:hover {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
}

.page-num.active { 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-inverse);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.pager:disabled { 
  opacity: 0.5; 
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 1400px) {
  .grid { 
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 1000px) {
  .grid { 
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .grid { 
    grid-template-columns: 1fr;
  }
  .toolbar { flex-direction: column; align-items: stretch; }
  .toolbar-actions { justify-content: flex-end; }
  .card { height: 260px; } /* 移动端稍微缩小 */
  .card-media { height: 150px; }
  .card-body { padding: 12px; }
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: var(--text-base);
  margin: 0;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 24px;
  opacity: 0.3;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  max-width: 400px;
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