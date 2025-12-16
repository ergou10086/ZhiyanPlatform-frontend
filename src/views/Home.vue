<template>
  <div class="home-container">
    <!-- OAuth2授权成功提示 -->
    <transition name="fade">
      <div v-if="showOAuth2SuccessToast" class="oauth2-success-toast">
        ✓ 授权登录成功
      </div>
    </transition>

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
       <!-- header-right 已移除，切换按钮现在在 GlobalUserProfile 组件内部 -->
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 快捷操作 - 独立顶部一行 -->
        <div class="quick-actions">
          <div class="section-card">
            <h2 class="section-title">快捷操作</h2>
            <div class="action-cards">
            <div class="action-card" @click="handleMyActivity">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 3V8H15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="card-label">我的活动</span>
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

      <!-- 工作项、我参与的项目、日历 - 三列布局在同一行 -->
      <div class="three-column-row">
        <!-- 工作项 -->
        <div class="work-items">
          <div class="section-card">
            <div class="section-header">
              <h2 class="section-title">工作项</h2>
            </div>
            <div v-if="isLoadingTasks" class="loading-tasks">
              <p>正在加载任务...</p>
            </div>
            <div v-else class="work-item-list">
              <div 
                v-for="task in myTasks" 
                :key="task.id" 
                :class="['work-item', `${task.priority}-priority`]"
                @click="openTaskDetailModal(task)"
                style="cursor: pointer;"
              >
              <div class="priority-bar"></div>
              <div class="item-content">
                  <div class="item-header">
                    <h3 class="item-title">{{ task.title }}</h3>
                    <!-- 被打回标识 -->
                    <div v-if="task.isRejected" class="rejected-badge" title="任务提交已被打回">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <span class="alert-text">已打回</span>
                    </div>
                    <!-- 临近截止警示图标 -->
                    <div v-else-if="isOverdue(task.dueDate)" class="deadline-alert overdue" title="任务已逾期">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="alert-text">已逾期</span>
                    </div>
                    <div v-else-if="isNearDeadline(task.dueDate)" class="deadline-alert near" title="即将到期">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="alert-text">即将到期</span>
                    </div>
                  </div>
                  <p class="item-description">{{ task.description || '暂无描述' }}</p>
                <div class="item-meta">
                    <span class="priority">{{ getPriorityText(task.priority) }}</span>
                    <span class="deadline">{{ formatDate(task.dueDate) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 如果没有任务，显示提示 -->
              <div v-if="myTasks.length === 0" class="no-tasks">
                <p>暂无工作项</p>
              </div>
            </div>
                </div>
              </div>

        <!-- 我参与的项目 -->
        <div class="my-projects">
          <div class="section-card">
            <h2 class="section-title">我参与的项目</h2>
            <div v-if="isLoadingProjects" class="loading-projects">
              <p>正在加载项目...</p>
            </div>
            <div v-else class="project-list">
              <div 
                v-for="project in myProjects" 
                :key="project.id" 
                class="project-card"
                @click="goToProjectDetail(project.id)"
              >
                <div class="project-icon blue-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="project-content">
                  <h3 class="project-title">{{ project.title }}</h3>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-meta">
                    <span :class="['status-badge', `status-${project.status}`]">{{ getProjectStatusText(project.status) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 如果没有项目，显示提示 -->
              <div v-if="myProjects.length === 0" class="no-projects">
                <p>暂无参与的项目</p>
            </div>
            </div>
          </div>
        </div>

        <!-- 右侧边栏（日历和任务提醒） -->
        <div class="right-sidebar-column">
          <RightSidebar />
        </div>
      </div>
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

    <!-- 任务详情弹窗 -->
    <div v-if="taskDetailModalOpen && selectedTask" class="modal-overlay" @click="closeTaskDetailModal">
      <div class="modal-content task-detail-modal" @click.stop>
        <div class="modal-header">
          <div class="task-detail-header-content">
            <h3 class="modal-title">任务详情</h3>
            <div class="task-detail-badges">
              <span class="task-priority-badge" :class="`priority-${selectedTask.priority}`">
                {{ getPriorityText(selectedTask.priority) }}
              </span>
              <span class="task-status-badge" :class="`status-${selectedTask.status.toLowerCase()}`">
                {{ getStatusText(selectedTask.status) }}
              </span>
            </div>
          </div>
          <button class="modal-close" @click="closeTaskDetailModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body task-detail-body">
          <!-- 任务标题 -->
          <div class="task-detail-section task-title-section">
            <div class="task-title-value">{{ selectedTask.title }}</div>
            <div v-if="isOverdue(selectedTask.dueDate)" class="deadline-warning overdue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>已逾期</span>
            </div>
            <div v-else-if="isNearDeadline(selectedTask.dueDate)" class="deadline-warning near">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>即将到期</span>
            </div>
          </div>
          
          <!-- 任务描述 -->
          <div class="task-detail-section">
            <label class="task-detail-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              任务描述
            </label>
            <div class="task-detail-value task-description-scroll">{{ selectedTask.description || '暂无描述' }}</div>
          </div>
          
          <!-- 信息卡片组 -->
          <div class="task-info-grid">
            <!-- 优先级 -->
            <div class="task-info-card">
              <div class="task-info-icon priority">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="task-info-content">
                <div class="task-info-label">优先级</div>
                <div class="task-info-value">
                  <span class="task-priority-badge" :class="`priority-${selectedTask.priority}`">
                    {{ getPriorityText(selectedTask.priority) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 状态 -->
            <div class="task-info-card">
              <div class="task-info-icon status">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="task-info-content">
                <div class="task-info-label">状态</div>
                <div class="task-info-value">
                  <span class="task-status-badge" :class="`status-${selectedTask.status.toLowerCase()}`">
                    {{ getStatusText(selectedTask.status) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 截止日期 -->
            <div class="task-info-card" v-if="selectedTask.dueDate">
              <div class="task-info-icon deadline">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 14H8.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="task-info-content">
                <div class="task-info-label">截止日期</div>
                <div class="task-info-value">{{ formatDate(selectedTask.dueDate) }}</div>
              </div>
            </div>
            
            <!-- 所属项目 -->
            <div class="task-info-card" v-if="selectedTask.projectId">
              <div class="task-info-icon project">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="task-info-content">
                <div class="task-info-label">所属项目</div>
                <div class="task-info-value">
                  <button class="project-link-btn" @click="goToProjectDetail(selectedTask.projectId)">
                    查看项目详情
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeTaskDetailModal" class="modal-btn modal-btn-confirm">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 页脚（仅在首页显示） -->
    <Footer />
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import Footer from '@/components/Footer.vue'
import { authAPI } from '@/api/auth'
import { projectAPI } from '@/api/project'
import { taskAPI } from '@/api/task'
import '@/assets/styles/Home.css'
import '@/assets/styles/scifiBackground.css'
import { mountSciFiBackground, destroySciFiBackground } from '@/utils/scifiBackground'

export default {
  name: 'Home',
  components: {
    Sidebar,
    RightSidebar,
    Footer
  },
  data() {
    return {
      sidebarOpen: false,
      userMenuOpen: false,
      userAvatar: null, // 用户头像URL，可以从localStorage或API获取
      globalUserInfo: {
        nickname: '',
        avatar: ''
      },
      showModal: false,
      modalMessage: '',
      myProjects: [], // 我参与的项目列表
      isLoadingProjects: false, // 是否正在加载项目
      myTasks: [], // 我的任务列表
      isLoadingTasks: false, // 是否正在加载任务
      taskDetailModalOpen: false, // 任务详情弹窗是否打开
      selectedTask: null, // 选中的任务
      showOAuth2SuccessToast: false, // OAuth2授权成功提示
      scifiBgCleanup: null
    }
  },
  mounted() {
    // 检查是否是OAuth2回调（后端直接重定向到首页的情况）
    this.handleOAuth2Callback()
    
    // 页面加载时尝试获取用户头像
    this.loadUserAvatar()
    
    // 加载全局用户信息
    this.loadGlobalUserInfo()
    
    // 并行加载我参与的项目和我的任务，提升加载速度
    Promise.all([
      this.loadMyProjects(),
      this.loadMyTasks()
    ]).catch(error => {
      console.error('并行加载数据时出错:', error)
    })
    
    // 添加点击外部关闭菜单的事件监听
    document.addEventListener('click', this.handleClickOutside)
    
    // 监听任务状态变化事件，刷新任务列表
    this.$root.$on('taskStatusChanged', this.handleTaskStatusChanged)

    // 仅首页启用科技感背景（低侵入）
    mountSciFiBackground().then((cleanup) => {
      this.scifiBgCleanup = cleanup
    }).catch(err => {
      console.warn('科幻背景初始化失败，已忽略：', err)
    })
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
    // 移除任务状态变化事件监听
    this.$root.$off('taskStatusChanged', this.handleTaskStatusChanged)
    if (this.scifiBgCleanup) {
      this.scifiBgCleanup()
      this.scifiBgCleanup = null
    }
  },
  methods: {
    handleOAuth2Callback() {
      // 检查URL参数中是否有OAuth2回调标记
      const urlParams = new URLSearchParams(window.location.search)
      const oauth2Status = urlParams.get('oauth2')
      const token = urlParams.get('token')
      const refreshToken = urlParams.get('refreshToken')

      if (oauth2Status === 'success' && token) {
        console.log('✅ 检测到OAuth2登录成功回调，处理token')
        
        // 保存token
        localStorage.setItem('access_token', token)
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken)
        }

        // 清除URL参数
        const cleanUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)

        // 显示授权成功提示
        this.showOAuth2SuccessToast = true
        setTimeout(() => {
          this.showOAuth2SuccessToast = false
        }, 1000)

        // 获取用户信息
        this.fetchUserInfoAfterOAuth2Login()
      }
    },

    async fetchUserInfoAfterOAuth2Login() {
      try {
        // 导入authAPI
        const { authAPI } = await import('@/api/auth')
        const { avatarAPI } = await import('@/api/avatar')
        
        const response = await authAPI.getCurrentUserInfo()
        
        if (response.code === 200 && response.data) {
          console.log('📦 OAuth2获取到的用户信息:', response.data)
          
          // 获取用户头像
          try {
            const avatarResponse = await avatarAPI.getMyAvatarInfo()
            console.log('🖼️ 获取头像信息:', avatarResponse)
            
            if (avatarResponse.code === 200 && avatarResponse.data && avatarResponse.data.dataUrl) {
              // 将头像数据添加到用户信息中
              response.data.dataUrl = avatarResponse.data.dataUrl
              response.data.avatar = avatarResponse.data.dataUrl
              console.log('✅ 已添加头像数据到用户信息')
            }
          } catch (avatarError) {
            console.warn('获取头像失败，使用默认头像:', avatarError)
          }
          
          // 规范化并保存用户信息（包含头像和description字段）
          const { normalizeUserInfo } = await import('@/utils/auth')
          const normalizedUserInfo = normalizeUserInfo(response.data)
          localStorage.setItem('user_info', JSON.stringify(normalizedUserInfo))
          
          // 触发用户信息更新事件
          this.$root.$emit('userInfoUpdated')
          
          // 刷新页面数据
          this.loadGlobalUserInfo()
          this.loadUserAvatar()
          
          console.log('✅ OAuth2登录成功，用户信息已保存')
        }
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error)
      }
    },

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
    handleMyActivity() {
      console.log('我的活动')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (isAuthenticated) {
        this.$router.push('/my-activity')
      } else {
        this.showLoginModal('请先登录才能查看我的活动')
      }
    },
    handleProjectSquare() {
      console.log('项目广场')
      this.$router.push('/project-square')
    },
    handleKnowledgeBase() {
      console.log('知识库')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (isAuthenticated) {
        // 避免重复导航到当前路由导致 NavigationDuplicated 错误
        if (this.$route.path !== '/knowledge-base') {
          this.$router.push('/knowledge-base').catch(err => {
            // 忽略重复导航错误，其它错误仍然在控制台可见
            if (err && err.name !== 'NavigationDuplicated') {
              console.error('导航到知识库失败:', err)
            }
          })
        }
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
    },
    async loadMyProjects() {
      console.log('[loadMyProjects] 开始加载项目列表')
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        console.warn('[loadMyProjects] 用户未登录，清空项目列表')
        // 如果用户未登录，显示空数组
        this.myProjects = []
        this.isLoadingProjects = false
        return
      }
      
      // 先尝试从缓存加载，立即显示
      try {
        const cachedProjects = localStorage.getItem('my_projects_cache')
        if (cachedProjects) {
          const parsed = JSON.parse(cachedProjects)
          // 检查缓存是否过期（5分钟）
          if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            console.log('[loadMyProjects] 从缓存加载项目列表，数量:', (parsed.data || []).length)
            this.myProjects = parsed.data || []
            this.isLoadingProjects = false
            // 后台更新数据
            this.loadMyProjectsFromAPI()
            return
          } else {
            console.log('[loadMyProjects] 缓存已过期，从API加载')
          }
        } else {
          console.log('[loadMyProjects] 没有缓存，从API加载')
        }
      } catch (e) {
        console.warn('[loadMyProjects] 缓存读取失败，继续从API加载:', e)
      }
      
      this.isLoadingProjects = true
      await this.loadMyProjectsFromAPI()
    },
    async loadMyProjectsFromAPI() {
      try {
        console.log('[loadMyProjectsFromAPI] 开始加载项目列表')
        // 调用API获取我参与的项目
        const response = await projectAPI.getMyProjects(0, 5) // 获取前5个项目
        console.log('[loadMyProjectsFromAPI] API响应:', response)
        
        // 处理API返回的数据，兼容多种数据结构
        let projects = []
        if (Array.isArray(response)) {
          projects = response
          console.log('[loadMyProjectsFromAPI] 响应是数组，项目数量:', projects.length)
        } else if (response && response.data) {
          if (Array.isArray(response.data)) {
            projects = response.data
            console.log('[loadMyProjectsFromAPI] response.data是数组，项目数量:', projects.length)
          } else if (Array.isArray(response.data.content)) {
            // Spring分页数据
            projects = response.data.content
            console.log('[loadMyProjectsFromAPI] response.data.content是数组，项目数量:', projects.length)
          } else if (Array.isArray(response.data.list)) {
            projects = response.data.list
            console.log('[loadMyProjectsFromAPI] response.data.list是数组，项目数量:', projects.length)
          } else if (Array.isArray(response.data.records)) {
            projects = response.data.records
            console.log('[loadMyProjectsFromAPI] response.data.records是数组，项目数量:', projects.length)
          } else {
            console.warn('[loadMyProjectsFromAPI] ⚠️ 无法解析项目数据，response.data:', response.data)
          }
        } else {
          console.warn('[loadMyProjectsFromAPI] ⚠️ API响应格式异常:', response)
        }
        
        console.log('[loadMyProjectsFromAPI] 解析到的项目数量:', projects.length)
        
        if (projects.length > 0) {
          const mappedProjects = projects.map(project => ({
            id: project.id || project.projectId || project.project_id,
            title: project.title || project.name || project.projectName || '未命名项目',
            description: project.description || project.desc || '',
            status: this.mapStatus(project.status),
            progress: this.calculateProgress(project.status)
          }))
          
          console.log('[loadMyProjectsFromAPI] 映射后的项目列表:', mappedProjects.map(p => ({ id: p.id, title: p.title })))
          this.myProjects = mappedProjects
          console.log('[loadMyProjectsFromAPI] ✅ 项目列表已更新，数量:', this.myProjects.length)
          
          // 保存到缓存
          try {
            localStorage.setItem('my_projects_cache', JSON.stringify({
              data: mappedProjects,
              timestamp: Date.now()
            }))
          } catch (e) {
            console.warn('[loadMyProjectsFromAPI] 缓存写入失败:', e)
          }
        } else {
          console.warn('[loadMyProjectsFromAPI] ⚠️ 没有项目数据，清空项目列表')
          this.myProjects = []
        }
      } catch (error) {
        console.error('[loadMyProjectsFromAPI] ❌ 加载项目失败:', error)
        this.myProjects = []
      } finally {
        this.isLoadingProjects = false
        console.log('[loadMyProjectsFromAPI] 加载完成，isLoadingProjects = false')
      }
    },
    mapStatus(status) {
      // 将后端状态映射到前端状态
      const statusMap = {
        'ACTIVE': 'in-progress',
        'COMPLETED': 'completed',
        'PAUSED': 'in-progress',
        'ARCHIVED': 'completed',
        '进行中': 'in-progress',
        '已完成': 'completed',
        '已暂停': 'in-progress'
      }
      return statusMap[status] || 'in-progress'
    },
    calculateProgress(status) {
      // 根据状态计算进度
      if (status === 'completed' || status === 'Completed' || status === '已完成') {
        return 100
      } else if (status === 'ACTIVE' || status === 'Paused' || status === '进行中') {
        return 50 // 默认进行中状态显示50%
      }
      return 0
    },
    getProjectStatusText(status) {
      // 专门用于项目状态的中文转换
      if (!status) return '进行中'
      
      const statusStr = String(status).trim()
      
      // 项目状态映射表
      const statusMap = {
        // 前端映射后的状态（小写带连字符）
        'in-progress': '进行中',
        'completed': '已完成',
        'pending': '待开始',
        'paused': '已暂停',
        // 后端可能返回的英文状态（大写）
        'ACTIVE': '进行中',
        'ONGOING': '进行中',
        'IN_PROGRESS': '进行中',
        'COMPLETED': '已完成',
        'DONE': '已完成',
        'PAUSED': '已暂停',
        'ARCHIVED': '已归档',
        'PLANNING': '规划中',
        'CANCELLED': '已取消',
        'STEADY': '稳健中',
        // 后端可能返回的英文状态（小写）
        'active': '进行中',
        'ongoing': '进行中',
        'in_progress': '进行中',
        'completed': '已完成',
        'done': '已完成',
        'paused': '已暂停',
        'archived': '已归档',
        'planning': '规划中',
        'cancelled': '已取消',
        'steady': '稳健中',
        // 中文状态（直接返回）
        '进行中': '进行中',
        '已完成': '已完成',
        '已暂停': '已暂停',
        '待开始': '待开始',
        '规划中': '规划中',
        '已归档': '已归档',
        '已取消': '已取消',
        '稳健中': '稳健中'
      }
      
      // 直接匹配
      if (statusMap[statusStr]) {
        return statusMap[statusStr]
      }
      
      // 转换为大写匹配
      const upperStatus = statusStr.toUpperCase()
      if (statusMap[upperStatus]) {
        return statusMap[upperStatus]
      }
      
      // 转换为小写匹配
      const lowerStatus = statusStr.toLowerCase()
      if (statusMap[lowerStatus]) {
        return statusMap[lowerStatus]
      }
      
      // 如果都不匹配，返回'进行中'作为默认值
      return '进行中'
    },
    getStatusText(status) {
      // 用于任务状态的中文转换
      const statusMap = {
        'TODO': '待办',
        'IN_PROGRESS': '进行中',
        'BLOCKED': '阻塞',
        'DONE': '已完成'
      }
      return statusMap[status] || status
    },
    goToProjectDetail(projectId) {
      if (projectId) {
        console.log('跳转到项目详情:', projectId)
        this.closeTaskDetailModal()
        this.$router.push(`/project-detail/${projectId}`)
      }
    },
    async loadMyTasks() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const userInfo = localStorage.getItem('user_info')
      const isAuthenticated = !!(token && userInfo)
      
      if (!isAuthenticated) {
        this.myTasks = []
        return
      }
      
      // 先尝试从缓存加载，立即显示
      try {
        const cachedTasks = localStorage.getItem('my_tasks_cache')
        if (cachedTasks) {
          const parsed = JSON.parse(cachedTasks)
          // 延长缓存时间到30分钟，减少不必要的API调用
          if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
            // 缓存中保存的数据已经是过滤和排序后的数据，直接使用
            const cachedData = parsed.data || []
            console.log('[loadMyTasks] 从缓存加载任务，数量:', cachedData.length)
            
            // 直接使用缓存数据，不再过滤（因为保存时已经过滤过了）
            // 先显示缓存数据（即使没有被打回状态，也会按优先级排序）
            this.myTasks = cachedData // 缓存数据已经是排序后的，直接使用
            this.isLoadingTasks = false
            console.log('[loadMyTasks] 缓存任务已显示，数量:', this.myTasks.length)
            
            // 后台静默更新：延迟执行，避免阻塞UI
            // 1. 先延迟检查被打回状态（如果缓存中有isRejected标记，可以跳过）
            setTimeout(() => {
              // 只检查没有isRejected标记的任务（优化性能）
              const tasksToCheck = this.myTasks.filter(t => t.isRejected === undefined || t.isRejected === false)
              if (tasksToCheck.length > 0) {
                this.checkRejectedSubmissions(tasksToCheck, true).then(() => {
                  // 检查完成后重新排序并更新显示（静默模式）
                  const sortedTasks = this.sortTasksByPriority(this.myTasks, true)
                  this.myTasks = sortedTasks
                }).catch(error => {
                  // 静默失败，不影响显示
                })
              }
            }, 1000)
            
            // 2. 延迟从API重新加载最新数据（延长到10秒后，减少不必要的请求）
            setTimeout(() => {
              this.loadMyTasksFromAPI(true) // 传入true表示静默更新
            }, 10000)
            return
          }
        }
      } catch (e) {
        // 缓存读取失败，继续从API加载
      }
      
      this.isLoadingTasks = true
      await this.loadMyTasksFromAPI()
    },
    async loadMyTasksFromAPI(silent = false) {
      try {
        // 调用API获取我的任务（增加数量，确保能获取到所有任务）
        const response = await taskAPI.getMyAssignedTasks(0, 20)
        
        if (!silent) {
          console.log('[loadMyTasksFromAPI] API响应:', response)
          console.log('[loadMyTasksFromAPI] response.data类型:', typeof response?.data, '是否为数组:', Array.isArray(response?.data))
          console.log('[loadMyTasksFromAPI] response.data内容:', response?.data)
        }
        
        // 处理API返回的数据
        let tasks = []
        if (response && response.data) {
          // 先检查是否是数组
          if (Array.isArray(response.data)) {
            tasks = response.data
            console.log('[loadMyTasksFromAPI] 从response.data数组获取到', tasks.length, '个任务')
          } 
          // 检查是否是Spring分页对象（即使content可能为空数组）
          else if (response.data.content !== undefined) {
            if (Array.isArray(response.data.content)) {
              tasks = response.data.content
              console.log('[loadMyTasksFromAPI] 从response.data.content获取到', tasks.length, '个任务')
            } else {
              console.warn('[loadMyTasksFromAPI] response.data.content存在但不是数组:', typeof response.data.content)
            }
          }
          // 检查其他可能的字段
          else if (response.data.list && Array.isArray(response.data.list)) {
            tasks = response.data.list
            console.log('[loadMyTasksFromAPI] 从response.data.list获取到', tasks.length, '个任务')
          } else if (response.data.records && Array.isArray(response.data.records)) {
            tasks = response.data.records
            console.log('[loadMyTasksFromAPI] 从response.data.records获取到', tasks.length, '个任务')
          } else {
            // 如果data是对象但不是上述格式，尝试检查是否有其他字段
            console.warn('[loadMyTasksFromAPI] response.data格式未知，尝试检查所有字段')
            console.warn('[loadMyTasksFromAPI] response.data的键:', Object.keys(response.data))
            console.warn('[loadMyTasksFromAPI] response.data完整内容:', JSON.stringify(response.data, null, 2))
            
            // 尝试查找任何数组字段
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                console.log(`[loadMyTasksFromAPI] 发现数组字段 ${key}，包含 ${response.data[key].length} 个元素`)
                tasks = response.data[key]
                break
              }
            }
          }
        } else {
          console.warn('[loadMyTasksFromAPI] API响应异常，response或response.data为空')
          console.warn('[loadMyTasksFromAPI] response:', response)
        }
        
        console.log('[loadMyTasksFromAPI] 最终解析到的任务数量:', tasks.length)
        
        if (tasks.length > 0) {
          console.log('[loadMyTasksFromAPI] 开始处理', tasks.length, '个任务')
          const mappedTasks = tasks.map(task => ({
            id: task.id || task.taskId,
            title: task.title || '未命名任务',
            description: task.description || '',
            priority: this.mapTaskPriority(task.priority),
            dueDate: task.dueDate || null,
            status: task.status || 'TODO',
            projectId: task.projectId,
            isRejected: false // 初始化为false，后续会检查
          }))
          
          // 先检查所有任务的提交记录（包括PENDING_REVIEW状态的任务）
          // 因为被打回的任务可能状态还是PENDING_REVIEW，需要先检查提交记录
          // 静默模式下减少日志输出
          if (!silent) {
            console.log('[loadMyTasksFromAPI] 开始检查所有任务的提交记录，任务数量:', mappedTasks.length)
          }
          await this.checkRejectedSubmissions(mappedTasks, silent)
          if (!silent) {
            console.log('[loadMyTasksFromAPI] 提交记录检查完成')
          }
          
          // 过滤掉已完成和待审核的任务（但保留被打回的PENDING_REVIEW任务）
          const activeTasks = mappedTasks.filter(task => {
            const status = String(task.status || '').trim()
            const statusUpper = status.toUpperCase()
            
            // 排除所有可能的完成状态（支持中英文）
            const completedStatuses = ['DONE', '完成', '已完成', 'COMPLETED', 'done', 'Done']
            const isCompleted = completedStatuses.includes(status) || 
                               completedStatuses.includes(statusUpper) ||
                               statusUpper.includes('DONE') || 
                               status.includes('完成')
            
            // 如果任务已完成，直接排除
            if (isCompleted) {
              return false
            }
            
            // 排除所有可能的待审核状态（支持中英文）
            const pendingReviewStatuses = ['PENDING_REVIEW', '待审核', 'pending_review', 'Pending_Review']
            const isPendingReview = pendingReviewStatuses.includes(status) || 
                                   pendingReviewStatuses.includes(statusUpper) ||
                                   statusUpper.includes('PENDING_REVIEW') || 
                                   status.includes('待审核')
            
            // 如果任务状态是PENDING_REVIEW，但被打回了，则保留（因为需要显示被打回的任务）
            if (isPendingReview) {
              // 如果任务被打回，保留它
              if (task.isRejected) {
                console.log(`[loadMyTasksFromAPI] 保留被打回的PENDING_REVIEW任务: ${task.id} (${task.title})`)
                return true
              }
              // 否则排除
              return false
            }
            
            // 其他状态（IN_PROGRESS, TODO等）都保留
            return true
          })
          
          if (!silent) {
            console.log('[loadMyTasksFromAPI] 过滤后任务列表:', activeTasks.length, '个任务')
            console.log('[loadMyTasksFromAPI] 过滤后任务详情:', activeTasks.map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              isRejected: t.isRejected
            })))
          }
          
          // 确保 activeTasks 没有被意外修改
          if (activeTasks.length === 0) {
            if (!silent) {
              console.warn('[loadMyTasksFromAPI] ⚠️ 过滤后没有活跃任务')
            }
            this.myTasks = []
            return
          }
          
          // 排序：被打回的任务排在顶部，然后按优先级排序
          // 创建副本，避免修改原数组
          const tasksToSort = [...activeTasks]
          if (!silent) {
            console.log('[loadMyTasksFromAPI] 准备排序，tasksToSort.length:', tasksToSort.length)
          }
          const sortedTasks = this.sortTasksByPriority(tasksToSort)
          if (!silent) {
            console.log('[loadMyTasksFromAPI] 排序后的任务列表:', sortedTasks.length, '个任务')
            console.log('[loadMyTasksFromAPI] 排序后的任务详情:', sortedTasks.map(t => ({
              id: t.id,
              title: t.title,
              isRejected: t.isRejected,
              priority: t.priority,
              status: t.status
            })))
            
            // 验证：检查是否有被打回的任务
            const rejectedTasks = sortedTasks.filter(t => t.isRejected)
            if (rejectedTasks.length > 0) {
              console.log('[loadMyTasksFromAPI] ✅ 找到被打回的任务:', rejectedTasks.map(t => ({
                id: t.id,
                title: t.title
              })))
            } else {
              console.warn('[loadMyTasksFromAPI] ⚠️ 没有找到被打回的任务')
            }
          }
          
          this.myTasks = sortedTasks
          
          // 保存到缓存
          try {
            localStorage.setItem('my_tasks_cache', JSON.stringify({
              data: this.myTasks,
              timestamp: Date.now()
            }))
          } catch (e) {
            // 忽略缓存写入错误
          }
        } else {
          console.warn('[loadMyTasksFromAPI] 没有任务数据，tasks.length =', tasks.length)
          console.warn('[loadMyTasksFromAPI] 可能的原因：1) API返回空数据 2) 所有任务都被过滤掉了')
          this.myTasks = []
        }
      } catch (error) {
        console.error('加载任务失败:', error)
        this.myTasks = []
      } finally {
        this.isLoadingTasks = false
      }
    },
    async checkRejectedSubmissions(tasks, silent = false) {
      // 检查任务是否有被拒绝的提交记录
      // 改为检查所有提交记录，找出最新的一条REJECTED提交
      if (!tasks || tasks.length === 0) {
        if (!silent) {
          console.warn('[checkRejectedSubmissions] ⚠️ 任务列表为空，跳过检查')
        }
        return
      }
      
      const { getTaskSubmissions } = await import('@/api/taskSubmission')
      
      if (!silent) {
        console.log(`[checkRejectedSubmissions] ✅ 开始检查 ${tasks.length} 个任务的提交记录`)
        console.log(`[checkRejectedSubmissions] 任务列表:`, tasks.map(t => ({ id: t.id, title: t.title })))
      }
      
      // 并行检查所有任务的所有提交记录
      const checkPromises = tasks.map(async (task) => {
        try {
          const response = await getTaskSubmissions(task.id)
          if (!silent) {
            console.log(`[checkRejectedSubmissions] 任务 ${task.id} (${task.title}) API响应:`, response)
          }
          
          if (response && response.code === 200 && response.data) {
            const submissions = Array.isArray(response.data) ? response.data : []
            if (!silent) {
              console.log(`[checkRejectedSubmissions] 任务 ${task.id} (${task.title}) 共有 ${submissions.length} 条提交记录`)
            }
            
            if (submissions.length === 0) {
              if (!silent) {
                console.log(`[checkRejectedSubmissions] 任务 ${task.id} (${task.title}) 没有提交记录`)
              }
              return
            }
            
            // 按提交时间降序排序，获取最新的提交记录
            const sortedSubmissions = submissions.sort((a, b) => {
              const timeA = new Date(a.submissionTime || a.submitTime || a.createdAt || 0).getTime()
              const timeB = new Date(b.submissionTime || b.submitTime || b.createdAt || 0).getTime()
              return timeB - timeA
            })
            
            const latestSubmission = sortedSubmissions[0]
            if (!silent) {
              console.log(`[checkRejectedSubmissions] 任务 ${task.id} 最新提交记录详情:`, {
                id: latestSubmission.id,
                reviewStatus: latestSubmission.reviewStatus,
                review_status: latestSubmission.review_status,
                status: latestSubmission.status,
                submissionTime: latestSubmission.submissionTime || latestSubmission.submitTime,
                submission: latestSubmission
              })
            }
            
            // 检查多种可能的字段名（兼容不同的API响应格式）
            // 后端可能返回枚举对象（有name属性）或字符串
            let reviewStatus = latestSubmission.reviewStatus || latestSubmission.review_status || latestSubmission.status
            
            // 如果是对象，尝试获取name属性
            if (reviewStatus && typeof reviewStatus === 'object') {
              reviewStatus = reviewStatus.name || reviewStatus.toString()
            }
            
            // 转换为字符串并统一大写，便于比较
            const statusStr = String(reviewStatus || '').toUpperCase().trim()
            
            if (!silent) {
              console.log(`[checkRejectedSubmissions] 任务 ${task.id} (${task.title}) 最新提交状态: ${statusStr}`)
              console.log(`[checkRejectedSubmissions] 任务 ${task.id} 所有提交记录状态:`, sortedSubmissions.map(sub => {
                let subStatus = sub.reviewStatus || sub.review_status || sub.status
                if (subStatus && typeof subStatus === 'object') {
                  subStatus = subStatus.name || subStatus.toString()
                }
                return {
                  id: sub.id,
                  version: sub.version,
                  reviewStatus: String(subStatus || '').toUpperCase().trim(),
                  submissionTime: sub.submissionTime || sub.submitTime || sub.createdAt
                }
              }))
            }
            
            // 如果最新提交的状态是REJECTED，则标记任务为被打回
            if (statusStr === 'REJECTED') {
              task.isRejected = true
              if (!silent) {
                console.log(`[checkRejectedSubmissions] ✅ 任务 ${task.id} (${task.title}) 被打回，最新提交reviewStatus=${statusStr}`)
              }
            } else {
              // 检查是否有REJECTED的提交记录（即使不是最新的）
              // 如果最新提交是APPROVED，但之前有REJECTED，说明问题已经解决，不标记为被打回
              // 如果最新提交是PENDING，但之前有REJECTED，也不标记为被打回（因为可能是新的提交）
              // 只有当最新提交是REJECTED时，才标记为被打回
              if (!silent) {
                console.log(`[checkRejectedSubmissions] 任务 ${task.id} (${task.title}) 未被打回，最新提交reviewStatus=${statusStr}`)
              }
            }
          } else if (response && response.code === 200 && !response.data) {
            // 没有提交记录
            if (!silent) {
              console.log(`[checkRejectedSubmissions] 任务 ${task.id} (${task.title}) 没有提交记录`)
            }
          } else {
            if (!silent) {
              console.warn(`[checkRejectedSubmissions] 任务 ${task.id} (${task.title}) API响应异常:`, response)
            }
          }
        } catch (error) {
          // 如果获取提交记录失败，不影响任务显示，只是不标记为被打回
          if (!silent) {
            console.warn(`[checkRejectedSubmissions] 检查任务 ${task.id} (${task.title}) 的提交记录失败:`, error)
          }
        }
      })
      
      // 等待所有检查完成
      await Promise.all(checkPromises)
      
      // 统计被打回的任务数量
      if (!silent) {
        const rejectedCount = tasks.filter(t => t.isRejected).length
        console.log(`[checkRejectedSubmissions] 检查完成，共 ${rejectedCount} 个任务被打回`)
      }
    },
    mapTaskPriority(priority) {
      // 将后端优先级映射到前端显示
      const priorityMap = {
        'HIGH': 'high',
        'MEDIUM': 'medium',
        'LOW': 'low'
      }
      return priorityMap[priority] || 'medium'
    },
    getPriorityText(priority) {
      const textMap = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
      }
      return textMap[priority] || '中优先级'
    },
    formatDate(dateStr) {
      if (!dateStr) return '无截止日期'
      const date = new Date(dateStr)
      return `截止日期：${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    sortTasksByPriority(tasks, silent = false) {
      // 定义优先级权重：高优先级 = 3, 中优先级 = 2, 低优先级 = 1
      const priorityWeight = {
        'high': 3,
        'medium': 2,
        'low': 1
      }
      
      const tasksToSort = Array.isArray(tasks) ? [...tasks] : (this.myTasks ? [...this.myTasks] : [])
      
      if (!silent) {
        console.log('[sortTasksByPriority] 排序前任务列表:', tasksToSort.map(t => ({
          id: t.id,
          title: t.title,
          isRejected: t.isRejected,
          priority: t.priority
        })))
      }
      
      tasksToSort.sort((a, b) => {
        // 优先排序：被打回的任务排在顶部
        if (a.isRejected && !b.isRejected) {
          if (!silent) {
            console.log(`[sortTasksByPriority] 任务 ${a.id} (${a.title}) 被打回，排在任务 ${b.id} (${b.title}) 前面`)
          }
          return -1 // a排在前面
        }
        if (!a.isRejected && b.isRejected) {
          if (!silent) {
            console.log(`[sortTasksByPriority] 任务 ${b.id} (${b.title}) 被打回，排在任务 ${a.id} (${a.title}) 前面`)
          }
          return 1 // b排在前面
        }
        // 如果都是被打回或都不是被打回，则按优先级排序
        const priorityDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        return priorityDiff
      })
      
      if (!silent) {
        console.log('[sortTasksByPriority] 排序后任务列表:', tasksToSort.map(t => ({
          id: t.id,
          title: t.title,
          isRejected: t.isRejected,
          priority: t.priority
        })))
      }
      
      return tasksToSort
    },
    isNearDeadline(dueDate) {
      // 判断任务是否临近截止（3天内）
      if (!dueDate) return false
      
      const now = new Date()
      const deadline = new Date(dueDate)
      const diffTime = deadline - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // 0-3天内截止或已逾期返回true
      return diffDays >= 0 && diffDays <= 3
    },
    isOverdue(dueDate) {
      // 判断任务是否已逾期
      // 截止日期当天不算逾期，只有在截止日期之后（即第二天）才算逾期
      if (!dueDate) return false
      
      const today = new Date()
      today.setHours(0, 0, 0, 0) // 设置为今天的0:00:00
      
      const deadline = new Date(dueDate)
      deadline.setHours(0, 0, 0, 0) // 设置为截止日期的0:00:00
      
      // 只有截止日期在今天之前（不包括今天）才算逾期
      return deadline < today
    },
    openTaskDetailModal(task) {
      this.selectedTask = task
      this.taskDetailModalOpen = true
    },
    closeTaskDetailModal() {
      this.taskDetailModalOpen = false
      this.selectedTask = null
    },
    getStatusText(status) {
      const statusMap = {
        'TODO': '待办',
        'IN_PROGRESS': '进行中',
        'BLOCKED': '阻塞',
        'DONE': '已完成'
      }
      return statusMap[status] || status
    },
    handleTaskStatusChanged(eventData) {
      // 当任务状态发生变化时，刷新任务列表
      console.log('[Home] 收到任务状态变化事件，刷新任务列表', eventData)
      
      // 如果是审核拒绝，清除缓存强制重新加载
      if (eventData && eventData.reviewStatus === 'REJECTED') {
        console.log('[Home] 检测到审核拒绝，清除缓存并强制刷新')
        try {
          localStorage.removeItem('my_tasks_cache')
        } catch (e) {
          console.warn('[Home] 清除缓存失败:', e)
        }
      }
      
      // 延迟一下再加载，确保后端数据已更新
      setTimeout(() => {
        console.log('[Home] 开始刷新任务列表...')
        this.loadMyTasks()
      }, 500) // 增加延迟时间，确保后端数据已更新
    },
    // 调试方法：手动检查任务是否被打回
    async debugCheckRejectedTasks() {
      console.log('[DEBUG] 开始手动检查任务是否被打回...')
      console.log('[DEBUG] 当前任务列表:', this.myTasks)
      
      if (this.myTasks.length === 0) {
        console.warn('[DEBUG] 任务列表为空，无法检查')
        return
      }
      
      // 重新检查所有任务
      await this.checkRejectedSubmissions(this.myTasks)
      
      // 重新排序
      this.myTasks = this.sortTasksByPriority(this.myTasks)
      
      console.log('[DEBUG] 检查完成，当前任务列表:', this.myTasks.map(t => ({
        id: t.id,
        title: t.title,
        isRejected: t.isRejected
      })))
    }
  }
}
</script>

