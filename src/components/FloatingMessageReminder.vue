<template>
  <div 
    v-if="isHomePage"
    class="floating-message-reminder"
    :class="{ 'has-messages': projectMessages.length > 0, 'expanded': isHovered }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 收缩状态：只显示图标和数量 -->
    <div class="reminder-trigger">
      <div class="icon-wrapper">
        <!-- 使用消息气泡图标，区别于通知铃铛 -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 9H16M8 13H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-if="projectMessages.length > 0" class="message-badge">{{ projectMessages.length }}</span>
      </div>
    </div>

    <!-- 展开状态：显示消息列表 -->
    <transition name="slide-left">
      <div v-if="isHovered" class="reminder-panel" @mouseenter.stop @mouseleave.stop>
        <div class="panel-header">
          <h3 class="panel-title">消息提醒</h3>
          <span class="message-count" v-if="projectMessages.length > 0">
            有 {{ projectMessages.length }} 条项目消息
          </span>
        </div>

        <div class="panel-content" @mouseenter.stop @mouseleave.stop>
          <!-- 加载状态 -->
          <div v-if="isLoadingMessages" class="loading-state">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>加载中...</p>
          </div>

          <!-- 有消息 -->
          <div v-else-if="projectMessages.length > 0" class="message-list">
            <div 
              v-for="message in projectMessages" 
              :key="message.id" 
              class="message-item"
              :class="getMessageTypeClass(message.scene)"
            >
              <div class="message-info">
                <h4 class="message-title">{{ message.title }}</h4>
                <p class="message-content">{{ message.content }}</p>
                <p class="message-time">{{ formatTime(message.createdAt) }}</p>
              </div>
              <div class="message-actions">
                <button 
                  class="action-btn accept" 
                  @click="handleMessageAction(message, 'accept')"
                  :disabled="messageActionLoading === message.id"
                >
                  {{ messageActionLoading === message.id ? '处理中...' : '同意' }}
                </button>
                <button 
                  class="action-btn reject" 
                  @click="handleMessageAction(message, 'reject')"
                  :disabled="messageActionLoading === message.id"
                >
                  拒绝
                </button>
              </div>
            </div>
          </div>

          <!-- 没有消息 -->
          <div v-else class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>暂无消息</p>
            <p class="empty-subtitle">没有待处理的项目消息</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { 
  getInboxMessages, 
  acceptProjectInvitation,
  rejectProjectInvitation,
  approveProjectJoin,
  rejectProjectJoin,
  markAsRead
} from '@/api/message'
import { projectAPI } from '@/api/project'

export default {
  name: 'FloatingMessageReminder',
  data() {
    return {
      projectMessages: [],
      isLoadingMessages: false,
      isHovered: false,
      messageActionLoading: null,
      // 本地记录：哪些邀请/申请已经在悬浮提醒里被处理过（同意/拒绝）
      handledMessageIds: new Set(),
      // 当前用户参与的项目列表（用于判断是否已经是成员）
      myProjects: [],
      myProjectsLoaded: false,
      // 定时轮询定时器，用于自动刷新邀请消息
      pollingTimer: null
    }
  },
  computed: {
    isHomePage() {
      // 只在首页显示（路由为 '/' 或 '/home'）
      const path = this.$route?.path || ''
      return path === '/' || path === '/home'
    }
  },
  watch: {
    // 监听路由变化，切换页面时重新加载消息
    '$route'(to, from) {
      if (this.isHomePage) {
        this.loadProjectMessages()
      }
    }
  },
  mounted() {
    if (this.isHomePage) {
      // 初始化本地已处理ID集合
      this.loadHandledMessageIds()
      // 加载我参与的项目，用于判断自己是否已是成员
      this.loadMyProjects().then(() => {
        this.loadProjectMessages()
      })
    }
    // 启动轮询，定期刷新邀请消息
    this.startPolling()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    // 鼠标移入悬浮入口，展开并尝试刷新一次最新消息
    handleMouseEnter() {
      this.isHovered = true
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      if (!isAuthenticated || !this.isHomePage) return
      // 避免重复请求：只在当前没有加载中时触发一次刷新
      if (!this.isLoadingMessages) {
        this.loadProjectMessages()
      }
    },

    // 鼠标移出悬浮入口
    handleMouseLeave() {
      this.isHovered = false
    },

    // 启动定时轮询，每 3 秒刷新一次项目邀请消息
    startPolling() {
      if (this.pollingTimer) return
      this.pollingTimer = setInterval(() => {
        const token = localStorage.getItem('access_token')
        const userInfo = localStorage.getItem('user_info')
        const isAuthenticated = !!(token && userInfo)
        if (!isAuthenticated || !this.isHomePage) return
        // 后台静默刷新，不影响当前 loading 状态提示
        if (!this.isLoadingMessages && !this.messageActionLoading) {
          this.loadProjectMessages()
        }
      }, 3000)
    },

    // 停止轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
        this.pollingTimer = null
      }
    },
    // 生成本地存储 key，按用户隔离
    getHandledStorageKey() {
      try {
        const userInfo = localStorage.getItem('user_info')
        if (!userInfo) return 'floating_project_messages_handled'
        const user = JSON.parse(userInfo)
        const uid = user.id || user.userId || user.username || 'default'
        return `floating_project_messages_handled_${uid}`
      } catch (e) {
        return 'floating_project_messages_handled'
      }
    },

    // 加载当前用户参与的项目列表
    async loadMyProjects() {
      if (this.myProjectsLoaded) return
      try {
        const res = await projectAPI.getMyProjects(0, 100)
        if (res && res.code === 200 && res.data) {
          this.myProjects = res.data.content || res.data.list || []
        } else {
          this.myProjects = []
        }
      } catch (e) {
        this.myProjects = []
      } finally {
        this.myProjectsLoaded = true
      }
    },

    // 判断当前用户是否已经是指定项目的成员
    isAlreadyMember(projectId) {
      if (!projectId || !Array.isArray(this.myProjects)) return false
      const pid = String(projectId)
      return this.myProjects.some(p => String(p.id || p.projectId) === pid)
    },

    // 从 localStorage 读取已处理的消息ID
    loadHandledMessageIds() {
      try {
        const key = this.getHandledStorageKey()
        const raw = localStorage.getItem(key)
        if (!raw) {
          this.handledMessageIds = new Set()
          return
        }
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) {
          this.handledMessageIds = new Set(arr)
        } else {
          this.handledMessageIds = new Set()
        }
      } catch (e) {
        this.handledMessageIds = new Set()
      }
    },

    // 把已处理ID集合写回 localStorage
    saveHandledMessageIds() {
      try {
        const key = this.getHandledStorageKey()
        const arr = Array.from(this.handledMessageIds)
        localStorage.setItem(key, JSON.stringify(arr))
      } catch (e) {
        // 忽略本地存储错误
      }
    },
    /**
     * 加载项目相关消息（邀请和申请）
     * 需求：
     *  - 右侧“消息提醒”中，项目邀请/申请在【同意/拒绝之前】都要一直显示
     *  - 不能因为在全局消息面板里被标记为已读就从这里消失
     * 实现：
     *  - 使用 getInboxMessages 拉取收件箱消息，不按已读状态过滤
     *  - 只筛选 PROJECT_MEMBER_INVITED / PROJECT_MEMBER_APPLY 两种场景
     *  - 真正点击同意/拒绝后，从列表中移除并标记已读
     */
    async loadProjectMessages() {
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        this.projectMessages = []
        return
      }
      
      this.isLoadingMessages = true
      
      try {
        // 使用收件箱接口获取项目相关消息（不按已读状态过滤）
        const response = await getInboxMessages({
          page: 0,
          size: 50
        })
        
        if (response && response.code === 200 && response.data) {
          let allMessages = []
          
          if (Array.isArray(response.data)) {
            allMessages = response.data
          } else if (response.data.content && Array.isArray(response.data.content)) {
            allMessages = response.data.content
          }
          
          console.log('[FloatingMessageReminder] API返回消息总数:', allMessages.length)
          
          // 1) 先筛选项目邀请/申请场景
          const filteredMessages = allMessages
            .filter(msg => {
              const scene = msg.scene || ''
              if (scene !== 'PROJECT_MEMBER_INVITED' && scene !== 'PROJECT_MEMBER_APPLY') {
                return false
              }

              // 1.1 本地已处理过的 recipientId 永远不再显示
              const localId = String(msg.recipientId || msg.messageId || msg.id || '')
              if (localId && this.handledMessageIds.has(localId)) {
                console.log('[FloatingMessageReminder] 本地已处理，过滤:', localId)
                return false
              }

              // 2) 根据扩展数据里的状态判断是否已处理
              let extend = null
              try {
                extend = typeof msg.extendData === 'string'
                  ? JSON.parse(msg.extendData)
                  : msg.extendData || null
              } catch (e) {
                extend = null
              }

              const kind = extend && extend.kind
              if (scene === 'PROJECT_MEMBER_INVITED' && kind && kind !== 'PROJECT_INVITATION') {
                return false
              }
              if (scene === 'PROJECT_MEMBER_APPLY' && kind && kind !== 'PROJECT_JOIN_APPLY') {
                return false
              }

              const statusRaw = (extend && extend.status) ? String(extend.status).toUpperCase() : ''
              const handledFlag = extend && (extend.handled === true || extend.processed === true)

              const handledStatusSet = new Set([
                'ACCEPTED', 'REJECTED', 'APPROVED', 'DENIED',
                'REFUSED', 'REFUSE', 'REJECT', 'PASS', 'PASSED',
                'AGREED', 'AGREE'
              ])

              const isHandledByStatus = statusRaw && handledStatusSet.has(statusRaw)

              // 3) 如果当前用户已经是该项目的成员，也视为不需要再处理
              const projectId = extend && (extend.projectId || extend.project_id)
              const alreadyMember = projectId ? this.isAlreadyMember(projectId) : false

              return !(handledFlag || isHandledByStatus || alreadyMember)
            })
            .map(msg => {
              // 使用recipientId作为唯一标识（用于处理操作）
              return {
                id: msg.recipientId || msg.messageId || msg.id, // 用于显示和操作的ID
                recipientId: msg.recipientId, // 收件记录ID（用于处理邀请/申请）
                messageId: msg.messageId || msg.id, // 消息体ID（用于标记已读）
                title: msg.title || '',
                content: msg.content || '',
                scene: msg.scene || '',
                createdAt: msg.triggerTime || msg.createdAt,
                extendData: msg.extendData,
                isRead: msg.readFlag === true || msg.isRead === true // 检查是否已读
              }
            })
          
          // 根据recipientId去重，避免重复显示
          const uniqueMessages = []
          const seenIds = new Set()
          for (const msg of filteredMessages) {
            // 使用recipientId作为唯一标识，如果没有则使用messageId
            const uniqueId = msg.recipientId || msg.messageId
            if (uniqueId && !seenIds.has(uniqueId)) {
              seenIds.add(uniqueId)
              uniqueMessages.push(msg)
            } else if (uniqueId) {
              console.log('[FloatingMessageReminder] 跳过重复消息:', uniqueId)
            }
          }
          
          // 这里不过滤已读状态：
          // 只要邀请/申请在后端还存在（尚未同意/拒绝），就一直显示在右侧提醒里
          this.projectMessages = uniqueMessages
          
          console.log('[FloatingMessageReminder] 加载项目消息完成:', {
            apiTotal: allMessages.length,
            filtered: filteredMessages.length,
            unique: uniqueMessages.length,
            finalCount: this.projectMessages.length
          })
        } else {
          this.projectMessages = []
        }
      } catch (error) {
        console.error('[FloatingMessageReminder] 加载项目消息失败:', error)
        this.projectMessages = []
      } finally {
        this.isLoadingMessages = false
      }
    },
    /**
     * 处理消息操作（同意/拒绝）
     */
    async handleMessageAction(message, action) {
      if (this.messageActionLoading) return
      
      this.messageActionLoading = message.id
      
      try {
        let response
        // 后端这些接口要求传入的是“收件记录ID”（recipientId）
        // 映射时我们已经把收件记录ID放在 message.recipientId
        const recipientId = message.recipientId || message.id
        
        if (message.scene === 'PROJECT_MEMBER_INVITED') {
          if (action === 'accept') {
            response = await acceptProjectInvitation(recipientId)
          } else {
            response = await rejectProjectInvitation(recipientId)
          }
        } else if (message.scene === 'PROJECT_MEMBER_APPLY') {
          if (action === 'accept') {
            response = await approveProjectJoin(recipientId)
          } else {
            response = await rejectProjectJoin(recipientId)
          }
        }
        
        if (response && response.code === 200) {
          this.$message.success(response.msg || '操作成功')
          
          // 注意：后端在处理邀请/申请时已经自动标记为已读（见MessageController.java第399行和460行）
          // 但为了确保，我们再次标记为已读（使用recipientId，因为后端API需要recipientId）
          const recipientIdToMark = message.recipientId || message.id
          if (recipientIdToMark) {
            try {
              await markAsRead(recipientIdToMark)
              console.log('[FloatingMessageReminder] 消息已标记为已读:', recipientIdToMark)
            } catch (error) {
              console.warn('[FloatingMessageReminder] 标记消息已读失败:', error)
            }
          }
          
          // 记录到本地已处理集合中，防止后续接口返回后再次显示
          const removeId = String(message.recipientId || message.id)
          if (removeId) {
            this.handledMessageIds.add(removeId)
            this.saveHandledMessageIds()
          }

          // 立即从列表中移除已处理的消息
          this.projectMessages = this.projectMessages.filter(m => {
            const msgId = String(m.recipientId || m.id)
            return msgId !== removeId
          })
          console.log('[FloatingMessageReminder] 处理消息后立即移除，剩余:', this.projectMessages.length, '条')
          
          // 延迟重新加载消息，确保后端已读状态已更新
          setTimeout(() => {
            console.log('[FloatingMessageReminder] 重新加载消息以同步状态...')
            this.loadProjectMessages()
          }, 800)
        } else {
          this.$message.error(response?.msg || '操作失败')
        }
      } catch (error) {
        console.error('[FloatingMessageReminder] 处理消息操作失败:', error)
        this.$message.error('操作失败，请稍后重试')
      } finally {
        this.messageActionLoading = null
      }
    },
    /**
     * 获取消息类型样式类
     */
    getMessageTypeClass(scene) {
      if (scene === 'PROJECT_MEMBER_INVITED') {
        return 'message-invite'
      } else if (scene === 'PROJECT_MEMBER_APPLY') {
        return 'message-apply'
      }
      return ''
    },
    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      if (!timestamp) return ''
      try {
        const now = new Date()
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
        return ''
      }
    }
  }
}
</script>

<style scoped>
.floating-message-reminder {
  position: fixed;
  right: 0;
  bottom: 100px; /* 稍微靠上，避免贴到底部 */
  transform: none;
  z-index: 9999;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.reminder-trigger {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 24px 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.reminder-trigger:hover {
  width: 52px;
  box-shadow: -3px 0 12px rgba(0, 0, 0, 0.18);
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.icon-wrapper {
  position: relative;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.reminder-panel {
  position: absolute;
  right: 48px;
  bottom: 0;
  width: 360px;
  max-height: 60vh; /* 整个面板最多占视口 60% 高度 */
  background: white;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  /* 面板本身不滚动，由内部内容区域滚动 */
  overflow: hidden;
  min-height: 0;
}

.panel-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.message-count {
  font-size: 14px;
  opacity: 0.9;
}

.panel-content {
  flex: 1;
  /* 内容区域使用固定的最大高度并允许滚动，保证能看到所有按钮 */
  max-height: calc(60vh - 72px); /* 60vh 减去 header 高度预估值 */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  min-height: 0;
  -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  text-align: center;
}

.loading-state svg,
.empty-state svg {
  margin-bottom: 12px;
  color: #94a3b8;
}

.empty-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.message-item:hover {
  background: #f1f5f9;
  transform: translateX(-2px);
}

.message-item.message-invite {
  border-left-color: #3b82f6;
}

.message-item.message-apply {
  border-left-color: #f59e0b;
}

.message-info {
  margin-bottom: 12px;
}

.message-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.message-content {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.message-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.accept {
  background: #10b981;
  color: white;
}

.action-btn.accept:hover:not(:disabled) {
  background: #059669;
}

.action-btn.reject {
  background: #e2e8f0;
  color: #475569;
}

.action-btn.reject:hover:not(:disabled) {
  background: #cbd5e1;
}

/* 过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
  margin: 4px 0;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 确保消息列表可以滚动 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

/* 暗色模式 */
.dark-mode .reminder-panel {
  background: #1e293b;
  color: #f1f5f9;
}

.dark-mode .message-item {
  background: #334155;
}

.dark-mode .message-item:hover {
  background: #475569;
}

.dark-mode .message-title {
  color: #f1f5f9;
}

.dark-mode .message-content {
  color: #cbd5e1;
}

.dark-mode .message-time {
  color: #94a3b8;
}

.dark-mode .action-btn.reject {
  background: #475569;
  color: #cbd5e1;
}

.dark-mode .action-btn.reject:hover:not(:disabled) {
  background: #64748b;
}
</style>

