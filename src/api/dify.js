import axios from 'axios'
import config from '@/config'

// 后端Dify服务配置（直连8097端口）
const BACKEND_DIFY_CONFIG = {
  baseUrl: '/zhiyan/api/ai', // 通过Vue代理转发到8097端口
  timeout: 120000 // 2分钟超时
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

    console.log('[Dify API] 直连Dify服务(8097)发送请求:', {
      url: `${BACKEND_DIFY_CONFIG.baseUrl}/chatflow/stream`,
      query,
      conversationId
    })
    
    // 构建URL（使用相对路径，由Vue代理转发到8097）
    let url = `${BACKEND_DIFY_CONFIG.baseUrl}/chatflow/stream?query=${encodeURIComponent(query)}`
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Dify API] 错误响应:', errorText)
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

    console.log('[Dify API] 开始读取流式响应...')

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        console.log('[Dify API] 流式响应结束，总共收到', chunkCount, '个数据块')
        if (onEnd) {
          onEnd({ conversation_id: finalConversationId })
        }
        break
      }

      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      console.log('[Dify API] 收到数据块 #' + chunkCount + ':', chunk)
      
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
                    console.log('[Dify API] 增量内容:', delta)
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

export default {
  sendChatMessage,
  sendChatMessageStream,
  stopMessageGeneration
}

