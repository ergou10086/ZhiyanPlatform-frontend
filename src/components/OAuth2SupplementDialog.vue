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
            <strong>⚠️ 需要补充信息</strong>
          </p>
          <p>
            {{ oauth2UserInfo.provider }} 未提供邮箱信息，请补充以下信息以完成账号创建。
          </p>
        </div>

        <!-- 补充信息表单 -->
        <form @submit.prevent="handleSubmit" class="supplement-form">
          <div class="form-group">
            <label>邮箱 <span class="required">*</span></label>
            <input
              type="email"
              v-model="form.email"
              placeholder="请输入邮箱地址"
              required
            />
            <p class="hint">用于登录和接收通知</p>
          </div>

          <div class="form-group">
            <label>密码 <span class="required">*</span></label>
            <input
              type="password"
              v-model="form.password"
              placeholder="请设置密码（至少6位）"
              required
              minlength="6"
            />
            <p class="hint">密码长度至少6位</p>
          </div>

          <div class="form-group">
            <label>确认密码 <span class="required">*</span></label>
            <input
              type="password"
              v-model="form.confirmPassword"
              placeholder="请再次输入密码"
              required
            />
          </div>

          <div class="form-info">
            <p>
              <strong>账号信息预览：</strong>
            </p>
            <ul>
              <li>昵称：{{ oauth2UserInfo.nickname || oauth2UserInfo.username }}</li>
              <li>头像：将使用 {{ providerName }} 头像</li>
              <li>邮箱：{{ form.email || '待填写' }}</li>
            </ul>
          </div>

          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '创建中...' : '创建账号' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'

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
      submitting: false,
      form: {
        email: '',
        password: '',
        confirmPassword: ''
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
    async handleSubmit() {
      if (this.submitting) return

      // 验证表单
      if (!this.form.email) {
        alert('请输入邮箱')
        return
      }

      if (!this.form.password) {
        alert('请输入密码')
        return
      }

      if (this.form.password.length < 6) {
        alert('密码至少需要6位')
        return
      }

      if (this.form.password !== this.form.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.form.email)) {
        alert('请输入正确的邮箱格式')
        return
      }

      this.submitting = true

      try {
        const response = await authAPI.supplementOAuth2Info({
          provider: this.oauth2UserInfo.provider,
          providerUserId: this.oauth2UserInfo.providerUserId,
          email: this.form.email,
          password: this.form.password,
          confirmPassword: this.form.confirmPassword,
          oauth2UserInfo: this.oauth2UserInfo
        })

        if (response.code === 200 && response.data?.status === 'SUCCESS') {
          console.log('✅ 补充信息成功')
          this.$emit('supplement-success', response.data.loginResponse)
        } else {
          alert(response.msg || '创建账号失败')
        }
      } catch (error) {
        console.error('❌ 补充信息失败:', error)
        alert(error.message || '创建账号失败，请重试')
      } finally {
        this.submitting = false
      }
    },

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

.required {
  color: #e53e3e;
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
}

/* 表单信息 */
.form-info {
  margin: 24px 0;
  padding: 16px;
  background: #edf2f7;
  border-radius: 8px;
  font-size: 14px;
}

.form-info p {
  margin: 0 0 12px;
  color: #2d3748;
  font-weight: 600;
}

.form-info ul {
  margin: 0;
  padding-left: 20px;
  color: #4a5568;
}

.form-info li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.form-info li:last-child {
  margin-bottom: 0;
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

.dark-mode .form-info {
  background: #2d3748;
}

.dark-mode .form-info p {
  color: #f7fafc;
}

.dark-mode .form-info ul {
  color: #cbd5e0;
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
