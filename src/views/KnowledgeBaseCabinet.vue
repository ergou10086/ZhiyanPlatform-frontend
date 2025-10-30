<template>
  <div class="cabinet-view">
    <div class="cabinet-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 左侧列表 -->
      <div class="list-pane" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="toolbar">
          <div class="toolbar-buttons" v-if="!sidebarCollapsed">
            <button class="btn primary small" @click="createNewDocument">+ 新建文档</button>
            <button class="btn secondary small" @click="createNewFolder">+ 新建文件夹</button>
          </div>
          <input class="search" type="text" placeholder="搜索文档" v-if="!sidebarCollapsed" />
        </div>
        <div v-for="folder in folders" :key="folder.id" class="folder-section" v-if="!sidebarCollapsed">
          <div class="group-title" @click="toggleFolder(folder.id)">
            <span>{{ folder.name }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
                 :class="{ 'folder-icon': true, 'expanded': folder.expanded }">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <ul v-if="folder.expanded" class="doc-list">
            <li v-for="doc in getDocsInFolder(folder.id)" :key="doc.id" 
                :class="{ active: doc.id===activeId }" 
                @click="activeId=doc.id">{{ doc.title }}</li>
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
        <div class="doc-meta">
          <div class="doc-title">{{ activeDoc.title }}</div>
          <div class="doc-updated">更新日期：{{ activeDoc.updated }}</div>
        </div>
        <textarea 
          class="editor" 
          :class="{ 'readonly': !isEditing }"
          v-model="activeDocContent" 
          @input="updateContent"
          :readonly="!isEditing"
        ></textarea>
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
          <button class="btn primary" @click="saveDocument" :disabled="!isEditing || !hasUnsavedChanges">
            {{ isEditing && hasUnsavedChanges ? '保存*' : '已保存' }}
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
            <label>文档标题：</label>
            <input v-model="newDocTitle" type="text" placeholder="请输入文档标题" />
          </div>
          <div class="form-group">
            <label>文档分类：</label>
            <select v-model="newDocCategory">
              <option v-for="folder in folders" :key="folder.id" :value="folder.name">{{ folder.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>文档内容：</label>
            <textarea v-model="newDocContent" placeholder="请输入文档内容" rows="10"></textarea>
          </div>
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeNewDocDialog">取消</button>
            <button class="btn primary" @click="confirmNewDoc" :disabled="!newDocTitle">确认创建</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建文件夹对话框 -->
    <div v-if="showNewFolderDialog" class="upload-dialog-overlay" @click="closeNewFolderDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <h3>新建文件夹</h3>
          <button class="close-btn" @click="closeNewFolderDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>文件夹名称：</label>
            <input v-model="newFolderName" type="text" placeholder="请输入文件夹名称" />
          </div>
          <div class="form-group">
            <label>文件夹描述：</label>
            <textarea v-model="newFolderDescription" placeholder="请输入文件夹描述（可选）" rows="3"></textarea>
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
      activeId: 1,
      showNewDocDialog: false,
      showNewFolderDialog: false,
      newDocTitle: '',
      newDocCategory: '',
      newDocContent: '',
      newFolderName: '',
      newFolderDescription: '',
      hasUnsavedChanges: false,
      autoSaveTimer: null,
      isEditing: false,
      sidebarCollapsed: false, // 左侧面板折叠状态
      folders: [
        { id: 1, name: '项目管理规范', description: '项目管理和规范相关文档', expanded: true },
        { id: 2, name: '会议纪要', description: '会议记录和纪要', expanded: true },
        { id: 3, name: '培训资料', description: '培训和学习资料', expanded: true }
      ],
      docs: [
        { 
          id: 1, 
          title: '项目管理规范 v2.1', 
          updated: '2023年11月15日',
          content: `项目管理规范 v2.1\n更新日期：2023年11月15日\n1. 项目启动阶段...\n(此处为示例内容，可替换为真实文档内容。)`
        },
        { 
          id: 2, 
          title: '项目管理规范 v2.0', 
          updated: '2023年10月15日',
          content: `项目管理规范 v2.0\n更新日期：2023年10月15日\n1. 项目启动阶段...\n(此处为示例内容，可替换为真实文档内容。)`
        },
        { 
          id: 3, 
          title: '项目管理规范 v1.9', 
          updated: '2023年09月15日',
          content: `项目管理规范 v1.9\n更新日期：2023年09月15日\n1. 项目启动阶段...\n(此处为示例内容，可替换为真实文档内容。)`
        }
      ]
    }
  },
  computed: {
    activeDoc() {
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
    }
  },
  mounted() {
    // 组件挂载时加载本地存储的数据
    this.loadFromLocalStorage()
    
    // 监听页面离开事件，提醒用户保存
    window.addEventListener('beforeunload', this.handleBeforeUnload)
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
  },
  methods: {
    createNewDocument() {
      this.showNewDocDialog = true
      this.newDocCategory = this.folders[0]?.name || ''
    },
    
    closeNewDocDialog() {
      this.showNewDocDialog = false
      this.newDocTitle = ''
      this.newDocCategory = ''
      this.newDocContent = ''
    },

    createNewFolder() {
      this.showNewFolderDialog = true
      this.newFolderName = ''
      this.newFolderDescription = ''
    },
    
    closeNewFolderDialog() {
      this.showNewFolderDialog = false
      this.newFolderName = ''
      this.newFolderDescription = ''
    },

    confirmNewFolder() {
      if (!this.newFolderName.trim()) return      
      const newFolder = {
        id: Date.now(),
        name: this.newFolderName.trim(),
        description: this.newFolderDescription.trim(),
        expanded: true
      }
      
      this.folders.push(newFolder)
      this.saveToLocalStorage()
      this.closeNewFolderDialog()
    },

    toggleFolder(folderId) {
      const folder = this.folders.find(f => f.id === folderId)
      if (folder) {
        folder.expanded = !folder.expanded
        this.saveToLocalStorage()
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
          this.isEditing = false
          this.hasUnsavedChanges = false
          // 重新加载当前文档内容
          this.loadCurrentDocContent()
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
    
    confirmNewDoc() {
      if (this.newDocTitle) {
        // 找到选中的文件夹ID
        const selectedFolder = this.folders.find(f => f.name === this.newDocCategory)
        
        const newDoc = {
          id: Date.now(),
          title: this.newDocTitle,
          updated: new Date().toLocaleString('zh-CN'),
          content: this.newDocContent || '新建文档内容...',
          folderId: selectedFolder?.id || null
        }
        
        this.docs.unshift(newDoc)
        this.activeId = newDoc.id
        this.closeNewDocDialog()
        
        // 自动保存到本地存储
        this.saveToLocalStorage()
        
        // 通知父组件有新文档创建
        this.$emit('document-created', newDoc)
        
        alert('文档创建成功！已自动保存。')
      }
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
      if (this.activeDoc) {
        // 更新文档内容
        this.activeDoc.content = this.activeDocContent
        // 更新文档的保存时间
        this.activeDoc.updated = new Date().toLocaleString('zh-CN')
        
        // 保存到本地存储
        this.saveToLocalStorage()
        
        // 标记已保存并退出编辑模式
        this.hasUnsavedChanges = false
        this.isEditing = false
        
        // 通知父组件文档已保存
        this.$emit('document-saved', this.activeDoc)
        
        alert('文档保存成功！')
      }
    },
    
    autoSave() {
      if (this.activeDoc && this.hasUnsavedChanges) {
        // 静默保存，不显示提示
        this.activeDoc.updated = new Date().toLocaleString('zh-CN')
        this.saveToLocalStorage()
        this.hasUnsavedChanges = false
        
        // 通知父组件文档已自动保存
        this.$emit('document-auto-saved', this.activeDoc)
        
        console.log('文档已自动保存')
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
          if (data.docs && Array.isArray(data.docs) && data.docs.length > 0) {
            this.docs = data.docs
            console.log(`知识柜数据已从本地存储加载 (项目ID: ${this.projectId})`)
          }
          if (data.folders && Array.isArray(data.folders) && data.folders.length > 0) {
            this.folders = data.folders
            console.log(`文件夹数据已从本地存储加载 (项目ID: ${this.projectId})`)
          }
          if (data.activeId) {
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
.doc-list { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; }
.doc-list li { padding: 8px 10px; border-radius: 8px; cursor: pointer; color: #374151; font-size: 13px; }
.doc-list li:hover { background: #f6f7fb; }
.doc-list li.active { background: #e0ebff; color: #0044CC; }

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

@media (max-width: 900px) {
  .cabinet-layout { grid-template-columns: 1fr; }
}
</style>
