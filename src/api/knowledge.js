import axios from 'axios'
import config from '@/config'

// 创建axios实例 - 使用Vue代理
const api = axios.create({
  baseURL: '', // 使用相对路径，通过Vue代理转发
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('知识库API请求:', config.method?.toUpperCase(), config.url)
    console.log('请求数据:', config.data)
    
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
    console.log('知识库API响应:', response.status, response.data)
    return response.data
  },
  error => {
    console.error('知识库API错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      console.error('服务器错误:', status, data)
      
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
      return Promise.reject(new Error('网络连接失败，请检查后端服务'))
    } else {
      console.error('其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

// 知识库成果管理 API
export const knowledgeAPI = {
  /**
   * 创建成果
   * @param {Object} achievementData - 成果数据
   * @param {Number} achievementData.projectId - 项目ID (必需)
   * @param {String} achievementData.title - 成果标题 (必需)
   * @param {String} achievementData.type - 成果类型 (必需)
   * @param {String} achievementData.description - 成果描述
   * @param {String} achievementData.content - 成果内容
   * @param {Array} achievementData.tags - 标签列表
   */
  createAchievement(achievementData) {
    console.log('[knowledgeAPI.createAchievement] 创建成果, 数据:', achievementData)
    return api.post('/zhiyan/achievement/create', achievementData)
  },

  /**
   * 更新成果状态
   * @param {Number} achievementId - 成果ID
   * @param {String} status - 成果状态 (DRAFT/PUBLISHED/ARCHIVED)
   */
  updateAchievementStatus(achievementId, status) {
    console.log('[knowledgeAPI.updateAchievementStatus] 更新成果状态, ID:', achievementId, '状态:', status)
    return api.patch(`/zhiyan/achievement/${achievementId}/status`, null, {
      params: { status }
    })
  },

  /**
   * 获取成果详情
   * @param {Number} achievementId - 成果ID
   */
  getAchievementDetail(achievementId) {
    console.log('[knowledgeAPI.getAchievementDetail] 获取成果详情, ID:', achievementId)
    return api.get(`/zhiyan/achievement/${achievementId}`)
  },

  /**
   * 删除成果
   * @param {Number} achievementId - 成果ID
   */
  deleteAchievement(achievementId) {
    console.log('[knowledgeAPI.deleteAchievement] 删除成果, ID:', achievementId)
    return api.delete(`/zhiyan/achievement/${achievementId}`)
  },

  /**
   * 获取项目的成果列表
   * @param {Number} projectId - 项目ID
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getProjectAchievements(projectId, page = 0, size = 20) {
    console.log('[knowledgeAPI.getProjectAchievements] 获取项目成果列表, 项目ID:', projectId)
    return api.get(`/zhiyan/achievement/search/project/${projectId}`, {
      params: { page, size }
    })
  },

  /**
   * 搜索成果
   * @param {String} keyword - 搜索关键词
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  searchAchievements(keyword, page = 0, size = 20) {
    console.log('[knowledgeAPI.searchAchievements] 搜索成果, 关键词:', keyword)
    return api.get(`/zhiyan/achievement/search/search`, {
      params: { keyword, page, size }
    })
  },

  /**
   * 组合查询成果
   * @param {Object} queryData - 查询条件
   */
  queryAchievements(queryData) {
    console.log('[knowledgeAPI.queryAchievements] 组合查询成果, 查询条件:', queryData)
    return api.post(`/zhiyan/achievement/search/query`, queryData)
  }
}

export default api

