<template>
  <div class="message-notification">
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
          <div class="header-right">
            <button class="action-btn" @click="markAllRead" :disabled="unreadCount === 0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>全部已读</span>
            </button>
          </div>
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
            :class="{ 'unread': !message.isRead }"
            @click="handleMessageClick(message)"
          >
            <!-- 消息图标 -->
            <div class="message-icon" :class="`scene-${message.scene}`">
              <component :is="getSceneIcon(message.scene)" />
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
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
              <div class="detail-scene">{{ detailMessage?.scene || '消息详情' }}</div>
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
              <div class="section-content">{{ detailMessage?.createdAt || detailMessage?.triggerTime }}</div>
            </div>

            <div class="detail-section" v-if="detailMessage?.businessType">
              <div class="section-label">业务类型</div>
              <div class="section-content">{{ detailMessage.businessType }}</div>
            </div>

            <div class="detail-section" v-if="detailMessage?.extendData">
              <div class="section-label">扩展信息</div>
              <pre class="section-extend">{{ formatExtendData(detailMessage.extendData) }}</pre>
            </div>
          </div>

          <div class="detail-footer">
            <button class="detail-btn" @click="closeMessageDetail">关闭</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { 
  getInboxMessages, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteMessage 
} from '@/api/message'

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
      pollingTimer: null,
      detailDialogVisible: false,
      detailMessage: null
    }
  },
  mounted() {
    console.log('🔔 GlobalMessageNotification 组件已挂载')
    this.fetchUnreadCount()
    this.startPolling()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
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
      
      return messageList.map(item => {
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
        
        return {
          id: item.recipientId || item.id,
          title: item.title || '',
          content: item.content || '',
          isRead: item.readFlag || false,
          createdAt: createdAt,
          scene: item.scene || '',
          businessId: item.businessId,
          businessType: item.businessType
        }
      })
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
      if (!this.selectedScene) {
        return this.messages
      }
      return this.messages.filter(message => this.matchSceneCategory(message.scene, this.selectedScene))
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
  position: fixed;
  top: 8px;
  right: 220px;
  z-index: 10003;
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
  z-index: 10004;
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

.header-right {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--primary-color);
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover:not(:disabled) {
  background: var(--primary-lightest);
}

.action-btn:disabled {
  color: var(--text-quaternary);
  cursor: not-allowed;
}

.action-btn svg {
  width: 14px;
  height: 14px;
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
  top: 20px;
  right: 20px;
  width: 8px;
  height: 8px;
  background: var(--danger-color);
  border-radius: 50%;
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
  z-index: 10005;
  padding: 16px;
}

.message-detail-modal {
  width: 520px;
  max-width: 100%;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-secondary);
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 4px;
}

.detail-scene {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-close {
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
}

.detail-body {
  padding: 16px 24px;
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: 16px;
}

.section-label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-tertiary);
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.section-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.section-extend {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border-secondary);
  display: flex;
  justify-content: flex-end;
}

.detail-btn {
  min-width: 96px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}


/* 响应式 */
@media (max-width: 768px) {
  .message-notification {
    right: 160px;
  }

  .message-panel {
    width: 90vw;
    max-width: 400px;
    right: -20px;
  }
}

@media (max-width: 480px) {
  .message-notification {
    right: 120px;
  }

  .message-panel {
    width: 95vw;
    right: -40px;
  }
}
</style>
