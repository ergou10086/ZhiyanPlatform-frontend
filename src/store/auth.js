// 简单的认证状态管理
import { authAPI } from '@/api/auth'
import { saveLoginData, clearAuthData, getCurrentUser, isLoggedIn } from '@/utils/auth'

const state = {
  user: null,
  isAuthenticated: false,
  loading: false
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  CLEAR_AUTH(state) {
    state.user = null
    state.isAuthenticated = false
  }
}

const actions = {
  // 初始化认证状态
  initAuth({ commit }) {
    const user = getCurrentUser()
    if (user && isLoggedIn()) {
      commit('SET_USER', user)
    }
  },

  // 登录
  async login({ commit }, loginData) {
    commit('SET_LOADING', true)
    try {
      const response = await authAPI.login(loginData)
      if (response.code === 200 && response.data) {
        saveLoginData(response.data)
        commit('SET_USER', response.data.userInfo)
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.msg || '登录失败' }
      }
    } catch (error) {
      return { success: false, message: error.message || '登录失败' }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 注册
  async register({ commit }, registerData) {
    commit('SET_LOADING', true)
    try {
      const response = await authAPI.register(registerData)
      if (response.code === 200) {
        return { success: true, message: '注册成功' }
      } else {
        return { success: false, message: response.msg || '注册失败' }
      }
    } catch (error) {
      return { success: false, message: error.message || '注册失败' }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 登出
  async logout({ commit }) {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        await authAPI.logout(token)
      }
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      clearAuthData()
      commit('CLEAR_AUTH')
    }
  },

  // 检查自动登录
  async checkAutoLogin({ commit }) {
    try {
      const response = await authAPI.autoLoginCheck()
      if (response.code === 200 && response.data && response.data.valid) {
        // 可以自动登录，获取用户信息
        const user = getCurrentUser()
        if (user) {
          commit('SET_USER', user)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('自动登录检查失败:', error)
      return false
    }
  }
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  currentUser: state => state.user,
  isLoading: state => state.loading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
