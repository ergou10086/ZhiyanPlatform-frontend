// Wiki 协同编辑 WebSocket 客户端封装
// 依赖：sockjs-client、@stomp/stompjs（请确保已安装）
//
// 功能：
// - 建立到后端 /zhiyan/wiki/ws 的 SockJS + STOMP 连接
// - 封装加入/离开页面、心跳、光标更新、内容变更、增量变更
// - 对外暴露事件回调，供组件订阅（在线编辑者列表、光标、内容更新等）

import config from '@/config'
import { getAccessToken, getCurrentUserId } from './auth'

let SockJSLib = null
let StompLib = null

/**
 * 动态加载 SockJS 和 STOMP 依赖，避免在未安装依赖时直接报错导致应用崩溃
 */
async function ensureDepsLoaded() {
  if (SockJSLib && StompLib) return
  try {
    const [{ default: SockJS }, { Client }] = await Promise.all([
      import(/* webpackChunkName: "sockjs" */ 'sockjs-client'),
      import(/* webpackChunkName: "stompjs" */ '@stomp/stompjs')
    ])
    SockJSLib = SockJS
    StompLib = Client
  } catch (e) {
    // 只记录一次错误，前端正常工作但协同编辑失效
    console.warn('[WikiCollaboration] 加载 SockJS/STOMP 失败，协同编辑功能不可用：', e)
    throw e
  }
}

/**
 * 生成 WebSocket 连接 URL
 * - 后端端点：/zhiyan/wiki/ws（使用 SockJS）
 * - 为了兼容 JWT 认证，将 access_token 追加到 query 参数，便于后端从请求中解析
 */
function buildWebSocketUrl() {
  const base = config.api?.baseURL || window.location.origin
  const token = getAccessToken()

  // SockJS 需要 HTTP(S) URL
  let url = base.replace(/\/+$/, '') + '/zhiyan/wiki/ws'
  if (token) {
    const separator = url.includes('?') ? '&' : '?'
    url += `${separator}access_token=${encodeURIComponent(token)}`
  }
  return url
}

export class WikiCollaborationClient {
  constructor(pageId) {
    this.pageId = pageId ? String(pageId) : null
    this.stompClient = null
    this.connected = false
    this.heartbeatTimer = null
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.subscriptions = []

    // 外部回调
    this.onEditorsUpdate = null
    this.onCursorsUpdate = null
    this.onContentChange = null
    this.onIncrementalChange = null
    this.onError = null
  }

  /**
   * 建立连接并加入页面编辑
   */
  async connect() {
    if (!this.pageId) {
      console.warn('[WikiCollaboration] pageId 为空，跳过连接')
      return
    }

    try {
      await ensureDepsLoaded()
    } catch {
      // 依赖加载失败，直接放弃协同编辑
      return
    }

    if (this.connected || this.stompClient) {
      return
    }

    const socketUrl = buildWebSocketUrl()
    const userId = getCurrentUserId()

    const client = new StompLib({
      webSocketFactory: () => new SockJSLib(socketUrl),
      reconnectDelay: 0, // 我们自己做重连控制
      debug: process.env.NODE_ENV === 'development'
        ? (str) => console.log('[WikiCollaboration][STOMP]', str)
        : () => {},
      connectHeaders: {
        // 一些服务端会从 header 里额外读取 token，这里也带上
        Authorization: getAccessToken() ? `Bearer ${getAccessToken()}` : undefined,
        'X-User-Id': userId ? String(userId) : undefined
      },
      onConnect: () => {
        this.connected = true
        this.reconnectAttempts = 0
        console.log('[WikiCollaboration] WebSocket 连接成功, pageId=', this.pageId)
        this._afterConnected()
      },
      onStompError: (frame) => {
        console.warn('[WikiCollaboration] STOMP 错误:', frame.headers['message'], frame.body)
        if (this.onError) {
          this.onError(new Error(frame.headers['message'] || 'STOMP 错误'))
        }
      },
      onWebSocketClose: () => {
        console.warn('[WikiCollaboration] WebSocket 已关闭')
        this.connected = false
        this._clearHeartbeat()
        this._scheduleReconnect()
      },
      onWebSocketError: (event) => {
        console.warn('[WikiCollaboration] WebSocket 错误:', event)
        if (this.onError) {
          this.onError(new Error('WebSocket 连接错误'))
        }
      }
    })

    this.stompClient = client
    client.activate()
  }

  /**
   * 连接成功后订阅主题并发送 join/heartbeat
   * 参照 WikiCollaborationController 中的路径约定
   */
  _afterConnected() {
    if (!this.stompClient || !this.pageId) return

    // 订阅在线编辑者列表
    this._subscribe(`/topic/wiki/${this.pageId}/editors`, (message) => {
      try {
        const editors = JSON.parse(message.body || '[]')
        if (this.onEditorsUpdate) {
          this.onEditorsUpdate(editors)
        }
      } catch (e) {
        console.warn('[WikiCollaboration] 解析 editors 消息失败:', e)
      }
    })

    // 订阅光标位置
    this._subscribe(`/topic/wiki/${this.pageId}/cursors`, (message) => {
      try {
        const body = JSON.parse(message.body || '[]')
        const cursors = Array.isArray(body) ? body : [body]
        if (this.onCursorsUpdate) {
          this.onCursorsUpdate(cursors)
        }
      } catch (e) {
        console.warn('[WikiCollaboration] 解析 cursors 消息失败:', e)
      }
    })

    // 订阅内容变更（完整内容，用于他人保存后刷新）
    this._subscribe(`/topic/wiki/${this.pageId}/content`, (message) => {
      try {
        const change = JSON.parse(message.body || '{}')
        if (this.onContentChange) {
          this.onContentChange(change)
        }
      } catch (e) {
        console.warn('[WikiCollaboration] 解析 content 消息失败:', e)
      }
    })

    // 订阅增量变更（键盘输入实时同步）
    this._subscribe(`/topic/wiki/${this.pageId}/incremental`, (message) => {
      try {
        const change = JSON.parse(message.body || '{}')
        if (this.onIncrementalChange) {
          this.onIncrementalChange(change)
        }
      } catch (e) {
        console.warn('[WikiCollaboration] 解析 incremental 消息失败:', e)
      }
    })

    // 发送 join 消息，加入页面编辑
    this._send(`/app/wiki/${this.pageId}/join`, {})

    // 启动心跳（与后端 heartbeat 映射）
    this._startHeartbeat()
  }

  _subscribe(destination, callback) {
    if (!this.stompClient) return
    const sub = this.stompClient.subscribe(destination, callback)
    this.subscriptions.push(sub)
  }

  _send(destination, body) {
    if (!this.stompClient || !this.connected) return
    try {
      this.stompClient.publish({
        destination,
        body: body ? JSON.stringify(body) : '{}'
      })
    } catch (e) {
      console.warn('[WikiCollaboration] 发送消息失败:', destination, e)
    }
  }

  _startHeartbeat() {
    this._clearHeartbeat()
    if (!this.pageId) return
    // 每 25 秒发送一次心跳，后台 TTL 是 300 秒，足够安全
    this.heartbeatTimer = setInterval(() => {
      if (!this.connected) return
      this._send(`/app/wiki/${this.pageId}/heartbeat`, {})
    }, 25000)
  }

  _clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WikiCollaboration] 重连次数已达上限，停止重连')
      return
    }
    if (this.reconnectTimer) return

    this.reconnectAttempts += 1
    const delay = Math.min(30000, 2000 * this.reconnectAttempts)
    console.log(`[WikiCollaboration] ${delay}ms 后尝试重连，第 ${this.reconnectAttempts} 次`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect().catch(() => {
        // 失败时会在 connect 内部处理
      })
    }, delay)
  }

  /**
   * 更新光标位置
   * position: { line, column, offset, pageId? }
   */
  sendCursor(position) {
    if (!this.pageId) return
    const payload = {
      pageId: Number(this.pageId),
      ...position
    }
    this._send(`/app/wiki/${this.pageId}/cursor`, payload)
  }

  /**
   * 发送完整内容变更（保存时调用，后台会写入版本）
   * change: { content, changeDescription? }
   */
  sendContentChange(change) {
      if (!this.pageId || !change || !change.content) return
      const payload = {
        pageId: Number(this.pageId),
        content: change.content,
        changeDescription: change.changeDescription || '协同编辑更新'
      }
      this._send(`/app/wiki/${this.pageId}/content-change`, payload)
  }

  /**
   * 发送增量内容变更（实时同步，不落库）
   * change: 自定义结构，后端只做广播
   */
  sendIncrementalChange(change) {
    if (!this.pageId || !change) return
    const payload = {
      pageId: Number(this.pageId),
      ...change
    }
    this._send(`/app/wiki/${this.pageId}/incremental-change`, payload)
  }

  /**
   * 主动离开页面编辑（组件销毁或切换页面时调用）
   */
  leave() {
    if (this.pageId) {
      this._send(`/app/wiki/${this.pageId}/leave`, {})
    }
    this.disconnect()
  }

  /**
   * 断开连接并清理资源
   */
  disconnect() {
    this._clearHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 取消订阅
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe()
      } catch (e) {
        // ignore
      }
    })
    this.subscriptions = []

    if (this.stompClient) {
      try {
        this.stompClient.deactivate()
      } catch (e) {
        console.warn('[WikiCollaboration] 关闭连接失败:', e)
      }
      this.stompClient = null
    }
    this.connected = false
  }
}

/**
 * 工厂方法，便于按需创建客户端实例
 */
export function createWikiCollaborationClient(pageId) {
  return new WikiCollaborationClient(pageId)
}


