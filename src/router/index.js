import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import Home from '../views/Home.vue'
import ProjectSquare from '../views/ProjectSquare.vue'
import ProjectCreate from '../views/ProjectCreate.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import AIAssistant from '../views/AIAssistant.vue'
import Profile from '../views/Profile.vue'

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
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: KnowledgeBase
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
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
