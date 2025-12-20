<template>
  <div class="login-container">
    <div class="brand-corner">智研</div>
    <div class="login-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.svg" alt="Logo" class="logo-img" />
        </div>
        <h1 class="system-title" :class="{ animated: animateLogo }">高校科研团队协作与成果管理平台</h1>
        <p class="system-subtitle" :class="{ animated: animateLogo }">
          面向科研组织和团队管理的科学研究项目的项目、团队、成果的一体化管理平台
        </p>
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
            <label for="password">密码或2FA验证码</label>
            <div class="password-input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="loginForm.password"
                placeholder="请输入密码或2FA验证码"
                required
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              >
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <p class="form-hint">如果已启用2FA，可直接输入6位验证码登录</p>
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
          
          <!-- 滑动验证码：只有在输入了邮箱和密码后才允许滑动 -->
          <SliderCaptcha 
            ref="sliderCaptcha"
            :disabled="!loginForm.email || !loginForm.password"
            @verify-success="handleVerifySuccess"
            @verify-failed="handleVerifyFailed"
          />
          
          <button type="submit" class="login-btn" :disabled="loading || !isVerified">
            {{ loading ? '登录中...' : '登录' }}
          </button>
          
          <!-- 第三方登录分隔线 -->
          <div class="divider">
            <span>或使用第三方账号登录</span>
          </div>
          
          <!-- GitHub授权登录按钮 -->
          <button type="button" class="github-login-btn" @click="handleGithubLogin">
            <svg class="github-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            使用 GitHub 登录
          </button>
          
          <!-- ORCID授权登录按钮 -->
          <button type="button" class="orcid-login-btn" @click="handleOrcidLogin">
            <svg class="orcid-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm-2.5 17.5c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5 2.5 1 2.5 2.5-1 2.5-2.5 2.5zm5 0c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5 2.5 1 2.5 2.5-1 2.5-2.5 2.5z"/>
            </svg>
            使用 ORCID 登录
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
        rememberMe: false,
        twoFactorCode: '' // 2FA验证码（可选）
      },
      showPassword: false,
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
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
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
      
      // 验证：必须提供密码或2FA验证码之一
      const inputValue = this.loginForm.password.trim()
      if (!inputValue) {
        alert('请输入密码或2FA验证码')
        return
      }
      
      // 判断是密码还是2FA验证码（2FA验证码是6位数字）
      const isTwoFactorCode = /^\d{6}$/.test(inputValue)
      
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
        // 构建登录请求体
        const loginData = {
          email: this.loginForm.email,
          rememberMe: this.loginForm.rememberMe
        }
        
        // 根据输入判断是密码还是2FA验证码
        if (isTwoFactorCode) {
          loginData.twoFactorCode = inputValue
        } else {
          loginData.password = inputValue
        }
        
        // 调用登录API
        const response = await authAPI.login(loginData)
        
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
    },
    async handleGithubLogin() {
      try {
        console.log('🔐 开始GitHub OAuth2登录流程')
        
        // 调用后端接口获取授权URL
        const response = await authAPI.getOAuth2AuthUrl('github')
        
        if (response.code === 200 && response.data) {
          const { authorizationUrl, state } = response.data
          
          // 保存state到sessionStorage用于回调验证
          sessionStorage.setItem('oauth2_state', state)
          sessionStorage.setItem('oauth2_provider', 'github')
          
          console.log('✅ 获取授权URL成功，跳转到GitHub授权页面')
          console.log('授权URL:', authorizationUrl)
          
          // 跳转到GitHub授权页面
          window.location.href = authorizationUrl
        } else {
          console.error('❌ 获取授权URL失败:', response.msg)
          alert(response.msg || '获取授权URL失败，请稍后重试')
        }
      } catch (error) {
        console.error('❌ GitHub登录失败:', error)
        alert('GitHub登录失败：' + (error.message || '网络错误'))
      }
    },
    async handleOrcidLogin() {
      try {
        console.log('🔐 开始ORCID OAuth2登录流程')
        
        // 调用后端接口获取授权URL
        const response = await authAPI.getOAuth2AuthUrl('orcid')
        
        if (response.code === 200 && response.data) {
          const { authorizationUrl, state } = response.data
          
          // 保存state到sessionStorage用于回调验证
          sessionStorage.setItem('oauth2_state', state)
          sessionStorage.setItem('oauth2_provider', 'orcid')
          
          console.log('✅ 获取授权URL成功，跳转到ORCID授权页面')
          console.log('授权URL:', authorizationUrl)
          
          // 跳转到ORCID授权页面
          window.location.href = authorizationUrl
        } else {
          console.error('❌ 获取授权URL失败:', response.msg)
          alert(response.msg || '获取授权URL失败，请稍后重试')
        }
      } catch (error) {
        console.error('❌ ORCID登录失败:', error)
        alert('ORCID登录失败：' + (error.message || '网络错误'))
      }
    }
  }
}
</script>

