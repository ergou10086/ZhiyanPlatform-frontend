<template>
  <div class="contribution-heatmap-container">
    <div class="heatmap-header">
      <div class="header-left">
        <h3 class="heatmap-title">项目成果贡献热力图</h3>
        <div class="total-contributions" v-if="!loading && totalContributions > 0">
          <span class="total-count">{{ totalContributions }}</span>
          <span class="total-label">次贡献</span>
        </div>
      </div>
      <div class="view-toggle">
        <button 
          class="toggle-btn" 
          :class="{ active: viewMode === 'day' }"
          @click="viewMode = 'day'"
        >
          日视图
        </button>
        <button 
          class="toggle-btn" 
          :class="{ active: viewMode === 'week' }"
          @click="viewMode = 'week'"
        >
          周视图
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="heatmap-loading">
      <div class="skeleton-grid">
        <div 
          v-for="i in skeletonCount" 
          :key="i" 
          class="skeleton-cell"
        ></div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="!loading && contributions.length === 0" class="heatmap-empty">
      <p>暂无贡献数据</p>
    </div>

    <!-- 热力图内容 -->
    <div v-else class="heatmap-content">
      <div class="heatmap-wrapper">
        <!-- 星期标签（左侧）- 只在日视图显示 -->
        <div v-if="viewMode === 'day'" class="weekday-labels">
          <span 
            v-for="(label, index) in weekdayLabels" 
            :key="index"
            class="weekday-label"
          >
            {{ label }}
          </span>
        </div>

        <div class="heatmap-main">
          <!-- 月份标签（顶部）- 只在日视图显示 -->
          <div v-if="viewMode === 'day'" class="month-labels">
            <span 
              v-for="(label, index) in monthLabels" 
              :key="index"
              class="month-label"
              :style="{ width: label.width + 'px' }"
            >
              {{ label.text }}
            </span>
          </div>
          
          <!-- 周视图的季度标签 -->
          <div v-if="viewMode === 'week'" class="quarter-labels">
            <span 
              v-for="(label, index) in monthLabels" 
              :key="index"
              class="quarter-label"
              :style="{ width: label.width + 'px' }"
            >
              {{ label.text }}
            </span>
          </div>

          <!-- 热力图网格 -->
          <div class="heatmap-grid" :class="`view-${viewMode}`">
            <div 
              v-for="(cell, index) in gridCells" 
              :key="viewMode === 'week' ? cell.weekIndex : index"
              class="heatmap-cell"
              :class="getCellClass(cell)"
              :style="getCellStyle(cell)"
              @mouseenter="showTooltip($event, cell)"
              @mouseleave="hideTooltip"
            >
            </div>
          </div>
        </div>
      </div>

      <!-- Tooltip -->
      <div 
        v-if="tooltip.visible" 
        class="heatmap-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-content">
          <div class="tooltip-date">{{ tooltip.date }}</div>
          <div class="tooltip-count">贡献数：{{ tooltip.count }}</div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="heatmap-legend">
      <span class="legend-label">更少</span>
      <div class="legend-colors">
        <div 
          v-for="(color, index) in legendColors" 
          :key="index"
          class="legend-color"
          :style="{ backgroundColor: color }"
        ></div>
      </div>
      <span class="legend-label">更多</span>
    </div>
  </div>
</template>

<script>
import { knowledgeAPI } from '@/api/knowledge'

export default {
  name: 'AchievementContributionHeatmap',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    startDate: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      contributions: [],
      viewMode: 'day', // 默认日视图
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        date: '',
        count: 0
      },
      // 贡献量梯度颜色
      contributionColors: {
        0: '#ebedf0',    // 无贡献
        1: '#9be9a8',    // 低贡献 (1-3)
        2: '#40c463',    // 中贡献 (4-7)
        3: '#30a14e',    // 高贡献 (8-10)
        4: '#216e39'     // 极高贡献 (>10)
      },
      legendColors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
      weekdayLabels: ['日', '一', '二', '三', '四', '五', '六'],
      skeletonCount: 371 // 53周 * 7天 = 371个单元格
    }
  },
  computed: {
    totalContributions() {
      if (!this.contributions || this.contributions.length === 0) {
        return 0
      }
      return this.contributions.reduce((sum, item) => sum + (item.count || 0), 0)
    },
    monthLabels() {
      const labels = []
      const endDate = this.endDate ? new Date(this.endDate) : new Date()
      const startDate = this.startDate 
        ? new Date(this.startDate) 
        : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000)
      
      // 确保开始日期是周日
      const startDay = startDate.getDay()
      const adjustedStartDate = new Date(startDate)
      adjustedStartDate.setDate(adjustedStartDate.getDate() - startDay)
      
      // 确保结束日期是周六
      const endDay = endDate.getDay()
      const adjustedEndDate = new Date(endDate)
      if (endDay !== 6) {
        adjustedEndDate.setDate(adjustedEndDate.getDate() + (6 - endDay))
      }
      
      if (this.viewMode === 'day') {
        // 日视图：显示月份，按周计算每个月的宽度
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        const currentDate = new Date(adjustedStartDate)
        let currentMonth = currentDate.getMonth()
        let weekStartIndex = 0
        let weekIndex = 0
        
        // 遍历所有周
        while (currentDate <= adjustedEndDate) {
          const month = currentDate.getMonth()
          
          // 如果月份变化了，且是周的开始（周日）
          if (month !== currentMonth && currentDate.getDay() === 0) {
            if (weekIndex > weekStartIndex) {
              // 保存上一个月份
              labels.push({
                text: monthNames[currentMonth],
                width: (weekIndex - weekStartIndex) * 17 // 每周17px（14px格子 + 3px间距）
              })
            }
            currentMonth = month
            weekStartIndex = weekIndex
          }
          
          // 如果是周日，增加周索引
          if (currentDate.getDay() === 0) {
            weekIndex++
          }
          
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        // 添加最后一个月份
        if (weekIndex > weekStartIndex) {
          labels.push({
            text: monthNames[currentMonth],
            width: (weekIndex - weekStartIndex) * 17
          })
        }
      } else {
        // 周视图：显示季度，但需要根据实际的周数来计算
        const totalWeeks = Math.ceil((adjustedEndDate - adjustedStartDate) / (7 * 24 * 60 * 60 * 1000))
        const weeksPerQuarter = Math.ceil(totalWeeks / 4)
        for (let i = 0; i < 4; i++) {
          labels.push({
            text: `Q${i + 1}`,
            width: weeksPerQuarter * 17 // 14px格子 + 3px间距
          })
        }
      }
      
      return labels
    },
    gridCells() {
      if (this.contributions.length === 0) {
        return []
      }

      // 创建贡献数据映射
      const contributionMap = {}
      this.contributions.forEach(item => {
        contributionMap[item.date] = item.count || 0
      })

      // 生成日期范围（默认最近一年）
      const endDate = this.endDate ? new Date(this.endDate) : new Date()
      const startDate = this.startDate 
        ? new Date(this.startDate) 
        : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000)

      // 确保开始日期是周日（GitHub风格：从周日开始）
      const startDay = startDate.getDay()
      const adjustedStartDate = new Date(startDate)
      adjustedStartDate.setDate(adjustedStartDate.getDate() - startDay)

      // 确保结束日期是周六
      const endDay = endDate.getDay()
      const adjustedEndDate = new Date(endDate)
      if (endDay !== 6) {
        adjustedEndDate.setDate(adjustedEndDate.getDate() + (6 - endDay))
      }

      if (this.viewMode === 'day') {
        // 日视图：每个格子代表一天，7行（星期）× 53列（周）
        const cells = []
        const currentDate = new Date(adjustedStartDate)
        
        while (currentDate <= adjustedEndDate) {
          const dateStr = this.formatDate(currentDate)
          const count = contributionMap[dateStr] || 0
          const dayOfWeek = currentDate.getDay()
          
          cells.push({
            date: dateStr,
            count: count,
            dateObj: new Date(currentDate),
            dayOfWeek: dayOfWeek
          })
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        return cells
      } else {
        // 周视图：每个格子代表一周的总贡献，格子总数 = 周数
        // 将数据按周聚合
        const weekMap = {} // key: weekIndex, value: { totalCount: number, weekStartDate, weekEndDate }
        const currentDate = new Date(adjustedStartDate)
        let weekIndex = 0
        
        while (currentDate <= adjustedEndDate) {
          const dateStr = this.formatDate(currentDate)
          const count = contributionMap[dateStr] || 0
          const dayOfWeek = currentDate.getDay()
          
          // 如果是周日，开始新的一周
          if (dayOfWeek === 0) {
            weekIndex++
            weekMap[weekIndex] = {
              totalCount: 0,
              weekStartDate: dateStr,
              weekEndDate: dateStr
            }
          }
          
          if (weekMap[weekIndex]) {
            weekMap[weekIndex].totalCount += count
            // 更新周结束日期
            weekMap[weekIndex].weekEndDate = dateStr
          }
          
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        // 生成单元格：每个格子代表一周，总共只有周数那么多个格子
        const cells = []
        const weeks = Object.keys(weekMap).sort((a, b) => parseInt(a) - parseInt(b))
        
        weeks.forEach(weekKey => {
          const week = weekMap[weekKey]
          const weekDateRange = `${week.weekStartDate} - ${week.weekEndDate}`
          
          cells.push({
            date: weekDateRange,
            count: week.totalCount,
            weekIndex: parseInt(weekKey),
            isWeekView: true
          })
        })
        
        return cells
      }
    }
  },
  mounted() {
    this.loadContributions()
  },
  watch: {
    projectId() {
      this.loadContributions()
    },
    startDate() {
      this.loadContributions()
    },
    endDate() {
      this.loadContributions()
    }
  },
  methods: {
    async loadContributions() {
      if (!this.projectId) {
        this.loading = false
        return
      }

      this.loading = true
      try {
        const response = await knowledgeAPI.getContributions(
          this.projectId,
          this.startDate,
          this.endDate
        )
        
        if (response && response.code === 200 && response.data) {
          this.contributions = response.data
        } else {
          this.contributions = []
        }
      } catch (error) {
        console.error('加载贡献数据失败:', error)
        this.contributions = []
      } finally {
        this.loading = false
      }
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    getContributionLevel(count) {
      if (count === 0) return 0
      if (count >= 1 && count <= 3) return 1
      if (count >= 4 && count <= 7) return 2
      if (count >= 8 && count <= 10) return 3
      return 4
    },
    getCellClass(cell) {
      const level = this.getContributionLevel(cell.count)
      return `level-${level}`
    },
    getCellStyle(cell) {
      const level = this.getContributionLevel(cell.count)
      return {
        backgroundColor: this.contributionColors[level]
      }
    },
    showTooltip(event, cell) {
      const rect = event.target.getBoundingClientRect()
      let tooltipDate
      let tooltipCount = cell.count
      
      if (cell.isWeekView) {
        // 周视图：显示周的范围和总贡献数
        tooltipDate = cell.date
        tooltipCount = cell.count
      } else {
        // 日视图：显示具体日期和当天贡献数
        tooltipDate = this.formatTooltipDate(cell.date)
        tooltipCount = cell.count
      }
      
      this.tooltip = {
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 40,
        date: tooltipDate,
        count: tooltipCount
      }
    },
    formatTooltipDate(dateStr) {
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          return dateStr
        }
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const weekday = weekdays[date.getDay()]
        return `${dateStr} ${weekday}`
      } catch (e) {
        return dateStr
      }
    },
    hideTooltip() {
      this.tooltip.visible = false
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/AchievementContributionHeatmap.css';
</style>

