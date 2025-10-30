/**
 * Vue开发服务器配置
 * 
 * 代理规则说明：
 * - 代理规则按照从上到下的顺序匹配，更具体的路径规则应该放在前面
 * - /zhiyan/api/projects/* → http://localhost:8095 (项目服务，端口8095)
 * - /zhiyan/api/users/* → http://localhost:8095 (用户搜索，通过项目服务，端口8095)
 * - /zhiyan/api/auth/* → http://localhost:8091 (认证服务，端口8091)
 * - /zhiyan/* → http://localhost:8091 (其他API默认使用认证服务，端口8091)
 */
module.exports = {
  devServer: {
    port: 8001,
    host: '0.0.0.0',
    proxy: {
      // ✅ 项目相关API - 转发到8095端口（项目服务）
      // 包含：创建项目、更新项目、删除项目、获取项目列表等
      // URL示例：/zhiyan/api/projects → http://localhost:8095/api/projects
      '/zhiyan/api/projects': {
        target: 'http://localhost:8095',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/zhiyan': '' // 移除 /zhiyan 前缀，转发为 /api/projects
        }
      },
      // ✅ 用户搜索API - 转发到8095端口（通过项目服务调用认证服务）
      // URL示例：/zhiyan/api/users/search → http://localhost:8095/api/users/search
      '/zhiyan/api/users': {
        target: 'http://localhost:8095',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/zhiyan': ''
        }
      },
      // ✅ 认证相关API - 转发到8091端口（认证服务）
      // URL示例：/zhiyan/api/auth/login → http://localhost:8091/api/auth/login
      '/zhiyan/api/auth': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/zhiyan': ''
        }
      },
      // ⚠️ 默认规则 - 转发到8091端口（认证服务）
      // 注意：这个规则必须放在最后，作为其他未匹配路径的默认规则
      '/zhiyan': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/zhiyan': '/zhiyan'
        }
      }
    }
  }
}
