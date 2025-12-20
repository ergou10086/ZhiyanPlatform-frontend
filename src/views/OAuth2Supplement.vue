<template>
  <div class="oauth2-supplement-container">
    <div class="supplement-content">
      <!-- 头部 -->
      <div class="header">
        <h2>账号注册提示</h2>
        <p>OAuth2 第三方登录需要先完成账号注册</p>
      </div>

      <!-- OAuth2用户信息 -->
      <div class="oauth2-info" v-if="oauth2UserInfo">
        <img :src="oauth2UserInfo.avatar || defaultAvatar" :alt="oauth2UserInfo.name" class="avatar">
        <div class="user-name">{{ oauth2UserInfo.name }}</div>
        <div class="user-provider">来自 {{ providerName }}</div>
      </div>

      <!-- 政策说明 -->
      <div class="policy-notice">
        <div class="notice-icon">⚠️</div>
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
      <div class="action-container">
        <button @click="goToRegister" class="btn-register">
          前往注册页面
        </button>
        <button @click="cancel" class="btn-cancel">
          返回登录
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// import { authAPI } from '@/api/auth'
// import { saveLoginData } from '@/utils/auth'

export default {
  name: 'OAuth2Supplement',
  data() {
    return {
      oauth2UserInfo: null,
      defaultAvatar: 'https://via.placeholder.com/80'
    }
  },
  computed: {
    providerName() {
      const names = {
        github: 'GitHub',
        gitee: 'Gitee',
        google: 'Google',
        wechat: '微信',
        orcid: 'ORCID'
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
    goToRegister() {
      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      
      // 跳转到注册页面
      this.$router.push('/register')
    },
    cancel() {
      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')
      
      // 返回登录页
      this.$router.replace('/login')
    }
  }
}
</script>

<style scoped>
.oauth2-supplement-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #89a8c1 0%, #b8d4e6 100%);
  padding: 20px;
}

.supplement-content {
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

.user-provider {
  font-size: 14px;
  color: #718096;
}

/* 政策说明 */
.policy-notice {
  margin-bottom: 24px;
  padding: 16px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
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
  color: #856404;
}

.notice-text {
  margin: 0 0 8px;
  font-size: 13px;
  color: #856404;
  line-height: 1.6;
}

.notice-text:last-child {
  margin-bottom: 0;
}

/* 操作按钮区域 */
.action-container {
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
.dark-mode .supplement-content {
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

.dark-mode .user-provider {
  color: #a0aec0;
}

.dark-mode .policy-notice {
  background: #2d3748;
  border-left-color: #ffc107;
}

.dark-mode .notice-title {
  color: #ffd54f;
}

.dark-mode .notice-text {
  color: #ffd54f;
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
  .supplement-content {
    padding: 32px 24px;
  }

  .header h2 {
    font-size: 24px;
  }
}
</style>
