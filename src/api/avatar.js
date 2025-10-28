import axios from 'axios'
import config from '@/config'

// 创建axios实例 - 用于上传文件
const apiInstance = axios.create({
  baseURL: '',
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
    console.log('✅ 头像API成功响应:', response.status)
    console.log('头像API响应数据:', response.data)
    console.log('头像API完整数据:', JSON.stringify(response.data, null, 2))
    
    // 验证响应结构
    if (response.data && response.data.code) {
      console.log('✅ 响应code:', response.data.code)
      console.log('✅ 响应msg:', response.data.msg)
      console.log('✅ 响应data存在:', !!response.data.data)
      if (response.data.data) {
        console.log('✅ data中的minio_url:', response.data.data.minio_url)
        console.log('✅ data中的cdn_url:', response.data.data.cdn_url)
      }
    }
    
    return response.data
  },
  error => {
    console.error('❌ 头像API错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      console.error('服务器错误 status:', status)
      console.error('服务器错误 data:', data)
      console.error('服务器错误完整数据:', JSON.stringify(data, null, 2))
      
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
    
    return apiInstance.post('/zhiyan/users/avatar/upload', formData, {
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
    return apiInstance.get('/zhiyan/users/avatar/me_avatar')
  },

  /**
   * 根据用户ID获取头像信息
   * @param {number} userId - 用户ID
   * @returns {Promise}
   */
  getAvatarInfoById(userId) {
    console.log('[avatarAPI.getAvatarInfoById] 获取用户头像信息, 用户ID:', userId)
    return apiInstance.get(`/zhiyan/users/avatar/${userId}`)
  }
}

export default apiInstance
