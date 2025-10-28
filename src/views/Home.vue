<template>
  <div class="home-container">
    <!-- 侧边栏 -->
    <Sidebar :isOpen="sidebarOpen" @close="closeSidebar" />

     <!-- 顶部导航栏 -->
     <div class="top-header">
       <div class="header-left">
         <button class="menu-btn" @click="toggleSidebar">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>
         </button>
         <span class="page-title">首页</span>
       </div>
     </div>

    <!-- 顶部图片区域 -->
    <div class="header-image">
      <img :src="headerImage" alt="Header Image" />
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧内容 -->
      <div class="content-left">
        <!-- 快捷操作 -->
        <div class="quick-actions">
          <div class="section-card">
            <h2 class="section-title">快捷操作</h2>
            <div class="action-cards">
            <div class="action-card" @click="handleNewProject">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="card-label">新建项目</span>
            </div>
            <div class="action-card" @click="handleProjectSquare">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8.5" cy="7.5" r="2.5" stroke="currentColor" stroke-width="2"/>
                  <path d="M20 8V6C20 4.93913 19.5786 3.92172 18.8284 3.17157C18.0783 2.42143 17.0609 2 16 2H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="card-label">项目广场</span>
            </div>
            <div class="action-card" @click="handleKnowledgeBase">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 9H15V15H9V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="card-label">知识库</span>
            </div>
            <div class="action-card" @click="handleAIAssistant">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="card-label">AI实验分析助手</span>
            </div>
            </div>
          </div>
        </div>

        <!-- 工作项和我参与的项目布局 -->
        <div class="work-items-container">
          <!-- 工作项 -->
          <div class="work-items">
            <div class="section-card">
              <div class="section-header">
                <h2 class="section-title">工作项</h2>
              </div>
              <div class="work-item-list">
              <div class="work-item high-priority">
                <div class="priority-bar"></div>
                <div class="item-content">
                  <h3 class="item-title">智能推荐系统优化</h3>
                  <p class="item-description">重构推荐算法模块,提升准确率</p>
                  <div class="item-meta">
                    <span class="priority">高优先级</span>
                    <span class="deadline">截止:2023-06-15</span>
                  </div>
                </div>
              </div>
              <div class="work-item medium-priority">
                <div class="priority-bar"></div>
                <div class="item-content">
                  <h3 class="item-title">用户界面改版</h3>
                  <p class="item-description">重新设计用户交互流程</p>
                  <div class="item-meta">
                    <span class="priority">中优先级</span>
                    <span class="deadline">截止:2023-06-20</span>
                  </div>
                </div>
              </div>
              <div class="work-item low-priority">
                <div class="priority-bar"></div>
                <div class="item-content">
                  <h3 class="item-title">数据库性能优化</h3>
                  <p class="item-description">优化查询索引,提升响应速度</p>
                  <div class="item-meta">
                    <span class="priority">低优先级</span>
                    <span class="deadline">截止:2023-06-30</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          <!-- 我参与的项目 -->
          <div class="my-projects">
            <div class="section-card">
              <div class="section-header">
                <h2 class="section-title">我参与的项目</h2>
              </div>
              <div class="project-list">
                <div
                  v-for="project in userProjects"
                  :key="project.id"
                  class="project-item"
                  @click="goToProjectDetail(project.id)"
                >
                  <div class="project-avatar">
                    <div class="avatar-icon">{{ project.title.charAt(0) }}</div>
                  </div>
                  <div class="project-info">
                    <h3 class="project-name">{{ project.title }}</h3>
                    <p class="project-description">{{ project.description }}</p>
                    <div class="project-meta">
                      <span class="project-status" :class="project.statusClass">{{ project.status }}</span>
                      <span class="project-progress">{{ project.progress }}% 完成</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <RightSidebar />
    </div>

    <!-- 自定义弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>需要登录</h3>
          <button @click="closeModal" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="modal-btn modal-btn-cancel">取消</button>
          <button @click="goToLogin" class="modal-btn modal-btn-confirm">去登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import { authAPI } from '@/api/auth'
import headerImage from '@/assets/image/colourfulegg.jpg'

export default {
  name: 'Home',
  components: {
    Sidebar,
    RightSidebar
  },
  data() {
    return {
      sidebarOpen: false,
      userMenuOpen: false,
      userAvatar: null, // 用户头像URL，可以从localStorage或API获取
      headerImage, // 导入的头图
      globalUserInfo: {
        nickname: '张伟',
        avatar: ''
      },
      showModal: false,
      modalMessage: '',
      userProjects: [
        {
          id: 1,
          title: '量子计算算法优化研究',
          description: '量子计算算法优化研究',
          status: '进行中',
          statusClass: 'status-ongoing',
          progress: 65
        },
        {
          id: 2,
          title: '多模态医学影像数据平台',
          description: '多模态医学影像数据平台',
          status: '规划中',
          statusClass: 'status-planning',
          progress: 45
        },
        {
          id: 3,
          title: '气候变化预测模型研究',
          description: '气候变化预测模型研究',
          status: '已完成',
          statusClass: 'status-completed',
          progress: 100
        }
      ]
    }
  },
  mounted() {
    // 页面加载时尝试获取用户头像
    this.loadUserAvatar()

    // 加载全局用户信息
    this.loadGlobalUserInfo()

    // 添加点击外部关闭菜单的事件监听
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    loadUserAvatar() {
      // 从localStorage或API获取用户头像
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        this.userAvatar = savedAvatar
      }
    },
    loadGlobalUserInfo() {
      // 从localStorage加载全局用户信息
      const savedUserInfo = localStorage.getItem('globalUserInfo')
      if (savedUserInfo) {
        this.globalUserInfo = JSON.parse(savedUserInfo)
      }
    },
    setUserAvatar(avatarUrl) {
      // 设置用户头像的方法
      this.userAvatar = avatarUrl
      localStorage.setItem('userAvatar', avatarUrl)
    },
    handleClickOutside(event) {
      // 如果点击的不是用户菜单相关元素，则关闭菜单
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
    },
    toggleUserMenu() {
      console.log('点击用户菜单，当前状态:', this.userMenuOpen)
      this.userMenuOpen = !this.userMenuOpen
      console.log('切换后状态:', this.userMenuOpen)
    },
    goToProfile() {
      console.log('跳转到个人信息页面')
      this.userMenuOpen = false
      this.$router.push('/profile')
    },
    async logout() {
      console.log('退出登录')
      this.userMenuOpen = false

      try {
        // 获取当前token
        const token = localStorage.getItem('access_token')
        if (token) {
          // 调用后端登出接口
          await authAPI.logout(token)
          console.log('后端登出成功')
        }
      } catch (error) {
        console.error('后端登出失败:', error)
        // 即使后端登出失败，也要清除前端数据
      }

      // 清除前端认证数据
      this.clearAuthData()
      console.log('前端数据已清除')

      // 显示成功消息
      alert('退出登录成功！')

      // 使用setTimeout确保数据清除完成后再跳转
      setTimeout(() => {
        console.log('准备跳转到登录页面')
        window.location.href = '/login'
      }, 100)
    },
    clearAuthData() {
      // 清除所有认证相关的本地存储
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('remember_me_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('userAvatar')
      localStorage.removeItem('globalUserInfo')

      // 清除组件状态
      this.userAvatar = null
      this.globalUserInfo = {
        nickname: '',
        avatar: ''
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    handleNewProject() {
      console.log('新建项目')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)

      if (isAuthenticated) {
        this.$router.push({ path: '/project-create', query: { from: 'home' } })
      } else {
        this.showLoginModal('请先登录才能创建项目')
      }
    },
    handleProjectSquare() {
      console.log('项目广场')
      this.$router.push('/project-square')
    },
    goToProjectDetail(projectId) {
      console.log('跳转到项目详情:', projectId)
      this.$router.push(`/project-detail/${projectId}`)
    },
    handleKnowledgeBase() {
      console.log('知识库')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)

      if (isAuthenticated) {
        this.$router.push('/knowledge-base')
      } else {
        this.showLoginModal('请先登录才能访问知识库')
      }
    },
    handleAIAssistant() {
      console.log('AI实验分析助手')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)

      if (isAuthenticated) {
        this.$router.push('/ai-assistant')
      } else {
        this.showLoginModal('请先登录才能访问AI助手')
      }
    },
    showLoginModal(message) {
      this.modalMessage = message
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.modalMessage = ''
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  height: 64px;
  padding: 0 var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transform: scale(1.05);
}

.page-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-profile:hover {
  background-color: #f8f9fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.username {
  font-weight: 500;
  color: #333;
}

.user-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e9ecef;
  min-width: 160px;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  color: #333;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.menu-item svg {
  color: #666;
}

.rotate {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.header-image {
  width: 100%;
  height: 100px;
  overflow: hidden;
  position: relative;
  z-index: 999; /* 在页眉(z-index: 1000)后面 */
  margin-top: 64px; /* 位于页眉下方 */
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.main-content {
  flex: 1;
  margin-top: 164px; /* 64px页眉 + 100px图片 */
  display: flex;
  gap: var(--space-6);
  padding: var(--space-6);
  transform: scale(0.9);
  transform-origin: top left;
  width: calc(100% / 0.9); /* 补偿缩放，使其视觉上占据100%宽度 */
}

.content-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  transition: all var(--transition-normal);
}

.section-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-5) 0;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.more-btn:hover {
  background-color: #f8f9fa;
}

.action-cards {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.action-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 120px;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color), var(--success-color));
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.action-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.action-card:hover::before {
  transform: scaleX(1);
}

.card-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-light), var(--info-light));
  border-radius: var(--radius-xl);
  color: var(--primary-color);
  transition: all var(--transition-normal);
}

.action-card:hover .card-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-inverse);
  transform: scale(1.1);
}

.card-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  transition: color var(--transition-normal);
}

.action-card:hover .card-label {
  color: var(--primary-color);
}

/* 工作项和项目容器布局 */
.work-items-container {
  display: flex;
  gap: var(--space-6);
  align-items: stretch; /* 拉伸对齐 */
}

.work-items {
  flex: 0 0 60%; /* 占据60%宽度 */
  display: flex;
  flex-direction: column;
}

.work-items .section-card {
  flex: 1; /* 使工作项卡片占满容器高度 */
  display: flex;
  flex-direction: column;
}

.my-projects {
  flex: 1; /* 占据剩余40%宽度 */
  display: flex;
  flex-direction: column;
}

.my-projects .section-card {
  flex: 1; /* 使项目卡片占满容器高度 */
  display: flex;
  flex-direction: column;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.project-item {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  gap: var(--space-3);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.project-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
  border-color: var(--primary-color);
}

.project-avatar {
  flex-shrink: 0;
}

.avatar-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.project-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--leading-relaxed);
}

.project-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  align-items: center;
}

.project-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 11px;
}

.status-ongoing {
  background: var(--primary-light);
  color: var(--primary-color);
}

.status-planning {
  background: var(--warning-light);
  color: var(--warning-color);
}

.status-completed {
  background: var(--success-light);
  color: var(--success-color);
}

.project-progress {
  color: var(--text-secondary);
}

.work-item-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.work-item {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  gap: var(--space-4);
  border-left: 4px solid;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-primary);
}

.work-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.work-item.high-priority {
  border-left-color: var(--error-color);
  background: linear-gradient(135deg, var(--bg-primary), var(--error-light));
}

.work-item.medium-priority {
  border-left-color: var(--warning-color);
  background: linear-gradient(135deg, var(--bg-primary), var(--warning-light));
}

.work-item.low-priority {
  border-left-color: var(--success-color);
  background: linear-gradient(135deg, var(--bg-primary), var(--success-light));
}

.priority-bar {
  width: 4px;
  background: currentColor;
  border-radius: 2px;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.item-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--leading-relaxed);
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.priority {
  font-weight: 500;
}

.deadline {
  color: #666;
}


@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .action-cards {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
    gap: 20px;
  }

  .action-cards {
    flex-direction: column;
  }

  .action-card {
    min-width: auto;
  }
}

/* 自定义弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0;
  font-size: 16px;
  color: #374151;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn-cancel:hover {
  background: #e5e7eb;
}

.modal-btn-confirm {
  background: #3b82f6;
  color: white;
}

.modal-btn-confirm:hover {
  background: #2563eb;
}
</style>
