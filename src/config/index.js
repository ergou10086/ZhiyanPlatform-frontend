// 应用配置文件

const config = {
  // API配置
  api: {
    // 默认API基础URL
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-api.com' 
      : 'http://localhost:8091', // 默认端口8091
    timeout: 10000,
    // 多端口配置
    endpoints: {
      // 认证服务 (8091)
      auth: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-api.com' 
        : 'http://localhost:8091',
      // 项目服务 (8095)
      project: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-api.com' 
        : 'http://localhost:8095'
    }
  },
  
  // 应用配置
  app: {
    name: '智研平台',
    version: '1.0.0'
  },
  
  // 存储配置
  storage: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    rememberMeKey: 'remember_me_token',
    userInfoKey: 'user_info'
  }
}

export default config
