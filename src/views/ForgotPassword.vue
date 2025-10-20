<template>
  <div class="forgot-password-container">
    <Header />
    
    <div class="forgot-password-content">
      <div class="forgot-password-box">
      <div class="forgot-password-header">
        <button class="back-btn" @click="goToLogin" title="返回登录">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="forgot-password-title">忘记密码</h1>
      </div>
      
      <form @submit.prevent="handleResetPassword" class="forgot-password-form">
        <div class="form-group">
          <label for="email">电子邮箱 *</label>
          <input
            type="email"
            id="email"
            v-model="resetForm.email"
            placeholder="请输入您的邮箱地址"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="code">验证码 *</label>
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
          <label for="newPassword">新密码 *</label>
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
          <label for="confirmPassword">确认密码 *</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="resetForm.confirmPassword"
            placeholder="请再次输入新密码"
            required
          />
        </div>
        
        <button type="submit" class="complete-btn" :disabled="loading">
          {{ loading ? '处理中...' : '完成' }}
        </button>
      </form>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { authAPI } from '@/api/auth'
import { formatApiError, isValidEmail, validatePassword } from '@/utils/auth'

export default {
  name: 'ForgotPassword',
  components: {
    Header,
    Footer
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
      }
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
          alert('密码重置成功！请使用新密码登录')
          // 跳转回登录界面
          this.$router.push('/login')
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
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  height: 100vh;
  background-color: #f5f5f5;
  background-image: url('@/assets/image/background_login.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.forgot-password-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.forgot-password-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.forgot-password-box:hover {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}

.forgot-password-title {
  font-size: 24px;
  color: #333;
  font-weight: 500;
  margin: 0;
}

.forgot-password-subtitle {
  color: #666;
  font-size: 14px;
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
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.reset-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.reset-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.code-sent-message {
  text-align: center;
  padding: 20px 0;
  margin-bottom: 30px;
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon svg {
  color: #4CAF50;
}

.code-sent-message h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
}

.code-sent-message p {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

.code-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.code-input {
  flex: 1;
}

.resend-code-btn {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.resend-code-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.resend-code-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.verify-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.verify-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reset-password-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.reset-password-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.reset-password-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.send-code-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-code-btn:disabled {
  background: #e0e0e0;
  color: #9aa0a6;
  border: none;
  opacity: 1;
  cursor: not-allowed;
}

.complete-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.complete-btn:hover:not(:disabled) {
  background: #0056b3;
}

.complete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-to-login {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.back-to-login a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.back-to-login a:hover {
  color: #5a6fd8;
}


@media (max-width: 480px) {
  .forgot-password-box {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .forgot-password-title {
    font-size: 20px;
  }
  
  .code-input-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .send-code-btn {
    width: 100%;
  }
}
</style>
