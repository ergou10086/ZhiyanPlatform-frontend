<template>
  <div class="login-container">
    <div class="brand-corner">智研</div>
    <div class="login-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.jpg" alt="Logo" class="logo-img" />
        </div>
        <h1 class="system-title" :class="{ animated: animateLogo }">高校科研团队协作与成果管理平台</h1>
        <p class="system-subtitle" :class="{ animated: animateLogo }">University Research Team Collaboration and Achievement Management Platform</p>
      </div>
    </div>
    
    <div class="login-right">
      <div class="login-box">
        <div class="login-header">
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">请登录您的账户</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">电子邮箱</label>
            <input
              type="email"
              id="email"
              v-model="loginForm.email"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              required
            />
          </div>
          
          <div class="form-options">
            <label class="checkbox-option">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>记住我</span>
            </label>
            <a href="#" @click.prevent="goToForgotPassword" class="forgot-password">
              忘记密码？
            </a>
          </div>
          
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
          
          <div class="register-link">
            <span>还没有账号？</span>
            <a href="#" @click.prevent="goToRegister">立即注册</a>
          </div>
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
import { saveLoginData, formatApiError, isValidEmail } from '@/utils/auth'

export default {
  name: 'Login',
  components: {
  },
  data() {
    return {
      loading: false,
      submitLocked: false,
      userAvatar: null, // 用户头像URL，可以从localStorage或API获取
      loginForm: {
        email: '',
        password: '',
        rememberMe: false
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
  watch: {
    'loginForm.email': {
      handler(newEmail) {
        if (newEmail) {
          this.loadUserAvatarByEmail(newEmail)
        } else {
          // 没有输入时，保持默认头像显示
          this.userAvatar = null
        }
      },
      immediate: false
    }
  },
  mounted() {
    // 页面加载时保持默认头像状态
    this.userAvatar = null
  },
  methods: {
    loadUserAvatar() {
      // 从localStorage或API获取用户头像
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        this.userAvatar = savedAvatar
      }
    },
    loadUserAvatarByEmail(email) {
      // 根据邮箱加载用户头像
      // 这里可以模拟从数据库获取用户信息
      // 实际项目中应该调用API
      this.simulateLoadUserByEmail(email)
    },
    simulateLoadUserByEmail(email) {
      // 模拟从数据库加载用户信息
      // 这里使用localStorage模拟数据库存储
      const userData = localStorage.getItem('userData_' + email)
      if (userData) {
        const user = JSON.parse(userData)
        this.userAvatar = user.avatar || null
      } else {
        // 如果没有找到用户数据，清空头像
        this.userAvatar = null
      }
    },
    setUserAvatar(avatarUrl) {
      // 设置用户头像的方法
      this.userAvatar = avatarUrl
      localStorage.setItem('userAvatar', avatarUrl)
    },
    async handleLogin() {
      if (this.submitLocked) return
      this.submitLocked = true
      setTimeout(() => { this.submitLocked = false }, 1000)
      
      // 表单验证
      if (!this.loginForm.email) {
        alert('请输入邮箱地址')
        return
      }
      
      if (!this.loginForm.password) {
        alert('请输入密码')
        return
      }
      
      if (!isValidEmail(this.loginForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      this.loading = true
      try {
        // 调用登录API
        const response = await authAPI.login({
          email: this.loginForm.email,
          password: this.loginForm.password,
          rememberMe: this.loginForm.rememberMe
        })
        
        if (response.code === 200 && response.data) {
          // 保存登录信息
          const loginData = {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            rememberMeToken: response.data.rememberMeToken,
            userInfo: response.data.user
          }
          
          console.log('登录成功，保存数据:', loginData)
          saveLoginData(loginData)
          
          // 验证数据是否保存成功
          const savedToken = localStorage.getItem('access_token')
          const savedUserInfo = localStorage.getItem('user_info')
          console.log('数据保存验证:', {
            token: !!savedToken,
            userInfo: !!savedUserInfo,
            tokenValue: savedToken,
            userInfoValue: savedUserInfo
          })
          
          // 显示成功消息
          this.showSuccessToast('登录成功！')
          
          // 触发用户信息更新事件
          this.$root.$emit('userInfoUpdated')
          
          // 延迟跳转到首页，让用户看到Toast提示
          setTimeout(() => {
            this.$router.replace('/home')
          }, 1000)
        } else {
          alert(response.msg || '登录失败，请检查邮箱和密码')
        }
      } catch (error) {
        console.error('登录失败:', error)
        const errorMessage = formatApiError(error)
        alert(errorMessage)
      } finally {
        this.loading = false
      }
    },
    goToRegister() {
      this.$router.push('/register')
    },
    goToForgotPassword() {
      this.$router.push('/forgot-password')
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
.login-container {
  min-height: 100vh;
  height: 100vh;
  background: #ffffff;
  display: flex;
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-left::before {
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

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f8f9fa;
}





.login-box {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 48px;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  color: #2d3748;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
  font-weight: 400;
}


.login-form {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
}

.checkbox-option span {
  margin-left: 8px;
}

.checkbox-option input {
  margin: 0;
  width: auto;
  accent-color: #3B82F6;
}

.forgot-password {
  color: #3B82F6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #2563EB;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #718096;
}

.register-link a {
  color: #3B82F6;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #2563EB;
}

.login-btn {
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
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}


/* 响应式设计 */
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    min-height: 300px;
    flex: none;
  }
  
  .login-right {
    min-height: calc(100vh - 300px);
  }
}

@media (max-width: 768px) {
  .login-left {
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
  
  .login-right {
    padding: 30px 20px;
  }
  
  .login-box {
    padding: 32px 24px;
  }
}

@media (max-width: 480px) {
  .login-left {
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
  
  .login-right {
    padding: 20px;
  }
  
  .login-box {
    padding: 24px 20px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* 成功提示Toast样式 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 9999;
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
