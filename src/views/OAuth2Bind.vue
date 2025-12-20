<template>
  <div class="oauth2-bind-container">
    <div class="bind-content">
      <!-- 头部 -->
      <div class="header">
        <h2>绑定账号</h2>
        <p>检测到您是首次使用 {{ providerName }} 登录</p>
      </div>

      <!-- 政策说明 -->
      <div class="policy-notice">
        <div class="notice-icon">ℹ️</div>
        <div class="notice-content">
          <p class="notice-title">账号绑定说明</p>
          <p class="notice-text">
            出于账号管理与用户权益保护的考量，本平台不支持未注册用户直接通过 OAuth2 第三方登录创建账号。
            仅当你已注册本平台账号，且该账号绑定的邮箱与第三方登录平台的绑定邮箱完全一致时，方可通过对应第三方渠道登录。
          </p>
          <p class="notice-text">
            若你暂未注册本平台账号，请先前往<router-link to="/register" class="register-link">注册页面</router-link>完成账号创建，
            并确保注册邮箱与第三方平台邮箱一致，即可享受便捷的第三方登录服务。
          </p>
        </div>
      </div>

      <!-- OAuth2用户信息 -->
      <div class="oauth2-info" v-if="oauth2UserInfo">
        <img :src="oauth2UserInfo.avatar || defaultAvatar" :alt="oauth2UserInfo.name" class="avatar">
        <div class="user-name">{{ oauth2UserInfo.name }}</div>
        <div class="user-email" v-if="oauth2UserInfo.email">{{ oauth2UserInfo.email }}</div>
      </div>

      <!-- 绑定已有账号表单 -->
      <div class="form-container">
        <form @submit.prevent="handleBind">
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="bindForm.username" 
              type="email" 
              :placeholder="oauth2UserInfo?.email ? `请输入邮箱（建议使用：${oauth2UserInfo.email}）` : '请输入已注册账号的邮箱'"
              required
            >
            <p class="form-hint" v-if="oauth2UserInfo?.email">
              您的 {{ providerName }} 邮箱：<strong>{{ oauth2UserInfo.email }}</strong>
            </p>
            <p class="form-hint">
              请确保输入的邮箱与您在本平台注册时使用的邮箱一致
            </p>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input 
              v-model="bindForm.password" 
              type="password" 
              placeholder="请输入密码"
              required
            >
          </div>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? '绑定中...' : '绑定账号' }}
          </button>
        </form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="goToRegister" class="btn-register">
          前往注册
        </button>
        <button @click="cancel" class="btn-cancel">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'
import { saveLoginData } from '@/utils/auth'

export default {
  name: 'OAuth2Bind',
  data() {
    return {
      oauth2UserInfo: null,
      bindForm: {
        username: '',
        password: ''
      },
      loading: false,
      defaultAvatar: 'https://via.placeholder.com/80'
    }
  },
  computed: {
    providerName() {
      const names = {
        github: 'GitHub',
        gitee: 'Gitee',
        google: 'Google',
        wechat: '微信'
      }
      return names[this.oauth2UserInfo?.provider] || this.oauth2UserInfo?.provider || '第三方平台'
    }
  },
  mounted() {
    // 从sessionStorage获取OAuth2用户信息
    const oauth2UserInfoStr = sessionStorage.getItem('oauth2_user_info')
    if (oauth2UserInfoStr) {
      try {
        this.oauth2UserInfo = JSON.parse(oauth2UserInfoStr)
        console.log('📥 OAuth2用户信息:', this.oauth2UserInfo)
        
        // 预填充邮箱到绑定表单（如果后端需要）
        if (this.oauth2UserInfo.email) {
          // 可以在这里预填充邮箱提示
        }
      } catch (error) {
        console.error('❌ 解析OAuth2用户信息失败:', error)
        this.$router.replace('/login')
      }
    } else {
      console.error('❌ 未找到OAuth2用户信息')
      this.$router.replace('/login')
    }
  },
  methods: {
    async handleBind() {
      // 验证邮箱是否匹配
      const oauth2Email = this.oauth2UserInfo?.email || sessionStorage.getItem('oauth2_email')
      if (oauth2Email && this.bindForm.username !== oauth2Email && !this.bindForm.username.includes('@')) {
        // 如果输入的是用户名而不是邮箱，提示用户
        const useEmail = window.confirm(
          `为了确保账号安全，请使用与 ${this.providerName} 绑定的邮箱进行绑定。\n\n` +
          `您的 ${this.providerName} 邮箱是：${oauth2Email}\n\n` +
          `是否使用该邮箱进行绑定？`
        )
        if (useEmail) {
          this.bindForm.username = oauth2Email
        }
      }

      this.loading = true
      try {
        const response = await authAPI.bindOAuth2Account({
          provider: this.oauth2UserInfo.provider,
          providerUserId: this.oauth2UserInfo.oauth2UserId,
          email: this.bindForm.username.includes('@') ? this.bindForm.username : oauth2Email,
          password: this.bindForm.password,
          oauth2UserInfo: this.oauth2UserInfo
        })

        if (response.code === 200) {
          console.log('✅ 绑定成功')
          this.handleLoginSuccess(response.data)
        } else {
          // 检查是否是邮箱不匹配的错误
          const errorMsg = response.msg || '绑定失败'
          if (errorMsg.includes('邮箱') || errorMsg.includes('不匹配')) {
            throw new Error(errorMsg + '。请确保使用与第三方平台一致的邮箱进行绑定。')
          }
          throw new Error(errorMsg)
        }
      } catch (error) {
        console.error('❌ 绑定失败:', error)
        alert(error.message || '绑定失败，请重试。如果尚未注册，请先前往注册页面完成账号创建。')
      } finally {
        this.loading = false
      }
    },

    async handleLoginSuccess(loginResponse) {
      // 保存登录信息
      const loginData = {
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
        rememberMeToken: loginResponse.rememberMeToken,
        userInfo: loginResponse.user
      }

      console.log('💾 保存登录数据:', loginData)
      console.log('📦 登录响应中的用户信息:', loginResponse.user)
      saveLoginData(loginData)

      // 重新从服务器获取最新的用户信息，确保包含OAuth2绑定状态
      try {
        const { authAPI } = await import('@/api/auth')
        const { normalizeUserInfo } = await import('@/utils/auth')
        
        const userInfoResponse = await authAPI.getCurrentUserInfo()
        if (userInfoResponse && userInfoResponse.code === 200 && userInfoResponse.data) {
          console.log('📥 从服务器获取最新用户信息（包含OAuth2绑定）:', userInfoResponse.data)
          const normalizedUserInfo = normalizeUserInfo(userInfoResponse.data)
          localStorage.setItem('user_info', JSON.stringify(normalizedUserInfo))
          console.log('✅ 已更新用户信息（包含OAuth2绑定状态）')
          console.log('✅ GitHub ID:', normalizedUserInfo.githubId)
          console.log('✅ GitHub用户名:', normalizedUserInfo.githubUsername)
          console.log('✅ ORCID ID:', normalizedUserInfo.orcidId)
          console.log('✅ ORCID绑定状态:', normalizedUserInfo.orcidBound)
        }
      } catch (error) {
        console.warn('⚠️ 获取最新用户信息失败，使用登录响应中的信息:', error)
      }

      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      sessionStorage.removeItem('oauth2_email')

      // 触发用户信息更新事件
      this.$root.$emit('userInfoUpdated')

      // 跳转到首页
      this.$router.replace('/home')
    },

    goToRegister() {
      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      sessionStorage.removeItem('oauth2_email')
      
      // 跳转到注册页面，并传递邮箱信息（如果有）
      const email = this.oauth2UserInfo?.email
      if (email) {
        this.$router.push({
          path: '/register',
          query: { email: email, from: 'oauth2' }
        })
      } else {
        this.$router.push('/register')
      }
    },
    cancel() {
      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      sessionStorage.removeItem('oauth2_email')
      
      // 返回登录页
      this.$router.replace('/login')
    }
  }
}
</script>

<style scoped>
.oauth2-bind-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #89a8c1 0%, #b8d4e6 100%);
  padding: 20px;
}

.bind-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h2 {
  margin: 0 0 8px;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
}

.header p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

.oauth2-info {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 12px;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.user-email {
  font-size: 14px;
  color: #718096;
}

/* 政策说明 */
.policy-notice {
  margin-bottom: 24px;
  padding: 16px;
  background: #e6f2ff;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  display: flex;
  gap: 12px;
}

.notice-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.notice-text {
  margin: 0 0 8px;
  font-size: 13px;
  color: #4a5568;
  line-height: 1.6;
}

.notice-text:last-child {
  margin-bottom: 0;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}

.form-container {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #718096;
  line-height: 1.5;
}

.form-hint strong {
  color: #667eea;
  font-weight: 600;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-register {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #48bb78;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-register:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-cancel {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #e2e8f0;
  color: #2d3748;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #cbd5e0;
}

/* 暗黑模式 */
.dark-mode .bind-content {
  background: #1a202c;
}

.dark-mode .header h2 {
  color: #f7fafc;
}

.dark-mode .header p {
  color: #a0aec0;
}

.dark-mode .oauth2-info {
  background: #2d3748;
}

.dark-mode .user-name {
  color: #f7fafc;
}

.dark-mode .user-email {
  color: #a0aec0;
}

.dark-mode .policy-notice {
  background: #2d3748;
  border-left-color: #667eea;
}

.dark-mode .notice-title {
  color: #f7fafc;
}

.dark-mode .notice-text {
  color: #cbd5e0;
}

.dark-mode .register-link {
  color: #90cdf4;
}

.dark-mode .form-group label {
  color: #cbd5e0;
}

.dark-mode .form-group input {
  background: #2d3748;
  border-color: #4a5568;
  color: #f7fafc;
}

.dark-mode .btn-register {
  background: #38a169;
}

.dark-mode .btn-register:hover {
  background: #2f855a;
}

.dark-mode .btn-cancel {
  background: #2d3748;
  color: #f7fafc;
}

.dark-mode .btn-cancel:hover {
  background: #4a5568;
}

/* 响应式 */
@media (max-width: 768px) {
  .bind-content {
    padding: 32px 24px;
  }

  .header h2 {
    font-size: 24px;
  }
}
</style>
