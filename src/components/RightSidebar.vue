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
                'selected': selectedDate && day.date && selectedDate.toDateString() === day.date.toDateString(),
                'has-tasks': day.hasTasks,
                'priority-high': day.highestPriority === 'HIGH',
                'priority-medium': day.highestPriority === 'MEDIUM',
                'priority-low': day.highestPriority === 'LOW'
              }"
              @click="selectDate(day)"
            >
              {{ day.day }}
            </div>
          </div>
        </div>
      </div>

      <!-- 日期区间任务悬浮弹窗 -->
      <div v-if="showDateTaskModal" class="date-task-popover">
        <div class="date-task-popover-header">
          <div>
            <h3 class="date-task-popover-title">{{ dateRangeTitle }}</h3>
            <p class="date-task-popover-subtitle">{{ dateRangeDescription }}</p>
          </div>
          <button class="date-task-popover-close" @click="closeDateTaskModal">×</button>
        </div>
        <div class="date-task-popover-body">
          <div v-if="dateRangeTasks.length === 0" class="date-task-empty">
            <p>该时间段内没有截止的任务</p>
          </div>
          <div v-else class="date-task-list">
            <div
              v-for="task in dateRangeTasks"
              :key="task.id"
              class="date-task-item"
              :class="getPriorityClass(task.priority)"
            >
              <div class="task-info">
                <h4 class="task-name">{{ task.title }}</h4>
                <p class="task-due">{{ formatTaskDueDate(task) }}</p>
              </div>
              <div class="task-badges">
                <div class="task-status-badge" :class="getStatusClass(task.status)">
                  {{ getStatusText(task.status) }}
                </div>
                <div class="task-badge" :class="getPriorityClass(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </div>
              </div>
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
                  <p class="task-due">{{ formatTaskDueDate(task) }}</p>
                </div>
                <div class="task-badges">
                  <div class="task-status-badge" :class="getStatusClass(task.status)">
                    {{ getStatusText(task.status) }}
                  </div>
                  <div class="task-badge" :class="getPriorityClass(task.priority)">
                    {{ getPriorityText(task.priority) }}
                  </div>
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
      showTaskList: false, // 控制任务列表展开/收起
      showDateTaskModal: false,
      dateRangeTasks: [],
      dateRangeTitle: '',
      dateRangeDescription: ''
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
        date.setHours(0, 0, 0, 0)
        
        // 获取该日期的任务和最高优先级
        const dayTasks = this.getTasksForDate(date)
        const highestPriority = this.getHighestPriority(dayTasks)
        
        days.push({
          day: day,
          isCurrentMonth: true,
          isToday: date.toDateString() === today.toDateString(),
          date: date,
          hasTasks: dayTasks.length > 0,
          highestPriority: highestPriority
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
        if (this.selectedDate && day.date && this.selectedDate.toDateString() === day.date.toDateString()) {
          this.selectedDate = null
          this.showDateTaskModal = false
          this.dateRangeTasks = []
          this.dateRangeTitle = ''
          this.dateRangeDescription = ''
          console.log('取消选择日期')
          return
        }

        this.selectedDate = day.date

        const clickedDate = new Date(day.date)
        const today = new Date()
        clickedDate.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)

        let startDate
        let endDate

        if (clickedDate.getTime() < today.getTime()) {
          startDate = clickedDate
          endDate = today
          this.dateRangeTitle = '从选择日期到今天截止的任务'
        } else if (clickedDate.getTime() > today.getTime()) {
          startDate = today
          endDate = clickedDate
          this.dateRangeTitle = '从今天到选择日期截止的任务'
        } else {
          startDate = today
          endDate = today
          this.dateRangeTitle = '今天截止的任务'
        }

        const formatDate = (d) => {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const dayNum = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${dayNum}`
        }

        this.dateRangeDescription = `${formatDate(startDate)} 至 ${formatDate(endDate)}`

        const startTime = startDate.getTime()
        const endTime = endDate.getTime()

        this.dateRangeTasks = (this.myTasks || []).filter(task => {
          if (!task.dueDate) {
            return false
          }
          
          const due = new Date(task.dueDate)
          due.setHours(0, 0, 0, 0)
          const t = due.getTime()
          return t >= startTime && t <= endTime
        })

        this.showDateTaskModal = true
        console.log('选择日期:', this.selectedDate, '区间任务数量:', this.dateRangeTasks.length)
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
    closeDateTaskModal() {
      this.showDateTaskModal = false
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
    /**
     * 根据任务状态格式化截止日期显示
     */
    formatTaskDueDate(task) {
      if (!task.dueDate) return '未设置截止日期'
      
      const status = String(task.status || '').trim().toUpperCase()
      const isDone = status === 'DONE' || status === '已完成'
      
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dueDate.setHours(0, 0, 0, 0)
      
      const diffTime = dueDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // 如果任务已完成，显示完成状态而不是逾期
      if (isDone) {
        if (diffDays < 0) {
          return `截止日期：${this.formatDateString(task.dueDate)}（已完成）`
        } else {
          return `截止日期：${this.formatDateString(task.dueDate)}`
        }
      }
      
      // 未完成的任务，显示逾期或剩余天数
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
    /**
     * 格式化日期字符串为 YYYY-MM-DD
     */
    formatDateString(dateStr) {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    /**
     * 获取任务状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'TODO': '待办',
        'IN_PROGRESS': '进行中',
        'PENDING_REVIEW': '待审核',
        'DONE': '已完成',
        'REJECTED': '已打回'
      }
      const statusUpper = String(status || '').trim().toUpperCase()
      return statusMap[statusUpper] || status || '待办'
    },
    /**
     * 获取任务状态样式类
     */
    getStatusClass(status) {
      const statusUpper = String(status || '').trim().toUpperCase()
      const classMap = {
        'TODO': 'status-todo',
        'IN_PROGRESS': 'status-in-progress',
        'PENDING_REVIEW': 'status-pending-review',
        'DONE': 'status-done',
        'REJECTED': 'status-rejected'
      }
      return classMap[statusUpper] || 'status-todo'
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
    },
    /**
     * 获取指定日期的所有任务
     */
    getTasksForDate(date) {
      if (!this.myTasks || this.myTasks.length === 0) {
        return []
      }
      
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      
      return this.myTasks.filter(task => {
        if (!task.dueDate) {
          return false
        }
        
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === targetDate.getTime()
      })
    },
    /**
     * 获取任务列表中的最高优先级
     * 优先级顺序：HIGH > MEDIUM > LOW
     */
    getHighestPriority(tasks) {
      if (!tasks || tasks.length === 0) {
        return null
      }
      
      const priorities = tasks.map(task => task.priority || 'MEDIUM')
      
      if (priorities.includes('HIGH')) {
        return 'HIGH'
      } else if (priorities.includes('MEDIUM')) {
        return 'MEDIUM'
      } else if (priorities.includes('LOW')) {
        return 'LOW'
      }
      
      return null
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
  align-self: flex-start; /* 顶部对齐，不拉伸 */
  overflow: visible; /* 允许悬浮窗溢出显示 */
  max-height: 100vh; /* 限制最大高度为视口高度 */
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

.calendar-widget {
  position: relative;
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
  user-select: none; /* 防止文本选择 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  z-index: 10; /* 提高层级，确保可点击 */
  pointer-events: auto; /* 确保可以接收点击事件 */
  flex-shrink: 0; /* 不收缩，保持固定高度 */
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

/* 任务徽章容器 */
.task-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
  flex-shrink: 0;
}

/* 任务状态徽章 */
.task-status-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 3px 8px;
  border-radius: var(--radius-md);
  white-space: nowrap;
}

.task-status-badge.status-todo {
  background: #e0e7ff;
  color: #4338ca;
}

.task-status-badge.status-in-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.task-status-badge.status-pending-review {
  background: #fef3c7;
  color: #d97706;
}

.task-status-badge.status-done {
  background: #d1fae5;
  color: #059669;
}

.task-status-badge.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

/* 优先级徽章 */
.task-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 3px 8px;
  border-radius: var(--radius-md);
  white-space: nowrap;
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
/* 日期区间任务悬浮弹窗 */
.date-task-popover {
  position: absolute;
  top: 50%;
  left: -276px; /* 260px 宽度 + 16px 间距 */
  transform: translateY(-50%);
  width: 260px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
  padding: var(--space-4);
  z-index: 20;
}

.date-task-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.date-task-popover-title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.date-task-popover-subtitle {
  margin: var(--space-1) 0 0 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.date-task-popover-close {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
}

.date-task-popover-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.date-task-popover-body {
  margin-top: var(--space-3);
  max-height: 140px;
  overflow-y: auto;
}

.date-task-empty {
  padding: var(--space-3);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.date-task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.date-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border-left: 3px solid;
  box-shadow: var(--shadow-sm);
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

/* 有任务的日期标记样式 */
.day.has-tasks {
  position: relative;
}

.day.has-tasks.priority-high {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  font-weight: var(--font-semibold);
  border: 2px solid #ef4444;
}

.day.has-tasks.priority-high:hover {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  transform: scale(1.1);
}

.day.has-tasks.priority-medium {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
  font-weight: var(--font-semibold);
  border: 2px solid #f59e0b;
}

.day.has-tasks.priority-medium:hover {
  background: linear-gradient(135deg, #fde68a, #fcd34d);
  transform: scale(1.1);
}

.day.has-tasks.priority-low {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
  font-weight: var(--font-semibold);
  border: 2px solid #10b981;
}

.day.has-tasks.priority-low:hover {
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
  transform: scale(1.1);
}

/* 如果日期是今天且有任务，优先级颜色优先于今天的样式 */
.day.today.has-tasks.priority-high {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  border: 2px solid #ef4444;
}

.day.today.has-tasks.priority-medium {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
  border: 2px solid #f59e0b;
}

.day.today.has-tasks.priority-low {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
  border: 2px solid #10b981;
}

/* 如果日期被选中且有任务，优先级颜色优先于选中样式 */
.day.selected.has-tasks.priority-high {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  border: 2px solid #ef4444;
}

.day.selected.has-tasks.priority-medium {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
  border: 2px solid #f59e0b;
}

.day.selected.has-tasks.priority-low {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
  border: 2px solid #10b981;
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

/* 暗色模式下的任务优先级标记 */
.dark-mode .right-sidebar .day.has-tasks.priority-high {
  background: linear-gradient(135deg, #7f1d1d, #991b1b) !important;
  color: #fca5a5 !important;
  border-color: #ef4444 !important;
}

.dark-mode .right-sidebar .day.has-tasks.priority-high:hover {
  background: linear-gradient(135deg, #991b1b, #b91c1c) !important;
}

.dark-mode .right-sidebar .day.has-tasks.priority-medium {
  background: linear-gradient(135deg, #78350f, #92400e) !important;
  color: #fcd34d !important;
  border-color: #f59e0b !important;
}

.dark-mode .right-sidebar .day.has-tasks.priority-medium:hover {
  background: linear-gradient(135deg, #92400e, #a16207) !important;
}

.dark-mode .right-sidebar .day.has-tasks.priority-low {
  background: linear-gradient(135deg, #064e3b, #065f46) !important;
  color: #6ee7b7 !important;
  border-color: #10b981 !important;
}

.dark-mode .right-sidebar .day.has-tasks.priority-low:hover {
  background: linear-gradient(135deg, #065f46, #047857) !important;
}

/* 暗色模式下今天且有任务的样式 */
.dark-mode .right-sidebar .day.today.has-tasks.priority-high {
  background: linear-gradient(135deg, #7f1d1d, #991b1b) !important;
  color: #fca5a5 !important;
  border-color: #ef4444 !important;
}

.dark-mode .right-sidebar .day.today.has-tasks.priority-medium {
  background: linear-gradient(135deg, #78350f, #92400e) !important;
  color: #fcd34d !important;
  border-color: #f59e0b !important;
}

.dark-mode .right-sidebar .day.today.has-tasks.priority-low {
  background: linear-gradient(135deg, #064e3b, #065f46) !important;
  color: #6ee7b7 !important;
  border-color: #10b981 !important;
}

/* 暗色模式下选中且有任务的样式 */
.dark-mode .right-sidebar .day.selected.has-tasks.priority-high {
  background: linear-gradient(135deg, #7f1d1d, #991b1b) !important;
  color: #fca5a5 !important;
  border-color: #ef4444 !important;
}

.dark-mode .right-sidebar .day.selected.has-tasks.priority-medium {
  background: linear-gradient(135deg, #78350f, #92400e) !important;
  color: #fcd34d !important;
  border-color: #f59e0b !important;
}

.dark-mode .right-sidebar .day.selected.has-tasks.priority-low {
  background: linear-gradient(135deg, #064e3b, #065f46) !important;
  color: #6ee7b7 !important;
  border-color: #10b981 !important;
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
