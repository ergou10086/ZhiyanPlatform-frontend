<template>
  <div class="knowledge-base-container">
    <!-- 侧边栏 -->
    <Sidebar :isOpen="sidebarOpen" @close="closeSidebar" />
    
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="menu-btn" @click="toggleSidebar" aria-label="open sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">知识库</span>
      </div>
    </div>

    <!-- 主要内容区域 - 直接显示项目列表 -->
    <div class="main-content">
      <div class="section-card">
        <div class="section-title">我的知识库</div>
        <div class="section-subtitle">管理您参与的项目知识文档</div>
      </div>
      
      <div class="grid">
        <div 
          v-for="(project, index) in joinedProjects" 
          :key="project.id" 
          class="card"
          @click="viewProjectKnowledge(project)"
        >
          <div class="card-media" :class="`gradient-${(index % 6) + 1}`">
            <span>{{ project.category }}</span>
          </div>
          <div class="card-body">
            <div class="card-title-row">
              <h3 class="card-title">{{ project.title }}</h3>
              <span class="status-badge" :class="statusClass(project.status)">{{ project.status }}</span>
            </div>
            <ul class="meta-list">
              <li>
                <span class="meta-label">团队规模：</span>
                <span class="meta-value">{{ project.teamSize }}人</span>
              </li>
              <li>
                <span class="meta-label">数据资产：</span>
                <span class="meta-value">{{ project.dataAssets }}</span>
              </li>
              <li>
                <span class="meta-label">研究方向：</span>
                <span class="meta-value">{{ project.direction }}</span>
              </li>
              <li>
                <span class="meta-label">AI 核心：</span>
                <span class="meta-value">{{ project.aiCore }}</span>
              </li>
            </ul>
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
      // 用户加入的项目列表
      joinedProjects: [
        {
          id: 1,
          title: '多模态医学影像数据平台',
          category: '医疗健康',
          status: '稳健中',
          teamSize: 8,
          dataAssets: 'MRI, CT, PET扫描',
          direction: '肿瘤检测算法',
          aiCore: '深度学习模型'
        },
        {
          id: 2,
          title: '气候变化预测模型研究',
          category: '环境气候',
          status: '进行中',
          teamSize: 12,
          dataAssets: '气象站数据',
          direction: '气候建模',
          aiCore: '神经网络预测'
        },
        {
          id: 3,
          title: '基因组数据分析平台',
          category: '生物信息',
          status: '已完成',
          teamSize: 6,
          dataAssets: '基因序列数据',
          direction: '基因变异分析',
          aiCore: '机器学习算法'
        },
        {
          id: 4,
          title: '脑科学神经网络研究',
          category: '科研探索',
          status: '稳健中',
          teamSize: 10,
          dataAssets: '脑电信号数据',
          direction: '模式识别',
          aiCore: '卷积神经网络'
        },
        {
          id: 5,
          title: '新型材料发现研究平台',
          category: '材料科学',
          status: '进行中',
          teamSize: 15,
          dataAssets: '材料属性数据',
          direction: '材料设计',
          aiCore: '强化学习'
        },
        {
          id: 6,
          title: '深空天体观测数据分析',
          category: '天文学',
          status: '稳健中',
          teamSize: 7,
          dataAssets: '天文观测数据',
          direction: '天体分类',
          aiCore: '图像识别算法'
        }
      ]
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    viewProjectKnowledge(project) {
      // 跳转到项目知识库分类界面（图3）
      this.$router.push(`/project-knowledge/${project.id}`)
    },
    statusClass(status) {
      const statusMap = {
        '稳健中': 'stable',
        '进行中': 'progress',
        '已完成': 'completed'
      }
      return statusMap[status] || 'stable'
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
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 40px - 28px);
}

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

/* 项目网格样式 - 完全按照项目广场的样式 */
.grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  align-content: start;
  padding-bottom: 10px;
}

.card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 280px;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-media {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  border-radius: 10px 10px 0 0;
}

.gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.gradient-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.gradient-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.gradient-6 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

.card-media::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.card-media span {
  position: relative;
  z-index: 2;
}

.card-body { 
  padding: 16px; 
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.stable {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.progress {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.completed {
  background: #e8f5e8;
  color: #388e3c;
}

.meta-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.meta-list li {
  display: flex;
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 1.4;
}

.meta-label {
  color: #6b7280;
  margin-right: 4px;
  flex-shrink: 0;
}

.meta-value {
  color: #374151;
  flex: 1;
}

@media (max-width: 1200px) {
  .grid { 
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .grid { 
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .grid { 
    grid-template-columns: 1fr;
  }
}
</style>
