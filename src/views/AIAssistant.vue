<template>
  <div class="ai-assistant-container">
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
        <span class="page-title">AI 实验分析助手</span>
      </div>
      <div class="header-right">
          <button class="sync-status-btn" @click="syncTaskStatusChanges" title="同步任务状态">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 15A9 9 0 1 1 5.64 5.64L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 项目概览区域 -->
      <div class="project-overview">
        <div class="project-header">
        <div class="project-info">
            <h1 class="project-title">
              <span class="title-text">{{ currentProject.title }}</span>
              <div class="title-decoration"></div>
            </h1>
          <div class="project-details">
              <div class="project-name">
                <svg class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                </svg>
                {{ currentProject.description }}
              </div>
              <div class="project-lead">
                <svg class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                负责人: {{ currentProject.lead }}
              </div>
          </div>
        </div>
        <div class="project-progress">
          <div class="progress-label">项目进度</div>
          <div class="progress-bar">
              <div class="progress-fill" :style="{ width: currentProject.progress + '%' }"></div>
          </div>
            <div class="progress-text">{{ currentProject.progress }}% 完成</div>
          </div>
          <div class="project-switcher">
            <button class="switch-btn" @click="toggleProjectDropdown">
              <span class="current-project">{{ currentProject.title }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
            </button>
            <div v-if="showProjectDropdown" class="project-dropdown">
              <div class="dropdown-header">选择项目</div>
              <div
                v-for="project in availableProjects"
                :key="project.id"
                class="project-option"
                :class="{ active: project.id === currentProject.id }"
                @click="switchProject(project)"
              >
                <div class="project-info">
                  <div class="project-name">{{ project.title }}</div>
                  <div class="project-lead">{{ project.lead }}</div>
        </div>
                <div class="project-progress-small">
                  <div class="progress-bar-small">
                    <div class="progress-fill-small" :style="{ width: project.progress + '%' }"></div>
                  </div>
                  <span class="progress-text-small">{{ project.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>

      <!-- 任务管理和AI对话左右布局 -->
      <div class="task-and-chat-container">
      <!-- 任务管理区域 -->
      <div class="task-management">
        <div class="task-header">
          <div class="filter-dropdown" @click.stop>
            <button class="dropdown-button" @click="toggleFilterDropdown">
              {{ getFilterText() }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div v-if="filterDropdownOpen" class="dropdown-menu">
              <div
                class="dropdown-item"
                :class="{ active: activeFilter === 'all' }"
                @click="setFilterAndClose('all')"
              >
                全部状态
              </div>
              <div
                class="dropdown-item"
                :class="{ active: activeFilter === 'published' }"
                @click="setFilterAndClose('published')"
              >
                已发布
              </div>
              <div
                class="dropdown-item"
                :class="{ active: activeFilter === 'in-progress' }"
                @click="setFilterAndClose('in-progress')"
              >
                进行中
              </div>
              <div
                class="dropdown-item"
                :class="{ active: activeFilter === 'completed' }"
                @click="setFilterAndClose('completed')"
              >
                已完成
              </div>
              <div
                class="dropdown-item"
                :class="{ active: activeFilter === 'paused' }"
                @click="setFilterAndClose('paused')"
              >
                已暂停
              </div>
            </div>
          </div>
          <div class="search-box">
            <input
              type="text"
              placeholder="搜索任务..."
              :value="searchQuery"
              @input="updateSearchQuery"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="task-grid">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-card"
            :class="{ 'unpublished': !isTaskPublished(task) }"
          >
            <div class="task-header">
              <input
                type="checkbox"
                :checked="task.checked"
                @change="toggleTaskCheckbox(task.id)"
              />
              <div class="task-title">
                {{ task.title }}
                <span v-if="!isTaskPublished(task)" class="unpublished-badge">未发布</span>
              </div>
              <div class="task-status" :class="getStatusClass(task.status)">
                {{ getStatusText(task.status) }}
              </div>
            </div>
            <div class="task-description">{{ task.description }}</div>
            <div class="task-assignee">
              <div class="assignee-avatar">{{ task.assignee.charAt(0) }}</div>
              <span>{{ task.assignee }}</span>
            </div>
            <div v-if="!isTaskPublished(task)" class="task-actions">
              <button
                class="publish-btn"
                @click="updateTaskPublishStatus(task.id, true)"
                title="发布任务"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI对话区域 -->
      <div class="ai-chat-section">
        <div class="ai-dialog-title">AI对话框</div>
        <div class="chat-container">
          <div
            v-for="message in chatMessages"
            :key="message.id"
            :class="message.type === 'ai' ? 'ai-message' : 'user-message'"
          >
            <div :class="message.type === 'ai' ? 'message-bubble' : 'user-bubble'">
              {{ message.content }}
            </div>
          </div>
        </div>

        <div class="user-input-area">
          <input
            type="text"
            placeholder="输入您的问题..."
            v-model="userMessage"
            @keyup.enter="sendMessage"
          />
          <button class="send-btn" @click="sendMessage" :disabled="!userMessage.trim()">发送</button>
        </div>
      </div>
      </div>

      <!-- AI分析建议区域 -->
      <div class="ai-suggestions">
        <h3 class="suggestions-title">AI分析建议</h3>
        <div class="suggestions-grid">
          <div class="suggestion-card">
            <div class="suggestion-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">优化建议</div>
              <div class="suggestion-text">建议调整激光功率参数至4.2W以提升纠缠态制备效率</div>
            </div>
          </div>

          <div class="suggestion-card">
            <div class="suggestion-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">风险预警</div>
              <div class="suggestion-text">检测到环境温度波动可能影响实验稳定性</div>
            </div>
          </div>

          <div class="suggestion-card">
            <div class="suggestion-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21M7 16L12 11L16 15L20 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">进度反馈</div>
              <div class="suggestion-text">所选任务平均完成度78%,预计还需3天完成</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-actions">
        <button class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 3V8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          保存分析
        </button>
        <button class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          导出报告
        </button>
        <button class="action-btn primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 6L12 2L8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          分享结果
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import { projectAPI } from '@/api/project'
import '@/assets/styles/AIAssistant.css'
export default {
  name: 'AIAssistant',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      activeFilter: 'all',
      searchQuery: '',
      filterDropdownOpen: false,
      userMessage: '',
      chatMessages: [],
      showProjectDropdown: false,
      syncTimer: null,
      currentProject: {
        id: 1,
        title: '量子计算算法优化研究',
        description: '量子计算算法优化研究',
        lead: '王志强教授',
        progress: 65
      },
      availableProjects: [
        {
          id: 1,
          title: '量子计算算法优化研究',
          description: '量子计算算法优化研究',
          lead: '王志强教授',
          progress: 65
        },
        {
          id: 2,
          title: '多模态医学影像数据平台',
          description: '多模态医学影像数据平台',
          lead: '李教授',
          progress: 45
        },
        {
          id: 3,
          title: '气候变化预测模型研究',
          description: '气候变化预测模型研究',
          lead: '王教授',
          progress: 80
        },
        {
          id: 4,
          title: '基因组数据分析平台',
          description: '基因组数据分析平台',
          lead: '张教授',
          progress: 30
        }
      ],
      tasks: [],
      // 不同项目的任务数据
      projectTasks: {
        1: [
        {
          id: 1,
          title: '量子纠缠态制备',
          description: '研究高保真度纠缠态的制备方法',
          assignee: '张伟',
          status: 'in-progress',
            checked: false,
            published: true
        },
        {
          id: 2,
          title: '量子门操作优化',
          description: '优化量子门操作的精度和速度',
          assignee: '李娜',
          status: 'completed',
            checked: false,
            published: true
        },
        {
          id: 3,
          title: '量子纠错编码',
          description: '设计高效的量子纠错编码方案',
          assignee: '王强',
          status: 'in-progress',
            checked: false,
            published: true
        },
        {
          id: 4,
          title: '量子算法验证',
          description: '验证量子算法的正确性和效率',
          assignee: '陈美玲',
          status: 'paused',
            checked: false,
            published: true
        },
        {
          id: 5,
          title: '量子通信协议',
          description: '开发安全的量子通信协议',
          assignee: '赵磊',
          status: 'in-progress',
            checked: false,
            published: true
        },
        {
          id: 6,
          title: '量子传感器校准',
          description: '校准量子传感器的精度和稳定性',
          assignee: '孙芳',
          status: 'completed',
            checked: false,
            published: true
          }
        ],
        2: [
          {
            id: 7,
            title: '医学影像数据预处理',
            description: '对MRI、CT、PET扫描数据进行标准化处理',
            assignee: '李医生',
            status: 'in-progress',
            checked: false,
            published: true
          },
          {
            id: 8,
            title: '深度学习模型训练',
            description: '训练肿瘤检测的深度学习模型',
            assignee: '王工程师',
            status: 'completed',
            checked: false,
            published: true
          },
          {
            id: 9,
            title: '数据质量评估',
            description: '评估医学影像数据的质量和完整性',
            assignee: '张研究员',
            status: 'in-progress',
            checked: false,
            published: true
          },
          {
            id: 10,
            title: '模型性能优化',
            description: '优化模型在临床环境中的性能',
            assignee: '刘专家',
            status: 'paused',
            checked: false,
            published: true
          }
        ],
        3: [
          {
            id: 11,
            title: '气象数据收集',
            description: '收集全球气象站的历史数据',
            assignee: '陈气象员',
            status: 'completed',
            checked: false,
            published: true
          },
          {
            id: 12,
            title: '气候模型构建',
            description: '构建神经网络气候预测模型',
            assignee: '赵研究员',
            status: 'in-progress',
            checked: false,
            published: true
          },
          {
            id: 13,
            title: '模型验证测试',
            description: '验证模型预测的准确性',
            assignee: '孙科学家',
            status: 'in-progress',
            checked: false,
            published: true
          },
          {
            id: 14,
            title: '预测结果分析',
            description: '分析长期气候趋势预测结果',
            assignee: '李分析师',
            status: 'completed',
            checked: false,
            published: true
          }
        ],
        4: [
          {
            id: 15,
            title: '基因序列比对',
            description: '对基因序列进行比对和注释',
            assignee: '王生物学家',
            status: 'in-progress',
            checked: false,
            published: true
          },
          {
            id: 16,
            title: '变异位点识别',
            description: '识别基因序列中的变异位点',
            assignee: '张遗传学家',
            status: 'paused',
            checked: false,
            published: true
          },
          {
            id: 17,
            title: '功能注释分析',
            description: '分析基因变异的功能影响',
            assignee: '陈研究员',
            status: 'in-progress',
            checked: false,
            published: true
          }
        ]
      }
    }
  },
  computed: {
    filteredTasks() {
      let filtered = this.tasks

      console.log('当前任务列表:', filtered)
      console.log('当前过滤器:', this.activeFilter)
      console.log('任务数量:', filtered.length)

      // 按状态筛选
      if (this.activeFilter === 'published') {
        // 只显示已发布的任务
        filtered = filtered.filter(task => this.isTaskPublished(task))
        console.log('已发布任务数量:', filtered.length)
      } else if (this.activeFilter !== 'all') {
        // 其他状态筛选
        filtered = filtered.filter(task => task.status === this.activeFilter)
        console.log(`${this.activeFilter} 状态任务数量:`, filtered.length)
      }
      // 全部状态时显示所有任务，不进行发布状态过滤

      // 按搜索关键词筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignee.toLowerCase().includes(query)
        )
        console.log('搜索后任务数量:', filtered.length)
      }

      console.log('最终过滤后的任务列表:', filtered)
      return filtered
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    
    // 调试localStorage数据
    this.debugLocalStorage()
    
    // 先加载用户项目
    this.loadUserProjects()
    
    // 使用 nextTick 确保 availableProjects 已经更新
    this.$nextTick(() => {
      // 尝试从 localStorage 恢复上次选中的项目
      const lastSelectedProject = localStorage.getItem('lastSelectedProject')
      if (lastSelectedProject) {
        try {
          const projectData = JSON.parse(lastSelectedProject)
          console.log('尝试恢复上次选中的项目:', projectData.title)
          
          // 在项目列表中找到对应的项目
          const foundProject = this.availableProjects.find(p => String(p.id) === String(projectData.id))
          if (foundProject) {
            this.currentProject = foundProject
            console.log('已恢复上次选中的项目:', foundProject.title)
            
            // 恢复项目后，重新加载该项目的任务数据
            this.loadProjectTasks(this.currentProject.id)
          } else {
            console.log('未找到上次选中的项目，使用默认项目')
            // 使用默认项目
            this.loadProjectTasks(this.currentProject.id)
          }
        } catch (error) {
          console.error('恢复上次选中的项目失败:', error)
          // 恢复失败时使用默认项目
          this.loadProjectTasks(this.currentProject.id)
        }
      } else {
        // 没有保存的项目，使用默认项目
        this.loadProjectTasks(this.currentProject.id)
      }
    })

    // 设置定时器定期同步任务状态（每30秒）
    this.syncTimer = setInterval(() => {
      this.syncTaskStatusChanges()
    }, 30000)

    // 监听页面可见性变化，当页面重新获得焦点时同步
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncTaskStatusChanges()
      }
    })

    // 监听窗口焦点变化
    window.addEventListener('focus', () => {
      this.syncTaskStatusChanges()
    })

    // 监听任务状态变化事件
    this.$root.$on('taskStatusChanged', (data) => {
      console.log('收到任务状态变化通知:', data)
      // 如果变化的是当前项目的任务，立即同步
      if (data.projectId === this.currentProject.id) {
        console.log('当前项目任务状态发生变化，立即同步')
        this.syncTaskStatusChanges()
      }
    })
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('visibilitychange', this.syncTaskStatusChanges)
    window.removeEventListener('focus', this.syncTaskStatusChanges)

    // 清理全局事件监听器
    this.$root.$off('taskStatusChanged')

    // 清理定时器
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    toggleProjectDropdown() {
      this.showProjectDropdown = !this.showProjectDropdown
    },
    switchProject(project) {
      this.currentProject = { ...project }
      this.showProjectDropdown = false
  
      // 保存当前选中的项目到 localStorage
      localStorage.setItem('lastSelectedProject', JSON.stringify({
        id: project.id,
        title: project.title,
        description: project.description,
        lead: project.lead,
        progress: project.progress
      }))
  
      // 重新加载项目任务数据
      this.loadProjectTasks(project.id)
      // 检查是否是用户项目（判断ID是否为字符串且是雪花ID）
      // 雪花ID通常是19位数字，而默认项目的ID是1,2,3,4
      const isCustomProject = String(project.id).length > 5
      if (isCustomProject) {
        this.loadUserProjects()
        this.loadProjectTasks(project.id)
      }
    },

    // 同步任务状态变化
    syncTaskStatusChanges() {
      console.log('同步任务状态变化...')

      // 重新加载用户项目数据（确保获取最新的项目信息）
      this.loadUserProjects()

      // 重新加载当前项目的任务数据
      this.loadProjectTasks(this.currentProject.id)

      console.log('任务状态同步完成，当前任务数量:', this.tasks.length)
      console.log('当前任务状态详情:', this.tasks.map(t => ({ title: t.title, status: t.status, statusText: this.getStatusText(t.status) })))
    },
    loadProjectTasks(projectId) {
      // 根据项目ID加载对应的任务数据
      console.log(`加载项目 ${projectId} 的任务数据`)

      // 从项目加载任务数据
      const projectTasks = this.loadTasksFromProject(projectId)

      if (projectTasks && projectTasks.length > 0) {
        console.log(`找到 ${projectTasks.length} 个任务`)
        console.log('任务详情:', projectTasks)

        // 更新任务列表，保持响应式
        this.tasks.splice(0, this.tasks.length, ...projectTasks)
      } else {
        console.log('没有找到任务数据')
        this.tasks.splice(0, this.tasks.length)
      }
    },
    async loadUserProjects() {
      console.log('开始加载用户参加的项目...')

      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        console.log('用户未登录，使用默认项目数据')
        // 如果用户未登录，保持默认项目
        return
      }
      
      try {
        // 调用API获取我参与的项目（和首页一样）
        const response = await projectAPI.getMyProjects(0, 100) // 获取用户参加的所有项目
        
        console.log('我参加的项目API响应:', response)
        
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
          // 转换项目数据格式
          const userProjects = projects.map(project => {
            const projectId = project.id || project.projectId || project.project_id
            
            // 计算进度（如果有progress字段就用，否则根据status计算）
            let progress = project.progress || 0
            if (!progress && project.status) {
              if (project.status === 'COMPLETED' || project.status === 'Completed' || project.status === '已完成') {
                progress = 100
              } else if (project.status === 'ACTIVE' || project.status === 'Paused' || project.status === '进行中') {
                progress = 50 // 默认进行中状态显示50%
              } else {
                progress = 0
              }
            }
            
            return {
              id: projectId,
              title: project.title || project.name || project.projectName || '未命名项目',
              description: project.description || project.desc || project.title || '',
              lead: project.lead || project.creatorName || project.manager || '项目负责人',
              progress: progress
            }
          })
          
          console.log('成功加载用户参加的项目:', userProjects)
          
          // 为每个用户项目加载任务数据
          userProjects.forEach(project => {
            const projectId = project.id
            console.log(`处理项目 ${project.title} (ID: ${projectId})`)
            
            // 从localStorage或API加载该项目的任务
            const projectTasks = this.loadTasksFromProject(projectId)
            
            if (projectTasks.length > 0) {
              this.projectTasks[projectId] = projectTasks.map((task, index) => ({
                id: task.id || `${projectId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: task.title,
                description: task.description || '任务描述',
                assignee: task.assignee || '项目负责人',
                status: task.status || 'in-progress',
                checked: false,
                published: task.published !== false
              }))
              console.log(`项目 ${project.title} 加载了 ${projectTasks.length} 个任务`)
            } else {
              this.projectTasks[projectId] = []
              console.log(`项目 ${project.title} 没有任务`)
            }
          })
          
          // 更新可用项目列表（只使用用户参加的项目）
          this.availableProjects = userProjects
          
          // 如果当前项目不在列表中，设置为第一个项目
          if (this.availableProjects.length > 0) {
            const currentProjectExists = this.availableProjects.find(p => String(p.id) === String(this.currentProject.id))
            if (!currentProjectExists) {
              this.currentProject = { ...this.availableProjects[0] }
              // 加载新项目的任务
              this.loadProjectTasks(this.currentProject.id)
            }
          }
          
          console.log('最终可用项目列表:', this.availableProjects)
        } else {
          console.log('未获取到项目数据，保持默认项目')
        }
      } catch (error) {
        console.error('加载用户参加的项目失败:', error)
        // 加载失败时保持默认项目
      }
    },

    // 从项目加载任务数据
    loadTasksFromProject(projectId) {
      console.log(`开始加载项目 ${projectId} 的任务数据`)

      // 首先尝试从项目广场的任务存储格式加载（直接从项目的tasks字段）
      const projectSquareTasks = this.loadTasksFromProjectSquare(projectId)
      if (projectSquareTasks.length > 0) {
        console.log(`从项目广场加载了 ${projectSquareTasks.length} 个任务`)
        return projectSquareTasks
      }

      // 如果是默认项目，从projectTasks中加载
      if (this.projectTasks[projectId]) {
        console.log(`从默认项目数据加载了 ${this.projectTasks[projectId].length} 个任务`)
        return this.projectTasks[projectId]
      }

      console.log(`项目 ${projectId} 没有找到任务数据`)
      return []
    },

    // 从项目广场加载任务数据
    loadTasksFromProjectSquare(projectId) {
      console.log(`尝试从项目广场加载项目 ${projectId} 的任务`)

      // 获取项目信息
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      // 使用字符串比较，避免类型不一致导致找不到项目
      const project = projects.find(p => String(p.id) === String(projectId))

      if (!project) {
        console.log(`未找到项目 ${projectId}`)
        return []
      }

      console.log(`找到项目: ${project.title}`)
      console.log(`项目数据:`, project)

      // 直接从项目的tasks字段获取任务
      if (project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0) {
        console.log(`从项目 ${project.title} 的tasks字段找到 ${project.tasks.length} 个任务`)
        console.log(`任务数据:`, project.tasks)

        // 转换任务格式以匹配AI助手的显示格式
        return project.tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          assignee: task.assignee_name || task.created_by_name || '未分配',
          status: this.convertTaskStatus(task.status),
          checked: false,
          published: true, // 项目广场的任务默认为已发布
          originalTask: task // 保留原始任务数据
        }))
      }

      console.log(`项目 ${project.title} 没有tasks字段或任务为空`)
      return []
    },

    // 转换任务状态格式
    convertTaskStatus(status) {
      const statusMap = {
        '待接取': 'pending',
        'PENDING': 'pending',
        '进行中': 'in-progress',
        'IN_PROGRESS': 'in-progress',
        '完成': 'completed',
        'COMPLETED': 'completed',
        '暂停': 'paused',
        'PAUSED': 'paused',
        '已完成': 'completed',
        '已暂停': 'paused'
      }
      return statusMap[status] || 'pending'
    },

    // 获取已发布的任务
    getPublishedTasksForProject(projectId) {
      // 从localStorage获取项目的已发布任务
      const projectTasks = JSON.parse(localStorage.getItem(`project_${projectId}_tasks`) || '[]')

      // 只返回已发布状态的任务
      return projectTasks.filter(task => task.status === 'published')
    },

    // 检查任务是否已发布
    isTaskPublished(task) {
      // 检查任务是否有发布状态标记
      return task.published === true || task.status === 'published'
    },

    // 更新任务发布状态
    updateTaskPublishStatus(taskId, published) {
      // 更新任务列表中的发布状态
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.published = published
        if (published) {
          task.status = 'published'
        }
      }

      // 保存到localStorage
      this.saveTasksToStorage()
    },

    // 保存任务到localStorage
    saveTasksToStorage() {
      // 这里可以添加保存逻辑
      console.log('保存任务状态到localStorage')
    },

    // 调试方法：查看localStorage中的数据
    debugLocalStorage() {
      console.log('=== localStorage 调试信息 ===')
      console.log('projects:', JSON.parse(localStorage.getItem('projects') || '[]'))
      console.log('tasks:', JSON.parse(localStorage.getItem('tasks') || '[]'))
      console.log('all_tasks:', JSON.parse(localStorage.getItem('all_tasks') || '[]'))

      // 检查所有localStorage键
      const keys = Object.keys(localStorage)
      console.log('所有localStorage键:', keys)

      // 查找包含task的键
      const taskKeys = keys.filter(key => key.includes('task') || key.includes('Task'))
      console.log('任务相关键:', taskKeys)

      taskKeys.forEach(key => {
        console.log(`${key}:`, JSON.parse(localStorage.getItem(key) || '[]'))
      })

      // 专门检查项目广场相关的数据
      this.debugProjectSquareData()
    },

    // 调试项目广场数据
    debugProjectSquareData() {
      console.log('=== 项目广场数据调试 ===')

      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      console.log('用户创建的项目:', projects)

      // 查找"潘兴林这一块"项目
      const panxinglinProject = projects.find(p => p.title.includes('潘兴林'))
      if (panxinglinProject) {
        console.log('找到潘兴林项目:', panxinglinProject)
        console.log('项目tasks字段:', panxinglinProject.tasks)

        if (panxinglinProject.tasks && Array.isArray(panxinglinProject.tasks)) {
          console.log(`项目有 ${panxinglinProject.tasks.length} 个任务:`)
          panxinglinProject.tasks.forEach((task, index) => {
            console.log(`任务 ${index + 1}:`, task)
          })
        } else {
          console.log('项目没有tasks字段或tasks不是数组')
        }
      } else {
        console.log('未找到潘兴林项目')

        // 显示所有项目以便调试
        console.log('所有项目列表:')
        projects.forEach((project, index) => {
          console.log(`项目 ${index + 1}: ${project.title} (ID: ${project.id})`)
          console.log(`  tasks字段:`, project.tasks)
        })
      }
    },

    // 刷新任务数据
    refreshTasks() {
      console.log('刷新任务数据...')
      this.debugLocalStorage()

      // 清空现有数据
      this.availableProjects = this.availableProjects.filter(project => project.id <= 4) // 只保留默认项目
      this.projectTasks = {}

      // 重新加载用户项目
      this.loadUserProjects()

      // 重新加载当前项目的任务
      this.loadProjectTasks(this.currentProject.id)

      console.log('刷新完成')
    },

    // 为测试创建示例任务数据
    createSampleTasks() {
      console.log('创建示例任务数据...')

      // 获取用户项目
      const createdProjects = JSON.parse(localStorage.getItem('projects') || '[]')

      createdProjects.forEach(project => {
        const projectId = project.id
        const sampleTasks = [
          {
            id: Date.now() + Math.random(),
            title: `${project.title} - 需求分析`,
            description: '分析项目需求和功能规格',
            assignee: '项目负责人',
            status: 'in-progress',
            projectId: projectId,
            published: true
          },
          {
            id: Date.now() + Math.random() + 1,
            title: `${project.title} - 系统设计`,
            description: '设计系统架构和技术方案',
            assignee: '架构师',
            status: 'completed',
            projectId: projectId,
            published: true
          },
          {
            id: Date.now() + Math.random() + 2,
            title: `${project.title} - 开发实现`,
            description: '实现核心功能模块',
            assignee: '开发团队',
            status: 'in-progress',
            projectId: projectId,
            published: true
          }
        ]

        // 保存到localStorage
        localStorage.setItem(`project_${projectId}_tasks`, JSON.stringify(sampleTasks))
        console.log(`为项目 ${project.title} 创建了 ${sampleTasks.length} 个示例任务`)
      })

      // 刷新数据
      this.refreshTasks()
    },
    goToHome() {
      this.$router.push('/home')
    },
    setFilter(filter) {
      this.activeFilter = filter
    },
    toggleFilterDropdown() {
      this.filterDropdownOpen = !this.filterDropdownOpen
    },
    setFilterAndClose(filter) {
      this.activeFilter = filter
      this.filterDropdownOpen = false
    },
    getFilterText() {
      const filterTexts = {
        'all': '全部状态',
        'published': '已发布',
        'in-progress': '进行中',
        'completed': '已完成',
        'paused': '已暂停'
      }
      return filterTexts[this.activeFilter] || '全部状态'
    },
    updateSearchQuery(event) {
      this.searchQuery = event.target.value
    },
    toggleTaskCheckbox(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.checked = !task.checked
      }
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待接取',
        'in-progress': '进行中',
        'completed': '完成',
        'paused': '暂停'
      }
      return statusMap[status] || status
    },
    getStatusClass(status) {
      return status
    },
    sendMessage() {
      console.log('sendMessage called, userMessage:', this.userMessage)
      if (!this.userMessage.trim()) {
        console.log('Message is empty, not sending')
        return
      }

      console.log('Adding user message to chat')
      // 添加用户消息
      const userMsg = {
        id: Date.now(),
        type: 'user',
        content: this.userMessage.trim(),
        timestamp: new Date()
      }
      this.chatMessages.push(userMsg)
      console.log('Chat messages after adding user message:', this.chatMessages)

      // 模拟AI回复
      setTimeout(() => {
        console.log('Adding AI response')
        const aiMsg = {
          id: Date.now() + 1,
          type: 'ai',
          content: '目前功能仍在开发',
          timestamp: new Date()
        }
      this.chatMessages.push(aiMsg)
      console.log('Chat messages after adding AI response:', this.chatMessages)
      // 滚动到最新消息
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }, 1000)

    // 清空输入框
    this.userMessage = ''
    console.log('Input cleared')
    // 滚动到最新消息
    this.$nextTick(() => {
      this.scrollToBottom()
    })
    },
    scrollToBottom() {
      const chatContainer = this.$el.querySelector('.chat-container')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showProjectDropdown = false
        this.filterDropdownOpen = false
      }
    }
  }
}

</script>
