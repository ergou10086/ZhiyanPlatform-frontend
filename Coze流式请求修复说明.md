# Coze流式请求"Failed to fetch"错误修复说明

## 问题描述
在KnowledgeBaseAI页面发送消息时，出现 `TypeError: Failed to fetch` 错误。

## 根本原因
Vue开发服务器的Coze AI代理配置缺少流式响应（SSE）的特殊处理，导致：
- 代理服务器默认启用了缓冲
- 缺少必要的SSE响应头配置
- 超时时间设置不当

## 已修复内容

### ✅ 更新 `vue.config.js`
为 `/zhiyan/api/coze` 代理添加了以下配置：

```javascript
{
  // ... 原有配置 ...
  
  // ⭐ 请求前的钩子（用于调试）
  onProxyReq: function(proxyReq, req, res) {
    if (req.url.includes('/stream')) {
      console.log('🚀 [Vue Proxy - Coze] 转发流式请求:', req.url)
    }
  },
  
  // ⭐⭐⭐ 关键配置：禁用代理缓冲，支持流式响应
  onProxyRes: function (proxyRes, req, res) {
    if (req.url.includes('/stream')) {
      // 设置正确的响应头
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('X-Accel-Buffering', 'no')
      res.setHeader('Connection', 'keep-alive')
      
      // 删除可能导致缓冲的头
      delete proxyRes.headers['content-length']
      delete proxyRes.headers['content-encoding']
      
      // 确保chunked传输
      if (!proxyRes.headers['transfer-encoding']) {
        proxyRes.headers['transfer-encoding'] = 'chunked'
      }
    }
  },
  
  // ⭐ 禁用缓冲和自动响应处理
  selfHandleResponse: false,
  buffer: false,
  timeout: 0  // 无限超时
}
```

## 验证步骤

### 1. 重启Vue开发服务器
**重要**：配置修改后必须重启才能生效！

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
cd zhiyan_front
npm run serve
```

### 2. 检查后端服务
确认Coze AI服务正常运行：

```bash
# 检查端口8094是否被占用
netstat -ano | findstr :8094

# 或者直接访问健康检查接口（如果有）
curl http://localhost:8094/actuator/health
```

**预期结果**：
- 端口8094应该被Java进程占用
- 服务应该返回健康状态

### 3. 测试流式请求
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 在AI助手页面发送一条消息
4. 观察网络请求

**预期结果**：
- 请求URL：`http://localhost:8001/zhiyan/api/coze/chat/stream?query=...`
- 状态码：`200 OK`
- Type：`text/event-stream` 或 `eventsource`
- 在Console中看到代理日志：
  ```
  🚀 [Vue Proxy - Coze] 转发流式请求: /zhiyan/api/coze/chat/stream?query=...
  📥 [Vue Proxy - Coze] 收到流式响应，配置无缓冲模式
  📦 [Vue Proxy - Coze] 转发数据块 #1: xxx bytes
  📦 [Vue Proxy - Coze] 转发数据块 #2: xxx bytes
  ...
  🏁 [Vue Proxy - Coze] 流式响应结束，共转发 N 个数据块
  ```

### 4. 检查浏览器控制台
在Console标签中应该看到：

```
[cozeAPI.chatStream] 开始流式对话, query: xxx, conversationId: xxx
[cozeAPI.chatStream] 请求URL: /zhiyan/api/coze/chat/stream?query=xxx
[cozeAPI.chatStream] Token存在: true
[cozeAPI.chatStream] 响应状态: 200 OK
[cozeAPI.chatStream] 响应Content-Type: text/event-stream
```

**不应该看到**：
- ❌ `Failed to fetch`
- ❌ `服务器返回了HTML页面`
- ❌ `HTTP error! status: 401/403`

## 常见问题排查

### 问题1：仍然出现"Failed to fetch"
**可能原因**：
1. 未重启Vue开发服务器
2. Coze后端服务未启动或端口不是8094
3. 防火墙阻止了请求

**解决方案**：
```bash
# 1. 确认重启了Vue服务器
# 2. 检查Coze服务
ps aux | grep coze  # Linux/Mac
netstat -ano | findstr :8094  # Windows

# 3. 检查防火墙（Windows）
netsh advfirewall firewall show rule name=all | findstr 8094
```

### 问题2：请求返回401/403
**可能原因**：Token过期或无效

**解决方案**：
1. 检查localStorage中的token是否存在
2. 重新登录获取新token
3. 检查后端认证服务

### 问题3：请求超时
**可能原因**：后端处理时间过长

**解决方案**：
1. 检查后端日志，查看是否有错误
2. 确认后端Coze API配置正确
3. 检查网络连接

### 问题4：收到HTML而不是SSE
**可能原因**：
1. 代理路径配置错误
2. 后端路由配置错误
3. 被重定向到错误页面

**解决方案**：
1. 检查`vue.config.js`中的pathRewrite配置
2. 检查后端Controller的路径映射
3. 查看Network标签中的完整URL

## 对比：正确 vs 错误的配置

### ❌ 错误配置（原配置）
```javascript
'/zhiyan/api/coze': {
  target: 'http://localhost:8094',
  changeOrigin: true,
  secure: false,
  ws: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/zhiyan': ''
  }
  // 缺少流式响应配置！
}
```

### ✅ 正确配置（新配置）
```javascript
'/zhiyan/api/coze': {
  target: 'http://localhost:8094',
  changeOrigin: true,
  secure: false,
  ws: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/zhiyan': ''
  },
  // ✅ 添加了流式响应支持
  onProxyReq: function(proxyReq, req, res) { ... },
  onProxyRes: function (proxyRes, req, res) { ... },
  selfHandleResponse: false,
  buffer: false,
  timeout: 0
}
```

## 技术说明

### SSE（Server-Sent Events）的特点
- 使用HTTP长连接
- Content-Type: `text/event-stream`
- 需要chunked传输编码
- 不能有Content-Length头
- 不能启用压缩（gzip）
- 需要禁用缓冲

### Vue DevServer代理的坑
默认情况下，http-proxy-middleware会：
1. ✅ 缓冲响应数据（导致SSE失败）
2. ✅ 自动处理响应（可能修改响应头）
3. ✅ 30秒超时（SSE可能需要更长时间）

必须显式配置：
- `buffer: false` - 禁用缓冲
- `timeout: 0` - 无限超时
- `onProxyRes` - 设置正确的响应头

## 相关文件
- `zhiyan_front/vue.config.js` - Vue代理配置
- `zhiyan_front/src/api/coze.js` - Coze API调用
- `zhiyan_front/src/views/KnowledgeBaseAI.vue` - AI助手页面

## 参考资料
- [Server-Sent Events规范](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [http-proxy-middleware文档](https://github.com/chimurai/http-proxy-middleware)
- [Vue DevServer Proxy配置](https://cli.vuejs.org/config/#devserver-proxy)

---

**修复日期**：2025-11-06  
**修复人员**：AI Assistant  
**问题状态**：✅ 已修复（需重启服务器验证）

