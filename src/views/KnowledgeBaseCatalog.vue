<template>
  <div class="catalog-view">
    <div class="section-card">
      <div class="section-title">成果目录管理</div>
      <div class="section-subtitle">在这里您可以上传各类新的研究成果，并查看已有的成果档案</div>
    </div>

    <div class="section-card">
      <div class="section-title small">添加新成果</div>
      <div class="add-grid">
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-blue"></span>
            <span class="add-name">论文</span>
          </div>
          <div class="add-desc">上传学术论文成果</div>
          <a class="add-link" href="#" @click.prevent="uploadFile('论文')">上传论文</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-orange"></span>
            <span class="add-name">专利</span>
          </div>
          <div class="add-desc">记录专利信息</div>
          <a class="add-link" href="#" @click.prevent="uploadFile('专利')">上传专利</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-green"></span>
            <span class="add-name">数据集</span>
          </div>
          <div class="add-desc">上传研究数据集</div>
          <a class="add-link" href="#" @click.prevent="uploadFile('数据集')">上传数据集</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-purple"></span>
            <span class="add-name">模型文件</span>
          </div>
          <div class="add-desc">存储已训练模型</div>
          <a class="add-link" href="#" @click.prevent="uploadFile('模型文件')">上传模型</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-yellow"></span>
            <span class="add-name">实验报告</span>
          </div>
          <div class="add-desc">上传实验报告文档</div>
          <a class="add-link" href="#" @click.prevent="uploadFile('实验报告')">上传报告</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-pink"></span>
            <span class="add-name">自定义项目</span>
          </div>
          <div class="add-desc">创建自定义成果类型</div>
          <a class="add-link" href="#" @click.prevent="createCustomType">新建类型</a>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title small">已有成果档案</div>
      <div class="table-wrap">
        <table class="doc-table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>类型</th>
              <th>上传者</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedFiles" :key="row.id">
              <td class="filename">
                <span class="file-dot" :class="row.typeCls"></span>
                {{ row.name }}
              </td>
              <td>{{ row.type }}</td>
              <td>{{ row.uploader }}</td>
              <td>{{ row.time }}</td>
              <td class="ops">
                <a href="#" @click.prevent="viewFile(row)">查看</a>
                <a href="#" @click.prevent="downloadFile(row)">下载</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination line">
        <span class="pager-text">{{ paginationInfo }}</span>
        <div class="pager-group">
          <button 
            class="pager small" 
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >上一页</button>
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="page-num small" 
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >{{ page }}</button>
          <button 
            class="pager small" 
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >下一页</button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput" 
      type="file" 
      style="display: none" 
      @change="handleFileSelect"
      :accept="fileAccept"
    />

    <!-- 上传对话框 -->
    <div v-if="showUploadDialog" class="upload-dialog-overlay" @click="closeUploadDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <h3>上传{{ currentFileType }}</h3>
          <button class="close-btn" @click="closeUploadDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="file-info" v-if="selectedFile">
            <p><strong>文件名：</strong>{{ selectedFile.name }}</p>
            <p><strong>文件大小：</strong>{{ formatFileSize(selectedFile.size) }}</p>
            <p><strong>文件类型：</strong>{{ selectedFile.type || '未知' }}</p>
          </div>
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeUploadDialog">取消</button>
            <button class="btn primary" @click="confirmUpload" :disabled="!selectedFile">确认上传</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义类型对话框 -->
    <div v-if="showCustomDialog" class="upload-dialog-overlay" @click="closeCustomDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <h3>创建自定义类型</h3>
          <button class="close-btn" @click="closeCustomDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>类型名称：</label>
            <input v-model="customTypeName" type="text" placeholder="请输入类型名称" />
          </div>
          <div class="form-group">
            <label>类型描述：</label>
            <textarea v-model="customTypeDesc" placeholder="请输入类型描述"></textarea>
          </div>
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeCustomDialog">取消</button>
            <button class="btn primary" @click="confirmCustomType" :disabled="!customTypeName">确认创建</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件查看对话框 -->
    <div v-if="showViewDialog" class="file-view-overlay" @click="closeViewDialog">
      <div class="file-view-dialog" @click.stop>
        <div class="file-view-header">
          <div class="file-info">
            <span class="file-dot" :class="viewingFile?.typeCls"></span>
            <h3>{{ viewingFile?.name }}</h3>
          </div>
          <button class="close-btn" @click="closeViewDialog">×</button>
        </div>
        <div class="file-view-content">
          <!-- 文本文件内容 -->
          <div v-if="fileContentType === 'text'" class="text-content">
            <pre>{{ fileContent }}</pre>
          </div>
          
          <!-- 图片文件内容 -->
          <div v-else-if="fileContentType === 'image'" class="image-content">
            <img :src="fileContent" :alt="viewingFile?.name" />
          </div>
          
          <!-- PDF文件内容 -->
          <div v-else-if="fileContentType === 'pdf'" class="pdf-content">
            <iframe :src="fileContent" width="100%" height="500px"></iframe>
          </div>
          
          <!-- 文件信息 -->
          <div v-else-if="fileContentType === 'info'" class="info-content">
            <div class="file-details">
              <div class="detail-item">
                <span class="detail-label">文件名：</span>
                <span class="detail-value">{{ fileContent.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">文件类型：</span>
                <span class="detail-value">{{ fileContent.type }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">上传者：</span>
                <span class="detail-value">{{ fileContent.uploader }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">上传时间：</span>
                <span class="detail-value">{{ fileContent.time }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">文件大小：</span>
                <span class="detail-value">{{ fileContent.size }}</span>
              </div>
            </div>
            <div class="file-preview-notice">
              <p>此文件类型暂不支持在线预览，您可以点击下载按钮下载到本地查看。</p>
            </div>
          </div>
        </div>
        <div class="file-view-footer">
          <button class="btn secondary" @click="closeViewDialog">关闭</button>
          <button class="btn primary" @click="downloadFile(viewingFile)">下载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBaseCatalog',
  props: {
    archiveRows: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      showUploadDialog: false,
      showCustomDialog: false,
      currentFileType: '',
      selectedFile: null,
      fileAccept: '',
      customTypeName: '',
      customTypeDesc: '',
      uploadedFiles: [],
      currentPage: 1,
      pageSize: 5,
      totalItems: 0,
      showViewDialog: false,
      viewingFile: null,
      fileContent: '',
      fileContentType: 'text'
    }
  },
  computed: {
    // 合并原有数据和上传的数据
    allFiles() {
      return [...this.archiveRows, ...this.uploadedFiles]
    },
    
    // 分页后的数据
    paginatedFiles() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.allFiles.slice(start, end)
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.allFiles.length / this.pageSize)
    },
    
    // 分页信息
    paginationInfo() {
      const start = (this.currentPage - 1) * this.pageSize + 1
      const end = Math.min(this.currentPage * this.pageSize, this.allFiles.length)
      return `显示第 ${start} 到 ${end} 项，共 ${this.allFiles.length} 项`
    },
    
    // 可见的页码
    visiblePages() {
      const pages = []
      const maxVisible = 3
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  mounted() {
    // 组件挂载时加载本地存储的数据
    this.loadFromLocalStorage()
  },
  beforeDestroy() {
    // 组件销毁前保存数据
    this.saveToLocalStorage()
  },
  methods: {
    uploadFile(type) {
      this.currentFileType = type
      this.fileAccept = this.getFileAccept(type)
      this.$refs.fileInput.click()
    },
    
    getFileAccept(type) {
      const acceptMap = {
        '论文': '.pdf,.doc,.docx',
        '专利': '.doc,.docx,.pdf',
        '数据集': '.csv,.xlsx,.json,.txt',
        '模型文件': '.pkl,.h5,.pt,.pth,.onnx',
        '实验报告': '.pdf,.doc,.docx'
      }
      return acceptMap[type] || '*'
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
        this.showUploadDialog = true
      }
    },
    
    confirmUpload() {
      if (this.selectedFile) {
        // 模拟上传文件
        const newFile = {
          id: Date.now(),
          name: this.selectedFile.name,
          type: this.currentFileType,
          uploader: '当前用户',
          time: new Date().toLocaleString('zh-CN'),
          typeCls: this.getTypeClass(this.currentFileType),
          file: this.selectedFile
        }
        
        this.uploadedFiles.push(newFile)
        this.$emit('file-uploaded', newFile)
        
        // 重置状态
        this.selectedFile = null
        this.showUploadDialog = false
        this.$refs.fileInput.value = ''
        
        // 跳转到最后一页显示新上传的文件
        this.goToLastPage()
        
        // 自动保存到本地存储
        this.saveToLocalStorage()
        
        alert(`文件"${newFile.name}"上传成功！已添加到成果档案中。`)
      }
    },
    
    // 分页方法
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    goToLastPage() {
      this.currentPage = this.totalPages
    },
    
    getTypeClass(type) {
      const classMap = {
        '论文': 'doc',
        '专利': 'patent',
        '数据集': 'dataset',
        '模型文件': 'model',
        '实验报告': 'report'
      }
      return classMap[type] || 'doc'
    },
    
    closeUploadDialog() {
      this.showUploadDialog = false
      this.selectedFile = null
      this.$refs.fileInput.value = ''
    },
    
    createCustomType() {
      this.showCustomDialog = true
    },
    
    confirmCustomType() {
      if (this.customTypeName) {
        // 模拟创建自定义类型
        alert(`自定义类型"${this.customTypeName}"创建成功！`)
        this.closeCustomDialog()
      }
    },
    
    closeCustomDialog() {
      this.showCustomDialog = false
      this.customTypeName = ''
      this.customTypeDesc = ''
    },
    
    viewFile(file) {
      this.viewingFile = file
      this.loadFileContent(file)
      this.showViewDialog = true
    },
    
    loadFileContent(file) {
      // 根据文件类型加载内容
      const fileExtension = this.getFileExtension(file.name).toLowerCase()
      
      if (['txt', 'md', 'json', 'csv', 'log'].includes(fileExtension)) {
        // 文本文件
        this.fileContentType = 'text'
        this.loadTextFile(file)
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        // 图片文件
        this.fileContentType = 'image'
        this.loadImageFile(file)
      } else if (fileExtension === 'pdf') {
        // PDF文件
        this.fileContentType = 'pdf'
        this.loadPdfFile(file)
      } else {
        // 其他文件类型，显示文件信息
        this.fileContentType = 'info'
        this.fileContent = this.getFileInfo(file)
      }
    },
    
    loadTextFile(file) {
      if (file.file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.fileContent = e.target.result
        }
        reader.readAsText(file.file, 'UTF-8')
      } else {
        // 模拟文本内容
        this.fileContent = `文件名：${file.name}\n类型：${file.type}\n上传者：${file.uploader}\n上传时间：${file.time}\n\n这是一个示例文件内容。\n实际应用中，这里会显示文件的真实内容。`
      }
    },
    
    loadImageFile(file) {
      if (file.file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.fileContent = e.target.result
        }
        reader.readAsDataURL(file.file)
      } else {
        // 模拟图片
        this.fileContent = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='
      }
    },
    
    loadPdfFile(file) {
      // PDF文件显示
      this.fileContent = file.file ? URL.createObjectURL(file.file) : '#'
    },
    
    getFileInfo(file) {
      return {
        name: file.name,
        type: file.type,
        uploader: file.uploader,
        time: file.time,
        size: file.file ? this.formatFileSize(file.file.size) : '未知大小'
      }
    },
    
    getFileExtension(filename) {
      return filename.split('.').pop() || ''
    },
    
    closeViewDialog() {
      this.showViewDialog = false
      this.viewingFile = null
      this.fileContent = ''
      this.fileContentType = 'text'
    },
    
    // 本地存储方法
    saveToLocalStorage() {
      try {
        const dataToSave = {
          uploadedFiles: this.uploadedFiles,
          currentPage: this.currentPage
        }
        const storageKey = this.projectId ? `knowledgeBaseCatalog_${this.projectId}` : 'knowledgeBaseCatalog'
        localStorage.setItem(storageKey, JSON.stringify(dataToSave))
        console.log(`成果目录数据已保存到本地存储 (项目ID: ${this.projectId})`)
      } catch (error) {
        console.error('保存到本地存储失败:', error)
      }
    },
    
    loadFromLocalStorage() {
      try {
        const storageKey = this.projectId ? `knowledgeBaseCatalog_${this.projectId}` : 'knowledgeBaseCatalog'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const data = JSON.parse(saved)
          if (data.uploadedFiles && Array.isArray(data.uploadedFiles)) {
            this.uploadedFiles = data.uploadedFiles
            console.log(`成果目录数据已从本地存储加载 (项目ID: ${this.projectId})`)
          }
          if (data.currentPage) {
            this.currentPage = data.currentPage
          }
        }
      } catch (error) {
        console.error('从本地存储加载失败:', error)
      }
    },
    
    downloadFile(file) {
      // 创建下载链接
      const url = URL.createObjectURL(file.file || new Blob(['文件内容'], { type: 'text/plain' }))
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
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
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
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

.file-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.file-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
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
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn.secondary {
  background: #f8f9fa;
  color: #333;
}

.btn.secondary:hover {
  background: #e9ecef;
}

.btn.primary {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.btn.primary:hover {
  background: #4338ca;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager:not(:disabled):hover {
  background: #f3f4f6;
}

.page-num:hover {
  background: #f3f4f6;
}

/* 文件查看弹窗样式 */
.file-view-overlay {
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

.file-view-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.file-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  word-break: break-all;
}

.file-view-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  min-height: 400px;
}

.text-content pre {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  max-height: 500px;
  overflow: auto;
}

.image-content {
  text-align: center;
}

.image-content img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.pdf-content {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.pdf-content iframe {
  border: none;
  border-radius: 8px;
}

.info-content {
  text-align: center;
}

.file-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: left;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
  flex-shrink: 0;
}

.detail-value {
  color: #6b7280;
  word-break: break-all;
}

.file-preview-notice {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  color: #92400e;
}

.file-preview-notice p {
  margin: 0;
  font-size: 14px;
}

.file-view-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .add-grid { grid-template-columns: 1fr; }
}
</style>
