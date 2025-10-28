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
        <div v-if="urgentTasks.length > 0" class="alert-message urgent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="alert-text">
            <p class="alert-title">有 <strong>{{ urgentTasks.length }}</strong> 个任务即将截止</p>
            <p class="alert-subtitle">请在三天内完成</p>
          </div>
        </div>
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
export default {
  name: 'RightSidebar',
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null
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
      // 模拟任务数据，实际应用中应该从API获取
      const today = new Date()
      const threeDaysLater = new Date(today)
      threeDaysLater.setDate(today.getDate() + 3)
      
      // 返回三天内截止的任务
      // 这里使用模拟数据
      return [
        {
          title: '智能推荐系统优化',
          deadline: '2023-06-15'
        }
      ].filter(task => {
        const deadline = new Date(task.deadline)
        return deadline <= threeDaysLater && deadline >= today
      })
    }
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
