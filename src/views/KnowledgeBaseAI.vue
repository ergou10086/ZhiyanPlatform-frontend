<template>
  <div class="ai-view">
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-text">AI赋能助手</span>
        <div class="title-decoration"></div>
      </h1>
      <p class="page-subtitle">
        <svg class="subtitle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        智能问答与内容生成服务，助力您的研究工作
      </p>
    </div>

    <div class="chat-card">
      <div class="chat-window" ref="chatWindow">
        <div class="bubble left">
          您好！我是您的AI助手，可以帮您生成文档结构提纲、关键词摘要，也可以结合知识库回答问题。请问您有什么要协助的吗？
        </div>
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="bubble" 
          :class="message.type"
        >
          {{ message.content }}
        </div>
      </div>
      <div class="composer">
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
          class="composer-input" 
          type="text" 
          placeholder="输入您的问题..."
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          :disabled="isSending"
        />
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isSending"
        >
          <svg v-if="!isSending" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
      </div>

      <!-- 文件选择弹窗 -->
      <div v-if="showFileDialog" class="file-dialog-overlay" @click="closeFileDialog">
        <div class="file-dialog" @click.stop>
          <!-- 顶部标题栏 -->
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

          <!-- 内容区域 -->
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

          <!-- 底部操作栏 -->
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
  </div>
</template>

<script>
import '@/assets/styles/KnowledgeBaseAI.css'
import { knowledgeAPI } from '@/api/knowledge'
import { cozeAPI } from '@/api/coze'

export default {
  name: 'KnowledgeBaseAI',
  props: {
    projectId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      inputMessage: '',
      isSending: false,
      messages: [],
      showFileDialog: false,
      showFileMenu: false,
      files: [],
      loadingFiles: false,
      selectedFiles: [],
      selectedLocalFiles: [], // 选中的本地文件
      selectedKnowledgeFileIds: [], // 选中的知识库文件ID
      conversationId: null, // 对话ID，用于维持会话
      currentStreamController: null // 当前流式响应的控制器
    }
  },
  mounted() {
    // 组件挂载时加载本地存储的消息和对话ID
    this.loadMessagesFromStorage()
    this.loadConversationId()
    // 点击外部关闭下拉菜单
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    // 关闭当前的流式连接
    if (this.currentStreamController) {
      this.currentStreamController.close()
      this.currentStreamController = null
    }
    // 组件销毁前保存消息和对话ID
    this.saveMessagesToStorage()
    this.saveConversationId()
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isSending) return
      
      const userMessage = {
        id: Date.now(),
        type: 'right',
        content: this.inputMessage.trim()
      }
      
      // 记录用户发送的文件信息（如果有）
      if (this.selectedLocalFiles.length > 0 || this.selectedKnowledgeFileIds.length > 0) {
        const fileInfo = []
        if (this.selectedLocalFiles.length > 0) {
          fileInfo.push(`本地文件: ${this.selectedLocalFiles.map(f => f.name).join(', ')}`)
        }
        if (this.selectedKnowledgeFileIds.length > 0) {
          const selectedFileNames = this.files
            .filter(file => this.selectedKnowledgeFileIds.includes(file.id))
            .map(file => file.name || file.title || '未命名文件')
          fileInfo.push(`知识库文件: ${selectedFileNames.join(', ')}`)
        }
        userMessage.content += '\n\n[' + fileInfo.join(' | ') + ']'
      }
      
      this.messages.push(userMessage)
      const query = this.inputMessage.trim()
      this.inputMessage = ''
      this.isSending = true
      
      // 创建AI回复消息占位符
      const aiMessageId = Date.now() + 1
      const aiMessage = {
        id: aiMessageId,
        type: 'left',
        content: ''
      }
      this.messages.push(aiMessage)
      
      // 保存消息到本地存储
      this.saveMessagesToStorage()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      try {
        // 准备本地文件和知识库文件ID
        const localFiles = this.selectedLocalFiles.length > 0 ? this.selectedLocalFiles : null
        const knowledgeFileIds = this.selectedKnowledgeFileIds.length > 0 ? this.selectedKnowledgeFileIds.map(id => {
          // 确保ID是数字类型
          const numId = typeof id === 'string' ? parseInt(id, 10) : id
          return isNaN(numId) ? null : numId
        }).filter(id => id !== null) : null
        
        // 清空选中的文件
        this.selectedLocalFiles = []
        this.selectedKnowledgeFileIds = []
        
        // 判断是否需要调用带文件的接口
        if (localFiles || knowledgeFileIds) {
          // 调用带文件的流式对话接口
          this.currentStreamController = await cozeAPI.chatStreamWithFiles(
            query,
            this.conversationId,
            localFiles,
            knowledgeFileIds,
            null, // customVariables
            (message) => {
              // 处理流式消息
              this.handleStreamMessage(message, aiMessage)
            },
            (error) => {
              // 处理错误
              this.handleStreamError(error, aiMessage)
            },
            () => {
              // 流式响应完成
              this.handleStreamComplete(aiMessage)
            }
          )
        } else {
          // 调用不带文件的流式对话接口
          this.currentStreamController = await cozeAPI.chatStream(
            query,
            this.conversationId,
            null, // customVariables
            (message) => {
              // 处理流式消息
              this.handleStreamMessage(message, aiMessage)
            },
            (error) => {
              // 处理错误
              this.handleStreamError(error, aiMessage)
            },
            () => {
              // 流式响应完成
              this.handleStreamComplete(aiMessage)
            }
          )
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        aiMessage.content = '抱歉，发送消息时发生错误：' + (error.message || '未知错误')
        this.isSending = false
        this.saveMessagesToStorage()
      }
    },
    
    /**
     * 处理流式消息
     */
    handleStreamMessage(message, aiMessage) {
      console.log('收到流式消息:', message)
      
      // 根据事件类型处理
      const event = message.event
      
      // 保存对话ID（如果有）
      if (message.conversationId || message.conversation_id) {
        this.conversationId = message.conversationId || message.conversation_id
        this.saveConversationId()
      }
      
      // 处理不同类型的消息
      if (event === 'conversation.chat.created') {
        // 对话创建
        console.log('对话已创建, conversationId:', this.conversationId)
      } else if (event === 'conversation.message.delta') {
        // 消息增量（流式文本块）
        const content = message.content
        if (content && message.role === 'assistant') {
          // 追加新内容
          aiMessage.content += content
          
          // 实时滚动到底部
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } else if (event === 'conversation.message.completed') {
        // 消息完成
        console.log('消息已完成')
        // 如果消息已完成，确保内容已保存
        if (message.content && message.role === 'assistant') {
          // 如果content存在，可能是完整内容，确保设置
          if (message.content && !aiMessage.content) {
            aiMessage.content = message.content
          }
        }
        this.saveMessagesToStorage()
      } else if (event === 'conversation.chat.completed') {
        // 对话完成
        console.log('对话已完成')
      } else if (event === 'conversation.chat.failed') {
        // 对话失败
        console.error('对话失败:', message.errorMessage || message.error_message)
        aiMessage.content = aiMessage.content || '抱歉，AI对话失败：' + (message.errorMessage || message.error_message || '未知错误')
        this.isSending = false
        this.currentStreamController = null
        this.saveMessagesToStorage()
      } else if (event === 'done') {
        // 结束标记
        console.log('流式响应结束')
      } else if (event === 'error') {
        // 错误
        console.error('流式响应错误:', message.errorMessage || message.error_message)
        aiMessage.content = aiMessage.content || '抱歉，AI响应时发生错误：' + (message.errorMessage || message.error_message || '未知错误')
        this.isSending = false
        this.currentStreamController = null
        this.saveMessagesToStorage()
      }
      
      // 实时保存消息（对于增量更新）
      if (event === 'conversation.message.delta') {
        this.saveMessagesToStorage()
      }
    },
    
    /**
     * 处理流式响应错误
     */
    handleStreamError(error, aiMessage) {
      console.error('流式响应错误:', error)
      aiMessage.content = aiMessage.content || '抱歉，AI响应时发生错误：' + (error.message || '未知错误')
      this.isSending = false
      this.currentStreamController = null
      this.saveMessagesToStorage()
    },
    
    /**
     * 处理流式响应完成
     */
    handleStreamComplete(aiMessage) {
      console.log('流式响应完成')
        this.isSending = false
      this.currentStreamController = null
      
      // 如果AI消息为空，添加一个提示
      if (!aiMessage.content || aiMessage.content.trim() === '') {
        aiMessage.content = '抱歉，AI没有返回任何内容。'
      }
      
      this.saveMessagesToStorage()
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    scrollToBottom() {
      if (this.$refs.chatWindow) {
        this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight
      }
    },
    
    saveMessagesToStorage() {
      try {
        const storageKey = this.projectId ? `aiChatMessages_${this.projectId}` : 'aiChatMessages'
        localStorage.setItem(storageKey, JSON.stringify(this.messages))
        console.log(`AI对话数据已保存到本地存储 (项目ID: ${this.projectId})`)
      } catch (error) {
        console.error('保存消息失败:', error)
      }
    },
    
    saveConversationId() {
      try {
        const storageKey = this.projectId ? `aiConversationId_${this.projectId}` : 'aiConversationId'
        if (this.conversationId) {
          localStorage.setItem(storageKey, this.conversationId)
          console.log(`对话ID已保存: ${this.conversationId}`)
        }
      } catch (error) {
        console.error('保存对话ID失败:', error)
      }
    },
    
    loadConversationId() {
      try {
        const storageKey = this.projectId ? `aiConversationId_${this.projectId}` : 'aiConversationId'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          this.conversationId = saved
          console.log(`对话ID已加载: ${this.conversationId}`)
        }
      } catch (error) {
        console.error('加载对话ID失败:', error)
      }
    },
    
    loadMessagesFromStorage() {
      try {
        const storageKey = this.projectId ? `aiChatMessages_${this.projectId}` : 'aiChatMessages'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          this.messages = JSON.parse(saved)
          console.log(`AI对话数据已从本地存储加载 (项目ID: ${this.projectId})`)
        } else {
          // 如果没有保存的消息，保持空数组
          this.messages = []
        }
      } catch (error) {
        console.error('加载消息失败:', error)
      }
    },
    
    // 初始化项目特定的对话（不再使用示例数据）
    initializeProjectMessages() {
      // 不再初始化示例对话，保持空数组
      this.messages = []
    },
    
    // 切换文件菜单显示
    toggleFileMenu() {
      this.showFileMenu = !this.showFileMenu
    },
    
    // 从成果档案打开文件
    async openFileDialogFromArchive() {
      this.showFileMenu = false
      this.showFileDialog = true
      this.selectedFiles = []
      if (this.files.length === 0 && this.projectId) {
        await this.loadFiles()
      }
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
        // 保存选中的本地文件
        this.selectedLocalFiles = files
        
        // 将文件名添加到输入框提示
        const fileNames = files.map(file => file.name).join('、')
        const fileInfo = `[已选择本地文件: ${fileNames}]`
        this.inputMessage = this.inputMessage.trim() 
          ? `${this.inputMessage}\n\n${fileInfo}`
          : fileInfo
      }
      // 清空文件输入
      this.$refs.fileInput.value = ''
    },
    
    // 关闭文件选择弹窗
    closeFileDialog() {
      this.showFileDialog = false
      this.selectedFiles = []
    },
    
    // 清除对话历史
    clearConversation() {
      if (confirm('确定要清除当前对话历史吗？')) {
        this.messages = []
        this.conversationId = null
        this.selectedLocalFiles = []
        this.selectedKnowledgeFileIds = []
        this.saveMessagesToStorage()
        this.saveConversationId()
        // 关闭当前流式连接
        if (this.currentStreamController) {
          this.currentStreamController.close()
          this.currentStreamController = null
        }
        this.isSending = false
      }
    },
    
    // 加载成果目录文件列表
    async loadFiles() {
      if (!this.projectId) {
        console.warn('项目ID不存在，无法加载文件列表')
        return
      }
      
      this.loadingFiles = true
      try {
        const response = await knowledgeAPI.getProjectAchievements(this.projectId, 0, 1000)
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
    
    // 确认选择文件
    async confirmFileSelection() {
      if (this.selectedFiles.length === 0) return
      
      // 获取选中的成果对象
      const selectedAchievements = this.files.filter(file => this.selectedFiles.includes(file.id))
      
      // 收集所有成果的文件ID
      const allFileIds = []
      const selectedFileNames = []
      
      try {
        // 为每个选中的成果获取文件列表
        for (const achievement of selectedAchievements) {
          try {
            // 获取成果详情（包含文件列表）
            const detailResponse = await knowledgeAPI.getAchievementDetail(achievement.id)
            if (detailResponse && detailResponse.code === 200 && detailResponse.data) {
              const files = detailResponse.data.files || []
              // 提取文件ID并添加到列表
              files.forEach(file => {
                if (file.id) {
                  const fileId = typeof file.id === 'string' ? parseInt(file.id, 10) : file.id
                  if (!isNaN(fileId)) {
                    allFileIds.push(fileId)
                  }
                }
              })
              
              // 记录文件名
              if (files.length > 0) {
                const fileNames = files.map(f => f.fileName || '未命名文件').join(', ')
                selectedFileNames.push(`${achievement.title || achievement.name || '成果'}: ${fileNames}`)
              } else {
                selectedFileNames.push(`${achievement.title || achievement.name || '成果'}: 无文件`)
              }
            }
          } catch (error) {
            console.error(`获取成果 ${achievement.id} 的文件列表失败:`, error)
            selectedFileNames.push(`${achievement.title || achievement.name || '成果'}: 获取文件失败`)
          }
        }
        
        // 保存选中的知识库文件ID
        this.selectedKnowledgeFileIds = allFileIds
        
        // 将选中的文件信息添加到输入框提示
        const fileInfo = `[已选择知识库文件: ${selectedFileNames.join(' | ')}]`
      this.inputMessage = this.inputMessage.trim() 
        ? `${this.inputMessage}\n\n${fileInfo}`
        : fileInfo
      
        console.log('选中的知识库文件ID:', this.selectedKnowledgeFileIds)
        console.log('选中的成果:', selectedAchievements)
      } catch (error) {
        console.error('确认文件选择失败:', error)
        this.$message && this.$message.error('获取文件信息失败，请重试')
      }
      
      this.closeFileDialog()
    },
    
    // 处理点击外部关闭下拉菜单
    handleClickOutside(event) {
      if (this.showFileMenu && !event.target.closest('.file-menu-wrapper')) {
        this.showFileMenu = false
      }
    }
  }
}
</script>
