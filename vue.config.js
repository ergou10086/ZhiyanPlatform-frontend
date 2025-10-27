module.exports = {
  devServer: {
    port: 8001,
    host: '0.0.0.0',
    proxy: {
      '/zhiyan/api/projects': {
        target: 'http://localhost:8095',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        // 项目API转发到8095端口
        pathRewrite: {
          '^/zhiyan': ''
        }
      },
      '/zhiyan/api/users': {
        target: 'http://localhost:8095',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        // 用户搜索API转发到8095端口（项目服务）
        pathRewrite: {
          '^/zhiyan': ''
        }
      },
      '/zhiyan/api/auth': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        // 认证API转发到8091端口
        pathRewrite: {
          '^/zhiyan': ''
        }
      },
      '/zhiyan': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        // 其他API默认转发到8091端口
        pathRewrite: {
          '^/zhiyan': '/zhiyan'
        }
      }
    }
  }
}
