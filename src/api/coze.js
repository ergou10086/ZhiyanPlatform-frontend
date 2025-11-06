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

// 创建axios实例 - 使用Vue代理
const api = axios.create({
  baseURL: '', // 使用相对路径，通过Vue代理转发
  timeout: 300000, // SSE流式响应需要更长的超时时间
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream, application/json'
  },
  withCredentials: true,
  // 自定义响应转换，将大整数转换为字符串
  transformResponse: [function (data) {
    return parseJSONWithBigInt(data)
  }]
})

/**
 * JSON 拼接工具函数
 * 用于处理可能被分割的 JSON 数据（包括格式化的多行 JSON）
 */
function parseJSONWithBuffer(dataBuffer, line) {
  // 初始化缓冲区
  if (!dataBuffer.accumulated) {
    dataBuffer.accumulated = ''
  }
  
  // 移除 'data:' 或 'data: ' 前缀（处理有无空格的情况）
  let jsonData = line
  if (line.startsWith('data: ')) {
    jsonData = line.substring(6)  // 'data: ' (6 字符)
  } else if (line.startsWith('data:')) {
    jsonData = line.substring(5)  // 'data:' (5 字符)
  }
  
  // 如果为空，跳过
  if (!jsonData.trim()) {
    return null
  }
  
  // 对于格式化 JSON（每行一个字段），需要在行之间添加换行符
  // 检查是否需要添加换行符或空格
  if (dataBuffer.accumulated) {
    const trimmed = jsonData.trim()
    const accumulatedTrimmed = dataBuffer.accumulated.trim()
    
    // 如果缓冲区还没有 JSON 开始标记（{ 或 [），但当前行是字段行，需要先添加 {
    if (!accumulatedTrimmed.startsWith('{') && !accumulatedTrimmed.startsWith('[') && trimmed.includes(':')) {
      // 这是格式化的 JSON 字段行，需要先添加 {
      dataBuffer.accumulated = '{' + (dataBuffer.accumulated ? '\n' : '') + dataBuffer.accumulated
    }
    
    // 如果当前行不是 } 或 ]，且缓冲区不以换行符或空格结尾，添加换行符
    if (!trimmed.startsWith('}') && !trimmed.startsWith(']') && 
        !accumulatedTrimmed.endsWith(',') && 
        !dataBuffer.accumulated.endsWith('\n') && !dataBuffer.accumulated.endsWith(' ') &&
        !dataBuffer.accumulated.endsWith('{') && !dataBuffer.accumulated.endsWith('[')) {
      dataBuffer.accumulated += '\n'
    }
  } else {
    // 如果缓冲区为空，但当前行是字段行（不是以 { 开头），需要先添加 {
    const trimmed = jsonData.trim()
    if (trimmed.includes(':') && !trimmed.startsWith('{') && !trimmed.startsWith('[') && !trimmed.startsWith('}') && !trimmed.startsWith(']')) {
      dataBuffer.accumulated = '{\n'
    }
  }
  
  // 累积 JSON 数据（保留原始格式用于格式化 JSON）
  // 如果当前数据以 { 或 [ 开头，说明这是一个新的 JSON 对象，清空缓冲区
  const trimmedJsonData = jsonData.trim()
  if (trimmedJsonData.startsWith('{') || trimmedJsonData.startsWith('[')) {
    // 如果缓冲区有内容且还没有解析成功，说明上一个 JSON 对象不完整，清空它
    if (dataBuffer.accumulated.trim()) {
      const oldAccumulated = dataBuffer.accumulated.trim()
      // 尝试解析旧的缓冲区内容，如果失败则丢弃
      try {
        const parsed = JSON.parse(oldAccumulated)
        dataBuffer.accumulated = jsonData  // 开始新的 JSON 对象
        return parsed  // 返回旧的解析结果
      } catch (e) {
        // 旧的缓冲区内容无法解析，丢弃并开始新的
        console.warn('[cozeAPI] 丢弃无法解析的缓冲区内容:', oldAccumulated.substring(0, 100))
        dataBuffer.accumulated = jsonData
      }
    } else {
      dataBuffer.accumulated = jsonData
    }
  } else {
    // 继续累积到缓冲区
    dataBuffer.accumulated += jsonData
  }
  
  // 尝试解析 JSON
  try {
    let jsonToParse = dataBuffer.accumulated.trim()
    
    // 如果 JSON 以 { 开头但没有 } 结尾，尝试添加 }
    if (jsonToParse.startsWith('{') && !jsonToParse.endsWith('}')) {
      // 检查是否确实缺少结束括号
      const openBraces = (jsonToParse.match(/\{/g) || []).length
      const closeBraces = (jsonToParse.match(/\}/g) || []).length
      if (openBraces > closeBraces) {
        // 不自动添加 }，等待更多数据
        return null
      }
    }
    
    // 如果 JSON 以 [ 开头但没有 ] 结尾，尝试添加 ]
    if (jsonToParse.startsWith('[') && !jsonToParse.endsWith(']')) {
      const openBrackets = (jsonToParse.match(/\[/g) || []).length
      const closeBrackets = (jsonToParse.match(/\]/g) || []).length
      if (openBrackets > closeBrackets) {
        // 不自动添加 ]，等待更多数据
        return null
      }
    }
    
    const parsed = JSON.parse(jsonToParse)
    // 解析成功，清空缓冲区并返回
    dataBuffer.accumulated = ''
    return parsed
  } catch (e) {
    // JSON 不完整，继续累积
    const trimmed = dataBuffer.accumulated.trim()
    
    // 检查是否是有效的 JSON 开始（以 { 或 [ 开头）
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      // 不是有效的 JSON 格式开头
      // 检查是否包含键值对模式（可能是格式化的 JSON 片段）
      if (trimmed.includes(':') || trimmed === '}' || trimmed === ']') {
        // 可能是格式化的 JSON，继续累积
        // 检查缓冲区大小，防止内存泄漏
        if (dataBuffer.accumulated.length > 100000) {
          console.error('[cozeAPI] JSON 缓冲区过大（>100KB），可能格式错误，清空缓冲区')
          const failedData = dataBuffer.accumulated
          dataBuffer.accumulated = ''
          return { error: true, rawData: failedData.substring(0, 200) }
        }
        return null
      } else {
        // 不是有效的 JSON 片段，可能是格式错误
        console.warn('[cozeAPI] 检测到无效的 JSON 片段:', trimmed.substring(0, 100))
        dataBuffer.accumulated = ''
        return { error: true, rawData: trimmed.substring(0, 200) }
      }
    }
    
    // 是有效的 JSON 开始，但不完整，继续累积
    // 检查缓冲区大小，防止内存泄漏
    if (dataBuffer.accumulated.length > 100000) {
      console.error('[cozeAPI] JSON 缓冲区过大（>100KB），可能格式错误，清空缓冲区')
      const failedData = dataBuffer.accumulated
      dataBuffer.accumulated = ''
      return { error: true, rawData: failedData.substring(0, 200) }
    }
    
    return null
  }
}

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
      console.log('Coze API请求 (FormData):', config.method?.toUpperCase(), config.url)
    } else {
      console.log('Coze API请求:', config.method?.toUpperCase(), config.url)
    }
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器（仅用于非SSE请求）
api.interceptors.response.use(
  response => {
    console.log('Coze API响应:', response.status, response.data)
    return response.data
  },
  error => {
    console.error('Coze API错误:', error)
    
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

/**
 * Coze AI API
 */
export const cozeAPI = {
  /**
   * 流式对话（不带文件）
   * @param {String} query - 用户问题
   * @param {String} conversationId - 对话ID（可选，用于维持会话）
   * @param {Object} customVariables - 自定义变量（可选）
   * @param {Function} onMessage - 消息回调函数 (message) => void
   * @param {Function} onError - 错误回调函数 (error) => void
   * @param {Function} onComplete - 完成回调函数 () => void
   * @returns {EventSource} EventSource实例，用于关闭连接
   */
  chatStream(query, conversationId = null, customVariables = null, onMessage, onError, onComplete) {
    console.log('[cozeAPI.chatStream] 开始流式对话, query:', query, 'conversationId:', conversationId)
    
    // 获取token并验证
    const token = localStorage.getItem('access_token')
    if (!token) {
      const error = new Error('未登录，请先登录')
      console.error('[cozeAPI.chatStream] 认证失败:', error.message)
      if (onError) onError(error)
      return Promise.reject(error)
    }
    
    // 构建URL（使用相对路径，确保通过Vue代理）
    let url = '/zhiyan/api/coze/chat/stream'
    const params = new URLSearchParams()
    params.append('query', query)
    if (conversationId) {
      params.append('conversationId', conversationId)
    }
    url += '?' + params.toString()
    
    // 构建请求体（自定义变量）
    let body = null
    if (customVariables && Object.keys(customVariables).length > 0) {
      body = JSON.stringify(customVariables)
    } else {
      // 即使没有自定义变量，也要发送空对象，确保是 POST 请求
      body = '{}'
    }
    
    console.log('[cozeAPI.chatStream] 请求URL:', url)
    console.log('[cozeAPI.chatStream] Token存在:', !!token)
    
    // 使用fetch API处理SSE（支持POST和自定义请求头）
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      body: body,
      credentials: 'include' // 确保cookies也被传递
    })
      .then(response => {
        console.log('[cozeAPI.chatStream] 响应状态:', response.status, response.statusText)
        
        // 检查是否被重定向到登录页
        if (response.status === 401 || response.status === 403) {
          const error = new Error('认证失败，请重新登录')
          console.error('[cozeAPI.chatStream] 认证失败:', response.status)
          if (onError) onError(error)
          throw error
        }
        
        // 检查响应类型
        const contentType = response.headers.get('content-type')
        console.log('[cozeAPI.chatStream] 响应Content-Type:', contentType)
        console.log('[cozeAPI.chatStream] 响应URL:', response.url)
        
        if (!contentType || !contentType.includes('text/event-stream')) {
          console.warn('[cozeAPI.chatStream] 响应类型不是SSE:', contentType)
          // 读取响应内容查看实际返回的是什么
          return response.text().then(text => {
            console.error('[cozeAPI.chatStream] 非SSE响应内容（前500字符）:', text.substring(0, 500))
            // 如果是HTML，可能是错误页面
            if (contentType && contentType.includes('text/html')) {
              const error = new Error(`服务器返回了HTML页面，可能是认证失败或请求被拦截。响应内容: ${text.substring(0, 200)}`)
              console.error('[cozeAPI.chatStream] HTML响应，可能是认证问题或路径错误')
              if (onError) onError(error)
              throw error
            }
            const error = new Error(`服务器错误: ${response.status} - ${text.substring(0, 200)}`)
            if (onError) onError(error)
            throw error
          })
        }
        
        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`)
          console.error('[cozeAPI.chatStream] HTTP错误:', response.status)
          if (onError) onError(error)
          throw error
        }
        
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = '' // SSE 行缓冲区
        const jsonBuffer = { accumulated: '' } // JSON 数据缓冲区，用于拼接分散的 JSON
        
        const readChunk = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 流结束，处理剩余的缓冲区数据
              if (buffer.trim()) {
                console.log('[cozeAPI.chatStream] 流结束，处理剩余缓冲区:', buffer)
                const lines = buffer.split('\n')
                for (const line of lines) {
                  // 处理 data: 开头的行（包括所有格式）
                  if (line.startsWith('data:') || line.trim().startsWith('data:')) {
                    const message = parseJSONWithBuffer(jsonBuffer, line)
                    if (message && !message.error) {
                      if (onMessage) onMessage(message)
                    }
                  } else if (line.startsWith('event: ') || line.trim().startsWith('event:')) {
                    const eventType = line.includes(':') ? line.substring(line.indexOf(':') + 1).trim() : line.trim()
                    console.log('[cozeAPI.chatStream] 流结束时的事件类型:', eventType)
                  }
                }
              }
              
              // 处理剩余的不完整 JSON
              if (jsonBuffer.accumulated.trim()) {
                console.warn('[cozeAPI.chatStream] 流结束，但仍有未解析的 JSON 数据:', jsonBuffer.accumulated)
                try {
                  const message = JSON.parse(jsonBuffer.accumulated)
                  if (onMessage) onMessage(message)
                } catch (e) {
                  console.error('[cozeAPI.chatStream] 无法解析剩余的 JSON 数据:', e, '原始数据:', jsonBuffer.accumulated)
                }
                jsonBuffer.accumulated = ''
              }
              
              if (onComplete) onComplete()
              return
            }
            
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留最后不完整的行
            
            for (const line of lines) {
              // 处理 data: 开头的行（SSE 数据）
              if (line.startsWith('data:') || line.trim().startsWith('data:')) {
                // 提取 data: 后面的内容
                let jsonStr = line.substring(line.indexOf('data:') + 5).trim()
                
                // 如果是空行或者只有 data:，跳过
                if (!jsonStr) continue
                
                try {
                  // 直接解析 JSON（后端发送的是完整的 JSON 对象）
                  const message = JSON.parse(jsonStr)
                  if (onMessage) onMessage(message)
                } catch (e) {
                  // JSON 解析失败，可能是多行 JSON，累积到缓冲区
                  console.warn('[cozeAPI.chatStream] JSON 解析失败，尝试累积:', jsonStr.substring(0, 50))
                  const messageFromBuffer = parseJSONWithBuffer(jsonBuffer, line)
                  if (messageFromBuffer) {
                    if (messageFromBuffer.error) {
                      console.error('[cozeAPI.chatStream] JSON 解析错误:', messageFromBuffer.rawData)
                      if (onError) onError(new Error('JSON 解析失败: ' + messageFromBuffer.rawData.substring(0, 100)))
                    } else {
                      if (onMessage) onMessage(messageFromBuffer)
                    }
                  }
                }
              } else if (line.startsWith('event: ') || line.trim().startsWith('event:')) {
                // 处理event类型（可选）
                const eventType = line.includes(':') ? line.substring(line.indexOf(':') + 1).trim() : line.trim()
                console.log('[cozeAPI.chatStream] SSE事件类型:', eventType)
              } else if (line.trim() && !line.startsWith(':')) {
                // 忽略注释行（以 : 开头的行）
                // 其他非空行可能是格式问题，但不影响 JSON 拼接（因为只有 data: 开头的行才会进入 JSON 缓冲区）
                console.warn('[cozeAPI.chatStream] 检测到未识别的SSE行:', line.substring(0, 100))
              }
            }
            
            readChunk()
          }).catch(error => {
            console.error('[cozeAPI.chatStream] 读取SSE流失败:', error)
            if (onError) onError(error)
          })
        }
        
        readChunk()
        
        // 返回一个可以关闭的对象
        return {
          close: () => {
            reader.cancel()
          }
        }
      })
      .catch(error => {
        console.error('发起SSE请求失败:', error)
        if (onError) onError(error)
        throw error
      })
  },

  /**
   * 流式对话（支持文件上传 + 知识库引用）
   * @param {String} query - 用户问题
   * @param {String} conversationId - 对话ID（可选）
   * @param {File[]} localFiles - 本地上传的文件列表（可选）
   * @param {Number[]} knowledgeFileIds - 知识库文件ID列表（可选）
   * @param {Object} customVariables - 自定义变量（可选）
   * @param {Function} onMessage - 消息回调函数 (message) => void
   * @param {Function} onError - 错误回调函数 (error) => void
   * @param {Function} onComplete - 完成回调函数 () => void
   * @returns {Promise} 返回一个包含close方法的对象
   */
  chatStreamWithFiles(query, conversationId = null, localFiles = null, knowledgeFileIds = null, customVariables = null, onMessage, onError, onComplete) {
    console.log('[cozeAPI.chatStreamWithFiles] 开始带文件的流式对话', {
      query,
      conversationId,
      localFilesCount: localFiles ? localFiles.length : 0,
      knowledgeFileIdsCount: knowledgeFileIds ? knowledgeFileIds.length : 0
    })
    
    // 获取token并验证
    const token = localStorage.getItem('access_token')
    if (!token) {
      const error = new Error('未登录，请先登录')
      console.error('[cozeAPI.chatStreamWithFiles] 认证失败:', error.message)
      if (onError) onError(error)
      return Promise.reject(error)
    }
    
    // 构建FormData
    const formData = new FormData()
    formData.append('query', query)
    if (conversationId) {
      formData.append('conversationId', conversationId)
    }
    
    // 添加本地文件
    if (localFiles && localFiles.length > 0) {
      localFiles.forEach(file => {
        formData.append('localFiles', file)
      })
    }
    
    // 添加知识库文件ID
    if (knowledgeFileIds && knowledgeFileIds.length > 0) {
      knowledgeFileIds.forEach(fileId => {
        formData.append('knowledgeFileIds', fileId.toString())
      })
    }
    
    // 添加自定义变量（如果存在）
    if (customVariables && Object.keys(customVariables).length > 0) {
      formData.append('customVariables', JSON.stringify(customVariables))
    }
    
    // 构建URL（使用相对路径，确保通过Vue代理）
    const url = '/zhiyan/api/coze/chat/stream-with-files'
    
    console.log('[cozeAPI.chatStreamWithFiles] 请求URL:', url)
    console.log('[cozeAPI.chatStreamWithFiles] Token存在:', !!token)
    
    // 使用fetch API处理SSE（支持文件上传）
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
        // 不设置Content-Type，让浏览器自动设置multipart/form-data的boundary
      },
      body: formData,
      credentials: 'include' // 确保cookies也被传递
    })
      .then(response => {
        console.log('[cozeAPI.chatStreamWithFiles] 响应状态:', response.status, response.statusText)
        
        // 检查是否被重定向到登录页
        if (response.status === 401 || response.status === 403) {
          const error = new Error('认证失败，请重新登录')
          console.error('[cozeAPI.chatStreamWithFiles] 认证失败:', response.status)
          if (onError) onError(error)
          throw error
        }
        
        // 检查响应类型
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('text/event-stream')) {
          console.warn('[cozeAPI.chatStreamWithFiles] 响应类型不是SSE:', contentType)
          if (response.status !== 200) {
            return response.text().then(text => {
              console.error('[cozeAPI.chatStreamWithFiles] 错误响应内容:', text)
              const error = new Error(`服务器错误: ${response.status} - ${text}`)
              if (onError) onError(error)
              throw error
            })
          }
        }
        
        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`)
          console.error('[cozeAPI.chatStreamWithFiles] HTTP错误:', response.status)
          if (onError) onError(error)
          throw error
        }
        
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = '' // SSE 行缓冲区
        const jsonBuffer = { accumulated: '' } // JSON 数据缓冲区，用于拼接分散的 JSON
        
        const readChunk = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 流结束，处理剩余的缓冲区数据
              if (buffer.trim()) {
                console.log('[cozeAPI.chatStreamWithFiles] 流结束，处理剩余缓冲区:', buffer)
                const lines = buffer.split('\n')
                for (const line of lines) {
                  // 处理 data: 开头的行（包括所有格式）
                  if (line.startsWith('data:') || line.trim().startsWith('data:')) {
                    const message = parseJSONWithBuffer(jsonBuffer, line)
                    if (message && !message.error) {
                      if (onMessage) onMessage(message)
                    }
                  } else if (line.startsWith('event: ') || line.trim().startsWith('event:')) {
                    const eventType = line.includes(':') ? line.substring(line.indexOf(':') + 1).trim() : line.trim()
                    console.log('[cozeAPI.chatStreamWithFiles] 流结束时的事件类型:', eventType)
                  }
                }
              }
              
              // 处理剩余的不完整 JSON
              if (jsonBuffer.accumulated.trim()) {
                console.warn('[cozeAPI.chatStreamWithFiles] 流结束，但仍有未解析的 JSON 数据:', jsonBuffer.accumulated)
                try {
                  const message = JSON.parse(jsonBuffer.accumulated)
                  if (onMessage) onMessage(message)
                } catch (e) {
                  console.error('[cozeAPI.chatStreamWithFiles] 无法解析剩余的 JSON 数据:', e, '原始数据:', jsonBuffer.accumulated)
                }
                jsonBuffer.accumulated = ''
              }
              
              if (onComplete) onComplete()
              return
            }
            
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留最后不完整的行
            
            for (const line of lines) {
              // 处理 data: 开头的行（SSE 数据）
              if (line.startsWith('data:') || line.trim().startsWith('data:')) {
                // 提取 data: 后面的内容
                let jsonStr = line.substring(line.indexOf('data:') + 5).trim()
                
                // 如果是空行或者只有 data:，跳过
                if (!jsonStr) continue
                
                try {
                  // 直接解析 JSON（后端发送的是完整的 JSON 对象）
                  const message = JSON.parse(jsonStr)
                  if (onMessage) onMessage(message)
                } catch (e) {
                  // JSON 解析失败，可能是多行 JSON，累积到缓冲区
                  console.warn('[cozeAPI.chatStreamWithFiles] JSON 解析失败，尝试累积:', jsonStr.substring(0, 50))
                  const messageFromBuffer = parseJSONWithBuffer(jsonBuffer, line)
                  if (messageFromBuffer) {
                    if (messageFromBuffer.error) {
                      console.error('[cozeAPI.chatStreamWithFiles] JSON 解析错误:', messageFromBuffer.rawData)
                      if (onError) onError(new Error('JSON 解析失败: ' + messageFromBuffer.rawData.substring(0, 100)))
                    } else {
                      if (onMessage) onMessage(messageFromBuffer)
                    }
                  }
                }
              } else if (line.startsWith('event: ') || line.trim().startsWith('event:')) {
                // 处理event类型（可选）
                const eventType = line.includes(':') ? line.substring(line.indexOf(':') + 1).trim() : line.trim()
                console.log('[cozeAPI.chatStreamWithFiles] SSE事件类型:', eventType)
              } else if (line.trim() && !line.startsWith(':')) {
                // 忽略注释行（以 : 开头的行）
                // 其他非空行可能是格式问题，但不影响 JSON 拼接（因为只有 data: 开头的行才会进入 JSON 缓冲区）
                console.warn('[cozeAPI.chatStreamWithFiles] 检测到未识别的SSE行:', line.substring(0, 100))
              }
            }
            
            readChunk()
          }).catch(error => {
            console.error('[cozeAPI.chatStreamWithFiles] 读取SSE流失败:', error)
            if (onError) onError(error)
          })
        }
        
        readChunk()
        
        // 返回一个可以关闭的对象
        return {
          close: () => {
            reader.cancel()
          }
        }
      })
      .catch(error => {
        console.error('[cozeAPI.chatStreamWithFiles] 发起SSE请求失败:', error)
        if (onError) onError(error)
        throw error
      })
  },

  /**
   * 上传单个文件到Coze
   * @param {File} file - 文件对象
   * @returns {Promise} 上传响应
   */
  uploadFile(file) {
    console.log('[cozeAPI.uploadFile] 上传文件, fileName:', file?.name)
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/zhiyan/api/coze/files/upload', formData)
  },

  /**
   * 批量上传文件到Coze
   * @param {File[]} files - 文件数组
   * @returns {Promise} 上传响应列表
   */
  uploadFiles(files) {
    console.log('[cozeAPI.uploadFiles] 批量上传文件, fileCount:', files?.length)
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    return api.post('/zhiyan/api/coze/files/upload/batch', formData)
  },

  /**
   * 查询文件详情
   * @param {String} fileId - Coze文件ID
   * @returns {Promise} 文件详情
   */
  getFileDetail(fileId) {
    console.log('[cozeAPI.getFileDetail] 查询文件详情, fileId:', fileId)
    return api.get(`/zhiyan/api/coze/files/${fileId}`)
  },

  /**
   * 查询对话详情
   * @param {String} conversationId - 对话ID
   * @param {String} chatId - 聊天ID
   * @returns {Promise} 对话详情
   */
  getChatDetail(conversationId, chatId) {
    console.log('[cozeAPI.getChatDetail] 查询对话详情', { conversationId, chatId })
    return api.get('/zhiyan/api/coze/chat/detail', {
      params: { conversationId, chatId }
    })
  }
}

export default cozeAPI

