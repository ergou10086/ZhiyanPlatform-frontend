<template>
  <div class="login-container">
    <Header />
    
    <div class="login-content">
      <div class="login-box">
      <div class="login-header">
        <div class="user-avatar">
          <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            :alt="'用户头像'"
            class="avatar-image"
          />
          <div v-else class="default-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <h1 class="login-title">欢迎回来,请登录</h1>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">电子邮箱 *</label>
          <input
            type="email"
            id="email"
            v-model="loginForm.email"
            placeholder="请输入邮箱地址"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码 *</label>
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
            记住我
          </label>
        </div>
        
        <div class="form-links">
          <a href="#" @click.prevent="goToForgotPassword" class="forgot-password">
            忘记密码?
          </a>
          <a href="#" @click.prevent="goToRegister" class="register-link">
            没有账号?注册账号
          </a>
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '安全登录' }}
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
import { saveLoginData, formatApiError, isValidEmail } from '@/utils/auth'

export default {
  name: 'Login',
  components: {
    Header,
    Footer
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
      toastMessage: ''
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
          
          console.log('🔐 登录成功，原始用户数据:', response.data.user)
          saveLoginData(loginData)
          
          // 验证保存后的数据
          const savedToken = localStorage.getItem('access_token')
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            const parsed = JSON.parse(savedUserInfo)
            console.log('✅ 保存后的用户信息:', {
              nickname: parsed.nickname,
              avatar: parsed.avatar,
              avatarUrl: parsed.avatarUrl,
              hasAvatar: !!(parsed.avatar || parsed.avatarUrl),
              avatarLength: (parsed.avatar || parsed.avatarUrl || '').length
            })
          }
          
          console.log('数据保存验证:', {
            token: !!savedToken,
            userInfo: !!savedUserInfo
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
}


.login-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  position: relative;
  z-index: 2;
}









.login-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--space-10);
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-box:hover {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
}


.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.user-avatar {
  margin-bottom: var(--space-5);
  display: flex;
  justify-content: center;
}

.avatar-image {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--primary-light);
  box-shadow: var(--shadow-md);
}

.default-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  border: 3px solid var(--primary-light);
  box-shadow: var(--shadow-md);
}

.default-avatar svg {
  color: var(--text-tertiary);
  width: 32px;
  height: 32px;
}

.login-title {
  font-size: var(--text-2xl);
  color: var(--text-primary);
  font-weight: var(--font-bold);
  margin: 0;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.form-group input {
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

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
  transform: translateY(-1px);
}

.form-group input::placeholder {
  color: var(--text-tertiary);
}

.form-options {
  display: flex;
  gap: var(--space-5);
  margin-bottom: var(--space-5);
}

.checkbox-option {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.checkbox-option:hover {
  color: var(--text-primary);
}

.checkbox-option input {
  margin-right: var(--space-2);
  width: auto;
  accent-color: var(--primary-color);
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  gap: var(--space-2);
}

.forgot-password,
.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.forgot-password:hover,
.register-link:hover {
  color: var(--primary-hover);
  background: var(--primary-light);
  transform: translateY(-1px);
}

.login-btn {
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

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow);
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-dark));
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}


/* 响应式设计 */
@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
    gap: var(--space-10);
    padding: var(--space-8) var(--space-10);
  }
}

@media (max-width: 768px) {
  .login-content {
    padding: var(--space-5) var(--space-6);
    gap: var(--space-8);
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: var(--space-4) var(--space-5);
    gap: var(--space-6);
  }
  
  .login-box {
    padding: var(--space-8) var(--space-5);
    margin: var(--space-2);
  }
  
  .login-title {
    font-size: var(--text-xl);
  }
  
  .form-options {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .form-links {
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
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
