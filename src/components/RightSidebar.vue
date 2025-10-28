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
    <div class="task-alert-widget" :class="{ 'urgent': upcomingTasks.length > 0 }">
      <h3 class="widget-title">任务提醒</h3>
      
      <!-- 加载状态 -->
      <div v-if="tasksLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>

      <!-- 任务内容 -->
      <div v-else class="task-alert-content">
        <!-- 有即将到期的任务 -->
        <div v-if="upcomingTasks.length > 0" class="alert-message urgent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="alert-text">
            <p class="alert-title">有 <strong>{{ upcomingTasks.length }}</strong> 个任务即将截止</p>
            <p class="alert-subtitle">请及时完成</p>
          </div>
        </div>

        <!-- 没有即将到期的任务 -->
        <div v-else class="alert-message safe">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="alert-text">
            <p class="alert-title">很棒！</p>
            <p class="alert-subtitle">没有即将截止的任务</p>
          </div>
        </div>

        <!-- 任务列表 -->
        <div v-if="upcomingTasks.length > 0" class="task-list">
          <div 
            v-for="task in upcomingTasks.slice(0, 3)" 
            :key="task.id"
            class="task-item"
            @click="goToTaskDetail(task)"
          >
            <div class="task-info">
              <p class="task-title">{{ task.title }}</p>
              <p class="task-project">{{ task.projectName }}</p>
            </div>
            <div class="task-deadline" :class="{ 'overdue': task.isOverdue }">
              {{ formatDate(task.dueDate) }}
            </div>
          </div>
          
          <!-- 查看更多 -->
          <div v-if="upcomingTasks.length > 3" class="view-more" @click="viewAllTasks">
            查看全部 {{ upcomingTasks.length }} 个任务 →
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
      upcomingTasks: [],
      tasksLoading: false,
      tasksError: null
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
    }
  },
  mounted() {
    // 组件加载时获取任务
    this.loadUpcomingTasks()
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

    /**
     * 加载即将到期的任务
     */
    async loadUpcomingTasks() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('[RightSidebar] 用户未登录，跳过加载任务')
        return
      }

      this.tasksLoading = true
      this.tasksError = null

      try {
        // 获取7天内即将到期的任务（只显示前5个）
        const response = await taskAPI.getMyUpcomingTasks(7, 0, 5)
        
        if (response.code === 200 && response.data) {
          this.upcomingTasks = response.data.content || []
          console.log('[RightSidebar] 成功加载任务:', this.upcomingTasks.length, '个')
        } else {
          console.error('[RightSidebar] 加载任务失败:', response.msg)
          this.tasksError = response.msg || '加载失败'
        }
      } catch (error) {
        console.error('[RightSidebar] 加载任务异常:', error)
        // 如果是401错误（未登录），清空任务列表但不显示错误
        if (error.response && error.response.status === 401) {
          this.upcomingTasks = []
          this.tasksError = null
        } else {
          this.tasksError = '网络错误'
        }
      } finally {
        this.tasksLoading = false
      }
    },

    /**
     * 格式化日期显示
     */
    formatDate(dateString) {
      if (!dateString) return '未设置'
      
      const date = new Date(dateString)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      const diffTime = taskDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return `逾期${Math.abs(diffDays)}天`
      } else if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '明天'
      } else if (diffDays <= 7) {
        return `${diffDays}天后`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    },

    /**
     * 跳转到任务详情
     */
    goToTaskDetail(task) {
      if (task && task.projectId) {
        this.$router.push({
          path: `/project/${task.projectId}`,
          query: { taskId: task.id }
        })
      }
    },

    /**
     * 查看全部任务
     */
    viewAllTasks() {
      // 可以跳转到一个任务列表页面，或者打开一个模态框
      this.$router.push('/tasks')
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
}

.alert-message.urgent {
  background: var(--error-light);
}

.alert-message.safe {
  background: var(--primary-light);
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

/* 任务列表样式 */
.task-list {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.task-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-project {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-deadline {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--warning-color);
  background: var(--warning-light);
  padding: 2px 8px;
  border-radius: var(--radius-md);
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: var(--space-2);
}

.task-deadline.overdue {
  color: var(--error-color);
  background: var(--error-light);
}

.view-more {
  text-align: center;
  padding: var(--space-2);
  font-size: var(--text-sm);
  color: var(--primary-color);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-weight: var(--font-medium);
}

.view-more:hover {
  background: var(--primary-light);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--space-2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
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
  .calendar-widget,
  .stats-widget {
    padding: var(--space-4);
  }

  .widget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .edit-btn {
    align-self: flex-end;
  }
}
</style>
