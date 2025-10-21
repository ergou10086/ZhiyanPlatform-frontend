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

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
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
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    children: [
      { path: '', redirect: 'home' },
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
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const userInfo = localStorage.getItem('user_info')
  const isAuthenticated = !!(token && userInfo)
  
  // 需要认证的页面
  const authRequiredPages = ['/home', '/profile', '/project-square', '/project-create', '/knowledge-base', '/ai-assistant']
  
  console.log('路由守卫检查:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    token: !!token,
    userInfo: !!userInfo,
    tokenValue: token ? token.substring(0, 20) + '...' : null,
    userInfoValue: userInfo ? JSON.parse(userInfo).name : null
  })
  
  // 防止重定向循环 - 更严格的检查
  if (to.path === from.path) {
    console.log('相同路径，跳过重定向')
    next()
    return
  }
  
  // 如果是从home到login的重定向，直接允许
  if (from.path === '/home' && to.path === '/login') {
    console.log('从home到login的重定向，直接允许')
    next()
    return
  }
  
  if (authRequiredPages.includes(to.path)) {
    if (!isAuthenticated) {
      console.log('未认证，重定向到登录页')
      // 使用replace避免历史记录问题
      next({ path: '/login', replace: true })
    } else {
      console.log('已认证，允许访问')
      next()
    }
  } else if (to.path === '/login' && isAuthenticated) {
    console.log('已登录用户访问登录页，重定向到首页')
    // 使用replace避免历史记录问题
    next({ path: '/home', replace: true })
  } else {
    console.log('无需认证，允许访问')
    next()
  }
})

export default router
