<template>
  <div class="dashboard-container">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在加载数据...</div>
        <div class="loading-progress">
          <div class="loading-progress-bar" :style="{ width: loadingProgress + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- 第一屏：KPI卡片 -->
    <div class="dashboard-section kpi-section">
      <!-- 左上角返回按钮 -->
      <button class="back-btn-topleft" @click="$router.back()">
        <svg class="back-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">返回</span>
      </button>
      
      <!-- 页面标题 -->
      <h1 class="page-title">项目仪表盘</h1>

      <!-- 中心内容区 -->
      <div class="kpi-content">
        <div class="dashboard-cards-wrapper">
          <!-- 总任务数卡片 -->
          <div class="stat-card-modern total-tasks">
            <div class="stat-icon-wrapper">
              <svg class="stat-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-label">项目总任务数</div>
              <div class="stat-value">{{ display.totalTasks }}</div>
              <div class="stat-description">所有任务的总数量</div>
            </div>
            <!-- 任务列表 -->
            <div class="task-list-compact" v-if="allTasks.length > 0">
              <div class="task-list-header">
                <span class="task-list-title">任务列表</span>
                <span class="task-list-count">共 {{ allTasks.length }} 个任务</span>
              </div>
              <div class="task-list-items">
                <div   
                  v-for="task in allTasks" 
                  :key="task.id"
                  class="task-item-compact"
                >
                  <div class="task-item-status" :class="getTaskStatusClass(task.status)"></div>
                  <div class="task-item-content">
                    <div class="task-item-name">{{ task.title || '未命名任务' }}</div>
                    <div class="task-item-assignee">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>{{ getTaskAssigneeName(task) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 任务状态分布卡片 -->
          <div class="chart-card-modern status-distribution">
            <div class="chart-header">
              <h3 class="chart-title">任务状态分布</h3>
              <div class="chart-subtitle">实时任务进度概览</div>
            </div>
            <div class="chart-body">
              <div class="pie-chart-wrapper" v-if="pieSegments.length">
                <svg class="pie-svg" viewBox="0 0 200 200">
                  <g>
                    <path
                      v-for="segment in pieSegments"
                      :key="segment.key"
                      :d="getPiePath(segment.animatedStartAngle, segment.animatedEndAngle)"
                      :fill="segment.color"
                      @mousemove="showTooltip($event, segment.label, segment.value, `个（${segment.percent}%）`)"
                      @mouseleave="hideTooltip"
                    />
                  </g>
                </svg>
              </div>
              <div class="pie-empty" v-else>暂无任务数据</div>
              <div class="legend-modern">
                <div class="legend-item-modern pending-review">
                  <span class="legend-dot"></span>
                  <span class="legend-text">待审核</span>
                  <span class="legend-value">{{ statusCounts.pendingReview }}</span>
                  <span class="legend-percent">{{ dist.pendingReview }}%</span>
                </div>
                <div class="legend-item-modern doing">
                  <span class="legend-dot"></span>
                  <span class="legend-text">进行中</span>
                  <span class="legend-value">{{ statusCounts.doing }}</span>
                  <span class="legend-percent">{{ dist.doing }}%</span>
                </div>
                <div class="legend-item-modern blocked">
                  <span class="legend-dot"></span>
                  <span class="legend-text">阻塞</span>
                  <span class="legend-value">{{ statusCounts.blocked }}</span>
                  <span class="legend-percent">{{ dist.blocked }}%</span>
                </div>
                <div class="legend-item-modern done">
                  <span class="legend-dot"></span>
                  <span class="legend-text">已完成</span>
                  <span class="legend-value">{{ statusCounts.done }}</span>
                  <span class="legend-percent">{{ dist.done }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 滚动提示 -->
      <div class="scroll-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>向下滚动查看已完成任务统计</span>
      </div>
    </div>

    <!-- 第二屏：已完成任务统计 -->
    <div class="dashboard-section charts-section">
      <!-- 左上角返回按钮 -->
      <button class="back-btn-topleft" @click="$router.back()">
        <svg class="back-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">返回</span>
      </button>
      <!-- 页面标题 -->
      <h1 class="page-title">已完成任务统计</h1>

      <!-- 中心内容区 -->
      <div class="kpi-content">
        <div class="dashboard-cards-wrapper">
          <!-- 已完成任务数卡片 -->
          <div class="stat-card-modern completed-tasks">
            <div class="stat-icon-wrapper">
              <svg class="stat-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-label">已完成任务数</div>
              <div class="stat-value">{{ display.completed }}</div>
              <div class="stat-description">完成率 {{ display.completeRate }}%</div>
            </div>
            <!-- 已完成任务列表 -->
            <div class="task-list-compact" v-if="completedTasks.length > 0">
              <div class="task-list-header">
                <span class="task-list-title">已完成任务</span>
                <span class="task-list-count">共 {{ completedTasks.length }} 个任务</span>
              </div>
              <div class="task-list-items">
                <div 
                  v-for="task in completedTasks" 
                  :key="task.id"
                  class="task-item-compact"
                >
                  <div class="task-item-status status-done"></div>
                  <div class="task-item-content">
                    <div class="task-item-name">{{ task.title || '未命名任务' }}</div>
                    <div class="task-item-assignee">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>{{ getTaskAssigneeName(task) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 图表区域卡片 -->
          <div class="chart-card-modern charts-wrapper">
            <div class="charts-grid">
      <div class="card glass gradient-border">
        <div class="card-title">
          成员任务负载
          <span class="total-worktime">总计 {{ totalWorktime }}h</span>
        </div>
        <div class="treemap-container" v-if="memberWorktimes.length > 0" :class="{ 'has-selection': selectedMemberForView }">
          <div 
            v-for="(member, i) in memberWorktimes" 
            :key="member.userId || i"
            class="treemap-block"
            :class="{ 
              'selected': selectedMemberForView && selectedMemberForView.userId === member.userId,
              'hidden': selectedMemberForView && selectedMemberForView.userId !== member.userId
            }"
            :style="getTreemapBlockStyle(member)"
            :title="`${member.name}: ${member.worktime}小时`"
            @click="toggleMemberView(member)"
            @mousemove="showTooltip($event, member.name, member.worktime, '小时')"
            @mouseleave="hideTooltip"
          >
            <div class="treemap-content">
              <div class="treemap-name">{{ member.name }}</div>
              <div class="treemap-value" v-if="selectedMemberForView && selectedMemberForView.userId === member.userId">
                {{ member.worktime }}h
              </div>
            </div>
          </div>
        </div>
        <div class="bar-chart-empty" v-else>
          <div class="empty-text">暂无成员数据</div>
        </div>
      </div>
      
      <!-- 成员详情弹窗 -->
      <div v-if="memberDetailVisible" class="modal-overlay" @click="closeMemberDetail">
        <div class="modal-content member-detail-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ selectedMember.name }} - 工时详情</h3>
            <button class="modal-close" @click="closeMemberDetail">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="member-detail-info">
              <div class="detail-item">
                <span class="detail-label">成员姓名：</span>
                <span class="detail-value">{{ selectedMember.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">总工时：</span>
                <span class="detail-value highlight">{{ selectedMember.worktime }} 小时</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">工时占比：</span>
                <span class="detail-value">{{ selectedMember.percentage }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">任务数量：</span>
                <span class="detail-value">{{ selectedMember.taskCount || 0 }} 个</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="closeMemberDetail">确定</button>
          </div>
        </div>
      </div>
      <!-- 近 30 天完成趋势 -->
      <div class="card glass gradient-border">
        <div class="card-title">近 30 天完成趋势</div>
        <div class="line-chart" v-if="linePoints.length > 0">
          <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
            <defs>
              <!-- 填充区域渐变 -->
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.05" />
              </linearGradient>
              <!-- 折线渐变色 -->
              <linearGradient id="lineStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- 渐变填充区域 -->
            <path   
              :key="'area-'+lineKey"
              :d="lineAreaPath"
              fill="url(#lineGradient)"
              class="line-area"/>
            <!-- 折线（使用渐变色） -->
            <polyline 
              :key="lineKey" 
              class="line" 
              fill="none" 
              stroke="url(#lineStrokeGradient)" 
              stroke-width="2.5"
              :points="linePoints.map(p => `${p.x},${p.y}`).join(' ')"/>
            <!-- 只显示有数据的点（已经过滤，所有点都显示） -->
            <g v-for="(p, idx) in linePoints" :key="'point-'+idx">
              <circle 
                :cx="p.x" 
                :cy="p.y" 
                r="2.5" 
                fill="url(#lineStrokeGradient)"
                class="line-point"/>
              <text 
                :x="p.x" 
                :y="Math.max(8, p.y - 4)" 
                class="line-label">{{ p.v }}</text>
              <!-- 显示日期 -->
              <text 
                :x="p.x" 
                :y="54" 
                class="line-date">{{ formatDate(p.date) }}</text>
            </g>
          </svg>
        </div>
        <div class="line-chart-empty" v-else>
          <div class="empty-text">暂无完成趋势数据</div>
        </div>
      </div>
      </div>
          </div>
        </div>
      </div>
      
      <!-- 滚动提示 -->
      <div class="scroll-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>向下滚动查看成果统计</span>
      </div>
    </div>

    <!-- 第三屏：成果统计 -->
    <div class="dashboard-section achievements-section">
      <!-- 左上角返回按钮 -->
      <button class="back-btn-topleft" @click="$router.back()">
        <svg class="back-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">返回</span>
      </button>
      <!-- 页面标题 -->
      <h1 class="page-title">成果统计</h1>

      <!-- 中心内容区 -->
      <div class="kpi-content">
        <div class="dashboard-cards-wrapper">
        <!-- 左侧：成果列表卡片 -->
        <div class="stat-card-modern achievements-list-card">
          <div class="stat-icon-wrapper" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
            <svg class="stat-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">成果列表</div>
            <div class="stat-value">{{ achievements.length }}</div>
            <div class="stat-description">项目交付成果</div>
          </div>
          <!-- 成果列表 -->
          <div class="task-list-compact" v-if="achievements.length > 0">
            <div class="task-list-header">
              <span class="task-list-title">成果详情</span>
              <span class="task-list-count">共 {{ achievements.length }} 个成果</span>
              <!-- 导出按钮 -->
              <div class="export-dropdown" @click.stop>
                <button class="export-btn" @click="toggleExportMenu">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 8L12 13L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 3V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>导出</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="dropdown-arrow" :class="{ 'rotated': showExportMenu }">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div v-if="showExportMenu" class="export-menu">
                  <div class="export-menu-item" @click="exportAchievements('csv')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>导出为 CSV</span>
                  </div>
                  <div class="export-menu-item" @click="exportAchievements('excel')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>导出为 Excel</span>
                  </div>
                  <div class="export-menu-item" @click="exportAchievements('json')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H20C20.5304 5 21.0391 5.21071 21.4142 5.58579C21.7893 5.96086 22 6.46957 22 7V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H6C5.46957 21 4.96086 20.7893 4.58579 20.4142C4.21071 20.0391 4 19.5304 4 19V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 12L10 14L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>导出为 JSON</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="task-list-items">
              <div 
                v-for="achievement in achievements" 
                :key="achievement.id"
                class="task-item-compact"
              >
                <div class="task-item-status" :class="getAchievementStatusClass(achievement.type)"></div>
                <div class="task-item-content">
                  <div class="task-item-name">{{ achievement.title || '未命名成果' }}</div>
                  <div class="task-item-assignee">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{{ achievement.responsibleName || '未知' }}</span>
                  </div>
                </div>
                <div class="achievement-type-badge-small" :class="getTypeBadgeClass(achievement.type)">
                  {{ achievement.typeName || getTypeDisplay(achievement.type) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="achievement-list-empty">
            <div class="empty-text">暂无成果数据</div>
          </div>
        </div>

        <!-- 右侧：可视化图表卡片 -->
        <div class="chart-card-modern member-contribution-chart">
          <div class="chart-header">
            <h3 class="chart-title">成员贡献统计</h3>
            <div class="chart-subtitle">Wiki文档与成果上传数量对比</div>
          </div>
          <div class="chart-body">
            <!-- 堆叠面积图 -->
            <div class="stacked-area-chart" :class="{ 'chart-animated': contributionChartAnimated }" v-if="memberContributionData.length > 0">
              <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet" class="contribution-svg">
                <defs>
                  <!-- Wiki文档渐变（上层） -->
                  <linearGradient id="wikiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
                  </linearGradient>
                  <!-- 成果渐变（下层） -->
                  <linearGradient id="achievementGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                  </linearGradient>
                  <!-- 高亮渐变 -->
                  <linearGradient id="wikiGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#a78bfa;stop-opacity:0.95" />
                    <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:0.5" />
                  </linearGradient>
                  <linearGradient id="achievementGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:0.95" />
                    <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:0.5" />
                  </linearGradient>
                </defs>
                
                <!-- Y轴网格线 -->
                <g class="grid-lines">
                  <line x1="50" y1="30" x2="380" y2="30" stroke="#e2e8f0" stroke-dasharray="4"/>
                  <line x1="50" y1="70" x2="380" y2="70" stroke="#e2e8f0" stroke-dasharray="4"/>
                  <line x1="50" y1="110" x2="380" y2="110" stroke="#e2e8f0" stroke-dasharray="4"/>
                  <line x1="50" y1="150" x2="380" y2="150" stroke="#e2e8f0" stroke-dasharray="4"/>
                </g>
                
                <!-- 成果区域（下层，蓝色） -->
                <path 
                  :d="achievementAreaPath"
                  :fill="contributionHoverType === 'achievement' ? 'url(#achievementGradientHover)' : 'url(#achievementGradient)'"
                  :class="['area-path', 'achievement-area', { 'active': contributionHoverType === 'achievement', 'dimmed': contributionHoverType === 'wiki' }]"
                  @mousemove="showContributionTooltip($event, 'achievement')"
                  @mouseleave="hideContributionTooltip"
                />
                
                <!-- Wiki文档区域（上层，紫色） -->
                <path 
                  v-if="wikiAreaPath && wikiAreaPath.trim() !== '' && hasWikiData"
                  :d="wikiAreaPath"
                  :fill="contributionHoverType === 'wiki' ? 'url(#wikiGradientHover)' : 'url(#wikiGradient)'"
                  :class="['area-path', 'wiki-area', { 'active': contributionHoverType === 'wiki', 'dimmed': contributionHoverType === 'achievement' }]"
                  @mousemove="showContributionTooltip($event, 'wiki')"
                  @mouseleave="hideContributionTooltip"
                />
                
                <!-- X轴成员名称 -->
                <g class="x-axis-labels">
                  <text 
                    v-for="(member, index) in memberContributionData" 
                    :key="'label-' + index"
                    :x="getContributionX(index)"
                    y="190"
                    text-anchor="middle"
                    class="axis-label"
                  >{{ truncateName(member.name) }}</text>
                </g>
                
                <!-- Y轴刻度 -->
                <g class="y-axis-labels">
                  <text x="45" y="34" text-anchor="end" class="axis-label">{{ maxContribution }}</text>
                  <text x="45" y="74" text-anchor="end" class="axis-label">{{ Math.round(maxContribution * 0.75) }}</text>
                  <text x="45" y="114" text-anchor="end" class="axis-label">{{ Math.round(maxContribution * 0.5) }}</text>
                  <text x="45" y="154" text-anchor="end" class="axis-label">{{ Math.round(maxContribution * 0.25) }}</text>
                </g>
              </svg>
            </div>
            <div class="chart-empty" v-else>
              <div class="empty-text">暂无成员贡献数据</div>
            </div>
            
            <!-- 图例 -->
            <div class="contribution-legend">
              <div class="legend-item-modern wiki-legend">
                <span class="legend-dot" style="background: #8b5cf6;"></span>
                <span class="legend-text">Wiki文档</span>
                <span class="legend-value">{{ totalWikiCount }}</span>
              </div>
              <div class="legend-item-modern achievement-legend">
                <span class="legend-dot" style="background: #3b82f6;"></span>
                <span class="legend-text">成果上传</span>
                <span class="legend-value">{{ achievements.length }}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <!-- 滚动提示 -->
      <div class="scroll-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>向下滚动查看成员任务统计</span>
      </div>
    </div>

    <!-- 第四屏：成员任务统计 -->
    <div class="dashboard-section member-submission-section">
      <!-- 左上角返回按钮 -->
      <button class="back-btn-topleft" @click="$router.back()">
        <svg class="back-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">返回</span>
      </button>
      <!-- 页面标题 -->
      <h1 class="page-title">成员任务统计</h1>

      <!-- 中心内容区 -->
      <div class="kpi-content">
        <div class="dashboard-cards-wrapper">
          <!-- 左侧：成员任务列表卡片 -->
          <div class="stat-card-modern member-tasks-list-card">
            <div class="member-list-header">
              <div class="stat-icon-wrapper small" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content compact">
                <div class="stat-label">成员任务分配</div>
                <div class="stat-value-row">
                  <span class="stat-value small">{{ memberTaskStats.length }}</span>
                  <span class="stat-description">位成员</span>
                </div>
              </div>
            </div>
            <!-- 成员任务列表 -->
            <div class="task-list-compact" v-if="memberTaskStats.length > 0">
              <div class="task-list-items">
                <div 
                  v-for="(member, index) in memberTaskStats" 
                  :key="'member-stat-' + index"
                  class="task-item-compact member-task-item"
                >
                  <div class="member-avatar" :style="{ background: getMemberColor(index) }">
                    {{ member.name ? member.name.charAt(0) : '?' }}
                  </div>
                  <div class="task-item-content">
                    <div class="task-item-name">{{ member.name || '未知成员' }}</div>
                    <div class="task-item-stats">
                      <span class="stat-badge total">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        参与 {{ member.totalTasks }}
                      </span>
                      <span class="stat-badge completed">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        完成 {{ member.completedTasks }}
                      </span>
                    </div>
                  </div>
                  <div class="completion-rate" :class="getCompletionRateClass(member)">
                    {{ getCompletionRate(member) }}%
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="member-list-empty">
              <div class="empty-text">暂无成员数据</div>
            </div>
          </div>

          <!-- 右侧：图表区域（上下两个图表） -->
          <div class="chart-card-modern charts-wrapper">
            <div class="charts-grid">
              <!-- 上方：双向柱状图 -->
              <div class="card glass gradient-border chart-item">
                <div class="card-title">成员任务分布</div>
                <div class="bidirectional-bar-chart" v-if="memberTaskStats.length > 0">
                  <svg viewBox="0 0 700 200" preserveAspectRatio="xMidYMid meet" class="member-task-svg">
                    <defs>
                      <linearGradient id="totalTaskGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.9" />
                        <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:0.7" />
                      </linearGradient>
                      <linearGradient id="completedTaskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.9" />
                        <stop offset="100%" style="stop-color:#dc2626;stop-opacity:0.7" />
                      </linearGradient>
                    </defs>
                    <g class="y-axis-top">
                      <line x1="45" y1="85" x2="655" y2="85" stroke="#475569" stroke-width="2"/>
                      <line x1="45" y1="60" x2="655" y2="60" stroke="#e2e8f0" stroke-dasharray="4"/>
                      <line x1="45" y1="35" x2="655" y2="35" stroke="#e2e8f0" stroke-dasharray="4"/>
                      <line x1="45" y1="10" x2="655" y2="10" stroke="#e2e8f0" stroke-dasharray="4"/>
                      <text x="40" y="89" text-anchor="end" class="axis-label">0</text>
                      <text x="40" y="64" text-anchor="end" class="axis-label">{{ Math.round(maxMemberTaskCount / 3) }}</text>
                      <text x="40" y="39" text-anchor="end" class="axis-label">{{ Math.round(maxMemberTaskCount * 2 / 3) }}</text>
                      <text x="40" y="14" text-anchor="end" class="axis-label">{{ maxMemberTaskCount }}</text>
                    </g>
                    <g class="y-axis-bottom">
                      <line x1="45" y1="110" x2="655" y2="110" stroke="#e2e8f0" stroke-dasharray="4"/>
                      <line x1="45" y1="135" x2="655" y2="135" stroke="#e2e8f0" stroke-dasharray="4"/>
                      <line x1="45" y1="160" x2="655" y2="160" stroke="#e2e8f0" stroke-dasharray="4"/>
                      <text x="40" y="114" text-anchor="end" class="axis-label">{{ Math.round(maxMemberTaskCount / 3) }}</text>
                      <text x="40" y="139" text-anchor="end" class="axis-label">{{ Math.round(maxMemberTaskCount * 2 / 3) }}</text>
                      <text x="40" y="164" text-anchor="end" class="axis-label">{{ maxMemberTaskCount }}</text>
                    </g>
                    <g class="bars" :class="{ 'hover-total': memberTaskHoverType === 'total', 'hover-completed': memberTaskHoverType === 'completed', 'bars-animated': memberTaskBarsAnimated }">
                      <g v-for="(member, index) in memberTaskStats" :key="'bar-' + index" :style="{ '--delay': `${index * 0.12}s` }">
                        <rect :x="getMemberBarX(index)" :y="85 - getMemberBarHeightSmall(member.totalTasks)" :width="barWidth" :height="Math.max(getMemberBarHeightSmall(member.totalTasks), 2)" fill="url(#totalTaskGradient)" class="bar-total" rx="3" ry="3" @mouseenter="showMemberTaskTooltip($event, member, 'total')" @mousemove="updateMemberTaskTooltip($event)" @mouseleave="hideMemberTaskTooltip"/>
                        <rect :x="getMemberBarX(index)" y="85" :width="barWidth" :height="Math.max(getMemberBarHeightSmall(member.completedTasks), 2)" fill="url(#completedTaskGradient)" class="bar-completed" rx="3" ry="3" @mouseenter="showMemberTaskTooltip($event, member, 'completed')" @mousemove="updateMemberTaskTooltip($event)" @mouseleave="hideMemberTaskTooltip"/>
                        <text :x="getMemberBarX(index) + barWidth / 2" y="190" text-anchor="middle" class="axis-label member-name-label">{{ truncateMemberName(member.name) }}</text>
                      </g>
                    </g>
                  </svg>
                </div>
                <div class="chart-empty" v-else>
                  <div class="empty-text">暂无成员任务数据</div>
                </div>
                <div class="member-task-legend">
                  <div class="legend-item-modern">
                    <span class="legend-dot" style="background: #f59e0b;"></span>
                    <span class="legend-text">参与任务数</span>
                  </div>
                  <div class="legend-item-modern">
                    <span class="legend-dot" style="background: #ef4444;"></span>
                    <span class="legend-text">已完成任务数</span>
                  </div>
                </div>
              </div>

              <!-- 下方：任务完成时间线散点图 -->
              <div class="card glass gradient-border chart-item timeline-chart-item">
                <div class="card-title timeline-title">任务完成时间线</div>
                <div class="task-timeline-scatter" v-if="taskCompletionTimeline.length > 0">
                  <svg viewBox="0 0 700 160" preserveAspectRatio="xMidYMid meet" class="timeline-scatter-svg">
                    <defs>
                      <radialGradient id="bubbleGradient1" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#b0a4d4;stop-opacity:0.92" />
                        <stop offset="100%" style="stop-color:#8a7eb8;stop-opacity:0.75" />
                      </radialGradient>
                      <radialGradient id="bubbleGradient2" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#d6b0c6;stop-opacity:0.92" />
                        <stop offset="100%" style="stop-color:#b891a8;stop-opacity:0.75" />
                      </radialGradient>
                      <radialGradient id="bubbleGradient3" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#8db8d6;stop-opacity:0.92" />
                        <stop offset="100%" style="stop-color:#6d99b8;stop-opacity:0.75" />
                      </radialGradient>
                      <radialGradient id="bubbleGradient4" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#e0c8a8;stop-opacity:0.92" />
                        <stop offset="100%" style="stop-color:#c8ab88;stop-opacity:0.75" />
                      </radialGradient>
                      <radialGradient id="bubbleGradient5" cx="30%" cy="30%">
                        <stop offset="0%" style="stop-color:#a0c8d8;stop-opacity:0.92" />
                        <stop offset="100%" style="stop-color:#80a8b8;stop-opacity:0.75" />
                      </radialGradient>
                    </defs>
                    <g class="grid-lines">
                      <line v-for="i in 5" :key="'h-' + i" x1="60" :y1="35 + (i-1) * 22" x2="680" :y2="35 + (i-1) * 22" stroke="#e2e8f0" stroke-dasharray="4"/>
                    </g>
                    <g class="y-axis-dates">
                      <text v-for="(date, i) in timelineDateLabels" :key="'date-' + i" x="55" :y="40 + i * 22" text-anchor="end" class="axis-label date-label">{{ date }}</text>
                    </g>
                    <g class="x-axis-members">
                      <text v-for="(member, i) in timelineMemberNames" :key="'member-' + i" :x="getTimelineMemberX(i)" y="155" text-anchor="middle" class="axis-label member-label">{{ truncateMemberName(member) }}</text>
                    </g>
                    <g class="scatter-bubbles" :class="{ 'bubbles-animated': timelineScatterAnimated }">
                      <circle v-for="(point, i) in taskCompletionTimeline" :key="'bubble-' + i" :cx="getTimelineMemberX(point.memberIndex) + getBubbleOffsetX(i, point)" :cy="getTimelineDateY(point.completedDate) + getBubbleOffsetY(i, point)" :r="getBubbleRadius(i, point)" :fill="`url(#bubbleGradient${(point.memberIndex % 5) + 1})`" :class="['task-bubble', `bubble-float-${(i % 3) + 1}`]" :style="{ '--delay': `${i * 0.1}s` }" @mouseenter="showTimelineTooltip($event, point)" @mousemove="updateTimelineTooltip($event)" @mouseleave="hideTimelineTooltip"/>
                    </g>
                  </svg>
                  <div v-if="timelineTooltip.show" class="timeline-scatter-tooltip" :style="{ left: timelineTooltip.x + 'px', top: timelineTooltip.y + 'px' }">
                    <div class="tooltip-header">{{ timelineTooltip.memberName }}</div>
                    <div class="tooltip-content">
                      <div class="tooltip-row">
                        <span class="tooltip-label">任务名称</span>
                        <span class="tooltip-value">{{ timelineTooltip.taskTitle }}</span>
                      </div>
                      <div class="tooltip-row">
                        <span class="tooltip-label">完成日期</span>
                        <span class="tooltip-value">{{ timelineTooltip.completedDate }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-data-hint">暂无已完成任务数据</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 滚动提示 -->
      <div class="scroll-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>向下滚动查看里程碑</span>
      </div>
    </div>

    <!-- 第五屏：里程碑时间线 -->
    <div class="dashboard-section timeline-section">
      <!-- 左上角返回按钮 -->
      <button class="back-btn-topleft" @click="$router.back()">
        <svg class="back-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">返回</span>
      </button>
      <div class="section-header">
        <h2 class="section-title">里程碑时间线</h2>
        <p class="section-subtitle">项目关键节点与进度跟踪</p>
      </div>
      
      <div class="timeline-dual-layout">
        <!-- 左侧：里程碑任务列表 -->
        <div class="timeline-left">
          <div class="timeline card glass gradient-border">
            <ul class="steps" v-if="milestoneTasks.length > 0">
              <li v-for="task in milestoneTasks" :key="task.id" :class="getMilestoneStatusClass(task.status)">
                <div class="milestone-task-info">
                  <div class="name">{{ task.title }}</div>
                  <div class="milestone-members" v-if="task.memberNames">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{{ task.memberNames }}</span>
                  </div>
                </div>
                <div class="date">{{ task.dueDate || '未设置截止日期' }}</div>
              </li>
            </ul>
            <div v-else class="milestone-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
                <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
              </svg>
              <p>暂无里程碑任务</p>
            </div>
          </div>
        </div>
        
        <!-- 右侧：已提交的里程碑任务时间线 -->
        <div class="timeline-right">
          <div class="commit-timeline card glass gradient-border">
            <div class="commit-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="commit-branch">里程碑提交记录</span>
            </div>
            <ul class="commit-list" v-if="milestoneSubmissions.length > 0">
              <li class="commit-item" v-for="submission in milestoneSubmissions" :key="submission.taskId">
                <div class="commit-dot"></div>
                <div class="commit-content">
                  <div class="commit-message">{{ submission.taskTitle }}</div>
                  <div class="commit-meta">
                    <span class="commit-author-name">提交人：{{ submission.submitterName }}</span>
                    <span class="commit-time">{{ formatDateTime(submission.submitTime) }}</span>
                  </div>
                </div>
              </li>
            </ul>
            <div v-else class="commit-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p>暂无里程碑提交记录</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 滚动提示 -->
      <div class="scroll-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>向上滚动查看成果统计</span>
      </div>
    </div>

    <div v-if="tooltip.show" class="tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div v-if="tooltip.mode === 'value'" class="tooltip-value">{{ tooltip.value }}{{ tooltip.suffix }}</div>
      <div v-else-if="tooltip.mode === 'tasks'" class="tooltip-task-list">
        <div v-if="!tooltip.tasks || tooltip.tasks.length === 0" class="tooltip-empty">暂无任务数据</div>
        <ul v-else>
          <li v-for="task in tooltip.tasks" :key="task.id || task.taskId" class="tooltip-task-item">
            <!-- 展示任务名称 + 接取该任务的成员名称；如果没有接取则显示“未接取” -->
            <div class="task-title">
              {{ task.title || task.name || '未命名任务' }}
              <span class="task-owner">
                - {{ getTaskAssigneeName(task) }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- 成员任务统计 Tooltip（放在根级别避免被父容器裁剪） -->
    <div v-if="memberTaskTooltip.show" class="member-task-tooltip-fixed" :style="{ left: memberTaskTooltip.x + 'px', top: memberTaskTooltip.y + 'px' }">
      <div class="tooltip-header">{{ memberTaskTooltip.name }}</div>
      <div class="tooltip-content">
        <span class="tooltip-label">{{ memberTaskTooltip.label }}</span>
        <span class="tooltip-value">{{ memberTaskTooltip.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getLatestSubmission, getTaskSubmissions } from '@/api/taskSubmission'

export default {
  name: 'ProjectDashboard',
  data() {
    return {
      // 加载状态
      isLoading: true,
      loadingProgress: 0, // 0-100
      // 目标值
      kpis: {
        totalTasks: 0,
        completed: 0,
        completeRate: 0,
        delayed: 0,
        addedThisWeek: 0
      },
      // 动画展示用数字
      display: {
        totalTasks: 0,
        completed: 0,
        completeRate: 0,
        delayed: 0,
        addedThisWeek: 0
      },
      // 环形图 / 饼图分布（百分比）
      dist: { todo: 0, doing: 0, blocked: 0, done: 0 },
      // 控件
      filters: {
        range: '30',
        groupBy: 'member'
      },
      // 背景粒子
      particles: [],
      rafId: null,
      // 动态
      barHeights: [60, 75, 70, 55, 40],
      lineKey: Date.now(),
      // 通用提示信息（支持数值和任务列表两种模式）
      tooltip: { show: false, x: 0, y: 0, title: '', value: '', suffix: '', mode: 'value', tasks: [] },
      statusCounts: { pendingReview: 0, doing: 0, blocked: 0, done: 0 },
      // 饼图动画进度 (0-1)
      pieAnimationProgress: 0,
      // 从后端获取的完整任务列表（真实任务数据）
      allTasks: [],
      // 从后端获取的已完成任务列表（真实完成任务数据）
      completedTasks: [],
      // 成员工时数据
      memberWorktimes: [],
      // 近30天完成趋势数据
      completionTrend: [], // [{ date: '2025-11-01', count: 3 }, ...]
      // 成果统计数据
      achievements: [], // 成果列表
      // Wiki统计数据
      wikiStatistics: null, // Wiki统计信息
      memberContributionData: [], // 成员贡献数据 [{name, wikiCount, achievementCount}]
      totalWikiCount: 0, // Wiki文档总数
      contributionHoverType: null, // 当前悬停的类型 'wiki' | 'achievement' | null
      // 项目成员（用于解析负责人姓名）
      projectMembers: [],
      // 任务提交记录
      taskSubmissions: [],
      // 里程碑任务列表
      milestoneTasks: [],
      // 已提交的里程碑任务
      milestoneSubmissions: [],
      // 成员任务统计数据 [{name, totalTasks, completedTasks}]
      memberTaskStats: [],
      // 导出菜单显示状态
      showExportMenu: false,
      // 双向柱状图配置
      barWidth: 50,
      // 成员任务统计tooltip
      memberTaskTooltip: {
        show: false,
        x: 0,
        y: 0,
        name: '',
        label: '',
        value: 0
      },
      // 当前悬停的柱状图类型
      memberTaskHoverType: null,
      // 柱状图动画是否已触发
      memberTaskBarsAnimated: false,
      // 成员贡献图表动画是否已触发
      contributionChartAnimated: false,
      // 任务完成时间线数据
      taskCompletionTimeline: [],
      // 时间线成员名称列表
      timelineMemberNames: [],
      // 时间线日期范围
      timelineDateRange: { min: null, max: null },
      // 时间线tooltip
      timelineTooltip: {
        show: false,
        x: 0,
        y: 0,
        memberName: '',
        taskTitle: '',
        completedDate: ''
      },
      // 任务完成时间线散点图动画是否已触发
      timelineScatterAnimated: false,
      // 滚动监听器
      scrollObserver: null,
      // 成员详情弹窗
      memberDetailVisible: false,
      selectedMember: {
        name: '',
        worktime: 0,
        percentage: 0,
        taskCount: 0
      },
      // 树状图选中的成员（用于展开视图）
      selectedMemberForView: null
    }
  },
  created() {
    // 可按需通过项目ID拉取统计数据：this.$route.params.id
  },
  async mounted() {
    // 启动粒子背景
    this.initParticles()
    window.addEventListener('resize', this.resizeCanvas)
    
    // 添加滚动监听，用于检测何时滚动到图表section
    this.setupScrollObserver()
    
    // 点击外部关闭导出菜单
    document.addEventListener('click', this.handleClickOutside)
    
    // 优化加载策略：先加载关键数据，立即显示页面
    try {
      this.isLoading = true
      this.loadingProgress = 10
      
      // 第一步：并行加载关键数据（第一屏需要的数据）
      // 使用快速模式：先加载前几页任务，剩余任务异步加载
      const [allTasks, projectMembers] = await Promise.all([
        this.fetchAllTasks(true), // 快速模式
        this.loadProjectMembers()
      ])
      
      this.allTasks = allTasks
      this.loadingProgress = 40
      
      // 第二步：加载第一屏的关键数据（KPI和任务统计）
      await Promise.all([
        this.loadTaskStatistics(allTasks),
        this.loadMemberWorktimes(allTasks)
      ])
      
      this.loadingProgress = 60
      
      // 立即显示页面（关键数据已加载完成）
      this.isLoading = false
      this.loadingProgress = 100
      
      // 数字滚动动画
      Object.keys(this.kpis).forEach(key => this.animateCount(key, this.kpis[key], 800))
      // 饼图动画
      this.animatePieChart()
      
      // 第三步：异步加载非关键数据（不阻塞页面显示）
      // 使用 requestIdleCallback 或 setTimeout 延迟加载，避免阻塞主线程
      setTimeout(() => {
        Promise.all([
          this.loadCompletionTrend(),
          this.loadAchievements(),
          this.loadTaskSubmissions(),
          this.loadWikiStatistics(),
          this.loadMilestoneTasks()
        ]).catch(error => {
          console.error('[ProjectDashboard] 非关键数据加载失败:', error)
        })
      }, 100)
      
    } catch (error) {
      console.error('[ProjectDashboard] 加载关键数据失败:', error)
      // 即使关键数据加载失败，也显示页面
      this.isLoading = false
    }
  },
  beforeDestroy() {
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this.resizeCanvas)
    // 清理滚动监听器
    if (this.scrollObserver) {
      this.scrollObserver.disconnect()
    }
    // 移除点击外部监听
    document.removeEventListener('click', this.handleClickOutside)
  },
  computed: {
    // 计算总工时
    totalWorktime() {
      return this.memberWorktimes.reduce((sum, member) => sum + (member.worktime || 0), 0)
    },
    // 用于线图文本标注（基于真实数据，只显示有完成任务的日期）
    linePoints() {
      if (!this.completionTrend || this.completionTrend.length === 0) {
        // 如果没有数据，返回空数组
        return []
      }
      
      // 过滤掉count为0的数据，只保留有完成任务的日期
      const validDays = this.completionTrend.filter(day => day.count > 0)
      
      if (validDays.length === 0) {
        return []
      }
      
      // 计算最大值用于归一化
      const maxCount = Math.max(...validDays.map(d => d.count), 1)
      const minY = 10 // 最小Y值（顶部）
      const maxY = 42 // 最大Y值（底部）
      const rangeY = maxY - minY
      
      // 生成数据点（只包含有数据的日期）
      const points = []
      const totalValidDays = validDays.length
      
      validDays.forEach((day, index) => {
        // X坐标：0到100，均匀分布（只基于有数据的日期）
        // 如果只有一天，x=50（中间位置）
        const x = totalValidDays > 1 ? (index / (totalValidDays - 1)) * 100 : 50
        // Y坐标：倒置（值越大，Y越小，因为SVG的Y轴向下）
        const normalizedValue = maxCount > 0 ? (day.count / maxCount) : 0
        const y = maxY - (normalizedValue * rangeY)
        
        points.push({
          x: x,
          y: Math.max(minY, Math.min(maxY, y)), // 确保Y在范围内
          v: day.count,
          showLabel: true, // 所有点都显示标签（因为已经过滤了）
          date: day.date // 保存日期用于显示
        })
      })
      
      return points
    },
    // 用于生成渐变填充区域
    lineAreaPath() {
      if (!this.linePoints || this.linePoints.length === 0) {
        return ''
      }
      
      const points = this.linePoints
      const maxY = 42 // 底部Y值 - 与linePoints保持一致
      
      // 构建路径：从第一个点开始，经过所有点，然后到底部，再回到起点
      let path = `M ${points[0].x} ${maxY} L ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`
      }
      
      // 连接最后一个点到底部，然后闭合
      path += ` L ${points[points.length - 1].x} ${maxY} Z`
      
      return path
    },
    pieSegments() {
      const total = Object.values(this.statusCounts).reduce((sum, v) => sum + v, 0)
      if (!total) return []

      const segments = []
      const colors = [
        { key: 'pendingReview', color: '#60a5fa', label: '待审核' }, // 明亮的蓝色
        { key: 'doing', color: '#3b82f6', label: '进行中' }, // 鲜艳的蓝色
        { key: 'blocked', color: '#f59e0b', label: '阻塞' }, // 明亮的橙色
        { key: 'done', color: '#10b981', label: '已完成' } // 鲜艳的绿色
      ]

      let startAngle = 0
      colors.forEach(({ key, color, label }) => {
        const value = this.statusCounts[key] || 0
        if (!value) return
          const percent = value / total
          const angle = percent * 360
        const originalStartAngle = startAngle
        const originalEndAngle = startAngle + angle
        
        // 计算动画后的角度
        const animatedStartAngle = originalStartAngle
        const animatedEndAngle = originalStartAngle + (angle * this.pieAnimationProgress)
        
        segments.push({
          key,
          value,
          percent: Math.round(percent * 100),
          color,
          label,
          startAngle,
          endAngle: startAngle + angle,
          // 用于动画的原始角度
          originalStartAngle,
          originalEndAngle,
          // 动画后的角度
          animatedStartAngle,
          animatedEndAngle
        })
        startAngle += angle
      })
      return segments
    },
    // 计算成员任务统计的最大值（用于Y轴刻度）
    maxMemberTaskCount() {
      if (!this.memberTaskStats || this.memberTaskStats.length === 0) {
        return 10
      }
      const maxTotal = Math.max(...this.memberTaskStats.map(m => Math.max(m.totalTasks, m.completedTasks)))
      // 向上取整到合适的刻度
      return Math.max(Math.ceil(maxTotal / 3) * 3, 3)
    },
    // 双向柱状图宽度
    chartWidth() {
      return Math.max(800, this.memberTaskStats.length * 80)
    },
    // 时间线Y轴日期标签（从下到上：早 -> 晚）
    timelineDateLabels() {
      if (!this.timelineDateRange.min || !this.timelineDateRange.max) {
        return []
      }
      const labels = []
      const minDate = new Date(this.timelineDateRange.min)
      const maxDate = new Date(this.timelineDateRange.max)
      const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
      const step = Math.max(1, Math.ceil(daysDiff / 4))
      
      // 从最新日期开始往早的日期排列（上面是新的，下面是旧的）
      for (let i = 0; i < 5; i++) {
        const date = new Date(maxDate)
        date.setDate(date.getDate() - i * step)
        if (date >= minDate) {
          labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
        }
      }
      return labels
    },
    // 计算成员贡献的最大值（用于Y轴刻度）
    maxContribution() {
      if (!this.memberContributionData || this.memberContributionData.length === 0) {
        return 10
      }
      const maxTotal = Math.max(...this.memberContributionData.map(m => m.wikiCount + m.achievementCount))
      // 向上取整到合适的刻度
      return Math.max(Math.ceil(maxTotal / 5) * 5, 5)
    },
    // 检查是否有Wiki数据
    hasWikiData() {
      if (!this.memberContributionData || this.memberContributionData.length === 0) {
        return false
      }
      return this.memberContributionData.some(m => m.wikiCount > 0)
    },
    // 计算Wiki文档区域的SVG路径（堆叠在成果之上）
    wikiAreaPath() {
      if (!this.memberContributionData || this.memberContributionData.length === 0) {
        return ''
      }
      
      // 检查是否有Wiki数据
      const hasWiki = this.memberContributionData.some(m => m.wikiCount > 0)
      if (!hasWiki) {
        return ''
      }
      
      const data = this.memberContributionData
      const maxY = this.maxContribution || 1
      const chartHeight = 140 // 图表高度（从y=30到y=170）
      const chartBottom = 170
      const chartLeft = 50 // 图表左边界
      const chartRight = 380 // 图表右边界
      
      // 构建路径点（Wiki区域的顶部和底部）
      let topPathPoints = [] // Wiki区域顶部
      let bottomPathPoints = [] // Wiki区域底部（即成果区域顶部）
      
      data.forEach((member, index) => {
        const x = this.getContributionX(index)
        // 计算成果区域的顶部位置（Wiki区域的底部）
        const achievementTopY = chartBottom - (member.achievementCount / maxY) * chartHeight
        // 计算Wiki区域的顶部位置（从成果顶部向上堆叠）
        const wikiTopY = achievementTopY - (member.wikiCount / maxY) * chartHeight
        
        topPathPoints.push({ x, y: wikiTopY })
        bottomPathPoints.push({ x, y: achievementTopY })
      })
      
      // 构建SVG路径
      if (topPathPoints.length === 0) return ''
      
      // 如果只有一个数据点
      if (topPathPoints.length === 1) {
        const top = topPathPoints[0]
        const bottom = bottomPathPoints[0]
        // 确保有高度差，即使很小也要显示
        if (Math.abs(top.y - bottom.y) < 0.1) {
          // 如果高度差太小，至少显示1像素
          const adjustedTop = Math.max(top.y - 1, 30)
          return `M ${chartLeft} ${bottom.y} L ${chartLeft} ${adjustedTop} L ${chartRight} ${adjustedTop} L ${chartRight} ${bottom.y} Z`
        }
        return `M ${chartLeft} ${bottom.y} L ${chartLeft} ${top.y} L ${chartRight} ${top.y} L ${chartRight} ${bottom.y} Z`
      }
      
      // 多个数据点时，构建堆叠面积图
      // 路径构建：从左下角 -> 沿顶部边界到右上角 -> 沿底部边界返回左下角
      const firstBottom = bottomPathPoints[0]
      const lastTop = topPathPoints[topPathPoints.length - 1]
      const lastBottom = bottomPathPoints[bottomPathPoints.length - 1]
      
      // 从左侧边界开始，到第一个数据点的底部
      let path = `M ${chartLeft} ${firstBottom.y} L ${firstBottom.x} ${firstBottom.y}`
      
      // 沿顶部路径（从左到右）- Wiki 区域的顶部边界
      topPathPoints.forEach(p => {
        path += ` L ${p.x} ${p.y}`
      })
      
      // 到右侧边界，然后沿底部路径返回
      path += ` L ${lastTop.x} ${lastBottom.y} L ${chartRight} ${lastBottom.y}`
      
      // 底部路径（从右到左，反向）- 成果区域的顶部边界
      for (let i = bottomPathPoints.length - 1; i >= 0; i--) {
        path += ` L ${bottomPathPoints[i].x} ${bottomPathPoints[i].y}`
      }
      
      // 返回到左侧边界并闭合
      path += ` L ${chartLeft} ${firstBottom.y} Z`
      
      return path
    },
    // 计算成果区域的SVG路径（底层）
    achievementAreaPath() {
      if (!this.memberContributionData || this.memberContributionData.length === 0) {
        return ''
      }
      const data = this.memberContributionData
      const maxY = this.maxContribution || 1
      const chartHeight = 140 // 图表高度
      const chartBottom = 170
      const chartLeft = 50 // 图表左边界
      const chartRight = 380 // 图表右边界
      
      // 构建路径点
      let pathPoints = []
      data.forEach((member, index) => {
        const x = this.getContributionX(index)
        // 只有成果的高度
        const achievementY = chartBottom - (member.achievementCount / maxY) * chartHeight
        pathPoints.push({ x, y: achievementY })
      })
      
      // 构建SVG路径
      if (pathPoints.length === 0) return ''
      
      // 如果只有一个数据点，从左边界画到右边界形成面积图
      if (pathPoints.length === 1) {
        const p = pathPoints[0]
        return `M ${chartLeft} ${chartBottom} L ${chartLeft} ${p.y} L ${chartRight} ${p.y} L ${chartRight} ${chartBottom} Z`
      }
      
      // 多个数据点时
      let path = `M ${chartLeft} ${chartBottom} L ${pathPoints[0].x} ${chartBottom}`
      pathPoints.forEach(p => {
        path += ` L ${p.x} ${p.y}`
      })
      path += ` L ${pathPoints[pathPoints.length - 1].x} ${chartBottom} L ${chartRight} ${chartBottom} Z`
      
      return path
    }
  },
  methods: {
    /**
     * 设置滚动监听器，检测图表section是否进入视口
     */
    setupScrollObserver() {
      // 使用 Intersection Observer API 监听图表section
      const options = {
        root: null, // 使用视口作为根
        rootMargin: '0px',
        threshold: 0.3 // 当30%的section可见时触发
      }

      this.scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.target.classList.contains('charts-section')) {
            if (entry.isIntersecting) {
              console.log('[ProjectDashboard] 图表section进入视口，触发动画')
              this.playChartsAnimation()
            }
          }
          // 监听成果统计section
          if (entry.target.classList.contains('achievements-section')) {
            if (entry.isIntersecting) {
              console.log('[ProjectDashboard] 成果统计section进入视口，触发贡献图表动画')
              this.contributionChartAnimated = true
            } else {
              // 离开视口时重置动画状态
              this.contributionChartAnimated = false
            }
          }
          // 监听成员任务统计section
          if (entry.target.classList.contains('member-submission-section')) {
            if (entry.isIntersecting) {
              console.log('[ProjectDashboard] 成员任务统计section进入视口，触发柱状图和散点图动画')
              this.memberTaskBarsAnimated = true
              // 触发散点图动画
              this.triggerTimelineScatterAnimation()
            } else {
              // 离开视口时重置动画状态
              this.memberTaskBarsAnimated = false
              this.timelineScatterAnimated = false
            }
          }
        })
      }, options)

      // 监听图表section
      this.$nextTick(() => {
        const chartsSection = this.$el.querySelector('.charts-section')
        if (chartsSection) {
          this.scrollObserver.observe(chartsSection)
        }
        // 监听成果统计section
        const achievementsSection = this.$el.querySelector('.achievements-section')
        if (achievementsSection) {
          this.scrollObserver.observe(achievementsSection)
        }
        // 监听成员任务统计section
        const memberSection = this.$el.querySelector('.member-submission-section')
        if (memberSection) {
          this.scrollObserver.observe(memberSection)
        }
      })
    },

    /**
     * 播放图表动画
     */
    playChartsAnimation() {
      // 重置并播放饼图动画
      this.animatePieChart()
      
      // 柱状图的动画是通过CSS实现的，可以通过重新触发来实现
      this.triggerBarChartAnimation()
      
      // 触发树状图动画
      this.triggerTreemapAnimation()
    },

    /**
     * 触发柱状图动画
     */
    triggerBarChartAnimation() {
      // 通过移除并重新添加动画class来重新触发动画
      const bars = this.$el.querySelectorAll('.bar')
      bars.forEach(bar => {
        // 移除动画class
        bar.style.animation = 'none'
        // 强制重排
        void bar.offsetHeight
        // 重新添加动画
        bar.style.animation = ''
      })
    },

    /**
     * 触发树状图动画
     */
    triggerTreemapAnimation() {
      console.log('[ProjectDashboard] 触发树状图动画')
      const container = this.$el.querySelector('.treemap-container')
      if (!container) return
      
      const blocks = container.querySelectorAll('.treemap-block')
      console.log('[ProjectDashboard] 找到方块数量:', blocks.length)
      
      // 移除所有方块的动画class
      blocks.forEach(block => {
        block.classList.add('no-animation')
      })
      
      // 强制重排
      void container.offsetHeight
      
      // 短暂延迟后重新添加动画
      setTimeout(() => {
        blocks.forEach(block => {
          block.classList.remove('no-animation')
        })
      }, 50)
    },

    /**
     * 触发任务完成时间线散点图动画
     */
    triggerTimelineScatterAnimation() {
      console.log('[ProjectDashboard] 触发散点图动画')
      // 先重置动画状态
      this.timelineScatterAnimated = false
      
      // 强制重排后重新触发动画
      this.$nextTick(() => {
        // 短暂延迟后启动动画，确保DOM已更新
        setTimeout(() => {
          this.timelineScatterAnimated = true
        }, 50)
      })
    },

    /**
     * 计算树状图方块的样式
     */
    getTreemapBlockStyle(member) {
      const totalWorktime = this.totalWorktime || 1
      const percentage = (member.worktime / totalWorktime) * 100
      
      // 根据工时占比计算方块的flex-basis（宽度比例）
      const size = Math.sqrt(percentage) * 8  // 增加到8，让方块更大
      
      // 为不同成员分配不同的颜色
      const colors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
        '#10b981', '#06b6d4', '#6366f1', '#f97316',
        '#14b8a6', '#a855f7', '#ef4444', '#84cc16'
      ]
      // 使用成员在列表中的索引来分配颜色，确保每个成员颜色不同
      const memberIndex = this.memberWorktimes.findIndex(m => m.userId === member.userId)
      const colorIndex = memberIndex >= 0 ? memberIndex % colors.length : 0
      const backgroundColor = colors[colorIndex]
      
      return {
        flexBasis: `${Math.max(size, 18)}%`,  // 增加到18%，让方块更大
        flexGrow: percentage * 1.2,  // 增加增长系数，让大方块更大
        backgroundColor: backgroundColor,
        minHeight: `${Math.max(size * 2, 80)}px`  // 增加到80px，高度更大
      }
    },

    /**
     * 显示成员详情
     */
    showMemberDetail(member) {
      const totalWorktime = this.totalWorktime || 1
      const percentage = ((member.worktime / totalWorktime) * 100).toFixed(1)
      
      // 计算该成员的任务数量
      const taskCount = this.allTasks.filter(task => {
        const assigneeId = String(task.assigneeId || task.assignee?.id || '')
        const memberId = String(member.userId || '')
        return assigneeId === memberId
      }).length
      
      this.selectedMember = {
        name: member.name,
        worktime: member.worktime,
        percentage: percentage,
        taskCount: taskCount
      }
      this.memberDetailVisible = true
    },

    /**
     * 关闭成员详情弹窗
     */
    closeMemberDetail() {
      this.memberDetailVisible = false
    },

    /**
     * 切换成员视图（展开/收起）
     */
    toggleMemberView(member) {
      // 如果点击的是已选中的成员，则退出选中状态
      if (this.selectedMemberForView && this.selectedMemberForView.userId === member.userId) {
        this.selectedMemberForView = null
      } else {
        // 否则选中该成员
        this.selectedMemberForView = member
      }
    },

    /**
     * 获取角色标签
     */
    getRoleLabel(role) {
      const roleMap = {
        'OWNER': '项目拥有者',
        'ADMIN': '管理员',
        'MEMBER': '成员'
      }
      return roleMap[role] || '成员'
    },

    /**
     * 格式化日期显示
     * @param {String} dateStr - 日期字符串 (YYYY-MM-DD)
     * @returns {String} 格式化后的日期 (MM-DD)
     */
    formatDate(dateStr) {
      if (!dateStr) return ''
      try {
        const date = new Date(dateStr)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${month}-${day}`
      } catch (error) {
        // 如果日期格式不对，尝试直接处理字符串
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
          const parts = dateStr.split('-')
          if (parts.length >= 3) {
            return `${parts[1]}-${parts[2]}`
          }
        }
        return dateStr
      }
    },

    /**
     * 格式化日期时间
     * @param {String} dateTimeStr - 日期时间字符串
     * @returns {String} 格式化后的日期时间 (YYYY/MM/DD HH:mm)
     */
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return ''
      try {
        const date = new Date(dateTimeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}/${month}/${day} ${hours}:${minutes}`
      } catch (error) {
        return dateTimeStr
      }
    },

    /**
     * 跳转到任务详情
     */
    goToTaskDetail(task) {
      this.$router.push(`/project/${this.$route.params.id}/tasks/${task.id}`)
    },

    /**
     * 获取里程碑任务状态样式类
     */
    getMilestoneStatusClass(status) {
      const statusMap = {
        'DONE': 'done',
        '已完成': 'done',
        '完成': 'done',
        'IN_PROGRESS': 'processing',
        '进行中': 'processing',
        'PENDING_REVIEW': 'processing',
        '待审核': 'processing',
        'TODO': 'todo',
        '待接取': 'todo',
        '待办': 'todo'
      }
      return statusMap[status] || 'todo'
    },

    /**
     * 获取任务状态样式类
     */
    getTaskStatusClass(status) {
      const statusMap = {
        'TODO': 'status-pending-review',
        'IN_PROGRESS': 'status-doing',
        'BLOCKED': 'status-blocked',
        'DONE': 'status-done',
        'COMPLETED': 'status-done',
        'PENDING_REVIEW': 'status-pending-review'
      }
      return statusMap[status] || 'status-pending-review'
    },

    /**
     * 获取所有任务列表（优化版：先快速加载第一页，然后异步加载剩余）
     */
    async fetchAllTasks(quickMode = false) {
      const projectId = this.$route.params.id
      if (!projectId) {
        console.warn('[ProjectDashboard] 项目ID不存在')
        return []
      }

      try {
        const { taskAPI } = await import('@/api/task')
        
        let allTasks = []
        let page = 0
        const size = 100
        const maxQuickPages = 3 // 快速模式下最多加载3页
        let hasMore = true

        while (hasMore) {
          const response = await taskAPI.getProjectTasks(projectId, page, size)
          
          if (response && response.code === 200 && response.data) {
            const tasksData = response.data
            let taskList = []
            
            if (tasksData.content && Array.isArray(tasksData.content)) {
              taskList = tasksData.content
              const totalPages = tasksData.totalPages || 0
              hasMore = (page + 1) < totalPages
            } else if (Array.isArray(tasksData)) {
              taskList = tasksData
              hasMore = taskList.length === size
            } else {
              hasMore = false
            }
            
            allTasks = allTasks.concat(taskList)
            page++
            
            // 快速模式：只加载前几页
            if (quickMode && page >= maxQuickPages) {
              // 异步加载剩余任务
              this.fetchRemainingTasks(projectId, page, allTasks)
              hasMore = false
            } else if (taskList.length < size) {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        }

        return Array.isArray(allTasks) ? allTasks : []

      } catch (error) {
        console.error('[ProjectDashboard] 获取任务列表失败:', error)
        return []
      }
    },

    /**
     * 异步加载剩余任务（不阻塞页面显示）
     */
    async fetchRemainingTasks(projectId, startPage, existingTasks) {
      try {
        const { taskAPI } = await import('@/api/task')
        let allTasks = [...existingTasks]
        let page = startPage
        const size = 100
        let hasMore = true

        while (hasMore) {
          const response = await taskAPI.getProjectTasks(projectId, page, size)
          
          if (response && response.code === 200 && response.data) {
            const tasksData = response.data
            let taskList = []
            
            if (tasksData.content && Array.isArray(tasksData.content)) {
              taskList = tasksData.content
              const totalPages = tasksData.totalPages || 0
              hasMore = (page + 1) < totalPages
            } else if (Array.isArray(tasksData)) {
              taskList = tasksData
              hasMore = taskList.length === size
            } else {
              hasMore = false
            }
            
            allTasks = allTasks.concat(taskList)
            page++
            
            if (taskList.length < size) {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        }

        // 更新任务列表和统计数据
        this.allTasks = allTasks
        this.loadTaskStatistics(allTasks)
        this.loadMemberWorktimes(allTasks)
      } catch (error) {
        console.error('[ProjectDashboard] 加载剩余任务失败:', error)
      }
    },

    /**
     * 加载任务统计数据（优化版：接受任务列表参数）
     */
    async loadTaskStatistics(tasks = null) {
      try {
        // 如果没有传入任务列表，则重新获取
        const allTasks = tasks || await this.fetchAllTasks()
        
        // 保存完整任务列表用于后续悬浮展示
        if (!tasks) {
          this.allTasks = allTasks
        }

        // 计算统计数据
        this.calculateStatistics(allTasks)
        
        // 更新成员任务统计数据
        this.updateMemberTaskStats()

      } catch (error) {
        console.error('[ProjectDashboard] 加载任务统计数据失败:', error)
      }
    },

    /**
     * 计算统计数据
     */
    calculateStatistics(tasks) {
      if (!tasks || tasks.length === 0) {
        // 如果没有任务，重置为0
        this.kpis = {
          totalTasks: 0,
          completed: 0,
          completeRate: 0,
          delayed: 0,
          addedThisWeek: 0
        }
        this.dist = { pendingReview: 0, doing: 0, blocked: 0, done: 0 }
        this.statusCounts = { pendingReview: 0, doing: 0, blocked: 0, done: 0 }
        return
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // 计算本周的开始时间（周一）
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - daysToMonday)
      weekStart.setHours(0, 0, 0, 0)

      // 项目总任务数
      const totalTasks = tasks.length

      // 已完成数（状态为DONE）
      console.log('[ProjectDashboard] 所有任务状态:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })))
      
      const completedTasks = tasks.filter(task => {
        const status = task.status || task.status_value
        const isCompleted = status === 'DONE' || status === '已完成' || status === '完成' || status === 'COMPLETED' || status === 'PENDING_REVIEW' || status === '待审核'
        if (isCompleted) {
          console.log(`[ProjectDashboard] ✅ 已完成任务: ${task.id} - ${task.title} (状态: ${status})`)
        }
        return isCompleted
      })
      
      const completed = completedTasks.length
      console.log(`[ProjectDashboard] 统计结果: 总任务数=${tasks.length}, 已完成数=${completed}`)

      // 完成率
      const completeRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0

      // 延期任务数（超过dueDate且状态不是DONE）
      const delayed = tasks.filter(task => {
        const status = task.status || task.status_value
        if (status === 'DONE' || status === '已完成' || status === '完成' || status === 'COMPLETED' || status === 'PENDING_REVIEW' || status === '待审核') {
          return false // 已完成的任务不算延期
        }
        
        const dueDate = task.dueDate || task.due_date || task.date
        if (!dueDate) {
          return false // 没有截止日期的任务不算延期
        }
        
        const due = new Date(dueDate)
        due.setHours(0, 0, 0, 0)
        return due < today
      }).length

      // 本周新增任务数（createdAt在本周）
      const addedThisWeek = tasks.filter(task => {
        const createdAt = task.createdAt || task.created_at
        if (!createdAt) {
          return false
        }
        const created = new Date(createdAt)
        return created >= weekStart
      }).length

      // 更新KPI数据
      this.kpis = {
        totalTasks,
        completed,
        completeRate,
        delayed,
        addedThisWeek
      }

      // 计算任务状态分布
      const statusCounts = {
        pendingReview: 0,
        doing: 0,
        blocked: 0,
        done: 0
      }

      tasks.forEach(task => {
        const status = task.status || task.status_value || 'TODO'
        if (status === 'DONE' || status === '已完成' || status === '完成' || status === 'COMPLETED') {
          statusCounts.done++
        } else if (status === 'PENDING_REVIEW' || status === '待审核') {
          statusCounts.pendingReview++
        } else if (status === 'IN_PROGRESS' || status === '进行中') {
          statusCounts.doing++
        } else if (status === 'BLOCKED' || status === '阻塞') {
          statusCounts.blocked++
        } else {
          // 其他未知状态也归为待审核
          statusCounts.pendingReview++
        }
      })

      this.statusCounts = statusCounts

      // 计算百分比
      if (totalTasks > 0) {
        this.dist = {
          pendingReview: Math.round((statusCounts.pendingReview / totalTasks) * 100),
          doing: Math.round((statusCounts.doing / totalTasks) * 100),
          blocked: Math.round((statusCounts.blocked / totalTasks) * 100),
          done: Math.round((statusCounts.done / totalTasks) * 100)
        }
      } else {
        this.dist = { pendingReview: 0, doing: 0, blocked: 0, done: 0 }
        this.statusCounts = { pendingReview: 0, doing: 0, blocked: 0, done: 0 }
      }

      console.log('[ProjectDashboard] 统计数据:', {
        kpis: this.kpis,
        dist: this.dist
      })
    },

    /**
     * 加载成员工时数据（优化版：接受任务列表参数）
     */
    async loadMemberWorktimes(tasks = null) {
      const projectId = this.$route.params.id
      if (!projectId) {
        console.warn('[ProjectDashboard] 项目ID不存在，无法加载成员工时')
        return
      }

      try {
        // 1. 获取项目成员列表
        const { projectAPI } = await import('@/api/project')
        const membersResponse = await projectAPI.getProjectMembers(projectId, 0, 100)

        if (!membersResponse || membersResponse.code !== 200) {
          console.warn('[ProjectDashboard] 获取项目成员失败')
          return
        }

        let members = []
        if (membersResponse.data && membersResponse.data.content) {
          members = membersResponse.data.content
        } else if (Array.isArray(membersResponse.data)) {
          members = membersResponse.data
        }

        this.projectMembers = members

        if (members.length === 0) {
          console.warn('[ProjectDashboard] 项目没有成员')
          this.memberWorktimes = []
          this.updateAchievementOwners()
          return
        }

        console.log('[ProjectDashboard] 获取到项目成员:', members.length, '人')

        // 2. 使用传入的任务列表或重新获取
        const allTasks = tasks || await this.fetchAllTasks()
        console.log('[ProjectDashboard] 用于统计成员负载的任务数量:', allTasks.length)

        // 3. 调用工时接口，按提交人/成员汇总真实工时（使用与任务详情相同的接口）
        const memberWorktimeMap = new Map()

        // 初始化成员映射
        members.forEach(member => {
          const userId = String(member.userId || member.id || '')
          memberWorktimeMap.set(userId, {
            userId,
            name: member.username || member.name || '未知用户',
            worktime: 0
          })
        })

        const getSubmissionSubmitterId = (submission) => {
          if (!submission) return null
          if (submission.submitter && typeof submission.submitter === 'object') {
            const id = submission.submitter.userId || submission.submitter.id
            if (id || id === 0) return String(id)
          }
          const candidates = [
            submission.submitterId,
            submission.userId,
            submission.ownerId,
            submission.creatorId,
            submission.createdBy
          ]
          for (const id of candidates) {
            if (id || id === 0) return String(id)
          }
          return null
        }

        const getSubmissionSubmitterName = (submission, fallback = '未知用户') => {
          if (!submission) return fallback
          if (submission.submitter && typeof submission.submitter === 'object') {
            const submitter = submission.submitter
            const name = submitter.name || submitter.username || submitter.userName || submitter.nickname
            if (name && String(name).trim() !== '' && name !== '未知用户') {
              return String(name).trim()
            }
          }
          const directFields = [
            submission.submitterName,
            submission.submitter_name,
            submission.submitterUsername,
            submission.submitter_username
          ]
          for (const field of directFields) {
            if (field && String(field).trim() !== '' && field !== '未知用户') {
              return String(field).trim()
            }
          }
          return fallback
        }

        const ensureMemberEntry = (submitterId, submitterName) => {
          let key = null
          if (submitterId || submitterId === 0) {
            key = String(submitterId)
          }

          if (key && memberWorktimeMap.has(key)) {
            return key
          }

          // 如果通过ID没有匹配到成员，尝试用名字匹配项目成员
          let matchedMember = null
          if (submitterName) {
            matchedMember = members.find(m => {
              const nameCandidates = [m.username, m.name, m.realName, m.nickname]
              return nameCandidates.some(n => n && String(n).trim() === submitterName)
            })
          }

          if (matchedMember) {
            const memberId = String(matchedMember.userId || matchedMember.id || submitterId || submitterName)
            if (!memberWorktimeMap.has(memberId)) {
              memberWorktimeMap.set(memberId, {
                userId: memberId,
                name: matchedMember.username || matchedMember.name || submitterName || '未知用户',
                worktime: 0
              })
            }
            return memberId
          }

          // 仍然匹配不到，就按名字单独建一个虚拟成员
          const virtualKey = submitterName || key || 'unknown'
          if (!memberWorktimeMap.has(virtualKey)) {
            memberWorktimeMap.set(virtualKey, {
              userId: virtualKey,
              name: submitterName || '未知用户',
              worktime: 0
            })
          }
          return virtualKey
        }

        const parseSubmissionWorktime = (submission) => {
          if (!submission) return 0
          const candidates = [
            submission.actualWorktime,
            submission.actualWorkTime,
            submission.worktime,
            submission.workTime,
            submission.hours,
            submission.duration
          ]
          for (const value of candidates) {
            if (value === null || value === undefined || value === '') continue
            // 统一转成字符串再提取数字，兼容例如 "50", "50.5", "50 小时"
            const str = String(value)
            const match = str.match(/[-+]?[0-9]*\.?[0-9]+/)
            if (!match) continue
            const num = Number(match[0])
            if (!Number.isNaN(num) && Number.isFinite(num) && num > 0) {
              return num
            }
          }
          return 0
        }

        for (const task of allTasks) {
          const taskId = task && task.id
          if (!taskId) continue
          try {
            const response = await getLatestSubmission(taskId)
            if (response && response.code === 200 && response.data) {
              const submission = response.data
              const numericWorktime = parseSubmissionWorktime(submission)
              console.log('[ProjectDashboard] latest worktime submission for task', taskId, '=>', submission, 'parsedWorktime=', numericWorktime)
              if (numericWorktime <= 0) {
                continue
              }

              // 获取任务的所有参与人员（assignees）
              const assignees = task.assignees || []
              
              if (assignees.length > 0) {
                // 将工时分配给任务的所有参与人员
                // 每个参与人员都获得完整的工时（因为他们都参与了这个任务）
                assignees.forEach(assignee => {
                  const assigneeName = assignee.userName || assignee.username || assignee.name || '未知成员'
                  const assigneeId = assignee.userId || assignee.id
                  const key = ensureMemberEntry(assigneeId, assigneeName)
                  const item = memberWorktimeMap.get(key)
                  if (item) {
                    item.worktime += numericWorktime
                    console.log('[ProjectDashboard] 工时分配给参与人员:', assigneeName, '+', numericWorktime, 'h')
                  }
                })
              } else {
                // 如果没有assignees，回退到提交者
                const submitterName = getSubmissionSubmitterName(submission)
                const submitterId = getSubmissionSubmitterId(submission)
                const key = ensureMemberEntry(submitterId, submitterName)
                const item = memberWorktimeMap.get(key)
                item.worktime += numericWorktime
              }
            } else {
              console.log('[ProjectDashboard] 最新工时接口无数据或返回非200, taskId=', taskId, 'resp=', response)
            }
          } catch (error) {
            console.warn(`[ProjectDashboard] 获取任务${taskId}最新工时失败:`, error)
          }
        }

        // 4. 转换为数组并计算高度百分比（显示所有成员，包括没有工时的）
        const worktimeArray = Array.from(memberWorktimeMap.values())
        
        // 计算最大工时作为100%基准（只考虑有工时的成员）
        const membersWithWorktime = worktimeArray.filter(m => m.worktime > 0)
        const maxWorktime = membersWithWorktime.length > 0 
          ? Math.max(...membersWithWorktime.map(m => m.worktime))
          : 1

        // 计算每个成员的柱状图高度百分比
        this.memberWorktimes = worktimeArray.map(member => {
          let heightPercent = 0
          if (member.worktime > 0 && maxWorktime > 0) {
            heightPercent = (member.worktime / maxWorktime) * 100
            // 确保最小高度至少是25%，让柱状图更明显
            if (heightPercent < 25) {
              heightPercent = 25
            }
          }
          return {
            ...member,
            worktime: Number(member.worktime.toFixed(2)), // 保留2位小数
            heightPercent: heightPercent
          }
        }).sort((a, b) => {
          // 有工时的排在前面，按工时降序；没有工时的排在后面
          if (a.worktime > 0 && b.worktime > 0) {
            return b.worktime - a.worktime
          } else if (a.worktime > 0) {
            return -1
          } else if (b.worktime > 0) {
            return 1
          } else {
            return 0
          }
        })

        console.log('[ProjectDashboard] 成员工时数据加载完成:', {
          total: this.memberWorktimes.length,
          withWorktime: this.memberWorktimes.filter(m => m.worktime > 0).length,
          withoutWorktime: this.memberWorktimes.filter(m => m.worktime === 0).length,
          data: this.memberWorktimes.map(m => ({
            name: m.name,
            worktime: m.worktime,
            heightPercent: m.heightPercent
          }))
        })
        // 成员列表准备好后，再次尝试解析成果负责人
        this.updateAchievementOwners()

      } catch (error) {
        console.error('[ProjectDashboard] 加载成员工时数据失败:', error)
        this.memberWorktimes = []
        // 即便失败也尝试刷新，以防有部分成员数据
        this.updateAchievementOwners()
      }
    },

    /**
     * 加载近30天完成趋势数据
     */
    async loadCompletionTrend() {
      const projectId = this.$route.params.id
      if (!projectId) {
        console.warn('[ProjectDashboard] 项目ID不存在，无法加载完成趋势')
        return
      }

      try {
        const normalizeStatus = (value) => {
          if (!value && value !== 0) return ''
          if (typeof value === 'string') return value.toUpperCase()
          if (typeof value === 'object' && value.name) return String(value.name).toUpperCase()
          return String(value).toUpperCase()
        }

        const toLocalDateStr = (dateInput) => {
          if (!dateInput) return null
          const date = new Date(dateInput)
          if (Number.isNaN(date.getTime())) {
            return null
          }
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }

        const getTaskFallbackDate = (task) => {
          if (!task) return null
          const candidates = [
            task.completedAt,
            task.completed_at,
            task.completedDate,
            task.doneAt,
            task.done_at,
            task.finishAt,
            task.finish_at,
            task.finishTime,
            task.endTime,
            task.updatedAt,
            task.updated_at
          ]
          for (const candidate of candidates) {
            const dateStr = toLocalDateStr(candidate)
            if (dateStr) {
              return dateStr
            }
          }
          return null
        }

        // 1. 获取项目中所有状态为DONE的任务（按项目统计，不区分用户）
        const { taskAPI } = await import('@/api/task')
        let allDoneTasks = []
        let page = 0
        const size = 100
        let hasMore = true

        // 直接按状态查询DONE任务，更高效
        while (hasMore) {
          try {
            // 使用按状态查询接口，直接获取DONE状态的任务
            const response = await taskAPI.getProjectTasks(projectId, page, size)
            if (response && response.code === 200 && response.data) {
              const tasksData = response.data
              let taskList = []
              
              if (tasksData.content && Array.isArray(tasksData.content)) {
                taskList = tasksData.content
                const totalPages = tasksData.totalPages || 0
                hasMore = (page + 1) < totalPages
              } else if (Array.isArray(tasksData)) {
                taskList = tasksData
                hasMore = taskList.length === size
              } else {
                hasMore = false
              }
              
              // 筛选出状态为DONE/已完成/完成/待审核的任务（按项目统计，不区分用户）
              const doneTasks = taskList.filter(task => {
                const status = normalizeStatus(task.status)
                const doneStatuses = new Set(['DONE', 'COMPLETED', 'FINISHED'])
                const pendingStatuses = new Set(['PENDING_REVIEW', 'PENDING'])
                return doneStatuses.has(status) ||
                  pendingStatuses.has(status) ||
                  task.status === '已完成' ||
                  task.status === '完成' ||
                  task.status === '待审核'
              })
              allDoneTasks = allDoneTasks.concat(doneTasks)
              
              console.log(`[ProjectDashboard] 第${page + 1}页: 获取${taskList.length}个任务, 其中${doneTasks.length}个是DONE状态`)
              
              page++
              if (taskList.length < size) {
                hasMore = false
              }
            } else {
              hasMore = false
            }
          } catch (error) {
            console.error(`[ProjectDashboard] 获取第${page + 1}页任务失败:`, error)
            hasMore = false
          }
        }

        console.log('[ProjectDashboard] 获取到已完成任务:', allDoneTasks.length, '个')
        console.log('[ProjectDashboard] 已完成任务列表:', allDoneTasks.map(t => ({ id: t.id, title: t.title, status: t.status })))

        // 2. 对于每个任务，获取其提交记录，找到最后一次审核通过的记录
        // 重要：只有提交后被审核通过的任务才算完成的任务
        const completionDates = [] // 存储所有任务的完成日期（审核通过时间）
        const skippedTasks = [] // 记录被跳过的任务

        for (const task of allDoneTasks) {
          try {
            console.log(`[ProjectDashboard] 处理任务${task.id}(${task.title})...`)
            
            // 获取任务的所有提交记录（使用与任务详情相同的提交接口）
            const submissionsResponse = await getTaskSubmissions(task.id)
            if (submissionsResponse && submissionsResponse.code === 200 && submissionsResponse.data) {
              const submissions = Array.isArray(submissionsResponse.data) 
                ? submissionsResponse.data 
                : []
              
              console.log(`[ProjectDashboard] 任务${task.id}(${task.title}) 提交记录数: ${submissions.length}`)
              
              // 找到所有审核通过的记录（reviewStatus === 'APPROVED'）
              const approvedSubmissions = submissions.filter(sub => {
                const reviewStatus = normalizeStatus(sub.reviewStatus)
                return reviewStatus === 'APPROVED' && sub.reviewTime
              })
              
              console.log(`[ProjectDashboard] 任务${task.id}(${task.title}) 审核通过记录数: ${approvedSubmissions.length}`)
              
              if (approvedSubmissions.length > 0) {
                // 按审核时间排序，取最新的（最后一次审核通过的时间）
                approvedSubmissions.sort((a, b) => {
                  const timeA = new Date(a.reviewTime).getTime()
                  const timeB = new Date(b.reviewTime).getTime()
                  return timeB - timeA
                })
                
                const latestApproved = approvedSubmissions[0]
                if (latestApproved.reviewTime) {
                  const localDateStr = toLocalDateStr(latestApproved.reviewTime)
                  
                  if (localDateStr) {
                    completionDates.push({
                      date: localDateStr,
                      taskId: task.id,
                      taskTitle: task.title,
                      reviewTime: latestApproved.reviewTime
                    })
                    
                    console.log(`[ProjectDashboard] ✅ 任务${task.id}(${task.title}) 审核通过时间: ${latestApproved.reviewTime}, 本地日期: ${localDateStr}`)
                    continue
                  }
                }
              }

              // ⚠️ 没有审核通过记录时的备用逻辑
              const fallbackSubmission = submissions
                .filter(sub => sub.reviewTime || sub.submissionTime)
                .sort((a, b) => {
                  const timeA = new Date(a.reviewTime || a.submissionTime || 0).getTime()
                  const timeB = new Date(b.reviewTime || b.submissionTime || 0).getTime()
                  return timeB - timeA
                })[0]

              if (fallbackSubmission) {
                const fallbackDate = toLocalDateStr(fallbackSubmission.reviewTime || fallbackSubmission.submissionTime)
                if (fallbackDate) {
                  const fallbackStatus = normalizeStatus(fallbackSubmission.reviewStatus)
                  completionDates.push({
                    date: fallbackDate,
                    taskId: task.id,
                    taskTitle: task.title,
                    reviewTime: fallbackSubmission.reviewTime || null,
                    submissionTime: fallbackSubmission.submissionTime || null,
                    reviewStatus: fallbackStatus || 'UNKNOWN',
                    isPending: fallbackStatus !== 'APPROVED'
                  })
                  console.warn(`[ProjectDashboard] ⚠️ 任务${task.id}(${task.title}) 没有审核通过记录，使用${fallbackSubmission.reviewTime ? '审核时间' : '提交时间'}作为完成时间，状态=${fallbackStatus || 'N/A'}`)
                  continue
                }
              }

              const fallbackTaskDate = getTaskFallbackDate(task)
              if (fallbackTaskDate) {
                completionDates.push({
                  date: fallbackTaskDate,
                  taskId: task.id,
                  taskTitle: task.title,
                  reviewTime: task.updatedAt || task.updated_at || null,
                  fromTaskMeta: true
                })
                console.warn(`[ProjectDashboard] ⚠️ 任务${task.id}(${task.title}) 使用任务元数据(${task.updatedAt || task.updated_at || 'unknown'})作为完成日期`)
                continue
              }

              const reason = submissions.length === 0 ? '没有提交记录' : '无法确定完成时间'
              skippedTasks.push({ taskId: task.id, taskTitle: task.title, reason })
              console.warn(`[ProjectDashboard] ⚠️ 任务${task.id}(${task.title}) 状态为DONE但${reason}，跳过统计`)
            } else {
              // 如果没有提交记录，这个任务不应该被统计
              skippedTasks.push({ taskId: task.id, taskTitle: task.title, reason: '无法获取提交记录' })
              console.warn(`[ProjectDashboard] ⚠️ 任务${task.id}(${task.title}) 状态为DONE但无法获取提交记录，跳过统计`)
            }
          } catch (error) {
            skippedTasks.push({ taskId: task.id, taskTitle: task.title, reason: `获取失败: ${error.message}` })
            console.warn(`[ProjectDashboard] ⚠️ 获取任务${task.id}的完成时间失败:`, error)
            // 如果获取失败，不统计这个任务（因为无法确认是否审核通过）
          }
        }
        
        console.log(`[ProjectDashboard] 统计结果: 找到${completionDates.length}个有审核通过记录的任务, 跳过${skippedTasks.length}个任务`)
        if (skippedTasks.length > 0) {
          console.warn('[ProjectDashboard] 被跳过的任务:', skippedTasks)
        }

        // 保存完成任务列表（用于鼠标悬停显示）
        // ✅ 只保存任务状态为"完成"（DONE）的任务，与已完成数统计保持一致
        this.completedTasks = completionDates
          .map(item => {
            const task = allDoneTasks.find(t => t.id === item.taskId)
            return {
              ...task,
              completionDate: item.date,
              reviewTime: item.reviewTime,
              reviewStatus: item.reviewStatus || 'APPROVED'
            }
          })
          .filter(task => {
            // ✅ 只保留状态为"完成"的任务（包括PENDING_REVIEW，因为这些任务实际已审核通过）
            const status = task.status || task.status_value
            const isCompleted = status === 'DONE' || status === '已完成' || status === '完成' || status === 'COMPLETED' || status === 'PENDING_REVIEW' || status === '待审核'
            if (!isCompleted) {
              console.log(`[ProjectDashboard] 任务 ${task.id}(${task.title}) 状态为"${status}"，不计入已完成任务`)
            }
            return isCompleted
          })
        console.log('[ProjectDashboard] 保存已完成任务列表:', this.completedTasks.length, '个（仅状态为"完成"的任务）')
        
        // 更新任务完成时间线散点图
        this.updateTaskCompletionTimeline()

        // 3. 计算近30天的日期范围（使用本地时区）
        const today = new Date()
        const todayYear = today.getFullYear()
        const todayMonth = today.getMonth()
        const todayDay = today.getDate()
        const todayLocal = new Date(todayYear, todayMonth, todayDay, 23, 59, 59, 999) // 今天的结束时间（本地时区）
        
        const thirtyDaysAgoLocal = new Date(todayYear, todayMonth, todayDay - 29, 0, 0, 0, 0) // 30天前（本地时区）

        // 4. 按日期分组统计（按项目日期统计，不区分用户）
        const dateCountMap = new Map()
        
        // 初始化30天的日期，每天计数为0（使用本地时区）
        for (let i = 0; i < 30; i++) {
          const date = new Date(thirtyDaysAgoLocal)
          date.setDate(date.getDate() + i)
          // 使用本地时区转换为日期字符串
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          dateCountMap.set(dateStr, 0)
        }

        // 统计每天完成的任务数量（按项目日期统计）
        console.log(`[ProjectDashboard] 开始统计，日期范围: ${thirtyDaysAgoLocal.toLocaleDateString()} 至 ${todayLocal.toLocaleDateString()}`)
        
        completionDates.forEach(item => {
          const dateStr = item.date // 已经是本地日期字符串 YYYY-MM-DD
          
          // 检查日期是否在近30天内（使用本地时区比较）
          const [year, month, day] = dateStr.split('-').map(Number)
          const itemDateLocal = new Date(year, month - 1, day, 0, 0, 0, 0)
          
          if (itemDateLocal >= thirtyDaysAgoLocal && itemDateLocal <= todayLocal) {
            const currentCount = dateCountMap.get(dateStr) || 0
            dateCountMap.set(dateStr, currentCount + 1)
            console.log(`[ProjectDashboard] ✅ 统计任务完成: 日期=${dateStr}, 任务ID=${item.taskId}, 任务标题=${item.taskTitle}, 当前该日期完成数=${currentCount + 1}`)
          } else {
            console.warn(`[ProjectDashboard] ⚠️ 任务${item.taskId}(${item.taskTitle}) 完成日期${dateStr}不在近30天内，跳过`)
          }
        })

        // 5. 转换为数组格式，按日期排序
        this.completionTrend = Array.from(dateCountMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))

        // 统计有数据的日期
        const datesWithData = this.completionTrend.filter(d => d.count > 0)
        const totalCount = datesWithData.reduce((sum, d) => sum + d.count, 0)
        
        console.log('[ProjectDashboard] 近30天完成趋势数据加载完成:', {
          totalDoneTasks: allDoneTasks.length,
          tasksWithApprovedSubmission: completionDates.length,
          skippedTasks: skippedTasks.length,
          totalCompletedIn30Days: totalCount,
          datesWithData: datesWithData.map(d => `${d.date}: ${d.count}个`),
          allTrendData: this.completionTrend
        })

        // 更新折线图
        this.lineKey = Date.now()

      } catch (error) {
        console.error('[ProjectDashboard] 加载完成趋势数据失败:', error)
        this.completionTrend = []
      }
    },

    /**
     * 加载成果统计数据
     */
    /**
     * 加载项目成员数据
     */
    async loadProjectMembers() {
      const projectId = this.$route.params.id
      if (!projectId) {
        this.projectMembers = []
        return
      }

      try {
        const { projectAPI } = await import('@/api/project')
        const response = await projectAPI.getProjectMembers(projectId, 0, 20)
        
        if (response && response.code === 200 && response.data) {
          const membersData = response.data
          let memberList = []
          
          // 处理分页数据
          if (membersData.content && Array.isArray(membersData.content)) {
            memberList = membersData.content
          } else if (Array.isArray(membersData)) {
            memberList = membersData
          }
          
          this.projectMembers = memberList
          console.log('[ProjectDashboard] 项目成员加载完成:', memberList.length, '人')
          console.log('[ProjectDashboard] 成员详情:', memberList.map(m => ({ id: m.id, name: m.name, userId: m.userId, nickname: m.nickname, username: m.username })))
          // 成员加载完成后，重新更新统计数据
          this.updateMemberTaskStats()
          this.updateMemberContributionData()
        } else {
          this.projectMembers = []
        }
      } catch (error) {
        console.error('[ProjectDashboard] 加载项目成员失败:', error)
        this.projectMembers = []
      }
    },

    /**
     * 加载任务提交记录
     */
    async loadTaskSubmissions() {
      const projectId = this.$route.params.id
      if (!projectId) {
        this.taskSubmissions = []
        return
      }

      try {
        // 获取所有任务的提交记录
        const allSubmissions = []
        
        // 遍历所有任务，获取每个任务的提交记录
        for (const task of this.allTasks) {
          if (task.id) {
            try {
              const response = await getTaskSubmissions(task.id)
              if (response && response.code === 200 && Array.isArray(response.data)) {
                // 为每个提交记录添加任务标题
                const submissions = response.data.map(sub => ({
                  ...sub,
                  taskTitle: task.title || task.name
                }))
                allSubmissions.push(...submissions)
              }
            } catch (error) {
              // 单个任务获取失败不影响其他任务
              console.warn(`[ProjectDashboard] 获取任务 ${task.id} 的提交记录失败:`, error)
            }
          }
        }
        
        // 按提交时间降序排序
        allSubmissions.sort((a, b) => {
          const timeA = new Date(a.submitTime || a.createdAt || 0).getTime()
          const timeB = new Date(b.submitTime || b.createdAt || 0).getTime()
          return timeB - timeA
        })
        
        // 只保留最近20条
        this.taskSubmissions = allSubmissions.slice(0, 20)
        
        console.log('[ProjectDashboard] 任务提交记录加载完成:', this.taskSubmissions.length, '条')
      } catch (error) {
        console.error('[ProjectDashboard] 加载任务提交记录失败:', error)
        this.taskSubmissions = []
      }
    },

    /**
     * 加载里程碑任务数据
     */
    async loadMilestoneTasks() {
      try {
        // 从所有任务中筛选出里程碑任务
        this.milestoneTasks = this.allTasks
          .filter(task => task.isMilestone === true)
          .map(task => ({
            id: task.id,
            title: task.title || task.name || '未命名任务',
            dueDate: task.dueDate || task.due_date || null,
            status: task.status,
            priority: task.priority,
            creatorName: task.creatorName || '未知',
            assignees: task.assignees || [],
            assigneeName: task.assigneeName || '',
            // 获取参与成员名称
            memberNames: this.getMilestoneMembers(task)
          }))
          .sort((a, b) => {
            // 按截止日期排序，无日期的排在后面
            if (!a.dueDate && !b.dueDate) return 0
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          })
        
        console.log('[ProjectDashboard] 里程碑任务加载完成:', this.milestoneTasks.length, '个')
        
        // 加载已提交的里程碑任务
        await this.loadMilestoneSubmissions()
      } catch (error) {
        console.error('[ProjectDashboard] 加载里程碑任务失败:', error)
        this.milestoneTasks = []
      }
    },

    /**
     * 获取里程碑任务的参与成员名称
     */
    getMilestoneMembers(task) {
      if (!task) return ''
      
      // 优先从 assignees 数组获取
      if (Array.isArray(task.assignees) && task.assignees.length > 0) {
        const names = task.assignees
          .map(a => a.userName || a.username || a.name || a.realName || a.nickname)
          .filter(n => n && n.trim())
        if (names.length > 0) {
          return names.join(', ')
        }
      }
      
      // 尝试其他字段
      if (task.assigneeName) return task.assigneeName
      if (task.creatorName) return task.creatorName
      
      return ''
    },

    /**
     * 加载已提交的里程碑任务
     */
    async loadMilestoneSubmissions() {
      try {
        const milestoneSubmissions = []
        
        // 遍历里程碑任务，获取每个任务的提交记录
        for (const task of this.milestoneTasks) {
          if (task.id) {
            try {
              const response = await getTaskSubmissions(task.id)
              if (response && response.code === 200 && Array.isArray(response.data) && response.data.length > 0) {
                // 获取最新的提交记录
                const submissions = response.data.sort((a, b) => {
                  const timeA = new Date(a.submitTime || a.createdAt || 0).getTime()
                  const timeB = new Date(b.submitTime || b.createdAt || 0).getTime()
                  return timeB - timeA
                })
                
                // 取最新的一条提交
                const latestSubmission = submissions[0]
                // 获取提交人名称，尝试多个字段
                const submitterName = this.getSubmitterName(latestSubmission, task)
                
                milestoneSubmissions.push({
                  taskId: task.id,
                  taskTitle: task.title,
                  submitterName: submitterName,
                  submitTime: latestSubmission.submitTime || latestSubmission.createdAt,
                  reviewStatus: latestSubmission.reviewStatus || 'PENDING',
                  worktime: latestSubmission.worktime || 0
                })
              }
            } catch (error) {
              console.warn(`[ProjectDashboard] 获取里程碑任务 ${task.id} 的提交记录失败:`, error)
            }
          }
        }
        
        // 按提交时间降序排序
        milestoneSubmissions.sort((a, b) => {
          const timeA = new Date(a.submitTime || 0).getTime()
          const timeB = new Date(b.submitTime || 0).getTime()
          return timeB - timeA
        })
        
        this.milestoneSubmissions = milestoneSubmissions
        console.log('[ProjectDashboard] 已提交的里程碑任务加载完成:', this.milestoneSubmissions.length, '个')
      } catch (error) {
        console.error('[ProjectDashboard] 加载已提交的里程碑任务失败:', error)
        this.milestoneSubmissions = []
      }
    },

    /**
     * 获取提交人名称
     */
    getSubmitterName(submission, task) {
      console.log('[ProjectDashboard] 获取提交人名称，提交记录:', submission)
      
      // 1. 优先从 submitter 对象获取（后端返回的是 UserDTO 对象）
      if (submission.submitter && typeof submission.submitter === 'object') {
        const s = submission.submitter
        const name = s.name || s.userName || s.username || s.realName || s.nickname
        if (name) {
          console.log('[ProjectDashboard] 从submitter对象获取到名称:', name)
          return name
        }
      }
      
      // 2. 尝试从提交记录的直接字段获取
      if (submission.submitterName && submission.submitterName !== '未知') {
        return submission.submitterName
      }
      if (submission.userName) return submission.userName
      if (submission.username) return submission.username
      if (submission.name) return submission.name
      
      // 3. 尝试从用户对象获取
      if (submission.user && typeof submission.user === 'object') {
        const u = submission.user
        const name = u.name || u.userName || u.username || u.realName || u.nickname
        if (name) return name
      }
      
      // 4. 尝试从项目成员中根据提交者ID查找
      if (submission.submitterId && this.projectMembers.length > 0) {
        const member = this.projectMembers.find(m => 
          String(m.id) === String(submission.submitterId) ||
          String(m.userId) === String(submission.submitterId)
        )
        if (member) {
          return member.name || member.username || member.nickname || member.realName
        }
      }
      
      // 5. 尝试从userId查找
      if (submission.userId && this.projectMembers.length > 0) {
        const member = this.projectMembers.find(m => 
          String(m.id) === String(submission.userId) ||
          String(m.userId) === String(submission.userId)
        )
        if (member) {
          return member.name || member.username || member.nickname || member.realName
        }
      }
      
      console.log('[ProjectDashboard] 未能获取到提交人名称')
      return '未知'
    },

    async loadAchievements() {
      const projectId = this.$route.params.id
      if (!projectId) {
        // 项目ID不存在时，静默处理，不显示错误
        this.achievements = []
        return
      }

      try {
        // 导入知识库API
        const { knowledgeAPI } = await import('@/api/knowledge')
        
        // 获取项目的成果列表（获取前10条，按更新时间降序）
        const response = await knowledgeAPI.getProjectAchievements(projectId, 0, 10)
        
        // 只处理成功响应（code === 200 且有数据）
        if (response && response.code === 200 && response.data) {
          const achievementsData = response.data
          let achievementList = []
          
          // 处理分页数据
          if (achievementsData.content && Array.isArray(achievementsData.content)) {
            achievementList = achievementsData.content
          } else if (Array.isArray(achievementsData)) {
            achievementList = achievementsData
          }
          
          this.achievements = achievementList
          
          // 只在有数据时输出日志
          if (achievementList.length > 0) {
            console.log('[ProjectDashboard] 成果数据加载完成:', {
              total: achievementList.length,
              achievements: achievementList.map(a => ({
                id: a.id,
                title: a.title,
                type: a.typeName || a.type,
                status: a.status,
                creator: a.creatorName
              }))
            })
          }
          // 解析负责人姓名
          this.updateAchievementOwners()
          // 更新成员贡献数据
          this.updateMemberContributionData()
        } else {
          // 响应失败或没有数据时，静默处理，设置为空数组
          // 不输出错误日志，避免干扰用户体验
          this.achievements = []
        }
      } catch (error) {
        // 捕获所有错误（包括网络错误、后端错误等），静默处理
        // 不输出错误日志，避免干扰用户体验
        this.achievements = []
        this.updateAchievementOwners()
      }
    },

    /**
     * 加载Wiki统计数据
     */
    async loadWikiStatistics() {
      const projectId = this.$route.params.id
      if (!projectId) {
        this.wikiStatistics = null
        this.totalWikiCount = 0
        return
      }

      try {
        const { wikiPageAPI } = await import('@/api/wiki')
        
        // 获取Wiki树结构，从中统计每个成员的贡献
        const treeResponse = await wikiPageAPI.getProjectWikiTree(projectId)
        
        if (treeResponse && treeResponse.code === 200 && treeResponse.data) {
          const wikiTree = treeResponse.data
          
          // 统计每个成员的Wiki文档数量
          const memberWikiCount = new Map()
          let totalCount = 0
          
          // 构建成员ID到名称的映射
          const memberIdToName = new Map()
          if (Array.isArray(this.projectMembers)) {
            this.projectMembers.forEach(m => {
              const id = String(m.userId || m.id)
              const name = m.nickname || m.username || m.name
              if (id && name) {
                memberIdToName.set(id, name)
              }
            })
          }
          
          // 递归遍历Wiki树，只统计文档类型的页面
          const countWikiByCreator = (pages) => {
            if (!Array.isArray(pages)) return
            
            pages.forEach(page => {
              const pageType = page.pageType || page.type || ''
              // 判断是否为文档：pageType为DOCUMENT，或者没有子节点
              const hasChildren = page.children && Array.isArray(page.children) && page.children.length > 0
              const isDocument = pageType === 'DOCUMENT' || pageType === 'document' || !hasChildren
              
              // 只统计文档类型，不统计目录/节点
              if (isDocument) {
                totalCount++
                
                // 获取创建者ID和名称
                const creatorId = String(page.creatorId || page.createdBy || page.authorId || '')
                const creatorName = page.creatorName || page.createdByName || page.authorName || null
                
                let memberName = null
                
                // 优先使用创建者名称
                if (creatorName && creatorName !== '未知') {
                  memberName = creatorName
                } else if (creatorId && creatorId !== '' && creatorId !== 'undefined') {
                  // 从成员映射中查找
                  memberName = memberIdToName.get(creatorId)
                }
                
                if (memberName && memberName !== '未知') {
                  memberWikiCount.set(memberName, (memberWikiCount.get(memberName) || 0) + 1)
                }
              }
              
              // 递归处理子页面
              if (hasChildren) {
                countWikiByCreator(page.children)
              }
            })
          }
          
          // 处理树结构
          if (Array.isArray(wikiTree)) {
            countWikiByCreator(wikiTree)
          } else if (wikiTree.children) {
            countWikiByCreator(wikiTree.children)
          } else if (wikiTree.pages) {
            countWikiByCreator(wikiTree.pages)
          }
          
          // 保存统计结果
          this.wikiStatistics = {
            totalPages: totalCount,
            memberStats: Array.from(memberWikiCount.entries()).map(([name, count]) => ({
              memberName: name,
              documentCount: count
            }))
          }
          this.totalWikiCount = totalCount
          
          // 更新成员贡献数据
          this.updateMemberContributionData()
        } else {
          this.wikiStatistics = null
          this.totalWikiCount = 0
          this.updateMemberContributionData()
        }
      } catch (error) {
        console.warn('[ProjectDashboard] 加载Wiki统计数据失败:', error)
        this.wikiStatistics = null
        this.totalWikiCount = 0
        // 即使Wiki加载失败，也尝试更新成员贡献数据（只显示成果数据）
        this.updateMemberContributionData()
      }
    },

    /**
     * 更新成员贡献数据（合并Wiki和成果数据）
     */
    updateMemberContributionData() {
      const memberMap = new Map()
      
      // 1）先根据成果统计每个成员的成果数量
      if (Array.isArray(this.achievements) && this.achievements.length > 0) {
        this.achievements.forEach(achievement => {
          // 优先使用负责人姓名，与左侧列表保持一致
          let memberName = achievement.responsibleName || achievement.creatorName || achievement.ownerName || null
          
          // 将 "未知" 或空字符串视为无效姓名
          if (memberName === '未知' || (typeof memberName === 'string' && memberName.trim() === '')) {
            memberName = null
          }
          
          // 如果没有有效姓名，尝试通过成员ID在项目成员列表中反查
          if (!memberName) {
            const memberId = achievement.creatorId || achievement.responsibleId
            if (memberId && Array.isArray(this.projectMembers) && this.projectMembers.length > 0) {
              const member = this.projectMembers.find(m => 
                String(m.userId) === String(memberId) || 
                String(m.id) === String(memberId) ||
                String(m.user?.id) === String(memberId)
              )
              if (member) {
                memberName = member.nickname || member.username || member.name || member.realName || member.user?.nickname || member.user?.username
              }
            }
          }
          
          if (!memberName) {
            return
          }
          
          if (!memberMap.has(memberName)) {
            memberMap.set(memberName, { name: memberName, wikiCount: 0, achievementCount: 0 })
          }
          memberMap.get(memberName).achievementCount++
        })
      }
      
      // 2）合并 Wiki 统计的真实数据
      if (this.wikiStatistics && Array.isArray(this.wikiStatistics.memberStats) && this.wikiStatistics.memberStats.length > 0) {
        this.wikiStatistics.memberStats.forEach(stat => {
          const memberName = stat.memberName || stat.name
          const wikiCount = stat.documentCount || stat.count || 0
          if (memberName && wikiCount > 0) {
            if (!memberMap.has(memberName)) {
              memberMap.set(memberName, { name: memberName, wikiCount: 0, achievementCount: 0 })
            }
            memberMap.get(memberName).wikiCount = wikiCount
          }
        })
      }
      
      // 3）只展示真实数据（wikiCount 或 achievementCount 至少一个 > 0），按总贡献排序
      this.memberContributionData = Array.from(memberMap.values())
        .filter(m => m.name && (m.achievementCount > 0 || m.wikiCount > 0))
        .sort((a, b) => (b.wikiCount + b.achievementCount) - (a.wikiCount + a.achievementCount))
        .slice(0, 8) // 最多显示8个成员
    },

    /**
     * 获取成员在贡献图中的X坐标（用于面积图X轴布局）
     */
    getContributionX(index) {
      const data = this.memberContributionData
      if (!data || data.length === 0) return 50
      
      const chartLeft = 60
      const chartRight = 370
      const chartWidth = chartRight - chartLeft
      
      if (data.length === 1) {
        return chartLeft + chartWidth / 2
      }
      
      return chartLeft + (index / (data.length - 1)) * chartWidth
    },

    /**
     * 截断成员名称（用于X轴显示）
     */
    truncateName(name) {
      if (!name) return ''
      return name.length > 4 ? name.substring(0, 4) + '..' : name
    },

    /**
     * 获取提交记录的颜色（用于时间线）
     */
    getSubmissionColor(index) {
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']
      return colors[index % colors.length]
    },

    /**
     * 获取成员柱状图的X坐标（居中显示，紧密连接）
     */
    getMemberBarX(index) {
      const chartWidth = 610 // 可用宽度 (655 - 45)
      const memberCount = this.memberTaskStats.length
      const totalBarsWidth = memberCount * this.barWidth // 无间距，紧密连接
      const startX = 45 + (chartWidth - totalBarsWidth) / 2 // 居中起始位置
      return startX + index * this.barWidth
    },

    /**
     * 获取柱状图高度
     */
    getMemberBarHeight(value) {
      if (!value || this.maxMemberTaskCount === 0) return 0
      const maxHeight = 105 // 最大高度105px (120 - 15)
      return (value / this.maxMemberTaskCount) * maxHeight
    },

    /**
     * 获取柱状图高度（缩小版）
     */
    getMemberBarHeightSmall(value) {
      if (!value || this.maxMemberTaskCount === 0) return 0
      const maxHeight = 75 // 最大高度75px (85 - 10)
      return (value / this.maxMemberTaskCount) * maxHeight
    },

    /**
     * 截断成员名称（用于双向柱状图X轴显示）
     */
    truncateMemberName(name) {
      if (!name) return ''
      return name.length > 5 ? name.substring(0, 5) + '..' : name
    },

    /**
     * 获取成员颜色（用于头像背景）
     */
    getMemberColor(index) {
      const colors = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
        '#10b981', '#06b6d4', '#6366f1', '#f97316',
        '#14b8a6', '#a855f7', '#ef4444', '#84cc16'
      ]
      return colors[index % colors.length]
    },

    /**
     * 计算成员完成率
     */
    getCompletionRate(member) {
      if (!member.totalTasks || member.totalTasks === 0) return 0
      return Math.round((member.completedTasks / member.totalTasks) * 100)
    },

    /**
     * 获取完成率的样式类
     */
    getCompletionRateClass(member) {
      const rate = this.getCompletionRate(member)
      if (rate >= 80) return 'rate-high'
      if (rate >= 50) return 'rate-medium'
      return 'rate-low'
    },

    /**
     * 显示成员任务统计tooltip
     */
    showMemberTaskTooltip(event, member, type) {
      this.memberTaskHoverType = type
      const tooltipHeight = 70 // tooltip 大约高度
      const tooltipWidth = 160 // tooltip 大约宽度
      let x = event.clientX + 15
      let y = event.clientY - tooltipHeight / 2
      // 如果 tooltip 会超出视口右侧，则显示在鼠标左侧
      if (x + tooltipWidth > window.innerWidth) {
        x = event.clientX - tooltipWidth - 15
      }
      // 如果 tooltip 会超出视口顶部，则调整到视口内
      if (y < 10) {
        y = 10
      }
      // 如果 tooltip 会超出视口底部，则调整到视口内
      if (y + tooltipHeight > window.innerHeight - 10) {
        y = window.innerHeight - tooltipHeight - 10
      }
      this.memberTaskTooltip = {
        show: true,
        x: x,
        y: y,
        name: member.name,
        label: type === 'total' ? '参与任务数' : '已完成任务数',
        value: type === 'total' ? member.totalTasks : member.completedTasks
      }
    },

    /**
     * 更新成员任务统计tooltip位置
     */
    updateMemberTaskTooltip(event) {
      if (!this.memberTaskTooltip.show) return
      const tooltipHeight = 70 // tooltip 大约高度
      const tooltipWidth = 160 // tooltip 大约宽度
      let x = event.clientX + 15
      let y = event.clientY - tooltipHeight / 2
      // 如果 tooltip 会超出视口右侧，则显示在鼠标左侧
      if (x + tooltipWidth > window.innerWidth) {
        x = event.clientX - tooltipWidth - 15
      }
      // 如果 tooltip 会超出视口顶部，则调整到视口内
      if (y < 10) {
        y = 10
      }
      // 如果 tooltip 会超出视口底部，则调整到视口内
      if (y + tooltipHeight > window.innerHeight - 10) {
        y = window.innerHeight - tooltipHeight - 10
      }
      this.memberTaskTooltip.x = x
      this.memberTaskTooltip.y = y
    },

    /**
     * 隐藏成员任务统计tooltip
     */
    hideMemberTaskTooltip() {
      this.memberTaskTooltip.show = false
      this.memberTaskHoverType = null
    },

    /**
     * 获取气泡随机半径（基于索引生成伪随机大小）
     */
    getBubbleRadius(index, point) {
      // 使用索引和任务ID生成伪随机数，确保每次渲染结果一致
      const seed = index * 17 + (point.taskId ? parseInt(point.taskId.slice(-4), 16) || 0 : 0)
      const random = ((seed * 9301 + 49297) % 233280) / 233280 // 伪随机数 0-1
      // 半径范围：8-22px，随机分布
      return 8 + random * 14
    },

    /**
     * 获取气泡X方向偏移（避免同一位置的气泡重叠）
     */
    getBubbleOffsetX(index, point) {
      // 统计同一成员同一日期的气泡数量和当前索引
      const samePositionBubbles = this.taskCompletionTimeline.filter(
        (p, i) => i < index && p.memberIndex === point.memberIndex && p.completedDate === point.completedDate
      )
      const positionIndex = samePositionBubbles.length
      
      // 根据位置索引计算偏移，形成更分散的分布
      const offsetPatterns = [0, -60, 60, -30, 30, -80, 80, -45, 45]
      return offsetPatterns[positionIndex % offsetPatterns.length]
    },

    /**
     * 获取气泡Y方向偏移（避免同一位置的气泡重叠）
     */
    getBubbleOffsetY(index, point) {
      // 统计同一成员同一日期的气泡数量和当前索引
      const samePositionBubbles = this.taskCompletionTimeline.filter(
        (p, i) => i < index && p.memberIndex === point.memberIndex && p.completedDate === point.completedDate
      )
      const positionIndex = samePositionBubbles.length
      
      // 根据位置索引计算偏移，交错分布
      const offsetPatterns = [0, -20, 20, -10, 10, -15, 15, -5, 5]
      return offsetPatterns[positionIndex % offsetPatterns.length]
    },

    /**
     * 获取时间线成员X坐标
     */
    getTimelineMemberX(index) {
      const chartWidth = 620 // 可用宽度 (680 - 60)
      const memberCount = this.timelineMemberNames.length
      if (memberCount === 0) return 60
      const gap = chartWidth / (memberCount + 1)
      return 60 + gap * (index + 1)
    },

    /**
     * 获取时间线日期Y坐标（早的日期在下面，晚的日期在上面）
     */
    getTimelineDateY(dateStr) {
      if (!this.timelineDateRange.min || !this.timelineDateRange.max) return 75
      const date = new Date(dateStr)
      const minDate = new Date(this.timelineDateRange.min)
      const maxDate = new Date(this.timelineDateRange.max)
      const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24))
      const dayOffset = (date - minDate) / (1000 * 60 * 60 * 24)
      // Y轴从123到35，早的日期在下面（123），晚的日期在上面（35）
      return 123 - (dayOffset / totalDays) * 88
    },

    /**
     * 显示时间线tooltip
     */
    showTimelineTooltip(event, point) {
      const rect = event.target.closest('.task-timeline-scatter').getBoundingClientRect()
      this.timelineTooltip = {
        show: true,
        x: event.clientX - rect.left + 15,
        y: event.clientY - rect.top - 70,
        memberName: point.memberName,
        taskTitle: point.taskTitle,
        completedDate: point.completedDate
      }
    },

    /**
     * 更新时间线tooltip位置
     */
    updateTimelineTooltip(event) {
      if (!this.timelineTooltip.show) return
      const rect = event.target.closest('.task-timeline-scatter').getBoundingClientRect()
      this.timelineTooltip.x = event.clientX - rect.left + 15
      this.timelineTooltip.y = event.clientY - rect.top - 70
    },

    /**
     * 隐藏时间线tooltip
     */
    hideTimelineTooltip() {
      this.timelineTooltip.show = false
    },

    /**
     * 更新任务完成时间线数据
     */
    updateTaskCompletionTimeline() {
      console.log('[ProjectDashboard] 开始更新任务完成时间线')
      
      if (!this.completedTasks || this.completedTasks.length === 0) {
        this.taskCompletionTimeline = []
        this.timelineMemberNames = []
        console.log('[ProjectDashboard] 没有已完成任务数据')
        return
      }

      const memberIndexMap = new Map()
      const timelineData = []
      let minDate = null
      let maxDate = null

      // 遍历已完成任务，为每个任务的所有参与人员创建数据点
      this.completedTasks.forEach(task => {
        // 获取完成日期
        let completedDate = task.completedAt || task.completionDate || task.updatedAt || task.createdAt
        if (!completedDate) return
        
        // 格式化日期
        const dateObj = new Date(completedDate)
        if (isNaN(dateObj.getTime())) return
        
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        
        // 更新日期范围
        if (!minDate || dateObj < minDate) minDate = dateObj
        if (!maxDate || dateObj > maxDate) maxDate = dateObj

        // 获取任务的所有参与人员
        const assignees = task.assignees || []
        
        if (assignees.length > 0) {
          // 为每个参与人员创建数据点
          assignees.forEach(assignee => {
            const memberName = assignee.userName || assignee.username || assignee.name || '未知成员'
            
            // 记录成员索引
            if (!memberIndexMap.has(memberName)) {
              memberIndexMap.set(memberName, memberIndexMap.size)
            }
            
            timelineData.push({
              memberName,
              memberIndex: memberIndexMap.get(memberName),
              taskTitle: task.title || '未命名任务',
              taskId: task.id,
              completedDate: dateStr,
              taskCount: 1
            })
          })
        } else {
          // 如果没有assignees，尝试使用其他字段
          const memberName = task.assigneeName || task.creatorName || '未知成员'
          
          if (!memberIndexMap.has(memberName)) {
            memberIndexMap.set(memberName, memberIndexMap.size)
          }
          
          timelineData.push({
            memberName,
            memberIndex: memberIndexMap.get(memberName),
            taskTitle: task.title || '未命名任务',
            taskId: task.id,
            completedDate: dateStr,
            taskCount: 1
          })
        }
      })

      // 设置日期范围（如果只有一天，扩展范围）
      if (minDate && maxDate) {
        if (minDate.getTime() === maxDate.getTime()) {
          minDate = new Date(minDate)
          minDate.setDate(minDate.getDate() - 3)
          maxDate = new Date(maxDate)
          maxDate.setDate(maxDate.getDate() + 3)
        }
        this.timelineDateRange = { min: minDate, max: maxDate }
      }

      // 更新成员名称列表
      this.timelineMemberNames = Array.from(memberIndexMap.keys())
      
      // 更新时间线数据（重新计算memberIndex）
      this.taskCompletionTimeline = timelineData.map(point => ({
        ...point,
        memberIndex: memberIndexMap.get(point.memberName)
      }))

      console.log('[ProjectDashboard] 任务完成时间线更新完成:', this.taskCompletionTimeline.length, '个数据点')
      console.log('[ProjectDashboard] 成员列表:', this.timelineMemberNames)
    },

    /**
     * 更新成员任务统计数据
     */
    updateMemberTaskStats() {
      console.log('[ProjectDashboard] 开始更新成员任务统计, allTasks:', this.allTasks?.length)
      
      if (!this.allTasks || this.allTasks.length === 0) {
        this.memberTaskStats = []
        console.log('[ProjectDashboard] 没有任务数据')
        return
      }

      const memberMap = new Map()

      // 遍历所有任务，统计每个成员的任务数
      this.allTasks.forEach(task => {
        // 检查任务是否已完成
        const status = task.status || task.status_value
        const isCompleted = status === 'DONE' || status === '已完成' || status === '完成' || 
                           status === 'COMPLETED' || status === 'PENDING_REVIEW' || status === '待审核'
        
        // 后端返回的任务数据中，执行者在 assignees 数组中
        // 每个 assignee 有 userId 和 userName 字段
        const assignees = task.assignees || []
        
        if (assignees.length > 0) {
          // 遍历所有执行者
          assignees.forEach(assignee => {
            const userName = assignee.userName || assignee.username || assignee.name || '未知成员'
            
            // 初始化成员数据
            if (!memberMap.has(userName)) {
              memberMap.set(userName, {
                name: userName,
                totalTasks: 0,
                completedTasks: 0
              })
            }

            const memberData = memberMap.get(userName)
            memberData.totalTasks++

            if (isCompleted) {
              memberData.completedTasks++
            }
          })
        } else {
          // 如果没有 assignees，尝试其他字段
          let assigneeName = task.assigneeName || task.assignee_name || task.creatorName || task.creator_name
          
          // 如果还是没有，尝试从项目成员中查找
          if (!assigneeName) {
            const assigneeId = task.assigneeId || task.assignee_id || task.createdBy
            if (assigneeId && this.projectMembers.length > 0) {
              const member = this.projectMembers.find(m => 
                String(m.id) === String(assigneeId) || 
                String(m.userId) === String(assigneeId)
              )
              if (member) {
                assigneeName = member.name || member.username || member.nickname || member.realName
              }
            }
          }
          
          if (!assigneeName) {
            assigneeName = '未分配'
          }

          // 初始化成员数据
          if (!memberMap.has(assigneeName)) {
            memberMap.set(assigneeName, {
              name: assigneeName,
              totalTasks: 0,
              completedTasks: 0
            })
          }

          const memberData = memberMap.get(assigneeName)
          memberData.totalTasks++

          if (isCompleted) {
            memberData.completedTasks++
          }
        }
      })

      // 转换为数组并排序（按总任务数降序），过滤掉"未分配"
      this.memberTaskStats = Array.from(memberMap.values())
        .filter(m => m.name !== '未分配')
        .sort((a, b) => b.totalTasks - a.totalTasks)
        .slice(0, 12) // 最多显示12个成员

      console.log('[ProjectDashboard] 成员任务统计更新完成:', this.memberTaskStats)
    },

    /**
     * 显示贡献图表的tooltip
     */
    showContributionTooltip(event, type) {
      this.contributionHoverType = type
      
      // 找到鼠标位置对应的成员
      const svg = event.target.closest('svg')
      if (!svg) return
      
      const rect = svg.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const svgWidth = rect.width
      const chartLeft = 60 * (svgWidth / 400)
      const chartRight = 370 * (svgWidth / 400)
      const chartWidth = chartRight - chartLeft
      
      // 计算鼠标位置对应的成员索引
      const relativeX = mouseX - chartLeft
      const memberIndex = Math.round((relativeX / chartWidth) * (this.memberContributionData.length - 1))
      const clampedIndex = Math.max(0, Math.min(this.memberContributionData.length - 1, memberIndex))
      
      const member = this.memberContributionData[clampedIndex]
      if (!member) return
      
      const value = type === 'wiki' ? member.wikiCount : member.achievementCount
      const label = type === 'wiki' ? 'Wiki文档数量' : '成果上传数量'
      
      this.tooltip = {
        show: true,
        x: event.clientX + 10,
        y: event.clientY - 30,
        title: `${member.name} - ${label}`,
        value: value,
        suffix: ' 个',
        mode: 'value'
      }
    },

    /**
     * 隐藏贡献图表的tooltip
     */
    hideContributionTooltip() {
      this.contributionHoverType = null
      this.tooltip.show = false
    },

    /**
     * 切换导出菜单显示状态
     */
    toggleExportMenu() {
      this.showExportMenu = !this.showExportMenu
    },

    /**
     * 导出成果数据
     */
    exportAchievements(format) {
      this.showExportMenu = false
      
      if (!this.achievements || this.achievements.length === 0) {
        alert('没有可导出的成果数据')
        return
      }

      const projectId = this.$route.params.id
      const projectName = '项目成果'
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      let filename = `${projectName}_成果列表_${timestamp}`

      if (format === 'csv') {
        this.exportToCSV(filename)
      } else if (format === 'excel') {
        this.exportToExcel(filename)
      } else if (format === 'json') {
        this.exportToJSON(filename)
      }
    },

    /**
     * 导出为CSV格式
     */
    exportToCSV(filename) {
      const headers = ['标题', '类型', '负责人', '创建时间', '更新时间', '状态']
      const rows = this.achievements.map(achievement => [
        achievement.title || '未命名成果',
        achievement.typeName || achievement.type || '未知',
        achievement.responsibleName || '未知',
        achievement.createTime || achievement.createdAt || '',
        achievement.updateTime || achievement.updatedAt || '',
        achievement.status || '未知'
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.csv`
      link.click()
    },

    /**
     * 导出为Excel格式（使用CSV格式，可以Excel打开）
     */
    exportToExcel(filename) {
      // 使用CSV格式，Excel可以打开
      this.exportToCSV(filename.replace('.csv', ''))
    },

    /**
     * 导出为JSON格式
     */
    exportToJSON(filename) {
      const jsonContent = JSON.stringify(this.achievements, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.json`
      link.click()
    },

    /**
     * 处理点击外部关闭导出菜单
     */
    handleClickOutside(event) {
      if (this.showExportMenu && !event.target.closest('.export-dropdown')) {
        this.showExportMenu = false
      }
    },

    /**
     * 获取成果状态样式类（根据类型）
     */
    getAchievementStatusClass(type) {
      const typeClassMap = {
        'paper': 'status-paper',
        'patent': 'status-patent',
        'dataset': 'status-dataset',
        'model': 'status-model',
        'report': 'status-report',
        'custom': 'status-custom'
      }
      return typeClassMap[type] || 'status-default'
    },

    /**
     * 根据接口返回与项目成员列表解析成果负责人姓名
     */
    updateAchievementOwners() {
      if (!Array.isArray(this.achievements)) {
        this.achievements = []
        return
      }

      const memberMap = new Map()
      if (Array.isArray(this.projectMembers)) {
        this.projectMembers.forEach(member => {
          const id = member ? (member.userId || member.id || member.memberId) : null
          const name = member ? (member.username || member.name || member.nickname || member.realName) : null
          if (id && name && typeof name === 'string' && name.trim() !== '') {
            memberMap.set(String(id), name.trim())
          }
        })
      }

      const updatedAchievements = this.achievements.map(achievement => {
        const responsibleName = this.resolveAchievementOwner(achievement, memberMap)
        if (achievement.responsibleName === responsibleName) {
          return achievement
        }
        return {
          ...achievement,
          responsibleName
        }
      })

      this.achievements = updatedAchievements
    },

    /**
     * 解析单条成果的负责人姓名
     * @param {Object} achievement 
     * @param {Map} memberMap 
     * @returns {String}
     */
    resolveAchievementOwner(achievement, memberMap = new Map()) {
      if (!achievement) {
        return '未知'
      }

      const candidateStrings = [
        achievement.responsibleName,
        achievement.creatorName,
        achievement.creator,
        achievement.createdByName,
        achievement.createdBy,
        achievement.updatedByName,
        achievement.ownerName,
        achievement.managerName,
        achievement.leaderName,
        achievement.uploader,
        achievement.username,
        achievement.userName,
        achievement.submitterName,
        achievement.lastOperatorName
      ]

      const normalize = value => {
        if (typeof value !== 'string') return null
        const trimmed = value.trim()
        if (!trimmed) return null
        if (trimmed === '未知' || trimmed === '未知用户') return null
        return trimmed
      }

      for (const candidate of candidateStrings) {
        const normalized = normalize(candidate)
        if (normalized) {
          return normalized
        }
      }

      const nestedObjects = [
        achievement.creatorUser,
        achievement.createdByUser,
        achievement.creatorInfo,
        achievement.owner,
        achievement.member,
        achievement.submitter
      ]

      for (const obj of nestedObjects) {
        if (obj && typeof obj === 'object') {
          const nestedCandidate = normalize(
            obj.name ||
            obj.username ||
            obj.userName ||
            obj.nickname ||
            obj.realName
          )
          if (nestedCandidate) {
            return nestedCandidate
          }
        }
      }

      const idCandidates = [
        achievement.creatorId,
        achievement.createdById,
        achievement.ownerId,
        achievement.uploaderId,
        achievement.submitterId,
        achievement.memberId
      ]

      for (const id of idCandidates) {
        if (!id && id !== 0) continue
        const key = String(id)
        if (memberMap.has(key)) {
          return memberMap.get(key)
        }
      }

      return '未知'
    },

    /**
     * 根据成员ID获取显示姓名
     */
    getMemberDisplayNameById(userId, fallback = '未知用户') {
      if (!userId && userId !== 0) {
        return fallback
      }
      const idStr = String(userId)
      if (Array.isArray(this.projectMembers)) {
        const found = this.projectMembers.find(member => {
          const candidateIds = [
            member?.userId,
            member?.id,
            member?.memberId,
            member?.member?.id,
            member?.user?.id
          ].filter(val => val || val === 0).map(val => String(val))
          return candidateIds.includes(idStr)
        })
        if (found) {
          return found.username ||
            found.name ||
            found.nickname ||
            found.realName ||
            found.displayName ||
            fallback
        }
      }
      return fallback
    },

    /**
     * 获取状态显示文本
     */
    getStatusDisplay(status) {
      const statusMap = {
        'draft': '草稿',
        'under_review': '审核中',
        'published': '已发布',
        'obsolete': '已归档',
        'DRAFT': '草稿',
        'UNDER_REVIEW': '审核中',
        'PUBLISHED': '已发布',
        'OBSOLETE': '已归档'
      }
      return statusMap[status] || status || '未知'
    },

    /**
     * 获取状态样式类
     */
    getStatusBadgeClass(status) {
      const statusClassMap = {
        'draft': 'badge draft',
        'under_review': 'badge warning',
        'published': 'badge success',
        'obsolete': 'badge obsolete',
        'DRAFT': 'badge draft',
        'UNDER_REVIEW': 'badge warning',
        'PUBLISHED': 'badge success',
        'OBSOLETE': 'badge obsolete'
      }
      return statusClassMap[status] || 'badge'
    },

    /**
     * 获取类型显示文本
     */
    getTypeDisplay(type) {
      const typeMap = {
        'paper': '论文',
        'patent': '专利',
        'dataset': '数据集',
        'model': '模型文件',
        'report': '实验报告',
        'custom': '自定义成果'
      }
      return typeMap[type] || type || '未知'
    },

    /**
     * 获取类型徽章样式类
     */
    getTypeBadgeClass(type) {
      const classMap = {
        'paper': 'badge-paper',
        'patent': 'badge-patent',
        'dataset': 'badge-dataset',
        'model': 'badge-model',
        'report': 'badge-report',
        'custom': 'badge-custom'
      }
      return classMap[type] || 'badge-default'
    },

    /**
     * 格式化日期时间显示
     */
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '未知'
      try {
        const date = new Date(dateTimeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      } catch (error) {
        // 如果日期格式不对，尝试直接处理字符串
        if (typeof dateTimeStr === 'string') {
          // 尝试提取日期部分 (YYYY-MM-DD)
          const match = dateTimeStr.match(/(\d{4}-\d{2}-\d{2})/)
          if (match) {
            return match[1]
          }
        }
        return dateTimeStr
      }
    },

    polarToCartesian(cx, cy, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
      return {
        x: cx + radius * Math.cos(angleInRadians),
        y: cy + radius * Math.sin(angleInRadians)
      }
    },
    getPiePath(startAngle, endAngle) {
      const radius = 90
      const cx = 100
      const cy = 100
      let sweep = endAngle - startAngle
      if (sweep <= 0) return ''
      if (sweep >= 360) {
        // 绘制完整的圆形：使用两个180度圆弧，确保完美连接
        const topPoint = this.polarToCartesian(cx, cy, radius, 0)
        const bottomPoint = this.polarToCartesian(cx, cy, radius, 180)
        // 从圆心到顶部点，然后画两个180度圆弧形成完整圆
        return `M ${cx} ${cy} L ${topPoint.x} ${topPoint.y} A ${radius} ${radius} 0 1 1 ${bottomPoint.x} ${bottomPoint.y} A ${radius} ${radius} 0 1 1 ${topPoint.x} ${topPoint.y} Z`
      }
      const start = this.polarToCartesian(cx, cy, radius, endAngle)
      const end = this.polarToCartesian(cx, cy, radius, startAngle)
      const largeArcFlag = sweep > 180 ? 1 : 0
      return [
        'M', cx, cy,
        'L', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'Z'
      ].join(' ')
    },

    refreshDash() {
      // 刷新数据
      this.loadTaskStatistics().then(() => {
        // 刷新动画
        Object.keys(this.kpis).forEach(key => this.animateCount(key, this.kpis[key], 600))
        // 重新播放饼图动画
        this.animatePieChart()
      })
    },
    animateCount(key, target, duration = 800) {
      const start = performance.now()
      const from = this.display[key] || 0 // 从当前显示值开始
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        this.display[key] = Math.round(from + (target - from) * eased)
        if (p < 1) requestAnimationFrame(step)
        else this.display[key] = target // 确保最终值准确
      }
      requestAnimationFrame(step)
    },
    // 从任务对象中解析接取该任务的成员名称；如果没有接取则返回“未接取”
    getTaskAssigneeName(task) {
      if (!task) return '未接取'

      const normalize = (val) => {
        if (typeof val !== 'string') return ''
        const trimmed = val.trim()
        return trimmed || ''
      }

      // 1. 优先从后端返回的 assignees 数组中读取（真实的执行者列表）
      if (Array.isArray(task.assignees) && task.assignees.length > 0) {
        const names = task.assignees
          .map(a => normalize(a.userName || a.username || a.name || a.realName || a.nickname))
          .filter(n => n)
        if (names.length > 0) {
          return names.join(', ')
        }
      }

      // 2. 再从"接取/负责人"类字符串字段中获取
      const candidateStrings = [
        task.assigneeName,
        task.assignee,
        task.responsibleName,
        task.responsible,
        task.executorName,
        task.executor,
        task.handlerName,
        task.handler,
        task.ownerName,
        task.owner,
        task.creatorName,
        task.creator
      ]

      for (const c of candidateStrings) {
        const v = normalize(c)
        if (v) return v
      }

      // 3. 尝试从嵌套的用户对象中解析
      const nested = [
        task.assigneeUser,
        task.responsibleUser,
        task.executorUser,
        task.handlerUser,
        task.user
      ]

      for (const obj of nested) {
        if (obj && typeof obj === 'object') {
          const v = normalize(
            obj.name ||
            obj.username ||
            obj.userName ||
            obj.nickname ||
            obj.realName
          )
          if (v) return v
        }
      }

      // 4. 如果以上都没有，则认为当前任务还没有被接取
      return '未接取'
    },
    /**
     * 饼图动画效果
     */
    animatePieChart() {
      this.pieAnimationProgress = 0
      const duration = 2000 // 动画时长2秒
      const start = performance.now()
      const step = (now) => {
        const elapsed = now - start
        const progress = Math.min(1, elapsed / duration)
        // 使用缓动函数，让动画更自然
        const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
        this.pieAnimationProgress = eased
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          this.pieAnimationProgress = 1 // 确保最终值为1
        }
      }
      requestAnimationFrame(step)
    },
    showTooltip(evt, title, value, suffix = '') {
      const margin = 14
      this.tooltip = {
        show: true,
        x: evt.clientX + margin,
        y: evt.clientY + margin,
        title,
        value,
        suffix,
        mode: 'value',
        tasks: []
      }
    },
    // 在项目总任务数上显示真实任务列表
    showTaskListTooltip(evt) {
      const margin = 14
      const tasks = Array.isArray(this.allTasks) ? this.allTasks : []
      // 为了避免弹窗过长，限制最多显示前50条任务
      const maxItems = 50
      const taskList = tasks.slice(0, maxItems)

      this.tooltip = {
        show: true,
        x: evt.clientX + margin,
        y: evt.clientY + margin,
        title: `项目总任务（共 ${tasks.length} 个）`,
        value: '',
        suffix: '',
        mode: 'tasks',
        tasks: taskList
      }
    },
    // 在已完成数上显示真实完成任务列表（来自后端审核通过的任务）
    showCompletedTasksTooltip(evt) {
      const margin = 14
      const tasks = Array.isArray(this.completedTasks) ? this.completedTasks : []
      // 为了避免弹窗过长，限制最多显示前50条任务
      const maxItems = 50
      const taskList = tasks.slice(0, maxItems)

      this.tooltip = {
        show: true,
        x: evt.clientX + margin,
        y: evt.clientY + margin,
        title: `已完成任务（共 ${tasks.length} 个）`,
        value: '',
        suffix: '',
        mode: 'tasks',
        tasks: taskList
      }
    },
    hideTooltip() {
      this.tooltip.show = false
    },
    initParticles() {
      const canvas = this.$refs.bgCanvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const DPR = window.devicePixelRatio || 1
      
      const resize = () => {
        canvas.width = canvas.clientWidth * DPR
        canvas.height = canvas.clientHeight * DPR
      }
      resize()
      
      // 创建多层渐变波浪
      let time = 0
      const waves = [
        { amplitude: 40, frequency: 0.015, speed: 0.02, color: 'rgba(59, 130, 246, 0.08)', offset: 0 },
        { amplitude: 50, frequency: 0.012, speed: 0.015, color: 'rgba(139, 92, 246, 0.06)', offset: Math.PI / 3 },
        { amplitude: 35, frequency: 0.018, speed: 0.025, color: 'rgba(99, 102, 241, 0.05)', offset: Math.PI / 2 }
      ]
      
      // 创建浮动光球
      const orbs = Array.from({ length: 8 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3 * DPR,
        vy: (Math.random() - 0.5) * 0.3 * DPR,
        radius: (Math.random() * 100 + 80) * DPR,
        hue: Math.random() * 60 + 200, // 蓝紫色系
        alpha: Math.random() * 0.15 + 0.05
      }))
      
      const render = () => {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // 绘制浮动光球（毛玻璃效果）
        orbs.forEach(orb => {
          orb.x += orb.vx
          orb.y += orb.vy
          
          // 边界反弹
          if (orb.x < -orb.radius || orb.x > canvas.width + orb.radius) orb.vx *= -1
          if (orb.y < -orb.radius || orb.y > canvas.height + orb.radius) orb.vy *= -1
          
          // 创建径向渐变
          const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
          gradient.addColorStop(0, `hsla(${orb.hue}, 70%, 65%, ${orb.alpha})`)
          gradient.addColorStop(0.5, `hsla(${orb.hue}, 70%, 60%, ${orb.alpha * 0.5})`)
          gradient.addColorStop(1, `hsla(${orb.hue}, 70%, 55%, 0)`)
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
          ctx.fill()
        })
        
        // 绘制波浪
        waves.forEach((wave, index) => {
          ctx.beginPath()
          ctx.moveTo(0, canvas.height)
          
          // 绘制波浪曲线
          for (let x = 0; x <= canvas.width; x += 5) {
            const y = canvas.height * 0.5 + 
                     Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude * DPR +
                     Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 1.5) * wave.amplitude * 0.5 * DPR
            ctx.lineTo(x, y)
          }
          
          ctx.lineTo(canvas.width, canvas.height)
          ctx.closePath()
          
          // 创建渐变填充
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
          gradient.addColorStop(0, wave.color)
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          
          ctx.fillStyle = gradient
          ctx.fill()
        })
        
        time += 1
        this.rafId = requestAnimationFrame(render)
      }
      
      this.rafId = requestAnimationFrame(render)
      this.resizeCanvas = resize
    }
  }
}
</script>

<style scoped>
.dashboard-container{
  position:relative;
  height:100vh;
  overflow-y:scroll;
  scroll-snap-type:y mandatory;
  scroll-behavior:smooth;
  background:linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #f0f9ff 100%);
}

/* 隐藏滚动条但保留滚动功能 */
.dashboard-container::-webkit-scrollbar{
  width:0;
  height:0;
}

/* 加载指示器样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 20px;
  font-weight: 500;
}

.loading-progress {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.loading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 每个section占据一个完整屏幕 */
.dashboard-section{
  position:relative;
  min-height:100vh;
  scroll-snap-align:start;
  scroll-snap-stop:always;
  padding:24px;
  padding-bottom:100px;
  display:flex;
  flex-direction:column;
  overflow:visible;
}

/* KPI section样式 */
.kpi-section{
  position: relative;
  justify-content:center;
  align-items:center;
  padding:40px;
}

/* 左上角返回按钮 */
.back-btn-topleft{
  position: absolute;
  top: 24px;
  left: 24px;
  display:inline-flex;
  align-items:center;
  gap:8px;
  height:44px;
  padding:0 20px;
  border-radius:12px;
  border:none;
  background:rgba(255,255,255,0.95);
  backdrop-filter:blur(10px);
  color:#3b82f6;
  cursor:pointer;
  font-size:15px;
  font-weight:600;
  transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
  box-shadow:0 4px 12px rgba(59,130,246,0.15),0 2px 4px rgba(0,0,0,0.08);
  z-index: 100;
}

.back-btn-topleft:hover{
  transform:translateY(-2px);
  box-shadow:0 6px 16px rgba(59,130,246,0.25),0 3px 6px rgba(0,0,0,0.12);
  background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);
  color:#ffffff;
}

.back-btn-topleft .back-icon{
  transition:transform 0.3s ease;
}

.back-btn-topleft:hover .back-icon{
  transform:translateX(-3px);
}

/* 页面标题 */
.page-title {
  position: absolute;
  top: 32px;
  left: 140px;
  font-size: 22px !important;
  font-weight: 700 !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #1e40af !important;
  letter-spacing: 0.5px !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  z-index: 100;
}

/* KPI内容区 */
.kpi-content{
  max-width:1400px;
  width:100%;
  display:flex;
  justify-content:center;
  align-items:flex-start;
  position:relative;
  z-index:1;
  padding-top: 40px;
}

/* 仪表盘卡片包装器 */
.dashboard-cards-wrapper {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  width: 100%;
  max-width: 1400px;
}

/* 已完成任务统计页面的卡片包装器 */
.charts-section .dashboard-cards-wrapper {
  align-items: stretch;
}

/* 现代统计卡片 */
.stat-card-modern {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 24px 24px;
  box-shadow: 
    0 20px 40px rgba(15, 23, 42, 0.08),
    0 4px 12px rgba(59, 130, 246, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.stat-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card-modern:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 28px 56px rgba(15, 23, 42, 0.12),
    0 8px 20px rgba(59, 130, 246, 0.15);
}

.stat-card-modern:hover::before {
  opacity: 1;
}

/* 图标包装器 */
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.stat-icon {
  color: white;
  stroke: white;
}

/* 统计内容 */
.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-description {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

/* 已完成任务卡片特殊样式 */
.stat-card-modern.completed-tasks .stat-icon-wrapper {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.stat-card-modern.completed-tasks::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

/* 现代图表卡片 */
.chart-card-modern {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 
    0 20px 40px rgba(15, 23, 42, 0.08),
    0 4px 12px rgba(59, 130, 246, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.chart-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 28px 56px rgba(15, 23, 42, 0.12),
    0 8px 20px rgba(59, 130, 246, 0.15);
}

/* 图表头部 */
.chart-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.chart-subtitle {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

/* 图表主体 */
.chart-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

/* 饼图包装器 */
.pie-chart-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.pie-svg {
  width: 100%;
  max-width: 280px;
  height: 280px;
  filter: drop-shadow(0 12px 24px rgba(15, 23, 42, 0.1));
}

.pie-svg path {
  transition: transform 0.3s ease, filter 0.3s ease;
  transform-origin: 100px 100px;
  cursor: pointer;
}

.pie-svg path:hover {
  transform: scale(1.08);
  filter: brightness(1.15);
}

/* 现代图例 */
.legend-modern {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.legend-item-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.legend-item-modern:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-text {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  flex: 1;
}

.legend-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.legend-percent {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  padding: 2px 8px;
  background: white;
  border-radius: 6px;
}

/* 不同状态的图例颜色 */
.legend-item-modern.pending-review .legend-dot {
  background: #60a5fa;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
}

.legend-item-modern.doing .legend-dot {
  background: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.legend-item-modern.blocked .legend-dot {
  background: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.legend-item-modern.done .legend-dot {
  background: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* 图表内容包装器 */
.charts-content-wrapper {
  max-width: 1400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  z-index: 1;
}

/* 图表包装器 */
.charts-wrapper {
  padding: 16px !important;
}

/* 图表网格 */
.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.charts-grid .card {
  margin: 0;
}

/* 紧凑任务列表 */
.task-list-compact {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.task-list-header {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-list-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-list-count {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 12px;
}

/* 导出按钮和下拉菜单 */
.export-dropdown {
  position: relative;
  display: inline-block;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.export-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.export-btn:active {
  transform: translateY(0);
}

.export-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.export-btn .dropdown-arrow {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;
}

.export-btn .dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.export-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.export-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
}

.export-menu-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.export-menu-item:first-child {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.export-menu-item:last-child {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.export-menu-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #64748b;
}

.export-menu-item:hover svg {
  color: #3b82f6;
}

.task-list-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 350px;
  overflow-y: auto;
}

.task-list-items::-webkit-scrollbar {
  width: 4px;
}

.task-list-items::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.task-list-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.task-list-items::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.task-item-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.task-item-compact:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.task-item-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-item-status.status-todo,
.task-item-status.status-pending-review {
  background: #60a5fa;
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
}

.task-item-status.status-doing {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.task-item-status.status-blocked {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.task-item-status.status-done {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.task-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item-assignee {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
}

.task-item-assignee svg {
  stroke: #94a3b8;
  flex-shrink: 0;
}

.task-list-more {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

/* 标题区 */
.kpi-title-section{
  text-align:center;
  position:relative;
}

.title-decoration{
  width:60px;
  height:4px;
  background:linear-gradient(90deg,#3b82f6 0%,#8b5cf6 100%);
  border-radius:2px;
  margin:0 auto 20px;
  box-shadow:0 2px 8px rgba(59,130,246,0.3);
}

.kpi-main-title{
  font-size:48px;
  font-weight:800;
  margin:0 0 12px;
  background:linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#8b5cf6 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  letter-spacing:-0.5px;
}

.kpi-subtitle{
  font-size:16px;
  color:#64748b;
  margin:0;
  font-weight:500;
}

/* Charts section样式 */
.charts-section{
  padding-top:50px;
  padding-bottom:40px;
  min-height:auto;
  height:100vh;
  overflow:hidden;
}

.charts-section .stat-card-modern {
  padding: 20px;
}

.charts-section .stat-icon-wrapper {
  width: 44px;
  height: 44px;
}

.charts-section .stat-value {
  font-size: 32px;
}

.charts-section .task-list-compact {
  margin-top: 12px;
  padding-top: 12px;
}

.charts-section .task-list-items {
  max-height: 350px;
}

/* Timeline section样式 */
.timeline-section{
  justify-content:center;
  align-items:center;
  padding:60px 40px;
}

.timeline-content{
  max-width:1000px;
  width:100%;
  position:relative;
  z-index:1;
}

/* 双栏布局 */
.timeline-dual-layout {
  max-width: 1400px;
  width: 100%;
  display: flex;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.timeline-left {
  flex: 1;
  min-width: 0;
}

.timeline-right {
  flex: 1;
  min-width: 0;
}

/* 提交时间线样式 */
.commit-timeline {
  padding: 24px !important;
  max-height: 600px;
  overflow-y: auto;
}

.commit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  margin-bottom: 20px;
}

.commit-header svg {
  color: #3b82f6;
}

.commit-branch {
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.commit-author {
  font-size: 14px;
  color: #64748b;
  margin-left: auto;
}

.commit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.commit-list::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
}

.commit-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
}

.commit-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.commit-content {
  flex: 1;
  padding-bottom: 8px;
}

.commit-message {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  line-height: 1.5;
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
}

.commit-author-name {
  font-weight: 500;
  color: #3b82f6;
}

.commit-time {
  color: #94a3b8;
}

.commit-timeline::-webkit-scrollbar {
  width: 6px;
}

.commit-timeline::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.commit-timeline::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 3px;
}

.commit-timeline::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
}

.commit-empty {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.commit-empty svg {
  margin-bottom: 16px;
  opacity: 0.3;
  color: #94a3b8;
}

.commit-empty p {
  font-size: 14px;
  margin: 0;
  color: #94a3b8;
}

/* 里程碑任务信息样式 */
.milestone-task-info {
  flex: 1;
}

.milestone-members {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.milestone-members svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.milestone-members span {
  color: #3b82f6;
  font-weight: 500;
}

/* 里程碑空状态样式 */
.milestone-empty {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.milestone-empty svg {
  margin-bottom: 16px;
  opacity: 0.3;
  color: #94a3b8;
}

.milestone-empty p {
  font-size: 14px;
  margin: 0;
  color: #94a3b8;
}

/* Achievements section样式 */
.achievements-section{
  justify-content:center;
  align-items:center;
  padding:40px 40px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.achievements-content{
  max-width:1200px;
  width:100%;
  position:relative;
  z-index:1;
}

/* Section副标题样式 */
.section-subtitle{
  font-size:14px;
  color:#64748b;
  margin:6px 0 0;
  font-weight:500;
  text-align:center;
}

/* 成果统计section标题调整 */
.achievements-section .section-header {
  margin-bottom: 20px;
}

.achievements-section .section-title {
  font-size: 24px;
}

.bg-canvas{position:fixed;inset:0;z-index:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:normal}
.back-btn{
  display:inline-flex;
  align-items:center;
  gap:6px;
  height:40px;
  padding:0 16px;
  border-radius:10px;
  border:none;
  background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);
  color:#3b82f6;
  cursor:pointer;
  font-size:14px;
  font-weight:500;
  transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
  box-shadow:0 2px 8px rgba(59,130,246,0.1),0 1px 2px rgba(0,0,0,0.05);
  position:relative;
  overflow:hidden;
}
.back-btn::before{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);
  opacity:0;
  transition:opacity 0.3s ease;
  border-radius:10px;
}
.back-btn:hover::before{opacity:1}
.back-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 20px rgba(59,130,246,0.25),0 4px 8px rgba(0,0,0,0.1);
}
.back-btn:active{
  transform:translateY(0);
  box-shadow:0 2px 8px rgba(59,130,246,0.15);
}
.back-icon{
  position:relative;
  z-index:1;
  transition:transform 0.3s ease;
}
.back-btn:hover .back-icon{
  transform:translateX(-2px);
}
.back-text{
  position:relative;
  z-index:1;
  transition:color 0.3s ease;
}
.back-btn:hover .back-text{
  color:#ffffff;
}
/* 顶部已去除控制按钮，样式保留以便以后启用时复用 */
/* .controls{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:12px;background:rgba(255,255,255,.7);box-shadow:0 6px 20px rgba(0,0,0,.06)} */
/* .controls .btn-refresh{position:relative;height:32px;padding:0 14px;border-radius:8px;border:1px solid #bfdbfe;background:linear-gradient(90deg,#60a5fa,#3b82f6);color:white;cursor:pointer;overflow:hidden} */
/* .controls .btn-refresh .pulse{position:absolute;inset:-1px;border-radius:8px;border:1px solid rgba(99,102,241,.5);box-shadow:0 0 24px rgba(14,165,233,.35) inset} */
/* 滚动提示样式 */
.scroll-hint{
  position:absolute;
  bottom:40px;
  left:50%;
  transform:translateX(-50%);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  color:#64748b;
  font-size:14px;
  font-weight:500;
  animation:bounce 2s infinite;
  z-index:100;
  pointer-events:none;
}

.scroll-hint svg{
  color:#3b82f6;
}

@keyframes bounce{
  0%,100%{transform:translateX(-50%) translateY(0)}
  50%{transform:translateX(-50%) translateY(-10px)}
}

/* 左右侧边栏 */
.left-sidebar,
.right-sidebar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 280px;
  height: 600px;
  z-index: 100;
  pointer-events: auto;
}

.left-sidebar {
  left: 20px;
}

.right-sidebar {
  right: 20px;
}

.sidebar-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
}

.sidebar-header svg {
  color: #3b82f6;
  flex-shrink: 0;
}

.sidebar-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
  flex: 1;
}

.sidebar-count {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  min-height: 0;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.1);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

.sidebar-task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.sidebar-task-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateX(4px);
}

.task-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.task-status-dot.status-todo {
  background: #93c5fd;
  box-shadow: 0 0 8px rgba(147, 197, 253, 0.5);
}

.task-status-dot.status-doing {
  background: #60a5fa;
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
}

.task-status-dot.status-blocked {
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}

.task-status-dot.status-done {
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
}

.task-status-dot.status-review {
  background: #a855f7;
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
}

.task-item-info {
  flex: 1;
  min-width: 0;
}

.task-item-title {
  font-size: 13px;
  font-weight: 500;
  color: #1e40af;
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item-meta {
  font-size: 11px;
  color: #64748b;
}

.sidebar-empty {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.sidebar-empty p {
  margin: 0;
  font-size: 13px;
}

/* 中等屏幕调整侧边栏宽度和位置 */
@media (max-width: 1680px) {
  .left-sidebar,
  .right-sidebar {
    width: 260px;
  }
}

@media (max-width: 1440px) {
  .left-sidebar,
  .right-sidebar {
    width: 220px;
  }
  
  .left-sidebar {
    left: 10px;
  }
  
  .right-sidebar {
    right: 10px;
  }
}

/* 响应式：小屏幕隐藏侧边栏 */
@media (max-width: 1024px) {
  .left-sidebar,
  .right-sidebar {
    display: none !important;
  }
}

/* Section标题样式 */
.section-header{
  margin-bottom:32px;
  position:relative;
  z-index:1;
}

.section-title{
  font-size:28px;
  font-weight:700;
  color:#0f172a;
  margin:0;
  background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}

.spacer{flex:1}
.grid{display:grid;gap:32px;position:relative;z-index:1}
/* KPI卡片网格：2x2布局 */
.kpis{
  grid-template-columns:repeat(2,1fr);
  width:100%;
  max-width:900px;
  margin:0 auto;
}

.kpi-card{
  background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);
  border:0;
  border-radius:24px;
  padding:40px 32px;
  position:relative;
  overflow:hidden;
  transform:translateZ(0);
  backdrop-filter:blur(10px);
  transition:all 0.4s cubic-bezier(0.4,0,0.2,1);
  box-shadow:
    0 20px 40px rgba(15,23,42,0.08),
    0 4px 12px rgba(59,130,246,0.05),
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 -2px 0 rgba(226,232,240,0.8) inset;
}

/* 卡片光晕效果 */
.kpi-card.glow::before{
  content:'';
  position:absolute;
  inset:-2px;
  border-radius:24px;
  background:conic-gradient(from 180deg at 50% 50%,#3b82f6,#8b5cf6,#3b82f6);
  opacity:0;
  transition:opacity 0.4s ease;
  z-index:-1;
}

.kpi-card:hover{
  transform:translateY(-8px) scale(1.02);
  box-shadow:
    0 28px 56px rgba(15,23,42,0.12),
    0 8px 20px rgba(59,130,246,0.15);
}

.kpi-card:hover.glow::before{
  opacity:0.15;
}

/* KPI标签样式 */
.kpi-label{
  font-size:15px;
  color:#64748b;
  margin-bottom:16px;
  font-weight:600;
  letter-spacing:0.3px;
  text-transform:uppercase;
  position:relative;
  padding-left:20px;
}

.kpi-label::before{
  content:'';
  position:absolute;
  left:0;
  top:50%;
  transform:translateY(-50%);
  width:12px;
  height:12px;
  background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);
  border-radius:3px;
  box-shadow:0 2px 8px rgba(59,130,246,0.3);
}

/* KPI数值样式 */
.kpi-value{
  font-size:56px;
  font-weight:800;
  color:#0f172a;
  text-shadow:0 4px 20px rgba(59,130,246,0.12);
  letter-spacing:-1px;
  line-height:1;
  cursor:pointer;
  transition:all 0.3s ease;
}

.kpi-value:hover{
  transform:scale(1.05);
  color:#3b82f6;
}

.kpi-value .sub{
  font-size:20px;
  color:#6b7280;
  margin-left:8px;
  font-weight:600;
}

.kpi-value.danger{
  color:#ef4444;
  text-shadow:0 4px 20px rgba(239,68,68,0.2);
}

.kpi-value.danger:hover{
  color:#dc2626;
}

/* 大号KPI卡片 */
.kpi-card-large {
  background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);
  border:0;
  border-radius:24px;
  padding:48px 40px;
  position:relative;
  overflow:hidden;
  transform:translateZ(0);
  backdrop-filter:blur(10px);
  transition:all 0.4s cubic-bezier(0.4,0,0.2,1);
  box-shadow:
    0 20px 40px rgba(15,23,42,0.08),
    0 4px 12px rgba(59,130,246,0.05),
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 -2px 0 rgba(226,232,240,0.8) inset;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 200px;
}

.kpi-card-large.glow::before{
  content:'';
  position:absolute;
  inset:-2px;
  border-radius:24px;
  background:conic-gradient(from 180deg at 50% 50%,#3b82f6,#8b5cf6,#3b82f6);
  opacity:0;
  transition:opacity 0.4s ease;
  z-index:-1;
}

.kpi-card-large:hover{
  transform:translateY(-8px) scale(1.02);
  box-shadow:
    0 28px 56px rgba(15,23,42,0.12),
    0 8px 20px rgba(59,130,246,0.15);
}

.kpi-card-large:hover.glow::before{
  opacity:0.15;
}

/* 已完成任务卡片特殊样式 */
.completed-card {
  background:linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%);
}

.completed-card .kpi-label::before {
  background:linear-gradient(135deg,#10b981 0%,#059669 100%);
}

.completed-card .kpi-value {
  color:#065f46;
}

/* 图表在KPI区域的样式 */
.chart-in-kpi {
  min-height: 400px;
}
.charts{grid-template-columns:1fr 1fr 1fr;margin-top:8px;gap:28px} /* 放大卡片间距 */
.card{
  background: linear-gradient(180deg,#ffffff,#fbfbff);
  border: 0;
  border-radius: 16px;
  padding: 18px;
  color: #0f172a;
  backdrop-filter: blur(4px);
  /* 立体边框：柔和外阴影 + 内部顶部高光、底部浅阴影 */
  box-shadow:
    0 16px 32px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 -2px 0 rgba(226,232,240,1) inset;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}
.card-title{font-size:16px;font-weight:600;color:#0f172a;margin-bottom:12px}
.glass{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gradient-border{position:relative}
.gradient-border::before{
  content:'';position:absolute;inset:0;border-radius:16px;padding:2px;
  background:
    linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0)) border-box,
    linear-gradient(135deg,#cfe8ff 0%, #b6e3ff 30%, #a5f3fc 100%) border-box;
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;
}
.gradient-border::after{
  content:'';position:absolute;inset:4px;border-radius:12px;
  box-shadow: 0 0 0 1px rgba(226,232,240,.9) inset;
  pointer-events:none;
}
.pie-chart{position:relative;width:100%;height:220px;display:flex;align-items:center;justify-content:center}
.pie-chart svg{width:100%;max-width:240px;height:220px;filter:drop-shadow(0 12px 20px rgba(15,23,42,.12))}
.pie-chart path{transition:transform .25s ease, filter .25s ease;transform-origin:100px 100px;cursor:pointer}
.pie-chart path:hover{transform:scale(1.05);filter:brightness(1.1)}
.pie-empty{height:220px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#94a3b8;background:linear-gradient(180deg,#f8fafc,#fff);border-radius:12px}
.legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}
.legend-item{font-size:12px;color:#0f172a;padding:4px 12px;border-radius:999px;border:1px solid transparent;background:#f8fafc;box-shadow:inset 0 1px 2px rgba(255,255,255,.65)}
.legend-item.todo{background:#dbeafe;border-color:#93c5fd;color:#1e40af}
.legend-item.doing{background:#dbeafe;border-color:#60a5fa;color:#1e3a8a}
.legend-item.blocked{background:#fef3c7;border-color:#fbbf24;color:#92400e}
.legend-item.done{background:#d1fae5;border-color:#34d399;color:#065f46}
/* 树状图容器 */
.treemap-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 100px;
  padding: 12px;
  align-content: flex-start;
  position: relative;
  overflow: visible;
}

/* 隐藏滚动条但保留滚动功能 */
.treemap-container::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.treemap-block {
  position: relative;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-width: 70px;
  min-height: 50px;
  animation: treemapFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

/* 为不同位置的方块添加延迟 */
.treemap-block:nth-child(1) { animation-delay: 0s; }
.treemap-block:nth-child(2) { animation-delay: 0.1s; }
.treemap-block:nth-child(3) { animation-delay: 0.2s; }
.treemap-block:nth-child(4) { animation-delay: 0.3s; }
.treemap-block:nth-child(5) { animation-delay: 0.4s; }
.treemap-block:nth-child(n+6) { animation-delay: 0.5s; }

/* 禁用动画的类 */
.treemap-block.no-animation {
  animation: none !important;
  opacity: 0 !important;
  transform: scaleY(0) !important;
  transform-origin: bottom !important;
}

/* 选中状态 - 占据整个容器 */
.treemap-block.selected {
  position: absolute !important;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  width: auto !important;
  height: auto !important;
  min-height: 150px !important;
  flex-basis: auto !important;
  flex-grow: 0 !important;
  z-index: 100;
  margin: 0;
  transform: none !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  animation: none !important;
}

/* 隐藏其他方块 */
.treemap-block.hidden {
  opacity: 0;
  transform: none !important;
  pointer-events: none;
  animation: none !important;
}

@keyframes treemapFadeIn {
  0% {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: bottom;
  }
  50% {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: bottom;
  }
  100% {
    opacity: 1;
    transform: scaleY(1) scale(1);
    transform-origin: center;
  }
}

.treemap-block:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.treemap-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.treemap-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.treemap-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  transition: all 0.3s ease;
}

/* 选中状态下的文字样式 - 大号显示 */
.treemap-block.selected .treemap-name {
  font-size: 28px;
  margin-bottom: 12px;
  max-width: none;
}

.treemap-value {
  font-size: 20px;
  font-weight: 700;
  transition: all 0.3s ease;
}

/* 选中状态下的工时数字 - 超大号 */
.treemap-block.selected .treemap-value {
  font-size: 48px;
  font-weight: 800;
}

.total-worktime {
  font-size: 14px;
  color: #6b7280;
  font-weight: normal;
  margin-left: 12px;
}

/* 成员详情弹窗 */
.member-detail-modal {
  max-width: 500px;
  width: 90%;
}

.member-detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  font-weight: 600;
  color: #1f2937;
}

.detail-value.highlight {
  color: #3b82f6;
  font-size: 18px;
}

.bar-chart-container{display:flex;flex-direction:column;gap:16px;min-height:240px;justify-content:flex-end;margin-top:auto}
.bar-chart{display:flex;align-items:flex-end;height:200px;gap:12px;padding:0 12px;min-height:200px;justify-content:center;flex:0 0 auto}
.bar-wrap{position:relative;flex:1;max-width:80px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0;height:100%}
.bar{width:100%;min-width:32px;max-width:60px;background:linear-gradient(180deg,#60a5fa 0%,#3b82f6 50%,#2563eb 100%);border-radius:8px 8px 0 0;height:var(--h);min-height:20px;transition:all 400ms cubic-bezier(0.4,0,0.2,1);box-shadow:0 4px 12px rgba(59,130,246,0.25),0 2px 4px rgba(59,130,246,0.15);cursor:pointer;flex-shrink:0;position:relative;overflow:hidden}
.bar::before{content:'';position:absolute;top:0;left:0;right:0;height:30%;background:linear-gradient(180deg,rgba(255,255,255,0.4) 0%,rgba(255,255,255,0) 100%);border-radius:8px 8px 0 0}
.bar::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,0.3)}
.bar:hover{background:linear-gradient(180deg,#7dd3fc 0%,#60a5fa 50%,#3b82f6 100%);box-shadow:0 8px 20px rgba(59,130,246,0.35),0 4px 8px rgba(59,130,246,0.2);transform:translateY(-4px) scale(1.05)}
.bar-placeholder{width:100%;min-width:32px;max-width:60px;height:0;flex-shrink:0}
.bar-label{font-size:11px;font-weight:700;color:#1e40af;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);padding:4px 8px;border-radius:6px;border:1.5px solid #dbeafe;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);position:absolute;bottom:calc(100% + 6px);z-index:10;backdrop-filter:blur(4px)}
.bar-names{display:flex;gap:12px;padding:0 12px 8px;justify-content:center;align-items:center;flex:0 0 auto}
.bar-name{font-size:12px;color:#475569;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;max-width:80px;font-weight:600;padding:4px 0;letter-spacing:0.3px}
.bar-chart-empty{height:200px;display:flex;align-items:center;justify-content:center}
.empty-text{font-size:14px;color:#94a3b8}
.line-chart{height:220px;background:linear-gradient(180deg,#f8fafc,#fff);border:1px dashed #e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:20px 20px 30px 20px;position:relative;overflow:visible}
.line-chart-empty{height:220px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#f8fafc,#fff);border:1px dashed #e5e7eb;border-radius:8px}
.line-chart svg{max-width:500px;width:90%;height:160px;overflow:visible;margin:0 auto}
.line-area{opacity:0.6;transition:opacity 0.3s ease}
.line{stroke-dasharray:200;stroke-dashoffset:200;animation:dash 1200ms ease forwards;filter:drop-shadow(0 2px 4px rgba(59,130,246,0.2))}
.line-point{filter:drop-shadow(0 2px 4px rgba(59,130,246,0.3));transition:all 0.3s ease;cursor:pointer}
.line-point:hover{r:3.5;fill:#2563eb}
.line-label{font-size:5px;fill:#1e40af;font-weight:700;text-anchor:middle;pointer-events:none}
.line-date{font-size:4.5px;fill:#64748b;font-weight:600;text-anchor:middle;pointer-events:none}
/* Timeline卡片样式优化 */
.timeline{
  width:100%;
  padding:48px 40px !important;
}

.timeline .steps{
  list-style:none;
  padding:0;
  margin:0;
  display:flex;
  flex-direction:column;
  gap:32px;
}

.timeline .steps li{
  display:flex;
  align-items:center;
  gap:24px;
  padding:24px;
  background:linear-gradient(135deg,#f8fafc 0%,#ffffff 100%);
  border-radius:16px;
  transition:all 0.3s ease;
  position:relative;
  overflow:hidden;
}

.timeline .steps li::before{
  content:'';
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  width:4px;
  background:linear-gradient(180deg,#3b82f6 0%,#8b5cf6 100%);
  transition:width 0.3s ease;
}

.timeline .steps li:hover{
  transform:translateX(8px);
  box-shadow:0 8px 24px rgba(59,130,246,0.15);
}

.timeline .steps li:hover::before{
  width:8px;
}

.timeline .steps .name{
  font-weight:700;
  color:#0f172a;
  font-size:18px;
  flex:1;
}

.timeline .steps .date{
  font-size:15px;
  color:#64748b;
  font-weight:600;
  padding:8px 16px;
  background:rgba(59,130,246,0.1);
  border-radius:8px;
}

/* 不同状态的样式 */
.timeline .steps li.done::before{
  background:linear-gradient(180deg,#10b981 0%,#059669 100%);
}

.timeline .steps li.processing::before{
  background:linear-gradient(180deg,#f59e0b 0%,#d97706 100%);
}

.timeline .steps li.todo::before{
  background:linear-gradient(180deg,#94a3b8 0%,#64748b 100%);
}

/* Achievements section样式优化 */
.achievements-content{
  display:flex;
  flex-direction:column;
  gap:24px;
}

/* 统计概览卡片 */
.stats-overview{
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:16px;
}

.stat-card{
  background:linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius:16px;
  padding:16px 20px;
  display:flex;
  align-items:center;
  gap:16px;
  box-shadow:0 6px 20px rgba(15, 23, 42, 0.06);
  transition:all 0.3s ease;
  position:relative;
  overflow:hidden;
}

.stat-card::before{
  content:'';
  position:absolute;
  inset:-2px;
  border-radius:20px;
  background:conic-gradient(from 180deg at 50% 50%, #3b82f6, #8b5cf6, #3b82f6);
  opacity:0;
  transition:opacity 0.3s ease;
  z-index:-1;
}

.stat-card:hover{
  transform:translateY(-4px);
  box-shadow:0 12px 32px rgba(15, 23, 42, 0.12);
}

.stat-card:hover::before{
  opacity:0.1;
}

.stat-icon{
  width:44px;
  height:44px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  box-shadow:0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-info{
  flex:1;
}

.stat-label{
  font-size:12px;
  color:#64748b;
  font-weight:600;
  margin-bottom:4px;
  text-transform:uppercase;
  letter-spacing:0.5px;
}

.stat-value{
  font-size:24px;
  font-weight:800;
  color:#0f172a;
  line-height:1;
}

.stat-value-small{
  font-size:14px;
  font-weight:700;
}

/* 成果卡片网格 */
.achievements-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));
  gap:24px;
}

.achievement-card{
  background:linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius:20px;
  padding:24px;
  box-shadow:0 8px 24px rgba(15, 23, 42, 0.08);
  transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position:relative;
  overflow:hidden;
  cursor:pointer;
}

.achievement-card::before{
  content:'';
  position:absolute;
  inset:-2px;
  border-radius:20px;
  background:linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  opacity:0;
  transition:opacity 0.3s ease;
  z-index:-1;
}

.achievement-card:hover{
  transform:translateY(-6px) scale(1.02);
  box-shadow:0 16px 40px rgba(15, 23, 42, 0.15);
}

.achievement-card:hover::before{
  opacity:0.08;
}

.achievement-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:16px;
}

.achievement-type-badge{
  padding:6px 14px;
  border-radius:8px;
  font-size:12px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.5px;
}

.badge-paper{
  background:linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color:#1e40af;
}

.badge-patent{
  background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color:#92400e;
}

.badge-dataset{
  background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color:#065f46;
}

.badge-model{
  background:linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
  color:#6b21a8;
}

.badge-report{
  background:linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  color:#991b1b;
}

.badge-custom{
  background:linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color:#3730a3;
}

.badge-default{
  background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color:#475569;
}

.achievement-date{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:13px;
  color:#64748b;
  font-weight:500;
}

.achievement-date svg{
  color:#94a3b8;
}

.achievement-title{
  font-size:18px;
  font-weight:700;
  color:#0f172a;
  margin:0 0 20px;
  line-height:1.4;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.achievement-footer{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding-top:16px;
  border-top:1px solid #e2e8f0;
}

.achievement-owner{
  display:flex;
  align-items:center;
  gap:10px;
}

.owner-avatar{
  width:32px;
  height:32px;
  border-radius:10px;
  background:linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color:#ffffff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:700;
  font-size:14px;
  box-shadow:0 2px 8px rgba(59, 130, 246, 0.3);
}

.owner-name{
  font-size:14px;
  font-weight:600;
  color:#475569;
}

/* 空状态优化 */
.achievement-empty{
  height:300px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:16px;
}

.achievement-empty svg{
  opacity:0.3;
}

.achievement-empty .empty-text{
  font-size:16px;
  color:#94a3b8;
  font-weight:500;
}

/* 成果统计页面使用与KPI页面相同的布局 */
.achievements-section .dashboard-cards-wrapper {
  align-items: stretch;
}

.achievements-section .stat-card-modern {
  flex: none;
  width: auto;
}

.achievements-section .chart-card-modern {
  flex: 1;
  min-width: 0;
}

/* 成果列表卡片 */
.achievements-list-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.achievements-list-card .task-list-items {
  max-height: 240px;
  overflow-y: auto;
}

.achievements-list-card .task-list-compact {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.achievement-list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  color: #94a3b8;
}

/* 成果类型小徽章 */
.achievement-type-badge-small {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

/* 成果状态点样式 */
.task-item-status.status-paper {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.task-item-status.status-patent {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.task-item-status.status-dataset {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.task-item-status.status-model {
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

.task-item-status.status-report {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.task-item-status.status-custom {
  background: #6366f1;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
}

.task-item-status.status-default {
  background: #64748b;
  box-shadow: 0 0 8px rgba(100, 116, 139, 0.4);
}

/* 成员贡献图表卡片 */
.member-contribution-chart {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
}

.member-contribution-chart .chart-header {
  margin-bottom: 12px;
}

.member-contribution-chart .chart-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.member-contribution-chart .chart-subtitle {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.member-contribution-chart .chart-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 堆叠面积图 */
.stacked-area-chart {
  width: 100%;
  height: 320px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.contribution-svg {
  width: 100%;
  height: 100%;
}

.area-path {
  transition: all 0.3s ease;
  cursor: pointer;
  transform-origin: center bottom;
}

/* 面积图初始状态（未触发动画时） */
.stacked-area-chart:not(.chart-animated) .area-path {
  opacity: 0;
  transform: scaleY(0);
}

/* 面积图动画 */
.stacked-area-chart.chart-animated .area-path.achievement-area {
  animation: areaGrowUp 0.8s ease-out forwards;
}

.stacked-area-chart.chart-animated .area-path.wiki-area {
  animation: areaGrowUp 0.8s ease-out 0.2s forwards;
  opacity: 0;
}

@keyframes areaGrowUp {
  0% {
    opacity: 0;
    transform: scaleY(0);
  }
  60% {
    transform: scaleY(1.02);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

/* 悬停Wiki区域时，成果区域变暗 */
.area-path.wiki-area.active {
  filter: brightness(1.1);
}

.area-path.achievement-area.dimmed {
  filter: brightness(0.6);
  opacity: 0.7;
}

/* 悬停成果区域时，Wiki区域变暗 */
.area-path.achievement-area.active {
  filter: brightness(1.1);
}

.area-path.wiki-area.dimmed {
  filter: brightness(0.6);
  opacity: 0.7;
}

.axis-label {
  font-size: 10px;
  fill: #64748b;
  font-weight: 500;
}

.chart-empty {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f8fafc, #fff);
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
}

/* 贡献图例 */
.contribution-legend {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.contribution-legend .legend-item-modern {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.contribution-legend .legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.contribution-legend .legend-text {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.contribution-legend .legend-value {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .achievements-section .dashboard-cards-wrapper {
    grid-template-columns: 1fr;
  }
  
  .achievements-section .stat-card-modern,
  .achievements-section .chart-card-modern {
    width: 100%;
  }
}

/* 表格样式优化 */
.table{
  width:100%;
  border-collapse:collapse;
}

.table th{
  border-bottom:2px solid #e2e8f0;
  padding:16px 12px;
  text-align:left;
  font-size:15px;
  color:#475569;
  font-weight:700;
  background:linear-gradient(180deg,#f8fafc 0%,#ffffff 100%);
  text-transform:uppercase;
  letter-spacing:0.5px;
}

.table td{
  border-bottom:1px solid #f1f5f9;
  padding:16px 12px;
  text-align:left;
  font-size:15px;
  color:#334155;
  transition:background 0.2s ease;
}

.table tbody tr:hover td{
  background:rgba(59,130,246,0.05);
}
.badge{padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600}
.badge.success{background:#dcfce7;color:#15803d}
.badge.warning{background:#fef9c3;color:#a16207}
.badge.draft{background:#e5e7eb;color:#4b5563}
.badge.obsolete{background:#f3f4f6;color:#6b7280}
.achievement-empty{height:200px;display:flex;align-items:center;justify-content:center}
@media (max-width: 1024px){
  .kpis{grid-template-columns:1fr 1fr}
  .charts{grid-template-columns:1fr}
}
@keyframes dash{to{stroke-dashoffset:0}}

/* 提示气泡 */
.tooltip{position:fixed;z-index:10;pointer-events:none;background:#111827;color:#fff;border-radius:8px;padding:8px 10px;box-shadow:0 8px 24px rgba(0,0,0,.18)}
.tooltip-title{font-size:12px;color:#cbd5e1;margin-bottom:4px}
.tooltip-value{font-size:14px;font-weight:700}
.tooltip-task-list{max-width:260px;max-height:260px;overflow:auto;margin-top:4px;padding-right:4px}
.tooltip-task-list ul{list-style:none;margin:0;padding:0}
.tooltip-task-item{padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.35)}
.tooltip-task-item:last-child{border-bottom:none}
.tooltip-task-item .task-title{font-size:13px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;color:#ffffff}
.tooltip-task-item .task-title .task-owner{font-size:12px;color:rgba(226,232,240,0.9);margin-left:4px}
.tooltip-task-item .task-meta{font-size:11px;color:#9ca3af;margin-top:2px}
.tooltip-empty{font-size:12px;color:#9ca3af;padding:4px 0}

/* 成员提交信息界面样式 */
.member-submission-section {
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
}

.member-submission-section .dashboard-cards-wrapper {
  align-items: stretch;
}

.member-submission-section .stat-card-modern {
  flex: none;
  width: auto;
}

.member-submission-section .chart-card-modern {
  flex: 1;
  min-width: 0;
}

/* 提交统计卡片 */
.submission-stats-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.submission-stats-card .task-list-items {
  max-height: 350px;
  overflow-y: auto;
}

/* 提交时间徽章 */
.submission-time-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0369a1;
  flex-shrink: 0;
}

/* 提交时间线卡片 */
.submission-timeline-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.submission-timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.submission-timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  position: relative;
}

.submission-timeline-item .timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.submission-timeline-item .timeline-line {
  position: absolute;
  left: 5px;
  top: 28px;
  width: 2px;
  height: calc(100% - 4px);
  background: linear-gradient(180deg, #e2e8f0 0%, #f1f5f9 100%);
}

.submission-timeline-item .timeline-content {
  flex: 1;
  min-width: 0;
}

.submission-timeline-item .timeline-task-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submission-timeline-item .timeline-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.submission-timeline-item .timeline-submitter {
  display: flex;
  align-items: center;
  gap: 4px;
}

.submission-timeline-item .timeline-time {
  color: #94a3b8;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .member-submission-section .dashboard-cards-wrapper {
    grid-template-columns: 1fr;
  }
  
  .member-submission-section .stat-card-modern,
  .member-submission-section .chart-card-modern {
    width: 100%;
  }
}

/* 成员任务列表卡片 */
.member-tasks-list-card {
  min-height: auto;
  max-height: calc(100vh - 180px);
  padding: 16px !important;
}

.member-list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-icon-wrapper.small {
  width: 36px;
  height: 36px;
  padding: 8px;
}

.stat-content.compact {
  flex: 1;
}

.stat-content.compact .stat-label {
  font-size: 12px;
  margin-bottom: 2px;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-value.small {
  font-size: 24px;
}

.stat-value-row .stat-description {
  font-size: 12px;
  color: #64748b;
}

.member-tasks-list-card .task-list-compact {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}

/* 成员任务项样式 */
.member-task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px !important;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.member-task-item .task-item-content {
  flex: 1;
  min-width: 0;
}

.member-task-item .task-item-name {
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 2px;
}

.task-item-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.stat-badge.total {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.stat-badge.completed {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.stat-badge svg {
  width: 10px;
  height: 10px;
}

.completion-rate {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.completion-rate.rate-high {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.completion-rate.rate-medium {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.completion-rate.rate-low {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.member-list-empty {
  padding: 40px 20px;
  text-align: center;
}

/* 右侧图表区域 */
.charts-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  height: calc(100vh - 200px);
  max-height: 600px;
}

.charts-grid .chart-item {
  flex: 1;
  height: 50%;
  max-height: 280px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.charts-grid .chart-item .bidirectional-bar-chart,
.charts-grid .chart-item .task-timeline-scatter {
  flex: 1;
  max-height: 180px;
}

.charts-grid .chart-item svg {
  width: 100%;
  height: 100%;
  max-height: 160px;
}

.charts-grid .card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.timeline-chart-item {
  padding-top: 8px !important;
  overflow: visible !important;
}

.timeline-chart-item .timeline-title {
  margin-bottom: 2px;
}

.timeline-chart-item .task-timeline-scatter {
  margin-top: 0;
  overflow: visible;
}

.timeline-chart-item .timeline-scatter-svg {
  overflow: visible;
}

/* 成员任务统计双向柱状图 */
.member-task-chart-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  width: 100%;
  display: flex;
  flex-direction: column;
}

.member-task-chart-card .chart-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bidirectional-bar-chart {
  width: 100%;
  overflow-x: auto;
  padding: 5px 0;
}

.member-task-svg {
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 320px;
}
  
.member-task-svg .bar-total,
.member-task-svg .bar-completed {
  transition: opacity 0.3s ease, filter 0.3s ease;
  cursor: pointer;
}

/* 上方柱子：从底部（横轴）向上延伸 */
.member-task-svg .bar-total {
  transform-origin: center bottom;
  filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
  transition: filter 0.3s ease, opacity 0.3s ease;
}

/* 下方柱子：从顶部（横轴）向下延伸 */
.member-task-svg .bar-completed {
  transform-origin: center top;
  filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
  transition: filter 0.3s ease, opacity 0.3s ease;
}

/* 上方柱子初始状态（未触发动画时） */
.member-task-svg .bars:not(.bars-animated) .bar-total {
  transform: scaleY(0);
  opacity: 0;
}

/* 下方柱子初始状态（未触发动画时） */
.member-task-svg .bars:not(.bars-animated) .bar-completed {
  transform: scaleY(0);
  opacity: 0;
}

/* 上方柱子动画（从横轴向上延伸，带弹性效果） */
.member-task-svg .bars.bars-animated .bar-total {
  animation: barGrowUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: inherit;
}

/* 下方柱子动画（从横轴向下延伸，带弹性效果，稍微延迟） */
.member-task-svg .bars.bars-animated .bar-completed {
  animation: barGrowDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: inherit;
}

/* 让柱子组继承延迟变量 */
.member-task-svg .bars.bars-animated > g {
  --bar-delay: var(--delay, 0s);
}

.member-task-svg .bars.bars-animated > g .bar-total {
  animation-delay: var(--delay, 0s);
}

.member-task-svg .bars.bars-animated > g .bar-completed {
  animation-delay: calc(var(--delay, 0s) + 0.15s);
}

/* 上方柱子弹性生长动画 */
@keyframes barGrowUp {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  70% {
    transform: scaleY(1.08);
  }
  85% {
    transform: scaleY(0.96);
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* 下方柱子弹性生长动画 */
@keyframes barGrowDown {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  70% {
    transform: scaleY(1.08);
  }
  85% {
    transform: scaleY(0.96);
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.member-task-svg .bar-total:hover {
  filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.5)) brightness(1.1);
  cursor: pointer;
}

.member-task-svg .bar-completed:hover {
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.5)) brightness(1.1);
  cursor: pointer;
}

/* 悬停上方柱子时，下方柱子变暗 */
.member-task-svg .bars.hover-total .bar-completed {
  opacity: 0.35;
  filter: drop-shadow(0 1px 2px rgba(239, 68, 68, 0.15)) brightness(0.8);
}

/* 悬停下方柱子时，上方柱子变暗 */
.member-task-svg .bars.hover-completed .bar-total {
  opacity: 0.35;
  filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.15)) brightness(0.8);
}

.member-task-svg .axis-label {
  font-size: 11px;
  fill: #64748b;
  font-weight: 500;
}

.member-task-svg .member-name-label {
  font-size: 12px;
  fill: #334155;
  font-weight: 600;
}

/* 成员任务图例 */
.member-task-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-shrink: 0;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.member-task-legend .legend-item-modern {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f8fafc;
  border-radius: 10px;
}

.member-task-legend .legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.member-task-legend .legend-text {
  font-size: 11px;
  color: #475569;
  font-weight: 500;
}

/* 成员任务统计Tooltip */
.bidirectional-bar-chart {
  position: relative;
}

/* 固定定位的 tooltip，放在根级别避免被裁剪 */
.member-task-tooltip-fixed {
  position: fixed;
  z-index: 9999;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  min-width: 140px;
  animation: tooltipFadeIn 0.15s ease-out;
}

.member-task-tooltip-fixed .tooltip-header {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.member-task-tooltip-fixed .tooltip-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.member-task-tooltip-fixed .tooltip-label {
  font-size: 12px;
  color: #94a3b8;
}

.member-task-tooltip-fixed .tooltip-value {
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
}

.member-task-tooltip {
  position: absolute;
  z-index: 100;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  min-width: 140px;
  transform: translateY(-10px);
  animation: tooltipFadeIn 0.15s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(-10px);
  }
}

.member-task-tooltip .tooltip-header {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.member-task-tooltip .tooltip-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.member-task-tooltip .tooltip-label {
  font-size: 12px;
  color: #94a3b8;
}

.member-task-tooltip .tooltip-value {
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
}

/* 任务完成时间线散点图 */
.task-timeline-card {
  margin-top: 0;
}

.task-timeline-scatter {
  position: relative;
  width: 100%;
  padding: 10px 0;
}

.timeline-scatter-svg {
  width: 100%;
  height: auto;
  max-height: 350px;
}

.timeline-scatter-svg .axis-label {
  font-size: 11px;
  fill: #64748b;
  font-weight: 500;
}

.timeline-scatter-svg .date-label {
  font-size: 10px;
}

.timeline-scatter-svg .member-label {
  font-size: 11px;
  fill: #334155;
  font-weight: 600;
}

.timeline-scatter-svg .task-bubble {
  cursor: pointer;
  transition: filter 0.3s ease, opacity 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  transform-origin: center;
  opacity: 0;
  transform: scale(0);
}

/* 只有当父元素有 bubbles-animated class 时才播放入场动画 */
.timeline-scatter-svg .scatter-bubbles.bubbles-animated .task-bubble {
  animation: bubbleEnter 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.timeline-scatter-svg .task-bubble:hover {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35)) brightness(1.15);
}

/* 入场动画 */
@keyframes bubbleEnter {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 浮动动画1 - 上下浮动（只在动画触发后播放） */
.timeline-scatter-svg .scatter-bubbles.bubbles-animated .bubble-float-1 {
  animation: bubbleEnter 0.6s ease-out forwards, bubbleFloat1 3s ease-in-out infinite;
  animation-delay: var(--delay, 0s), calc(var(--delay, 0s) + 0.6s);
}

/* 浮动动画2 - 斜向浮动（只在动画触发后播放） */
.timeline-scatter-svg .scatter-bubbles.bubbles-animated .bubble-float-2 {
  animation: bubbleEnter 0.6s ease-out forwards, bubbleFloat2 4s ease-in-out infinite;
  animation-delay: var(--delay, 0s), calc(var(--delay, 0s) + 0.6s);
}

/* 浮动动画3 - 缩放呼吸（只在动画触发后播放） */
.timeline-scatter-svg .scatter-bubbles.bubbles-animated .bubble-float-3 {
  animation: bubbleEnter 0.6s ease-out forwards, bubbleFloat3 3.5s ease-in-out infinite;
  animation-delay: var(--delay, 0s), calc(var(--delay, 0s) + 0.6s);
}

@keyframes bubbleFloat1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes bubbleFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(1.5px, -1.5px); }
}

@keyframes bubbleFloat3 {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* 时间线散点图Tooltip */
.timeline-scatter-tooltip {
  position: absolute;
  z-index: 100;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  min-width: 180px;
  max-width: 280px;
  transform: translateY(-10px);
  animation: tooltipFadeIn 0.15s ease-out;
}

.timeline-scatter-tooltip .tooltip-header {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.timeline-scatter-tooltip .tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-scatter-tooltip .tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.timeline-scatter-tooltip .tooltip-label {
  font-size: 12px;
  color: #94a3b8;
}

.timeline-scatter-tooltip .tooltip-value {
  font-size: 13px;
  font-weight: 600;
  color: #a78bfa;
  text-align: right;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-data-hint {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;
}
</style>


