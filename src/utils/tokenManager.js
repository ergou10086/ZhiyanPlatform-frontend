// Token管理器 - 处理Token的自动刷新和过期检查
import { authAPI } from '@/api/auth'

class TokenManager {
  constructor() {
    this.refreshTimer = null
    this.refreshThreshold = 5 * 60 * 1000 // 5分钟，Token过期前5分钟刷新
  }

  /**
   * 初始化Token管理器
   * 恢复自动刷新定时器
   */
  initialize() {
    console.log('🔧 TokenManager: 初始化')
    const token = this.getAccessToken()
    if (token) {
      this.scheduleTokenRefresh()
    }
  }

  /**
   * 获取访问令牌
   */
  getAccessToken() {
    return localStorage.getItem('access_token')
  }

  /**
   * 获取刷新令牌
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token')
  }

  /**
   * 设置访问令牌
   */
  setAccessToken(token) {
    localStorage.setItem('access_token', token)
  }

  /**
   * 设置刷新令牌
   */
  setRefreshToken(token) {
    localStorage.setItem('refresh_token', token)
  }

  /**
   * 清除所有令牌
   */
  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('remember_me_token')
    this.cancelTokenRefresh()
  }

  /**
   * 解析JWT Token获取过期时间
   */
  getTokenExpirationTime(token) {
    // 检查token是否存在
    if (!token || typeof token !== 'string') {
      return null
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp ? payload.exp * 1000 : null // 转换为毫秒
    } catch (error) {
      console.error('解析Token失败:', error)
      return null
    }
  }

  /**
   * 检查Token是否即将过期
   */
  isTokenExpiringSoon(token) {
    // 检查token是否存在
    if (!token || typeof token !== 'string') {
      return false
    }

    const expirationTime = this.getTokenExpirationTime(token)
    if (!expirationTime) return false
    
    const now = Date.now()
    const timeUntilExpiration = expirationTime - now
    
    return timeUntilExpiration < this.refreshThreshold
  }

  /**
   * 计划Token刷新
   */
  scheduleTokenRefresh() {
    const token = this.getAccessToken()
    if (!token) return

    const expirationTime = this.getTokenExpirationTime(token)
    if (!expirationTime) return

    const now = Date.now()
    const timeUntilRefresh = expirationTime - now - this.refreshThreshold

    // 如果Token已经快过期了，立即刷新
    if (timeUntilRefresh <= 0) {
      this.refreshAccessToken()
      return
    }

    // 取消之前的定时器
    this.cancelTokenRefresh()

    // 设置新的定时器
    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken()
    }, timeUntilRefresh)

    console.log(`⏰ Token将在 ${Math.round(timeUntilRefresh / 1000)} 秒后刷新`)
  }

  /**
   * 取消Token刷新定时器
   */
  cancelTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      console.warn('没有刷新令牌，无法刷新访问令牌')
      return false
    }

    try {
      console.log('🔄 正在刷新访问令牌...')
      const response = await authAPI.refreshToken(refreshToken)
      
      if (response.code === 200 && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        // 更新令牌
        if (accessToken) {
          this.setAccessToken(accessToken)
          console.log('✅ 访问令牌已刷新')
        }
        
        if (newRefreshToken) {
          this.setRefreshToken(newRefreshToken)
        }

        // 重新计划下次刷新
        this.scheduleTokenRefresh()
        
        return true
      } else {
        console.error('刷新令牌失败:', response.msg)
        this.handleRefreshFailure()
        return false
      }
    } catch (error) {
      console.error('刷新令牌异常:', error)
      this.handleRefreshFailure()
      return false
    }
  }

  /**
   * 刷新访问令牌（别名方法，保持向后兼容）
   */
  async refreshToken() {
    return this.refreshAccessToken()
  }

  /**
   * 处理刷新失败
   */
  handleRefreshFailure() {
    console.warn('⚠️ Token刷新失败，清除认证信息')
    this.clearTokens()
    
    // 触发登出事件或跳转到登录页
    if (window.location.pathname !== '/login') {
      alert('登录已过期，请重新登录')
      window.location.href = '/login'
    }
  }

  /**
   * 手动触发Token检查和刷新
   */
  async checkAndRefreshToken() {
    const token = this.getAccessToken()
    if (!token) return false

    if (this.isTokenExpiringSoon(token)) {
      return await this.refreshAccessToken()
    }

    return true
  }
}

// 导出单例
export default new TokenManager()

