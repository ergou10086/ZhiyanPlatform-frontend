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
            <div class="options-title">菜单导航</div>
            <div class="option-item" :class="{ active: activeTab==='home' }" @click="goTab('home')">
              <div class="option-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>主页</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='catalog' }" @click="goTab('catalog')">
              <div class="option-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>成果目录</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='cabinet' }" @click="goTab('cabinet')">
              <div class="option-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>知识柜</span>
            </div>
            <div class="option-item" :class="{ active: activeTab==='ai' }" @click="goTab('ai')">
              <div class="option-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>AI 赋能</span>
            </div>
          </div>
        </aside>

        <!-- 右侧内容主体 -->
        <div class="content-right">
          <!-- 顶部介绍（仅主页显示） -->
          <div v-if="activeTab==='home'" class="kb-header">
            <div class="kb-title">
              <span class="title-text">{{ projectName }}</span>
              <div class="title-decoration"></div>
            </div>
            <div class="kb-subtitle">
              <svg class="subtitle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              欢迎来到项目知识库，这是围绕AI教育与知识管理的核心平台，通过目录系统统一管理各类成果，利用知识库沉淀团队智慧，并借助AI助理赋能提升工作效率。
            </div>
          </div>

          <!-- 统计卡片（仅主页显示） -->
          <div v-if="activeTab==='home'" class="home-content">
          <div class="stats-grid">
            <div class="stat-card stat-card-blue">
              <div class="stat-background"></div>
              <div class="stat-card-content">
                <div class="stat-card-header">
                  <div class="stat-card-title">成果总数</div>
                  <div class="stat-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="stat-value">{{ totalAchievements }}</div>
                <div class="stat-desc">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V5M5 12L12 5L19 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="stat-growth">较上月增长 12%</span>
                </div>
              </div>
            </div>

            <div class="stat-card stat-card-green">
              <div class="stat-background"></div>
              <div class="stat-card-content">
                <div class="stat-card-header">
                  <div class="stat-card-title">知识文档</div>
                  <div class="stat-icon green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="stat-value">{{ totalDocuments }}</div>
                <div class="stat-desc">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#f59e0b" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>协作编辑中 {{ editingDocuments }} 篇</span>
                </div>
              </div>
            </div>

            <div class="stat-card stat-card-purple">
              <div class="stat-background"></div>
              <div class="stat-card-content">
                <div class="stat-card-header">
                  <div class="stat-card-title">团队成员</div>
                  <div class="stat-icon purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="stat-value">12</div>
                <div class="stat-desc">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#10b981" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="#10b981"/>
                  </svg>
                  <span>在线 8 人</span>
                </div>
              </div>
            </div>
          </div>


          <!-- 最近活动（仅主页显示） -->
          <div v-if="activeTab==='home'" class="activity-card">
            <div class="activity-card-header">
              <div class="activity-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>最近活动</span>
              </div>
              <button class="view-all-btn">
                <span>查看全部</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="activity-list">
              <div v-for="item in activities" :key="item.id" class="activity-item">
                <div class="activity-icon-wrapper" :class="item.type">
                  <div class="activity-icon">
                    <svg v-if="item.type === 'doc'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 18V12M9 15L12 18L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else-if="item.type === 'update'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.5 2V8H15.5M2.5 22V16H8.5M20.36 7C19.6402 5.33305 18.4066 3.92508 16.8284 2.97321C15.2502 2.02134 13.4051 1.57264 11.5442 1.68449C9.68331 1.79635 7.90572 2.46357 6.44121 3.59789C4.9767 4.73221 3.89273 6.28093 3.32 8.04M3.64 17C4.35979 18.6669 5.59336 20.0749 7.17157 21.0268C8.74979 21.9787 10.5949 22.4274 12.4558 22.3155C14.3167 22.2037 16.0943 21.5364 17.5588 20.4021C19.0233 19.2678 20.1073 17.7191 20.68 15.96" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else-if="item.type === 'ai'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else-if="item.type === 'edit'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="activity-main">
                  <div class="activity-text">{{ item.text }}</div>
                  <div class="activity-meta">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    {{ item.time }}
                  </div>
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
  margin-top: 64px; /* 为固定页眉留出空间 */
  padding: 20px 24px 28px;
}

.content-layout.leftbar { 
  display: block;
  height: calc(100vh - 64px - 40px - 28px);
}
.left-options { 
  position: fixed; 
  top: 80px; 
  left: 20px; 
  width: 220px; 
  z-index: 100;
}
.options-card { 
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e3e8ef; 
  border-radius: 16px; 
  padding: 12px; 
  margin-bottom: 12px; 
  height: calc(100vh - 64px - 40px - 28px);
  display: flex; 
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.options-title { 
  font-size: 13px; 
  color: #9ca3af; 
  padding: 8px 12px; 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.option-item { 
  padding: 12px 14px; 
  border-radius: 10px; 
  cursor: pointer; 
  color: #4b5563; 
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}
.option-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #5EB6E4 0%, #0044CC 100%);
  border-radius: 0 2px 2px 0;
  transition: height 0.3s ease;
}
.option-item:hover { 
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2ff 100%);
  color: #0044CC;
  transform: translateX(4px);
}
.option-item.active { 
  background: linear-gradient(135deg, #e3f2ff 0%, #d4e9ff 100%);
  color: #0044CC;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(94, 182, 228, 0.2);
}
.option-item.active::before {
  height: 60%;
}
.option-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}
.content-right { 
  min-width: 0; 
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 40px - 28px);
  margin-left: 260px;
  padding: 24px;
  background: transparent;
  overflow-y: auto;
}

/* 主页内容样式 */
.home-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}


.kb-header {
  margin-bottom: 32px;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kb-title {
  position: relative;
  margin: 0 0 16px 0;
  display: inline-block;
}

.title-text {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #0044CC 0%, #5EB6E4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.title-decoration {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #5EB6E4 0%, #A7C6ED 50%, transparent 100%);
  border-radius: 2px;
}

.kb-subtitle {
  font-size: 15px;
  color: #64748b;
  line-height: 1.8;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 3px solid #5EB6E4;
  border-radius: 8px;
}

.subtitle-icon {
  flex-shrink: 0;
  color: #5EB6E4;
  margin-top: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.08;
  transition: all 0.4s ease;
}

.stat-card-blue .stat-background {
  background: radial-gradient(circle, #5EB6E4 0%, transparent 70%);
}

.stat-card-green .stat-background {
  background: radial-gradient(circle, #a76fb5 0%, transparent 70%);
}

.stat-card-purple .stat-background {
  background: radial-gradient(circle, #0044CC 0%, transparent 70%);
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: transparent;
}

.stat-card-blue:hover {
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2ff 100%);
}

.stat-card-green:hover {
  background: linear-gradient(135deg, #faf5ff 0%, #f0e5ff 100%);
}

.stat-card-purple:hover {
  background: linear-gradient(135deg, #f0f7ff 0%, #e0ebff 100%);
}

.stat-card:hover .stat-background {
  transform: scale(1.5);
  opacity: 0.15;
}

.stat-card-content {
  padding: 24px;
  position: relative;
  z-index: 1;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-card-title {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: rotate(10deg) scale(1.1);
}

.stat-icon.blue { 
  background: linear-gradient(135deg, #A7C6ED 0%, #5EB6E4 100%);
  color: #0044CC;
  box-shadow: 0 4px 6px -1px rgba(94, 182, 228, 0.4);
}

.stat-icon.green { 
  background: linear-gradient(135deg, #e0b3e5 0%, #a76fb5 100%);
  color: #5c3f8c;
  box-shadow: 0 4px 6px -1px rgba(167, 111, 181, 0.4);
}

.stat-icon.purple { 
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 68, 204, 0.4);
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-desc {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.stat-growth {
  color: #10b981;
  font-weight: 600;
}

.activity-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  animation: fadeInUp 1s ease-out;
}

.activity-card:hover {
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.15);
}

.activity-card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.activity-card-title svg {
  color: #5EB6E4;
}

.view-all-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #0044CC;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-all-btn:hover {
  background: linear-gradient(135deg, #e3f2ff 0%, #d4e9ff 100%);
  border-color: #5EB6E4;
  transform: translateX(3px);
}

.view-all-btn svg {
  transition: transform 0.3s ease;
}

.view-all-btn:hover svg {
  transform: translateX(2px);
}

.activity-list {
  padding: 8px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 4px;
}

.activity-item:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateX(4px);
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.activity-item:hover .activity-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.activity-icon-wrapper.doc {
  background: linear-gradient(135deg, #A7C6ED 0%, #5EB6E4 100%);
}

.activity-icon-wrapper.update {
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
}

.activity-icon-wrapper.ai {
  background: linear-gradient(135deg, #e0b3e5 0%, #a76fb5 100%);
}

.activity-icon-wrapper.delete {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.activity-icon-wrapper.edit {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon-wrapper.doc .activity-icon {
  color: #0044CC;
}

.activity-icon-wrapper.update .activity-icon {
  color: #ffffff;
}

.activity-icon-wrapper.ai .activity-icon {
  color: #5c3f8c;
}

.activity-icon-wrapper.delete .activity-icon {
  color: #dc2626;
}

.activity-icon-wrapper.edit .activity-icon {
  color: #ea580c;
}

.activity-main {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  margin-bottom: 6px;
  font-weight: 500;
}

.activity-meta {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.activity-meta svg {
  color: #cbd5e1;
}

@media (max-width: 1200px) {
  .stats-grid { 
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .content-right {
    margin-left: 240px;
    padding: 20px;
  }
  
  .title-text {
    font-size: 28px;
  }
}

@media (max-width: 900px) {
  .content-layout.leftbar { 
    grid-template-columns: 1fr;
  }
  
  .left-options { 
    position: static; 
    width: 100%;
    margin-bottom: 20px;
    z-index: auto;
  }
  
  .options-card { 
    height: auto;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .options-title {
    display: none;
  }
  
  .option-item {
    white-space: nowrap;
  }
  
  .content-right { 
    margin-left: 0; 
    padding: 16px;
    height: auto;
  }
  
  .stats-grid { 
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .kb-header {
    margin-bottom: 24px;
  }
  
  .title-text {
    font-size: 24px;
  }
  
  .kb-subtitle {
    font-size: 14px;
    padding: 12px;
  }
  
  .stat-card-content {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 32px;
  }
  
  .activity-card-header {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .activity-card-title {
    font-size: 16px;
  }
  
  .view-all-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>