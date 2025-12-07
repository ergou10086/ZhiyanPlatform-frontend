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
  
  // 处理个人简介字段：后端返回 description，前端使用 introduction
  // 确保两个字段都有值，以兼容不同的字段名
  const description = userInfo.description || userInfo.introduction || ''
  normalized.description = description
  normalized.introduction = description
  
  // 保存2FA状态（重要：确保2FA状态被正确保存）
  if (userInfo.twoFactorEnabled !== undefined) {
    normalized.twoFactorEnabled = Boolean(userInfo.twoFactorEnabled)
  }
  
  // 添加调试日志
  console.log('🔄 规范化用户信息:', {
    原始avatar: userInfo.avatar || userInfo.avatarUrl,
    规范化后: avatarUrl,
    nickname: normalized.nickname,
    hasAvatar: !!avatarUrl,
    description: description,
    twoFactorEnabled: normalized.twoFactorEnabled
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
  } else if (password.length < 7) {
    result.isValid = false
    result.message = '密码长度不能少于7位'
  } else if (password.length > 25) {
    result.isValid = false
    result.message = '密码长度不能超过25位'
  } else if (!/[a-zA-Z]/.test(password)) {
    result.isValid = false
    result.message = '密码必须包含至少一个字母'
  }
  
  return result
}

/**
 * 计算密码强度等级
 * 五级密码强度：
 * 5 - 无懈可击：>12位，有大写字母、小写字母和特殊字符
 * 4 - 高强度：≥10位，包含三种及以上字符组合（数字+字母+符号）
 * 3 - 稳健：≥8位，包含三种及以上字符组合（数字+字母+符号）
 * 2 - 入门：>7位，仅两种字符组合
 * 1 - 无效：密码强度不够平台最低标准
 * 0 - 不符合基本要求
 * @param {string} password - 密码
 * @returns {Object} 强度信息 {level: 0-5, label: '描述', color: '颜色'}
 */
export function calculatePasswordStrength(password) {
  if (!password || password.length < 7) {
    return { level: 0, label: '无效', color: '#ef4444' }
  }

  // 检查字符类型
  const hasDigit = /[0-9]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password)
  
  let charTypeCount = 0
  if (hasDigit) charTypeCount++
  if (hasLowercase || hasUppercase) charTypeCount++
  if (hasSpecialChar) charTypeCount++
  
  const length = password.length
  
  // 5 - 无懈可击：>12位，有大写字母、小写字母和特殊字符
  if (length > 12 && hasLowercase && hasUppercase && hasSpecialChar) {
    return { level: 5, label: '无懈可击', color: '#10b981' }
  }
  
  // 4 - 高强度：≥10位，包含三种及以上字符组合（数字+字母+符号）
  if (length >= 10 && charTypeCount >= 3) {
    return { level: 4, label: '高强度', color: '#22c55e' }
  }
  
  // 3 - 稳健：≥8位，包含三种及以上字符组合（数字+字母+符号）
  if (length >= 8 && charTypeCount >= 3) {
    return { level: 3, label: '稳健', color: '#3b82f6' }
  }
  
  // 2 - 入门：>7位，仅两种字符组合
  if (length > 7 && charTypeCount === 2) {
    return { level: 2, label: '入门', color: '#f59e0b' }
  }
  
  // 1 - 无效：密码强度不够平台最低标准
  if (length > 7 && charTypeCount === 1) {
    return { level: 1, label: '无效', color: '#ef4444' }
  }
  
  // 0 - 不符合基本要求
  return { level: 0, label: '无效', color: '#ef4444' }
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