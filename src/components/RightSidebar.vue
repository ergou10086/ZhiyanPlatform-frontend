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

    <!-- 本周统计 -->
    <div class="stats-widget">
      <h3 class="widget-title">本周统计</h3>
      <div class="stats-content">
        <div class="stat-item">
          <div class="stat-header">
            <span class="stat-label">完成任务</span>
            <span class="stat-value">18/25</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill completed" style="width: 72%"></div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-header">
            <span class="stat-label">工时记录</span>
            <span class="stat-value">32/40h</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill work-hours" style="width: 80%"></div>
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
  gap: 20px;
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.calendar-header {
  margin-bottom: 16px;
}

.calendar-widget,
.stats-widget {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.widget-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}


.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-year {
  font-weight: 600;
  color: #333;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.nav-btn:hover {
  background-color: #f8f9fa;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
  text-align: center;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.day:hover {
  background-color: #f8f9fa;
}

.day.current-month {
  color: #333;
  font-weight: 500;
}

.day.today {
  background-color: #007bff;
  color: white;
  font-weight: 600;
}

.day.selected {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
}

.day:not(.current-month) {
  color: #ccc;
}

.day.current-month:hover {
  background-color: #f8f9fa;
}

.day.today:hover {
  background-color: #0056b3;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.completed {
  background: #28a745;
}

.progress-fill.work-hours {
  background: #007bff;
}

@media (max-width: 1200px) {
  .right-sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .calendar-widget,
  .stats-widget {
    padding: 16px;
  }
  
  .widget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .edit-btn {
    align-self: flex-end;
  }
}
</style>
