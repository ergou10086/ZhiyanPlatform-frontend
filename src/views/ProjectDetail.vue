<template>
  <div class="project-detail-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">项目详情</span>
      </div>
      <div class="header-right">
        <nav class="breadcrumb">
          <a class="breadcrumb-link" @click.prevent="$router.push('/home')">首页</a>
          <span class="breadcrumb-sep">/</span>
          <a class="breadcrumb-link" @click.prevent="$router.push('/project-square')">项目广场</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">项目详情</span>
        </nav>
        <div class="user-area">
          <div class="user-profile" @click="toggleUserMenu">
            <div class="user-avatar">
              <img v-if="userAvatar" :src="userAvatar" alt="用户头像" />
              <div v-else class="avatar-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span class="username">张伟</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotate': userMenuOpen }">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="user-menu" v-if="userMenuOpen">
            <div class="menu-item" @click="goToProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              个人信息
            </div>
            <div class="menu-item" @click="logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              退出登录
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 项目信息卡片 -->
      <div class="project-card">
        <div class="project-header">
          <div class="project-info">
            <h1 class="project-title">{{ project.title }}</h1>
            <div class="project-meta">
              <div class="meta-item">
                <span class="meta-label">项目简介：</span>
                <span class="meta-value">{{ project.description }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">项目周期：</span>
                <span class="meta-value">{{ project.period }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">当前状态：</span>
                <span class="status-badge" :class="statusClass(project.status)">{{ project.status }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">负责人：</span>
                <span class="meta-value">{{ project.manager }}</span>
              </div>
            </div>
          </div>
          <div class="project-actions">
            <button class="btn secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              编辑项目
            </button>
            <button class="btn primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 15L15 8L19 12L8 23V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              更改状态
            </button>
            <button class="btn secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 5H20C20.5304 5 21.0391 5.21071 21.4142 5.58579C21.7893 5.96086 22 6.46957 22 7V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              存档项目
            </button>
          </div>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">任务列表</h2>
          <div class="section-actions">
            <div class="dropdown" @click.stop="toggleTaskTypeDropdown">
              <button class="btn secondary">
                <span>所有类型</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <ul class="dropdown-menu" v-if="taskTypeOpen">
                <li class="dropdown-item" :class="{ active: selectedTaskType === '' }" @click="selectTaskType('')">所有类型</li>
                <li class="dropdown-item" :class="{ active: selectedTaskType === '高' }" @click="selectTaskType('高')">高优先级</li>
                <li class="dropdown-item" :class="{ active: selectedTaskType === '中' }" @click="selectTaskType('中')">中优先级</li>
                <li class="dropdown-item" :class="{ active: selectedTaskType === '低' }" @click="selectTaskType('低')">低优先级</li>
              </ul>
            </div>
            <button class="btn primary">新建任务</button>
          </div>
        </div>
        <div class="task-grid">
          <div v-for="task in filteredTasks" :key="task.id" class="task-card">
            <div class="task-priority" :class="priorityClass(task.priority)">{{ task.priority }}</div>
            <div class="task-content">
              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-description">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-date">{{ task.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 团队成员 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">团队成员</h2>
          <button class="btn primary">邀请成员</button>
        </div>
        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.id" class="member-card">
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
              <div v-else class="avatar-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="member-info">
              <h4 class="member-name">{{ member.name }}</h4>
              <p class="member-role">{{ member.role }}</p>
            </div>
          </div>
          <!-- 邀请成员占位符 -->
          <div v-for="invite in inviteSlots" :key="invite.id" class="member-card invite-card">
            <div class="member-avatar">
              <div class="avatar-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="member-info">
              <h4 class="member-name">{{ invite.role }}</h4>
              <p class="member-role">待邀请</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectDetail',
  data() {
    return {
      userMenuOpen: false,
      userAvatar: null,
      taskTypeOpen: false,
      selectedTaskType: '',
      project: {
        id: 1,
        title: '新型纳米材料在癌症治疗中的应用研究',
        description: '探索新型纳米材料在靶向癌症治疗中的潜力，通过实验验证其生物相容性和治疗效果',
        period: '2023-06-01 至 2023-12-31',
        status: '进行中',
        manager: '张伟'
      },
      tasks: [
        {
          id: 1,
          title: '文献综述与理论框架构建',
          description: '收集并分析相关领域最新研究成果，建立理论分析框架',
          date: '2023-07-15',
          priority: '高'
        },
        {
          id: 2,
          title: '实验方案设计',
          description: '制定详细的实验计划和操作规程',
          date: '2023-08-30',
          priority: '中'
        },
        {
          id: 3,
          title: '纳米材料合成',
          description: '按照设计方案进行纳米材料的实验室合成',
          date: '2023-07-30',
          priority: '高'
        },
        {
          id: 4,
          title: '细胞实验与数据分析',
          description: '开展体外细胞实验，收集并分析实验数据',
          date: '2023-11-15',
          priority: '高'
        }
      ],
      teamMembers: [
        { id: 1, name: '张伟', role: '项目负责人', avatar: null },
        { id: 2, name: '李娜', role: '生物医学研究员', avatar: null },
        { id: 3, name: '王强', role: '材料科学专家', avatar: null },
        { id: 4, name: '陈美玲', role: '数据分析师', avatar: null }
      ],
      inviteSlots: [
        { id: 1, role: '临床试验协调员' },
        { id: 2, role: '生物统计学家' }
      ]
    }
  },
  computed: {
    filteredTasks() {
      if (!this.selectedTaskType) return this.tasks
      return this.tasks.filter(task => task.priority === this.selectedTaskType)
    }
  },
  mounted() {
    this.loadUserAvatar()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
      if (!event.target.closest('.dropdown')) {
        this.taskTypeOpen = false
      }
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    loadUserAvatar() {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) this.userAvatar = savedAvatar
    },
    goToProfile() {
      this.userMenuOpen = false
      this.$router.push('/profile')
    },
    logout() {
      this.userMenuOpen = false
      alert('退出登录成功！')
      this.$router.push('/login')
    },
    statusClass(status) {
      if (status === '进行中') return 'ongoing'
      if (status === '已完成') return 'done'
      return 'steady'
    },
    priorityClass(priority) {
      if (priority === '高') return 'high'
      if (priority === '中') return 'medium'
      return 'low'
    },
    toggleTaskTypeDropdown() {
      this.taskTypeOpen = !this.taskTypeOpen
    },
    selectTaskType(type) {
      this.selectedTaskType = type
      this.taskTypeOpen = false
    }
  }
}
</script>

<style scoped>
.project-detail-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #f8f9fa;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
}

.breadcrumb-link {
  color: #6c757d;
  cursor: pointer;
}

.breadcrumb-link:hover {
  color: #343a40;
}

.breadcrumb-sep {
  color: #adb5bd;
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

.rotate {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.user-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid #e9ecef;
  min-width: 160px;
  z-index: 100;
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

.main-content {
  flex: 1;
  padding: 20px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.project-info {
  flex: 1;
}

.project-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  color: #6c757d;
  font-size: 14px;
  min-width: 80px;
}

.meta-value {
  color: #333;
  font-size: 14px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  border: 1px solid transparent;
}

.status-badge.ongoing {
  background: #fff3cd;
  color: #cc9a06;
  border-color: #ffe69c;
}

.status-badge.done {
  background: #e2f7e2;
  color: #1f7a1f;
  border-color: #bfeabd;
}

.status-badge.steady {
  background: #e8f3ff;
  color: #2c6df2;
  border-color: #cfe2ff;
}

.project-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.section-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #f8f9fa;
}

.btn.primary {
  background: #5b6bff;
  border-color: #5b6bff;
  color: #fff;
}

.btn.primary:hover {
  background: #4c5ce6;
}

.btn.secondary {
  background: #f8f9ff;
  border-color: #e0e0e0;
}

.btn.secondary:hover {
  background: #eef1ff;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 120px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  z-index: 10;
}

.dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.active {
  color: #5b6bff;
  background: #eef1ff;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.task-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  position: relative;
}

.task-priority {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.task-priority.high {
  background: #dc3545;
}

.task-priority.medium {
  background: #ffc107;
  color: #333;
}

.task-priority.low {
  background: #28a745;
}

.task-content {
  padding-right: 40px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.task-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-date {
  font-size: 12px;
  color: #6c757d;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.member-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-card.invite-card {
  border-style: dashed;
  border-color: #adb5bd;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.member-role {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
}

@media (max-width: 768px) {
  .project-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .project-actions {
    justify-content: flex-start;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .section-actions {
    justify-content: flex-start;
  }
}
</style>
