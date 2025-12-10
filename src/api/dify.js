import axios from 'axios'
import config from '@/config'

/**
 * 自定义JSON解析函数 - 将大整数转换为字符串以避免精度丢失
 * ⚠️ 必须在 JSON.parse 之前用正则替换大整数！
 */
function parseJSONWithBigInt(data) {
  if (typeof data !== 'string') return data
  
  const trimmed = data.trim()
  if (!trimmed) return data
  
  // 仅当响应内容以 "{" 或 "[" 开头时，才视为 JSON 尝试解析
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return data
  }
  
  try {
    // 在 JSON.parse 之前替换大整数为字符串
    const processedData = trimmed
      // 匹配对象属性值中的大整数: "key": 数字 (16位及以上)
      .replace(/:(\s*)(\d{16,})(\s*[,}\]])/g, ':$1"$2"$3')
      // 匹配数组开头的大整数: [数字
      .replace(/\[(\s*)(\d{16,})(\s*[,\]])/g, '[$1"$2"$3')
      // 匹配数组中间的大整数: ,数字
      .replace(/,(\s*)(\d{16,})(\s*[,\]])/g, ',$1"$2"$3')
    
    return JSON.parse(processedData)
  } catch (e) {
    console.error('JSON解析错误:', e)
    return data
  }
}

// 后端Dify服务配置（直连8096端口）
const BACKEND_DIFY_CONFIG = {
  baseUrl: '/zhiyan/ai/dify', // 通过Vue代理转发到8096端口
  timeout: 120000, // axios 超时：2分钟
  streamTimeout: 300000 // fetch 流式响应超时：5分钟（AI文档分析需要更长时间）
}

// 知识库工作流专用基础路径
const KNOWLEDGE_BASE_URL = '/zhiyan/ai/dify/knowledge'

// 创建Dify API客户端
const api = axios.create({
  baseURL: '', // 使用相对路径，通过Vue代理转发
  timeout: BACKEND_DIFY_CONFIG.timeout,
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
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('[Dify API] 请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    console.error('[Dify API] 响应错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 辅助函数：解析和处理SSE消息
 * @param {Array<string>} dataLines - data行数组
 * @param {string} eventType - 事件类型
 * @param {function} onMessage - 消息回调
 * @param {function} onError - 错误回调
 * @param {function} onConversationId - 保存conversationId的回调
 */
function parseAndHandleSSEMessage(dataLines, eventType, onMessage, onError, onConversationId) {
  if (!dataLines || dataLines.length === 0) {
    return
  }
  
  try {
    // 将多行data内容合并（通常只有一行）
    const jsonStr = dataLines.join('')
    const trimmedStr = jsonStr.trim()

    // 如果不是 JSON（例如 "连接成功"、"对话完成" 这类纯文本），直接跳过
    if (!trimmedStr.startsWith('{')) {
      console.log('[Dify API] 非JSON SSE消息，跳过解析:', trimmedStr)
      return
    }

    const message = JSON.parse(trimmedStr)
    
    // 详细日志：显示完整消息结构
    console.log('[Dify API] 解析消息 (新版):', {
      rawEvent: eventType,
      msgEvent: message.event,
      msgData: message.data,
      msgDataType: typeof message.data,
      msgDataLength: message.data?.length || 0,
      hasConvId: !!(message.conversation_id || message.conversationId)
    })
    
    // 保存conversation_id
    if (message.conversation_id || message.conversationId) {
      const convId = message.conversation_id || message.conversationId
      if (onConversationId) {
        onConversationId(convId)
      }
    }
    
    // 获取事件类型（优先使用传入的eventType）
    const event = eventType || message.event || message.eventType
    
    // 获取消息内容（后端包装在data字段中）
    const content = message.data || message.answer
    
    // 调试日志：检查内容获取
    console.log('[Dify API] 内容获取:', {
      content: content,
      contentType: typeof content,
      contentLength: content?.length,
      isUndefined: content === undefined,
      isNull: content === null,
      isEmpty: content === ''
    })
    
    // 根据事件类型处理
    if (event === 'message' || event === 'agent_message') {
      // AI消息事件 - 传递增量内容
      // 修复：只跳过 undefined 和 null，空字符串也应该传递（可能是有意义的）
      if (content !== undefined && content !== null && onMessage) {
        // 但是如果是空字符串，不需要调用回调
        if (content === '') {
          console.log('[Dify API] 内容为空字符串，跳过')
          return
        }
        console.log(`[Dify API] 增量内容 [${content.length}字]:`, JSON.stringify(content).substring(0, 100))
        console.log(`[Dify API] 正在调用 onMessage 回调...`)
        onMessage(content, message)
        console.log(`[Dify API] onMessage 回调已调用`)
      } else {
        console.warn('[Dify API] 内容为空或未定义，跳过回调')
      }
    } else if (event === 'message_end') {
      console.log('[Dify API] 消息结束')
    } else if (event === 'error') {
      console.error('[Dify API] 错误事件:', message)
      if (onError) {
        const errorMsg = message.message || message.error_message || message.data || 'Unknown error'
        onError(new Error(errorMsg))
      }
    } else {
      // 其他事件（workflow_started, node_started等）
      console.log('[Dify API] 其他事件:', event)
    }
  } catch (e) {
    console.error('[Dify API] JSON解析失败:', e.message)
    console.error('[Dify API] 原始数据:', dataLines.join('').substring(0, 200))
  }
}

/**
 * 发送聊天消息（非流式）- 通过后端代理
 * @param {string} query - 用户问题
 * @param {string} conversationId - 对话ID（可选，用于保持上下文）
 * @returns {Promise} API响应
 */
export function sendChatMessage(query, conversationId = null) {
  return api.post(`${BACKEND_DIFY_CONFIG.baseUrl}/chat`, {
    query: query,
    conversationId: conversationId
  })
}

/**
 * 发送聊天消息（流式响应）- 通过后端代理
 * @param {string} query - 用户问题
 * @param {string} conversationId - 对话ID（可选）
 * @param {function} onMessage - 接收消息片段的回调函数
 * @param {function} onEnd - 流结束的回调函数
 * @param {function} onError - 错误处理回调函数
 */
export async function sendChatMessageStream(query, conversationId = null, onMessage, onEnd, onError) {
  try {
    // 获取token（使用正确的key: access_token）
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('[Dify API] 未找到access_token，请先登录')
      throw new Error('未登录，请先登录')
    }

    // 开发环境可选择直接连接后端或通过代理
    // 设置为 true 可以跳过 Vue 代理，用于测试
    const USE_DIRECT_CONNECTION = false  // 默认使用代理，调试时改为 true
    const baseUrl = USE_DIRECT_CONNECTION ? 'http://localhost:8096' : ''
    
    console.log('[Dify API] 发送流式请求:', {
      mode: USE_DIRECT_CONNECTION ? '直连后端' : '通过Vue代理',
      baseUrl: baseUrl || '(相对路径)',
      query,
      conversationId
    })
    
    // 构建URL，调用后端已有的 /chat/stream SSE 接口
    let url = `${baseUrl}${BACKEND_DIFY_CONFIG.baseUrl}/chat/stream?query=${encodeURIComponent(query)}`
    if (conversationId) {
      url += `&conversationId=${encodeURIComponent(conversationId)}`
    }

    console.log('[Dify API] 请求URL:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    console.log('[Dify API] 响应状态:', response.status, response.statusText)
    
    // 检查响应头（用于诊断）
    const contentType = response.headers.get('content-type')
    const transferEncoding = response.headers.get('transfer-encoding')
    console.log('[Dify API] 响应头信息:', {
      'Content-Type': contentType,
      'Transfer-Encoding': transferEncoding,
      '是否SSE': contentType?.includes('event-stream') || false,
      '是否chunked': transferEncoding === 'chunked' || false
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Dify API] 错误响应:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = '' // 行缓冲区
    let chunkCount = 0
    let finalConversationId = null
    let currentEvent = null
    let currentDataLines = [] // 累积当前消息的data行
    const startTime = Date.now()

    console.log('[Dify API] 开始读取流式响应...', new Date().toLocaleTimeString())

    // 完全重写的SSE解析逻辑
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`[Dify API] 流式响应结束 - 总计 ${chunkCount} 个数据块，耗时 ${elapsed}s`)
        if (onEnd) {
          onEnd({ conversation_id: finalConversationId })
        }
        break
      }

      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`[Dify API] 数据块 #${chunkCount} (${elapsed}s, ${chunk.length}字节)`)
      
      // 将chunk添加到缓冲区并按行分割
      buffer += chunk
      const lines = buffer.split('\n')
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''

      // 逐行处理
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // 跳过空行（SSE消息分隔符）
        if (trimmedLine === '') {
          // 如果有累积的data行，尝试解析
          if (currentDataLines.length > 0) {
            parseAndHandleSSEMessage(
              currentDataLines, 
              currentEvent, 
              onMessage, 
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
            currentEvent = null
          }
          continue
        }
        
        // 处理event行
        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.substring(6).trim()
          console.log('[Dify API] 事件:', currentEvent)
          continue
        }
        
        // 处理data行
        if (trimmedLine.startsWith('data:')) {
          const dataContent = trimmedLine.substring(5).trim()
          
          // 如果是新的JSON对象开始，先处理之前累积的
          if (dataContent.startsWith('{') && currentDataLines.length > 0) {
            parseAndHandleSSEMessage(
              currentDataLines, 
              currentEvent, 
              onMessage, 
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
          }
          
          // 累积当前data行
          currentDataLines.push(dataContent)
          
          // 如果这行以}结尾，说明JSON对象完整，立即处理
          if (dataContent.endsWith('}')) {
            parseAndHandleSSEMessage(
              currentDataLines, 
              currentEvent, 
              onMessage, 
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
          }
          continue
        }
        
        // 其他行（注释等）
        if (trimmedLine.startsWith(':')) {
          console.log('[Dify API] 注释:', trimmedLine)
          continue
        }
      }
    }
  } catch (error) {
    console.error('流式请求失败:', error)
    if (onError) {
      onError(error)
    }
    throw error
  }
}

/**
 * 停止消息生成 - 通过后端代理
 * @param {string} taskId - 任务ID
 * @returns {Promise} API响应
 */
export function stopMessageGeneration(taskId) {
  return api.post(`${BACKEND_DIFY_CONFIG.baseUrl}/chat/stop/${taskId}`)
}

/**
 * 上传文件并发送聊天消息（流式响应）- 一站式接口
 * 
 * 适配工作流：知识库聊天机器人
 * - 支持本地文件上传（MultipartFile）
 * - 支持知识库文件引用（fileIds）
 * - 自动上传文件到 Dify 并进行对话
 * 
 * @param {string} query - 用户问题
 * @param {string} conversationId - 对话ID（可选，用于维持上下文）
 * @param {Array<number>} knowledgeFileIds - 知识库文件ID列表（成果档案文件）
 * @param {Array<File>} localFiles - 本地文件列表（File对象）
 * @param {function} onMessage - 接收消息片段的回调函数 (delta, message) => void
 * @param {function} onEnd - 流结束的回调函数 (data) => void
 * @param {function} onError - 错误处理回调函数 (error) => void
 * @returns {Promise<void>}
 */
export async function uploadAndChatStream(query, conversationId = null, knowledgeFileIds = [], localFiles = [], onMessage, onEnd, onError) {
  // 创建 AbortController 用于超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
    console.error('[Dify API] 请求超时:', BACKEND_DIFY_CONFIG.streamTimeout / 1000, '秒')
  }, BACKEND_DIFY_CONFIG.streamTimeout)

  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('[Dify API] 未找到access_token，请先登录')
      throw new Error('未登录，请先登录')
    }

    // 构建FormData
    const formData = new FormData()
    formData.append('query', query)
    
    if (conversationId) {
      formData.append('conversationId', conversationId)
    }
    
    // 添加知识库文件ID列表（确保转为字符串，避免精度丢失）
    if (knowledgeFileIds && knowledgeFileIds.length > 0) {
      knowledgeFileIds.forEach(id => {
        formData.append('knowledgeFileIds', String(id))
      })
    }
    
    // 添加本地文件
    if (localFiles && localFiles.length > 0) {
      localFiles.forEach(file => {
        formData.append('localFiles', file)
      })
    }

    console.log('[Dify API] 上传文件并对话:', {
      query,
      conversationId,
      knowledgeFileIds: knowledgeFileIds?.length || 0,
      localFiles: localFiles?.length || 0,
      timeout: `${BACKEND_DIFY_CONFIG.streamTimeout / 1000}秒`
    })

    // 发送请求到后端 /zhiyan/ai/dify/chat/stream，复用现有 SSE 流式对话接口
    // query / conversationId 走查询参数，文件相关通过 form-data 传递
    let url = `${BACKEND_DIFY_CONFIG.baseUrl}/chat/stream?query=${encodeURIComponent(query)}`
    if (conversationId) {
      url += `&conversationId=${encodeURIComponent(conversationId)}`
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // 注意：不设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
      },
      body: formData,
      signal: controller.signal // 添加超时信号
    })

    console.log('[Dify API] 响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Dify API] 错误响应:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    // 处理流式响应（SSE）
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = '' // 行缓冲区
    let chunkCount = 0
    let finalConversationId = null
    let currentEvent = null
    let currentDataLines = [] // 累积当前消息的data行
    const startTime = Date.now()

    console.log('[Dify API] 开始读取流式响应...', new Date().toLocaleTimeString())

    // 完全重写的SSE解析逻辑（与sendChatMessageStream一致）
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        clearTimeout(timeoutId) // 清除超时定时器
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`[Dify API] 流式响应结束 - 总计 ${chunkCount} 个数据块，耗时 ${elapsed}s`)
        if (onEnd) {
          onEnd({ conversation_id: finalConversationId })
        }
        break
      }

      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`[Dify API] 数据块 #${chunkCount} (${elapsed}s, ${chunk.length}字节)`)
      
      // 将chunk添加到缓冲区并按行分割
      buffer += chunk
      const lines = buffer.split('\n')
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''

      // 逐行处理
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // 跳过空行（SSE消息分隔符）
        if (trimmedLine === '') {
          // 如果有累积的data行，尝试解析
          if (currentDataLines.length > 0) {
            parseAndHandleSSEMessage(
              currentDataLines, 
              currentEvent, 
              onMessage, 
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
            currentEvent = null
          }
          continue
        }
        
        // 处理event行
        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.substring(6).trim()
          console.log('[Dify API] 事件:', currentEvent)
          continue
        }
        
        // 处理data行
        if (trimmedLine.startsWith('data:')) {
          const dataContent = trimmedLine.substring(5).trim()
          
          // 如果是新的JSON对象开始，先处理之前累积的
          if (dataContent.startsWith('{') && currentDataLines.length > 0) {
            parseAndHandleSSEMessage(
              currentDataLines, 
              currentEvent, 
              onMessage, 
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
          }
          
          // 累积当前data行
          currentDataLines.push(dataContent)
          
          // 如果这行以}结尾，说明JSON对象完整，立即处理
          if (dataContent.endsWith('}')) {
            parseAndHandleSSEMessage(
              currentDataLines, 
              currentEvent, 
              onMessage, 
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
          }
          continue
        }
        
        // 其他行（注释等）
        if (trimmedLine.startsWith(':')) {
          console.log('[Dify API] 注释:', trimmedLine)
          continue
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId) // 错误时也要清除超时定时器
    console.error('上传文件并对话失败:', error)
    if (onError) {
      // 特殊处理超时错误
      if (error.name === 'AbortError') {
        onError(new Error(`请求超时（${BACKEND_DIFY_CONFIG.streamTimeout / 1000}秒）。AI 文档分析可能需要更长时间，请稍后重试。`))
      } else {
        onError(error)
      }
    }
    throw error
  }
}

/**
 * 针对知识库工作流的流式上传+对话接口
 * 使用新的后端路径 /zhiyan/ai/dify/knowledge/chat/stream-with-files
 * @param {string} query - 用户查询
 * @param {string} conversationId - 会话ID
 * @param {Array<string>} difyFileIds - 已上传的 Dify 文件ID列表（提前上传的文件）
 * @param {Array<File>} localFiles - 本地文件列表
 */
export async function uploadAndChatStreamForKnowledge(query, conversationId = null, difyFileIds = [], localFiles = [], onMessage, onEnd, onError) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
    console.error('[Dify API - Knowledge] 请求超时:', BACKEND_DIFY_CONFIG.streamTimeout / 1000, '秒')
  }, BACKEND_DIFY_CONFIG.streamTimeout)

  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('[Dify API - Knowledge] 未找到access_token，请先登录')
      throw new Error('未登录，请先登录')
    }

    const formData = new FormData()
    formData.append('query', query)
    if (conversationId) {
      formData.append('conversationId', conversationId)
    }
    // 添加已上传的 Dify 文件ID（提前上传的文件）
    if (difyFileIds && difyFileIds.length > 0) {
      difyFileIds.forEach(id => {
        formData.append('difyFileIds', String(id))
      })
    }
    // 添加本地文件
    if (localFiles && localFiles.length > 0) {
      localFiles.forEach(file => {
        formData.append('localFiles', file)
      })
    }

    console.log('[Dify API - Knowledge] 上传文件并对话:', {
      query,
      conversationId,
      difyFileIds: difyFileIds?.length || 0,
      localFiles: localFiles?.length || 0,
      timeout: `${BACKEND_DIFY_CONFIG.streamTimeout / 1000}秒`
    })

    const response = await fetch(`${KNOWLEDGE_BASE_URL}/chat/stream-with-files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      signal: controller.signal
    })

    console.log('[Dify API - Knowledge] 响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Dify API - Knowledge] 错误响应:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let chunkCount = 0
    let finalConversationId = null
    let currentEvent = null
    let currentDataLines = []
    const startTime = Date.now()

    console.log('[Dify API - Knowledge] 开始读取流式响应...', new Date().toLocaleTimeString())

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        clearTimeout(timeoutId)
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`[Dify API - Knowledge] 流式响应结束 - 总计 ${chunkCount} 个数据块，耗时 ${elapsed}s`)
        if (onEnd) {
          onEnd({ conversation_id: finalConversationId })
        }
        break
      }

      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`[Dify API - Knowledge] 数据块 #${chunkCount} (${elapsed}s, ${chunk.length}字节)`)
      
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        if (trimmedLine === '') {
          if (currentDataLines.length > 0) {
            parseAndHandleSSEMessage(
              currentDataLines,
              currentEvent,
              onMessage,
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
            currentEvent = null
          }
          continue
        }
        
        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.substring(6).trim()
          console.log('[Dify API - Knowledge] 事件:', currentEvent)
          continue
        }
        
        if (trimmedLine.startsWith('data:')) {
          const dataContent = trimmedLine.substring(5).trim()
          
          if (dataContent.startsWith('{') && currentDataLines.length > 0) {
            parseAndHandleSSEMessage(
              currentDataLines,
              currentEvent,
              onMessage,
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
          }
          
          currentDataLines.push(dataContent)
          
          if (dataContent.endsWith('}')) {
            parseAndHandleSSEMessage(
              currentDataLines,
              currentEvent,
              onMessage,
              onError,
              (convId) => { finalConversationId = convId }
            )
            currentDataLines = []
          }
          continue
        }
        
        if (trimmedLine.startsWith(':')) {
          console.log('[Dify API - Knowledge] 注释:', trimmedLine)
          continue
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('[Dify API - Knowledge] 上传文件并对话失败:', error)
    if (onError) {
      if (error.name === 'AbortError') {
        onError(new Error(`请求超时（${BACKEND_DIFY_CONFIG.streamTimeout / 1000}秒）。AI 文档分析可能需要更长时间，请稍后重试。`))
      } else {
        onError(error)
      }
    }
    throw error
  }

  return {
    close: () => {
      controller.abort()
    }
  }
}

/**
 * 上传知识库文件到 Dify（提前上传，获取 difyFileId）
 * @param {Array<string>} knowledgeFileIds - 知识库文件ID列表
 * @returns {Promise<Array>} 返回上传结果列表 [{ knowledgeFileId, difyFileId, fileName, success, error }]
 */
export async function uploadKnowledgeFilesToDify(knowledgeFileIds) {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('[Dify API] 未找到access_token，请先登录')
      throw new Error('未登录，请先登录')
    }

    // 确保是普通数组（去除 Vue 响应式包装）
    const plainFileIds = Array.isArray(knowledgeFileIds) 
      ? knowledgeFileIds.map(id => String(id))
      : []

    console.log('[Dify API] 上传知识库文件到Dify:', plainFileIds)

    // 调用后端接口，批量上传知识库文件
    const response = await fetch(`${KNOWLEDGE_BASE_URL}/upload-knowledge-files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ knowledgeFileIds: plainFileIds })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Dify API] 上传知识库文件失败:', errorText)
      throw new Error(`上传失败: ${response.status}`)
    }

    const result = await response.json()
    console.log('[Dify API] 上传知识库文件成功:', result)
    
    return result.data || []
  } catch (error) {
    console.error('[Dify API] 上传知识库文件异常:', error)
    throw error
  }
}

export default {
  sendChatMessage,
  sendChatMessageStream,
  uploadAndChatStream,
  uploadAndChatStreamForKnowledge,
  uploadKnowledgeFilesToDify,
  stopMessageGeneration
}
