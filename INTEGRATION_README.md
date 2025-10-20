# 前后端集成说明

## 概述

本文档说明了智研平台前端与后端的集成方式，包括API调用、认证流程和错误处理。

## 项目结构

```
front/src/
├── api/
│   └── auth.js              # 认证相关API
├── utils/
│   └── auth.js              # 认证工具函数
├── store/
│   └── auth.js              # 认证状态管理
├── config/
│   └── index.js             # 配置文件
└── views/
    ├── Login.vue            # 登录页面
    ├── Register.vue         # 注册页面
    └── ForgotPassword.vue   # 忘记密码页面
```

## API接口说明

### 认证相关接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 发送验证码 | POST | `/zhiyan/auth/send-verfcode` | 发送邮箱验证码 |
| 用户注册 | POST | `/zhiyan/auth/register` | 用户注册 |
| 用户登录 | POST | `/zhiyan/auth/login` | 用户登录 |
| 自动登录检查 | GET | `/zhiyan/auth/auto-login-check` | 检查自动登录 |
| 验证验证码 | POST | `/zhiyan/auth/verify-code` | 验证验证码 |
| 检查邮箱 | GET | `/zhiyan/auth/check-email` | 检查邮箱是否已注册 |
| 刷新令牌 | POST | `/zhiyan/auth/refresh` | 刷新访问令牌 |
| 验证令牌 | GET | `/zhiyan/auth/validate` | 验证令牌有效性 |
| 忘记密码 | POST | `/zhiyan/auth/forgot-password` | 发送密码重置验证码 |
| 重置密码 | POST | `/zhiyan/auth/reset-password` | 重置密码 |
| 用户登出 | POST | `/zhiyan/auth/logout` | 用户登出 |

## 使用说明

### 1. 启动后端服务

确保后端服务运行在 `http://localhost:8080`

### 2. 启动前端服务

```bash
cd front
npm run serve
```

前端服务将运行在 `http://localhost:8000`

### 3. 测试流程

#### 注册流程
1. 访问 `http://localhost:8000/register`
2. 输入邮箱地址，点击"发送验证码"
3. 输入收到的验证码
4. 设置密码和昵称
5. 同意用户协议
6. 点击"立即注册"

#### 登录流程
1. 访问 `http://localhost:8000/login`
2. 输入邮箱和密码
3. 可选择"记住我"和"自动登录"
4. 点击"安全登录"

#### 忘记密码流程
1. 访问 `http://localhost:8000/forgot-password`
2. 输入邮箱地址，点击"发送验证码"
3. 输入收到的验证码
4. 设置新密码
5. 点击"完成"

## 配置说明

### API配置

在 `src/config/index.js` 中配置API基础URL：

```javascript
const config = {
  api: {
    baseURL: 'http://localhost:8080', // 后端服务地址
    timeout: 10000
  }
}
```

### 环境配置

- 开发环境：`http://localhost:8080`
- 生产环境：需要修改为实际的生产环境地址

## 错误处理

### 网络错误
- 自动重试机制
- 友好的错误提示
- 网络状态检测

### 认证错误
- Token过期自动处理
- 未授权自动跳转登录页
- 记住我功能支持

### 表单验证
- 邮箱格式验证
- 密码强度检查
- 必填字段验证

## 状态管理

### 认证状态
- 用户登录状态
- 用户信息存储
- Token管理

### 本地存储
- `access_token`: 访问令牌
- `refresh_token`: 刷新令牌
- `remember_me_token`: 记住我令牌
- `user_info`: 用户信息

## 路由守卫

### 保护页面
以下页面需要登录后才能访问：
- `/home` - 首页
- `/profile` - 个人资料
- `/project-square` - 项目广场
- `/project-create` - 创建项目
- `/knowledge-base` - 知识库
- `/ai-assistant` - AI助手

### 自动跳转
- 未登录用户访问保护页面 → 跳转到登录页
- 已登录用户访问登录页 → 跳转到首页

## 开发调试

### 控制台日志
- API请求和响应日志
- 错误信息详细记录
- 认证状态变化日志

### 网络面板
- 查看API请求详情
- 检查响应状态码
- 分析请求头信息

## 常见问题

### 1. CORS跨域问题
确保后端配置了正确的CORS策略，允许前端域名访问。

### 2. Token过期
系统会自动处理Token过期，清除本地存储并跳转到登录页。

### 3. 网络连接失败
检查后端服务是否正常运行，网络连接是否正常。

### 4. 验证码发送失败
检查邮箱配置是否正确，后端邮件服务是否正常。

## 部署说明

### 前端部署
1. 构建生产版本：`npm run build`
2. 部署到Web服务器
3. 配置正确的API基础URL

### 后端部署
1. 确保数据库连接正常
2. 配置邮件服务
3. 设置正确的CORS策略

## 技术支持

如有问题，请检查：
1. 浏览器控制台错误信息
2. 网络请求状态
3. 后端服务日志
4. 数据库连接状态
