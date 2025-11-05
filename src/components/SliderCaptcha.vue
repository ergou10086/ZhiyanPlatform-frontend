<template>
  <div class="slider-captcha">
    <div class="slider-container" :class="{ 'verified': isVerified, 'failed': showFailed }">
      <div class="slider-track">
        <div class="slider-fill" :style="{ width: sliderPosition + 'px' }"></div>
        <div class="slider-text">{{ sliderText }}</div>
      </div>
      <div 
        class="slider-button"
        :style="{ left: sliderPosition + 'px' }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
      >
        <svg v-if="!isVerified" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    <div v-if="showRefresh" class="refresh-btn" @click="handleRefresh" title="重新验证">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 2V8M21 8H15M21 8L18 5.5C16.5 4 14.5 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C15.5 21 18.5 19 20 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SliderCaptcha',
  props: {
    // 是否自动重置
    autoReset: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sliderPosition: 0,
      isVerified: false,
      isDragging: false,
      startX: 0,
      maxPosition: 0,
      showFailed: false,
      showRefresh: false
    }
  },
  computed: {
    sliderText() {
      if (this.isVerified) {
        return '验证通过'
      } else if (this.showFailed) {
        return '验证失败，请重试'
      } else if (this.isDragging) {
        return '继续拖动'
      } else {
        return '向右滑动完成验证'
      }
    }
  },
  mounted() {
    this.calculateMaxPosition()
    window.addEventListener('resize', this.calculateMaxPosition)
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    document.addEventListener('touchend', this.handleTouchEnd)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calculateMaxPosition)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('touchmove', this.handleTouchMove)
    document.removeEventListener('touchend', this.handleTouchEnd)
  },
  methods: {
    calculateMaxPosition() {
      this.$nextTick(() => {
        const container = this.$el.querySelector('.slider-track')
        if (container) {
          const buttonWidth = 50
          this.maxPosition = container.offsetWidth - buttonWidth
        }
      })
    },
    handleMouseDown(e) {
      if (this.isVerified) return
      this.isDragging = true
      this.startX = e.clientX - this.sliderPosition
      e.preventDefault()
    },
    handleMouseMove(e) {
      if (!this.isDragging || this.isVerified) return
      const newPosition = e.clientX - this.startX
      this.updatePosition(newPosition)
      e.preventDefault()
    },
    handleMouseUp() {
      if (!this.isDragging) return
      this.isDragging = false
      this.checkVerification()
    },
    handleTouchStart(e) {
      if (this.isVerified) return
      this.isDragging = true
      const touch = e.touches[0]
      this.startX = touch.clientX - this.sliderPosition
      e.preventDefault()
    },
    handleTouchMove(e) {
      if (!this.isDragging || this.isVerified) return
      const touch = e.touches[0]
      const newPosition = touch.clientX - this.startX
      this.updatePosition(newPosition)
      e.preventDefault()
    },
    handleTouchEnd() {
      if (!this.isDragging) return
      this.isDragging = false
      this.checkVerification()
    },
    updatePosition(newPosition) {
      if (newPosition < 0) {
        this.sliderPosition = 0
      } else if (newPosition > this.maxPosition) {
        this.sliderPosition = this.maxPosition
      } else {
        this.sliderPosition = newPosition
      }
    },
    checkVerification() {
      // 允许5像素的误差
      const tolerance = 5
      if (this.sliderPosition >= this.maxPosition - tolerance) {
        this.isVerified = true
        this.sliderPosition = this.maxPosition
        this.showRefresh = true
        this.$emit('verify-success')
      } else {
        this.showFailed = true
        setTimeout(() => {
          this.resetSlider()
        }, 800)
        this.$emit('verify-failed')
      }
    },
    resetSlider() {
      this.sliderPosition = 0
      this.isVerified = false
      this.showFailed = false
      this.showRefresh = false
      this.$emit('reset')
    },
    handleRefresh() {
      this.resetSlider()
    },
    // 外部可以调用此方法重置
    reset() {
      this.resetSlider()
    }
  }
}
</script>

<style scoped>
.slider-captcha {
  width: 100%;
  position: relative;
  margin: 20px 0;
}

.slider-container {
  position: relative;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.slider-track {
  position: relative;
  width: 100%;
  height: 50px;
  background: #f7f9fa;
  border: 2px solid #e4e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.slider-container.verified .slider-track {
  border-color: #52c41a;
  background: #f6ffed;
}

.slider-container.failed .slider-track {
  border-color: #ff4d4f;
  background: #fff2f0;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
  transition: background 0.3s ease;
  pointer-events: none;
}

.slider-container.verified .slider-fill {
  background: linear-gradient(90deg, #d9f7be 0%, #95de64 100%);
}

.slider-container.failed .slider-fill {
  background: linear-gradient(90deg, #ffccc7 0%, #ffa39e 100%);
}

.slider-text {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #8c8c8c;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
}

.slider-container.verified .slider-text {
  color: #52c41a;
}

.slider-container.failed .slider-text {
  color: #ff4d4f;
}

.slider-button {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 42px;
  background: #ffffff;
  border: 2px solid #e4e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.slider-button:active {
  cursor: grabbing;
}

.slider-button:hover {
  border-color: #3B82F6;
}

.slider-container.verified .slider-button {
  background: #52c41a;
  border-color: #52c41a;
  cursor: default;
}

.slider-container.verified .slider-button:hover {
  border-color: #52c41a;
}

.slider-container.failed .slider-button {
  border-color: #ff4d4f;
}

.slider-button svg {
  color: #8c8c8c;
  transition: color 0.3s ease;
}

.slider-button:hover svg {
  color: #3B82F6;
}

.slider-container.verified .slider-button svg {
  color: #ffffff;
}

.slider-container.failed .slider-button svg {
  color: #ff4d4f;
}

.refresh-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3;
}

.refresh-btn:hover {
  background: #f5f5f5;
  border-color: #3B82F6;
}

.refresh-btn svg {
  color: #8c8c8c;
}

.refresh-btn:hover svg {
  color: #3B82F6;
  animation: rotate-refresh 0.5s ease;
}

@keyframes rotate-refresh {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .slider-track {
    height: 45px;
  }
  
  .slider-button {
    width: 45px;
    height: 38px;
  }
  
  .slider-text {
    font-size: 13px;
  }
}
</style>

