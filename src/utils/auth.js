// 认证相关的工具函数
import { normalizeAvatarUrl } from './imageUtils'

/**
 * 规范化用户信息
 * 处理后端返回的 avatarUrl 可能是 JSON 字符串的情况
 * @param {Object} userInfo - 用户信息对象
 * @returns {Object} 规范化后的用户信息
 */
export function normalizeUserInfo(userInfo) {
  if (!userInfo) return null
  
  const normalized = { ...userInfo }
  
  // 处理 avatarUrl/avatar 字段
  let avatarUrl = userInfo.avatar || userInfo.avatarUrl || userInfo.avatar_data || userInfo.avatarData || ''
  const avatarContentType = userInfo.avatarContentType || userInfo.avatar_content_type || 'image/jpeg'
  
  // 如果 avatarUrl 是 JSON 字符串，提取实际的 URL
  if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('{')) {
    try {
      const parsed = JSON.parse(avatarUrl)
      // 优先使用 minio_url，其次使用 cdn_url
      avatarUrl = parsed.minio_url || parsed.minioUrl || parsed.cdn_url || parsed.cdnUrl || ''
    } catch (e) {
      // 解析失败，使用原始值
      console.warn('Failed to parse avatar JSON:', avatarUrl)
    }
  }
  
  // 如果来自后端的字段是单纯的Base64字符串，需要补全 Data URL 前缀
  if (avatarUrl && typeof avatarUrl === 'string' && !avatarUrl.startsWith('data:') && /^[A-Za-z0-9+/=]+$/.test(avatarUrl.trim())) {
    avatarUrl = `data:${avatarContentType};base64,${avatarUrl.trim()}`
  }

  // 使用 normalizeAvatarUrl 规范化头像URL
  avatarUrl = normalizeAvatarUrl(avatarUrl) || ''
  
  // 统一设置 avatar 和 avatarUrl（确保两个字段都有值）
  normalized.avatar = avatarUrl
  normalized.avatarUrl = avatarUrl
  normalized.nickname = userInfo.nickname || userInfo.name || ''
  
  // 添加调试日志
  console.log('🔄 规范化用户信息:', {
    原始avatar: userInfo.avatar || userInfo.avatarUrl,
    规范化后: avatarUrl,
    nickname: normalized.nickname,
    hasAvatar: !!avatarUrl
  })
  
  return normalized
}

/**
 * 保存用户登录信息
 * @param {Object} loginData - 登录返回的数据
 */
export function saveLoginData(loginData) {
  const { accessToken, refreshToken, rememberMeToken } = loginData
  const rawUserInfo = loginData.userInfo || loginData.user || loginData.userinfo || null
  
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
  
  // 保存用户信息，确保字段名称一致
  if (rawUserInfo) {
    const normalizedUserInfo = normalizeUserInfo(rawUserInfo)
    localStorage.setItem('user_info', JSON.stringify(normalizedUserInfo))
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