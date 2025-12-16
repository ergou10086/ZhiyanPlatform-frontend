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
          :disabled="(!inputMessage.trim() && selectedLocalFiles.length === 0 && uploadedFiles.length === 0) || isSending"
        >
          <svg v-if="!isSending" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
        </div>
      </div>

      <!-- 文件选择弹窗（两步选择：成果 -> 文件） -->
      <div v-if="showFileDialog" class="file-dialog-overlay" @click="closeFileDialog">
        <div class="file-dialog" @click.stop>
          <!-- 顶部标题栏 -->
          <div class="file-dialog-header">
            <div class="header-content">
              <h3 v-if="!selectedAchievement">第一步：选择成果</h3>
              <h3 v-else>第二步：选择文件</h3>
              <p class="header-subtitle" v-if="!selectedAchievement && selectedFiles.length > 0">已选择 {{ selectedFiles.length }} 个成果</p>
              <p class="header-subtitle" v-else-if="selectedAchievement && selectedAchievementFiles.length > 0">已选择 {{ selectedAchievementFiles.length }} 个文件</p>
            </div>
            <button class="close-btn" @click="closeFileDialog">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- 第二步：显示成果信息栏和返回按钮 -->
          <div v-if="selectedAchievement" class="achievement-info-bar">
            <button class="back-btn" @click="backToAchievementSelection">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              返回
            </button>
            <div class="achievement-name">{{ selectedAchievement.name || selectedAchievement.title }}</div>
          </div>

          <!-- 内容区域 -->
          <div class="file-dialog-body">
            <!-- 第一步：显示成果列表 -->
            <div v-if="!selectedAchievement">
              <div v-if="loadingFiles" class="loading-container">
                <div class="loading-spinner-large"></div>
                <p class="loading-text">正在加载成果列表...</p>
              </div>
              <div v-else-if="achievements.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13 2V9H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="empty-text">暂无成果</p>
              </div>
              <div v-else class="file-list-container">
                <div class="file-list">
                  <div 
                    v-for="achievement in achievements" 
                    :key="achievement.id" 
                    class="file-card"
                    @click="selectAchievement(achievement)"
                  >
                    <div class="file-card-content">
                      <div class="file-card-main">
                        <div class="file-name-wrapper">
                          <div class="file-name">{{ achievement.name || achievement.title || '未命名成果' }}</div>
                          <div class="file-badge-group">
                            <span class="file-type-badge">{{ achievement.type || '成果' }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="file-select-indicator">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 第二步：显示文件列表 -->
            <div v-else>
              <div v-if="loadingAchievementFiles" class="loading-container">
                <div class="loading-spinner-large"></div>
                <p class="loading-text">正在加载文件列表...</p>
              </div>
              <div v-else-if="achievementFiles.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13 2V9H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="empty-text">该成果暂无文件</p>
              </div>
              <div v-else class="file-list-container">
                <div class="file-list">
                  <div 
                    v-for="file in achievementFiles" 
                    :key="file.id" 
                    class="file-card"
                    :class="{ 'selected': selectedAchievementFiles.includes(file.id) }"
                    @click="toggleAchievementFileSelection(file.id)"
                  >
                    <div class="file-card-content">
                      <div class="file-card-main">
                        <div class="file-name-wrapper">
                          <div class="file-name">{{ file.fileName || file.name || '未命名文件' }}</div>
                          <div class="file-badge-group">
                            <span class="file-type-badge">{{ file.fileType || file.type || '文件' }}</span>
                            <span v-if="file.fileSize" class="file-size-badge">{{ formatFileSize(file.fileSize) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="file-select-indicator" :class="{ 'active': selectedAchievementFiles.includes(file.id) }">
                        <div class="checkmark-circle">
                          <svg v-if="selectedAchievementFiles.includes(file.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
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
              v-if="selectedAchievement"
              class="btn-confirm" 
              @click="confirmAchievementFileSelection" 
              :disabled="selectedAchievementFiles.length === 0"
              :class="{ 'disabled': selectedAchievementFiles.length === 0 }"
            >
              <span>确认选择</span>
              <span v-if="selectedAchievementFiles.length > 0" class="selected-count">{{ selectedAchievementFiles.length }}</span>
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
        
        <!-- 已上传文件区域 -->
        <div class="sidebar-files-section">
          <h4 class="sidebar-files-title">已上传文件 ({{ uploadedFiles.length + uploadingFiles.length }})</h4>
          
          <!-- 无文件时的空状态 -->
          <div v-if="uploadedFiles.length === 0 && uploadingFiles.length === 0" class="sidebar-files-empty">
            <div class="empty-file-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="empty-file-text">暂无文件</p>
          </div>
          
          <!-- 文件列表 -->
          <div v-else class="sidebar-files-list">
            <!-- 上传中的文件 -->
            <div v-for="file in uploadingFiles" :key="file.id" class="sidebar-file-item uploading">
              <div class="sidebar-file-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="sidebar-file-info">
                <div class="sidebar-file-name">{{ file.fileName }}</div>
                <div class="sidebar-file-status">上传中...</div>
              </div>
              <div class="sidebar-loading-spinner"></div>
            </div>
            
            <!-- 已上传的文件 -->
            <div v-for="file in uploadedFiles" :key="file.id" class="sidebar-file-item">
              <div class="sidebar-file-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="sidebar-file-info">
                <div class="sidebar-file-name">{{ file.fileName }}</div>
                <div class="sidebar-file-size">{{ formatFileSize(file.fileSize) }}</div>
              </div>
              <button class="sidebar-remove-btn" @click="removeUploadedFile(file.id)" title="移除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
          <div v-if="isGeneratingMindmap" class="mindmap-loading">
            <div class="empty-mindmap-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
                <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="empty-mindmap-text">正在生成思维导图…</p>
            <p class="empty-mindmap-hint">请稍候，AI 正在根据对话内容整理结构</p>
          </div>
          <div v-else-if="!mindmapData" class="mindmap-empty">
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
          <div
            v-else
            class="mindmap-display-outer"
            :class="{ 'is-panning': isPanningMindmap }"
            @mousedown="onMindmapMouseDown"
            @mousemove="onMindmapMouseMove"
            @mouseup="onMindmapMouseUp"
            @mouseleave="onMindmapMouseUp"
            @wheel.prevent="onMindmapWheel"
            @dragstart.prevent
          >
            <div
              class="mindmap-display"
              :style="mindmapTransformStyle"
              @dragstart.prevent
              v-html="mindmapData"
            ></div>
          </div>
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

// 自定义 Markdown 渲染配置
const renderer = new marked.Renderer()

// 统一让 Markdown 中的所有链接在新标签页中打开
renderer.link = function(href, title, text) {
  const safeHref = href || ''
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}

marked.setOptions({
  renderer,
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
      uploadedFiles: [], // 已上传的文件列表 { id, fileName, fileSize, fileType, difyFileId, source: 'local'|'knowledge', knowledgeFileId }
      uploadingFiles: [], // 正在上传的文件列表（用于显示进度）
      // 两步选择：成果 -> 文件
      achievements: [], // 成果列表（第一步）
      selectedAchievement: null, // 选中的成果
      achievementFiles: [], // 选中成果的文件列表（第二步）
      selectedAchievementFiles: [], // 选中的文件ID列表
      loadingAchievementFiles: false, // 加载成果文件状态
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
      showMindmap: true, // 思维导图展开/收起状态
      isGeneratingMindmap: false, // 是否正在生成思维导图
      mindmapScale: 1, // 思维导图缩放倍数
      mindmapOffsetX: 0, // 思维导图平移X
      mindmapOffsetY: 0, // 思维导图平移Y
      isPanningMindmap: false, // 是否正在拖动画布
      mindmapLastX: 0, // 上一次鼠标X
      mindmapLastY: 0 // 上一次鼠标Y
    }
  },
  computed: {
    mindmapTransformStyle() {
      return {
        transform: `translate(${this.mindmapOffsetX}px, ${this.mindmapOffsetY}px) scale(${this.mindmapScale})`,
        transformOrigin: 'center center'
      }
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
    // 监听已上传文件变化，通知父组件更新左侧栏显示
    uploadedFiles: {
      handler(newFiles) {
        this.$emit('files-changed', {
          uploadedFiles: newFiles,
          uploadingFiles: this.uploadingFiles
        })
      },
      deep: true
    },
    // 监听上传中文件变化，通知父组件更新左侧栏显示
    uploadingFiles: {
      handler(newFiles) {
        this.$emit('files-changed', {
          uploadedFiles: this.uploadedFiles,
          uploadingFiles: newFiles
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
    
    startTypewriter(messageIndex, newText) {
      if (!newText) {
        return
      }
      if (this.currentTypingMessageIndex !== messageIndex) {
        this.stopTypewriter()
        this.currentTypingMessageIndex = messageIndex
      }
      this.typewriterQueue += String(newText)
      if (this.isTyping && this.typewriterTimer) {
        return
      }
      if (messageIndex < 0 || messageIndex >= this.messages.length) {
        this.typewriterQueue = ''
        this.isTyping = false
        this.currentTypingMessageIndex = -1
        return
      }
      this.isTyping = true
      const step = 3
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer)
        this.typewriterTimer = null
      }
      this.typewriterTimer = setInterval(() => {
        if (!this.typewriterQueue || this.typewriterQueue.length === 0) {
          clearInterval(this.typewriterTimer)
          this.typewriterTimer = null
          this.isTyping = false
          return
        }
        const targetIndex = this.currentTypingMessageIndex
        if (targetIndex < 0 || targetIndex >= this.messages.length) {
          this.typewriterQueue = ''
          clearInterval(this.typewriterTimer)
          this.typewriterTimer = null
          this.isTyping = false
          return
        }
        const chunk = this.typewriterQueue.slice(0, step)
        this.typewriterQueue = this.typewriterQueue.slice(step)
        const msg = this.messages[targetIndex]
        msg.content = (msg.content || '') + chunk
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }, 30)
    },
    
    stopTypewriter() {
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer)
        this.typewriterTimer = null
      }
      if (this.isTyping && this.currentTypingMessageIndex >= 0 && this.currentTypingMessageIndex < this.messages.length) {
        if (this.typewriterQueue && this.typewriterQueue.length > 0) {
          const msg = this.messages[this.currentTypingMessageIndex]
          msg.content = (msg.content || '') + this.typewriterQueue
        }
      }
      this.isTyping = false
      this.currentTypingMessageIndex = -1
      this.typewriterQueue = ''
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
      // 如果用户没有输入文字但上传了文件，使用默认查询
      let query = this.inputMessage.trim()
      if (!query && (this.uploadedFiles.length > 0 || this.selectedLocalFiles.length > 0)) {
        query = '请分析这些文件的内容'
      }
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

        // 如果用户在对话中提到“思维导图”，也触发右侧加载动画
        if (userTextContent.includes('思维导图')) {
          this.mindmapData = null
          this.isGeneratingMindmap = true
        }
      }
      
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
      // 准备本地文件
      const localFiles = this.selectedLocalFiles.length > 0 ? this.selectedLocalFiles : null
      
      // 提取已上传文件的 difyFileId
      const difyFileIds = this.uploadedFiles.map(file => file.difyFileId).filter(id => id)
      
      console.log('[KnowledgeBaseAI] 发送前的文件状态:', {
        uploadedFiles: this.uploadedFiles.length,
        difyFileIds: difyFileIds,
        selectedLocalFiles: this.selectedLocalFiles.length
      })
      
      // 发送后清空文件（下次需要重新选择）
      this.selectedLocalFiles = []
      this.uploadedFiles = []
        
        // 调用基于 Dify 知识库工作流的流式对话接口（支持文件）
        console.log('[调用API] 使用Dify知识库工作流接口，localFiles:', localFiles?.length, 'difyFileIds:', difyFileIds?.length, 'difyFileIds详情:', difyFileIds, 'conversationId:', this.conversationId)
        this.currentStreamController = await uploadAndChatStreamForKnowledge(
          query,
          this.conversationId,
          difyFileIds || [],
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
     * 处理流式响应错误
     */
    handleStreamError(error, aiMessage) {
      console.error('[Dify 知识库] 流式响应错误:', error)
      if (this.currentStreamController) {
        this.currentStreamController.close()
        this.currentStreamController = null
      }
      this.isSending = false
      // 停止打字机，避免继续追加内容
      this.stopTypewriter()
      if (aiMessage) {
        const msg = error && error.message ? error.message : 'AI 调用失败，请稍后重试'
        aiMessage.content = '抱歉，AI 调用失败：' + msg
      }
      this.saveMessagesToStorage()
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
      if (!this.messages || this.messages.length === 0) {
        this.isGeneratingMindmap = false
        return
      }
      // 寻找最后一条AI消息
      const lastAiMessage = [...this.messages].reverse().find(m => m.type === 'left' && m.content)
      if (!lastAiMessage || !lastAiMessage.content) {
        this.isGeneratingMindmap = false
        return
      }
      const content = lastAiMessage.content
      // 匹配常见图片URL后缀
      const urlMatch = content.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)/i)
      if (!urlMatch) {
        // 没有找到思维导图链接，也结束加载状态
        this.isGeneratingMindmap = false
        return
      }
      const url = urlMatch[0]
      console.log('[思维导图] 检测到图片URL:', url)
      // 在右侧思维导图面板中显示图片
      this.mindmapData = `<div class="mindmap-image-wrapper"><img src="${url}" alt="思维导图" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`
      // 成功解析到思维导图后关闭加载状态
      this.isGeneratingMindmap = false
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
      this.selectedAchievement = null
      this.achievementFiles = []
      this.selectedAchievementFiles = []
      this.loadingAchievementFiles = false
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
    
    // 加载成果列表（第一步）
    async loadFiles() {
      if (!this.projectId) {
        console.warn('项目ID不存在，无法加载成果列表')
        return
      }
      
      this.loadingFiles = true
      try {
        const response = await knowledgeAPI.getProjectAchievements(this.projectId, 0, 1000)
        console.log('获取成果列表响应:', response)
        
        if (response && response.code === 200 && response.data) {
          if (Array.isArray(response.data)) {
            this.achievements = response.data
          } else if (response.data.content && Array.isArray(response.data.content)) {
            this.achievements = response.data.content
          } else {
            this.achievements = []
          }
          console.log('加载成果列表成功，数量:', this.achievements.length)
        } else {
          this.achievements = []
          console.warn('获取成果列表失败:', response)
        }
      } catch (error) {
        console.error('加载成果列表失败:', error)
        this.achievements = []
      } finally {
        this.loadingFiles = false
      }
    },
    
    // 选择成果（进入第二步）
    async selectAchievement(achievement) {
      this.selectedAchievement = achievement
      this.achievementFiles = []
      this.selectedAchievementFiles = []
      this.loadingAchievementFiles = true
      
      try {
        console.log('加载成果文件:', achievement.id)
        const response = await knowledgeAPI.getAchievementFiles(achievement.id)
        console.log('获取成果文件响应:', response)
        
        if (response && response.code === 200 && response.data) {
          this.achievementFiles = Array.isArray(response.data) ? response.data : []
          console.log('加载成果文件成功，数量:', this.achievementFiles.length)
        } else {
          this.achievementFiles = []
          console.warn('获取成果文件失败:', response)
        }
      } catch (error) {
        console.error('加载成果文件失败:', error)
        this.achievementFiles = []
      } finally {
        this.loadingAchievementFiles = false
      }
    },
    
    // 返回成果选择（第一步）
    backToAchievementSelection() {
      this.selectedAchievement = null
      this.achievementFiles = []
      this.selectedAchievementFiles = []
    },
    
    // 切换文件选择状态（第二步）
    toggleAchievementFileSelection(fileId) {
      const index = this.selectedAchievementFiles.indexOf(fileId)
      if (index > -1) {
        this.selectedAchievementFiles.splice(index, 1)
      } else {
        this.selectedAchievementFiles.push(fileId)
      }
    },
    
    // 确认选择文件（第二步）- 立即上传到 Dify
    async confirmAchievementFileSelection() {
      if (this.selectedAchievementFiles.length === 0) return
      
      // ⚠️ 重要：在 closeFileDialog() 之前保存文件ID，因为 closeFileDialog 会清空 selectedAchievementFiles
      const fileIdsToUpload = this.selectedAchievementFiles.slice()
      
      const selectedFileObjects = this.achievementFiles.filter(file => 
        fileIdsToUpload.includes(file.id)
      )
      
      console.log('[文件上传] 开始上传知识库文件到Dify:', fileIdsToUpload)
      console.log('[文件上传] 选中的文件对象:', selectedFileObjects)
      
      // 关闭对话框，显示上传进度
      this.closeFileDialog()
      
      // 添加到上传中列表
      selectedFileObjects.forEach(file => {
        console.log('[文件上传] 添加到上传中列表的文件:', file)
        this.uploadingFiles.push({
          id: String(file.id),
          fileName: file.fileName || file.name || '未命名文件',
          fileSize: file.fileSize || file.size || 0,
          fileType: file.fileType || file.type || '文件',
          progress: 0,
          source: 'knowledge'
        })
      })
      console.log('[文件上传] 上传中列表（添加后）:', this.uploadingFiles)
      
      try {
        // 调用上传接口
        const { uploadKnowledgeFilesToDify } = await import('@/api/dify')
        console.log('[文件上传] 准备上传的文件ID:', fileIdsToUpload)
        const uploadResults = await uploadKnowledgeFilesToDify(fileIdsToUpload)
        
        console.log('[文件上传] 上传结果:', uploadResults)
        
        // 处理上传结果
        uploadResults.forEach(result => {
          const knowledgeFileIdStr = String(result.knowledgeFileId)
          console.log('[文件上传] 处理结果:', result, '查找ID:', knowledgeFileIdStr)
          
          // 从上传中列表移除（使用字符串比较）
          const uploadingIndex = this.uploadingFiles.findIndex(f => String(f.id) === knowledgeFileIdStr)
          console.log('[文件上传] 上传中列表:', this.uploadingFiles.map(f => ({ id: f.id, fileName: f.fileName })))
          console.log('[文件上传] 查找索引:', uploadingIndex)
          
          if (uploadingIndex > -1) {
            this.uploadingFiles.splice(uploadingIndex, 1)
            console.log('[文件上传] 已从上传中列表移除:', knowledgeFileIdStr)
          } else {
            console.warn('[文件上传] 未在上传中列表找到文件:', knowledgeFileIdStr)
          }
          
          if (result.success && result.difyFileId) {
            // 查找文件信息
            const fileInfo = selectedFileObjects.find(f => String(f.id) === knowledgeFileIdStr)
            console.log('[文件上传] 找到的文件信息:', fileInfo)
            
            // 添加到已上传列表
            this.uploadedFiles.push({
              id: `knowledge_${result.knowledgeFileId}_${Date.now()}`,
              fileName: result.fileName || fileInfo?.fileName || fileInfo?.name || '未命名文件',
              fileSize: fileInfo?.fileSize || fileInfo?.size || 0,
              fileType: fileInfo?.fileType || fileInfo?.type || '文件',
              difyFileId: result.difyFileId,
              source: 'knowledge',
              knowledgeFileId: knowledgeFileIdStr
            })
            console.log('[文件上传] 文件上传成功并添加到已上传列表:', result.fileName, 'fileSize:', fileInfo?.fileSize || fileInfo?.size, 'difyFileId:', result.difyFileId)
          } else {
            console.error('[文件上传] 文件上传失败:', result.fileName, result.error)
            this.$message && this.$message.error(`文件 ${result.fileName} 上传失败: ${result.error || '未知错误'}`)
          }
        })
        
        if (uploadResults.some(r => r.success)) {
          this.$message && this.$message.success(`成功上传 ${uploadResults.filter(r => r.success).length} 个文件`)
        }
      } catch (error) {
        console.error('[文件上传] 上传知识库文件失败:', error)
        this.$message && this.$message.error('上传文件失败: ' + (error.message || '未知错误'))
        // 清空上传中列表
        this.uploadingFiles = []
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
    
    // 移除已上传的文件
    removeUploadedFile(fileId) {
      const index = this.uploadedFiles.findIndex(f => f.id === fileId)
      if (index > -1) {
        this.uploadedFiles.splice(index, 1)
        console.log('[文件管理] 移除文件:', fileId)
      }
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
     * 生成思维导图 - 控制右侧加载状态
     * 实际生成由左侧 AI 对话完成，解析到图片链接后再更新 mindmapData
     */
    async generateMindmap() {
      // 清空当前思维导图，进入“正在生成”状态
      this.mindmapData = null
      this.isGeneratingMindmap = true
      // 实际生成流程：请在左侧对话中向 AI 发送生成思维导图的指令
      // 或者后续接入后端专门的思维导图生成接口
    },
    
    /**
     * 思维导图拖拽开始（左键按下）
     */
    onMindmapMouseDown(event) {
      if (event.button !== 0) return // 只响应左键
      this.isPanningMindmap = true
      this.mindmapLastX = event.clientX
      this.mindmapLastY = event.clientY
    },

    /**
     * 思维导图拖拽移动
     */
    onMindmapMouseMove(event) {
      if (!this.isPanningMindmap) return
      // 如果已经松开鼠标键，但没有收到 mouseup 事件，则自动结束拖拽
      if ((event.buttons & 1) === 0) {
        this.isPanningMindmap = false
        return
      }
      const dx = event.clientX - this.mindmapLastX
      const dy = event.clientY - this.mindmapLastY
      this.mindmapOffsetX += dx
      this.mindmapOffsetY += dy
      this.mindmapLastX = event.clientX
      this.mindmapLastY = event.clientY
    },

    /**
     * 思维导图拖拽结束
     */
    onMindmapMouseUp() {
      this.isPanningMindmap = false
    },

    /**
     * 思维导图滚轮缩放
     */
    onMindmapWheel(event) {
      const delta = event.deltaY
      const zoomFactor = 0.1
      let newScale = this.mindmapScale + (delta > 0 ? -zoomFactor : zoomFactor)
      // 限制缩放范围
      newScale = Math.min(3, Math.max(0.3, newScale))
      this.mindmapScale = newScale
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

<style scoped>
/* 成果信息栏样式 */
.achievement-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.achievement-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

/* 文件大小徽章样式 */
.file-size-badge {
  padding: 2px 8px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
}

/* 已上传文件显示区域 */
.uploaded-files-section {
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.uploaded-files-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.files-count {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.uploaded-files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.uploaded-file-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.uploaded-file-item.uploading {
  opacity: 0.7;
  border-color: #93c5fd;
  background: #eff6ff;
}

.uploaded-file-item .file-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dbeafe;
  border-radius: 6px;
  color: #3b82f6;
}

.uploaded-file-item.uploading .file-icon {
  background: #bfdbfe;
}

.uploaded-file-item .file-info {
  flex: 1;
  min-width: 0;
}

.uploaded-file-item .file-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uploaded-file-item .file-size,
.uploaded-file-item .file-status {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.uploaded-file-item .file-status {
  color: #3b82f6;
}

.remove-file-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 深色模式支持 */
html.dark-mode .achievement-info-bar {
  background: #1f2937;
}

html.dark-mode .back-btn {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

html.dark-mode .back-btn:hover {
  background: #4b5563;
  border-color: #6b7280;
}

html.dark-mode .achievement-name {
  color: #f3f4f6;
}

html.dark-mode .file-size-badge {
  background: #374151;
  color: #9ca3af;
}
</style>
