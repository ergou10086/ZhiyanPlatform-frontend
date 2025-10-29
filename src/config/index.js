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
  
  // MinIO配置
  minio: {
    // MinIO服务基础URL
    baseURL: process.env.NODE_ENV === 'production'
      ? 'http://10.7.10.98:9000'  // 生产环境MinIO地址
      : 'http://10.7.10.98:9000',  // 开发环境MinIO地址
    bucket: 'zhiyan'
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

// 导出常用的配置项
export const API_BASE_URL = config.api.baseURL
export const MINIO_BASE_URL = config.minio.baseURL
export const MINIO_BUCKET = config.minio.bucket

export default config
