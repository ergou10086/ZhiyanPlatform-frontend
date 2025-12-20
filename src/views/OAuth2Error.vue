<template>
  <div class="oauth2-error-container">
    <div class="error-content">
      <!-- 错误图标 -->
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#f56565" stroke-width="6" fill="none"></circle>
          <text x="50" y="70" font-size="60" font-weight="bold" fill="#f56565" text-anchor="middle">!</text>
        </svg>
      </div>

      <!-- 错误信息 -->
      <h2>授权失败</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <p class="error-provider" v-if="provider">提供商: {{ providerName }}</p>
      
      <!-- 政策说明（如果需要注册） -->
      <div v-if="needRegister" class="policy-notice">
        <div class="notice-icon">ℹ️</div>
        <div class="notice-content">
          <p class="notice-title">账号注册说明</p>
          <p class="notice-text">
            出于账号管理与用户权益保护的考量，本平台不支持未注册用户直接通过 OAuth2 第三方登录创建账号。
            仅当你已注册本平台账号，且该账号绑定的邮箱与第三方登录平台的绑定邮箱完全一致时，方可通过对应第三方渠道登录。
          </p>
          <p class="notice-text">
            若你暂未注册本平台账号，请先前往注册页面完成账号创建，并确保注册邮箱与第三方平台邮箱一致，即可享受便捷的第三方登录服务。
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button v-if="needRegister" @click="goToRegister" class="btn-register">
          前往注册
        </button>
        <button @click="retry" class="btn-retry" v-if="!needRegister">
          重试
        </button>
        <button @click="goToLogin" class="btn-login">
          {{ needRegister ? '返回登录' : '返回登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OAuth2Error',
  data() {
    return {
      errorMessage: '授权过程中发生错误',
      provider: null,
      needRegister: false
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
      return names[this.provider] || this.provider
    }
  },
  mounted() {
    // 从URL参数获取错误信息
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    const provider = urlParams.get('provider')
    const needRegister = urlParams.get('needRegister')

    if (message) {
      this.errorMessage = decodeURIComponent(message)
    }
    if (provider) {
      this.provider = provider
    }
    if (needRegister === 'true') {
      this.needRegister = true
    }

    console.log('❌ OAuth2错误页面:', { message: this.errorMessage, provider: this.provider, needRegister: this.needRegister })
  },
  methods: {
    retry() {
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      this.$router.replace('/login')
    },
    goToRegister() {
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      this.$router.push('/register')
    },
    goToLogin() {
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      this.$router.replace('/login')
    }
  }
}
</script>

<style scoped>
.oauth2-error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #89a8c1 0%, #b8d4e6 100%);
  padding: 20px;
}

.error-content {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: #f56565;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

h2 {
  margin: 0 0 16px;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
}

.error-message {
  color: #4a5568;
  font-size: 16px;
  margin: 0 0 12px;
  line-height: 1.6;
  word-break: break-word;
}

.error-provider {
  color: #718096;
  font-size: 14px;
  margin: 0 0 24px;
}

/* 政策说明 */
.policy-notice {
  margin: 24px 0;
  padding: 16px;
  background: #e6f2ff;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  text-align: left;
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

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

button {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry {
  background: #667eea;
  color: white;
}

.btn-retry:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-register {
  background: #48bb78;
  color: white;
}

.btn-register:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-login {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-login:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .error-content {
    padding: 32px 24px;
  }

  h2 {
    font-size: 24px;
  }

  .error-message {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}
</style>