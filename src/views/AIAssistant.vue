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
        <span class="page-title">AI 实验分析助手</span>
      </div>
      <div class="header-right">
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 项目概览区域 -->
      <div class="project-overview">
        <div class="project-info">
          <h1 class="project-title">AI实验分析助手</h1>
          <div class="project-details">
            <div class="project-name">量子计算算法优化研究</div>
            <div class="project-lead">负责人: 王志强教授</div>
          </div>
        </div>
        <div class="project-progress">
          <div class="progress-label">项目进度</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 65%"></div>
          </div>
          <div class="progress-text">65% 完成</div>
        </div>
      </div>

      <!-- 任务管理区域 -->
      <div class="task-management">
        <div class="task-header">
          <div class="filter-tabs">
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'all' }"
              @click="setFilter('all')"
            >
              全部状态
            </div>
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'in-progress' }"
              @click="setFilter('in-progress')"
            >
              进行中
            </div>
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'completed' }"
              @click="setFilter('completed')"
            >
              已完成
            </div>
            <div 
              class="tab" 
              :class="{ active: activeFilter === 'paused' }"
              @click="setFilter('paused')"
            >
              已暂停
            </div>
          </div>
          <div class="search-box">
            <input 
              type="text" 
              placeholder="搜索任务..." 
              :value="searchQuery"
              @input="updateSearchQuery"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <div class="task-grid">
          <div 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-card"
          >
            <div class="task-header">
              <input 
                type="checkbox" 
                :checked="task.checked"
                @change="toggleTaskCheckbox(task.id)"
              />
              <div class="task-title">{{ task.title }}</div>
              <div class="task-status" :class="getStatusClass(task.status)">
                {{ getStatusText(task.status) }}
              </div>
            </div>
            <div class="task-description">{{ task.description }}</div>
            <div class="task-assignee">
              <div class="assignee-avatar">{{ task.assignee.charAt(0) }}</div>
              <span>{{ task.assignee }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI对话区域 -->
      <div class="ai-chat-section">
        <div class="chat-container">
          <div class="ai-message">
            <div class="message-bubble">
              您好!我是您的AI实验分析助手。请选择任务并提出问题,我将为您提供数据分析和建议。
            </div>
          </div>
          
          <div class="ai-message">
            <div class="message-bubble">
              根据数据分析,该任务的实验结果呈现稳定上升趋势,建议继续优化参数以提升效率。
            </div>
          </div>

          <div class="example-prompt">
            <div class="prompt-bubble">
              请分析任务"量子纠缠态制备"的实验结果趋势。
            </div>
          </div>

          <div class="user-input-area">
            <input type="text" placeholder="输入您的问题..." />
            <button class="send-btn">发送</button>
          </div>
        </div>
      </div>

      <!-- AI分析建议区域 -->
      <div class="ai-suggestions">
        <h3 class="suggestions-title">AI分析建议</h3>
        <div class="suggestions-grid">
          <div class="suggestion-card">
            <div class="suggestion-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">优化建议</div>
              <div class="suggestion-text">建议调整激光功率参数至4.2W以提升纠缠态制备效率</div>
            </div>
          </div>

          <div class="suggestion-card">
            <div class="suggestion-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">风险预警</div>
              <div class="suggestion-text">检测到环境温度波动可能影响实验稳定性</div>
            </div>
          </div>

          <div class="suggestion-card">
            <div class="suggestion-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21M7 16L12 11L16 15L20 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">进度反馈</div>
              <div class="suggestion-text">所选任务平均完成度78%,预计还需3天完成</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-actions">
        <button class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 3V8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          保存分析
        </button>
        <button class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          导出报告
        </button>
        <button class="action-btn primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 6L12 2L8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          分享结果
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

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
      tasks: [
        {
          id: 1,
          title: '量子纠缠态制备',
          description: '研究高保真度纠缠态的制备方法',
          assignee: '张伟',
          status: 'in-progress',
          checked: false
        },
        {
          id: 2,
          title: '量子门操作优化',
          description: '优化量子门操作的精度和速度',
          assignee: '李娜',
          status: 'completed',
          checked: false
        },
        {
          id: 3,
          title: '量子纠错编码',
          description: '设计高效的量子纠错编码方案',
          assignee: '王强',
          status: 'in-progress',
          checked: false
        },
        {
          id: 4,
          title: '量子算法验证',
          description: '验证量子算法的正确性和效率',
          assignee: '陈美玲',
          status: 'paused',
          checked: false
        },
        {
          id: 5,
          title: '量子通信协议',
          description: '开发安全的量子通信协议',
          assignee: '赵磊',
          status: 'in-progress',
          checked: false
        },
        {
          id: 6,
          title: '量子传感器校准',
          description: '校准量子传感器的精度和稳定性',
          assignee: '孙芳',
          status: 'completed',
          checked: false
        }
      ]
    }
  },
  computed: {
    filteredTasks() {
      let filtered = this.tasks
      
      // 按状态筛选
      if (this.activeFilter !== 'all') {
        filtered = filtered.filter(task => task.status === this.activeFilter)
      }
      
      // 按搜索关键词筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignee.toLowerCase().includes(query)
        )
      }
      
      return filtered
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    setFilter(filter) {
      this.activeFilter = filter
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
        'in-progress': '进行中',
        'completed': '已完成',
        'paused': '已暂停'
      }
      return statusMap[status] || status
    },
    getStatusClass(status) {
      return status
    }
  }
}
</script>

<style scoped>
.ai-assistant-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.menu-btn:hover {
  background-color: #f8f9fa;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}



.main-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 项目概览区域 */
.project-overview {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-info {
  flex: 1;
}

.project-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.project-lead {
  font-size: 14px;
  color: #666;
}

.project-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 200px;
}

.progress-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #007bff;
  font-weight: 600;
}

/* 任务管理区域 */
.task-management {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  background: #f8f9fa;
}

.tab.active {
  background: #007bff;
  color: white;
}

.tab:hover:not(.active) {
  background: #e9ecef;
  color: #333;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 14px;
  width: 200px;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #007bff;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: #666;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.task-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-card .task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.task-card input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.task-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.task-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.task-status.in-progress {
  background: #e3f2fd;
  color: #1976d2;
}

.task-status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.task-status.paused {
  background: #fff3e0;
  color: #f57c00;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.task-assignee span {
  font-size: 14px;
  color: #333;
}

/* AI对话区域 */
.ai-chat-section {
  background: white;
  border-radius: 12px;
  padding: 50px 40px 20px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 300px;
  justify-content: flex-start;
}

.ai-message {
  display: flex;
  justify-content: flex-start;
}

.message-bubble {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.example-prompt {
  display: flex;
  justify-content: flex-end;
}

.prompt-bubble {
  background: #e3f2fd;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  font-size: 14px;
  color: #1976d2;
  line-height: 1.4;
}

.user-input-area {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 0;
  margin-bottom: 0;
}

.user-input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 24px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.user-input-area input:focus {
  outline: none;
  border-color: #007bff;
}

.send-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.send-btn:hover {
  background: #0056b3;
}

/* AI分析建议区域 */
.ai-suggestions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.suggestions-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f5e8;
  color: #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-icon.warning {
  background: #fff3e0;
  color: #f57c00;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.suggestion-text {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 底部操作栏 */
.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.action-btn.primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.action-btn.primary:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .project-overview {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .project-progress {
    align-items: flex-start;
    width: 100%;
  }
  
  .task-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .task-grid {
    grid-template-columns: 1fr;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-actions {
    flex-direction: column;
  }
}
</style>
