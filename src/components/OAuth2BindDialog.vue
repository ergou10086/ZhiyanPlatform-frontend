<template>
  <div class="oauth2-bind-dialog-overlay" @click.self="handleCancel">
    <div class="oauth2-bind-dialog">
      <div class="dialog-header">
        <h2>完成账号设置</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>

      <div class="dialog-body">
        <!-- OAuth2用户信息展示 -->
        <div class="oauth2-user-info">
          <img :src="oauth2UserInfo.avatarUrl" alt="头像" class="avatar" />
          <div class="user-details">
            <h3>{{ oauth2UserInfo.nickname || oauth2UserInfo.username }}</h3>
            <p v-if="oauth2UserInfo.email" class="email">{{ oauth2UserInfo.email }}</p>
            <p class="provider">来自 {{ providerName }}</p>
          </div>
        </div>

        <div class="info-message">
          <p v-if="oauth2UserInfo.email">
            检测到邮箱 <strong>{{ oauth2UserInfo.email }}</strong> 未注册
          </p>
          <p v-else>
            未获取到邮箱信息
          </p>
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

        <!-- 绑定已有账号表单 -->
        <form @submit.prevent="handleBind" class="bind-form">
          <div class="form-group">
            <label>邮箱</label>
            <input
              type="email"
              v-model="bindForm.email"
              placeholder="请输入已有账号的邮箱"
              required
            />
            <p class="hint" v-if="oauth2UserInfo.email">
              您的 {{ providerName }} 邮箱：<strong>{{ oauth2UserInfo.email }}</strong>
            </p>
            <p class="hint">
              请确保输入的邮箱与您在本平台注册时使用的邮箱一致
            </p>
          </div>

          <div class="form-group">
            <label>密码</label>
            <input
              type="password"
              v-model="bindForm.password"
              placeholder="请输入已有账号的密码"
              required
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="binding">
            {{ binding ? '绑定中...' : '绑定账号' }}
          </button>
        </form>

        <!-- 前往注册按钮 -->
        <div class="register-action">
          <p class="register-hint">还没有账号？</p>
          <router-link to="/register" class="register-btn" @click.native="handleCancel">
            前往注册页面
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'

export default {
  name: 'OAuth2BindDialog',
  props: {
    oauth2UserInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      binding: false,
      bindForm: {
        email: this.oauth2UserInfo?.email || '',
        password: ''
      }
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
    async handleBind() {
      if (this.binding) return

      // 验证邮箱
      if (!this.bindForm.email) {
        alert('请输入邮箱')
        return
      }

      if (!this.bindForm.password) {
        alert('请输入密码')
        return
      }

      // 如果OAuth2提供了邮箱，必须使用该邮箱
      if (this.oauth2UserInfo.email && this.bindForm.email !== this.oauth2UserInfo.email) {
        const confirm = window.confirm(
          `为了确保账号安全，请使用与 ${this.providerName} 绑定的邮箱进行绑定。\n\n` +
          `您的 ${this.providerName} 邮箱是：${this.oauth2UserInfo.email}\n\n` +
          `是否使用该邮箱进行绑定？`
        )
        if (!confirm) {
          this.bindForm.email = this.oauth2UserInfo.email
          return
        }
      }

      this.binding = true

      try {
        const response = await authAPI.bindOAuth2Account({
          provider: this.oauth2UserInfo.provider,
          providerUserId: this.oauth2UserInfo.providerUserId,
          email: this.bindForm.email,
          password: this.bindForm.password,
          oauth2UserInfo: this.oauth2UserInfo
        })

        if (response.code === 200 && response.data?.status === 'SUCCESS') {
          console.log('✅ 绑定成功')
          this.$emit('bind-success', response.data.loginResponse)
        } else {
          const errorMsg = response.msg || '绑定失败，请检查邮箱和密码'
          // 检查是否是邮箱不匹配的错误
          if (errorMsg.includes('邮箱') || errorMsg.includes('不匹配')) {
            alert(errorMsg + '。请确保使用与第三方平台一致的邮箱进行绑定。如果尚未注册，请先前往注册页面完成账号创建。')
          } else {
            alert(errorMsg)
          }
        }
      } catch (error) {
        console.error('❌ 绑定失败:', error)
        alert(error.message || '绑定失败，请重试')
      } finally {
        this.binding = false
      }
    },


    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.oauth2-bind-dialog-overlay {
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

.oauth2-bind-dialog {
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

.user-details .email {
  margin: 0 0 4px;
  font-size: 14px;
  color: #718096;
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
  background: #edf2f7;
  border-radius: 8px;
  color: #4a5568;
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
  color: #2d3748;
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

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}

/* 表单 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #a0aec0;
  line-height: 1.5;
}

.hint strong {
  color: #667eea;
  font-weight: 600;
}

/* 注册操作区域 */
.register-action {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.register-hint {
  margin: 0 0 12px;
  font-size: 14px;
  color: #718096;
}

.register-btn {
  display: inline-block;
  padding: 12px 24px;
  background: #48bb78;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 暗黑模式 */
.dark-mode .oauth2-bind-dialog {
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
  color: #cbd5e0;
}

.dark-mode .info-message strong {
  color: #f7fafc;
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

.dark-mode .register-action {
  border-top-color: #4a5568;
}

.dark-mode .register-hint {
  color: #a0aec0;
}

.dark-mode .register-btn {
  background: #38a169;
}

.dark-mode .register-btn:hover {
  background: #2f855a;
}

.dark-mode .form-group label {
  color: #cbd5e0;
}

.dark-mode .form-group input {
  background: #2d3748;
  border-color: #4a5568;
  color: #f7fafc;
}

.dark-mode .form-group input:focus {
  border-color: #667eea;
}

.dark-mode .hint {
  color: #718096;
}

.dark-mode .hint strong {
  color: #90cdf4;
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
