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
        <span class="page-title">AI 实验分析助手</span>
      </div>
      <div class="header-right">
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 项目概览区域 -->
      <div class="project-overview">
        <div class="project-header">
        <div class="project-info">
            <h1 class="project-title">{{ currentProject.title }}</h1>
          <div class="project-details">
              <div class="project-name">{{ currentProject.description }}</div>
              <div class="project-lead">负责人: {{ currentProject.lead }}</div>
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

      <!-- 任务管理区域 -->
      <div class="task-management">
        <div class="task-header">
          <div class="filter-tabs">
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'all' }"
              @click="setFilter('all')"
            >
              全部状态
            </div>
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'published' }"
              @click="setFilter('published')"
            >
              已发布
            </div>
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'in-progress' }"
              @click="setFilter('in-progress')"
            >
              进行中
            </div>
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'completed' }"
              @click="setFilter('completed')"
            >
              已完成
            </div>
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'paused' }"
              @click="setFilter('paused')"
            >
              已暂停
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
      // 重新加载项目任务数据
      this.loadProjectTasks(project.id)
      // 如果是用户项目，重新加载用户项目数据
      if (project.id > 1000) {
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
    loadUserProjects() {
      console.log('开始加载用户项目...')
      
      // 从localStorage加载用户创建的项目
      const createdProjects = JSON.parse(localStorage.getItem('projects') || '[]')
      console.log('从localStorage加载的项目:', createdProjects)
      
      // 将用户创建的项目添加到可用项目列表中
      const userProjects = createdProjects.map(project => ({
        id: project.id + 1000, // 避免ID冲突
        title: project.title,
        description: project.description || project.title,
        lead: project.lead || '您',
        progress: Math.floor(Math.random() * 100) // 模拟进度
      }))
      
      console.log('处理后的用户项目:', userProjects)
      
      // 为每个用户项目加载任务数据
      userProjects.forEach(project => {
        const projectId = project.id
        const originalProjectId = project.id - 1000 // 转换回原始ID
        
        console.log(`处理项目 ${project.title} (ID: ${originalProjectId})`)
        
        // 从localStorage加载该项目的任务
        const projectTasks = this.loadTasksFromProject(originalProjectId)
        
        if (projectTasks.length > 0) {
          // 如果有任务，使用这些任务
          this.projectTasks[projectId] = projectTasks.map((task, index) => ({
            id: projectId * 100 + index + 1,
            title: task.title,
            description: task.description || '任务描述',
            assignee: task.assignee || '项目负责人',
            status: task.status || 'in-progress',
            checked: false,
            published: task.published !== false // 默认为已发布，除非明确标记为未发布
          }))
          console.log(`项目 ${project.title} 加载了 ${projectTasks.length} 个任务`)
        } else {
          // 如果没有任务，显示空列表
          this.projectTasks[projectId] = []
          console.log(`项目 ${project.title} 没有任务`)
        }
      })
      
      // 合并默认项目和用户项目
      this.availableProjects = [...this.availableProjects, ...userProjects]
      
      console.log('最终可用项目列表:', this.availableProjects)
      console.log('最终项目任务数据:', this.projectTasks)
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
      const project = projects.find(p => p.id === projectId)
      
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
        '已完成': 'completed',
        'COMPLETED': 'completed',
        '已暂停': 'paused',
        'PAUSED': 'paused'
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
    setFilter(filter) {
      this.activeFilter = filter
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
        'completed': '已完成',
        'paused': '已暂停'
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
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    // 调试localStorage数据
    this.debugLocalStorage()
    // 加载用户的项目数据
    this.loadUserProjects()
    // 初始化当前项目的任务数据
    this.loadProjectTasks(this.currentProject.id)
    
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
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('visibilitychange', this.syncTaskStatusChanges)
    window.removeEventListener('focus', this.syncTaskStatusChanges)
    
    // 清理定时器
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/variables.css';

.ai-assistant-container {
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
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.menu-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.page-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

/* 项目进度样式 */
.project-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  min-width: 180px;
  flex-shrink: 0;
}

.progress-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.progress-text {
  font-size: var(--text-sm);
  color: var(--primary-color);
  font-weight: var(--font-semibold);
}

/* 项目切换器样式 */
.project-switcher {
  position: relative;
  flex-shrink: 0;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 180px;
  justify-content: space-between;
}

.switch-btn:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.current-project {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.project-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
  margin-top: var(--space-2);
}

.dropdown-header {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
}

.project-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--border-primary);
}

.project-option:hover {
  background: var(--bg-tertiary);
}

.project-option.active {
  background: var(--primary-light);
  color: var(--primary-color);
}

.project-option:last-child {
  border-bottom: none;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--space-1);
}

.project-lead {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.project-progress-small {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
  min-width: 60px;
}

.progress-bar-small {
  width: 60px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill-small {
  height: 100%;
  background: var(--primary-color);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.progress-text-small {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}



.main-content {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* 项目概览区域 */
.project-overview {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.project-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-lead {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 任务管理区域 */
.task-management {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  background: #f8f9fa;
}

.tab.active {
  background: #007bff;
  color: white;
}

.tab:hover:not(.active) {
  background: #e9ecef;
  color: #333;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 14px;
  width: 200px;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #007bff;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: #666;
}


.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.task-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-card .task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.task-card input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.task-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.task-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.task-status.pending {
  background: #f3e5f5;
  color: #7b1fa2;
}

.task-status.in-progress {
  background: #e3f2fd;
  color: #1976d2;
}

.task-status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.task-status.paused {
  background: #fff3e0;
  color: #f57c00;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.task-assignee span {
  font-size: 14px;
  color: #333;
}

/* 未发布任务样式 */
.task-card.unpublished {
  border: 2px dashed var(--warning-color);
  background: var(--warning-light);
  opacity: 0.8;
}

.unpublished-badge {
  background: var(--warning-color);
  color: white;
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  margin-left: var(--space-2);
  font-weight: var(--font-medium);
}

.task-actions {
  margin-top: var(--space-3);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.publish-btn {
  background: var(--success-color);
  color: white;
  border: none;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.publish-btn:hover {
  background: var(--success-hover);
  transform: translateY(-1px);
}

/* AI对话区域 */
.ai-chat-section {
  background: white;
  border-radius: 12px;
  padding: 20px 40px 20px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 500px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 80px;
}

/* 自定义滚动条样式 */
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.ai-message {
  display: flex;
  justify-content: flex-start;
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.message-bubble {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.user-bubble {
  background: #007bff;
  color: white;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  font-size: 14px;
  line-height: 1.4;
}

.user-input-area {
  display: flex;
  gap: 12px;
  padding: 16px 0 0 0;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
  background: white;
  position: absolute;
  bottom: 20px;
  left: 40px;
  right: 40px;
}

.user-input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 24px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.user-input-area input:focus {
  outline: none;
  border-color: #007bff;
}

.send-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}


/* AI分析建议区域 */
.ai-suggestions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.suggestions-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f5e8;
  color: #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-icon.warning {
  background: #fff3e0;
  color: #f57c00;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.suggestion-text {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 底部操作栏 */
.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.action-btn.primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.action-btn.primary:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .project-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .project-info {
    text-align: center;
  }
  
  .project-progress {
    min-width: 200px;
    align-self: center;
  }
  
  .switch-btn {
    min-width: 200px;
    align-self: center;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--space-4);
  }
  
  .project-overview {
    padding: var(--space-4);
  }
  
  .project-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .project-info {
    text-align: center;
  }
  
  .project-title {
    font-size: var(--text-2xl);
  }
  
  .project-progress {
    min-width: 180px;
    align-self: center;
  }
  
  .switch-btn {
    min-width: 180px;
    align-self: center;
  }
  
  .current-project {
    max-width: 120px;
  }
  
  .project-dropdown {
    min-width: 280px;
    right: -20px;
  }
  
  .task-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }
  
  .filter-tabs {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .task-grid {
    grid-template-columns: 1fr;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-actions {
    flex-direction: column;
  }
}
</style>
