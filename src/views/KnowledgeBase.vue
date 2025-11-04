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
        <!-- 空状态提示 -->
        <div v-if="paginatedProjects.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="empty-title">暂无项目</h3>
          <p class="empty-message">您还没有参与任何项目，快去项目广场创建或加入项目吧！</p>
        </div>
        
        <!-- 项目列表 -->
        <div v-else class="grid">
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
                <span class="meta-value">{{ getTeamSizeDisplay(project) }}人</span>
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
        <div v-if="paginatedProjects.length > 0" class="pagination">
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
import { projectAPI } from '@/api/project'
import '@/assets/styles/KnowledgeBase.css'

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
    async loadUserProjects() {
      // 从localStorage加载用户创建的项目
      const createdProjects = JSON.parse(localStorage.getItem('projects') || '[]')
      
      // 标记用户创建的项目，并添加项目周期和标签
      const markedCreatedProjects = createdProjects.map(project => ({
        ...project,
        status: project.status || '进行中',
        teamSize: this.getTeamSize(project), // 先使用缓存或默认值
        startDate: project.startDate || project.createdAt,
        endDate: project.endDate || project.updatedAt,
        tags: project.tags || [],
        isJoined: true
      }))
      
      // 使用用户创建的项目
      this.joinedProjects = [...markedCreatedProjects]
      
      // 为所有项目并行获取真实的团队成员数量
      console.log('开始为知识库项目获取真实团队成员数量...')
      const memberCountPromises = this.joinedProjects.map(async (project) => {
        if (!project.id) {
          console.warn('项目缺少ID，跳过:', project)
          return
        }
        try {
          const teamSize = await this.getTeamSize(project.id)
          // 使用 Vue.set 确保响应式更新
          this.$set(project, 'memberCount', teamSize)
          this.$set(project, 'teamSize', teamSize) // 同时更新 teamSize 以兼容现有代码
          console.log(`✅ 项目 ${project.id} (${project.title}) 团队规模:`, teamSize)
        } catch (error) {
          console.warn(`获取项目 ${project.id} 成员数量失败:`, error)
        }
      })
      
      // 等待所有成员数量获取完成
      await Promise.all(memberCountPromises)
      console.log('所有项目的成员数量获取完成')
      
      // 强制触发响应式更新
      this.$forceUpdate()
      
      console.log('用户创建的项目数量:', markedCreatedProjects.length)
      console.log('默认参与项目数量:', defaultJoinedProjects.length)
      console.log('知识库总项目数量:', this.joinedProjects.length)
      console.log('知识库项目列表:', this.joinedProjects)
    },
    
    // 显示用的团队规模（同步获取，优先使用缓存）
    getTeamSizeDisplay(project) {
      // 优先使用已设置的 memberCount 或 teamSize
      if (project.memberCount) return project.memberCount
      if (project.teamSize) return project.teamSize
      
      // 从缓存读取（同步，快速）
      try {
        const cached = localStorage.getItem(`project_member_count_${project.id}`)
        const cachedNum = cached ? parseInt(cached, 10) : NaN
        if (!isNaN(cachedNum) && cachedNum > 0) {
          return cachedNum
        }
      } catch (e) {}
      
      // 兜底
      return 1
    },
    
    /**
     * 获取团队规模（和项目广场使用相同的方法）
     * 优先级：1. 缓存 2. API 获取 3. 项目对象中的值 4. 兜底返回 1
     */
    async getTeamSize(projectIdOrProject) {
      // 支持传入 projectId 或 project 对象
      const projectId = typeof projectIdOrProject === 'object' ? projectIdOrProject.id : projectIdOrProject
      const project = typeof projectIdOrProject === 'object' ? projectIdOrProject : null
      
      if (!projectId) {
        // 如果没有 projectId，尝试从 project 对象获取
        if (project) {
          if (project.teamSize) return project.teamSize
          if (project.memberCount) return project.memberCount
          if (project.team && Array.isArray(project.team)) return project.team.length
        }
        return 1
      }
      
      // 1) 优先从缓存读取（由 ProjectDetail、ProjectSquare 或 ProjectKnowledge 写入）
      try {
        const cached = localStorage.getItem(`project_member_count_${projectId}`)
        const cachedNum = cached ? parseInt(cached, 10) : NaN
        if (!isNaN(cachedNum) && cachedNum > 0) {
          console.log(`从缓存读取项目 ${projectId} 的团队成员数量:`, cachedNum)
          return cachedNum
        }
      } catch (e) {
        console.warn('读取团队成员数量缓存失败:', e)
      }
      
      // 2) 缓存没有，调用 API 获取
      try {
        console.log('从API获取项目', projectId, '的团队成员数量')
        const response = await projectAPI.getProjectMembers(projectId, 0, 1000)
        
        if (response && response.code === 200) {
          let memberCount = 0
          if (response.data && response.data.content) {
            // Spring Data Page对象
            memberCount = response.data.content.length
          } else if (Array.isArray(response.data)) {
            // 直接返回数组
            memberCount = response.data.length
          }
          
          // 写入缓存，供后续使用
          if (memberCount > 0) {
            try {
              localStorage.setItem(`project_member_count_${projectId}`, String(memberCount))
              console.log(`✅ 已缓存项目 ${projectId} 的团队成员数量:`, memberCount)
            } catch (e) {
              console.warn('写入成员数量缓存失败:', e?.message || e)
            }
          }
          
          return memberCount > 0 ? memberCount : 1
        }
      } catch (error) {
        console.warn(`获取项目 ${projectId} 成员数量失败:`, error)
      }
      
      // 3) API 失败，尝试从 project 对象获取
      if (project) {
        if (project.memberCount) return project.memberCount
        if (project.teamSize) return project.teamSize
        if (project.team && Array.isArray(project.team)) return project.team.length
      }
      
      // 4) 兜底返回 1
      return 1
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
