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
              <img 
                v-if="project.image" 
                :src="project.image" 
                :alt="project.title" 
                class="project-image"
                @error="handleImageError($event, project)"
              />
              <span v-else class="placeholder-text">{{ project.title }}</span>
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
                  <span class="meta-value">{{ project.creatorName || '未知用户' }}</span>
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
import { normalizeProjectCoverUrl, normalizeImageUrl } from '@/utils/imageUtils'
import '@/assets/styles/ProjectSquare.css'

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
      projects: [],
      showModal: false,
      modalMessage: '',
      isLoading: true, // 添加加载状态
      showToast: false,
      toastMessage: '',
      saveStateTimer: null // 防抖定时器
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
  watch: {
    searchText: {
      handler(newVal) {
        // 搜索文本改变时，重置到第一页并保存状态
        if (this.currentPage !== 1) {
          this.currentPage = 1
        }
        // 使用防抖，避免频繁保存
        this.debounceSaveState()
      }
    }
  },
  mounted() {
    // 清理旧的图片 URL（包含 localhost 的错误 URL）
    this.cleanupOldImageUrls()
    
    // 检查是否刚从项目详情页返回
    if (this.shouldRestoreState()) {
      // 从项目详情页返回，恢复状态
      this.restorePageState()
      // 清除标记
      this.clearReturnFromDetailFlag()
    } else {
      // 从其他页面进入，重置到第一页
      this.currentPage = 1
      this.searchText = ''
      this.selectedStatus = ''
    }
    
    this.loadProjects()
    document.addEventListener('click', this.handleClickOutside)
  },
  activated() {
    // 当页面被激活时（从其他页面返回），优先显示缓存，后台更新
    // 这样可以快速显示，同时获取最新数据
    
    // 检查是否刚从项目详情页返回
    if (this.shouldRestoreState()) {
      // 从项目详情页返回，恢复状态
      this.restorePageState()
      // 清除标记
      this.clearReturnFromDetailFlag()
    } else {
      // 从其他页面进入，重置到第一页
      this.currentPage = 1
      this.searchText = ''
      this.selectedStatus = ''
    }
    
    if (this.projects.length === 0) {
      // 如果没有数据，先加载缓存
      this.loadProjectsFromLocalStorage()
    }
    // 后台静默更新数据
    this.loadProjects(true) // 传入true表示后台更新模式
  },
  beforeRouteLeave(to, from, next) {
    // 保存页面状态（离开前）
    // 只有前往项目详情页时才保存状态并设置标记
    if (to.path && to.path.includes('/project-detail/')) {
      this.savePageState()
      this.setReturnFromDetailFlag()
    }
    next()
  },
  beforeDestroy() {
    // 清除防抖定时器
    if (this.saveStateTimer) {
      clearTimeout(this.saveStateTimer)
    }
    // 保存页面状态（组件销毁前）
    this.savePageState()
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    /**
     * 清理 localStorage 中包含错误 URL 的旧数据
     * 主要清理包含 localhost:9000 的图片 URL
     */
    cleanupOldImageUrls() {
      try {
        const savedProjects = localStorage.getItem('projects')
        if (!savedProjects) return
        
        const projects = JSON.parse(savedProjects)
        let needsCleanup = false
        
        // 检查是否有包含 localhost 的 URL
        const hasLocalhost = projects.some(p => {
          const url = p.image || p.imageUrl
          return url && (url.includes('localhost:9000') || url.includes('localhost'))
        })
        
        if (hasLocalhost) {
          console.log('🧹 检测到旧的图片 URL，正在清理...')
          
          // 清理所有包含 localhost 的 URL
          const cleanedProjects = projects.map(project => {
            let imageUrl = project.imageUrl || project.image
            
            if (imageUrl && imageUrl.includes('localhost')) {
              console.log(`清理项目 ${project.id} (${project.name || project.title}) 的图片 URL:`, imageUrl)
              imageUrl = null
              needsCleanup = true
            }
            
            return {
              ...project,
              image: imageUrl,
              imageUrl: imageUrl
            }
          })
          
          if (needsCleanup) {
            localStorage.setItem('projects', JSON.stringify(cleanedProjects))
            console.log('✅ 已清理包含错误 URL 的项目数据')
          }
        }
      } catch (error) {
        console.error('清理旧数据失败:', error)
        // 如果清理失败，不影响正常功能
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
    handleClickOutside(event) {
      if (!event.target.closest('.dropdown')) {
        this.statusOpen = false
      }
    },
    async loadProjects(backgroundUpdate = false) {
      // 如果不是后台更新模式，先尝试从缓存加载
      if (!backgroundUpdate) {
        const cachedProjects = localStorage.getItem('projects')
        if (cachedProjects) {
          try {
            const projects = JSON.parse(cachedProjects)
            const publicProjects = projects.filter(p => p.visibility === 'PUBLIC')
            if (publicProjects.length > 0) {
              // 先显示缓存数据
              this.projects = publicProjects.map(project => ({
                ...project,
                status: this.getStatusDisplay(project.status),
                image: normalizeProjectCoverUrl(project.image || project.imageUrl),
                imageUrl: normalizeProjectCoverUrl(project.imageUrl || project.image)
              }))
              this.isLoading = false
              // 后台更新数据
              setTimeout(() => this.loadProjects(true), 100)
              return
            }
          } catch (e) {
            // 缓存读取失败，继续从API加载
          }
        }
      }
      
      // 如果是后台更新或没有缓存，才显示loading
      if (!backgroundUpdate) {
        this.isLoading = true
      }
      
      try {
        // 从后端API加载公开项目
        const { projectAPI } = await import('@/api/project')
        
        const response = await projectAPI.getPublicActiveProjects(0, 100) // 获取前100个公开项目
        
        if (response && response.code === 200) {
          // 处理后端返回的分页数据
          let backendProjects = []
          if (response.data && response.data.content) {
            // Spring Data Page对象
            backendProjects = response.data.content
          } else if (Array.isArray(response.data)) {
            // 直接返回数组
            backendProjects = response.data
          } else {
            backendProjects = []
          }
          
          // 获取localStorage中的旧项目数据（如果有的话）
          const savedProjects = localStorage.getItem('projects')
          const localProjects = savedProjects ? JSON.parse(savedProjects) : []
          
          // 转换后端数据格式为前端格式，并合并localStorage中的图片数据
          this.projects = backendProjects
            .map(project => {
              // 查找localStorage中对应的项目
              const localProject = localProjects.find(p => String(p.id) === String(project.id))
              
              // 优先使用后端的imageUrl，如果后端没有但localStorage有，则使用localStorage的
              let imageUrl = project.imageUrl || (localProject && localProject.imageUrl) || null
              
              // 规范化图片 URL（转换为完整的 MinIO URL）
              imageUrl = normalizeProjectCoverUrl(imageUrl)
              
              // 调试日志已移除以提升性能（仅在开发环境需要时启用）
              // console.log(`项目 ${project.id} 图片URL处理:`, {...})
              // console.log('项目成员字段检查:', project.id, {...})

              return {
                id: project.id,
                name: project.name,
                title: project.name, // 前端显示用title
                description: project.description || '暂无描述',
                status: this.getStatusDisplay(project.status),
                visibility: project.visibility,
                // 规范化后的团队人数（尽可能从后端字段解析）
                teamSize: this.getNumericMemberCount(project) || 1,
                dataAssets: project.description || '暂无描述',
                direction: project.description || '暂无描述',
                aiCore: '待定',
                category: project.category || '其他',
                tags: project.tags || [],
                image: imageUrl,
                imageUrl: imageUrl,
                startDate: project.startDate,
                endDate: project.endDate,
                start_date: project.startDate,
                end_date: project.endDate,
                created_by: project.creatorId,
                creatorId: project.creatorId,
                creatorName: project.creatorName || '神秘用户', // 添加创建者名称
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                // 保留localStorage中的其他数据（如任务、团队成员等）
                tasks: localProject?.tasks || [],
                // 如果后端返回成员列表/数量，则优先使用
                teamMembers: (
                  project.teamMembers ||
                  project.members ||
                  project.participants ||
                  project.users ||
                  project.userList ||
                  localProject?.teamMembers ||
                  []
                ),
                inviteSlots: localProject?.inviteSlots || []
              }
            })
            .filter(project => {
              // 只保留公开项目，记录被过滤的私有项目
              if (project.visibility !== 'PUBLIC') {
                console.warn('过滤掉非公开项目:', project.id, project.name, '可见性:', project.visibility)
                return false
              }
              return true
            })
          
          // 只在非后台更新模式下输出日志
          if (!backgroundUpdate) {
            console.log('转换后的项目数量:', this.projects.length)
          }
          
          // 先使用缓存或默认值显示项目列表，不阻塞UI
          this.projects.forEach(project => {
            // 尝试从缓存读取成员数量
            try {
              const cached = localStorage.getItem(`project_member_count_${project.id}`)
              if (cached) {
                const cachedCount = parseInt(cached, 10)
                if (!isNaN(cachedCount) && cachedCount > 0) {
                  project.memberCount = cachedCount
                  project.teamSize = cachedCount
                }
              }
            } catch (e) {
              // 忽略缓存读取错误
            }
          })
          
          // 保存合并后的数据到localStorage（先保存，不等待成员数量）
          localStorage.setItem('projects', JSON.stringify(this.projects))
          
          // 如果不是后台更新模式，立即显示列表
          if (!backgroundUpdate) {
            this.isLoading = false
          }
          
          // 后台延迟加载成员数量（不阻塞UI显示）
          // 使用 setTimeout 确保UI先渲染
          setTimeout(async () => {
            const memberCountPromises = this.projects.map(async (project) => {
              try {
                const memberResponse = await projectAPI.getProjectMembers(project.id, 0, 100) // 只获取前100个即可统计数量
                let memberCount = 0
                
                if (memberResponse && memberResponse.code === 200) {
                  if (memberResponse.data && memberResponse.data.content) {
                    // Spring Data Page对象
                    memberCount = memberResponse.data.totalElements || memberResponse.data.content.length
                  } else if (Array.isArray(memberResponse.data)) {
                    memberCount = memberResponse.data.length
                  } else if (memberResponse.data && typeof memberResponse.data.totalElements === 'number') {
                    // 如果有总数字段，直接使用
                    memberCount = memberResponse.data.totalElements
                  }
                }
                
                // 更新项目的成员数量（响应式更新）
                if (memberCount > 0) {
                  const projectIndex = this.projects.findIndex(p => p.id === project.id)
                  if (projectIndex !== -1) {
                    this.$set(this.projects[projectIndex], 'memberCount', memberCount)
                    this.$set(this.projects[projectIndex], 'teamSize', memberCount)
                    
                    // 更新缓存
                    try {
                      localStorage.setItem(`project_member_count_${project.id}`, String(memberCount))
                    } catch (e) {
                      // 忽略缓存写入错误
                    }
                  }
                }
              } catch (error) {
                // 静默失败，不影响UI显示
                console.debug(`获取项目 ${project.id} 成员数量失败:`, error)
              }
            })
            
            // 并行获取，但不等待所有完成（使用 Promise.allSettled 避免单个失败影响整体）
            await Promise.allSettled(memberCountPromises)
          }, backgroundUpdate ? 0 : 100) // 后台更新时立即开始，否则延迟100ms
          
          // 如果是后台更新，不显示日志
          if (!backgroundUpdate) {
            console.log('====== 项目加载完成，显示', this.projects.length, '个公开项目 ======')
          }
        } else {
          console.error('获取公开项目失败，code:', response?.code, 'msg:', response?.msg)
          // 失败时从localStorage加载（只在非后台更新模式下）
          if (!backgroundUpdate) {
            this.loadProjectsFromLocalStorage()
          }
        }
      } catch (error) {
        console.error('====== 加载项目失败 ======', error)
        // 发生错误时从localStorage加载（只在非后台更新模式下）
        if (!backgroundUpdate) {
          this.loadProjectsFromLocalStorage()
        }
      } finally {
        if (!backgroundUpdate) {
          this.isLoading = false
        }
      }
    },
    
    loadProjectsFromLocalStorage() {
      console.log('从localStorage加载项目数据...')
      const savedProjects = localStorage.getItem('projects')
      if (savedProjects) {
        const allProjects = JSON.parse(savedProjects)
        // 只保留公开项目，并确保状态正确转换和图片URL规范化
        this.projects = allProjects.filter(project => {
          if (project.visibility !== 'PUBLIC') {
            console.warn('从localStorage过滤掉非公开项目:', project.id, project.name || project.title, '可见性:', project.visibility)
            return false
          }
          return true
        }).map(project => {
          // 规范化图片 URL
          const normalizedImageUrl = normalizeProjectCoverUrl(project.image || project.imageUrl)
          
          return {
            ...project,
            status: this.getStatusDisplay(project.status), // 确保状态正确转换
            image: normalizedImageUrl,
            imageUrl: normalizedImageUrl
          }
        })
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
    // 将后端的各种人数字段标准化为数字
    getNumericMemberCount(project) {
      const candidates = [
        'memberCount', 'teamMemberCount', 'membersCount',
        'participantCount', 'participantsCount',
        'memberNum', 'membersNum',
        'memberSize', 'membersSize',
        'userCount', 'usersCount',
        'teamSize'
      ]
      for (const key of candidates) {
        if (project && project[key] !== undefined && project[key] !== null) {
          const n = typeof project[key] === 'string' ? parseInt(project[key], 10) : project[key]
          if (!isNaN(n) && n > 0) return n
        }
      }
      return undefined
    },
    statusClass(status) {
      if (status === '进行中') return 'ongoing'
      if (status === '已完成') return 'done'
      return 'steady'
    },
    getTeamSize(project) {
      // 0) 优先读取项目详情缓存的人数（由 ProjectDetail 写入）
      try {
        const cached = localStorage.getItem(`project_member_count_${project.id}`)
        const cachedNum = cached ? parseInt(cached, 10) : NaN
        if (!isNaN(cachedNum) && cachedNum > 0) return cachedNum
      } catch (e) {}

      // 1) 其次使用后端直接返回的数字字段（尽量兼容）
      const numeric = (
        project.memberCount ||
        project.teamMemberCount ||
        project.membersCount ||
        project.participantCount ||
        project.participantsCount ||
        project.memberNum ||
        project.membersNum ||
        project.teamSize
      )
      if (typeof numeric === 'number' && !isNaN(numeric) && numeric > 0) {
        return numeric
      }
      // 2) 再使用成员数组长度
      if (Array.isArray(project.teamMembers) && project.teamMembers.length > 0) {
        return project.teamMembers.length
      }
      if (Array.isArray(project.members) && project.members.length > 0) {
        return project.members.length
      }
      if (Array.isArray(project.participants) && project.participants.length > 0) {
        return project.participants.length
      }
      if (Array.isArray(project.users) && project.users.length > 0) {
        return project.users.length
      }
      if (Array.isArray(project.userList) && project.userList.length > 0) {
        return project.userList.length
      }
      // 3) 兜底
      return 1
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
      this.savePageState() // 保存状态
    },
    resetFilters() {
      this.searchText = ''
      this.selectedStatus = ''
      this.currentPage = 1
      this.savePageState() // 保存状态
    },
    /**
     * 处理图片加载错误
     * 当图片加载失败时，隐藏图片显示渐变背景
     */
    handleImageError(event, project) {
      console.warn(`项目图片加载失败: ${project.title}, URL:`, project.image)
      // 隐藏失败的图片，显示渐变背景和项目名称
      event.target.style.display = 'none'
      // 清空project.image，让v-else生效
      this.$set(project, 'image', null)
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
      if (this.currentPage > 1) {
        this.currentPage--
        this.savePageState() // 保存状态
      }
    },
    goNext() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.savePageState() // 保存状态
      }
    },
    goPage(p) {
      this.currentPage = p
      this.savePageState() // 保存状态
    },
    savePageState() {
      // 保存当前页面状态到 localStorage
      try {
        const pageState = {
          currentPage: this.currentPage,
          searchText: this.searchText,
          selectedStatus: this.selectedStatus,
          timestamp: Date.now()
        }
        localStorage.setItem('project_square_state', JSON.stringify(pageState))
      } catch (e) {
        // 忽略保存错误
      }
    },
    restorePageState() {
      // 从 localStorage 恢复页面状态
      try {
        const savedState = localStorage.getItem('project_square_state')
        if (savedState) {
          const pageState = JSON.parse(savedState)
          // 检查状态是否过期（30分钟）
          if (pageState.timestamp && Date.now() - pageState.timestamp < 30 * 60 * 1000) {
            if (pageState.currentPage) {
              this.currentPage = pageState.currentPage
            }
            if (pageState.searchText !== undefined) {
              this.searchText = pageState.searchText
            }
            if (pageState.selectedStatus !== undefined) {
              this.selectedStatus = pageState.selectedStatus
            }
          }
        }
      } catch (e) {
        // 忽略恢复错误
      }
    },
    debounceSaveState() {
      // 清除之前的定时器
      if (this.saveStateTimer) {
        clearTimeout(this.saveStateTimer)
      }
      // 设置新的定时器，500ms后保存
      this.saveStateTimer = setTimeout(() => {
        this.savePageState()
      }, 500)
    },
    setReturnFromDetailFlag() {
      // 设置标记，表示即将进入项目详情页（包含时间戳）
      try {
        localStorage.setItem('project_square_from_detail', JSON.stringify({
          flag: true,
          timestamp: Date.now()
        }))
      } catch (e) {
        // 忽略错误
      }
    },
    shouldRestoreState() {
      // 检查是否应该恢复状态（刚从项目详情页返回）
      // 标记在5分钟内有效，避免刷新页面时的误判
      try {
        const flagData = localStorage.getItem('project_square_from_detail')
        if (flagData) {
          const data = JSON.parse(flagData)
          // 检查标记是否在有效期内（5分钟）
          if (data.flag && data.timestamp && Date.now() - data.timestamp < 5 * 60 * 1000) {
            return true
          } else {
            // 标记已过期，清除
            this.clearReturnFromDetailFlag()
          }
        }
        return false
      } catch (e) {
        return false
      }
    },
    clearReturnFromDetailFlag() {
      // 清除标记
      try {
        localStorage.removeItem('project_square_from_detail')
      } catch (e) {
        // 忽略错误
      }
    },
    viewProjectDetail(project) {
      // 保存页面状态（进入详情页前）
      this.savePageState()
      // 设置标记，表示即将进入项目详情页
      this.setReturnFromDetailFlag()
      
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

