<template>
  <div v-if="showError" class="error-dialog-overlay" @click="closeDialog">
    <div class="error-dialog" @click.stop>
      <div class="error-dialog-header">
        <div class="header-content">
          <div class="error-icon-wrapper">
            <div class="error-icon-bg"></div>
            <svg class="error-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="header-text">
            <h3 class="error-title">发生错误</h3>
            <p class="error-subtitle">系统遇到了一个问题，请查看详细信息</p>
          </div>
        </div>
        <button class="close-btn" @click="closeDialog" title="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="error-dialog-content">
        <div class="error-message-card">
          <div class="card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
            </svg>
            <span class="card-title">错误信息</span>
          </div>
          <div class="error-message-text">{{ errorMessage }}</div>
        </div>
        
        <div v-if="errorStack" class="error-stack-card">
          <div class="card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="card-title">错误堆栈</span>
            <button class="copy-btn" @click="copyStack">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>复制</span>
            </button>
          </div>
          <div class="error-stack-container">
            <pre class="error-stack-text">{{ errorStack }}</pre>
          </div>
        </div>
        
        <div v-if="errorDetails" class="error-details-card">
          <div class="card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="card-title">详细信息</span>
          </div>
          <div class="error-details-container">
            <pre class="error-details-text">{{ errorDetails }}</pre>
          </div>
        </div>
      </div>
      <div class="error-dialog-footer">
        <button v-if="errorStack" class="btn secondary" @click="copyStack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>复制错误信息</span>
        </button>
        <button class="btn primary" @click="closeDialog">
          <span>确定</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlobalErrorDialog',
  data() {
    return {
      showError: false,
      errorMessage: '',
      errorStack: '',
      errorDetails: '',
      isClosing: false // 标记是否正在关闭
    }
  },
  mounted() {
    // 监听全局错误事件
    if (this.$eventBus) {
      this.$eventBus.on('global-error', this.handleError)
      console.log('[GlobalErrorDialog] 已注册全局错误监听器')
    } else {
      console.warn('[GlobalErrorDialog] EventBus 不可用')
    }
  },
  beforeDestroy() {
    if (this.$eventBus) {
      this.$eventBus.off('global-error', this.handleError)
    }
  },
  methods: {
    handleError(errorInfo) {
      console.log('[GlobalErrorDialog] 收到错误事件:', errorInfo)
      
      // 如果正在关闭或已经显示，忽略新的错误（避免重复触发）
      if (this.isClosing || this.showError) {
        console.log('[GlobalErrorDialog] 忽略错误：正在关闭或已显示')
        return
      }
      
      this.errorMessage = errorInfo.message || '发生了未知错误'
      this.errorStack = errorInfo.stack || ''
      this.errorDetails = errorInfo.details || ''
      this.showError = true
      this.isClosing = false
      
      console.log('[GlobalErrorDialog] 弹窗显示状态:', this.showError)
    },
    closeDialog() {
      // 防止重复关闭
      if (this.isClosing) {
        return
      }
      
      this.isClosing = true
      this.showError = false
      
      // 通知全局错误处理器，弹窗已关闭
      if (this.$eventBus) {
        this.$eventBus.emit('error-dialog-closed')
      }
      
      // 延迟清空数据，让关闭动画完成
      setTimeout(() => {
        this.errorMessage = ''
        this.errorStack = ''
        this.errorDetails = ''
        this.isClosing = false
      }, 300)
    },
    copyStack() {
      const textToCopy = `错误信息：${this.errorMessage}\n\n` +
        (this.errorStack ? `错误堆栈：\n${this.errorStack}\n\n` : '') +
        (this.errorDetails ? `详细信息：\n${this.errorDetails}` : '')
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          alert('错误信息已复制到剪贴板')
        }).catch(() => {
          // 降级方案
          this.fallbackCopy(textToCopy)
        })
      } else {
        this.fallbackCopy(textToCopy)
      }
    },
    fallbackCopy(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        alert('错误信息已复制到剪贴板')
      } catch (err) {
        alert('复制失败，请手动复制')
      }
      document.body.removeChild(textArea)
    }
  }
}
</script>

<style scoped>
.error-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999 !important;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.error-dialog {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  display: flex !important;
  flex-direction: column;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  z-index: 100000;
}

@keyframes slideUp {
  from {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.error-dialog-header {
  padding: 24px 28px;
  background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 50%, #fecaca 100%);
  border-bottom: 1px solid rgba(220, 38, 38, 0.1);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.error-dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.error-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.error-icon-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 50%;
  border: 3px solid rgba(220, 38, 38, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

.error-icon {
  position: relative;
  color: #dc2626;
  z-index: 1;
}

.header-text {
  flex: 1;
  padding-top: 4px;
}

.error-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #991b1b;
  letter-spacing: -0.02em;
}

.error-subtitle {
  margin: 0;
  font-size: 13px;
  color: #b91c1c;
  opacity: 0.8;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  color: #991b1b;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  transform: rotate(90deg);
}

.close-btn:active {
  transform: rotate(90deg) scale(0.95);
}

.error-dialog-content {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
  background: #fafafa;
}

.error-message-card,
.error-stack-card,
.error-details-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.error-message-card:hover,
.error-stack-card:hover,
.error-details-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border-bottom: 1px solid #f0f0f0;
}

.card-header svg {
  color: #6b7280;
  flex-shrink: 0;
}

.card-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.01em;
}

.error-message-text {
  font-size: 14px;
  color: #dc2626;
  padding: 16px 18px;
  line-height: 1.7;
  word-break: break-word;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #dc2626;
  margin: 0;
}

.error-stack-container,
.error-details-container {
  padding: 16px 18px;
  background: #1e293b;
  max-height: 280px;
  overflow-y: auto;
}

.error-stack-text,
.error-details-text {
  font-size: 12px;
  color: #e2e8f0;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', Consolas, monospace;
  line-height: 1.6;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.copy-btn:hover {
  background: linear-gradient(135deg, #0044CC 0%, #003399 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(94, 182, 228, 0.3);
}

.copy-btn:active {
  transform: translateY(0);
}

.copy-btn svg {
  width: 14px;
  height: 14px;
}

.error-dialog-footer {
  padding: 20px 28px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: white;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.01em;
}

.btn.primary {
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(94, 182, 228, 0.3);
}

.btn.primary:hover {
  background: linear-gradient(135deg, #0044CC 0%, #003399 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 182, 228, 0.4);
}

.btn.primary:active {
  transform: translateY(0);
}

.btn.secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn.secondary:hover {
  background: #f9fafb;
  border-color: #5EB6E4;
  color: #5EB6E4;
  transform: translateY(-1px);
}

.btn.secondary:active {
  transform: translateY(0);
}

.btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 滚动条样式 */
.error-stack-container::-webkit-scrollbar,
.error-details-container::-webkit-scrollbar,
.error-dialog-content::-webkit-scrollbar {
  width: 8px;
}

.error-stack-container::-webkit-scrollbar-track,
.error-details-container::-webkit-scrollbar-track,
.error-dialog-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.error-stack-container::-webkit-scrollbar-thumb,
.error-details-container::-webkit-scrollbar-thumb,
.error-dialog-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.error-stack-container::-webkit-scrollbar-thumb:hover,
.error-details-container::-webkit-scrollbar-thumb:hover,
.error-dialog-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>

