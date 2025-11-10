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
        // RememberMe token有效，需要获取新的accessToken和refreshToken
        // 方法1: 使用refreshToken（如果存在）
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          try {
            const refreshResponse = await authAPI.refreshToken(refreshToken)
            if (refreshResponse.code === 200 && refreshResponse.data) {
              // 保存新的token和用户信息
              saveLoginData({
                accessToken: refreshResponse.data.accessToken,
                refreshToken: refreshResponse.data.refreshToken,
                userInfo: refreshResponse.data.user
              })
              commit('SET_USER', refreshResponse.data.user)
              console.log('✅ 通过RefreshToken自动登录成功')
              return true
            }
          } catch (refreshError) {
            console.warn('RefreshToken已过期，尝试其他方法:', refreshError)
          }
        }
        
        // 方法2: 如果有remember_me_token但没有refreshToken，需要重新登录
        // 注意：这里不能直接调用登录接口，因为需要密码
        // 所以只能提示用户重新登录
        console.warn('⚠️ RememberMe token有效，但RefreshToken已过期，需要重新登录')
        return false
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
