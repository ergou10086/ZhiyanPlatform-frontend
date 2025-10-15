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
        <span class="page-title">项目广场</span>
      </div>
      <div class="header-right">
        <nav class="breadcrumb">
          <a class="breadcrumb-link" @click.prevent="$router.push('/home')">首页</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">项目广场</span>
        </nav>
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
            <span class="username">张伟</span>
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
            <span>{{ project.category }}</span>
          </div>
            <div class="card-body">
              <div class="card-title-row">
                <h3 class="card-title">{{ project.title }}</h3>
                <span class="status-badge" :class="statusClass(project.status)">{{ project.status }}</span>
              </div>
              <ul class="meta-list">
                <li>
                  <span class="meta-label">团队规模：</span>
                  <span class="meta-value">{{ project.teamSize }}人</span>
                </li>
                <li>
                  <span class="meta-label">数据资产：</span>
                  <span class="meta-value">{{ project.dataAssets }}</span>
                </li>
                <li>
                  <span class="meta-label">研究方向：</span>
                  <span class="meta-value">{{ project.direction }}</span>
                </li>
                <li>
                  <span class="meta-label">AI 核心：</span>
                  <span class="meta-value">{{ project.aiCore }}</span>
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
      pageSize: 6,
      userMenuOpen: false,
      userAvatar: null,
      projects: [
        { id: 1, title: '多模态医学影像数据平台', status: '稳健中', teamSize: 8, dataAssets: 'MRI, CT, PET扫描', direction: '肿瘤检测算法', aiCore: '深度学习模型', category: '医疗健康' },
        { id: 2, title: '气候变化预测模型研究', status: '进行中', teamSize: 6, dataAssets: '卫星遥感, 气象站', direction: 'LSTM时序预测', aiCore: '时序网络', category: '环境气候' },
        { id: 3, title: '基因组数据分析平台', status: '已完成', teamSize: 10, dataAssets: 'DNA测序, 蛋白组结构', direction: '可解释性建模', aiCore: '图神经网络', category: '生物信息' },
        { id: 4, title: '脑科学神经网络研究', status: '稳健中', teamSize: 7, dataAssets: 'fMRI, EEG数据集', direction: '神经网络可视化', aiCore: '深度学习模型', category: '科研探索' },
        { id: 5, title: '新型材料发现研究平台', status: '进行中', teamSize: 9, dataAssets: '分子结构, 光谱数据', direction: '材料性质预测', aiCore: '图模型', category: '材料科学' },
        { id: 6, title: '深空天体观测数据分析', status: '稳健中', teamSize: 5, dataAssets: '天体光谱, 动辄数据', direction: '天体识别算法', aiCore: '卷积网络', category: '天文学' },
        { id: 7, title: '卫星遥感图像分割', status: '进行中', teamSize: 12, dataAssets: '遥感影像库', direction: '语义分割', aiCore: 'Transformer', category: '环境气候' },
        { id: 8, title: '智慧城市交通预测', status: '已完成', teamSize: 11, dataAssets: '路网探针, 车流数据', direction: '交通预测', aiCore: '图时空网络', category: '智慧城市' }
      ]
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
      return this.filteredProjects.slice(start, start + this.pageSize)
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
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    loadUserAvatar() {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) this.userAvatar = savedAvatar
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
      alert('退出登录成功！')
      this.$router.push('/login')
    },
    statusClass(status) {
      if (status === '进行中') return 'ongoing'
      if (status === '已完成') return 'done'
      return 'steady'
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
      this.$router.push('/project-create')
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
      // 跳转到项目详情页面
      this.$router.push(`/project-detail/${project.id}`)
    }
  }
}
</script>

<style scoped>
.project-square-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  height: 64px;
  padding: 0 24px;
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

.header-right { display: flex; align-items: center; gap: 24px; position: relative; }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
}

.breadcrumb-link {
  color: #6c757d;
  cursor: pointer;
}

.breadcrumb-link:hover { color: #343a40; }

.breadcrumb-sep { color: #adb5bd; }

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
  padding: 20px 24px 0;
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
  gap: 16px;
  background: #fff;
  border: 1px solid #e9ecef;
  padding: 12px;
  border-radius: 8px;
}

.search-input {
  flex: 1;
  height: 40px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0 14px;
  outline: none;
  font-size: 14px;
}

.toolbar-actions { display: flex; gap: 10px; position: relative; }

.btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.btn.secondary { background: #f8f9ff; }
.btn.primary { background: #5b6bff; border-color: #5b6bff; color: #fff; }
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
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 调整为每行3个卡片 */
  gap: 16px; /* 增加间距 */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  align-content: start; /* 内容从顶部开始排列 */
  padding-bottom: 10px; /* 底部留白 */
}

.card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 280px; /* 固定卡片高度，确保所有页面一致 */
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-media {
  height: 140px;
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

.card-media span {
  position: relative;
  z-index: 2;
}

.card-body { 
  padding: 16px; 
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  color: #222;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  border: 1px solid transparent;
  flex-shrink: 0;
}
.status-badge.ongoing { background: #fff3cd; color: #cc9a06; border-color: #ffe69c; }
.status-badge.done { background: #e2f7e2; color: #1f7a1f; border-color: #bfeabd; }
.status-badge.steady { background: #e8f3ff; color: #2c6df2; border-color: #cfe2ff; }

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
  padding: 4px 0; 
  font-size: 12px; 
  color: #4f5153;
  line-height: 1.3;
}
.meta-label { color: #8b8d91; }
.meta-value { color: #343a40; }

.pagination {
  margin-top: auto; /* 自动推到底部 */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0; /* 防止分页按钮被压缩 */
  padding: 20px 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 0; /* 确保贴底 */
}
.pager, .page-num {
  height: 32px;
  min-width: 32px;
  padding: 0 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.page-num.active { background: #5b6bff; color: #fff; border-color: #5b6bff; }
.pager:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1200px) {
  .grid { 
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
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
  .card-media { height: 120px; }
  .card-body { padding: 12px; }
}
</style>