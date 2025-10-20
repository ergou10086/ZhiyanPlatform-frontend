// 应用配置文件

const config = {
  // API配置
  api: {
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-api.com' 
      : '', // 开发环境使用代理，避免CORS问题
    timeout: 10000
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
