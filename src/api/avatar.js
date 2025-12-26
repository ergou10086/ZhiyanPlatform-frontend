import axios from 'axios'
import config from '@/config'

// 创建axios实例 - 用于上传文件
const apiInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Accept': 'application/json'
  },
  withCredentials: true
})

// 请求拦截器 - 自动附加 Token
apiInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('头像API请求:', config.method?.toUpperCase(), config.url)
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiInstance.interceptors.response.use(
  response => {
    // 仅输出轻量级调试信息，避免打印完整的头像二进制/Base64 数据
    const simpleData = response && response.data ? response.data : null
    const code = simpleData && typeof simpleData.code !== 'undefined' ? simpleData.code : undefined
    const hasData = !!(simpleData && simpleData.data)
    console.log('✅ 头像API成功响应:', response.status, 'code:', code, 'hasData:', hasData)

    return response.data
  },
  error => {
    console.error('❌ 头像API错误:', error)

    if (error.response) {
      const { status, data } = error.response
      // 避免直接打印包含大体积头像数据的完整响应体
      console.error('服务器错误 status:', status)
      if (data && typeof data === 'object') {
        console.error('服务器错误 data.code:', data.code, 'msg:', data.msg)
      } else {
        console.error('服务器错误 data(简要):', data)
      }

      if (status === 401) {
        // token过期，跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      return Promise.reject(data || error)
    } else if (error.request) {
      console.error('网络错误:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查网络'))
    } else {
      console.error('其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

/**
 * 用户头像API
 */
export const avatarAPI = {
  /**
   * 上传用户头像
   * @param {File} file - 图片文件
   * @returns {Promise}
   */
  uploadAvatar(file) {
    console.log('[avatarAPI.uploadAvatar] 上传头像, 文件:', file.name)
    
    const formData = new FormData()
    formData.append('file', file)
    
    return apiInstance.post('/zhiyan/auth/user-avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 获取当前用户头像信息
   * @returns {Promise}
   */
  getMyAvatarInfo() {
    console.log('[avatarAPI.getMyAvatarInfo] 获取当前用户头像信息')
    return apiInstance.get('/zhiyan/auth/user-avatar/me_avatar')
  },

  /**
   * 根据用户ID获取头像信息
   * @param {number} userId - 用户ID
   * @returns {Promise}
   */
  getAvatarInfoById(userId) {
    console.log('[avatarAPI.getAvatarInfoById] 获取用户头像信息, 用户ID:', userId)
    return apiInstance.get(`/zhiyan/auth/user-avatar/${userId}`)
  }
}

export default apiInstance
