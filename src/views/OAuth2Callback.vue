<template>
  <div class="oauth2-callback-container">
    <div class="callback-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <h2>正在处理授权...</h2>
        <p>请稍候，我们正在验证您的身份</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h2>授权失败</h2>
        <p>{{ errorMessage }}</p>
        <button @click="goToLogin" class="retry-btn">返回登录</button>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'
import { saveLoginData, normalizeUserInfo } from '@/utils/auth'

export default {
  name: 'OAuth2Callback',
  data() {
    return {
      loading: true,
      error: false,
      errorMessage: ''
    }
  },
  mounted() {
    console.log('🔄 OAuth2Callback 页面加载')
    console.log('📍 当前URL:', window.location.href)
    console.log('📍 Route params:', this.$route.params)
    console.log('📍 Route query:', this.$route.query)

    this.handleCallback()
  },
  methods: {
    async handleCallback() {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const status = urlParams.get('oauth2')
        const message = urlParams.get('message')
        const token = urlParams.get('token')
        const refreshToken = urlParams.get('refreshToken')
        const provider = urlParams.get('provider')

        console.log('📥 OAuth2回调参数:', {
          status,
          provider,
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          message
        })

        if (status !== 'success') {
          const errMsg = message ? decodeURIComponent(message) : '授权失败，请重试'
          throw new Error(errMsg)
        }

        if (!token) {
          throw new Error('未获取到访问令牌，请重试登录')
        }

        await this.handleLoginSuccess({ accessToken: token, refreshToken })
      } catch (error) {
        console.error('❌ OAuth2回调处理失败:', error)
        this.loading = false
        this.error = true
        this.errorMessage = error.message || '授权处理失败，请重试'

        // 3秒后自动跳转到登录页
        setTimeout(() => {
          this.goToLogin()
        }, 3000)
      }
    },

    async handleLoginSuccess(tokenPayload) {
      console.log('💾 保存登录数据')

      saveLoginData({
        accessToken: tokenPayload.accessToken,
        refreshToken: tokenPayload.refreshToken
      })

      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      sessionStorage.removeItem('oauth2_bind_mode')

      // 重新从服务器获取最新的用户信息，确保包含OAuth2绑定状态
      try {
        const userInfoResponse = await authAPI.getCurrentUserInfo()
        if (userInfoResponse && userInfoResponse.code === 200 && userInfoResponse.data) {
          const normalizedUserInfo = normalizeUserInfo(userInfoResponse.data)
          localStorage.setItem('user_info', JSON.stringify(normalizedUserInfo))
          console.log('✅ 已更新用户信息（包含OAuth2绑定状态）')
        }
      } catch (error) {
        console.warn('⚠️ 获取最新用户信息失败，使用token继续', error)
      }

      // 触发用户信息更新事件
      this.$root.$emit('userInfoUpdated')

      console.log('✅ 登录数据保存成功，准备跳转')

      // 跳转到目标页面
      this.loading = false
      this.$router.replace('/home')
    },

    goToLogin() {
      // 清除OAuth2相关数据
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      sessionStorage.removeItem('oauth2_bind_mode')

      this.$router.replace('/login')
    }
  }
}
</script>

<style scoped>
.oauth2-callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.callback-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 500px;
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载状态 */
.loading-state h2 {
  margin: 24px 0 12px;
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
}

.loading-state p {
  color: #718096;
  font-size: 16px;
  margin: 0;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  width: 100%;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-state h2 {
  color: #e53e3e;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px;
}

.error-state p {
  color: #718096;
  font-size: 16px;
  margin: 0 0 24px;
  line-height: 1.5;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 暗黑模式 */
.dark-mode .callback-content {
  background: #1a202c;
}

.dark-mode .loading-state h2,
.dark-mode .error-state h2 {
  color: #f7fafc;
}

.dark-mode .loading-state p,
.dark-mode .error-state p {
  color: #a0aec0;
}

.dark-mode .spinner {
  border-color: #2d3748;
  border-top-color: #667eea;
}

/* 响应式 */
@media (max-width: 768px) {
  .callback-content {
    padding: 32px 24px;
  }

  .loading-state h2,
  .error-state h2 {
    font-size: 20px;
  }

  .loading-state p,
  .error-state p {
    font-size: 14px;
  }

  .error-icon {
    font-size: 48px;
  }
}
</style>