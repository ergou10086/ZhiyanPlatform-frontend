<template>
  <div class="oauth2-supplement-container">
    <div class="supplement-content">
      <!-- 头部 -->
      <div class="header">
        <h2>设置登录密码</h2>
        <p>我们已从 {{ providerName }} 获取您的邮箱，请设置密码完成注册</p>
      </div>

      <!-- OAuth2用户信息 -->
      <div class="oauth2-info" v-if="oauth2UserInfo">
        <img :src="oauth2UserInfo.avatar || defaultAvatar" :alt="oauth2UserInfo.name" class="avatar">
        <div class="user-name">{{ oauth2UserInfo.name }}</div>
      </div>

      <!-- 补充信息表单 -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>邮箱 *</label>
            <input 
              :value="oauth2UserInfo?.email" 
              type="email" 
              disabled
              class="readonly-input"
            >
          </div>
          <div class="form-group">
            <label>密码 *</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码（至少6位）"
              required
              minlength="6"
            >
          </div>
          <div class="form-group">
            <label>确认密码 *</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              required
              minlength="6"
            >
          </div>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? '提交中...' : '完成注册' }}
          </button>
        </form>
      </div>

      <!-- 取消按钮 -->
      <button @click="cancel" class="btn-cancel">
        取消
      </button>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/auth'
import { saveLoginData } from '@/utils/auth'

export default {
  name: 'OAuth2Supplement',
  data() {
    return {
      oauth2UserInfo: null,
      form: {
        password: '',
        confirmPassword: ''
      },
      loading: false,
      defaultAvatar: 'https://via.placeholder.com/80'
    }
  },
  computed: {
    providerName() {
      const names = {
        github: 'GitHub',
        orcid: 'ORCID',
        gitee: 'Gitee',
        google: 'Google',
        wechat: '微信'
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
        
        // 邮箱直接使用OAuth2返回的值
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
    async handleSubmit() {
      this.loading = true
      try {
        // 验证密码
        if (this.form.password !== this.form.confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }

        const response = await authAPI.supplementOAuth2Info({
          provider: this.oauth2UserInfo.provider,
          providerUserId: this.oauth2UserInfo.oauth2UserId,
          email: this.oauth2UserInfo.email,
          password: this.form.password,
          confirmPassword: this.form.confirmPassword,
          oauth2UserInfo: {
            ...this.oauth2UserInfo
          }
        })

        if (response.code === 200) {
          console.log('✅ 补充信息成功')
          this.handleLoginSuccess(response.data)
        } else {
          throw new Error(response.msg || '提交失败')
        }
      } catch (error) {
        console.error('❌ 提交失败:', error)
        alert(error.message || '提交失败，请重试')
      } finally {
        this.loading = false
      }
    },

    async handleLoginSuccess(loginResponse) {
      // 保存登录信息
      const loginData = {
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
        rememberMeToken: loginResponse.rememberMeToken,
        userInfo: loginResponse.user
      }

      console.log('💾 保存登录数据:', loginData)
      console.log('📦 登录响应中的用户信息:', loginResponse.user)
      saveLoginData(loginData)

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

      // 清除OAuth2相关的sessionStorage
      sessionStorage.removeItem('oauth2_state')
      sessionStorage.removeItem('oauth2_provider')
      sessionStorage.removeItem('oauth2_user_info')

      // 触发用户信息更新事件
      this.$root.$emit('userInfoUpdated')

      // 跳转到首页
      this.$router.replace('/home')
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
}

.form-container {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.readonly-input {
  background: #edf2f7;
  color: #4a5568;
  cursor: not-allowed;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  width: 100%;
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

.dark-mode .form-group label {
  color: #cbd5e0;
}

.dark-mode .form-group input {
  background: #2d3748;
  border-color: #4a5568;
  color: #f7fafc;
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
