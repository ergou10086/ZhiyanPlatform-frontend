<template>
  <div class="register-container">
    <div class="brand-corner">智研</div>
    <div class="register-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.svg" alt="Logo" class="logo-img" />
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
            <label for="email">电子邮箱<span class="required-asterisk">*</span></label>
            <input
              type="email"
              id="email"
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="code">验证码<span class="required-asterisk">*</span></label>
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
            <label for="password">密码设置(6-16位)<span class="required-asterisk">*</span></label>
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
            <label for="confirmPassword">确认密码<span class="required-asterisk">*</span></label>
            <input
              type="password"
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="name">昵称<span class="required-asterisk">*</span></label>
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
          
          <!-- 滑动验证码 -->
          <SliderCaptcha 
            ref="sliderCaptcha"
            @verify-success="handleVerifySuccess"
            @verify-failed="handleVerifyFailed"
          />
          
          <button type="submit" class="register-btn" :disabled="loading || !isVerified">
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
import SliderCaptcha from '@/components/SliderCaptcha.vue'
import '@/assets/styles/Register.css'

export default {
  name: 'Register',
  components: {
    SliderCaptcha
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
      
      // 验证滑动验证码
      if (!this.isVerified) {
        this.showErrorModal('请完成滑动验证')
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
    handleVerifySuccess() {
      this.isVerified = true
    },
    handleVerifyFailed() {
      this.isVerified = false
    }
  }
}
</script>
