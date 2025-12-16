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
    
    console.log('[profileAPI] 请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('[profileAPI] 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('[profileAPI] 响应:', response.status, response.data)
    return response.data
  },
  error => {
    console.error('[profileAPI] 响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      console.error('[profileAPI] 服务器错误:', status, data)
      
      if (status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      return Promise.reject(data || error)
    } else if (error.request) {
      console.error('[profileAPI] 网络错误:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查后端服务'))
    } else {
      console.error('[profileAPI] 其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

// 用户个人信息相关API
export const profileAPI = {
  /**
   * 获取研究方向标签
   * @returns {Promise} 返回标签列表
   */
  getResearchTags() {
    console.log('[profileAPI.getResearchTags] 获取研究方向标签')
    return api.get('/zhiyan/auth/users/profile/research-tags')
  },

  /**
   * 获取指定用户的研究方向标签
   * @param {String|Number} userId - 用户ID
   * @returns {Promise} 返回标签字符串列表
   */
  getUserResearchTags(userId) {
    console.log('[profileAPI.getUserResearchTags] 获取用户研究方向标签, userId:', userId)
    return api.get(`/zhiyan/auth/users/${userId}/research-tags`)
  },

  /**
   * 更新研究方向标签
   * @param {Array<String>} tags - 标签列表（1-5个）
   * @returns {Promise} 返回更新后的标签列表
   */
  updateResearchTags(tags) {
    console.log('[profileAPI.updateResearchTags] 更新研究方向标签:', tags)
    return api.put('/zhiyan/auth/profile/research-tags', {
      researchTags: tags
    })
  },

  /**
   * 清空研究方向标签
   * @returns {Promise} 返回操作结果
   */
  clearResearchTags() {
    console.log('[profileAPI.clearResearchTags] 清空研究方向标签')
    return api.delete('/zhiyan/auth/profile/research-tags')
  },

  /**
   * 获取当前用户的关联链接
   */
  getMyProfileLinks() {
    console.log('[profileAPI.getMyProfileLinks] 获取我的关联链接')
    return api.get('/zhiyan/auth/profile/links')
  },

  /**
   * 获取指定用户的关联链接
   * @param {String|Number} userId 用户ID
   */
  getUserProfileLinks(userId) {
    console.log('[profileAPI.getUserProfileLinks] 获取用户关联链接, userId:', userId)
    return api.get(`/zhiyan/auth/users/${userId}/links`)
  },

  /**
   * 更新当前用户的关联链接
   * @param {Array<{label?: string, url: string}>} links
   */
  updateProfileLinks(links) {
    console.log('[profileAPI.updateProfileLinks] 更新我的关联链接:', links)
    return api.put('/zhiyan/auth/profile/links', {
      links
    })
  },

  /**
   * 获取我的学术成果关联列表
   * @returns {Promise} 返回成果关联列表
   */
  getMyAchievements() {
    console.log('[profileAPI.getMyAchievements] 获取我的学术成果')
    return api.get('/zhiyan/auth/users/achievements/me')
  },

  /**
   * 获取指定用户的学术成果关联列表
   * @param {String|Number} userId - 用户ID
   * @returns {Promise} 返回成果关联列表
   */
  getUserAchievements(userId) {
    console.log('[profileAPI.getUserAchievements] 获取用户学术成果, userId:', userId)
    return api.get(`/zhiyan/auth/users/achievements/user/${userId}`)
  },

  /**
   * 关联学术成果
   * @param {Object} data - 关联数据
   * @param {String|Number} data.achievementId - 成果ID（必需）
   * @param {String|Number} data.projectId - 项目ID（可选）
   * @param {Number} data.displayOrder - 展示顺序（可选）
   * @param {String} data.remark - 备注说明（可选）
   * @returns {Promise} 返回关联结果
   */
  linkAchievement(data) {
    console.log('[profileAPI.linkAchievement] 关联学术成果:', data)
    return api.post('/zhiyan/auth/users/achievements/link', {
      achievementId: String(data.achievementId),
      projectId: data.projectId ? String(data.projectId) : undefined,
      displayOrder: data.displayOrder,
      remark: data.remark
    })
  },

  /**
   * 取消关联学术成果
   * @param {String|Number} achievementId - 成果ID
   * @returns {Promise} 返回取消关联结果
   */
  unlinkAchievement(achievementId) {
    console.log('[profileAPI.unlinkAchievement] 取消关联学术成果, achievementId:', achievementId)
    return api.delete(`/zhiyan/auth/users/achievements/${achievementId}`)
  },

  /**
   * 更新成果关联信息（排序、备注）
   * @param {String|Number} achievementId - 成果ID
   * @param {Object} data - 更新数据
   * @param {Number} data.displayOrder - 展示顺序（可选）
   * @param {String} data.remark - 备注说明（可选）
   * @returns {Promise} 返回更新结果
   */
  updateAchievementLink(achievementId, data) {
    console.log('[profileAPI.updateAchievementLink] 更新成果关联信息, achievementId:', achievementId, 'data:', data)
    return api.put(`/zhiyan/auth/users/achievements/${achievementId}`, {
      displayOrder: data.displayOrder,
      remark: data.remark
    })
  },

  /**
   * 更新个人简介
   * @param {String} description - 个人简介内容
   * @returns {Promise} 返回更新结果
   */
  updateDescription(description) {
    console.log('[profileAPI.updateDescription] 更新个人简介:', description)
    return api.patch('/zhiyan/auth/users/me/profile/description', {
      description: description
    })
  }
}

export default api

