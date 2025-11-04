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
      <h1 class="page-main-title">AI 实验分析助手</h1>
      <!-- AI对话区域 -->
      <div class="ai-chat-section">
        <div class="chat-header">
          <div class="ai-dialog-title">AI对话框</div>
          <button class="view-history-btn" @click="viewChatHistory" title="查看聊天记录">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M3 12H7M17 12H21M12 3V7M12 17V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>查看记录</span>
          </button>
        </div>
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
          <div class="file-menu-wrapper">
            <button 
              class="file-select-btn" 
              @click.stop.prevent="toggleFileMenu"
              :disabled="isSending"
              title="选择文件"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 13H16M8 17H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <!-- 下拉菜单 -->
            <div v-if="showFileMenu" class="file-dropdown-menu">
              <div class="dropdown-item" @click="openFileDialogFromArchive">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>从成果档案打开文件</span>
              </div>
              <div class="dropdown-item" @click="openFileUpload">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>从本地上传文档</span>
              </div>
            </div>
          </div>
          <!-- 隐藏的文件输入 -->
          <input 
            ref="fileInput" 
            type="file" 
            multiple
            style="display: none" 
            @change="handleFileUpload"
          />
          <input
            type="text"
            placeholder="输入您的问题..."
            v-model="userMessage"
            @keyup.enter="sendMessage"
            :disabled="isSending"
          />
          <button class="send-btn" @click="sendMessage" :disabled="!userMessage.trim() || isSending">发送</button>
        </div>
      </div>
    </div>

    <!-- 聊天记录模态框 -->
    <div v-if="showChatHistoryModal" class="chat-history-modal-overlay" @click="closeChatHistoryModal">
      <div class="chat-history-modal" @click.stop>
        <div class="modal-header">
          <h3>聊天记录</h3>
          <button class="close-btn" @click="closeChatHistoryModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="chatSessions.length === 0" class="empty-state">
            <p>暂无聊天记录</p>
          </div>
          <div v-else class="chat-sessions-list">
            <div
              v-for="session in chatSessions"
              :key="session.id"
              class="chat-session-item"
              :class="{ active: session.id === currentChatSessionId }"
              @click="loadChatSession(session.id)"
            >
              <div class="session-info">
                <div class="session-title">{{ session.title || `聊天记录 ${session.id}` }}</div>
                <div class="session-meta">
                  <span class="session-date">{{ formatDate(session.updatedAt) }}</span>
                  <span class="session-count">{{ session.messageCount }} 条消息</span>
                </div>
              </div>
              <button class="delete-session-btn" @click.stop="deleteChatSession(session.id)" title="删除记录">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="createNewChatSession">新建聊天</button>
        </div>
      </div>
    </div>

    <!-- 项目选择弹窗 -->
    <div v-if="showProjectSelectDialog" class="file-dialog-overlay ai-view" @click="closeProjectSelectDialog">
      <div class="file-dialog" @click.stop>
        <div class="file-dialog-header">
          <div class="header-content">
            <h3>选择项目</h3>
            <p class="header-subtitle">请选择要查看成果目录的项目</p>
          </div>
          <button class="close-btn" @click="closeProjectSelectDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="file-dialog-body">
          <div v-if="availableProjects.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="empty-text">暂无项目</p>
          </div>
          <div v-else class="file-list-container">
            <div class="file-list">
              <div
                v-for="project in availableProjects"
                :key="project.id"
                class="file-card"
                :class="{ 'selected': selectedProjectForFiles && selectedProjectForFiles.id === project.id }"
                @click="selectProjectForFiles(project)"
              >
                <div class="file-card-content">
                  <div class="file-card-main">
                    <div class="file-name-wrapper">
                      <div class="file-name">{{ project.title || project.name || '未命名项目' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="file-dialog-footer">
          <button class="btn-cancel" @click="closeProjectSelectDialog">取消</button>
          <button
            class="btn-confirm"
            @click="confirmProjectSelection"
            :disabled="!selectedProjectForFiles"
            :class="{ 'disabled': !selectedProjectForFiles }"
          >
            <span>确认选择</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 文件选择弹窗 -->
    <div v-if="showFileDialog" class="file-dialog-overlay ai-view" @click="closeFileDialog">
      <div class="file-dialog" @click.stop>
        <div class="file-dialog-header">
          <div class="header-content">
            <h3>选择成果目录文件</h3>
            <p class="header-subtitle" v-if="selectedFiles.length > 0">已选择 {{ selectedFiles.length }} 项</p>
          </div>
          <button class="close-btn" @click="closeFileDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="file-dialog-body">
          <div v-if="loadingFiles" class="loading-container">
            <div class="loading-spinner-large"></div>
            <p class="loading-text">正在加载文件列表...</p>
          </div>
          <div v-else-if="files.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="empty-text">成果目录中暂无文件</p>
          </div>
          <div v-else class="file-list-container">
            <div class="file-list">
              <div
                v-for="file in files"
                :key="file.id"
                class="file-card"
                :class="{ 'selected': selectedFiles.includes(file.id) }"
                @click="toggleFileSelection(file.id)"
              >
                <div class="file-card-content">
                  <div class="file-card-main">
                    <div class="file-name-wrapper">
                      <div class="file-name">{{ file.name || file.title || '未命名文件' }}</div>
                      <div class="file-badge-group">
                        <span class="file-type-badge">{{ file.type || '未知类型' }}</span>
                        <span v-if="file.fileCount" class="file-count-badge">{{ file.fileCount }}个文件</span>
                      </div>
                    </div>
                  </div>
                  <div class="file-select-indicator" :class="{ 'active': selectedFiles.includes(file.id) }">
                    <div class="checkmark-circle">
                      <svg v-if="selectedFiles.includes(file.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="file-dialog-footer">
          <button class="btn-cancel" @click="closeFileDialog">取消</button>
          <button
            class="btn-confirm"
            @click="confirmFileSelection"
            :disabled="selectedFiles.length === 0"
            :class="{ 'disabled': selectedFiles.length === 0 }"
          >
            <span>确认选择</span>
            <span v-if="selectedFiles.length > 0" class="selected-count">{{ selectedFiles.length }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import { projectAPI } from '@/api/project'
import { knowledgeAPI } from '@/api/knowledge'
import difyAPI from '@/api/dify'
import '@/assets/styles/AIAssistant.css'
import '@/assets/styles/KnowledgeBaseAI.css'
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
      isSending: false,
      showFileMenu: false,
      showFileDialog: false,
      showProjectSelectDialog: false,
      selectedProjectForFiles: null,
      files: [],
      selectedFiles: [],
      loadingFiles: false,
      showChatHistoryModal: false,
      chatSessions: [], // 聊天会话列表
      currentChatSessionId: null, // 当前聊天会话ID
      difyConversationId: null, // Dify对话上下文ID
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

      // 按状态筛选
      if (this.activeFilter === 'published') {
        // 只显示已发布的任务
        filtered = filtered.filter(task => this.isTaskPublished(task))
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
    
    // 加载聊天会话列表
    this.loadChatSessionsFromStorage()
    
    // 尝试恢复上次的聊天会话
    const lastChatSessionId = localStorage.getItem('lastChatSessionId')
    if (lastChatSessionId) {
      const sessionId = parseInt(lastChatSessionId)
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (session) {
        this.currentChatSessionId = sessionId
        this.chatMessages = session.messages ? [...session.messages] : []
        console.log('已恢复上次的聊天会话:', sessionId)
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    }
    
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

    // 【临时禁用】自动同步功能，避免日志刷屏
    // 用户可以手动点击"同步任务状态"按钮进行同步
    
    // this.syncTimer = setInterval(() => {
    //   this.syncTaskStatusChanges()
    // }, 60000)

    // // 监听任务状态变化事件
    // this.$root.$on('taskStatusChanged', (data) => {
    //   console.log('收到任务状态变化通知:', data)
    //   if (data.projectId === this.currentProject.id) {
    //     console.log('当前项目任务状态发生变化，立即同步')
    //     this.syncTaskStatusChanges()
    //   }
    // })
  },
  beforeDestroy() {
    // 页面销毁前保存当前会话
    if (this.currentChatSessionId && this.chatMessages.length > 0) {
      this.saveCurrentChatSession()
      localStorage.setItem('lastChatSessionId', String(this.currentChatSessionId))
    }
    
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
  
      // 重新加载项目任务数据（只调用一次）
      this.loadProjectTasks(project.id)
    },

    // 同步任务状态变化
    syncTaskStatusChanges() {
      console.log('[同步] 同步任务状态变化...')

      // 只重新加载当前项目的任务数据（不需要重新加载所有项目列表）
      this.loadProjectTasks(this.currentProject.id)

      console.log('[同步] 任务状态同步完成，当前任务数量:', this.tasks.length)
    },
    loadProjectTasks(projectId) {
      // 根据项目ID加载对应的任务数据
      console.log(`[任务加载] 加载项目 ${projectId} 的任务`)

      // 从项目加载任务数据
      const projectTasks = this.loadTasksFromProject(projectId)

      if (projectTasks && projectTasks.length > 0) {
        console.log(`[任务加载] 找到 ${projectTasks.length} 个任务`)
        // 更新任务列表，保持响应式
        this.tasks.splice(0, this.tasks.length, ...projectTasks)
      } else {
        console.log(`[任务加载] 项目 ${projectId} 没有任务`)
        this.tasks.splice(0, this.tasks.length)
      }
    },
    async loadUserProjects() {
      console.log('[项目加载] 开始加载用户参加的项目...')

      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        console.log('[项目加载] 用户未登录，使用默认项目数据')
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
          
          console.log(`[项目加载] 成功加载 ${userProjects.length} 个用户项目`)
          
          // 不在这里为所有项目加载任务，避免产生大量日志
          // 任务会在切换到具体项目时按需加载
          
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
      // 首先尝试从项目广场的任务存储格式加载（直接从项目的tasks字段）
      const projectSquareTasks = this.loadTasksFromProjectSquare(projectId)
      if (projectSquareTasks.length > 0) {
        return projectSquareTasks
      }

      // 如果是默认项目，从projectTasks中加载
      if (this.projectTasks[projectId]) {
        return this.projectTasks[projectId]
      }

      return []
    },

    // 从项目广场加载任务数据
    loadTasksFromProjectSquare(projectId) {
      // 获取项目信息
      const projects = JSON.parse(localStorage.getItem('projects') || '[]')
      // 使用字符串比较，避免类型不一致导致找不到项目
      const project = projects.find(p => String(p.id) === String(projectId))

      if (!project) {
        return []
      }

      // 直接从项目的tasks字段获取任务
      if (project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0) {

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
    async sendMessage() {
      console.log('sendMessage called, userMessage:', this.userMessage)
      if (!this.userMessage.trim() || this.isSending) {
        console.log('Message is empty or already sending, not sending')
        return
      }

      // 如果没有当前会话，创建一个新的
      if (!this.currentChatSessionId) {
        this.currentChatSessionId = Date.now()
      }

      console.log('Adding user message to chat')
      const messageContent = this.userMessage.trim()
      
      // 添加用户消息
      const userMsg = {
        id: Date.now(),
        type: 'user',
        content: messageContent,
        timestamp: new Date()
      }
      this.chatMessages.push(userMsg)
      console.log('Chat messages after adding user message:', this.chatMessages)

      // 保存当前会话
      this.saveCurrentChatSession()

      // 清空输入框
      this.userMessage = ''
      console.log('Input cleared')
      
      // 设置发送状态
      this.isSending = true

      // 创建一个AI消息占位符用于流式响应
      const aiMsg = {
        id: Date.now() + 1,
        type: 'ai',
        content: '',
        timestamp: new Date()
      }
      this.chatMessages.push(aiMsg)
      const aiMessageIndex = this.chatMessages.length - 1

      // 滚动到最新消息
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      try {
        // 获取用户ID作为Dify的user标识
        const userId = localStorage.getItem('userId') || 'default-user'
        
        console.log('[AI助手] 开始调用Dify API, user:', userId, 'conversationId:', this.difyConversationId)
        
        // 调用Dify流式API（通过后端代理）
        await difyAPI.sendChatMessageStream(
          messageContent,
          this.difyConversationId,
          // onMessage回调：接收流式消息片段
          (answerDelta, data) => {
            console.log('[AI助手] 收到Dify消息片段:', answerDelta, '当前总长度:', this.chatMessages[aiMessageIndex].content.length)
            // 追加内容到AI消息 - 使用Vue.set确保响应式更新
            const currentContent = this.chatMessages[aiMessageIndex].content
            this.$set(this.chatMessages[aiMessageIndex], 'content', currentContent + answerDelta)
            console.log('[AI助手] 更新后总长度:', this.chatMessages[aiMessageIndex].content.length)
            // 滚动到底部
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          },
          // onEnd回调：流结束
          (data) => {
            console.log('Dify响应完成')
            // 保存conversation_id以便后续对话能保持上下文
            if (data && data.conversation_id) {
              this.difyConversationId = data.conversation_id
              console.log('保存Dify对话ID:', this.difyConversationId)
            }
            
            // 保存会话（包含AI回复）
            this.saveCurrentChatSession()
            
            // 重置发送状态
            this.isSending = false
            
            // 最终滚动到最新消息
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          },
          // onError回调：错误处理
          (error) => {
            console.error('Dify API错误:', error)
            this.chatMessages[aiMessageIndex].content = '抱歉，AI服务暂时不可用，请稍后再试。'
            this.isSending = false
            
            // 保存会话（包含错误消息）
            this.saveCurrentChatSession()
            
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          }
        )
      } catch (error) {
        console.error('发送消息失败:', error)
        this.chatMessages[aiMessageIndex].content = '抱歉，发送消息时出现错误，请稍后再试。'
        this.isSending = false
        
        // 保存会话（包含错误消息）
        this.saveCurrentChatSession()
        
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
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
      // 处理文件菜单点击外部关闭
      if (this.showFileMenu && !event.target.closest('.file-menu-wrapper')) {
        this.showFileMenu = false
      }
    },
    
    // 切换文件菜单显示
    toggleFileMenu() {
      this.showFileMenu = !this.showFileMenu
    },
    
    // 从成果档案打开文件
    async openFileDialogFromArchive() {
      this.showFileMenu = false
      
      // 必须先选择项目（每次都弹出项目选择弹窗）
      this.showProjectSelectDialog = true
      this.selectedProjectForFiles = null
      // 清空之前的文件列表，确保重新选择项目后会重新加载
      this.files = []
    },
    
    // 打开文件上传
    openFileUpload() {
      this.showFileMenu = false
      this.$refs.fileInput.click()
    },
    
    // 处理文件上传
    handleFileUpload(event) {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        console.log('选择了本地文件:', files)
        // 将文件名添加到输入框
        const fileNames = files.map(file => file.name).join('、')
        const fileInfo = `我已上传以下文档：${fileNames}`
        this.userMessage = this.userMessage.trim() 
          ? `${this.userMessage}\n\n${fileInfo}`
          : fileInfo
        
        // 这里可以添加文件上传到后端的逻辑
        // TODO: 实现文件上传功能
      }
      // 清空文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    // 关闭项目选择弹窗
    closeProjectSelectDialog() {
      this.showProjectSelectDialog = false
      this.selectedProjectForFiles = null
    },
    
    // 选择项目
    selectProjectForFiles(project) {
      this.selectedProjectForFiles = project
    },
    
    // 确认项目选择
    async confirmProjectSelection() {
      if (!this.selectedProjectForFiles) return
      
      console.log('确认选择项目:', this.selectedProjectForFiles)
      
      // 先保存项目ID（在关闭弹窗前保存）
      const projectId = this.selectedProjectForFiles.id
      
      // 关闭项目选择弹窗
      this.closeProjectSelectDialog()
      
      // 打开文件选择弹窗（完全按照KnowledgeBaseAI.vue的openFileDialogFromArchive方式）
      this.showFileDialog = true
      this.selectedFiles = []
      
      // 每次选择项目后都重新加载文件（确保显示的是选中项目的成果）
      if (projectId) {
        await this.loadFiles(projectId)
      }
    },
    
    // 关闭文件选择弹窗（完全按照KnowledgeBaseAI.vue的方式）
    closeFileDialog() {
      this.showFileDialog = false
      this.selectedFiles = []
    },
    
    // 加载成果目录文件列表（完全照搬KnowledgeBaseAI.vue的方法）
    async loadFiles(projectId) {
      if (!projectId) {
        console.warn('项目ID不存在，无法加载文件列表')
        return
      }
      
      this.loadingFiles = true
      try {
        const response = await knowledgeAPI.getProjectAchievements(projectId, 0, 1000)
        console.log('获取成果列表响应:', response)
        
        if (response && response.code === 200 && response.data) {
          if (Array.isArray(response.data)) {
            this.files = response.data
          } else if (response.data.content && Array.isArray(response.data.content)) {
            this.files = response.data.content
          } else {
            this.files = []
          }
          console.log('加载成果文件列表成功，数量:', this.files.length)
          // 调试：打印第一个文件的详细信息
          if (this.files.length > 0) {
            console.log('第一个成果文件:', this.files[0])
            console.log('文件字段:', Object.keys(this.files[0]))
          }
        } else {
          this.files = []
          console.warn('获取成果列表失败:', response)
        }
      } catch (error) {
        console.error('加载成果文件列表失败:', error)
        this.files = []
      } finally {
        this.loadingFiles = false
      }
    },
    
    // 切换文件选择状态
    toggleFileSelection(fileId) {
      const index = this.selectedFiles.indexOf(fileId)
      if (index > -1) {
        this.selectedFiles.splice(index, 1)
      } else {
        this.selectedFiles.push(fileId)
      }
    },
    
    // 确认选择文件（完全照搬KnowledgeBaseAI.vue的方法）
    confirmFileSelection() {
      if (this.selectedFiles.length === 0) return
      
      const selectedFileNames = this.files
        .filter(file => this.selectedFiles.includes(file.id))
        .map(file => file.name || file.title || '未命名文件')
        .join('、')
      
      // 将选中的文件信息添加到输入框
      const fileInfo = `请参考以下成果目录文件：${selectedFileNames}`
      this.userMessage = this.userMessage.trim() 
        ? `${this.userMessage}\n\n${fileInfo}`
        : fileInfo
      
      // 可以在这里添加逻辑，将选中的文件ID保存或发送给后端
      console.log('选中的文件ID:', this.selectedFiles)
      console.log('选中的文件:', this.files.filter(file => this.selectedFiles.includes(file.id)))
      
      this.closeFileDialog()
    },
    
    // 查看聊天记录
    viewChatHistory() {
      this.loadChatSessionsFromStorage()
      this.showChatHistoryModal = true
    },
    
    // 关闭聊天记录模态框
    closeChatHistoryModal() {
      this.showChatHistoryModal = false
    },
    
    // 从localStorage加载聊天会话列表
    loadChatSessionsFromStorage() {
      try {
        const saved = localStorage.getItem('aiChatSessions')
        if (saved) {
          this.chatSessions = JSON.parse(saved)
          // 按更新时间倒序排列
          this.chatSessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        } else {
          this.chatSessions = []
        }
      } catch (error) {
        console.error('加载聊天会话失败:', error)
        this.chatSessions = []
      }
    },
    
    // 保存聊天会话列表到localStorage
    saveChatSessionsToStorage() {
      try {
        localStorage.setItem('aiChatSessions', JSON.stringify(this.chatSessions))
      } catch (error) {
        console.error('保存聊天会话失败:', error)
      }
    },
    
    // 创建新的聊天会话
    createNewChatSession() {
      // 如果有当前会话，先保存它
      if (this.currentChatSessionId && this.chatMessages.length > 0) {
        this.saveCurrentChatSession()
      }
      
      // 创建新会话
      const newSessionId = Date.now()
      const newSession = {
        id: newSessionId,
        title: '新聊天',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      }
      
      this.chatSessions.unshift(newSession)
      this.currentChatSessionId = newSessionId
      this.chatMessages = []
      this.difyConversationId = null // 重置Dify对话ID，开始新的对话上下文
      localStorage.setItem('lastChatSessionId', String(newSessionId))
      this.saveChatSessionsToStorage()
      this.closeChatHistoryModal()
      
      console.log('创建新聊天会话:', newSessionId)
    },
    
    // 加载指定的聊天会话
    loadChatSession(sessionId) {
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (!session) {
        console.warn('未找到聊天会话:', sessionId)
        return
      }
      
      // 保存当前会话（如果有）
      if (this.currentChatSessionId && this.currentChatSessionId !== sessionId && this.chatMessages.length > 0) {
        this.saveCurrentChatSession()
      }
      
      // 加载选中的会话
      this.currentChatSessionId = sessionId
      this.chatMessages = session.messages ? [...session.messages] : []
      this.difyConversationId = null // 切换会话时重置Dify对话ID，开始新的对话上下文
      localStorage.setItem('lastChatSessionId', String(sessionId))
      
      this.closeChatHistoryModal()
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      console.log('加载聊天会话:', sessionId, '消息数量:', this.chatMessages.length)
    },
    
    // 保存当前聊天会话
    saveCurrentChatSession() {
      if (!this.currentChatSessionId) return
      
      const sessionIndex = this.chatSessions.findIndex(s => s.id === this.currentChatSessionId)
      if (sessionIndex === -1) {
        // 如果会话不存在，创建新会话
        const newSession = {
          id: this.currentChatSessionId,
          title: this.generateSessionTitle(),
          messages: [...this.chatMessages],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: this.chatMessages.length
        }
        this.chatSessions.unshift(newSession)
      } else {
        // 更新现有会话
        this.chatSessions[sessionIndex].messages = [...this.chatMessages]
        this.chatSessions[sessionIndex].updatedAt = new Date().toISOString()
        this.chatSessions[sessionIndex].messageCount = this.chatMessages.length
        // 如果没有标题，生成一个
        if (!this.chatSessions[sessionIndex].title || this.chatSessions[sessionIndex].title === '新聊天') {
          this.chatSessions[sessionIndex].title = this.generateSessionTitle()
        }
      }
      
      this.saveChatSessionsToStorage()
    },
    
    // 生成会话标题（使用第一条用户消息的前20个字符）
    generateSessionTitle() {
      const firstUserMessage = this.chatMessages.find(msg => msg.type === 'user')
      if (firstUserMessage && firstUserMessage.content) {
        const title = firstUserMessage.content.trim()
        return title.length > 20 ? title.substring(0, 20) + '...' : title
      }
      return '新聊天'
    },
    
    // 删除聊天会话
    deleteChatSession(sessionId) {
      if (!confirm('确定要删除这条聊天记录吗？')) {
        return
      }
      
      const index = this.chatSessions.findIndex(s => s.id === sessionId)
      if (index !== -1) {
        this.chatSessions.splice(index, 1)
        this.saveChatSessionsToStorage()
        
        // 如果删除的是当前会话，清空聊天消息
        if (sessionId === this.currentChatSessionId) {
          this.currentChatSessionId = null
          this.chatMessages = []
          localStorage.removeItem('lastChatSessionId')
        }
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }
}

</script>
