<template>
  <div class="ai-view">
    <div class="page-header">
      <div class="header-top">
      <h1 class="page-title">
        <span class="title-text">AI赋能助手</span>
        <div class="title-decoration"></div>
      </h1>
        <div class="header-actions">
          <button class="view-history-btn" @click="viewChatHistory" title="查看历史记录">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>历史记录</span>
          </button>
          <button class="new-chat-btn" @click="createNewChatSession" title="新建对话">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>新建对话</span>
          </button>
        </div>
      </div>
      <p class="page-subtitle">
        <svg class="subtitle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        智能问答与内容生成服务，助力您的研究工作
      </p>
    </div>

    <!-- 主内容区域：聊天框 + 思维导图 -->
    <div class="main-content-layout">
      <!-- 左侧聊天框 -->
      <div class="chat-card">
      <div class="chat-window" ref="chatWindow">
        <div class="bubble left">
          您好！我是您的AI助手，可以帮您生成文档结构提纲、关键词摘要，也可以结合知识库回答问题。请问您有什么要协助的吗？
        </div>
        <div 
          v-for="(message, index) in messages" 
          :key="message.id" 
          class="bubble" 
          :class="[message.type, { 'file-only': message.isFileOnly }]"
        >
          <!-- 用户消息中的文件显示（独立的消息气泡） -->
          <div v-if="message.type === 'right' && message.files && message.files.length > 0" class="message-files">
            <div
              v-for="(file, fileIndex) in message.files"
              :key="fileIndex"
              class="message-file-item"
            >
              <div class="message-file-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="message-file-info">
                <div class="message-file-name">{{ file.name || file.fileName || '未命名文件' }}</div>
                <div class="message-file-meta">
                  <span class="message-file-type">{{ file.type || file.fileType || getFileType(file.name || file.fileName) }}</span>
                  <span v-if="file.size || file.fileSize" class="message-file-size">{{ formatFileSize(file.size || file.fileSize) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ⭐ AI消息：支持Markdown渲染 -->
          <div v-if="message.type === 'left'" class="ai-message-content">
            <!-- 打字时显示纯文本 -->
            <span v-if="index === currentTypingMessageIndex && isTyping" style="white-space: pre-wrap;">{{ message.content }}</span>
            <!-- 打字完成后渲染Markdown -->
            <span v-else v-html="formatMarkdown(message.content)"></span>
            <!-- 打字光标 -->
            <span v-if="index === currentTypingMessageIndex && isTyping" class="cursor-blink">|</span>
          </div>
          <!-- 用户消息：普通文本 -->
          <span v-else-if="message.content">{{ message.content }}</span>

          <!-- ⭐ 复制按钮（所有有内容的消息都显示，小巧不影响观感） -->
          <button 
            v-if="message.content && message.content.trim()" 
            class="copy-msg-btn-kb" 
            @click="copyMessageContent(message.content, index)"
            :title="copiedMsgIndex === index ? '已复制!' : '复制内容'"
          >
            <svg v-if="copiedMsgIndex !== index" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="composer">
        <div class="composer-input-wrapper">
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
          :disabled="(!inputMessage.trim() && selectedLocalFiles.length === 0 && selectedKnowledgeFileIds.length === 0) || isSending"
        >
          <svg v-if="!isSending" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
        </div>
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

      <!-- 聊天历史记录弹窗 -->
      <div v-if="showChatHistoryModal" class="chat-history-sidebar-overlay" @click="closeChatHistoryModal">
      <div class="chat-history-sidebar" @click.stop>
        <!-- 侧边栏头部 -->
        <div class="sidebar-header">
          <h3>对话历史</h3>
          <button class="close-btn" @click="closeChatHistoryModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- 侧边栏内容 -->
        <div class="sidebar-body">
          <div v-if="chatSessions.length === 0" class="empty-history">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="empty-text">暂无历史对话</p>
          </div>
          <div v-else class="session-list">
            <div 
              v-for="session in chatSessions" 
              :key="session.id"
              class="chat-session-item"
              :class="{ 'active': session.id === currentChatSessionId }"
              @click="loadChatSession(session.id)"
            >
              <div class="session-info">
                <div class="session-title">{{ session.title || '未命名对话' }}</div>
                <div class="session-meta">
                  <span class="session-count">{{ session.messageCount || 0 }} 条消息</span>
                  <span class="session-date">{{ formatDate(session.createdAt) }}</span>
                </div>
              </div>
              <button 
                class="delete-session-btn" 
                @click.stop="deleteChatSession(session.id)"
                title="删除对话"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 侧边栏底部 -->
        <div class="sidebar-footer">
          <button class="btn-primary" @click="createNewChatSession">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>新建对话</span>
          </button>
        </div>
      </div>
    </div>
    </div>
      
      <!-- 右侧思维导图 -->
      <div class="mindmap-card" :class="{ 'collapsed': !showMindmap }">
        <div class="mindmap-header">
          <h3 class="mindmap-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="19" cy="5" r="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="19" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="5" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
              <path d="M13.5 10.5L17.5 6.5M13.5 13.5L17.5 17.5M10.5 13.5L6.5 17.5" stroke="currentColor" stroke-width="2"/>
            </svg>
            思维导图
          </h3>
          <div class="mindmap-actions">
            <button class="mindmap-refresh-btn" @click="generateMindmap" title="生成思维导图">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 2V8M21.5 8H15.5M21.5 8L18 4.5C16.7429 3.24286 15.12 2.49965 13.3852 2.40322C11.6504 2.30679 9.95806 2.86285 8.62 4C6.00001 6.26 5.20001 9.67 6.16001 12.82" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2.5 22V16M2.5 16H8.5M2.5 16L6 19.5C7.25714 20.7571 8.88002 21.5004 10.6148 21.5968C12.3496 21.6932 14.0419 21.1372 15.38 20C18 17.74 18.8 14.33 17.84 11.18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="mindmap-toggle-btn" @click="toggleMindmap" :title="showMindmap ? '收起' : '展开'">
              <svg v-if="showMindmap" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="mindmap-content">
          <div v-if="!mindmapData" class="mindmap-empty">
            <div class="empty-mindmap-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="19" cy="5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="19" cy="19" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="5" cy="19" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M14 10L16.5 7M14 14L16.5 17M10 14L7.5 17M10 10L7.5 7" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <p class="empty-mindmap-text">暂无思维导图</p>
            <p class="empty-mindmap-hint">点击右上角刷新按钮，由AI根据对话内容生成思维导图</p>
          </div>
          <div v-else class="mindmap-display" v-html="mindmapData"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/styles/KnowledgeBaseAI.css'
import { knowledgeAPI } from '@/api/knowledge'
import difyAPI, { uploadAndChatStreamForKnowledge } from '@/api/dify'

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
  name: 'KnowledgeBaseAI',
  props: {
    projectId: {
      type: [String, Number],
      default: null
    },
    isArchived: {
      type: Boolean,
      default: false
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
      selectedLocalFiles: [], // 选中的本地文件（发送消息时一起传给后端）
      selectedKnowledgeFileIds: [], // 选中的知识库文件ID
      knowledgeFileInfoMap: {}, // 知识库文件信息映射 { fileId: { fileName, fileSize, fileType } }
      conversationId: null, // 对话ID，用于维持会话
      currentStreamController: null, // 当前流式响应的控制器
      // ⭐ 参考Dify的打字机实现
      isTyping: false, // 是否正在打字
      currentTypingMessageIndex: -1, // 当前正在打字的消息索引
      typewriterQueue: '', // 打字机队列（待显示的内容）
      typewriterTimer: null, // 打字机定时器
      messageIdCounter: 0, // 消息ID计数器，确保每个消息ID唯一
      // 聊天历史记录相关
      showChatHistoryModal: false, // 是否显示历史记录弹窗
      chatSessions: [], // 所有对话会话列表
      currentChatSessionId: null, // 当前对话会话ID
      // ⭐ 复制功能状态
      copiedMsgIndex: null, // 当前已复制的消息索引
      // 思维导图相关
      mindmapData: null, // 思维导图数据
      showMindmap: true // 思维导图展开/收起状态
    }
  },
  mounted() {
    // 组件挂载时加载聊天会话历史
    this.loadChatSessionsFromStorage()
    // 尝试加载最后一个会话
    const lastSessionId = this.getLastChatSessionId()
    if (lastSessionId) {
      this.loadChatSession(lastSessionId)
    } else {
      // 如果没有历史会话，加载本地存储的消息和对话ID（兼容旧版本）
    this.loadMessagesFromStorage()
    this.loadConversationId()
    }
    // 点击外部关闭下拉菜单
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    // ⭐ 参考Dify：停止打字机效果
    this.stopTypewriter()
    // 关闭当前的流式连接
    if (this.currentStreamController) {
      this.currentStreamController.close()
      this.currentStreamController = null
    }
    // 组件销毁前保存当前会话
    this.saveCurrentChatSession()
    this.saveChatSessionsToStorage()
    this.saveLastChatSessionId()
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  },
  watch: {
    // 监听文件变化，通知父组件更新左侧栏显示
    selectedLocalFiles: {
      handler(newFiles) {
        this.$emit('files-changed', {
          localFiles: newFiles,
          knowledgeFileIds: this.selectedKnowledgeFileIds
        })
      },
      deep: true
    },
    selectedKnowledgeFileIds: {
      handler(newIds) {
        this.$emit('files-changed', {
          localFiles: this.selectedLocalFiles,
          knowledgeFileIds: newIds
        })
      },
      deep: true
    }
  },
  methods: {
    /**
     * 生成唯一的消息ID
     */
    generateUniqueMessageId() {
      this.messageIdCounter++
      return `${Date.now()}_${this.messageIdCounter}`
    },
    
    /**
     * 迁移旧的消息ID（修复重复key问题）
     */
    migrateOldMessageIds(messages) {
      if (!messages || messages.length === 0) return messages
      
      // 检查是否有旧格式的ID（纯数字）
      const hasOldFormat = messages.some(msg => typeof msg.id === 'number' || !String(msg.id).includes('_'))
      
      if (hasOldFormat) {
        console.log('[消息ID迁移] 检测到旧格式的消息ID，开始迁移...')
        const migratedMessages = messages.map(msg => {
          // 如果ID是纯数字或不包含下划线，重新生成ID
          if (typeof msg.id === 'number' || !String(msg.id).includes('_')) {
            const newId = this.generateUniqueMessageId()
            console.log(`[消息ID迁移] ${msg.id} -> ${newId}`)
            return { ...msg, id: newId }
          }
          return msg
        })
        console.log('[消息ID迁移] 迁移完成')
        return migratedMessages
      }
      
      return messages
    },
    
    async sendMessage() {
      if (this.isArchived) {
        if (this.$message) {
          this.$message.warning('项目已归档，仅支持查看知识库，不能使用AI赋能对话')
        } else {
          alert('项目已归档，仅支持查看知识库，不能使用AI赋能对话')
        }
        return
      }
      // 如果没有输入消息且没有文件，则不允许发送
      if ((!this.inputMessage.trim() && this.selectedLocalFiles.length === 0 && this.selectedKnowledgeFileIds.length === 0) || this.isSending) return
      
      // 如果没有当前会话，创建一个新会话
      if (!this.currentChatSessionId) {
        this.createNewChatSession()
      }
      
      // 收集文件信息
      const messageFiles = []

      // 添加本地文件信息
      this.selectedLocalFiles.forEach(file => {
        messageFiles.push({
          name: file.name,
          type: this.getFileType(file.name),
          size: file.size,
          isLocal: true,
          file: file
        })
      })

      // 添加知识库文件信息
      this.selectedKnowledgeFileIds.forEach(fileId => {
        const fileIdStr = String(fileId)
        // 统一使用字符串作为键查找文件信息，避免精度丢失
        let fileInfo = this.knowledgeFileInfoMap[fileIdStr]

        if (fileInfo) {
          messageFiles.push({
            fileName: fileInfo.fileName,
            name: fileInfo.fileName,
            fileType: fileInfo.fileType,
            type: fileInfo.fileType,
            fileSize: fileInfo.fileSize,
            size: fileInfo.fileSize,
            fileId: fileInfo.isAchievement ? fileInfo.achievementId : fileId, // 如果是成果目录，使用成果ID
            isLocal: false,
            isAchievement: fileInfo.isAchievement || false, // 标记是否是成果目录
            achievementId: fileInfo.achievementId || null // 如果是成果目录，保存成果ID
          })
        }
      })

      // 保存用户文字内容，用于复制功能
      const userTextContent = this.inputMessage.trim()
      const query = this.inputMessage.trim()
      this.inputMessage = ''

      // 如果有文件，先发送文件消息（独立的消息气泡）
      if (messageFiles.length > 0) {
        const fileMessage = {
          id: this.generateUniqueMessageId(),
          type: 'right',
          content: '', // 文件消息不显示文字内容
          files: messageFiles,
          isFileOnly: true // 标记这是仅文件的消息
        }
        this.messages.push(fileMessage)
      }

      // 如果有文字内容，再发送文字消息（独立的消息气泡）
      if (userTextContent) {
        const textMessage = {
          id: this.generateUniqueMessageId(),
          type: 'right',
          content: userTextContent,
          files: undefined,
          isFileOnly: false
        }
        this.messages.push(textMessage)
      }
      
      // 清空已选择的文件（发送后清空）
      this.selectedLocalFiles = []
      this.selectedKnowledgeFileIds = []

      this.isSending = true
      
      // 创建AI回复消息占位符
      const aiMessageId = this.generateUniqueMessageId()
      const aiMessage = {
        id: aiMessageId,
        type: 'left',
        content: ''
      }
      this.messages.push(aiMessage)
      
      // ⭐ 参考Dify：初始化打字机状态
      console.log('[打字机初始化] 清理旧状态并准备新消息')
      this.stopTypewriter()
      this.isTyping = false
      this.currentTypingMessageIndex = this.messages.length - 1
      this.typewriterQueue = ''
      
      console.log('[打字机初始化完成]', {
        messageId: aiMessageId,
        messageIndex: this.currentTypingMessageIndex
      })
      
      // 保存当前会话
      this.saveCurrentChatSession()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      try {
      // 准备本地文件和知识库文件ID
      const localFiles = this.selectedLocalFiles.length > 0 ? this.selectedLocalFiles : null
      
      // 处理知识库文件ID：转换为数字（后端期望 List<Long>）
      let knowledgeFileIds = null
      if (this.selectedKnowledgeFileIds.length > 0) {
        knowledgeFileIds = this.selectedKnowledgeFileIds.map(id => {
          // 处理虚拟文件ID（成果目录）
          if (typeof id === 'string' && id.startsWith('achievement_')) {
            // 提取成果ID并转换为数字
            const achievementId = id.replace('achievement_', '')
            const numId = Number(achievementId)
            return isNaN(numId) ? null : numId
          }
          // 转换为数字类型
          const numId = typeof id === 'number' ? id : Number(id)
          return isNaN(numId) ? null : numId
        }).filter(id => id !== null && id !== undefined && !isNaN(id))
        
        // 如果过滤后为空，设置为 null
        if (knowledgeFileIds.length === 0) {
          knowledgeFileIds = null
        }
      }
      
      // 发送后清空文件（下次需要重新选择）
      this.selectedLocalFiles = []
      this.selectedKnowledgeFileIds = []
      this.knowledgeFileInfoMap = {}
        
        // 调用基于 Dify 知识库工作流的流式对话接口（支持文件）
        console.log('[调用API] 使用Dify知识库工作流接口，localFiles:', localFiles?.length, 'knowledgeFileIds:', knowledgeFileIds?.length, 'conversationId:', this.conversationId)
        this.currentStreamController = await uploadAndChatStreamForKnowledge(
          query,
          this.conversationId,
          knowledgeFileIds || [],
          localFiles || [],
          (delta) => {
            // 处理流式消息增量内容，直接走打字机效果
            if (delta) {
              this.startTypewriter(this.currentTypingMessageIndex, String(delta))
            }
          },
          () => {
            // 流式响应完成
            this.handleStreamComplete(aiMessage)
          },
          (error) => {
            // 处理错误
            this.handleStreamError(error, aiMessage)
          }
        )
      } catch (error) {
        console.error('发送消息失败:', error)
        aiMessage.content = '抱歉，发送消息时发生错误：' + (error.message || '未知错误')
        this.isSending = false
        this.saveMessagesToStorage()
      }
    },
    
    /**
     * 处理流式响应完成（参考Dify实现）
     */
    handleStreamComplete(aiMessage) {
      console.log('[Coze] 🏁 后端流式响应已结束')
      this.isSending = false
      this.currentStreamController = null
      
      // ⭐ 参考Dify：等待打字机完成
      this.finishTypewriter()
    },
    
    /**
     * ⭐ 完成打字（流式响应结束时调用）（参考Dify实现）
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
          
          // 在打字完成后，尝试从最新AI消息中提取思维导图图片URL
          this.updateMindmapFromLastMessage()
          
          // ⭐ 打字完成后，保存会话
          this.saveCurrentChatSession()
          this.$nextTick(() => {
            console.log('[打字机] ✅ 打字完成')
            this.scrollToBottom()
          })
        }
      }, 100)
    },
    
    // 从最新的AI消息中提取思维导图图片URL并更新右侧面板
    updateMindmapFromLastMessage() {
      if (!this.messages || this.messages.length === 0) return
      // 寻找最后一条AI消息
      const lastAiMessage = [...this.messages].reverse().find(m => m.type === 'left' && m.content)
      if (!lastAiMessage || !lastAiMessage.content) return
      const content = lastAiMessage.content
      // 匹配常见图片URL后缀
      const urlMatch = content.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)/i)
      if (!urlMatch) {
        return
      }
      const url = urlMatch[0]
      console.log('[思维导图] 检测到图片URL:', url)
      // 在右侧思维导图面板中显示图片
      this.mindmapData = `<div class="mindmap-image-wrapper"><img src="${url}" alt="思维导图" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`
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
          let messages = JSON.parse(saved)
          // 迁移旧的消息ID
          messages = this.migrateOldMessageIds(messages)
          this.messages = messages
          console.log(`AI对话数据已从本地存储加载 (项目ID: ${this.projectId})`)
          // 如果进行了迁移，立即保存
          if (messages.length > 0) {
            this.saveMessagesToStorage()
          }
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
    
    // 处理文件选择（暂存，发送消息时一起传给后端）
    handleFileUpload(event) {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        console.log('选择了本地文件:', files)
        // 保存选中的本地文件（追加到现有列表）
        this.selectedLocalFiles.push(...files)
        // 检查 $message 是否存在
        if (this.$message) {
          this.$message.success(`已选择 ${files.length} 个文件`)
        } else {
          console.log(`✅ 已选择 ${files.length} 个文件`)
        }
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
         // 清空文件
         this.selectedLocalFiles = []
         this.selectedKnowledgeFileIds = []
         this.knowledgeFileInfoMap = {}
         
         // ⭐ 参考Dify：清除打字机状态
        this.stopTypewriter()
        
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
            console.log('成果详情响应:', detailResponse)

            let files = []

            // 尝试获取成果详情
            if (detailResponse && detailResponse.code === 200 && detailResponse.data) {
              // 尝试多种可能的文件列表路径
              files = detailResponse.data.files || []

              // 如果详情中没有文件，尝试单独获取文件列表
              if (!files || files.length === 0) {
                try {
                  const filesResponse = await knowledgeAPI.getAchievementFiles(achievement.id)
                  console.log('单独获取文件列表响应:', filesResponse)
                  if (filesResponse && filesResponse.code === 200 && filesResponse.data) {
                    files = Array.isArray(filesResponse.data) ? filesResponse.data : (filesResponse.data.files || [])
                  }
                } catch (fileError) {
                  console.warn('单独获取文件列表失败:', fileError)
                  // 即使获取失败，也继续处理，可能是空成果目录
                  files = []
                }
              }
            } else {
              // 如果获取详情失败，尝试单独获取文件列表
              try {
                const filesResponse = await knowledgeAPI.getAchievementFiles(achievement.id)
                console.log('详情获取失败，单独获取文件列表响应:', filesResponse)
                if (filesResponse && filesResponse.code === 200 && filesResponse.data) {
                  files = Array.isArray(filesResponse.data) ? filesResponse.data : (filesResponse.data.files || [])
                }
              } catch (fileError) {
                console.warn('单独获取文件列表失败:', fileError)
                // 即使获取失败，也继续处理，可能是空成果目录
                files = []
              }
            }

              console.log('最终获取到的文件列表:', files)

              // 无论是否有文件，都创建文件条目（如果没有文件，创建虚拟条目代表成果目录）
              if (!files || files.length === 0) {
                console.log('成果目录没有文件，创建虚拟文件条目:', achievement.id)
                // 使用成果ID作为文件ID（加上前缀避免冲突）
                const virtualFileId = `achievement_${achievement.id}`
                if (!allFileIds.includes(virtualFileId)) {
                  allFileIds.push(virtualFileId)
                  // 保存成果信息到映射中
                  this.$set(this.knowledgeFileInfoMap, virtualFileId, {
                    fileName: achievement.title || achievement.name || `成果${achievement.id}`,
                    fileSize: 0,
                    fileType: achievement.type || '成果',
                    isAchievement: true, // 标记这是成果目录，不是实际文件
                    achievementId: achievement.id
                  })
                  console.log('保存成果目录信息:', virtualFileId, this.knowledgeFileInfoMap[virtualFileId])
                }
              } else {
                // 提取文件ID并添加到列表，并保存文件信息到映射中
                files.forEach(file => {
                  if (file && file.id) {
                    // 保持ID为字符串类型，避免精度丢失
                    const fileId = String(file.id)
                    // 避免重复添加
                    if (!allFileIds.includes(fileId)) {
                      allFileIds.push(fileId)
                    }
                    // 保存文件信息到映射中（使用 Vue.set 确保响应式）
                    this.$set(this.knowledgeFileInfoMap, fileId, {
                      fileName: file.fileName || file.name || file.originalName || achievement.title || achievement.name || '未命名文件',
                      fileSize: file.fileSize || file.size || 0,
                      fileType: file.fileType || file.type || (file.fileName ? file.fileName.split('.').pop()?.toUpperCase() : (file.originalName ? file.originalName.split('.').pop()?.toUpperCase() : '未知')) || '未知'
                    })
                    console.log('保存文件信息:', fileId, this.knowledgeFileInfoMap[fileId])
                  }
                })
              }
              
              // 记录文件名
              if (files.length > 0) {
                 const fileNames = files.map(f => f.fileName || f.name || '未命名文件').join(', ')
                selectedFileNames.push(`${achievement.title || achievement.name || '成果'}: ${fileNames}`)
              } else {
                selectedFileNames.push(`${achievement.title || achievement.name || '成果'}: 成果目录（无文件）`)
              }
          } catch (error) {
            console.error(`获取成果 ${achievement.id} 的文件列表失败:`, error)
            // 即使获取失败，也创建虚拟文件条目，确保用户可以选择
            const virtualFileId = `achievement_${achievement.id}`
            if (!allFileIds.includes(virtualFileId)) {
              allFileIds.push(virtualFileId)
              this.$set(this.knowledgeFileInfoMap, virtualFileId, {
                fileName: achievement.title || achievement.name || `成果${achievement.id}`,
                fileSize: 0,
                fileType: achievement.type || '成果',
                isAchievement: true,
                achievementId: achievement.id
              })
              console.log('获取失败，但仍创建成果目录条目:', virtualFileId)
            }
            selectedFileNames.push(`${achievement.title || achievement.name || '成果'}: 成果目录（获取信息失败，但可尝试使用）`)
          }
        }
        
        // 保存选中的知识库文件ID（追加到现有列表，避免重复）
        allFileIds.forEach(fileId => {
          // 转换为相同类型进行比较
          const fileIdStr = String(fileId)
          const exists = this.selectedKnowledgeFileIds.some(id => String(id) === fileIdStr)
          if (!exists) {
            this.selectedKnowledgeFileIds.push(fileId)
          }
        })
      
        console.log('选中的知识库文件ID:', this.selectedKnowledgeFileIds)
        console.log('文件信息映射:', this.knowledgeFileInfoMap)
        console.log('选中的成果:', selectedAchievements)
        console.log('获取到的文件数量:', allFileIds.length)

        // 如果获取到了文件，确保视图更新
        if (allFileIds.length > 0) {
          this.$nextTick(() => {
            this.$forceUpdate()
          })
        }
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
    },
    
    // ==================== 文件预览相关方法 ====================
    
    /**
     * 移除本地文件
     */
    removeLocalFile(index) {
      this.selectedLocalFiles.splice(index, 1)
    },
    
     /**
      * 移除知识库文件
      */
     removeKnowledgeFile(fileId) {
       // 转换为字符串进行比较，确保类型一致
       const fileIdStr = String(fileId)
       const index = this.selectedKnowledgeFileIds.findIndex(id => String(id) === fileIdStr)
       if (index > -1) {
         this.selectedKnowledgeFileIds.splice(index, 1)
       }
       // 可选：从映射中删除文件信息（如果希望清理）
       // delete this.knowledgeFileInfoMap[fileId]
     },
    
    /**
     * 获取文件类型
     */
    getFileType(fileName) {
      if (!fileName) return '未知'
      const ext = fileName.split('.').pop()?.toUpperCase()
      return ext || '未知'
    },
    
    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    
     /**
      * 获取知识库文件名
      */
     getKnowledgeFileName(fileId) {
       // 统一使用字符串作为键，避免精度丢失
       const fileIdStr = String(fileId)
       let fileInfo = this.knowledgeFileInfoMap[fileIdStr]

       if (fileInfo && fileInfo.fileName) {
         return fileInfo.fileName
       }
       
       // 如果映射中没有，尝试从files数组中查找（兼容旧数据）
       for (const achievement of this.files) {
         try {
           if (achievement.files && Array.isArray(achievement.files)) {
             const file = achievement.files.find(f => {
               // 使用字符串比较，避免精度丢失
               return String(f.id) === fileIdStr
             })
             if (file) {
               // 保存到映射中以便下次使用
               const savedFileName = file.fileName || file.name || '未命名文件'
               if (!this.knowledgeFileInfoMap[fileIdStr]) {
                 this.$set(this.knowledgeFileInfoMap, fileIdStr, {
                   fileName: savedFileName,
                   fileSize: file.fileSize || 0,
                   fileType: file.fileType || savedFileName.split('.').pop()?.toUpperCase() || '未知'
                 })
               }
               return savedFileName
             }
           }
         } catch (e) {
           console.error('获取文件名时出错:', e)
         }
       }
       
       // 如果还是找不到，返回默认值
       console.warn('未找到文件ID对应的文件名:', fileId, '映射键:', Object.keys(this.knowledgeFileInfoMap))
       return '未命名文件'
     },
    
    /**
     * 获取知识库文件类型
     */
    getKnowledgeFileType(fileId) {
      const fileName = this.getKnowledgeFileName(fileId)
      return this.getFileType(fileName)
    },
    
     /**
      * 获取知识库文件大小
      */
     getKnowledgeFileSize(fileId) {
       // 首先从文件信息映射中查找
       const fileInfo = this.knowledgeFileInfoMap[fileId]
       if (fileInfo && fileInfo.fileSize) {
         return this.formatFileSize(fileInfo.fileSize)
       }
       
       // 如果映射中没有，尝试从files数组中查找（兼容旧数据）
       // 统一使用字符串作为键，避免精度丢失
       const fileIdStr = String(fileId)
       for (const achievement of this.files) {
         try {
           if (achievement.files && Array.isArray(achievement.files)) {
             const file = achievement.files.find(f => {
               // 使用字符串比较，避免精度丢失
               return String(f.id) === fileIdStr
             })
             if (file && file.fileSize) {
               // 保存到映射中以便下次使用
               if (!this.knowledgeFileInfoMap[fileIdStr]) {
                 this.knowledgeFileInfoMap[fileIdStr] = {
                   fileName: file.fileName || file.name || '未命名文件',
                   fileSize: file.fileSize,
                   fileType: file.fileType || (file.fileName || file.name || '').split('.').pop()?.toUpperCase() || '未知'
                 }
               }
               return this.formatFileSize(file.fileSize)
             }
           }
         } catch (e) {
           console.error('获取文件大小时出错:', e)
         }
       }
       
       return '-'
     },
    
    // ==================== 聊天历史记录管理 ====================
    
    /**
     * 获取存储键名（基于项目ID）
     */
    getStorageKey(key) {
      return this.projectId ? `${key}_${this.projectId}` : key
    },
    
    /**
     * 加载聊天会话列表
     */
    loadChatSessionsFromStorage() {
      try {
        const storageKey = this.getStorageKey('aiChatSessions')
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          let sessions = JSON.parse(saved)
          let needsSave = false
          
          // 迁移每个会话中的消息ID
          sessions = sessions.map(session => {
            if (session.messages && session.messages.length > 0) {
              const originalIds = session.messages.map(m => m.id).join(',')
              session.messages = this.migrateOldMessageIds(session.messages)
              const newIds = session.messages.map(m => m.id).join(',')
              if (originalIds !== newIds) {
                needsSave = true
              }
            }
            return session
          })
          
          this.chatSessions = sessions
          // 按创建时间倒序排列
          this.chatSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          
          // 如果进行了迁移，立即保存
          if (needsSave) {
            console.log('[会话ID迁移] 会话中存在旧格式ID，已迁移并保存')
            this.saveChatSessionsToStorage()
          }
        } else {
          this.chatSessions = []
        }
      } catch (error) {
        console.error('加载聊天会话失败:', error)
        this.chatSessions = []
      }
    },
    
    /**
     * 保存聊天会话列表
     */
    saveChatSessionsToStorage() {
      try {
        const storageKey = this.getStorageKey('aiChatSessions')
        localStorage.setItem(storageKey, JSON.stringify(this.chatSessions))
      } catch (error) {
        console.error('保存聊天会话失败:', error)
      }
    },
    
    /**
     * 获取最后一个会话ID
     */
    getLastChatSessionId() {
      try {
        const storageKey = this.getStorageKey('aiLastChatSessionId')
        return localStorage.getItem(storageKey)
      } catch (error) {
        console.error('获取最后会话ID失败:', error)
        return null
      }
    },
    
    /**
     * 保存最后一个会话ID
     */
    saveLastChatSessionId() {
      try {
        const storageKey = this.getStorageKey('aiLastChatSessionId')
        if (this.currentChatSessionId) {
          localStorage.setItem(storageKey, this.currentChatSessionId)
        } else {
          localStorage.removeItem(storageKey)
        }
      } catch (error) {
        console.error('保存最后会话ID失败:', error)
      }
    },
    
    /**
     * 查看聊天历史
     */
    viewChatHistory() {
      this.showChatHistoryModal = true
    },
    
    /**
     * 关闭聊天历史弹窗
     */
    closeChatHistoryModal() {
      this.showChatHistoryModal = false
    },
    
    /**
     * 创建新对话会话
     */
    createNewChatSession() {
      // 保存当前会话（如果存在）
      if (this.currentChatSessionId && this.messages.length > 0) {
        this.saveCurrentChatSession()
      }
      
      // 创建新会话（使用唯一ID生成器）
      const newSessionId = this.generateUniqueMessageId()
      const newSession = {
        id: newSessionId,
        title: '新对话',
        messages: [],
        conversationId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      }
      
      // 添加到会话列表顶部
      this.chatSessions.unshift(newSession)
      this.saveChatSessionsToStorage()
      
      // 🔥 清空会话相关状态（包括文件）
      this.conversationId = null
      this.selectedLocalFiles = []
      this.selectedKnowledgeFileIds = []
      this.knowledgeFileInfoMap = {}
      console.log('[新建对话] 已清空会话文件和 conversationId')
      
      // 切换到新会话
       this.currentChatSessionId = newSessionId
       this.messages = []
       
       // ⭐ 参考Dify：清除打字机状态
      this.stopTypewriter()
      
      // 关闭历史记录弹窗
      this.closeChatHistoryModal()
      
      // 保存最后会话ID
      this.saveLastChatSessionId()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    /**
     * 加载指定的聊天会话
     */
    loadChatSession(sessionId) {
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (!session) {
        console.error('会话不存在:', sessionId)
        return
      }
      
      // 保存当前会话（如果存在）
      if (this.currentChatSessionId && this.currentChatSessionId !== sessionId) {
        this.saveCurrentChatSession()
      }
      
      // 加载会话数据并迁移消息ID
      this.currentChatSessionId = sessionId
      this.messages = this.migrateOldMessageIds(session.messages || [])
      this.conversationId = session.conversationId || null
      
      // 🔥 清空文件（切换会话时不继承文件，需要重新选择）
      this.selectedLocalFiles = []
      this.selectedKnowledgeFileIds = []
      this.knowledgeFileInfoMap = {}
      
      // ⭐ 参考Dify：清除打字机状态
      this.stopTypewriter()
      
      // 关闭历史记录弹窗
      this.closeChatHistoryModal()
      
      // 保存最后会话ID
      this.saveLastChatSessionId()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    /**
     * 保存当前聊天会话
     */
    saveCurrentChatSession() {
      if (!this.currentChatSessionId) return
      
      const session = this.chatSessions.find(s => s.id === this.currentChatSessionId)
      if (session) {
        // 更新现有会话
        session.messages = [...this.messages]
        session.conversationId = this.conversationId
        session.updatedAt = new Date().toISOString()
        session.messageCount = this.messages.length
        
        // 如果没有标题，生成一个
        if (!session.title || session.title === '未命名对话') {
          session.title = this.generateSessionTitle()
        }
      } else {
        // 创建新会话（兼容旧数据）
        const newSession = {
          id: this.currentChatSessionId,
          title: this.generateSessionTitle(),
          messages: [...this.messages],
          conversationId: this.conversationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: this.messages.length
        }
        this.chatSessions.unshift(newSession)
      }
      
      this.saveChatSessionsToStorage()
    },
    
    /**
     * 删除聊天会话
     */
    deleteChatSession(sessionId) {
      if (confirm('确定要删除这个对话吗？')) {
        // 从列表中移除
        const index = this.chatSessions.findIndex(s => s.id === sessionId)
        if (index > -1) {
          this.chatSessions.splice(index, 1)
          this.saveChatSessionsToStorage()
          
          // 如果删除的是当前会话，清空消息
          if (this.currentChatSessionId === sessionId) {
            this.currentChatSessionId = null
            this.messages = []
            this.conversationId = null
            this.saveLastChatSessionId()
          }
        }
      }
    },
    
    /**
     * 生成会话标题（基于第一条用户消息）
     */
    generateSessionTitle() {
      const firstUserMessage = this.messages.find(m => m.type === 'right')
      if (firstUserMessage && firstUserMessage.content) {
        const content = firstUserMessage.content.trim()
        // 取前20个字符作为标题
        return content.length > 20 ? content.substring(0, 20) + '...' : content
      }
      return '新对话'
    },
    
    /**
     * 复制用户发送的文字
     */
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

    // ⭐ 复制消息内容（新增统一复制方法）
    copyMessageContent(content, index) {
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
        this.copiedMsgIndex = index
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
          this.copiedMsgIndex = null
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

    async copyUserText(text) {
      if (!text) return

      try {
        await navigator.clipboard.writeText(text)
        // 显示提示消息
        if (this.$message) {
          this.$message.success('已复制到剪贴板')
        } else {
          alert('已复制到剪贴板')
        }
      } catch (error) {
        console.error('复制失败:', error)
        // 降级方案：使用传统方法
        try {
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)

          if (this.$message) {
            this.$message.success('已复制到剪贴板')
          } else {
            alert('已复制到剪贴板')
          }
        } catch (fallbackError) {
          console.error('复制失败（降级方案也失败）:', fallbackError)
          if (this.$message) {
            this.$message.error('复制失败，请手动复制')
          } else {
            alert('复制失败，请手动复制')
          }
        }
      }
    },

    /**
     * 格式化日期
     */
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      // 超过7天显示具体日期
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    },
    
    /**
     * 生成思维导图 - 调用后端API
     */
    async generateMindmap() {
      try {
        // TODO: 调用后端API生成思维导图
        // 示例：根据当前对话内容生成思维导图
        // const response = await cozeAPI.generateMindmap({
        //   conversationId: this.conversationId,
        //   messages: this.messages
        // })
        // this.mindmapData = response.data.mindmapHtml
        
        // 临时提示：等待后端接口
        console.log('等待后端AI生成思维导图...')
        alert('思维导图生成功能需要后端API支持，请联系后端开发人员实现')
        
        // 清空当前数据，显示空状态
        this.mindmapData = null
      } catch (error) {
        console.error('生成思维导图失败:', error)
        alert('生成思维导图失败，请稍后重试')
      }
    },
    
    /**
     * 切换思维导图显示/隐藏
     */
    toggleMindmap() {
      this.showMindmap = !this.showMindmap
    }
  }
}
</script>
