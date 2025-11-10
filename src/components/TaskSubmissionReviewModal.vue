<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-content submission-review-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">审核任务提交</h3>
        <button class="modal-close" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- 如果没有提交，显示提示 -->
        <div v-if="!hasSubmission" class="no-submission-message">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="no-submission-text">暂无提交</p>
          <p class="no-submission-desc">该任务目前还没有提交记录</p>
        </div>

        <!-- 如果有提交，显示提交内容 -->
        <template v-else>
          <!-- 任务信息 -->
          <div class="task-info-section">
            <h4 class="section-title">任务信息</h4>
            <div class="task-info-card">
              <div class="info-item">
                <span class="info-label">任务标题：</span>
                <span class="info-value">{{ submission.taskTitle }}</span>
              </div>
              <div class="info-item" v-if="submission.projectName">
                <span class="info-label">所属项目：</span>
                <span class="info-value">{{ submission.projectName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">提交人：</span>
                <span class="info-value">{{ getSubmitterName(submission) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">提交时间：</span>
                <span class="info-value">{{ formatDateTime(submission.submissionTime) }}</span>
              </div>
              <div class="info-item" v-if="submission.actualWorktime">
                <span class="info-label">实际工时：</span>
                <span class="info-value">{{ submission.actualWorktime }} 小时</span>
              </div>
            </div>
          </div>

          <!-- 提交说明 -->
          <div class="form-group">
            <label class="form-label">提交说明</label>
            <div class="submission-content-box">
              {{ submission.submissionContent || '无' }}
            </div>
          </div>

          <!-- 附件列表 -->
          <div class="form-group" v-if="submission.attachmentUrls && submission.attachmentUrls.length > 0">
            <label class="form-label">附件 ({{ submission.attachmentUrls.length }})</label>
            <div class="attachment-list">
              <div v-for="(url, index) in submission.attachmentUrls" :key="index" class="attachment-item">
                <div class="attachment-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="attachment-info">
                  <div class="attachment-name">{{ getFileNameFromUrl(url) }}</div>
                </div>
                <button class="attachment-download" @click="downloadAttachment(url)" title="下载">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 审核意见（仅在待我审核时显示） -->
          <div class="form-group" v-if="!shouldHideReview">
            <label class="form-label">审核意见 <span class="label-optional">(选填)</span></label>
            <textarea
              v-model="reviewData.reviewComment"
              class="form-textarea"
              rows="4"
              placeholder="请填写审核意见，拒绝时建议说明原因..."
              maxlength="2000"
            ></textarea>
            <div class="char-count">{{ reviewData.reviewComment.length }} / 2000</div>
          </div>

          <!-- 审核结果选择（仅在待我审核时显示） -->
          <div class="form-group" v-if="!shouldHideReview">
            <label class="form-label required">审核结果</label>
            <div class="review-options">
              <label class="review-option approve" :class="{ selected: reviewData.reviewStatus === 'APPROVED' }">
                <input type="radio" v-model="reviewData.reviewStatus" value="APPROVED" />
                <div class="option-content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="option-title">批准通过</span>
                  <span class="option-desc">同意此次提交</span>
                </div>
              </label>

              <label class="review-option reject" :class="{ selected: reviewData.reviewStatus === 'REJECTED' }">
                <input type="radio" v-model="reviewData.reviewStatus" value="REJECTED" />
                <div class="option-content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="option-title">拒绝退回</span>
                  <span class="option-desc">不通过此次提交</span>
                </div>
              </label>
            </div>
          </div>

        </template>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn btn-secondary">关闭</button>
        <button 
          v-if="hasSubmission && !shouldHideReview"
          @click="handleSubmitReview" 
          class="btn"
          :class="reviewData.reviewStatus === 'APPROVED' ? 'btn-success' : 'btn-danger'"
          :disabled="!reviewData.reviewStatus || isSubmitting"
        >
          <span v-if="!isSubmitting">{{ reviewData.reviewStatus === 'APPROVED' ? '批准通过' : '拒绝退回' }}</span>
          <span v-else>提交中...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { reviewSubmission, getDownloadUrl } from '@/api/taskSubmission'

export default {
  name: 'TaskSubmissionReviewModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    submission: {
      type: Object,
      required: true
    },
    activeTab: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      reviewData: {
        reviewStatus: '',
        reviewComment: ''
      },
      isSubmitting: false
    }
  },
  computed: {
    hasSubmission() {
      return this.submission && this.submission.id
    },
    // 判断是否应该隐藏审核功能
    // 只有在"我的提交"标签页且是当前用户自己的提交时，才隐藏审核功能
    shouldHideReview() {
      // 如果是在"待我审核"标签页，始终显示审核功能
      if (this.activeTab === 'pending-for-review') {
        return false
      }
      // 如果是在"我的提交"标签页，且是当前用户自己的提交，则隐藏审核功能
      if (this.activeTab === 'my-pending') {
        if (!this.submission || !this.submission.submitterId) {
          return false
        }
        const currentUserId = this.getCurrentUserId()
        if (!currentUserId) {
          return false
        }
        // 比较提交人ID和当前用户ID
        return String(this.submission.submitterId).trim() === String(currentUserId).trim()
      }
      // 其他情况（如"全部"标签页），如果是自己的提交也隐藏审核功能
      if (!this.submission || !this.submission.submitterId) {
        return false
      }
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) {
        return false
      }
      return String(this.submission.submitterId).trim() === String(currentUserId).trim()
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetForm()
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    resetForm() {
      this.reviewData = {
        reviewStatus: '',
        reviewComment: ''
      }
    },

    getSubmissionTypeText(type) {
      const typeMap = {
        'COMPLETE': '完成提交',
        'PARTIAL': '阶段性提交',
        'MILESTONE': '里程碑提交'
      }
      return typeMap[type] || type
    },

    formatDateTime(datetime) {
      if (!datetime) return '-'
      const date = new Date(datetime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getFileNameFromUrl(url) {
      if (!url) return '未知文件'
      const parts = url.split('/')
      return decodeURIComponent(parts[parts.length - 1])
    },

    downloadAttachment(url) {
      try {
        const fileName = this.getFileNameFromUrl(url)
        console.log('📄 [下载附件] 开始下载:', fileName)
        console.log('📄 [下载附件] 原始URL:', url)
        
        // 使用后端代理下载接口（避免CORS问题）
        const downloadUrl = getDownloadUrl(url)
        console.log('📄 [下载附件] 下载URL:', downloadUrl)
        
        // 使用triggerDownload方法
        this.triggerDownload(downloadUrl, fileName)
        
        console.log('✅ [下载附件] 下载成功:', fileName)
        
      } catch (error) {
        console.error('❌ [下载附件] 下载失败:', error)
        this.$message.error(error.message || '下载文件失败，请重试')
      }
    },
    
    triggerDownload(url, filename) {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'  // 在新标签页打开，避免导航
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      
      // 延迟移除元素，确保下载已触发
      setTimeout(() => {
        document.body.removeChild(a)
      }, 100)
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
    },

    async handleSubmitReview() {
      if (!this.reviewData.reviewStatus) {
        alert('请选择审核结果')
        return
      }

      this.isSubmitting = true

      try {
        const response = await reviewSubmission(this.submission.id, this.reviewData)

        if (response.code === 200) {
          const statusText = this.reviewData.reviewStatus === 'APPROVED' ? '批准' : '拒绝'
          alert(`审核${statusText}成功`)
          this.$emit('success', response.data)
          this.handleClose()
        } else {
          alert(response.msg || '审核失败')
        }
      } catch (error) {
        console.error('审核失败', error)
        const errorMsg = error?.msg || error?.message || (typeof error === 'string' ? error : '未知错误')
        alert('审核失败：' + errorMsg)
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  transition: all 0.2s;
  border-radius: 4px;
}

.modal-close:hover {
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.task-info-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.task-info-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
}

.info-value {
  color: #333;
  flex: 1;
}

.submission-type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
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

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge-info {
  background-color: #e3f2fd;
  color: #1976d2;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-label.required::before {
  content: '*';
  color: #f44336;
  margin-right: 4px;
}

.label-optional {
  font-weight: normal;
  color: #999;
  font-size: 12px;
}

.submission-content-box {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.attachment-item:hover {
  background-color: #e9ecef;
}

.attachment-icon {
  color: #2196F3;
  margin-right: 12px;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  color: #333;
  word-break: break-all;
}

.attachment-download {
  background: none;
  border: none;
  color: #2196F3;
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s;
  border-radius: 4px;
}

.attachment-download:hover {
  background-color: #e3f2fd;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.review-options {
  display: flex;
  gap: 16px;
}

.review-option {
  flex: 1;
  display: flex;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.review-option input[type="radio"] {
  margin-right: 12px;
  margin-top: 4px;
}

.review-option.approve:hover,
.review-option.approve.selected {
  border-color: #4CAF50;
  background-color: #f1f8f4;
}

.review-option.reject:hover,
.review-option.reject.selected {
  border-color: #f44336;
  background-color: #ffebee;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.review-option.approve .option-content svg {
  color: #4CAF50;
}

.review-option.reject .option-content svg {
  color: #f44336;
}

.option-title {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}

.option-desc {
  font-size: 13px;
  color: #666;
}

.review-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff8e1;
  border: 1px solid #ffeb3b;
  border-radius: 6px;
  color: #f57f17;
  font-size: 14px;
}

.review-warning svg {
  flex-shrink: 0;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-success {
  background-color: #4CAF50;
  color: white;
}

.btn-success:hover {
  background-color: #45a049;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #da190b;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.no-submission-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.no-submission-message svg {
  color: #999;
  margin-bottom: 20px;
}

.no-submission-text {
  font-size: 18px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 0;
}

.no-submission-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}
</style>

