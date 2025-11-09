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
      <!-- 主内容布局：左侧对话区域，右侧文件列表 -->
      <div class="main-layout">
        <!-- AI对话区域 -->
        <div class="ai-chat-section">
        <div class="chat-header">
          <button class="view-history-btn" @click="viewChatHistory" title="查看聊天记录">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M3 12H7M17 12H21M12 3V7M12 17V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="ai-dialog-title">AI对话框</div>
        </div>
        <div class="chat-container" ref="chatContainer">
          <div
            v-for="(message, index) in chatMessages"
            :key="message.id"
            :class="message.type === 'ai' ? 'ai-message' : 'user-message'"
          >
            <div class="message-wrapper">
              <div :class="message.type === 'ai' ? 'message-bubble ai-bubble' : 'user-bubble'">
                <!-- AI消息：支持Markdown渲染和光标闪烁 -->
                <div v-if="message.type === 'ai'" class="ai-content">
                  <!-- ⭐ 修复：打字时显示纯文本，避免不完整内容被错误格式化 -->
                  <span v-if="isTyping && currentTypingMessageIndex === index" style="white-space: pre-wrap;">{{ message.content }}</span>
                  <!-- 打字完成后才进行Markdown格式化 -->
                  <span v-else v-html="formatMarkdown(message.content)"></span>
                  <!-- 打字光标（仅在打字时显示） -->
                  <span v-if="isTyping && currentTypingMessageIndex === index" class="typing-cursor">|</span>
                </div>
                <!-- 用户消息：普通文本 -->
                <template v-else>{{ message.content }}</template>
              </div>
              <!-- ⭐ 复制按钮 -->
              <button 
                class="copy-message-btn" 
                @click="copyMessage(message.content, index)"
                :title="copiedMessageIndex === index ? '已复制!' : '复制内容'"
              >
                <svg v-if="copiedMessageIndex !== index" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
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
          <textarea
            placeholder="输入您的问题..."
            v-model="userMessage"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact=""
            @input="autoResizeTextarea"
            :disabled="isSending"
            ref="messageTextarea"
            rows="1"
          ></textarea>
          <button 
            class="send-btn" 
            :class="{ 'stop-btn': isSending }"
            @click="isSending ? stopSending() : sendMessage()" 
            :disabled="!isSending && !userMessage.trim()"
          >
            <span v-if="!isSending">发送</span>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="12" height="12" fill="currentColor" rx="2"/>
            </svg>
          </button>
        </div>
        </div>

        <!-- 右侧已上传文件列表 -->
        <div class="uploaded-files-panel">
          <div class="files-panel-header">
            <h3 class="files-panel-title">已上传文件</h3>
            <button
              class="clear-files-btn"
              @click="clearAllFiles"
              v-if="uploadedFiles.length > 0"
              title="清空所有文件"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="files-panel-body">
            <div v-if="uploadedFiles.length === 0" class="empty-files">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 13H16M8 17H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>暂无已上传文件</p>
            </div>
            <div v-else class="files-list">
              <div
                v-for="file in uploadedFiles"
                :key="file.id || file.name"
                class="file-item"
              >
                <div class="file-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="file-info">
                  <div class="file-name" :title="file.name || file.title">{{ file.name || file.title || '未命名文件' }}</div>
                  <div class="file-type" v-if="file.type || file.typeName">{{ file.type || file.typeName }}</div>
                </div>
                <button
                  class="file-remove-btn"
                  @click="removeFile(file)"
                  title="移除文件"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天记录侧边栏 -->
    <div v-if="showChatHistoryModal" class="chat-history-sidebar-overlay" @click="closeChatHistoryModal">
      <div class="chat-history-sidebar" @click.stop>
        <div class="sidebar-header">
          <h3>聊天记录</h3>
          <button class="close-btn" @click="closeChatHistoryModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="sidebar-body">
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
        <div class="sidebar-footer">
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

// ⭐ Markdown渲染和代码高亮
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // 代码高亮主题

// 配置 marked 选项
marked.setOptions({
  highlight: function(code, lang) {
    // 代码高亮
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('代码高亮失败:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true, // 支持GitHub风格的换行
  gfm: true, // 启用GitHub风格的Markdown
  tables: true, // 支持表格
  sanitize: false, // 不进行HTML清理（我们信任AI的输出）
  smartLists: true, // 智能列表
  smartypants: true // 智能标点符号
})

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
      uploadedFiles: [], // 已上传文件列表
      loadingFiles: false,
      showChatHistoryModal: false,
      chatSessions: [], // 聊天会话列表
      currentChatSessionId: null, // 当前聊天会话ID
      difyConversationId: null, // Dify对话上下文ID
      currentProject: null,
      availableProjects: [],
      tasks: [],
      // 不同项目的任务数据
      projectTasks: {},
      // ⭐ 打字机效果相关
      typewriterTimer: null, // 打字机定时器
      typewriterQueue: '', // 打字机字符队列
      isTyping: false, // 是否正在打字
      currentTypingMessageIndex: -1, // 当前正在打字的消息索引
      // 流式请求控制
      currentStreamController: null, // 当前流式请求的控制器
      currentAbortController: null, // 用于中断请求的AbortController
      // ⭐ 复制功能状态
      copiedMessageIndex: null // 当前已复制的消息索引
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
    
    // 初始化聊天框底部间距
    this.$nextTick(() => {
      this.autoResizeTextarea()
    })
    
    // 尝试恢复上次的聊天会话
    const lastChatSessionId = localStorage.getItem('lastChatSessionId')
    if (lastChatSessionId) {
      // 保持ID为字符串类型，避免精度丢失
      const sessionId = String(lastChatSessionId)
      const session = this.chatSessions.find(s => String(s.id) === sessionId)
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
            console.log('未找到上次选中的项目，使用第一个可用项目')
            // 使用第一个可用项目
            if (this.availableProjects.length > 0) {
              this.currentProject = { ...this.availableProjects[0] }
              this.loadProjectTasks(this.currentProject.id)
            }
          }
        } catch (error) {
          console.error('恢复上次选中的项目失败:', error)
          // 恢复失败时使用第一个可用项目
          if (this.availableProjects.length > 0) {
            this.currentProject = { ...this.availableProjects[0] }
            this.loadProjectTasks(this.currentProject.id)
          }
        }
      } else {
        // 没有保存的项目，使用第一个可用项目
        if (this.availableProjects.length > 0) {
          this.currentProject = { ...this.availableProjects[0] }
          this.loadProjectTasks(this.currentProject.id)
        }
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

    // ⭐ 清理打字机定时器
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer)
      this.typewriterTimer = null
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
      if (this.currentProject && this.currentProject.id) {
        this.loadProjectTasks(this.currentProject.id)
        console.log('[同步] 任务状态同步完成，当前任务数量:', this.tasks.length)
      } else {
        console.log('[同步] 没有当前项目，跳过任务同步')
      }
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
            if (!this.currentProject || !this.currentProject.id) {
              // 如果没有当前项目，设置为第一个项目
              this.currentProject = { ...this.availableProjects[0] }
              this.loadProjectTasks(this.currentProject.id)
            } else {
              const currentProjectExists = this.availableProjects.find(p => String(p.id) === String(this.currentProject.id))
              if (!currentProjectExists) {
                this.currentProject = { ...this.availableProjects[0] }
                // 加载新项目的任务
                this.loadProjectTasks(this.currentProject.id)
              }
            }
          } else {
            // 没有可用项目，清空当前项目
            this.currentProject = null
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

      // 不再使用硬编码的示例任务数据
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
      this.projectTasks = {}

      // 重新加载用户项目
      this.loadUserProjects()

      // 重新加载当前项目的任务
      if (this.currentProject && this.currentProject.id) {
        this.loadProjectTasks(this.currentProject.id)
      }

      console.log('刷新完成')
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
    autoResizeTextarea() {
      const textarea = this.$refs.messageTextarea
      if (textarea) {
        // 重置高度以获取正确的scrollHeight
        textarea.style.height = 'auto'
        
        // 获取单行高度（包括padding）
        const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 21
        const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 16
        const paddingBottom = parseFloat(getComputedStyle(textarea).paddingBottom) || 16
        const singleLineHeight = lineHeight + paddingTop + paddingBottom
        
        // 设置新高度，但不超过最大高度
        const newHeight = Math.min(textarea.scrollHeight, 200)
        textarea.style.height = newHeight + 'px'
        
        // 单行时不显示滚动条，多行时显示
        // 如果内容高度小于等于单行高度，则隐藏滚动条
        if (textarea.scrollHeight <= singleLineHeight) {
          textarea.style.overflowY = 'hidden'
        } else {
          textarea.style.overflowY = 'auto'
        }
      }
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
      
      // 重置 textarea 高度
      this.$nextTick(() => {
        this.autoResizeTextarea()
      })
      
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
        console.log('[AI助手] 已上传文件数量:', this.uploadedFiles.length)

        // 区分知识库文件和本地文件
        const knowledgeFileIds = []
        const localFiles = []

        this.uploadedFiles.forEach(file => {
          if (file.isLocal) {
            // 本地文件
            if (file.file) {
              localFiles.push(file.file)
            }
          } else {
            // 知识库文件（成果档案文件）
            if (file.id || file.fileId) {
              knowledgeFileIds.push(file.id || file.fileId)
            }
          }
        })

        console.log('[AI助手] 知识库文件ID:', knowledgeFileIds)
        console.log('[AI助手] 本地文件:', localFiles.map(f => f.name))

        // 判断是否有文件需要上传
        const hasFiles = knowledgeFileIds.length > 0 || localFiles.length > 0

        // 回调函数（相同的处理逻辑）
        const onMessage = (answerDelta, data) => {
          console.log('[AI助手] 📥 收到消息片段 [长度:' + answerDelta.length + ']:', answerDelta.substring(0, 50))
          console.log('[AI助手] 🎯 调用 startTypewriter, aiMessageIndex:', aiMessageIndex)
          this.startTypewriter(aiMessageIndex, answerDelta)
          console.log('[AI助手] ✅ startTypewriter 调用完成')
        }

        const onEnd = (data) => {
          console.log('[AI助手] ✅ Dify响应完成')
          if (data && data.conversation_id) {
            this.difyConversationId = data.conversation_id
            console.log('[AI助手] 💾 保存Dify对话ID:', this.difyConversationId)
          }

          this.finishTypewriter()

          // ⭐ 优化：延长延迟时间，确保打字机有足够时间完成
          setTimeout(() => {
            this.saveCurrentChatSession()
            this.isSending = false
            this.currentStreamController = null
            this.currentAbortController = null
            // 发送成功后清空已上传文件列表
            this.uploadedFiles = []
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          }, 2500) // 从500ms改为2500ms，与finishTypewriter的maxWaitTime对应
        }

        const onError = (error) => {
          console.error('[AI助手] ❌ Dify API错误:', error)
          this.stopTypewriter()
          
          // 检查是否是用户主动中断
          const errorMessage = error.message || error
          if (errorMessage.includes('中断') || errorMessage.includes('abort')) {
            this.chatMessages[aiMessageIndex].content = '对话已中断'
          } else {
            this.chatMessages[aiMessageIndex].content = '抱歉，AI服务暂时不可用，请稍后再试。\n错误详情：' + errorMessage
          }
          
          this.isSending = false
          this.currentStreamController = null
          this.currentAbortController = null
          this.saveCurrentChatSession()

          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }

        // 创建AbortController用于中断请求
        this.currentAbortController = new AbortController()
        
        // 根据是否有文件选择不同的API
        if (hasFiles) {
          console.log('[AI助手] 使用上传文件并对话接口')
          this.currentStreamController = await difyAPI.uploadAndChatStream(
            messageContent,
            this.difyConversationId,
            knowledgeFileIds,
            localFiles,
            onMessage,
            onEnd,
            onError,
            this.currentAbortController.signal
          )
        } else {
          console.log('[AI助手] 使用普通对话接口')
          this.currentStreamController = await difyAPI.sendChatMessageStream(
            messageContent,
            this.difyConversationId,
            onMessage,
            onEnd,
            onError,
            this.currentAbortController.signal
          )
        }
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

    // ⭐⭐⭐ 打字机效果核心方法
    /**
     * 启动打字机效果
     * @param {number} messageIndex - 消息索引
     * @param {string} newContent - 新增的内容
     */
    startTypewriter(messageIndex, newContent) {
      console.log('[打字机] 📝 startTypewriter 被调用:', {
        messageIndex,
        newContentLength: newContent?.length || 0,
        newContent: newContent?.substring(0, 50),
        currentQueue: this.typewriterQueue.length,
        isTyping: this.isTyping,
        currentIndex: this.currentTypingMessageIndex
      })

      // 将新内容添加到队列
      this.typewriterQueue += newContent
      console.log('[打字机] 队列已更新，新长度:', this.typewriterQueue.length)

      // 如果已经在打字，直接返回（队列会自动处理）
      if (this.isTyping && this.currentTypingMessageIndex === messageIndex) {
        console.log('[打字机] 已在打字中，内容已加入队列')
        return
      }

      // 如果是新消息，重置打字机状态
      if (this.currentTypingMessageIndex !== messageIndex) {
        console.log('[打字机] 新消息，重置打字机状态')
        this.stopTypewriter()
        this.currentTypingMessageIndex = messageIndex
        this.typewriterQueue = newContent
      }

      // 开始打字
      console.log('[打字机] 🚀 开始打字效果...')
      this.isTyping = true

      // 打字机速度（毫秒/字符）
      // ⭐ 优化：减少延迟，从30ms改为8ms，提升显示速度
      const typingSpeed = 8 // 调整这个值可以控制打字速度（数字越小越快）

      this.typewriterTimer = setInterval(() => {
        if (this.typewriterQueue.length === 0) {
          // 队列为空，但保持打字状态（等待新内容）
          return
        }

        // ⭐ 优化：每次取出多个字符（3个），而不是1个，提升显示速度
        const charsToTake = Math.min(3, this.typewriterQueue.length)
        const chars = this.typewriterQueue.substring(0, charsToTake)
        this.typewriterQueue = this.typewriterQueue.substring(charsToTake)

        console.log('[打字机] ⌨️ 输出字符:', JSON.stringify(chars), '剩余队列:', this.typewriterQueue.length)

        // 添加到消息内容
        if (this.chatMessages[messageIndex]) {
          this.chatMessages[messageIndex].content += chars
          console.log('[打字机] 当前消息长度:', this.chatMessages[messageIndex].content.length)

          // 每添加几个字符滚动一次（优化性能）
          if (this.chatMessages[messageIndex].content.length % 10 === 0) {
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          }
        } else {
          console.error('[打字机] ❌ 消息不存在，索引:', messageIndex)
        }
      }, typingSpeed)
    },

    /**
     * 停止打字机效果
     */
    stopTypewriter() {
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer)
        this.typewriterTimer = null
      }

      // 如果还有剩余队列，直接显示
      if (this.typewriterQueue && this.currentTypingMessageIndex >= 0) {
        const messageIndex = this.currentTypingMessageIndex
        if (this.chatMessages[messageIndex]) {
          this.chatMessages[messageIndex].content += this.typewriterQueue
          this.typewriterQueue = ''
          console.log('[打字机] 剩余内容已追加，当前长度:', this.chatMessages[messageIndex].content.length)
        }
      }

      // ⭐ 标记打字结束（这会触发模板切换到Markdown渲染）
      this.isTyping = false
      this.currentTypingMessageIndex = -1
      this.typewriterQueue = ''

      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    /**
     * 完成打字（流式响应结束时调用）
     */
    finishTypewriter() {
      // ⭐ 优化：不再使用轮询等待，而是加速显示剩余内容
      // 如果队列中还有大量内容，直接显示，避免用户等待太久
      const maxWaitTime = 2000 // 最多等待2秒
      const startTime = Date.now()
      
      const checkQueue = setInterval(() => {
        const elapsed = Date.now() - startTime
        
        // 如果队列为空，或者等待超时
        if (this.typewriterQueue.length === 0 || elapsed >= maxWaitTime) {
          clearInterval(checkQueue)
          // 如果还有剩余内容（超时情况），直接显示
          if (this.typewriterQueue.length > 0) {
            console.log('[打字机] 超时，直接显示剩余内容:', this.typewriterQueue.length, '字符')
          }
          this.stopTypewriter()
          
          // ⭐ 打字完成后，强制Vue重新渲染以应用Markdown格式
          this.$nextTick(() => {
            console.log('[打字机] ✅ 打字完成，触发Markdown格式化')
            this.scrollToBottom()
          })
        }
      }, 100)
    },

    // ⭐ 格式化 Markdown 内容（使用 marked 库）
    formatMarkdown(content) {
      if (!content) return ''

      try {
        // 使用 marked 解析 Markdown
        const html = marked.parse(content)
        return html
      } catch (error) {
        console.error('Markdown 解析错误:', error)
        // 如果解析失败，返回纯文本并转换换行符
        return content.replace(/\n/g, '<br>')
      }
    },

    // ⭐ 复制消息内容
    copyMessage(content, index) {
      if (!content) return
      
      // 创建临时文本区域元素
      const textarea = document.createElement('textarea')
      textarea.value = content
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      
      try {
        // 选中并复制
        textarea.select()
        document.execCommand('copy')
        
        // 显示复制成功状态
        this.copiedMessageIndex = index
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
          this.copiedMessageIndex = null
        }, 2000)
        
        console.log('消息已复制到剪贴板')
      } catch (err) {
        console.error('复制失败:', err)
        alert('复制失败，请手动复制')
      } finally {
        // 清理临时元素
        document.body.removeChild(textarea)
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

        // 将文件添加到已上传文件列表
        files.forEach(file => {
          // 为每个文件生成唯一ID（即使同名也会添加）
          const uniqueId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          this.uploadedFiles.push({
            id: uniqueId,
            name: file.name,
            type: this.getFileType(file.name),
            isLocal: true,
            file: file // 保存原始文件对象
          })
        })

        // 将文件名添加到输入框（仅在已有消息时添加提示）
        // 将文件名添加到输入框
        const fileNames = files.map(file => file.name).join('、')
        // 只有用户已经输入了问题时，才添加文件提示
        if (this.userMessage.trim()) {
          const fileInfo = `\n\n[已上传文档：${fileNames}]`
          this.userMessage = this.userMessage + fileInfo
        }
        // 如果用户没有输入问题，不要自动填充，让placeholder提示用户
        
        // 这里可以添加文件上传到后端的逻辑
        // TODO: 实现文件上传功能
      }
      // 清空文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    // 获取文件类型
    getFileType(fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase()
      const typeMap = {
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'xls': 'Excel',
        'xlsx': 'Excel',
        'txt': '文本',
        'md': 'Markdown'
      }
      return typeMap[ext] || '文件'
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
      
      const selectedFileObjects = this.files.filter(file => this.selectedFiles.includes(file.id))

      const selectedFileNames = selectedFileObjects
        .map(file => file.name || file.title || '未命名文件')
        .join('、')
      
      // 将选中的文件添加到已上传文件列表
      selectedFileObjects.forEach(file => {
        // 检查是否已存在
        const exists = this.uploadedFiles.some(f => f.id === file.id && !f.isLocal)
        if (!exists) {
          this.uploadedFiles.push({
            id: file.id,
            name: file.name || file.title || '未命名文件',
            title: file.title,
            type: file.type || file.typeName || '文件',
            typeName: file.typeName,
            isLocal: false,
            fileId: file.id
          })
        }
      })

      // 将选中的文件信息添加到输入框
      const fileInfo = `请参考以下成果目录文件：${selectedFileNames}`
      this.userMessage = this.userMessage.trim() 
        ? `${this.userMessage}\n\n${fileInfo}`
        : fileInfo
      
      // 可以在这里添加逻辑，将选中的文件ID保存或发送给后端
      console.log('选中的文件ID:', this.selectedFiles)
      console.log('选中的文件:', selectedFileObjects)
      
      this.closeFileDialog()
    },
    
    // 移除单个文件
    removeFile(file) {
      const index = this.uploadedFiles.findIndex(f =>
        (file.isLocal && f.isLocal && f.name === file.name) ||
        (!file.isLocal && !f.isLocal && f.id === file.id)
      )
      if (index > -1) {
        this.uploadedFiles.splice(index, 1)
      }
    },

    // 清空所有文件
    clearAllFiles() {
      if (confirm('确定要清空所有已上传的文件吗？')) {
        this.uploadedFiles = []
      }
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
    },
    
    // 停止发送/中断当前请求
    stopSending() {
      console.log('[AI助手] 用户请求中断对话')
      
      // 中断AbortController
      if (this.currentAbortController) {
        this.currentAbortController.abort()
        this.currentAbortController = null
      }
      
      // 停止打字机效果
      this.stopTypewriter()
      
      // 更新当前消息状态
      if (this.currentTypingMessageIndex >= 0 && this.chatMessages[this.currentTypingMessageIndex]) {
        const currentContent = this.chatMessages[this.currentTypingMessageIndex].content
        this.chatMessages[this.currentTypingMessageIndex].content = currentContent + '\n\n[对话已中断]'
      }
      
      // 重置状态
      this.isSending = false
      this.isTyping = false
      this.currentTypingMessageIndex = -1
      this.typewriterQueue = ''
      this.currentStreamController = null
      
      // 保存会话
      this.saveCurrentChatSession()
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  }
}

</script>
