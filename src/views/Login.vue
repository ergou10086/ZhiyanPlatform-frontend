<template>
  <div class="login-container">
    <div class="brand-corner">智研</div>
    <div class="login-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.svg" alt="Logo" class="logo-img" />
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
          
          <!-- 滑动验证码 -->
          <SliderCaptcha 
            ref="sliderCaptcha"
            @verify-success="handleVerifySuccess"
            @verify-failed="handleVerifyFailed"
          />
          
          <button type="submit" class="login-btn" :disabled="loading || !isVerified">
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
import SliderCaptcha from '@/components/SliderCaptcha.vue'
import '@/assets/styles/Login.css'

export default {
  name: 'Login',
  components: {
    SliderCaptcha
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
      animateLogo: false,
      isVerified: false // 滑动验证是否通过
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
      
      // 验证滑动验证码
      if (!this.isVerified) {
        alert('请完成滑动验证')
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
    },
    handleVerifySuccess() {
      this.isVerified = true
    },
    handleVerifyFailed() {
      this.isVerified = false
    }
  }
}
</script>

