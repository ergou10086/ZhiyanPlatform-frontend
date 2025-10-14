<template>
  <div class="forgot-password-container">
    <Header />
    
    <div class="forgot-password-content">
      <div class="forgot-password-box">
      <div class="forgot-password-header">
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
              placeholder="请输入验证码"
              maxlength="6"
              required
              class="code-input"
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
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.resetForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      this.loading = true
      try {
        // 这里添加发送验证码逻辑
        console.log('发送验证码到邮箱:', this.resetForm.email)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        alert('验证码已发送到您的邮箱')
        this.startCountdown()
      } catch (error) {
        console.error('发送验证码失败:', error)
        alert('发送失败，请重试')
      } finally {
        this.loading = false
      }
    },
    async handleResetPassword() {
      // 验证表单
      if (!this.resetForm.email) {
        alert('请输入邮箱地址')
        return
      }
      
      if (!this.resetForm.code) {
        alert('请输入验证码')
        return
      }
      
      if (!this.resetForm.newPassword) {
        alert('请输入新密码')
        return
      }
      
      if (this.resetForm.newPassword !== this.resetForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }
      
      if (this.resetForm.newPassword.length < 6) {
        alert('密码长度不能少于6位')
        return
      }
      
      this.loading = true
      try {
        // 这里添加重置密码逻辑
        console.log('重置密码请求:', this.resetForm)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        alert('密码重置成功！请使用新密码登录')
        this.$router.push('/login')
      } catch (error) {
        console.error('密码重置失败:', error)
        alert('密码重置失败，请重试')
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
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
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
  opacity: 0.7;
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
