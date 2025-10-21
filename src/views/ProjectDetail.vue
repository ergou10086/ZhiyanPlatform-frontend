<template>
  <div class="project-detail-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载项目详情...</p>
    </div>
    
    <!-- 主要内容 -->
    <div v-else>
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
            <span class="username">{{ getCurrentUserName() }}</span>
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
      <!-- 加载状态 -->
      <div v-if="!project" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载项目详情...</p>
      </div>
      
      <!-- 项目详情内容 -->
      <div v-if="project">
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
              <div class="meta-item" v-if="project.tags && project.tags.length > 0">
                <span class="meta-label">项目标签：</span>
                <div class="tags-container">
                  <span v-for="(tag, index) in project.tags" :key="index" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="project-actions" v-if="isProjectManager">
            <button class="btn secondary" @click="editProject">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              编辑项目
            </button>
            <div class="dropdown" @click.stop="toggleStatusDropdown">
              <button class="btn primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 15L15 8L19 12L8 23V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                更改状态
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <ul class="dropdown-menu" v-if="statusDropdownOpen">
                <li class="dropdown-item" :class="{ active: project.status === '进行中' }" @click="changeStatus('进行中')">
                  <span class="status-indicator" style="background-color: #28a745;"></span>
                  进行中
                </li>
                <li class="dropdown-item" :class="{ active: project.status === '已完成' }" @click="changeStatus('已完成')">
                  <span class="status-indicator" style="background-color: #007bff;"></span>
                  已完成
                </li>
                <li class="dropdown-item" :class="{ active: project.status === '稳健中' }" @click="changeStatus('稳健中')">
                  <span class="status-indicator" style="background-color: #ffc107;"></span>
                  稳健中
                </li>
                <li class="dropdown-item" :class="{ active: project.status === '暂停' }" @click="changeStatus('暂停')">
                  <span class="status-indicator" style="background-color: #6c757d;"></span>
                  暂停
                </li>
              </ul>
            </div>
            <button class="btn btn-danger" @click="deleteProject">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              删除项目
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
            <button v-if="isProjectManager" class="btn primary" @click="createTask">新建任务</button>
          </div>
        </div>
        <div class="task-grid">
          <div v-for="task in filteredTasks" :key="task.id" class="task-card">
            <div class="task-header">
              <div class="task-priority" :class="priorityClass(task.priority)">{{ task.priority }}</div>
              <div class="task-actions" v-if="isProjectManager">
                <div class="task-status-dropdown">
                  <button class="task-status-btn" @click="toggleTaskStatusDropdown(task)" :class="statusClass(task.status)" title="更改状态">
                    {{ task.status }}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <div class="task-status-menu" v-if="task.showStatusMenu">
                    <button @click="changeTaskStatus(task, '待接取')" class="status-option" :class="{ active: task.status === '待接取' }">待接取</button>
                    <button @click="changeTaskStatus(task, '进行中')" class="status-option" :class="{ active: task.status === '进行中' }">进行中</button>
                    <button @click="changeTaskStatus(task, '暂停')" class="status-option" :class="{ active: task.status === '暂停' }">暂停</button>
                    <button @click="changeTaskStatus(task, '完成')" class="status-option" :class="{ active: task.status === '完成' }">完成</button>
                  </div>
                </div>
                <button class="task-edit-btn" @click="editTask(task)" title="编辑任务">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="task-delete-btn" @click="deleteTask(task.id)" title="删除任务">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="task-content">
              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-description">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-date" v-if="task.date">{{ task.date }}</span>
                <span class="task-creator">创建人: {{ task.created_by_name }}</span>
                <span v-if="task.assignee_name" class="task-assignee">
                  负责人: {{ task.assignee_name }}
                </span>
              </div>
            </div>
            <div v-if="task.status === '待接取'" class="task-assign-section">
              <button @click="assignTask(task)" class="assign-btn">接取任务</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 团队成员 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">团队成员</h2>
          <div class="section-actions" v-if="isProjectManager">
            <button class="btn secondary" @click="addTeamMember">添加成员</button>
            <button class="btn primary" @click="inviteMember">邀请成员</button>
          </div>
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
            <button v-if="isProjectManager" class="remove-member-btn" @click="removeTeamMember(member.id)" title="移除成员">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
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
            <button v-if="isProjectManager" class="remove-member-btn" @click="removeInviteSlot(invite.id)" title="取消邀请">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- 新建任务模态框 -->
    <div v-if="taskModalOpen" class="modal-overlay" @click="closeTaskModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">新建任务</h3>
          <button class="modal-close" @click="closeTaskModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-field">
            <label class="form-label">任务标题</label>
            <input 
              v-model="newTask.title" 
              type="text" 
              class="form-input" 
              placeholder="请输入任务标题"
              maxlength="50"
            />
          </div>
          
          <div class="form-field">
            <label class="form-label">任务描述</label>
            <textarea 
              v-model="newTask.description" 
              class="form-textarea" 
              placeholder="请输入任务描述"
              rows="3"
              maxlength="200"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">截止日期</label>
              <input 
                v-model="newTask.dueDate" 
                type="date" 
                class="form-input"
              />
            </div>
            
            <div class="form-field">
              <label class="form-label">优先级</label>
              <select v-model="newTask.priority" class="form-select">
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="closeTaskModal" class="btn btn-secondary">取消</button>
          <button type="button" @click="saveNewTask" class="btn btn-primary" :disabled="!newTask.title.trim()">
            创建任务
          </button>
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
      statusDropdownOpen: false,
      taskModalOpen: false,
      newTask: {
        title: '',
        description: '',
        dueDate: '',
        priority: '中',
        status: '待接取'
      },
      project: null,
      tasks: [],
      teamMembers: [],
      inviteSlots: [],
      isLoading: true
    }
  },
  computed: {
    filteredTasks() {
      if (!this.selectedTaskType) return this.tasks
      return this.tasks.filter(task => task.priority === this.selectedTaskType)
    },
    isProjectManager() {
      // 判断当前用户是否是项目负责人
      const currentUserName = this.getCurrentUserName()
      return this.project && this.project.manager === currentUserName
    }
  },
  mounted() {
    this.loadUserAvatar()
    this.loadProject()
    document.addEventListener('click', this.handleClickOutside)
    // 监听用户信息更新事件
    this.$root.$on('userInfoUpdated', this.loadUserAvatar)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$root.$off('userInfoUpdated', this.loadUserAvatar)
  },
  methods: {
    loadProject() {
      const projectId = parseInt(this.$route.params.id)
      console.log('正在加载项目ID:', projectId)
      
      // 从localStorage加载项目数据
      const savedProjects = localStorage.getItem('projects')
      console.log('localStorage中的项目数据:', savedProjects)
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const foundProject = projects.find(p => p.id === projectId)
        
        if (foundProject) {
          console.log('找到的项目数据:', foundProject)
          
          // 将项目广场的数据格式转换为详情页面的格式
          this.project = {
            id: foundProject.id,
            name: foundProject.name || foundProject.title, // 添加数据库字段名
            title: foundProject.title,
            description: foundProject.description || foundProject.dataAssets || foundProject.direction || '暂无描述',
            period: (foundProject.start_date || foundProject.startDate) && (foundProject.end_date || foundProject.endDate) ? 
              `${foundProject.start_date || foundProject.startDate} 至 ${foundProject.end_date || foundProject.endDate}` : 
              '2024-01-01 至 2024-12-31',
            status: foundProject.status,
            visibility: foundProject.visibility || 'PRIVATE', // 添加可见性字段
            manager: this.getCurrentUserName(), // 从用户信息获取负责人
            teamSize: foundProject.teamSize,
            category: foundProject.category,
            aiCore: foundProject.aiCore,
            tags: foundProject.tags || [],
            tasks: foundProject.tasks || [],
            created_by: foundProject.created_by || 1 // 添加创建人字段
          }
          
          console.log('项目周期:', foundProject.startDate, foundProject.endDate)
          console.log('项目任务:', foundProject.tasks)
          
          // 加载项目任务数据，转换数据格式
          this.tasks = (foundProject.tasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            date: task.due_date || task.dueDate || task.date || '',
            due_date: task.due_date || task.dueDate, // 添加数据库字段名
            priority: this.getPriorityDisplay(task.priority || 'MEDIUM'), // 转换为中文显示
            priority_value: task.priority || 'MEDIUM', // 保留数据库值
            status: this.getStatusDisplay(task.status_value || task.status || 'IN_PROGRESS'), // 优先使用status_value，转换为中文状态显示
            status_value: task.status_value || task.status || 'IN_PROGRESS', // 保留数据库值
            assignee_id: task.assignee_id || [], // 添加负责人ID字段
            created_by: task.created_by || 1, // 添加创建人字段
            created_by_name: this.getUserNameById(task.created_by || 1) // 添加创建人姓名
          }))
          
          console.log('转换后的任务数据:', this.tasks)
          if (this.tasks.length > 0) {
            console.log('第一个任务的优先级:', this.tasks[0].priority)
            console.log('第一个任务的状态:', this.tasks[0].status)
            console.log('第一个任务的状态值:', this.tasks[0].status_value)
            console.log('优先级类名:', this.priorityClass(this.tasks[0].priority))
            console.log('状态类名:', this.statusClass(this.tasks[0].status))
            
            // 调试：显示所有任务的原始状态和转换后状态
            console.log('所有任务状态转换详情:')
            this.tasks.forEach((task, index) => {
              console.log(`任务 ${index + 1}: ${task.title}`)
              console.log(`  原始状态: ${foundProject.tasks[index]?.status}`)
              console.log(`  原始状态值: ${foundProject.tasks[index]?.status_value}`)
              console.log(`  转换后状态: ${task.status}`)
              console.log(`  转换后状态值: ${task.status_value}`)
            })
          }
          
          // 加载团队成员数据
          this.teamMembers = foundProject.teamMembers || [
            { id: 1, name: this.getCurrentUserName(), role: '项目负责人', avatar: null }
          ]
          this.inviteSlots = foundProject.inviteSlots || []
          
        } else {
          console.log('未找到项目，ID:', projectId)
          this.project = {
            id: projectId,
            title: '项目不存在',
            description: '抱歉，未找到指定的项目',
            period: '未知',
            status: '未知',
            manager: '未知'
          }
        }
      } else {
        console.log('localStorage中没有项目数据')
        this.project = {
          id: projectId,
          title: '项目不存在',
          description: '抱歉，未找到指定的项目',
          period: '未知',
          status: '未知',
          manager: '未知'
        }
      }
      
      // 加载完成
      this.isLoading = false
      console.log('项目加载完成，project:', this.project)
    },
    goBack() {
      this.$router.go(-1)
    },
    addTeamMember() {
      const name = prompt('请输入成员姓名:')
      if (name && name.trim()) {
        const role = prompt('请输入成员角色:')
        const newMember = {
          id: Date.now(),
          name: name.trim(),
          role: role ? role.trim() : '团队成员',
          avatar: null
        }
        this.teamMembers.push(newMember)
        this.saveProjectData()
        alert('成员添加成功！')
      }
    },
    inviteMember() {
      const role = prompt('请输入邀请的角色:')
      if (role && role.trim()) {
        const newInvite = {
          id: Date.now(),
          role: role.trim()
        }
        this.inviteSlots.push(newInvite)
        this.saveProjectData()
        alert('邀请已发送！')
      }
    },
    removeTeamMember(memberId) {
      if (confirm('确定要移除此成员吗？')) {
        this.teamMembers = this.teamMembers.filter(m => m.id !== memberId)
        this.saveProjectData()
      }
    },
    removeInviteSlot(slotId) {
      if (confirm('确定要取消此邀请吗？')) {
        this.inviteSlots = this.inviteSlots.filter(s => s.id !== slotId)
        this.saveProjectData()
      }
    },
    saveProjectData() {
      // 保存项目数据到localStorage
      const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
      const projectIndex = savedProjects.findIndex(p => p.id === this.project.id)
      if (projectIndex !== -1) {
        savedProjects[projectIndex].teamMembers = this.teamMembers
        savedProjects[projectIndex].inviteSlots = this.inviteSlots
        savedProjects[projectIndex].tasks = this.tasks
        savedProjects[projectIndex].status = this.project.status
        localStorage.setItem('projects', JSON.stringify(savedProjects))
        
        console.log('项目数据已保存到localStorage')
        console.log('保存的任务数据:', this.tasks.map(t => ({ title: t.title, status: t.status, status_value: t.status_value })))
      } else {
        console.log('未找到项目，无法保存数据')
      }
    },
    // 项目操作按钮功能
    editProject() {
      alert('编辑项目功能正在开发中，敬请期待！')
    },
    changeStatus(newStatus) {
      // 更改项目状态
      if (newStatus && newStatus !== this.project.status) {
        this.project.status = newStatus
        this.saveProjectData()
        this.statusDropdownOpen = false
        console.log('项目状态已更改为:', newStatus)
      }
    },
    deleteProject() {
      if (confirm('确定要删除此项目吗？\n\n此操作不可撤销！项目及其所有数据将被永久删除。')) {
        // 从localStorage中删除项目
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
        const updatedProjects = savedProjects.filter(p => p.id !== this.project.id)
        localStorage.setItem('projects', JSON.stringify(updatedProjects))
        
        alert('项目已删除！')
        this.$router.push('/project-square')
      }
    },
    // 任务操作功能
    createTask() {
      this.taskModalOpen = true
      // 重置表单
      this.newTask = {
        title: '',
        description: '',
        dueDate: '',
        priority: '中'
      }
    },
    closeTaskModal() {
      this.taskModalOpen = false
    },
    saveNewTask() {
      if (!this.newTask.title.trim()) {
        alert('请输入任务标题')
        return
      }
      
      const task = {
        id: Date.now(),
        title: this.newTask.title.trim(),
        description: this.newTask.description.trim(),
        date: this.newTask.dueDate || '',
        due_date: this.newTask.dueDate, // 添加数据库字段名
        dueDate: this.newTask.dueDate, // 保留前端字段名
        priority: this.getPriorityDisplay(this.getPriorityValue(this.newTask.priority)), // 显示中文
        priority_value: this.getPriorityValue(this.newTask.priority), // 保存数据库值
        status: '待接取', // 新任务默认为待接取状态
        status_value: 'PENDING', // 数据库状态值
        assignee_id: [], // 添加负责人ID字段
        created_by: 1, // 添加创建人字段
        created_by_name: this.getCurrentUserName() // 添加创建人姓名
      }
      
      this.tasks.push(task)
      this.saveProjectData()
      this.closeTaskModal()
      alert('任务创建成功！')
    },
    editTask(task) {
      const newTitle = prompt('编辑任务标题:', task.title)
      if (newTitle !== null) {
        const newDescription = prompt('编辑任务描述:', task.description)
        const newDate = prompt('编辑截止日期:', task.date)
        const newPriority = prompt('编辑优先级 (高/中/低):', task.priority)
        
        task.title = newTitle.trim()
        task.description = newDescription ? newDescription.trim() : task.description
        task.date = newDate || task.date
        task.priority = newPriority || task.priority
        
        this.saveProjectData()
        alert('任务更新成功！')
      }
    },
    deleteTask(taskId) {
      if (confirm('确定要删除此任务吗？')) {
        this.tasks = this.tasks.filter(t => t.id !== taskId)
        this.saveProjectData()
        alert('任务已删除！')
      }
    },
    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
      if (!event.target.closest('.dropdown')) {
        this.taskTypeOpen = false
        this.statusDropdownOpen = false
      }
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    loadUserAvatar() {
      // 优先从user_info获取头像
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          if (userData.avatar) {
            this.userAvatar = userData.avatar
            return
          }
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
      
      // 如果user_info中没有头像，则从userAvatar获取
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) this.userAvatar = savedAvatar
    },
    getCurrentUserName() {
      // 从localStorage获取当前用户信息
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userInfo = JSON.parse(savedUserInfo)
          return userInfo.nickname || userInfo.name || '用户'
        } catch (error) {
          console.error('解析用户信息失败:', error)
          return '用户'
        }
      }
      return '用户'
    },
    getPriorityDisplay(priority) {
      // 将数据库的英文优先级转换为中文显示
      const priorityMap = {
        'HIGH': '高',
        'MEDIUM': '中',
        'LOW': '低'
      }
      return priorityMap[priority] || '中'
    },
    getPriorityValue(priority) {
      // 将中文优先级转换为数据库的英文值
      const valueMap = {
        '高': 'HIGH',
        '中': 'MEDIUM',
        '低': 'LOW'
      }
      return valueMap[priority] || 'MEDIUM'
    },
    getUserNameById(userId) {
      // 根据用户ID获取用户姓名
      if (userId === 1) {
        return this.getCurrentUserName()
      }
      // 这里可以从用户服务或本地存储获取用户信息
      // 暂时返回默认值
      return '用户' + userId
    },
    getStatusValue(status) {
      // 将中文状态转换为数据库的英文值
      const valueMap = {
        '待接取': 'PENDING',
        '进行中': 'IN_PROGRESS',
        '暂停': 'PAUSED',
        '完成': 'COMPLETED'
      }
      return valueMap[status] || 'PENDING'
    },
    getStatusDisplay(status) {
      // 将数据库的英文状态转换为中文显示
      const statusMap = {
        'PENDING': '待接取',
        'IN_PROGRESS': '进行中',
        'PAUSED': '暂停',
        'COMPLETED': '完成'
      }
      return statusMap[status] || '待接取'
    },
    toggleTaskStatusDropdown(task) {
      // 关闭其他任务的状态菜单
      this.tasks.forEach(t => {
        if (t.id !== task.id) {
          this.$set(t, 'showStatusMenu', false)
        }
      })
      // 切换当前任务的状态菜单
      this.$set(task, 'showStatusMenu', !task.showStatusMenu)
    },
    changeTaskStatus(task, newStatus) {
      // 更新任务状态
      task.status = newStatus
      task.status_value = this.getStatusValue(newStatus)
      // 关闭状态菜单
      this.$set(task, 'showStatusMenu', false)
      // 保存数据
      this.saveProjectData()
      console.log(`任务"${task.title}"状态已更改为: ${newStatus}`)
      console.log(`任务状态值: ${task.status}, 状态值: ${task.status_value}`)
      
      // 调试：显示当前所有任务的状态
      console.log('当前所有任务状态:', this.tasks.map(t => ({ title: t.title, status: t.status, status_value: t.status_value })))
      
      // 触发全局事件，通知其他页面状态已更新
      this.$root.$emit('taskStatusChanged', {
        projectId: this.project.id,
        taskId: task.id,
        newStatus: newStatus,
        statusValue: task.status_value
      })
    },
    assignTask(task) {
      // 接取任务
      const currentUser = this.getCurrentUserName()
      task.assignee_name = currentUser
      task.assignee_id = 1 // 假设当前用户ID为1
      task.status = '进行中'
      task.status_value = 'IN_PROGRESS'
      
      // 保存到localStorage
      this.saveProjectData()
      
      alert(`您已成功接取任务: ${task.title}`)
      console.log(`任务 ${task.title} 已被 ${currentUser} 接取`)
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
      if (status === '待接取') return '待接取'
      if (status === '进行中') return '进行中'
      if (status === '暂停') return '暂停'
      if (status === '完成') return '完成'
      return '待接取'
    },
    priorityClass(priority) {
      if (priority === '高') return '高'
      if (priority === '中') return '中'
      return '低'
    },
    toggleTaskTypeDropdown() {
      this.taskTypeOpen = !this.taskTypeOpen
    },
    toggleStatusDropdown() {
      this.statusDropdownOpen = !this.statusDropdownOpen
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #bbdefb;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 400px));
  gap: 16px;
  justify-content: start;
}

.task-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  position: relative;
}

.task-priority {
  background: #e9ecef;
  color: #6c757d;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.task-priority.高 {
  background: #dc3545 !important;
  color: white !important;
  font-weight: 600;
}

.task-priority.中 {
  background: #ffc107 !important;
  color: #333 !important;
  font-weight: 600;
}

.task-priority.低 {
  background: #28a745 !important;
  color: white !important;
  font-weight: 600;
}

.task-content {
  /* 移除padding-right，因为优先级不再绝对定位 */
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
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: #6c757d;
}

.task-creator {
  color: #007bff;
  font-weight: 500;
}

.task-assignee {
  display: block;
  margin-top: 4px;
}

.task-assign-section {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

.assign-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
}

.assign-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}


.task-status {
  background: #e9ecef;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.task-status.进行中 {
  background: #d4edda;
  color: #155724;
}

.task-status.暂停 {
  background: #f8d7da;
  color: #721c24;
}

.task-status.完成 {
  background: #d1ecf1;
  color: #0c5460;
}

.task-status-dropdown {
  position: relative;
  display: inline-block;
}

.task-status-btn {
  background: #e9ecef;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.task-status-btn:hover {
  background: #dee2e6;
}

.task-status-btn.待接取 {
  background: #6c757d !important;
  color: white !important;
  border-color: #6c757d !important;
  font-weight: 600;
}

.task-status-btn.进行中 {
  background: #007bff !important;
  color: white !important;
  border-color: #007bff !important;
  font-weight: 600;
}

.task-status-btn.暂停 {
  background: #ffc107 !important;
  color: #333 !important;
  border-color: #ffc107 !important;
  font-weight: 600;
}

.task-status-btn.完成 {
  background: #28a745 !important;
  color: white !important;
  border-color: #28a745 !important;
  font-weight: 600;
}

.task-status-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 10;
  min-width: 80px;
}

.status-option {
  display: block;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: white;
  color: #333;
  font-size: 11px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  font-weight: 500;
}

.status-option:hover {
  background: #f8f9fa;
}

.status-option.active {
  background: #007bff;
  color: white;
}

.status-option:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.status-option:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.task-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.task-edit-btn, .task-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-edit-btn {
  color: #007bff;
}

.task-edit-btn:hover {
  background: #e3f2fd;
  color: #0056b3;
}

.task-delete-btn {
  color: #dc3545;
}

.task-delete-btn:hover {
  background: #f8d7da;
  color: #721c24;
}

.task-date {
  font-size: 12px;
  color: #6c757d;
}

/* 下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 16px;
  margin: 0;
}


.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background: #c82333;
  border-color: #c82333;
}

.btn-delete-icon {
  background: transparent;
  color: #dc3545;
  border: none;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-icon:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.position-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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
  position: relative;
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

.remove-member-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #dc3545;
  opacity: 0;
  transition: all 0.3s ease;
}

.member-card:hover .remove-member-btn {
  opacity: 1;
}

.remove-member-btn:hover {
  background: #f8d7da;
  color: #721c24;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #5b6bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #6c757d;
  font-size: 16px;
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
