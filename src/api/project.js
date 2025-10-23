import axios from 'axios'
import config from '@/config'

// 创建axios实例 - 使用项目服务端口8095
const api = axios.create({
  baseURL: config.api.endpoints.project, // 使用项目服务端口
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
    
    console.log('项目API请求:', config.method?.toUpperCase(), config.url)
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
    console.log('项目API响应:', response.status, response.data)
    return response.data
  },
  error => {
    console.error('项目API错误:', error)
    
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

// 项目相关API
export const projectAPI = {
  /**
   * 创建项目
   * @param {Object} projectData - 项目数据
   */
  createProject(projectData) {
    console.log('[projectAPI.createProject] 创建项目, 数据:', projectData)
    return api.post('/api/projects', projectData)
  },

  /**
   * 更新项目
   * @param {Number} projectId - 项目ID
   * @param {Object} projectData - 项目数据
   */
  updateProject(projectId, projectData) {
    console.log('[projectAPI.updateProject] 更新项目, ID:', projectId, '数据:', projectData)
    return api.put(`/api/projects/${projectId}`, projectData)
  },

  /**
   * 删除项目
   * @param {Number} projectId - 项目ID
   */
  deleteProject(projectId) {
    console.log('[projectAPI.deleteProject] 删除项目, ID:', projectId)
    return api.delete(`/api/projects/${projectId}`)
  },

  /**
   * 获取项目详情
   * @param {Number} projectId - 项目ID
   */
  getProjectById(projectId) {
    console.log('[projectAPI.getProjectById] 获取项目详情, ID:', projectId)
    return api.get(`/api/projects/${projectId}`)
  },

  /**
   * 获取我创建的项目列表
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getMyCreatedProjects(page = 0, size = 10) {
    console.log('[projectAPI.getMyCreatedProjects] 获取我创建的项目')
    return api.get('/api/projects/my-created', {
      params: { page, size }
    })
  },

  /**
   * 获取我参与的项目列表
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getMyProjects(page = 0, size = 10) {
    console.log('[projectAPI.getMyProjects] 获取我参与的项目')
    return api.get('/api/projects/my-projects', {
      params: { page, size }
    })
  },

  /**
   * 获取公开的活跃项目
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getPublicActiveProjects(page = 0, size = 10) {
    console.log('[projectAPI.getPublicActiveProjects] 获取公开项目')
    return api.get('/api/projects/public/active', {
      params: { page, size }
    })
  },

  /**
   * 搜索项目
   * @param {String} keyword - 搜索关键词
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  searchProjects(keyword, page = 0, size = 10) {
    console.log('[projectAPI.searchProjects] 搜索项目, 关键词:', keyword)
    return api.get('/api/projects/search', {
      params: { keyword, page, size }
    })
  },

  /**
   * 更新项目状态
   * @param {Number} projectId - 项目ID
   * @param {String} status - 项目状态
   */
  updateProjectStatus(projectId, status) {
    console.log('[projectAPI.updateProjectStatus] 更新项目状态, ID:', projectId, '状态:', status)
    return api.patch(`/api/projects/${projectId}/status`, { status })
  },

  /**
   * 归档项目
   * @param {Number} projectId - 项目ID
   */
  archiveProject(projectId) {
    console.log('[projectAPI.archiveProject] 归档项目, ID:', projectId)
    return api.post(`/api/projects/${projectId}/archive`)
  },

  /**
   * 统计我创建的项目数量
   */
  countMyCreatedProjects() {
    console.log('[projectAPI.countMyCreatedProjects] 统计我创建的项目')
    return api.get('/api/projects/count/my-created')
  },

  /**
   * 统计我参与的项目数量
   */
  countMyParticipatedProjects() {
    console.log('[projectAPI.countMyParticipatedProjects] 统计我参与的项目')
    return api.get('/api/projects/count/my-participated')
  }
}

export default api

