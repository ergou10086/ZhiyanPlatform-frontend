<template>
  <div class="register-container">
    <Header />
    
    <div class="register-content">
      <div class="register-box">
      <div class="register-header">
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
          />
        </div>
        
        <div class="form-group">
          <label for="code">验证码 *</label>
          <div class="code-input-group">
            <input
              type="text"
              id="code"
              v-model="registerForm.code"
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
          <label for="gender">性别</label>
          <select id="gender" v-model="registerForm.gender">
            <option value="">请选择性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
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
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

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
      registerForm: {
        email: '',
        code: '',
        password: '',
        confirmPassword: '',
        name: '',
        gender: '',
        organization: '',
        agreement: false
      }
    }
  },
  methods: {
    async sendCode() {
      if (!this.registerForm.email) {
        alert('请先输入邮箱地址')
        return
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.registerForm.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      this.loading = true
      try {
        // 这里添加发送验证码逻辑
        console.log('发送验证码到邮箱:', this.registerForm.email)
        
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
    async handleRegister() {
      if (this.submitLocked) return
      this.submitLocked = true
      setTimeout(() => { this.submitLocked = false }, 1000)
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }
      
      if (this.registerForm.password.length < 6 || this.registerForm.password.length > 16) {
        alert('密码长度必须在6-16位之间')
        return
      }
      
      this.loading = true
      try {
        // 这里添加注册逻辑
        console.log('注册信息:', this.registerForm)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 注册成功后跳转到登录页面
        alert('注册成功！请登录')
        this.$router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
        alert('注册失败，请重试')
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
    }
  }
}
</script>

<style scoped>
.register-container {
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

.register-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}


.register-box {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
}

.register-title {
  font-size: 20px;
  color: #333;
  font-weight: 500;
  margin: 0;
}

.register-form {
  width: 100%;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
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
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  background: #0056b3;
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>
