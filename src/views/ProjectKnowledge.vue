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
              <span>项目wiki文档</span>
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
              <div class="stat-value">{{ achievementsCount }}</div>
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
              <div class="stat-value">{{ teamMembersCount }}</div>
              <div class="stat-desc">在线 {{ onlineMembersCount }} 人</div>
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
import { knowledgeAPI } from '@/api/knowledge'
import { projectAPI } from '@/api/project'
import '@/assets/styles/ProjectKnowledge.css'

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
      achievementsCount: 0,
      documentsCount: 0,
      teamMembersCount: 0,
      onlineMembersCount: 0,
      activities: [],
      archiveRows: []
    }
  },
  computed: {
    // 计算知识文档总数（使用从后端或缓存获取的真实数据）
    totalDocuments() {
      return this.documentsCount > 0 ? this.documentsCount : this.getDocumentsCount()
    },
    
    // 计算正在编辑的文档数
    editingDocuments() {
      return this.getEditingDocumentsCount()
    }
  },
  mounted() {
    this.projectId = this.$route.params.id
    console.log('ProjectKnowledge mounted, projectId:', this.projectId)
    this.loadProjectName()
    // 组件挂载时加载本地存储的数据
    this.loadFromLocalStorage()
    // 初始化项目特定的示例数据
    this.initializeProjectData()
    
    // 立即从缓存读取团队规模和文档数量（同步，不会被异步问题影响）
    if (this.projectId) {
      try {
        // 读取团队规模
        const cached = localStorage.getItem(`project_member_count_${this.projectId}`)
        const cachedNum = cached ? parseInt(cached, 10) : NaN
        if (!isNaN(cachedNum) && cachedNum > 0) {
          this.teamMembersCount = cachedNum
          this.onlineMembersCount = Math.floor(this.teamMembersCount * 0.67)
          console.log('从缓存读取团队成员数量:', this.teamMembersCount)
        }
        
        // 读取知识文档数量
        const docsStorageKey = `knowledgeBaseDocs_${this.projectId}`
        const docsSaved = localStorage.getItem(docsStorageKey)
        if (docsSaved) {
          const docsData = JSON.parse(docsSaved)
          if (docsData.docs && Array.isArray(docsData.docs)) {
            this.documentsCount = docsData.docs.length
            console.log('从缓存读取知识文档数量:', this.documentsCount)
          }
        }
      } catch (e) {
        console.warn('读取缓存失败:', e)
      }
    }
    
    // 使用 nextTick 确保 projectId 已经设置
    this.$nextTick(() => {
      // 加载真实统计数据（会更新缓存中的数据）
      this.loadStats()
    })
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
    async loadProjectName() {
      // 优先从后端API获取最新的项目数据
      if (!this.projectId) {
        this.projectName = '加载中...'
        return
      }
      
      try {
        const response = await projectAPI.getProjectById(this.projectId)
        
        if (response && response.code === 200 && response.data) {
          // 使用API返回的最新数据
          this.projectName = response.data.name || '未知项目'
          console.log('从API获取到项目名称:', this.projectName)
          return
        }
      } catch (error) {
        console.error('从API加载项目失败，回退到localStorage:', error)
      }
      
      // 如果API失败，从localStorage加载项目数据（作为后备）
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
      
      // 更新统计数字（重新加载成果总数）
      this.loadAchievementsCount()
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
      
      // 重新加载文档数量
      this.loadDocumentsCount()
      
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
      
      // 更新统计数字（重新加载成果总数）
      this.loadAchievementsCount()
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
      
      // 编辑不改变成果总数，所以不需要重新加载
    },
    
    async loadStats() {
      // 并行加载成果总数、知识文档数量和团队成员数量
      await Promise.all([
        this.loadAchievementsCount(),
        this.loadDocumentsCount(),
        this.loadTeamMembersCount()
      ])
    },
    
    /**
     * 从后端加载成果总数
     */
    async loadAchievementsCount() {
      if (!this.projectId) {
        console.warn('projectId为空，无法加载成果总数')
        return
      }
      
      try {
        console.log('加载成果总数, projectId:', this.projectId)
        const response = await knowledgeAPI.getProjectAchievements(this.projectId, 0, 1)
        console.log('成果总数响应:', response)
        
        if (response && response.code === 200 && response.data) {
          // 获取总数（totalElements 或 total）
          this.achievementsCount = response.data.totalElements || response.data.total || 0
          console.log('成果总数:', this.achievementsCount)
        } else {
          console.warn('成果总数响应格式异常:', response)
          this.achievementsCount = 0
        }
      } catch (error) {
        console.error('加载成果总数失败:', error)
        this.achievementsCount = 0
      }
    },
    
    /**
     * 加载知识文档数量（从知识柜的localStorage获取真实数据）
     */
    loadDocumentsCount() {
      if (!this.projectId) {
        console.warn('projectId为空，无法加载文档数量')
        this.documentsCount = 0
        return
      }
      
      try {
        const storageKey = `knowledgeBaseDocs_${this.projectId}`
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const data = JSON.parse(saved)
          const count = data.docs && Array.isArray(data.docs) ? data.docs.length : 0
          this.documentsCount = count
          console.log('✅ 知识文档数量加载完成:', this.documentsCount, '篇')
        } else {
          // 如果没有存储的数据，初始化为0
          this.documentsCount = 0
          console.log('知识柜暂无文档数据')
        }
      } catch (error) {
        console.error('加载文档数量失败:', error)
        this.documentsCount = 0
      }
    },
    
    /**
     * 获取团队规模（和项目广场使用相同的方法）
     * 优先级：1. 缓存 2. API 获取 3. 兜底返回 1
     */
    async getTeamSize(projectId) {
      if (!projectId) {
        return 1
      }
      
      // 1) 优先从缓存读取（由 ProjectDetail 或 ProjectSquare 写入）
      try {
        const cached = localStorage.getItem(`project_member_count_${projectId}`)
        const cachedNum = cached ? parseInt(cached, 10) : NaN
        if (!isNaN(cachedNum) && cachedNum > 0) {
          console.log(`从缓存读取项目 ${projectId} 的团队成员数量:`, cachedNum)
          return cachedNum
        }
      } catch (e) {
        console.warn('读取团队成员数量缓存失败:', e)
      }
      
      // 2) 缓存没有，调用 API 获取
      try {
        console.log('从API获取项目', projectId, '的团队成员数量')
        const response = await projectAPI.getProjectMembers(projectId, 0, 1000)
        
        if (response && response.code === 200) {
          let memberCount = 0
          if (response.data && response.data.content) {
            // Spring Data Page对象
            memberCount = response.data.content.length
          } else if (Array.isArray(response.data)) {
            // 直接返回数组
            memberCount = response.data.length
          }
          
          // 写入缓存，供后续使用
          if (memberCount > 0) {
            try {
              localStorage.setItem(`project_member_count_${projectId}`, String(memberCount))
              console.log(`✅ 已缓存项目 ${projectId} 的团队成员数量:`, memberCount)
            } catch (e) {
              console.warn('写入成员数量缓存失败:', e?.message || e)
            }
          }
          
          return memberCount > 0 ? memberCount : 1
        }
      } catch (error) {
        console.warn(`获取项目 ${projectId} 成员数量失败:`, error)
      }
      
      // 3) 兜底返回 1
      return 1
    },
    
    /**
     * 从后端加载团队成员数量和在线人数
     */
    async loadTeamMembersCount() {
      const projectId = this.projectId || this.$route.params.id
      if (!projectId) {
        console.warn('projectId为空，无法加载团队成员数量')
        this.teamMembersCount = 1
        this.onlineMembersCount = 0
        return
      }
      
      // 使用和项目广场相同的方法获取团队规模
      this.teamMembersCount = await this.getTeamSize(projectId)
      
      // 获取团队成员详情以计算在线人数
      try {
        const response = await projectAPI.getProjectMembers(projectId, 0, 1000)
        if (response && response.code === 200) {
          let members = []
          if (response.data && response.data.content) {
            members = response.data.content
          } else if (Array.isArray(response.data)) {
            members = response.data
          }
          
          // 检查成员数据中是否有在线状态字段
          // 可能的字段名：isOnline, is_online, online, onlineStatus, status === 'ONLINE' 等
          const onlineCount = members.filter(member => {
            // 检查各种可能的在线状态字段
            if (member.isOnline === true || member.is_online === true || member.online === true) {
              return true
            }
            if (member.onlineStatus === 'ONLINE' || member.onlineStatus === 'online') {
              return true
            }
            if (member.status === 'ONLINE' || member.status === 'online' || member.status === 'active') {
              return true
            }
            // 如果后端没有提供在线状态字段，返回 false（不计算为在线）
            return false
          }).length
          
          // 如果后端提供了在线状态，使用真实数据；否则使用模拟数据
          if (members.length > 0 && (members[0].hasOwnProperty('isOnline') || 
                                      members[0].hasOwnProperty('is_online') || 
                                      members[0].hasOwnProperty('online') ||
                                      members[0].hasOwnProperty('onlineStatus') ||
                                      members[0].hasOwnProperty('status'))) {
            this.onlineMembersCount = onlineCount
            console.log('✅ 使用真实的在线人数:', this.onlineMembersCount, '人（总人数:', this.teamMembersCount, '人）')
          } else {
            // 后端没有提供在线状态，使用模拟数据（67% 的成员在线）
            this.onlineMembersCount = Math.floor(this.teamMembersCount * 0.67)
            console.log('⚠️ 后端未提供在线状态，使用模拟数据:', this.onlineMembersCount, '人（总人数:', this.teamMembersCount, '人）')
          }
        } else {
          // API 调用失败，使用模拟数据
          this.onlineMembersCount = Math.floor(this.teamMembersCount * 0.67)
          console.log('⚠️ API调用失败，使用模拟在线人数:', this.onlineMembersCount, '人')
        }
      } catch (error) {
        console.warn('获取团队成员详情失败，使用模拟在线人数:', error)
        // 出错时使用模拟数据
        this.onlineMembersCount = Math.floor(this.teamMembersCount * 0.67)
      }
      
      console.log('✅ 团队成员数量加载完成:', this.teamMembersCount, '人, 在线:', this.onlineMembersCount, '人')
    },
    
    updateStats() {
      // 重新加载统计数据
      this.loadStats()
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
      // 不再使用示例数据，返回空数据
      return {
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