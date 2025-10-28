import axios from 'axios'
import config from '@/config'

/**
 * Token管理器
 * 实现Token的主动刷新机制，避免用户遇到401错误
 */
class TokenManager {
  constructor() {
    // 刷新定时器
    this.refreshTimer = null
    // 提前刷新时间（秒）：在token过期前5分钟刷新
    this.REFRESH_BEFORE_EXPIRE = 5 * 60
    // 是否正在刷新
    this.isRefreshing = false
  }

  /**
   * 保存Token信息
   * @param {string} accessToken - 访问令牌
   * @param {string} refreshToken - 刷新令牌
   * @param {number} expiresIn - 过期时间（秒）
   */
  saveTokens(accessToken, refreshToken, expiresIn) {
    console.log('💾 保存Token信息')
    console.log('  - Access Token:', accessToken?.substring(0, 20) + '...')
    console.log('  - Refresh Token:', refreshToken?.substring(0, 20) + '...')
    console.log('  - Expires In:', expiresIn, '秒')

    // 保存token
    localStorage.setItem('access_token', accessToken)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }

    // 计算并保存过期时间戳（毫秒）
    const expireTime = Date.now() + expiresIn * 1000
    localStorage.setItem('token_expire_time', expireTime.toString())

    console.log('  - 过期时间:', new Date(expireTime).toLocaleString())

    // 启动自动刷新定时器
    this.startAutoRefresh(expiresIn)
  }

  /**
   * 启动自动刷新定时器
   * @param {number} expiresIn - token过期时间（秒）
   */
  startAutoRefresh(expiresIn) {
    // 清除旧的定时器
    this.stopAutoRefresh()

    // 计算刷新时间：在token过期前5分钟刷新
    const refreshDelay = (expiresIn - this.REFRESH_BEFORE_EXPIRE) * 1000

    if (refreshDelay <= 0) {
      console.warn('⚠️ Token即将过期，立即刷新')
      this.refreshToken()
      return
    }

    const refreshTime = new Date(Date.now() + refreshDelay)
    console.log(`⏰ 设置自动刷新定时器: ${Math.floor(refreshDelay / 1000 / 60)}分${Math.floor((refreshDelay / 1000) % 60)}秒后刷新`)
    console.log(`   预计刷新时间: ${refreshTime.toLocaleString()}`)

    this.refreshTimer = setTimeout(() => {
      console.log('🔔 触发自动刷新')
      this.refreshToken()
    }, refreshDelay)
  }

  /**
   * 停止自动刷新定时器
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      console.log('⏹️ 停止自动刷新定时器')
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * 检查Token是否即将过期
   * @returns {boolean} 如果token在5分钟内过期返回true
   */
  isTokenExpiringSoon() {
    const expireTime = localStorage.getItem('token_expire_time')
    if (!expireTime) {
      return false
    }

    const timeLeft = parseInt(expireTime) - Date.now()
    const isExpiring = timeLeft > 0 && timeLeft < this.REFRESH_BEFORE_EXPIRE * 1000

    if (isExpiring) {
      console.log(`⚠️ Token即将在 ${Math.floor(timeLeft / 1000)} 秒后过期`)
    }

    return isExpiring
  }

  /**
   * 检查Token是否已过期
   * @returns {boolean}
   */
  isTokenExpired() {
    const expireTime = localStorage.getItem('token_expire_time')
    if (!expireTime) {
      return true
    }

    const isExpired = Date.now() >= parseInt(expireTime)
    if (isExpired) {
      console.warn('❌ Token已过期')
    }

    return isExpired
  }

  /**
   * 主动刷新Token
   */
  async refreshToken() {
    // 防止重复刷新
    if (this.isRefreshing) {
      console.log('🔄 正在刷新中，跳过')
      return
    }

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      console.error('❌ 没有Refresh Token，无法刷新')
      this.handleRefreshFailure()
      return
    }

    this.isRefreshing = true

    try {
      console.log('🔄 开始刷新Access Token...')

      const response = await axios.post(
        `${config.api.baseURL}/zhiyan/auth/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      )

      if (response.data && response.data.code === 200) {
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data

        // 保存新的token并重启定时器
        this.saveTokens(accessToken, newRefreshToken, expiresIn)

        console.log('✅ Token刷新成功')
        return true
      } else {
        throw new Error('刷新Token失败: ' + (response.data?.msg || '未知错误'))
      }
    } catch (error) {
      console.error('❌ 刷新Token失败:', error)
      this.handleRefreshFailure()
      return false
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 处理刷新失败
   */
  handleRefreshFailure() {
    this.stopAutoRefresh()
    this.clearTokens()
    
    // 跳转到登录页
    if (window.location.pathname !== '/login') {
      console.log('🚪 跳转到登录页')
      window.location.href = '/login'
    }
  }

  /**
   * 清除所有Token信息
   */
  clearTokens() {
    console.log('🗑️ 清除所有Token信息')
    this.stopAutoRefresh()
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expire_time')
    localStorage.removeItem('remember_me_token')
    localStorage.removeItem('user_info')
  }

  /**
   * 初始化Token管理器
   * 在应用启动时调用，恢复自动刷新定时器
   */
  initialize() {
    console.log('🚀 初始化Token管理器')

    const accessToken = localStorage.getItem('access_token')
    const expireTime = localStorage.getItem('token_expire_time')

    if (!accessToken || !expireTime) {
      console.log('   没有Token信息，无需初始化')
      return
    }

    const timeLeft = parseInt(expireTime) - Date.now()
    
    if (timeLeft <= 0) {
      console.log('   Token已过期，尝试刷新')
      this.refreshToken()
    } else {
      console.log(`   Token剩余时间: ${Math.floor(timeLeft / 1000 / 60)}分钟`)
      // 重新设置定时器
      this.startAutoRefresh(Math.floor(timeLeft / 1000))
    }
  }
}

// 导出单例
const tokenManager = new TokenManager()
export default tokenManager

