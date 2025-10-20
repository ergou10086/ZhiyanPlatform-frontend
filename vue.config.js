module.exports = {
  devServer: {
    port: 8001,
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
