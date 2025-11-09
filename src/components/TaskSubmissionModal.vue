<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-content task-submission-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">提交任务</h3>
        <button class="modal-close" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- 任务信息 -->
        <div class="task-info-section">
          <h4 class="section-title">任务信息</h4>
          <div class="task-info-card">
            <div class="info-item">
              <span class="info-label">任务标题：</span>
              <span class="info-value">{{ task.title }}</span>
            </div>
            <div class="info-item" v-if="task.description">
              <span class="info-label">任务描述：</span>
              <span class="info-value">{{ task.description }}</span>
            </div>
          </div>
        </div>

        <!-- 提交说明 -->
        <div class="form-group">
          <label class="form-label required">提交说明 <span class="label-tip">(至少10字)</span></label>
          <textarea
            v-model="formData.submissionContent"
            class="form-textarea"
            rows="6"
            placeholder="请详细描述任务完成情况，包括完成的工作内容、遇到的问题及解决方案等..."
            maxlength="5000"
          ></textarea>
          <div class="char-count">{{ formData.submissionContent.length }} / 5000</div>
        </div>

        <!-- 附件上传 -->
        <div class="form-group">
          <label class="form-label">附件 <span class="label-tip">(选填，支持文档、图片、压缩包等)</span></label>
          <div class="upload-area">
            <input
              ref="fileInput"
              type="file"
              multiple
              @change="handleFileSelect"
              style="display: none"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.mp4,.avi"
            />
            
            <!-- 文件列表 - 显示在上传区域上方 -->
            <div v-if="uploadedFiles.length > 0" class="file-list">
              <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item-new">
                <div class="file-icon-wrapper" :class="getFileTypeClass(file.filename)">
                  <div class="file-icon-inner" v-html="getFileIcon(file.filename)"></div>
                </div>
                <div class="file-content">
                  <div class="file-header">
                    <span class="file-name-new" :title="file.filename">{{ file.filename }}</span>
                    <button class="file-remove-new" @click="removeFile(index)" title="删除">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div class="file-footer">
                    <span class="file-type-tag">{{ getFileTypeName(file.filename) }}</span>
                    <span class="file-size-new">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="upload-trigger" @click="triggerFileUpload">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 3V15" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p class="upload-text">点击上传附件</p>
              <p class="upload-hint">支持多个文件，单个文件不超过100MB</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn btn-secondary">取消</button>
        <button @click="handleSubmit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="!isSubmitting">提交任务</span>
          <span v-else>提交中...</span>
        </button>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="showToast" class="toast-message">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { submitTask, uploadSubmissionFile } from '@/api/taskSubmission'

export default {
  name: 'TaskSubmissionModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formData: {
        submissionContent: '',
        attachmentUrls: []
      },
      uploadedFiles: [],
      isSubmitting: false,
      showToast: false,
      toastMessage: ''
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
      this.formData = {
        submissionContent: '',
        attachmentUrls: []
      }
      this.uploadedFiles = []
    },

    triggerFileUpload() {
      this.$refs.fileInput.click()
    },

    async handleFileSelect(event) {
      const files = Array.from(event.target.files)
      
      if (files.length === 0) return

      // 上传文件
      for (const file of files) {
        // 检查文件大小（100MB限制）
        if (file.size > 100 * 1024 * 1024) {
          this.showErrorToast(`文件 ${file.name} 超过100MB限制，已跳过`)
          continue
        }

        try {
          console.log('开始上传文件:', file.name)
          const response = await uploadSubmissionFile(file)
          console.log('上传响应:', response)
          
          if (response && response.code === 200 && response.data) {
            this.uploadedFiles.push({
              filename: response.data.filename || file.name,
              url: response.data.url,
              size: file.size
            })
            this.formData.attachmentUrls.push(response.data.url)
            this.showSuccessToast(`文件 ${file.name} 上传成功`)
          } else {
            const errorMsg = (response && response.msg) || '上传失败'
            console.error('上传失败，响应:', response)
            this.showErrorToast(`文件 ${file.name} 上传失败：${errorMsg}`)
          }
        } catch (error) {
          console.error('文件上传异常 - 完整错误对象:', error)
          console.error('错误对象类型:', typeof error)
          console.error('错误对象键:', error ? Object.keys(error) : 'error is null/undefined')
          
          // 更安全的错误提取
          // API响应拦截器已经处理过，error 可能是：
          // 1. 后端的R对象 {code, msg, data} - 最常见
          // 2. Error对象 {message}
          // 3. 字符串
          // 4. 原始的axios error {response: {data}} - 较少见
          let errorMsg = '网络错误或服务器异常'
          
          try {
            if (error) {
              // 优先级1: 后端的R对象（最常见的情况）
              if (error.msg && typeof error.msg === 'string') {
                errorMsg = error.msg
              }
              // 优先级2: Error对象的message
              else if (error.message && typeof error.message === 'string') {
                errorMsg = error.message
              }
              // 优先级3: 字符串
              else if (typeof error === 'string') {
                errorMsg = error
              }
              // 优先级4: 原始的axios error（较少见，但保留兼容性）
              else if (error.response && error.response.data) {
                const data = error.response.data
                errorMsg = data.msg || data.message || data.error || errorMsg
                console.error('服务器返回的错误:', data)
              }
              // 优先级5: 其他对象类型，尝试提取有用信息
              else if (typeof error === 'object') {
                errorMsg = error.error || JSON.stringify(error)
              }
            }
          } catch (parseError) {
            console.error('解析错误信息失败:', parseError)
            errorMsg = '文件上传失败，请稍后重试'
          }
          
          console.error('最终错误消息:', errorMsg)
          this.showErrorToast(`文件 ${file.name} 上传失败：${errorMsg}`)
        }
      }

      // 清空input，允许重复选择同一文件
      event.target.value = ''
    },

    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
      this.formData.attachmentUrls.splice(index, 1)
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },

    getFileTypeClass(filename) {
      const ext = this.getFileExtension(filename).toLowerCase()
      if (['pdf'].includes(ext)) return 'file-type-pdf'
      if (['doc', 'docx'].includes(ext)) return 'file-type-word'
      if (['xls', 'xlsx'].includes(ext)) return 'file-type-excel'
      if (['ppt', 'pptx'].includes(ext)) return 'file-type-ppt'
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'file-type-image'
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'file-type-archive'
      if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'file-type-video'
      if (['txt', 'md'].includes(ext)) return 'file-type-text'
      return 'file-type-default'
    },

    getFileExtension(filename) {
      const parts = filename.split('.')
      return parts.length > 1 ? parts[parts.length - 1] : ''
    },

    getFileTypeName(filename) {
      const ext = this.getFileExtension(filename).toLowerCase()
      const typeMap = {
        'pdf': 'PDF文档',
        'doc': 'Word文档',
        'docx': 'Word文档',
        'xls': 'Excel表格',
        'xlsx': 'Excel表格',
        'ppt': 'PPT演示',
        'pptx': 'PPT演示',
        'jpg': '图片',
        'jpeg': '图片',
        'png': '图片',
        'gif': '图片',
        'bmp': '图片',
        'webp': '图片',
        'zip': '压缩包',
        'rar': '压缩包',
        '7z': '压缩包',
        'tar': '压缩包',
        'gz': '压缩包',
        'mp4': '视频',
        'avi': '视频',
        'mov': '视频',
        'wmv': '视频',
        'flv': '视频',
        'txt': '文本',
        'md': 'Markdown'
      }
      return typeMap[ext] || '文件'
    },

    getFileIcon(filename) {
      const ext = this.getFileExtension(filename).toLowerCase()
      
      // PDF图标
      if (ext === 'pdf') {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#DC143C" stroke="#DC143C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12H17M7 16H13" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
      }
      
      // Word图标
      if (['doc', 'docx'].includes(ext)) {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#2B579A" stroke="#2B579A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12L9 16L12 10L15 16L17 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      }
      
      // Excel图标
      if (['xls', 'xlsx'].includes(ext)) {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#1D6F42" stroke="#1D6F42" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12H17M7 16H17" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
      }
      
      // PPT图标
      if (['ppt', 'pptx'].includes(ext)) {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#F39C12" stroke="#F39C12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="13" r="3" fill="white"/></svg>'
      }
      
      // 图片图标
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" fill="#4CAF50" stroke="#4CAF50" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.5" cy="8.5" r="2.5" fill="white"/><path d="M3 18L8 13L14 19M14 12L21 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      }
      
      // 压缩包图标
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8C21 7.46957 20.7893 6.96086 20.4142 6.58579C20.0391 6.21071 19.5304 6 19 6H5C4.46957 6 3.96086 6.21071 3.58579 6.58579C3.21071 6.96086 3 7.46957 3 8V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H19C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16Z" fill="#FF9800" stroke="#FF9800" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10H21M8 10V18M16 10V18" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
      }
      
      // 视频图标
      if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" fill="#722ED1" stroke="#722ED1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8L15 12L9 16V8Z" fill="white"/></svg>'
      }
      
      // 文本图标
      if (['txt', 'md'].includes(ext)) {
        return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#13C2C2" stroke="#13C2C2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12H17M7 16H13" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
      }
      
      // 默认文件图标
      return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#2196F3" stroke="#2196F3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12H17M7 16H13" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
    },

    async handleSubmit() {
      // 验证表单
      if (!this.formData.submissionContent || this.formData.submissionContent.trim().length < 10) {
        this.showErrorToast('提交说明至少需要10个字符')
        return
      }

      if (this.formData.submissionContent.length > 5000) {
        this.showErrorToast('提交说明不能超过5000个字符')
        return
      }

      this.isSubmitting = true

      try {
        const response = await submitTask(this.task.id, this.formData)

        if (response && response.code === 200) {
          this.showSuccessToast('任务提交成功，等待审核')
          this.$emit('success', response.data)
          this.handleClose()
        } else {
          const errorMsg = (response && response.msg) || '提交失败'
          this.showErrorToast(errorMsg)
        }
      } catch (error) {
        console.error('提交任务失败', error)
        
        // 安全地获取错误消息
        let errorMsg = '提交失败'
        if (error) {
          if (error.msg) {
            errorMsg = error.msg
          } else if (error.message) {
            errorMsg = error.message
          } else if (typeof error === 'string') {
            errorMsg = error
          }
        }
        
        this.showErrorToast(errorMsg)
      } finally {
        this.isSubmitting = false
      }
    },

    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 2000)
    },

    showErrorToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 2000)
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
  overflow-x: visible;
  flex: 1;
  position: relative;
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
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.info-value {
  color: #333;
  flex: 1;
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

.label-tip {
  font-weight: normal;
  color: #999;
  font-size: 12px;
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

.radio-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.radio-item {
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-item:hover {
  border-color: #2196F3;
  background-color: #f5f9ff;
}

.radio-item input[type="radio"] {
  margin-right: 12px;
  margin-top: 2px;
}

.radio-item input[type="radio"]:checked ~ .radio-label {
  color: #2196F3;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.radio-title {
  font-weight: 600;
  color: #333;
}

.radio-desc {
  font-size: 12px;
  color: #999;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  transition: border-color 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  position: relative;
  min-height: 100px;
  box-sizing: border-box;
}

.upload-area:hover {
  border-color: #2196F3;
}

.upload-trigger {
  text-align: center;
  cursor: pointer;
  padding: 20px;
}

.upload-text {
  margin: 12px 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.file-list {
  margin-top: 0;
  margin-bottom: 20px;
  margin-left: 0;
  margin-right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid #e8e8e8;
  padding-top: 0;
  padding-bottom: 20px;
  padding-left: 0;
  padding-right: 0;
  width: calc(100% - 0px);
  max-width: 100%;
  align-items: center;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}

.file-item-new {
  display: flex;
  align-items: flex-start;
  padding: 14px 16px;
  background: #ffffff;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  transition: all 0.2s ease;
  gap: 14px;
  width: 100%;
  max-width: calc(100% - 0px);
  position: relative;
  z-index: 11;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin: 0;
}

.file-item-new:hover {
  border-color: #2196F3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.12);
  transform: none;
}

.file-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.file-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background: currentColor;
}

.file-icon-inner {
  position: relative;
  z-index: 1;
}

.file-icon-inner svg {
  width: 28px;
  height: 28px;
}

.file-type-pdf {
  background: linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%);
  color: #DC143C;
}

.file-type-word {
  background: linear-gradient(135deg, #4A90E2 0%, #2B579A 100%);
  color: #2B579A;
}

.file-type-excel {
  background: linear-gradient(135deg, #5CB85C 0%, #1D6F42 100%);
  color: #1D6F42;
}

.file-type-ppt {
  background: linear-gradient(135deg, #F39C12 0%, #D68910 100%);
  color: #D68910;
}

.file-type-image {
  background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
  color: #389E0D;
}

.file-type-archive {
  background: linear-gradient(135deg, #FFA940 0%, #D46B08 100%);
  color: #D46B08;
}

.file-type-video {
  background: linear-gradient(135deg, #722ED1 0%, #531DAB 100%);
  color: #531DAB;
}

.file-type-text {
  background: linear-gradient(135deg, #13C2C2 0%, #08979C 100%);
  color: #08979C;
}

.file-type-default {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: #1976D2;
}

.file-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.file-name-new {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.file-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.file-type-tag {
  font-size: 11px;
  padding: 3px 8px;
  background: #f5f5f5;
  color: #666;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
}

.file-size-new {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  font-weight: 400;
}

.file-remove-new {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0.6;
}

.file-remove-new:hover {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  opacity: 1;
}

.input-group {
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2196F3;
}

.input-suffix {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
}

.form-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
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

.btn-primary {
  background-color: #2196F3;
  color: white;
}

.btn-primary:hover {
  background-color: #1976D2;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Toast 提示样式 */
.toast-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 10000;
  animation: toastFadeInOut 2s ease-in-out;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  max-width: 80%;
  text-align: center;
}

@keyframes toastFadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  85% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}
</style>

