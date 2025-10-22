module.exports = {
  devServer: {
    port: 8001,
    host: '0.0.0.0',
    proxy: {
      '/zhiyan': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        // 关键配置：保持路径不变
        pathRewrite: {
          '^/zhiyan': '/zhiyan'
        }
      }
    }
  }
}
