<template>
  <div class="forgot-password-container">
    <div class="brand-corner">智研</div>
    <div class="forgot-password-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.svg" alt="Logo" class="logo-img" />
        </div>
        <h1 class="system-title" :class="{ animated: animateLogo }">高校科研团队协作与成果管理平台</h1>
        <p class="system-subtitle" :class="{ animated: animateLogo }">
          面向科研组织和团队管理的科学研究项目的项目、团队、成果的一体化管理平台
        </p>
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
            <label for="email">电子邮箱<span class="required-asterisk">*</span></label>
            <input
              type="email"
              id="email"
              v-model="resetForm.email"
              placeholder="请输入您的邮箱地址"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="code">验证码<span class="required-asterisk">*</span></label>
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
            <label for="newPassword">新密码<span class="required-asterisk">*</span></label>
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
            <label for="confirmPassword">确认密码<span class="required-asterisk">*</span></label>
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
import '@/assets/styles/ForgotPassword.css'

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

