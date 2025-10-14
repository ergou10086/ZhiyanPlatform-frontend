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
  mounted() {
    // 页面加载时尝试获取用户头像
    this.loadUserAvatar()
  },
  methods: {
    loadUserAvatar() {
      // 从localStorage或API获取用户头像
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        this.userAvatar = savedAvatar
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
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.login-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}


.login-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
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


@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-title {
    font-size: 20px;
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
