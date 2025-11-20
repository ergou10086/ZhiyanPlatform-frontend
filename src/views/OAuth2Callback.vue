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
        <p class="error-message">{{ errorMessage }}</p>
        <button @click="backToLogin" class="back-btn">返回登录</button>
      </div>
    </div>

    <!-- 绑定/创建账号弹窗 -->
    <OAuth2BindDialog
      v-if="showBindDialog"
      :oauth2-user-info="oauth2UserInfo"
      @bind-success="handleBindSuccess"
      @create-success="handleCreateSuccess"
      @cancel="handleCancel"
    />

    <!-- 补充信息弹窗 -->
    <OAuth2SupplementDialog
      v-if="showSupplementDialog"
      :oauth2-user-info="oauth2UserInfo"
      @supplement-success="handleSupplementSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'
import { saveLoginData } from '@/utils/auth'
import OAuth2BindDialog from '@/components/OAuth2BindDialog.vue'
import OAuth2SupplementDialog from '@/components/OAuth2SupplementDialog.vue'

export default {
  name: 'OAuth2Callback',
  components: {
    OAuth2BindDialog,
    OAuth2SupplementDialog
  },
  data() {
    return {
      loading: true,
      error: false,
      errorMessage: '',
      showBindDialog: false,
      showSupplementDialog: false,
      oauth2UserInfo: null
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
            console.log('✅ 登录成功，直接跳转')
            const loginResponse = {
              accessToken: token,
              refreshToken: refreshToken || null
            }
            this.handleLoginSuccess(loginResponse)
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
        this.error = true
        this.errorMessage = error.message || '授权处理失败，请重试'
        this.loading = false
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
          // 需要绑定或创建账号
          console.log('⚠️ 需要绑定或创建账号')
          this.loading = false
          this.oauth2UserInfo = oauth2UserInfo
          this.showBindDialog = true
          break

        case 'NEED_SUPPLEMENT':
          // 需要补充信息
          console.log('⚠️ 需要补充信息')
          this.loading = false
          this.oauth2UserInfo = oauth2UserInfo
          this.showSupplementDialog = true
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

      // 触发用户信息更新事件
      this.$root.$emit('userInfoUpdated')

      // 跳转到首页
      this.$router.replace('/home')
    },

    handleBindSuccess(loginResponse) {
      console.log('✅ 绑定成功')
      this.showBindDialog = false
      this.handleLoginSuccess(loginResponse)
    },

    handleCreateSuccess(loginResponse) {
      console.log('✅ 创建账号成功')
      this.showBindDialog = false
      this.handleLoginSuccess(loginResponse)
    },

    handleSupplementSuccess(loginResponse) {
      console.log('✅ 补充信息成功')
      this.showSupplementDialog = false
      this.handleLoginSuccess(loginResponse)
    },

    handleCancel() {
      console.log('❌ 用户取消操作')
      this.showBindDialog = false
      this.showSupplementDialog = false
      this.backToLogin()
    },

    backToLogin() {
      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      
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
.error-state .error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-state h2 {
  margin: 16px 0 12px;
  color: #e53e3e;
  font-size: 24px;
  font-weight: 600;
}

.error-message {
  color: #718096;
  font-size: 16px;
  margin: 0 0 32px;
  line-height: 1.6;
}

.back-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
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
.dark-mode .error-message {
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
  .error-message {
    font-size: 14px;
  }
}
</style>
