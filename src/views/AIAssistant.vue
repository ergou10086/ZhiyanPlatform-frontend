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

      <!-- 移动端模式切换（顶部按钮） -->
      <div class="mobile-mode-toggle">
        <button
          class="mobile-mode-btn"
          :class="{ active: currentMode === 'chat' }"
          @click="switchMode('chat')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>对话问答</span>
        </button>
        <button
          class="mobile-mode-btn"
          :class="{ active: currentMode === 'taskResult' }"
          @click="switchMode('taskResult')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12H15M9 16H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>任务成果草稿</span>
        </button>
      </div>
      
      <!-- 主内容布局：左侧导航，右侧内容区域 -->
      <div class="main-layout">
        <!-- 左侧导航栏（桌面端使用，移动端隐藏） -->
        <div class="mode-sidebar">
          <button 
            :class="['mode-nav-item', { active: currentMode === 'chat' }]"
            @click="switchMode('chat')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>对话问答</span>
          </button>
          <button 
            :class="['mode-nav-item', { active: currentMode === 'taskResult' }]"
            @click="switchMode('taskResult')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12H15M9 16H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>任务成果草稿</span>
          </button>
        </div>

        <!-- 右侧内容区域 -->
        <div class="content-wrapper">
        <!-- 对话问答模式 -->
        <div class="chat-mode-content" v-if="currentMode === 'chat'">
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
        <div class="uploaded-files-panel" :class="{ 'collapsed': filesPanelCollapsed }">
          <div class="files-panel-header">
            <h3 class="files-panel-title">已上传文件</h3>
            <div class="header-actions">
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
              <button
                class="toggle-panel-btn"
                @click="toggleFilesPanel"
                :title="filesPanelCollapsed ? '展开文件列表' : '收起文件列表'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotated': filesPanelCollapsed }">
                  <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
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

        <!-- 任务成果草稿模式 -->
        <div class="task-result-mode-content" v-else-if="currentMode === 'taskResult'">
          <!-- 左侧固定操作区 -->
          <div class="task-control-panel">
            <div class="control-header">
              <h2 class="control-title">成果生成</h2>
              <p class="control-subtitle">选择项目和任务，生成成果草稿</p>
            </div>

            <!-- 选择项目 -->
            <div class="control-item">
              <label class="control-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                选择项目
              </label>
              <div class="control-select-wrapper">
                <v-select
                  v-model="taskResultProjectId"
                  :options="availableProjects"
                  :reduce="reduceProjectOption"
                  label="title"
                  class="project-select"
                  placeholder="请选择项目"
                  :clearable="false"
                  :searchable="false"
                />
              </div>
            </div>

            <!-- 成果标题 
            <div class="control-item">
              <label class="control-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                成果标题（可选）
              </label>
              <input
                v-model="taskResultTitle"
                type="text"
                class="control-input"
                placeholder="例如：实验数据分析报告"
                :disabled="isUploading"
              />
            </div> -->

            <!-- 选择任务按钮 -->
            <div class="control-item">
              <label class="control-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3H17C18.1046 3 19 3.8954 19 5V19C19 20.1046 18.1046 21 17 21H7C5.8954 21 5 20.1046 5 19V5C5 3.8954 5.8954 3 7 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                选择任务
              </label>
              <button
                class="control-task-btn"
                :disabled="!taskResultProjectId"
                @click="openTaskSelectDialog"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                选择已完成任务
              </button>
              <p v-if="selectedTaskSummaries.length > 0" class="selected-info">
                已选择 <strong>{{ selectedTaskSummaries.length }}</strong> 个任务
              </p>
            </div>

            <div class="control-item">
              <label class="control-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                附件设置
              </label>
              <div class="attachment-options">
                <label class="attachment-switch">
                  <input type="checkbox" v-model="includeAttachments">
                  <span>包含相关附件参与生成</span>
                </label>
                <div v-if="includeAttachments" class="attachment-filters">
                  <div class="filters-label">选择参与生成的附件</div>
                  <div v-if="attachmentsLoading" class="filters-list">
                    <span>正在加载附件...</span>
                  </div>
                  <div v-else class="filters-list">
                    <template v-if="availableAttachments && availableAttachments.length">
                      <label
                        v-for="file in availableAttachments"
                        :key="file.taskId + '-' + file.url"
                        class="filter-item"
                      >
                        <input
                          type="checkbox"
                          :value="file.url"
                          v-model="selectedAttachmentUrls"
                        >
                        <span>{{ file.name }}</span>
                      </label>
                    </template>
                    <p v-else class="no-attachments-text">当前选中任务暂无可用附件</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 生成按钮移动到右侧“生成结果”模块 -->
          </div>

          <!-- 右侧滚动内容区 -->
          <div class="task-content-panel">
            <!-- 已选任务列表 -->
            <div class="content-section">
              <div class="section-header">
                <h3 class="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H17C18.1046 3 19 3.8954 19 5V19C19 20.1046 18.1046 21 17 21H7C5.8954 21 5 20.1046 5 19V5C5 3.8954 5.8954 3 7 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 7H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  已选择的任务 <span v-if="selectedTaskSummaries.length > 0" class="task-count">({{ selectedTaskSummaries.length }})</span>
                </h3>
              </div>
              <div class="section-body">
                <div class="tasks-grid" v-if="selectedTaskSummaries.length > 0">
                  <div
                    v-for="task in selectedTaskSummaries"
                    :key="task.id"
                    class="task-item"
                  >
                    <button class="remove-btn" @click="removeSelectedTask(task.id)" title="移除">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <div class="task-info">
                      <div class="task-title" :title="task.title">{{ task.title || '未命名任务' }}</div>
                      <div class="task-meta">
                        <span class="meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          负责人：{{ task.assignee || '未分配' }}
                        </span>
                        <span v-if="task.projectTitle" class="meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          项目：{{ task.projectTitle }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state-inline">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H17C18.1046 3 19 3.8954 19 5V19C19 20.1046 18.1046 21 17 21H7C5.8954 21 5 20.1046 5 19V5C5 3.8954 5.8954 3 7 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p>请从左侧选择任务</p>
                </div>
              </div>
            </div>

            <!-- 补充要求 -->
            <div class="content-section">
              <div class="section-header">
                <h3 class="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17.5 3.50023C17.8978 3.1024 18.4374 2.87891 19 2.87891C19.5626 2.87891 20.1022 3.1024 20.5 3.50023C20.8978 3.89805 21.1213 4.43762 21.1213 5.00023C21.1213 5.56284 20.8978 6.1024 20.5 6.50023L12 15.0002L8 16.0002L9 12.0002L17.5 3.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  补充要求（可选）
                </h3>
              </div>
              <div class="section-body">
                <textarea
                  v-model="taskResultPrompt"
                  class="content-textarea"
                  placeholder="例如：按照论文结构生成，突出创新点和关键数据..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <!-- 生成结果 -->
            <div class="content-section result-section">
              <div class="section-header">
                <h3 class="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H17C18.1046 3 19 3.8954 19 5V19C19 20.1046 18.1046 21 17 21H7C5.8954 21 5 20.1046 5 19V5C5 3.8954 5.8954 3 7 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 16H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  生成结果
                </h3>
                <div class="section-actions">
                  <!-- 左侧：生成/取消生成 -->
                  <button
                    class="result-action-btn primary"
                    :disabled="selectedTaskIds.length === 0 || isGeneratingTaskResult"
                    @click="generateTaskResultDraft"
                  >
                    <svg v-if="!isGeneratingTaskResult" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div v-else class="loading-spinner-small"></div>
                    <span v-if="!isGeneratingTaskResult">生成成果草稿</span>
                    <span v-else>正在生成...</span>
                  </button>
                  <button
                    v-if="isGeneratingTaskResult && taskResultJobId"
                    class="result-action-btn"
                    @click="cancelTaskResultGenerate"
                  >
                    取消生成
                  </button>

                  <!-- 右侧：仅在已有结果时显示的编辑/导出/保存 -->
                  <template v-if="taskResultOutput">
                  <template v-if="!isEditing">
                    <button class="result-action-btn" @click="startEditing">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 14.0002L8 15.0002L9 11.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>编辑</span>
                    </button>
                    <button class="result-action-btn" @click="exportToMarkdown">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 19.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 8L12 13L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 3V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>导出Markdown</span>
                    </button>
                    <button class="result-action-btn primary" @click="uploadTaskResult">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 19.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>保存为成果</span>
                    </button>
                  </template>
                  <template v-else>
                    <button class="result-action-btn" @click="cancelEditing">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>取消</span>
                    </button>
                    <button class="result-action-btn primary" @click="saveEditedContent">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 19.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>保存</span>
                    </button>
                  </template>
                  </template>
                </div>
              </div>
              <div class="section-body result-body">
                <div v-if="isEditing" class="editor-container">
                  <textarea 
                    v-model="editedContent" 
                    class="markdown-editor"
                    placeholder="在这里编辑 Markdown 内容..."
                  ></textarea>
                </div>
                <div v-else-if="taskResultOutput" class="result-content">
                  <div class="markdown-content" v-html="formatMarkdown(taskResultOutput)"></div>
                </div>
                <div v-else class="empty-state-inline">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H17C18.1046 3 19 3.8954 19 5V19C19 20.1046 18.1046 21 17 21H7C5.8954 21 5 20.1046 5 19V5C5 3.8954 5.8954 3 7 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 16H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p>生成的成果草稿会显示在这里</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
      

      <!-- 选择任务的弹窗 -->
        <div v-if="showTaskSelectDialog" class="file-dialog-overlay ai-view" @click="closeTaskSelectDialog">
          <div class="file-dialog" @click.stop>
            <div class="file-dialog-header">
              <div class="header-content">
                <h3>选择已完成任务</h3>
                <p class="header-subtitle">
                  从当前项目中选择一个或多个已完成任务。后端任务列表接口接入后，这里会展示真实数据。
                </p>
              </div>
              <button class="close-btn" @click="closeTaskSelectDialog">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="file-dialog-body">
              <div v-if="taskListLoading" class="loading-container">
                <div class="loading-spinner-large"></div>
                <p class="loading-text">正在加载任务列表...</p>
              </div>
              <div v-else-if="availableDoneTasks.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="empty-text">暂未加载到已完成任务。后端接口接入后，这里会显示真实任务列表。</p>
              </div>
              <div v-else class="file-list-container">
                <div class="file-list">
                  <div
                    v-for="task in availableDoneTasks"
                    :key="task.id"
                    class="file-card"
                    :class="{ 'selected': selectedTaskIds.includes(task.id) }"
                    @click="toggleTaskSelection(task)"
                  >
                    <div class="file-card-content">
                      <div class="file-card-main">
                        <div class="file-name-wrapper">
                          <div class="file-name">{{ task.title || '未命名任务' }}</div>
                          <div class="file-badge-group">
                            <span class="file-type-badge">已完成</span>
                            <span v-if="task.assignee" class="file-count-badge">负责人：{{ task.assignee }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="file-select-indicator" :class="{ 'active': selectedTaskIds.includes(task.id) }">
                        <div class="checkmark-circle">
                          <svg v-if="selectedTaskIds.includes(task.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <button class="btn-cancel" @click="closeTaskSelectDialog">取消</button>
              <button
                class="btn-confirm"
                @click="confirmTaskSelection"
                :disabled="selectedTaskIds.length === 0"
                :class="{ 'disabled': selectedTaskIds.length === 0 }"
              >
                <span>确认选择</span>
                <span v-if="selectedTaskIds.length > 0" class="selected-count">{{ selectedTaskIds.length }}</span>
              </button>
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

    <!-- 文件选择弹窗 - 两步选择：第一步选成果，第二步选文件 -->
    <div v-if="showFileDialog" class="file-dialog-overlay ai-view" @click="closeFileDialog">
      <div class="file-dialog" @click.stop>
        <div class="file-dialog-header">
          <div class="header-content">
            <h3 v-if="!selectedAchievement">第一步：选择成果</h3>
            <h3 v-else>第二步：选择文件</h3>
            <p class="header-subtitle" v-if="!selectedAchievement && achievements.length > 0">从成果目录中选择一个成果</p>
            <p class="header-subtitle" v-else-if="selectedAchievement && selectedAchievementFiles.length > 0">已选择 {{ selectedAchievementFiles.length }} 个文件</p>
          </div>
          <button class="close-btn" @click="closeFileDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="file-dialog-body">
          <!-- 第一步：选择成果 -->
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
              <p class="empty-text">成果目录中暂无成果</p>
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
                          <span class="file-type-badge">{{ achievement.type || '未知类型' }}</span>
                          <span v-if="achievement.fileCount" class="file-count-badge">{{ achievement.fileCount }}个文件</span>
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
          <!-- 第二步：选择文件 -->
          <div v-else>
            <div class="achievement-info-bar">
              <button class="back-btn" @click="backToAchievementSelection">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                返回
              </button>
              <div class="achievement-name">{{ selectedAchievement.name || selectedAchievement.title }}</div>
            </div>
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
              <p class="empty-text">该成果中暂无文件</p>
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
                        <div class="file-name">{{ file.name || file.fileName || file.originalFileName || '未命名文件' }}</div>
                        <div class="file-badge-group">
                          <span class="file-type-badge">{{ file.fileType || file.type || '未知类型' }}</span>
                          <span v-if="file.size" class="file-size-badge">{{ formatFileSize(file.size) }}</span>
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
    

    <!-- 上传进度对话框 - 使用teleport挂载到body -->
    <teleport to="body">
      <el-dialog
        v-if="uploadProgress"
        :model-value="true"
        title="上传成果"
        :close-on-click-modal="false"
        :show-close="!isUploading"
        :close-on-press-escape="false"
        @close="uploadProgress = null"
        width="30%"
      >
        <div class="upload-progress-content">
          <p class="progress-message">{{ uploadProgress.message || '处理中...' }}</p>
          <el-progress 
            :percentage="uploadProgress.total > 0 ? Math.round((uploadProgress.current / uploadProgress.total) * 100) : 0"
            :status="uploadProgress.current >= uploadProgress.total && uploadProgress.total > 0 ? 'success' : ''"
            :stroke-width="8"
          />
          <p class="progress-count">
            已完成: {{ uploadProgress.current || 0 }}/{{ uploadProgress.total || 0 }} 步
          </p>
        </div>
        <template #footer v-if="!isUploading && uploadProgress.current >= uploadProgress.total">
          <el-button type="primary" @click="uploadProgress = null">确定</el-button>
        </template>
      </el-dialog>
    </teleport>
    </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import { projectAPI } from '@/api/project'
import { knowledgeAPI } from '@/api/knowledge'
import { taskAPI } from '@/api/task'
import { generateTaskResultDraft as generateTaskResultDraftApi, getGenerateStatus, cancelGenerate, linkTasksToAchievement, getTasksAttachments } from '@/api/taskResult'
import difyAPI from '@/api/dify'
import vSelect from 'vue-select'
import axios from 'axios'
import 'vue-select/dist/vue-select.css'
import '@/assets/styles/AIAssistant.css'
import '@/assets/styles/KnowledgeBaseAI.css'
import '@/assets/styles/AIAssistantTaskResult-v2.css'
import '@/assets/styles/scifiBackground.css'
import { mountSciFiBackground, destroySciFiBackground } from '@/utils/scifiBackground'

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
    Sidebar,
    'v-select': vSelect
  },
  data() {
    return {
      // 当前模式：chat 对话问答 / taskResult 任务成果草稿
      currentMode: 'chat',
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
      // 两步选择：成果 -> 文件
      achievements: [], // 成果列表（第一步）
      selectedAchievement: null, // 选中的成果
      achievementFiles: [], // 选中成果的文件列表（第二步）
      selectedAchievementFiles: [], // 选中的文件ID列表
      loadingAchievementFiles: false, // 加载成果文件状态
      filesPanelCollapsed: false, // 文件面板折叠状态
      showChatHistoryModal: false,
      chatSessions: [], // 聊天会话列表
      currentChatSessionId: null, // 当前聊天会话ID
      difyConversationId: null, // Dify对话上下文ID
      currentProject: null,
      availableProjects: [],
      tasks: [],
      // 不同项目的任务数据
      projectTasks: {},
      // 任务成果草稿模式相关
      taskResultProjectId: '',
      showTaskSelectDialog: false,
      taskListLoading: false,
      availableDoneTasks: [],
      selectedTaskIds: [],
      selectedTaskSummaries: [],
      taskResultPrompt: '',
      taskResultOutput: '',
      isGeneratingTaskResult: false,
      isEditing: false, // 是否正在编辑成果内容
      editedContent: '', // 编辑中的内容
      includeAttachments: true,
      // 可用附件列表（根据当前选择的任务实时加载）
      availableAttachments: [], // [{ taskId, url, name }]
      // 已选择参与生成的附件 URL 列表
      selectedAttachmentUrls: [],
      // 附件加载状态
      taskResultJobId: null,
      taskResultStatus: '',
      taskResultProgress: 0,
      taskResultStatusTimer: null,
      // ⭐ 打字机效果相关
      typewriterTimer: null, // 打字机定时器
      typewriterQueue: '', // 打字机字符队列
      isTyping: false, // 是否正在打字
      currentTypingMessageIndex: -1, // 当前正在打字的消息索引
      // 流式请求控制
      currentStreamController: null, // 当前流式请求的控制器
      currentAbortController: null, // 用于中断请求的AbortController
      // ⭐ 复制功能状态
      copiedMessageIndex: null, // 当前已复制的消息索引
      // 任务附件相关
      taskAttachments: [], // 所有任务附件列表
      selectedAttachmentIds: [], // 用户选中的附件ID列表
      isSelectingAttachments: false, // 是否正在选择附件
      attachmentsLoading: false, // 附件加载状态
      selectAllAttachments: false, // 是否全选附件
      isIndeterminateAttachments: false, // 附件选择状态
      // 上传相关状态
      uploadProgress: null, // { total: 0, current: 0, message: '' }
      isUploading: false,
      taskResultTitle: '', // 成果标题
      showUploadProgress: false, // 是否显示上传进度对话框
      scifiBgCleanup: null
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
    },
    
    // 任务成果相关计算属性
    selectedTaskAttachmentsCount() {
      return this.selectedAttachmentIds.length
    },
    
    hasSelectedAttachments() {
      return this.selectedAttachmentIds.length > 0
    },
    
    canUpload() {
      return this.taskResultOutput.trim().length > 0 && this.taskResultProjectId
    },
    
    isProcessing() {
      return this.isUploading || this.attachmentsLoading
    }
  },
  watch: {
    // 选中任务变化时，如果开启了附件参与，则重新加载附件列表
    selectedTaskIds(newVal) {
      if (this.includeAttachments && newVal && newVal.length > 0) {
        this.loadTaskAttachments()
      } else {
        this.availableAttachments = []
        this.selectedAttachmentUrls = []
      }
    },
    // 开关“包含附件”时联动加载/清空
    includeAttachments(val) {
      if (val) {
        if (this.selectedTaskIds && this.selectedTaskIds.length > 0) {
          this.loadTaskAttachments()
        }
      } else {
        this.selectedAttachmentUrls = []
      }
    }
  },
  mounted() {
    // 根据屏幕宽度设置文件面板初始折叠状态（移动端默认收起）
    this.filesPanelCollapsed = window.innerWidth <= 768
    
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

    // 如果从知识库成果目录跳转而来，并指定了任务成果模式，则自动切换
    try {
      const { mode, projectId } = this.$route.query || {}
      if (mode === 'taskResult') {
        this.currentMode = 'taskResult'
        if (projectId) {
          this.taskResultProjectId = projectId
        }
      }
    } catch (e) {
      console.warn('[AIAssistant] 解析路由参数失败:', e)
    }

    // 【临时禁用】自动同步功能，避免日志刷屏
    // 用户可以手动点击"同步任务状态"按钮进行同步
    
    // this.syncTimer = setInterval(() => {
    //   this.syncTaskStatusChanges()
    // }, 60000)

    // 科技感背景（仅本页面，低侵入）
    mountSciFiBackground().then((cleanup) => {
      this.scifiBgCleanup = cleanup
    }).catch(err => {
      console.warn('科幻背景初始化失败，已忽略：', err)
    })
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

    // 清理打字机定时器
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer)
      this.typewriterTimer = null
    }
    if (this.taskResultStatusTimer) {
      clearInterval(this.taskResultStatusTimer)
      this.taskResultStatusTimer = null
    }

    // 销毁科技感背景
    if (this.scifiBgCleanup) {
      this.scifiBgCleanup()
      this.scifiBgCleanup = null
    }
  },
  methods: {
    reduceProjectOption(project) {
      return project && project.id
    },

    // 切换左侧模式 Tab
    switchMode(mode) {
      this.currentMode = mode
    },

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

    // === 任务成果草稿模式相关 ===
    // 打开任务选择弹窗
    async openTaskSelectDialog() {
      if (!this.taskResultProjectId) {
        return
      }

      this.showTaskSelectDialog = true
      this.taskListLoading = true

      try {
        // 调用带执行者信息的项目任务接口，前端筛选状态为 DONE 的任务
        console.log('[任务选择] 正在加载项目任务列表(含负责人), 项目ID:', this.taskResultProjectId)
        const response = await taskAPI.getProjectTasks(this.taskResultProjectId, 0, 100)

        console.log('[任务选择] getProjectTasks 后端返回数据:', response)

        // 处理返回的数据
        let tasks = []
        if (response && response.code === 200 && response.data) {
          const data = response.data
          if (Array.isArray(data)) {
            tasks = data
          } else if (Array.isArray(data.content)) {
            // Spring 分页数据
            tasks = data.content
          } else if (Array.isArray(data.list)) {
            tasks = data.list
          }
        } else if (response && response.data && Array.isArray(response.data.content)) {
          // 兼容返回 Page 包在 data 里的情况
          tasks = response.data.content
        } else if (Array.isArray(response)) {
          // 直接返回数组
          tasks = response
        }

        // 仅保留已完成的任务（后端 TaskStatus 为枚举 DONE）
        const doneTasks = (tasks || []).filter(t => {
          const status = t.status || t.taskStatus
          if (!status) return false
          if (typeof status === 'string') {
            return status === 'DONE' || status === '已完成'
          }
          // 如果是对象，尝试读取 name / value
          return status.name === 'DONE' || status.value === 'DONE'
        })

        // 转换为前端需要的格式，拼接负责人名称
        this.availableDoneTasks = doneTasks.map(t => {
          const assignees = Array.isArray(t.assignees) ? t.assignees : []
          const assigneeNames = assignees
            .map(a => a.userName || a.username || a.name)
            .filter(Boolean)
            .join('、') || '未分配'

          return {
            id: t.id || t.taskId,
            title: t.title || t.taskTitle || '未命名任务',
            assignee: assigneeNames,
            raw: t
          }
        })

        console.log('[任务选择] 成功加载', this.availableDoneTasks.length, '个已完成任务(含负责人)')
      } catch (error) {
        console.error('[任务选择] 加载已完成任务失败:', error)
        // 失败时降级到本地筛选
        console.log('[任务选择] 降级使用本地任务数据')
        const doneTasks = (this.tasks || []).filter(t => t.status === 'completed' || t.status === 'DONE')
        this.availableDoneTasks = doneTasks.map(t => ({
          id: t.id,
          title: t.title,
          assignee: t.assignee,
          raw: t
        }))
      } finally {
        this.taskListLoading = false
      }
    },

    async loadTaskAttachments() {
      if (!this.selectedTaskIds || this.selectedTaskIds.length === 0) {
        this.availableAttachments = []
        this.selectedAttachmentUrls = []
        return
      }

      this.attachmentsLoading = true
      try {
        const resp = await getTasksAttachments(this.selectedTaskIds)

        let data = resp
        if (data && typeof data.code !== 'undefined' && data.data) {
          data = data.data
        } else if (data && data.data) {
          data = data.data
        }

        const list = []
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(taskIdStr => {
            const urls = data[taskIdStr] || []
            urls.forEach(url => {
              if (!url) return
              const name = this.extractFileNameFromUrl(url)
              list.push({
                taskId: taskIdStr,
                url,
                name
              })
            })
          })
        }

        this.availableAttachments = list

        // 默认全部选中
        this.selectedAttachmentUrls = list.map(item => item.url)
      } catch (e) {
        console.error('[任务成果] 加载任务附件失败:', e)
        this.availableAttachments = []
        this.selectedAttachmentUrls = []
      } finally {
        this.attachmentsLoading = false
      }
    },

    extractFileNameFromUrl(url) {
      if (!url || typeof url !== 'string') return '附件'
      const idx = url.lastIndexOf('/')
      if (idx >= 0 && idx < url.length - 1) {
        return url.substring(idx + 1)
      }
      return url
    },

    closeTaskSelectDialog() {
      this.showTaskSelectDialog = false
    },

    // 勾选/取消任务
    toggleTaskSelection(task) {
      const id = task.id
      const index = this.selectedTaskIds.indexOf(id)
      if (index > -1) {
        this.selectedTaskIds.splice(index, 1)
      } else {
        this.selectedTaskIds.push(id)
      }
    },

    // 确认选择任务，将其摘要保存到 selectedTaskSummaries
    confirmTaskSelection() {
      if (this.selectedTaskIds.length === 0) return

      const selected = this.availableDoneTasks.filter(t => this.selectedTaskIds.includes(t.id))
      // 根据成果生成面板中选择的项目ID，确定项目名称
      const projectForTaskResult = this.availableProjects.find(p => String(p.id) === String(this.taskResultProjectId))
      const projectTitle = projectForTaskResult
        ? (projectForTaskResult.title || projectForTaskResult.name || '未命名项目')
        : (this.currentProject ? (this.currentProject.title || this.currentProject.name || '当前项目') : '')

      this.selectedTaskSummaries = selected.map(t => ({
        id: t.id,
        title: t.title,
        assignee: t.assignee,
        projectTitle
      }))

      this.showTaskSelectDialog = false
    },

    // 清空所有已选任务
    clearSelectedTasks() {
      this.selectedTaskIds = []
      this.selectedTaskSummaries = []
    },

    // 移除单个已选任务
    removeSelectedTask(taskId) {
      this.selectedTaskIds = this.selectedTaskIds.filter(id => id !== taskId)
      this.selectedTaskSummaries = this.selectedTaskSummaries.filter(t => t.id !== taskId)
    },

    // 生成任务成果草稿（调用后端 AI 接口）
    async generateTaskResultDraft() {
      if (!this.taskResultProjectId || this.selectedTaskIds.length === 0 || this.isGeneratingTaskResult) {
        return
      }

      this.isGeneratingTaskResult = true
      this.taskResultOutput = ''
      this.taskResultJobId = null
      this.taskResultStatus = ''
      this.taskResultProgress = 0

      const payload = {
        projectId: this.taskResultProjectId,
        taskIds: this.selectedTaskIds,
        achievementTitle: '',
        targetAudience: '',
        additionalRequirements: this.taskResultPrompt && this.taskResultPrompt.trim() ? this.taskResultPrompt.trim() : undefined,
        includeAttachments: this.includeAttachments && this.selectedAttachmentUrls.length > 0,
        // 这里将选中的附件URL列表传给后端，由后端决定如何处理
        attachmentFilters: this.includeAttachments ? this.selectedAttachmentUrls : []
      }

      try {
        console.log('[任务成果] 提交AI生成请求:', payload)
        console.log('[任务成果] 选中的附件数量:', this.selectedAttachmentUrls.length)
        console.log('[任务成果] 选中的附件URLs:', this.selectedAttachmentUrls)
        const resp = await generateTaskResultDraftApi(payload)

        let data = resp
        if (data && typeof data.code !== 'undefined' && data.data) {
          data = data.data
        } else if (data && data.data) {
          data = data.data
        }

        const jobId = data && data.jobId ? data.jobId : null

        if (!jobId) {
          console.error('[任务成果] 未获取到 jobId，响应:', resp)
          this.taskResultOutput = 'AI 生成任务提交失败：未返回任务ID'
          this.isGeneratingTaskResult = false
          return
        }

        this.taskResultJobId = jobId
        this.taskResultStatus = data.status || 'PENDING'
        this.taskResultProgress = typeof data.progress === 'number' ? data.progress : 0

        this.startTaskResultStatusPolling()
      } catch (error) {
        console.error('[任务成果] 提交AI生成请求失败:', error)
        const message = (error && error.message) || '请求异常'
        this.taskResultOutput = `AI 生成失败：${message}`
        this.isGeneratingTaskResult = false
      }
    },

    async startTaskResultStatusPolling() {
      if (!this.taskResultJobId) {
        return
      }

      if (this.taskResultStatusTimer) {
        clearInterval(this.taskResultStatusTimer)
        this.taskResultStatusTimer = null
      }

      const poll = async () => {
        try {
          console.log('[任务成果] 轮询生成状态, jobId:', this.taskResultJobId)
          const resp = await getGenerateStatus(this.taskResultJobId)

          let data = resp
          if (data && typeof data.code !== 'undefined' && data.data) {
            data = data.data
          } else if (data && data.data) {
            data = data.data
          }

          if (!data) {
            return
          }

          this.taskResultStatus = data.status || this.taskResultStatus
          this.taskResultProgress = typeof data.progress === 'number' ? data.progress : this.taskResultProgress

          if (data.draftContent && data.draftContent.markdown) {
            this.taskResultOutput = data.draftContent.markdown
          }

          // 恢复用户选中的附件URL（从后端响应中）
          // ⚠️ 只有当后端明确返回了附件列表时才覆盖，否则保留前端已选择的附件
          if (data.selectedAttachmentUrls && Array.isArray(data.selectedAttachmentUrls) && data.selectedAttachmentUrls.length > 0) {
            this.selectedAttachmentUrls = data.selectedAttachmentUrls
            console.log('[任务成果] 从后端恢复选中的附件URL:', this.selectedAttachmentUrls.length, '个')
          } else {
            console.log('[任务成果] 后端未返回附件URL，保留前端选择:', this.selectedAttachmentUrls.length, '个')
          }

          if (this.taskResultStatus === 'COMPLETED' || this.taskResultStatus === 'FAILED' || this.taskResultStatus === 'CANCELLED') {
            if (this.taskResultStatusTimer) {
              clearInterval(this.taskResultStatusTimer)
              this.taskResultStatusTimer = null
            }
            this.isGeneratingTaskResult = false

            if (this.taskResultStatus === 'FAILED' && data.errorMessage) {
              this.taskResultOutput = `生成失败：${data.errorMessage}`
            }
          }
        } catch (error) {
          console.error('[任务成果] 查询生成状态失败:', error)
          if (this.taskResultStatusTimer) {
            clearInterval(this.taskResultStatusTimer)
            this.taskResultStatusTimer = null
          }
          this.isGeneratingTaskResult = false
        }
      }

      await poll()
      this.taskResultStatusTimer = setInterval(poll, 2000)
    },

    async cancelTaskResultGenerate() {
      if (!this.taskResultJobId || !this.isGeneratingTaskResult) {
        return
      }

      try {
        console.log('[任务成果] 取消AI生成, jobId:', this.taskResultJobId)
        await cancelGenerate(this.taskResultJobId)
      } catch (error) {
        console.error('[任务成果] 取消AI生成失败:', error)
      } finally {
        if (this.taskResultStatusTimer) {
          clearInterval(this.taskResultStatusTimer)
          this.taskResultStatusTimer = null
        }
        this.isGeneratingTaskResult = false
        this.taskResultStatus = 'CANCELLED'
      }
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
            const fileId = file.id || file.fileId
            if (fileId) {
              console.log('[AI助手] 添加知识库文件ID:', fileId, '类型:', typeof fileId, '来源文件:', file)
              knowledgeFileIds.push(fileId)
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
    
    // 关闭文件选择弹窗
    closeFileDialog() {
      this.showFileDialog = false
      this.selectedFiles = []
      this.selectedAchievement = null
      this.achievementFiles = []
      this.selectedAchievementFiles = []
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    
    // 加载成果列表（第一步）
    async loadFiles(projectId) {
      if (!projectId) {
        console.warn('项目ID不存在，无法加载成果列表')
        return
      }

      this.loadingFiles = true
      try {
        const response = await knowledgeAPI.getProjectAchievements(projectId, 0, 1000)
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
          // 调试：打印第一个文件的详细信息
          if (this.achievementFiles.length > 0) {
            console.log('第一个文件详情:', this.achievementFiles[0])
            console.log('第一个文件ID:', this.achievementFiles[0].id, '类型:', typeof this.achievementFiles[0].id)
          }
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
    
    // 切换文件选择状态
    toggleAchievementFileSelection(fileId) {
      const index = this.selectedAchievementFiles.indexOf(fileId)
      if (index > -1) {
        this.selectedAchievementFiles.splice(index, 1)
      } else {
        this.selectedAchievementFiles.push(fileId)
      }
    },
    
    // 确认选择文件
    confirmAchievementFileSelection() {
      if (this.selectedAchievementFiles.length === 0) return
      
      const selectedFileObjects = this.achievementFiles.filter(file => 
        this.selectedAchievementFiles.includes(file.id)
      )

      const selectedFileNames = selectedFileObjects
        .map(file => file.name || file.fileName || file.originalFileName || '未命名文件')
        .join('、')
      
      // 将选中的文件添加到已上传文件列表
      selectedFileObjects.forEach(file => {
        // 确保ID是字符串，避免精度丢失
        const fileIdStr = String(file.id)
        const exists = this.uploadedFiles.some(f => f.id === fileIdStr && !f.isLocal)
        if (!exists) {
          this.uploadedFiles.push({
            id: fileIdStr,  // 存储为字符串
            name: file.name || file.fileName || file.originalFileName || '未命名文件',
            type: file.fileType || file.type || '文件',
            isLocal: false,
            fileId: fileIdStr,  // 存储为字符串
            achievementId: String(this.selectedAchievement.id),
            achievementName: this.selectedAchievement.name || this.selectedAchievement.title
          })
        }
      })

      // 文件通过 knowledgeFileIds 传递给 AI，不需要在消息中添加文件信息
      console.log('选中的文件ID:', this.selectedAchievementFiles)
      console.log('选中的文件:', selectedFileObjects)
      
      this.closeFileDialog()
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

    // 切换文件面板折叠状态
    toggleFilesPanel() {
      this.filesPanelCollapsed = !this.filesPanelCollapsed
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
    },

    // ========== 任务成果编辑相关方法 ==========
    // 开始编辑
    startEditing() {
      this.editedContent = this.taskResultOutput
      this.isEditing = true
    },

    // 取消编辑
    cancelEditing() {
      this.isEditing = false
      this.editedContent = ''
    },

    // 保存编辑内容
    saveEditedContent() {
      this.taskResultOutput = this.editedContent
      this.isEditing = false
      this.editedContent = ''
      alert('内容已保存')
    },

    // 导出为 Markdown 文件
    exportToMarkdown() {
      if (!this.taskResultOutput) {
        alert('没有可导出的内容')
        return
      }

      const blob = new Blob([this.taskResultOutput], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      a.download = `成果_${dateStr}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    // 更新上传进度
    updateProgress(message, increment = 0) {
      if (!this.uploadProgress) {
        this.uploadProgress = { total: 0, current: 0, message: '' }
      }
      
      if (message) {
        this.uploadProgress.message = message
      }
      
      if (increment > 0) {
        this.uploadProgress.current += increment
      }
      
      console.log(`📊 进度更新: ${this.uploadProgress.current}/${this.uploadProgress.total} - ${this.uploadProgress.message}`)
    },

    // 上传为成果
    async uploadTaskResult() {
      console.log('🚀🚀🚀 [uploadTaskResult] v3.0 方法被调用 - 完整重写附件检测逻辑！🚀🚀🚀')
      
      // 验证输入
      if (!this.taskResultOutput || !this.taskResultOutput.trim()) {
        this.$message.warning('没有可上传的内容')
        return
      }

      if (!this.taskResultProjectId) {
        this.$message.warning('请先选择项目')
        return
      }

      // 防止重复提交
      if (this.isUploading) {
        this.$message.warning('正在上传中，请稍候...')
        return
      }

      try {
        this.isUploading = true
        
        // ==================== 第1步：完整的状态诊断 ====================
        console.log('╔═══════════════════════════════════════════════════════════════════════╗')
        console.log('║              [uploadTaskResult] 开始上传 - 完整状态诊断              ║')
        console.log('╚═══════════════════════════════════════════════════════════════════════╝')
        
        console.log('\n📌 1️⃣ 附件功能开关:')
        console.log('   includeAttachments =', this.includeAttachments, `(类型: ${typeof this.includeAttachments})`)
        
        console.log('\n📌 2️⃣ 选中的任务:')
        console.log('   selectedTaskIds =', JSON.stringify(this.selectedTaskIds))
        console.log('   selectedTaskIds.length =', this.selectedTaskIds ? this.selectedTaskIds.length : 'undefined')
        console.log('   是数组? =', Array.isArray(this.selectedTaskIds))
        
        console.log('\n📌 3️⃣ 可用附件列表 (availableAttachments):')
        console.log('   存在? =', !!this.availableAttachments)
        console.log('   类型 =', typeof this.availableAttachments)
        console.log('   是数组? =', Array.isArray(this.availableAttachments))
        console.log('   长度 =', this.availableAttachments ? this.availableAttachments.length : 'undefined')
        if (this.availableAttachments && Array.isArray(this.availableAttachments) && this.availableAttachments.length > 0) {
          console.log('   📎 可用附件详情:')
          this.availableAttachments.forEach((att, idx) => {
            console.log(`      [${idx}] taskId=${att.taskId}, name="${att.name}", url="${att.url}"`)
          })
        } else {
          console.log('   ⚠️ 没有可用附件')
        }
        
        console.log('\n📌 4️⃣ 已选中的附件URL (selectedAttachmentUrls) - 【关键检查】:')
        console.log('   存在? =', !!this.selectedAttachmentUrls)
        console.log('   类型 =', typeof this.selectedAttachmentUrls)
        console.log('   是数组? =', Array.isArray(this.selectedAttachmentUrls))
        console.log('   长度 =', this.selectedAttachmentUrls ? this.selectedAttachmentUrls.length : 'undefined')
        console.log('   原始值 =', JSON.stringify(this.selectedAttachmentUrls))
        
        if (Array.isArray(this.selectedAttachmentUrls) && this.selectedAttachmentUrls.length > 0) {
          console.log('   ✅ 用户已选中的附件URL:')
          this.selectedAttachmentUrls.forEach((url, idx) => {
            console.log(`      [${idx}] ${url}`)
          })
        } else {
          console.log('   ⚠️ selectedAttachmentUrls 为空或不是有效数组')
        }
        
        console.log('\n═══════════════════════════════════════════════════════════════════════')
        
        // ==================== 第2步：数据规范化 ====================
        console.log('\n🔧 数据规范化处理...')
        
        // 确保 selectedAttachmentUrls 是有效的数组
        if (!Array.isArray(this.selectedAttachmentUrls)) {
          console.warn('⚠️ selectedAttachmentUrls 不是数组，重置为空数组')
          this.selectedAttachmentUrls = []
        }
        
        // 确保 availableAttachments 是有效的数组
        if (!Array.isArray(this.availableAttachments)) {
          console.warn('⚠️ availableAttachments 不是数组，重置为空数组')
          this.availableAttachments = []
        }
        
        // 确保 selectedTaskIds 是有效的数组
        if (!Array.isArray(this.selectedTaskIds)) {
          console.warn('⚠️ selectedTaskIds 不是数组，重置为空数组')
          this.selectedTaskIds = []
        }
        
        console.log('✅ 数据规范化完成')
        
        // ==================== 第3步：判断是否需要上传附件 ====================
        console.log('\n🎯 附件上传决策分析:')
        
        const condition1 = this.includeAttachments === true
        const condition2 = this.availableAttachments.length > 0
        const condition3 = this.selectedAttachmentUrls.length > 0
        
        console.log('   条件1: includeAttachments === true?', condition1)
        console.log('   条件2: availableAttachments.length > 0?', condition2, `(当前: ${this.availableAttachments.length})`)
        console.log('   条件3: selectedAttachmentUrls.length > 0?', condition3, `(当前: ${this.selectedAttachmentUrls.length})`)
        
        const shouldUploadAttachments = condition1 && condition2 && condition3
        
        console.log('   ➡️ 最终决策: shouldUploadAttachments =', shouldUploadAttachments)
        
        if (!shouldUploadAttachments) {
          console.log('\n❌ 跳过附件上传，原因:')
          if (!condition1) console.log('      - 用户未勾选"包含相关附件参与生成"复选框')
          if (!condition2) console.log('      - 没有可用的附件 (availableAttachments 为空)')
          if (!condition3) console.log('      - 用户未选择任何附件URL (selectedAttachmentUrls 为空)')
        } else {
          console.log('\n✅ 将上传附件！')
        }
        
        // ==================== 第4步：计算总步骤数 ====================
        let estimatedAttachmentCount = 0
        if (shouldUploadAttachments) {
          estimatedAttachmentCount = this.selectedAttachmentUrls.length
        }
        
        const totalSteps = 1 + 1 + estimatedAttachmentCount + (this.selectedTaskIds.length > 0 ? 1 : 0)
        
        console.log('\n📊 总步骤数计算:')
        console.log('   创建成果: 1 步')
        console.log('   上传Markdown: 1 步')
        console.log('   上传附件:', estimatedAttachmentCount, '步')
        console.log('   关联任务:', this.selectedTaskIds.length > 0 ? 1 : 0, '步')
        console.log('   ➡️ 总计:', totalSteps, '步')
        
        console.log('\n═══════════════════════════════════════════════════════════════════════\n')
        
        // 初始化进度
        this.uploadProgress = {
          total: totalSteps,
          current: 0,
          message: '准备上传...'
        }
        
        // ==================== 第5步：获取任务附件 ====================
        let attachments = []
        
        if (shouldUploadAttachments) {
          console.log('🔄 开始下载选中的附件...')
          this.updateProgress('正在下载选中的附件...', 0)
          
          try {
            attachments = await this.fetchTaskAttachments(this.selectedTaskIds)
            console.log(`✅ 附件下载完成: ${attachments.length}/${this.selectedAttachmentUrls.length}`)
            
            if (attachments.length > 0) {
              console.log('📎 已下载的附件:')
              attachments.forEach((att, idx) => {
                console.log(`   [${idx}] ${att.fileName} (${att.fileSize} bytes, ${att.fileType})`)
              })
            } else {
              console.warn('⚠️ 未能下载任何附件，请检查 fetchTaskAttachments 方法')
            }
            
            // 如果实际下载的附件数量与预估不同，更新总步骤数
            if (attachments.length !== estimatedAttachmentCount) {
              const actualTotalSteps = 1 + 1 + attachments.length + (this.selectedTaskIds.length > 0 ? 1 : 0)
              this.uploadProgress.total = actualTotalSteps
              console.log(`ℹ️ 更新总步骤数: ${totalSteps} → ${actualTotalSteps}`)
            }
          } catch (error) {
            console.error('❌ 下载附件失败:', error)
            console.error('错误堆栈:', error.stack)
            console.log('⚠️ 将继续上传流程，但不包含附件')
          }
        } else {
          console.log('ℹ️ 跳过附件下载步骤')
        }
        
        console.log('\n═══════════════════════════════════════════════════════════════════════')
        
        // ==================== 第6步：创建成果 ====================
        console.log('\n📝 步骤 1/4: 创建成果记录...')
        this.updateProgress('正在创建成果记录...', 0)
        const achievement = await this.createAchievement()
        
        if (!achievement || !achievement.id) {
          throw new Error('创建成果失败：未返回成果ID')
        }
        console.log('✅ 成果创建成功, ID:', achievement.id)
        
        // ==================== 第7步：上传Markdown文件 ====================
        console.log('\n📄 步骤 2/4: 上传Markdown文件...')
        await this.uploadMarkdownFile(achievement.id)
        console.log('✅ Markdown文件上传成功')
        
        // ==================== 第8步：上传附件 ====================
        console.log('\n📎 步骤 3/4: 上传附件...')
        if (attachments.length > 0) {
          console.log(`🔄 开始上传 ${attachments.length} 个附件到成果 ${achievement.id}`)
          await this.uploadAttachments(achievement.id, attachments)
          console.log('✅ 附件上传完成')
        } else {
          console.log('ℹ️ 没有附件需要上传 (attachments 数组长度为 0)')
        }
        
        // ==================== 第9步：关联任务 ====================
        console.log('\n🔗 步骤 4/4: 关联任务...')
        if (this.selectedTaskIds.length > 0) {
          await this.linkTasks(achievement.id)
          console.log('✅ 任务关联成功')
        } else {
          console.log('ℹ️ 无需关联任务')
        }

        // ==================== 第10步：完成 ====================
        this.updateProgress('✅ 上传完成！')
        this.$message.success('成果上传成功')
        
        console.log('\n╔═══════════════════════════════════════════════════════════════════════╗')
        console.log('║                 ✅ [uploadTaskResult] 所有步骤完成                    ║')
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n')

      } catch (error) {
        console.error('\n╔═══════════════════════════════════════════════════════════════════════╗')
        console.error('║                 ❌ [uploadTaskResult] 上传失败                        ║')
        console.error('╚═══════════════════════════════════════════════════════════════════════╝')
        console.error('错误对象:', error)
        console.error('错误消息:', error.message)
        console.error('错误堆栈:', error.stack)
        
        const errorMessage = error.message || error.msg || '未知错误'
        this.$message.error(`上传失败: ${errorMessage}`)
        
        // 更新进度显示错误
        if (this.uploadProgress) {
          this.uploadProgress.message = `❌ 上传失败: ${errorMessage}`
        }
      } finally {
        this.isUploading = false
        console.log('\n🏁 uploadTaskResult 方法执行结束\n')
      }
    },

    // 创建成果
    async createAchievement() {
      try {
        // 生成成果标题
        const achievementTitle = this.taskResultTitle?.trim() || 
          `AI生成的任务成果_${new Date().toLocaleDateString('zh-CN')}`
        
        const response = await knowledgeAPI.createAchievement({
          projectId: this.taskResultProjectId,
          title: achievementTitle,
          content: this.taskResultOutput,
          type: 'report', // 使用 report 类型，对应后端的 report 枚举
          description: `由 ${this.selectedTaskIds.length} 个任务生成的成果`
        })
        
        // 处理响应数据
        let achievementData = null
        if (response && typeof response === 'object') {
          if (response.code === 200) {
            achievementData = response.data
          } else if (response.data && !response.code) {
            // 兼容直接返回数据的情况
            achievementData = response.data
          } else {
            throw new Error(response.msg || response.message || '创建成果失败')
          }
        } else {
          achievementData = response
        }
        
        if (!achievementData || !achievementData.id) {
          throw new Error('创建成果失败：响应数据无效')
        }
        
        this.updateProgress('成果创建成功', 1)
        return achievementData
      } catch (error) {
        console.error('创建成果失败:', error)
        throw error
      }
    },

    // 生成标准化的文件名（避免中文编码问题）
    generateStandardFileName(originalName, extension = 'md') {
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8) // 6位随机字符串
      
      // 如果有原始文件名，尝试提取扩展名
      let ext = extension
      if (originalName) {
        const lastDot = originalName.lastIndexOf('.')
        if (lastDot > 0) {
          ext = originalName.substring(lastDot + 1).toLowerCase()
        }
      }
      
      // 生成格式: achievement-{timestamp}-{random}.{ext}
      return `achievement-${timestamp}-${randomStr}.${ext}`
    },

    // 上传Markdown文件
    async uploadMarkdownFile(achievementId) {
      try {
        this.updateProgress('正在上传Markdown文件...')
        
        // 验证 achievementId
        if (!achievementId) {
          throw new Error('成果ID不能为空')
        }
        
        // 验证内容
        if (!this.taskResultOutput || !this.taskResultOutput.trim()) {
          throw new Error('成果内容不能为空')
        }
        
        // 生成标准化的文件名: achievement-{timestamp}-{random}.md
        const fileName = this.generateStandardFileName(this.taskResultTitle || 'achievement', 'md')
        
        // 创建文件对象
        const content = this.taskResultOutput
        const file = new File(
          [content],
          fileName,
          { 
            type: 'text/markdown;charset=utf-8',
            lastModified: Date.now()
          }
        )
        
        // 验证文件对象
        console.log('[uploadMarkdownFile] 文件对象信息:')
        console.log('  文件名:', file.name)
        console.log('  文件大小:', file.size, 'bytes')
        console.log('  文件类型:', file.type)
        console.log('  成果ID:', achievementId, '类型:', typeof achievementId)
        
        if (file.size === 0) {
          throw new Error('文件内容为空，无法上传')
        }
        
        const response = await knowledgeAPI.uploadFile(file, achievementId)
        
        // 检查响应
        if (response && response.code !== undefined && response.code !== 200) {
          throw new Error(response.msg || response.message || 'Markdown文件上传失败')
        }
        
        this.updateProgress('Markdown文件上传成功', 1)
      } catch (error) {
        console.error('上传Markdown文件失败:', error)
        const errorMessage = error.message || error.msg || '未知错误'
        throw new Error(`上传Markdown文件失败: ${errorMessage}`)
      }
    },

    // 上传附件
    async uploadAttachments(achievementId, attachments) {
      if (!attachments || attachments.length === 0) {
        console.log('[uploadAttachments] 没有附件需要上传')
        return
      }
      
      const totalAttachments = attachments.length
      let successCount = 0
      let failCount = 0
      
      console.log(`[uploadAttachments] 开始上传 ${totalAttachments} 个附件到成果 ${achievementId}`)
      
      for (let i = 0; i < totalAttachments; i++) {
        const attachment = attachments[i]
        const originalFileName = attachment.fileName || attachment.name || `attachment_${i + 1}`
        
        console.log(`[uploadAttachments] 正在处理附件 ${i + 1}/${totalAttachments}: ${originalFileName}`)
        this.updateProgress(`正在上传附件 (${i + 1}/${totalAttachments}): ${originalFileName}`)
        
        try {
          // 如果附件是文件对象，需要重命名为标准化格式
          if (attachment.file && attachment.file instanceof File) {
            // 生成标准化的文件名
            const standardFileName = this.generateStandardFileName(originalFileName)
            
            // 创建新的文件对象，使用标准化文件名
            const renamedFile = new File(
              [attachment.file],
              standardFileName,
              {
                type: attachment.file.type || 'application/octet-stream',
                lastModified: attachment.file.lastModified || Date.now()
              }
            )
            
            console.log(`[uploadAttachments] 附件重命名: ${originalFileName} -> ${standardFileName}`)
            
            const response = await knowledgeAPI.uploadFile(renamedFile, achievementId)
            
            // 检查响应
            if (response && response.code !== undefined && response.code !== 200) {
              throw new Error(response.msg || '附件上传失败')
            }
            
            successCount++
            this.updateProgress('', 1) // 增加进度
          } else if (attachment.url) {
            // 如果附件是URL，需要先下载再上传
            try {
              console.log(`[uploadAttachments] 开始下载URL附件: ${attachment.url}`)
              
              const token = localStorage.getItem('access_token')
              
              // 下载文件
              const fileResponse = await axios.get(attachment.url, {
                responseType: 'blob',
                headers: {
                  'Authorization': token ? `Bearer ${token}` : undefined
                },
                timeout: 60000 // 60秒超时
              })
              
              // 从响应头获取文件类型
              let fileType = fileResponse.headers['content-type'] || 'application/octet-stream'
              if (fileType === 'application/octet-stream') {
                const ext = originalFileName.split('.').pop()?.toLowerCase()
                const mimeTypes = {
                  'pdf': 'application/pdf',
                  'doc': 'application/msword',
                  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'xls': 'application/vnd.ms-excel',
                  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'ppt': 'application/vnd.ms-powerpoint',
                  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  'txt': 'text/plain',
                  'md': 'text/markdown',
                  'jpg': 'image/jpeg',
                  'jpeg': 'image/jpeg',
                  'png': 'image/png',
                  'gif': 'image/gif'
                }
                fileType = mimeTypes[ext] || fileType
              }
              
              // 创建 File 对象
              const downloadedFile = new File(
                [fileResponse.data],
                originalFileName,
                {
                  type: fileType,
                  lastModified: Date.now()
                }
              )
              
              // 生成标准化的文件名
              const standardFileName = this.generateStandardFileName(originalFileName)
              
              // 创建重命名后的文件对象
              const renamedFile = new File(
                [downloadedFile],
                standardFileName,
                {
                  type: fileType,
                  lastModified: downloadedFile.lastModified
                }
              )
              
              console.log(`[uploadAttachments] URL附件下载成功: ${originalFileName} -> ${standardFileName}`)
              
              // 上传文件
              const response = await knowledgeAPI.uploadFile(renamedFile, achievementId)
              
              // 检查响应
              if (response && response.code !== undefined && response.code !== 200) {
                throw new Error(response.msg || '附件上传失败')
              }
              
              successCount++
              this.updateProgress('', 1) // 增加进度
            } catch (urlError) {
              console.error(`[uploadAttachments] URL附件处理失败: ${originalFileName}`, urlError)
              failCount++
              this.updateProgress('', 1) // 增加进度，避免卡住
            }
          } else {
            console.warn('附件格式不支持:', attachment)
            failCount++
            this.updateProgress('', 1) // 增加进度，避免卡住
          }
        } catch (error) {
          console.warn(`附件上传失败: ${originalFileName}`, error)
          failCount++
          // 继续上传其他附件，但也要更新进度
          this.updateProgress('', 1)
        }
      }
      
      // 显示上传结果摘要
      if (failCount > 0) {
        this.updateProgress(`附件上传完成：成功 ${successCount} 个，失败 ${failCount} 个`, 0)
      } else {
        this.updateProgress(`所有附件上传成功 (${successCount} 个)`, 0)
      }
    },

    // 关联任务
    async linkTasks(achievementId) {
      if (!this.selectedTaskIds || this.selectedTaskIds.length === 0) {
        return
      }
      
      try {
        this.updateProgress(`正在关联 ${this.selectedTaskIds.length} 个任务...`)
        
        const response = await linkTasksToAchievement(achievementId, this.selectedTaskIds)
        
        // 检查响应
        if (response && response.code !== undefined && response.code !== 200) {
          throw new Error(response.msg || '关联任务失败')
        }
        
        this.updateProgress('任务关联成功', 1)
      } catch (error) {
        console.warn('关联任务失败:', error)
        // 不抛出错误，允许继续，但也要更新进度
        const errorMsg = error.message || error.msg || '未知错误'
        this.updateProgress(`任务关联失败: ${errorMsg}，但成果已创建`, 1)
      }
    },

    // 获取任务附件（将选中的附件URL转换为文件对象）
    async fetchTaskAttachments(taskIds) {
      console.log('\n╔═══════════════════════════════════════════════════════════════════════╗')
      console.log('║              [fetchTaskAttachments] 开始获取任务附件                  ║')
      console.log('╚═══════════════════════════════════════════════════════════════════════╝')
      
      // 参数验证
      console.log('\n📌 参数检查:')
      console.log('   taskIds =', JSON.stringify(taskIds))
      console.log('   taskIds.length =', taskIds ? taskIds.length : 'undefined')
      
      if (!taskIds || taskIds.length === 0) {
        console.log('❌ taskIds 为空，返回空数组')
        return []
      }

      // 检查选中的附件URL
      console.log('\n📌 selectedAttachmentUrls 检查:')
      console.log('   存在? =', !!this.selectedAttachmentUrls)
      console.log('   类型 =', typeof this.selectedAttachmentUrls)
      console.log('   是数组? =', Array.isArray(this.selectedAttachmentUrls))
      console.log('   长度 =', this.selectedAttachmentUrls ? this.selectedAttachmentUrls.length : 'undefined')
      
      if (!this.selectedAttachmentUrls || this.selectedAttachmentUrls.length === 0) {
        console.log('❌ 没有选中的附件URL，返回空数组')
        return []
      }
      
      console.log('   ✅ 用户选中了', this.selectedAttachmentUrls.length, '个附件URL')
      this.selectedAttachmentUrls.forEach((url, idx) => {
        console.log(`      [${idx}] ${url}`)
      })

      const attachments = []
      
      try {
        console.log('\n📌 availableAttachments 检查:')
        console.log('   存在? =', !!this.availableAttachments)
        console.log('   类型 =', typeof this.availableAttachments)
        console.log('   是数组? =', Array.isArray(this.availableAttachments))
        console.log('   长度 =', this.availableAttachments ? this.availableAttachments.length : 'undefined')
        
        if (!this.availableAttachments || this.availableAttachments.length === 0) {
          console.error('❌ availableAttachments 为空，无法获取附件信息')
          return []
        }
        
        console.log('   ✅ 可用附件列表:')
        this.availableAttachments.forEach((att, idx) => {
          console.log(`      [${idx}] taskId=${att.taskId}, name="${att.name}", url="${att.url}"`)
        })
        
        // 从 availableAttachments 中获取选中URL对应的附件信息
        console.log('\n🔍 匹配选中的附件...')
        const selectedAttachments = this.availableAttachments.filter(att => 
          this.selectedAttachmentUrls.includes(att.url)
        )
        
        console.log(`✅ 匹配到 ${selectedAttachments.length}/${this.selectedAttachmentUrls.length} 个附件`)
        
        if (selectedAttachments.length === 0) {
          console.error('❌ 没有匹配到任何附件！')
          console.error('   可能原因: selectedAttachmentUrls 中的URL与 availableAttachments 中的URL不匹配')
          console.error('   selectedAttachmentUrls:', this.selectedAttachmentUrls)
          console.error('   availableAttachments URLs:', this.availableAttachments.map(a => a.url))
          return []
        }
        
        console.log('   匹配的附件:')
        selectedAttachments.forEach((att, idx) => {
          console.log(`      [${idx}] ${att.name}`)
        })
        
        // 遍历选中的附件，下载并转换为文件对象
        console.log('\n🔄 开始下载附件文件...')
        for (let i = 0; i < selectedAttachments.length; i++) {
          const attachment = selectedAttachments[i]
          const originalUrl = attachment.url // 保留原始URL（可能是相对路径）
          const fileName = attachment.name || this.extractFileNameFromUrl(originalUrl) || `attachment_${i + 1}`
          
          console.log(`\n📥 [${i + 1}/${selectedAttachments.length}] 下载: ${fileName}`)
          
          try {
            // 注意：这里传递原始URL给后端，让后端处理完整URL的拼接
            console.log('   原始URL:', originalUrl)
            console.log('   URL类型:', originalUrl.startsWith('http') ? '完整URL' : '相对路径')
            
            // 使用后端代理下载文件，避免CORS问题
            console.log('   🔐 准备通过后端代理下载...')
            const token = localStorage.getItem('access_token')
            console.log('   Token:', token ? `存在 (前10字符: ${token.substring(0, 10)}...)` : '不存在')
            
            // Step 1: 先获取预签名URL（传递原始URL，不做任何转换）
            console.log('   📤 请求后端获取预签名URL...')
            console.log('      请求参数 fileUrl=', originalUrl)
            console.log('      编码后=', encodeURIComponent(originalUrl))
            
            const presignedResponse = await axios.get(`/zhiyan/projects/tasks/submissions/files/presigned-url?fileUrl=${encodeURIComponent(originalUrl)}`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : undefined
              },
              timeout: 10000
            })
            
            console.log('   ✅ 后端响应成功')
            console.log('      响应状态:', presignedResponse.status)
            console.log('      响应数据:', JSON.stringify(presignedResponse.data, null, 2))
            
            const presignedUrl = presignedResponse.data?.data?.url
            
            if (!presignedUrl) {
              console.error('   ❌ 预签名URL为空！')
              console.error('      响应结构:', presignedResponse.data)
              throw new Error('无法获取文件下载链接')
            }
            
            console.log('   📋 预签名URL (完整):', presignedUrl)
            console.log('   📋 预签名URL (前100字符):', presignedUrl.substring(0, 100) + '...')
            
            // Step 2: 通过后端代理下载文件，避免CORS问题
            // 不直接访问预签名URL，而是通过后端接口下载
            console.log('   📥 通过后端代理下载文件...')
            console.log('      代理接口: /zhiyan/projects/tasks/submissions/files/download')
            console.log('      参数 fileUrl:', originalUrl)
            
            const response = await axios.get(`/zhiyan/projects/tasks/submissions/files/download`, {
              params: {
                fileUrl: originalUrl
              },
              headers: {
                'Authorization': token ? `Bearer ${token}` : undefined
              },
              responseType: 'blob',
              timeout: 60000 // 60秒超时
            })
            
            console.log('   ✅ 代理下载成功！')
            
            console.log('   ✅ HTTP 响应状态:', response.status)
            console.log('   响应头 Content-Type:', response.headers['content-type'])
            console.log('   响应数据大小:', response.data.size, 'bytes')
            
            // 从响应头获取文件类型，如果没有则根据文件名推断
            let fileType = response.headers['content-type'] || 'application/octet-stream'
            if (fileType === 'application/octet-stream') {
              const ext = fileName.split('.').pop()?.toLowerCase()
              const mimeTypes = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'ppt': 'application/vnd.ms-powerpoint',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'txt': 'text/plain',
                'md': 'text/markdown',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif'
              }
              fileType = mimeTypes[ext] || fileType
              console.log('   推断文件类型:', fileType, '(基于扩展名:', ext + ')')
            }
            
            // 创建 File 对象
            const file = new File(
              [response.data],
              fileName,
              {
                type: fileType,
                lastModified: Date.now()
              }
            )
            
            console.log('   ✅ File对象创建成功:')
            console.log('      文件名:', file.name)
            console.log('      大小:', file.size, 'bytes')
            console.log('      类型:', file.type)
            
            attachments.push({
              file: file,
              fileName: fileName,
              fileSize: file.size,
              fileType: fileType,
              url: originalUrl // 保留原始URL用于调试
            })
          } catch (downloadError) {
            console.error(`   ❌ 下载失败: ${fileName}`)
            console.error('   错误:', downloadError.message)
            console.error('   错误详情:', downloadError)
            // 继续处理其他附件，不中断整个流程
          }
        }
        
        console.log('\n📊 下载结果统计:')
        console.log(`   成功: ${attachments.length}/${selectedAttachments.length}`)
        console.log(`   失败: ${selectedAttachments.length - attachments.length}/${selectedAttachments.length}`)
        
        if (attachments.length > 0) {
          console.log('\n✅ 已下载的附件列表:')
          attachments.forEach((att, idx) => {
            console.log(`   [${idx}] ${att.fileName} (${att.fileSize} bytes, ${att.fileType})`)
          })
        }
        
        console.log('\n╚═══════════════════════════════════════════════════════════════════════╝\n')
      } catch (error) {
        console.error('\n❌ [fetchTaskAttachments] 发生异常:', error)
        console.error('错误堆栈:', error.stack)
        // 不抛出错误，允许继续上传流程
      }
      
      return attachments
    },

    // 重置表单
    resetForm() {
      this.taskResultTitle = ''
      this.taskResultOutput = ''
      this.selectedTaskIds = []
      this.selectedTaskSummaries = []
      this.uploadProgress = null
      this.isUploading = false
      // 重置附件相关状态
      this.taskAttachments = []
      this.selectedAttachmentIds = []
      this.isSelectingAttachments = false
      this.selectAllAttachments = false
      this.isIndeterminateAttachments = false
      this.showUploadProgress = false
    },
    
    isAttachmentSelected(attachmentId) {
      return this.selectedAttachmentIds.includes(attachmentId)
    },
    
    toggleAttachmentSelection(attachmentId) {
      const index = this.selectedAttachmentIds.indexOf(attachmentId)
      if (index === -1) {
        this.selectedAttachmentIds.push(attachmentId)
      } else {
        this.selectedAttachmentIds.splice(index, 1)
      }
      this.updateAttachmentSelectionState()
    },
    
    handleAttachmentSelectionChange(attachmentId, selected) {
      if (selected && !this.selectedAttachmentIds.includes(attachmentId)) {
        this.selectedAttachmentIds.push(attachmentId)
      } else if (!selected) {
        const index = this.selectedAttachmentIds.indexOf(attachmentId)
        if (index !== -1) {
          this.selectedAttachmentIds.splice(index, 1)
        }
      }
      this.updateAttachmentSelectionState()
    },
    
    handleSelectAllAttachments(selected) {
      if (selected) {
        this.selectedAttachmentIds = this.taskAttachments.map(a => a.id)
      } else {
        this.selectedAttachmentIds = []
      }
      this.updateAttachmentSelectionState()
    },
    
    updateAttachmentSelectionState() {
      const selectedCount = this.selectedAttachmentIds.length
      const total = this.taskAttachments.length
      
      this.selectAllAttachments = selectedCount === total && total > 0
      this.isIndeterminateAttachments = selectedCount > 0 && selectedCount < total
    },
    
    getTaskAttachmentCount(taskId) {
      return this.taskAttachments.filter(a => a.taskId === taskId).length
    },
    
    getTaskName(taskId) {
      const task = this.selectedTaskSummaries.find(t => t.id === taskId)
      return task ? task.name : ''
    },
    
    getFileIconClass(fileName) {
      if (!fileName) return 'el-icon-document'
      const ext = fileName.split('.').pop()?.toLowerCase()
      const iconMap = {
        'pdf': 'el-icon-document',
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'xls': 'el-icon-s-grid',
        'xlsx': 'el-icon-s-grid',
        'ppt': 'el-icon-s-data',
        'pptx': 'el-icon-s-data',
        'txt': 'el-icon-tickets',
        'md': 'el-icon-edit',
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture'
      }
      return iconMap[ext] || 'el-icon-document'
    },

    resetTaskResultForm() {
      this.taskResultTitle = ''
      this.taskResultOutput = ''
      this.selectedTaskIds = []
      this.selectedTaskSummaries = []
      this.taskAttachments = []
      this.selectedAttachmentIds = []
      this.isSelectingAttachments = false
      this.uploadProgress = {
        percentage: 0,
        message: '',
        status: ''
      }
      this.showUploadProgress = false
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

