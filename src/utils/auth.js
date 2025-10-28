// 认证相关的工具函数
import tokenManager from './tokenManager'

/**
 * 保存用户登录信息
 * @param {Object} loginData - 登录返回的数据
 */
export function saveLoginData(loginData) {
  const { accessToken, refreshToken, rememberMeToken, userInfo, expiresIn } = loginData
  
  console.log('📦 保存登录数据:', { 
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken,
    expiresIn 
  })

  // 使用TokenManager保存token（会自动设置刷新定时器）
  if (accessToken && refreshToken && expiresIn) {
    tokenManager.saveTokens(accessToken, refreshToken, expiresIn)
  } else {
    // 兼容旧的逻辑（如果后端没有返回expiresIn）
    console.warn('⚠️ 登录响应缺少expiresIn，使用旧方式保存token')
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  // 保存rememberMe token
  if (rememberMeToken) {
    localStorage.setItem('remember_me_token', rememberMeToken)
  }
  
  // 保存用户信息
  if (userInfo) {
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export function getCurrentUser() {
  const userInfo = localStorage.getItem('user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 获取访问令牌
 * @returns {string|null} 访问令牌或null
 */
export function getAccessToken() {
  return localStorage.getItem('access_token')
}

/**
 * 获取刷新令牌
 * @returns {string|null} 刷新令牌或null
 */
export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  const token = getAccessToken()
  const userInfo = getCurrentUser()
  return !!(token && userInfo)
}

/**
 * 清除所有认证信息
 */
export function clearAuthData() {
  console.log('🗑️ 清除所有认证信息')
  
  // 使用TokenManager清除token（会停止刷新定时器）
  tokenManager.clearTokens()
  
  // 清除其他数据
  localStorage.removeItem('userAvatar')
  localStorage.removeItem('globalUserInfo')
  
  // 清除所有以userData_开头的用户数据
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('userData_')) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * 格式化API错误信息
 * @param {Object} error - 错误对象
 * @returns {string} 格式化的错误信息
 */
export function formatApiError(error) {
  if (error && error.msg) {
    return error.msg
  }
  if (error && error.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '操作失败，请重试'
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果
 */
export function validatePassword(password) {
  const result = {
    isValid: true,
    message: ''
  }
  
  if (!password) {
    result.isValid = false
    result.message = '密码不能为空'
  } else if (password.length < 6) {
    result.isValid = false
    result.message = '密码长度不能少于6位'
  } else if (password.length > 16) {
    result.isValid = false
    result.message = '密码长度不能超过16位'
  }
  
  return result
}

/**
 * 获取当前用户ID
 * @returns {number|null} 用户ID或null
 */
export function getCurrentUserId() {
  const userInfo = getCurrentUser()
  return userInfo && userInfo.id ? userInfo.id : null
}

/**
 * 获取当前用户姓名
 * @returns {string} 用户姓名，如果未登录返回'用户'
 */
export function getCurrentUserName() {
  const userInfo = getCurrentUser()
  return userInfo && userInfo.name ? userInfo.name : '用户'
}

/**
 * 获取当前用户头像URL
 * @returns {string|null} 用户头像URL或null
 */
export function getCurrentUserAvatar() {
  const userInfo = getCurrentUser()
  return userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : null
}