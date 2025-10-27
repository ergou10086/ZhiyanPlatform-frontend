import axios from 'axios'
import config from '@/config'

/**
 * 统一的 Axios 实例配置
 * 实现 Token 自动刷新机制
 */

// 是否正在刷新 token
let isRefreshing = false
// 待重试的请求队列
let requestsQueue = []

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
    withCredentials: true
  })

  // ==================== 请求拦截器 ====================
  instance.interceptors.request.use(
    config => {
      // 从 localStorage 获取 access_token
      const token = localStorage.getItem('access_token')
      if (token) {
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

        // ==================== Token 自动刷新 ====================
        if (!isRefreshing) {
          isRefreshing = true

          try {
            console.log('🔄 正在刷新 Access Token...')

            // 调用刷新 token 接口
            const refreshResponse = await axios.post(
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

            if (refreshResponse.data && refreshResponse.data.code === 200) {
              const newAccessToken = refreshResponse.data.data.accessToken
              const newRefreshToken = refreshResponse.data.data.refreshToken

              // 保存新的 token
              localStorage.setItem('access_token', newAccessToken)
              if (newRefreshToken) {
                localStorage.setItem('refresh_token', newRefreshToken)
              }

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
            console.error('❌ 刷新 Token 失败:', refreshError)

            // 清空请求队列
            requestsQueue = []

            // 跳转到登录页
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

