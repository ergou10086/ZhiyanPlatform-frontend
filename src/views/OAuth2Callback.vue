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
import { saveLoginData } from '@/utils/auth'

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
        // 从URL获取参数
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const status = urlParams.get('status')
        const message = urlParams.get('message')

        // 从路由或sessionStorage获取provider
        const provider = this.$route.params.provider ||
            sessionStorage.getItem('oauth2_provider') ||
            'unknown'

        console.log('📥 OAuth2回调参数:', {
          provider,
          code: code ? `${code.substring(0, 10)}...` : null,
          state: state ? `${state.substring(0, 10)}...` : null,
          status,
          message: message ? decodeURIComponent(message) : null
        })

        // 处理后端重定向的错误状态
        if (status === 'ERROR') {
          const decodedMessage = message ? decodeURIComponent(message) : '授权失败'
          console.error('❌ 后端返回错误:', decodedMessage)
          throw new Error(decodedMessage)
        }

        // 验证必要参数
        if (!code) {
          console.error('❌ 缺少授权码')
          throw new Error('缺少授权码，请重新登录')
        }

        if (!state) {
          console.error('❌ 缺少state参数')
          throw new Error('缺少state参数，请重新登录')
        }

        // 验证state（防止CSRF攻击）
        const savedState = sessionStorage.getItem('oauth2_state')
        console.log('🔍 State验证:', {
          received: state.substring(0, 10) + '...',
          saved: savedState ? savedState.substring(0, 10) + '...' : 'null'
        })

        if (!savedState) {
          console.warn('⚠️ 未找到保存的state，可能是页面刷新导致')
          // 不阻止流程继续，因为后端也会验证state
        } else if (state !== savedState) {
          console.error('❌ State不匹配')
          throw new Error('State验证失败，可能存在安全风险')
        }

        console.log('✅ State验证通过，调用后端回调接口')

        // 调用后端回调接口
        const response = await authAPI.handleOAuth2Callback(provider, code, state)

        console.log('📥 后端回调响应:', response)

        if (response.code === 200 && response.data) {
          this.handleCallbackResponse(response.data)
        } else {
          throw new Error(response.msg || '授权处理失败')
        }
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

    handleCallbackResponse(data) {
      const { status, loginResponse, oauth2UserInfo, message } = data

      console.log('🔍 处理回调响应, status:', status)

      switch (status) {
        case 'SUCCESS':
          // 直接登录成功
          console.log('✅ 登录成功')
          this.handleLoginSuccess(loginResponse)
          break

        case 'NEED_SUPPLEMENT':
        case 'NEED_BIND':
          // 新用户：补充登录密码后创建账号（邮箱已由OAuth2提供）
          console.log('⚠️ 需要设置密码完成注册')
          sessionStorage.setItem('oauth2_user_info', JSON.stringify(oauth2UserInfo))
          this.loading = false
          this.$router.replace('/oauth2/supplement')
          break

        default:
          throw new Error(message || '未知的响应状态: ' + status)
      }
    },

    async handleLoginSuccess(loginResponse) {
      if (!loginResponse) {
        throw new Error('登录响应数据为空')
      }

      console.log('💾 保存登录数据')
      console.log('📦 登录响应中的用户信息:', loginResponse.user)

      // 保存登录信息
      const loginData = {
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
        rememberMeToken: loginResponse.rememberMeToken,
        userInfo: loginResponse.user
      }

      saveLoginData(loginData)

      // 检查是否是绑定模式
      const isBindMode = sessionStorage.getItem('oauth2_bind_mode') === 'true'

      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      sessionStorage.removeItem('oauth2_bind_mode')

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

      // 触发用户信息更新事件
      this.$root.$emit('userInfoUpdated')

      console.log('✅ 登录数据保存成功，准备跳转')

      // 跳转到目标页面
      this.loading = false

      if (isBindMode) {
        console.log('🔗 绑定模式，跳转到个人信息页面')
        this.$router.replace('/profile')
      } else {
        console.log('🏠 登录模式，跳转到首页')
        this.$router.replace('/home')
      }
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