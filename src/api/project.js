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

/**
 * 项目服务API客户端
 * 
 * 注意：所有项目相关的API请求都通过Vue开发服务器的代理转发到8095端口（项目服务）
 * 代理配置在 vue.config.js 中：
 * - /zhiyan/projects → http://localhost:8095
 * 
 * 使用相对路径（baseURL为空），让代理服务器处理路由
 */
const api = axios.create({
  baseURL: '', // 使用相对路径，通过Vue代理转发到8095端口（项目服务）
  timeout: config.api.timeout,
  withCredentials: true,
  // 自定义响应转换，将大整数转换为字符串
  transformResponse: [function (data) {
    return parseJSONWithBigInt(data)
  }]
  // ✅ 不设置默认 Content-Type，让 Axios 根据数据类型自动处理
  // ✅ 对于 FormData，Axios 会自动设置为 multipart/form-data
  // headers: {
  //   'Content-Type': 'application/json',
  //   'Accept': 'application/json'
  // }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[API请求拦截器] 已附加 Authorization header')
    } else {
      console.warn('[API请求拦截器]  警告：access_token 为空')
    }
    
    // ✅ 对于 FormData 数据，不要手动设置 Content-Type
    // ✅ 只删除默认的 Content-Type，让浏览器自动处理
    if (config.data instanceof FormData) {
      // 不删除 headers 对象本身，只在需要时删除特定属性
      // 但更安全的做法是使用 undefined 而不是 delete
      config.headers['Content-Type'] = undefined
      console.log('[API请求拦截器] FormData 检测到，已清空 Content-Type，让浏览器自动设置')
      console.log('[API请求拦截器] 当前请求头:', config.headers)
    } else if (!config.headers['Content-Type']) {
      // 对于非 FormData 数据，设置默认的 Content-Type
      config.headers['Content-Type'] = 'application/json'
    }
    
    console.log('[API请求拦截器] 项目API请求:', config.method?.toUpperCase(), config.url)
    console.log('[API请求拦截器] 请求数据类型:', config.data instanceof FormData ? 'FormData' : typeof config.data)
    console.log('[API请求拦截器] 最终请求头:', config.headers)
    
    return config
  },
  error => {
    console.error('[API请求拦截器] 错误:', error)
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
      const { status, data } = error.response
      console.error('服务器错误:', status, data)
      
      if (status === 401) {
        // token过期，跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      // ✅ 处理 403 Forbidden - 可能是 token 过期或无效
      if (status === 403) {
        console.error('[API响应拦截器] ❌ 403 Forbidden - 认证失败')
        console.error('[API响应拦截器] 清除所有认证信息并跳转到登录页')
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
    return api.post('/zhiyan/projects', projectData)
  },

  /**
   * 更新项目
   * @param {Number} projectId - 项目ID
   * @param {Object} projectData - 项目数据
   */
  updateProject(projectId, projectData) {
    console.log('[projectAPI.updateProject] 更新项目, ID:', projectId, '数据:', projectData)
    return api.put(`/zhiyan/projects/${projectId}`, projectData)
  },

  /**
   * 删除项目
   * @param {Number} projectId - 项目ID
   */
  deleteProject(projectId) {
    console.log('[projectAPI.deleteProject] 删除项目, ID:', projectId)
    return api.delete(`/zhiyan/projects/${projectId}`)
  },

  /**
   * 获取项目详情
   * @param {Number} projectId - 项目ID
   */
  getProjectById(projectId) {
    console.log('[projectAPI.getProjectById] 获取项目详情, ID:', projectId)
    return api.get(`/zhiyan/projects/${projectId}`)
  },

  /**
   * 获取我创建的项目列表
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getMyCreatedProjects(page = 0, size = 10) {
    console.log('[projectAPI.getMyCreatedProjects] 获取我创建的项目')
    return api.get('/zhiyan/projects/my-created', {
      params: { page, size },
      timeout: 60000 // 列表查询可能需要更长时间，设置为60秒
    })
  },

  /**
   * 获取我参与的项目列表
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getMyProjects(page = 0, size = 10) {
    console.log('[projectAPI.getMyProjects] 获取我参与的项目')
    return api.get('/zhiyan/projects/my-projects', {
      params: { page, size },
      timeout: 60000 // 列表查询可能需要更长时间，设置为60秒
    })
  },

  /**
   * 获取公开的活跃项目
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getPublicActiveProjects(page = 0, size = 10) {
    console.log('[projectAPI.getPublicActiveProjects] 获取公开项目')
    return api.get('/zhiyan/projects/public/active', {
      params: { page, size },
      timeout: 60000 // 列表查询可能需要更长时间，设置为60秒
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
    return api.get('/zhiyan/projects/search', {
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
    return api.patch(`/zhiyan/projects/${projectId}/status`, { status })
  },

  /**
   * 归档项目
   * @param {Number} projectId - 项目ID
   */
  archiveProject(projectId) {
    console.log('[projectAPI.archiveProject] 归档项目, ID:', projectId)
    return api.post(`/zhiyan/projects/${projectId}/archive`)
  },

  /**
   * 统计我创建的项目数量
   */
  countMyCreatedProjects() {
    console.log('[projectAPI.countMyCreatedProjects] 统计我创建的项目')
    return api.get('/zhiyan/projects/count/my-created')
  },

  /**
   * 统计我参与的项目数量
   */
  countMyParticipatedProjects() {
    console.log('[projectAPI.countMyParticipatedProjects] 统计我参与的项目')
    return api.get('/zhiyan/projects/count/my-participated')
  },

  /**
   * 上传项目图片
   * @param {File} file - 图片文件
   * @param {Number} projectId - 项目ID（可选）
   */
  uploadProjectImage(file, projectId = null) {
    console.log('[projectAPI.uploadProjectImage] 上传项目图片, projectId:', projectId)
    
    const formData = new FormData()
    formData.append('file', file)
    if (projectId) {
      formData.append('projectId', projectId)
    }
    
    // ✅ 不要手动设置 Content-Type
    // ✅ Axios 会自动检测 FormData 并设置正确的 multipart/form-data (包含 boundary)
    return api.post('/zhiyan/projects/upload-image', formData)
  },

  /**
   * 删除项目图片
   * @param {String} imageUrl - 图片URL
   */
  deleteProjectImage(imageUrl) {
    console.log('[projectAPI.deleteProjectImage] 删除项目图片:', imageUrl)
    return api.delete('/zhiyan/projects/delete-image', {
      params: { imageUrl }
    })
  },

  /**
   * 邀请成员加入项目
   * @param {Number} projectId - 项目ID
   * @param {Object} data - 包含 userId 和 role（可选，默认MEMBER）
   */
  inviteMember(projectId, data) {
    console.log('[projectAPI.inviteMember] 邀请成员, 项目ID:', projectId, '数据:', data)
    return api.post(`/zhiyan/projects/${projectId}/invite`, data)
  },

  /**
   * 分配角色给用户（添加成员）
   * @param {Number} projectId - 项目ID
   * @param {Object} data - 包含 userId 和 roleCode
   */
  assignRole(projectId, data) {
    console.log('[projectAPI.assignRole] 分配角色, 项目ID:', projectId, '数据:', data)
    return api.post(`/zhiyan/projects/${projectId}/assign`, data)
  },

  /**
   * 移除项目成员
   * @param {Number} projectId - 项目ID
   * @param {Number} userId - 用户ID
   */
  removeMember(projectId, userId) {
    console.log('[projectAPI.removeMember] 移除成员, 项目ID:', projectId, '用户ID:', userId)
    return api.delete(`/zhiyan/projects/${projectId}/members/${userId}`)
  },

  /**
   * 获取项目成员列表
   * @param {Number} projectId - 项目ID
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getProjectMembers(projectId, page = 0, size = 20) {
    console.log('[projectAPI.getProjectMembers] 获取项目成员, 项目ID:', projectId)
    return api.get(`/zhiyan/projects/${projectId}/members`, {
      params: { page, size },
      timeout: 60000 // 成员列表查询可能需要更长时间，设置为60秒
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
    return api.get(`/zhiyan/projects/users/search`, {
      params: { keyword, page, size }
    })
  },

  /**
   * 检查用户是否为项目管理员（包括OWNER和ADMIN）
   * @param {Number} projectId - 项目ID
   */
  checkAdmin(projectId) {
    console.log('[projectAPI.checkAdmin] 检查管理员身份, 项目ID:', projectId)
    return api.get(`/zhiyan/projects/${projectId}/check-admin`)
  },

  /**
   * 检查用户是否为项目拥有者
   * @param {Number} projectId - 项目ID
   */
  checkOwner(projectId) {
    console.log('[projectAPI.checkOwner] 检查拥有者身份, 项目ID:', projectId)
    return api.get(`/zhiyan/projects/${projectId}/check-owner`)
  },

  /**
   * 更新成员角色
   * @param {Number} projectId - 项目ID
   * @param {Number} userId - 用户ID
   * @param {String} role - 新角色 (OWNER, ADMIN, MEMBER)
   */
  updateMemberRole(projectId, userId, role) {
    console.log('[projectAPI.updateMemberRole] 更新成员角色, 项目ID:', projectId, '用户ID:', userId, '角色:', role)
    return api.put(`/zhiyan/projects/${projectId}/members/${userId}/role`, { newRole: role })
  },

  getProjectTasksByStatus(projectId, status = 'DONE', page = 0, size = 20) {
    console.log('[projectAPI.getProjectTasksByStatus] 获取项目任务, 项目ID:', projectId, '状态:', status)
    return api.get(`/zhiyan/projects/tasks/projects/${projectId}/status/${status}`, {
      params: { page, size }
    })
  }
}

export default api

