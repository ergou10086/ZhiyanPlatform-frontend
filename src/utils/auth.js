// 认证相关的工具函数

/**
 * 保存用户登录信息
 * @param {Object} loginData - 登录返回的数据
 */
export function saveLoginData(loginData) {
  const { accessToken, refreshToken, rememberMeToken, userInfo } = loginData
  
  // 保存token
  if (accessToken) {
    localStorage.setItem('access_token', accessToken)
  }
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken)
  }
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
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('remember_me_token')
  localStorage.removeItem('user_info')
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
