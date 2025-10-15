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
            <div class="option-item" :class="{ active: activeTab==='home' }" @click="goTab('home')">
              <span>主页</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='catalog' }" @click="goTab('catalog')">
              <span>成果目录</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='cabinet' }" @click="goTab('cabinet')">
              <span>知识柜</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='ai' }" @click="goTab('ai')">
              <span>AI 赋能</span>
            </div>
          </div>
        </aside>

        <!-- 右侧内容主体 -->
        <div class="content-right">
          <!-- 顶部介绍（仅主页显示） -->
          <div v-if="activeTab==='home'" class="kb-header">
            <div class="kb-title">未来教育管理会议</div>
            <div class="kb-subtitle">欢迎来到项目空间，这是围绕AI教育与知识管理的核心平台，通过目录系统统一管理各类成果，利用知识库沉淀团队智慧，并借助AI助理赋能提升工作效率。</div>
          </div>

          <!-- 统计卡片（仅主页显示） -->
          <div v-if="activeTab==='home'" class="home-content">
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
          <KnowledgeBaseCatalog v-else-if="activeTab==='catalog'" :archiveRows="archiveRows" />

          <!-- 知识柜面板 -->
          <KnowledgeBaseCabinet v-else-if="activeTab==='cabinet'" />

          <!-- AI 赋能面板 -->
          <KnowledgeBaseAI v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import KnowledgeBaseCatalog from './KnowledgeBaseCatalog.vue'
import KnowledgeBaseCabinet from './KnowledgeBaseCabinet.vue'
import KnowledgeBaseAI from './KnowledgeBaseAI.vue'

export default {
  name: 'KnowledgeBase',
  components: {
    Sidebar,
    KnowledgeBaseCatalog,
    KnowledgeBaseCabinet,
    KnowledgeBaseAI
  },
  data() {
    return {
      sidebarOpen: false,
      activeTab: 'home',
      activities: [
        { id: 1, type: 'doc', text: '张伟上传了论文《基于AI的教育个性化推荐系统研究》', time: '2小时前' },
        { id: 2, type: 'update', text: '李梦更新了知识文档《项目管理规范V2.1》', time: '3小时前' },
        { id: 3, type: 'ai', text: 'AI助手为《深度学习在教育中的应用》生成了摘要和标签', time: '1天前' }
      ],
      archiveRows: [
        { id: 1, name: '基于AI的教育个性化推荐系统研究.pdf', type: '论文', uploader: '张伟', time: '2023-11-15 14:30', typeCls: 'doc' },
        { id: 2, name: '智能教学系统交互方法专利.docx', type: '专利', uploader: '李想', time: '2023-11-10 09:15', typeCls: 'patent' },
        { id: 3, name: '学生行为数据集样例.csv', type: '数据集', uploader: '王强', time: '2023-11-05 16:45', typeCls: 'dataset' },
        { id: 4, name: '个性化推荐模型_v2.pkl', type: '模型文件', uploader: '赵敏', time: '2023-10-28 11:20', typeCls: 'model' },
        { id: 5, name: '深度学习课堂实验报告.pdf', type: '实验报告', uploader: '陈美玲', time: '2023-10-22 13:40', typeCls: 'report' }
      ]
    }
  },
  created() {
    this.syncTabWithRoute()
  },
  watch: {
    $route() {
      this.syncTabWithRoute()
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    syncTabWithRoute() {
      if (this.$route.path.startsWith('/knowledge-base/')) {
        const seg = this.$route.path.split('/')[2] || 'home'
        this.activeTab = seg
      } else if (this.$route.path === '/knowledge-base') {
        this.activeTab = 'home'
      }
    },
    goTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab
      const target = `/knowledge-base/${tab}`
      if (this.$route.path !== target) {
        this.$router.push(target)
      }
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

.content-layout.leftbar { 
  display: grid; 
  grid-template-columns: 220px 1fr; 
  gap: 16px; 
  align-items: start; 
  height: calc(100vh - 64px - 40px - 28px); /* 减去顶部导航、主内容padding和底部padding */
}
.left-options { position: sticky; top: 20px; }
.options-card { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  padding: 8px; 
  margin-bottom: 12px; 
  height: calc(100vh - 64px - 40px - 28px); /* 与右侧内容高度一致 */
  display: flex; 
  flex-direction: column; 
}
.options-title { font-size: 14px; color: #6b7280; padding: 8px 10px; }
.option-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; color: #374151; }
.option-item:hover { background: #f6f7fb; }
.option-item.active { background: #eef2ff; color: #4f46e5; }
.content-right { 
  min-width: 0; 
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 40px - 28px); /* 与左侧边栏高度一致 */
}
.panel-body { padding: 14px; color: #4b5563; font-size: 14px; }

/* 主页内容样式 */
.home-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* 允许flex子元素收缩 */
}

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

.card { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许flex子元素收缩 */
}
.card-header { 
  padding: 16px; 
  border-bottom: 1px solid #f1f3f5; 
  flex-shrink: 0; /* 防止头部收缩 */
}
.card-title { font-size: 16px; font-weight: 600; color: #333; }

.activity-list { 
  padding: 8px 12px 12px; 
  flex: 1; 
  overflow-y: auto; /* 允许滚动 */
  min-height: 0; /* 允许flex子元素收缩 */
}
.activity-item { display: flex; gap: 12px; padding: 10px 8px; align-items: flex-start; }
.activity-bullet { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; }
.activity-bullet.doc { background: #3b82f6; }
.activity-bullet.update { background: #22c55e; }
.activity-bullet.ai { background: #a855f7; }
.activity-main { flex: 1; }
.activity-text { color: #374151; font-size: 14px; }
.activity-meta { color: #9ca3af; font-size: 12px; margin-top: 4px; }

.section-card { background: #fff; border: 1px solid #eef0f2; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: #333; }
.section-title.small { font-size: 14px; }
.section-subtitle { color: #9ca3af; font-size: 12px; margin-top: 6px; }

.add-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.add-card { border: 1px solid #eef0f2; border-radius: 12px; padding: 14px; background: #fff; }
.add-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.add-name { color: #374151; font-weight: 600; }
.add-desc { color: #9ca3af; font-size: 12px; margin-bottom: 8px; }
.add-link { color: #4f46e5; font-size: 12px; text-decoration: none; }
.add-link:hover { text-decoration: underline; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-blue { background: #3b82f6; }
.dot-orange { background: #f59e0b; }
.dot-green { background: #10b981; }
.dot-purple { background: #8b5cf6; }
.dot-yellow { background: #fbbf24; }
.dot-pink { background: #f472b6; }

.table-wrap { width: 100%; overflow: auto; border: 1px solid #eef0f2; border-radius: 12px; background: #fff; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-table thead th { text-align: left; font-size: 13px; color: #6b7280; padding: 12px 14px; border-bottom: 1px solid #f1f3f5; }
.doc-table tbody td { padding: 12px 14px; font-size: 14px; color: #374151; border-bottom: 1px solid #f7f7f8; }
.filename { display: flex; align-items: center; gap: 8px; }
.file-dot { width: 10px; height: 10px; border-radius: 50%; }
.file-dot.doc { background: #3b82f6; }
.file-dot.patent { background: #f59e0b; }
.file-dot.dataset { background: #10b981; }
.file-dot.model { background: #8b5cf6; }
.file-dot.report { background: #fbbf24; }
.ops a { color: #4f46e5; text-decoration: none; margin-right: 12px; font-size: 13px; }
.ops a:hover { text-decoration: underline; }

.pagination.line { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.pager-text { color: #9aa0a6; font-size: 12px; }
.pager-group { display: flex; gap: 6px; align-items: center; }
.pager.small, .page-num.small { height: 28px; min-width: 28px; padding: 0 10px; border: 1px solid #e0e0e0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; }
.page-num.small.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: 1fr; }
  .content-layout.leftbar { grid-template-columns: 1fr; }
  .left-options { position: static; }
  .add-grid { grid-template-columns: 1fr; }
}
</style>
