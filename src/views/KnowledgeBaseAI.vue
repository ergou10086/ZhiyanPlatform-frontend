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
  height: calc(100vh - 64px - 40px - 28px);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  margin-bottom: 24px;
  animation: fadeInDown 0.6s ease-out;
}

.page-title {
  position: relative;
  margin: 0 0 16px 0;
  display: inline-block;
}

.title-text {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #0044CC 0%, #5EB6E4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.title-decoration {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #5EB6E4 0%, #A7C6ED 50%, transparent 100%);
  border-radius: 2px;
}

.page-subtitle {
  font-size: 15px;
  color: #64748b;
  line-height: 1.8;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 3px solid #5EB6E4;
  border-radius: 8px;
}

.subtitle-icon {
  flex-shrink: 0;
  color: #5EB6E4;
  margin-top: 2px;
}

.section-card { 
  background: #fff; 
  border: 1px solid #e5e7eb; 
  border-radius: 16px; 
  padding: 16px; 
  margin-bottom: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.section-title { 
  font-size: 16px; 
  font-weight: 700; 
  color: #1e293b; 
}
.section-subtitle { 
  color: #6b7280; 
  font-size: 12px; 
  margin-top: 6px; 
}

.chat-card { 
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  display: flex; 
  flex-direction: column; 
  flex: 1;
  min-height: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}
.chat-card:hover {
  box-shadow: 0 8px 15px -5px rgba(0, 0, 0, 0.15);
}
.chat-window { 
  flex: 1; 
  padding: 16px; 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
  overflow: auto; 
  min-height: 0;
  background: white;
  border-radius: 12px;
}
.bubble { 
  max-width: 75%; 
  padding: 14px 18px; 
  border-radius: 16px; 
  font-size: 14px; 
  line-height: 1.7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.bubble.left { 
  align-self: flex-start; 
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #334155;
  border-bottom-left-radius: 4px;
}
.bubble.right { 
  align-self: flex-end; 
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
}

.composer { 
  display: flex; 
  gap: 12px; 
  padding-top: 16px; 
  flex-shrink: 0;
  border-top: 2px solid #e5e7eb;
  margin-top: 16px;
}
.composer-input { 
  flex: 1; 
  height: 48px; 
  border: 2px solid #e5e7eb; 
  border-radius: 12px; 
  padding: 0 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}
.composer-input:focus {
  outline: none;
  border-color: #5EB6E4;
  box-shadow: 0 0 0 3px rgba(94, 182, 228, 0.1);
}
.composer-input:disabled { 
  background: #f9fafb; 
  cursor: not-allowed; 
}
.send-btn { 
  width: 48px; 
  height: 48px; 
  border-radius: 12px; 
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white; 
  border: none; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
}
.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 68, 204, 0.4);
  background: linear-gradient(135deg, #0044CC 0%, #003399 100%);
}
.send-btn:disabled { 
  opacity: 0.5; 
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #0044CC;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
