<template>
  <div class="oauth2-callback-container">
    <div class="callback-content">
      <!-- 加载状态 -->
      <div class="loading-state">
        <div class="spinner"></div>
        <h2>正在处理授权...</h2>
        <p>请稍候，我们正在验证您的身份</p>
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
      loading: true
    }
  },
  mounted() {
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
        const token = urlParams.get('token')
        const refreshToken = urlParams.get('refreshToken')
        const message = urlParams.get('message')
        const provider = this.$route.params.provider || sessionStorage.getItem('oauth2_provider') || 'github'

        console.log('📥 OAuth2回调参数:', { code, state, status, provider })
        console.log('📥 当前URL:', window.location.href)

        // 检查是否是后端重定向过来的（带有status参数）
        if (status) {
          console.log('✅ 检测到后端重定向，status:', status)
          
          // 处理错误状态
          if (status === 'ERROR') {
            throw new Error(decodeURIComponent(message || '授权失败'))
          }

          // 处理登录成功
          if (status === 'SUCCESS' && token) {
            console.log('✅ 登录成功，但需要获取用户信息')
            // 虽然有token，但是需要调用后端API获取完整的登录响应（包括用户信息）
            const response = await authAPI.handleOAuth2Callback(provider, code, state)
            if (response.code === 200 && response.data) {
              this.handleCallbackResponse(response.data)
            } else {
              throw new Error(response.msg || '获取用户信息失败')
            }
            return
          }

          // 处理需要绑定账号
          if (status === 'NEED_BIND') {
            console.log('⚠️ 需要绑定或创建账号，调用后端API获取详细信息')
            // 需要调用后端API获取OAuth2用户信息
            const response = await authAPI.handleOAuth2Callback(provider, code, state)
            if (response.code === 200 && response.data) {
              this.handleCallbackResponse(response.data)
            } else {
              throw new Error(response.msg || '获取用户信息失败')
            }
            return
          }

          // 处理需要补充信息
          if (status === 'NEED_SUPPLEMENT') {
            console.log('⚠️ 需要补充信息，调用后端API获取详细信息')
            const response = await authAPI.handleOAuth2Callback(provider, code, state)
            if (response.code === 200 && response.data) {
              this.handleCallbackResponse(response.data)
            } else {
              throw new Error(response.msg || '获取用户信息失败')
            }
            return
          }
        }

        // 如果没有status参数，说明是旧的流程，直接调用后端API
        console.log('📞 调用后端回调API')

        // 验证参数
        if (!code || !state) {
          throw new Error('缺少必要的授权参数（code 或 state）')
        }

        // 验证state
        const savedState = sessionStorage.getItem('oauth2_state')
        if (state !== savedState) {
          console.warn('⚠️ state 不匹配:', { saved: savedState, received: state })
          throw new Error('状态验证失败，可能存在安全风险')
        }

        console.log('✅ state 验证通过，调用后端回调接口')

        // 调用后端回调接口
        const response = await authAPI.handleOAuth2Callback(provider, code, state)

        console.log('📥 OAuth2回调响应:', response)

        if (response.code === 200 && response.data) {
          this.handleCallbackResponse(response.data)
        } else {
          throw new Error(response.msg || '授权处理失败')
        }
      } catch (error) {
        console.error('❌ OAuth2回调处理失败:', error)
        
        // 重定向到错误页面
        const errorMessage = encodeURIComponent(error.message || '授权处理失败，请重试')
        const provider = this.$route.params.provider || sessionStorage.getItem('oauth2_provider') || 'unknown'
        this.$router.replace(`/oauth2/error?message=${errorMessage}&provider=${provider}`)
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

        case 'NEED_BIND':
          // 需要绑定或创建账号 - 重定向到独立页面
          console.log('⚠️ 需要绑定或创建账号，重定向到绑定页面')
          sessionStorage.setItem('oauth2_user_info', JSON.stringify(oauth2UserInfo))
          this.$router.replace('/oauth2/bind')
          break

        case 'NEED_SUPPLEMENT':
          // 需要补充信息 - 重定向到独立页面
          console.log('⚠️ 需要补充信息，重定向到补充信息页面')
          sessionStorage.setItem('oauth2_user_info', JSON.stringify(oauth2UserInfo))
          this.$router.replace('/oauth2/supplement')
          break

        default:
          throw new Error(message || '未知的响应状态')
      }
    },

    handleLoginSuccess(loginResponse) {
      // 保存登录信息
      const loginData = {
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
        rememberMeToken: loginResponse.rememberMeToken,
        userInfo: loginResponse.user
      }

      console.log('💾 保存登录数据:', loginData)
      saveLoginData(loginData)

      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')

      // 触发用户信息更新事件
      this.$root.$emit('userInfoUpdated')

      // 跳转到首页
      this.$router.replace('/home')
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

/* 暗黑模式 */
.dark-mode .callback-content {
  background: #1a202c;
}

.dark-mode .loading-state h2 {
  color: #f7fafc;
}

.dark-mode .loading-state p {
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

  .loading-state h2 {
    font-size: 20px;
  }

  .loading-state p {
    font-size: 14px;
  }
}
</style>
