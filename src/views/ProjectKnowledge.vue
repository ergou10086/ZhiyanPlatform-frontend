<template>
  <div class="knowledge-base-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="返回">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">{{ projectName }} 知识库</span>
      </div>
      <div class="header-right">
        <div class="translate-icon">译</div>
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
            <div class="kb-title">{{ projectName }}</div>
            <div class="kb-subtitle">欢迎来到项目知识库，这是围绕AI教育与知识管理的核心平台，通过目录系统统一管理各类成果，利用知识库沉淀团队智慧，并借助AI助理赋能提升工作效率。</div>
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
              <div class="stat-value">{{ totalAchievements }}</div>
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
              <div class="stat-value">{{ totalDocuments }}</div>
              <div class="stat-desc">协作编辑中 {{ editingDocuments }} 篇</div>
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


          <!-- 最近活动（仅主页显示） -->
          <div v-if="activeTab==='home'" class="card">
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
          <KnowledgeBaseCatalog 
            v-else-if="activeTab==='catalog'" 
            :archiveRows="archiveRows" 
            :projectId="projectId" 
            @file-uploaded="handleFileUploaded"
            @file-deleted="handleFileDeleted"
            @file-edited="handleFileEdited"
          />

          <!-- 知识柜面板 -->
          <KnowledgeBaseCabinet v-else-if="activeTab==='cabinet'" :projectId="projectId" @document-created="handleDocumentCreated" />

          <!-- AI 赋能面板 -->
          <KnowledgeBaseAI v-else :projectId="projectId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import KnowledgeBaseCatalog from './KnowledgeBaseCatalog.vue'
import KnowledgeBaseCabinet from './KnowledgeBaseCabinet.vue'
import KnowledgeBaseAI from './KnowledgeBaseAI.vue'

export default {
  name: 'ProjectKnowledge',
  components: {
    KnowledgeBaseCatalog,
    KnowledgeBaseCabinet,
    KnowledgeBaseAI
  },
  data() {
    return {
      activeTab: 'home',
      projectId: null,
      projectName: '加载中...',
      activities: [
        { id: 1, type: 'doc', text: '张伟上传了论文《基于AI的教育个性化推荐系统研究》', time: '2小时前' },
        { id: 2, type: 'update', text: '李梦更新了知识文档《项目管理规范V2.1》', time: '3小时前' },
        { id: 3, type: 'ai', text: 'AI助手为《深度学习在教育中的应用》生成了摘要和标签', time: '1天前' },
        { id: 4, type: 'edit', text: '编辑了论文的详细描述：基于AI的教育个性化推荐系统研究', time: '2天前' },
        { id: 5, type: 'delete', text: '删除了数据集：旧版本学生行为数据', time: '3天前' }
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
  computed: {
    // 计算成果总数（从成果目录获取）
    totalAchievements() {
      return this.archiveRows.length + this.getUploadedFilesCount()
    },
    
    // 计算知识文档总数（从知识柜获取）
    totalDocuments() {
      return this.getDocumentsCount()
    },
    
    // 计算正在编辑的文档数
    editingDocuments() {
      return this.getEditingDocumentsCount()
    }
  },
  mounted() {
    this.projectId = this.$route.params.id
    this.loadProjectName()
    // 组件挂载时加载本地存储的数据
    this.loadFromLocalStorage()
    // 初始化项目特定的示例数据
    this.initializeProjectData()
  },
  beforeDestroy() {
    // 组件销毁前保存数据
    this.saveToLocalStorage()
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    goTab(tab) {
      if (this.activeTab === tab) return
      this.activeTab = tab
    },
    loadProjectName() {
      // 从localStorage获取项目数据
      const savedProjects = localStorage.getItem('projects')
      console.log('项目知识库 - 正在加载项目ID:', this.projectId, '类型:', typeof this.projectId)
      console.log('localStorage中的项目数据:', savedProjects)
      
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects)
          console.log('解析后的项目列表:', projects)
          console.log('项目ID列表:', projects.map(p => ({ id: p.id, type: typeof p.id })))
          
          // 使用字符串比较，因为后端返回的是字符串ID
          const project = projects.find(p => String(p.id) === String(this.projectId))
          
          if (project) {
            // 优先使用name字段，如果没有则使用title字段
            this.projectName = project.name || project.title || '未知项目'
            console.log('找到项目:', this.projectName, '项目数据:', project)
          } else {
            this.projectName = '未知项目'
            console.log('未找到项目，ID:', this.projectId, '可用项目ID:', projects.map(p => p.id))
          }
        } catch (error) {
          console.error('解析项目数据失败:', error)
          this.projectName = '未知项目'
        }
      } else {
        this.projectName = '未知项目'
        console.log('localStorage中没有项目数据')
      }
    },
    
    
    handleFileUploaded(file) {
      // 处理文件上传，更新最近活动
      const newActivity = {
        id: Date.now(),
        type: 'doc',
        text: `上传了${file.type}：${file.name}`,
        time: '刚刚'
      }
      this.activities.unshift(newActivity)
      
      // 自动保存到本地存储
      this.saveToLocalStorage()
      
      // 更新统计数字
      this.updateStats()
    },
    
    handleDocumentCreated(doc) {
      // 处理文档创建，更新最近活动
      const newActivity = {
        id: Date.now(),
        type: 'update',
        text: `创建了新文档：${doc.title}`,
        time: '刚刚'
      }
      this.activities.unshift(newActivity)
      
      // 自动保存到本地存储
      this.saveToLocalStorage()
      
      // 更新统计数字
      this.updateStats()
    },
    
    handleFileDeleted(file) {
      // 处理文件删除，更新最近活动
      const newActivity = {
        id: Date.now(),
        type: 'delete',
        text: `删除了${file.type}：${file.name}`,
        time: '刚刚'
      }
      this.activities.unshift(newActivity)
      
      // 自动保存到本地存储
      this.saveToLocalStorage()
      
      // 更新统计数字
      this.updateStats()
    },
    
    handleFileEdited(file) {
      // 处理文件编辑，更新最近活动
      const newActivity = {
        id: Date.now(),
        type: 'edit',
        text: `编辑了${file.type}的详细描述：${file.name}`,
        time: '刚刚'
      }
      this.activities.unshift(newActivity)
      
      // 自动保存到本地存储
      this.saveToLocalStorage()
      
      // 更新统计数字
      this.updateStats()
    },
    
    updateStats() {
      // 模拟更新统计数字
      // 在实际应用中，这里会从服务器获取最新数据
      console.log('更新统计数据')
    },
    
    // 本地存储方法
    saveToLocalStorage() {
      try {
        const dataToSave = {
          activities: this.activities,
          projectId: this.projectId
        }
        localStorage.setItem(`projectKnowledge_${this.projectId}`, JSON.stringify(dataToSave))
        console.log('项目知识库数据已保存到本地存储')
      } catch (error) {
        console.error('保存到本地存储失败:', error)
      }
    },
    
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(`projectKnowledge_${this.projectId}`)
        if (saved) {
          const data = JSON.parse(saved)
          if (data.activities && Array.isArray(data.activities)) {
            this.activities = data.activities
            console.log('项目知识库数据已从本地存储加载')
          }
        }
      } catch (error) {
        console.error('从本地存储加载失败:', error)
      }
    },
    
    // 获取上传文件数量
    getUploadedFilesCount() {
      try {
        const storageKey = this.projectId ? `knowledgeBaseCatalog_${this.projectId}` : 'knowledgeBaseCatalog'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const data = JSON.parse(saved)
          return data.uploadedFiles ? data.uploadedFiles.length : 0
        }
      } catch (error) {
        console.error('获取上传文件数量失败:', error)
      }
      return 0
    },
    
    // 获取知识文档数量
    getDocumentsCount() {
      try {
        const storageKey = this.projectId ? `knowledgeBaseDocs_${this.projectId}` : 'knowledgeBaseDocs'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const data = JSON.parse(saved)
          return data.docs ? data.docs.length : 0
        }
      } catch (error) {
        console.error('获取文档数量失败:', error)
      }
      return 0
    },
    
    // 获取正在编辑的文档数量（模拟数据）
    getEditingDocumentsCount() {
      // 这里可以根据实际需求计算正在编辑的文档数
      // 暂时返回一个模拟值
      return Math.min(5, Math.floor(this.getDocumentsCount() * 0.1))
    },
    
    // 初始化项目特定的示例数据
    initializeProjectData() {
      if (!this.projectId) return
      
      // 为不同项目设置不同的示例数据
      const projectData = this.getProjectSpecificData(this.projectId)
      
      // 初始化成果目录数据
      this.initializeCatalogData(projectData.catalog)
      
      // 初始化知识柜数据
      this.initializeCabinetData(projectData.cabinet)
    },
    
    // 获取项目特定的数据
    getProjectSpecificData(projectId) {
      const projectDataMap = {
        '1': { // 多模态医学影像数据平台
          catalog: [
            { id: 1, name: '医学影像数据集_v1.0.zip', type: '数据集', uploader: '张医生', time: '2023-11-15 14:30', typeCls: 'dataset' },
            { id: 2, name: 'CT影像分析算法.pdf', type: '论文', uploader: '李研究员', time: '2023-11-10 09:15', typeCls: 'doc' },
            { id: 3, name: 'MRI图像预处理模型.pkl', type: '模型文件', uploader: '王工程师', time: '2023-11-05 16:45', typeCls: 'model' }
          ],
          cabinet: [
            { id: 1, title: '医学影像数据预处理规范', updated: '2023年11月15日', content: '医学影像数据预处理规范\n\n1. 数据清洗...\n2. 格式转换...\n3. 质量控制...' },
            { id: 2, title: '深度学习模型训练指南', updated: '2023年11月10日', content: '深度学习模型训练指南\n\n1. 数据准备...\n2. 模型选择...\n3. 训练参数...' }
          ]
        },
        '2': { // 气候变化预测模型研究
          catalog: [
            { id: 1, name: '气象数据收集报告.pdf', type: '实验报告', uploader: '陈气象学家', time: '2023-11-12 10:20', typeCls: 'report' },
            { id: 2, name: '气候模型训练数据.csv', type: '数据集', uploader: '刘数据员', time: '2023-11-08 15:30', typeCls: 'dataset' },
            { id: 3, name: '预测算法优化方案.docx', type: '专利', uploader: '赵研究员', time: '2023-11-03 11:45', typeCls: 'patent' }
          ],
          cabinet: [
            { id: 1, title: '气候数据收集标准', updated: '2023年11月12日', content: '气候数据收集标准\n\n1. 数据来源...\n2. 采集频率...\n3. 质量控制...' },
            { id: 2, title: '预测模型评估方法', updated: '2023年11月08日', content: '预测模型评估方法\n\n1. 评估指标...\n2. 测试方法...\n3. 结果分析...' }
          ]
        },
        '3': { // 基因组数据分析平台
          catalog: [
            { id: 1, name: '基因序列分析工具.py', type: '模型文件', uploader: '孙生物学家', time: '2023-11-14 13:25', typeCls: 'model' },
            { id: 2, name: '基因组变异检测算法.pdf', type: '论文', uploader: '周研究员', time: '2023-11-09 16:10', typeCls: 'doc' },
            { id: 3, name: '基因表达数据集.xlsx', type: '数据集', uploader: '吴数据员', time: '2023-11-06 09:40', typeCls: 'dataset' }
          ],
          cabinet: [
            { id: 1, title: '基因组数据分析流程', updated: '2023年11月14日', content: '基因组数据分析流程\n\n1. 数据预处理...\n2. 序列比对...\n3. 变异检测...' },
            { id: 2, title: '生物信息学工具使用指南', updated: '2023年11月09日', content: '生物信息学工具使用指南\n\n1. 工具选择...\n2. 参数设置...\n3. 结果解读...' }
          ]
        }
      }
      
      return projectDataMap[projectId] || {
        catalog: [],
        cabinet: []
      }
    },
    
    // 初始化成果目录数据
    initializeCatalogData(catalogData) {
      if (!catalogData || catalogData.length === 0) return
      
      // 检查是否已有数据，如果没有则初始化
      const storageKey = `knowledgeBaseCatalog_${this.projectId}`
      const existing = localStorage.getItem(storageKey)
      if (!existing) {
        const initialData = {
          uploadedFiles: catalogData,
          currentPage: 1
        }
        localStorage.setItem(storageKey, JSON.stringify(initialData))
        console.log(`已初始化项目 ${this.projectId} 的成果目录数据`)
      }
    },
    
    // 初始化知识柜数据
    initializeCabinetData(cabinetData) {
      if (!cabinetData || cabinetData.length === 0) return
      
      // 检查是否已有数据，如果没有则初始化
      const storageKey = `knowledgeBaseDocs_${this.projectId}`
      const existing = localStorage.getItem(storageKey)
      if (!existing) {
        const initialData = {
          docs: cabinetData,
          activeId: cabinetData[0]?.id || 1,
          hasUnsavedChanges: false
        }
        localStorage.setItem(storageKey, JSON.stringify(initialData))
        console.log(`已初始化项目 ${this.projectId} 的知识柜数据`)
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn, .back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.menu-btn:hover, .back-btn:hover {
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

.translate-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 20px 24px 28px;
}

.content-layout.leftbar { 
  display: block; /* 改为块级布局，因为侧边栏现在是固定的 */
  height: calc(100vh - 64px - 40px - 28px);
}
.left-options { 
  position: fixed; 
  top: 80px; 
  left: 20px; 
  width: 200px; 
  z-index: 100;
}
.options-card { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  padding: 8px; 
  margin-bottom: 12px; 
  height: calc(100vh - 64px - 40px - 28px);
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
  height: calc(100vh - 64px - 40px - 28px);
  margin-left: 240px; /* 为固定侧边栏留出空间 */
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  overflow-y: auto;
}

/* 主页内容样式 */
.home-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}


.kb-header {
  margin-bottom: 24px;
}

.kb-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.kb-subtitle {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-card-title {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue { background: #e3f2fd; color: #1976d2; }
.stat-icon.green { background: #e8f5e8; color: #388e3c; }
.stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 13px;
  color: #6b7280;
}

.card {
  background: #fff;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eef0f2;
  background: #fafbfc;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.activity-list {
  padding: 16px 20px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-bullet.doc { background: #1976d2; }
.activity-bullet.update { background: #388e3c; }
.activity-bullet.ai { background: #7b1fa2; }
.activity-bullet.delete { background: #d32f2f; }
.activity-bullet.edit { background: #f57c00; }

.activity-main {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 4px;
}

.activity-meta {
  font-size: 12px;
  color: #6b7280;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .content-layout.leftbar { grid-template-columns: 1fr; }
  .left-options { 
    position: static; 
    width: 100%;
    margin-bottom: 20px;
  }
  .content-right { 
    margin-left: 0; 
    padding: 16px;
  }
  .options-card { height: auto; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>