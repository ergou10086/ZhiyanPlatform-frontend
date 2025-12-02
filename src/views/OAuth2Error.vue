<template>
  <div class="oauth2-error-container">
    <div class="error-content">
      <!-- 错误图标 -->
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>

      <!-- 错误信息 -->
      <h2>授权失败</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <p class="error-provider" v-if="provider">提供商: {{ providerName }}</p>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="retry" class="btn-retry">
          重试
        </button>
        <button @click="goToLogin" class="btn-login">
          返回登录
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
      provider: null
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

    if (message) {
      this.errorMessage = decodeURIComponent(message)
    }
    if (provider) {
      this.provider = provider
    }

    console.log('❌ OAuth2错误页面:', { message: this.errorMessage, provider: this.provider })
  },
  methods: {
    retry() {
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      this.$router.replace('/login')
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  margin: 0 0 32px;
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