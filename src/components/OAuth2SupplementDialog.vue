<template>
  <div class="oauth2-supplement-dialog-overlay" @click.self="handleCancel">
    <div class="oauth2-supplement-dialog">
      <div class="dialog-header">
        <h2>补充账号信息</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>

      <div class="dialog-body">
        <!-- OAuth2用户信息展示 -->
        <div class="oauth2-user-info">
          <img :src="oauth2UserInfo.avatarUrl" alt="头像" class="avatar" />
          <div class="user-details">
            <h3>{{ oauth2UserInfo.nickname || oauth2UserInfo.username }}</h3>
            <p class="provider">来自 {{ providerName }}</p>
          </div>
        </div>

        <div class="info-message">
          <p>
            <strong>⚠️ 需要先注册账号</strong>
          </p>
          <p>
            {{ providerName }} 未提供邮箱信息，无法直接通过第三方登录创建账号。
          </p>
        </div>

        <!-- 政策说明 -->
        <div class="policy-notice">
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
        <div class="action-container">
          <router-link to="/register" class="register-btn" @click.native="handleCancel">
            前往注册页面
          </router-link>
          <button @click="handleCancel" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { authAPI } from '@/api/auth'

export default {
  name: 'OAuth2SupplementDialog',
  props: {
    oauth2UserInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
    }
  },
  computed: {
    providerName() {
      const names = {
        github: 'GitHub',
        google: 'Google',
        gitlab: 'GitLab'
      }
      return names[this.oauth2UserInfo.provider] || this.oauth2UserInfo.provider
    }
  },
  methods: {
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.oauth2-supplement-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.oauth2-supplement-dialog {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #2d3748;
}

.dialog-body {
  padding: 32px;
}

/* OAuth2用户信息 */
.oauth2-user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 24px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-details h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.user-details .provider {
  margin: 0;
  font-size: 12px;
  color: #a0aec0;
}

/* 信息提示 */
.info-message {
  margin-bottom: 24px;
  padding: 16px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  line-height: 1.6;
}

.info-message p {
  margin: 0 0 8px;
}

.info-message p:last-child {
  margin-bottom: 0;
}

.info-message strong {
  color: #856404;
  font-weight: 600;
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

/* 操作按钮区域 */
.action-container {
  display: flex;
  gap: 12px;
}

.register-btn {
  flex: 1;
  display: inline-block;
  padding: 14px 24px;
  background: #48bb78;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.register-btn:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.cancel-btn {
  flex: 1;
  padding: 14px 24px;
  background: #e2e8f0;
  color: #2d3748;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

/* 暗黑模式 */
.dark-mode .oauth2-supplement-dialog {
  background: #1a202c;
}

.dark-mode .dialog-header {
  border-bottom-color: #2d3748;
}

.dark-mode .dialog-header h2 {
  color: #f7fafc;
}

.dark-mode .oauth2-user-info {
  background: #2d3748;
}

.dark-mode .user-details h3 {
  color: #f7fafc;
}

.dark-mode .info-message {
  background: #2d3748;
  border-left-color: #ffc107;
  color: #ffd54f;
}

.dark-mode .info-message strong {
  color: #ffd54f;
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

.dark-mode .register-btn {
  background: #38a169;
}

.dark-mode .register-btn:hover {
  background: #2f855a;
}

.dark-mode .cancel-btn {
  background: #2d3748;
  color: #f7fafc;
}

.dark-mode .cancel-btn:hover {
  background: #4a5568;
}

/* 响应式 */
@media (max-width: 768px) {
  .dialog-header {
    padding: 20px 24px;
  }

  .dialog-header h2 {
    font-size: 20px;
  }

  .dialog-body {
    padding: 24px;
  }

  .oauth2-user-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>

