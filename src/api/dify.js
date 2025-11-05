import axios from 'axios'
import config from '@/config'

// 后端Dify服务配置（直连8097端口）
const BACKEND_DIFY_CONFIG = {
  baseUrl: '/zhiyan/api/ai', // 通过Vue代理转发到8097端口
  timeout: 120000, // axios 超时：2分钟
  streamTimeout: 300000 // fetch 流式响应超时：5分钟（AI文档分析需要更长时间）
}

// 创建Dify API客户端
const api = axios.create({
  baseURL: '', // 使用相对路径，通过Vue代理转发
  timeout: BACKEND_DIFY_CONFIG.timeout,
  withCredentials: true
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

    // ⭐ 开发环境可选择直接连接后端或通过代理
    // 设置为 true 可以跳过 Vue 代理，用于测试
    const USE_DIRECT_CONNECTION = false  // 默认使用代理，调试时改为 true
    const baseUrl = USE_DIRECT_CONNECTION ? 'http://localhost:8097' : ''
    
    console.log('[Dify API] 🚀 发送流式请求:', {
      mode: USE_DIRECT_CONNECTION ? '直连后端' : '通过Vue代理',
      baseUrl: baseUrl || '(相对路径)',
      query,
      conversationId
    })
    
    // 构建URL
    let url = `${baseUrl}${BACKEND_DIFY_CONFIG.baseUrl}/chatflow/stream?query=${encodeURIComponent(query)}`
    if (conversationId) {
      url += `&conversationId=${encodeURIComponent(conversationId)}`
    }

    console.log('[Dify API] 📡 请求URL:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    console.log('[Dify API] ✅ 响应状态:', response.status, response.statusText)
    
    // ⭐ 检查响应头（用于诊断）
    const contentType = response.headers.get('content-type')
    const transferEncoding = response.headers.get('transfer-encoding')
    console.log('[Dify API] 📋 响应头信息:', {
      'Content-Type': contentType,
      'Transfer-Encoding': transferEncoding,
      '是否SSE': contentType?.includes('event-stream') || false,
      '是否chunked': transferEncoding === 'chunked' || false
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Dify API] ❌ 错误响应:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let lastAnswer = '' // 追踪上一次的完整答案，用于计算增量
    let chunkCount = 0
    let finalConversationId = null
    let currentEvent = null
    let jsonBuffer = [] // 用于累积多行JSON数据
    const startTime = Date.now()

    console.log('[Dify API] 🔄 开始读取流式响应...', new Date().toLocaleTimeString())

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`[Dify API] 🏁 流式响应结束 - 总计 ${chunkCount} 个数据块，耗时 ${elapsed}s`)
        if (onEnd) {
          onEnd({ conversation_id: finalConversationId })
        }
        break
      }

      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`[Dify API] 📦 数据块 #${chunkCount} (${elapsed}s):`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''))
      
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() // 保留最后一行不完整的数据

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // 处理event行
        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.substring(6).trim()
          console.log('[Dify API] 事件类型:', currentEvent)
          jsonBuffer = [] // 重置JSON缓冲区
          continue
        }
        
        // 处理data行
        if (trimmedLine.startsWith('data:')) {
          const dataContent = trimmedLine.substring(5).trim()
          
          // 累积JSON片段（处理多行JSON）
          if (dataContent.startsWith('{')) {
            // 新的JSON对象开始
            jsonBuffer = [dataContent]
          } else if (jsonBuffer.length > 0) {
            // 继续累积JSON片段
            jsonBuffer.push(dataContent)
          }
          
          // 检查是否JSON对象结束
          if (dataContent.endsWith('}') && jsonBuffer.length > 0) {
            // 组合成完整JSON并解析
            const jsonStr = jsonBuffer.join('\n').replace(/\n/g, '').replace(/\s+/g, ' ')
            try {
              const message = JSON.parse(jsonStr)
              console.log('[Dify API] 解析SSE消息:', message)
              
              // 保存conversationId
              if (message.conversation_id || message.conversationId) {
                finalConversationId = message.conversation_id || message.conversationId
              }
              
              // 处理不同类型的事件
              const eventType = currentEvent || message.event || message.eventType
              
              // 优先使用message.data（后端包装的数据）
              const answerText = message.data || message.answer
              
              if (eventType === 'message' || eventType === 'agent_message') {
                // 普通消息或代理消息
                if (answerText && onMessage) {
                  // 后端返回的是完整的累积文本，需要计算增量
                  const currentAnswer = answerText
                  if (currentAnswer !== lastAnswer) {
                    const delta = currentAnswer.substring(lastAnswer.length)
                    console.log(`[Dify API] ✨ 增量内容 [长度:${delta.length}]:`, delta)
                    lastAnswer = currentAnswer
                    onMessage(delta, message)
                  }
                }
              } else if (eventType === 'message_end') {
                // 消息结束
                console.log('[Dify API] 消息结束, conversation_id:', finalConversationId)
              } else if (eventType === 'error') {
                // 错误事件
                console.error('[Dify API] Dify错误:', message)
                if (onError) {
                  onError(new Error(message.message || message.error_message || message.data || 'Unknown error'))
                }
              } else {
                // 其他事件类型（workflow_started, node_started等）
                console.log('[Dify API] Dify事件:', eventType)
              }
              
              jsonBuffer = [] // 重置缓冲区
            } catch (e) {
              console.error('[Dify API] 解析JSON失败:', e, 'JSON字符串:', jsonStr)
              jsonBuffer = []
            }
          }
          continue
        }
        
        // 空行表示一个SSE消息结束
        if (trimmedLine === '') {
          currentEvent = null
          if (jsonBuffer.length > 0) {
            console.warn('[Dify API] 遇到空行但JSON未完成，重置缓冲区')
            jsonBuffer = []
          }
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
    console.error('[Dify API] ⏱️ 请求超时:', BACKEND_DIFY_CONFIG.streamTimeout / 1000, '秒')
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
    
    // 添加知识库文件ID列表
    if (knowledgeFileIds && knowledgeFileIds.length > 0) {
      knowledgeFileIds.forEach(id => {
        formData.append('knowledgeFileIds', id)
      })
    }
    
    // 添加本地文件
    if (localFiles && localFiles.length > 0) {
      localFiles.forEach(file => {
        formData.append('localFiles', file)
      })
    }

    console.log('[Dify API] 🚀 上传文件并对话:', {
      query,
      conversationId,
      knowledgeFileIds: knowledgeFileIds?.length || 0,
      localFiles: localFiles?.length || 0,
      timeout: `${BACKEND_DIFY_CONFIG.streamTimeout / 1000}秒`
    })

    // 发送请求到后端（/api/ai/chatflow/upload-and-chat）
    const url = `${BACKEND_DIFY_CONFIG.baseUrl}/chatflow/upload-and-chat`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // 注意：不设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
      },
      body: formData,
      signal: controller.signal // ⭐ 添加超时信号
    })

    console.log('[Dify API] ✅ 响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Dify API] ❌ 错误响应:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    // 处理流式响应（SSE）
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let lastAnswer = '' // 用于计算增量内容
    let chunkCount = 0
    let finalConversationId = null
    let currentEvent = null
    let jsonBuffer = []
    const startTime = Date.now()

    console.log('[Dify API] 🔄 开始读取流式响应...', new Date().toLocaleTimeString())

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        clearTimeout(timeoutId) // ⭐ 清除超时定时器
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`[Dify API] 🏁 流式响应结束 - 总计 ${chunkCount} 个数据块，耗时 ${elapsed}s`)
        if (onEnd) {
          onEnd({ conversation_id: finalConversationId })
        }
        break
      }

      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
      
      // ⭐ 添加详细的数据块调试信息
      console.log(`[Dify API] 📦 数据块 #${chunkCount} (${elapsed}s, ${chunk.length} bytes):`, 
                  chunk.substring(0, 150).replace(/\n/g, '\\n') + (chunk.length > 150 ? '...' : ''))
      
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() // 保留不完整的行
      
      console.log(`[Dify API] 📝 本次处理 ${lines.length} 行，缓冲区剩余: ${buffer.length} 字符`)

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // ⭐ 跳过空行
        if (trimmedLine === '') {
          if (jsonBuffer.length > 0) {
            console.warn('[Dify API] ⚠️ 遇到空行但JSON缓冲区未完成，重置缓冲区')
            jsonBuffer = []
          }
          currentEvent = null
          continue
        }
        
        // 处理 SSE event 行
        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.substring(6).trim()
          console.log('[Dify API] 🏷️ 事件类型:', currentEvent)
          jsonBuffer = []
          continue
        }
        
        // 处理 SSE data 行
        if (trimmedLine.startsWith('data:')) {
          const dataContent = trimmedLine.substring(5).trim()
          
          console.log('[Dify API] 📄 data行:', dataContent.substring(0, 100) + (dataContent.length > 100 ? '...' : ''))
          
          if (dataContent.startsWith('{')) {
            jsonBuffer = [dataContent]
            console.log('[Dify API] 🆕 开始新的JSON对象')
          } else if (jsonBuffer.length > 0) {
            jsonBuffer.push(dataContent)
            console.log('[Dify API] ➕ 累积JSON片段，当前缓冲区大小:', jsonBuffer.length)
          }
          
          // 检查JSON是否完整
          if (dataContent.endsWith('}') && jsonBuffer.length > 0) {
            const jsonStr = jsonBuffer.join('\n').replace(/\n/g, '').replace(/\s+/g, ' ')
            console.log('[Dify API] 🔍 尝试解析JSON，长度:', jsonStr.length)
            try {
              const message = JSON.parse(jsonStr)
              console.log('[Dify API] ✅ 解析SSE消息成功:', message)
              
              // 保存 conversation_id
              if (message.conversation_id || message.conversationId) {
                finalConversationId = message.conversation_id || message.conversationId
              }
              
              const eventType = currentEvent || message.event || message.eventType
              const answerText = message.data || message.answer
              
              // 处理不同事件类型
              if (eventType === 'message' || eventType === 'agent_message') {
                // AI 消息事件
                if (answerText && onMessage) {
                  const currentAnswer = answerText
                  if (currentAnswer !== lastAnswer) {
                    const delta = currentAnswer.substring(lastAnswer.length)
                    console.log(`[Dify API] ✨ 增量内容 [长度:${delta.length}]:`, delta)
                    lastAnswer = currentAnswer
                    onMessage(delta, message)
                  }
                }
              } else if (eventType === 'message_end') {
                // 消息结束事件
                console.log('[Dify API] 消息结束, conversation_id:', finalConversationId)
              } else if (eventType === 'error') {
                // 错误事件
                console.error('[Dify API] Dify错误:', message)
                if (onError) {
                  let errorMsg = 'Unknown error'
                  if (message.message) {
                    errorMsg = message.message
                  } else if (message.error_message) {
                    errorMsg = message.error_message
                  } else if (message.data) {
                    errorMsg = message.data
                  } else {
                    // data 为 null 时的友好提示
                    errorMsg = '⚠️ AI 工作流执行完成但未返回内容。\n' +
                               '可能原因：\n' +
                               '1. Dify 工作流的 LLM 节点提示词中缺少用户问题变量 {{#sys.query#}}\n' +
                               '2. Answer 节点未正确连接 LLM 输出\n' +
                               '3. 文件提取失败或内容为空'
                  }
                  onError(new Error(errorMsg))
                }
              } else {
                // 其他事件（workflow_started, node_started, node_finished 等）
                console.log('[Dify API] Dify事件:', eventType)
              }
              
              jsonBuffer = []
            } catch (e) {
              console.error('[Dify API] 解析JSON失败:', e, 'JSON字符串:', jsonStr)
              jsonBuffer = []
            }
          }
          continue
        }
        
        // 其他未识别的行
        console.warn('[Dify API] ⚠️ 未识别的行:', trimmedLine.substring(0, 100))
      }
    }
  } catch (error) {
    clearTimeout(timeoutId) // ⭐ 错误时也要清除超时定时器
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

export default {
  sendChatMessage,
  sendChatMessageStream,
  uploadAndChatStream,
  stopMessageGeneration
}

