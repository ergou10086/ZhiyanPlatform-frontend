// 应用配置文件，带有安全的默认值和可选的运行时覆盖

const isProduction = typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'production'

const DEFAULT_HOST =
    (typeof process !== 'undefined' && process.env && process.env.VUE_APP_API_BASE_URL) ||
    (isProduction
        ? ''   // 生产环境使用相对路径，由 Nginx 代理转发
        : 'http://localhost:9006')  // 开发环境使用本地后端

const DEFAULTS = {
  api: {
    baseURL: DEFAULT_HOST,
    timeout: 60000,
    endpoints: {
      auth: DEFAULT_HOST,
      knowledge: DEFAULT_HOST,
      project: DEFAULT_HOST
    }
  },
  minio: {
    // 当不再使用 MinIO 时，复用 API 主机，仍保留配置项以兼容旧代码
    baseURL: DEFAULT_HOST,
    bucket: 'zhiyan'
  },
  app: {
    name: '智研平台',
    version: '1.0.0'
  },
  storage: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    rememberMeKey: 'remember_me_token',
    userInfoKey: 'user_info'
  }
}

// 允许通过 window.__ZHIYAN_APP_CONFIG__ 在运行时注入配置
const runtimeConfig = (typeof window !== 'undefined' && window.__ZHIYAN_APP_CONFIG__) || {}

// 合并默认配置和运行时配置（逐层覆盖）
const config = {
  ...DEFAULTS,
  ...runtimeConfig,
  api: {
    ...DEFAULTS.api,
    ...(runtimeConfig.api || {}),
    endpoints: {
      ...DEFAULTS.api.endpoints,
      ...(runtimeConfig.api?.endpoints || {})
    }
  },
  minio: {
    ...DEFAULTS.minio,
    ...(runtimeConfig.minio || {})
  },
  app: {
    ...DEFAULTS.app,
    ...(runtimeConfig.app || {})
  },
  storage: {
    ...DEFAULTS.storage,
    ...(runtimeConfig.storage || {})
  }
}

// 导出常用的配置项，带兜底避免 undefined
export const API_BASE_URL = config.api?.baseURL || DEFAULTS.api.baseURL
export const MINIO_BASE_URL = config.minio?.baseURL || DEFAULTS.minio.baseURL
export const MINIO_BUCKET = config.minio?.bucket || DEFAULTS.minio.bucket

// 导出各个服务的端点
export const AUTH_API_URL = config.api?.endpoints?.auth || DEFAULTS.api.endpoints.auth
export const KNOWLEDGE_API_URL = config.api?.endpoints?.knowledge || DEFAULTS.api.endpoints.knowledge
export const PROJECT_API_URL = config.api?.endpoints?.project || DEFAULTS.api.endpoints.project

export default config
