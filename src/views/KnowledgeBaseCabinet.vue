<template>
  <div class="cabinet-view">
    <div class="cabinet-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 左侧列表 -->
      <div class="list-pane" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="toolbar">
          <div class="toolbar-buttons" v-if="!sidebarCollapsed">
            <button class="btn primary small" @click="createNewDocument">+ 新建文档</button>
            <button class="btn secondary small" @click="createNewFolder">+ 新建节点</button>
          </div>
          <input class="search" type="text" placeholder="搜索文档" v-if="!sidebarCollapsed" />
        </div>
        <div v-for="folder in folders" :key="folder.id" class="folder-section" v-if="!sidebarCollapsed">
          <div class="group-title" @click="toggleFolder(folder.id)">
            <span>{{ folder.name }}</span>
            <div class="title-actions">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
                   :class="{ 'folder-icon': true, 'expanded': folder.expanded }">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <button class="delete-node-btn" 
                      @click.stop="confirmDeleteNode(folder.id, 'folder', folder.name)"
                      title="删除节点">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <ul v-if="folder.expanded" class="doc-list">
            <li v-for="doc in getDocsInFolder(folder.id)" :key="doc.id" 
                :class="{ active: doc.id===activeId }"
                class="doc-item">
              <span @click="selectDocument(doc.id)" class="doc-title">{{ doc.title }}</span>
              <button class="delete-doc-btn" 
                      @click.stop="confirmDeleteNode(doc.id, 'document', doc.title)"
                      title="删除文档">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
        <!-- 折叠按钮 -->
        <button class="collapse-btn" @click="toggleSidebar" :title="sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
               :class="{ 'rotated': sidebarCollapsed }">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 右侧编辑区 -->
      <div class="editor-pane" :class="{ 'expanded': sidebarCollapsed }">
        <div class="doc-meta" v-if="activeDoc">
          <div class="doc-title">{{ activeDoc.title }}</div>
          <div class="doc-updated">更新日期：{{ activeDoc.updated }}</div>
        </div>
        <div class="doc-meta" v-else>
          <div class="doc-title">暂无文档</div>
          <div class="doc-updated">请创建或选择文档</div>
        </div>
        <textarea 
          class="editor" 
          :class="{ 'readonly': !isEditing }"
          v-model="activeDocContent" 
          @input="updateContent"
          :readonly="!isEditing"
          v-if="activeDoc"
        ></textarea>
        <div v-else class="empty-editor">
          <p>暂无文档内容</p>
        </div>
        <div class="editor-footer">
          <button class="btn">版本历史</button>
          <button class="btn">差异对比</button>
          <div class="flex-spacer" />
          <button class="btn secondary" @click="toggleEditMode" v-if="!isEditing">
            编辑
          </button>
          <button class="btn secondary" @click="cancelEdit" v-if="isEditing">
            取消
          </button>
          <button class="btn primary" @click="saveDocument" :disabled="!activeDoc">
            {{ hasUnsavedChanges ? '保存*' : '已保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="upload-dialog-overlay" @click="closeDeleteDialog">
      <div class="upload-dialog delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="closeDeleteDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="delete-warning">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="warning-icon">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="delete-message">
              {{ deleteNodeType === 'folder' ? '确定要删除节点' : '确定要删除文档' }}
              <strong>"{{ deleteNodeName }}"</strong>吗？
            </p>
            <p class="delete-tip" v-if="deleteNodeType === 'folder'">
              ⚠️ 删除节点将递归删除其下所有子节点和文档，此操作不可恢复！
            </p>
            <p class="delete-tip" v-else>
              ⚠️ 此操作不可恢复！
            </p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn secondary" @click="closeDeleteDialog">取消</button>
          <button class="btn danger" @click="executeDeleteNode" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新建文档对话框 -->
    <div v-if="showNewDocDialog" class="upload-dialog-overlay" @click="closeNewDocDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <h3>新建文档</h3>
          <button class="close-btn" @click="closeNewDocDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>文档名称：</label>
            <input v-model="newDocTitle" type="text" placeholder="请输入文档名称" />
          </div>
          <div class="form-group">
            <label>节点选择：</label>
            <div class="node-selector">
              <div class="node-input-wrapper">
                <input 
                  type="text" 
                  v-model="nodeSearchText"
                  @focus="showNodePicker = true"
                  @input="showNodePicker = true"
                  @click="showNodePicker = true"
                  placeholder="请选择节点（可选）"
                  class="node-input"
                  autocomplete="off"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="node-input-icon">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div v-if="showNodePicker" class="node-picker-dropdown">
                <div 
                  v-if="filteredNodeList.length === 0 && nodeSearchText.trim()" 
                  class="node-picker-empty">
                  未找到匹配的节点
                </div>
                <template v-else>
                  <div 
                    class="node-picker-item" 
                    :class="{ 'selected': selectedNodeId === null }"
                    @click="selectNode(null, '根目录')">
                    <span>根目录</span>
                  </div>
                  <div 
                    v-for="node in filteredNodeList" 
                    :key="node.id" 
                    class="node-picker-item"
                    :class="{ 'selected': selectedNodeId === node.id }"
                    :style="{ paddingLeft: (node.level * 16 + 12) + 'px' }"
                    @click="selectNode(node.id, node.title)">
                    <span>{{ node.title }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>上传Markdown文件：</label>
            <div class="file-upload-area" 
                 :class="{ 'has-file': selectedFile }"
                 @click="!selectedFile && $refs.fileInput?.click()"
                 @dragover.prevent
                 @drop.prevent="handleFileDrop">
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileSelect" 
                accept=".md,.markdown,.txt"
                class="file-input-hidden"
                id="markdown-file-input"
              />
              <div v-if="!selectedFile" class="file-upload-placeholder">
                <div class="upload-icon-wrapper">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="upload-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="17 8 12 3 7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <p class="upload-text">点击或拖拽文件到此区域上传</p>
                <p class="upload-hint">支持 .md, .markdown, .txt 格式</p>
              </div>
              <div v-else class="file-preview-card">
                <div class="file-preview-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" stroke-width="2" fill="rgba(94, 182, 228, 0.1)"/>
                    <polyline points="13 2 13 9 20 9" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="file-preview-info">
                  <div class="file-preview-name">{{ selectedFile.name }}</div>
                  <div class="file-preview-meta">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
                <button class="file-preview-remove" @click.stop="removeFile" title="移除文件">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeNewDocDialog">取消</button>
            <button class="btn primary" @click="confirmNewDoc" :disabled="!selectedFile || !newDocTitle.trim()">确认创建</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建节点对话框 -->
    <div v-if="showNewFolderDialog" class="upload-dialog-overlay" @click="closeNewFolderDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <h3>新建节点</h3>
          <button class="close-btn" @click="closeNewFolderDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>节点名称：</label>
            <input v-model="newFolderName" type="text" placeholder="请输入节点名称" />
          </div>
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeNewFolderDialog">取消</button>
            <button class="btn primary" @click="confirmNewFolder" :disabled="!newFolderName">确认创建</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/styles/KnowledgeBaseCabinet.css'
import { wikiAPI } from '@/api/wiki'
import { PageType } from '@/api/wiki'

export default {
  name: 'KnowledgeBaseCabinet',
  props: {
    projectId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      activeId: null,
      showNewDocDialog: false,
      showNewFolderDialog: false,
      showDeleteDialog: false,
      deleteNodeId: null,
      deleteNodeType: null,
      deleteNodeName: '',
      deleting: false,
      newDocTitle: '',
      newDocCategory: '',
      selectedFile: null,
      showNodePicker: false,
      selectedNodeId: null,
      selectedNodeName: '',
      nodeSearchText: '',
      newFolderName: '',
      hasUnsavedChanges: false,
      autoSaveTimer: null,
      isEditing: false,
      sidebarCollapsed: false,
      folders: [], // 从API获取的目录节点
      docs: [], // 从API获取的文档节点
      wikiTree: [], // Wiki树形结构
      loading: false,
      currentPage: null, // 当前查看的页面详情
      originalContent: '', // 原始内容（用于取消编辑）
      selectedParentId: null // 新建页面时选择的父页面ID
    }
  },
  computed: {
    activeDoc() {
      if (!this.docs || this.docs.length === 0) return null
      return this.docs.find(d => d.id === this.activeId) || this.docs[0]
    },
    activeDocContent: {
      get() {
        return this.activeDoc ? this.activeDoc.content : ''
      },
      set(value) {
        if (this.activeDoc) {
          this.activeDoc.content = value
        }
      }
    },
    // 扁平化树形结构用于节点选择器
    flatNodeList() {
      const result = []
      const flatten = (nodes, level = 0) => {
        if (!Array.isArray(nodes)) return
        nodes.forEach(node => {
          if (node.pageType === 'DIRECTORY') {
            result.push({
              id: String(node.id), // 保持ID为字符串，避免精度丢失
              title: node.title,
              level: level
            })
            if (node.children && node.children.length > 0) {
              flatten(node.children, level + 1)
            }
          }
        })
      }
      flatten(this.wikiTree)
      return result
    },
    // 过滤后的节点列表（根据搜索文本）
    filteredNodeList() {
      if (!this.nodeSearchText.trim()) {
        return this.flatNodeList
      }
      const searchText = this.nodeSearchText.toLowerCase().trim()
      return this.flatNodeList.filter(node => 
        node.title.toLowerCase().includes(searchText) ||
        String(node.id).includes(searchText)
      )
    }
  },
  async mounted() {
    console.log('[KnowledgeBaseCabinet] 组件挂载, projectId:', this.projectId)
    
    // 从API加载Wiki树
    if (this.projectId) {
      await this.loadWikiTree()
    } else {
      console.warn('[KnowledgeBaseCabinet] projectId为空，无法加载Wiki数据')
    }
    
    // 监听页面离开事件，提醒用户保存
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    
    // 监听点击外部关闭节点选择器
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    // 组件销毁前保存数据
    if (this.hasUnsavedChanges) {
      this.saveDocument()
    }
    // 清除定时器
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
    }
    // 移除事件监听器
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    /**
     * 从API加载Wiki树形结构
     */
    async loadWikiTree() {
      if (!this.projectId) {
        console.warn('[loadWikiTree] projectId为空')
        return
      }
      
      this.loading = true
      try {
        console.log('[loadWikiTree] 加载Wiki树, projectId:', this.projectId)
        const response = await wikiAPI.page.getProjectWikiTree(this.projectId)
        
        if (response && response.code === 200) {
          this.wikiTree = response.data || []
          console.log('[loadWikiTree] Wiki树加载成功:', this.wikiTree)
          
          // 解析树形结构，分离目录和文档
          this.parseWikiTree(this.wikiTree)
          
          // 如果有文档，自动选择第一个
          if (this.docs.length > 0) {
            await this.selectDocument(this.docs[0].id)
          }
        } else {
          console.error('[loadWikiTree] API返回错误:', response)
          this.$message?.error(response.msg || '加载Wiki失败')
        }
      } catch (error) {
        console.error('[loadWikiTree] 加载Wiki树失败:', error)
        this.$message?.error('加载Wiki失败，请重试')
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 解析Wiki树形结构，分离目录和文档
     */
    parseWikiTree(tree, parentId = null) {
      if (!Array.isArray(tree)) return
      
      tree.forEach(node => {
        if (node.pageType === 'DIRECTORY') {
          // 目录节点
          this.folders.push({
            id: String(node.id), // 保持ID为字符串，避免精度丢失
            name: node.title,
            description: '',
            expanded: true,
            parentId: parentId
          })
          
          // 递归处理子节点
          if (node.children && node.children.length > 0) {
            this.parseWikiTree(node.children, String(node.id))
          }
        } else if (node.pageType === 'DOCUMENT') {
          // 文档节点
          this.docs.push({
            id: String(node.id), // 保持ID为字符串，避免精度丢失
            title: node.title,
            updated: node.updatedAt || node.createdAt || '',
            content: '', // 内容需要单独加载
            folderId: parentId
          })
        }
      })
    },
    
    /**
     * 选择并加载文档详情
     */
    async selectDocument(pageId) {
      if (!pageId) return
      
      try {
        console.log('[selectDocument] 加载页面详情, pageId:', pageId)
        const response = await wikiAPI.page.getPageDetail(pageId)
        
        if (response && response.code === 200) {
          this.currentPage = response.data
          this.activeId = String(pageId) // 保持ID为字符串，避免精度丢失
          
          // 更新docs数组中的内容（使用字符串比较）
          const doc = this.docs.find(d => String(d.id) === String(this.activeId))
          if (doc) {
            doc.content = this.currentPage.content || ''
            doc.updated = this.currentPage.updatedAt || doc.updated
          }
          
          // 保存原始内容
          this.originalContent = this.currentPage.content || ''
          
          console.log('[selectDocument] 页面详情加载成功:', this.currentPage.title)
        } else {
          console.error('[selectDocument] 加载页面失败:', response)
          this.$message?.error('加载页面失败')
        }
      } catch (error) {
        console.error('[selectDocument] 加载页面失败:', error)
        this.$message?.error('加载页面失败')
      }
    },
    
    createNewDocument() {
      this.showNewDocDialog = true
      this.newDocTitle = ''
      this.selectedNodeId = null
      this.selectedNodeName = ''
      this.nodeSearchText = ''
      this.selectedFile = null
      this.showNodePicker = false
    },
    
    closeNewDocDialog() {
      this.showNewDocDialog = false
      this.newDocTitle = ''
      this.newDocCategory = ''
      this.selectedNodeId = null
      this.selectedNodeName = ''
      this.nodeSearchText = ''
      this.selectedFile = null
      this.showNodePicker = false
      // 清空文件输入框
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    selectNode(nodeId, nodeName) {
      this.selectedNodeId = nodeId
      this.selectedNodeName = nodeName
      this.newDocCategory = nodeId
      this.nodeSearchText = nodeName || ''
      this.showNodePicker = false
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processFile(file)
      } else {
        this.selectedFile = null
      }
    },
    
    handleFileDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) {
        this.processFile(file)
        // 同步到文件输入框
        if (this.$refs.fileInput) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          this.$refs.fileInput.files = dataTransfer.files
        }
      }
    },
    
    processFile(file) {
      // 验证文件类型（只允许Markdown文件）
      const fileName = file.name.toLowerCase()
      const allowedExtensions = ['.md', '.markdown', '.txt']
      const isValidFile = allowedExtensions.some(ext => fileName.endsWith(ext))
      
      if (!isValidFile) {
        this.$message?.error('请选择Markdown文件（.md, .markdown, .txt）')
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
        this.selectedFile = null
        return
      }
      
      this.selectedFile = file
      // 如果文档名称为空，使用文件名（去掉扩展名）作为默认名称
      if (!this.newDocTitle.trim()) {
        this.newDocTitle = file.name.replace(/\.(md|markdown|txt)$/i, '')
      }
      console.log('[handleFileSelect] 已选择文件:', file.name, '大小:', file.size, '字节')
    },
    
    removeFile() {
      this.selectedFile = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    
    handleClickOutside(event) {
      // 如果节点选择器打开，点击外部时关闭
      if (this.showNodePicker && !event.target.closest('.node-selector')) {
        this.showNodePicker = false
        // 如果已经选择了节点，恢复显示选中的节点名称
        if (this.selectedNodeName) {
          this.nodeSearchText = this.selectedNodeName
        } else {
          this.nodeSearchText = ''
        }
      }
    },

    createNewFolder() {
      this.showNewFolderDialog = true
      this.newFolderName = ''
    },
    
    closeNewFolderDialog() {
      this.showNewFolderDialog = false
      this.newFolderName = ''
    },

    async confirmNewFolder() {
      if (!this.newFolderName.trim()) return
      
      try {
        console.log('[confirmNewFolder] 创建新节点')
        const response = await wikiAPI.page.createPage({
          projectId: this.projectId,
          title: this.newFolderName.trim(),
          pageType: 'DIRECTORY',
          parentId: null, // 节点创建在根目录
          isPublic: false
        })
        
        if (response && response.code === 200) {
          console.log('[confirmNewFolder] 节点创建成功:', response.data)
          this.$message?.success('节点创建成功！')
          
          //重新加载Wiki树
          this.folders = []
          this.docs = []
          await this.loadWikiTree()
          
          this.closeNewFolderDialog()
        } else {
          console.error('[confirmNewFolder] 创建失败:', response)
          this.$message?.error(response.msg || '创建节点失败')
        }
      } catch (error) {
        console.error('[confirmNewFolder] 创建节点失败:', error)
        this.$message?.error('创建节点失败，请重试')
      }
    },

    toggleFolder(folderId) {
      const folder = this.folders.find(f => f.id === folderId)
      if (folder) {
        folder.expanded = !folder.expanded
      }
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    getDocsInFolder(folderId) {
      return this.docs.filter(doc => doc.folderId === folderId)
    },

    toggleEditMode() {
      this.isEditing = true
      // 进入编辑模式时，如果有内容变化，标记为有未保存更改
      if (this.activeDocContent !== this.activeDoc.content) {
        this.hasUnsavedChanges = true
      }
    },

    cancelEdit() {
      // 如果有未保存的更改，询问用户是否确认取消
      if (this.hasUnsavedChanges) {
        if (confirm('您有未保存的更改，确定要取消编辑吗？')) {
          // 恢复原始内容
          if (this.activeDoc) {
            this.activeDoc.content = this.originalContent
          }
          this.isEditing = false
          this.hasUnsavedChanges = false
        }
      } else {
        this.isEditing = false
        this.hasUnsavedChanges = false
      }
    },

    loadCurrentDocContent() {
      // 重新加载当前文档内容，取消未保存的更改
      const currentDoc = this.docs.find(doc => doc.id === this.activeId)
      if (currentDoc) {
        this.activeDocContent = currentDoc.content
      }
    },
    
    async confirmNewDoc() {
      if (!this.selectedFile) {
        this.$message?.error('请选择要上传的Markdown文件')
        return
      }
      
      if (!this.newDocTitle.trim()) {
        this.$message?.error('请输入文档名称')
        return
      }
      
      try {
        // 前端本地创建文档，不调用后端API
        console.log('[confirmNewDoc] 前端本地创建文档')
        
        // 确定父页面ID（如果选择了节点）
        // 保持ID为字符串，避免精度丢失
        let folderId = null
        if (this.selectedNodeId !== null && this.selectedNodeId !== undefined) {
          folderId = String(this.selectedNodeId)
        }
        
        // 读取文件内容
        const fileContent = await this.readFileContent(this.selectedFile)
        
        // 生成临时唯一ID（使用时间戳 + 随机数）
        const tempId = Date.now() + Math.floor(Math.random() * 1000)
        
        // 创建新文档对象
        const newDoc = {
          id: tempId,
          title: this.newDocTitle.trim(),
          updated: new Date().toLocaleString('zh-CN'),
          content: fileContent,
          folderId: folderId
        }
        
        // 直接添加到docs数组
        this.docs.push(newDoc)
        
        console.log('[confirmNewDoc] 文档创建成功（前端）:', newDoc)
        this.$message?.success('文档创建成功！')
        
        // 关闭对话框
        this.closeNewDocDialog()
        
        // 自动选择新创建的文档
        this.activeId = tempId
        this.currentPage = {
          id: String(tempId),
          title: newDoc.title,
          content: newDoc.content,
          pageType: 'DOCUMENT'
        }
        this.originalContent = newDoc.content
        
        // 如果文档在文件夹中，确保文件夹展开
        if (folderId) {
          const folder = this.folders.find(f => f.id === folderId)
          if (folder && !folder.expanded) {
            folder.expanded = true
          }
        }
        
        // 通知父组件
        this.$emit('document-created', {
          id: tempId,
          title: newDoc.title
        })
        
        console.log('[confirmNewDoc] 文档已添加到列表并自动选中')
      } catch (error) {
        console.error('[confirmNewDoc] 创建文档失败:', error)
        this.$message?.error('创建文档失败：' + (error.message || '无法读取文件内容'))
      }
    },
    
    readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.onerror = () => {
          reject(new Error('文件读取失败'))
        }
        reader.readAsText(file, 'UTF-8')
      })
    },
    
    updateContent() {
      // 只有在编辑模式下才标记有未保存的更改
      if (this.isEditing) {
        this.hasUnsavedChanges = true
        
        // 清除之前的自动保存定时器
        if (this.autoSaveTimer) {
          clearTimeout(this.autoSaveTimer)
        }
        
        // 设置新的自动保存定时器（3秒后自动保存）
        this.autoSaveTimer = setTimeout(() => {
          this.autoSave()
        }, 3000)
      }
    },
    
    saveDocument() {
      if (!this.activeDoc) {
        console.warn('[saveDocument] 没有活动文档')
        this.$message?.error('没有可保存的文档')
        return
      }
      
      try {
        // 前端本地保存，不调用后端API
        console.log('[saveDocument] 前端本地保存文档')
        
        // 更新文档内容
        this.activeDoc.content = this.activeDocContent
        this.activeDoc.updated = new Date().toLocaleString('zh-CN')
        this.originalContent = this.activeDocContent
        
        // 标记已保存并退出编辑模式
        this.hasUnsavedChanges = false
        this.isEditing = false
        
        console.log('[saveDocument] 文档保存成功（前端）')
        this.$message?.success('文档保存成功！')
        
        // 通知父组件
        this.$emit('document-saved', this.activeDoc)
      } catch (error) {
        console.error('[saveDocument] 保存文档失败:', error)
        this.$message?.error('保存文档失败，请重试')
      }
    },
    
    async autoSave() {
      if (this.activeDoc && this.hasUnsavedChanges && this.activeId) {
        try {
          console.log('[autoSave] 自动保存文档')
          const response = await wikiAPI.page.updatePage(this.activeId, {
            content: this.activeDocContent,
            changeDescription: '自动保存'
          })
          
          if (response && response.code === 200) {
            this.activeDoc.updated = new Date().toLocaleString('zh-CN')
            this.originalContent = this.activeDocContent
            this.hasUnsavedChanges = false
            console.log('[autoSave] 文档已自动保存')
            
            // 通知父组件
            this.$emit('document-auto-saved', this.activeDoc)
          }
        } catch (error) {
          console.error('[autoSave] 自动保存失败:', error)
        }
      }
    },
    
    saveToLocalStorage() {
      // 保存到浏览器本地存储
      try {
        const dataToSave = {
          docs: this.docs,
          folders: this.folders,
          activeId: this.activeId,
          hasUnsavedChanges: this.hasUnsavedChanges
        }
        const storageKey = this.projectId ? `knowledgeBaseDocs_${this.projectId}` : 'knowledgeBaseDocs'
        localStorage.setItem(storageKey, JSON.stringify(dataToSave))
        console.log(`知识柜数据已保存到本地存储 (项目ID: ${this.projectId})`)
      } catch (error) {
        console.error('保存到本地存储失败:', error)
      }
    },
    
    loadFromLocalStorage() {
      // 从本地存储加载文档
      try {
        const storageKey = this.projectId ? `knowledgeBaseDocs_${this.projectId}` : 'knowledgeBaseDocs'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const data = JSON.parse(saved)
          
          // 示例文档和文件夹的标识
          const exampleTitles = ['项目管理规范', '会议纪要', '培训资料']
          const exampleContent = ['示例内容', '可替换为真实文档内容', '此处为示例内容']
          
          // 过滤掉示例文档
          if (data.docs && Array.isArray(data.docs) && data.docs.length > 0) {
            this.docs = data.docs.filter(doc => {
              const title = (doc.title || '').toLowerCase()
              const content = (doc.content || '').toLowerCase()
              
              // 检查标题或内容是否包含示例标识
              const isExample = exampleTitles.some(et => title.includes(et.toLowerCase())) ||
                                exampleContent.some(ec => content.includes(ec.toLowerCase()))
              
              if (isExample) {
                console.log(`过滤掉示例文档: ${doc.title || doc.id}`)
                return false
              }
              return true
            })
            
            // 如果过滤后没有文档，清空数组
            if (this.docs.length === 0) {
              this.docs = []
              this.activeId = 1
            } else {
              // 确保 activeId 指向存在的文档
              const activeDoc = this.docs.find(d => d.id === this.activeId)
              if (!activeDoc) {
                this.activeId = this.docs[0].id
              }
            }
            
            console.log(`知识柜数据已从本地存储加载 (项目ID: ${this.projectId}), 文档数: ${this.docs.length}`)
          }
          
          // 过滤掉示例文件夹
          if (data.folders && Array.isArray(data.folders) && data.folders.length > 0) {
            this.folders = data.folders.filter(folder => {
              const name = (folder.name || '').toLowerCase()
              const isExample = exampleTitles.some(et => name.includes(et.toLowerCase()))
              
              if (isExample) {
                console.log(`过滤掉示例文件夹: ${folder.name || folder.id}`)
                return false
              }
              return true
            })
            
            console.log(`文件夹数据已从本地存储加载 (项目ID: ${this.projectId}), 文件夹数: ${this.folders.length}`)
          }
          
          // 如果过滤后数据有变化，保存回 localStorage
          if (this.docs.length !== (data.docs?.length || 0) || 
              this.folders.length !== (data.folders?.length || 0)) {
            this.saveToLocalStorage()
          }
          
          if (data.activeId && this.docs.find(d => d.id === data.activeId)) {
            this.activeId = data.activeId
          }
          if (data.hasUnsavedChanges !== undefined) {
            this.hasUnsavedChanges = data.hasUnsavedChanges
          }
        }
      } catch (error) {
        console.error('从本地存储加载失败:', error)
      }
    },
    
    handleBeforeUnload(event) {
      // 如果有未保存的更改，提醒用户
      if (this.hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = '您有未保存的更改，确定要离开吗？'
        return '您有未保存的更改，确定要离开吗？'
      }
    },
    
    /**
     * 确认删除节点（显示确认对话框）
     */
    confirmDeleteNode(nodeId, nodeType, nodeName) {
      console.log('[confirmDeleteNode] 准备删除:', { nodeId, nodeType, nodeName })
      this.deleteNodeId = nodeId
      this.deleteNodeType = nodeType
      this.deleteNodeName = nodeName
      this.showDeleteDialog = true
    },
    
    /**
     * 关闭删除确认对话框
     */
    closeDeleteDialog() {
      this.showDeleteDialog = false
      this.deleteNodeId = null
      this.deleteNodeType = null
      this.deleteNodeName = ''
      this.deleting = false
    },
    
    /**
     * 执行删除节点操作
     */
    async executeDeleteNode() {
      if (!this.deleteNodeId) {
        console.error('[executeDeleteNode] deleteNodeId为空')
        return
      }
      
      this.deleting = true
      
      try {
        console.log('[executeDeleteNode] 删除节点:', {
          id: this.deleteNodeId,
          type: this.deleteNodeType,
          name: this.deleteNodeName
        })
        
        let response
        if (this.deleteNodeType === 'folder') {
          // 递归删除节点及其子节点
          response = await wikiAPI.page.deletePageRecursively(this.deleteNodeId)
        } else {
          // 删除单个文档
          response = await wikiAPI.page.deletePage(this.deleteNodeId)
        }
        
        if (response && response.code === 200) {
          console.log('[executeDeleteNode] 删除成功')
          
          // 从本地数据中移除
          if (this.deleteNodeType === 'folder') {
            // 移除文件夹
            this.folders = this.folders.filter(f => String(f.id) !== String(this.deleteNodeId))
            // 移除该文件夹下的所有文档
            this.docs = this.docs.filter(d => String(d.folderId) !== String(this.deleteNodeId))
          } else {
            // 移除文档
            this.docs = this.docs.filter(d => String(d.id) !== String(this.deleteNodeId))
            
            // 如果删除的是当前活动文档，清空选择
            if (String(this.activeId) === String(this.deleteNodeId)) {
              this.activeId = null
              this.currentPage = null
            }
          }
          
          // 保存到本地存储
          this.saveToLocalStorage()
          
          // 重新加载Wiki树
          await this.loadWikiTree()
          
          // 显示成功消息
          if (this.$message) {
            this.$message.success(`${this.deleteNodeType === 'folder' ? '节点' : '文档'}删除成功`)
          }
          
          // 关闭对话框
          this.closeDeleteDialog()
        } else {
          console.error('[executeDeleteNode] 删除失败:', response)
          if (this.$message) {
            this.$message.error(response?.msg || '删除失败，请重试')
          }
        }
      } catch (error) {
        console.error('[executeDeleteNode] 删除失败:', error)
        if (this.$message) {
          this.$message.error('删除失败，请重试')
        }
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
.cabinet-view {
  display: flex;
  flex-direction: column;
  height: 100%; /* 占据父容器的全部高度 */
  animation: fadeInUp 0.6s ease-out;
  padding: 0;
  margin: 0;
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

.cabinet-layout { 
  display: grid; 
  grid-template-columns: 260px 1fr; 
  gap: 12px; 
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许grid子元素收缩 */
  height: 100%; /* 占据全部高度 */
  transition: grid-template-columns 0.3s ease;
  position: relative;
}

.cabinet-layout.sidebar-collapsed {
  grid-template-columns: 60px 1fr;
}

.list-pane { 
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.list-pane.collapsed {
  padding: 16px 8px;
  align-items: center;
}

.collapse-btn {
  position: absolute;
  bottom: 16px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #64748b;
  z-index: 10;
}

.collapse-btn:hover {
  background: #f1f5f9;
  border-color: #5EB6E4;
  color: #5EB6E4;
  transform: scale(1.1);
}

.collapse-btn svg.rotated {
  transform: rotate(180deg);
}

.list-pane:hover {
  box-shadow: 0 8px 15px -5px rgba(0, 0, 0, 0.15);
}
.toolbar { 
  display: flex; 
  flex-direction: column;
  gap: 10px; 
  margin-bottom: 16px; 
  flex-shrink: 0;
}
.toolbar-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search { 
  width: 100%;
  height: 36px; 
  border: 2px solid #e5e7eb; 
  border-radius: 10px; 
  padding: 0 12px; 
  font-size: 13px; 
  transition: all 0.3s ease;
  background: white;
}
.search:focus {
  outline: none;
  border-color: #5EB6E4;
  box-shadow: 0 0 0 3px rgba(94, 182, 228, 0.1);
}
.group-title { 
  color: #6b7280; 
  font-size: 12px; 
  margin: 10px 0 6px; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0 10px;
}

.group-title:hover {
  color: #374151;
}

.folder-icon {
  transition: transform 0.2s ease;
  transform: rotate(180deg); /* 默认向上箭头（收起状态） */
}

.folder-icon.expanded {
  transform: rotate(0deg); /* 展开时向下箭头 */
}

.folder-section {
  margin-bottom: 8px;
}

/* 节点标题操作按钮容器 */
.title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 删除节点按钮 */
.delete-node-btn {
  padding: 4px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.group-title:hover .delete-node-btn {
  opacity: 1;
}

.delete-node-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: scale(1.1);
}

/* 文档列表项样式 */
.doc-list { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
  flex: 1; 
  overflow-y: auto; 
}

.doc-list .doc-item { 
  padding: 8px 10px; 
  border-radius: 8px; 
  cursor: pointer; 
  color: #374151; 
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.2s ease;
}

.doc-list .doc-item .doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-list .doc-item:hover { 
  background: #f6f7fb; 
}

.doc-list .doc-item.active { 
  background: #e0ebff; 
  color: #0044CC; 
}

/* 删除文档按钮 */
.delete-doc-btn {
  padding: 4px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
  flex-shrink: 0;
}

.doc-item:hover .delete-doc-btn {
  opacity: 1;
}

.delete-doc-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: scale(1.1);
}

.editor-pane { 
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 8px;
  display: flex; 
  flex-direction: column; 
  min-height: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}
.editor-pane:hover {
  box-shadow: 0 8px 15px -5px rgba(0, 0, 0, 0.15);
}
.doc-meta { 
  padding: 2px 0 6px; 
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 6px;
}
.doc-title { 
  font-size: 16px; 
  font-weight: 700; 
  color: #1e293b;
  background: linear-gradient(135deg, #1e293b 0%, #5EB6E4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.doc-updated { 
  color: #64748b; 
  font-size: 12px; 
  margin-top: 4px;
  font-weight: 500;
}
.editor { 
  flex: 1; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px; 
  padding: 8px; 
  font-size: 13px; 
  resize: none; /* 禁用resize，使用flex布局控制高度 */
  min-height: 0; /* 允许flex子元素收缩 */
  transition: all 0.2s ease;
}

.editor.readonly {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: default;
}

.editor:not(.readonly) {
  background-color: #fff;
  color: #111827;
}
.editor-footer { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-shrink: 0; padding-top: 6px; }
.flex-spacer { flex: 1; }

.btn { 
  height: 36px; 
  padding: 0 18px; 
  border: 2px solid #e5e7eb; 
  background: white; 
  border-radius: 10px; 
  cursor: pointer; 
  font-size: 13px; 
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.btn.primary { 
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white; 
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
}
.btn.primary:hover {
  background: linear-gradient(135deg, #0044CC 0%, #003399 100%);
  box-shadow: 0 8px 20px rgba(0, 68, 204, 0.4);
}
.btn.secondary {
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%);
  color: #1e293b;
  border-color: #e5e7eb;
}
.btn.secondary:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
}
.btn.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.btn.danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}
.btn.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.small { 
  height: 32px; 
  padding: 0 16px;
  font-size: 12px;
}

/* 对话框样式 */
.upload-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.upload-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.dialog-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 删除确认对话框样式 */
.delete-dialog {
  max-width: 450px;
}

.delete-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  color: #f59e0b;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.delete-message {
  font-size: 16px;
  color: #374151;
  margin-bottom: 12px;
  line-height: 1.5;
}

.delete-message strong {
  color: #1e293b;
  font-weight: 700;
}

.delete-tip {
  font-size: 13px;
  color: #ef4444;
  margin: 0;
  padding: 12px 20px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fee2e2;
  max-width: 90%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

@media (max-width: 900px) {
  .cabinet-layout { grid-template-columns: 1fr; }
}
</style>