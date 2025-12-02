<template>
  <div class="right-sidebar">
    <!-- 我的工作日历标题 -->
    <div class="calendar-header">
      <h3 class="widget-title">我的工作日历</h3>
    </div>

    <!-- 日历卡片 -->
    <div class="calendar-widget">
      <div class="calendar">
        <div class="calendar-header">
          <button class="nav-btn" @click="previousMonth">‹</button>
          <span class="month-year">{{ currentMonth }}</span>
          <button class="nav-btn" @click="nextMonth">›</button>
        </div>
        <div class="calendar-grid">
          <div class="weekdays">
            <span>日</span>
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
          </div>
          <div class="calendar-days">
            <div
              class="day"
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="{
                'current-month': day.isCurrentMonth,
                'today': day.isToday,
                'selected': selectedDate && day.date && selectedDate.toDateString() === day.date.toDateString()
              }"
              @click="selectDate(day)"
            >
              {{ day.day }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务提醒 -->
    <div class="task-alert-widget" :class="{ 'urgent': urgentTasks.length > 0 }">
      <h3 class="widget-title">任务提醒</h3>
      <div class="task-alert-content">
        <!-- 加载状态 -->
        <div v-if="isLoadingTasks" class="alert-message safe">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="alert-text">
            <p class="alert-title">加载中...</p>
            <p class="alert-subtitle">正在获取任务数据</p>
          </div>
        </div>
        
        <!-- 有紧急任务 -->
        <div v-else-if="urgentTasks.length > 0">
          <div class="alert-message urgent" @click="toggleTaskList">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="alert-text">
              <p class="alert-title">有 <strong>{{ urgentTasks.length }}</strong> 个任务即将截止</p>
              <p class="alert-subtitle">请在三天内完成</p>
            </div>
            <svg class="expand-icon" :class="{ 'expanded': showTaskList }" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <!-- 任务列表 -->
          <transition name="slide-fade">
            <div v-if="showTaskList" class="urgent-task-list">
              <div 
                v-for="task in urgentTasks" 
                :key="task.id" 
                class="urgent-task-item"
                :class="getPriorityClass(task.priority)"
              >
                <div class="task-info">
                  <h4 class="task-name">{{ task.title }}</h4>
                  <p class="task-due">{{ formatDueDate(task.dueDate) }}</p>
                </div>
                <div class="task-badge" :class="getPriorityClass(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </div>
              </div>
            </div>
          </transition>
        </div>
        
        <!-- 没有紧急任务 -->
        <div v-else class="alert-message safe">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="alert-text">
            <p class="alert-title">很棒！</p>
            <p class="alert-subtitle">没有即将截止的任务</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { taskAPI } from '@/api/task'

export default {
  name: 'RightSidebar',
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      myTasks: [], // 存储用户的所有任务
      isLoadingTasks: false,
      showTaskList: false // 控制任务列表展开/收起
    }
  },
  computed: {
    currentMonth() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      return `${year}年${month}月`
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()

      // 获取当月第一天和最后一天
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      // 获取当月第一天是星期几（0=周日，1=周一...）
      const firstDayOfWeek = firstDay.getDay()

      // 获取上个月的最后几天
      const prevMonth = new Date(year, month, 0)
      const prevMonthLastDay = prevMonth.getDate()

      const days = []

      // 添加上个月的末尾几天
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          isCurrentMonth: false,
          isToday: false
        })
      }

      // 添加当月的所有天
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        const today = new Date()
        days.push({
          day: day,
          isCurrentMonth: true,
          isToday: date.toDateString() === today.toDateString(),
          date: date
        })
      }

      // 添加下个月的前几天，确保日历网格完整
      const remainingDays = 42 - days.length // 6行 x 7天 = 42个格子
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          day: day,
          isCurrentMonth: false,
          isToday: false
        })
      }

      return days
    },
    urgentTasks() {
      // 从任务数据中筛选出3天内即将到期的进行中任务
      if (!this.myTasks || this.myTasks.length === 0) {
        return []
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0) // 重置时间为当天的0点
      
      const threeDaysLater = new Date(today)
      threeDaysLater.setDate(today.getDate() + 3)
      threeDaysLater.setHours(23, 59, 59, 999) // 设置为第3天的23:59:59

      return this.myTasks.filter(task => {
        // 只统计有截止日期的任务
        if (!task.dueDate) {
          return false
        }
        
        // 只显示进行中的任务
        const status = String(task.status || '').trim()
        const statusUpper = status.toUpperCase()
        const inProgressStatuses = ['IN_PROGRESS', '进行中', 'DOING', 'doing', 'In Progress']
        const isInProgress = inProgressStatuses.includes(status) || 
                            inProgressStatuses.includes(statusUpper) ||
                            statusUpper === 'IN_PROGRESS' ||
                            status === '进行中'
        
        // 只有进行中的任务才提醒
        if (!isInProgress) {
          return false
        }

        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        // 判断是否在今天到3天后的范围内
        return dueDate >= today && dueDate <= threeDaysLater
      })
    }
  },
  mounted() {
    // 加载任务数据
    this.loadTasks()
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },
    selectDate(day) {
      if (day.isCurrentMonth) {
        this.selectedDate = day.date
        console.log('选择日期:', day.date)
      }
    },
    async loadTasks() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        console.log('用户未登录，不加载任务提醒数据')
        this.myTasks = []
        return
      }
      
      this.isLoadingTasks = true
      
      try {
        console.log('[RightSidebar] 开始加载任务数据...')
        
        // 调用API获取我的所有任务（不限制数量，以便准确统计）
        const response = await taskAPI.getMyAssignedTasks(0, 100)
        
        console.log('[RightSidebar] 任务API响应:', response)
        
        // 处理API返回的数据
        let tasks = []
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            tasks = response.data
          } else if (response.data.content && Array.isArray(response.data.content)) {
            // Spring分页数据
            tasks = response.data.content
          } else if (response.data.list && Array.isArray(response.data.list)) {
            tasks = response.data.list
          } else if (response.data.records && Array.isArray(response.data.records)) {
            tasks = response.data.records
          }
        }
        
        if (tasks.length > 0) {
          this.myTasks = tasks.map(task => ({
            id: task.id || task.taskId,
            title: task.title || '未命名任务',
            description: task.description || '',
            dueDate: task.dueDate || null,
            status: task.status || 'TODO',
            priority: task.priority || 'MEDIUM',
            projectId: task.projectId
          }))
          
          console.log('[RightSidebar] 成功加载任务:', this.myTasks.length, '个')
          console.log('[RightSidebar] 即将到期的任务:', this.urgentTasks.length, '个')
        } else {
          console.log('[RightSidebar] 未获取到任务数据')
          this.myTasks = []
        }
      } catch (error) {
        console.error('[RightSidebar] 加载任务失败:', error)
        this.myTasks = []
      } finally {
        this.isLoadingTasks = false
      }
    },
    toggleTaskList() {
      this.showTaskList = !this.showTaskList
    },
    formatDueDate(dateStr) {
      if (!dateStr) return '未设置截止日期'
      
      const dueDate = new Date(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dueDate.setHours(0, 0, 0, 0)
      
      const diffTime = dueDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return '今天截止'
      } else if (diffDays === 1) {
        return '明天截止'
      } else if (diffDays === 2) {
        return '后天截止'
      } else if (diffDays > 0) {
        return `${diffDays}天后截止`
      } else {
        return `已逾期${Math.abs(diffDays)}天`
      }
    },
    getPriorityText(priority) {
      const map = {
        'HIGH': '高优先级',
        'MEDIUM': '中优先级',
        'LOW': '低优先级'
      }
      return map[priority] || '中优先级'
    },
    getPriorityClass(priority) {
      const map = {
        'HIGH': 'priority-high',
        'MEDIUM': 'priority-medium',
        'LOW': 'priority-low'
      }
      return map[priority] || 'priority-medium'
    }
  }
}
</script>

<style scoped>
.right-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  background: var(--bg-primary);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-md);
  flex-shrink: 0; /* 防止被压缩 */
}

.calendar-header {
  margin-bottom: var(--space-4);
}

.calendar-widget,
.task-alert-widget {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
  transition: all var(--transition-normal);
}

.calendar-widget:hover,
.task-alert-widget:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 任务提醒样式 */
.task-alert-widget {
  border: 2px solid #dbeafe; /* 默认淡蓝色 */
}

.task-alert-widget.urgent {
  border: 2px solid var(--error-color); /* 紧急时红色 */
  background: linear-gradient(135deg, var(--bg-primary), var(--error-light));
}

.task-alert-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.alert-message {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
}

.alert-message.urgent {
  background: var(--error-light);
}

.alert-message.urgent:hover {
  background: linear-gradient(135deg, var(--error-light), #fecaca);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.alert-message.safe {
  background: var(--primary-light);
}

.expand-icon {
  flex-shrink: 0;
  transition: transform var(--transition-normal);
  margin-left: auto;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* 任务列表 */
.urgent-task-list {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 175px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

/* 自定义滚动条样式 */
.urgent-task-list::-webkit-scrollbar {
  width: 6px;
}

.urgent-task-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.urgent-task-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.urgent-task-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.urgent-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border-left: 3px solid;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.urgent-task-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.urgent-task-item.priority-high {
  border-left-color: var(--error-color);
  background: linear-gradient(135deg, var(--bg-primary), var(--error-light));
}

.urgent-task-item.priority-medium {
  border-left-color: var(--warning-color);
  background: linear-gradient(135deg, var(--bg-primary), var(--warning-light));
}

.urgent-task-item.priority-low {
  border-left-color: var(--success-color);
  background: linear-gradient(135deg, var(--bg-primary), var(--success-light));
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-due {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
}

.task-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 4px 8px;
  border-radius: var(--radius-md);
  white-space: nowrap;
  flex-shrink: 0;
}

.task-badge.priority-high {
  background: var(--error-color);
  color: white;
}

.task-badge.priority-medium {
  background: var(--warning-color);
  color: white;
}

.task-badge.priority-low {
  background: var(--success-color);
  color: white;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.alert-text {
  flex: 1;
}

.alert-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
}

.alert-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.widget-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-4) 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.month-year {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transform: scale(1.1);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-1);
  margin-bottom: var(--space-2);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-1);
}

.day {
  aspect-ratio: 1;
  max-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-weight: var(--font-medium);
}

/* 移动端优化 */
@media (max-width: 1024px) {
  .day {
    aspect-ratio: unset;
    height: 36px;
    max-height: 36px;
  }
}

@media (max-width: 768px) {
  .calendar-days {
    gap: 2px;
  }
  
  .day {
    aspect-ratio: unset;
    height: 32px;
    max-height: 32px;
  }
}

@media (max-width: 480px) {
  .calendar-days {
    gap: 1px;
  }
  
  .day {
    aspect-ratio: unset;
    height: 28px;
    max-height: 28px;
  }
}

.day:hover {
  background-color: var(--bg-tertiary);
  transform: scale(1.1);
}

.day.current-month {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.day.today {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-inverse);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
}

.day.selected {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: var(--font-semibold);
  border: 2px solid var(--primary-color);
}

.day:not(.current-month) {
  color: var(--text-disabled);
}

.day.current-month:hover {
  background-color: var(--bg-tertiary);
}

.day.today:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-dark));
  transform: scale(1.1);
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.stat-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
  position: relative;
}

.progress-fill.completed {
  background: linear-gradient(135deg, var(--success-color), var(--success-hover));
}

.progress-fill.work-hours {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (max-width: 1200px) {
  .right-sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .right-sidebar {
    padding: 0 !important;
    max-width: 100% !important;
  }
  
  .calendar-header h3.widget-title {
    font-size: 16px !important;
    margin-bottom: 8px !important;
    padding: 0 12px !important;
  }
  
  .calendar-widget,
  .task-alert-widget {
    padding: 10px !important;
    margin-bottom: 10px !important;
  }

  .widget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .edit-btn {
    align-self: flex-end;
  }
  
  /* 日历网格优化 */
  .calendar {
    max-width: 100% !important;
  }
  
  .calendar-grid {
    font-size: 12px !important;
  }
  
  .calendar-days {
    gap: 2px !important;
  }
  
  .weekdays {
    margin-bottom: 4px !important;
  }
  
  .weekdays span {
    font-size: 11px !important;
    padding: 4px 2px !important;
  }
  
  .day {
    aspect-ratio: unset !important;
    height: 32px !important;
    line-height: 32px !important;
    font-size: 12px !important;
    padding: 0 !important;
  }
  
  /* 月份导航 */
  .calendar .calendar-header {
    padding: 8px !important;
    margin-bottom: 8px !important;
  }
  
  .calendar-header .month-year {
    font-size: 14px !important;
  }
  
  .calendar-header .nav-btn {
    width: 28px !important;
    height: 28px !important;
    font-size: 16px !important;
  }
  
  /* 任务提醒 */
  .task-alert-widget {
    max-height: 200px !important;
    overflow-y: auto !important;
  }
  
  .task-alert-widget .widget-title {
    font-size: 14px !important;
    margin-bottom: 8px !important;
  }
  
  .alert-message {
    padding: 8px !important;
  }
  
  .alert-title {
    font-size: 12px !important;
  }
  
  .alert-subtitle {
    font-size: 10px !important;
  }
  
  .urgent-task-item {
    padding: 8px !important;
    margin-bottom: 6px !important;
  }
  
  .task-name {
    font-size: 12px !important;
  }
  
  .task-due {
    font-size: 10px !important;
  }
}

@media (max-width: 480px) {
  .right-sidebar {
    padding: 0 !important;
    max-width: 100% !important;
  }
  
  .calendar-header h3.widget-title {
    font-size: 14px !important;
    margin-bottom: 6px !important;
    padding: 0 8px !important;
  }
  
  .calendar-widget,
  .task-alert-widget {
    padding: 8px !important;
    margin-bottom: 8px !important;
  }
  
  /* 日历更紧凑 */
  .calendar {
    max-width: 100% !important;
  }
  
  .calendar-grid {
    font-size: 11px !important;
  }
  
  .calendar-days {
    gap: 1px !important;
  }
  
  .weekdays {
    margin-bottom: 2px !important;
  }
  
  .weekdays span {
    font-size: 10px !important;
    padding: 3px 1px !important;
  }
  
  .day {
    aspect-ratio: unset !important;
    height: 28px !important;
    line-height: 28px !important;
    font-size: 11px !important;
    padding: 0 !important;
  }
  
  .calendar .calendar-header {
    padding: 6px !important;
    margin-bottom: 6px !important;
  }
  
  .calendar-header .month-year {
    font-size: 13px !important;
  }
  
  .calendar-header .nav-btn {
    width: 24px !important;
    height: 24px !important;
    font-size: 14px !important;
  }
  
  /* 任务提醒更紧凑 */
  .task-alert-widget {
    max-height: 150px !important;
  }
  
  .task-alert-widget .widget-title {
    font-size: 13px !important;
    margin-bottom: 6px !important;
  }
  
  .alert-message {
    padding: 6px !important;
    gap: 6px !important;
  }
  
  .alert-message svg {
    width: 14px !important;
    height: 14px !important;
  }
  
  .alert-title {
    font-size: 11px !important;
  }
  
  .alert-subtitle {
    font-size: 9px !important;
  }
  
  .urgent-task-item {
    padding: 6px !important;
    margin-bottom: 4px !important;
  }
  
  .task-name {
    font-size: 11px !important;
  }
  
  .task-due {
    font-size: 9px !important;
  }
  
  .task-badge {
    font-size: 8px !important;
    padding: 2px 4px !important;
  }
}

/* 黑夜模式样式 */
.dark-mode .right-sidebar {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .calendar-widget,
.dark-mode .right-sidebar .task-alert-widget {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .widget-title {
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .month-year {
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .nav-btn {
  color: #cbd5e1 !important;
}

.dark-mode .right-sidebar .nav-btn:hover {
  background-color: #334155 !important;
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .weekdays {
  color: #cbd5e1 !important;
}

.dark-mode .right-sidebar .day {
  color: #94a3b8 !important;
}

.dark-mode .right-sidebar .day.current-month {
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .day:hover {
  background-color: #334155 !important;
}

.dark-mode .right-sidebar .day.current-month:hover {
  background-color: #334155 !important;
}

.dark-mode .right-sidebar .day.today {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: #ffffff !important;
}

.dark-mode .right-sidebar .day.today:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
}

.dark-mode .right-sidebar .day.selected {
  background: #334155 !important;
  color: #60a5fa !important;
  border-color: #60a5fa !important;
}

.dark-mode .right-sidebar .day:not(.current-month) {
  color: #475569 !important;
}

.dark-mode .right-sidebar .task-alert-widget {
  border-color: #475569 !important;
}

.dark-mode .right-sidebar .task-alert-widget.urgent {
  border-color: #ef4444 !important;
  background: linear-gradient(135deg, #1e293b, #7f1d1d) !important;
}

.dark-mode .right-sidebar .alert-message.urgent {
  background: #7f1d1d !important;
}

.dark-mode .right-sidebar .alert-message.safe {
  background: #1e3a5f !important;
}

.dark-mode .right-sidebar .alert-title {
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .alert-subtitle {
  color: #cbd5e1 !important;
}

/* 暗色模式下的任务列表样式 */
.dark-mode .right-sidebar .urgent-task-item {
  background: #1e293b !important;
}

.dark-mode .right-sidebar .urgent-task-item.priority-high {
  background: linear-gradient(135deg, #1e293b, #450a0a) !important;
}

.dark-mode .right-sidebar .urgent-task-item.priority-medium {
  background: linear-gradient(135deg, #1e293b, #451a03) !important;
}

.dark-mode .right-sidebar .urgent-task-item.priority-low {
  background: linear-gradient(135deg, #1e293b, #052e16) !important;
}

.dark-mode .right-sidebar .task-name {
  color: #f1f5f9 !important;
}

.dark-mode .right-sidebar .task-due {
  color: #cbd5e1 !important;
}

.dark-mode .right-sidebar .expand-icon {
  color: #cbd5e1 !important;
}

/* 暗色模式下的任务列表滚动条样式 */
.dark-mode .right-sidebar .urgent-task-list::-webkit-scrollbar {
  width: 6px;
}

.dark-mode .right-sidebar .urgent-task-list::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 3px;
}

.dark-mode .right-sidebar .urgent-task-list::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.dark-mode .right-sidebar .urgent-task-list::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
