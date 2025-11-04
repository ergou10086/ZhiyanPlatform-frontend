# AI 流式响应故障排查指南

## 问题症状
前端无法看到 AI 逐字显示的效果，而是等待全部内容后一次性显示。

## 排查步骤

### 步骤 1：确认前端开发服务器已重启 ⭐⭐⭐

**vue.config.js 修改后必须重启前端服务器才能生效！**

```bash
# 1. 停止当前运行的前端服务器（Ctrl+C）

# 2. 重新启动前端服务器
cd zhiyan_front
npm run serve
```

**重要**：在终端中看到以下输出才算启动成功：
```
DONE  Compiled successfully
App running at:
- Local:   http://localhost:8001/
```

---

### 步骤 2：清除浏览器缓存

**必须清除缓存，否则可能加载旧的 JavaScript 代码！**

**方法 1：使用开发者工具（推荐）**
1. 按 `F12` 打开开发者工具
2. 右键点击浏览器刷新按钮
3. 选择"清空缓存并硬性重新加载"

**方法 2：手动清除**
1. 按 `Ctrl + Shift + Delete`
2. 选择"缓存的图片和文件"
3. 点击"清除数据"

**方法 3：使用无痕模式测试**
- `Ctrl + Shift + N`（Chrome/Edge）
- 在无痕窗口中访问 `http://localhost:8001`

---

### 步骤 3：检查网络请求（关键！）

**打开浏览器开发者工具进行实时监控：**

1. 按 `F12` 打开开发者工具
2. 切换到 `Network`（网络）标签
3. 在 AI 助手页面发送一条消息："你好"
4. 观察网络请求

**正常的流式请求特征：**

| 检查项 | 预期值 | 说明 |
|--------|--------|------|
| 请求 URL | `/zhiyan/api/ai/chatflow/stream?query=...` | 确认是流式接口 |
| 请求方法 | `POST` | - |
| 状态码 | `200 OK` | - |
| Content-Type | `text/event-stream` | **关键！必须是 SSE 类型** |
| Transfer-Encoding | `chunked` | **关键！分块传输** |
| 请求时长 | 持续增长（如 3s, 5s, 10s...） | **数据逐步传输** |

**如何查看流式响应：**

1. 点击 `chatflow/stream` 请求
2. 切换到 `Response`（响应）标签
3. **应该看到数据逐行出现**，类似：
   ```
   event: message
   data: {"event":"message","data":"你"}

   event: message
   data: {"event":"message","data":"你好"}

   event: message
   data: {"event":"message","data":"你好！"}
   ```

**如果看到的是完整的响应一次性出现，说明被缓冲了！**

---

### 步骤 4：检查控制台日志

**在 `Console`（控制台）标签中查看日志：**

**正常的流式日志输出：**
```javascript
[Dify API] 请求URL: /zhiyan/api/ai/chatflow/stream?query=...
[Dify API] 响应状态: 200 OK
[Dify API] 开始读取流式响应...
[Dify API] 收到数据块 #1: event: message...
[Dify API] 增量内容: 你
[AI助手] 收到Dify消息片段: 你 当前总长度: 1
[Dify API] 收到数据块 #2: event: message...
[Dify API] 增量内容: 好
[AI助手] 收到Dify消息片段: 好 当前总长度: 2
...
```

**如果只看到一次日志，说明没有流式接收数据！**

---

### 步骤 5：确认后端服务运行

**检查 Dify AI 服务是否在 8097 端口运行：**

**Windows PowerShell：**
```powershell
netstat -ano | findstr :8097
```

**如果没有输出，说明后端服务未启动！**

需要启动后端服务：
```bash
cd ZhiyanPlatformgood/zhiyan-ai/zhiyan-ai-dify
# 使用你的启动脚本或 IDE 启动服务
```

---

### 步骤 6：测试后端流式响应（高级）

**使用 curl 直接测试后端：**

```bash
curl -X POST "http://localhost:8097/api/ai/chatflow/stream?query=你好" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}" \
  -N
```

**正常输出应该是逐行出现的 SSE 数据，而不是等待后一次性输出！**

如果 curl 测试也是一次性输出，说明后端有问题。

---

## 常见问题与解决方案

### 问题 1：前端重启后仍然没有效果

**原因**：浏览器缓存了旧的 JavaScript 文件

**解决**：
1. 完全关闭浏览器
2. 重新打开浏览器
3. 使用无痕模式测试：`Ctrl + Shift + N`

---

### 问题 2：Network 中看到的是一次性响应

**原因**：Vue 代理配置可能没有生效

**解决方案 A：使用方案二（临时直连后端）**

修改 `src/api/dify.js`：

```javascript
export async function sendChatMessageStream(query, conversationId = null, onMessage, onEnd, onError) {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('[Dify API] 未找到access_token，请先登录')
      throw new Error('未登录，请先登录')
    }

    // ✅ 直接连接后端，跳过 Vue 代理
    const baseUrl = 'http://localhost:8097'
    
    let url = `${baseUrl}/api/ai/chatflow/stream?query=${encodeURIComponent(query)}`
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

    // ... 其余代码保持不变 ...
  }
}
```

**注意**：使用此方法需要后端配置 CORS 允许 `http://localhost:8001` 访问。

---

### 问题 3：CORS 错误

**错误信息**：
```
Access to fetch at 'http://localhost:8097/api/ai/chatflow/stream' 
from origin 'http://localhost:8001' has been blocked by CORS policy
```

**解决**：检查后端 CORS 配置

在 `DifyAIChatController.java` 中应该有：
```java
@CrossOrigin(origins = {"http://localhost:8001", "http://127.0.0.1:8001"}, allowCredentials = "true")
```

---

### 问题 4：后端返回 401 未授权

**原因**：Token 失效或不正确

**解决**：
1. 重新登录获取新 Token
2. 检查 localStorage 中的 `access_token`：
   ```javascript
   // 在浏览器控制台执行
   console.log(localStorage.getItem('access_token'))
   ```

---

## 验证成功的标志 ✅

**当流式响应正常工作时，你应该看到：**

1. **前端页面**：AI 回复像打字机一样逐字显示
2. **Network 标签**：
   - Content-Type: `text/event-stream`
   - 响应数据逐行出现
   - 请求持续时间不断增长
3. **Console 标签**：
   - 多次输出"收到数据块 #N"
   - 多次输出"增量内容"
4. **后端日志**：
   - 显示"开始订阅流式响应"
   - 显示"收到原始数据"
   - 显示"解析成功"

---

## 快速诊断清单

- [ ] 前端服务器已重启（`npm run serve`）
- [ ] 浏览器缓存已清除（硬性重新加载）
- [ ] 后端服务正在运行（8097 端口）
- [ ] 已登录且 Token 有效
- [ ] Network 中看到 `text/event-stream`
- [ ] Console 中看到多次"收到数据块"日志
- [ ] 前端 AI 回复逐字显示

---

## 如果以上都不行

**最后的调试方法：**

1. **检查 vue.config.js 修改是否真的生效**
   - 在 `onProxyRes` 中添加 `console.log`：
   ```javascript
   onProxyRes: function (proxyRes, req, res) {
     console.log('代理响应:', req.url)  // 添加这行
     if (req.url.includes('/stream')) {
       console.log('检测到流式请求，禁用缓冲')  // 添加这行
       proxyRes.headers['X-Accel-Buffering'] = 'no';
       delete proxyRes.headers['content-length'];
     }
   }
   ```

2. **查看终端日志**
   - 前端终端应该显示代理请求日志
   - 后端终端应该显示流式数据发送日志

3. **联系开发者**
   - 提供 Network 截图
   - 提供 Console 日志
   - 提供后端日志

---

## 补充：启用方案三（后端优化）

如果方案一仍然不行，可以启用后端优化（方案三）：

### 1. 修改 Controller

在 `DifyAIChatController.java` 中：
- 取消第 23-24 行的注释（导入语句）
- 取消第 137 行的注释（添加 response 参数）
- 取消第 140-144 行的注释（设置响应头）
- 取消第 177 行的注释（添加延迟）

### 2. 修改 Service

在 `DifyStreamServiceImpl.java` 中：
- 取消第 213 行的注释（添加背压策略）

### 3. 修改配置

在 `application.yml` 中：
- 取消第 12-19 行的注释（WebFlux 配置）

### 4. 重启后端服务

修改后端代码后必须重启后端服务！

---

**祝你成功实现流式响应！** 🎉



