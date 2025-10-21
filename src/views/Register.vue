<template>
  <div class="register-container">
    <Header />
    
    <div class="register-content">
      <div class="register-box">
      <div class="register-header">
        <button class="back-btn" @click="goToLogin" title="返回登录">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="register-title">创建您的账户</h1>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="email">电子邮箱 *</label>
          <input
            type="email"
            id="email"
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            required
            @blur="checkEmailStatus"
          />
          <div v-if="emailStatus" class="email-status" :class="emailStatus.type">
            {{ emailStatus.message }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="code">验证码 *</label>
          <div class="code-input-group">
            <input
              type="text"
              id="code"
              v-model="registerForm.code"
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
          <label for="password">密码设置(6-16位) *</label>
          <input
            type="password"
            id="password"
            v-model="registerForm.password"
            placeholder="请输入密码"
            required
            minlength="6"
            maxlength="16"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码 *</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="name">昵称 *</label>
          <input
            type="text"
            id="name"
            v-model="registerForm.name"
            placeholder="请输入昵称"
            required
          />
        </div>
        
        
        <div class="form-group">
          <label for="organization">所属机构或学校</label>
          <input
            type="text"
            id="organization"
            v-model="registerForm.organization"
            placeholder="请输入所属机构或学校"
          />
        </div>
        
        <div class="form-group">
          <label class="agreement">
            <input type="checkbox" v-model="registerForm.agreement" required />
            我已阅读并同意
            <a href="#" class="agreement-link">《隐私政策》</a>
            和
            <a href="#" class="agreement-link">《服务协议》</a>
          </label>
        </div>
        
        <button type="submit" class="register-btn" :disabled="loading">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
      </form>
      </div>
    </div>
    
    <Footer />
    
    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { authAPI } from '@/api/auth'
import { formatApiError, isValidEmail, validatePassword, saveLoginData } from '@/utils/auth'

export default {
  name: 'Register',
  components: {
    Header,
    Footer
  },
  data() {
    return {
      loading: false,
      countdown: 0,
      submitLocked: false,
      emailStatus: null,
      registerForm: {
        email: '',
        code: '',
        password: '',
        confirmPassword: '',
        name: '',
        organization: '',
        agreement: false
      },
      showToast: false,
      toastMessage: ''
    }
  },
  methods: {
    async sendCode() {
      if (!this.registerForm.email) {
        alert('请先输入邮箱地址')
        return
      }
      
      if (!isValidEmail(this.registerForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      this.loading = true
      try {
        // 直接发送注册验证码，让后端处理邮箱检查
        const response = await authAPI.sendVerificationCode({
          email: this.registerForm.email,
          type: 'REGISTER' // 注册类型，使用大写
        })
        
        if (response.code === 200) {
          alert('验证码已发送到您的邮箱，请查收（测试模式下验证码会显示在后端控制台）')
          this.startCountdown()
        } else {
          // 如果后端返回邮箱已注册的错误，提示用户
          if (response.msg && response.msg.includes('该邮箱已被注册')) {
            alert('该邮箱已被注册，请使用其他邮箱或直接登录')
            this.$router.push('/login')
          } else {
            alert(response.msg || '发送失败，请重试')
          }
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        const errorMessage = formatApiError(error)
        alert(errorMessage)
      } finally {
        this.loading = false
      }
    },
    async handleRegister() {
      console.log('=== 开始处理注册 ===')
      console.log('表单数据:', this.registerForm)
      
      if (this.submitLocked) {
        console.log('提交被锁定，跳过')
        return
      }
      this.submitLocked = true
      setTimeout(() => { this.submitLocked = false }, 1000)
      
      // 表单验证
      console.log('开始表单验证...')
      if (!this.registerForm.email) {
        console.log('邮箱为空，停止处理')
        alert('请输入邮箱地址')
        return
      }
      
      if (!this.registerForm.code) {
        console.log('验证码为空，停止处理')
        alert('请输入验证码')
        return
      }
      
      if (!this.registerForm.password) {
        console.log('密码为空，停止处理')
        alert('请输入密码')
        return
      }
      
      if (!this.registerForm.name) {
        console.log('昵称为空，停止处理')
        alert('请输入昵称')
        return
      }
      
      if (!isValidEmail(this.registerForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }
      
      const passwordValidation = validatePassword(this.registerForm.password)
      if (!passwordValidation.isValid) {
        alert(passwordValidation.message)
        return
      }
      
      if (!this.registerForm.agreement) {
        alert('请同意用户协议和隐私政策')
        return
      }
      
      // 验证验证码格式
      if (!/^\d{6}$/.test(this.registerForm.code)) {
        alert('请输入6位数字验证码')
        return
      }
      
      this.loading = true
      try {
        // 准备注册数据
        const registerData = {
          email: this.registerForm.email,
          verificationCode: this.registerForm.code,
          password: this.registerForm.password,
          confirmPassword: this.registerForm.confirmPassword,
          name: this.registerForm.name,
          institution: this.registerForm.organization || ''
        }
        
        console.log('准备发送注册请求，数据:', registerData)
        console.log('数据类型:', typeof registerData)
        console.log('数据JSON:', JSON.stringify(registerData))
        
        // 调用注册API
        console.log('开始调用注册API...')
        let response
        try {
          response = await authAPI.register(registerData)
          console.log('注册API响应:', response)
        } catch (error) {
          console.error('注册API调用失败:', error)
          throw error
        }
        
        if (response.code === 200) {
          // 注册成功后自动登录
          if (response.data && response.data.accessToken) {
            const loginData = {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              rememberMeToken: response.data.rememberMeToken,
              userInfo: {
                id: response.data.userId,
                email: response.data.email,
                name: response.data.name,
                title: response.data.title,
                institution: response.data.institution
              }
            }
            saveLoginData(loginData)
            this.showSuccessToast('注册成功！已自动登录')
            // 触发用户信息更新事件
            this.$root.$emit('userInfoUpdated')
            
            // 延迟跳转到首页，让用户看到Toast提示
            setTimeout(() => {
              this.$router.push('/home')
            }, 1000)
          } else {
            this.showSuccessToast('注册成功！请使用您的账号登录')
            
            // 延迟跳转到登录页面，让用户看到Toast提示
            setTimeout(() => {
              this.$router.push('/login')
            }, 1000)
          }
          
          // 清除表单数据
          this.registerForm = {
            email: '',
            code: '',
            password: '',
            confirmPassword: '',
            name: '',
            organization: '',
            agreement: false
          }
        } else {
          alert(response.msg || '注册失败，请重试')
        }
      } catch (error) {
        console.error('注册失败:', error)
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
      this.registerForm.code = value
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
    },
    async checkEmailStatus() {
      if (!this.registerForm.email) {
        this.emailStatus = null
        return
      }

      if (!isValidEmail(this.registerForm.email)) {
        this.emailStatus = {
          type: 'error',
          message: '请输入正确的邮箱格式'
        }
        return
      }

      try {
        const response = await authAPI.checkEmail(this.registerForm.email)
        if (response.code === 200) {
          if (response.data === true) {
            this.emailStatus = {
              type: 'error',
              message: '该邮箱已被注册，请使用其他邮箱或直接登录'
            }
          } else {
            this.emailStatus = {
              type: 'success',
              message: '邮箱可用，可以注册'
            }
          }
        } else {
          // 后端在邮箱已注册时会返回非200并附带提示
          const msg = response.msg || '无法检查邮箱状态，请稍后重试'
          if (msg.includes('已被注册')) {
            this.emailStatus = {
              type: 'error',
              message: '该邮箱已被注册，请使用其他邮箱或直接登录'
            }
          } else {
            this.emailStatus = {
              type: 'warning',
              message: msg
            }
          }
        }
      } catch (error) {
        console.error('检查邮箱状态失败:', error)
        this.emailStatus = {
          type: 'warning',
          message: '网络错误，无法检查邮箱状态'
        }
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  background-image: url('@/assets/image/background_login.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: relative;
  justify-content: space-between;
}


.register-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  position: relative;
  z-index: 2;
}


.register-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--space-6);
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.register-box:hover {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
}


.register-header {
  text-align: center;
  margin-bottom: 16px;
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

.register-title {
  font-size: var(--text-2xl);
  color: var(--text-primary);
  font-weight: var(--font-bold);
  margin: 0;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-form {
  width: 100%;
}

.form-group {
  margin-bottom: var(--space-3);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  transition: all var(--transition-normal);
  box-sizing: border-box;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
  transform: translateY(-1px);
}

.form-group input::placeholder,
.form-group select::placeholder {
  color: var(--text-tertiary);
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

.agreement {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  line-height: 1.5;
}

.agreement input {
  margin-right: 8px;
  width: auto;
  margin-top: 2px;
}

.agreement-link {
  color: #007bff;
  text-decoration: none;
  margin: 0 2px;
  transition: color 0.3s ease;
}

.agreement-link:hover {
  color: #0056b3;
}

.register-btn {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow);
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-dark));
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.register-btn:hover:not(:disabled)::before {
  left: 100%;
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}


.email-status {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.email-status.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.email-status.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.email-status.warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

@media (max-width: 480px) {
  .register-box {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .register-title {
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

/* 确保Footer紧贴底部 */
.register-container > .footer {
  margin-top: auto;
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
