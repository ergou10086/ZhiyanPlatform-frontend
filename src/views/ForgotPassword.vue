<template>
  <div class="forgot-password-container">
    <div class="brand-corner">智研</div>
    <div class="forgot-password-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.svg" alt="Logo" class="logo-img" />
        </div>
        <h1 class="system-title" :class="{ animated: animateLogo }">高校科研团队协作与成果管理平台</h1>
        <p class="system-subtitle" :class="{ animated: animateLogo }">University Research Team Collaboration and Achievement Management Platform</p>
      </div>
    </div>
    
    <div class="forgot-password-right">
      <div class="forgot-password-box">
        <div class="forgot-password-header">
          <button class="back-btn" @click="goToLogin" title="返回登录">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>返回登录</span>
          </button>
          <h2 class="forgot-password-title">重置密码</h2>
          <p class="forgot-password-subtitle">通过邮箱验证重置您的密码</p>
        </div>
        
        <form @submit.prevent="handleResetPassword" class="forgot-password-form">
          <div class="form-group">
            <label for="email">电子邮箱</label>
            <input
              type="email"
              id="email"
              v-model="resetForm.email"
              placeholder="请输入您的邮箱地址"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="code">验证码</label>
            <div class="code-input-group">
              <input
                type="text"
                id="code"
                v-model="resetForm.code"
                placeholder="请输入6位验证码"
                maxlength="6"
                pattern="[0-9]{6}"
                required
                class="code-input"
                @input="formatCodeInput"
              />
              <button 
                type="button" 
                @click="sendCode" 
                class="send-code-btn" 
                :disabled="loading || countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input
              type="password"
              id="newPassword"
              v-model="resetForm.newPassword"
              placeholder="请输入新密码"
              required
              minlength="6"
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="resetForm.confirmPassword"
              placeholder="请再次输入新密码"
              required
            />
          </div>
          
          <button type="submit" class="complete-btn" :disabled="loading">
            {{ loading ? '重置中...' : '重置密码' }}
          </button>
        </form>
      </div>
    </div>
    
    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'
import { formatApiError, isValidEmail, validatePassword } from '@/utils/auth'

export default {
  name: 'ForgotPassword',
  components: {
  },
  data() {
    return {
      loading: false,
      countdown: 0,
      submitLocked: false,
      resetForm: {
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: ''
      },
      showToast: false,
      toastMessage: '',
      animateLogo: false
    }
  },
  mounted() {
    // 检查是否已经播放过动画
    const hasAnimated = localStorage.getItem('authPagesAnimated')
    if (!hasAnimated) {
      this.animateLogo = true
      localStorage.setItem('authPagesAnimated', 'true')
    }
  },
  methods: {
    async sendCode() {
      if (!this.resetForm.email) {
        alert('请先输入邮箱地址')
        return
      }
      
      if (!isValidEmail(this.resetForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      this.loading = true
      try {
        // 直接调用发送验证码API，让后端处理邮箱检查
        const response = await authAPI.sendVerificationCode({
          email: this.resetForm.email,
          type: 'RESET_PASSWORD' // 重置密码类型，使用大写
        })
        
        if (response.code === 200) {
          alert('验证码已发送到您的邮箱，请查收（测试模式下验证码会显示在后端控制台）')
          this.startCountdown()
        } else {
          alert(response.msg || '发送失败，请重试')
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        const errorMessage = formatApiError(error)
        alert(errorMessage)
      } finally {
        this.loading = false
      }
    },
    async handleResetPassword() {
      if (this.submitLocked) return
      this.submitLocked = true
      setTimeout(() => { this.submitLocked = false }, 1000)
      
      // 表单验证
      if (!this.resetForm.email) {
        alert('请输入邮箱地址')
        return
      }
      
      if (!this.resetForm.code) {
        alert('请输入验证码')
        return
      }
      
      // 验证验证码格式
      if (!/^\d{6}$/.test(this.resetForm.code)) {
        alert('请输入6位数字验证码')
        return
      }
      
      if (!this.resetForm.newPassword) {
        alert('请输入新密码')
        return
      }
      
      if (!isValidEmail(this.resetForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      if (this.resetForm.newPassword !== this.resetForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }
      
      const passwordValidation = validatePassword(this.resetForm.newPassword)
      if (!passwordValidation.isValid) {
        alert(passwordValidation.message)
        return
      }
      
      this.loading = true
      try {
        // 调用重置密码API
        const response = await authAPI.resetPassword({
          email: this.resetForm.email,
          verificationCode: this.resetForm.code,
          newPassword: this.resetForm.newPassword,
          confirmPassword: this.resetForm.confirmPassword
        })
        
        if (response.code === 200) {
          this.showSuccessToast('密码重置成功！请使用新密码登录')
          
          // 延迟跳转到登录页面，让用户看到提示
          setTimeout(() => {
            this.$router.push('/login')
          }, 1000)
        } else {
          alert(response.msg || '密码重置失败，请重试')
        }
      } catch (error) {
        console.error('密码重置失败:', error)
        const errorMessage = formatApiError(error)
        alert(errorMessage)
      } finally {
        this.loading = false
      }
    },
    startCountdown() {
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    formatCodeInput(event) {
      // 只允许输入数字
      let value = event.target.value.replace(/[^0-9]/g, '')
      // 限制6位
      if (value.length > 6) {
        value = value.substring(0, 6)
      }
      this.resetForm.code = value
      event.target.value = value
    },
    goToLogin() {
      this.$router.push('/login')
    },
    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      // 1秒后自动隐藏
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 1000)
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  height: 100vh;
  background: #ffffff;
  display: flex;
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.forgot-password-left {
  flex: 1;
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.forgot-password-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.brand-corner {
  position: fixed;
  top: 20px;
  left: 40px;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  z-index: 1000;
  letter-spacing: 2px;
}

.logo-section {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}

.logo-placeholder {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  opacity: 1;
}

.logo-placeholder.animated {
  animation: fadeInUp 0.8s ease-out;
}

.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 12px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.system-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: white;
}

.system-title.animated {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.system-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
}

.system-subtitle.animated {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.forgot-password-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f8f9fa;
}

.forgot-password-box {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 48px;
  width: 100%;
  max-width: 450px;
}

.forgot-password-header {
  position: relative;
  margin-bottom: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #3B82F6;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.back-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.forgot-password-title {
  font-size: 28px;
  color: #2d3748;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.forgot-password-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
  font-weight: 400;
}

.forgot-password-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #ffffff;
  color: #2d3748;
}

.form-group input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder {
  color: #a0aec0;
}


.code-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  background: #3B82F6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.send-code-btn:hover:not(:disabled) {
  background: #2563EB;
  transform: translateY(-1px);
}

.send-code-btn:disabled {
  background: #e2e8f0;
  color: #cbd5e0;
  border: none;
  opacity: 1;
  cursor: not-allowed;
}

.complete-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.complete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.complete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}


@media (max-width: 1024px) {
  .forgot-password-container {
    flex-direction: column;
  }
  
  .forgot-password-left {
    min-height: 300px;
    flex: none;
  }
  
  .forgot-password-right {
    min-height: calc(100vh - 300px);
  }
}

@media (max-width: 768px) {
  .forgot-password-left {
    min-height: 250px;
    padding: 30px 20px;
  }
  
  .logo-placeholder svg {
    width: 60px;
    height: 60px;
  }
  
  .system-title {
    font-size: 24px;
  }
  
  .system-subtitle {
    font-size: 14px;
  }
  
  .forgot-password-right {
    padding: 30px 20px;
  }
  
  .forgot-password-box {
    padding: 32px 24px;
  }
}

@media (max-width: 480px) {
  .forgot-password-left {
    min-height: 200px;
    padding: 20px;
  }
  
  .logo-placeholder svg {
    width: 50px;
    height: 50px;
  }
  
  .system-title {
    font-size: 20px;
  }
  
  .system-subtitle {
    font-size: 12px;
  }
  
  .forgot-password-right {
    padding: 20px;
  }
  
  .forgot-password-box {
    padding: 24px 20px;
  }
  
  .forgot-password-title {
    font-size: 22px;
  }
  
  .code-input-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .send-code-btn {
    width: 100%;
  }
}

/* Toast样式 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 10000;
  animation: fadeInOut 1s ease-in-out;
  pointer-events: none;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}
</style>
