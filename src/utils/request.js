import axios from 'axios'
import config from '@/config'
import tokenManager from './tokenManager'

/**
 * 统一的 Axios 实例配置
 * 实现 Token 主动刷新 + 被动刷新的双重机制
 */

// 是否正在刷新 token（用于被动刷新时的并发控制）
let isRefreshing = false
// 待重试的请求队列
let requestsQueue = []

/**
 * 自定义JSON解析函数 - 将大整数转换为字符串以避免精度丢失
 * 雪花ID（19位）超过JavaScript Number安全范围（2^53-1）
 */
function parseJSONWithBigInt(data) {
  if (typeof data !== 'string') return data
  try {
    // 使用正则表达式将大整数字段（通常是ID）转换为字符串
    // 匹配所有可能是ID的长整数（大于16位的整数）
    return JSON.parse(data.replace(/:(\s*)(\d{16,})/g, ':$1"$2"'))
  } catch (e) {
    console.error('JSON解析错误:', e)
    return data
  }
}

/**
 * 创建 Axios 实例
 */
export function createAxiosInstance(useProxy = false) {
  const instance = axios.create({
    baseURL: useProxy ? '' : config.api.baseURL,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: true,
    // 自定义响应转换，将大整数转换为字符串
    transformResponse: [function (data) {
      return parseJSONWithBigInt(data)
    }]
  })

  // ==================== 请求拦截器 ====================
  instance.interceptors.request.use(
    async config => {
      // 从 localStorage 获取 access_token
      const token = localStorage.getItem('access_token')
      
      // ==================== 主动刷新检查 ====================
      // 在发送请求前，检查token是否即将过期
      if (token && tokenManager.isTokenExpiringSoon(token)) {
        console.log('⚠️ Token即将过期，主动刷新')
        
        // 如果TokenManager的定时器还没触发，这里手动触发刷新
        // TokenManager内部有防重复刷新机制
        await tokenManager.refreshToken()
        
        // 刷新后获取新token
        const newToken = localStorage.getItem('access_token')
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`
        }
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 记录请求信息（开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${config.method?.toUpperCase()}] ${config.url}`, config.data || config.params)
      }

      return config
    },
    error => {
      console.error('请求拦截器错误:', error)
      return Promise.reject(error)
    }
  )

  // ==================== 响应拦截器 ====================
  instance.interceptors.response.use(
    response => {
      // 直接返回 response.data（后端的 R 对象）
      return response.data
    },
    async error => {
      const originalRequest = error.config

      // ==================== 401 错误处理 ====================
      if (error.response && error.response.status === 401) {
        // 如果是刷新 token 的请求失败，直接跳转登录
        if (originalRequest.url.includes('/auth/refresh')) {
          console.error('❌ Refresh Token 已过期，需要重新登录')
          handleLogout()
          return Promise.reject(error)
        }

        // 如果没有 refresh_token，直接跳转登录
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          console.error('❌ 没有 Refresh Token，需要重新登录')
          handleLogout()
          return Promise.reject(error)
        }

        // ==================== 被动刷新 Token（401错误时） ====================
        if (!isRefreshing) {
          isRefreshing = true

          try {
            console.log('🔄 收到401错误，执行被动刷新 Access Token...')

            // 使用TokenManager刷新（它会自动更新定时器）
            const success = await tokenManager.refreshToken()

            if (success) {
              const newAccessToken = localStorage.getItem('access_token')
              
              console.log('✅ Token 刷新成功')

              // 更新原请求的 Authorization header
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

              // 重试所有待处理的请求
              requestsQueue.forEach(callback => callback(newAccessToken))
              requestsQueue = []

              // 重试原请求
              return instance(originalRequest)
            } else {
              throw new Error('刷新 Token 失败')
            }
          } catch (refreshError) {
            console.error('❌ 被动刷新 Token 失败:', refreshError)

            // 清空请求队列
            requestsQueue = []

            // 跳转到登录页（TokenManager内部已处理）
            handleLogout()

            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        } else {
          // 如果正在刷新，将请求加入队列
          return new Promise((resolve) => {
            requestsQueue.push((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(instance(originalRequest))
            })
          })
        }
      }

      // ==================== 其他错误处理 ====================
      if (error.response) {
        const { status, data } = error.response
        console.error(`服务器错误 [${status}]:`, data)

        // 403 权限不足
        if (status === 403) {
          console.error('❌ 权限不足')
        }

        return Promise.reject(data || error)
      } else if (error.request) {
        // 网络错误
        console.error('❌ 网络连接失败，请检查后端服务')
        return Promise.reject(new Error('网络连接失败，请检查后端服务'))
      } else {
        console.error('❌ 请求错误:', error.message)
        return Promise.reject(error)
      }
    }
  )

  return instance
}

/**
 * 处理登出逻辑
 */
function handleLogout() {
  // 清除所有认证信息
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('remember_me_token')
  localStorage.removeItem('user_info')
  localStorage.removeItem('userAvatar')
  localStorage.removeItem('globalUserInfo')

  // 清除所有以 userData_ 开头的用户数据
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('userData_')) {
      localStorage.removeItem(key)
    }
  })

  // 跳转到登录页
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

/**
 * 默认实例（用于认证 API）
 */
export const authRequest = createAxiosInstance(false)

/**
 * 代理实例（用于项目、任务等 API）
 */
export const proxyRequest = createAxiosInstance(true)

/**
 * 默认导出（兼容旧代码）
 */
export default authRequest

