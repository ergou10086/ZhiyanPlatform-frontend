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
      <div class="section-card">
        <div class="section-title">我的知识库</div>
        <div class="section-subtitle">管理您参与的项目知识文档</div>
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
          <div class="card-media" :class="`gradient-${(index % 6) + 1}`">
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
.knowledge-base-container {
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
  gap: var(--space-3); /* 调整为项目广场相同的卡片间距 */
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #666;
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
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn:hover { 
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transform: scale(1.05);
}

.page-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  padding: var(--space-5) var(--space-6) 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* 工具栏样式 */
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
  margin-bottom: var(--space-4);
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

.toolbar-actions {
  display: flex;
  gap: 10px;
  position: relative;
}

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

.dropdown { 
  position: relative; 
}

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

.dropdown-item:hover { 
  background: #f8f9fa; 
}

.dropdown-item.active { 
  color: #5b6bff; 
  background: #eef1ff; 
}

/* 主页内容样式 */
.home-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* 允许flex子元素收缩 */
}

.kb-header { margin-bottom: 16px; }
.kb-title { font-size: 18px; font-weight: 600; color: #333; }
.kb-subtitle { margin-top: 6px; color: #6b7280; font-size: 13px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  padding: 16px;
}

.stat-card-header { display: flex; align-items: center; justify-content: space-between; }
.stat-card-title { color: #6b7280; font-size: 14px; }
.stat-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
.stat-icon.blue { background: #4f46e5; }
.stat-icon.green { background: #10b981; }
.stat-icon.purple { background: #8b5cf6; }
.stat-value { font-size: 28px; font-weight: 700; color: #111827; margin-top: 8px; }
.stat-desc { color: #9ca3af; font-size: 12px; margin-top: 4px; }

.card { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许flex子元素收缩 */
}
.card-header { 
  padding: 16px; 
  border-bottom: 1px solid #f1f3f5; 
  flex-shrink: 0; /* 防止头部收缩 */
}
.card-title { font-size: 16px; font-weight: 600; color: #333; }

.activity-list { 
  padding: 8px 12px 12px; 
  flex: 1; 
  overflow-y: auto; /* 允许滚动 */
  min-height: 0; /* 允许flex子元素收缩 */
}
.activity-item { display: flex; gap: 12px; padding: 10px 8px; align-items: flex-start; }
.activity-bullet { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; }
.activity-bullet.doc { background: #3b82f6; }
.activity-bullet.update { background: #22c55e; }
.activity-bullet.ai { background: #a855f7; }
.activity-main { flex: 1; }
.activity-text { color: #374151; font-size: 14px; }
.activity-meta { color: #9ca3af; font-size: 12px; margin-top: 4px; }

.section-card { 
  background: var(--bg-primary); 
  border: 1px solid var(--border-primary); 
  border-radius: var(--radius-xl); 
  padding: var(--space-4); 
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.section-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.section-title { 
  font-size: var(--text-xl); 
  font-weight: var(--font-semibold); 
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-title.small { font-size: var(--text-sm); }
.section-subtitle { 
  color: var(--text-tertiary); 
  font-size: var(--text-sm); 
  margin-top: var(--space-1);
}

.add-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.add-card { border: 1px solid #eef0f2; border-radius: 12px; padding: 14px; background: #fff; }
.add-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.add-name { color: #374151; font-weight: 600; }
.add-desc { color: #9ca3af; font-size: 12px; margin-bottom: 8px; }
.add-link { color: #4f46e5; font-size: 12px; text-decoration: none; }
.add-link:hover { text-decoration: underline; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-blue { background: #3b82f6; }
.dot-orange { background: #f59e0b; }
.dot-green { background: #10b981; }
.dot-purple { background: #8b5cf6; }
.dot-yellow { background: #fbbf24; }
.dot-pink { background: #f472b6; }

.table-wrap { width: 100%; overflow: auto; border: 1px solid #eef0f2; border-radius: 12px; background: #fff; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-table thead th { text-align: left; font-size: 13px; color: #6b7280; padding: 12px 14px; border-bottom: 1px solid #f1f3f5; }
.doc-table tbody td { padding: 12px 14px; font-size: 14px; color: #374151; border-bottom: 1px solid #f7f7f8; }
.filename { display: flex; align-items: center; gap: 8px; }
.file-dot { width: 10px; height: 10px; border-radius: 50%; }
.file-dot.doc { background: #3b82f6; }
.file-dot.patent { background: #f59e0b; }
.file-dot.dataset { background: #10b981; }
.file-dot.model { background: #8b5cf6; }
.file-dot.report { background: #fbbf24; }
.ops a { color: #4f46e5; text-decoration: none; margin-right: 12px; font-size: 13px; }
.ops a:hover { text-decoration: underline; }

.pagination.line { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.pager-text { color: #9aa0a6; font-size: 12px; }
.pager-group { display: flex; gap: 6px; align-items: center; }
.pager.small, .page-num.small { height: 28px; min-width: 28px; padding: 0 10px; border: 1px solid #e0e0e0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; }
.page-num.small.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }

/* 项目网格样式 - 与项目广场保持一致 */
.grid {
  margin-top: var(--space-4);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3); /* 调整为项目广场相同的卡片间距 */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  align-content: start;
  padding-bottom: var(--space-3);
}

/* 翻页组件样式 */
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

.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-normal);
  height: 280px; /* 调整为项目广场相同的卡片高度 */
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
  height: 180px; /* 调整为项目广场相同的图片高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
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

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  position: relative;
  z-index: 2;
}

.no-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 2;
}

.card-body { 
  padding: var(--space-3); /* 调整为项目广场相同的内边距 */
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  gap: var(--space-2);
}

.card-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--leading-snug);
  flex: 1;
}


.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.stable {
  background: var(--info-light);
  color: var(--info-color);
  border: 1px solid var(--info-color);
}

.status-badge.progress {
  background: var(--warning-light);
  color: var(--warning-color);
  border: 1px solid var(--warning-color);
}

.status-badge.completed {
  background: var(--success-light);
  color: var(--success-color);
  border: 1px solid var(--success-color);
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
  padding: var(--space-1) 0;
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
}

.meta-label {
  color: var(--text-tertiary);
  margin-right: var(--space-1);
  flex-shrink: 0;
  font-weight: var(--font-medium);
}

.meta-value {
  color: var(--text-primary);
  flex: 1;
  font-weight: var(--font-semibold);
}

.tag-item {
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
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
  
  .main-content {
    padding: var(--space-4) var(--space-4);
  }
  
  .toolbar { 
    flex-direction: column; 
    align-items: stretch; 
  }
  
  .toolbar-actions { 
    justify-content: flex-end; 
  }
  
  .card {
    height: 260px; /* 移动端调整为合适的卡片高度 */
  }
  
  .card-media {
    height: 140px; /* 移动端调整为合适的图片高度 */
  }
}
</style>
