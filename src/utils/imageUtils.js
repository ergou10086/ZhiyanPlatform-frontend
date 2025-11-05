// 图片URL处理工具函数
import { API_BASE_URL, MINIO_BASE_URL } from '@/config'

/**
 * 规范化项目封面图片URL
 * 将相对路径或部分路径转换为完整的MinIO URL
 * @param {string} url - 原始图片URL
 * @returns {string|null} 规范化后的完整URL，如果无效则返回null
 */
export function normalizeProjectCoverUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  // 如果已经是完整的HTTP/HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // 过滤掉无效的URL
    if (url.includes('localhost')) {
      console.warn('检测到无效URL:', url, '- 将返回null使用默认图片')
      return null
    }
    return url
  }

  // 如果是相对路径（以 / 开头或不包含协议），转换为MinIO完整URL
  if (url.startsWith('/')) {
    // 移除开头的斜杠
    url = url.substring(1)
  }

  // 如果URL以 zhiyan/ 开头，说明是MinIO的对象键
  if (url.startsWith('zhiyan/')) {
    // 构建完整的MinIO URL
    const minioBaseUrl = MINIO_BASE_URL || 'http://10.7.10.98:9000'
    return `${minioBaseUrl}/${url}`
  }

  // 如果只是文件名，假设在 zhiyan/project-covers/ 目录下
  if (!url.includes('/')) {
    const minioBaseUrl = MINIO_BASE_URL || 'http://10.7.10.98:9000'
    return `${minioBaseUrl}/zhiyan/project-covers/${url}`
  }

  // 其他情况，尝试构建MinIO URL
  const minioBaseUrl = MINIO_BASE_URL || 'http://10.7.10.98:9000'
  return `${minioBaseUrl}/${url}`
}

/**
 * 规范化通用图片URL
 * 将相对路径或部分路径转换为完整的URL
 * @param {string} url - 原始图片URL
 * @param {string} defaultBucket - 默认的bucket名称，默认为'zhiyan'
 * @returns {string|null} 规范化后的完整URL，如果无效则返回null
 */
export function normalizeImageUrl(url, defaultBucket = 'zhiyan') {
  if (!url || typeof url !== 'string') {
    return null
  }

  // 如果已经是完整的HTTP/HTTPS URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // 但如果包含localhost，则认为是错误的URL，返回null
    if (url.includes('localhost')) {
      console.warn('检测到包含localhost的无效URL:', url)
      return null
    }
    return url
  }

  // 如果是相对路径（以 / 开头），移除开头的斜杠
  if (url.startsWith('/')) {
    url = url.substring(1)
  }

  // 如果URL已经包含bucket名称，直接构建完整URL
  if (url.startsWith(`${defaultBucket}/`)) {
    const minioBaseUrl = MINIO_BASE_URL || 'http://10.7.10.98:9000'
    return `${minioBaseUrl}/${url}`
  }

  // 否则，添加默认bucket
  const minioBaseUrl = MINIO_BASE_URL || 'http://10.7.10.98:9000'
  return `${minioBaseUrl}/${defaultBucket}/${url}`
}

/**
 * 规范化用户头像URL
 * @param {string|object} avatar - 原始头像数据，可能是字符串或JSON对象
 * @returns {string|null} 规范化后的头像URL
 */
export function normalizeAvatarUrl(avatar) {
  if (!avatar) {
    return null
  }

  // 如果是字符串
  if (typeof avatar === 'string') {
    // 尝试解析JSON
    if (avatar.startsWith('{')) {
      try {
        const parsed = JSON.parse(avatar)
        return parsed.minio_url || parsed.minioUrl || parsed.cdn_url || parsed.cdnUrl || null
      } catch (e) {
        console.warn('解析头像JSON失败:', avatar)
        // 不是有效的JSON，按普通URL处理
        return normalizeImageUrl(avatar, 'zhiyan')
      }
    }
    
    // 普通字符串URL
    return normalizeImageUrl(avatar, 'zhiyan')
  }

  // 如果是对象
  if (typeof avatar === 'object') {
    const url = avatar.minio_url || avatar.minioUrl || avatar.cdn_url || avatar.cdnUrl
    return url ? normalizeImageUrl(url, 'zhiyan') : null
  }

  return null
}

/**
 * 检查URL是否有效
 * @param {string} url - 要检查的URL
 * @returns {boolean} 是否为有效的URL
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  // 包含localhost的URL被认为是无效的
  if (url.includes('localhost')) {
    return false
  }

  // 检查是否是有效的HTTP/HTTPS URL
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch (e) {
    return false
  }
}

/**
 * 从完整的MinIO URL提取对象键
 * @param {string} url - 完整的MinIO URL
 * @returns {string|null} 对象键（bucket/path/filename）
 */
export function extractObjectKeyFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const urlObj = new URL(url)
    // 移除开头的斜杠并返回路径
    return urlObj.pathname.substring(1)
  } catch (e) {
    // 如果不是有效的URL，尝试作为路径处理
    if (url.startsWith('/')) {
      return url.substring(1)
    }
    return url
  }
}

/**
 * 生成图片缩略图URL（如果MinIO支持）
 * @param {string} url - 原始图片URL
 * @param {number} width - 缩略图宽度
 * @param {number} height - 缩略图高度
 * @returns {string} 缩略图URL
 */
export function getThumbnailUrl(url, width = 200, height = 200) {
  if (!url) {
    return null
  }

  // 如果已经是完整的URL，直接返回（暂不支持缩略图转换）
  // 未来可以在这里添加MinIO缩略图参数
  return normalizeImageUrl(url)
}

/**
 * 获取图片的预加载Promise
 * @param {string} url - 图片URL
 * @returns {Promise} 图片加载完成的Promise
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * 批量预加载图片
 * @param {string[]} urls - 图片URL数组
 * @returns {Promise<Array>} 所有图片加载完成的Promise
 */
export function preloadImages(urls) {
  return Promise.all(urls.map(url => preloadImage(url)))
}

/**
 * 给图片URL添加时间戳参数，强制浏览器刷新缓存
 * @param {string} url - 原始URL
 * @param {number} timestamp - 时间戳，默认使用当前时间
 * @returns {string} 添加时间戳后的URL
 */
export function addTimestampToUrl(url, timestamp = null) {
  if (!url || typeof url !== 'string') {
    return url
  }

  // 如果是base64数据，不添加时间戳
  if (url.startsWith('data:')) {
    return url
  }

  // 使用提供的时间戳或当前时间
  const ts = timestamp || Date.now()

  // 检查URL中是否已有查询参数
  const separator = url.includes('?') ? '&' : '?'

  // 如果URL已经有时间戳参数，先移除
  const urlWithoutTimestamp = url.replace(/[?&]t=\d+/, '')

  return `${urlWithoutTimestamp}${separator}t=${ts}`
}

/**
 * 移除URL中的时间戳参数
 * @param {string} url - 带时间戳的URL
 * @returns {string} 移除时间戳后的URL
 */
export function removeTimestampFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return url
  }

  return url.replace(/[?&]t=\d+/, '')
}

