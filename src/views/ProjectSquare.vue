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
      <div class="grid">
        <div v-for="(project, index) in paginatedProjects" :key="project.id" class="card" @click="viewProjectDetail(project)">
          <div class="card-media" :class="`gradient-${(index % 6) + 1}`">
            <img v-if="project.image" :src="project.image" :alt="project.title" class="project-image" />
            <div v-else class="no-image-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
            <div class="card-body">
              <div class="card-title-row">
                <h3 class="card-title">{{ project.title }}</h3>
                <span class="status-badge" :class="statusClass(project.status)">{{ project.status }}</span>
              </div>
              <ul class="meta-list">
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
      modalMessage: ''
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
        return matchText && matchStatus
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
    loadProjects() {
      // 从localStorage加载项目数据
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        this.projects = JSON.parse(savedProjects)
        console.log('加载的项目数量:', this.projects.length)
        console.log('第一个项目的标签:', this.projects[0]?.tags)
      } else {
        // 如果没有保存的项目，使用默认数据
        this.projects = [
          { id: 1, name: '多模态医学影像数据平台', title: '多模态医学影像数据平台', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 8, dataAssets: 'MRI, CT, PET扫描', direction: '肿瘤检测算法', aiCore: '深度学习模型', category: '医疗健康', tags: ['医学影像', '深度学习', '肿瘤检测'], created_by: 1, start_date: '2024-01-01', end_date: '2024-12-31' },
          { id: 2, name: '气候变化预测模型研究', title: '气候变化预测模型研究', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 6, dataAssets: '卫星遥感, 气象站', direction: 'LSTM时序预测', aiCore: '时序网络', category: '环境气候', tags: ['气候变化', 'LSTM', '时序预测'], created_by: 1, start_date: '2024-02-01', end_date: '2024-11-30' },
          { id: 3, name: '基因组数据分析平台', title: '基因组数据分析平台', status: 'COMPLETED', visibility: 'PRIVATE', teamSize: 10, dataAssets: 'DNA测序, 蛋白组结构', direction: '可解释性建模', aiCore: '图神经网络', category: '生物信息', tags: ['基因组', '图神经网络', '生物信息'], created_by: 1, start_date: '2023-06-01', end_date: '2024-03-31' },
          { id: 4, name: '脑科学神经网络研究', title: '脑科学神经网络研究', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 7, dataAssets: 'fMRI, EEG数据集', direction: '神经网络可视化', aiCore: '深度学习模型', category: '科研探索', tags: ['脑科学', '神经网络', '可视化'], created_by: 1, start_date: '2024-01-15', end_date: '2024-12-15' },
          { id: 5, name: '新型材料发现研究平台', title: '新型材料发现研究平台', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 9, dataAssets: '分子结构, 光谱数据', direction: '材料性质预测', aiCore: '图模型', category: '材料科学', tags: ['材料科学', '图模型', '性质预测'], created_by: 1, start_date: '2024-03-01', end_date: '2024-12-31' },
          { id: 6, name: '深空天体观测数据分析', title: '深空天体观测数据分析', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 5, dataAssets: '天体光谱, 动辄数据', direction: '天体识别算法', aiCore: '卷积网络', category: '天文学', tags: ['天体观测', '卷积网络', '天体识别'], created_by: 1, start_date: '2024-02-15', end_date: '2024-11-15' },
          { id: 7, name: '卫星遥感图像分割', title: '卫星遥感图像分割', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 12, dataAssets: '遥感影像库', direction: '语义分割', aiCore: 'Transformer', category: '环境气候', tags: ['遥感', '图像分割', 'Transformer'], created_by: 1, start_date: '2024-01-20', end_date: '2024-10-20' },
          { id: 8, name: '智慧城市交通预测', title: '智慧城市交通预测', status: 'COMPLETED', visibility: 'PRIVATE', teamSize: 11, dataAssets: '路网探针, 车流数据', direction: '交通预测', aiCore: '图时空网络', category: '智慧城市', tags: ['智慧城市', '交通预测', '图网络'], created_by: 1, start_date: '2023-09-01', end_date: '2024-02-29' },
          { id: 9, name: '金融风险评估系统', title: '金融风险评估系统', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 6, dataAssets: '交易数据, 市场指标', direction: '风险预测模型', aiCore: '机器学习', category: '金融科技', tags: ['金融科技', '风险评估', '机器学习'], created_by: 1, start_date: '2024-03-15', end_date: '2024-12-15' },
          { id: 10, name: '教育智能推荐平台', title: '教育智能推荐平台', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 8, dataAssets: '学习行为, 课程数据', direction: '个性化推荐', aiCore: '协同过滤', category: '教育科技', tags: ['教育科技', '推荐系统', '协同过滤'], created_by: 1, start_date: '2024-02-01', end_date: '2024-11-30' },
          { id: 11, name: '农业智能监测系统', title: '农业智能监测系统', status: 'ONGOING', visibility: 'PRIVATE', teamSize: 5, dataAssets: '土壤数据, 气象信息', direction: '作物生长预测', aiCore: '时序分析', category: '农业科技', tags: ['农业科技', '智能监测', '时序分析'], created_by: 1, start_date: '2024-04-01', end_date: '2024-12-31' },
          { id: 12, name: '智能制造质量检测', title: '智能制造质量检测', status: 'COMPLETED', visibility: 'PRIVATE', teamSize: 9, dataAssets: '产品图像, 质量指标', direction: '缺陷检测算法', aiCore: '计算机视觉', category: '工业4.0', tags: ['智能制造', '质量检测', '计算机视觉'], created_by: 1, start_date: '2023-12-01', end_date: '2024-05-31' }
        ]
        // 保存默认数据到localStorage
        localStorage.setItem('projects', JSON.stringify(this.projects))
      }
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
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  height: 64px;
  padding: 0 var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
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

.no-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  opacity: 0.7;
}

.no-image-placeholder svg {
  color: rgba(255, 255, 255, 0.8);
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