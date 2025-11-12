<template>
  <div class="my-activity-container">
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
        <button class="back-btn" @click="goToHome" title="返回首页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">我的活动</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content-wrapper">
      <!-- 顶部欢迎条已移除，减少首屏占用 -->

      <!-- 2.（对调后）任务统计（全宽） -->
      <section class="review-panel-section">
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">任务统计</h3>
          </div>
          <div class="stats-content">
            <div v-if="isLoadingStats" class="loading-overlay">
              <div class="loading-spinner small"></div>
            </div>
            <!-- 高级仪表盘：左侧总览（环形+迷你仪表），右侧趋势 -->
            <div class="dashboard-pro">
              <div class="card-overview">
                <div class="card-header-row">
                  <h4 class="chart-title">总览</h4>
                  <div class="kpi-group">
                    <span class="kpi-badge kpi-pending">待处理 {{ taskStats.pending || 0 }}</span>
                    <span class="kpi-badge kpi-progress">进行中 {{ taskStats.inProgress || 0 }}</span>
                    <span class="kpi-badge kpi-done">已完成 {{ taskStats.completed || 0 }}</span>
                  </div>
                </div>
                <div class="overview-grid">
                  <div class="overview-left">
                    <div ref="pieStatus" class="chart-box medium"></div>
                    <div class="status-summary">
                      <div 
                        v-for="item in statusBreakdown" 
                        :key="item.key"
                        class="status-item"
                      >
                        <span class="status-dot" :style="{ background: item.color }"></span>
                        <span class="status-name">{{ item.label }}</span>
                        <span class="status-count">{{ item.value }}</span>
                        <span class="status-percent">{{ item.percent }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="overview-right">
                    <div class="mini-gauge">
                      <div class="mini-title">待处理</div>
                      <div ref="gaugePending" class="chart-box tiny"></div>
                    </div>
                    <div class="mini-gauge">
                      <div class="mini-title">进行中</div>
                      <div ref="gaugeInProgress" class="chart-box tiny"></div>
                    </div>
                    <div class="mini-gauge">
                      <div class="mini-title">已完成</div>
                      <div ref="gaugeCompleted" class="chart-box tiny"></div>
                    </div>
                    <div class="mini-bar">
                      <div class="mini-title">优先级分布</div>
                      <div ref="barPriority" class="chart-box small"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-trend">
                <h4 class="chart-title">过去七天完成趋势</h4>
                <div ref="lineTrend" class="chart-box large"></div>
                <h4 class="chart-title">过去七天逾期任务</h4>
                <div ref="barOverdue" class="chart-box small"></div>
              </div>
            </div>

            <!-- 即将到期的关键节点 -->
            <div class="upcoming-milestones">
              <h4 class="chart-title">即将到期</h4>
              <div class="milestones-list">
                <div 
                  v-for="milestone in upcomingMilestones" 
                  :key="milestone.id"
                  class="milestone-item"
                >
                  <div class="milestone-info">
                    <span class="milestone-name">{{ milestone.title }}</span>
                    <span class="milestone-countdown">{{ getCountdown(milestone.dueDate || milestone.due_date) }}</span>
                  </div>
                </div>
                <div v-if="upcomingMilestones.length === 0" class="empty-milestones">
                  <p>暂无即将到期的任务</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 个人工作仪表盘 -->
      <section class="dashboard-section">
        <div class="dashboard-grid">
          <!-- 左侧：项目总览图表 -->
          <div class="dashboard-card projects-overview">
            <div class="card-header">
              <h3 class="card-title">项目总览</h3>
            </div>
            <div v-if="isLoadingProjects" class="loading-state">
              <div class="loading-spinner small"></div>
            </div>
            <div v-else-if="projects.length === 0" class="empty-state small">
              <p>暂无参与项目</p>
            </div>
            <div v-else class="projects-list">
              <div 
                v-for="project in projects" 
                :key="project.id"
                class="project-item"
                @click="goToProject(project.id)"
              >
                <div class="project-info">
                  <div class="project-header">
                    <h4 class="project-name">{{ project.title }}</h4>
                    <span class="project-status-badge" :class="'status-' + project.status">
                      {{ getProjectStatusText(project.status) }}
                    </span>
                  </div>
                  <div class="project-progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: (project.progress || 0) + '%' }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ project.progress || 0 }}%</span>
                  </div>
                </div>
                <div class="project-link" @click.stop="goToProject(project.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧（对调后）：待审核任务 -->
          <div class="dashboard-card task-statistics">
            <div class="card-header">
              <div class="card-header-top">
                <h3 class="card-title">待审核任务</h3>
                <div class="review-mode-toggle">
                  <button 
                    class="toggle-btn" 
                    :class="{ active: reviewMode === 'to-review' }"
                    @click="switchReviewMode('to-review')"
                  >
                    我审核的任务
                  </button>
                  <button 
                    class="toggle-btn" 
                    :class="{ active: reviewMode === 'my-submissions' }"
                    @click="switchReviewMode('my-submissions')"
                  >
                    我被审核的任务
                  </button>
                </div>
              </div>
              <div class="section-controls">
                <select v-model="sortBy" class="sort-select" @change="loadPendingTasks">
                  <option value="project">按项目分类</option>
                  <option value="priority">按优先级</option>
                  <option value="dueDate">按截止时间</option>
                </select>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="showOverdueOnly" @change="loadPendingTasks">
                  <span>仅看逾期项</span>
                </label>
              </div>
            </div>
            <div class="task-list-container">
              <div v-if="isLoadingTasks" class="loading-state">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
              </div>
              <div v-else-if="pendingTasks.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>{{ reviewMode === 'to-review' ? '暂无待审核任务' : '暂无待审核的提交' }}</p>
              </div>
              <div v-else class="task-cards-list">
                <div 
                  v-for="task in pendingTasks" 
                  :key="task.id"
                  class="task-card-clean"
                  :class="getTaskUrgencyClass(task)"
                >
                  <div class="task-status-bar" :class="getUrgencyClass(task)"></div>
                  <div class="task-content">
                    <div class="task-header">
                      <h4 class="task-title">{{ task.taskTitle || task.title || '未命名任务' }}</h4>
                      <span class="task-status-badge" :class="'status-' + (task.status || task.taskStatus || 'UNKNOWN')">
                        {{ getStatusText(task.status || task.taskStatus) }}
                      </span>
                    </div>
                    <p class="task-description" v-if="task.description || task.taskDescription">
                      {{ task.description || task.taskDescription }}
                    </p>
                    <div class="task-details">
                      <div class="meta-line">
                        <span class="meta-pair">
                          <span class="meta-label">提交人：</span>
                          <span class="meta-value">{{ getSubmitterName(task) }}</span>
                        </span>
                        <span class="meta-sep">·</span>
                        <span class="meta-pair">
                          <span class="meta-label">项目：</span>
                          <span class="meta-value">{{ task.projectName || '未知项目' }}</span>
                        </span>
                        <span class="meta-sep">·</span>
                        <span class="meta-pair">
                          <span class="meta-label">截止时间：</span>
                          <span class="meta-value" :class="getDueDateClass(task)">
                            {{ formatDueDate(task.dueDate || task.due_date || task.taskDueDate) }}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="task-actions">
                    <button 
                      class="action-btn-review"
                      @click="openReviewModal(task)"
                      v-if="reviewMode === 'to-review' && isProjectManager(task)"
                    >
                      审核
                    </button>
                    <span v-else-if="reviewMode === 'my-submissions'" class="review-status-text">
                      {{ getReviewStatusText(task) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. 个人操作日志展示区 -->
      <section class="activity-log-section">
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">操作日志</h3>
            <div class="section-controls">
              <input 
                type="text" 
                v-model="logSearchKeyword" 
                placeholder="搜索日志..."
                class="search-input"
                @input="filterActivityLogs"
              >
              <select v-model="logFilterType" class="filter-select" @change="filterActivityLogs">
                <option value="all">全部类型</option>
                <option value="submission">任务提交</option>
                <option value="upload">成果上传</option>
                <option value="comment">评论回复</option>
                <option value="review">审核操作</option>
              </select>
            </div>
          </div>
          <div v-if="isLoadingLogs" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <div v-else-if="filteredActivityLogs.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6V12L16 14" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>暂无操作记录</p>
          </div>
          <div v-else class="activity-timeline" @scroll="handleLogScroll">
            <div 
              v-for="log in filteredActivityLogs" 
              :key="log.id"
              class="timeline-item"
            >
              <div class="timeline-dot" :class="'type-' + log.type"></div>
              <div class="timeline-content">
                <div class="log-header">
                  <span class="log-type">{{ getLogTypeText(log.type) }}</span>
                  <span class="log-time">{{ formatDateTime(log.timestamp || log.createdAt) }}</span>
                </div>
                <p class="log-description">{{ log.description || log.content }}</p>
                <div class="log-target" v-if="log.targetName">
                  <span class="target-label">关联对象：</span>
                  <span class="target-name">{{ log.targetName }}</span>
                </div>
              </div>
            </div>
            <div v-if="hasMoreLogs" class="load-more" @click="loadMoreLogs">
              <span>加载更多</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 审核弹窗 -->
    <TaskSubmissionReviewModal
      :visible.sync="reviewModalVisible"
      :submission="selectedSubmission || {}"
      :active-tab="'pending-for-review'"
      @close="closeReviewModal"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import TaskSubmissionReviewModal from '@/components/TaskSubmissionReviewModal.vue'
import { 
  getPendingSubmissionsForReview,
  getMySubmissions,
  getMyPendingSubmissions
} from '@/api/taskSubmission'
import { taskAPI } from '@/api/task'
import { projectAPI } from '@/api/project'

export default {
  name: 'MyActivity',
  components: {
    Sidebar,
    TaskSubmissionReviewModal
  },
  beforeDestroy() {
    // 销毁图表与事件
    if (this._charts) {
      Object.values(this._charts).forEach(c => c && c.dispose && c.dispose())
    }
    window.removeEventListener('resize', this.resizeCharts)
  },
  data() {
    return {
      // 侧边栏状态
      sidebarOpen: false,
      
      // 用户信息
      userName: '用户',
      
      // 任务审核面板
      pendingTasks: [],
      isLoadingTasks: false,
      sortBy: 'dueDate',
      showOverdueOnly: false,
      reviewMode: 'to-review', // 'to-review': 我审核的任务, 'my-submissions': 我被审核的任务
      
      // 项目总览
      projects: [],
      isLoadingProjects: false,
      
      // 任务统计
      taskStats: {
        pending: 0,
        inProgress: 0,
        completed: 0
      },
      isLoadingStats: false,
      upcomingMilestones: [],
      
      // 操作日志
      activityLogs: [],
      filteredActivityLogs: [],
      isLoadingLogs: false,
      logSearchKeyword: '',
      logFilterType: 'all',
      logPage: 0,
      logPageSize: 20,
      hasMoreLogs: true,
      
      // 审核弹窗
      reviewModalVisible: false,
      selectedSubmission: null
    }
  },
  computed: {
    maxTaskCount() {
      return Math.max(
        this.taskStats.pending || 0,
        this.taskStats.inProgress || 0,
        this.taskStats.completed || 0,
        1
      )
    },
    statusBreakdown() {
      const total =
        (this.taskStats.pending || 0) +
        (this.taskStats.inProgress || 0) +
        (this.taskStats.completed || 0)
      const palette = ['#8AB4F8', '#7DD3A8', '#FBBF83']
      const items = [
        { key: 'pending', label: '待处理', value: this.taskStats.pending || 0, color: palette[0] },
        { key: 'inProgress', label: '进行中', value: this.taskStats.inProgress || 0, color: palette[1] },
        { key: 'completed', label: '已完成', value: this.taskStats.completed || 0, color: palette[2] }
      ]
      return items.map((item) => ({
        ...item,
        percent: total > 0 ? Math.round((item.value / total) * 100) : 0
      }))
    }
  },
  mounted() {
    this.applySampleTaskStats()
    this.initPage()
  },
  methods: {
    async applySampleTaskStats() {
      const sample = this.getSampleStats()
      this.taskStats.pending = sample.pending
      this.taskStats.inProgress = sample.inProgress
      this.taskStats.completed = sample.completed
      this.taskStats.high = sample.high
      this.taskStats.medium = sample.medium
      this.taskStats.low = sample.low
      this.upcomingMilestones = sample.milestones

      await this.$nextTick()
      await this.ensureChartsInitialized()
      if (window.echarts) this.updateCharts(window.echarts)
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
    
    async ensureChartsInitialized() {
      // 确保 DOM 已渲染
      await this.$nextTick()
      // 已初始化则跳过
      if (this._charts && this._charts.gaugePending) return
      // 加载并初始化
      const echarts = await this.loadECharts().catch(() => null)
      if (!echarts) return
      this.initCharts(echarts)
    },
    async loadECharts() {
      if (window.echarts) return window.echarts
      const cdns = [
        'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js',
        'https://unpkg.com/echarts@5/dist/echarts.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js'
      ]
      for (let i = 0; i < cdns.length; i++) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = cdns[i]
            s.async = true
            s.onload = () => resolve()
            s.onerror = () => {
              s.remove()
              reject(new Error('cdn failed'))
            }
            document.head.appendChild(s)
          })
          if (window.echarts) return window.echarts
        } catch (e) {
          // 尝试下一个CDN
        }
      }
      throw new Error('ECharts CDN 加载失败')
    },

    async initPage() {
      this.loadUserInfo()
      // 并行加载所有数据，不等待图表初始化
      await Promise.all([
        this.loadPendingTasks(),
        this.loadProjects(),
        this.loadTaskStatistics(), // 内部已处理ECharts加载
        this.loadActivityLogs()
      ])
    },
    
    loadUserInfo() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
        this.userName = userInfo.nickname || userInfo.name || '用户'
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
    
    
    
    switchReviewMode(mode) {
      if (this.reviewMode !== mode) {
        this.reviewMode = mode
        this.loadPendingTasks()
      }
    },
    
    async loadPendingTasks() {
      this.isLoadingTasks = true
      try {
        let response
        if (this.reviewMode === 'to-review') {
          // 我审核的任务（别人提交的，需要我审核的）
          response = await getPendingSubmissionsForReview({
            page: 0,
            size: 50
          })
        } else {
          // 我被审核的任务（我提交的，等待别人审核的）
          response = await getMyPendingSubmissions({
            page: 0,
            size: 50
          })
        }
        
        if (response.code === 200) {
          let tasks = response.data.content || []
          
          // 过滤逾期项
          if (this.showOverdueOnly) {
            const now = new Date()
            tasks = tasks.filter(task => {
              const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
              return dueDate < now
            })
          }
          
          // 排序
          tasks = this.sortTasks(tasks, this.sortBy)
          
          this.pendingTasks = tasks
        }

        // 如果没有任何任务，填充示例数据以便先看到样式
        if (!this.pendingTasks || this.pendingTasks.length === 0) {
          this.pendingTasks = this.getSamplePendingTasks()
        }
      } catch (error) {
        console.error('加载待审核任务失败:', error)
        // 异常时使用示例数据
        this.pendingTasks = this.getSamplePendingTasks()
      } finally {
        this.isLoadingTasks = false
      }
    },
    
    sortTasks(tasks, sortBy) {
      const sorted = [...tasks]
      switch (sortBy) {
        case 'project':
          return sorted.sort((a, b) => {
            const nameA = (a.projectName || '').localeCompare(b.projectName || '')
            return nameA
          })
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          return sorted.sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 0
            const priorityB = priorityOrder[b.priority] || 0
            return priorityB - priorityA
          })
        case 'dueDate':
        default:
          return sorted.sort((a, b) => {
            const dateA = new Date(a.dueDate || a.due_date || a.taskDueDate || 0)
            const dateB = new Date(b.dueDate || b.due_date || b.taskDueDate || 0)
            return dateA - dateB
          })
      }
    },
    
    getTaskUrgencyClass(task) {
      const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'overdue'
      if (diffDays <= 3) return 'urgent'
      return 'normal'
    },
    
    getUrgencyClass(task) {
      const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'red'
      if (diffDays <= 3) return 'orange'
      return 'blue'
    },
    
    getStatusText(status) {
      const statusMap = {
        'PENDING': '未开始',
        'IN_PROGRESS': '进行中',
        'DONE': '已完成',
        'REVIEWING': '待审核'
      }
      return statusMap[status] || status || '未知'
    },
    
    getDueDateClass(task) {
      const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
      if (isNaN(dueDate.getTime())) return ''
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return 'overdue-text'
      if (diffDays <= 3) return 'urgent-text'
      return ''
    },
    
    getSubmitterName(task) {
      if (task.submitter) {
        return task.submitter.name || task.submitter.username || task.submitter.nickname || '未知'
      }
      return task.submitterName || '未知'
    },
    
    formatDueDate(dateStr) {
      if (!dateStr) return '无截止日期'
      const date = new Date(dateStr)
      const now = new Date()
      const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`
      if (diffDays === 0) return '今天到期'
      if (diffDays === 1) return '明天到期'
      if (diffDays <= 7) return `${diffDays} 天后到期`
      
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    },
    
    isProjectManager(task) {
      if (!task) return false
      const currentUserId = this.getCurrentUserId()
      const taskCreatorId = task.taskCreatorId || task.creatorId
      return String(taskCreatorId) === String(currentUserId)
    },
    
    getCurrentUserId() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
        return userInfo.id || userInfo.userId || userInfo.user_id || null
      } catch (error) {
        return null
      }
    },
    
    openReviewModal(task) {
      // 将任务转换为提交格式
      this.selectedSubmission = {
        ...task,
        taskTitle: task.taskTitle || task.title,
        projectName: task.projectName
      }
      this.reviewModalVisible = true
    },
    
    viewTaskDetail(task) {
      if (task.projectId || task.project_id) {
        this.$router.push(`/project-detail/${task.projectId || task.project_id}`)
      }
    },
    
    closeReviewModal() {
      this.reviewModalVisible = false
      this.selectedSubmission = null
    },
    
    async handleReviewSuccess() {
      this.loadPendingTasks()
      this.loadTaskStatistics()
      this.loadActivityLogs()
    },
    
    async loadProjects() {
      this.isLoadingProjects = true
      try {
        // 加载更多数量，与首页数据源一致但不做数量限制
        const pageSize = 100
        let page = 0
        let allProjects = []
        let hasMore = true
        
        while (hasMore) {
          const response = await projectAPI.getMyProjects(page, pageSize)
          let projects = []
  
          if (Array.isArray(response)) {
            projects = response
          } else if (response && response.data) {
            const data = response.data
            if (Array.isArray(data)) {
              projects = data
            } else if (Array.isArray(data.content)) {
              projects = data.content
              // 如果带分页信息，判断是否还有下一页
              const totalPages = data.totalPages
              if (typeof totalPages === 'number') {
                hasMore = page + 1 < totalPages
              } else {
                hasMore = projects.length === pageSize
              }
            } else if (Array.isArray(data.list)) {
              projects = data.list
              hasMore = projects.length === pageSize
            } else if (Array.isArray(data.records)) {
              projects = data.records
              hasMore = projects.length === pageSize
            } else {
              hasMore = false
            }
          } else {
            hasMore = false
          }
  
          allProjects = allProjects.concat(projects || [])
          page += 1
          
          // 安全上限，避免无限循环
          if (page > 10) {
            hasMore = false
          }
        }

        const currentUserId = this.getCurrentUserId()

        const participatedProjects = allProjects.filter(project => {
          const creatorId = project.created_by || project.creatorId || project.createdBy
          if (creatorId && String(creatorId) === String(currentUserId)) {
            return false
          }
          return true
        })

        this.projects = participatedProjects.map(project => {
          const status = this.mapProjectStatus(project.status)
          return {
            id: project.id || project.projectId || project.project_id,
            title: project.title || project.name || project.projectName || '未命名项目',
            description: project.description || project.desc || '',
            status,
            progress: this.calculateProjectProgress(status)
          }
        })
      } catch (error) {
        console.error('加载项目失败:', error)
        this.projects = []
      } finally {
        this.isLoadingProjects = false
      }
    },
    
    goToProject(projectId) {
      this.$router.push(`/project-detail/${projectId}`)
    },
    
    async loadTaskStatistics() {
      this.isLoadingStats = true
      // 提前加载ECharts，不阻塞数据加载
      const echartsPromise = this.loadECharts().catch(() => null)
      
      try {
        // 并行加载数据，不等待ECharts
        const [statsResponse, myTasksResponse] = await Promise.all([
          taskAPI.getUserTaskStatistics().catch(() => ({ code: 0 })),
          taskAPI.getMyAssignedTasks(0, 50).catch(() => ({ code: 0 }))
        ])
        
        if (statsResponse.code === 200) {
          const stats = statsResponse.data || {}
          this.taskStats = {
            pending: stats.pendingCount || 0,
            inProgress: stats.inProgressCount || 0,
            completed: stats.completedCount || 0
          }
        }
        
        if (myTasksResponse.code === 200) {
          const pageData = myTasksResponse.data
          const allTasks = (pageData && (pageData.content || pageData.list || pageData.records)) || []

          // 计算优先级分布（与首页一致的映射）
          const toPriority = (p) => {
            const map = { 'HIGH': 'high', 'MEDIUM': 'medium', 'LOW': 'low' }
            return map[p] || 'medium'
          }
          const counts = { high: 0, medium: 0, low: 0 }
          allTasks.forEach(t => { counts[toPriority(t.priority)]++ })
          this.taskStats.high = counts.high
          this.taskStats.medium = counts.medium
          this.taskStats.low = counts.low

          const now = new Date()
          const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          
          this.upcomingMilestones = allTasks
            .filter(task => {
              const dueDate = new Date(task.dueDate || task.due_date)
              return dueDate >= now && dueDate <= sevenDaysLater
            })
            .slice(0, 5)
        }

        // 如果统计数据依旧为空，填充示例统计与里程碑
        const totals = (this.taskStats.pending || 0) + (this.taskStats.inProgress || 0) + (this.taskStats.completed || 0)
        if (totals === 0) {
          const sample = this.getSampleStats()
          this.taskStats.pending = sample.pending
          this.taskStats.inProgress = sample.inProgress
          this.taskStats.completed = sample.completed
          this.taskStats.high = sample.high
          this.taskStats.medium = sample.medium
          this.taskStats.low = sample.low
          this.upcomingMilestones = sample.milestones
        }

        // 等待ECharts加载完成后初始化图表
        const echarts = await echartsPromise
        if (echarts) {
          await this.$nextTick()
          if (!this._charts || !this._charts.gaugePending) {
            this.initCharts(echarts)
          } else {
            this.updateCharts(echarts)
          }
        }
      } catch (error) {
        console.error('加载任务统计失败:', error)
        // 异常时填充示例统计
        const sample = this.getSampleStats()
        this.taskStats.pending = sample.pending
        this.taskStats.inProgress = sample.inProgress
        this.taskStats.completed = sample.completed
        this.taskStats.high = sample.high
        this.taskStats.medium = sample.medium
        this.taskStats.low = sample.low
        this.upcomingMilestones = sample.milestones
        
        const echarts = await echartsPromise
        if (echarts) {
          await this.$nextTick()
          if (!this._charts || !this._charts.gaugePending) {
            this.initCharts(echarts)
          } else {
            this.updateCharts(echarts)
          }
        }
      } finally {
        this.isLoadingStats = false
      }
    },

    getSamplePendingTasks() {
      const currentUserId = this.getCurrentUserId() || 1
      const today = new Date()
      const addDays = (n) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000).toISOString()
      return [
        { id: 'demo-1', taskTitle: '整理数据集与标签', projectName: '图像识别研究', submitter: { name: '张三' }, dueDate: addDays(1), status: 'PENDING', taskCreatorId: currentUserId },
        { id: 'demo-2', taskTitle: '搭建训练流水线', projectName: '语音识别项目', submitter: { name: '李四' }, dueDate: addDays(3), status: 'IN_PROGRESS', taskCreatorId: currentUserId },
        { id: 'demo-3', taskTitle: '撰写阶段性报告', projectName: '无人车感知', submitter: { name: '王五' }, dueDate: addDays(-1), status: 'PENDING', taskCreatorId: currentUserId },
      ]
    },

    getSampleStats() {
      const today = new Date()
      const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`
      return {
        pending: 6,
        inProgress: 11,
        completed: 9,
        high: 5,
        medium: 12,
        low: 9,
        milestones: [
          { id: 'm1', title: '提交项目周报', dueDate: new Date(today.getTime() + 1 * 86400000) },
          { id: 'm2', title: '评审数据标注方案', dueDate: new Date(today.getTime() + 2 * 86400000) },
          { id: 'm3', title: '发布 v0.2 内测版', dueDate: new Date(today.getTime() + 5 * 86400000) },
        ]
      }
    },

    initCharts(echarts) {
      this._charts = this._charts || {}

      const create = (ref, opts) => {
        const dom = this.$refs[ref]
        if (!dom) return null
        const chart = echarts.init(dom)
        chart.setOption(opts)
        return chart
      }

      const total = (this.taskStats.pending || 0) + (this.taskStats.inProgress || 0) + (this.taskStats.completed || 0)
      // 更柔和的配色（总览不刺眼）
      const palette = ['#8AB4F8', '#7DD3A8', '#FBBF83', '#C7B9FF', '#F59FB0', '#5FD4E6']

      // 仪表盘
      const gaugeBase = {
        type: 'gauge',
        radius: '75%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        progress: { show: true, roundCap: true, width: 10 },
        pointer: { show: true, length: '60%' },
        // 背景环尽量"透明"，只突出扫过部分
        axisLine: { lineStyle: { width: 10, color: [[1, 'rgba(0,0,0,0.06)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { 
          valueAnimation: true,
          formatter: (value) => {
            return value.toString() // 确保不显示换行符
          },
          fontSize: 16,
          color: '#111827',
          offsetCenter: [0, '90%'] // 将数字移动到外圈下方，避免遮挡
        },
        animationDuration: 800,
        animationEasing: 'cubicOut'
      }
      const gaugeMax = Math.max(1, total)
      this._charts.gaugePending = create('gaugePending', {
        series: [{ 
          ...gaugeBase, 
          max: gaugeMax,
          progress: { show: true, roundCap: true, width: 10, itemStyle: { color: palette[0] } },
          data: [{ value: this.taskStats.pending || 0 }] 
        }]
      })
      this._charts.gaugeInProgress = create('gaugeInProgress', {
        series: [{ 
          ...gaugeBase, 
          max: gaugeMax,
          progress: { show: true, roundCap: true, width: 10, itemStyle: { color: palette[1] } },
          data: [{ value: this.taskStats.inProgress || 0 }] 
        }]
      })
      this._charts.gaugeCompleted = create('gaugeCompleted', {
        series: [{ 
          ...gaugeBase, 
          max: gaugeMax,
          progress: { show: true, roundCap: true, width: 10, itemStyle: { color: palette[2] } },
          data: [{ value: this.taskStats.completed || 0 }] 
        }]
      })

      // 环形图 - 计算百分比并显示
      const totalForPie = (this.taskStats.pending || 0) + (this.taskStats.inProgress || 0) + (this.taskStats.completed || 0)
      const pendingPercent = totalForPie > 0 ? Math.round((this.taskStats.pending || 0) / totalForPie * 100) : 0
      const inProgressPercent = totalForPie > 0 ? Math.round((this.taskStats.inProgress || 0) / totalForPie * 100) : 0
      const completedPercent = totalForPie > 0 ? Math.round((this.taskStats.completed || 0) / totalForPie * 100) : 0
      
      this._charts.pieStatus = create('pieStatus', {
        color: [palette[0], palette[1], palette[2]],
        tooltip: { 
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: { 
          bottom: 10,
          itemGap: 12,
          textStyle: {
            fontSize: 12,
            padding: [0, 5, 0, 0]
          }
        },
        series: [{
          name: '状态',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: { 
            show: totalForPie > 0,
            position: 'inside',
            formatter: '{d}%',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#111827'
          },
          labelLine: { show: false },
          emphasis: { 
            label: { 
              show: true, 
              fontSize: 14, 
              fontWeight: 'bold',
              formatter: '{b}: {d}%'
            } 
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx) => idx * 50,
          data: [
            { value: this.taskStats.pending || 0, name: '待处理' },
            { value: this.taskStats.inProgress || 0, name: '进行中' },
            { value: this.taskStats.completed || 0, name: '已完成' }
          ]
        }]
      })

      // 优先级分布（示例：无真实 API 时占位）
      const priorityData = [
        { name: '高', value: this.taskStats.high || 0 },
        { name: '中', value: this.taskStats.medium || 0 },
        { name: '低', value: this.taskStats.low || 0 },
      ]
      this._charts.barPriority = create('barPriority', {
        grid: { left: 40, right: 10, top: 10, bottom: 30 },
        xAxis: { type: 'category', data: priorityData.map(d => d.name) },
        yAxis: { type: 'value' },
        series: [{ 
          type: 'bar', 
          data: priorityData.map(d => d.value), 
          itemStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: palette[3] },
              { offset: 1, color: '#c7d2fe' }
            ]),
            barBorderRadius: [6, 6, 0, 0]
          },
          animationDuration: 700,
          animationEasing: 'cubicOut'
        }]
      })

      // 近7天趋势（示例：根据 completed 推算）
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        return `${d.getMonth() + 1}/${d.getDate()}`
      })
      const trendData = Array.from({ length: 7 }).map(() => Math.max(0, Math.floor((this.taskStats.completed || 1) / 3 + Math.random() * 3)))
      // 近7天逾期任务（示例：根据完成趋势衍生小值，确保为整数）
      const overdueData = trendData.map(v => Math.max(0, Math.round(Math.max(0, v / 2 - 1 + Math.random() * 2))))
      
      // 计算两个数据集的最大值，用于统一Y轴
      const maxTrendValue = Math.max(...trendData, 1)
      const maxOverdueValue = Math.max(...overdueData, 1)
      const maxYAxisValue = Math.max(maxTrendValue, maxOverdueValue, 1)
      // 向上取整到最近的5的倍数，使图表更美观
      const yAxisMax = Math.ceil(maxYAxisValue / 5) * 5
      
      this._charts.lineTrend = create('lineTrend', {
        grid: { left: 40, right: 10, top: 10, bottom: 20 },
        xAxis: { type: 'category', data: days },
        yAxis: { 
          type: 'value',
          min: 0,
          max: yAxisMax,
          minInterval: 1
        },
        series: [{ 
          type: 'line', 
          smooth: true, 
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: 2.5, color: palette[5] },
          itemStyle: { color: palette[5], borderColor: '#ffffff', borderWidth: 1.5 },
          data: trendData, 
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.05)' }
            ])
          },
          animationDuration: 700,
          animationEasing: 'cubicOut'
        }]
      })

      this._charts.barOverdue = create('barOverdue', {
        grid: { left: 40, right: 10, top: 10, bottom: 20 },
        xAxis: { type: 'category', data: days },
        yAxis: { 
          type: 'value', 
          min: 0,
          max: yAxisMax,
          minInterval: 1
        },
        series: [{ 
          type: 'bar', 
          data: overdueData,
          itemStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#F59FB0' },
              { offset: 1, color: '#FFE4E9' }
            ]),
            barBorderRadius: [6, 6, 0, 0]
          },
          animationDuration: 600,
          animationEasing: 'cubicOut'
        }]
      })

      window.addEventListener('resize', this.resizeCharts)
      // 再次触发一次resize，解决首屏偶现空白
      setTimeout(this.resizeCharts, 50)
    },

    updateCharts(echarts) {
      if (!this._charts) return
      const { gaugePending, gaugeInProgress, gaugeCompleted, pieStatus, barPriority, lineTrend, barOverdue } = this._charts
      if (gaugePending) gaugePending.setOption({ series: [{ data: [{ value: this.taskStats.pending || 0 }] }] })
      if (gaugeInProgress) gaugeInProgress.setOption({ series: [{ data: [{ value: this.taskStats.inProgress || 0 }] }] })
      if (gaugeCompleted) gaugeCompleted.setOption({ series: [{ data: [{ value: this.taskStats.completed || 0 }] }] })
      if (pieStatus) pieStatus.setOption({
        series: [{ 
          label: {
            show: (this.taskStats.pending || 0) + (this.taskStats.inProgress || 0) + (this.taskStats.completed || 0) > 0
          },
          data: [
            { value: this.taskStats.pending || 0, name: '待处理' },
            { value: this.taskStats.inProgress || 0, name: '进行中' },
            { value: this.taskStats.completed || 0, name: '已完成' }
          ]
        }]
      })
      if (barPriority) barPriority.setOption({
        series: [{ data: [this.taskStats.high || 0, this.taskStats.medium || 0, this.taskStats.low || 0] }]
      })
      // 同步刷新近7天趋势和逾期（示例推演）
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        return `${d.getMonth() + 1}/${d.getDate()}`
      })
      const trendData = Array.from({ length: 7 }).map(() => Math.max(0, Math.floor((this.taskStats.completed || 1) / 3 + Math.random() * 3)))
      const overdueData = trendData.map(v => Math.max(0, Math.round(Math.max(0, v / 2 - 1 + Math.random() * 2))))
      
      // 计算两个数据集的最大值，用于统一Y轴
      const maxTrendValue = Math.max(...trendData, 1)
      const maxOverdueValue = Math.max(...overdueData, 1)
      const maxYAxisValue = Math.max(maxTrendValue, maxOverdueValue, 1)
      // 向上取整到最近的5的倍数，使图表更美观
      const yAxisMax = Math.ceil(maxYAxisValue / 5) * 5
      
      if (lineTrend) lineTrend.setOption({ 
        xAxis: { data: days }, 
        yAxis: { min: 0, max: yAxisMax, minInterval: 1 },
        series: [{ data: trendData }] 
      })
      if (barOverdue) barOverdue.setOption({ 
        xAxis: { data: days }, 
        yAxis: { min: 0, max: yAxisMax, minInterval: 1 },
        series: [{ data: overdueData }] 
      })
      this.resizeCharts()
    },

    resizeCharts() {
      if (!this._charts) return
      Object.values(this._charts).forEach(c => c && c.resize && c.resize())
    },

    mapProjectStatus(status) {
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

    calculateProjectProgress(status) {
      if (!status) return 0
      const statusStr = String(status)
      if (statusStr === 'completed' || statusStr === 'Completed' || statusStr === '已完成') {
        return 100
      }
      if (statusStr === 'in-progress' || statusStr === 'ACTIVE' || statusStr === 'Paused' || statusStr === '进行中') {
        return 50
      }
      return 0
    },

    getProjectStatusText(status) {
      if (!status) return '进行中'
      const statusStr = String(status).trim()
      const statusMap = {
        'in-progress': '进行中',
        'completed': '已完成',
        'ACTIVE': '进行中',
        'COMPLETED': '已完成',
        'PAUSED': '进行中',
        'ARCHIVED': '已归档',
        '进行中': '进行中',
        '已完成': '已完成',
        '已归档': '已归档'
      }
      return statusMap[statusStr] || '进行中'
    },
    
    getBarWidth(value, max) {
      if (max === 0) return 0
      return Math.min((value / max) * 100, 100)
    },
    
    getCountdown(dueDate) {
      if (!dueDate) return '无截止日期'
      const date = new Date(dueDate)
      const now = new Date()
      const diffMs = date - now
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return `已逾期 ${Math.abs(diffDays)} 天`
      if (diffDays === 0) return '今天到期'
      if (diffDays === 1) return '明天到期'
      return `还有 ${diffDays} 天`
    },
    
    async loadActivityLogs() {
      this.isLoadingLogs = true
      try {
        // 从提交记录生成操作日志
        const response = await getMySubmissions({
          page: this.logPage,
          size: this.logPageSize
        })
        
        if (response.code === 200) {
          const submissions = response.data.content || []
          const newLogs = submissions.map(sub => ({
            id: sub.id,
            type: 'submission',
            description: `提交了任务"${sub.taskTitle}"`,
            targetName: sub.taskTitle,
            timestamp: sub.submissionTime || sub.createdAt
          }))
          
          if (this.logPage === 0) {
            this.activityLogs = newLogs
          } else {
            this.activityLogs.push(...newLogs)
          }
          
          this.hasMoreLogs = newLogs.length === this.logPageSize
          this.filterActivityLogs()
        }
      } catch (error) {
        console.error('加载操作日志失败:', error)
      } finally {
        this.isLoadingLogs = false
      }
    },
    
    filterActivityLogs() {
      let filtered = [...this.activityLogs]
      
      // 按类型过滤
      if (this.logFilterType !== 'all') {
        filtered = filtered.filter(log => log.type === this.logFilterType)
      }
      
      // 按关键词搜索
      if (this.logSearchKeyword.trim()) {
        const keyword = this.logSearchKeyword.toLowerCase()
        filtered = filtered.filter(log => 
          log.description.toLowerCase().includes(keyword) ||
          (log.targetName && log.targetName.toLowerCase().includes(keyword))
        )
      }
      
      this.filteredActivityLogs = filtered
    },
    
    handleLogScroll(event) {
      const { scrollTop, scrollHeight, clientHeight } = event.target
      if (scrollHeight - scrollTop - clientHeight < 100 && this.hasMoreLogs && !this.isLoadingLogs) {
        this.loadMoreLogs()
      }
    },
    
    async loadMoreLogs() {
      if (this.isLoadingLogs || !this.hasMoreLogs) return
      this.logPage++
      await this.loadActivityLogs()
    },
    
    getLogTypeText(type) {
      const typeMap = {
        'submission': '任务提交',
        'upload': '成果上传',
        'comment': '评论回复',
        'review': '审核操作'
      }
      return typeMap[type] || type
    },
    
    formatDateTime(datetime) {
      if (!datetime) return '-'
      const date = new Date(datetime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    getReviewStatusText(task) {
      // 获取审核状态文本
      const status = task.reviewStatus || task.status || task.submissionStatus
      const statusMap = {
        'PENDING': '待审核',
        'APPROVED': '已通过',
        'REJECTED': '已拒绝',
        'REVIEWING': '审核中'
      }
      return statusMap[status] || '待审核'
    }
  }
}
</script>

<style scoped>
.my-activity-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏 - 与其他页面一致 */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary, #ffffff);
  border-bottom: 1px solid var(--border-primary, #e5e7eb);
  height: 64px;
  padding: 0 var(--space-6, 24px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  z-index: 10000;
  transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 6px);
  color: var(--text-tertiary, #6b7280);
  transition: all var(--transition-fast, 0.2s);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn:hover {
  background-color: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
  transform: scale(1.05);
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 6px);
  color: var(--text-tertiary, #6b7280);
  transition: all var(--transition-fast, 0.2s);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background-color: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
  transform: scale(1.05);
}

.page-title {
  font-size: var(--text-lg, 18px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-primary, #111827);
  line-height: 1;
  margin: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  transform: translateY(-1px);
}

/* 主要内容区域 */
.main-content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 80px; /* 为固定页眉留出空间 */
}

/* 欢迎语区域 */
.welcome-section {
  margin-bottom: 8px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.welcome-text h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.time-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filter-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

/* 通用卡片样式 */
.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.section-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sort-select,
.filter-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
}

/* 任务卡片列表 - 单列布局，更清晰 */
.task-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许flex子元素缩小 */
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.task-cards-list > .task-card-clean {
  flex: 0 0 auto; /* 固定高度，不随容器拉伸 */
}

.task-cards-list::-webkit-scrollbar {
  width: 6px;
}

.task-cards-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.task-cards-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.task-cards-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.task-card-clean {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
  position: relative;
  min-height: 70px;
  padding: 14px 16px;
  gap: 16px;
}

.task-card-clean:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.task-card-clean.overdue {
  border-color: #fecaca;
}

.task-card-clean.urgent {
  border-color: #fed7aa;
}

.task-card-clean.normal {
  border-color: #bfdbfe;
}

/* 左侧状态条 */
.task-status-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.task-status-bar.red {
  background: #ef4444;
}

.task-status-bar.orange {
  background: #f59e0b;
}

.task-status-bar.blue {
  background: #3b82f6;
}

/* 中间内容区 */
.task-content {
  min-width: 0;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.2;
}

.task-status-badge.status-PENDING {
  background: #fef3c7;
  color: #92400e;
}

.task-status-badge.status-IN_PROGRESS {
  background: #dbeafe;
  color: #1e40af;
}

.task-status-badge.status-DONE {
  background: #d1fae5;
  color: #065f46;
}

.task-status-badge.status-REVIEWING {
  background: #e0e7ff;
  color: #3730a3;
}

.task-status-badge.status-UNKNOWN {
  background: #f3f4f6;
  color: #6b7280;
}

.task-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-line {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  font-size: 13px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
}

.meta-pair {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.meta-label { 
  color: #9ca3af; 
  font-size: 13px;
  font-weight: 400;
}
.meta-value { 
  color: #374151; 
  font-weight: 500;
  font-size: 13px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta-value.overdue-text {
  color: #ef4444;
  font-weight: 600;
}
.meta-value.urgent-text {
  color: #f59e0b;
  font-weight: 600;
}
.meta-sep { 
  color: #d1d5db; 
  margin: 0 4px;
  font-size: 13px;
}

/* 右侧操作区 */
.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 16px;
  border-left: 1px solid #e5e7eb;
  justify-content: flex-end;
  flex-shrink: 0;
}

.action-btn-review {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
  line-height: 1.4;
  background: #3b82f6;
  color: white;
}

.action-btn-review:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.review-status-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  padding: 0 8px;
}

/* 仪表盘网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 3fr; /* 左窄右宽 */
  gap: 24px;
  align-items: stretch; /* 两侧卡片等高 */
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-card.projects-overview,
.dashboard-card.task-statistics {
  height: calc(100vh * 3 / 7); /* 再缩短高度，首屏尽量完整显示 */
  display: flex;
  flex-direction: column; /* 让内部可自适应填充并滚动 */
  overflow: hidden; /* 防止整个卡片溢出 */
}

.card-header {
  margin-bottom: 20px;
  flex-shrink: 0; /* 防止header被压缩 */
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.review-mode-toggle {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toggle-btn:hover {
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
}

.toggle-btn.active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-list-container {
  flex: 1;
  min-height: 0; /* 允许flex子元素缩小 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止容器溢出 */
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

/* 项目列表 */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;                 /* 占满卡片剩余空间 */
  min-height: 0;           /* 使overflow在flex容器内生效 */
  overflow-y: auto;
  padding-right: 8px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.project-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.project-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.project-status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
  white-space: nowrap;
}

.project-status-badge.status-in-progress {
  background: #e0f2fe;
  color: #0369a1;
}

.project-status-badge.status-completed {
  background: #dcfce7;
  color: #047857;
}

.project-status-badge.status-archived {
  background: #ede9fe;
  color: #5b21b6;
}

.project-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  min-width: 40px;
}

.project-link {
  padding: 4px;
  color: #6b7280;
  cursor: pointer;
}

.project-link:hover {
  color: #3b82f6;
}

/* 任务统计 */
.stats-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;            /* 占满剩余空间 */
  min-height: 0;      /* 允许内部滚动 */
  overflow-y: auto;   /* 内容超出时滚动 */
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  z-index: 2;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.gauges-row {
  grid-template-columns: repeat(3, minmax(220px, 1fr));
}

.chart-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.chart-box {
  width: 100%;
  height: 120px;
  max-width: 240px;
  margin: 6px auto 2px;
}

.chart-box.large {
  height: 140px; /* 缩短趋势图高度 */
  max-width: none;
}

/* ===== 新的高级仪表盘布局 ===== */
.dashboard-pro {
  display: grid;
  grid-template-columns: 1.2fr 1fr; /* 左大右小 */
  gap: 20px;
}

.card-overview,
.card-trend {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh * 3 / 7); /* 限制整体高度 */
  overflow: hidden;
}

.card-overview {
  min-height: 400px; /* 增加总览卡片的最小高度 */
  overflow: visible; /* 允许图表标签超出容器显示 */
  position: relative;
  z-index: 2;
}

.card-trend {
  min-height: 400px; /* 与左侧总览保持一致的高度 */
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.kpi-badge {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.kpi-pending { background: #fef3c7; color: #92400e; }
.kpi-progress { background: #dbeafe; color: #1e40af; }
.kpi-done { background: #d1fae5; color: #065f46; }

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
  min-height: 300px; /* 确保有足够高度 */
}

.overview-left { 
  display: flex; 
  align-items: stretch; 
  justify-content: center;
  min-height: 280px; /* 确保环形图有足够空间 */
  flex-direction: column;
  gap: 12px;
}

.overview-right {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: min-content;
  gap: 14px;
  align-items: start;
}

.mini-gauge,
.mini-bar { 
  background: #fafafa; 
  border: 1px solid #f1f5f9; 
  border-radius: 10px; 
  padding: 12px 10px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 150px;
  height: 100%;
}

.mini-title {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  flex-shrink: 0;
}

.chart-box.tiny { 
  height: 110px; 
  max-width: none;
  width: 100%;
  flex: 1;
  min-height: 0;
}
.chart-box.small { 
  height: 110px; 
  max-width: none;
  width: 100%;
}
.chart-box.medium { 
  height: 240px; 
  max-width: none;
  width: 100%;
}

.status-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #111827;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.status-name {
  flex: 1;
  font-weight: 500;
  color: #111827;
}

.status-count {
  font-weight: 600;
  color: #111827;
}

.status-percent {
  color: #111827;
  font-size: 12px;
}

.stats-chart {
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.stats-chart:last-child {
  border-bottom: none;
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.bar-chart {
  display: flex;
  gap: 16px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.bar-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.bar {
  height: 24px;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar.pending {
  background: #fef3c7;
}

.bar.in-progress {
  background: #dbeafe;
}

.bar.completed {
  background: #d1fae5;
}

.bar-value {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  min-width: 30px;
}

.line-chart-placeholder {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
}

.upcoming-milestones {
  padding-top: 0;
}

.milestones-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.milestone-item {
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  height: 44px; /* 高度保持不变的小块 */
  display: flex;
  align-items: center;
  width: 220px; /* 缩短长度，形成小块 */
  box-sizing: border-box;
  border: 1px solid #eef2f7;
}

.milestone-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.milestone-name {
  font-size: 13px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.milestone-countdown {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
}

/* 操作日志时间轴 */
.activity-timeline {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
  position: relative;
}

.timeline-dot::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: calc(100% + 16px);
  background: #e5e7eb;
  transform: translateX(-50%);
}

.timeline-item:last-child .timeline-dot::before {
  display: none;
}

.timeline-dot.type-submission {
  background: #3b82f6;
}

.timeline-dot.type-upload {
  background: #8b5cf6;
}

.timeline-dot.type-comment {
  background: #10b981;
}

.timeline-dot.type-review {
  background: #f59e0b;
}

.timeline-content {
  flex: 1;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-type {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
}

.log-description {
  margin: 4px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.log-target {
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.target-label {
  margin-right: 4px;
}

.target-name {
  color: #3b82f6;
  cursor: pointer;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.load-more:hover {
  color: #2563eb;
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state.small,
.empty-state.small {
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state p {
  color: #9ca3af;
  font-size: 14px;
}

.empty-milestones {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  /* 小屏恢复自适应高度，避免占满视口 */
  .dashboard-card.projects-overview,
  .dashboard-card.task-statistics {
    height: auto;
  }
}

@media (max-width: 768px) {
  .task-card-clean {
    flex-direction: column;
  }
  
  .task-status-bar {
    width: 100%;
    height: 4px;
  }
  
  .task-actions {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid #f3f4f6;
    padding: 16px 20px;
    min-width: auto;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 8px;
  }

  .bar-chart {
    flex-direction: column;
  }

  .bar-item {
    flex-direction: row;
    align-items: center;
  }

  .bar-label {
    width: 60px;
    text-align: left;
  }

  .bar-container {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }
  
  .main-nav {
    display: none;
  }
  
  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .main-content-wrapper {
    padding: 16px;
  }
}
</style>
