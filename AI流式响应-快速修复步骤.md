# AI 流式响应 - 快速修复步骤 ⚡

## 🔥 必须执行的 3 个步骤

### 1️⃣ 重启前端服务器（最重要！）

```bash
# 在 zhiyan_front 目录下执行

# 停止当前服务器：按 Ctrl+C

# 重新启动
npm run serve
```

**等待看到这个提示才算成功：**
```
DONE  Compiled successfully
App running at:
- Local:   http://localhost:8001/
```

---

### 2️⃣ 清除浏览器缓存

**最快方法：**
1. 按 `F12` 打开开发者工具
2. 右键点击浏览器的刷新按钮
3. 选择 **"清空缓存并硬性重新加载"**

**或者使用无痕模式：**
- 按 `Ctrl + Shift + N` 打开无痕窗口
- 访问 `http://localhost:8001`

---

### 3️⃣ 验证流式响应是否工作

**打开开发者工具验证（F12）：**

1. **切换到 `Network` 标签**
2. **发送一条 AI 消息**："你好"
3. **点击 `chatflow/stream` 请求**
4. **查看 Response 标签**

**✅ 成功的标志：**
- 数据逐行出现（不是一次性出现）
- Type 显示：`text/event-stream`
- 可以看到类似这样的数据：
  ```
  event: message
  data: {"event":"message","data":"你"}

  event: message
  data: {"event":"message","data":"你好"}
  ```

**❌ 失败的标志：**
- 所有数据一次性出现
- Type 显示：`application/json`
- 响应等待很久才显示

---

## 🔍 如果仍然不行

### 方案 A：直接连接后端（跳过代理）

修改 `src/api/dify.js` 第 63 行附近：

```javascript
export async function sendChatMessageStream(query, conversationId = null, onMessage, onEnd, onError) {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('[Dify API] 未找到access_token，请先登录')
      throw new Error('未登录，请先登录')
    }

    console.log('[Dify API] 直连Dify服务(8097)发送请求:', {
      url: `http://localhost:8097/api/ai/chatflow/stream`,  // 修改这里
      query,
      conversationId
    })
    
    // 修改这里：直接连接后端
    let url = `http://localhost:8097/api/ai/chatflow/stream?query=${encodeURIComponent(query)}`
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

    // ... 后续代码保持不变 ...
```

**修改后重启前端服务器！**

---

### 方案 B：检查后端是否运行

```powershell
# 检查 8097 端口
netstat -ano | findstr :8097
```

**如果没有输出，需要启动后端服务！**

---

## 📊 成功指标

**当一切正常时，你会看到：**

✅ AI 回复**逐字显示**（像打字机）  
✅ Network 中看到 `text/event-stream`  
✅ Console 中多次输出 "收到数据块 #1, #2, #3..."  
✅ 响应时间持续增长（3s → 5s → 10s...）

---

## ⚠️ 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| 一次性显示全部内容 | 代理缓冲 | 清除缓存，重启前端 |
| CORS 错误 | 跨域限制 | 使用代理或配置后端 CORS |
| 401 未授权 | Token 失效 | 重新登录 |
| 连接超时 | 后端未启动 | 启动 8097 端口服务 |

---

## 📞 需要帮助？

查看详细故障排查指南：`AI流式响应故障排查指南.md`

---

**最后提醒：vue.config.js 修改后必须重启前端服务器！** 🔄



