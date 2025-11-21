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
          <p>请选择以下操作：</p>
        </div>

        <!-- 选项卡 -->
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'bind' }]"
            @click="activeTab = 'bind'"
          >
            绑定已有账号
          </button>
          <button
            :class="['tab', { active: activeTab === 'create' }]"
            @click="activeTab = 'create'"
          >
            创建新账号
          </button>
        </div>

        <!-- 绑定已有账号表单 -->
        <form v-if="activeTab === 'bind'" @submit.prevent="handleBind" class="bind-form">
          <div class="form-group">
            <label>邮箱</label>
            <input
              type="email"
              v-model="bindForm.email"
              placeholder="请输入已有账号的邮箱"
              required
            />
            <p class="hint" v-if="oauth2UserInfo.email">
              建议使用OAuth2提供的邮箱：{{ oauth2UserInfo.email }}
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

        <!-- 创建新账号表单 -->
        <form v-if="activeTab === 'create'" @submit.prevent="handleCreate" class="create-form">
          <div class="form-group">
            <label>邮箱</label>
            <input
              type="email"
              v-model="createForm.email"
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div class="form-group">
            <label>密码</label>
            <input
              type="password"
              v-model="createForm.password"
              placeholder="请设置密码（至少6位）"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label>确认密码</label>
            <input
              type="password"
              v-model="createForm.confirmPassword"
              placeholder="请再次输入密码"
              required
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="creating">
            {{ creating ? '创建中...' : '创建账号' }}
          </button>
        </form>
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
      activeTab: 'bind', // 'bind' 或 'create'
      binding: false,
      creating: false,
      bindForm: {
        email: this.oauth2UserInfo?.email || '',
        password: ''
      },
      createForm: {
        email: this.oauth2UserInfo?.email || '',
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
          `建议使用OAuth2提供的邮箱 ${this.oauth2UserInfo.email}，是否继续使用 ${this.bindForm.email}？`
        )
        if (!confirm) return
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
          alert(response.msg || '绑定失败，请检查邮箱和密码')
        }
      } catch (error) {
        console.error('❌ 绑定失败:', error)
        alert(error.message || '绑定失败，请重试')
      } finally {
        this.binding = false
      }
    },

    async handleCreate() {
      if (this.creating) return

      // 验证表单
      if (!this.createForm.email) {
        alert('请输入邮箱')
        return
      }

      if (!this.createForm.password) {
        alert('请输入密码')
        return
      }

      if (this.createForm.password.length < 6) {
        alert('密码至少需要6位')
        return
      }

      if (this.createForm.password !== this.createForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      this.creating = true

      try {
        const response = await authAPI.supplementOAuth2Info({
          provider: this.oauth2UserInfo.provider,
          providerUserId: this.oauth2UserInfo.providerUserId,
          email: this.createForm.email,
          password: this.createForm.password,
          confirmPassword: this.createForm.confirmPassword,
          oauth2UserInfo: this.oauth2UserInfo
        })

        if (response.code === 200 && response.data?.status === 'SUCCESS') {
          console.log('✅ 创建账号成功')
          this.$emit('create-success', response.data.loginResponse)
        } else {
          alert(response.msg || '创建账号失败')
        }
      } catch (error) {
        console.error('❌ 创建账号失败:', error)
        alert(error.message || '创建账号失败，请重试')
      } finally {
        this.creating = false
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

/* 选项卡 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  padding: 12px 24px;
  background: #edf2f7;
  color: #718096;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab:hover {
  background: #e2e8f0;
  color: #4a5568;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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

.dark-mode .tab {
  background: #2d3748;
  color: #a0aec0;
}

.dark-mode .tab:hover {
  background: #4a5568;
  color: #cbd5e0;
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

  .tabs {
    flex-direction: column;
  }
}
</style>
