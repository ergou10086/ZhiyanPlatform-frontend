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

        <!-- 提交类型 -->
        <div class="form-group">
          <label class="form-label">提交类型</label>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" v-model="formData.submissionType" value="COMPLETE" />
              <span class="radio-label">
                <span class="radio-title">完成提交</span>
                <span class="radio-desc">任务已完全完成</span>
              </span>
            </label>
            <label class="radio-item">
              <input type="radio" v-model="formData.submissionType" value="PARTIAL" />
              <span class="radio-label">
                <span class="radio-title">阶段性提交</span>
                <span class="radio-desc">中间进度汇报</span>
              </span>
            </label>
            <label class="radio-item">
              <input type="radio" v-model="formData.submissionType" value="MILESTONE" />
              <span class="radio-label">
                <span class="radio-title">里程碑提交</span>
                <span class="radio-desc">重要节点提交</span>
              </span>
            </label>
          </div>
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
            <div class="upload-trigger" @click="triggerFileUpload">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 3V15" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p class="upload-text">点击上传附件</p>
              <p class="upload-hint">支持多个文件，单个文件不超过100MB</p>
            </div>

            <!-- 文件列表 -->
            <div v-if="uploadedFiles.length > 0" class="file-list">
              <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
                <div class="file-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ file.filename }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
                <button class="file-remove" @click="removeFile(index)" title="删除">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 实际工时 -->
        <div class="form-group">
          <label class="form-label">实际工时 <span class="label-tip">(选填)</span></label>
          <div class="input-group">
            <input
              type="number"
              v-model.number="formData.actualWorktime"
              class="form-input"
              placeholder="请输入实际工时"
              min="0"
              step="0.5"
            />
            <span class="input-suffix">小时</span>
          </div>
        </div>

        <!-- 是否为最终提交 -->
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.isFinal" />
            <span>这是最终提交（任务完成）</span>
          </label>
          <p class="form-hint">勾选后，审核通过将自动标记任务为完成状态</p>
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
        submissionType: 'COMPLETE',
        attachmentUrls: [],
        actualWorktime: null,
        isFinal: true
      },
      uploadedFiles: [],
      isSubmitting: false
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
        submissionType: 'COMPLETE',
        attachmentUrls: [],
        actualWorktime: null,
        isFinal: true
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
          this.$message.warning(`文件 ${file.name} 超过100MB限制，已跳过`)
          continue
        }

        try {
          const response = await uploadSubmissionFile(file)
          
          if (response && response.code === 200 && response.data) {
            this.uploadedFiles.push({
              filename: response.data.filename || file.name,
              url: response.data.url,
              size: file.size
            })
            this.formData.attachmentUrls.push(response.data.url)
            this.$message.success(`文件 ${file.name} 上传成功`)
          } else {
            const errorMsg = (response && response.msg) || '上传失败'
            this.$message.error(`文件 ${file.name} 上传失败：${errorMsg}`)
          }
        } catch (error) {
          console.error('文件上传失败', error)
          const errorMsg = (error && error.message) || (error && error.msg) || '网络错误'
          this.$message.error(`文件 ${file.name} 上传失败：${errorMsg}`)
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

    async handleSubmit() {
      // 验证表单
      if (!this.formData.submissionContent || this.formData.submissionContent.trim().length < 10) {
        this.$message.warning('提交说明至少需要10个字符')
        return
      }

      if (this.formData.submissionContent.length > 5000) {
        this.$message.warning('提交说明不能超过5000个字符')
        return
      }

      this.isSubmitting = true

      try {
        const response = await submitTask(this.task.id, this.formData)

        if (response && response.code === 200) {
          this.$message.success('任务提交成功，等待审核')
          this.$emit('success', response.data)
          this.handleClose()
        } else {
          const errorMsg = (response && response.msg) || '提交失败'
          this.$message.error(errorMsg)
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
        
        this.$message.error(errorMsg)
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
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
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
  transition: border-color 0.2s;
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
  margin-top: 16px;
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-icon {
  color: #2196F3;
  margin-right: 12px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.file-remove:hover {
  color: #f44336;
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
</style>

