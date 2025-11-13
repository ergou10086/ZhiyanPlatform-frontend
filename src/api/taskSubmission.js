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
 * 任务提交服务API客户端
 * 
 * 注意：所有任务提交相关的API请求都通过Vue开发服务器的代理转发到8095端口（项目服务）
 * 代理配置在 vue.config.js 中：
 * - /zhiyan/api/projects → http://localhost:8095
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
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // ✅ 对于 FormData 数据，不要手动设置 Content-Type
    // ✅ 让浏览器自动处理，这样 boundary 才能正确设置
    if (config.data instanceof FormData) {
      // 删除手动设置的 Content-Type，让浏览器自动设置（包括 boundary）
      delete config.headers['Content-Type']
    } else if (!config.headers['Content-Type']) {
      // 对于非 FormData 数据，设置默认的 Content-Type
      config.headers['Content-Type'] = 'application/json'
    }
    
    console.log('[任务提交API] 请求:', config.method?.toUpperCase(), config.url)
    
    return config
  },
  error => {
    console.error('[任务提交API] 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 后端返回的response.data就是R对象，包含code、msg、data字段
    // 直接返回response.data，这样前端就能访问到R对象的完整结构
    return response.data
  },
  error => {
    console.error('[任务提交API] 错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      console.error('[任务提交API] 服务器错误:', status, data)
      
      if (status === 401) {
        // token过期，跳转到登录页
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      if (status === 403) {
        console.error('[任务提交API] ❌ 403 Forbidden - 认证失败')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_info')
        window.location.href = '/login'
      }
      
      // 返回后端返回的错误数据（R对象），如果没有则返回error对象
      return Promise.reject(data || error)
    } else if (error.request) {
      console.error('[任务提交API] 网络错误:', error.request)
      return Promise.reject(new Error('网络连接失败，请检查后端服务'))
    } else {
      console.error('[任务提交API] 其他错误:', error.message)
      return Promise.reject(error)
    }
  }
)

/**
 * 任务提交相关API
 */

/**
 * 提交任务
 * @param {number} taskId - 任务ID
 * @param {object} data - 提交数据
 * @returns {Promise}
 */
export function submitTask(taskId, data) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/${taskId}/submit`,
    method: 'post',
    data
  });
}

/**
 * 审核任务提交
 * @param {number} submissionId - 提交记录ID
 * @param {object} data - 审核数据
 * @returns {Promise}
 */
export function reviewSubmission(submissionId, data) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/${submissionId}/review`,
    method: 'put',
    data
  });
}

/**
 * 撤回提交
 * @param {number} submissionId - 提交记录ID
 * @returns {Promise}
 */
export function revokeSubmission(submissionId) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/${submissionId}/revoke`,
    method: 'put'
  });
}

/**
 * 获取提交记录详情
 * @param {number} submissionId - 提交记录ID
 * @returns {Promise}
 */
export function getSubmissionDetail(submissionId) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/${submissionId}`,
    method: 'get'
  });
}

/**
 * 获取任务的所有提交记录
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function getTaskSubmissions(taskId) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/task/${taskId}`,
    method: 'get'
  });
}

/**
 * 获取任务的最新提交
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function getLatestSubmission(taskId) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/task/${taskId}/latest`,
    method: 'get'
  });
}

/**
 * 获取待审核的提交列表
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getPendingSubmissions(params) {
  return api({
    url: '/zhiyan/projects/tasks/submissions/pending',
    method: 'get',
    params
  });
}

/**
 * 获取项目的待审核提交列表
 * @param {number} projectId - 项目ID
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getProjectPendingSubmissions(projectId, params) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/project/${projectId}/pending`,
    method: 'get',
    params
  });
}

/**
 * 获取我的提交历史
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getMySubmissions(params) {
  return api({
    url: '/zhiyan/projects/tasks/submissions/my-submissions',
    method: 'get',
    params
  });
}

/**
 * 统计待审核的提交数量（已废弃）
 * @returns {Promise}
 */
export function countPendingSubmissions() {
  return api({
    url: '/zhiyan/projects/tasks/submissions/count/pending',
    method: 'get'
  });
}

/**
 * 获取我提交的待审核任务（我提交的，等待别人审核）
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getMyPendingSubmissions(params) {
  return api({
    url: '/zhiyan/projects/tasks/submissions/my-pending',
    method: 'get',
    params
  });
}

/**
 * 获取待我审核的提交（别人提交的，需要我审核的，因为我是任务创建者）
 * @param {object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getPendingSubmissionsForReview(params) {
  return api({
    url: '/zhiyan/projects/tasks/submissions/pending-for-review',
    method: 'get',
    params
  });
}

/**
 * 统计我提交的待审核任务数量
 * @returns {Promise}
 */
export function countMyPendingSubmissions() {
  return api({
    url: '/zhiyan/projects/tasks/submissions/count/my-pending',
    method: 'get'
  });
}

/**
 * 统计待我审核的提交数量（任务创建者是我）
 * @returns {Promise}
 */
export function countPendingSubmissionsForReview() {
  return api({
    url: '/zhiyan/projects/tasks/submissions/count/pending-for-review',
    method: 'get'
  });
}

/**
 * 统计项目的待审核提交数量
 * @param {number} projectId - 项目ID
 * @returns {Promise}
 */
export function countProjectPendingSubmissions(projectId) {
  return api({
    url: `/zhiyan/projects/tasks/submissions/count/project/${projectId}/pending`,
    method: 'get'
  });
}

/**
 * 上传单个附件
 * @param {File} file - 文件对象
 * @returns {Promise}
 */
export function uploadSubmissionFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  return api({
    url: '/zhiyan/projects/tasks/submissions/files/upload',
    method: 'post',
    data: formData
    // ✅ 不需要手动设置 Content-Type，拦截器会自动处理
  });
}

/**
 * 批量上传附件
 * @param {FileList} files - 文件列表
 * @returns {Promise}
 */
export function uploadSubmissionFiles(files) {
  const formData = new FormData();
  
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  return api({
    url: '/zhiyan/projects/tasks/submissions/files/upload-batch',
    method: 'post',
    data: formData
    // ✅ 不需要手动设置 Content-Type，拦截器会自动处理
  });
}

/**
 * 删除附件
 * @param {string} fileUrl - 文件URL
 * @returns {Promise}
 */
export function deleteSubmissionFile(fileUrl) {
  return api({
    url: '/zhiyan/projects/tasks/submissions/files',
    method: 'delete',
    params: { fileUrl }
  });
}

/**
 * 批量删除附件
 * @param {Array<string>} fileUrls - 文件URL列表
 * @returns {Promise}
 */
export function deleteSubmissionFiles(fileUrls) {
  return api({
    url: '/zhiyan/projects/tasks/submissions/files/batch',
    method: 'delete',
    data: fileUrls
  });
}

/**
 * 获取文件临时访问URL
 * @param {string} fileUrl - 文件URL
 * @returns {Promise}
 */
export function getPresignedUrl(fileUrl) {
  return api({
    url: '/zhiyan/projects/tasks/submissions/files/presigned-url',
    method: 'get',
    params: { fileUrl }
  });
}

/**
 * 下载文件（后端代理下载，避免CORS问题）
 * @param {string} fileUrl - 文件URL
 * @returns {string} 下载接口的完整URL
 */
export function getDownloadUrl(fileUrl) {
  const token = localStorage.getItem('access_token')
  const encodedUrl = encodeURIComponent(fileUrl)
  return `/zhiyan/projects/tasks/submissions/files/download?fileUrl=${encodedUrl}&token=${token}`
}
