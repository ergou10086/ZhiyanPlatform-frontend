<template>
  <div class="login-container">
    <Header />
    
    <div class="login-content">
      <!-- 左侧文字信息 -->
      <div class="login-info">
        <div class="info-content">
          <div class="brand-title">智研</div>
          <h1 class="platform-title">高校科研团队协作与成果管理平台</h1>
          <p class="platform-description">旨在为科研团队提供一个"一体化、规范化、可沉淀"的协作环境</p>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-form-section">
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

.login-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 60px;
  gap: 60px;
}


/* 左侧信息区域 */
.login-info {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-right: 40px;
  padding-bottom: 60px;
}

.info-content {
  max-width: 700px;
  text-align: center;
  width: 100%;
}

.platform-title {
  font-size: 32px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 80px 0;
  line-height: 1.2;
  text-shadow: 
    0 2px 6px rgba(102, 126, 234, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: titleGentle 5s ease-in-out infinite;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.platform-title::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -8px;
  right: -8px;
  bottom: -3px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
  border-radius: 12px;
  z-index: -1;
  animation: titleSoftPulse 6s ease-in-out infinite;
}

.platform-description {
  font-size: 18px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
  text-shadow: 
    0 1px 3px rgba(255, 255, 255, 0.6),
    0 2px 6px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.15);
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: descriptionGentle 6s ease-in-out infinite;
}

.platform-description::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(102, 126, 234, 0.1) 0%, 
    transparent 50%, 
    rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  z-index: -1;
  animation: descriptionShimmer 6s ease-in-out infinite;
}

@keyframes titleGentle {
  0%, 100% { 
    transform: translateY(0px);
    text-shadow: 
      0 2px 6px rgba(102, 126, 234, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.2);
  }
  50% { 
    transform: translateY(-1px);
    text-shadow: 
      0 3px 8px rgba(102, 126, 234, 0.4),
      0 5px 15px rgba(0, 0, 0, 0.25);
  }
}

@keyframes titleSoftPulse {
  0%, 100% { 
    opacity: 0.4;
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.01);
  }
}

@keyframes descriptionGentle {
  0%, 100% { 
    transform: translateY(0px);
    opacity: 1;
  }
  50% { 
    transform: translateY(-1px);
    opacity: 0.95;
  }
}

@keyframes descriptionShimmer {
  0%, 100% { 
    opacity: 0.2;
  }
  50% { 
    opacity: 0.4;
  }
}

/* 右侧登录区域 */
.login-form-section {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.brand-title {
  font-size: 96px;
  font-weight: 700;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  color: #667eea;
  margin: 0 0 60px 0;
  text-shadow: 
    0 2px 8px rgba(102, 126, 234, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.1);
  letter-spacing: 12px;
  position: relative;
  text-align: center;
  text-transform: uppercase;
  display: inline-block;
  padding: 15px 25px;
  border: 3px solid #667eea;
  border-radius: 15px;
  background: rgba(102, 126, 234, 0.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}



.login-box {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.user-avatar {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e1e5e9;
}

.default-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.default-avatar svg {
  color: #666;
}

.login-title {
  font-size: 24px;
  color: #333;
  font-weight: 500;
  margin: 0;
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

.form-options {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox-option input {
  margin-right: 8px;
  width: auto;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.forgot-password,
.register-link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.forgot-password:hover,
.register-link:hover {
  color: #0056b3;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background: #0056b3;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}


/* 响应式设计 */
@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
    gap: 40px;
    padding: 30px 40px;
  }
  
  .login-info {
    padding-right: 0;
    padding-bottom: 40px;
    text-align: center;
  }
  
  .info-content {
    text-align: center;
  }
  
  .platform-title {
    font-size: 28px;
    white-space: normal;
    line-height: 1.3;
    margin-bottom: 30px;
  }
  
  .platform-description {
    font-size: 16px;
    padding: 12px 18px;
    white-space: normal;
    line-height: 1.4;
  }
  
  .brand-title {
    font-size: 80px;
    text-align: center;
    letter-spacing: 12px;
  }
}

@media (max-width: 768px) {
  .login-content {
    padding: 20px 30px;
    gap: 30px;
  }
  
  .platform-title {
    font-size: 24px;
    white-space: normal;
    line-height: 1.3;
    margin-bottom: 25px;
  }
  
  .platform-description {
    font-size: 15px;
    padding: 10px 16px;
    white-space: normal;
    line-height: 1.4;
  }
  
  .brand-title {
    font-size: 64px;
    text-align: center;
    letter-spacing: 8px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 15px 20px;
    gap: 20px;
  }
  
  .login-box {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-title {
    font-size: 20px;
  }
  
  .platform-title {
    font-size: 20px;
    white-space: normal;
    line-height: 1.3;
    margin-bottom: 20px;
  }
  
  .platform-description {
    font-size: 14px;
    padding: 8px 12px;
    white-space: normal;
    line-height: 1.4;
  }
  
  .brand-title {
    font-size: 48px;
    text-align: center;
    letter-spacing: 6px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-links {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
