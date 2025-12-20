import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import Home from '../views/Home.vue'
import ProjectSquare from '../views/ProjectSquare.vue'
import ProjectCreate from '../views/ProjectCreate.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import KnowledgeBaseCatalog from '../views/KnowledgeBaseCatalog.vue'
import KnowledgeBaseCabinet from '../views/KnowledgeBaseCabinet.vue'
import KnowledgeBaseAI from '../views/KnowledgeBaseAI.vue'
import AIAssistant from '../views/AIAssistant.vue'
import Profile from '../views/Profile.vue'
import ProjectDetail from '../views/ProjectDetail.vue'
import ProjectKnowledge from '../views/ProjectKnowledge.vue'
import ProjectDashboard from '../views/ProjectDashboard.vue'
import ProjectOperationLog from '../views/ProjectOperationLog.vue'
import MyActivity from '../views/MyActivity.vue'
import OAuth2Callback from '../views/OAuth2Callback.vue'
import OAuth2Bind from '../views/OAuth2Bind.vue'
import OAuth2Supplement from '../views/OAuth2Supplement.vue'
import OAuth2Error from '../views/OAuth2Error.vue'
import ChangeEmail from '../views/ChangeEmail.vue'
import NotFound from '../views/NotFound.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/change-email',
    name: 'ChangeEmail',
    component: ChangeEmail
  },
  {
    path: '/oauth2/callback/:provider',
    name: 'OAuth2Callback',
    component: OAuth2Callback
  },
  {
    path: '/auth/oauth2/callback/:provider',
    name: 'OAuth2CallbackAlt',
    component: OAuth2Callback
  },
  {
    path: '/zhiyan/auth/oauth2/callback/:provider',
    name: 'OAuth2CallbackWithPrefix',
    component: OAuth2Callback
  },
  {
    path: '/oauth2/bind',
    name: 'OAuth2Bind',
    component: OAuth2Bind
  },
  {
    path: '/oauth2/supplement',
    name: 'OAuth2Supplement',
    component: OAuth2Supplement
  },
  {
    path: '/oauth2/error',
    name: 'OAuth2Error',
    component: OAuth2Error
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/project-square',
    name: 'ProjectSquare',
    component: ProjectSquare
  },
  {
    path: '/project-create',
    name: 'ProjectCreate',
    component: ProjectCreate
  },
  {
    path: '/project-detail/:id',
    name: 'ProjectDetail',
    component: ProjectDetail
  },
  {
    path: '/project-knowledge/:id',
    name: 'ProjectKnowledge',
    component: ProjectKnowledge
  },
  {
    path: '/project-dashboard/:id',
    name: 'ProjectDashboard',
    component: ProjectDashboard
  },
  {
    path: '/project-operation-log/:id',
    name: 'ProjectOperationLog',
    component: ProjectOperationLog
  },
  {
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    children: [
      { path: 'home', component: { render: h => h('div') } },
      { path: 'catalog', component: KnowledgeBaseCatalog },
      { path: 'cabinet', component: KnowledgeBaseCabinet },
      { path: 'ai', component: KnowledgeBaseAI }
    ]
  },
  {
    path: '/ai-assistant',
    name: 'AIAssistant',
    component: AIAssistant
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/my-activity',
    name: 'MyActivity',
    component: MyActivity
  },
  {
    path: '/task-review',
    redirect: '/my-activity'
  },
  {
    path: '/docs',
    beforeEnter(to, from, next) {
      // 开发环境：重定向到代理路径
      // 生产环境：直接访问静态文件（由 Nginx 或服务器处理）
      if (process.env.NODE_ENV === 'development') {
        // 开发环境，文档由代理处理，直接允许访问
        next()
      } else {
        // 生产环境，文档是静态文件，直接允许访问
        next()
      }
    }
  },
  // 404页面 - 必须放在最后，作为catch-all路由
  {
    path: '*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  // 每次路由切换后将页面滚动到顶部，避免沿用上一页的滚动位置
  scrollBehavior(to, from, savedPosition) {
    // 如果浏览器有记录（如浏览器前进/后退），优先使用记录的位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则一律回到页面顶部
    return { x: 0, y: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const userInfo = localStorage.getItem('user_info')
  const isAuthenticated = !!(token && userInfo)
  
  console.log('路由守卫检查:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    token: !!token,
    userInfo: !!userInfo
  })
  
  // 防止重定向循环
  if (to.path === from.path) {
    console.log('相同路径，跳过重定向')
    next()
    return
  }
  
  // 登录页面 - 允许所有用户访问
  if (to.path === '/login') {
    if (isAuthenticated) {
      console.log('已登录用户访问登录页，重定向到首页')
      next({ path: '/home', replace: true })
    } else {
      console.log('游客访问登录页，允许访问')
      next()
    }
    return
  }
  
  // 注册和忘记密码页面 - 允许所有用户访问
  if (to.path === '/register' || to.path === '/forgot-password') {
    console.log('注册/忘记密码页允许访问')
    next()
    return
  }
  
  // OAuth2相关页面 - 允许所有用户访问
  if (to.path.startsWith('/auth/oauth2/callback') || 
      to.path.startsWith('/zhiyan/auth/oauth2/callback') ||
      to.path.startsWith('/oauth2/')) {
    console.log('OAuth2相关页面，允许访问, 路径:', to.path)
    next()
    return
  }
  
  // 个人页面特殊处理：查看自己的资料需要登录，查看他人资料允许游客访问
  if (to.path === '/profile') {
    // 如果有 userId 参数，说明是查看他人资料，允许访问
    if (to.query.userId) {
      console.log('查看他人资料，允许访问')
      next()
      return
    }
    // 如果没有 userId 参数，说明是查看自己的资料，需要登录
    if (!isAuthenticated) {
      console.log('未登录用户访问个人页面，重定向到登录页')
      next({ path: '/login', replace: true })
    } else {
      console.log('已登录用户访问个人页面，允许访问')
      next()
    }
    return
  }
  
  // 游客可以访问的页面
  const guestAllowedPages = ['/home', '/project-square']
  if (guestAllowedPages.includes(to.path)) {
    console.log('游客可访问页面，允许访问')
    next()
    return
  }
  
  // 需要认证的页面
  const authRequiredPages = [
    '/project-create',
    '/ai-assistant',
    '/knowledge-base',
    '/project-detail',
    '/project-knowledge',
    '/project-dashboard',
    '/project-operation-log',
    '/project',
    '/my-activity'
  ]
  
  const needsAuth = authRequiredPages.some(page => to.path.startsWith(page))
  
  if (needsAuth) {
    if (!isAuthenticated) {
      console.log('需要认证的页面，重定向到登录页')
      // 使用replace避免历史记录问题
      next({ path: '/login', replace: true })
    } else {
      console.log('已认证，允许访问')
      next()
    }
    return
  }
  
  // 其他页面默认允许访问
  console.log('其他页面，允许访问')
  next()
})

export default router
