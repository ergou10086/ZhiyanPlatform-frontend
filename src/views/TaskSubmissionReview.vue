<template>
  <div class="task-review-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">任务提交审核</span>
      </div>
      <div class="header-right">
        <button class="btn btn-icon" @click="refreshList" title="刷新">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9C19.9828 7.56678 19.1209 6.28536 17.9845 5.27541C16.8482 4.26546 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7345 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">我的提交</div>
            <div class="stat-value">{{ myPendingCount }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">待我审核</div>
            <div class="stat-value">{{ pendingForReviewCount }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon approved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">已批准</div>
            <div class="stat-value">{{ approvedCount }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rejected">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">已拒绝</div>
            <div class="stat-value">{{ rejectedCount }}</div>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: activeTab === 'my-pending' }"
            @click="changeTab('my-pending')"
          >
            我的提交({{ myPendingCount }})
          </button> 
          <button 
            class="filter-tab" 
            :class="{ active: activeTab === 'pending-for-review' }"
            @click="changeTab('pending-for-review')"
          >
            待我审核 ({{ pendingForReviewCount }})
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeTab === 'all' }"
            @click="changeTab('all')"
          >
            全部
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="submissions.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3 v-if="activeTab === 'my-pending'">暂无我提交的待审核任务</h3>
        <h3 v-else-if="activeTab === 'pending-for-review'">暂无待我审核的提交</h3>
        <h3 v-else>暂无提交记录</h3>
        <p v-if="activeTab === 'my-pending'">您提交的所有任务都已审核完毕</p>
        <p v-else-if="activeTab === 'pending-for-review'">没有需要您审核的提交</p>
        <p v-else>您还没有提交过任何任务</p>
      </div>

      <!-- 提交列表 -->
      <div v-else class="submission-list">
        <div 
          v-for="submission in submissions" 
          :key="submission.id" 
          class="submission-card"
          @click="openReviewModal(submission)"
        >
          <div class="submission-header">
            <div class="submission-title">
              <h4>{{ submission.taskTitle }}</h4>
            </div>
            <span class="review-status" :class="'status-' + submission.reviewStatus">
              {{ getReviewStatusText(submission.reviewStatus) }}
            </span>
          </div>

          <div class="submission-meta">
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ getSubmitterName(submission) }}</span>
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ formatDateTime(submission.submissionTime) }}</span>
            </div>
          </div>

          <div class="submission-content">
            {{ submission.submissionContent }}
          </div>

          <div class="submission-footer">
            <div class="attachment-count" v-if="submission.attachmentUrls && submission.attachmentUrls.length > 0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.5916 21.9983 8.00001 21.9983C6.40841 21.9983 4.87582 21.3658 3.75001 20.24C2.62421 19.1142 1.9917 17.5816 1.9917 15.99C1.9917 14.3984 2.62421 12.8658 3.75001 11.74L12.94 2.55001C13.7008 1.78924 14.7289 1.35942 15.8 1.35942C16.8711 1.35942 17.8992 1.78924 18.66 2.55001C19.4208 3.31078 19.8506 4.33888 19.8506 5.41001C19.8506 6.48114 19.4208 7.50924 18.66 8.27001L9.46001 17.46C9.0796 17.8404 8.56558 18.0553 8.02751 18.0553C7.48944 18.0553 6.97543 17.8404 6.59501 17.46C6.2146 17.0796 5.99973 16.5656 5.99973 16.0275C5.99973 15.4894 6.2146 14.9754 6.59501 14.595L15.07 6.13001" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ submission.attachmentUrls.length }} 个附件</span>
            </div>
            <button 
              v-if="activeTab === 'pending-for-review' && isProjectManager(submission)" 
              class="btn-review"
              @click.stop="openReviewModal(submission)"
            >
              立即审核
            </button>
            <span 
              v-else-if="activeTab === 'my-pending' && submission.reviewStatus === 'PENDING'"
              class="waiting-badge"
            >
              等待审核中
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 0"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
        <button 
          class="page-btn" 
          :disabled="currentPage >= totalPages - 1"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 审核弹窗 -->
    <TaskSubmissionReviewModal
      :visible.sync="reviewModalVisible"
      :submission="selectedSubmission || {}"
      :active-tab="activeTab"
      @close="closeReviewModal"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script>
import TaskSubmissionReviewModal from '@/components/TaskSubmissionReviewModal.vue'
import { 
  getMyPendingSubmissions, 
  getPendingSubmissionsForReview, 
  getMySubmissions,
  countMyPendingSubmissions,
  countPendingSubmissionsForReview
} from '@/api/taskSubmission'

export default {
  name: 'TaskSubmissionReview',
  components: {
    TaskSubmissionReviewModal
  },
  data() {
    return {
      activeTab: 'my-pending', // 默认显示"我提交的待审核"
      isLoading: false,
      submissions: [],
      selectedSubmission: null,
      reviewModalVisible: false,
      
      // 分页
      currentPage: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      
      // 统计
      myPendingCount: 0, // 我提交的待审核数量
      pendingForReviewCount: 0, // 待我审核的数量
      approvedCount: 0,
      rejectedCount: 0
    }
  },
  mounted() {
    this.loadSubmissions()
    this.loadStatistics()
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },

    async loadSubmissions() {
      this.isLoading = true
      
      try {
        let response
        if (this.activeTab === 'my-pending') {
          // 我提交的待审核任务
          response = await getMyPendingSubmissions({
            page: this.currentPage,
            size: this.pageSize
          })
        } else if (this.activeTab === 'pending-for-review') {
          // 待我审核的提交
          response = await getPendingSubmissionsForReview({
            page: this.currentPage,
            size: this.pageSize
          })
        } else {
          // 全部（我的所有提交历史）
          response = await getMySubmissions({
            page: this.currentPage,
            size: this.pageSize
          })
        }

        if (response.code === 200) {
          const pageData = response.data
          const rawSubmissions = pageData.content || []
          
          // 调试：打印原始数据
          console.log('原始提交数据:', rawSubmissions)
          if (rawSubmissions.length > 0) {
            console.log('第一个提交的完整结构:', JSON.stringify(rawSubmissions[0], null, 2))
          }
          
          // 处理提交数据，确保提交人信息正确映射
          this.submissions = rawSubmissions.map(submission => {
            // 尝试多种可能的字段名来获取提交人信息
            let submitterName = null
            
            // 情况1: submitter对象（优先检查 name 字段，因为后端返回的是 name）
            if (submission.submitter) {
              submitterName = submission.submitter.name || 
                             submission.submitter.username || 
                             submission.submitter.userName ||
                             submission.submitter.nickname
            }
            
            // 情况2: 直接字段
            if (!submitterName) {
              submitterName = submission.submitterName || 
                             submission.submitter_name ||
                             submission.submitterUsername ||
                             submission.submitter_username
            }
            
            // 如果找到了提交人名称，确保submitter对象有username字段（用于兼容显示）
            if (submitterName && submission.submitter) {
              return {
                ...submission,
                submitter: {
                  ...submission.submitter,
                  // 确保有username字段用于显示（从name复制）
                  username: submission.submitter.name || submitterName,
                  userName: submission.submitter.name || submitterName
                }
              }
            }
            
            return submission
          })
          
          this.totalElements = pageData.totalElements || 0
          this.totalPages = pageData.totalPages || 0
        } else {
          alert(response.msg || '加载失败')
        }
      } catch (error) {
        console.error('加载提交列表失败', error)
        const errorMsg = error?.msg || error?.message || (typeof error === 'string' ? error : '未知错误')
        alert('加载失败：' + errorMsg)
      } finally {
        this.isLoading = false
      }
    },

    async loadStatistics() {
      // 加载统计数据
      try {
        // 获取我提交的待审核数量
        const myPendingResponse = await countMyPendingSubmissions()
        if (myPendingResponse.code === 200) {
          this.myPendingCount = myPendingResponse.data || 0
        }

        // 获取待我审核的数量
        const pendingForReviewResponse = await countPendingSubmissionsForReview()
        if (pendingForReviewResponse.code === 200) {
          this.pendingForReviewCount = pendingForReviewResponse.data || 0
        }

        // 获取所有提交来统计已批准和已拒绝的数量
        const allResponse = await getMySubmissions({ page: 0, size: 1000 })
        if (allResponse.code === 200) {
          const allSubmissions = allResponse.data.content || []
          
          // 统计已批准和已拒绝的数量
          this.approvedCount = allSubmissions.filter(s => s.reviewStatus === 'APPROVED').length
          this.rejectedCount = allSubmissions.filter(s => s.reviewStatus === 'REJECTED').length
          
          // 如果总数超过1000，需要获取更多数据来准确统计
          const totalElements = allResponse.data.totalElements || 0
          if (totalElements > 1000) {
            // 获取所有页的数据来准确统计
            const allPages = Math.ceil(totalElements / 1000)
            let approvedCount = this.approvedCount
            let rejectedCount = this.rejectedCount
            
            for (let page = 1; page < allPages; page++) {
              try {
                const pageResponse = await getMySubmissions({ page, size: 1000 })
                if (pageResponse.code === 200) {
                  const pageSubmissions = pageResponse.data.content || []
                  approvedCount += pageSubmissions.filter(s => s.reviewStatus === 'APPROVED').length
                  rejectedCount += pageSubmissions.filter(s => s.reviewStatus === 'REJECTED').length
                }
              } catch (error) {
                console.error(`加载第${page + 1}页统计失败`, error)
              }
            }
            
            this.approvedCount = approvedCount
            this.rejectedCount = rejectedCount
          }
        }
      } catch (error) {
        console.error('加载统计失败', error)
      }
    },

    refreshList() {
      this.loadSubmissions()
      this.loadStatistics()
      alert('已刷新')
    },

    changeTab(tab) {
      this.activeTab = tab
      this.currentPage = 0
      this.loadSubmissions()
    },

    changePage(page) {
      this.currentPage = page
      this.loadSubmissions()
    },

    openReviewModal(submission) {
      if (submission.reviewStatus !== 'PENDING') {
        alert('该提交已审核')
        return
      }
      this.selectedSubmission = submission
      this.reviewModalVisible = true
    },

    closeReviewModal() {
      this.reviewModalVisible = false
      this.selectedSubmission = null
    },

    handleReviewSuccess() {
      this.loadSubmissions()
      this.loadStatistics()
    },

    getSubmissionTypeText(type) {
      const typeMap = {
        'COMPLETE': '完成提交',
        'PARTIAL': '阶段性提交',
        'MILESTONE': '里程碑提交'
      }
      return typeMap[type] || type
    },

    getReviewStatusText(status) {
      const statusMap = {
        'PENDING': '待审核',
        'APPROVED': '已批准',
        'REJECTED': '已拒绝',
        'REVOKED': '已撤回'
      }
      return statusMap[status] || status
    },

    formatDateTime(datetime) {
      if (!datetime) return '-'
      const date = new Date(datetime)
      const now = new Date()
      const diff = now - date
      
      // 1小时内
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000)
        return minutes < 1 ? '刚刚' : `${minutes}分钟前`
      }
      
      // 24小时内
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000)
        return `${hours}小时前`
      }
      
      // 7天内
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000)
        return `${days}天前`
      }
      
      // 超过7天显示完整日期
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    /**
     * 检查当前用户是否可以审核该提交（只有任务创建者可以审核）
     * @param {Object} submission - 提交数据
     * @returns {Boolean}
     */
    isProjectManager(submission) {
      if (!submission) return false
      
      // 只有待审核状态的提交才能审核
      if (submission.reviewStatus !== 'PENDING') {
        return false
      }
      
      // 获取当前用户ID
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return false
      
      // 检查任务创建者ID（任务创建者可以审核）
      const taskCreatorId = submission.taskCreatorId
      
      if (!taskCreatorId) {
        // 如果没有任务创建者信息，返回false（安全起见）
        return false
      }
      
      // 比较当前用户ID和任务创建者ID
      return String(taskCreatorId).trim() === String(currentUserId).trim()
    },

    /**
     * 获取当前用户ID
     * @returns {String}
     */
    getCurrentUserId() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
        return userInfo.id || userInfo.userId || userInfo.user_id || null
      } catch (error) {
        console.error('获取当前用户信息失败:', error)
        return null
      }
    },
    
    /**
     * 获取提交人名称（兼容多种数据结构）
     * @param {Object} submission - 提交数据
     * @returns {String} 提交人名称
     */
    getSubmitterName(submission) {
      if (!submission) return '未知'
      
      // 优先检查 submitter.name（后端实际返回的字段）
      if (submission.submitter) {
        const name = submission.submitter.name || 
                     submission.submitter.username || 
                     submission.submitter.userName ||
                     submission.submitter.nickname
        if (name && name !== '未知用户' && String(name).trim() !== '') {
          return name
        }
      }
      
      // 尝试直接字段
      const directFields = [
        submission.submitterName,
        submission.submitter_name,
        submission.submitterUsername,
        submission.submitter_username
      ]
      
      for (const name of directFields) {
        if (name && name !== '未知用户' && String(name).trim() !== '') {
          return name
        }
      }
      
      return '未知'
    }
  }
}
</script>

<style scoped>
.task-review-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
  transition: all 0.2s;
  border-radius: 4px;
}

.back-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.stat-icon.approved {
  background-color: #e8f5e9;
  color: #4CAF50;
}

.stat-icon.rejected {
  background-color: #ffebee;
  color: #f44336;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 20px;
  border: none;
  background: none;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.filter-tab:hover {
  background-color: #f5f5f5;
}

.filter-tab.active {
  background-color: #2196F3;
  color: white;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.empty-state p {
  color: #999;
  font-size: 14px;
}

.submission-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.submission-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.submission-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.submission-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.submission-type {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-COMPLETE {
  background-color: #e3f2fd;
  color: #1976d2;
}

.type-PARTIAL {
  background-color: #fff3e0;
  color: #f57c00;
}

.type-MILESTONE {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.review-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.status-PENDING {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-APPROVED {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-REJECTED {
  background-color: #ffebee;
  color: #c62828;
}

.status-REVOKED {
  background-color: #f5f5f5;
  color: #666;
}

.submission-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.meta-item svg {
  flex-shrink: 0;
}

.final-badge {
  color: #f57c00;
  font-weight: 500;
}

.submission-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.submission-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.attachment-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #2196F3;
  font-size: 14px;
}

.btn-review {
  padding: 8px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-review:hover {
  background-color: #1976D2;
}

.waiting-badge {
  padding: 8px 20px;
  background-color: #fff3e0;
  color: #f57c00;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #2196F3;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}
</style>

