<template>
  <div class="my-activity-container">
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
        <button class="back-btn" @click="goToHome" title="返回首页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">我的活动</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content-wrapper">
      <div class="activity-content-layout">
        <aside class="activity-side-nav">
          <button
            v-for="nav in activityNavItems"
            :key="nav.key"
            :class="['activity-nav-item', { active: activePage === nav.key }]"
            @click="setActivePage(nav.key)"
          >
            <span class="nav-label">{{ nav.label }}</span>
          </button>
        </aside>

        <div class="activity-page-content">
          <!-- 我的任务 -->
          <section 
            v-if="activePage === 'my-tasks'"
            class="page-section my-tasks-section"
          >
            <div class="dashboard-card task-statistics">
              <div class="card-header">
                <div class="card-header-top">
                  <h3 class="card-title">我的任务</h3>
                  <div class="review-mode-toggle">
                    <button 
                      class="toggle-btn" 
                      :class="{ active: reviewMode === 'to-review' }"
                      @click="switchReviewMode('to-review')"
                    >
                      我审核的任务
                    </button>
                    <button 
                      class="toggle-btn" 
                      :class="{ active: reviewMode === 'my-submissions' }"
                      @click="switchReviewMode('my-submissions')"
                    >
                      我提交的任务
                    </button>
                    <button 
                      class="toggle-btn" 
                      :class="{ active: reviewMode === 'my-created' }"
                      @click="switchReviewMode('my-created')"
                    >
                      我发布的任务
                    </button>
                  </div>
                </div>
                <div class="section-controls" v-if="reviewMode !== 'my-created'">
                  <select v-model="sortBy" class="sort-select" @change="loadPendingTasks">
                    <option value="project">按项目分类</option>
                    <option value="priority">按优先级</option>
                    <option value="dueDate">按截止时间</option>
                  </select>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="showOverdueOnly" @change="loadPendingTasks">
                    <span>仅看逾期项</span>
                  </label>
                </div>
                <div class="created-summary" v-else>
                  <div class="summary-card summary-total">
                    <div class="summary-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">总任务</span>
                      <span class="summary-value">{{ createdTaskStats.total }}</span>
                    </div>
                  </div>
                  <div class="summary-card summary-progress">
                    <div class="summary-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">进行中</span>
                      <span class="summary-value">{{ createdTaskStats.inProgress }}</span>
                    </div>
                  </div>
                  <div class="summary-card summary-completed">
                    <div class="summary-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">已完成</span>
                      <span class="summary-value">{{ createdTaskStats.completed }}</span>
                    </div>
                  </div>
                  <div class="summary-card summary-pending">
                    <div class="summary-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="summary-content">
                      <span class="summary-label">待开始</span>
                      <span class="summary-value">{{ createdTaskStats.pending }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="task-list-container">
                <template v-if="reviewMode === 'my-created'">
                  <div v-if="isLoadingCreatedTasks" class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>加载中...</p>
                  </div>
                  <div v-else-if="createdTasks.length === 0" class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 12H12L16 14" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>暂无我发布的任务</p>
                  </div>
                  <div v-else class="task-cards-list">
                    <div 
                      v-for="task in createdTasks" 
                      :key="task.id"
                      class="task-card-clean"
                      :class="['status-view', task.statusClass]"
                    >
                      <div class="task-status-bar" :class="getStatusColorClass(task.status)"></div>
                      <div class="task-content">
                        <div class="task-header">
                          <h4 class="task-title">{{ task.title }}</h4>
                          <span class="task-status-badge" :class="'status-' + (task.status || 'UNKNOWN')">
                            {{ getStatusText(task.status) }}
                          </span>
                        </div>
                        <p class="task-description" v-if="task.description">
                          {{ task.description }}
                        </p>
                        <div class="task-details">
                          <div class="meta-line">
                            <span class="meta-pair">
                              <span class="meta-label">执行人：</span>
                              <span class="meta-value">{{ task.assignees || '未分配' }}</span>
                            </span>
                            <span class="meta-sep">·</span>
                            <span class="meta-pair">
                              <span class="meta-label">优先级：</span>
                              <span class="meta-value">{{ getPriorityText(task.priority) }}</span>
                            </span>
                            <span class="meta-sep">·</span>
                            <span class="meta-pair">
                              <span class="meta-label">截止时间：</span>
                              <span class="meta-value">{{ formatTaskDate(task.dueDate) }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="task-actions">
                        <button class="action-btn-review" @click="goToProject(task.projectId)">
                          查看项目
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div v-if="isLoadingTasks" class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>加载中...</p>
                  </div>
                  <div v-else-if="pendingTasks.length === 0" class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>{{ reviewMode === 'to-review' ? '暂无需要我审核的任务' : '暂无我提交的任务' }}</p>
                  </div>
                  <div v-else class="task-cards-list">
                    <div 
                      v-for="task in pendingTasks" 
                      :key="task.id"
                      class="task-card-clean"
                      :class="getTaskUrgencyClass(task)"
                    >
                      <div class="task-status-bar" :class="getUrgencyClass(task)"></div>
                      <div class="task-content">
                        <div class="task-header">
                          <h4 class="task-title">{{ task.taskTitle || task.title || '未命名任务' }}</h4>
                        </div>
                        <p class="task-description" v-if="task.description || task.taskDescription">
                          {{ task.description || task.taskDescription }}
                        </p>
                        <div class="task-details">
                          <div class="meta-line">
                            <span class="meta-pair">
                              <span class="meta-label">提交人：</span>
                              <span class="meta-value">{{ getSubmitterName(task) }}</span>
                            </span>
                            <span class="meta-sep">·</span>
                            <span class="meta-pair">
                              <span class="meta-label">项目：</span>
                              <span class="meta-value">{{ task.projectName || '未知项目' }}</span>
                            </span>
                            <span class="meta-sep">·</span>
                            <span class="meta-pair">
                              <span class="meta-label">提交时间：</span>
                              <span class="meta-value">{{ formatSubmissionTime(task.submissionTime) }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="task-actions">
                        <button 
                          class="action-btn-review"
                          @click="openReviewModal(task)"
                          v-if="reviewMode === 'to-review' && isProjectManager(task)"
                        >
                          审核
                        </button>
                        <span v-else-if="reviewMode === 'my-submissions'" class="review-status-text" :class="getReviewStatusClass(task)">
                          {{ getReviewStatusText(task) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </section>

          <!-- 任务统计 -->
          <section 
            v-else-if="activePage === 'task-stats'"
            class="review-panel-section page-section"
          >
            <div class="section-card">
              <div class="section-header">
                <h3 class="section-title">任务统计</h3>
              </div>
              <div class="stats-content">
                <div v-if="isLoadingStats" class="loading-overlay">
                  <div class="loading-spinner small"></div>
                </div>
                <div class="dashboard-pro">
                  <div class="card-overview">
                    <div class="card-header-row">
                      <h4 class="chart-title">总览</h4>
                      <div class="kpi-group">
                        <span class="kpi-badge kpi-progress">进行中 {{ displayStats.inProgress }}</span>
                        <span class="kpi-badge kpi-reviewing">待审核 {{ displayStats.reviewing }}</span>
                        <span class="kpi-badge kpi-done">已完成 {{ displayStats.completed }}</span>
                      </div>
                    </div>
                    <div class="overview-grid">
                      <div class="overview-left">
                        <div ref="pieStatus" class="chart-box medium"></div>
                        <div class="status-summary">
                          <div 
                            v-for="item in statusBreakdown" 
                            :key="item.key"
                            class="status-item"
                          >
                            <span class="status-dot" :style="{ background: item.color }"></span>
                            <span class="status-name">{{ item.label }}</span>
                            <span class="status-count">{{ item.value }}</span>
                            <span class="status-percent">{{ item.percent }}%</span>
                          </div>
                        </div>
                      </div>
                      <div class="overview-right">
                        <div class="mini-gauge" @click="openTaskListModal('inProgress')">
                          <div class="mini-title">进行中</div>
                          <div ref="gaugeInProgress" class="chart-box tiny clickable-chart"></div>
                        </div>
                        <div class="mini-gauge" @click="openTaskListModal('reviewing')">
                          <div class="mini-title">待审核</div>
                          <div ref="gaugeReviewing" class="chart-box tiny clickable-chart"></div>
                        </div>
                        <div class="mini-gauge" @click="openTaskListModal('completed')">
                          <div class="mini-title">已完成</div>
                          <div ref="gaugeCompleted" class="chart-box tiny clickable-chart"></div>
                        </div>
                        <div class="mini-bar">
                          <div class="mini-title">优先级分布</div>
                          <div ref="barPriority" class="chart-box small clickable-chart"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="card-trend">
                    <h4 class="chart-title">过去七天完成趋势</h4>
                    <div ref="lineTrend" class="chart-box large clickable-chart"></div>
                    <h4 class="chart-title">过去七天逾期任务</h4>
                    <div ref="barOverdue" class="chart-box small clickable-chart"></div>
                  </div>
                </div>

                <div class="upcoming-milestones">
                  <h4 class="chart-title">即将到期</h4>
                  <div class="milestones-list">
                    <div 
                      v-for="milestone in upcomingMilestones" 
                      :key="milestone.id"
                      class="milestone-item clickable"
                      @click="goToProject(milestone.projectId)"
                    >
                      <div class="milestone-info">
                        <span class="milestone-name">{{ milestone.title }}</span>
                        <span class="milestone-countdown">{{ getCountdown(milestone.dueDate || milestone.due_date) }}</span>
                      </div>
                    </div>
                    <div v-if="upcomingMilestones.length === 0" class="empty-milestones">
                      <p>暂无即将到期的任务</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 项目总览 -->
          <section 
            v-else-if="activePage === 'projects'"
            class="page-section projects-section"
          >
            <div class="dashboard-card projects-overview">
              <div class="card-header">
                <h3 class="card-title">项目总览</h3>
              </div>
              <div v-if="isLoadingProjects" class="loading-state">
                <div class="loading-spinner small"></div>
              </div>
              <div v-else-if="projects.length === 0" class="empty-state small">
                <p>暂无参与项目</p>
              </div>
              <div v-else class="projects-list">
                <div 
                  v-for="project in projects" 
                  :key="project.id"
                  class="project-item"
                  @click="goToProject(project.id)"
                >
                  <div class="project-info">
                    <div class="project-header">
                      <h4 class="project-name">{{ project.title }}</h4>
                      <span class="project-status-badge" :class="'status-' + project.status">
                        {{ getProjectStatusText(project.status) }}
                      </span>
                    </div>
                  </div>
                  <div class="project-link" @click.stop="goToProject(project.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 操作日志 -->
          <section class="activity-log-section page-section" v-else>
            <div class="section-card">
              <div class="section-header">
                <h3 class="section-title">操作日志</h3>
                <div class="section-controls">
                  <input 
                    type="text" 
                    v-model="logSearchKeyword" 
                    placeholder="搜索日志..."
                    class="search-input"
                    @input="filterActivityLogs"
                  >
                  <select v-model="logFilterType" class="filter-select" @change="filterActivityLogs">
                    <option value="all">全部类型</option>
                    <option value="submission">任务提交</option>
                    <option value="upload">成果上传</option>
                    <option value="comment">评论回复</option>
                    <option value="review">审核操作</option>
                  </select>
                </div>
              </div>
              <div v-if="isLoadingLogs" class="loading-state">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
              </div>
              <div v-else-if="filteredActivityLogs.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>暂无操作记录</p>
              </div>
              <div v-else class="activity-timeline" @scroll="handleLogScroll">
                <div 
                  v-for="log in filteredActivityLogs" 
                  :key="log.id"
                  class="timeline-item"
                >
                  <div class="timeline-dot" :class="'type-' + log.type"></div>
                  <div class="timeline-content">
                    <div class="log-header">
                      <div class="log-header-left">
                        <span class="log-module" v-if="log.module">{{ log.module }}</span>
                        <span class="log-type">{{ getLogTypeText(log.type) }}</span>
                      </div>
                      <span class="log-time">{{ formatDateTime(log.timestamp) }}</span>
                    </div>
                    <p class="log-description">{{ log.description }}</p>
                    <div class="log-meta">
                      <div class="log-source" v-if="log.source">
                        <span class="source-label">来源：</span>
                        <span class="source-name">{{ getSourceText(log.source) }}</span>
                      </div>
                      <div class="log-operator" v-if="log.operator">
                        <span class="operator-label">操作人：</span>
                        <span class="operator-name">{{ log.operator }}</span>
                      </div>
                      <div class="log-project" v-if="log.projectId">
                        <span class="project-label">项目ID：</span>
                        <span class="project-value">{{ log.projectId }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="hasMoreLogs" class="load-more" @click="loadMoreLogs">
                  <span>加载更多</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 审核弹窗 -->
    <TaskSubmissionReviewModal
      :visible.sync="reviewModalVisible"
      :submission="selectedSubmission || {}"
      :active-tab="'pending-for-review'"
      @close="closeReviewModal"
      @success="handleReviewSuccess"
    />

    <!-- 任务列表弹窗 -->
    <div v-if="taskListModalVisible" class="task-list-modal-overlay" @click="closeTaskListModal">
      <div class="task-list-modal" @click.stop>
        <div class="task-list-modal-header">
          <h3 class="task-list-modal-title">{{ taskListModalTitle }}</h3>
          <button class="task-list-modal-close" @click="closeTaskListModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="task-list-modal-content" @wheel="handleModalScroll" @touchmove="handleModalScroll">
          <div v-if="taskListModalTasks.length === 0" class="task-list-empty">
            <p>暂无任务</p>
          </div>
          <div v-else class="task-list-items">
            <div 
              v-for="(task, index) in taskListModalTasks" 
              :key="task.id || index"
              :class="['task-list-item', 'work-item', `${task.priority || 'medium'}-priority`]"
              @click="goToTaskProject(task)"
              style="cursor: pointer;"
            >
              <div class="priority-bar"></div>
              <div class="item-content">
                <div class="item-header">
                  <h3 class="item-title">{{ task.title }}</h3>
                  <!-- 临近截止警示图标 -->
                  <div v-if="isOverdue(task.dueDate)" class="deadline-alert overdue" title="任务已逾期">
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
                  <span class="deadline">{{ formatTaskDate(task.dueDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import TaskSubmissionReviewModal from '@/components/TaskSubmissionReviewModal.vue'
import { 
  getPendingSubmissionsForReview,
  getMySubmissions
} from '@/api/taskSubmission'
import { taskAPI } from '@/api/task'
import { projectAPI } from '@/api/project'
import { getMyActivityLogs } from '@/api/operationLog'

export default {
  name: 'MyActivity',
  components: {
    Sidebar,
    TaskSubmissionReviewModal
  },
  beforeDestroy() {
    // 销毁图表与事件
    if (this._charts) {
      Object.values(this._charts).forEach(c => c && c.dispose && c.dispose())
    }
    window.removeEventListener('resize', this.resizeCharts)
  },
  data() {
    return {
      // 侧边栏状态
      sidebarOpen: false,

      // 页面内导航
      activePage: 'my-tasks',
      activityNavItems: [
        { key: 'my-tasks', label: '我的任务' },
        { key: 'task-stats', label: '任务统计' },
        { key: 'projects', label: '项目总览' },
        { key: 'activity-log', label: '操作日志' }
      ],

      // 用户信息
      userName: '用户',
      
      // 任务审核面板
      pendingTasks: [],
      isLoadingTasks: false,
      sortBy: 'dueDate',
      showOverdueOnly: false,
      reviewMode: 'to-review', // 'to-review': 我审核的任务, 'my-submissions': 我提交的任务（包括待审核和已完成）
      createdTasks: [],
      isLoadingCreatedTasks: false,
      createdTaskStats: {
        total: 0,
        inProgress: 0,
        completed: 0,
        pending: 0
      },
      
      // 项目总览
      projects: [],
      isLoadingProjects: false,
      
      // 任务统计
      taskStats: {
        pending: 0,
        inProgress: 0,
        completed: 0,
        reviewing: 0,
        high: 0,
        medium: 0,
        low: 0,
        trendData: [], // 过去7天每天完成的任务数
        overdueData: [] // 过去7天每天逾期的任务数
      },
      // 用于动画显示的数据（从0逐渐增加到真实值）
      displayStats: {
        inProgress: 0,
        completed: 0,
        reviewing: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      isLoadingStats: false,
      upcomingMilestones: [],
      // 用于tooltip显示的任务列表
      inProgressTasks: [], // 进行中的任务列表
      reviewingTasks: [], // 待审核任务列表
      completedTasks: [], // 已完成的任务列表
      highPriorityTasks: [], // 高优先级任务列表
      mediumPriorityTasks: [], // 中优先级任务列表
      lowPriorityTasks: [], // 低优先级任务列表
      trendCompletedTasks: [], // 过去7天完成的任务列表（所有日期合并）
      trendOverdueTasks: [], // 过去7天逾期的任务列表（所有日期合并）
      trendCompletedTasksByDay: [], // 过去7天每天完成的任务列表（按日期索引分组，7个数组）
      trendOverdueTasksByDay: [], // 过去7天每天逾期的任务列表（按日期索引分组，7个数组）
      
      // 操作日志
      activityLogs: [],
      filteredActivityLogs: [],
      isLoadingLogs: false,
      logSearchKeyword: '',
      logFilterType: 'all',
      logPage: 0,
      logPageSize: 20,
      hasMoreLogs: true,
      
      // 审核弹窗
      reviewModalVisible: false,
      selectedSubmission: null,
      
      // 任务列表弹窗
      taskListModalVisible: false,
      taskListModalType: '', // 'inProgress' 或 'completed'
      taskListModalTitle: '',
      taskListModalTasks: []
    }
  },
  computed: {
    maxTaskCount() {
      return Math.max(
        this.displayStats.inProgress || 0,
        this.displayStats.completed || 0,
        1
      )
    },
    statusBreakdown() {
      const total =
        (this.displayStats.inProgress || 0) +
        (this.displayStats.completed || 0) +
        (this.displayStats.reviewing || 0)
      const palette = ['#7DD3A8', '#FBBF83', '#C7B9FF']
      const items = [
        { key: 'inProgress', label: '进行中', value: this.displayStats.inProgress || 0, color: palette[0] },
        { key: 'completed', label: '已完成', value: this.displayStats.completed || 0, color: palette[1] },
        { key: 'reviewing', label: '待审核', value: this.displayStats.reviewing || 0, color: palette[2] }
      ]
      return items.map((item) => ({
        ...item,
        percent: total > 0 ? Math.round((item.value / total) * 100) : 0
      }))
    }
  },
  mounted() {
    this.initPage()
    this.ensureTooltipZIndex()
    // 预加载ECharts库（在后台加载，不阻塞UI）
    this.preloadECharts()
  },
  methods: {
    ensureTooltipZIndex() {
      // 创建一个style标签，确保ECharts tooltip的z-index足够高
      if (!document.getElementById('echarts-tooltip-zindex-style')) {
        const style = document.createElement('style')
        style.id = 'echarts-tooltip-zindex-style'
        style.textContent = `
          /* 确保ECharts tooltip显示在最上层 */
          div[class*="echarts-tooltip"],
          div[id*="echarts"][style*="pointer-events: none"] {
            z-index: 10000 !important;
          }
        `
        document.head.appendChild(style)
      }
    },

    async loadCreatedTasks() {
      this.isLoadingCreatedTasks = true
      try {
        const response = await taskAPI.getMyCreatedTasks(0, 50)
        let tasks = []
        if (response && Array.isArray(response)) {
          tasks = response
        } else if (response && response.data) {
          const payload = response.data
          if (Array.isArray(payload)) {
            tasks = payload
          } else if (Array.isArray(payload.content)) {
            tasks = payload.content
          } else if (Array.isArray(payload.list)) {
            tasks = payload.list
          } else if (Array.isArray(payload.records)) {
            tasks = payload.records
          }
        } else if (Array.isArray(response?.content)) {
          tasks = response.content
        }

        const mappedTasks = (tasks || []).map(task => this.mapCreatedTask(task))
        this.createdTasks = mappedTasks
        this.updateCreatedTaskStats(mappedTasks)
      } catch (error) {
        console.error('加载我发布的任务失败:', error)
        this.createdTasks = []
        this.updateCreatedTaskStats([])
      } finally {
        this.isLoadingCreatedTasks = false
      }
    },

    async applySampleTaskStats() {
      const sample = this.getSampleStats()
      this.taskStats.pending = sample.pending
      this.taskStats.inProgress = sample.inProgress
      this.taskStats.completed = sample.completed
      this.taskStats.reviewing = sample.reviewing
      this.taskStats.high = sample.high
      this.taskStats.medium = sample.medium
      this.taskStats.low = sample.low
      
      // 启动数字动画效果
      this.animateStats()
      this.upcomingMilestones = sample.milestones

      await this.$nextTick()
      await this.ensureChartsInitialized()
      if (window.echarts) this.updateCharts(window.echarts)
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    
    closeSidebar() {
      this.sidebarOpen = false
    },
    
    setActivePage(pageKey) {
      if (this.activePage === pageKey) return
      this.activePage = pageKey
      if (pageKey === 'task-stats') {
        this.$nextTick(() => {
          this.ensureChartsInitialized()
        })
      }
    },
    
    goToHome() {
      this.$router.push('/home')
    },
    
    async ensureChartsInitialized() {
      // 确保 DOM 已渲染
      await this.$nextTick()
      // 已初始化则跳过
      if (this._charts && this._charts.gaugePending) return
      // 加载并初始化
      const echarts = await this.loadECharts().catch(() => null)
      if (!echarts) return
      this.initCharts(echarts)
    },
    async loadECharts() {
      if (window.echarts) return window.echarts
      const cdns = [
        'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js',
        'https://unpkg.com/echarts@5/dist/echarts.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js'
      ]
      for (let i = 0; i < cdns.length; i++) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = cdns[i]
            s.async = true
            s.onload = () => resolve()
            s.onerror = () => {
              s.remove()
              reject(new Error('cdn failed'))
            }
            document.head.appendChild(s)
          })
          if (window.echarts) return window.echarts
        } catch (e) {
          // 尝试下一个CDN
        }
      }
      throw new Error('ECharts CDN 加载失败')
    },

    preloadECharts() {
      // 在后台预加载ECharts，不阻塞主流程
      if (!window.echarts) {
        this.loadECharts().catch(err => {
          console.warn('[MyActivity] ECharts预加载失败，将在需要时重试:', err)
        })
      }
    },

    async initPage() {
      this.loadUserInfo()
      // 并行加载所有数据
      await Promise.all([
        this.loadPendingTasks(),
        this.loadProjects(),
        this.loadTaskStatistics(),
        this.loadActivityLogs()
      ])
    },
    
    loadUserInfo() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
        this.userName = userInfo.nickname || userInfo.name || '用户'
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
    
    
    
    switchReviewMode(mode) {
      if (this.reviewMode === mode) return
      this.reviewMode = mode
      if (mode === 'my-created') {
        this.loadCreatedTasks()
      } else {
        this.loadPendingTasks()
      }
    },
    
    async loadPendingTasks() {
      this.isLoadingTasks = true
      try {
        let response
        if (this.reviewMode === 'to-review') {
          // 我审核的任务（别人提交的，需要我审核的）
          response = await getPendingSubmissionsForReview({
            page: 0,
            size: 50
          })
        } else {
          // 我提交的任务（包括待审核和已完成的）
          response = await getMySubmissions({
            page: 0,
            size: 50
          })
        }
        
        if (response.code === 200) {
          let tasks = response.data.content || []
          
          console.log('[MyActivity] 加载的待审核任务:', tasks)
          
          // 过滤逾期项
          if (this.showOverdueOnly) {
            const now = new Date()
            tasks = tasks.filter(task => {
              const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
              return dueDate < now
            })
          }
          
          // 排序
          tasks = this.sortTasks(tasks, this.sortBy)
          
          this.pendingTasks = tasks
        } else {
          this.pendingTasks = []
        }
      } catch (error) {
        console.error('加载待审核任务失败:', error)
        this.pendingTasks = []
      } finally {
        this.isLoadingTasks = false
      }
    },
    
    sortTasks(tasks, sortBy) {
      const sorted = [...tasks]
      switch (sortBy) {
        case 'project':
          return sorted.sort((a, b) => {
            const nameA = (a.projectName || '').localeCompare(b.projectName || '')
            return nameA
          })
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          return sorted.sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 0
            const priorityB = priorityOrder[b.priority] || 0
            return priorityB - priorityA
          })
        case 'dueDate':
        default:
          return sorted.sort((a, b) => {
            const dateA = new Date(a.dueDate || a.due_date || a.taskDueDate || 0)
            const dateB = new Date(b.dueDate || b.due_date || b.taskDueDate || 0)
            return dateA - dateB
          })
      }
    },
    
    getTaskUrgencyClass(task) {
      const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'overdue'
      if (diffDays <= 3) return 'urgent'
      return 'normal'
    },
    
    getUrgencyClass(task) {
      const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'red'
      if (diffDays <= 3) return 'orange'
      return 'blue'
    },
    
    getStatusText(status) {
      if (!status) return '未知'
      const normalized = String(status).toUpperCase()
      const statusMap = {
        'PENDING': '未开始',
        'TODO': '未开始',
        'NOT_STARTED': '未开始',
        'IN_PROGRESS': '进行中',
        'PROGRESS': '进行中',
        'DONE': '已完成',
        'COMPLETED': '已完成',
        'REVIEWING': '待审核',
        'PENDING_REVIEW': '待审核',
        'REVIEW': '待审核',
        'APPROVED': '已通过',
        'REJECTED': '已驳回'
      }
      return statusMap[normalized] || status || '未知'
    },

    getStatusColorClass(status) {
      return `status-${this.normalizeStatus(status)}`
    },
    
    getDueDateClass(task) {
      const dueDate = new Date(task.dueDate || task.due_date || task.taskDueDate)
      if (isNaN(dueDate.getTime())) return ''
      const now = new Date()
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return 'overdue-text'
      if (diffDays <= 3) return 'urgent-text'
      return ''
    },
    
    getSubmitterName(task) {
      // 从 submitter 对象获取提交人姓名
      if (task.submitter && task.submitter.name) {
        return task.submitter.name
      }
      return '未知'
    },
    
    formatDueDate(dateStr) {
      if (!dateStr) return '无截止日期'
      const date = new Date(dateStr)
      const now = new Date()
      const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`
      if (diffDays === 0) return '今天到期'
      if (diffDays === 1) return '明天到期'
      if (diffDays <= 7) return `${diffDays} 天后到期`
      
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    },
    
    formatSubmissionTime(dateStr) {
      if (!dateStr) return '未知时间'
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffMins < 1) return '刚刚'
      if (diffMins < 60) return `${diffMins} 分钟前`
      if (diffHours < 24) return `${diffHours} 小时前`
      if (diffDays < 7) return `${diffDays} 天前`
      
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    },
    
    isProjectManager(task) {
      if (!task) return false
      const currentUserId = this.getCurrentUserId()
      const taskCreatorId = task.taskCreatorId || task.creatorId
      return String(taskCreatorId) === String(currentUserId)
    },
    
    getCurrentUserId() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
        return userInfo.id || userInfo.userId || userInfo.user_id || null
      } catch (error) {
        return null
      }
    },
    
    openReviewModal(task) {
      // 将任务转换为提交格式
      this.selectedSubmission = {
        ...task,
        taskTitle: task.taskTitle || task.title,
        projectName: task.projectName
      }
      this.reviewModalVisible = true
    },
    
    viewTaskDetail(task) {
      if (task.projectId || task.project_id) {
        this.$router.push(`/project-detail/${task.projectId || task.project_id}`)
      }
    },
    
    closeReviewModal() {
      this.reviewModalVisible = false
      this.selectedSubmission = null
    },
    
    async handleReviewSuccess() {
      this.loadPendingTasks()
      this.loadTaskStatistics()
      this.loadActivityLogs()
      if (this.reviewMode === 'my-created') {
        this.loadCreatedTasks()
      }
    },
    
    async loadProjects() {
      this.isLoadingProjects = true
      try {
        const pageSize = 100
        const fetchAllProjects = async (fetcher) => {
          const results = []
          let page = 0
          let hasMore = true
          while (hasMore) {
            const response = await fetcher(page, pageSize)
            const payload = response?.data ?? response
            const { projects, totalPages } = this.extractProjectsFromResponse(payload)
            if (Array.isArray(projects) && projects.length > 0) {
              results.push(...projects)
              if (typeof totalPages === 'number') {
                hasMore = page + 1 < totalPages
              } else {
                hasMore = projects.length === pageSize
              }
            } else {
              hasMore = false
            }
            page += 1
            if (page > 10) {
              hasMore = false
            }
          }
          return results
        }

        const [participatedProjects, createdProjects] = await Promise.allSettled([
          fetchAllProjects((page, size) => projectAPI.getMyProjects(page, size)),
          fetchAllProjects((page, size) => projectAPI.getMyCreatedProjects(page, size))
        ])

        const mergedProjectsMap = new Map()
        const mergedList = []

        if (participatedProjects.status === 'fulfilled') {
          mergedList.push(...participatedProjects.value)
        } else {
          console.warn('[MyActivity] 获取我参与的项目失败:', participatedProjects.reason)
        }

        if (createdProjects.status === 'fulfilled') {
          mergedList.push(...createdProjects.value)
        } else {
          console.warn('[MyActivity] 获取我创建的项目失败:', createdProjects.reason)
        }

        // 合并本地缓存中的项目，作为兜底数据
        try {
          const cachedProjectsRaw = localStorage.getItem('projects')
          if (cachedProjectsRaw) {
            const cachedProjects = JSON.parse(cachedProjectsRaw)
            if (Array.isArray(cachedProjects)) {
              mergedList.push(...cachedProjects)
            } else {
              console.warn('[MyActivity] 本地缓存的 projects 数据格式不是数组')
            }
          }
        } catch (error) {
          console.warn('[MyActivity] 解析本地缓存 projects 失败:', error)
        }

        mergedList.forEach(project => {
          const rawId = project?.id || project?.projectId || project?.project_id
          if (!rawId) return
          const key = String(rawId)
          if (!mergedProjectsMap.has(key)) {
            mergedProjectsMap.set(key, project)
          }
        })

        this.projects = Array.from(mergedProjectsMap.values()).map(project => {
          const status = this.mapProjectStatus(project.status)
          return {
            id: project.id || project.projectId || project.project_id,
            title: project.title || project.name || project.projectName || '未命名项目',
            description: project.description || project.desc || '',
            status,
            progress: this.calculateProjectProgress(status)
          }
        })
      } catch (error) {
        console.error('加载项目失败:', error)
        this.projects = []
      } finally {
        this.isLoadingProjects = false
      }
    },
    
    goToProject(projectId) {
      this.$router.push(`/project-detail/${projectId}`)
    },
    
    async loadTaskStatistics() {
      this.isLoadingStats = true
      
      try {
        // 并行加载统计数据和ECharts库
        const [statsResponse, echarts] = await Promise.all([
          taskAPI.getUserTaskStatistics().catch(() => ({ code: 0 })),
          this.loadECharts().catch(() => null)
        ])
        
        if (statsResponse.code === 200) {
          const stats = statsResponse.data || {}
          console.log('[MyActivity] API返回的统计数据:', stats)
          
          // 尝试多种可能的字段名
          this.taskStats.pending = stats.pendingCount || stats.pending || stats.todoCount || stats.todo || 0
          this.taskStats.inProgress = stats.inProgressCount || stats.inProgress || stats.progressCount || stats.progress || 0
          this.taskStats.completed = stats.completedCount || stats.completed || stats.doneCount || stats.done || 0
          this.taskStats.reviewing = stats.reviewingCount || stats.reviewing || stats.pendingReviewCount || stats.pendingReview || 0
          
          // 从统计数据中获取优先级分布（如果API返回）
          this.taskStats.high = stats.highPriorityCount || stats.high || 0
          this.taskStats.medium = stats.mediumPriorityCount || stats.medium || 0
          this.taskStats.low = stats.lowPriorityCount || stats.low || 0
          
          console.log('[MyActivity] 解析后的统计数据:', {
            pending: this.taskStats.pending,
            inProgress: this.taskStats.inProgress,
            completed: this.taskStats.completed,
            high: this.taskStats.high,
            medium: this.taskStats.medium,
            low: this.taskStats.low
          })
          
          // 立即更新显示数据，确保用户能立即看到数字
          this.displayStats.inProgress = this.taskStats.inProgress
          this.displayStats.completed = this.taskStats.completed
          this.displayStats.reviewing = this.taskStats.reviewing
          this.displayStats.high = this.taskStats.high
          this.displayStats.medium = this.taskStats.medium
          this.displayStats.low = this.taskStats.low
        } else {
          console.warn('[MyActivity] 统计数据API返回非200状态:', statsResponse.code, statsResponse)
        }
        
        // 立即隐藏loading，显示基础数据
        this.isLoadingStats = false
        
        // 使用 requestIdleCallback 在浏览器空闲时初始化图表
        if (echarts) {
          await this.$nextTick()
          
          const initChartsWhenIdle = () => {
            if (!this._charts || !this._charts.gaugePending) {
              this.initCharts(echarts)
            } else {
              this.updateCharts(echarts)
            }
          }
          
          // 如果浏览器支持 requestIdleCallback，在空闲时初始化
          if (window.requestIdleCallback) {
            window.requestIdleCallback(initChartsWhenIdle, { timeout: 300 })
          } else {
            // 否则延迟50ms执行，让页面先渲染
            setTimeout(initChartsWhenIdle, 50)
          }
        }
        
        // 后台异步加载详细任务数据（不阻塞UI）
        this.loadTaskDetailsAsync()
      } catch (error) {
        console.error('加载任务统计失败:', error)
        this.isLoadingStats = false
      }
    },
    
    async loadTaskDetailsAsync() {
      // 后台异步加载详细任务数据，不阻塞UI
      try {
        const [assignedResult, createdResult] = await Promise.allSettled([
          taskAPI.getMyAssignedTasks(0, 100),
          taskAPI.getMyCreatedTasks(0, 100)
        ])

        let allTasks = []
        if (assignedResult.status === 'fulfilled' && assignedResult.value?.code === 200) {
          let assigned = this.extractTaskList(assignedResult.value.data)
          if (!assigned.length) assigned = this.extractTaskList(assignedResult.value)
          console.log('[MyActivity] 我的任务数量:', assigned.length)
          allTasks = assigned.slice()
        } else {
          console.warn('[MyActivity] 获取我的任务失败:', assignedResult.status === 'rejected' ? assignedResult.reason : assignedResult.value)
        }

        if (createdResult.status === 'fulfilled' && createdResult.value?.code === 200) {
          let created = this.extractTaskList(createdResult.value.data)
          if (!created.length) created = this.extractTaskList(createdResult.value)
          console.log('[MyActivity] 我发布的任务数量:', created.length)
          const seenIds = new Set(
            allTasks.map(task => String(task.id || task.taskId || task.taskID || task.uuid || task.code || task.number))
          )
          created.forEach(task => {
            const taskId = String(task.id || task.taskId || task.taskID || task.uuid || `${task.projectId || task.project_id || 'project'}-${task.title || task.taskTitle || Math.random()}`)
            if (!seenIds.has(taskId)) {
              seenIds.add(taskId)
              allTasks.push(task)
            }
          })
        } else if (createdResult.status === 'rejected') {
          console.warn('[MyActivity] 获取我发布的任务失败:', createdResult.reason)
        }

        console.log('[MyActivity] 统计使用的任务总数:', allTasks.length)

        // 如果API返回的统计数据为空，从任务列表中计算
        const hasApiStats = ['pending', 'inProgress', 'completed', 'reviewing'].some(key => (this.taskStats[key] || 0) > 0)
        if (!hasApiStats && allTasks.length > 0) {
          console.log('[MyActivity] API统计数据为空，从任务列表计算统计数据')
          const statusCounts = { pending: 0, inProgress: 0, completed: 0, reviewing: 0 }
          const priorityCounts = { high: 0, medium: 0, low: 0 }
          
          // 单次遍历同时计算状态和优先级
          allTasks.forEach(task => {
            const status = String(task.status || '').toUpperCase()
            if (
              status === 'DONE' ||
              status === 'COMPLETED' ||
              status.includes('DONE') ||
              status.includes('COMPLETED') ||
              status.includes('完成')
            ) {
              statusCounts.completed++
            } else if (status === 'IN_PROGRESS' || status.includes('PROGRESS') || status.includes('进行中')) {
              statusCounts.inProgress++
            } else if (status === 'REVIEWING' || status.includes('REVIEW') || status.includes('待审核') || status === 'PENDING_REVIEW') {
              statusCounts.reviewing++
            } else {
              statusCounts.pending++
            }
            
            // 同时计算优先级
            const priority = this.mapTaskPriority(task.priority)
            if (priority === 'high') priorityCounts.high++
            else if (priority === 'medium') priorityCounts.medium++
            else if (priority === 'low') priorityCounts.low++
          })
          
          this.taskStats.pending = statusCounts.pending
          this.taskStats.inProgress = statusCounts.inProgress
          this.taskStats.completed = statusCounts.completed
          this.taskStats.reviewing = statusCounts.reviewing
          this.taskStats.high = priorityCounts.high
          this.taskStats.medium = priorityCounts.medium
          this.taskStats.low = priorityCounts.low
          
          console.log('[MyActivity] 从任务列表计算的统计数据:', statusCounts, priorityCounts)
          
          // 启动数字动画效果
          this.animateStats()
          
          // 更新图表
          if (this._charts) {
            this.updateCharts(window.echarts)
          }
        }

        // 分类任务到不同状态列表（保存完整任务对象）- 单次遍历完成所有分类
        this.inProgressTasks = []
        this.reviewingTasks = []
        this.completedTasks = []
        this.highPriorityTasks = []
        this.mediumPriorityTasks = []
        this.lowPriorityTasks = []
        
        // 单次遍历完成所有分类和计算
        allTasks.forEach(task => {
          const status = String(task.status || '').toUpperCase()
          const priority = this.mapTaskPriority(task.priority)
          
          const taskObj = {
            id: task.id || task.taskId,
            title: task.title || task.taskTitle || '未命名任务',
            description: task.description || task.taskDescription || '',
            priority: priority,
            dueDate: task.dueDate || task.due_date || task.taskDueDate,
            status: task.status || 'TODO',
            projectId: task.projectId || task.project_id
          }
          
          // 按状态分类
          if (
            status === 'DONE' ||
            status === 'COMPLETED' ||
            status.includes('DONE') ||
            status.includes('COMPLETED') ||
            status.includes('完成')
          ) {
            this.completedTasks.push(taskObj)
          } else if (status === 'IN_PROGRESS' || status.includes('PROGRESS') || status.includes('进行中')) {
            this.inProgressTasks.push(taskObj)
          } else if (status === 'REVIEWING' || status.includes('REVIEW') || status.includes('待审核') || status === 'PENDING_REVIEW') {
            this.reviewingTasks.push(taskObj)
          }
          
          // 按优先级分类
          if (priority === 'high') {
            this.highPriorityTasks.push(taskObj)
          } else if (priority === 'medium') {
            this.mediumPriorityTasks.push(taskObj)
          } else if (priority === 'low') {
            this.lowPriorityTasks.push(taskObj)
          }
        })
        
        // 如果API没有返回优先级统计，使用计算的值
        const hasPriorityStats = ['high', 'medium', 'low'].some(key => (this.taskStats[key] || 0) > 0)
        if (!hasPriorityStats) {
          this.taskStats.high = this.highPriorityTasks.length
          this.taskStats.medium = this.mediumPriorityTasks.length
          this.taskStats.low = this.lowPriorityTasks.length
          // 更新动画显示值
          this.animateStats()
        }

        const now = new Date()
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        this.upcomingMilestones = allTasks
          .filter(task => {
            const dueDate = new Date(task.dueDate || task.due_date)
            const status = String(task.status || '').toUpperCase()
            const isCompleted =
              status === 'DONE' ||
              status === 'COMPLETED' ||
              status.includes('DONE') ||
              status.includes('COMPLETED') ||
              status.includes('完成')
            // 排除已完成的任务
            return !isCompleted && dueDate >= now && dueDate <= sevenDaysLater
          })
          .slice(0, 5)

        // 计算过去7天的完成趋势和逾期任务（使用真实数据）
        this.calculateTrendData(allTasks)

        // 确保 trendData 和 overdueData 已初始化（如果没有数据则为空数组）
        if (!this.taskStats.trendData || this.taskStats.trendData.length === 0) {
          this.taskStats.trendData = Array(7).fill(0)
        }
        if (!this.taskStats.overdueData || this.taskStats.overdueData.length === 0) {
          this.taskStats.overdueData = Array(7).fill(0)
        }

        // 更新图表（如果已初始化）
        if (this._charts && window.echarts) {
          this.updateCharts(window.echarts)
        }
      } catch (error) {
        console.error('加载任务详情失败:', error)
      }
    },


    calculateTrendData(allTasks) {
      console.log('[MyActivity] 计算趋势数据，任务数量:', allTasks.length)
      
      // 计算过去7天每天完成的任务数
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      
      // 初始化过去7天的数据数组
      const trendData = Array(7).fill(0)
      const overdueData = Array(7).fill(0)
      
      // 初始化按日期分组的任务列表
      const trendCompletedTasksByDay = Array(7).fill(null).map(() => [])
      const trendOverdueTasksByDay = Array(7).fill(null).map(() => [])
      
      // 生成过去7天的日期数组（从6天前到今天）
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
        d.setHours(0, 0, 0, 0)
        return d
      })
      
      console.log('[MyActivity] 过去7天日期范围:', days.map(d => d.toLocaleDateString('zh-CN')))
      
      let completedCount = 0
      let overdueCount = 0
      
      allTasks.forEach(task => {
        const status = String(task.status || '').toUpperCase()
        const isCompleted =
          status === 'DONE' ||
          status === 'COMPLETED' ||
          status.includes('DONE') ||
          status.includes('COMPLETED') ||
          status.includes('完成')
        
        const taskObj = {
          id: task.id || task.taskId,
          title: task.title || task.taskTitle || '未命名任务',
          description: task.description || task.taskDescription || '',
          priority: this.mapTaskPriority(task.priority),
          dueDate: task.dueDate || task.due_date || task.taskDueDate,
          status: task.status || 'TODO',
          projectId: task.projectId || task.project_id
        }
        
        // 计算完成趋势：如果任务已完成，检查更新时间/完成时间/截止日期是否在过去7天内
        if (isCompleted) {
          completedCount++
          let completedAt =
            task.updatedAt ||
            task.updated_at ||
            task.completedAt ||
            task.completed_at ||
            task.completedDate ||
            task.completed_date ||
            task.dueDate ||
            task.due_date
          console.log('[MyActivity] 检查已完成任务:', task.id, task.title, '状态:', task.status, 'completedAt:', completedAt)
          if (completedAt) {
            const completeDate = new Date(completedAt)
            completeDate.setHours(0, 0, 0, 0)
            
            // 找到这个日期在days数组中的索引
            const dayIndex = days.findIndex(d => {
              return d.getTime() === completeDate.getTime()
            })
            
            console.log('[MyActivity] 任务完成日期:', completeDate.toLocaleDateString('zh-CN'), 'dayIndex:', dayIndex)
            
            if (dayIndex >= 0) {
              trendData[dayIndex]++
              trendCompletedTasksByDay[dayIndex].push(taskObj)
            }
          } else {
            console.log('[MyActivity] 已完成任务但无法确定完成日期:', task.id, task.title, '完整任务数据:', JSON.stringify(task))
          }
        }
        
        // 计算逾期任务：如果任务未完成且有截止日期，检查是否在过去7天内逾期
        if (!isCompleted && (task.dueDate || task.due_date)) {
          const dueDate = new Date(task.dueDate || task.due_date)
          dueDate.setHours(0, 0, 0, 0)
          
          // 检查是否逾期（截止日期在今天之前）
          if (dueDate < now) {
            overdueCount++
            // 找到这个日期在days数组中的索引（逾期日期）
            const dayIndex = days.findIndex(d => {
              return d.getTime() === dueDate.getTime()
            })
            
            // 如果逾期日期在过去7天内，记录在对应的日期
            if (dayIndex >= 0) {
              overdueData[dayIndex]++
              trendOverdueTasksByDay[dayIndex].push(taskObj)
            } else if (dueDate < days[0]) {
              // 如果逾期日期在7天之前，记录在最早的那一天
              overdueData[0]++
              trendOverdueTasksByDay[0].push(taskObj)
            }
          }
        }
      })
      
      // 将所有日期的任务合并到一个数组中（用于显示所有任务）
      this.trendCompletedTasks = trendCompletedTasksByDay.flat()
      this.trendOverdueTasks = trendOverdueTasksByDay.flat()
      
      // 保存按日期分组的任务列表（用于按日期显示）
      this.trendCompletedTasksByDay = trendCompletedTasksByDay
      this.trendOverdueTasksByDay = trendOverdueTasksByDay
      
      console.log('[MyActivity] 趋势数据计算结果:', {
        completedTasks: completedCount,
        overdueTasks: overdueCount,
        trendData,
        overdueData,
        trendCompletedTasksCount: this.trendCompletedTasks.length,
        trendOverdueTasksCount: this.trendOverdueTasks.length,
        trendCompletedTasksByDayCount: this.trendCompletedTasksByDay.map(day => day.length),
        trendOverdueTasksByDayCount: this.trendOverdueTasksByDay.map(day => day.length)
      })
      
      this.taskStats.trendData = trendData
      this.taskStats.overdueData = overdueData
    },

    extractTaskList(payload, depth = 0) {
      if (!payload || depth > 2) return []
      if (Array.isArray(payload)) return payload
      const candidates = [payload.content, payload.list, payload.records, payload.data, payload.items]
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i]
        if (Array.isArray(candidate)) return candidate
        if (candidate && typeof candidate === 'object') {
          const nested = this.extractTaskList(candidate, depth + 1)
          if (nested.length) return nested
        }
      }
      return []
    },

    getSampleStats() {
      const today = new Date()
      const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`
      // 生成示例趋势数据
      const trendData = Array.from({ length: 7 }).map(() => Math.max(0, Math.floor(Math.random() * 5)))
      const overdueData = Array.from({ length: 7 }).map(() => Math.max(0, Math.round(Math.random() * 3)))
      
      return {
        pending: 6,
        inProgress: 11,
        completed: 9,
        reviewing: 4,
        high: 5,
        medium: 12,
        low: 9,
        trendData,
        overdueData,
        milestones: [
          { id: 'm1', title: '提交项目周报', dueDate: new Date(today.getTime() + 1 * 86400000) },
          { id: 'm2', title: '评审数据标注方案', dueDate: new Date(today.getTime() + 2 * 86400000) },
          { id: 'm3', title: '发布 v0.2 内测版', dueDate: new Date(today.getTime() + 5 * 86400000) },
        ]
      }
    },

    initCharts(echarts) {
      this._charts = this._charts || {}

      const create = (ref, opts) => {
        const dom = this.$refs[ref]
        if (!dom) return null
        const chart = echarts.init(dom)
        chart.setOption(opts)
        return chart
      }

      const total = (this.displayStats.inProgress || 0) + (this.displayStats.completed || 0) + (this.displayStats.reviewing || 0)
      // 更柔和的配色（总览不刺眼）
      const palette = ['#7DD3A8', '#FBBF83', '#C7B9FF', '#F59FB0', '#5FD4E6']

      // 仪表盘
      const gaugeBase = {
        type: 'gauge',
        radius: '75%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        progress: { show: true, roundCap: true, width: 10 },
        pointer: { show: true, length: '60%' },
        // 背景环尽量"透明"，只突出扫过部分
        axisLine: { lineStyle: { width: 10, color: [[1, 'rgba(0,0,0,0.06)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { 
          valueAnimation: true,
          formatter: (value) => {
            return value.toString() // 确保不显示换行符
          },
          fontSize: 16,
          color: '#111827',
          offsetCenter: [0, '90%'] // 将数字移动到外圈下方，避免遮挡
        },
        animationDuration: 1800,
        animationEasing: 'cubicOut'
      }
      const gaugeMax = Math.max(1, total)
      
      this._charts.gaugeInProgress = create('gaugeInProgress', {
        tooltip: {
          show: false // 禁用tooltip
        },
        series: [{ 
          ...gaugeBase, 
          max: gaugeMax,
          progress: { show: true, roundCap: true, width: 10, itemStyle: { color: palette[0] } },
          data: [{ value: 0 }] 
        }]
      })
      // 延迟更新到实际值以触发动画
      setTimeout(() => {
        if (this._charts.gaugeInProgress) {
          this._charts.gaugeInProgress.setOption({
            series: [{ data: [{ value: this.displayStats.inProgress || 0 }] }]
          })
        }
      }, 100)
      this._charts.gaugeCompleted = create('gaugeCompleted', {
        tooltip: {
          show: false // 禁用tooltip
        },
        series: [{ 
          ...gaugeBase, 
          max: gaugeMax,
          progress: { show: true, roundCap: true, width: 10, itemStyle: { color: palette[1] } },
          data: [{ value: 0 }] 
        }]
      })
      setTimeout(() => {
        if (this._charts.gaugeCompleted) {
          this._charts.gaugeCompleted.setOption({
            series: [{ data: [{ value: this.displayStats.completed || 0 }] }]
          })
        }
      }, 100)
      this._charts.gaugeReviewing = create('gaugeReviewing', {
        tooltip: {
          show: false // 禁用tooltip
        },
        series: [{ 
          ...gaugeBase, 
          max: gaugeMax,
          progress: { show: true, roundCap: true, width: 10, itemStyle: { color: palette[2] } },
          data: [{ value: 0 }] 
        }]
      })
      setTimeout(() => {
        if (this._charts.gaugeReviewing) {
          this._charts.gaugeReviewing.setOption({
            series: [{ data: [{ value: this.displayStats.reviewing || 0 }] }]
          })
        }
      }, 100)

      // 环形图 - 计算百分比并显示
      const totalForPie = (this.displayStats.inProgress || 0) + (this.displayStats.completed || 0) + (this.displayStats.reviewing || 0)
      
      // 检测是否移动端
      const isMobile = window.innerWidth <= 768
      
      this._charts.pieStatus = create('pieStatus', {
        color: [palette[0], palette[1], palette[2]],
        tooltip: { 
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: { 
          bottom: isMobile ? 5 : 10,
          itemGap: isMobile ? 8 : 12,
          textStyle: {
            fontSize: isMobile ? 11 : 12,
            padding: [0, 5, 0, 0]
          }
        },
        series: [{
          name: '状态',
          type: 'pie',
          radius: isMobile ? ['35%', '55%'] : ['45%', '70%'],
          center: ['50%', isMobile ? '35%' : '45%'],
          avoidLabelOverlap: false,
          label: { 
            show: totalForPie > 0,
            position: 'inside',
            formatter: '{d}%',
            fontSize: 14,
            fontWeight: '700',
            color: '#4b5563',
            textBorderColor: '#ffffff',
            textBorderWidth: 2,
            textShadowColor: 'rgba(255, 255, 255, 0.8)',
            textShadowBlur: 4,
            textShadowOffsetX: 0,
            textShadowOffsetY: 0
          },
          labelLine: { show: false },
          emphasis: { 
            label: { 
              show: true, 
              fontSize: 16, 
              fontWeight: '700',
              formatter: '{b}: {d}%',
              color: '#374151',
              textBorderColor: '#ffffff',
              textBorderWidth: 2.5,
              textShadowColor: 'rgba(255, 255, 255, 0.9)',
              textShadowBlur: 5
            } 
          },
          animationType: 'scale',
          animationEasing: 'cubicOut',
          animationDuration: 1500,
          animationDelay: (idx) => idx * 100,
          data: [
            { value: 0, name: '进行中' },
            { value: 0, name: '已完成' },
            { value: 0, name: '待审核' }
          ]
        }]
      })
      // 延迟更新到实际值以触发动画
      setTimeout(() => {
        if (this._charts.pieStatus) {
          this._charts.pieStatus.setOption({
            series: [{
              data: [
                { value: this.displayStats.inProgress || 0, name: '进行中' },
                { value: this.displayStats.completed || 0, name: '已完成' },
                { value: this.displayStats.reviewing || 0, name: '待审核' }
              ]
            }]
          })
        }
      }, 100)

      // 优先级分布
      const priorityData = [
        { name: '高', value: this.displayStats.high || 0 },
        { name: '中', value: this.displayStats.medium || 0 },
        { name: '低', value: this.displayStats.low || 0 },
      ]
      // 计算优先级数据的最大值，用于设置Y轴最大值
      const maxPriorityValue = Math.max(...priorityData.map(d => d.value), 1)
      // 向上取整到最近的整数，如果最大值小于5则设为5，使图表更美观
      const priorityYAxisMax = Math.max(Math.ceil(maxPriorityValue), 5)
      
      const barPriorityChart = create('barPriority', {
        tooltip: {
          show: false // 禁用tooltip，使用点击弹窗
        },
        grid: { left: 40, right: 10, top: 10, bottom: 30 },
        xAxis: { type: 'category', data: priorityData.map(d => d.name) },
        yAxis: { 
          type: 'value',
          min: 0,
          max: priorityYAxisMax,
          minInterval: 1
        },
        series: [{ 
          type: 'bar', 
          data: priorityData.map(d => d.value), 
          itemStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: palette[3] },
              { offset: 1, color: '#c7d2fe' }
            ]),
            barBorderRadius: [6, 6, 0, 0]
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut'
        }]
      })
      
      // 为优先级分布柱状图添加点击事件
      if (barPriorityChart) {
        barPriorityChart.on('click', (params) => {
          // params.dataIndex 对应柱子的索引：0=高, 1=中, 2=低
          // 只有当点击的是柱子本身时才触发（不是坐标轴或其他区域）
          if (params.componentType === 'series') {
            const priorityMap = ['priority-high', 'priority-medium', 'priority-low']
            if (params.dataIndex >= 0 && params.dataIndex < priorityMap.length) {
              this.openTaskListModal(priorityMap[params.dataIndex])
            }
          }
        })
      }
      
      this._charts.barPriority = barPriorityChart

      // 近7天趋势（使用真实数据）
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        return `${d.getMonth() + 1}/${d.getDate()}`
      })
      // 使用真实数据，如果没有则使用0
      const trendData = this.taskStats.trendData || Array(7).fill(0)
      const overdueData = this.taskStats.overdueData || Array(7).fill(0)
      
      // 计算两个数据集的最大值，用于统一Y轴
      const maxTrendValue = Math.max(...trendData, 1)
      const maxOverdueValue = Math.max(...overdueData, 1)
      const maxYAxisValue = Math.max(maxTrendValue, maxOverdueValue, 1)
      // 向上取整到最近的5的倍数，使图表更美观
      const yAxisMax = Math.ceil(maxYAxisValue / 5) * 5 || 5
      
      const lineTrendChart = create('lineTrend', {
        tooltip: {
          show: false // 禁用tooltip，使用点击弹窗
        },
        grid: { left: 40, right: 10, top: 10, bottom: 20 },
        xAxis: { type: 'category', data: days },
        yAxis: { 
          type: 'value',
          min: 0,
          max: yAxisMax,
          minInterval: 1
        },
        series: [{ 
          type: 'line', 
          smooth: true, 
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: 2.5, color: palette[5] },
          itemStyle: { color: palette[5], borderColor: '#ffffff', borderWidth: 1.5 },
          data: Array(7).fill(0), 
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.05)' }
            ])
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut'
        }]
      })
      // 延迟更新到实际值以触发动画
      setTimeout(() => {
        if (lineTrendChart) {
          lineTrendChart.setOption({
            series: [{ data: trendData }]
          })
        }
      }, 200)
      
      // 为完成趋势图添加点击事件
      if (lineTrendChart) {
        lineTrendChart.on('click', (params) => {
          console.log('[MyActivity] 完成趋势图点击事件:', params)
          // 阻止事件冒泡
          if (params.event && params.event.event) {
            params.event.event.stopPropagation()
          }
          
          // 如果点击的是数据点或线条，显示对应日期的任务
          if (params.componentType === 'series') {
            // 尝试多种方式获取 dataIndex
            let dayIndex = params.dataIndex
            if (dayIndex === undefined && params.name !== undefined) {
              // 从 xAxis 的 data 中找到对应的索引
              const xAxisData = days
              dayIndex = xAxisData.indexOf(params.name)
            }
            
            console.log('[MyActivity] 解析后的 dayIndex:', dayIndex)
            if (dayIndex !== null && dayIndex !== undefined && dayIndex >= 0 && dayIndex < 7) {
              console.log('[MyActivity] 显示第', dayIndex, '天的完成任务')
              this.openTaskListModal('trend-completed', dayIndex)
              return
            }
          }
          // 点击其他区域显示所有任务
          console.log('[MyActivity] 点击其他区域，显示所有完成任务')
          this.openTaskListModal('trend-completed')
        })
      }
      
      this._charts.lineTrend = lineTrendChart

      const barOverdueChart = create('barOverdue', {
        tooltip: {
          show: false // 禁用tooltip，使用点击弹窗
        },
        grid: { left: 40, right: 10, top: 10, bottom: 20 },
        xAxis: { type: 'category', data: days },
        yAxis: { 
          type: 'value', 
          min: 0,
          max: yAxisMax,
          minInterval: 1
        },
        series: [{ 
          type: 'bar', 
          data: Array(7).fill(0),
          itemStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#F59FB0' },
              { offset: 1, color: '#FFE4E9' }
            ]),
            barBorderRadius: [6, 6, 0, 0]
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut'
        }]
      })
      // 延迟更新到实际值以触发动画
      setTimeout(() => {
        if (barOverdueChart) {
          barOverdueChart.setOption({
            series: [{ data: overdueData }]
          })
        }
      }, 200)
      
      // 为逾期任务图添加点击事件
      if (barOverdueChart) {
        barOverdueChart.on('click', (params) => {
          console.log('[MyActivity] 逾期任务图点击事件:', params)
          // 阻止事件冒泡
          if (params.event && params.event.event) {
            params.event.event.stopPropagation()
          }
          
          // 如果点击的是柱子，显示对应日期的任务
          if (params.componentType === 'series') {
            // 尝试多种方式获取 dataIndex
            let dayIndex = params.dataIndex
            if (dayIndex === undefined && params.name !== undefined) {
              // 从 xAxis 的 data 中找到对应的索引
              const xAxisData = days
              dayIndex = xAxisData.indexOf(params.name)
            }
            
            console.log('[MyActivity] 解析后的 dayIndex:', dayIndex)
            if (dayIndex !== null && dayIndex !== undefined && dayIndex >= 0 && dayIndex < 7) {
              console.log('[MyActivity] 显示第', dayIndex, '天的逾期任务')
              this.openTaskListModal('trend-overdue', dayIndex)
              return
            }
          }
          // 点击其他区域显示所有任务
          console.log('[MyActivity] 点击其他区域，显示所有逾期任务')
          this.openTaskListModal('trend-overdue')
        })
      }
      
      this._charts.barOverdue = barOverdueChart

      window.addEventListener('resize', this.resizeCharts)
      // 再次触发一次resize，解决首屏偶现空白
      setTimeout(this.resizeCharts, 50)
    },

    updateCharts(echarts) {
      if (!this._charts) return
      const { gaugeInProgress, gaugeReviewing, gaugeCompleted, pieStatus, barPriority, lineTrend, barOverdue } = this._charts
      const total = (this.displayStats.inProgress || 0) + (this.displayStats.completed || 0)
      const gaugeMax = Math.max(1, total)
      
      if (gaugeInProgress) gaugeInProgress.setOption({ 
        tooltip: { show: false },
        series: [{ 
          max: gaugeMax,
          data: [{ value: this.displayStats.inProgress || 0 }] 
        }] 
      })
      if (gaugeReviewing) gaugeReviewing.setOption({ 
        tooltip: { show: false },
        series: [{ 
          max: gaugeMax,
          data: [{ value: this.displayStats.reviewing || 0 }] 
        }] 
      })
      if (gaugeCompleted) gaugeCompleted.setOption({ 
        tooltip: { show: false },
        series: [{ 
          max: gaugeMax,
          data: [{ value: this.displayStats.completed || 0 }] 
        }] 
      })
      if (pieStatus) pieStatus.setOption({
        series: [{ 
          label: {
            show: total > 0
          },
          data: [
            { value: this.displayStats.inProgress || 0, name: '进行中' },
            { value: this.displayStats.completed || 0, name: '已完成' },
            { value: this.displayStats.reviewing || 0, name: '待审核' }
          ]
        }]
      })
      if (barPriority) {
        // 计算优先级数据的最大值，用于更新Y轴最大值
        const priorityValues = [this.displayStats.high || 0, this.displayStats.medium || 0, this.displayStats.low || 0]
        const maxPriorityValue = Math.max(...priorityValues, 1)
        const priorityYAxisMax = Math.max(Math.ceil(maxPriorityValue), 5)
        
        barPriority.setOption({
          yAxis: {
            min: 0,
            max: priorityYAxisMax,
            minInterval: 1
          },
          series: [{ data: priorityValues }]
        })
      }
      // 同步刷新近7天趋势和逾期（使用真实数据）
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        return `${d.getMonth() + 1}/${d.getDate()}`
      })
      // 使用真实数据，如果没有则使用0
      const trendData = this.taskStats.trendData || Array(7).fill(0)
      const overdueData = this.taskStats.overdueData || Array(7).fill(0)
      
      // 计算两个数据集的最大值，用于统一Y轴
      const maxTrendValue = Math.max(...trendData, 1)
      const maxOverdueValue = Math.max(...overdueData, 1)
      const maxYAxisValue = Math.max(maxTrendValue, maxOverdueValue, 1)
      // 向上取整到最近的5的倍数，使图表更美观
      const yAxisMax = Math.ceil(maxYAxisValue / 5) * 5 || 5
      
      if (lineTrend) lineTrend.setOption({ 
        xAxis: { data: days }, 
        yAxis: { min: 0, max: yAxisMax, minInterval: 1 },
        series: [{ data: trendData }] 
      })
      if (barOverdue) barOverdue.setOption({ 
        xAxis: { data: days }, 
        yAxis: { min: 0, max: yAxisMax, minInterval: 1 },
        series: [{ data: overdueData }] 
      })
      this.resizeCharts()
    },

    resizeCharts() {
      if (!this._charts) return
      Object.values(this._charts).forEach(c => c && c.resize && c.resize())
    },

    mapProjectStatus(status) {
      if (!status) return 'in-progress'
      const normalized = String(status).trim().toUpperCase()
      const statusMap = {
        'ACTIVE': 'in-progress',
        'IN_PROGRESS': 'in-progress',
        'ONGOING': 'in-progress',
        'PAUSED': 'paused',
        'COMPLETED': 'completed',
        'DONE': 'completed',
        'ARCHIVED': 'archived',
        '进行中': 'in-progress',
        '已完成': 'completed',
        '已暂停': 'paused',
        '已归档': 'archived'
      }
      return statusMap[normalized] || statusMap[status] || 'in-progress'
    },

    extractProjectsFromResponse(payload) {
      const result = { projects: [], totalPages: null }
      if (!payload) {
        return result
      }
      if (Array.isArray(payload)) {
        result.projects = payload
        return result
      }
      if (Array.isArray(payload.content)) {
        result.projects = payload.content
        result.totalPages = payload.totalPages ?? payload.total_pages ?? null
        return result
      }
      if (Array.isArray(payload.list)) {
        result.projects = payload.list
        return result
      }
      if (Array.isArray(payload.records)) {
        result.projects = payload.records
        return result
      }
      return result
    },

    calculateProjectProgress(status) {
      if (!status) return 0
      const normalized = this.mapProjectStatus(status)
      if (normalized === 'completed' || normalized === 'archived') {
        return 100
      }
      if (normalized === 'paused') {
        return 25
      }
      return 50
    },

    getProjectStatusText(status) {
      const normalized = this.mapProjectStatus(status)
      const statusMap = {
        'in-progress': '进行中',
        'completed': '已完成',
        'paused': '已暂停',
        'archived': '已归档'
      }
      return statusMap[normalized] || '进行中'
    },
    
    getBarWidth(value, max) {
      if (max === 0) return 0
      return Math.min((value / max) * 100, 100)
    },
    
    getCountdown(dueDate) {
      if (!dueDate) return '无截止日期'
      const date = new Date(dueDate)
      const now = new Date()
      const diffMs = date - now
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return `已逾期 ${Math.abs(diffDays)} 天`
      if (diffDays === 0) return '今天到期'
      if (diffDays === 1) return '明天到期'
      return `还有 ${diffDays} 天`
    },
    
    async loadActivityLogs() {
      this.isLoadingLogs = true
      try {
        // 使用后端操作日志API
        const response = await getMyActivityLogs({
          page: this.logPage,
          size: this.logPageSize
        })
        
        // 处理响应数据
        let logs = []
        if (response && response.code === 200) {
          const data = response.data
          if (data && data.content) {
            logs = data.content
          } else if (Array.isArray(data)) {
            logs = data
          }
        } else if (response && Array.isArray(response.content)) {
          logs = response.content
        } else if (Array.isArray(response)) {
          logs = response
        }
        
        // 映射日志数据（根据后端UnifiedOperationLogVO结构）
        const newLogs = logs.map(log => {
          // 构建描述信息：优先使用description，其次使用title，最后根据操作类型和模块生成
          let description = log.description
          
          // 如果没有description，使用title
          if (!description && log.title) {
            description = log.title
          }
          
          // 如果还是没有，根据操作类型和模块生成描述
          if (!description && log.operationType && log.operationModule) {
            const typeText = this.getLogTypeText(log.operationType)
            const moduleText = log.operationModule || ''
            description = `${moduleText} - ${typeText}`
          }
          
          // 如果还是没有，使用默认描述
          if (!description) {
            description = '操作日志'
          }
          
          return {
            id: log.id,
            type: log.operationType,
            module: log.operationModule,
            source: log.source,
            description: description,
            targetName: log.title,
            timestamp: log.time,
            projectId: log.projectId,
            operator: log.username,
            userId: log.userId,
            relatedId: log.relatedId
          }
        })
        
        if (this.logPage === 0) {
          this.activityLogs = newLogs
        } else {
          this.activityLogs.push(...newLogs)
        }
        
        this.hasMoreLogs = newLogs.length === this.logPageSize
        this.filterActivityLogs()
      } catch (error) {
        console.error('加载操作日志失败:', error)
        if (this.logPage === 0) {
          this.activityLogs = []
          this.filteredActivityLogs = []
        }
      } finally {
        this.isLoadingLogs = false
      }
    },
    
    filterActivityLogs() {
      let filtered = [...this.activityLogs]
      
      // 按类型过滤
      if (this.logFilterType && this.logFilterType !== 'all') {
        filtered = filtered.filter(log => {
          // 根据source和operationType判断日志类型
          const source = log.source || ''
          const type = log.type || ''
          
          if (this.logFilterType === 'submission') {
            // 任务提交：任务模块的SUBMIT操作
            return source === 'TASK' && (type === 'SUBMIT' || type === 'REVIEW')
          } else if (this.logFilterType === 'upload') {
            // 成果上传：成果模块的FILE_UPLOAD操作
            return source === 'ACHIEVEMENT' && type === 'FILE_UPLOAD'
          } else if (this.logFilterType === 'comment') {
            // 评论回复：暂时没有专门的评论日志，可以扩展
            return false
          } else if (this.logFilterType === 'review') {
            // 审核操作：任务模块的REVIEW或COMPLETE操作
            return source === 'TASK' && (type === 'REVIEW' || type === 'COMPLETE')
          }
          return true
        })
      }
      
      // 按关键词搜索
      if (this.logSearchKeyword.trim()) {
        const keyword = this.logSearchKeyword.toLowerCase()
        filtered = filtered.filter(log => 
          (log.description && log.description.toLowerCase().includes(keyword)) ||
          (log.targetName && log.targetName.toLowerCase().includes(keyword)) ||
          (log.module && log.module.toLowerCase().includes(keyword)) ||
          (log.type && this.getLogTypeText(log.type).toLowerCase().includes(keyword))
        )
      }
      
      this.filteredActivityLogs = filtered
    },
    
    handleLogScroll(event) {
      const { scrollTop, scrollHeight, clientHeight } = event.target
      if (scrollHeight - scrollTop - clientHeight < 100 && this.hasMoreLogs && !this.isLoadingLogs) {
        this.loadMoreLogs()
      }
    },
    
    async loadMoreLogs() {
      if (this.isLoadingLogs || !this.hasMoreLogs) return
      this.logPage++
      await this.loadActivityLogs()
    },
    
    getLogTypeText(type) {
      if (!type) return '未知操作'
      
      const typeMap = {
        // 通用操作
        'CREATE': '创建',
        'UPDATE': '更新',
        'DELETE': '删除',
        'STATUS_CHANGE': '状态变更',
        
        // 任务操作
        'ASSIGN': '分配任务',
        'SUBMIT': '提交任务',
        'REVIEW': '审核任务',
        'COMPLETE': '完成任务',
        
        // 项目操作
        'MEMBER_ADD': '添加成员',
        'MEMBER_REMOVE': '移除成员',
        'ROLE_CHANGE': '角色变更',
        
        // Wiki操作
        'MOVE': '移动Wiki页面',
        
        // 成果操作
        'UPDATE_STATUS': '更新成果状态',
        'UPDATE_DETAIL': '更新成果详情',
        'FILE_UPLOAD': '上传文件',
        'FILE_DELETE': '删除文件'
      }
      
      return typeMap[type] || type
    },
    
    getSourceText(source) {
      if (!source) return ''
      const sourceMap = {
        'PROJECT': '项目管理',
        'TASK': '任务管理',
        'WIKI': '知识库Wiki管理',
        'ACHIEVEMENT': '成果管理',
        'LOGIN': '登录'
      }
      return sourceMap[source] || source
    },
    
    formatDateTime(datetime) {
      if (!datetime) return '-'
      const date = new Date(datetime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    formatTaskDate(dateStr) {
      if (!dateStr) return '无截止日期'
      const date = new Date(dateStr)
      return `截止日期：${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    
    getReviewStatusText(task) {
      // 获取审核状态文本
      const status = task.reviewStatus || task.status || task.submissionStatus
      const statusMap = {
        'PENDING': '待审核',
        'APPROVED': '已通过',
        'REJECTED': '已拒绝',
        'REVIEWING': '审核中'
      }
      return statusMap[status] || '待审核'
    },
    
    getReviewStatusClass(task) {
      // 获取审核状态样式类
      const status = task.reviewStatus || task.status || task.submissionStatus
      const classMap = {
        'PENDING': 'status-pending',
        'APPROVED': 'status-approved',
        'REJECTED': 'status-rejected',
        'REVIEWING': 'status-reviewing'
      }
      return classMap[status] || 'status-pending'
    },
    
    getPriorityText(priority) {
      const textMap = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
      }
      return textMap[priority] || '中优先级'
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
      if (!dueDate) return false
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const deadline = new Date(dueDate)
      deadline.setHours(0, 0, 0, 0)
      
      return deadline < today
    },
    
    animateStats() {
      // 数字递增动画效果
      const duration = 1200 // 动画时长1.2秒
      const statsToAnimate = ['inProgress', 'completed', 'reviewing', 'high', 'medium', 'low']
      
      let completedCount = 0
      const totalStats = statsToAnimate.length
      
      statsToAnimate.forEach((key, index) => {
        // 添加延迟，让数字依次出现
        setTimeout(() => {
          this.animateCount(key, this.taskStats[key] || 0, duration, () => {
            completedCount++
            // 所有数字动画完成后才更新图表
            if (completedCount === totalStats) {
              this.$nextTick(() => {
                if (this._charts && window.echarts) {
                  this.updateCharts(window.echarts)
                }
              })
            }
          })
        }, index * 80) // 每个数字延迟80ms开始
      })
    },
    
    animateCount(key, target, duration, onComplete) {
      const start = performance.now()
      const from = this.displayStats[key] || 0
      
      const step = (now) => {
        const elapsed = now - start
        const progress = Math.min(1, elapsed / duration)
        // 使用平滑的缓动函数
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
        
        this.displayStats[key] = Math.round(from + (target - from) * eased)
        
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          this.displayStats[key] = target
          if (onComplete) onComplete()
        }
      }
      
      requestAnimationFrame(step)
    },

    openTaskListModal(type, dayIndex = null) {
      this.taskListModalType = type
      
      // 生成日期标签用于显示
      const getDayLabel = (index) => {
        if (index === null || index === undefined) return ''
        const d = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
        return `${d.getMonth() + 1}/${d.getDate()}`
      }
      
      if (type === 'inProgress') {
        this.taskListModalTitle = `进行中任务 (${this.taskStats.inProgress || 0})`
        this.taskListModalTasks = this.inProgressTasks || []
      } else if (type === 'reviewing') {
        this.taskListModalTitle = `待审核任务 (${this.taskStats.reviewing || 0})`
        this.taskListModalTasks = this.reviewingTasks || []
      } else if (type === 'completed') {
        this.taskListModalTitle = `已完成任务 (${this.taskStats.completed || 0})`
        this.taskListModalTasks = this.completedTasks || []
      } else if (type === 'priority') {
        // 优先级分布 - 显示所有优先级的任务
        const allPriorityTasks = [
          ...(this.highPriorityTasks || []),
          ...(this.mediumPriorityTasks || []),
          ...(this.lowPriorityTasks || [])
        ]
        this.taskListModalTitle = `优先级分布任务 (${allPriorityTasks.length})`
        this.taskListModalTasks = allPriorityTasks
      } else if (type === 'priority-high') {
        this.taskListModalTitle = `高优先级任务 (${this.taskStats.high || 0})`
        this.taskListModalTasks = this.highPriorityTasks || []
      } else if (type === 'priority-medium') {
        this.taskListModalTitle = `中优先级任务 (${this.taskStats.medium || 0})`
        this.taskListModalTasks = this.mediumPriorityTasks || []
      } else if (type === 'priority-low') {
        this.taskListModalTitle = `低优先级任务 (${this.taskStats.low || 0})`
        this.taskListModalTasks = this.lowPriorityTasks || []
      } else if (type === 'trend-completed') {
        console.log('[MyActivity] 打开完成任务弹窗, dayIndex:', dayIndex, 'trendCompletedTasksByDay:', this.trendCompletedTasksByDay)
        if (dayIndex !== null && dayIndex !== undefined && dayIndex >= 0 && dayIndex < 7) {
          // 显示指定日期的任务
          const dayLabel = getDayLabel(dayIndex)
          const dayTasks = (this.trendCompletedTasksByDay && this.trendCompletedTasksByDay[dayIndex]) ? this.trendCompletedTasksByDay[dayIndex] : []
          console.log('[MyActivity] 显示第', dayIndex, '天的任务，数量:', dayTasks.length)
          this.taskListModalTitle = `${dayLabel} 完成的任务 (${dayTasks.length})`
          this.taskListModalTasks = dayTasks
        } else {
          // 显示所有任务
          console.log('[MyActivity] 显示所有完成任务，数量:', this.trendCompletedTasks.length)
          this.taskListModalTitle = `过去七天完成的任务 (${this.trendCompletedTasks.length})`
          this.taskListModalTasks = this.trendCompletedTasks || []
        }
      } else if (type === 'trend-overdue') {
        console.log('[MyActivity] 打开逾期任务弹窗, dayIndex:', dayIndex, 'trendOverdueTasksByDay:', this.trendOverdueTasksByDay)
        if (dayIndex !== null && dayIndex !== undefined && dayIndex >= 0 && dayIndex < 7) {
          // 显示指定日期的任务
          const dayLabel = getDayLabel(dayIndex)
          const dayTasks = (this.trendOverdueTasksByDay && this.trendOverdueTasksByDay[dayIndex]) ? this.trendOverdueTasksByDay[dayIndex] : []
          console.log('[MyActivity] 显示第', dayIndex, '天的任务，数量:', dayTasks.length)
          this.taskListModalTitle = `${dayLabel} 逾期的任务 (${dayTasks.length})`
          this.taskListModalTasks = dayTasks
        } else {
          // 显示所有任务
          console.log('[MyActivity] 显示所有逾期任务，数量:', this.trendOverdueTasks.length)
          this.taskListModalTitle = `过去七天逾期的任务 (${this.trendOverdueTasks.length})`
          this.taskListModalTasks = this.trendOverdueTasks || []
        }
      }
      this.taskListModalVisible = true
      // 禁用body滚动，防止背景页面滚动
      document.body.style.overflow = 'hidden'
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
    
    goToTaskProject(task) {
      if (task && (task.projectId || task.project_id)) {
        const projectId = task.projectId || task.project_id
        this.closeTaskListModal()
        this.$router.push(`/project-detail/${projectId}`)
      }
    },

    closeTaskListModal() {
      this.taskListModalVisible = false
      this.taskListModalType = ''
      this.taskListModalTitle = ''
      this.taskListModalTasks = []
      // 恢复body滚动
      document.body.style.overflow = ''
    },
    
    handleModalScroll(event) {
      // 防止滚动穿透到外部页面
      const target = event.currentTarget
      const { scrollTop, scrollHeight, clientHeight } = target
      const isAtTop = scrollTop === 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1
      
      // 如果向上滚动且已在顶部，或向下滚动且已在底部，阻止默认行为
      if ((event.deltaY < 0 && isAtTop) || (event.deltaY > 0 && isAtBottom)) {
        event.preventDefault()
      }
    },

    updateCreatedTaskStats(tasks) {
      const stats = {
        total: tasks.length,
        inProgress: 0,
        completed: 0,
        pending: 0
      }
      tasks.forEach(task => {
        const status = this.normalizeStatus(task.status)
        if (status === 'DONE') {
          stats.completed += 1
        } else if (status === 'IN_PROGRESS' || status === 'REVIEWING') {
          stats.inProgress += 1
        } else {
          stats.pending += 1
        }
      })
      this.createdTaskStats = stats
    },
    mapCreatedTask(task) {
      if (!task) {
        return null
      }

      const normalizedStatus = this.normalizeStatus(task.status || task.taskStatus || task.statusCode)
      const prioritySource = (task.priority || task.priorityValue || task.priorityLevel || '').toString().toUpperCase()
      const priority = this.mapTaskPriority(prioritySource || 'MEDIUM')

      const assigneeList =
        task.assignees ||
        task.assigneeList ||
        task.taskAssignees ||
        task.assignments ||
        task.members ||
        null

      const fallbackAssignee =
        task.assigneeName ||
        task.assigneeNames ||
        task.executorName ||
        task.executor ||
        null

      const dueDateRaw =
        task.dueDate ||
        task.due_date ||
        task.taskDueDate ||
        task.deadline ||
        task.targetDate ||
        null

      return {
        id: task.id || task.taskId || task.task_id,
        projectId: task.projectId || task.project_id || task.project?.id,
        projectName: task.projectName || task.project?.title,
        title: task.title || task.taskTitle || '未命名任务',
        description: task.description || task.taskDescription || '',
        status: normalizedStatus,
        statusClass: `status-${normalizedStatus}`,
        priority,
        dueDate: dueDateRaw,
        assignees: this.formatAssignees(assigneeList || fallbackAssignee),
        raw: task
      }
    },
    
    normalizeStatus(status) {
      if (!status) return 'UNKNOWN'
      const upper = String(status).toUpperCase()
      const map = {
        'NOT_STARTED': 'PENDING',
        'TODO': 'PENDING',
        'PENDING_REVIEW': 'REVIEWING',
        'APPROVED': 'DONE',
        'COMPLETED': 'DONE'
      }
      return map[upper] || upper
    },
    
    formatAssignees(value) {
      if (!value) return '未分配'
      if (Array.isArray(value)) {
        const names = value
          .map(item => item?.name || item?.nickname || item?.username || item)
          .filter(Boolean)
        return names.length ? names.join('、') : '未分配'
      }
      if (typeof value === 'string') {
        return value
      }
      if (typeof value === 'object') {
        return value.name || value.nickname || value.username || '未分配'
      }
      return '未分配'
    },
    
  }
}
</script>

<style scoped>
.my-activity-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏 - 与其他页面一致 */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary, #ffffff);
  border-bottom: 1px solid var(--border-primary, #e5e7eb);
  height: 64px;
  padding: 0 var(--space-6, 24px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  z-index: 10000;
  transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 6px);
  color: var(--text-tertiary, #6b7280);
  transition: all var(--transition-fast, 0.2s);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-btn:hover {
  background-color: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
  transform: scale(1.05);
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 6px);
  color: var(--text-tertiary, #6b7280);
  transition: all var(--transition-fast, 0.2s);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background-color: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
  transform: scale(1.05);
}

.page-title {
  font-size: var(--text-lg, 18px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-primary, #111827);
  line-height: 1;
  margin: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  transform: translateY(-1px);
}

/* 主要内容区域 */
.main-content-wrapper {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 80px; /* 为固定页眉留出空间 */
}

.activity-content-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  min-height: calc(100vh - 120px);
  width: 100%;
}

.activity-side-nav {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 100px;
  height: fit-content;
}

.activity-nav-item {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 15px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.activity-nav-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.activity-nav-item.active {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px #c7d2fe;
}

.activity-page-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.page-section {
  width: 100%;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-section > .dashboard-card,
.page-section > .section-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 欢迎语区域 */
.welcome-section {
  margin-bottom: 8px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.welcome-text h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.time-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filter-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

/* 通用卡片样式 */
.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.section-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sort-select,
.filter-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
}

/* 任务卡片列表 - 单列布局，更清晰 */
.task-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许flex子元素缩小 */
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.task-cards-list > .task-card-clean {
  flex: 0 0 auto; /* 固定高度，不随容器拉伸 */
}

.task-cards-list::-webkit-scrollbar {
  width: 6px;
}

.task-cards-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.task-cards-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.task-cards-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.task-card-clean {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
  position: relative;
  min-height: 70px;
  padding: 14px 16px;
  gap: 16px;
}

.task-card-clean:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.task-card-clean.overdue {
  border-color: #fecaca;
}

.task-card-clean.urgent {
  border-color: #fed7aa;
}

.task-card-clean.normal {
  border-color: #bfdbfe;
}

/* 左侧状态条 */
.task-status-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.task-status-bar.red {
  background: #ef4444;
}

.task-status-bar.orange {
  background: #f59e0b;
}

.task-status-bar.blue {
  background: #3b82f6;
}

/* 中间内容区 */
.task-content {
  min-width: 0;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.2;
}

.task-status-badge.status-PENDING {
  background: #fef3c7;
  color: #92400e;
}

.task-status-badge.status-IN_PROGRESS {
  background: #dbeafe;
  color: #1e40af;
}

.task-status-badge.status-DONE {
  background: #d1fae5;
  color: #065f46;
}

.task-status-badge.status-REVIEWING {
  background: #e0e7ff;
  color: #3730a3;
}

.task-status-badge.status-UNKNOWN {
  background: #f3f4f6;
  color: #6b7280;
}

.task-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-line {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  font-size: 13px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
}

.meta-pair {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.meta-label { 
  color: #9ca3af; 
  font-size: 13px;
  font-weight: 400;
}
.meta-value { 
  color: #374151; 
  font-weight: 500;
  font-size: 13px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta-value.overdue-text {
  color: #ef4444;
  font-weight: 600;
}
.meta-value.urgent-text {
  color: #f59e0b;
  font-weight: 600;
}
.meta-sep { 
  color: #d1d5db; 
  margin: 0 4px;
  font-size: 13px;
}

/* 右侧操作区 */
.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 16px;
  border-left: 1px solid #e5e7eb;
  justify-content: flex-end;
  flex-shrink: 0;
}

.action-btn-review {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
  line-height: 1.4;
  background: #3b82f6;
  color: white;
}

.action-btn-review:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.review-status-text {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.review-status-text.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.review-status-text.status-reviewing {
  background: #e0e7ff;
  color: #3730a3;
}

.review-status-text.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.review-status-text.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* 仪表盘网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 3fr; /* 左窄右宽 */
  gap: 24px;
  align-items: stretch; /* 两侧卡片等高 */
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-card.projects-overview,
.dashboard-card.task-statistics {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column; /* 让内部可自适应填充并滚动 */
  overflow: hidden; /* 防止整个卡片溢出 */
}

.card-header {
  margin-bottom: 20px;
  flex-shrink: 0; /* 防止header被压缩 */
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.review-mode-toggle {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toggle-btn:hover {
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
}

.toggle-btn.active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-list-container {
  flex: 1;
  min-height: 0; /* 允许flex子元素缩小 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止容器溢出 */
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

/* 项目列表 */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;                 /* 占满卡片剩余空间 */
  min-height: 0;           /* 使overflow在flex容器内生效 */
  overflow-y: auto;
  padding-right: 8px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  min-height: 80px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.project-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.project-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.project-status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
  white-space: nowrap;
}

.project-status-badge.status-in-progress {
  background: #e0f2fe;
  color: #0369a1;
}

.project-status-badge.status-completed {
  background: #dcfce7;
  color: #047857;
}

.project-status-badge.status-archived {
  background: #ede9fe;
  color: #5b21b6;
}

.project-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  min-width: 40px;
}

.project-link {
  padding: 4px;
  color: #6b7280;
  cursor: pointer;
}

.project-link:hover {
  color: #3b82f6;
}

/* 任务统计 */
.stats-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;            /* 占满剩余空间 */
  min-height: 0;      /* 允许内部滚动 */
  overflow-y: auto;   /* 内容超出时滚动 */
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  z-index: 2;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.gauges-row {
  grid-template-columns: repeat(3, minmax(220px, 1fr));
}

.chart-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.chart-box {
  width: 100%;
  height: 120px;
  max-width: 240px;
  margin: 6px auto 2px;
}

.chart-box.large {
  height: 140px; /* 缩短趋势图高度 */
  max-width: none;
}

.chart-box.large.clickable-chart,
.chart-box.small.clickable-chart {
  cursor: pointer;
  transition: opacity 0.2s;
}

.chart-box.large.clickable-chart:hover,
.chart-box.small.clickable-chart:hover {
  opacity: 0.8;
}

/* ===== 新的高级仪表盘布局 ===== */
.dashboard-pro {
  display: grid;
  grid-template-columns: 1.2fr 1fr; /* 左大右小 */
  gap: 20px;
}

.card-overview,
.card-trend {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh * 3 / 7); /* 限制整体高度 */
  overflow: hidden;
}

.card-overview {
  min-height: 400px; /* 增加总览卡片的最小高度 */
  overflow: visible; /* 允许图表标签超出容器显示 */
  position: relative;
  z-index: 2;
}

.card-trend {
  min-height: 400px; /* 与左侧总览保持一致的高度 */
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.kpi-badge {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  animation: fadeInUp 2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kpi-pending { background: #fef3c7; color: #92400e; }
.kpi-progress { background: #d1f4e0; color: #065f46; }
.kpi-reviewing { background: #e9d5ff; color: #6b21a8; }
.kpi-done { background: #fed7aa; color: #92400e; }

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
  min-height: 300px; /* 确保有足够高度 */
}

.overview-left { 
  display: flex; 
  align-items: stretch; 
  justify-content: center;
  min-height: 280px; /* 确保环形图有足够空间 */
  flex-direction: column;
  gap: 12px;
}

.overview-right {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: min-content;
  gap: 14px;
  align-items: start;
}

.mini-gauge,
.mini-bar { 
  background: #fafafa; 
  border: 1px solid #f1f5f9; 
  border-radius: 10px; 
  padding: 12px 10px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 150px;
  max-height: 150px;
  height: 150px;
  box-sizing: border-box;
}

.mini-bar.clickable-chart {
  cursor: pointer;
}

.mini-bar.clickable-chart:hover {
  opacity: 0.8;
}

.mini-title {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  flex-shrink: 0;
}

.chart-box.tiny { 
  height: 110px; 
  max-width: none;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.clickable-chart {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-chart:hover {
  opacity: 0.8;
}

.mini-gauge {
  cursor: pointer;
}
.chart-box.small { 
  height: 110px; 
  max-width: none;
  width: 100%;
}
.chart-box.medium { 
  height: 240px; 
  max-width: none;
  width: 100%;
}

.status-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #111827;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.status-name {
  flex: 1;
  font-weight: 500;
  color: #111827;
}

.status-count {
  font-weight: 600;
  color: #111827;
}

.status-percent {
  color: #111827;
  font-size: 12px;
}

.stats-chart {
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.stats-chart:last-child {
  border-bottom: none;
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.bar-chart {
  display: flex;
  gap: 16px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.bar-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.bar {
  height: 24px;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar.pending {
  background: #fef3c7;
}

.bar.in-progress {
  background: #dbeafe;
}

.bar.completed {
  background: #d1fae5;
}

.bar-value {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  min-width: 30px;
}

.line-chart-placeholder {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
}

.upcoming-milestones {
  padding-top: 0;
}

.milestones-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.milestone-item {
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  height: 44px; /* 高度保持不变的小块 */
  display: flex;
  align-items: center;
  width: 220px; /* 缩短长度，形成小块 */
  box-sizing: border-box;
  border: 1px solid #eef2f7;
  cursor: pointer;
  transition: all 0.2s ease;
}

.milestone-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.milestone-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.milestone-name {
  font-size: 13px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.milestone-countdown {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 我发布的任务统计卡片 */
.created-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.summary-total .summary-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.summary-progress .summary-icon {
  background: linear-gradient(135deg, #7DD3A8 0%, #5fb88f 100%);
  color: white;
}

.summary-completed .summary-icon {
  background: linear-gradient(135deg, #FBBF83 0%, #f59e0b 100%);
  color: white;
}

.summary-pending .summary-icon {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.summary-card:hover .summary-icon {
  transform: scale(1.1) rotate(5deg);
}

/* 操作日志时间轴 */
.activity-timeline {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
  position: relative;
}

.timeline-dot::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: calc(100% + 16px);
  background: #e5e7eb;
  transform: translateX(-50%);
}

.timeline-item:last-child .timeline-dot::before {
  display: none;
}

.timeline-dot.type-submission {
  background: #3b82f6;
}

.timeline-dot.type-upload {
  background: #8b5cf6;
}

.timeline-dot.type-comment {
  background: #10b981;
}

.timeline-dot.type-review {
  background: #f59e0b;
}

.timeline-content {
  flex: 1;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-module {
  font-size: 11px;
  padding: 2px 8px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 4px;
  font-weight: 500;
}

.log-type {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
}

.log-description {
  margin: 4px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.log-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.log-source,
.log-operator,
.log-project {
  display: flex;
  align-items: center;
}

.source-label,
.operator-label,
.project-label {
  margin-right: 4px;
  font-weight: 500;
}

.source-name {
  color: #8b5cf6;
}

.operator-name {
  color: #6366f1;
}

.project-value {
  color: #64748b;
  font-family: monospace;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.load-more:hover {
  color: #2563eb;
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state.small,
.empty-state.small {
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state p {
  color: #9ca3af;
  font-size: 14px;
}

.empty-milestones {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  /* 小屏恢复自适应高度，避免占满视口 */
  .dashboard-card.projects-overview,
  .dashboard-card.task-statistics {
    height: auto;
  }
}

@media (max-width: 768px) {
  .task-card-clean {
    flex-direction: column;
  }
  
  .task-status-bar {
    width: 100%;
    height: 4px;
  }
  
  .task-actions {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid #f3f4f6;
    padding: 16px 20px;
    min-width: auto;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 8px;
  }

  .bar-chart {
    flex-direction: column;
  }

  .bar-item {
    flex-direction: row;
    align-items: center;
  }

  .bar-label {
    width: 60px;
    text-align: left;
  }

  .bar-container {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }
  
  .main-nav {
    display: none;
  }
  
  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .main-content-wrapper {
    padding: 16px;
    padding-top: 100px !important;  /* 为固定页眉留出足够空间 */
  }

  /* 移动端侧边导航改为顶部 */
  .activity-content-layout {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: none !important;
    min-height: auto !important;
    gap: 0 !important;
  }

  .page-section {
    min-height: auto !important;
  }

  .activity-side-nav {
    width: 100% !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 !important;
    padding-bottom: 12px !important;
    border-right: none !important;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 12px;
    background: #f8fafc;
    position: static !important;  /* 移除sticky定位 */
    top: auto !important;
    height: auto !important;
    box-shadow: none !important;
  }

  .activity-nav-item {
    padding: 10px 12px;
    border-radius: 8px;
    white-space: nowrap;
    font-size: 13px;
    text-align: center;
    justify-content: center;
  }

  .activity-page-content {
    width: 100% !important;
  }

  /* 卡片头部 */
  .card-header-top {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
    width: 100%;
  }

  .card-title {
    font-size: 16px;
    white-space: nowrap;
  }

  /* 审核模式切换按钮 */
  .review-mode-toggle {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .review-mode-toggle .toggle-btn {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    font-size: 12px;
    white-space: nowrap;
  }

  .section-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
  }

  .sort-select {
    width: 100%;
  }

  .dashboard-grid {
    gap: 16px;
    grid-template-columns: 1fr !important;
  }

  .dashboard-card {
    padding: 16px;
    width: 100%;
  }

  /* 任务统计仪表盘 */
  .dashboard-pro {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: none !important;
    gap: 16px;
  }

  .chart-column {
    width: 100% !important;
  }

  /* 总览框高度 */
  .card-overview {
    min-height: 550px !important;
    height: auto !important;
    overflow: visible !important;
  }

  .overview-grid {
    display: flex !important;
    flex-direction: row !important;
    gap: 12px;
    min-height: 500px;
  }

  .overview-row {
    flex-direction: column !important;
    gap: 16px;
  }

  /* 左侧：大饼图 + 状态摘要 + 优先级分布 */
  .overview-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chart-box.medium {
    height: 280px !important;
    margin-bottom: 10px;
  }

  /* 状态摘要横向排列 */
  .status-summary {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 10px;
    padding: 10px 0;
    clear: both;
  }

  .status-item {
    display: flex !important;
    flex-direction: row !important;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    font-size: 11px;
  }

  .status-name,
  .status-count,
  .status-percent {
    display: inline !important;
  }

  /* 右侧：三个小饼图独立竖向排列 */
  .overview-right {
    flex: 1;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px;
    align-self: flex-start;
  }

  /* 优先级分布放在左侧底部 */
  .overview-grid {
    position: relative;
  }

  .overview-right .mini-bar {
    position: absolute !important;
    left: 0 !important;
    bottom: 60px !important;
    width: calc(50% - 6px) !important;
    display: block !important;
  }

  .overview-left {
    padding-bottom: 180px;
  }

  .mini-gauge {
    width: 100%;
    padding: 8px;
    background: #fafafa;
    border-radius: 8px;
  }

  .mini-gauge .mini-title {
    font-size: 11px;
    margin-bottom: 4px;
    text-align: center;
  }

  .mini-bar {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  }

  .chart-box.tiny {
    height: 80px !important;
    max-width: 90px;
    margin: 0 auto;
  }

  .chart-box.small {
    height: 140px !important;
  }

  .chart-box.medium {
    height: 160px !important;
  }

  /* 任务卡片 */
  .task-statistics {
    width: 100%;
  }

  .task-list-container {
    width: 100%;
  }

  .task-cards-list {
    width: 100%;
  }

  .task-card-clean {
    width: 100%;
    flex-direction: column !important;
  }

  .task-content {
    width: 100% !important;
  }

  .task-title {
    white-space: normal !important;
    overflow: visible !important;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
  }

  .task-actions {
    width: 100%;
    justify-content: flex-end;
    border-left: none !important;
    border-top: 1px solid #f0f0f0;
    padding: 10px 0 0 0 !important;
    margin-top: 10px;
  }

  /* 操作日志 */
  .activity-log-section {
    width: 100%;
  }

  .activity-log-section .section-card {
    width: 100%;
  }

  .activity-timeline {
    max-height: none;
  }
}

/* 移动端额外优化 */
@media (max-width: 600px) {
  .main-content-wrapper {
    padding: 12px;
  }

  .dashboard-card {
    padding: 14px;
    border-radius: 12px;
  }

  .card-title {
    font-size: 15px;
  }

  .stat-value {
    font-size: 20px;
  }

  .chart-box {
    height: 180px;
  }

  .chart-box.large {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .main-content-wrapper {
    padding: 10px;
  }

  .activity-side-nav {
    padding: 10px 0;
    gap: 6px;
  }

  .activity-nav-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .dashboard-grid {
    gap: 12px;
  }

  .dashboard-card {
    padding: 12px;
  }

  .card-header-top {
    gap: 10px;
  }

  .card-title {
    font-size: 14px;
  }

  .review-mode-toggle .toggle-btn {
    padding: 6px 8px;
    font-size: 11px;
  }

  .chart-box {
    height: 160px;
  }

  .chart-box.large {
    height: 180px;
  }

  .chart-box.tiny {
    height: 80px;
  }

  .task-card-clean {
    padding: 12px;
  }

  .task-title {
    font-size: 13px;
  }

  .task-meta {
    font-size: 11px;
  }

  .action-btn-review {
    padding: 6px 12px;
    font-size: 12px;
  }

  .timeline-item {
    padding: 10px 0;
    gap: 10px;
  }

  .log-title {
    font-size: 12px;
  }

  .log-description {
    font-size: 11px;
  }

  .log-time {
    font-size: 10px;
  }
}

/* 任务列表弹窗样式 */
.task-list-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.task-list-modal {
  background: white;
  border-radius: 12px;
  width: 40% !important;
  max-width: 600px !important;
  min-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
}

/* 任务列表弹窗移动端适配 */
@media (max-width: 768px) {
  .task-list-modal {
    width: 90% !important;
    min-width: auto;
    max-width: 500px !important;
    max-height: 85vh;
  }
}

@media (max-width: 480px) {
  .task-list-modal {
    width: 95% !important;
    max-width: none !important;
    max-height: 90vh;
    border-radius: 16px;
  }

  .task-list-modal .modal-header {
    padding: 16px;
  }

  .task-list-modal .modal-title {
    font-size: 16px;
  }

  .task-list-modal .task-list {
    padding: 12px;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.task-list-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.task-list-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.task-list-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.task-list-modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.task-list-modal-content {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.task-list-empty {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.task-list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
  border-left: 4px solid;
}

.task-list-item:hover {
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.task-list-item.high-priority {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #ffffff, #fee2e2);
}

.task-list-item.medium-priority {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #ffffff, #fef3c7);
}

.task-list-item.low-priority {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #ffffff, #d1fae5);
}

.priority-bar {
  width: 4px;
  background: currentColor;
  border-radius: 2px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deadline-alert {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

.deadline-alert.overdue {
  color: #ef4444;
}

.deadline-alert.near {
  color: #f59e0b;
}

.alert-text {
  font-weight: 500;
}

.item-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.item-meta .priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}

.item-meta .deadline {
  color: #6b7280;
}

.task-list-item-number {
  color: #6b7280;
  font-weight: 600;
  min-width: 24px;
  flex-shrink: 0;
}

.task-list-item-name {
  color: #111827;
  line-height: 1.5;
  flex: 1;
}
</style>
