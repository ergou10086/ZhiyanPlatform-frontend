import axios from 'axios'
import config from '@/config'

/**
 * 自定义JSON解析函数 - 将大整数转换为字符串以避免精度丢失
 */
function parseJSONWithBigInt(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data.replace(/:(\s*)(\d{16,})/g, ':$1"$2"'))
  } catch (e) {
    console.error('JSON解析错误:', e)
    return data
  }
}

// 创建axios实例
const api = axios.create({
  baseURL: config.api.baseURL,
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

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 确保Content-Type正确设置
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    // 记录请求信息
    console.log('API请求:', config.method?.toUpperCase(), config.url)
    console.log('请求头:', config.headers)
    console.log('请求数据:', config.data)
    console.log('请求数据类型:', typeof config.data)
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('API响应:', response.status, response.data)
    return response.data
  },
  error => {
    console.error('API错误详情:', error)
    console.error('错误类型:', error.name)
    console.error('错误消息:', error.message)
    console.error('完整错误对象:', error)
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      console.error('服务器错误:', status, data)
      if (status === 401) {
        // token过期，清除本地存储并跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      return Promise.reject(data || error)
    } else if (error.request) {
      // 网络错误
      console.error('网络错误详情:', error.request)
      console.error('请求配置:', error.config)
      return Promise.reject(new Error('网络连接失败，请检查后端服务是否启动（端口8091）'))
    } else {
      // 其他错误
      console.error('其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

// 认证相关API
export const authAPI = {
  // 发送验证码
  sendVerificationCode(data) {
    return api.post('/zhiyan/auth/send-verfcode', data)
  },

  // 用户注册
  register(data) {
    return api.post('/zhiyan/auth/register', data)
  },

  // 用户登录
  login(data) {
    return api.post('/zhiyan/auth/login', data)
  },

  // 自动登录检查
  autoLoginCheck() {
    return api.get('/zhiyan/auth/auto-login-check')
  },

  // 清除记住我
  clearRememberMe() {
    return api.post('/zhiyan/auth/clear-remember-me')
  },

  // 验证验证码
  verifyCode(email, code, type) {
    return api.post('/zhiyan/auth/verify-code', null, {
      params: { email, code, type }
    })
  },

  // 检查邮箱是否已注册
  checkEmail(email) {
    return api.get(`/zhiyan/auth/check-email?email=${encodeURIComponent(email)}`)
  },

  // 刷新令牌
  refreshToken(refreshToken) {
    return api.post('/zhiyan/auth/refresh', { refreshToken })
  },

  // 验证令牌
  validateToken(token) {
    return api.get('/zhiyan/auth/validate', {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  // 忘记密码
  forgotPassword(email) {
    return api.post('/zhiyan/auth/forgot-password', { email })
  },

  // 重置密码
  resetPassword(data) {
    return api.post('/zhiyan/auth/reset-password', data)
  },

  // 发送用于重置密码的验证码（后端会校验邮箱存在）
  sendResetPasswordCode(email) {
    return api.post('/zhiyan/auth/forgot-password', { email })
  },

  // 用户登出
  logout(token) {
    return api.post('/zhiyan/auth/logout', null, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  // 根据姓名搜索用户
  searchUserByName(name) {
    return api.get(`/zhiyan/users/name`, {
      params: { name }
    })
  },

  // 根据用户ID获取用户信息
  getUserById(userId) {
    return api.get(`/zhiyan/users/${userId}`)
  },

  /**
   * 搜索用户（支持关键词搜索，更通用）
   * @param {String} keyword - 搜索关键词（可以是姓名、邮箱等）
   * @param {Number} page - 页码，从0开始
   * @param {Number} size - 每页数量
   */
  searchUsers(keyword, page = 0, size = 10) {
    console.log('[authAPI.searchUsers] 搜索用户, 关键词:', keyword, '页码:', page, '每页:', size)
    return api.get(`/zhiyan/users/search`, {
      params: { keyword, page, size }
    })
  },

  /**
   * 更新当前用户信息
   * @param {Object} userInfo - 用户信息对象
   * @param {String} userInfo.name - 姓名
   * @param {String} userInfo.nickname - 昵称（前端使用，映射到name）
   * @param {String} userInfo.introduction - 个人简介（前端使用，后端暂不支持）
   * @param {String} userInfo.organization - 所属机构（前端使用，映射到institution）
   * @param {String} userInfo.avatarUrl - 头像URL
   */
  updateUserInfo(userInfo) {
    console.log('[authAPI.updateUserInfo] 更新用户信息, 原始数据:', userInfo)

    // 构建后端期望的请求体
    const requestBody = {}

    // 映射字段：前端organization -> 后端institution
    if (userInfo.organization !== undefined) {
      requestBody.institution = userInfo.organization
    }

    // 映射字段：前端nickname -> 后端name（如果后端支持）
    if (userInfo.nickname !== undefined) {
      requestBody.name = userInfo.nickname
    }

    // 直接传递的字段
    if (userInfo.name !== undefined) {
      requestBody.name = userInfo.name
    }
    if (userInfo.title !== undefined) {
      requestBody.title = userInfo.title
    }
    if (userInfo.avatarUrl !== undefined) {
      requestBody.avatarUrl = userInfo.avatarUrl
    }

    console.log('[authAPI.updateUserInfo] 转换后的请求体:', requestBody)
    return api.put('/zhiyan/users/me', requestBody)
  },

  /**
   * 获取当前用户完整信息
   */
  getCurrentUserInfo() {
    console.log('[authAPI.getCurrentUserInfo] 获取当前用户信息')
    return api.get('/zhiyan/users/me')
  }
}

export default api
