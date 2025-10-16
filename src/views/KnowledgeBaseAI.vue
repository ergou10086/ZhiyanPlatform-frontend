<template>
  <div class="ai-view">
    <div class="section-card">
      <div class="section-title">AI赋能助手</div>
      <div class="section-subtitle">智能问答与内容生成服务</div>
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
    </div>
  </div>
</template>

<script>
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
      messages: []
    }
  },
  mounted() {
    // 组件挂载时加载本地存储的消息
    this.loadMessagesFromStorage()
  },
  beforeDestroy() {
    // 组件销毁前保存消息
    this.saveMessagesToStorage()
  },
  methods: {
    sendMessage() {
      if (!this.inputMessage.trim() || this.isSending) return
      
      const userMessage = {
        id: Date.now(),
        type: 'right',
        content: this.inputMessage.trim()
      }
      
      this.messages.push(userMessage)
      this.inputMessage = ''
      this.isSending = true
      
      // 保存消息到本地存储
      this.saveMessagesToStorage()
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      // 模拟发送状态（暂时不接AI，所以只是显示发送状态）
      setTimeout(() => {
        this.isSending = false
        console.log('消息已发送（AI功能暂未接入）:', userMessage.content)
      }, 1000)
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
    
    loadMessagesFromStorage() {
      try {
        const storageKey = this.projectId ? `aiChatMessages_${this.projectId}` : 'aiChatMessages'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          this.messages = JSON.parse(saved)
          console.log(`AI对话数据已从本地存储加载 (项目ID: ${this.projectId})`)
        } else {
          // 如果没有保存的消息，初始化项目特定的示例对话
          this.initializeProjectMessages()
        }
      } catch (error) {
        console.error('加载消息失败:', error)
      }
    },
    
    // 初始化项目特定的示例对话
    initializeProjectMessages() {
      if (!this.projectId) return
      
      const projectMessages = this.getProjectSpecificMessages(this.projectId)
      if (projectMessages.length > 0) {
        this.messages = projectMessages
        this.saveMessagesToStorage()
        console.log(`已初始化项目 ${this.projectId} 的AI对话示例`)
      }
    },
    
    // 获取项目特定的示例对话
    getProjectSpecificMessages(projectId) {
      const projectMessagesMap = {
        '1': [ // 多模态医学影像数据平台
          {
            id: Date.now() - 1000,
            type: 'left',
            content: '您好！我是医学影像AI助手，可以帮您分析CT、MRI等医学影像数据，生成诊断报告，优化图像处理算法。请问您需要什么帮助？'
          },
          {
            id: Date.now() - 500,
            type: 'right',
            content: '请帮我分析一下这个肺部CT影像的异常区域'
          },
          {
            id: Date.now() - 200,
            type: 'left',
            content: '我已经分析了您提供的肺部CT影像。检测到以下异常区域：\n\n1. 右肺上叶发现一个约2.3cm的结节\n2. 结节边缘不规则，建议进一步检查\n3. 建议进行PET-CT扫描以确定性质\n\n需要我生成详细的诊断报告吗？'
          }
        ],
        '2': [ // 气候变化预测模型研究
          {
            id: Date.now() - 1000,
            type: 'left',
            content: '您好！我是气候预测AI助手，可以帮您分析气象数据，构建预测模型，生成气候报告。请问您需要什么帮助？'
          },
          {
            id: Date.now() - 500,
            type: 'right',
            content: '请帮我预测下个月的气温趋势'
          },
          {
            id: Date.now() - 200,
            type: 'left',
            content: '基于当前的气象数据和历史模式，我预测下个月气温趋势如下：\n\n1. 平均气温将比去年同期高1.2°C\n2. 最高气温预计在28-32°C之间\n3. 降雨概率为35%，主要集中在月中\n4. 建议关注极端天气预警\n\n需要我生成详细的气候分析报告吗？'
          }
        ],
        '3': [ // 基因组数据分析平台
          {
            id: Date.now() - 1000,
            type: 'left',
            content: '您好！我是基因组分析AI助手，可以帮您分析基因序列，识别变异位点，预测蛋白质功能。请问您需要什么帮助？'
          },
          {
            id: Date.now() - 500,
            type: 'right',
            content: '请帮我分析这个基因序列的变异情况'
          },
          {
            id: Date.now() - 200,
            type: 'left',
            content: '我已经分析了您提供的基因序列，发现以下变异：\n\n1. 检测到3个SNP位点\n2. 其中1个为非同义突变，可能影响蛋白质功能\n3. 变异频率在人群中为0.15\n4. 建议进行功能验证实验\n\n需要我生成详细的变异分析报告吗？'
          }
        ]
      }
      
      return projectMessagesMap[projectId] || []
    }
  }
}
</script>

<style scoped>
.ai-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 40px - 28px); /* 减去顶部导航、主内容padding和底部padding */
}

.section-card { background: #fff; border: 1px solid #eef0f2; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: #333; }
.section-subtitle { color: #9ca3af; font-size: 12px; margin-top: 6px; }

.chat-card { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  padding: 12px; 
  display: flex; 
  flex-direction: column; 
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许flex子元素收缩 */
}
.chat-window { 
  flex: 1; 
  padding: 10px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  overflow: auto; 
  min-height: 0; /* 允许滚动 */
}
.bubble { max-width: 70%; padding: 10px 12px; border-radius: 12px; font-size: 14px; line-height: 1.6; }
.bubble.left { align-self: flex-start; background: #f3f4f6; color: #374151; }
.bubble.right { align-self: flex-end; background: #4f46e5; color: #fff; }

.composer { display: flex; gap: 8px; padding-top: 10px; flex-shrink: 0; }
.composer-input { flex: 1; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0 12px; }
.composer-input:disabled { background: #f9fafb; cursor: not-allowed; }
.send-btn { width: 40px; height: 40px; border-radius: 10px; background: #4f46e5; color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
