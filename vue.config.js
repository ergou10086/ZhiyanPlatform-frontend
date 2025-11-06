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
    
    // ⭐ 全局禁用压缩（压缩可能导致缓冲）
    compress: false,
    
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
      // ✅ Wiki相关API - 转发到8234端口（Wiki服务）
      // URL示例：/api/wiki/* → http://localhost:8234/api/wiki/*
      // 包含：Wiki页面管理、版本控制、搜索、导入导出等
      '/api/wiki': {
        target: 'http://localhost:8234',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        // 不需要pathRewrite，直接转发 /api/wiki/* 到后端
      },
      // ✅ 知识库成果文件API - 转发到8093端口（知识库服务）
      // URL示例：/zhiyan/achievement/file/* → http://localhost:8093/zhiyan/achievement/file/*
      // 包含：上传文件、下载文件、删除文件等
      '/zhiyan/achievement/file': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      },
      // ✅ 知识库成果详情API - 转发到8093端口（知识库服务）
      // URL示例：/zhiyan/achievement/detail/* → http://localhost:8093/zhiyan/achievement/detail/*
      '/zhiyan/achievement/detail': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      },
      // ✅ 知识库成果搜索API - 转发到8093端口（知识库服务）
      // URL示例：/zhiyan/achievement/search/* → http://localhost:8093/zhiyan/achievement/search/*
      '/zhiyan/achievement/search': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      },
      // ✅ 知识库相关API - 转发到8093端口（知识库服务）
      // URL示例：/zhiyan/achievement/* → http://localhost:8093/zhiyan/achievement/*
      // 注意：这个规则必须放在其他 /zhiyan/achievement/* 规则之后，作为默认规则
      '/zhiyan/achievement': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      },
      // ✅ Coze AI相关API - 转发到8094端口（Coze AI服务）
      // URL示例：/zhiyan/api/coze/* → http://localhost:8094/api/coze/*
      '/zhiyan/api/coze': {
        target: 'http://localhost:8094',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/zhiyan': '' // 移除 /zhiyan 前缀，转发为 /api/coze/*
        },
        
        // ⭐ 请求前的钩子
        onProxyReq: function(proxyReq, req, res) {
          // 检测流式请求
          if (req.url.includes('/stream')) {
            console.log('🚀 [Vue Proxy - Coze] 转发流式请求:', req.url)
          }
        },
        
        // ⭐⭐⭐ 关键配置：禁用代理缓冲，支持流式响应（SSE）
        onProxyRes: function (proxyRes, req, res) {
          // 对于流式接口，配置无缓冲响应
          if (req.url.includes('/stream')) {
            console.log('📥 [Vue Proxy - Coze] 收到流式响应，配置无缓冲模式')
            console.log('   Content-Type:', proxyRes.headers['content-type'])
            console.log('   Transfer-Encoding:', proxyRes.headers['transfer-encoding'])
            
            // 设置响应头，确保流式传输
            res.setHeader('Cache-Control', 'no-cache, no-transform')
            res.setHeader('X-Accel-Buffering', 'no')
            res.setHeader('Connection', 'keep-alive')
            
            // 删除可能导致缓冲的头
            delete proxyRes.headers['content-length']
            delete proxyRes.headers['content-encoding']
            
            // 确保是chunked传输
            if (!proxyRes.headers['transfer-encoding']) {
              proxyRes.headers['transfer-encoding'] = 'chunked'
            }
            
            // ⭐ 监听数据流（用于调试）
            let chunkCount = 0
            proxyRes.on('data', (chunk) => {
              chunkCount++
              console.log(`📦 [Vue Proxy - Coze] 转发数据块 #${chunkCount}: ${chunk.length} bytes`)
            })
            
            proxyRes.on('end', () => {
              console.log(`🏁 [Vue Proxy - Coze] 流式响应结束，共转发 ${chunkCount} 个数据块`)
            })
          }
        },
        
        // ⭐ 禁用代理自动处理响应
        selfHandleResponse: false,
        
        // ⭐ 禁用缓冲
        buffer: false,
        
        // ⭐ 设置超时时间（0表示无限制）
        timeout: 0
      },
      // ✅ Dify AI相关API - 转发到8097端口（Dify AI服务）
      // URL示例：/zhiyan/api/ai/* → http://localhost:8097/api/ai/*
      '/zhiyan/api/ai': {
        target: 'http://localhost:8097',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/zhiyan': '' // 移除 /zhiyan 前缀，转发为 /api/ai/*
        },
        
        // ⭐ 请求前的钩子
        onProxyReq: function(proxyReq, req, res) {
          // 检测流式请求（包括 /stream 和 /upload-and-chat）
          if (req.url.includes('/stream') || req.url.includes('/upload-and-chat') || req.url.includes('/chatflow')) {
            console.log('🚀 [Vue Proxy] 转发流式请求:', req.url)
          }
        },
        
        // ⭐⭐⭐ 关键配置：禁用代理缓冲，支持流式响应（SSE）
        onProxyRes: function (proxyRes, req, res) {
          // 对于流式接口，配置无缓冲响应（包括所有 chatflow 相关接口）
          if (req.url.includes('/stream') || req.url.includes('/upload-and-chat') || req.url.includes('/chatflow')) {
            console.log('📥 [Vue Proxy] 收到流式响应，配置无缓冲模式')
            console.log('   Content-Type:', proxyRes.headers['content-type'])
            console.log('   Transfer-Encoding:', proxyRes.headers['transfer-encoding'])
            
            // 设置响应头，确保流式传输
            res.setHeader('Cache-Control', 'no-cache, no-transform')
            res.setHeader('X-Accel-Buffering', 'no')
            res.setHeader('Connection', 'keep-alive')
            
            // 删除可能导致缓冲的头
            delete proxyRes.headers['content-length']
            delete proxyRes.headers['content-encoding']
            
            // 确保是chunked传输
            if (!proxyRes.headers['transfer-encoding']) {
              proxyRes.headers['transfer-encoding'] = 'chunked'
            }
            
            // ⭐ 监听数据流（用于调试）
            let chunkCount = 0
            proxyRes.on('data', (chunk) => {
              chunkCount++
              console.log(`📦 [Vue Proxy] 转发数据块 #${chunkCount}: ${chunk.length} bytes`)
            })
            
            proxyRes.on('end', () => {
              console.log(`🏁 [Vue Proxy] 流式响应结束，共转发 ${chunkCount} 个数据块`)
            })
          }
        },
        
        // ⭐ 禁用代理自动处理响应
        selfHandleResponse: false,
        
        // ⭐ 禁用缓冲
        buffer: false,
        
        // ⭐ 设置超时时间（0表示无限制）
        timeout: 0
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
