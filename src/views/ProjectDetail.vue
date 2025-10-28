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
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span class="page-title">项目详情</span>
      </div>
      <div class="header-right">
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
                <span class="status-badge" :class="statusClass(project.status)">{{ getStatusDisplay(project.status) }}</span>
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
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              编辑项目
            </button>
            <button class="btn btn-danger" @click="deleteProject">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button class="task-delete-btn" @click="deleteTask(task.id)" title="删除任务">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="task-content" @click.stop>
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
            <div v-if="task.status === '待接取'" class="task-assign-section" @click.stop>
              <button @click="assignTask(task)" class="assign-btn">接取任务</button>
          </div>
          </div>
        </div>

        <!-- 更多按钮放在任务网格下面 -->
        <div v-if="allTasks.length > 5" class="more-button-container">
          <button class="more-button" @click="openTaskListModal">
            <span class="more-text">更多</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="member-info">
              <h4 class="member-name">{{ member.name }}</h4>
              <p class="member-role">{{ member.role }}</p>
            </div>
            <button v-if="isProjectManager" class="remove-member-btn" @click="removeTeamMember(member.id)" title="移除成员">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <!-- 邀请成员占位符 -->
          <div v-for="invite in inviteSlots" :key="invite.id" class="member-card invite-card">
            <div class="member-avatar">
              <div class="avatar-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="member-info">
              <h4 class="member-name">{{ invite.role }}</h4>
              <p class="member-role">待邀请</p>
            </div>
            <button v-if="isProjectManager" class="remove-member-btn" @click="removeInviteSlot(invite.id)" title="取消邀请">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <option value="TEAM">团队</option>
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

    <!-- 邀请成员弹窗 -->
    <div v-if="inviteMemberModalOpen" class="modal-overlay" @click="closeInviteMemberModal">
      <div class="modal-content invite-modal" @click.stop>
        <div class="modal-header">
          <h3>邀请成员</h3>
          <button @click="closeInviteMemberModal" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="invite-form">
            <div class="form-field">
              <label class="form-label">搜索用户</label>
              <div class="search-container">
                <input
                  type="text"
                  v-model="inviteSearchQuery"
                  class="form-input"
                  placeholder="请输入用户ID或姓名进行搜索"
                  @input="searchUsers"
                />
                <button @click="searchUsers" class="search-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 搜索结果 -->
          <div v-if="searchResults.length > 0" class="search-results">
            <h4>搜索结果</h4>
            <div class="user-list">
              <div v-for="user in searchResults" :key="user.id" class="user-item">
                <div class="user-info">
                  <div class="user-avatar">
                    <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                    <div v-else class="avatar-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
                <button @click="addUserToProject(user)" class="invite-btn">
                  添加
                </button>
              </div>
            </div>
          </div>

          <!-- 无搜索结果提示 -->
          <div v-if="inviteSearchQuery && searchResults.length === 0 && !isSearching" class="no-results">
            <p>未找到匹配的用户</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeInviteMemberModal" class="btn btn-secondary">取消</button>
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
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button class="task-delete-btn" @click="deleteTask(task.id)" title="删除任务">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="task-item-content" @click.stop>
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
              <div v-if="task.status === '待接取'" class="task-item-assign" @click.stop>
                <button @click="assignTask(task)" class="assign-btn">接取任务</button>
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
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

    <!-- 任务详情弹窗 -->
    <div v-if="taskDetailModalOpen && selectedTask" class="modal-overlay" @click="closeTaskDetailModal">
      <div class="modal-content task-detail-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">任务详情</h3>
          <button class="modal-close" @click="closeTaskDetailModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body task-detail-body">
          <div class="task-detail-section">
            <label class="task-detail-label">任务标题</label>
            <div class="task-detail-value">{{ selectedTask.title }}</div>
          </div>

          <div class="task-detail-section">
            <label class="task-detail-label">任务描述</label>
            <div class="task-detail-value task-description-scroll">{{ selectedTask.description || '暂无描述' }}</div>
          </div>

          <div class="task-detail-section">
            <label class="task-detail-label">优先级</label>
            <div class="task-detail-value">
              <span class="task-priority-badge" :class="priorityClass(selectedTask.priority)">{{ selectedTask.priority }}</span>
            </div>
          </div>

          <div class="task-detail-section">
            <label class="task-detail-label">状态</label>
            <div class="task-detail-value">
              <span class="task-status-badge" :class="statusClass(selectedTask.status)">{{ selectedTask.status }}</span>
            </div>
          </div>

          <div class="task-detail-section" v-if="selectedTask.date">
            <label class="task-detail-label">截止日期</label>
            <div class="task-detail-value">{{ selectedTask.date }}</div>
          </div>

          <div class="task-detail-section">
            <label class="task-detail-label">创建人</label>
            <div class="task-detail-value">{{ selectedTask.created_by_name || '未知' }}</div>
          </div>

          <div class="task-detail-section" v-if="selectedTask.assignee_name">
            <label class="task-detail-label">负责人</label>
            <div class="task-detail-value">{{ selectedTask.assignee_name }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeTaskDetailModal" class="btn btn-primary">关闭</button>
        </div>
      </div>
    </div>

    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
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
      editProjectModalOpen: false,
      inviteMemberModalOpen: false,
      showToast: false,
      toastMessage: '',
      inviteSearchQuery: '',
      searchResults: [],
      isSearching: false,
      searchDebounceTimer: null, // 防抖定时器
      searchAbortController: null, // 请求取消控制器
      searchRequestId: 0, // 请求序列号
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
      membersLoadError: null, // 成员加载错误信息
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
      }
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
    this.loadUserAvatar()
    this.loadProject() // loadProject方法会自动调用loadProjectTasks
    document.addEventListener('click', this.handleClickOutside)
    // 监听用户信息更新事件
    this.$root.$on('userInfoUpdated', this.loadUserAvatar)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$root.$off('userInfoUpdated', this.loadUserAvatar)
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
        console.log('[loadProjectTasks] 开始从后端加载任务数据，项目ID:', projectId)
        
        // 导入任务API
        const { taskAPI } = await import('@/api/task')
        
        // 调用后端API获取任务列表
        const response = await taskAPI.getProjectTasks(projectId, 0, 100) // 获取前100个任务
        
        console.log('[loadProjectTasks] API返回结果:', response)
        
        // 检查返回结果
        if (response && response.code === 200 && response.data) {
          const tasksData = response.data
          console.log('[loadProjectTasks] 任务数据:', tasksData)
          
          // 处理分页数据
          let taskList = []
          if (tasksData.content && Array.isArray(tasksData.content)) {
            // 后端返回的是分页对象
            taskList = tasksData.content
          } else if (Array.isArray(tasksData)) {
            // 后端返回的是数组
            taskList = tasksData
          }
          
          console.log('[loadProjectTasks] 解析的任务列表:', taskList)
          
          // 转换任务数据格式，优先使用后端返回的创建人信息，如果没有则使用本地用户信息
          const currentUserId = this.getCurrentUserId()
          const currentUserName = this.getCurrentUserName()
          
          this.tasks = taskList.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            date: task.dueDate || task.due_date || '',
            due_date: task.dueDate || task.due_date,
            dueDate: task.dueDate || task.due_date,
            priority: this.getPriorityDisplay(task.priority || 'MEDIUM'),
            priority_value: task.priority || 'MEDIUM',
            status: this.getStatusDisplay(task.status || 'PENDING'),
            status_value: task.status || 'PENDING',
            assignee_id: task.assigneeIds || task.assignee_id || [],
            assignee_name: task.assigneeNames ? task.assigneeNames.join(', ') : '',
            created_by: task.creatorId || task.createdBy || task.created_by || currentUserId,
            // 如果后端返回的创建人是"未知用户"（auth服务不可用），使用本地用户信息
            created_by_name: task.creatorName === '未知用户' ? currentUserName : (task.creatorName || currentUserName),
            showStatusMenu: false // 初始化状态菜单为关闭
          }))
          
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
          console.log('[loadTasksFromLocalStorage] 从localStorage加载任务:', foundProject.tasks)
          
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
    
    loadProject() {
      const projectId = this.$route.params.id
      console.log('正在加载项目ID:', projectId, '类型:', typeof projectId)
      
      // 从localStorage加载项目数据
      const savedProjects = localStorage.getItem('projects')
      console.log('localStorage中的项目数据:', savedProjects)
      
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        console.log('解析后的项目列表:', projects)
        console.log('项目ID列表:', projects.map(p => ({ id: p.id, type: typeof p.id })))
        
        // 使用字符串比较，因为后端返回的是字符串ID
        const foundProject = projects.find(p => String(p.id) === String(projectId))
        
        if (foundProject) {
          console.log('找到的项目数据:', foundProject)
          
          // 将项目广场的数据格式转换为详情页面的格式
          this.project = {
            id: foundProject.id,
            name: foundProject.name || foundProject.title, // 添加数据库字段名
            title: foundProject.title || foundProject.name,
            description: foundProject.description || foundProject.dataAssets || foundProject.direction || '暂无描述',
            // 保存日期字段（用于编辑）
            startDate: foundProject.startDate || foundProject.start_date || '',
            endDate: foundProject.endDate || foundProject.end_date || '',
            // 显示周期字段
            period: (foundProject.start_date || foundProject.startDate) && (foundProject.end_date || foundProject.endDate) ? 
              `${foundProject.start_date || foundProject.startDate} 至 ${foundProject.end_date || foundProject.endDate}` : 
              '2024-01-01 至 2024-12-31',
            status: this.getStatusValue(foundProject.status), // 转换为枚举值
            visibility: foundProject.visibility || 'PRIVATE', // 添加可见性字段
            imageUrl: foundProject.imageUrl || foundProject.image || 'https://via.placeholder.com/400x225?text=Project+Image',
            image: foundProject.image || foundProject.imageUrl,
            manager: this.getCurrentUserName(), // 从用户信息获取负责人
            teamSize: foundProject.teamSize,
            category: foundProject.category,
            aiCore: foundProject.aiCore,
            tags: foundProject.tags || [],
            tasks: foundProject.tasks || [],
            created_by: foundProject.created_by || 1 // 添加创建人字段
          }
          
          console.log('加载的项目数据 - ID:', this.project.id, 'startDate:', this.project.startDate, 'endDate:', this.project.endDate)
          console.log('项目imageUrl:', this.project.imageUrl)
          
          console.log('项目周期:', foundProject.startDate, foundProject.endDate)
          console.log('项目任务:', foundProject.tasks)
          
          // 注意：任务数据现在通过loadProjectTasks方法从后端API加载
          // 这里不再从localStorage加载任务，以确保数据是最新的
          
          // ✅ 修复：不再使用localStorage中的成员数据或默认值
          // 团队成员数据将通过loadProjectMembers方法从后端API加载
          // 初始化为空数组，避免显示错误的默认成员信息
          this.teamMembers = []
          this.inviteSlots = foundProject.inviteSlots || []
          
        } else {
          console.log('未找到项目，ID:', projectId)
          console.log('所有项目ID:', projects.map(p => p.id))
          console.log('ID类型比较:', projects.map(p => ({ 
            id: p.id, 
            type: typeof p.id, 
            matches: String(p.id) === String(projectId) 
          })))
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

      // 加载项目任务数据
      this.loadProjectTasks()

      // 如果项目加载成功，从后端加载成员列表
      if (this.project && this.project.id) {
        this.loadProjectMembers()
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    async addTeamMember() {
      // 使用更好的UI提示用户输入
      const userId = prompt('请输入要添加的用户ID:')
      if (!userId || !userId.trim()) {
        return
      }

      // 弹出选择角色
      const roleChoice = confirm('点击"确定"添加为项目拥有者(OWNER)，点击"取消"添加为普通成员(MEMBER)')
      const roleCode = roleChoice ? 'OWNER' : 'MEMBER'

      try {
        // 导入 API
        const { projectAPI } = await import('@/api/project')

        // 调用后端API - 使用 assignRole (分配角色接口)
        const response = await projectAPI.assignRole(this.project.id, {
          userId: parseInt(userId.trim()),
          roleCode: roleCode
        })

        if (response.code === 200) {
          this.showSuccessToast(`成员添加成功！角色: ${roleCode === 'OWNER' ? '项目拥有者' : '普通成员'}`)
          // 刷新成员列表
          this.loadProjectMembers()
        } else {
          alert(`添加失败: ${response.message || response.msg || '未知错误'}`)
        }
      } catch (error) {
        console.error('添加成员失败:', error)
        alert(`添加失败: ${error.message || error.msg || '网络错误'}`)
      }
    },
    inviteMember() {
      this.inviteMemberModalOpen = true
      this.resetInviteForm()
    },
    closeInviteMemberModal() {
      this.inviteMemberModalOpen = false
      this.resetInviteForm()
    },
    resetInviteForm() {
      this.inviteSearchQuery = ''
      this.searchResults = []
      this.isSearching = false
      // 清理防抖定时器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
      // 重置请求ID，废弃所有进行中的请求
      this.searchRequestId++
    },
    async searchUsers() {
      // 清除之前的防抖定时器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }

      // 如果搜索框为空，立即清空结果
      if (!this.inviteSearchQuery.trim()) {
        this.searchResults = []
        this.isSearching = false
        return
      }

      // 设置防抖：延迟300ms执行搜索
      this.searchDebounceTimer = setTimeout(async () => {
        await this.performSearch()
      }, 300)
    },

    async performSearch() {
      // 生成新的请求ID
      this.searchRequestId++
      const currentRequestId = this.searchRequestId

      console.log(`🔍 开始搜索 [请求ID: ${currentRequestId}]`)

      this.isSearching = true
      
      try {
        const { projectAPI } = await import('@/api/project')
        const keyword = this.inviteSearchQuery.trim()

        // 使用项目服务的搜索API
        const response = await projectAPI.searchUsers(keyword, 0, 10)

        // ✅ 关键：检查这个响应是否是最新的请求
        if (currentRequestId !== this.searchRequestId) {
          console.log(`⚠️ 忽略旧响应 [请求ID: ${currentRequestId}, 当前ID: ${this.searchRequestId}]`)
          return
        }

        console.log(`✅ 处理响应 [请求ID: ${currentRequestId}]`, response)

        if (response.code === 200 && response.data) {
          // 处理分页结果
          if (response.data.content && Array.isArray(response.data.content)) {
            this.searchResults = response.data.content
          } else if (Array.isArray(response.data)) {
            this.searchResults = response.data
          } else {
            this.searchResults = [response.data]
          }
        } else {
          this.searchResults = []
        }
      } catch (error) {
        // 只处理最新请求的错误
        if (currentRequestId === this.searchRequestId) {
          console.error('搜索用户失败:', error)
          this.searchResults = []
          this.showSuccessToast('搜索失败，请重试')
        }
      } finally {
        // 只有最新请求才更新loading状态
        if (currentRequestId === this.searchRequestId) {
          this.isSearching = false
        }
      }
    },
    async addUserToProject(user) {
      // 检查用户是否已经是团队成员
      const isAlreadyMember = this.teamMembers.some(member => member.id === user.id || member.userId === user.id)
      if (isAlreadyMember) {
        alert('该用户已经是团队成员')
        return
      }
      
      try {
        const { projectAPI } = await import('@/api/project')

        // 调用后端API邀请成员（默认角色为MEMBER）
        const response = await projectAPI.inviteMember(this.project.id, {
          userId: user.id,
          role: 'MEMBER'  // 默认添加为普通成员
        })

        if (response.code === 200) {
          this.showSuccessToast(`${user.name || user.realName || '用户'} 已添加到项目`)
          this.closeInviteMemberModal()
          // 刷新成员列表
          this.loadProjectMembers()
        } else {
          alert(`添加失败: ${response.message || response.msg || '未知错误'}`)
        }
      } catch (error) {
        console.error('添加用户失败:', error)
        alert(`添加失败: ${error.message || error.msg || '网络错误'}`)
      }
    },
    async loadProjectMembers() {
      // ✅ 优化：先从后端加载成员列表，如果为空再显示默认成员
      try {
        // 清除之前的错误信息
        this.membersLoadError = null

        const { projectAPI } = await import('@/api/project')

        const response = await projectAPI.getProjectMembers(this.project.id)

        if (response.code === 200 && response.data) {
          // 转换后端数据格式到前端格式
          const membersFromBackend = response.data.content.map(member => ({
            id: member.userId,
            name: member.username || member.nickname || `用户${member.userId}`,
            role: member.roleCode === 'OWNER' ? '项目拥有者' : '普通成员',
            avatar: member.avatar || null,
            joinedAt: member.joinedAt
          }))

          // ✅ 判断：如果后端返回的成员列表为空，则显示默认成员（当前用户）
          if (membersFromBackend.length === 0) {
            console.log('后端成员列表为空，使用默认成员（当前用户）')
            this.teamMembers = [
              { id: 1, name: this.getCurrentUserName(), role: '项目负责人', avatar: null }
            ]
          } else {
            // 后端有数据，使用后端数据
            console.log('使用后端返回的成员列表，共', membersFromBackend.length, '个成员')
            this.teamMembers = membersFromBackend
          }
        } else {
          // API调用失败，显示默认成员
          console.log('加载成员失败，使用默认成员')
          this.membersLoadError = response.message || '加载成员列表失败'
          this.teamMembers = [
            { id: 1, name: this.getCurrentUserName(), role: '项目负责人', avatar: null }
          ]
        }
      } catch (error) {
        console.error('加载项目成员失败:', error)
        // 加载失败时，显示默认成员
        console.log('加载成员异常，使用默认成员')
        this.membersLoadError = '加载成员列表失败，显示默认信息'
        this.teamMembers = [
          { id: 1, name: this.getCurrentUserName(), role: '项目负责人', avatar: null }
        ]
      }
    },
    async removeTeamMember(memberId) {
      if (!confirm('确定要移除此成员吗？')) {
        return
      }

      try {
        // 导入 API
        const { projectAPI } = await import('@/api/project')

        // 调用后端API
        const response = await projectAPI.removeMember(this.project.id, memberId)

        if (response.code === 200) {
          this.showSuccessToast('成员已移除！')
          // 刷新成员列表
          this.loadProjectMembers()
        } else {
          alert(`移除失败: ${response.message || response.msg || '未知错误'}`)
        }
      } catch (error) {
        console.error('移除成员失败:', error)
        alert(`移除失败: ${error.message || error.msg || '网络错误'}`)
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
        imageUrl: this.project.imageUrl || this.project.image || 'https://via.placeholder.com/400x225?text=Project+Image'
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
          alert('创建任务失败：' + (response.msg || '未知错误'))
        }
      } catch (error) {
        console.error('[saveNewTask] 创建任务失败:', error)
        alert('创建任务失败，请稍后重试')
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
          // 删除成功，从本地任务列表中移除
          this.tasks = this.tasks.filter(t => t.id !== taskId)

          // 保存到localStorage
          this.saveProjectData()

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
        'PLANNING': '规划中',
        'ONGOING': '进行中',
        'COMPLETED': '已完成',
        'ARCHIVED': '已归档',
        // 兼容旧数据和任务状态
        'PENDING': '待接取',
        'IN_PROGRESS': '进行中',
        'PAUSED': '暂停',
        'CANCELLED': '已取消'
      }
      return statusMap[status] || status || '未知'
    },
    getStatusValue(status) {
      // 将中文状态转换为数据库的英文枚举值
      // 如果已经是枚举值，直接返回
      if (status && status.toUpperCase() === status && !status.includes('中') && !status.includes('完') && !status.includes('档')) {
        return status
      }
      
      const reverseMap = {
        // 项目状态映射
        '规划中': 'PLANNING',
        '进行中': 'ONGOING',
        '已完成': 'COMPLETED',
        '已归档': 'ARCHIVED',
        // 兼容任务状态和旧状态
        '待接取': 'PENDING',
        '暂停': 'PAUSED',
        '已暂停': 'PAUSED',
        '已取消': 'CANCELLED',
        '完成': 'COMPLETED'
      }
      return reverseMap[status] || status || 'ONGOING'
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
          // 更新本地任务状态
          task.status = newStatus
          task.status_value = statusValue
          
          // 关闭状态菜单
          this.$set(task, 'showStatusMenu', false)
          
          // 保存到localStorage
          this.saveProjectData()
          
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
    assignTask(task) {
      // 接取任务
      const currentUser = this.getCurrentUserName()
      task.assignee_name = currentUser
      task.assignee_id = 1 // 假设当前用户ID为1
      task.status = '进行中'
      task.status_value = 'ONGOING'
      
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
      
      // 清除所有认证信息
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('remember_me_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('userAvatar')
      localStorage.removeItem('globalUserInfo')
      
      // 清除所有以userData_开头的用户数据
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('userData_')) {
          localStorage.removeItem(key)
        }
      })
      
      this.showSuccessToast('退出登录成功！')
      
      // 延迟跳转到登录页面，让用户看到提示
      setTimeout(() => {
      this.$router.push('/login')
      }, 1000)
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
    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      // 1秒后自动隐藏
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 1000)
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e9ecef;
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
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
  margin-top: 64px; /* 为固定页眉留出空间 */
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

.status-badge.planning {
  background: #f8f9fa;
  color: #6c757d;
  border-color: #dee2e6;
}

.status-badge.ongoing {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.status-badge.paused {
  background: #fff3cd;
  color: #856404;
  border-color: #ffeaa7;
}

.status-badge.completed {
  background: #d1ecf1;
  color: #0c5460;
  border-color: #bee5eb;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  justify-content: stretch;
}

/* 空状态样式 */
.task-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f8f9fa;
  border: 2px dashed #e9ecef;
  border-radius: 12px;
  padding: 40px 20px;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-state-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 8px 0;
}

.empty-state-message {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.highlight-text {
  color: #5b6bff;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .task-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .task-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .task-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .task-grid {
    grid-template-columns: 1fr;
  }

  .task-empty-state {
    min-height: 150px;
    padding: 30px 15px;
  }

  .empty-state-title {
    font-size: 16px;
  }

  .empty-state-message {
    font-size: 13px;
  }
}

/* 更多按钮样式 */
.more-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.more-button {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #5b6bff;
}

.more-button:hover {
  background: #e9ecef;
  border-color: #5b6bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 107, 255, 0.15);
}

.more-text {
  font-size: 14px;
  font-weight: 500;
  color: #5b6bff;
}

.more-button svg {
  color: #5b6bff;
}


/* 任务列表弹窗样式 */
.task-list-modal {
  max-width: 99vw !important;
  max-height: 80vh;
  width: 1800px !important;
}

.task-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
}

.task-list-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  min-height: 60px;
  cursor: pointer;
}

.task-list-item:hover {
  background: #e9ecef;
  border-color: #5b6bff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(91, 107, 255, 0.1);
}

.task-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 300px;
  max-width: 300px;
}

.task-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 20px;
}

.task-item-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
  min-width: 300px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-item-description {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-item-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6c757d;
  min-width: 250px;
  max-width: 250px;
  flex-shrink: 0;
}

.task-item-assign {
  flex-shrink: 0;
  min-width: 80px;
}

.task-item-assign .assign-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item-assign .assign-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

/* 任务详情弹窗样式 */
.task-detail-modal {
  max-width: 800px;
  max-height: 80vh;
  width: 90%;
}

.task-detail-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
}

.task-detail-section {
  margin-bottom: 20px;
}

.task-detail-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.task-detail-value {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.task-description-scroll {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.task-priority-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.task-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.task-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-card:hover {
  background: #e9ecef;
  border-color: #5b6bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 107, 255, 0.15);
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
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 16em;
}

.task-description {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 16em;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: auto;
  font-size: 11px;
  color: #6c757d;
  flex-shrink: 0;
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

/* 团队成员加载提示样式 */
.loading-message {
  padding: 32px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.loading-message p {
  margin: 0;
}

/* 团队成员错误提示样式 */
.error-message {
  padding: 32px;
  text-align: center;
  color: #dc3545;
  font-size: 14px;
}

.error-message p {
  margin: 0;
}

/* 成功提示Toast样式 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 9999;
  animation: fadeInOut 1s ease-in-out;
  pointer-events: none;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

/* 错误消息样式 */
.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* 邀请成员弹窗样式 */
.invite-modal {
  max-width: 600px;
}

.search-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-container .form-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #0056b3;
}

.search-results {
  margin-top: 20px;
}

.search-results h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #6c757d;
}

.invite-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.invite-btn:hover {
  background: #218838;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.no-results p {
  margin: 0;
  font-size: 14px;
}
</style>
