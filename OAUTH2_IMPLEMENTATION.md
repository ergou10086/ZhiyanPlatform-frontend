# OAuth2 第三方登录前端实现文档

## 📋 概述

本文档说明了智研平台前端 OAuth2 第三方登录功能的完整实现，包括 GitHub、Google 等第三方平台的授权登录。

## 🎯 实现的功能

### 1. 三种登录场景处理

#### ✅ 场景1：邮箱匹配到已有账号
- OAuth2 提供的邮箱已在系统注册
- 直接登录成功，返回 JWT Token
- 自动跳转到首页

#### ⚠️ 场景2：邮箱未匹配，需要绑定或创建
- OAuth2 提供的邮箱未在系统注册
- 显示弹窗，用户可选择：
  - **绑定已有账号**：输入已有账号的邮箱和密码
  - **创建新账号**：补充邮箱和密码信息

#### ⚠️ 场景3：OAuth2 信息不足（缺少邮箱）
- OAuth2 未提供邮箱信息
- 显示补充信息表单
- 用户必须填写邮箱和密码

## 📁 文件结构

```
src/
├── api/
│   └── auth.js                          # 添加了 OAuth2 相关 API
├── components/
│   ├── OAuth2BindDialog.vue             # 绑定/创建账号选择弹窗
│   └── OAuth2SupplementDialog.vue       # 补充信息表单弹窗
├── views/
│   ├── Login.vue                        # 修改了 GitHub 登录按钮
│   └── OAuth2Callback.vue               # OAuth2 回调处理页面
└── router/
    └── index.js                         # 添加了 OAuth2 回调路由
```

## 🔧 实现细节

### 1. API 接口 (`src/api/auth.js`)

添加了以下 OAuth2 相关接口：

```javascript
// 获取 OAuth2 授权 URL
authAPI.getOAuth2AuthUrl(provider)

// 处理 OAuth2 回调
authAPI.handleOAuth2Callback(provider, code, state)

// 绑定已有账号
authAPI.bindOAuth2Account(data)

// 补充信息创建账号
authAPI.supplementOAuth2Info(data)
```

### 2. 登录页面 (`src/views/Login.vue`)

#### GitHub 登录按钮
- 位置：登录按钮下方
- 样式：深色背景，带 GitHub 图标
- 功能：点击后调用后端获取授权 URL，跳转到 GitHub

#### 实现代码
```javascript
async handleGithubLogin() {
  // 1. 调用后端获取授权 URL
  const response = await authAPI.getOAuth2AuthUrl('github')
  
  // 2. 保存 state 到 sessionStorage
  sessionStorage.setItem('oauth2_state', state)
  sessionStorage.setItem('oauth2_provider', 'github')
  
  // 3. 跳转到 GitHub 授权页面
  window.location.href = authorizationUrl
}
```

### 3. 回调处理页面 (`src/views/OAuth2Callback.vue`)

#### 功能
- 接收 GitHub 回调参数（code、state）
- 验证 state 防止 CSRF 攻击
- 调用后端回调接口
- 根据响应状态处理不同场景

#### 三种状态处理
```javascript
switch (status) {
  case 'SUCCESS':
    // 直接登录成功
    handleLoginSuccess(loginResponse)
    break
    
  case 'NEED_BIND':
    // 显示绑定/创建选择弹窗
    showBindDialog = true
    break
    
  case 'NEED_SUPPLEMENT':
    // 显示补充信息表单
    showSupplementDialog = true
    break
}
```

### 4. 绑定/创建账号弹窗 (`src/components/OAuth2BindDialog.vue`)

#### 功能
- 显示 OAuth2 用户信息（头像、昵称、邮箱）
- 提供两个选项卡：
  - **绑定已有账号**：输入邮箱和密码
  - **创建新账号**：输入邮箱、密码、确认密码

#### 表单验证
- 邮箱格式验证
- 密码长度验证（至少 6 位）
- 密码一致性验证
- 绑定时验证密码正确性

### 5. 补充信息弹窗 (`src/components/OAuth2SupplementDialog.vue`)

#### 功能
- 显示 OAuth2 用户信息
- 提示用户补充邮箱和密码
- 显示账号信息预览

#### 表单字段
- 邮箱（必填）
- 密码（必填，至少 6 位）
- 确认密码（必填）

### 6. 路由配置 (`src/router/index.js`)

添加了 OAuth2 回调路由：

```javascript
{
  path: '/auth/oauth2/callback/:provider',
  name: 'OAuth2Callback',
  component: OAuth2Callback
}
```

路由守卫配置：
- OAuth2 回调页面允许所有用户访问（无需登录）

## 🔐 安全措施

### 1. CSRF 防护
- 使用 state 参数防止 CSRF 攻击
- state 保存在 sessionStorage
- 回调时验证 state 一致性

### 2. 密码验证
- 绑定账号时必须验证密码
- 确保只能绑定自己的账号

### 3. 邮箱验证
- 邮箱格式验证
- 创建账号时检查邮箱是否已注册

## 🎨 UI/UX 设计

### 1. 登录按钮
- 深色背景（#24292e）
- GitHub 图标
- 悬停效果：上移 + 阴影
- 暗黑模式适配

### 2. 回调页面
- 加载状态：旋转动画 + 提示文字
- 错误状态：错误图标 + 错误信息 + 返回按钮
- 渐变背景

### 3. 弹窗组件
- 圆角设计（16px）
- 阴影效果
- 响应式布局
- 暗黑模式支持

## 📝 使用流程

### 用户操作流程

```
1. 用户点击 "使用 GitHub 登录" 按钮
   ↓
2. 跳转到 GitHub 授权页面
   ↓
3. 用户在 GitHub 上授权
   ↓
4. GitHub 回调到 /auth/oauth2/callback/github
   ↓
5. 前端处理回调，调用后端接口
   ↓
6. 根据后端响应处理：
   
   场景A：SUCCESS
   ├─ 保存 Token
   └─ 跳转到首页
   
   场景B：NEED_BIND
   ├─ 显示绑定/创建选择弹窗
   ├─ 用户选择绑定 → 输入邮箱密码 → 绑定成功 → 跳转首页
   └─ 用户选择创建 → 输入邮箱密码 → 创建成功 → 跳转首页
   
   场景C：NEED_SUPPLEMENT
   ├─ 显示补充信息表单
   └─ 用户填写邮箱密码 → 创建成功 → 跳转首页
```

## 🧪 测试要点

### 1. 功能测试
- [ ] GitHub 登录按钮点击正常
- [ ] 授权 URL 获取成功
- [ ] 回调参数接收正常
- [ ] state 验证正常
- [ ] 三种场景都能正确处理

### 2. 表单验证测试
- [ ] 邮箱格式验证
- [ ] 密码长度验证
- [ ] 密码一致性验证
- [ ] 空值验证

### 3. UI 测试
- [ ] 按钮样式正常
- [ ] 弹窗显示正常
- [ ] 响应式布局正常
- [ ] 暗黑模式正常

### 4. 安全测试
- [ ] state 验证有效
- [ ] 密码不明文传输
- [ ] Token 正确保存

## 🔄 后端接口要求

### 1. 获取授权 URL
```
GET /zhiyan/auth/oauth2/authorize/{provider}

响应：
{
  "code": 200,
  "data": {
    "authorizationUrl": "https://github.com/login/oauth/authorize?...",
    "state": "abc123..."
  }
}
```

### 2. OAuth2 回调
```
GET /zhiyan/auth/oauth2/callback/{provider}?code=xxx&state=xxx

响应（三种状态之一）：
- SUCCESS: 直接登录成功
- NEED_BIND: 需要绑定或创建账号
- NEED_SUPPLEMENT: 需要补充信息
```

### 3. 绑定账号
```
POST /zhiyan/auth/oauth2/bind
Content-Type: application/json

{
  "provider": "github",
  "providerUserId": "123456",
  "email": "user@example.com",
  "password": "password123",
  "oauth2UserInfo": {...}
}
```

### 4. 补充信息
```
POST /zhiyan/auth/oauth2/supplement
Content-Type: application/json

{
  "provider": "github",
  "providerUserId": "123456",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "oauth2UserInfo": {...}
}
```

## 📌 注意事项

1. **后端配置**
   - 需要在 GitHub 上注册 OAuth App
   - 配置正确的回调 URL：`http://localhost:8001/auth/oauth2/callback/github`
   - 后端需要实现所有 OAuth2 相关接口

2. **前端配置**
   - 无需配置 client_id（由后端管理）
   - 回调 URL 必须与后端配置一致

3. **扩展性**
   - 代码支持多个第三方平台（GitHub、Google、GitLab 等）
   - 只需修改 provider 参数即可

4. **错误处理**
   - 所有 API 调用都有错误处理
   - 用户友好的错误提示
   - 失败后可返回登录页

## 🎉 总结

OAuth2 第三方登录功能已完整实现，包括：

✅ GitHub 登录按钮及样式
✅ OAuth2 授权流程
✅ 三种登录场景处理
✅ 绑定/创建账号功能
✅ 补充信息功能
✅ 完整的错误处理
✅ 安全的 CSRF 防护
✅ 响应式设计
✅ 暗黑模式支持

前端部分已全部完成，等待后端接口对接即可使用！
