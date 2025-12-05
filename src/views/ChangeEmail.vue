<template>
  <div class="change-email-container">
    <div class="brand-corner">智研</div>

    <!-- 左侧品牌区域，与登录/注册保持一致 -->
    <div class="change-email-left">
      <div class="logo-section">
        <div class="logo-placeholder" :class="{ animated: animateLogo }">
          <img src="@/assets/image/logo.svg" alt="Logo" class="logo-img" />
        </div>
        <h1 class="system-title" :class="{ animated: animateLogo }">
          高校科研团队协作与成果管理平台
        </h1>
        <p class="system-subtitle" :class="{ animated: animateLogo }">
          面向科研组织和团队管理的科学研究项目的项目、团队、成果的一体化管理平台
        </p>
      </div>
    </div>

    <!-- 右侧修改邮箱表单区域 -->
    <div class="change-email-right">
      <div class="change-email-box">
        <div class="change-email-header">
          <button class="back-btn" @click="handleBack" title="返回个人信息">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>返回个人信息</span>
          </button>
          <h2 class="change-email-title">修改邮箱</h2>
          <p class="change-email-subtitle">
            为了保障账号安全，需要验证新的邮箱地址和邮箱验证码
          </p>
        </div>

        <form @submit.prevent="handleChangeEmail" class="change-email-form">
          <div class="form-group">
            <label for="oldEmail">当前邮箱</label>
            <input
              type="email"
              id="oldEmail"
              v-model="form.oldEmail"
              placeholder="当前登录邮箱"
              required
              readonly
              class="readonly-input"
            />
          </div>

          <div class="form-group">
            <label for="newEmail">新邮箱<span class="required-asterisk">*</span></label>
            <input
              type="email"
              id="newEmail"
              v-model="form.newEmail"
              placeholder="请输入新的邮箱地址"
              required
            />
          </div>

          <div class="form-group">
            <label for="code">验证码<span class="required-asterisk">*</span></label>
            <div class="code-input-group">
              <input
                type="text"
                id="code"
                v-model="form.verificationCode"
                placeholder="请输入6位验证码"
                maxlength="6"
                pattern="[0-9]{4,6}"
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

          <button type="submit" class="change-email-btn" :disabled="loading">
            {{ loading ? '提交中...' : '确认修改邮箱' }}
          </button>
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
import { formatApiError, isValidEmail } from '@/utils/auth'
import '@/assets/styles/ChangeEmail.css'

export default {
  name: 'ChangeEmail',
  data() {
    return {
      loading: false,
      countdown: 0,
      submitLocked: false,
      form: {
        oldEmail: '',
        newEmail: '',
        verificationCode: ''
      },
      showToast: false,
      toastMessage: '',
      animateLogo: false,
      userId: null
    }
  },  
  created() {
    // 1）优先从路由参数中读取邮箱（例如从忘记密码页跳转时传入）
    const routeEmail = this.$route && this.$route.query
      ? (this.$route.query.email || this.$route.query.oldEmail)
      : null

    if (routeEmail) {
      this.form.oldEmail = routeEmail
    }

    // 2）再从 localStorage 中恢复当前用户信息，补全用户ID / 邮箱
    const savedUserInfo = localStorage.getItem('user_info')
    if (savedUserInfo) {
      try {
        const user = JSON.parse(savedUserInfo)
        this.userId = user.id || user.userId || null

        // 如果还没有从路由里拿到邮箱，则使用登录用户的邮箱
        if (!this.form.oldEmail) {
          this.form.oldEmail = user.email || ''
        }
      } catch (e) {
        console.error('解析 user_info 失败:', e)
      }
    }
  },
  mounted() {
    this.animateLogo = true
  },
  methods: {
    handleBack() {
      // 已登录用户返回个人信息；未登录则返回登录页
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      if (token && userInfo) {
        this.$router.push('/profile')
      } else {
        this.$router.push('/login')
      }
    },
    formatCodeInput(event) {
      let value = event.target.value.replace(/[^0-9]/g, '')
      if (value.length > 6) {
        value = value.substring(0, 6)
      }
      this.form.verificationCode = value
      event.target.value = value
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
    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 1000)
    },
    async sendCode() {
      if (!this.form.newEmail) {
        alert('请先输入新的邮箱地址')
        return
      }

      if (!isValidEmail(this.form.newEmail)) {
        alert('请输入正确的新邮箱格式')
        return
      }

      if (this.form.newEmail === this.form.oldEmail) {
        alert('新邮箱不能与当前邮箱相同')
        return
      }

      this.loading = true
      try {
        const response = await authAPI.sendVerificationCode({
          email: this.form.newEmail,
          type: 'CHANGE_EMAIL'
        })

        if (response.code === 200) {
          alert('验证码已发送到新邮箱，请查收')
          this.startCountdown()
        } else {
          alert(response.msg || '发送验证码失败，请重试')
        }
      } catch (error) {
        console.error('发送修改邮箱验证码失败:', error)
        const errorMessage = formatApiError(error)
        alert(errorMessage)
      } finally {
        this.loading = false
      }
    },
    async handleChangeEmail() {
      if (this.submitLocked) return
      this.submitLocked = true
      setTimeout(() => {
        this.submitLocked = false
      }, 1000)

      if (!this.userId) {
        alert('当前用户信息缺失，请重新登录后再尝试修改邮箱')
        this.$router.push('/login')
        return
      }

      if (!this.form.newEmail) {
        alert('请输入新的邮箱地址')
        return
      }

      if (!isValidEmail(this.form.newEmail)) {
        alert('请输入正确的新邮箱格式')
        return
      }

      if (this.form.newEmail === this.form.oldEmail) {
        alert('新邮箱不能与当前邮箱相同')
        return
      }

      if (!this.form.verificationCode) {
        alert('请输入验证码')
        return
      }

      if (!/^[0-9]{4,6}$/.test(this.form.verificationCode)) {
        alert('请输入4-6位数字验证码')
        return
      }

      this.loading = true
      try {
        const payload = {
          userId: this.userId,
          oldEmail: this.form.oldEmail,
          newEmail: this.form.newEmail,
          verificationCode: this.form.verificationCode
        }

        const response = await authAPI.changeEmail(payload)

        if (response.code === 200) {
          this.showSuccessToast('邮箱修改成功，请使用新邮箱重新登录')

          // 清理本地登录状态，让用户使用新邮箱登录
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('remember_me_token')
          localStorage.removeItem('user_info')
          localStorage.removeItem('userAvatar')
          localStorage.removeItem('globalUserInfo')

          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('userData_')) {
              localStorage.removeItem(key)
            }
          })

          setTimeout(() => {
            this.$router.replace('/login')
          }, 1000)
        } else {
          alert(response.msg || '修改邮箱失败，请重试')
        }
      } catch (error) {
        console.error('修改邮箱失败:', error)
        const errorMessage = formatApiError(error)
        alert(errorMessage)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>


