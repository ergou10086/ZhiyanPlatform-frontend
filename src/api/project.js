import axios from 'axios'
import config from '@/config'

// 创建axios实例 - 使用Vue代理，不指定baseURL
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
    // 后端返回的response.data就是R对象，包含code、msg、data字段
    // 直接返回response.data，这样前端就能访问到R对象的完整结构
    return response.data
  },
  error => {
    console.error('项目API错误:', error)
    
    if (error.response) {
      // 服务器返回了错误响应
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
    return api.post('/zhiyan/api/projects', projectData)
  },

  /**
   * 更新项目
   * @param {Number} projectId - 项目ID
   * @param {Object} projectData - 项目数据
   */
  updateProject(projectId, projectData) {
    console.log('[projectAPI.updateProject] 更新项目, ID:', projectId, '数据:', projectData)
    return api.put(`/zhiyan/api/projects/${projectId}`, projectData)
  },

  /**
   * 删除项目
   * @param {Number} projectId - 项目ID
   */
  deleteProject(projectId) {
    console.log('[projectAPI.deleteProject] 删除项目, ID:', projectId)
    return api.delete(`/zhiyan/api/projects/${projectId}`)
  },

  /**
   * 获取项目详情
   * @param {Number} projectId - 项目ID
   */
  getProjectById(projectId) {
    console.log('[projectAPI.getProjectById] 获取项目详情, ID:', projectId)
    return api.get(`/zhiyan/api/projects/${projectId}`)
  },

  /**
   * 获取我创建的项目列表
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getMyCreatedProjects(page = 0, size = 10) {
    console.log('[projectAPI.getMyCreatedProjects] 获取我创建的项目')
    return api.get('/zhiyan/api/projects/my-created', {
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
    return api.get('/zhiyan/api/projects/my-projects', {
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
    return api.get('/zhiyan/api/projects/public/active', {
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
    return api.get('/zhiyan/api/projects/search', {
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
    return api.patch(`/zhiyan/api/projects/${projectId}/status`, { status })
  },

  /**
   * 归档项目
   * @param {Number} projectId - 项目ID
   */
  archiveProject(projectId) {
    console.log('[projectAPI.archiveProject] 归档项目, ID:', projectId)
    return api.post(`/zhiyan/api/projects/${projectId}/archive`)
  },

  /**
   * 统计我创建的项目数量
   */
  countMyCreatedProjects() {
    console.log('[projectAPI.countMyCreatedProjects] 统计我创建的项目')
    return api.get('/zhiyan/api/projects/count/my-created')
  },

  /**
   * 统计我参与的项目数量
   */
  countMyParticipatedProjects() {
    console.log('[projectAPI.countMyParticipatedProjects] 统计我参与的项目')
    return api.get('/zhiyan/api/projects/count/my-participated')
  },

  /**
   * 邀请成员加入项目
   * @param {Number} projectId - 项目ID
   * @param {Object} data - 包含 userId 和 role（可选，默认MEMBER）
   */
  inviteMember(projectId, data) {
    console.log('[projectAPI.inviteMember] 邀请成员, 项目ID:', projectId, '数据:', data)
    return api.post(`/zhiyan/api/projects/${projectId}/invite`, data)
  },

  /**
   * 分配角色给用户（添加成员）
   * @param {Number} projectId - 项目ID
   * @param {Object} data - 包含 userId 和 roleCode
   */
  assignRole(projectId, data) {
    console.log('[projectAPI.assignRole] 分配角色, 项目ID:', projectId, '数据:', data)
    return api.post(`/zhiyan/api/projects/${projectId}/assign`, data)
  },

  /**
   * 移除项目成员
   * @param {Number} projectId - 项目ID
   * @param {Number} userId - 用户ID
   */
  removeMember(projectId, userId) {
    console.log('[projectAPI.removeMember] 移除成员, 项目ID:', projectId, '用户ID:', userId)
    return api.delete(`/zhiyan/api/projects/${projectId}/members/${userId}`)
  },

  /**
   * 获取项目成员列表
   * @param {Number} projectId - 项目ID
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getProjectMembers(projectId, page = 0, size = 20) {
    console.log('[projectAPI.getProjectMembers] 获取项目成员, 项目ID:', projectId)
    return api.get(`/zhiyan/api/projects/${projectId}/members`, {
      params: { page, size }
    })
  },

  /**
   * 搜索用户（用于邀请成员）
   * 通过项目服务调用认证服务
   * @param {String} keyword - 搜索关键词（可以是姓名、邮箱等）
   * @param {Number} page - 页码，从0开始
   * @param {Number} size - 每页数量
   */
  searchUsers(keyword, page = 0, size = 10) {
    console.log('[projectAPI.searchUsers] 搜索用户, 关键词:', keyword, '页码:', page, '每页:', size)
    return api.get(`/zhiyan/api/users/search`, {
      params: { keyword, page, size }
    })
  }
}

export default api

