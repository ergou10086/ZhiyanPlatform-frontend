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
    
    // 对于FormData，不要手动设置Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      console.log('知识库API请求 (FormData):', config.method?.toUpperCase(), config.url)
      console.log('FormData 包含', config.data.getAll('files')?.length || 0, '个文件')
    } else {
      console.log('知识库API请求:', config.method?.toUpperCase(), config.url)
      console.log('请求数据:', config.data)
    }
    
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

// 前端类型到后端枚举的映射
export const TYPE_MAPPING = {
  '论文': 'paper',
  '专利': 'patent',
  '数据集': 'dataset',
  '算法模型': 'model',
  '模型文件': 'model',
  '报告': 'report',
  '实验报告': 'report'
}

// 后端枚举到前端显示的映射
export const TYPE_DISPLAY = {
  'paper': '论文',
  'patent': '专利',
  'dataset': '数据集',
  'model': '模型文件',
  'report': '实验报告',
  'custom': '自定义成果'
}

// 成果状态枚举
export const ACHIEVEMENT_STATUS = {
  DRAFT: 'draft',           // 草稿
  UNDER_REVIEW: 'under_review',  // 审核中
  PUBLISHED: 'published',   // 已发布
  OBSOLETE: 'obsolete'      // 已过时/归档
}

// 成果状态显示
export const STATUS_DISPLAY = {
  'draft': '草稿',
  'under_review': '审核中',
  'published': '已发布',
  'obsolete': '已归档'
}

// 成果状态样式类
export const STATUS_CLASS = {
  'draft': 'status-draft',
  'under_review': 'status-review',
  'published': 'status-published',
  'obsolete': 'status-obsolete'
}

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
    // 将前端类型映射为后端枚举
    if (TYPE_MAPPING[achievementData.type]) {
      achievementData.type = TYPE_MAPPING[achievementData.type]
    }
    return api.post('/zhiyan/achievement/create', achievementData)
  },
  
  /**
   * 根据项目ID查询成果列表
   * @param {Number} projectId - 项目ID
   * @param {Number} page - 页码（从0开始）
   * @param {Number} size - 每页数量
   */
  getProjectAchievements(projectId, page = 0, size = 20) {
    console.log('[knowledgeAPI.getProjectAchievements] 获取项目成果列表, 项目ID:', projectId)
    return api.get(`/zhiyan/achievement/search/project/${projectId}`, {
      params: { page, size, sortBy: 'createdAt', sortOrder: 'DESC' }
    })
  },

  /**
   * 更新成果状态
   * @param {Number} achievementId - 成果ID
   * @param {String} status - 成果状态 (draft/under_review/published/obsolete)
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
  },

  /**
   * 上传单个成果文件
   * @param {File} file - 文件对象
   * @param {Number} achievementId - 成果ID
   */
  uploadFile(file, achievementId) {
    console.log('[knowledgeAPI.uploadFile] 上传单个文件, achievementId:', achievementId, 'fileName:', file?.name)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('achievementId', achievementId)
    return api.post('/zhiyan/achievement/file/upload', formData)
  },

  /**
   * 批量上传成果文件
   * @param {File[]} files - 文件数组
   * @param {Number} achievementId - 成果ID
   */
  uploadFilesBatch(files, achievementId) {
    console.log('[knowledgeAPI.uploadFilesBatch] 批量上传文件, achievementId:', achievementId, 'fileCount:', files?.length)
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('achievementId', achievementId)
    return api.post('/zhiyan/achievement/file/upload/batch', formData)
  },

  /**
   * 获取成果文件列表
   * @param {Number} achievementId - 成果ID
   */
  getAchievementFiles(achievementId) {
    console.log('[knowledgeAPI.getAchievementFiles] 获取成果文件列表, achievementId:', achievementId)
    return api.get(`/zhiyan/achievement/file/${achievementId}/files`)
  },

  /**
   * 删除成果文件
   * @param {Number} fileId - 文件ID
   */
  deleteFile(fileId) {
    console.log('[knowledgeAPI.deleteFile] 删除文件, fileId:', fileId)
    return api.delete(`/zhiyan/achievement/file/${fileId}`)
  },

  /**
   * 获取文件下载URL
   * @param {Number} fileId - 文件ID
   * @param {Number} expirySeconds - 过期时间（秒）
   */
  getFileDownloadUrl(fileId, expirySeconds = 3600) {
    console.log('[knowledgeAPI.getFileDownloadUrl] 获取文件下载URL, fileId:', fileId)
    return api.get(`/zhiyan/achievement/file/${fileId}/download-url`, {
      params: { expirySeconds }
    })
  },

  /**
   * 批量更新成果详情字段
   * @param {Number} achievementId - 成果ID
   * @param {Object} fieldUpdates - 要更新的字段（键值对）
   */
  updateDetailFields(achievementId, fieldUpdates) {
    console.log('[knowledgeAPI.updateDetailFields] 更新成果详情字段, achievementId:', achievementId, 'fields:', fieldUpdates)
    return api.patch(`/zhiyan/achievement/detail/${achievementId}/fields`, fieldUpdates)
  }
}

export default api

