<template>
  <div class="register-container">
    <div class="brand-corner">智研</div>
    <div class="register-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.jpg" alt="Logo" class="logo-img" />
        </div>
        <h1 class="system-title" :class="{ animated: animateLogo }">高校科研团队协作与成果管理平台</h1>
        <p class="system-subtitle" :class="{ animated: animateLogo }">University Research Team Collaboration and Achievement Management Platform</p>
      </div>
    </div>
    
    <div class="register-right">
      <div class="register-box">
        <div class="register-header">
          <button class="back-btn" @click="goToLogin" title="返回登录">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>返回登录</span>
          </button>
          <h2 class="register-title">创建账户</h2>
          <p class="register-subtitle">填写信息以创建您的账户</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="email">电子邮箱</label>
            <input
              type="email"
              id="email"
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="code">验证码</label>
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
            <label for="password">密码设置(6-16位)</label>
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
            <label for="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="name">昵称</label>
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
          
          <div class="form-group agreement-group">
            <label class="agreement">
              <input type="checkbox" v-model="registerForm.agreement" required />
              <span>我已阅读并同意<a href="#" class="agreement-link">《隐私政策》</a>和<a href="#" class="agreement-link">《服务协议》</a></span>
            </label>
          </div>
          
          <button type="submit" class="register-btn" :disabled="loading">
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
        </form>
      </div>
    </div>
    
    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
    </div>
    
    <!-- 通用模态弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>提示</h3>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" @click="closeModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'
import { formatApiError, isValidEmail, validatePassword, saveLoginData } from '@/utils/auth'

export default {
  name: 'Register',
  components: {
  },
  data() {
    return {
      loading: false,
      countdown: 0,
      submitLocked: false,
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
      toastMessage: '',
      showModal: false,
      modalMessage: '',
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
      if (!this.registerForm.email) {
        this.showErrorModal('请先输入邮箱地址')
        return
      }
      
      if (!isValidEmail(this.registerForm.email)) {
        this.showErrorModal('请输入正确的邮箱格式')
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
          this.showSuccessToast('验证码已发送到您的邮箱，请查收（测试模式下验证码会显示在后端控制台）')
          this.startCountdown()
        } else {
          // 如果后端返回邮箱已注册的错误，提示用户
          if (response.msg && response.msg.includes('该邮箱已被注册')) {
            this.showErrorModal('该邮箱已被注册，请使用其他邮箱或直接登录')
          } else {
            this.showErrorModal(response.msg || '发送失败，请重试')
          }
        }
      } catch (error) {
          console.error('发送验证码失败:', error)
          const errorMessage = formatApiError(error)
          
          // 检查是否是邮箱已注册的错误
          if (errorMessage.includes('已被注册') || errorMessage.includes('已存在') || 
              errorMessage.includes('已注册') || errorMessage.includes('exists') || 
              errorMessage.includes('registered')) {
            this.showErrorModal('该邮箱已被注册，请使用其他邮箱或直接登录')
          } else {
            this.showErrorModal(errorMessage)
          }
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
        this.showErrorModal('请输入邮箱地址')
        return
      }
      
      if (!this.registerForm.code) {
        console.log('验证码为空，停止处理')
        this.showErrorModal('请输入验证码')
        return
      }
      
      if (!this.registerForm.password) {
        console.log('密码为空，停止处理')
        this.showErrorModal('请输入密码')
        return
      }
      
      if (!this.registerForm.name) {
        console.log('昵称为空，停止处理')
        this.showErrorModal('请输入昵称')
        return
      }
      
      if (!isValidEmail(this.registerForm.email)) {
        this.showErrorModal('请输入正确的邮箱格式')
        return
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.showErrorModal('两次输入的密码不一致')
        return
      }
      
      const passwordValidation = validatePassword(this.registerForm.password)
      if (!passwordValidation.isValid) {
        this.showErrorModal(passwordValidation.message)
        return
      }
      
      if (!this.registerForm.agreement) {
        this.showErrorModal('请同意用户协议和隐私政策')
        return
      }
      
      // 验证验证码格式
      if (!/^\d{6}$/.test(this.registerForm.code)) {
        this.showErrorModal('请输入6位数字验证码')
        return
      }
      
      this.loading = true
      try {
        // 先检查邮箱是否已被注册
        console.log('检查邮箱是否已被注册:', this.registerForm.email)
        const emailCheckResponse = await authAPI.checkEmail(this.registerForm.email)
        console.log('邮箱检查响应:', emailCheckResponse)
        
        // 如果邮箱已被注册，弹窗提示用户
        // 注意：后端返回data=true表示邮箱可用，data=false表示邮箱已注册
        if (emailCheckResponse.code === 200 && emailCheckResponse.data === false) {
          this.showErrorModal('该邮箱已被注册，请使用其他邮箱或直接登录')
          return
        }
        
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
        console.log('注册数据详情:', {
          email: registerData.email,
          verificationCode: registerData.verificationCode,
          password: registerData.password ? '***已设置***' : '未设置',
          confirmPassword: registerData.confirmPassword ? '***已设置***' : '未设置',
          name: registerData.name,
          institution: registerData.institution
        })
        
        let response
        try {
          response = await authAPI.register(registerData)
          console.log('注册API响应:', response)
          console.log('响应状态码:', response.code)
          console.log('响应消息:', response.msg)
          console.log('响应数据:', response.data)
        } catch (error) {
          console.error('注册API调用失败:', error)
          console.error('错误详情:', error.response)
          console.error('错误状态码:', error.response?.status)
          console.error('错误数据:', error.response?.data)
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
          this.showErrorModal(response.msg || '注册失败，请重试')
        }
      } catch (error) {
        console.error('注册失败:', error)
        const errorMessage = formatApiError(error)
        this.showErrorModal(errorMessage)
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
    showErrorModal(message) {
      this.modalMessage = message
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.modalMessage = ''
    },
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  height: 100vh;
  background: #ffffff;
  display: flex;
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.register-left {
  flex: 1;
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.register-left::before {
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

.register-right {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px;
  background: #f8f9fa;
  overflow-y: auto;
}


.register-box {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 48px;
  width: 100%;
  max-width: 500px;
  margin: 20px 0;
}

.register-header {
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

.register-title {
  font-size: 28px;
  color: #2d3748;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.register-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
  font-weight: 400;
}

.register-form {
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

.agreement-group {
  margin-bottom: 20px;
}

.agreement {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  line-height: 1.6;
}

.agreement input {
  margin: 0;
  margin-right: 8px;
  margin-top: 2px;
  width: auto;
  accent-color: #3B82F6;
}

.agreement-link {
  color: #3B82F6;
  text-decoration: none;
  margin: 0 2px;
  transition: color 0.3s ease;
}

.agreement-link:hover {
  color: #2563EB;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}



@media (max-width: 1024px) {
  .register-container {
    flex-direction: column;
  }
  
  .register-left {
    min-height: 300px;
    flex: none;
  }
  
  .register-right {
    min-height: calc(100vh - 300px);
  }
}

@media (max-width: 768px) {
  .register-left {
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
  
  .register-right {
    padding: 30px 20px;
  }
  
  .register-box {
    padding: 32px 24px;
  }
}

@media (max-width: 480px) {
  .register-left {
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
  
  .register-right {
    padding: 20px;
  }
  
  .register-box {
    padding: 24px 20px;
  }
  
  .register-title {
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

/* 模态弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 20px 24px 16px;
  text-align: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 0 24px 20px;
  text-align: center;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e8e8e8;
}

.btn-confirm {
  background: #007bff;
  color: white;
}

.btn-confirm:hover {
  background: #0056b3;
}
</style>
