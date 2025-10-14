<template>
  <div class="knowledge-base-container">
    <!-- 侧边栏 -->
    <Sidebar :isOpen="sidebarOpen" @close="closeSidebar" />
    
    <!-- 顶部导航栏（不含右侧提醒/设置/搜索） -->
    <div class="top-header">
      <div class="header-left">
        <button class="menu-btn" @click="toggleSidebar" aria-label="open sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">未来教育管理会议</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-layout leftbar">
        <!-- 页面内左侧选项栏 -->
        <aside class="left-options">
          <div class="options-card">
            <div class="options-title">选项</div>
            <div class="option-item" :class="{ active: activeTab==='home' }" @click="activeTab='home'">
              <span>主页</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='catalog' }" @click="activeTab='catalog'">
              <span>目录</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='cabinet' }" @click="activeTab='cabinet'">
              <span>知识柜</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='ai' }" @click="activeTab='ai'">
              <span>AI 赋能</span>
            </div>
          </div>
        </aside>

        <!-- 右侧内容主体 -->
        <div class="content-right">
          <!-- 顶部介绍 -->
          <div class="kb-header">
            <div class="kb-title">未来教育管理会议</div>
            <div class="kb-subtitle">欢迎来到项目空间，这是围绕AI教育与知识管理的核心平台，通过目录系统统一管理各类成果，利用知识库沉淀团队智慧，并借助AI助理赋能提升工作效率。</div>
          </div>

          <!-- 统计卡片（仅主页显示） -->
          <div v-if="activeTab==='home'">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-title">成果总数</div>
                <div class="stat-icon blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="stat-value">142</div>
              <div class="stat-desc">较上月增长 12%</div>
            </div>

            <div class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-title">知识文档</div>
                <div class="stat-icon green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19H20M4 5H20M7 5V19M17 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="stat-value">87</div>
              <div class="stat-desc">协作编辑中 5 篇</div>
            </div>

            <div class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-title">团队成员</div>
                <div class="stat-icon purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="stat-value">12</div>
              <div class="stat-desc">在线 8 人</div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">最近活动</div>
            </div>
            <div class="activity-list">
              <div v-for="item in activities" :key="item.id" class="activity-item">
                <div class="activity-bullet" :class="item.type"></div>
                <div class="activity-main">
                  <div class="activity-text">{{ item.text }}</div>
                  <div class="activity-meta">{{ item.time }}</div>
                </div>
              </div>
            </div>
          </div>
          </div>

          <!-- 目录面板 -->
          <div v-else-if="activeTab==='catalog'">
            <div class="card">
              <div class="card-header"><div class="card-title">目录</div></div>
              <div class="panel-body">这里是目录内容区域（与主页分开）。可接入目录树、搜索、筛选等。</div>
            </div>
          </div>

          <!-- 知识柜面板 -->
          <div v-else-if="activeTab==='cabinet'">
            <div class="card">
              <div class="card-header"><div class="card-title">知识柜</div></div>
              <div class="panel-body">这里展示知识柜模块内容，如收藏、分类、最近使用等。</div>
            </div>
          </div>

          <!-- AI 赋能面板 -->
          <div v-else>
            <div class="card">
              <div class="card-header"><div class="card-title">AI 赋能</div></div>
              <div class="panel-body">这里展示 AI 相关功能入口，如智能摘要、标签生成、问答等。</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'KnowledgeBase',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      activeTab: 'home',
      activities: [
        { id: 1, type: 'doc', text: '张伟上传了论文《基于AI的教育个性化推荐系统研究》', time: '2小时前' },
        { id: 2, type: 'update', text: '李梦更新了知识文档《项目管理规范V2.1》', time: '3小时前' },
        { id: 3, type: 'ai', text: 'AI助手为《深度学习在教育中的应用》生成了摘要和标签', time: '1天前' }
      ]
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    }
  }
}
</script>

<style scoped>
.knowledge-base-container {
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
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
  padding: 8px;
  border-radius: 6px;
  color: #666;
}

.menu-btn:hover { background-color: #f8f9fa; }

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.main-content {
  flex: 1;
  padding: 20px 24px 28px;
}

.content-layout.leftbar { display: grid; grid-template-columns: 220px 1fr; gap: 16px; align-items: start; }
.left-options { position: sticky; top: 20px; }
.options-card { background: #fff; border: 1px solid #eef0f2; border-radius: 12px; padding: 8px; margin-bottom: 12px; min-height: calc(100vh - 64px - 40px); display: flex; flex-direction: column; }
.options-title { font-size: 14px; color: #6b7280; padding: 8px 10px; }
.option-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; color: #374151; }
.option-item:hover { background: #f6f7fb; }
.option-item.active { background: #eef2ff; color: #4f46e5; }
.content-right { min-width: 0; }
.panel-body { padding: 14px; color: #4b5563; font-size: 14px; }

.kb-header { margin-bottom: 16px; }
.kb-title { font-size: 18px; font-weight: 600; color: #333; }
.kb-subtitle { margin-top: 6px; color: #6b7280; font-size: 13px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  padding: 16px;
}

.stat-card-header { display: flex; align-items: center; justify-content: space-between; }
.stat-card-title { color: #6b7280; font-size: 14px; }
.stat-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
.stat-icon.blue { background: #4f46e5; }
.stat-icon.green { background: #10b981; }
.stat-icon.purple { background: #8b5cf6; }
.stat-value { font-size: 28px; font-weight: 700; color: #111827; margin-top: 8px; }
.stat-desc { color: #9ca3af; font-size: 12px; margin-top: 4px; }

.card { background: #fff; border: 1px solid #eef0f2; border-radius: 12px; }
.card-header { padding: 16px; border-bottom: 1px solid #f1f3f5; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }

.activity-list { padding: 8px 12px 12px; }
.activity-item { display: flex; gap: 12px; padding: 10px 8px; align-items: flex-start; }
.activity-bullet { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; }
.activity-bullet.doc { background: #3b82f6; }
.activity-bullet.update { background: #22c55e; }
.activity-bullet.ai { background: #a855f7; }
.activity-main { flex: 1; }
.activity-text { color: #374151; font-size: 14px; }
.activity-meta { color: #9ca3af; font-size: 12px; margin-top: 4px; }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: 1fr; }
  .content-layout.leftbar { grid-template-columns: 1fr; }
  .left-options { position: static; }
}
</style>
