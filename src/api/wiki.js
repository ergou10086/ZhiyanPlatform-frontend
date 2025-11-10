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
    // 使用 console.warn，避免触发全局错误处理器
    console.warn('JSON解析错误:', e)
    return data
  }
}

/**
 * Wiki模块API客户端
 * 
 * 提供Wiki文档管理、版本控制、全文搜索、导入导出等功能
 * 所有请求通过Vue开发服务器的代理转发到8234端口（Wiki服务）
 * 
 * 代理配置在 vue.config.js 中：
 * - /api/wiki → http://localhost:8234
 */
const api = axios.create({
  baseURL: '', // 使用相对路径，通过Vue代理转发
  timeout: config.api.timeout,
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
      console.log('[Wiki API请求拦截器] 已附加 Authorization header')
    } else {
      console.warn('[Wiki API请求拦截器] 警告：access_token 为空')
    }
    
    // 对于FormData，不要手动设置Content-Type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = undefined
      console.log('[Wiki API请求拦截器] FormData 检测到，已清空 Content-Type')
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    console.log('[Wiki API请求拦截器] 请求:', config.method?.toUpperCase(), config.url)
    
    return config
  },
  error => {
    // 使用 console.warn，避免触发全局错误处理器
    console.warn('[Wiki API请求拦截器] 错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('[Wiki API响应]:', response.status, response.data)
    return response.data
  },
  error => {
    // 重要：不调用 console.error，避免被全局错误处理器捕获
    // 只在开发环境或非权限错误时记录日志
    
    if (error.response) {
      const { status, data } = error.response
      
      // 401 是认证错误，需要跳转登录
      if (status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
        return Promise.reject(data || error)
      }
      
      // 403 是权限错误，不跳转登录，让组件自己处理
      // 不调用 console.error，避免触发全局错误弹窗
      if (status === 403) {
        // 静默处理权限错误，让组件捕获并显示友好提示
        return Promise.reject(data || error)
      }
      
      // 其他服务器错误，使用 console.warn（不会触发全局错误处理器）
      if (status >= 500) {
        console.warn('[Wiki API] 服务器错误:', status, data)
      } else {
        console.warn('[Wiki API] 客户端错误:', status, data)
      }
      
      return Promise.reject(data || error)
    } else if (error.request) {
      // 网络错误，使用 console.warn
      console.warn('[Wiki API] 网络错误:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查Wiki服务'))
    } else {
      // 其他错误，使用 console.warn
      console.warn('[Wiki API] 其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

// ==================== 枚举常量 ====================

/**
 * Wiki页面类型
 */
export const PageType = {
  DIRECTORY: 'DIRECTORY',  // 目录
  DOCUMENT: 'DOCUMENT'     // 文档
}

/**
 * 导出格式
 */
export const ExportFormat = {
  MARKDOWN: 'MARKDOWN',
  PDF: 'PDF',
  WORD: 'WORD'
}

/**
 * 页面类型显示名称
 */
export const PAGE_TYPE_DISPLAY = {
  'DIRECTORY': '目录',
  'DOCUMENT': '文档'
}

/**
 * 导出格式显示名称
 */
export const EXPORT_FORMAT_DISPLAY = {
  'MARKDOWN': 'Markdown',
  'PDF': 'PDF文档',
  'WORD': 'Word文档'
}

// ==================== Wiki页面管理 API ====================

/**
 * Wiki页面管理相关接口
 */
export const wikiPageAPI = {
  /**
   * 创建Wiki页面
   * @param {Object} pageData - 页面数据
   * @param {Number} pageData.projectId - 项目ID（必需）
   * @param {String} pageData.title - 页面标题（必需）
   * @param {String} pageData.pageType - 页面类型：DIRECTORY/DOCUMENT（必需）
   * @param {String} pageData.content - 页面内容（Markdown格式，文档类型必需）
   * @param {Number} pageData.parentId - 父页面ID（可选，根页面为null）
   * @param {Boolean} pageData.isPublic - 是否公开（可选，默认false）
   * @param {Number} pageData.sortOrder - 排序序号（可选）
   * @param {String} pageData.changeDescription - 变更说明（可选）
   */
  createPage(pageData) {
    console.log('[wikiPageAPI.createPage] 创建Wiki页面, 数据:', pageData)
    return api.post('/api/wiki/pages', pageData)
  },

  /**
   * 更新Wiki页面
   * @param {Number} pageId - 页面ID
   * @param {Object} updateData - 更新数据
   * @param {String} updateData.title - 新标题（可选）
   * @param {String} updateData.content - 新内容（可选）
   * @param {String} updateData.changeDescription - 变更说明（可选）
   */
  updatePage(pageId, updateData) {
    console.log('[wikiPageAPI.updatePage] 更新Wiki页面, ID:', pageId, '数据:', updateData)
    return api.put(`/api/wiki/pages/${pageId}`, updateData)
  },

  /**
   * 删除Wiki页面
   * @param {Number} pageId - 页面ID
   */
  deletePage(pageId) {
    console.log('[wikiPageAPI.deletePage] 删除Wiki页面, ID:', pageId)
    return api.delete(`/api/wiki/pages/${pageId}`)
  },

  /**
   * 递归删除Wiki页面及其所有子页面
   * @param {Number} pageId - 页面ID
   */
  deletePageRecursively(pageId) {
    console.log('[wikiPageAPI.deletePageRecursively] 递归删除Wiki页面, ID:', pageId)
    return api.delete(`/api/wiki/pages/${pageId}/recursive`)
  },

  /**
   * 获取Wiki页面详情（含内容）
   * @param {Number} pageId - 页面ID
   */
  getPageDetail(pageId) {
    console.log('[wikiPageAPI.getPageDetail] 获取Wiki页面详情, ID:', pageId)
    return api.get(`/api/wiki/pages/${pageId}`)
  },

  /**
   * 获取项目的Wiki树状结构
   * @param {Number} projectId - 项目ID
   */
  getProjectWikiTree(projectId) {
    console.log('[wikiPageAPI.getProjectWikiTree] 获取项目Wiki树, 项目ID:', projectId)
    return api.get(`/api/wiki/projects/${projectId}/tree`)
  },

  /**
   * 移动Wiki页面
   * @param {Number} pageId - 页面ID
   * @param {Number} newParentId - 新父页面ID（null表示移到根目录）
   */
  movePage(pageId, newParentId) {
    console.log('[wikiPageAPI.movePage] 移动Wiki页面, ID:', pageId, '新父页面:', newParentId)
    return api.patch(`/api/wiki/pages/${pageId}/move`, { newParentId })
  },

  /**
   * 复制Wiki页面
   * @param {Number} pageId - 源页面ID
   * @param {Number} targetParentId - 目标父页面ID（可选）
   * @param {String} newTitle - 新标题（可选）
   */
  copyPage(pageId, targetParentId = null, newTitle = null) {
    console.log('[wikiPageAPI.copyPage] 复制Wiki页面, ID:', pageId)
    const params = {}
    if (targetParentId !== null) params.targetParentId = targetParentId
    if (newTitle !== null) params.newTitle = newTitle
    return api.post(`/api/wiki/pages/${pageId}/copy`, null, { params })
  },

  /**
   * 获取项目Wiki统计信息
   * @param {Number} projectId - 项目ID
   */
  getProjectStatistics(projectId) {
    console.log('[wikiPageAPI.getProjectStatistics] 获取Wiki统计, 项目ID:', projectId)
    return api.get(`/api/wiki/projects/${projectId}/statistics`)
  },

  /**
   * 获取最近更新的Wiki页面
   * @param {Number} projectId - 项目ID
   * @param {Number} limit - 数量限制（默认10）
   */
  getRecentlyUpdated(projectId, limit = 10) {
    console.log('[wikiPageAPI.getRecentlyUpdated] 获取最近更新, 项目ID:', projectId)
    return api.get(`/api/wiki/projects/${projectId}/recent`, {
      params: { limit }
    })
  }
}

// ==================== Wiki版本管理 API ====================

/**
 * Wiki版本管理相关接口
 */
export const wikiVersionAPI = {
  /**
   * 获取Wiki页面的版本历史列表
   * @param {Number} pageId - 页面ID
   */
  getVersionHistory(pageId) {
    console.log('[wikiVersionAPI.getVersionHistory] 获取版本历史, 页面ID:', pageId)
    return api.get(`/api/wiki/content/pages/${pageId}/versions`)
  },

  /**
   * 获取指定版本的内容
   * @param {Number} pageId - 页面ID
   * @param {Number} version - 版本号
   */
  getVersionContent(pageId, version) {
    console.log('[wikiVersionAPI.getVersionContent] 获取版本内容, 页面ID:', pageId, '版本:', version)
    return api.get(`/api/wiki/content/pages/${pageId}/versions/${version}`)
  },

  /**
   * 比较两个版本之间的差异
   * @param {Number} pageId - 页面ID
   * @param {Number} version1 - 版本1
   * @param {Number} version2 - 版本2
   */
  compareVersions(pageId, version1, version2) {
    console.log('[wikiVersionAPI.compareVersions] 比较版本差异, 页面ID:', pageId, 'v1:', version1, 'v2:', version2)
    return api.get(`/api/wiki/content/pages/${pageId}/compare`, {
      params: { version1, version2 }
    })
  },

  /**
   * 获取Wiki页面当前内容
   * @param {Number} pageId - 页面ID
   */
  getCurrentContent(pageId) {
    console.log('[wikiVersionAPI.getCurrentContent] 获取当前内容, 页面ID:', pageId)
    return api.get(`/api/wiki/content/pages/${pageId}/current`)
  },

  /**
   * 获取最近的版本历史（最多10个）
   * @param {Number} pageId - 页面ID
   */
  getRecentVersions(pageId) {
    console.log('[wikiVersionAPI.getRecentVersions] 获取最近版本, 页面ID:', pageId)
    return api.get(`/api/wiki/content/pages/${pageId}/versions/recent`)
  },

  /**
   * 获取所有版本历史（包括归档的）
   * @param {Number} pageId - 页面ID
   */
  getAllVersionHistory(pageId) {
    console.log('[wikiVersionAPI.getAllVersionHistory] 获取所有版本历史, 页面ID:', pageId)
    return api.get(`/api/wiki/content/pages/${pageId}/versions/all`)
  }
}

// ==================== Wiki搜索 API ====================

/**
 * Wiki搜索相关接口
 */
export const wikiSearchAPI = {
  /**
   * 搜索Wiki页面（标题搜索）
   * @param {Number} projectId - 项目ID
   * @param {String} keyword - 搜索关键词
   * @param {Number} page - 页码（从0开始）
   * @param {Number} size - 每页数量
   */
  searchByTitle(projectId, keyword, page = 0, size = 10) {
    console.log('[wikiSearchAPI.searchByTitle] 搜索Wiki标题, 项目ID:', projectId, '关键词:', keyword)
    return api.get(`/api/wiki/projects/${projectId}/search`, {
      params: { keyword, page, size }
    })
  },

  /**
   * 全文搜索Wiki内容（MongoDB文本索引）
   * @param {Number} projectId - 项目ID
   * @param {String} keyword - 搜索关键词
   */
  searchByContent(projectId, keyword) {
    console.log('[wikiSearchAPI.searchByContent] 全文搜索Wiki, 项目ID:', projectId, '关键词:', keyword)
    return api.get(`/api/wiki/projects/${projectId}/search/content`, {
      params: { keyword }
    })
  },

  /**
   * 全文搜索（支持评分和分页）
   * @param {Number} projectId - 项目ID
   * @param {String} keyword - 搜索关键词
   * @param {Number} page - 页码（从0开始）
   * @param {Number} size - 每页数量
   */
  fullTextSearch(projectId, keyword, page = 0, size = 10) {
    console.log('[wikiSearchAPI.fullTextSearch] 全文搜索（分页）, 项目ID:', projectId, '关键词:', keyword)
    return api.get(`/api/wiki/search/projects/${projectId}/fulltext`, {
      params: { keyword, page, size }
    })
  },

  /**
   * 简单全文搜索（不分页）
   * @param {Number} projectId - 项目ID
   * @param {String} keyword - 搜索关键词
   * @param {Number} limit - 结果数量限制
   */
  simpleSearch(projectId, keyword, limit = 20) {
    console.log('[wikiSearchAPI.simpleSearch] 简单搜索, 项目ID:', projectId, '关键词:', keyword)
    return api.get(`/api/wiki/search/projects/${projectId}/simple`, {
      params: { keyword, limit }
    })
  },

  /**
   * 高级搜索（支持短语搜索和排除词）
   * @param {Number} projectId - 项目ID
   * @param {Object} searchOptions - 搜索选项
   * @param {String} searchOptions.includeWords - 必须包含的词
   * @param {String} searchOptions.excludeWords - 必须排除的词
   * @param {String} searchOptions.phrase - 精确短语
   * @param {Number} page - 页码（从0开始）
   * @param {Number} size - 每页数量
   */
  advancedSearch(projectId, searchOptions, page = 0, size = 10) {
    console.log('[wikiSearchAPI.advancedSearch] 高级搜索, 项目ID:', projectId, '选项:', searchOptions)
    return api.get(`/api/wiki/search/projects/${projectId}/advanced`, {
      params: {
        includeWords: searchOptions.includeWords,
        excludeWords: searchOptions.excludeWords,
        phrase: searchOptions.phrase,
        page,
        size
      }
    })
  }
}

// ==================== Wiki导入导出 API ====================

/**
 * Wiki导入导出相关接口
 */
export const wikiImportExportAPI = {
  /**
   * 导出单个Wiki页面
   * @param {Number} pageId - 页面ID
   * @param {String} format - 导出格式：MARKDOWN/PDF/WORD（默认MARKDOWN）
   * @param {Boolean} includeChildren - 是否包含子页面（默认false）
   * @param {Boolean} includeAttachments - 是否包含附件（默认false）
   * @returns {Promise} 返回文件blob
   */
  exportPage(pageId, format = 'MARKDOWN', includeChildren = false, includeAttachments = false) {
    console.log('[wikiImportExportAPI.exportPage] 导出Wiki页面, ID:', pageId, '格式:', format)
    return api.get(`/api/wiki/pages/${pageId}/export`, {
      params: { format, includeChildren, includeAttachments },
      responseType: 'blob' // 重要：接收二进制文件
    })
  },

  /**
   * 批量导出Wiki页面（ZIP格式）
   * @param {Number} projectId - 项目ID
   * @param {Array<Number>} pageIds - 页面ID列表
   * @param {String} format - 导出格式（默认MARKDOWN）
   * @returns {Promise} 返回ZIP文件blob
   */
  exportPages(projectId, pageIds, format = 'MARKDOWN') {
    console.log('[wikiImportExportAPI.exportPages] 批量导出, 项目ID:', projectId, '页面数:', pageIds.length)
    return api.post(`/api/wiki/projects/${projectId}/export/batch`, pageIds, {
      params: { format },
      responseType: 'blob'
    })
  },

  /**
   * 导出整个Wiki目录树（ZIP格式）
   * @param {Number} pageId - 根页面ID
   * @param {String} format - 导出格式（默认MARKDOWN）
   * @returns {Promise} 返回ZIP文件blob
   */
  exportDirectory(pageId, format = 'MARKDOWN') {
    console.log('[wikiImportExportAPI.exportDirectory] 导出目录树, 根页面ID:', pageId)
    return api.get(`/api/wiki/pages/${pageId}/export/directory`, {
      params: { format },
      responseType: 'blob'
    })
  },

  /**
   * 导入Markdown文件
   * @param {Number} projectId - 项目ID
   * @param {File} file - Markdown文件
   * @param {Number} parentId - 父页面ID（可选）
   * @param {Boolean} overwrite - 是否覆盖同名页面（默认false）
   * @param {Boolean} isPublic - 是否设为公开（默认false）
   */
  importMarkdown(projectId, file, parentId = null, overwrite = false, isPublic = false) {
    console.log('[wikiImportExportAPI.importMarkdown] 导入Markdown, 项目ID:', projectId, '文件:', file.name)
    const formData = new FormData()
    formData.append('file', file)
    if (parentId !== null) formData.append('parentId', parentId)
    formData.append('overwrite', overwrite)
    formData.append('isPublic', isPublic)
    
    return api.post(`/api/wiki/projects/${projectId}/import`, formData)
  },

  /**
   * 批量导入Markdown文件
   * @param {Number} projectId - 项目ID
   * @param {Array<File>} files - Markdown文件列表
   * @param {Number} parentId - 父页面ID（可选）
   * @param {Boolean} overwrite - 是否覆盖同名页面（默认false）
   * @param {Boolean} isPublic - 是否设为公开（默认false）
   */
  importMultipleMarkdown(projectId, files, parentId = null, overwrite = false, isPublic = false) {
    console.log('[wikiImportExportAPI.importMultipleMarkdown] 批量导入, 项目ID:', projectId, '文件数:', files.length)
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    if (parentId !== null) formData.append('parentId', parentId)
    formData.append('overwrite', overwrite)
    formData.append('isPublic', isPublic)
    
    return api.post(`/api/wiki/projects/${projectId}/import/batch`, formData)
  }
}

// ==================== 工具函数 ====================

/**
 * 下载文件（处理blob响应）
 * @param {Blob} blob - 文件blob
 * @param {String} filename - 文件名
 */
export function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  console.log('[Wiki工具] 文件已下载:', filename)
}

/**
 * 格式化文件大小
 * @param {Number} bytes - 字节数
 * @returns {String} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化日期时间
 * @param {String|Date} dateTime - 日期时间
 * @returns {String} 格式化后的日期时间
 */
export function formatDateTime(dateTime) {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 计算相对时间（"刚刚"、"5分钟前"等）
 * @param {String|Date} dateTime - 日期时间
 * @returns {String} 相对时间描述
 */
export function timeAgo(dateTime) {
  if (!dateTime) return ''
  const now = new Date()
  const past = new Date(dateTime)
  const diff = Math.floor((now - past) / 1000) // 秒

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return formatDateTime(dateTime)
}

// ==================== 导出所有API ====================

/**
 * Wiki模块所有API的统一导出
 */
export const wikiAPI = {
  page: wikiPageAPI,
  version: wikiVersionAPI,
  search: wikiSearchAPI,
  importExport: wikiImportExportAPI
}

export default api

