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
    
    console.log('任务API请求:', config.method?.toUpperCase(), config.url)
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
    console.log('任务API响应:', response.status, response.data)
    // 后端返回的response.data就是R对象，包含code、msg、data字段
    // 直接返回response.data，这样前端就能访问到R对象的完整结构
    return response.data
  },
  error => {
    console.error('任务API错误:', error)
    
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

// 任务相关API
export const taskAPI = {
  /**
   * 创建任务
   * @param {Object} taskData - 任务数据
   * @param {Number} taskData.projectId - 项目ID (必需)
   * @param {String} taskData.title - 任务标题 (必需)
   * @param {String} taskData.description - 任务描述
   * @param {Array} taskData.assigneeIds - 执行者ID列表
   * @param {String} taskData.priority - 优先级 (HIGH/MEDIUM/LOW)
   * @param {String} taskData.dueDate - 截止日期 (YYYY-MM-DD)
   * @param {Number} taskData.worktime - 预估工时
   */
  createTask(taskData) {
    console.log('[taskAPI.createTask] 创建任务, 数据:', taskData)
    return api.post('/zhiyan/api/projects/tasks', taskData)
  },

  /**
   * 批量创建任务
   * @param {Number} projectId - 项目ID
   * @param {Array} tasks - 任务列表
   */
  async createTasksBatch(projectId, tasks) {
    console.log('[taskAPI.createTasksBatch] 批量创建任务, 项目ID:', projectId, '任务数量:', tasks.length)
    
    const results = []
    const errors = []
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      try {
        const result = await this.createTask({
          projectId: projectId,
          title: task.title,
          description: task.description,
          assigneeIds: task.assignee_id || [],
          priority: task.priority_value || 'MEDIUM',
          dueDate: task.dueDate || task.due_date || null,
          worktime: task.worktime || null
        })
        
        console.log(`任务 ${i + 1}/${tasks.length} 创建成功:`, result)
        results.push(result)
      } catch (error) {
        console.error(`任务 ${i + 1}/${tasks.length} 创建失败:`, error)
        errors.push({
          task: task,
          error: error
        })
      }
    }
    
    return {
      success: results.length,
      failed: errors.length,
      total: tasks.length,
      results: results,
      errors: errors
    }
  },

  /**
   * 更新任务
   * @param {Number} taskId - 任务ID
   * @param {Object} taskData - 任务数据
   */
  updateTask(taskId, taskData) {
    console.log('[taskAPI.updateTask] 更新任务, ID:', taskId, '数据:', taskData)
    return api.put(`/zhiyan/api/projects/tasks/${taskId}`, taskData)
  },

  /**
   * 删除任务
   * @param {Number} taskId - 任务ID
   */
  deleteTask(taskId) {
    console.log('[taskAPI.deleteTask] 删除任务, ID:', taskId)
    return api.delete(`/zhiyan/api/projects/tasks/${taskId}`)
  },

  /**
   * 获取任务详情
   * @param {Number} taskId - 任务ID
   */
  getTaskDetail(taskId) {
    console.log('[taskAPI.getTaskDetail] 获取任务详情, ID:', taskId)
    return api.get(`/zhiyan/api/projects/tasks/${taskId}`)
  },

  /**
   * 获取项目任务看板
   * @param {Number} projectId - 项目ID
   */
  getTaskBoard(projectId) {
    console.log('[taskAPI.getTaskBoard] 获取任务看板, 项目ID:', projectId)
    return api.get(`/zhiyan/api/projects/tasks/projects/${projectId}/board`)
  },

  /**
   * 获取项目任务列表
   * @param {Number} projectId - 项目ID
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getProjectTasks(projectId, page = 0, size = 20) {
    console.log('[taskAPI.getProjectTasks] 获取项目任务列表, 项目ID:', projectId)
    return api.get(`/zhiyan/api/projects/tasks/projects/${projectId}`, {
      params: { page, size }
    })
  },

  /**
   * 更新任务状态
   * @param {Number} taskId - 任务ID
   * @param {String} status - 任务状态
   */
  updateTaskStatus(taskId, status) {
    console.log('[taskAPI.updateTaskStatus] 更新任务状态, ID:', taskId, '状态:', status)
    return api.patch(`/zhiyan/api/projects/tasks/${taskId}/status`, { status })
  },

  /**
   * 分配任务
   * @param {Number} taskId - 任务ID
   * @param {Array} assigneeIds - 执行者ID列表
   */
  assignTask(taskId, assigneeIds) {
    console.log('[taskAPI.assignTask] 分配任务, ID:', taskId, '执行者:', assigneeIds)
    return api.put(`/zhiyan/api/projects/tasks/${taskId}/assign`, assigneeIds)
  },

  /**
   * 接取任务
   * @param {Number} taskId - 任务ID
   */
  claimTask(taskId) {
    console.log('[taskAPI.claimTask] 接取任务, ID:', taskId)
    return api.post(`/zhiyan/api/projects/tasks/${taskId}/claim`)
  },

  /**
   * 获取我的任务
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getMyAssignedTasks(page = 0, size = 20) {
    console.log('[taskAPI.getMyAssignedTasks] 获取我的任务')
    return api.get('/zhiyan/api/projects/tasks/my-assigned', {
      params: { page, size }
    })
  },

  /**
   * 获取我创建的任务
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getMyCreatedTasks(page = 0, size = 20) {
    console.log('[taskAPI.getMyCreatedTasks] 获取我创建的任务')
    return api.get('/zhiyan/api/projects/tasks/my-created', {
      params: { page, size }
    })
  },

  /**
   * 搜索任务
   * @param {Number} projectId - 项目ID
   * @param {String} keyword - 搜索关键词
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  searchTasks(projectId, keyword, page = 0, size = 20) {
    console.log('[taskAPI.searchTasks] 搜索任务, 关键词:', keyword)
    return api.get(`/zhiyan/api/projects/tasks/projects/${projectId}/search`, {
      params: { keyword, page, size }
    })
  },

  /**
   * 获取即将到期的任务
   * @param {Number} projectId - 项目ID
   * @param {Number} days - 未来天数
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getUpcomingTasks(projectId, days = 7, page = 0, size = 20) {
    console.log('[taskAPI.getUpcomingTasks] 获取即将到期的任务')
    return api.get(`/zhiyan/api/projects/tasks/projects/${projectId}/upcoming`, {
      params: { days, page, size }
    })
  },

  /**
   * 获取已逾期的任务
   * @param {Number} projectId - 项目ID
   * @param {Number} page - 页码
   * @param {Number} size - 每页数量
   */
  getOverdueTasks(projectId, page = 0, size = 20) {
    console.log('[taskAPI.getOverdueTasks] 获取已逾期的任务')
    return api.get(`/zhiyan/api/projects/tasks/projects/${projectId}/overdue`, {
      params: { page, size }
    })
  },

  /**
   * 统计项目任务数量
   * @param {Number} projectId - 项目ID
   */
  countProjectTasks(projectId) {
    console.log('[taskAPI.countProjectTasks] 统计项目任务')
    return api.get(`/zhiyan/api/projects/tasks/projects/${projectId}/count`)
  }
}

export default api

