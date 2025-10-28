<template>
  <div class="knowledge-base-container">
    <!-- 侧边栏 -->
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
        <span class="page-title">知识库</span>
      </div>
    </div>

    <!-- 主要内容区域 - 直接显示项目列表 -->
    <div class="main-content">
      <div class="page-header">
        <div class="page-title">
          <span class="title-text">我的知识库</span>
          <div class="title-decoration"></div>
        </div>
        <div class="page-subtitle">
          <svg class="subtitle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
          </svg>
          <span>管理您参与的项目知识文档，随时随地协作共享</span>
        </div>
      </div>
      
      <!-- 工具栏 -->
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
              <li class="dropdown-item" :class="{ active: selectedStatus === '稳健中' }" @click="selectStatus('稳健中')">稳健中</li>
              <li class="dropdown-item" :class="{ active: selectedStatus === '已完成' }" @click="selectStatus('已完成')">已完成</li>
            </ul>
          </div>
          <button class="btn" @click="resetFilters">重置筛选</button>
        </div>
      </div>
      
      <div class="content-wrapper">
        <div class="grid">
          <div 
            v-for="(project, index) in paginatedProjects" 
            :key="project.id" 
            class="card"
            @click="viewProjectKnowledge(project)"
          >
          <div class="card-media" :class="`gradient-${(project.id % 6) + 1}`">
            <img 
              v-if="project.image" 
              :src="project.image" 
              :alt="project.title"
              class="project-image"
            />
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
              <li v-else-if="project.period">
                <span class="meta-label">项目周期：</span>
                <span class="meta-value">{{ project.period }}</span>
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
        
        <!-- 翻页组件 -->
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
  name: 'KnowledgeBase',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      // 用户参与的项目列表（包括创建的和加入的）
      joinedProjects: [],
      // 搜索和筛选相关
      searchText: '',
      selectedStatus: '',
      statusOpen: false,
      // 翻页相关
      currentPage: 1,
      pageSize: 8 // 每页显示8个项目（2行，每行4个）
    }
  },
  computed: {
    // 过滤后的项目列表
    filteredProjects() {
      const text = this.searchText.trim().toLowerCase()
      return this.joinedProjects.filter(project => {
        const matchText = text ? project.title.toLowerCase().includes(text) : true
        const matchStatus = this.selectedStatus ? project.status === this.selectedStatus : true
        return matchText && matchStatus
      })
    },
    // 总页数
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredProjects.length / this.pageSize))
    },
    // 当前页的项目列表
    paginatedProjects() {
      const start = (this.currentPage - 1) * this.pageSize
      const result = this.filteredProjects.slice(start, start + this.pageSize)
      console.log('当前页:', this.currentPage, '每页大小:', this.pageSize, '过滤后项目数:', this.filteredProjects.length, '当前页项目数:', result.length)
      return result
    }
  },
  mounted() {
    this.loadUserProjects()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    loadUserProjects() {
      // 从localStorage加载用户创建的项目
      const createdProjects = JSON.parse(localStorage.getItem('projects') || '[]')
      
      // 默认的参与项目（模拟用户加入的其他项目）
      const defaultJoinedProjects = [
        {
          id: 101,
          title: '多模态医学影像数据平台',
          category: '医疗健康',
          status: '稳健中',
          teamSize: 8,
          startDate: '2025-01-15',
          endDate: '2025-12-31',
          tags: ['医学影像', '深度学习', '肿瘤检测'],
          isJoined: true
        },
        {
          id: 102,
          title: '气候变化预测模型研究',
          category: '环境气候',
          status: '进行中',
          teamSize: 12,
          startDate: '2025-02-01',
          endDate: '2025-11-30',
          tags: ['气候变化', 'LSTM', '时序预测'],
          isJoined: true
        },
        {
          id: 103,
          title: '基因组数据分析平台',
          category: '生物信息',
          status: '进行中',
          teamSize: 6,
          startDate: '2025-01-01',
          endDate: '2025-10-31',
          tags: ['基因组', '图神经网络', '生物信息'],
          isJoined: true
        }
      ]
      
      // 标记用户创建的项目，并添加项目周期和标签
      const markedCreatedProjects = createdProjects.map(project => ({
        ...project,
        status: project.status || '进行中',
        teamSize: this.getTeamSize(project),
        startDate: project.startDate || project.createdAt,
        endDate: project.endDate || project.updatedAt,
        tags: project.tags || [],
        isJoined: true
      }))
      
      // 合并用户创建的项目和参与的项目
      this.joinedProjects = [...markedCreatedProjects, ...defaultJoinedProjects]
      
      console.log('用户创建的项目数量:', markedCreatedProjects.length)
      console.log('默认参与项目数量:', defaultJoinedProjects.length)
      console.log('知识库总项目数量:', this.joinedProjects.length)
      console.log('知识库项目列表:', this.joinedProjects)
    },
    
    // 获取团队规模
    getTeamSize(project) {
      if (project.teamSize) return project.teamSize
      if (project.team && Array.isArray(project.team)) return project.team.length
      return 1 // 默认1人
    },
    
    // 格式化日期范围
    formatDateRange(startDate, endDate) {
      if (!startDate || !endDate) return '未设置'
      const start = new Date(startDate).toLocaleDateString('zh-CN')
      const end = new Date(endDate).toLocaleDateString('zh-CN')
      return `${start} 至 ${end}`
    },
    
    // 状态样式类
    statusClass(status) {
      const statusMap = {
        '进行中': 'status-active',
        '稳健中': 'status-stable',
        '已完成': 'status-completed',
        '暂停': 'status-paused',
        '计划中': 'status-planned'
      }
      return statusMap[status] || 'status-default'
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
    viewProjectKnowledge(project) {
      // 跳转到项目知识库分类界面
      this.$router.push(`/project-knowledge/${project.id}`)
    },
    statusClass(status) {
      const statusMap = {
        '稳健中': 'stable',
        '进行中': 'progress',
        '已完成': 'completed',
        'ONGOING': 'progress',
        'COMPLETED': 'completed'
      }
      return statusMap[status] || 'stable'
    },
    // 搜索和筛选相关方法
    handleClickOutside(event) {
      if (!event.target.closest('.dropdown')) {
        this.statusOpen = false
      }
    },
    toggleStatusDropdown() {
      this.statusOpen = !this.statusOpen
    },
    selectStatus(status) {
      this.selectedStatus = status
      this.statusOpen = false
      this.currentPage = 1 // 重置到第一页
    },
    resetFilters() {
      this.searchText = ''
      this.selectedStatus = ''
      this.currentPage = 1
    },
    // 翻页相关方法
    goPrev() {
      if (this.currentPage > 1) this.currentPage--
    },
    goNext() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    goPage(page) {
      this.currentPage = page
    }
  }
}
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.knowledge-base-container {
  min-height: 100vh;
  background-color: #f8f9fa;
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
  line-height: 20px;
  display: flex;
  align-items: center;
  padding-top: 12px;
}

.main-content {
  flex: 1;
  margin-top: 64px;
  padding: 32px 40px 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  animation: fadeInUp 0.6s ease-out;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* 页面头部样式 */
.page-header {
  margin-bottom: 32px;
  animation: fadeInDown 0.6s ease-out;
}

.page-title {
  position: relative;
  margin: 0 0 16px 0;
  display: inline-block;
}

.title-text {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #0044CC 0%, #5EB6E4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.title-decoration {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #5EB6E4 0%, #A7C6ED 50%, transparent 100%);
  border-radius: 2px;
}

.page-subtitle {
  font-size: 15px;
  color: #64748b;
  line-height: 1.8;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 3px solid #5EB6E4;
  border-radius: 8px;
}

.subtitle-icon {
  flex-shrink: 0;
  color: #5EB6E4;
  margin-top: 2px;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e3e8ef;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.toolbar:hover {
  box-shadow: 0 8px 15px -5px rgba(0, 0, 0, 0.15);
}

.search-input {
  flex: 1;
  height: 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0 18px;
  outline: none;
  font-size: 14px;
  background: white;
  color: #1e293b;
  transition: all 0.3s ease;
  font-weight: 500;
}

.search-input:focus {
  border-color: #5EB6E4;
  box-shadow: 0 0 0 3px rgba(94, 182, 228, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  position: relative;
}

.btn {
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #1e293b;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  border-color: #5EB6E4;
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2ff 100%);
  color: #0044CC;
}

.btn.secondary { 
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%);
  border-color: #e5e7eb;
}

.btn.secondary:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
}

.dropdown { 
  position: relative; 
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 140px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  z-index: 100;
  list-style: none;
  padding: 8px;
  margin: 0;
  animation: fadeInDown 0.2s ease-out;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.dropdown-item:hover { 
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2ff 100%);
  color: #0044CC;
  transform: translateX(4px);
}

.dropdown-item.active { 
  color: #0044CC; 
  background: linear-gradient(135deg, #e3f2ff 0%, #d4e9ff 100%);
  font-weight: 600;
}

/* 项目网格样式 */
.grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  align-content: start;
  padding-bottom: 20px;
}

/* 翻页组件样式 */
.pagination {
  margin-top: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 24px 0;
  background: transparent;
  border-top: 1px solid #e5e7eb;
  margin-bottom: 0;
}

.pager, .page-num {
  height: 40px;
  min-width: 40px;
  padding: 0 12px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pager:hover, .page-num:hover {
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2ff 100%);
  border-color: #5EB6E4;
  color: #0044CC;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 68, 204, 0.15);
}

.page-num.active { 
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
}

.pager:disabled { 
  opacity: 0.4; 
  cursor: not-allowed;
  transform: none;
  pointer-events: none;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 300px;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.6s ease-out backwards;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.15s; }
.card:nth-child(3) { animation-delay: 0.2s; }
.card:nth-child(4) { animation-delay: 0.25s; }
.card:nth-child(5) { animation-delay: 0.3s; }
.card:nth-child(6) { animation-delay: 0.35s; }
.card:nth-child(7) { animation-delay: 0.4s; }
.card:nth-child(8) { animation-delay: 0.45s; }

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #5EB6E4 0%, #A7C6ED 50%, #e0b3e5 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 10;
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #5EB6E4;
}

.card:hover::before {
  transform: scaleX(1);
}

.card-media {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  transition: transform 0.4s ease;
}

.card:hover .card-media {
  transform: scale(1.05);
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
  background: rgba(0, 0, 0, 0.05);
  z-index: 1;
}

.card-media span {
  position: relative;
  z-index: 2;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

.no-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 2;
}

.card-body { 
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.5;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover .status-badge {
  transform: scale(1.05);
}

.status-badge.stable {
  background: linear-gradient(135deg, #A7C6ED 0%, #5EB6E4 100%);
  color: white;
  border: none;
}

.status-badge.progress {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border: none;
}

.status-badge.completed {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: white;
  border: none;
}

.meta-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-list li {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.6;
}

.meta-label {
  color: #64748b;
  margin-right: 6px;
  flex-shrink: 0;
  font-weight: 600;
}

.meta-value {
  color: #334155;
  flex: 1;
  font-weight: 500;
}

.tag-item {
  display: inline-block;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 6px;
  transition: all 0.3s ease;
}

.card:hover .tag-item {
  background: linear-gradient(135deg, #e3f2ff 0%, #d4e9ff 100%);
  color: #0044CC;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .grid { 
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  
  .title-text {
    font-size: 28px;
  }
  
  .main-content {
    padding: 28px 32px 0;
  }
}

@media (max-width: 1000px) {
  .grid { 
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .title-text {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
    padding: 14px;
  }
  
  .main-content {
    padding: 24px 28px 0;
  }
}

@media (max-width: 600px) {
  .grid { 
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .main-content {
    padding: 20px 16px 0;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .title-text {
    font-size: 22px;
  }
  
  .page-subtitle {
    font-size: 13px;
    padding: 12px;
  }
  
  .toolbar { 
    flex-direction: column; 
    align-items: stretch;
    gap: 12px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .toolbar-actions { 
    justify-content: flex-end;
    width: 100%;
  }
  
  .card {
    height: 280px;
  }
  
  .card-media {
    height: 160px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .pagination {
    padding: 20px 0;
    gap: 8px;
  }
  
  .pager, .page-num {
    height: 36px;
    min-width: 36px;
    font-size: 13px;
  }
}
</style>
