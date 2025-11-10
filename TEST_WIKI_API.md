# Wiki API 快速测试指南

## ⚠️ 重要：必须重启前端服务！

如果你修改了 `vue.config.js` 中的代理配置，**必须重启前端开发服务器**才能生效！

### 🔄 重启步骤

1. **停止当前的前端服务**
   - 在前端终端按 `Ctrl + C`
   - 确认服务已停止

2. **重新启动前端服务**
```bash
cd D:\zhiyan\zhiyanrepository\front
npm run serve
```

3. **等待编译完成**
   - 看到 `App running at: http://localhost:8001/` 即可

---

## 🧪 快速测试 Wiki API

### 方法1: 浏览器控制台直接测试

打开浏览器控制台（F12），粘贴以下代码：

```javascript
// 获取token
const token = localStorage.getItem('access_token')
console.log('Token:', token ? '存在' : '不存在')

// 测试Wiki API - 获取项目Wiki树
fetch('/api/wiki/projects/1/tree', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('响应状态:', response.status)
  console.log('响应类型:', response.headers.get('content-type'))
  return response.json()
})
.then(data => {
  console.log('✅ Wiki API 测试成功:', data)
})
.catch(error => {
  console.error('❌ Wiki API 测试失败:', error)
})
```

### 预期结果

✅ **成功响应**:
```javascript
响应状态: 200
响应类型: application/json
✅ Wiki API 测试成功: {code: 200, data: [...], msg: "成功"}
```

❌ **失败响应（404 HTML）**:
```javascript
响应状态: 404
响应类型: text/html
❌ 错误：返回了HTML页面，说明代理未生效
```

---

## 🔧 故障排查清单

### ✅ 检查清单

1. **后端服务运行中？**
```bash
netstat -ano | findstr "8234"
# 应该看到: TCP 0.0.0.0:8234 ... LISTENING
```

2. **前端服务已重启？**
   - 修改 `vue.config.js` 后必须重启
   - 看到新的编译输出

3. **代理配置正确？**
   - 打开 `front/vue.config.js`
   - 查找 `/api/wiki` 配置块
   - 确认 `target: 'http://localhost:8234'`

4. **Token有效？**
```javascript
// 浏览器控制台
localStorage.getItem('access_token')
```

---

## 🐛 常见错误解决

### 错误1: 404 返回HTML页面

**原因**: Vue代理未生效，请求没有转发到8234端口

**解决**:
```bash
# 停止前端服务（Ctrl+C）
# 重新启动
cd front
npm run serve
```

### 错误2: 401 Unauthorized

**原因**: Token过期或未登录

**解决**:
1. 重新登录获取新token
2. 或在浏览器控制台手动设置token

### 错误3: CORS错误

**原因**: 跨域配置问题

**解决**:
- 确认代理配置中有 `changeOrigin: true`
- 重启前端服务

---

## 📝 测试Wiki API的完整示例

### 创建一个简单的测试页面

创建文件 `front/public/test-wiki.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Wiki API 测试</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    .test-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    button {
      padding: 10px 20px;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #4338ca;
    }
    #result {
      margin-top: 20px;
      padding: 15px;
      background: #f3f4f6;
      border-radius: 4px;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 12px;
    }
    .success { color: #10b981; }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <h1>🧪 Wiki API 测试工具</h1>
  
  <div class="test-section">
    <h3>1. 测试连接</h3>
    <button onclick="testConnection()">测试Wiki服务连接</button>
    <button onclick="testToken()">检查Token</button>
  </div>
  
  <div class="test-section">
    <h3>2. 测试API</h3>
    <label>项目ID: <input type="number" id="projectId" value="1" /></label><br><br>
    <button onclick="testGetTree()">获取Wiki树</button>
    <button onclick="testGetStatistics()">获取统计信息</button>
    <button onclick="testCreatePage()">创建测试页面</button>
  </div>
  
  <div class="test-section">
    <h3>结果输出</h3>
    <div id="result">等待测试...</div>
  </div>

  <script>
    const result = document.getElementById('result');
    
    function log(message, isSuccess = true) {
      const className = isSuccess ? 'success' : 'error';
      result.innerHTML += `<span class="${className}">${message}</span>\n`;
      console.log(message);
    }
    
    function clear() {
      result.innerHTML = '';
    }
    
    async function testConnection() {
      clear();
      log('🔍 测试Wiki服务连接...');
      
      try {
        const response = await fetch('/api/wiki/projects/1/tree', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        log(`响应状态: ${response.status}`);
        log(`Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.headers.get('content-type').includes('text/html')) {
          log('❌ 返回了HTML页面！代理未生效，请重启前端服务！', false);
          return;
        }
        
        const data = await response.json();
        log('✅ Wiki服务连接成功！');
        log(JSON.stringify(data, null, 2));
      } catch (error) {
        log(`❌ 连接失败: ${error.message}`, false);
      }
    }
    
    function testToken() {
      clear();
      const token = localStorage.getItem('access_token');
      if (token) {
        log(`✅ Token存在: ${token.substring(0, 20)}...`);
      } else {
        log('❌ 未找到Token，请先登录！', false);
      }
    }
    
    async function testGetTree() {
      clear();
      const projectId = document.getElementById('projectId').value;
      log(`🔍 获取项目 ${projectId} 的Wiki树...`);
      
      try {
        const response = await fetch(`/api/wiki/projects/${projectId}/tree`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
          log('✅ 获取成功！');
          log(`页面数量: ${data.data ? data.data.length : 0}`);
          log(JSON.stringify(data, null, 2));
        } else {
          log(`❌ 获取失败: ${data.msg}`, false);
        }
      } catch (error) {
        log(`❌ 请求失败: ${error.message}`, false);
      }
    }
    
    async function testGetStatistics() {
      clear();
      const projectId = document.getElementById('projectId').value;
      log(`🔍 获取项目 ${projectId} 的统计信息...`);
      
      try {
        const response = await fetch(`/api/wiki/projects/${projectId}/statistics`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
          log('✅ 获取成功！');
          log(JSON.stringify(data.data, null, 2));
        } else {
          log(`❌ 获取失败: ${data.msg}`, false);
        }
      } catch (error) {
        log(`❌ 请求失败: ${error.message}`, false);
      }
    }
    
    async function testCreatePage() {
      clear();
      const projectId = document.getElementById('projectId').value;
      log(`🔍 创建测试页面...`);
      
      const pageData = {
        projectId: parseInt(projectId),
        title: '测试页面 - ' + new Date().toLocaleTimeString(),
        pageType: 'DOCUMENT',
        content: '# 测试内容\n\n这是一个自动创建的测试页面。',
        changeDescription: '自动测试创建'
      };
      
      log('请求数据:');
      log(JSON.stringify(pageData, null, 2));
      
      try {
        const response = await fetch('/api/wiki/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pageData)
        });
        
        const data = await response.json();
        
        if (data.code === 200) {
          log('✅ 创建成功！');
          log(JSON.stringify(data, null, 2));
        } else {
          log(`❌ 创建失败: ${data.msg}`, false);
          log(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        log(`❌ 请求失败: ${error.message}`, false);
      }
    }
  </script>
</body>
</html>
```

### 访问测试页面

```
http://localhost:8001/test-wiki.html
```

---

## ✅ 成功标志

当你看到以下情况，说明Wiki API工作正常：

1. ✅ 浏览器控制台显示 `响应状态: 200`
2. ✅ 响应类型是 `application/json`（不是 `text/html`）
3. ✅ 返回数据格式：`{code: 200, data: [...], msg: "成功"}`

---

## 🎯 下一步

测试成功后，你可以：
1. 创建 Wiki 管理界面
2. 集成到现有的知识库模块
3. 测试完整的 CRUD 操作

祝测试顺利！🚀


