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
        <!-- 顶部：标题和操作按钮 -->
        <div class="project-header-top">
          <h1 class="project-title">{{ project.title }}</h1>
          <div class="project-actions" v-if="isProjectManager">
            <button class="btn secondary" @click="editProject">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              编辑项目
            </button>
            <button class="btn btn-danger" @click="deleteProject">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              删除项目
            </button>
          </div>
        </div>
        
        <!-- 主体内容：项目信息和图片并排 -->
        <div class="project-body">
          <div class="project-info">
            <!-- 第一行：项目简介和项目周期 -->
            <div class="project-meta-top">
              <div class="meta-item">
                <span class="meta-label">项目简介：</span>
                <span class="meta-value">{{ project.description }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">项目周期：</span>
                <span class="meta-value">{{ project.period }}</span>
              </div>
            </div>
            
            <!-- 第二行：当前状态和负责人（往下放，填充空白） -->
            <div class="project-meta-bottom">
              <div class="meta-item">
                <span class="meta-label">当前状态：</span>
                <span class="status-badge" :class="statusClass(project.status)">{{ getStatusDisplay(project.status) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">负责人：</span>
                <span class="meta-value">{{ project.manager }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">任务数量：</span>
                <span class="meta-value">{{ taskCount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">参与人数：</span>
                <span class="meta-value">{{ participantCount }}</span>
              </div>
              <div class="meta-item" v-if="project.tags && project.tags.length > 0">
                <span class="meta-label">项目标签：</span>
                <div class="tags-container">
                  <span v-for="(tag, index) in project.tags" :key="index" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
            <!-- 信息区操作按钮 -->
            <div class="info-actions">
              <button
                class="btn primary"
                @click="goToProjectKnowledge"
              >
                知识库
              </button>
              <button
                class="btn"
                @click="goToAIAssistant"
              >
                AI实验分析助手
              </button>
            </div>
          </div>
          
          <!-- 项目图片区域 -->
          <div class="project-image-section">
            <div class="project-image-container">
              <img 
                v-if="project.imageUrl || project.image" 
                :src="project.imageUrl || project.image" 
                alt="项目图片" 
                class="project-image"
                @load="onImageLoad"
                @error="onImageError"
              />
              <div v-else class="project-image-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M3 18L8 13L14 19M14 12L21 3" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <!-- 项目管理员可以上传图片 -->
              <div v-if="isProjectManager" class="project-image-overlay" @click="triggerImageUpload">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>上传图片</span>
              </div>
            </div>
            <!-- 隐藏的图片上传输入 -->
            <input 
              ref="projectImageUpload" 
              type="file" 
              accept="image/*" 
              @change="handleProjectImageUpload" 
              style="display: none"
            />
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
        <!-- 空状态提示 -->
        <div v-if="filteredTasks.length === 0" class="task-empty-state">
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="empty-state-title">暂无任务</h3>
            <p class="empty-state-message">
              点击右侧<span class="highlight-text">"新建任务"</span>按钮来创建第一个任务
            </p>
          </div>
        </div>
        
        <!-- 任务网格 -->
        <div v-else class="task-grid">
          <div v-for="task in filteredTasks" :key="task.id" class="task-card" @click="openTaskDetailModal(task)">
            <div class="task-header" @click.stop>
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
                    <!-- ✅ 移除"待接取"选项，用户不应该手动将任务改回待接取状态 -->
                    <button @click="changeTaskStatus(task, '进行中')" class="status-option" :class="{ active: task.status === '进行中' }">进行中</button>
                    <button @click="changeTaskStatus(task, '阻塞')" class="status-option" :class="{ active: task.status === '阻塞' }">阻塞</button>
                    <button @click="changeTaskStatus(task, '完成')" class="status-option" :class="{ active: task.status === '完成' }">完成</button>
                  </div>
                </div>
                <button class="task-assign-manager-btn" @click="openAssignTaskModal(task)" title="分配任务">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20 8V14M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
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
            <div class="task-content" @click="openTaskDetailModal(task)">
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
            <div v-if="task.status === '待接取' && (!task.assignee_name || task.assignee_name === '')" class="task-assign-section" @click.stop>
              <button @click="assignTask(task)" class="assign-btn">接取任务</button>
          </div>
          </div>
        </div>
        
        <!-- 更多按钮放在任务网格下面 -->
        <div v-if="allTasks.length > 5" class="more-button-container">
          <button class="more-button" @click="openTaskListModal">
            <span class="more-text">更多</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
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
                :min="today"
                class="form-input"
                @change="validateNewTaskDueDate"
              />
              <div v-if="newTask.dateError" class="error-message">{{ newTask.dateError }}</div>
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
          <button type="button" @click="saveNewTask" class="btn btn-primary" :disabled="!newTask.title.trim() || isCreatingTask">
            {{ isCreatingTask ? '创建中...' : '创建任务' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑项目模态框 -->
    <div v-if="editProjectModalOpen" class="modal-overlay" @click="closeEditProjectModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">编辑项目</h3>
          <button class="modal-close" @click="closeEditProjectModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-field">
            <label class="form-label">项目名称</label>
            <input 
              v-model="editProjectData.name" 
              type="text" 
              class="form-input" 
              placeholder="请输入项目名称"
              maxlength="100"
            />
          </div>
          
          <div class="form-field">
            <label class="form-label">项目描述</label>
            <textarea 
              v-model="editProjectData.description" 
              class="form-textarea" 
              placeholder="请输入项目描述"
              rows="3"
              maxlength="500"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">开始日期</label>
              <input 
                v-model="editProjectData.startDate" 
                type="date" 
                class="form-input"
              />
            </div>
            
            <div class="form-field">
              <label class="form-label">结束日期</label>
              <input 
                v-model="editProjectData.endDate" 
                type="date" 
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">可见性</label>
              <select v-model="editProjectData.visibility" class="form-select">
                <option value="PUBLIC">公开</option>
                <option value="PRIVATE">私有</option>
              </select>
            </div>
            
            <div class="form-field">
              <label class="form-label">项目状态</label>
              <select v-model="editProjectData.status" class="form-select">
                <option value="PLANNING">规划中</option>
                <option value="ONGOING">进行中</option>
                <option value="COMPLETED">已完成</option>
                <option value="ARCHIVED">已归档</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="closeEditProjectModal" class="btn btn-secondary">取消</button>
          <button type="button" @click="saveProjectUpdate" class="btn btn-primary" :disabled="!editProjectData.name.trim()">
            保存更改
          </button>
        </div>
      </div>
    </div>

    <!-- 任务列表弹窗 -->
    <div v-if="taskListModalOpen" class="modal-overlay" @click="closeTaskListModal">
      <div class="modal-content task-list-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">所有任务</h3>
          <button class="modal-close" @click="closeTaskListModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="task-list-container">
            <div v-for="task in allFilteredTasks" :key="task.id" class="task-list-item" @click="openTaskDetailModal(task)">
              <div class="task-item-header" @click.stop>
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
                      <!-- ✅ 移除"待接取"选项，用户不应该手动将任务改回待接取状态 -->
                      <button @click="changeTaskStatus(task, '进行中')" class="status-option" :class="{ active: task.status === '进行中' }">进行中</button>
                      <button @click="changeTaskStatus(task, '阻塞')" class="status-option" :class="{ active: task.status === '阻塞' }">阻塞</button>
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
              <div class="task-item-content" @click="openTaskDetailModal(task)">
                <h4 class="task-item-title">{{ task.title }}</h4>
                <p class="task-item-description">{{ task.description }}</p>
                <div class="task-item-meta">
                  <span class="task-date" v-if="task.date">{{ task.date }}</span>
                  <span class="task-creator">创建人: {{ task.created_by_name }}</span>
                  <span v-if="task.assignee_name" class="task-assignee">
                    负责人: {{ task.assignee_name }}
                  </span>
                </div>
              </div>
              <div class="task-item-assign" :class="{ 'has-button': task.status === '待接取' && (!task.assignee_name || task.assignee_name === '') }" @click.stop>
                <button v-if="task.status === '待接取' && (!task.assignee_name || task.assignee_name === '')" @click="assignTask(task)" class="assign-btn">接取任务</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑任务模态框 -->
    <div v-if="editTaskModalOpen" class="modal-overlay" @click="closeEditTaskModal">
      <div class="modal-content task-modal" @click.stop>
        <div class="modal-header">
          <h3>编辑任务</h3>
          <button class="modal-close" @click="closeEditTaskModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-field">
            <label class="form-label">任务标题</label>
            <input
              type="text"
              v-model="editTaskData.title" 
              class="form-input"
              placeholder="请输入任务标题"
            />
          </div>
          
          <div class="form-field">
            <label class="form-label">任务描述</label>
            <textarea
              v-model="editTaskData.description"
              class="form-textarea"
              placeholder="请输入任务描述"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="form-label">截止日期</label>
              <input
                type="date"
                v-model="editTaskData.dueDate"
                :min="today"
                class="form-input"
                @change="validateEditTaskDueDate"
              />
              <div v-if="editTaskData.dateError" class="error-message">{{ editTaskData.dateError }}</div>
            </div>
            <div class="form-field">
              <label class="form-label">优先级</label>
              <select v-model="editTaskData.priority" class="form-select">
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="closeEditTaskModal" class="btn btn-secondary">取消</button>
          <button type="button" @click="saveEditTask" class="btn btn-primary" :disabled="!editTaskData.title.trim()">
            保存更改
          </button>
        </div>
      </div>
    </div>

    <!-- 邀请成员弹窗 -->
    <div v-if="inviteMemberModalOpen" class="modal-overlay" @click="closeInviteMemberModal">
      <div class="modal-content invite-member-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">邀请成员</h3>
          <button class="modal-close" @click="closeInviteMemberModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- 搜索用户 -->
          <div class="search-section">
            <label class="form-label">搜索用户</label>
            <div class="search-input-wrapper">
              <input 
                v-model="userSearchKeyword" 
                type="text" 
                class="form-input search-input" 
                placeholder="请输入用户ID或姓名进行搜索"
                @input="handleSearchInput"
              />
              <button class="search-btn" @click="searchUsers" :disabled="isSearching">
                <svg v-if="!isSearching" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-else class="loading-spinner-small"></span>
              </button>
            </div>
          </div>
          
          <!-- 搜索结果列表 -->
          <div class="search-results" v-if="searchedUsers.length > 0">
            <div class="search-results-header">
              <span class="results-count">找到 {{ searchedUsers.length }} 个用户</span>
              <span class="selected-count" v-if="selectedUserIds.length > 0">已选 {{ selectedUserIds.length }} 人</span>
            </div>
            <div class="user-list">
              <div 
                v-for="user in searchedUsers" 
                :key="user.id || user.userId" 
                class="user-item"
                :class="{ 'user-selected': selectedUserIds.includes(user.id || user.userId) }"
                @click="selectUser(user)"
              >
                <div class="user-avatar">
                  <img v-if="user.avatarUrl || user.avatar" :src="user.avatarUrl || user.avatar" alt="用户头像" />
                  <div v-else class="avatar-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.name || user.username }}</div>
                  <div class="user-email">{{ user.email || 'ID: ' + (user.id || user.userId) }}</div>
                </div>
                <div class="user-select-indicator" v-if="selectedUserIds.includes(user.id || user.userId)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div class="empty-state" v-else-if="hasSearched && !isSearching">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>未找到相关用户</p>
          </div>
          
          <!-- 提示信息 -->
          <div class="search-hint" v-else>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>请输入用户ID或姓名进行搜索</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn secondary" @click="closeInviteMemberModal">取消</button>
          <button 
            class="btn primary" 
            @click="confirmInvite" 
            :disabled="selectedUserIds.length === 0 || isInviting"
          >
            <span v-if="!isInviting">确定邀请{{ selectedUserIds.length > 0 ? ' (' + selectedUserIds.length + ')' : '' }}</span>
            <span v-else>邀请中...</span>
          </button>
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
              <span class="task-priority-badge" :class="priorityClass(selectedTask.priority)">
                {{ selectedTask.priority }}
              </span>
              <span class="task-status-badge" :class="statusClass(selectedTask.status)">
                {{ selectedTask.status }}
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
            <div class="task-title-row">
              <div class="task-title-value">{{ selectedTask.title }}</div>
              <span v-if="selectedTask.assignee_name" class="task-assignee-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20 8V14M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                负责人: {{ selectedTask.assignee_name }}
              </span>
            </div>
            <div v-if="isTaskOverdue(selectedTask)" class="deadline-warning overdue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>已逾期</span>
            </div>
            <div v-else-if="isTaskNearDeadline(selectedTask)" class="deadline-warning near">
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
                  <span class="task-priority-badge" :class="priorityClass(selectedTask.priority)">
                    {{ selectedTask.priority }}
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
                  <span class="task-status-badge" :class="statusClass(selectedTask.status)">
                    {{ selectedTask.status }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 截止日期 -->
            <div class="task-info-card" v-if="selectedTask.date || selectedTask.dueDate || selectedTask.due_date">
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
                <div class="task-info-value">{{ selectedTask.date || selectedTask.dueDate || selectedTask.due_date }}</div>
              </div>
            </div>
            
            <!-- 创建人 -->
            <div class="task-info-card" v-if="selectedTask.created_by_name">
              <div class="task-info-icon creator">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="task-info-content">
                <div class="task-info-label">创建人</div>
                <div class="task-info-value">{{ selectedTask.created_by_name }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeTaskDetailModal" class="btn btn-primary">关闭</button>
        </div>
      </div>
    </div>
    </div>

    <!-- 分配任务模态框 -->
    <div v-if="assignTaskModalOpen && taskToAssign" class="modal-overlay" @click="closeAssignTaskModal">
      <div class="modal-content assign-task-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">分配任务</h3>
          <button class="modal-close" @click="closeAssignTaskModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="assign-task-info">
            <h4 class="assign-task-title">{{ taskToAssign.title }}</h4>
            <p class="assign-task-description">{{ taskToAssign.description || '暂无描述' }}</p>
          </div>
          
          <div class="form-field">
            <label class="form-label">选择负责人</label>
            <div class="member-select-list">
              <div 
                v-for="member in teamMembers" 
                :key="member.id" 
                class="member-select-item"
                :class="{ selected: selectedAssigneeId === member.id }"
                @click="selectedAssigneeId = member.id"
              >
                <div class="member-select-avatar">
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
                  <div v-else class="avatar-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="member-select-info">
                  <div class="member-select-name">{{ member.name }}</div>
                  <div class="member-select-role">{{ member.role }}</div>
                </div>
                <div class="member-select-indicator" v-if="selectedAssigneeId === member.id">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div v-if="teamMembers.length === 0" class="empty-members-hint">
              <p>暂无团队成员，请先邀请成员加入项目</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAssignTaskModal" class="btn secondary">取消</button>
          <button @click="confirmAssignTask" class="btn primary" :disabled="!selectedAssigneeId">确认分配</button>
        </div>
      </div>
    </div>

    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
      </div>

    <!-- 图片裁切Modal -->
    <div v-if="showCropModal" class="crop-modal-overlay">
      <div class="crop-modal-content" @click.stop>
        <div class="crop-modal-header">
          <h3>裁切项目图片</h3>
          <p class="crop-hint">请拖拽选择裁切区域，确保比例与项目广场显示一致</p>
        </div>
        <div class="crop-modal-body">
          <div class="crop-container">
            <canvas ref="cropCanvas" class="crop-canvas"></canvas>
            <div class="crop-overlay" ref="cropOverlay">
              <div class="crop-selection" ref="cropSelection">
                <!-- 调整大小的控制点 -->
                <div class="resize-handle resize-handle-nw" data-handle="nw"></div>
                <div class="resize-handle resize-handle-ne" data-handle="ne"></div>
                <div class="resize-handle resize-handle-sw" data-handle="sw"></div>
                <div class="resize-handle resize-handle-se" data-handle="se"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="crop-modal-footer">
          <button class="btn-cancel" @click="closeCropModal">重新选择图片</button>
          <button class="btn-confirm" @click="applyCrop">完成裁切</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/styles/ProjectDetail.css'
import { normalizeProjectCoverUrl, normalizeImageUrl, getDefaultProjectImage } from '@/utils/imageUtils'

export default {
  name: 'ProjectDetail',
  data() {
    return {
      taskTypeOpen: false,
      selectedTaskType: '',
      statusDropdownOpen: false,
      taskModalOpen: false,
      editProjectModalOpen: false,
      showToast: false,
      toastMessage: '',
      newTask: {
        title: '',
        description: '',
        dueDate: '',
        priority: '中',
        status: '待接取',
        dateError: ''
      },
      editProjectData: {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        visibility: 'PUBLIC',
        status: 'ONGOING'
      },
      project: null,
      tasks: [],
      teamMembers: [],
      inviteSlots: [],
      isLoading: true,
      taskListModalOpen: false,
      isCreatingTask: false, // 防止重复点击创建任务
      taskDetailModalOpen: false, // 任务详情弹窗
      selectedTask: null, // 当前选中的任务
      editTaskModalOpen: false, // 编辑任务弹窗
      editTaskData: {
        title: '',
        description: '',
        dueDate: '',
        priority: '中',
        taskId: null
      },
      // 邀请成员相关
      inviteMemberModalOpen: false, // 邀请成员弹窗
      userSearchKeyword: '', // 用户搜索关键词
      searchedUsers: [], // 搜索到的用户列表
      selectedUserIds: [], // 选中的用户ID数组（支持多选）
      isSearching: false, // 搜索中状态
      isInviting: false, // 邀请中状态
      hasSearched: false, // 是否已经搜索过
      searchDebounceTimer: null, // 搜索防抖定时器
      // 图片裁切相关
      showCropModal: false, // 是否显示裁切模态框
      originalImage: null, // 原始图片对象
      originalImageData: null, // 原始图片数据（DataURL）
      cropData: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      // 分配任务相关
      assignTaskModalOpen: false, // 分配任务模态框
      taskToAssign: null, // 待分配的任务
      selectedAssigneeId: null // 选中的负责人ID
    }
  },
  computed: {
    filteredTasks() {
      let tasks = this.tasks
      if (this.selectedTaskType) {
        tasks = tasks.filter(task => task.priority === this.selectedTaskType)
      }
      // 按创建时间排序，返回最新的5个任务
      return tasks
        .sort((a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id))
        .slice(0, 5)
    },
    allTasks() {
      // 返回所有任务（用于判断是否显示更多按钮）
      return this.tasks
    },
    allFilteredTasks() {
      // 返回所有任务（用于弹窗显示）
      let tasks = this.tasks
      if (this.selectedTaskType) {
        tasks = tasks.filter(task => task.priority === this.selectedTaskType)
      }
      return tasks
    },
    taskCount() {
      return Array.isArray(this.tasks) ? this.tasks.length : 0
    },
    participantCount() {
      if (Array.isArray(this.teamMembers) && this.teamMembers.length > 0) {
        return this.teamMembers.length
      }
      if (this.project && typeof this.project.teamSize === 'number') {
        return this.project.teamSize
      }
      return 0
    },
    isProjectManager() {
      // 判断当前用户是否是项目负责人
      const currentUserName = this.getCurrentUserName()
      return this.project && this.project.manager === currentUserName
    },
    // 获取今天的日期，格式为 YYYY-MM-DD
    today() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    }
  },
  mounted() {
    this.loadProject() // loadProject方法会自动调用loadProjectTasks
    document.addEventListener('click', this.handleClickOutside)
    
    // 🎯 监听精确的头像更新事件
    this.$eventBus.on(
      this.$EventTypes.USER_AVATAR_UPDATED, 
      this.handleAvatarUpdated,
      { debounce: 300 } // 300ms防抖，避免频繁更新
    )
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    
    // 取消事件监听
    this.$eventBus.off(this.$EventTypes.USER_AVATAR_UPDATED, this.handleAvatarUpdated)
  },
  methods: {
    openTaskListModal() {
      this.taskListModalOpen = true
    },
    closeTaskListModal() {
      this.taskListModalOpen = false
    },
    openTaskDetailModal(task) {
      this.selectedTask = task
      this.taskDetailModalOpen = true
    },
    closeTaskDetailModal() {
      this.taskDetailModalOpen = false
      this.selectedTask = null
    },
    goToTaskList() {
      // 跳转到任务列表页面
      console.log('手动跳转到任务列表页面，项目ID:', this.$route.params.id)
      this.$router.push(`/project/${this.$route.params.id}/tasks`)
    },
    /**
     * 从后端API加载项目任务数据
     */
    async loadProjectTasks() {
      const projectId = this.$route.params.id
      if (!projectId) {
        console.warn('项目ID不存在，无法加载任务')
        return
      }

      try {
        // 导入任务API
        const { taskAPI } = await import('@/api/task')
        
        // 调用后端API获取任务列表
        const response = await taskAPI.getProjectTasks(projectId, 0, 100) // 获取前100个任务
        
        // 检查返回结果
        if (response && response.code === 200 && response.data) {
          const tasksData = response.data
          
          // 处理分页数据
          let taskList = []
          if (tasksData.content && Array.isArray(tasksData.content)) {
            // 后端返回的是分页对象
            taskList = tasksData.content
          } else if (Array.isArray(tasksData)) {
            // 后端返回的是数组
            taskList = tasksData
          }
          
          // 转换任务数据格式，优先使用后端返回的创建人信息，如果没有则使用本地用户信息
          const currentUserId = this.getCurrentUserId()
          const currentUserName = this.getCurrentUserName()
          
          this.tasks = taskList.map(task => {
            // ✅ 解析执行者信息（后端返回的是TaskDetailDTO.assignees数组）
            let assigneeIds = []
            let assigneeNames = ''
            
            if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
              // 后端返回的是 assignees: [{userId, userName, email, avatarUrl}]
              // 保持userId为字符串类型，避免精度丢失
              assigneeIds = task.assignees.map(a => String(a.userId))
              assigneeNames = task.assignees.map(a => a.userName).join(', ')
            }
            
            return {
              id: task.id,
              title: task.title,
              description: task.description || '',
              date: task.dueDate || task.due_date || '',
              due_date: task.dueDate || task.due_date,
              dueDate: task.dueDate || task.due_date,
              priority: this.getPriorityDisplay(task.priority || 'MEDIUM'),
              priority_value: task.priority || 'MEDIUM',
              status: this.getStatusDisplay(task.status || 'TODO'),
              status_value: task.status || 'TODO',
              assignee_id: assigneeIds,
              assignee_name: assigneeNames,
              created_by: task.createdBy || currentUserId,
              // 如果后端返回的创建人是"未知用户"（auth服务不可用），使用本地用户信息
              created_by_name: task.creatorName === '未知用户' ? currentUserName : (task.creatorName || currentUserName),
              showStatusMenu: false // 初始化状态菜单为关闭
            }
          })
          
          console.log('[loadProjectTasks] 转换后的任务数据:', this.tasks)
          
          // 同步更新到localStorage
          this.saveProjectData()
          
        } else {
          console.warn('[loadProjectTasks] API返回数据格式异常:', response)
          // 如果API返回失败，尝试从localStorage加载
          this.loadTasksFromLocalStorage()
        }
      } catch (error) {
        console.error('[loadProjectTasks] 加载任务失败:', error)
        // 发生错误时，尝试从localStorage加载
        this.loadTasksFromLocalStorage()
      }
    },
    
    /**
     * 从localStorage加载任务数据（作为后备方案）
     */
    loadTasksFromLocalStorage() {
      const projectId = this.$route.params.id
      const savedProjects = localStorage.getItem('projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const foundProject = projects.find(p => String(p.id) === String(projectId))
        
        if (foundProject && foundProject.tasks) {
          // 从localStorage加载任务（已简化日志）
          
          this.tasks = (foundProject.tasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            date: task.due_date || task.dueDate || task.date || '',
            due_date: task.due_date || task.dueDate,
            priority: this.getPriorityDisplay(task.priority || 'MEDIUM'),
            priority_value: task.priority || 'MEDIUM',
            status: this.getStatusDisplay(task.status_value || task.status || 'ONGOING'),
            status_value: task.status_value || task.status || 'ONGOING',
            assignee_id: task.assignee_id || [],
            created_by: task.created_by || 1,
            created_by_name: this.getUserNameById(task.created_by || 1),
            showStatusMenu: false
          }))
        }
      }
    },
    
    async loadProject() {
      const projectId = this.$route.params.id
      
      // 先尝试从缓存加载，立即显示
      try {
        const cachedProject = localStorage.getItem(`project_detail_${projectId}`)
        if (cachedProject) {
          const parsed = JSON.parse(cachedProject)
          // 检查缓存是否过期（3分钟）
          if (parsed.timestamp && Date.now() - parsed.timestamp < 3 * 60 * 1000) {
            this.project = parsed.data.project
            this.teamMembers = parsed.data.teamMembers || []
            this.tasks = parsed.data.tasks || []
            this.isLoading = false
            // 后台更新数据
            this.loadProjectFromAPI()
            return
          }
        }
      } catch (e) {
        // 缓存读取失败，继续从API加载
      }
      
      // 优先从后端API获取最新的项目数据
      try {
        const { projectAPI } = await import('@/api/project')
        const response = await projectAPI.getProjectById(projectId)
        
        if (response && response.code === 200 && response.data) {
          const apiProject = response.data
          
          // 使用API返回的最新数据
          this.project = {
            id: apiProject.id,
            name: apiProject.name,
            title: apiProject.name,
            description: apiProject.description || '暂无描述',
            startDate: apiProject.startDate || '',
            endDate: apiProject.endDate || '',
            period: (apiProject.startDate && apiProject.endDate) ? 
              `${apiProject.startDate} 至 ${apiProject.endDate}` : 
              '未设置',
            status: apiProject.status || 'PLANNING',
            visibility: apiProject.visibility || 'PRIVATE',
            imageUrl: normalizeProjectCoverUrl(apiProject.imageUrl) || getDefaultProjectImage('Project Image'),
            image: normalizeProjectCoverUrl(apiProject.imageUrl),
            manager: apiProject.creatorName || '未知', // 使用项目的创建者名称作为负责人
            teamSize: apiProject.teamSize || 1,
            category: apiProject.category || '其他',
            aiCore: '待定',
            tags: apiProject.tags || [],
            tasks: [],
            created_by: apiProject.creatorId || 1,
            creatorName: apiProject.creatorName || '未知' // 保存创建者名称
          }
          
          // 并行加载团队成员和任务数据，提升加载速度
          this.isLoading = false
          Promise.all([
            this.loadTeamMembers(),
            this.loadProjectTasks()
          ]).then(() => {
            // 加载完团队成员后，更新负责人为项目拥有者（如果有的话）
            this.updateManagerFromTeamMembers()
            // 保存到缓存
            this.saveProjectDetailCache()
          }).catch(error => {
            console.error('并行加载数据时出错:', error)
          })
          return
        }
      } catch (error) {
        console.error('从API加载项目失败，回退到localStorage:', error)
      }
      
      // 如果API失败，从localStorage加载项目数据（作为后备）
      const savedProjects = localStorage.getItem('projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        
        // 使用字符串比较，因为后端返回的是字符串ID
        const foundProject = projects.find(p => String(p.id) === String(projectId))
        
        if (foundProject) {
          // 将项目广场的数据格式转换为详情页面的格式
          this.project = {
            id: foundProject.id,
            name: foundProject.name || foundProject.title,
            title: foundProject.title || foundProject.name,
            description: foundProject.description || foundProject.dataAssets || foundProject.direction || '暂无描述',
            startDate: foundProject.startDate || foundProject.start_date || '',
            endDate: foundProject.endDate || foundProject.end_date || '',
            period: (foundProject.start_date || foundProject.startDate) && (foundProject.end_date || foundProject.endDate) ? 
              `${foundProject.start_date || foundProject.startDate} 至 ${foundProject.end_date || foundProject.endDate}` : 
              '未设置',
            status: this.getStatusValue(foundProject.status),
            visibility: foundProject.visibility || 'PRIVATE',
            imageUrl: normalizeProjectCoverUrl(foundProject.imageUrl || foundProject.image) || getDefaultProjectImage('Project Image'),
            image: normalizeProjectCoverUrl(foundProject.image || foundProject.imageUrl),
            manager: foundProject.creatorName || '未知',
            teamSize: foundProject.teamSize,
            category: foundProject.category,
            aiCore: foundProject.aiCore,
            tags: foundProject.tags || [],
            tasks: foundProject.tasks || [],
            created_by: foundProject.created_by || 1,
            creatorName: foundProject.creatorName || '未知'
          }
          
          // 加载团队成员数据
          this.teamMembers = foundProject.teamMembers || []
          this.inviteSlots = foundProject.inviteSlots || []
          
          // 从团队成员中查找项目拥有者，更新负责人
          this.updateManagerFromTeamMembers()
          
          // 并行加载任务和团队成员数据
          this.isLoading = false
          Promise.all([
            this.loadProjectTasks(),
            this.loadTeamMembers()
          ]).then(() => {
            this.updateManagerFromTeamMembers()
            this.saveProjectDetailCache()
          }).catch(error => {
            console.error('并行加载数据时出错:', error)
          })
        } else {
          this.project = {
            id: projectId,
            title: '项目不存在',
            description: '抱歉，未找到指定的项目',
            period: '未知',
            status: '未知',
            manager: '未知'
          }
          this.isLoading = false
        }
      } else {
        this.project = {
          id: projectId,
          title: '项目不存在',
          description: '抱歉，未找到指定的项目',
          period: '未知',
          status: '未知',
          manager: '未知'
        }
        this.isLoading = false
      }
    },
    
    async loadProjectFromAPI() {
      // 后台更新项目数据
      try {
        const { projectAPI } = await import('@/api/project')
        const projectId = this.$route.params.id
        const response = await projectAPI.getProjectById(projectId)
        
        if (response && response.code === 200 && response.data) {
          const apiProject = response.data
          
          this.project = {
            id: apiProject.id,
            name: apiProject.name,
            title: apiProject.name,
            description: apiProject.description || '暂无描述',
            startDate: apiProject.startDate || '',
            endDate: apiProject.endDate || '',
            period: (apiProject.startDate && apiProject.endDate) ? 
              `${apiProject.startDate} 至 ${apiProject.endDate}` : 
              '未设置',
            status: apiProject.status || 'PLANNING',
            visibility: apiProject.visibility || 'PRIVATE',
            imageUrl: normalizeProjectCoverUrl(apiProject.imageUrl) || getDefaultProjectImage('Project Image'),
            image: normalizeProjectCoverUrl(apiProject.imageUrl),
            manager: apiProject.creatorName || '未知',
            teamSize: apiProject.teamSize || 1,
            category: apiProject.category || '其他',
            aiCore: '待定',
            tags: apiProject.tags || [],
            tasks: [],
            created_by: apiProject.creatorId || 1,
            creatorName: apiProject.creatorName || '未知'
          }
          
          // 并行加载团队成员和任务数据
          await Promise.all([
            this.loadTeamMembers(),
            this.loadProjectTasks()
          ])
          
          this.updateManagerFromTeamMembers()
          this.saveProjectDetailCache()
        }
      } catch (error) {
        console.error('后台更新项目数据失败:', error)
      }
    },
    
    saveProjectDetailCache() {
      // 保存项目详情到缓存
      try {
        const projectId = this.$route.params.id
        localStorage.setItem(`project_detail_${projectId}`, JSON.stringify({
          data: {
            project: this.project,
            teamMembers: this.teamMembers,
            tasks: this.tasks
          },
          timestamp: Date.now()
        }))
      } catch (e) {
        // 忽略缓存写入错误
      }
    },
    
    loadTeamMembersFromLocalStorage() {
      const projectId = this.$route.params.id
      const savedProjects = localStorage.getItem('projects')
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const foundProject = projects.find(p => String(p.id) === String(projectId))
        
        if (foundProject) {
          this.teamMembers = foundProject.teamMembers || [
            { id: 1, name: this.getCurrentUserName(), role: '项目负责人', avatar: null }
          ]
          this.inviteSlots = foundProject.inviteSlots || []
        }
      }
      
      // 如果没有找到，使用默认值
      if (!this.teamMembers || this.teamMembers.length === 0) {
        this.teamMembers = [
          { id: 1, name: this.getCurrentUserName(), role: '项目负责人', avatar: null }
        ]
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    goToProjectKnowledge() {
      const projectId = this.$route.params.id || this.project?.id
      console.log('跳转到项目知识库，项目ID:', projectId, '路由路径:', `/project-knowledge/${projectId}`)
      if (!projectId) {
        console.error('项目ID为空，无法跳转')
        alert('项目ID无效，无法跳转到知识库')
        return
      }
      // 使用路由名称跳转，更可靠
      this.$router.push({
        name: 'ProjectKnowledge',
        params: { id: String(projectId) }
      }).catch(err => {
        // 如果路由名称失败，回退到路径跳转
        if (err.name !== 'NavigationDuplicated') {
          console.error('路由跳转失败:', err)
          this.$router.push(`/project-knowledge/${projectId}`).catch(e => {
            console.error('路径跳转也失败:', e)
          })
        }
      })
    },
    goToAIAssistant() {
      const projectId = this.project?.id || this.$route.params.id
      this.$router.push({ path: '/ai-assistant', query: { projectId } })
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
      // 打开邀请成员弹窗
      this.inviteMemberModalOpen = true
      this.userSearchKeyword = ''
      this.searchedUsers = []
      this.selectedUserIds = [] // 清空选中的用户列表
      this.hasSearched = false
    },
    closeInviteMemberModal() {
      this.inviteMemberModalOpen = false
      this.userSearchKeyword = ''
      this.searchedUsers = []
      this.selectedUserIds = [] // 清空选中的用户列表
      this.hasSearched = false
      this.isSearching = false
      this.isInviting = false
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
    },
    handleSearchInput() {
      // 防抖搜索：用户停止输入300ms后自动搜索
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      
      if (this.userSearchKeyword.trim()) {
        this.searchDebounceTimer = setTimeout(() => {
          this.searchUsers()
        }, 300)
      } else {
        this.searchedUsers = []
        this.hasSearched = false
      }
    },
    async searchUsers() {
      if (!this.userSearchKeyword.trim()) {
        this.showSuccessToast('请输入搜索关键词')
        return
      }
      
      this.isSearching = true
      this.hasSearched = false
      
      try {
        const { projectAPI } = await import('@/api/project')
        const response = await projectAPI.searchUsers(this.userSearchKeyword.trim(), 0, 20)
        
        console.log('搜索用户响应:', response)
        
        if (response && response.code === 200) {
          // 处理分页数据或直接的用户列表
          if (response.data && response.data.content) {
            this.searchedUsers = response.data.content
          } else if (Array.isArray(response.data)) {
            this.searchedUsers = response.data
          } else {
            this.searchedUsers = []
          }
          
          this.hasSearched = true
          console.log('搜索到的用户:', this.searchedUsers)
        } else {
          this.showSuccessToast(response?.msg || '搜索失败')
          this.searchedUsers = []
          this.hasSearched = true
        }
      } catch (error) {
        console.error('搜索用户失败:', error)
        this.showSuccessToast('搜索用户失败: ' + (error.message || '网络错误'))
        this.searchedUsers = []
        this.hasSearched = true
      } finally {
        this.isSearching = false
      }
    },
    selectUser(user) {
      // 后端返回的字段是 id，不是 userId
      const userId = user.id || user.userId
      const index = this.selectedUserIds.indexOf(userId)
      
      if (index > -1) {
        // 已选中，则取消选中
        this.selectedUserIds.splice(index, 1)
        console.log('取消选中用户:', user.name, '当前已选:', this.selectedUserIds.length)
      } else {
        // 未选中，则添加到选中列表
        this.selectedUserIds.push(userId)
        console.log('选中用户:', user.name, '当前已选:', this.selectedUserIds.length)
      }
    },
    async confirmInvite() {
      if (this.selectedUserIds.length === 0) {
        this.showSuccessToast('请先选择要邀请的用户')
        return
      }
      
      this.isInviting = true
      
      try {
        const { projectAPI } = await import('@/api/project')
        const projectId = this.$route.params.id
        
        // 批量邀请用户
        let successCount = 0
        let failCount = 0
        
        for (const userId of this.selectedUserIds) {
          try {
            const response = await projectAPI.inviteMember(projectId, {
              userId: userId,
              role: 'MEMBER' // 默认角色为普通成员
            })
            
            if (response && response.code === 200) {
              successCount++
            } else {
              failCount++
              console.error('邀请用户失败:', userId, response?.msg)
            }
          } catch (error) {
            failCount++
            console.error('邀请用户异常:', userId, error)
          }
        }
        
        // 显示邀请结果
        if (successCount > 0 && failCount === 0) {
          this.showSuccessToast(`成功邀请 ${successCount} 位用户！`)
        } else if (successCount > 0 && failCount > 0) {
          this.showSuccessToast(`成功邀请 ${successCount} 位，失败 ${failCount} 位`)
        } else {
          this.showSuccessToast('邀请失败，请重试')
        }
        
        if (successCount > 0) {
          this.closeInviteMemberModal()
          // 重新加载团队成员列表
          this.loadTeamMembers()
        }
      } catch (error) {
        console.error('邀请成员失败:', error)
        this.showSuccessToast('邀请失败: ' + (error.message || '网络错误'))
      } finally {
        this.isInviting = false
      }
    },
    async loadTeamMembers() {
      try {
        const { projectAPI } = await import('@/api/project')
        const projectId = this.$route.params.id
        
        const response = await projectAPI.getProjectMembers(projectId, 0, 50)
        
        if (response && response.code === 200) {
          // 处理成员数据
          if (response.data && response.data.content) {
            this.teamMembers = response.data.content.map(member => ({
              id: String(member.userId),  // 确保 id 是字符串
              name: member.username || member.name || '未知用户',
              role: member.roleName || member.role || '成员',
              avatar: this.parseAvatarUrl(member.avatar)
            }))
          } else if (Array.isArray(response.data)) {
            this.teamMembers = response.data.map(member => ({
              id: String(member.userId),  // 确保 id 是字符串
              name: member.username || member.name || '未知用户',
              role: member.roleName || member.role || '成员',
              avatar: this.parseAvatarUrl(member.avatar)
            }))
          }

          // 将团队成员数量写入缓存，供项目广场读取显示
          try {
            const cacheKey = `project_member_count_${projectId}`
            localStorage.setItem(cacheKey, String(this.teamMembers.length))
          } catch (e) {
            console.warn('写入成员数量缓存失败:', e?.message || e)
          }
          
          // 加载完团队成员后，更新负责人为项目拥有者（如果有的话）
          this.updateManagerFromTeamMembers()
        }
      } catch (error) {
        console.error('加载团队成员失败:', error)
        // 失败时保留原有数据
      }
    },
    handleAvatarUpdated({ userId, avatarUrl }) {
      // 💡 局部更新：只更新该用户的头像，无需重新请求整个成员列表
      console.log('🔔 ProjectDetail收到头像更新事件:', {
        userId,
        userIdType: typeof userId,
        avatarUrl: avatarUrl.substring(0, 50) + '...',
        teamMembersCount: this.teamMembers.length,
        teamMemberIds: this.teamMembers.map(m => ({ id: m.id, type: typeof m.id }))
      })
      
      // userId 和 member.id 都已经是字符串，直接比较
      const member = this.teamMembers.find(m => m.id === userId)
      if (member) {
        console.log('✅ 找到成员:', member.name)
        console.log('更新前的头像:', member.avatar?.substring(0, 50))
        this.$set(member, 'avatar', avatarUrl)
        console.log(`✅ 已更新团队成员 ${member.name}(${userId}) 的头像`)
        console.log('更新后的头像:', member.avatar?.substring(0, 50))
        // 强制Vue更新视图
        this.$forceUpdate()
      } else {
        console.warn(`⚠️ 用户 ${userId} 不在当前项目成员列表中`)
        console.warn('当前成员列表:', this.teamMembers.map(m => ({ id: m.id, name: m.name })))
      }
    },
    updateManagerFromTeamMembers() {
      // 从团队成员中查找项目拥有者
      // 可能的角色名称：OWNER, PROJECT_OWNER, 项目负责人, 项目拥有者
      const ownerRoles = ['OWNER', 'PROJECT_OWNER', '项目负责人', '项目拥有者', '负责人']
      
      const owner = this.teamMembers.find(member => {
        const role = (member.role || '').toUpperCase()
        return ownerRoles.some(ownerRole => role === ownerRole.toUpperCase() || role.includes(ownerRole.toUpperCase()))
      })
      
      if (owner) {
        // 如果找到了项目拥有者，使用其名称作为负责人
        this.project.manager = owner.name
        console.log('从团队成员中找到项目拥有者:', owner.name, '角色:', owner.role)
      } else if (this.project.creatorName && this.project.creatorName !== '未知') {
        // 如果没找到拥有者，使用创建者名称
        this.project.manager = this.project.creatorName
        console.log('使用项目创建者作为负责人:', this.project.creatorName)
      } else {
        // 如果都没有，保持默认值或显示未知
        console.log('未找到项目拥有者，负责人保持为:', this.project.manager)
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
      console.log('查找项目ID:', this.project.id, '类型:', typeof this.project.id)
      
      // 使用字符串比较确保ID匹配
      const projectIndex = savedProjects.findIndex(p => String(p.id) === String(this.project.id))
      
      if (projectIndex !== -1) {
        // 更新项目的所有字段
        savedProjects[projectIndex] = {
          ...savedProjects[projectIndex],
          id: this.project.id, // 确保ID被保存
          name: this.project.name,
          title: this.project.title,
          description: this.project.description,
          startDate: this.project.startDate,
          endDate: this.project.endDate,
          visibility: this.project.visibility,
          status: this.project.status,
          imageUrl: this.project.imageUrl || this.project.image,
          image: this.project.image || this.project.imageUrl,
          teamMembers: this.teamMembers,
          inviteSlots: this.inviteSlots,
          tasks: this.tasks
        }
        
        localStorage.setItem('projects', JSON.stringify(savedProjects))
        
        console.log('项目数据已保存到localStorage，项目ID:', this.project.id)
        console.log('保存的任务数据:', this.tasks.map(t => ({ title: t.title, status: t.status, status_value: t.status_value })))
      } else {
        console.log('未找到项目，无法保存数据。项目ID:', this.project.id)
        console.log('现有项目ID列表:', savedProjects.map(p => ({ id: p.id, type: typeof p.id })))
      }
    },
    // 项目操作按钮功能
    editProject() {
      // 初始化编辑数据
      // 确保status是数据库的英文值
      const statusValue = this.getStatusValue(this.project.status)
      
      this.editProjectData = {
        name: this.project.name || this.project.title,
        description: this.project.description || '',
        startDate: this.project.startDate || '',
        endDate: this.project.endDate || '',
        visibility: this.project.visibility || 'PRIVATE',
        status: statusValue || 'ONGOING',
        imageUrl: this.project.imageUrl || this.project.image || getDefaultProjectImage('Project Image')
      }
      
      console.log('编辑项目数据初始化:', this.editProjectData)
      this.editProjectModalOpen = true
    },
    closeEditProjectModal() {
      this.editProjectModalOpen = false
    },
    async saveProjectUpdate() {
      if (!this.editProjectData.name.trim()) {
        alert('请输入项目名称')
        return
      }
      
      try {
        // 使用项目API模块更新项目
        const { projectAPI } = await import('@/api/project')
        
        console.log('使用项目API模块更新项目...')
        console.log('项目ID:', this.project.id, '类型:', typeof this.project.id)
        console.log('更新数据:', this.editProjectData)
        
        const response = await projectAPI.updateProject(this.project.id, this.editProjectData)
        
        console.log('更新项目API返回结果:', response)
        console.log('更新后的项目数据:', response.data)
        
        // 检查API返回结果
        if (response.code === 200) {
          // 使用后端返回的最新数据更新本地项目
          if (response.data) {
            // 更新项目ID（确保使用后端返回的ID）
            this.project.id = response.data.id
            this.project.name = response.data.name
            this.project.title = response.data.name
            this.project.description = response.data.description
            this.project.startDate = response.data.startDate
            this.project.endDate = response.data.endDate
            this.project.visibility = response.data.visibility
            this.project.status = response.data.status
            this.project.imageUrl = response.data.imageUrl
            this.project.image = response.data.imageUrl
            
            // 更新项目周期显示
            if (response.data.startDate && response.data.endDate) {
              this.project.period = `${response.data.startDate} 至 ${response.data.endDate}`
            }
            
            console.log('项目更新成功，最新项目ID:', this.project.id)
            console.log('更新后的项目完整数据:', this.project)
          } else {
            // 如果后端没有返回数据，使用编辑表单的数据
            this.project.name = this.editProjectData.name
            this.project.title = this.editProjectData.name
            this.project.description = this.editProjectData.description
            this.project.startDate = this.editProjectData.startDate
            this.project.endDate = this.editProjectData.endDate
            this.project.visibility = this.editProjectData.visibility
            this.project.status = this.editProjectData.status
            
            // 更新项目周期显示
            if (this.editProjectData.startDate && this.editProjectData.endDate) {
              this.project.period = `${this.editProjectData.startDate} 至 ${this.editProjectData.endDate}`
            }
          }
          
          // 保存到localStorage
          this.saveProjectData()
          
          this.closeEditProjectModal()
          this.showSuccessToast('项目更新成功！')
        } else {
          alert('更新失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('更新项目失败:', error)
        alert('更新项目失败，请稍后重试')
      }
    },
    async changeStatus(newStatus) {
      // 更改项目状态
      if (newStatus && newStatus !== this.project.status) {
        try {
          // 使用项目API模块更新项目状态
          const { projectAPI } = await import('@/api/project')
          
          console.log('使用项目API模块更新项目状态...')
          const response = await projectAPI.updateProjectStatus(this.project.id, newStatus)
          
          console.log('更新项目状态API返回结果:', response)
          
          // 检查API返回结果
          if (response.code === 200) {
            this.project.status = newStatus
            this.saveProjectData()
            this.statusDropdownOpen = false
            this.showSuccessToast('项目状态已更新！')
            console.log('项目状态已更改为:', newStatus)
          } else {
            alert('状态更新失败：' + (response.msg || '未知错误'))
          }
        } catch (error) {
          console.error('更新项目状态失败:', error)
          alert('更新项目状态失败，请稍后重试')
        }
      }
    },
    async deleteProject() {
      if (confirm('确定要删除此项目吗？\n\n此操作不可撤销！项目及其所有数据将被永久删除。')) {
        try {
          // 使用项目API模块删除项目
          const { projectAPI } = await import('@/api/project')
          
          console.log('====== 开始删除项目 ======')
          console.log('项目ID:', this.project.id, '类型:', typeof this.project.id)
          console.log('项目名称:', this.project.name || this.project.title)
          
          const response = await projectAPI.deleteProject(this.project.id)
          
          console.log('删除项目API返回结果:', response)
          console.log('返回code:', response?.code)
          console.log('返回msg:', response?.msg)
          
          // 检查API返回结果
          if (response && response.code === 200) {
            console.log('项目删除成功，准备清理本地数据')
            
            // 从localStorage中删除项目
            const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
            console.log('删除前的项目列表:', savedProjects.map(p => ({ id: p.id, name: p.name || p.title })))
            
            // 使用字符串比较确保正确匹配
            const updatedProjects = savedProjects.filter(p => String(p.id) !== String(this.project.id))
            console.log('删除后的项目列表:', updatedProjects.map(p => ({ id: p.id, name: p.name || p.title })))
            
            localStorage.setItem('projects', JSON.stringify(updatedProjects))
            
            this.showSuccessToast('项目删除成功！')
            console.log('====== 项目删除完成，即将跳转 ======')
            
            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
              this.$router.push('/project-square')
            }, 1500)
          } else {
            const errorMsg = response?.msg || '未知错误'
            console.error('删除失败，错误信息:', errorMsg)
            alert('删除失败：' + errorMsg)
          }
        } catch (error) {
          console.error('====== 删除项目异常 ======')
          console.error('错误类型:', error.constructor.name)
          console.error('错误信息:', error.message)
          console.error('错误详情:', error)
          
          // 处理不同类型的错误
          let errorMessage = '删除项目失败，请稍后重试'
          
          if (error.response) {
            // 服务器返回错误响应
            console.error('服务器错误响应:', error.response.status, error.response.data)
            errorMessage = error.response.data?.msg || `服务器错误 (${error.response.status})`
          } else if (error.request) {
            // 请求已发送但没有收到响应
            console.error('网络错误，未收到响应')
            errorMessage = '网络连接失败，请检查网络连接'
          } else if (error.msg) {
            // 后端返回的错误信息
            errorMessage = error.msg
          }
          
          alert(errorMessage)
        }
      } else {
        console.log('用户取消删除项目')
      }
    },
    // 验证新建任务截止日期
    validateNewTaskDueDate() {
      this.newTask.dateError = ''
      if (this.newTask.dueDate && new Date(this.newTask.dueDate) < new Date(this.today)) {
        this.newTask.dateError = '任务截止日期不能早于今天'
        return false
      }
      return true
    },
    // 任务操作功能
    createTask() {
      this.taskModalOpen = true
      // 重置表单
      this.newTask = {
        title: '',
        description: '',
        dueDate: '',
        priority: '中',
        status: '待接取',
        dateError: ''
      }
    },
    closeTaskModal() {
      this.taskModalOpen = false
    },
    async saveNewTask() {
      // 防止重复点击
      if (this.isCreatingTask) {
        console.log('[saveNewTask] 任务正在创建中，忽略重复点击')
        return
      }
      
      if (!this.newTask.title.trim()) {
        alert('请输入任务标题')
        return
      }
      
      // 验证截止日期不能早于今天
      if (this.newTask.dueDate && new Date(this.newTask.dueDate) < new Date(this.today)) {
        alert('任务截止日期不能早于今天')
        return
      }
      
      // 设置创建中状态
      this.isCreatingTask = true
      
      try {
        // 导入任务API
        const { taskAPI } = await import('@/api/task')
        
        // 构建任务数据（使用后端需要的格式）
        const taskData = {
          projectId: this.project.id,
          title: this.newTask.title.trim(),
          description: this.newTask.description.trim(),
          priority: this.getPriorityValue(this.newTask.priority), // 转换为英文枚举值
          dueDate: this.newTask.dueDate || null,
          assigneeIds: [] // 新任务默认没有执行者
        }
        
        console.log('[saveNewTask] 创建任务，数据:', taskData)
        
        // 调用后端API创建任务
        const response = await taskAPI.createTask(taskData)
        
        console.log('[saveNewTask] API返回结果:', response)
        
        if (response && response.code === 200) {
          // 创建成功，重新加载任务列表
          await this.loadProjectTasks()
          
          this.closeTaskModal()
          this.showSuccessToast('任务创建成功！')
        } else {
          // 检查是否是401认证错误
          if (response && response.code === 401) {
            alert('登录已过期，请重新登录')
            // 清除token并跳转到登录页
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_info')
            window.location.href = '/login'
          } else {
            alert('创建任务失败：' + (response.msg || '未知错误'))
          }
        }
      } catch (error) {
        console.error('[saveNewTask] 创建任务失败:', error)
        
        // 检查是否是401认证错误
        if (error && (error.code === 401 || error.status === 401 || 
            (error.response && error.response.status === 401))) {
          alert('登录已过期，请重新登录')
          // 清除token并跳转到登录页
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_info')
          window.location.href = '/login'
        } else {
          // 检查错误消息中是否包含认证相关信息
          const errorMsg = error?.msg || error?.message || String(error)
          if (errorMsg.includes('登录') || errorMsg.includes('Token') || errorMsg.includes('认证')) {
            alert('登录已过期，请重新登录')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_info')
            window.location.href = '/login'
          } else {
            alert('创建任务失败：' + errorMsg)
          }
        }
      } finally {
        // 1秒后才能再次点击
        setTimeout(() => {
          this.isCreatingTask = false
        }, 1000)
      }
    },
    editTask(task) {
      // 设置编辑数据
      this.editTaskData = {
        title: task.title,
        description: task.description || '',
        dueDate: task.date || task.dueDate || '',
        priority: task.priority,
        taskId: task.id
      }
      // 打开编辑弹窗
      this.editTaskModalOpen = true
    },
    closeEditTaskModal() {
      this.editTaskModalOpen = false
      this.editTaskData = {
        title: '',
        description: '',
        dueDate: '',
        priority: '中',
        taskId: null
      }
    },
    async saveEditTask() {
      if (!this.editTaskData.title.trim()) {
        alert('请输入任务标题')
        return
      }
      
      // 验证截止日期不能早于今天
      if (this.editTaskData.dueDate && new Date(this.editTaskData.dueDate) < new Date(this.today)) {
        alert('任务截止日期不能早于今天')
        return
      }
      
      try {
        // 导入任务API
        const { taskAPI } = await import('@/api/task')
        
        // 构建更新数据
        const updateData = {
          title: this.editTaskData.title.trim(),
          description: this.editTaskData.description.trim(),
          priority: this.getPriorityValue(this.editTaskData.priority),
          dueDate: this.editTaskData.dueDate || null
        }
        
        console.log('[saveEditTask] 更新任务，ID:', this.editTaskData.taskId, '数据:', updateData)
        
        // 调用后端API更新任务
        const response = await taskAPI.updateTask(this.editTaskData.taskId, updateData)
        
        console.log('[saveEditTask] API返回结果:', response)
        
        if (response && response.code === 200) {
          // 更新成功，重新加载任务列表
          await this.loadProjectTasks()
          
          this.closeEditTaskModal()
          this.showSuccessToast('任务更新成功！')
        } else {
          alert('更新任务失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('[saveEditTask] 更新任务失败:', error)
        alert('更新任务失败，请稍后重试')
      }
    },
    validateEditTaskDueDate() {
      this.editTaskData.dateError = ''
      if (this.editTaskData.dueDate && new Date(this.editTaskData.dueDate) < new Date(this.today)) {
        this.editTaskData.dateError = '任务截止日期不能早于今天'
        return false
      }
      return true
    },
    async deleteTask(taskId) {
      if (!confirm('确定要删除此任务吗？')) {
        return
      }
      
      try {
        // 导入任务API
        const { taskAPI } = await import('@/api/task')
        
        console.log('[deleteTask] 删除任务，任务ID:', taskId)
        
        // 调用后端API删除任务
        const response = await taskAPI.deleteTask(taskId)
        
        console.log('[deleteTask] API返回结果:', response)
        
        if (response && response.code === 200) {
          console.log('[deleteTask] ✅ 任务删除成功，重新从后端加载任务列表')
          
          // ✅ 重新从后端加载最新的任务列表，确保数据一致性
          await this.loadProjectTasks()
          
          this.showSuccessToast('任务已删除！')
        } else {
          alert('删除任务失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('[deleteTask] 删除任务失败:', error)
        alert('删除任务失败，请稍后重试')
      }
    },
    handleClickOutside(event) {
      if (!event.target.closest('.dropdown')) {
        this.taskTypeOpen = false
        this.statusDropdownOpen = false
      }
    },
    getCurrentUserId() {
      // 从localStorage获取当前用户ID
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userInfo = JSON.parse(savedUserInfo)
          return userInfo.id || null
        } catch (error) {
          console.error('解析用户信息失败:', error)
          return null
        }
      }
      return null
    },
    getCurrentUserName() {
      // 从localStorage获取当前用户姓名
      const savedUserInfo = localStorage.getItem('user_info')
      if (savedUserInfo) {
        try {
          const userInfo = JSON.parse(savedUserInfo)
          return userInfo.name || userInfo.nickname || '用户'
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
    getStatusDisplay(status) {
      // 将数据库的英文状态转换为中文显示
      const statusMap = {
        // 项目状态
        'PLANNING': '规划中',
        'ONGOING': '进行中',
        'COMPLETED': '已完成',
        'ARCHIVED': '已归档',
        // 任务状态（后端枚举：TODO, IN_PROGRESS, BLOCKED, DONE）
        'TODO': '待接取',
        'IN_PROGRESS': '进行中',
        'BLOCKED': '阻塞',
        'DONE': '完成',
        // 兼容旧数据
        'PENDING': '待接取',
        'CANCELLED': '已取消'
      }
      return statusMap[status] || status || '未知'
    },
    getStatusValue(status) {
      // 将中文状态转换为数据库的英文枚举值
      const reverseMap = {
        // 项目状态映射
        '规划中': 'PLANNING',
        '进行中': 'IN_PROGRESS',
        '已完成': 'COMPLETED',
        '已归档': 'ARCHIVED',
        // 任务状态映射（后端枚举：TODO, IN_PROGRESS, BLOCKED, DONE）
        '待接取': 'TODO',
        '阻塞': 'BLOCKED',
        '完成': 'DONE',
        '已取消': 'CANCELLED'
      }
      
      // ✅ 先检查是否在映射表中
      if (reverseMap[status]) {
        return reverseMap[status]
      }
      
      // ✅ 如果已经是大写枚举值（如 TODO, IN_PROGRESS），直接返回
      const validEnums = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'PLANNING', 'ONGOING', 'COMPLETED', 'ARCHIVED', 'CANCELLED']
      if (status && validEnums.includes(status.toUpperCase())) {
        return status.toUpperCase()
      }
      
      // ✅ 默认返回TODO
      return 'TODO'
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
    async changeTaskStatus(task, newStatus) {
      try {
        // 导入任务API
        const { taskAPI } = await import('@/api/task')
        
        // 将中文状态转换为后端枚举值
        const statusValue = this.getStatusValue(newStatus)
        
        console.log(`[changeTaskStatus] 更新任务状态，任务ID: ${task.id}, 新状态: ${newStatus} (${statusValue})`)
        
        // 调用后端API更新任务状态
        const response = await taskAPI.updateTaskStatus(task.id, statusValue)
        
        console.log('[changeTaskStatus] API返回结果:', response)
        
        if (response && response.code === 200) {
          console.log('[changeTaskStatus] ✅ 任务状态更新成功，重新加载任务列表')
          
          // 关闭状态菜单
          this.$set(task, 'showStatusMenu', false)
          
          // ✅ 重新从后端加载最新的任务列表，确保数据一致性
          await this.loadProjectTasks()
          
          this.showSuccessToast('任务状态已更新！')
          
          console.log(`任务"${task.title}"状态已更改为: ${newStatus} (${statusValue})`)
          
          // 触发全局事件，通知其他页面状态已更新
          this.$root.$emit('taskStatusChanged', {
            projectId: this.project.id,
            taskId: task.id,
            newStatus: newStatus,
            statusValue: statusValue
          })
        } else {
          alert('更新任务状态失败：' + (response.msg || '未知错误'))
          // 关闭状态菜单
          this.$set(task, 'showStatusMenu', false)
        }
      } catch (error) {
        console.error('[changeTaskStatus] 更新任务状态失败:', error)
        alert('更新任务状态失败，请稍后重试')
        // 关闭状态菜单
        this.$set(task, 'showStatusMenu', false)
      }
    },
    async assignTask(task) {
      // 普通成员接取任务（使用专门的claimTask接口）
      const confirmed = confirm(`确认接取任务"${task.title}"吗？`)
      if (!confirmed) return
      
      try {
        const currentUserId = this.getCurrentUserId()
        const currentUserName = this.getCurrentUserName()
        
        console.log('[assignTask] 开始接取任务, ID:', task.id, '当前状态:', task.status)
        
        // ✅ 调用后端专门的接取任务API
        const { taskAPI } = await import('@/api/task')
        const response = await taskAPI.claimTask(task.id)
        
        console.log('[assignTask] 后端返回:', response)
        
        if (response && response.code === 200) {
          console.log('[assignTask] ✅ 任务接取成功')
          
          // ✅ 添加延迟确保数据库事务完成
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // ✅ 重新从后端加载最新的任务列表
          await this.loadProjectTasks()
          
          // ✅ 强制Vue更新视图
          this.$nextTick(() => {
            this.$forceUpdate()
          })
          
          this.showSuccessToast(`成功接取任务: ${task.title}`)
          
          // ✅ 验证数据是否更新
          const updatedTask = this.tasks.find(t => t.id === task.id)
          console.log('[assignTask] 更新后的任务状态:', updatedTask?.status, '执行者:', updatedTask?.assignee_name)
          
          if (updatedTask && updatedTask.status === '待接取') {
            console.warn('[assignTask] ⚠️ 状态未更新，再次尝试加载')
            await new Promise(resolve => setTimeout(resolve, 500))
            await this.loadProjectTasks()
            this.$forceUpdate()
          }
        } else {
          alert('接取任务失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('[assignTask] 接取任务失败:', error)
        alert('接取任务失败，请稍后重试')
      }
    },
    // 打开分配任务模态框
    openAssignTaskModal(task) {
      this.taskToAssign = task
      this.selectedAssigneeId = null
      this.assignTaskModalOpen = true
    },
    // 关闭分配任务模态框
    closeAssignTaskModal() {
      this.assignTaskModalOpen = false
      this.taskToAssign = null
      this.selectedAssigneeId = null
    },
    // 确认分配任务
    async confirmAssignTask() {
      if (!this.selectedAssigneeId || !this.taskToAssign) return
      
      const selectedMember = this.teamMembers.find(m => m.id === this.selectedAssigneeId)
      if (!selectedMember) {
        alert('未找到选中的成员')
        return
      }
      
      try {
        console.log('[confirmAssignTask] 开始分配任务, ID:', this.taskToAssign.id, '当前状态:', this.taskToAssign.status)
        
        // 调用后端API分配任务
        const { taskAPI } = await import('@/api/task')
        const response = await taskAPI.assignTask(this.taskToAssign.id, [this.selectedAssigneeId])
        
        console.log('[confirmAssignTask] 后端返回:', response)
        
        if (response && response.code === 200) {
          console.log('[confirmAssignTask] ✅ 任务分配成功')
          
          // ✅ 添加延迟确保数据库事务完成
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // ✅ 重新从后端加载最新的任务列表
          await this.loadProjectTasks()
          
          // ✅ 强制Vue更新视图
          this.$nextTick(() => {
            this.$forceUpdate()
          })
          
          this.showSuccessToast(`成功将任务"${this.taskToAssign.title}"分配给 ${selectedMember.name}`)
          
          // ✅ 保存任务ID以便后续验证（因为closeAssignTaskModal会清空taskToAssign）
          const assignedTaskId = this.taskToAssign.id
          this.closeAssignTaskModal()
          
          // ✅ 验证数据是否更新
          const updatedTask = this.tasks.find(t => t.id === assignedTaskId)
          console.log('[confirmAssignTask] 更新后的任务状态:', updatedTask?.status, '执行者:', updatedTask?.assignee_name)
          
          if (updatedTask && updatedTask.status === '待接取') {
            console.warn('[confirmAssignTask] ⚠️ 状态未更新，再次尝试加载')
            await new Promise(resolve => setTimeout(resolve, 500))
            await this.loadProjectTasks()
            this.$forceUpdate()
          }
        } else {
          alert('分配任务失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('[confirmAssignTask] 分配任务失败:', error)
        alert('分配任务失败，请稍后重试')
      }
    },
    statusClass(status) {
      // 处理项目状态类名
      if (status === 'PLANNING' || status === '规划中') return 'planning'
      if (status === 'IN_PROGRESS' || status === '进行中') return 'ongoing'
      if (status === 'PAUSED' || status === '暂停') return 'paused'
      if (status === 'COMPLETED' || status === '完成') return 'completed'
      if (status === 'CANCELLED' || status === '已取消') return 'cancelled'
      return 'ongoing'
    },
    priorityClass(priority) {
      if (priority === '高') return '高'
      if (priority === '中') return '中'
      return '低'
    },
    isTaskOverdue(task) {
      // 判断任务是否已逾期
      if (!task) return false
      const dueDate = task.date || task.dueDate || task.due_date
      if (!dueDate) return false
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const deadline = new Date(dueDate)
      deadline.setHours(0, 0, 0, 0)
      
      // 只有截止日期在今天之前（不包括今天）才算逾期
      return deadline < today
    },
    isTaskNearDeadline(task) {
      // 判断任务是否临近截止（3天内）
      if (!task) return false
      const dueDate = task.date || task.dueDate || task.due_date
      if (!dueDate) return false
      
      const now = new Date()
      const deadline = new Date(dueDate)
      const diffTime = deadline - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // 0-3天内截止且未逾期返回true
      return diffDays >= 0 && diffDays <= 3 && !this.isTaskOverdue(task)
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
    },
    triggerImageUpload() {
      // 触发文件上传输入
      this.$refs.projectImageUpload.click()
    },
    async handleProjectImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
        if (!allowedTypes.includes(file.type)) {
          alert('只支持以下图片格式: jpg, png, gif, webp, bmp')
        this.$refs.projectImageUpload.value = ''
          return
        }
        
        // 验证文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
          alert('文件大小不能超过5MB')
        this.$refs.projectImageUpload.value = ''
          return
        }
      
      // 创建预览URL并立即进入裁切模式
      const reader = new FileReader()
      reader.onload = (e) => {
        this.originalImageData = e.target.result
        // 立即显示裁切模态，用户必须完成裁切
        this.showCropModal = true
        this.$nextTick(() => {
          this.initCropCanvas()
        })
      }
      reader.readAsDataURL(file)
    },
    async uploadCroppedImage(imageDataUrl) {
      try {
        // 将DataURL转换为Blob
        const blob = await this.dataURLToBlob(imageDataUrl)
        
        // 导入项目API
        const { projectAPI } = await import('@/api/project')
        
        console.log('[uploadCroppedImage] 开始上传裁切后的项目图片')
        
        // 上传图片
        const response = await projectAPI.uploadProjectImage(blob, this.project.id)
        
        console.log('[uploadCroppedImage] API返回结果:', response)
        console.log('[uploadCroppedImage] 返回结果类型:', typeof response)
        console.log('[uploadCroppedImage] 返回结果完整信息:', JSON.stringify(response, null, 2))
        
        // ✅ 调试：打印响应的所有字段
        if (response) {
          console.log('[uploadCroppedImage] response.code:', response.code)
          console.log('[uploadCroppedImage] response.msg:', response.msg)
          console.log('[uploadCroppedImage] response.data:', response.data)
          
          if (response.data) {
            console.log('[uploadCroppedImage] response.data.imageUrl:', response.data.imageUrl)
            console.log('[uploadCroppedImage] response.data所有字段:', Object.keys(response.data))
          }
        }
        
        if (response && response.code === 200 && response.data) {
          // 更新项目图片URL
          const imageUrl = response.data.imageUrl
          console.log('[uploadCroppedImage] 提取到的imageUrl:', imageUrl)
          
          if (!imageUrl) {
            console.warn('[uploadCroppedImage] ⚠️ 警告：imageUrl 为空或不存在！')
            console.warn('[uploadCroppedImage] response.data 的所有字段:', response.data)
            alert('上传成功但未获取到图片URL')
            return
          }
          
          // ✅ 使用 Vue.set 来确保响应式更新
          this.$set(this.project, 'imageUrl', imageUrl)
          this.$set(this.project, 'image', imageUrl)
          
          console.log('[uploadCroppedImage] 项目对象已更新:', {
            imageUrl: this.project.imageUrl,
            image: this.project.image
          })
          
          // 保存到localStorage
          this.saveProjectData()
          
          // ✅ 强制Vue重新渲染（以防万一）
          this.$forceUpdate()
          
          console.log('[uploadCroppedImage] ✅ 强制更新Vue视图')
          console.log('[uploadCroppedImage] ✅ 图片URL已设置:', imageUrl)
          
          this.showSuccessToast('项目图片上传成功！')
          console.log('[uploadCroppedImage] 项目图片上传成功，URL:', imageUrl)
        } else {
          console.error('[uploadCroppedImage] ❌ 响应不符合预期')
          console.error('[uploadCroppedImage] response:', response)
          alert('上传失败: ' + (response?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('[uploadCroppedImage] 上传项目图片失败:', error)
        
        // ✅ 增强的错误处理
        if (error && error.status === 403) {
          console.error('[uploadCroppedImage] ❌ 403 Forbidden - 认证失败')
          console.error('[uploadCroppedImage] 可能原因: JWT token 过期或无效')
          const token = localStorage.getItem('access_token')
          if (!token) {
            console.error('[uploadCroppedImage] 🔴 Token 为空')
            alert('登录已过期，请重新登录')
          } else {
            alert('认证失败，请重新登录')
          }
        } else {
          alert('上传项目图片失败，请稍后重试')
        }
      }
    },
    closeCropModal() {
      // 如果用户取消裁切，清空文件输入
          this.$refs.projectImageUpload.value = ''
      this.showCropModal = false
      this.originalImage = null
      this.originalImageData = null
    },
    initCropCanvas() {
      const canvas = this.$refs.cropCanvas
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 设置画布尺寸，保持图片比例
        const maxWidth = 600
        const maxHeight = 400
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)
        
        // 保存原始图片数据
        this.originalImage = img
        
        // 初始化裁切区域（项目广场比例：约16:9）
        const cropRatio = 16 / 9
        const cropWidth = Math.min(width * 0.8, height * cropRatio * 0.8)
        const cropHeight = cropWidth / cropRatio
        
        this.cropData = {
          x: (width - cropWidth) / 2,
          y: (height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight
        }
        
        this.updateCropSelection()
        this.setupCropInteraction()
      }
      
      img.src = this.originalImageData
    },
    updateCropSelection() {
      const selection = this.$refs.cropSelection
      if (selection) {
        selection.style.left = this.cropData.x + 'px'
        selection.style.top = this.cropData.y + 'px'
        selection.style.width = this.cropData.width + 'px'
        selection.style.height = this.cropData.height + 'px'
      }
    },
    setupCropInteraction() {
      const selection = this.$refs.cropSelection
      const overlay = this.$refs.cropOverlay
      const canvas = this.$refs.cropCanvas
      
      if (!selection || !overlay || !canvas) return
      
      let isDragging = false
      let isResizing = false
      let resizeHandle = null
      let startX = 0
      let startY = 0
      let startCropX = 0
      let startCropY = 0
      let startCropWidth = 0
      let startCropHeight = 0
      
      const cropRatio = 16 / 9
      
      const startDrag = (e) => {
        if (e.target.classList.contains('resize-handle')) {
          isResizing = true
          resizeHandle = e.target.dataset.handle
        } else {
          isDragging = true
        }
        
        const rect = canvas.getBoundingClientRect()
        startX = e.clientX - rect.left
        startY = e.clientY - rect.top
        startCropX = this.cropData.x
        startCropY = this.cropData.y
        startCropWidth = this.cropData.width
        startCropHeight = this.cropData.height
      }
      
      const drag = (e) => {
        if (!isDragging && !isResizing) return
        
        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top
        
        const deltaX = currentX - startX
        const deltaY = currentY - startY
        
        if (isDragging) {
          // 移动裁切框
          const newX = Math.max(0, Math.min(canvas.width - this.cropData.width, startCropX + deltaX))
          const newY = Math.max(0, Math.min(canvas.height - this.cropData.height, startCropY + deltaY))
          
          this.cropData.x = newX
          this.cropData.y = newY
        } else if (isResizing) {
          // 调整裁切框大小
          let newWidth = startCropWidth
          let newHeight = startCropHeight
          let newX = startCropX
          let newY = startCropY
          
          if (resizeHandle === 'se') {
            // 右下角调整
            newWidth = Math.max(50, Math.min(canvas.width - startCropX, startCropWidth + deltaX))
            newHeight = newWidth / cropRatio
            if (startCropY + newHeight > canvas.height) {
              newHeight = canvas.height - startCropY
              newWidth = newHeight * cropRatio
            }
          } else if (resizeHandle === 'sw') {
            // 左下角调整
            newWidth = Math.max(50, Math.min(startCropX + startCropWidth, startCropWidth - deltaX))
            newHeight = newWidth / cropRatio
            newX = startCropX + startCropWidth - newWidth
            if (newX < 0) {
              newX = 0
              newWidth = startCropX + startCropWidth
              newHeight = newWidth / cropRatio
            }
          } else if (resizeHandle === 'ne') {
            // 右上角调整
            newWidth = Math.max(50, Math.min(canvas.width - startCropX, startCropWidth + deltaX))
            newHeight = newWidth / cropRatio
            newY = startCropY + startCropHeight - newHeight
            if (newY < 0) {
              newY = 0
              newHeight = startCropY + startCropHeight
              newWidth = newHeight * cropRatio
            }
          } else if (resizeHandle === 'nw') {
            // 左上角调整
            newWidth = Math.max(50, Math.min(startCropX + startCropWidth, startCropWidth - deltaX))
            newHeight = newWidth / cropRatio
            newX = startCropX + startCropWidth - newWidth
            newY = startCropY + startCropHeight - newHeight
            if (newX < 0) {
              newX = 0
              newWidth = startCropX + startCropWidth
              newHeight = newWidth / cropRatio
              newY = startCropY + startCropHeight - newHeight
            }
            if (newY < 0) {
              newY = 0
              newHeight = startCropY + startCropHeight
              newWidth = newHeight * cropRatio
              newX = startCropX + startCropWidth - newWidth
            }
          }
          
          this.cropData.x = newX
          this.cropData.y = newY
          this.cropData.width = newWidth
          this.cropData.height = newHeight
        }
        
        this.updateCropSelection()
      }
      
      const endDrag = () => {
        isDragging = false
        isResizing = false
        resizeHandle = null
      }
      
      selection.addEventListener('mousedown', startDrag)
      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', endDrag)
      
      // 清理事件监听器
      this.$once('hook:beforeDestroy', () => {
        selection.removeEventListener('mousedown', startDrag)
        document.removeEventListener('mousemove', drag)
        document.removeEventListener('mouseup', endDrag)
      })
    },
    applyCrop() {
      if (!this.originalImage) return
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置裁切后的画布尺寸（项目广场比例）
      const targetRatio = 16 / 9
      const targetWidth = 400
      const targetHeight = targetWidth / targetRatio
      
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      // 计算裁切区域在原图中的位置和尺寸
      const sourceX = (this.cropData.x / this.$refs.cropCanvas.width) * this.originalImage.width
      const sourceY = (this.cropData.y / this.$refs.cropCanvas.height) * this.originalImage.height
      const sourceWidth = (this.cropData.width / this.$refs.cropCanvas.width) * this.originalImage.width
      const sourceHeight = (this.cropData.height / this.$refs.cropCanvas.height) * this.originalImage.height
      
      // 绘制裁切后的图片
      ctx.drawImage(
        this.originalImage,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetWidth, targetHeight
      )
      
      // 转换为DataURL并上传
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      this.closeCropModal()
      
      // 上传裁切后的图片
      this.uploadCroppedImage(imageDataUrl)
    },
    dataURLToBlob(dataURL) {
      return new Promise((resolve, reject) => {
        try {
          const arr = dataURL.split(',')
          const mime = arr[0].match(/:(.*?);/)[1]
          const bstr = atob(arr[1])
          let n = bstr.length
          const u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          const blob = new Blob([u8arr], { type: mime })
          resolve(blob)
        } catch (error) {
          reject(error)
        }
      })
    },
    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      // 1秒后自动隐藏
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 1000)
    },
    onImageLoad() {
      console.log('✅ 图片加载成功:', this.project.imageUrl || this.project.image)
    },
    onImageError(event) {
      const imageUrl = this.project.imageUrl || this.project.image
      console.error('❌ 图片加载失败，URL:', imageUrl)
      console.error('❌ 错误详情:', event)
      console.warn('⚠️ 可能的原因：')
      console.warn('  1. CORS 跨域问题 - MinIO 没有正确配置 CORS')
      console.warn('  2. 图片 URL 不正确')
      console.warn('  3. MinIO 服务不可用或桶策略未设置为public')
      console.warn('  4. 网络连接问题')
      
      // 测试URL可访问性
      if (imageUrl) {
        console.log('📝 测试 URL 可访问性，请在浏览器中直接访问：', imageUrl)
        console.log('📝 或运行以下PowerShell命令测试：')
        console.log(`   Invoke-WebRequest -Uri "${imageUrl}" -Method GET -UseBasicParsing`)
        
        // 尝试fetch测试
        fetch(imageUrl, { method: 'HEAD' })
          .then(response => {
            console.log('✅ HEAD请求成功，状态码:', response.status)
            console.log('✅ Content-Type:', response.headers.get('Content-Type'))
            console.log('✅ Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'))
          })
          .catch(error => {
            console.error('❌ HEAD请求失败:', error)
            console.error('❌ 这通常表示CORS或网络问题')
          })
      }
    },
    /**
     * 解析头像URL
     * 后端返回的avatar可能是JSON字符串格式: {"sizes":{"256":"http://...","original":"http://..."}}
     * 需要解析并提取original尺寸的URL
     */
    parseAvatarUrl(avatar) {
      if (!avatar) {
        return null
      }
      
      // 如果已经是普通URL字符串，直接返回
      if (typeof avatar === 'string' && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
        return avatar
      }
      
      // 如果是JSON字符串，尝试解析
      if (typeof avatar === 'string') {
        try {
          const avatarObj = JSON.parse(avatar)
          // 优先使用original尺寸，其次使用256尺寸
          if (avatarObj.sizes) {
            return avatarObj.sizes.original || avatarObj.sizes['256'] || avatarObj.sizes['512'] || null
          }
          return null
        } catch (e) {
          console.warn('解析头像URL失败:', e, '原始数据:', avatar)
          return null
        }
      }
      
      // 如果是对象，直接提取URL
      if (typeof avatar === 'object' && avatar.sizes) {
        return avatar.sizes.original || avatar.sizes['256'] || avatar.sizes['512'] || null
      }
      
      return null
    }
  }
}
</script>