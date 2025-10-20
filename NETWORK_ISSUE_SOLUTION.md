# 网络连接问题解决方案

## 🚨 问题描述
前端输入邮箱后点击发送验证码显示"网络错误，无法检查邮箱状态"

## 🔍 问题诊断

### 1. 检查后端服务状态
```bash
# 检查端口8091是否被占用
netstat -an | findstr :8091

# 或者使用PowerShell
Get-NetTCPConnection -LocalPort 8091
```

### 2. 检查前端服务状态
```bash
# 检查端口8000是否被占用
netstat -an | findstr :8000
```

### 3. 使用调试工具
访问以下页面进行详细诊断：
- `http://localhost:8000/debug-network-connection.html` - 详细网络诊断
- `http://localhost:8000/test-email-verification.html` - 简单功能测试

## 🛠 解决方案

### 方案1: 使用代理配置（推荐）

1. **确保vue.config.js配置正确**：
```javascript
module.exports = {
  devServer: {
    port: 8000,
    host: '0.0.0.0',
    proxy: {
      '/zhiyan': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    }
  }
}
```

2. **确保config/index.js使用代理**：
```javascript
const config = {
  api: {
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-api.com' 
      : '', // 开发环境使用代理
    timeout: 10000
  }
}
```

3. **重启前端服务**：
```bash
# 停止当前服务 (Ctrl+C)
# 然后重新启动
npm run serve
```

### 方案2: 直接连接配置

如果代理不工作，可以尝试直接连接：

1. **修改config/index.js**：
```javascript
const config = {
  api: {
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-api.com' 
      : 'http://localhost:8091', // 直接连接后端
    timeout: 10000
  }
}
```

2. **确保后端CORS配置正确**：
检查 `WebCorsFilter.java` 和 `SecurityConfig.java` 中的CORS设置

### 方案3: 手动测试API

使用浏览器直接测试API：
```
GET http://localhost:8091/zhiyan/auth/check-email?email=test@example.com
```

## 🔧 常见问题及解决方法

### 问题1: CORS错误
**现象**: 浏览器控制台显示CORS相关错误
**解决**: 
1. 检查后端CORS配置
2. 使用代理而不是直接连接
3. 确保OPTIONS请求被正确处理

### 问题2: 连接被拒绝
**现象**: "ERR_CONNECTION_REFUSED" 错误
**解决**:
1. 确保后端服务正在运行
2. 检查端口是否正确（8091）
3. 检查防火墙设置

### 问题3: 代理不工作
**现象**: 代理请求失败
**解决**:
1. 重启前端开发服务器
2. 清除浏览器缓存
3. 检查vue.config.js配置

### 问题4: 网络超时
**现象**: 请求超时
**解决**:
1. 增加timeout设置
2. 检查网络连接
3. 检查后端响应时间

## 📋 调试步骤

### 步骤1: 基础检查
1. 打开浏览器开发者工具 (F12)
2. 访问 `http://localhost:8000/debug-network-connection.html`
3. 点击"检查配置"按钮
4. 查看配置信息是否正确

### 步骤2: 网络测试
1. 点击"测试基础连接"
2. 查看连接测试结果
3. 如果失败，检查后端服务状态

### 步骤3: API测试
1. 点击"测试邮箱检查API"
2. 查看API响应
3. 如果失败，检查后端日志

### 步骤4: 错误分析
1. 点击"分析错误"
2. 查看错误分析报告
3. 根据建议进行修复

## 🚀 快速修复脚本

### Windows用户
```batch
# 运行启动脚本
start-debug.bat
```

### 手动启动
```bash
# 1. 启动后端服务 (在ZhiyanPlatform目录)
mvn spring-boot:run

# 2. 启动前端服务 (在front目录)
npm run serve
```

## 📞 获取帮助

如果问题仍然存在，请提供以下信息：

1. **浏览器控制台错误信息**
2. **网络面板中的请求详情**
3. **后端服务日志**
4. **调试页面的测试结果**

## 🔄 验证修复

修复后，请验证以下功能：

1. ✅ 邮箱输入框失去焦点时自动检查邮箱状态
2. ✅ 点击"发送验证码"按钮成功发送
3. ✅ 验证码显示在后端控制台（测试模式）
4. ✅ 输入验证码后可以成功注册

## 📝 配置检查清单

- [ ] 后端服务在端口8091运行
- [ ] 前端服务在端口8000运行
- [ ] vue.config.js代理配置正确
- [ ] config/index.js baseURL配置正确
- [ ] 浏览器缓存已清除
- [ ] 防火墙允许本地连接
- [ ] CORS配置正确
- [ ] 网络连接正常




