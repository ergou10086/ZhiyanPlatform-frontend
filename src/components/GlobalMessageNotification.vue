<template>
  <div class="message-notification" ref="messageNotificationRef">
    <!-- 消息铃铛按钮 -->
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="message-badge">
      <el-button 
        circle 
        class="message-button"
        @click.stop="toggleMessagePanel"
        :class="{ 'has-unread': unreadCount > 0 }"
      >
        <svg class="bell-icon" :class="{ 'shake': unreadCount > 0 }" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </el-button>
    </el-badge>

    <!-- 消息面板弹窗 -->
    <transition name="slide-fade">
      <div v-if="showPanel" class="message-panel" @click.stop v-click-outside="closeMessagePanel">
        <!-- 面板头部 -->
        <div class="panel-header">
          <div class="header-left">
            <span class="title-text">消息通知</span>
            <span v-if="unreadCount > 0" class="unread-count">{{ unreadCount }}</span>
          </div>
        </div>

        <div class="panel-toolbar">
          <button
            class="toolbar-btn primary"
            type="button"
            @click.stop="openSendDialog('USER')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>发送消息</span>
          </button>

          <button
            class="toolbar-btn"
            @click="markAllRead"
            :disabled="unreadCount === 0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>全部已读</span>
          </button>

          <button
            class="toolbar-btn"
            @click="handleClearReadMessages"
            :disabled="!hasReadMessages || clearReadLoading"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>清空已读</span>
          </button>
        </div>

        <!-- 标签页切换 -->
        <div class="tabs">
          <div 
            class="tab-item" 
            :class="{ 'active': selectedScene === '' }"
            @click="switchScene('')"
          >
            全部
          </div>
          <div 
            class="tab-item" 
            :class="{ 'active': selectedScene === 'TASK' }"
            @click="switchScene('TASK')"
          >
            任务
          </div>
          <div 
            class="tab-item" 
            :class="{ 'active': selectedScene === 'PROJECT' }"
            @click="switchScene('PROJECT')"
          >
            项目
          </div>
          <div 
            class="tab-item" 
            :class="{ 'active': selectedScene === 'SYSTEM' }"
            @click="switchScene('SYSTEM')"
          >
            系统
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="message-list">
          <!-- 空状态 -->
          <div v-if="!loading && messages.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>暂无消息</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 消息项 -->
          <div 
            v-for="message in displayedMessages" 
            :key="message.id" 
            class="message-item"
            :class="{ 'unread': !message.isRead, 'has-sender': message.senderUsername }"
            @click="handleMessageClick(message)"
          >
            <!-- 发送者头像（如果有发送者信息） -->
            <div v-if="message.senderUsername" class="sender-avatar">
              <img
                v-if="message.senderAvatar"
                :src="message.senderAvatar"
                :alt="message.senderUsername"
                class="avatar-img"
                @error="handleAvatarError($event)"
              />
              <div v-else class="avatar-placeholder">
                {{ getAvatarInitial(message.senderUsername) }}
              </div>
            </div>
            <!-- 消息图标（如果没有发送者信息） -->
            <div v-else class="message-icon" :class="`scene-${message.scene}`">
              <component :is="getSceneIcon(message.scene)" />
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <div class="message-header-row" v-if="message.senderUsername">
                <span class="sender-name">{{ message.senderUsername }}</span>
              </div>
              <div class="message-title">{{ message.title }}</div>
              <div class="message-body">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.createdAt) }}</div>
            </div>

            <!-- 未读标记 -->
            <div v-if="!message.isRead" class="unread-dot"></div>

            <!-- 删除按钮 -->
            <button class="delete-btn" @click.stop="handleDeleteMessage(message.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div v-if="!loading && messages.length > 0" class="message-footer">
            <button 
              class="load-more-btn" 
              v-if="hasMore" 
              :disabled="loadingMore" 
              @click.stop="loadMore"
            >
              <span v-if="!loadingMore">加载更多</span>
              <span v-else>加载中...</span>
            </button>
            <div v-else class="no-more">没有更多消息</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 消息详情弹窗 -->
    <transition name="fade">
      <div 
        v-if="detailDialogVisible" 
        class="message-detail-overlay" 
        @click.self="closeMessageDetail"
      >
        <div class="message-detail-modal">
          <div class="detail-header">
            <div>
              <div class="detail-scene">{{ getSceneLabel(detailMessage?.scene) || '消息详情' }}</div>
              <div class="detail-title">{{ detailMessage?.title }}</div>
            </div>
            <button class="detail-close" @click="closeMessageDetail">
              <span>&times;</span>
            </button>
          </div>

          <div class="detail-body">
            <div class="detail-section">
              <div class="section-label">内容</div>
              <div class="section-content">{{ detailMessage?.content }}</div>
            </div>

            <div class="detail-section">
              <div class="section-label">触发时间</div>
              <div class="section-content">{{ formatDetailTime(detailMessage?.createdAt || detailMessage?.triggerTime) }}</div>
            </div>

            <div class="detail-section" v-if="detailMessage?.businessType">
              <div class="section-label">业务类型</div>
              <div class="section-content">{{ getBusinessTypeLabel(detailMessage.businessType) }}</div>
            </div>

            <div class="detail-section" v-if="detailMessage?.extendData">
              <div class="section-label">扩展信息</div>
              <div class="extend-info-list">
                <div v-for="(item, index) in formatExtendDataList(detailMessage.extendData)" :key="index" class="extend-info-item">
                  <span class="extend-label">{{ item.label }}</span>
                  <span class="extend-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-footer">
            <template v-if="detailActionType">
              <button
                class="detail-btn"
                :disabled="detailActionLoading"
                @click="handleDetailAction('accept')"
              >
                同意
              </button>
              <button
                class="detail-btn outline"
                :disabled="detailActionLoading"
                @click="handleDetailAction('reject')"
              >
                拒绝
              </button>
              <button class="detail-btn ghost" @click="closeMessageDetail">
                关闭
              </button>
            </template>
            <button
              v-else
              class="detail-btn"
              @click="closeMessageDetail"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 发送消息对话框 -->
    <el-dialog
      :visible.sync="sendDialogVisible"
      width="480px"
      class="send-message-dialog"
      append-to-body
      :z-index="13000"
      modal-class="send-message-modal"
      :show-close="false"
    >
      <!-- 自定义头部 -->
      <div slot="title" class="dialog-custom-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-text">
          <h3>发送消息</h3>
          <p>向用户或项目成员发送站内消息</p>
        </div>
        <button class="header-close" @click="sendDialogVisible = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 模式切换 -->
      <div class="send-mode-tabs">
        <div
          class="mode-tab"
          :class="{ active: sendMode === 'USER' }"
          @click="sendMode = 'USER'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>私信用户</span>
        </div>
        <div
          class="mode-tab"
          :class="{ active: sendMode === 'PROJECT' }"
          @click="openSendDialog('PROJECT')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>项目群发</span>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="send-form-content">
        <div v-if="sendMode === 'USER'" class="form-group">
          <label class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            接收者
          </label>
          <el-input
            v-model="sendForm.receiverUsername"
            placeholder="请输入对方的用户名"
            clearable
            prefix-icon="el-icon-search"
          />
        </div>

        <div v-else class="form-group">
          <label class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            选择项目
          </label>
          <el-select
            v-model="sendForm.projectId"
            placeholder="请选择要群发消息的项目"
            filterable
            clearable
            :loading="!myProjectsLoaded && sendMode === 'PROJECT'"
            style="width: 100%;"
          >
            <el-option
              v-for="project in myProjects"
              :key="project.id"
              :label="project.title || project.name || `项目 ${project.id}`"
              :value="project.id"
            />
          </el-select>
          <p v-if="myProjectsLoaded && myProjects.length === 0" class="empty-tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            当前没有参与的项目
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            消息标题
          </label>
          <el-input
            v-model="sendForm.title"
            placeholder="给消息起个标题吧"
            maxlength="100"
            show-word-limit
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            消息内容
          </label>
          <el-input
            type="textarea"
            v-model="sendForm.content"
            placeholder="写下你想说的话..."
            :rows="4"
            maxlength="500"
            show-word-limit
            resize="none"
          />
        </div>
      </div>

      <!-- 底部按钮 -->
      <div slot="footer" class="dialog-custom-footer">
        <button class="btn-cancel" @click="sendDialogVisible = false">取消</button>
        <button
          class="btn-send"
          :class="{ loading: sendLoading }"
          :disabled="sendLoading"
          @click="submitSendMessage"
        >
          <svg v-if="!sendLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="loading-spinner" v-else></span>
          {{ sendLoading ? '发送中...' : (sendMode === 'USER' ? '发送私信' : '群发消息') }}
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getInboxMessages, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  clearReadMessages,
  deleteMessage,
  sendMessageToUser,
  sendMessageToProject,
  acceptProjectInvitation,
  rejectProjectInvitation,
  approveProjectJoin,
  rejectProjectJoin
} from '@/api/message'
import { projectAPI } from '@/api/project'
import { avatarAPI } from '@/api/avatar'

export default {
  name: 'GlobalMessageNotification',
  data() {
    return {
      showPanel: false,
      unreadCount: 0,
      messages: [],
      selectedScene: '',
      loading: false,
      loadingMore: false,
      currentPage: 0,
      pageSize: 10,
      hasMore: true,
      clearReadLoading: false,
      pollingTimer: null,
      detailDialogVisible: false,
      detailMessage: null,
      detailActionLoading: false,
      // 发送消息对话框
      sendDialogVisible: false,
      sendMode: 'USER', // USER or PROJECT
      sendForm: {
        receiverUsername: '',
        projectId: null,
        title: '',
        content: ''
      },
      sendLoading: false,
      myProjects: [],
      myProjectsLoaded: false
    }
  },
  mounted() {
    console.log('🔔 GlobalMessageNotification 组件已挂载')
    this.fetchUnreadCount()
    this.startPolling()
    document.addEventListener('click', this.handleGlobalClick, true)
  },
  beforeDestroy() {
    this.stopPolling()
    document.removeEventListener('click', this.handleGlobalClick, true)
  },
  methods: {
    /**
     * 点击任意非组件区域时关闭消息面板
     */
    handleGlobalClick(event) {
      if (!this.showPanel) return
      const root = this.$refs.messageNotificationRef
      if (root && !root.contains(event.target)) {
        this.closeMessagePanel()
      }
    },
    /**
     * 切换消息面板显示
     */
    toggleMessagePanel() {
      console.log('🔔 点击铃铛按钮，当前面板状态:', this.showPanel)
      this.showPanel = !this.showPanel
      console.log('🔔 切换后面板状态:', this.showPanel)
      if (this.showPanel) {
        console.log('📨 开始加载消息列表')
        this.loadMessages(true)
      }
    },

    /**
     * 关闭消息面板
     */
    closeMessagePanel() {
    this.showPanel = false
    },

      /**
       * 打开发送消息对话框
       */
      async openSendDialog(mode = 'USER') {
        this.sendMode = mode
        this.resetSendForm()
        this.sendDialogVisible = true

        // 如果是项目群发模式，且还未加载项目列表，则加载一次
        if (this.sendMode === 'PROJECT' && !this.myProjectsLoaded) {
          await this.loadMyProjects()
        }
      },

      /**
       * 重置发送表单
       */
      resetSendForm() {
        this.sendForm = {
          receiverUsername: '',
          projectId: null,
          title: '',
          content: ''
        }
      },

      /**
       * 加载我参与的项目，用于项目群发选择
       */
      async loadMyProjects() {
        try {
          const res = await projectAPI.getMyProjects(0, 100)
          if (res && res.code === 200 && res.data) {
            this.myProjects = res.data.content || []
            this.myProjectsLoaded = true
          } else {
            this.$message.error(res?.msg || '加载项目列表失败')
          }
        } catch (error) {
          console.error('加载项目列表失败:', error)
          this.$message.error('加载项目列表失败，请稍后重试')
        }
      },

    /**
     * 获取未读消息数量
     */
    async fetchUnreadCount() {
      try {
        const response = await getUnreadCount()
        console.log('📊 未读数量响应:', response)
        if (response && response.code === 200) {
          this.unreadCount = response.data || 0
        } else {
          console.warn('未读数量响应格式异常:', response)
        }
      } catch (error) {
        console.error('获取未读消息数量失败:', error)
        // 不显示错误提示，静默失败
      }
    },

    /**
     * 加载消息列表
     */
    async loadMessages(reset = false) {
      if (reset) {
        this.currentPage = 0
        this.messages = []
        this.hasMore = true
      }

      this.loading = reset
      this.loadingMore = !reset

      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }

        console.log('📨 请求消息列表:', params)
        const response = await getInboxMessages(params)
        console.log('📨 消息列表响应:', response)

        if (response && response.code === 200 && response.data) {
          const newMessages = this.transformMessages(response.data.content || [])

          if (reset) {
            this.messages = newMessages
          } else {
            this.messages = [...this.messages, ...newMessages]
          }

          this.hasMore = !response.data.last
          this.currentPage = response.data.number || this.currentPage
          console.log('✅ 消息加载成功，共', newMessages.length, '条')
        } else {
          console.warn('消息列表响应格式异常:', response)
          this.messages = []
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载消息列表失败:', error)
        this.messages = []
        this.hasMore = false
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    /**
     * 加载更多消息
     */
    loadMore() {
      if (!this.hasMore || this.loadingMore) return
      this.currentPage += 1
      this.loadMessages(false)
    },

    /**
     * 场景切换
     */
    switchScene(scene) {
      if (this.selectedScene === scene) return
      
      this.selectedScene = scene
      this.loading = true
      this.messages = []
      this.currentPage = 0
      this.loadMessages(true)
    },

    /**
     * 消息点击处理
     */
    async handleMessageClick(message) {
      console.log('🖱️ 点击消息:', message)
      // 标记为已读
      if (!message.isRead) {
        try {
          await markAsRead(message.id)
          message.isRead = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
          console.log('✅ 消息已标记为已读')
        } catch (error) {
          console.error('标记已读失败:', error)
        }
      }

      // 展示消息详情
      this.openMessageDetail(message)
    },

    /**
     * 打开消息详情弹窗
     */
    openMessageDetail(message) {
        this.detailMessage = { ...message }
        this.detailDialogVisible = true
      },

    /**
     * 关闭消息详情弹窗
     */
    closeMessageDetail() {
      this.detailDialogVisible = false
      this.detailMessage = null
    },

    /**
     * 格式化详情时间为中文格式
     */
    formatDetailTime(timestamp) {
      if (!timestamp) return ''
      try {
        let time
        if (timestamp instanceof Date) {
          time = timestamp
        } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
          time = new Date(timestamp)
        } else {
          return ''
        }
        
        if (isNaN(time.getTime())) {
          return ''
        }
        
        const year = time.getFullYear()
        const month = String(time.getMonth() + 1).padStart(2, '0')
        const day = String(time.getDate()).padStart(2, '0')
        const hours = String(time.getHours()).padStart(2, '0')
        const minutes = String(time.getMinutes()).padStart(2, '0')
        const seconds = String(time.getSeconds()).padStart(2, '0')
        
        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('formatDetailTime 错误:', error)
        return ''
      }
    },

    /**
     * 格式化扩展数据为列表格式
     */
    formatExtendDataList(extendData) {
      if (!extendData) return []
      
      const labelMap = {
        'senderId': '发送者ID',
        'projectId': '项目ID',
        'senderName': '发送者',
        'projectName': '项目名称',
        'receiverCount': '接收人数',
        'taskId': '任务ID',
        'taskName': '任务名称',
        'userId': '用户ID',
        'userName': '用户名',
        'kind': '消息类型',
        'status': '状态',
        'reason': '原因',
        'description': '描述',
        'deadline': '截止时间',
        'priority': '优先级',
        'role': '角色',
        'roleLabel': '角色标签',
        'inviterId': '邀请者ID',
        'inviterName': '邀请者名称',
        'targetUserId': '目标用户ID',
        'inviteeId': '被邀请者ID',
        'inviteeName': '被邀请者名称',
        'applicantId': '申请者ID',
        'applicantName': '申请者名称',
        'operatorId': '操作者ID',
        'operatorName': '操作者名称',
        'receiverId': '接收者ID',
        'receiverUsername': '接收者用户名',
        'messageType': '消息类型',
        'businessId': '业务ID',
        'businessType': '业务类型',
        // 文件相关
        'fileIds': '文件ID列表',
        'fileCount': '文件数量',
        'fileNames': '文件名称',
        'uploaderId': '上传人ID',
        'uploaderName': '上传人',
        'redirectUrl': '跳转链接',
        'achievementId': '成果ID',
        'achievementTitle': '成果名称'
      }
      
      try {
        let data = extendData
        if (typeof extendData === 'string') {
          data = JSON.parse(extendData)
        }
        
        if (typeof data !== 'object' || data === null) {
          return []
        }

        // 如果是带有文件信息的扩展数据，只展示与文件相关的几个关键字段
        const hasFileInfo = Object.prototype.hasOwnProperty.call(data, 'fileCount') ||
          Object.prototype.hasOwnProperty.call(data, 'fileNames') ||
          Object.prototype.hasOwnProperty.call(data, 'uploaderName') ||
          Object.prototype.hasOwnProperty.call(data, 'achievementTitle')

        let entries
        if (hasFileInfo) {
          const allowedKeys = ['fileCount', 'fileNames', 'uploaderName', 'achievementTitle']
          entries = allowedKeys
            .filter(key => Object.prototype.hasOwnProperty.call(data, key))
            .map(key => [key, data[key]])
        } else {
          entries = Object.entries(data)
        }

        return entries.map(([key, value]) => {
          // 对项目ID做特殊处理：展示项目名称而不是纯ID
          if (key === 'projectId') {
            const projectName = this.getProjectNameById(value)
            return {
              label: labelMap[key] || key,
              value: projectName || (value !== null && value !== undefined ? String(value) : '-')
            }
          }

          return {
            label: labelMap[key] || key,
            value: value !== null && value !== undefined ? String(value) : '-'
          }
        })
      } catch (error) {
        console.warn('扩展数据解析失败:', error)
        return []
      }
    },

    /**
     * 格式化扩展数据
     */
    formatExtendData(extendData) {
      if (!extendData) return ''
      try {
        if (typeof extendData === 'string') {
          const parsed = JSON.parse(extendData)
          return JSON.stringify(parsed, null, 2)
        }
        return JSON.stringify(extendData, null, 2)
      } catch (error) {
        console.warn('扩展数据解析失败:', error)
        return extendData
      }
    },

    /**
     * 全部标记为已读
     */
    async markAllRead() {
      try {
        await markAllAsRead()
        this.messages.forEach(msg => {
          msg.isRead = true
        })
        this.unreadCount = 0
        this.$message.success('已全部标记为已读')
      } catch (error) {
        console.error('标记全部已读失败:', error)
        this.$message.error('操作失败')
      }
    },

    /**
     * 清空所有已读消息（真删除）
     */
    async handleClearReadMessages() {
      if (this.clearReadLoading) return

      try {
        await this.$confirm('确定清空所有已读消息吗？此操作不可撤销。', '提示', {
          confirmButtonText: '清空',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.clearReadLoading = true
        await clearReadMessages()

        // 仅保留未读消息
        this.messages = this.messages.filter(msg => !msg.isRead)
        // 保持未读数不变（只删除已读）

        this.$message.success('已清空所有已读消息')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('清空已读消息失败:', error)
          this.$message.error('清空失败，请稍后重试')
        }
      } finally {
        this.clearReadLoading = false
      }
    },

      /**
       * 提交发送消息
       */
      async submitSendMessage() {
        if (!this.sendForm.title || !this.sendForm.content) {
          this.$message.warning('请填写标题和内容')
          return
        }

        try {
          this.sendLoading = true

          if (this.sendMode === 'USER') {
            if (!this.sendForm.receiverUsername) {
              this.$message.warning('请输入接收者用户名')
              this.sendLoading = false
              return
            }

            const payload = {
              receiverUsername: this.sendForm.receiverUsername.trim(),
              title: this.sendForm.title.trim(),
              content: this.sendForm.content.trim()
            }

            const res = await sendMessageToUser(payload)
            if (res && res.code === 200) {
              this.$message.success(res.msg || '消息发送成功')
              this.sendDialogVisible = false
              this.resetSendForm()
              // 发送成功后刷新消息列表和未读数量
              this.fetchUnreadCount()
              if (this.showPanel) {
                this.loadMessages(true)
              }
            } else {
              this.$message.error(res?.msg || '发送消息失败')
            }
          } else if (this.sendMode === 'PROJECT') {
            if (!this.sendForm.projectId) {
              this.$message.warning('请选择项目')
              this.sendLoading = false
              return
            }

            const payload = {
              projectId: this.sendForm.projectId,
              title: this.sendForm.title.trim(),
              content: this.sendForm.content.trim()
            }

            const res = await sendMessageToProject(payload)
            if (res && res.code === 200) {
              this.$message.success(res.msg || '消息已群发给项目成员')
              this.sendDialogVisible = false
              this.resetSendForm()
              // 发送成功后刷新消息列表和未读数量
              this.fetchUnreadCount()
              if (this.showPanel) {
                this.loadMessages(true)
              }
            } else {
              this.$message.error(res?.msg || '发送消息失败')
            }
          }
        } catch (error) {
          console.error('发送消息失败:', error)
          this.$message.error('发送消息失败，请稍后重试')
        } finally {
          this.sendLoading = false
        }
      },

      /**
       * 解析扩展数据为对象
       */
      parseExtendDataObject(extendData) {
        if (!extendData) return null
        try {
          if (typeof extendData === 'string') {
            return JSON.parse(extendData)
          }
          return extendData
        } catch (e) {
          console.warn('parseExtendDataObject 失败:', e, extendData)
          return null
        }
      },

      /**
       * 根据项目ID获取项目名称（优先使用本地缓存）
       */
      getProjectNameById(projectId) {
        if (!projectId) return ''
        const idStr = String(projectId)

        // 1) 优先从当前已加载的我的项目中查找
        if (Array.isArray(this.myProjects) && this.myProjects.length > 0) {
          const found = this.myProjects.find(p => String(p.id) === idStr)
          if (found) {
            return found.title || found.name || ''
          }
        }

        // 2) 其次从 localStorage 的 projects 缓存中查找
        try {
          const saved = localStorage.getItem('projects')
          if (saved) {
            const list = JSON.parse(saved)
            if (Array.isArray(list)) {
              const found = list.find(p => String(p.id) === idStr)
              if (found) {
                return found.title || found.name || ''
              }
            }
          }
        } catch (e) {
          // 忽略解析错误
        }

        // 3) 兜底返回“项目 + ID”
        return `项目 ${idStr}`
      },

      /**
       * 处理项目邀请/加入申请的同意/拒绝
       * @param {'accept'|'reject'} action
       */
      async handleDetailAction(action) {
        const message = this.detailMessage
        if (!message) return

        const extend = this.parseExtendDataObject(message.extendData)
        if (!extend) {
          this.$message.error('消息数据异常，无法处理')
          return
        }

        this.detailActionLoading = true

        try {
          let res
          const recipientId = message.id

          if (this.detailActionType === 'INVITATION') {
            if (action === 'accept') {
              res = await acceptProjectInvitation(recipientId)
            } else {
              res = await rejectProjectInvitation(recipientId)
            }
          } else if (this.detailActionType === 'JOIN_APPLY') {
            if (action === 'accept') {
              res = await approveProjectJoin(recipientId)
            } else {
              res = await rejectProjectJoin(recipientId)
            }
          } else {
            return
          }

          if (res && res.code === 200) {
            this.$message.success(res.msg || '操作成功')
            // 刷新列表和未读数
            await this.fetchUnreadCount()
            if (this.showPanel) {
              await this.loadMessages(true)
            }
            this.closeMessageDetail()
          } else {
            this.$message.error(res?.msg || '操作失败')
          }
        } catch (error) {
          console.error('处理消息操作失败:', error)
          this.$message.error('操作失败，请稍后重试')
        } finally {
          this.detailActionLoading = false
        }
      },

    /**
     * 删除消息
     */
    async handleDeleteMessage(messageId) {
      try {
        await this.$confirm('确定删除这条消息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteMessage(messageId)
        
        // 从列表中移除
        const index = this.messages.findIndex(m => m.id === messageId)
        if (index > -1) {
          const message = this.messages[index]
          if (!message.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
          this.messages.splice(index, 1)
        }

        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除消息失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    /**
     * 获取场景类型的中文标签
     */
    getSceneLabel(scene) {
      const sceneLabels = {
        // 任务相关
        'TASK_ASSIGN': '任务分配',
        'TASK_STATUS_CHANGED': '任务状态变更',
        'TASK_REVIEW_REQUEST': '任务审核请求',
        'TASK_REVIEW_RESULT': '任务审核结果',
        'TASK_DEADLINE_REMIND': '任务截止提醒',
        'TASK_OVERDUE': '任务逾期',
        'TASK': '任务通知',
        // 项目相关
        'PROJECT_CREATED': '项目创建',
        'PROJECT_ARCHIVED': '项目归档',
        'PROJECT_DELETED': '项目删除',
        'PROJECT_MEMBER_APPLY': '成员申请加入',
        'PROJECT_MEMBER_INVITED': '项目邀请',
        'PROJECT_MEMBER_REMOVED': '成员移除',
        'PROJECT_MEMBER_APPROVAL': '成员审批',
        'PROJECT_ROLE_CHANGED': '角色变更',
        'PROJECT_STATUS_CHANGED': '项目状态变更',
        'PROJECT': '项目通知',
        // 成果相关
        'ACHIEVEMENT_FILE_UPLOADED': '成果文件上传',
        'ACHIEVEMENT_CREATED': '成果创建',
        'ACHIEVEMENT_DELETED': '成果删除',
        'ACHIEVEMENT_FILE_DELETED': '成果文件删除',
        'ACHIEVEMENT_REVIEW_REQUEST': '成果审核请求',
        'ACHIEVEMENT_STATUS_CHANGED': '成果状态变更',
        'ACHIEVEMENT_PUBLISHED': '成果发布',
        // 系统相关
        'SYSTEM_SECURITY_ALERT': '安全警告',
        'SYSTEM_BROADCAST': '系统广播',
        'SYSTEM': '系统通知',
        // 用户消息
        'USER_CUSTOM_MESSAGE': '用户消息'
      }
      return sceneLabels[scene] || scene || '消息详情'
    },

    /**
     * 获取业务类型的中文标签
     */
    getBusinessTypeLabel(businessType) {
      const businessTypeLabels = {
        'PROJECT': '项目',
        'TASK': '任务',
        'ACHIEVEMENT': '成果',
        'SYSTEM': '系统',
        'USER': '用户'
      }
      return businessTypeLabels[businessType] || businessType || ''
    },

    /**
     * 获取场景图标
     */
    getSceneIcon(scene) {
      const taskScenes = ['TASK_ASSIGN', 'TASK_STATUS_CHANGED', 'TASK_REVIEW_REQUEST', 'TASK_REVIEW_RESULT', 'TASK_DEADLINE_REMIND', 'TASK_OVERDUE']
      const projectScenes = ['PROJECT_CREATED', 'PROJECT_ARCHIVED', 'PROJECT_DELETED', 'PROJECT_MEMBER_APPLY', 'PROJECT_MEMBER_INVITED', 'PROJECT_MEMBER_REMOVED', 'PROJECT_MEMBER_APPROVAL', 'PROJECT_ROLE_CHANGED', 'PROJECT_STATUS_CHANGED']

      if (taskScenes.includes(scene)) {
        return 'TaskIcon'
      }

      if (projectScenes.includes(scene)) {
        return 'ProjectIcon'
      }

      return 'NoticeIcon'
    },

    /**
     * 获取头像首字母
     */
    getAvatarInitial(username) {
      if (!username) return '?'
      return username.charAt(0).toUpperCase()
    },

    /**
     * 处理头像加载错误
     */
    handleAvatarError(event) {
      // 隐藏加载失败的图片
      event.target.style.display = 'none'
      // 显示占位符（通过父元素的 CSS 处理）
      const parent = event.target.parentElement
      if (parent) {
        parent.classList.add('avatar-error')
      }
    },

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      try {
        const now = new Date()
        // 确保 timestamp 是有效的 Date 对象或可转换的值
        let time
        if (timestamp instanceof Date) {
          time = timestamp
        } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
          time = new Date(timestamp)
        } else {
          console.warn('formatTime: 无效的时间格式', timestamp)
          return ''
        }
        
        // 检查日期是否有效
        if (isNaN(time.getTime())) {
          console.warn('formatTime: 无效的日期', timestamp)
          return ''
        }
        
        const diff = now - time
        
        const minute = 60 * 1000
        const hour = 60 * minute
        const day = 24 * hour
        
        if (diff < minute) {
          return '刚刚'
        } else if (diff < hour) {
          return Math.floor(diff / minute) + '分钟前'
        } else if (diff < day) {
          return Math.floor(diff / hour) + '小时前'
        } else if (diff < 7 * day) {
          return Math.floor(diff / day) + '天前'
        } else {
          return time.toLocaleDateString()
        }
      } catch (error) {
        console.error('formatTime 错误:', error, timestamp)
        return ''
      }
    },

    /**
     * 开始轮询
     */
    startPolling() {
      // 每30秒轮询一次未读数量
      this.pollingTimer = setInterval(() => {
        this.fetchUnreadCount()
      }, 30000)
    },

    /**
     * 停止轮询
     */
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
    },

    /**
     * 将后端消息数据转换为前端可用结构
     */
    transformMessages(messageList) {
      if (!Array.isArray(messageList)) {
        console.warn('transformMessages: messageList 不是数组', messageList)
        return []
      }
      
      const messages = messageList.map(item => {
        // 安全处理时间字段
        let createdAt = item.triggerTime
        if (createdAt) {
          // 如果是字符串，尝试转换为 Date
          if (typeof createdAt === 'string') {
            createdAt = new Date(createdAt)
          } else if (typeof createdAt === 'object' && createdAt !== null) {
            // 如果是对象，尝试提取时间戳或转换为字符串
            if (createdAt instanceof Date) {
              createdAt = createdAt
            } else {
              // 尝试从对象中提取时间值
              createdAt = new Date(createdAt.toString())
            }
          }
        }

        // 尝试从 extendData 中提取发送者信息
        let senderUsername = item.senderUsername || ''
        let senderId = null
        
        if (item.extendData) {
          try {
            const extend = typeof item.extendData === 'string' 
              ? JSON.parse(item.extendData) 
              : item.extendData
            if (!senderUsername) {
              senderUsername = extend.senderName || ''
            }
            senderId = extend.senderId || null
          } catch (e) {
            // 解析失败忽略
          }
        }

        const rawReadFlag = item.readFlag
        const isRead = rawReadFlag === true || rawReadFlag === 'true' || rawReadFlag === 1 || rawReadFlag === '1'
        console.log('🧪 transformMessages item:', {
          id: item.recipientId || item.id,
          rawReadFlag,
          computedIsRead: isRead
        })

        return {
          id: item.recipientId || item.id,
          title: item.title || '',
          content: item.content || '',
          isRead,
          createdAt: createdAt,
          scene: item.scene || '',
          businessId: item.businessId,
          businessType: item.businessType,
          extendData: item.extendData,
          senderUsername: senderUsername,
          senderId: senderId,
          senderAvatar: null // 稍后异步加载
        }
      })
      
      // 异步加载发送者头像
      this.loadSenderAvatars(messages)
      
      return messages
    },

    /**
     * 异步加载发送者头像（与团队成员相同的方式）
     */
    async loadSenderAvatars(messages) {
      // 收集需要加载头像的 senderId（去重）
      const senderIds = [...new Set(
        messages
          .filter(m => m.senderId && !m.senderAvatar)
          .map(m => String(m.senderId))
      )]
      
      if (senderIds.length === 0) return
      
      // 逐个加载头像（与团队成员相同的方式）
      for (const senderId of senderIds) {
        try {
          const response = await avatarAPI.getAvatarInfoById(senderId)
          if (response && response.code === 200 && response.data) {
            const avatarData = response.data
            let avatarUrl = null
            
            // 优先使用 dataUrl（Base64格式，可直接用于img src）
            if (avatarData.dataUrl) {
              avatarUrl = avatarData.dataUrl
            } else if (avatarData.sizes) {
              avatarUrl = avatarData.sizes.original || avatarData.sizes['256'] || avatarData.sizes['512']
            } else if (avatarData.minio_url) {
              avatarUrl = avatarData.minio_url
            } else if (avatarData.cdn_url) {
              avatarUrl = avatarData.cdn_url
            }
            
            if (avatarUrl) {
              // 更新所有该发送者的消息头像
              this.messages.forEach(msg => {
                if (String(msg.senderId) === senderId) {
                  this.$set(msg, 'senderAvatar', avatarUrl)
                }
              })
            }
          }
        } catch (error) {
          // 用户可能没有设置头像，忽略错误
        }
      }
    },

    /**
     * 根据场景分类过滤
     */
    matchSceneCategory(scene, category) {
      if (!category || !scene) return true
      return scene.startsWith(category)
    }
  },
  computed: {
    displayedMessages() {
      // 显示所有消息，包括项目邀请和申请消息（即使已处理过也会保留）
      // 注意：右侧悬浮消息提醒只显示未读的项目邀请和申请消息
      let filtered = this.messages
      
      if (!this.selectedScene) {
        return filtered
      }
      return filtered.filter(message => this.matchSceneCategory(message.scene, this.selectedScene))
    },

    // 是否存在已读消息，用于控制“清空已读”按钮
    hasReadMessages() {
      return this.messages.some(msg => msg.isRead)
    },

    /**
     * 当前详情消息的动作类型：
     * - INVITATION: 项目邀请
     * - JOIN_APPLY: 项目加入申请
     * - null: 无需操作
     */
    detailActionType() {
      if (!this.detailMessage) return null
      const { scene, extendData } = this.detailMessage
      const extend = this.parseExtendDataObject(extendData)
      const kind = extend && extend.kind

      if (scene === 'PROJECT_MEMBER_INVITED' && kind === 'PROJECT_INVITATION') {
        return 'INVITATION'
      }
      if (scene === 'PROJECT_MEMBER_APPLY' && kind === 'PROJECT_JOIN_APPLY') {
        return 'JOIN_APPLY'
      }
      return null
    }
  },
  directives: {
    // 点击外部关闭指令
    clickOutside: {
      bind(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
          // 检查点击是否在元素外部
          if (!(el === event.target || el.contains(event.target))) {
            // 检查是否点击了铃铛按钮
            const messageButton = document.querySelector('.message-button')
            if (messageButton && (messageButton === event.target || messageButton.contains(event.target))) {
              return
            }
            // 如果点击发生在消息详情弹窗区域内，则不关闭消息面板
            const detailOverlay = document.querySelector('.message-detail-overlay')
            if (detailOverlay && (detailOverlay === event.target || detailOverlay.contains(event.target))) {
              return
            }
            // 如果当前有 ElementUI 的对话框或确认框打开，则不关闭消息面板
            const dialogWrapper = document.querySelector('.el-dialog__wrapper')
            const msgBoxWrapper = document.querySelector('.el-message-box__wrapper')
            if (dialogWrapper || msgBoxWrapper) {
              return
            }
            binding.value()
          }
        }
        // 延迟绑定事件，避免立即触发
        setTimeout(() => {
          document.addEventListener('click', el.clickOutsideEvent)
        }, 100)
      },
      unbind(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  },
  components: {
    // 场景图标组件 - 使用 render 函数以兼容运行时构建
    TaskIcon: {
      render(h) {
        return h('svg', {
          attrs: {
            width: '20',
            height: '20',
            viewBox: '0 0 24 24',
            fill: 'none',
            xmlns: 'http://www.w3.org/2000/svg'
          }
        }, [
          h('path', {
            attrs: {
              d: 'M9 11L12 14L22 4',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }
          }),
          h('path', {
            attrs: {
              d: 'M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }
          })
        ])
      }
    },
    ProjectIcon: {
      render(h) {
        return h('svg', {
          attrs: {
            width: '20',
            height: '20',
            viewBox: '0 0 24 24',
            fill: 'none',
            xmlns: 'http://www.w3.org/2000/svg'
          }
        }, [
          h('path', {
            attrs: {
              d: 'M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }
          })
        ])
      }
    },
    NoticeIcon: {
      render(h) {
        return h('svg', {
          attrs: {
            width: '20',
            height: '20',
            viewBox: '0 0 24 24',
            fill: 'none',
            xmlns: 'http://www.w3.org/2000/svg'
          }
        }, [
          h('circle', {
            attrs: {
              cx: '12',
              cy: '12',
              r: '10',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }
          }),
          h('path', {
            attrs: {
              d: 'M12 16V12',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }
          }),
          h('path', {
            attrs: {
              d: 'M12 8H12.01',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }
          })
        ])
      }
    }
  }
}
</script>

<style scoped>
.message-notification {
  /* 放在 App.vue 的 global-header-right 容器中，由外层控制 fixed 位置 */
  position: relative;
  z-index: 15000; /* 保持较高层级，确保在页眉内容之上 */
  display: block;
  visibility: visible;
}

.message-badge {
  display: inline-block;
}

.message-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-secondary);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* 单独抬高铃铛按钮，确保始终浮在页眉和用户信息之上 */
  z-index: 10060;
}

.message-button:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.message-button.has-unread {
  color: var(--primary-color);
}

.bell-icon {
  display: block;
  margin: 0 auto;
}

.bell-icon.shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

/* 消息面板 */
.message-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 400px;
  min-height: 400px;
  max-height: 600px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  /* 提高层级，确保在所有业务弹窗和确认框之上 */
  z-index: 15001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: height 0.3s ease;
}

/* 面板顶部小三角 */
.message-panel::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--border-primary);
}

.message-panel::after {
  content: '';
  position: absolute;
  top: -7px;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--bg-primary);
}

/* 面板头部 */
.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.unread-count {
  background: var(--danger-color);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}

.toolbar-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn.primary {
  border-color: transparent;
  background: linear-gradient(135deg, #5eb6e4 0%, #3b82f6 100%);
  color: #fff;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.25);
}

.toolbar-btn.primary:hover {
  box-shadow: 0 12px 20px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.toolbar-btn:not(.primary):hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-lightest);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 标签页 */
.tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.tab-item:hover {
  color: var(--primary-color);
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: 600;
  border-bottom-color: var(--primary-color);
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  max-height: 450px;
  transition: all 0.3s ease;
}

.message-footer {
  padding: 12px 20px;
  text-align: center;
  border-top: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}

.load-more-btn {
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-more {
  font-size: 13px;
  color: var(--text-tertiary);
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-tertiary);
}

.empty-state svg {
  color: var(--text-quaternary);
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 加载状态 */
.loading-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-tertiary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid var(--border-secondary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  font-size: 14px;
}

/* 消息项 */
.message-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.message-item:hover {
  background: var(--bg-secondary);
}

.message-item.unread {
  background: var(--primary-lightest);
}

.message-item.unread:hover {
  background: var(--primary-lighter);
}

/* 发送者头像样式 */
.sender-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.sender-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.sender-avatar .avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
}

.sender-avatar.avatar-error::after {
  content: attr(data-initial);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

/* 发送者名称样式 */
.message-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.sender-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary-color);
}

.message-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.message-icon.scene-TASK_ASSIGN,
.message-icon.scene-TASK_STATUS_CHANGED,
.message-icon.scene-TASK_REVIEW_REQUEST,
.message-icon.scene-TASK_REVIEW_RESULT,
.message-icon.scene-TASK_DEADLINE_REMIND,
.message-icon.scene-TASK_OVERDUE {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-icon.scene-PROJECT_CREATED,
.message-icon.scene-PROJECT_ARCHIVED,
.message-icon.scene-PROJECT_DELETED,
.message-icon.scene-PROJECT_MEMBER_APPLY,
.message-icon.scene-PROJECT_MEMBER_INVITED,
.message-icon.scene-PROJECT_MEMBER_REMOVED,
.message-icon.scene-PROJECT_MEMBER_APPROVAL,
.message-icon.scene-PROJECT_ROLE_CHANGED,
.message-icon.scene-PROJECT_STATUS_CHANGED {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-icon.scene-ACHIEVEMENT_FILE_UPLOADED,
.message-icon.scene-ACHIEVEMENT_CREATED,
.message-icon.scene-ACHIEVEMENT_DELETED,
.message-icon.scene-ACHIEVEMENT_FILE_DELETED,
.message-icon.scene-ACHIEVEMENT_REVIEW_REQUEST,
.message-icon.scene-ACHIEVEMENT_STATUS_CHANGED,
.message-icon.scene-ACHIEVEMENT_PUBLISHED {
  background: linear-gradient(135deg, #f9d423 0%, #ff4e50 100%);
}

.message-icon.scene-SYSTEM_SECURITY_ALERT,
.message-icon.scene-SYSTEM_BROADCAST {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-body {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.unread-dot {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 12px;
  height: 12px;
  background: #ff4d4f;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.delete-btn {
  position: absolute;
  top: 16px;
  right: 20px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: var(--danger-lightest);
  color: var(--danger-color);
}

.message-item:hover .delete-btn {
  opacity: 1;
}


/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* 消息详情弹窗 - 蓝白配色 */
.message-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 提高层级，确保在所有业务弹窗和确认框之上 */
  z-index: 15002;
  padding: 16px;
}

.message-detail-modal {
  width: 520px;
  max-width: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-top: 6px;
}

.detail-scene {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.detail-close {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.detail-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.detail-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  background: #ffffff;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 8px;
}

.section-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
}

.section-extend {
  background: #f0f7ff;
  border: 1px solid #e0edff;
  border-radius: 10px;
  padding: 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 扩展信息列表样式 */
.extend-info-list {
  background: #f0f7ff;
  border: 1px solid #e0edff;
  border-radius: 10px;
  padding: 12px 16px;
}

.extend-info-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px dashed #e0edff;
}

.extend-info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.extend-info-item:first-child {
  padding-top: 0;
}

.extend-label {
  flex-shrink: 0;
  width: 80px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.extend-value {
  flex: 1;
  font-size: 13px;
  color: #334155;
  word-break: break-all;
}

.detail-footer {
  padding: 18px 24px 22px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8fafc;
}

.detail-btn {
  min-width: 96px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.detail-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.detail-btn.outline {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  box-shadow: none;
}

.detail-btn.outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: none;
  box-shadow: none;
}

.detail-btn.ghost {
  background: transparent;
  color: #64748b;
  box-shadow: none;
}

.detail-btn.ghost:hover {
  color: #334155;
  background: #f1f5f9;
  transform: none;
}

/* 夜间模式适配 */
.dark-mode .message-panel {
  background: #020617;
  border-color: #1f2937;
}

.dark-mode .panel-header,
.dark-mode .tabs,
.dark-mode .message-footer {
  background: #020617;
  border-color: #1f2937;
}

.dark-mode .title-text {
  color: #e5e7eb;
}

.dark-mode .unread-count {
  background: #ef4444;
}

.dark-mode .tab-item {
  color: #9ca3af;
}

.dark-mode .tab-item.active {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
}

.dark-mode .message-item {
  border-bottom-color: #1f2937;
}

.dark-mode .message-item:hover {
  background: #0f172a;
}

.dark-mode .message-item.unread {
  background: rgba(37, 99, 235, 0.15);
}

.dark-mode .message-item.unread:hover {
  background: rgba(37, 99, 235, 0.22);
}

.dark-mode .message-title {
  color: #e5e7eb;
}

.dark-mode .message-body {
  color: #9ca3af;
}

.dark-mode .message-time {
  color: #6b7280;
}

.dark-mode .empty-state,
.dark-mode .loading-state {
  color: #9ca3af;
}

.dark-mode .message-detail-overlay {
  background: rgba(15, 23, 42, 0.75);
}

.dark-mode .message-detail-modal {
  background: #020617;
  border-color: #1f2937;
}

.dark-mode .detail-header {
  border-bottom-color: #1f2937;
}

.dark-mode .detail-title {
  color: #e5e7eb;
}

.dark-mode .detail-scene,
.dark-mode .section-label {
  color: #6b7280;
}

.dark-mode .section-content {
  color: #e5e7eb;
}

.dark-mode .section-extend {
  background: #020617;
  border-color: #1f2937;
  color: #9ca3af;
}

.dark-mode .detail-footer {
  border-top-color: #1f2937;
}

.dark-mode .detail-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

.dark-mode .detail-btn.outline {
  background: transparent;
  border-color: #374151;
  color: #e5e7eb;
}

.dark-mode .detail-btn.ghost {
  background: transparent;
  color: #9ca3af;
}

/* 发送消息对话框 */
.send-message-dialog ::v-deep .el-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* 抬高发送消息对话框与遮罩的层级，确保盖住消息面板和其他业务弹窗 */
.send-message-dialog ::v-deep .el-dialog__wrapper,
.send-message-dialog ::v-deep .el-overlay,
.send-message-dialog ::v-deep .v-modal {
  z-index: 15003 !important;
}

.send-message-dialog ::v-deep .el-dialog__header {
  padding: 0;
  margin: 0;
}

.send-message-dialog ::v-deep .el-dialog__body {
  padding: 0;
}

.send-message-dialog ::v-deep .el-dialog__footer {
  padding: 0;
}

/* 自定义头部 - 蓝白配色 */
.dialog-custom-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.header-icon {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon svg {
  color: white;
}

.header-text {
  flex: 1;
}

.header-text h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-text p {
  margin: 6px 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.header-close {
  width: 38px;
  height: 38px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
}

.header-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* 模式切换标签 - 蓝白配色 */
.send-mode-tabs {
  display: flex;
  gap: 10px;
  padding: 18px 24px;
  background: #f0f7ff;
  border-bottom: 1px solid #e0edff;
}

.mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.25s ease;
}

.mode-tab:hover {
  color: #3b82f6;
  border-color: #3b82f6;
}

.mode-tab.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.mode-tab svg {
  flex-shrink: 0;
}

/* 表单内容 - 蓝白配色 */
.send-form-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #ffffff;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group .form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.form-group .form-label svg {
  color: #3b82f6;
}

.form-group ::v-deep .el-input__inner,
.form-group ::v-deep .el-textarea__inner {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.form-group ::v-deep .el-input__inner:focus,
.form-group ::v-deep .el-textarea__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-group ::v-deep .el-textarea__inner {
  min-height: 100px;
}

.empty-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0;
  padding: 10px 12px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
}

/* 底部按钮 - 蓝白配色 */
.dialog-custom-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 24px 22px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 12px 24px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  border-color: #cbd5e1;
  color: #334155;
  background: #f8fafc;
}

.btn-send {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-send:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-send .loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}


/* 响应式 */
@media (max-width: 768px) {
  .message-notification {
    right: 300px;
    top: 12px;
    z-index: 11000;
  }

  .message-button {
    width: 42px;
    height: 42px;
    border: 2px solid #5EB6E4 !important;
    background: #ffffff !important;
    box-shadow: 0 2px 8px rgba(94, 182, 228, 0.3);
    color: #0044CC !important;
  }

  .message-button:hover {
    background: #e0f2fe !important;
    border-color: #0044CC !important;
  }

  .bell-icon {
    width: 20px;
    height: 20px;
    color: #0044CC;
  }

  .message-panel {
    width: 90vw;
    max-width: 360px;
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    position: fixed;
    top: 60px;
  }
}

@media (max-width: 480px) {
  .message-notification {
    right: 280px;
    top: 12px;
    z-index: 11000;
  }

  .message-button {
    width: 40px;
    height: 40px;
    border: 2px solid #5EB6E4 !important;
    background: #ffffff !important;
    box-shadow: 0 2px 8px rgba(94, 182, 228, 0.3);
    color: #0044CC !important;
  }

  .message-button:hover {
    background: #e0f2fe !important;
    border-color: #0044CC !important;
  }

  .bell-icon {
    width: 18px;
    height: 18px;
    color: #0044CC;
  }

  .message-badge {
    transform: scale(0.9);
  }

  .message-panel {
    width: 92vw;
    max-width: 360px;
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    position: fixed;
    top: 60px;
  }
}

/* 暗色模式移动端 */
@media (max-width: 768px) {
  .dark-mode .message-button {
    background: #1e293b !important;
    border-color: #5EB6E4 !important;
    color: #5EB6E4 !important;
  }

  .dark-mode .message-button:hover {
    background: #334155 !important;
    border-color: #60a5fa !important;
  }

  .dark-mode .bell-icon {
    color: #5EB6E4;
  }
}
</style>

<!-- 深色模式弹窗和工具栏的全局样式（不加 scoped，覆盖 el-dialog 等 append-to-body 的元素） -->
<style>
/* 确保消息提醒组件始终在最顶层，高于ElementUI的确认框和对话框 */
.message-notification,
.message-panel,
.message-detail-overlay,
.floating-message-reminder,
.reminder-panel {
  /* 消息提醒相关组件的z-index已在各自组件中设置，这里确保不会被ElementUI覆盖 */
}

/* 确保ElementUI的确认框和对话框不会遮盖消息提醒 */
.el-message-box__wrapper {
  z-index: 14000 !important;
}

.el-dialog__wrapper:not(.send-message-dialog .el-dialog__wrapper) {
  z-index: 14000 !important;
}

.v-modal:not(.send-message-dialog .v-modal) {
  z-index: 13999 !important;
}
/* 消息面板顶部工具栏在黑夜模式下变暗色 */
.dark-mode .message-panel .panel-toolbar {
  background: #020617;
  border-bottom-color: #1f2937;
}

.dark-mode .message-panel .toolbar-btn {
  background: #020617;
  border-color: #1f2937;
  color: #e5e7eb;
}

.dark-mode .message-panel .toolbar-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: transparent;
}

.dark-mode .message-panel .toolbar-btn:not(.primary):hover:not(:disabled) {
  background: #111827;
  border-color: #3b82f6;
  color: #60a5fa;
}

/* 消息详情弹窗主体在黑夜模式下变暗色 */
.dark-mode .message-detail-modal {
  background: #020617;
}

.dark-mode .message-detail-modal .detail-body {
  background: #020617;
}

.dark-mode .message-detail-modal .detail-header {
  background: linear-gradient(135deg, #020617 0%, #0f172a 60%, #1d4ed8 100%);
}

.dark-mode .message-detail-modal .section-extend {
  background: #020617;
  border-color: #1f2937;
}

.dark-mode .message-detail-modal .detail-footer {
  background: #020617;
  border-top-color: #1f2937;
}

/* 黑夜模式下的“扩展信息”卡片整块变暗色 */
.dark-mode .message-detail-modal .extend-info-list {
  background: #020617;
  border-color: #1f2937;
}

.dark-mode .message-detail-modal .extend-info-item {
  border-bottom-color: #1f2937;
}

.dark-mode .message-detail-modal .extend-label {
  color: #9ca3af;
}

.dark-mode .message-detail-modal .extend-value {
  color: #e5e7eb;
}

/* 发送消息对话框在黑夜模式下的样式（el-dialog append-to-body） */
.dark-mode .send-message-dialog .el-dialog {
  background: #020617;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.dark-mode .send-message-dialog .dialog-custom-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
}

.dark-mode .send-message-dialog .header-icon {
  background: rgba(15, 23, 42, 0.85);
}

.dark-mode .send-message-dialog .header-text h3 {
  color: #e5e7eb;
}

.dark-mode .send-message-dialog .header-text p {
  color: #9ca3af;
}

.dark-mode .send-message-dialog .header-close {
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
}

.dark-mode .send-message-dialog .header-close:hover {
  background: rgba(30, 64, 175, 0.9);
}

.dark-mode .send-message-dialog .send-mode-tabs {
  background: #020617;
  border-bottom-color: #1f2937;
}

.dark-mode .send-message-dialog .mode-tab {
  background: #020617;
  border-color: #1f2937;
  color: #9ca3af;
}

.dark-mode .send-message-dialog .mode-tab.active {
  border-color: #3b82f6;
  color: #60a5fa;
}

.dark-mode .send-message-dialog .send-form-content {
  background: #020617;
}

.dark-mode .send-message-dialog .form-group .form-label {
  color: #e5e7eb;
}

.dark-mode .send-message-dialog .form-group .form-label svg {
  color: #60a5fa;
}

.dark-mode .send-message-dialog .el-input__inner,
.dark-mode .send-message-dialog .el-textarea__inner {
  background: #020617;
  border-color: #1f2937;
  color: #e5e7eb;
}

.dark-mode .send-message-dialog .el-input__inner::placeholder,
.dark-mode .send-message-dialog .el-textarea__inner::placeholder {
  color: #6b7280;
}

.dark-mode .send-message-dialog .dialog-custom-footer {
  background: #020617;
  border-top-color: #1f2937;
}

.dark-mode .send-message-dialog .btn-cancel {
  background: #020617;
  border-color: #1f2937;
  color: #e5e7eb;
}

.dark-mode .send-message-dialog .btn-cancel:hover {
  background: #111827;
  border-color: #374151;
}

.dark-mode .send-message-dialog .btn-send {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.dark-mode .send-message-dialog .btn-send:disabled {
  opacity: 0.7;
}
</style>
