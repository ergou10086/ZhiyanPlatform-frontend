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
          <label class="checkbox-option">
            <input type="checkbox" v-model="loginForm.autoLogin" />
            自动登录
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
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

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
        rememberMe: false,
        autoLogin: false
      }
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
      this.loading = true
      try {
        // 这里添加登录逻辑
        console.log('登录信息:', this.loginForm)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 登录成功后跳转到首页
        this.$router.push('/home')
      } catch (error) {
        console.error('登录失败:', error)
        alert('登录失败，请检查用户名和密码')
      } finally {
        this.loading = false
      }
    },
    goToRegister() {
      this.$router.push('/register')
    },
    goToForgotPassword() {
      this.$router.push('/forgot-password')
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

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(30, 64, 175, 0.9) 100%);
  z-index: 1;
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
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--space-10);
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.login-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color), var(--success-color));
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
</style>
