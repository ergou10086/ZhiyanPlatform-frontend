<template>
  <div class="project-operation-log-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">项目操作日志</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 筛选区域 -->
      <div class="filter-card">
        <div class="filter-header">
          <h3 class="filter-title">筛选条件</h3>
          <button class="btn-secondary" @click="resetFilters">重置</button>
        </div>
        <div class="filter-body">
          <div class="filter-row">
            <div class="filter-item">
              <label class="filter-label">日志类型</label>
              <select v-model="filters.logType" class="filter-select" @change="handleFilterChange">
                <option value="all">全部类型</option>
                <option value="project">项目操作</option>
                <option value="task">任务操作</option>
                <option value="wiki">Wiki操作</option>
                <option value="achievement">成果操作</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">操作人</label>
              <input 
                type="text" 
                v-model="filters.username" 
                placeholder="输入用户名"
                class="filter-input"
                @input="handleFilterChange"
              />
            </div>
          </div>
          <div class="filter-row">
            <div class="filter-item">
              <label class="filter-label">开始时间</label>
              <input 
                type="datetime-local" 
                v-model="filters.startTime" 
                class="filter-input"
                @change="handleFilterChange"
              />
            </div>
            <div class="filter-item">
              <label class="filter-label">结束时间</label>
              <input 
                type="datetime-local" 
                v-model="filters.endTime" 
                class="filter-input"
                @change="handleFilterChange"
              />
            </div>
            <div class="filter-item">
              <label class="filter-label">&nbsp;</label>
              <button class="btn-primary" @click="exportLogs" :disabled="isExporting">
                <svg v-if="!isExporting" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-if="isExporting">导出中...</span>
                <span v-else>导出Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 日志列表 -->
      <div class="log-list-card">
        <div class="log-list-header">
          <h3 class="log-list-title">操作日志列表</h3>
          <div class="log-list-info">
            <span class="log-count">共 {{ totalLogs }} 条记录</span>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="logs.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>暂无操作记录</p>
        </div>

        <!-- 日志列表 -->
        <div v-else class="log-timeline">
          <div 
            v-for="log in logs" 
            :key="log.id"
            class="timeline-item"
          >
            <div class="timeline-dot" :class="getLogTypeClass(log.source)"></div>
            <div class="timeline-content">
              <div class="log-header">
                <div class="log-header-left">
                  <span class="log-module" v-if="log.operationModule">{{ log.operationModule }}</span>
                  <span class="log-type">{{ getOperationTypeText(log.operationType) }}</span>
                </div>
                <span class="log-time">{{ formatDateTime(log.time) }}</span>
              </div>
              <p class="log-description">{{ log.description || log.title || '操作记录' }}</p>
              <div class="log-meta">
                <div class="log-operator" v-if="log.username">
                  <span class="operator-label">操作人：</span>
                  <span class="operator-name">{{ log.username }}</span>
                </div>
                <div class="log-source" v-if="log.source">
                  <span class="source-label">来源：</span>
                  <span class="source-name">{{ getSourceText(log.source) }}</span>
                </div>
                <div class="log-related" v-if="log.relatedId">
                  <span class="related-label">关联ID：</span>
                  <span class="related-value">{{ log.relatedId }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 0"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <span class="pagination-info">
            第 {{ currentPage + 1 }} / {{ totalPages }} 页
          </span>
          <button 
            class="pagination-btn" 
            :disabled="currentPage >= totalPages - 1"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getProjectAllLogs, 
  getProjectProjectLogs,
  getProjectTaskLogs,
  getProjectWikiLogs,
  getProjectAchievementLogs,
  exportProjectLogs 
} from '@/api/operationLog'

export default {
  name: 'ProjectOperationLog',
  data() {
    return {
      projectId: null,
      logs: [],
      isLoading: false,
      isExporting: false,
      currentPage: 0,
      pageSize: 20,
      totalLogs: 0,
      totalPages: 0,
      filters: {
        logType: 'all',
        username: '',
        startTime: '',
        endTime: ''
      }
    }
  },
  mounted() {
    this.projectId = this.$route.params.id
    if (!this.projectId) {
      this.$toast('项目ID无效')
      this.goBack()
      return
    }
    this.loadLogs()
  },
  methods: {
    async loadLogs() {
      this.isLoading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          username: this.filters.username || undefined,
          startTime: this.filters.startTime ? this.formatDateTimeForAPI(this.filters.startTime) : undefined,
          endTime: this.filters.endTime ? this.formatDateTimeForAPI(this.filters.endTime) : undefined
        }

        // 根据日志类型选择不同的API
        let response
        if (this.filters.logType === 'all') {
          response = await getProjectAllLogs(this.projectId, params)
        } else if (this.filters.logType === 'project') {
          response = await getProjectProjectLogs(this.projectId, params)
        } else if (this.filters.logType === 'task') {
          response = await getProjectTaskLogs(this.projectId, params)
        } else if (this.filters.logType === 'wiki') {
          response = await getProjectWikiLogs(this.projectId, params)
        } else if (this.filters.logType === 'achievement') {
          response = await getProjectAchievementLogs(this.projectId, params)
        } else {
          response = await getProjectAllLogs(this.projectId, params)
        }

        // 处理响应数据
        if (response && response.code === 200) {
          const data = response.data
          if (data) {
            this.logs = data.content || []
            this.totalLogs = data.totalElements || 0
            this.totalPages = data.totalPages || 0
          }
        } else if (response && response.content) {
          // 直接是Page对象
          this.logs = response.content || []
          this.totalLogs = response.totalElements || 0
          this.totalPages = response.totalPages || 0
        } else if (Array.isArray(response)) {
          this.logs = response
          this.totalLogs = response.length
          this.totalPages = Math.ceil(response.length / this.pageSize)
        } else {
          this.logs = []
          this.totalLogs = 0
          this.totalPages = 0
        }
      } catch (error) {
        console.error('加载操作日志失败:', error)
        this.$toast('加载操作日志失败')
        this.logs = []
        this.totalLogs = 0
        this.totalPages = 0
      } finally {
        this.isLoading = false
      }
    },
    handleFilterChange() {
      this.currentPage = 0
      this.loadLogs()
    },
    resetFilters() {
      this.filters = {
        logType: 'all',
        username: '',
        startTime: '',
        endTime: ''
      }
      this.currentPage = 0
      this.loadLogs()
    },
    changePage(page) {
      this.currentPage = page
      this.loadLogs()
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    async exportLogs() {
      this.isExporting = true
      try {
        const params = {
          username: this.filters.username || undefined,
          startTime: this.filters.startTime ? this.formatDateTimeForAPI(this.filters.startTime) : undefined,
          endTime: this.filters.endTime ? this.formatDateTimeForAPI(this.filters.endTime) : undefined
        }

        const blob = await exportProjectLogs(this.projectId, params)
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `项目操作日志_${this.projectId}_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$toast('导出成功')
      } catch (error) {
        console.error('导出操作日志失败:', error)
        this.$toast('导出失败，请稍后重试')
      } finally {
        this.isExporting = false
      }
    },
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    formatDateTimeForAPI(dateTimeStr) {
      if (!dateTimeStr) return ''
      // 将 datetime-local 格式转换为 API 需要的格式
      return dateTimeStr.replace('T', ' ')
    },
    getOperationTypeText(type) {
      if (!type) return '未知操作'
      
      // 如果已经是中文（包含中文字符），直接返回
      if (/[\u4e00-\u9fa5]/.test(type)) {
        return type
      }
      
      // 英文枚举名到中文的映射
      const typeMap = {
        // 通用操作
        'CREATE': '创建',
        'UPDATE': '更新',
        'DELETE': '删除',
        'STATUS_CHANGE': '状态变更',
        
        // 项目操作
        'MEMBER_ADD': '添加成员',
        'MEMBER_REMOVE': '移除成员',
        'ROLE_CHANGE': '角色变更',
        
        // 任务操作
        'ASSIGN': '分配任务',
        'SUBMIT': '提交任务',
        'REVIEW': '审核任务',
        'COMPLETE': '完成任务',
        
        // Wiki操作
        'MOVE': '移动Wiki页面',
        
        // 成果操作
        'UPDATE_STATUS': '更新成果状态',
        'UPDATE_DETAIL': '更新成果详情',
        'FILE_UPLOAD': '文件上传',
        'FILE_DELETE': '文件删除'
      }
      
      return typeMap[type] || type
    },
    getSourceText(source) {
      const sourceMap = {
        'PROJECT': '项目',
        'TASK': '任务',
        'WIKI': 'Wiki',
        'ACHIEVEMENT': '成果'
      }
      return sourceMap[source] || source || '未知来源'
    },
    getLogTypeClass(source) {
      const classMap = {
        'PROJECT': 'type-project',
        'TASK': 'type-task',
        'WIKI': 'type-wiki',
        'ACHIEVEMENT': 'type-achievement'
      }
      return classMap[source] || 'type-default'
    },
    goBack() {
      // 使用 go(-1) 返回到上一个历史记录页面，而不是 push 新页面
      // 这样可以避免在历史记录中重复添加页面，导致返回时出现死循环
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped src="@/assets/styles/ProjectOperationLog.css"></style>

