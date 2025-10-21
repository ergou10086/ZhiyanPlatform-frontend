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
              <th>成果名</th>
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
                <div class="file-info">
                  <div class="file-name">{{ row.name }}</div>
                  <div v-if="row.fileCount && row.fileCount > 1" class="file-count">包含 {{ row.fileCount }} 个文件</div>
                </div>
              </td>
              <td>{{ row.type }}</td>
              <td>{{ row.uploader }}</td>
              <td>{{ row.time }}</td>
              <td class="ops">
                <a href="#" @click.prevent="viewFile(row)">查看</a>
                <a href="#" @click.prevent="downloadAllFiles(row)" v-if="row.files && row.files.length > 1">下载全部</a>
                <a href="#" @click.prevent="downloadFile(row)" v-else>下载</a>
                <a href="#" @click.prevent="deleteFile(row)" class="delete-link">删除</a>
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

    <!-- 成果上传对话框 -->
    <div v-if="showUploadDialog" class="upload-dialog-overlay" @click="closeUploadDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-title-section">
            <span class="file-type-badge" :class="getTypeClass(currentFileType)">{{ currentFileType }}</span>
            <h3>上传{{ currentFileType }}</h3>
          </div>
          <button class="close-btn" @click="closeUploadDialog">×</button>
        </div>
        <div class="dialog-content">
          <!-- 成果名称 -->
          <div class="form-group">
            <label>成果名称：</label>
            <input 
              v-model="achievementForm.name" 
              type="text" 
              placeholder="请输入成果名称"
              class="form-input"
            />
          </div>
          
          <!-- 成果详细描述 - 根据类型显示不同的字段 -->
          <div class="form-group">
            <label>成果详细描述：</label>
            <div class="description-fields">
              <!-- 论文类型 -->
              <template v-if="currentFileType === '论文'">
                <div class="description-row">
                  <div class="description-label">论文名：</div>
                  <input 
                    v-model="achievementForm.paperName" 
                    type="text" 
                    placeholder="请输入论文名"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">论文标识：</div>
                  <input 
                    v-model="achievementForm.paperId" 
                    type="text" 
                    placeholder="请输入论文标识"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 专利类型 -->
              <template v-else-if="currentFileType === '专利'">
                <div class="description-row">
                  <div class="description-label">专利名：</div>
                  <input 
                    v-model="achievementForm.patentName" 
                    type="text" 
                    placeholder="请输入专利名"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">专利标识：</div>
                  <input 
                    v-model="achievementForm.patentId" 
                    type="text" 
                    placeholder="请输入专利标识"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 数据集类型 -->
              <template v-else-if="currentFileType === '数据集'">
                <div class="description-row">
                  <div class="description-label">数据集名：</div>
                  <input 
                    v-model="achievementForm.datasetName" 
                    type="text" 
                    placeholder="请输入数据集名"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">数据集标识：</div>
                  <input 
                    v-model="achievementForm.datasetId" 
                    type="text" 
                    placeholder="请输入数据集标识"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 模型文件类型 -->
              <template v-else-if="currentFileType === '模型文件'">
                <div class="description-row">
                  <div class="description-label">模型名：</div>
                  <input 
                    v-model="achievementForm.modelName" 
                    type="text" 
                    placeholder="请输入模型名"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">模型标识：</div>
                  <input 
                    v-model="achievementForm.modelId" 
                    type="text" 
                    placeholder="请输入模型标识"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 实验报告类型 -->
              <template v-else-if="currentFileType === '实验报告'">
                <div class="description-row">
                  <div class="description-label">报告名：</div>
                  <input 
                    v-model="achievementForm.reportName" 
                    type="text" 
                    placeholder="请输入报告名"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">报告标识：</div>
                  <input 
                    v-model="achievementForm.reportId" 
                    type="text" 
                    placeholder="请输入报告标识"
                    class="form-input"
                  />
                </div>
              </template>
            </div>
          </div>
          
          <!-- 文件上传区域 -->
          <div class="form-group">
            <label>上传文件：</label>
            <div class="file-upload-area">
              <div class="uploaded-files" v-if="achievementForm.files.length > 0">
                <div 
                  v-for="(file, index) in achievementForm.files" 
                  :key="index" 
                  class="file-item"
                >
                  <div class="file-info">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button class="remove-file-btn" @click="removeFile(index)" title="删除文件">
                    ×
                  </button>
                </div>
              </div>
              <div class="upload-zone" @click="triggerFileSelect">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>点击添加文件</p>
                <p class="upload-hint">支持多文件上传</p>
              </div>
            </div>
          </div>
          
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeUploadDialog">取消</button>
            <button 
              class="btn primary" 
              @click="confirmUpload" 
              :disabled="!achievementForm.name.trim() || achievementForm.files.length === 0"
            >
              确认上传
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义类型上传对话框（与成果上传一致，增加类型名称） -->
    <div v-if="showCustomDialog" class="upload-dialog-overlay" @click="closeCustomDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-title-section">
            <span class="file-type-badge doc">{{ customUploadForm.typeName || '自定义' }}</span>
            <h3>创建自定义类型并上传</h3>
          </div>
          <button class="close-btn" @click="closeCustomDialog">×</button>
        </div>
        <div class="dialog-content">
          <!-- 类型名称（新增，置于最上方） -->
          <div class="form-group">
            <label>类型名称：</label>
            <input 
              v-model="customUploadForm.typeName" 
              type="text" 
              placeholder="请输入类型名称"
              class="form-input"
            />
          </div>

          <!-- 成果名称 -->
          <div class="form-group">
            <label>成果名称：</label>
            <input 
              v-model="customUploadForm.name" 
              type="text" 
              placeholder="请输入成果名称"
              class="form-input"
            />
          </div>

          <!-- 成果详细描述 - 自定义两列输入框 -->
          <div class="form-group">
            <label>成果详细描述：</label>
            <div class="description-fields">
              <div 
                v-for="(desc, index) in customUploadForm.descriptions" 
                :key="index" 
                class="description-field"
              >
                <div class="description-row">
                  <input 
                    v-model="desc.leftField"
                    type="text" 
                    placeholder=""
                    class="form-input form-input-small"
                  />
                  <input 
                    v-model="desc.rightField"
                    type="text" 
                    placeholder=""
                    class="form-input form-input-large"
                  />
                  <button 
                    v-if="customUploadForm.descriptions.length > 1"
                    class="remove-desc-btn" 
                    @click="removeCustomDescription(index)"
                    title="删除此行"
                  >
                    ×
                  </button>
                </div>
              </div>
              <button class="add-desc-btn" @click="addCustomDescription">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                添加描述
              </button>
            </div>
          </div>

          <!-- 文件上传区域 -->
          <div class="form-group">
            <label>上传文件：</label>
            <div class="file-upload-area">
              <div class="uploaded-files" v-if="customUploadForm.files.length > 0">
                <div 
                  v-for="(file, index) in customUploadForm.files" 
                  :key="index" 
                  class="file-item"
                >
                  <div class="file-info">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button class="remove-file-btn" @click="removeCustomFile(index)" title="删除文件">
                    ×
                  </button>
                </div>
              </div>
              <div class="upload-zone" @click="triggerCustomFileSelect">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>点击添加文件</p>
                <p class="upload-hint">支持多文件上传</p>
              </div>
            </div>
          </div>

          <div class="dialog-actions">
            <button class="btn secondary" @click="closeCustomDialog">取消</button>
            <button 
              class="btn primary" 
              @click="confirmCustomType" 
              :disabled="!customUploadForm.typeName.trim() || !customUploadForm.name.trim() || customUploadForm.files.length === 0"
            >
              确认创建
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件查看对话框 -->
    <div v-if="showViewDialog" class="file-view-overlay" @click="closeViewDialog">
      <div class="file-view-dialog" @click.stop>
        <div class="file-view-header">
          <div class="file-info">
            <div class="achievement-badge" :class="viewingFile?.typeCls">
              <span class="achievement-icon">{{ getFileIcon(viewingFile?.name || '') }}</span>
            </div>
            <div class="achievement-info">
              <h3>{{ viewingFile?.name }}</h3>
              <div v-if="viewingFile?.fileCount && viewingFile.fileCount > 1" class="file-count-info">
                <span class="count-icon">📁</span>
                包含 {{ viewingFile.fileCount }} 个文件
              </div>
            </div>
          </div>
          <button class="close-btn" @click="closeViewDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="file-view-content">
          <!-- 多文件列表 -->
          <div v-if="viewingFile?.files && viewingFile.files.length > 1" class="multi-file-content">
            <div class="file-list">
              <div 
                v-for="(file, index) in viewingFile.files" 
                :key="file.id || index"
                class="file-item"
                :class="{ active: selectedFileIndex === index }"
                @click="selectFile(index)"
              >
                <div class="file-item-info">
                  <div class="file-icon-wrapper">
                    <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                  </div>
                  <div class="file-details">
                    <div class="file-name" :title="file.name">{{ file.name || file.originalFileName || '未知文件' }}</div>
                    <div class="file-meta">
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      <span class="file-separator">•</span>
                      <span class="file-type">{{ getFileTypeDisplay(file.type) }}</span>
                    </div>
                  </div>
                </div>
                <div class="file-actions">
                  <button class="action-btn view-btn" @click.stop="viewSingleFile(file)" title="查看">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button class="action-btn download-btn" @click.stop="downloadSingleFile(file)" title="下载">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                      <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 3V15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button class="action-btn delete-btn" @click.stop="deleteSingleFile(file, index)" title="删除">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 文件预览区域 -->
            <div v-if="selectedFileIndex !== null" class="file-preview">
              <div class="preview-header">
                <div class="preview-file-info">
                  <div class="preview-file-icon">{{ getFileIcon(viewingFile.files[selectedFileIndex].name) }}</div>
                  <div class="preview-file-details">
                    <h4>{{ viewingFile.files[selectedFileIndex].name || viewingFile.files[selectedFileIndex].originalFileName || '未知文件' }}</h4>
                    <div class="preview-file-meta">
                      {{ formatFileSize(viewingFile.files[selectedFileIndex].size) }} • {{ getFileTypeDisplay(viewingFile.files[selectedFileIndex].type) }}
                    </div>
                  </div>
                </div>
                <div class="preview-actions">
                  <button class="btn small primary" @click="downloadSingleFile(viewingFile.files[selectedFileIndex])">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                      <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 3V15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    下载
                  </button>
                  <button class="btn small secondary" @click="viewSingleFile(viewingFile.files[selectedFileIndex])">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    查看详情
                  </button>
                </div>
              </div>
              
              <!-- 成果详细描述 -->
              <div v-if="viewingFile && getAchievementDescription(viewingFile)" class="achievement-description">
                <div class="detail-label">成果详细描述：</div>
                <div class="description-content">
                  <div v-if="viewingFile.paperName || viewingFile.paperId" class="description-item">
                    <span v-if="viewingFile.paperName" class="desc-label">论文名：</span>
                    <span v-if="viewingFile.paperName" class="desc-value">{{ viewingFile.paperName }}</span>
                    <span v-if="viewingFile.paperId" class="desc-label">论文标识：</span>
                    <span v-if="viewingFile.paperId" class="desc-value">{{ viewingFile.paperId }}</span>
                  </div>
                  <div v-if="viewingFile.patentName || viewingFile.patentId" class="description-item">
                    <span v-if="viewingFile.patentName" class="desc-label">专利名：</span>
                    <span v-if="viewingFile.patentName" class="desc-value">{{ viewingFile.patentName }}</span>
                    <span v-if="viewingFile.patentId" class="desc-label">专利标识：</span>
                    <span v-if="viewingFile.patentId" class="desc-value">{{ viewingFile.patentId }}</span>
                  </div>
                  <div v-if="viewingFile.datasetName || viewingFile.datasetId" class="description-item">
                    <span v-if="viewingFile.datasetName" class="desc-label">数据集名：</span>
                    <span v-if="viewingFile.datasetName" class="desc-value">{{ viewingFile.datasetName }}</span>
                    <span v-if="viewingFile.datasetId" class="desc-label">数据集标识：</span>
                    <span v-if="viewingFile.datasetId" class="desc-value">{{ viewingFile.datasetId }}</span>
                  </div>
                  <div v-if="viewingFile.modelName || viewingFile.modelId" class="description-item">
                    <span v-if="viewingFile.modelName" class="desc-label">模型名：</span>
                    <span v-if="viewingFile.modelName" class="desc-value">{{ viewingFile.modelName }}</span>
                    <span v-if="viewingFile.modelId" class="desc-label">模型标识：</span>
                    <span v-if="viewingFile.modelId" class="desc-value">{{ viewingFile.modelId }}</span>
                  </div>
                  <div v-if="viewingFile.reportName || viewingFile.reportId" class="description-item">
                    <span v-if="viewingFile.reportName" class="desc-label">报告名：</span>
                    <span v-if="viewingFile.reportName" class="desc-value">{{ viewingFile.reportName }}</span>
                    <span v-if="viewingFile.reportId" class="desc-label">报告标识：</span>
                    <span v-if="viewingFile.reportId" class="desc-value">{{ viewingFile.reportId }}</span>
                  </div>
                  <div v-if="viewingFile.descriptions && viewingFile.descriptions.length > 0" class="description-item">
                    <div v-for="(desc, index) in viewingFile.descriptions" :key="index" class="custom-description">
                      <span class="desc-value">{{ desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="preview-content">
                <div class="preview-placeholder">
                  <div class="preview-icon">🔍</div>
                  <h3>文件预览</h3>
                  <p>点击"查看详情"查看完整文件内容</p>
                  <div class="preview-features">
                    <div class="feature-item">
                      <span class="feature-icon">📄</span>
                      <span>支持多种文件格式</span>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">⚡</span>
                      <span>快速预览和下载</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 单文件内容（保持原有逻辑） -->
          <div v-else>
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
                
                <!-- 成果详细描述 -->
                <div v-if="viewingFile && getAchievementDescription(viewingFile)" class="achievement-description">
                  <div class="detail-label">成果详细描述：</div>
                  <div class="description-content">
                    <div v-if="viewingFile.paperName || viewingFile.paperId" class="description-item">
                      <span v-if="viewingFile.paperName" class="desc-label">论文名：</span>
                      <span v-if="viewingFile.paperName" class="desc-value">{{ viewingFile.paperName }}</span>
                      <span v-if="viewingFile.paperId" class="desc-label">论文标识：</span>
                      <span v-if="viewingFile.paperId" class="desc-value">{{ viewingFile.paperId }}</span>
                    </div>
                    <div v-if="viewingFile.patentName || viewingFile.patentId" class="description-item">
                      <span v-if="viewingFile.patentName" class="desc-label">专利名：</span>
                      <span v-if="viewingFile.patentName" class="desc-value">{{ viewingFile.patentName }}</span>
                      <span v-if="viewingFile.patentId" class="desc-label">专利标识：</span>
                      <span v-if="viewingFile.patentId" class="desc-value">{{ viewingFile.patentId }}</span>
                    </div>
                    <div v-if="viewingFile.datasetName || viewingFile.datasetId" class="description-item">
                      <span v-if="viewingFile.datasetName" class="desc-label">数据集名：</span>
                      <span v-if="viewingFile.datasetName" class="desc-value">{{ viewingFile.datasetName }}</span>
                      <span v-if="viewingFile.datasetId" class="desc-label">数据集标识：</span>
                      <span v-if="viewingFile.datasetId" class="desc-value">{{ viewingFile.datasetId }}</span>
                    </div>
                    <div v-if="viewingFile.modelName || viewingFile.modelId" class="description-item">
                      <span v-if="viewingFile.modelName" class="desc-label">模型名：</span>
                      <span v-if="viewingFile.modelName" class="desc-value">{{ viewingFile.modelName }}</span>
                      <span v-if="viewingFile.modelId" class="desc-label">模型标识：</span>
                      <span v-if="viewingFile.modelId" class="desc-value">{{ viewingFile.modelId }}</span>
                    </div>
                    <div v-if="viewingFile.reportName || viewingFile.reportId" class="description-item">
                      <span v-if="viewingFile.reportName" class="desc-label">报告名：</span>
                      <span v-if="viewingFile.reportName" class="desc-value">{{ viewingFile.reportName }}</span>
                      <span v-if="viewingFile.reportId" class="desc-label">报告标识：</span>
                      <span v-if="viewingFile.reportId" class="desc-value">{{ viewingFile.reportId }}</span>
                    </div>
                    <div v-if="viewingFile.descriptions && viewingFile.descriptions.length > 0" class="description-item">
                      <div v-for="(desc, index) in viewingFile.descriptions" :key="index" class="custom-description">
                        <span class="desc-value">{{ desc }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="file-preview-notice">
                <p>此文件类型暂不支持在线预览，您可以点击下载按钮下载到本地查看。</p>
              </div>
            </div>
          </div>
        </div>
        <div class="file-view-footer">
          <button class="btn secondary" @click="closeViewDialog">关闭</button>
          <button v-if="viewingFile?.files && viewingFile.files.length > 1" class="btn primary" @click="downloadAllFiles(viewingFile)">下载全部</button>
          <button v-else class="btn primary" @click="downloadFile(viewingFile)">下载</button>
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
      fileContentType: 'text',
      selectedFileIndex: null,
      // 新增：成果上传表单数据
      achievementForm: {
        name: '',
        descriptions: [
          { content: '' }
        ],
        files: []
      },
      // 新增：自定义类型上传表单
      customUploadForm: {
        typeName: '',
        name: '',
        descriptions: [
          { content: '' }
        ],
        files: []
      }
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
      // 重置表单数据
      this.resetAchievementForm()
      this.showUploadDialog = true
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
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        // 根据当前显示的弹窗决定添加到哪个表单
        if (this.showCustomDialog) {
          // 自定义类型弹窗
          files.forEach(file => {
            this.customUploadForm.files.push({
              name: file.name,
              size: file.size,
              type: file.type,
              file: file
            })
          })
        } else if (this.showUploadDialog) {
          // 普通上传弹窗
          files.forEach(file => {
            this.achievementForm.files.push({
              name: file.name,
              size: file.size,
              type: file.type,
              file: file
            })
          })
        }
        // 清空文件输入
        this.$refs.fileInput.value = ''
      }
    },
    
    triggerFileSelect() {
      this.$refs.fileInput.click()
    },
    
    removeFile(index) {
      this.achievementForm.files.splice(index, 1)
    },
    
    
    resetAchievementForm() {
      this.achievementForm = {
        name: '',
        // 论文字段
        paperName: '',
        paperId: '',
        // 专利字段
        patentName: '',
        patentId: '',
        // 数据集字段
        datasetName: '',
        datasetId: '',
        // 模型文件字段
        modelName: '',
        modelId: '',
        // 实验报告字段
        reportName: '',
        reportId: '',
        files: []
      }
    },
    
    async confirmUpload() {
      if (this.achievementForm.name.trim() && this.achievementForm.files.length > 0) {
        try {
          // 转换文件为 ArrayBuffer 以便保存到 localStorage
          const filesWithBuffer = await Promise.all(
            this.achievementForm.files.map(async (fileData, index) => {
              const arrayBuffer = await fileData.file.arrayBuffer()
              return {
                id: Date.now() + index,
                name: fileData.name,
                originalFileName: fileData.name,
                size: fileData.size,
                type: fileData.type,
                fileBuffer: arrayBuffer, // 保存 ArrayBuffer
                file: fileData.file // 保留原始 File 对象用于当前会话
              }
            })
          )
          
          // 创建一个成果记录，包含所有文件
          const newAchievement = {
            id: Date.now(),
            name: this.achievementForm.name,
            type: this.currentFileType,
            uploader: '当前用户',
            time: new Date().toLocaleString('zh-CN'),
            typeCls: this.getTypeClass(this.currentFileType),
            // 根据类型保存相应的字段
            ...(this.currentFileType === '论文' && {
              paperName: this.achievementForm.paperName,
              paperId: this.achievementForm.paperId
            }),
            ...(this.currentFileType === '专利' && {
              patentName: this.achievementForm.patentName,
              patentId: this.achievementForm.patentId
            }),
            ...(this.currentFileType === '数据集' && {
              datasetName: this.achievementForm.datasetName,
              datasetId: this.achievementForm.datasetId
            }),
            ...(this.currentFileType === '模型文件' && {
              modelName: this.achievementForm.modelName,
              modelId: this.achievementForm.modelId
            }),
            ...(this.currentFileType === '实验报告' && {
              reportName: this.achievementForm.reportName,
              reportId: this.achievementForm.reportId
            }),
            files: filesWithBuffer,
            fileCount: this.achievementForm.files.length
          }
          
          this.uploadedFiles.push(newAchievement)
          this.$emit('file-uploaded', newAchievement)
          
          // 重置状态
          this.resetAchievementForm()
          this.showUploadDialog = false
          
          // 跳转到最后一页显示新上传的文件
          this.goToLastPage()
          
          // 自动保存到本地存储
          this.saveToLocalStorage()
          
          alert(`成果"${this.achievementForm.name}"上传成功！已添加${this.achievementForm.files.length}个文件到成果档案中。`)
        } catch (error) {
          console.error('文件上传失败:', error)
          alert('文件上传失败，请重试')
        }
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
      this.resetAchievementForm()
      this.$refs.fileInput.value = ''
    },
    
    createCustomType() {
      // 打开自定义上传弹窗并重置表单
      this.resetCustomForm()
      this.showCustomDialog = true
    },
    
    triggerCustomFileSelect() {
      // 复用隐藏的文件输入
      this.$refs.fileInput.click()
    },
    
    removeCustomFile(index) {
      this.customUploadForm.files.splice(index, 1)
    },
    
    addCustomDescription() {
      this.customUploadForm.descriptions.push({ leftField: '', rightField: '' })
    },
    
    removeCustomDescription(index) {
      if (this.customUploadForm.descriptions.length > 1) {
        this.customUploadForm.descriptions.splice(index, 1)
      }
    },
    
    resetCustomForm() {
      this.customUploadForm = {
        typeName: '',
        name: '',
        descriptions: [
          { leftField: '', rightField: '' }
        ],
        files: []
      }
    },
    
    async confirmCustomType() {
      if (this.customUploadForm.typeName.trim() && this.customUploadForm.name.trim() && this.customUploadForm.files.length > 0) {
        try {
          const typeDisplay = this.customUploadForm.typeName.trim()
          
          // 转换文件为 ArrayBuffer 以便保存到 localStorage
          const filesWithBuffer = await Promise.all(
            this.customUploadForm.files.map(async (fileData, index) => {
              const arrayBuffer = await fileData.file.arrayBuffer()
              const originalFileName = fileData.name
              const fileExtension = this.getFileExtension(originalFileName)
              
              return {
                id: Date.now() + index,
                name: this.customUploadForm.name + (this.customUploadForm.files.length > 1 ? `_${index + 1}` : '') + fileExtension,
                type: fileData.type, // 使用原始文件的 MIME 类型
                uploader: '当前用户',
                time: new Date().toLocaleString('zh-CN'),
                typeCls: this.getTypeClass(typeDisplay),
                fileBuffer: arrayBuffer, // 保存 ArrayBuffer
                file: fileData.file, // 保留原始 File 对象用于当前会话
                descriptions: this.customUploadForm.descriptions.filter(d => d.leftField.trim() || d.rightField.trim()).map(d => `${d.leftField || ''} | ${d.rightField || ''}`),
                originalFileName: originalFileName,
                size: fileData.size
              }
            })
          )
          
          // 创建一个成果记录，包含所有文件
          const newAchievement = {
            id: Date.now(),
            name: this.customUploadForm.name,
            type: typeDisplay,
            uploader: '当前用户',
            time: new Date().toLocaleString('zh-CN'),
            typeCls: 'doc',
            files: filesWithBuffer,
            fileCount: this.customUploadForm.files.length,
            descriptions: this.customUploadForm.descriptions.filter(d => d.leftField.trim() || d.rightField.trim()).map(d => `${d.leftField || ''} | ${d.rightField || ''}`)
          }
          
          this.uploadedFiles.push(newAchievement)
          this.$emit('file-uploaded', newAchievement)
          
          // 重置状态
          this.resetCustomForm()
          this.showCustomDialog = false
          
          // 跳转到最后一页显示新上传的文件
          this.goToLastPage()
          
          // 自动保存到本地存储
          this.saveToLocalStorage()
          
          alert(`自定义类型"${typeDisplay}"的成果已上传！已添加${this.customUploadForm.files.length}个文件到成果档案中。`)
        } catch (error) {
          console.error('自定义类型文件上传失败:', error)
          alert('文件上传失败，请重试')
        }
      }
    },
    
    closeCustomDialog() {
      this.showCustomDialog = false
      this.resetCustomForm()
      this.$refs.fileInput.value = ''
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
      this.selectedFileIndex = null
    },
    
    // 本地存储方法
    saveToLocalStorage() {
      try {
        // 转换 ArrayBuffer 为可序列化的格式
        const serializedFiles = this.uploadedFiles.map(achievement => {
          if (achievement.files && Array.isArray(achievement.files)) {
            const serializedFiles = achievement.files.map(file => {
              const serializedFile = { ...file }
              if (file.fileBuffer && file.fileBuffer instanceof ArrayBuffer) {
                // 将 ArrayBuffer 转换为 Uint8Array，然后转换为普通数组
                serializedFile.fileBuffer = Array.from(new Uint8Array(file.fileBuffer))
              }
              // 移除不可序列化的 File 对象
              delete serializedFile.file
              return serializedFile
            })
            return { ...achievement, files: serializedFiles }
          }
          return achievement
        })
        
        const dataToSave = {
          uploadedFiles: serializedFiles,
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
            // 转换数组形式的 fileBuffer 回 ArrayBuffer
            const deserializedFiles = data.uploadedFiles.map(achievement => {
              if (achievement.files && Array.isArray(achievement.files)) {
                const deserializedFiles = achievement.files.map(file => {
                  const deserializedFile = { ...file }
                  if (file.fileBuffer && Array.isArray(file.fileBuffer)) {
                    // 将数组转换回 ArrayBuffer
                    const uint8Array = new Uint8Array(file.fileBuffer)
                    deserializedFile.fileBuffer = uint8Array.buffer
                  }
                  return deserializedFile
                })
                return { ...achievement, files: deserializedFiles }
              }
              return achievement
            })
            this.uploadedFiles = deserializedFiles
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
      try {
        // 检查是否是单文件成果
        if (file.files && file.files.length > 1) {
          // 多文件成果，下载全部
          this.downloadAllFiles(file)
          return
        }
        
        // 单文件成果或文件对象
        const fileToDownload = file.files && file.files.length === 1 ? file.files[0] : file
        
        // 优先使用 ArrayBuffer，如果没有则使用 File 对象
        let fileData = null
        
        if (fileToDownload.fileBuffer) {
          // 使用保存的 ArrayBuffer
          fileData = fileToDownload.fileBuffer
          console.log('使用 ArrayBuffer 下载文件:', fileToDownload.name, 'ArrayBuffer 长度:', fileToDownload.fileBuffer.byteLength)
          
          // 测试 ArrayBuffer 转换
          this.testArrayBufferConversion(fileToDownload)
        } else if (fileToDownload.file && fileToDownload.file instanceof File) {
          // 使用原始 File 对象
          fileData = fileToDownload.file
          console.log('使用 File 对象下载文件:', fileToDownload.name)
        } else {
          console.warn('文件数据不存在，创建占位文件:', fileToDownload)
          
          // 创建占位文件
          const fileName = fileToDownload.name || fileToDownload.originalFileName || '下载文件'
          const fileExtension = this.getFileExtension(fileName)
          const placeholderContent = this.createPlaceholderContent(fileName, fileToDownload.type)
          
          const blob = new Blob([placeholderContent], { 
            type: fileToDownload.type || this.getMimeType(fileExtension) || 'text/plain' 
          })
          const url = URL.createObjectURL(blob)
          
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          alert(`文件"${fileName}"的原始数据已丢失，已下载占位文件。请重新上传该文件以获得完整内容。`)
          return
        }
        
        // 确保 fileData 是有效的
        if (!fileData) {
          console.error('文件数据无效:', fileToDownload)
          alert('文件数据无效，无法下载')
          return
        }
        
        // 创建 Blob 并下载
        const blob = new Blob([fileData], { 
          type: fileToDownload.type || 'application/octet-stream' 
        })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = fileToDownload.name || fileToDownload.originalFileName || '下载文件'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        console.log('文件下载成功:', fileToDownload.name)
      } catch (error) {
        console.error('下载文件时出错:', error)
        alert('下载失败，请重试')
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    deleteFile(file) {
      if (confirm(`确定要删除成果"${file.name}"吗？此操作不可撤销。`)) {
        // 从上传的文件列表中删除
        const uploadedIndex = this.uploadedFiles.findIndex(f => f.id === file.id)
        if (uploadedIndex !== -1) {
          this.uploadedFiles.splice(uploadedIndex, 1)
          // 保存到本地存储
          this.saveToLocalStorage()
          // 如果当前页没有数据了，跳转到上一页
          if (this.paginatedFiles.length === 0 && this.currentPage > 1) {
            this.currentPage = this.currentPage - 1
          }
          alert('成果删除成功！')
        } else {
          alert('无法删除此成果，请刷新页面后重试。')
        }
      }
    },
    
    // 多文件相关方法
    selectFile(index) {
      this.selectedFileIndex = index
    },
    
    viewSingleFile(file) {
      try {
        console.log('查看文件详情:', file)
        
        // 检查文件类型并决定预览方式
        const fileExtension = this.getFileExtension(file.name || file.originalFileName || '').toLowerCase()
        const mimeType = file.type || this.getMimeType(fileExtension)
        
        // 根据文件类型进行不同的处理
        if (this.isTextFile(mimeType, fileExtension)) {
          this.previewTextFile(file)
        } else if (this.isImageFile(mimeType, fileExtension)) {
          this.previewImageFile(file)
        } else if (this.isPdfFile(mimeType, fileExtension)) {
          this.previewPdfFile(file)
        } else {
          // 其他文件类型显示文件信息
          this.showFileInfo(file)
        }
      } catch (error) {
        console.error('查看文件时出错:', error)
        alert('无法预览此文件，请下载后查看')
      }
    },
    
    // 判断是否为文本文件
    isTextFile(mimeType, extension) {
      const textTypes = ['text/', 'application/json', 'application/xml']
      const textExtensions = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'py', 'csv']
      return textTypes.some(type => mimeType.startsWith(type)) || textExtensions.includes(extension)
    },
    
    // 判断是否为图片文件
    isImageFile(mimeType, extension) {
      const imageTypes = ['image/']
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp']
      return imageTypes.some(type => mimeType.startsWith(type)) || imageExtensions.includes(extension)
    },
    
    // 判断是否为PDF文件
    isPdfFile(mimeType, extension) {
      return mimeType === 'application/pdf' || extension === 'pdf'
    },
    
    // 预览文本文件
    async previewTextFile(file) {
      try {
        let content = ''
        
        if (file.fileBuffer) {
          // 从 ArrayBuffer 读取
          const decoder = new TextDecoder('utf-8')
          content = decoder.decode(file.fileBuffer)
        } else if (file.file && file.file instanceof File) {
          // 从 File 对象读取
          content = await file.file.text()
        } else {
          throw new Error('文件数据不可用')
        }
        
        // 显示文本内容
        this.showTextPreview(file, content)
      } catch (error) {
        console.error('读取文本文件失败:', error)
        this.showFileInfo(file)
      }
    },
    
    // 预览图片文件
    previewImageFile(file) {
      try {
        let url = ''
        
        if (file.fileBuffer) {
          // 从 ArrayBuffer 创建 URL
          const blob = new Blob([file.fileBuffer], { type: file.type })
          url = URL.createObjectURL(blob)
        } else if (file.file && file.file instanceof File) {
          // 从 File 对象创建 URL
          url = URL.createObjectURL(file.file)
        } else {
          throw new Error('文件数据不可用')
        }
        
        // 显示图片预览
        this.showImagePreview(file, url)
      } catch (error) {
        console.error('预览图片文件失败:', error)
        this.showFileInfo(file)
      }
    },
    
    // 预览PDF文件
    previewPdfFile(file) {
      try {
        let url = ''
        
        if (file.fileBuffer) {
          // 从 ArrayBuffer 创建 URL
          const blob = new Blob([file.fileBuffer], { type: 'application/pdf' })
          url = URL.createObjectURL(blob)
        } else if (file.file && file.file instanceof File) {
          // 从 File 对象创建 URL
          url = URL.createObjectURL(file.file)
        } else {
          throw new Error('文件数据不可用')
        }
        
        // 显示PDF预览
        this.showPdfPreview(file, url)
      } catch (error) {
        console.error('预览PDF文件失败:', error)
        this.showFileInfo(file)
      }
    },
    
    // 显示文本预览
    showTextPreview(file, content) {
      // 更新预览区域显示文本内容
      const previewContent = document.querySelector('.preview-content')
      if (previewContent) {
        previewContent.innerHTML = `
          <div class="text-preview">
            <div class="preview-header">
              <h4>${file.name || file.originalFileName || '未知文件'}</h4>
              <div class="preview-actions">
                <button class="btn small primary" onclick="this.parentElement.parentElement.parentElement.parentElement.querySelector('.download-btn').click()">下载</button>
              </div>
            </div>
            <div class="text-content">
              <pre>${this.escapeHtml(content)}</pre>
            </div>
          </div>
        `
      }
    },
    
    // 显示图片预览
    showImagePreview(file, url) {
      const previewContent = document.querySelector('.preview-content')
      if (previewContent) {
        previewContent.innerHTML = `
          <div class="image-preview">
            <div class="preview-header">
              <h4>${file.name || file.originalFileName || '未知文件'}</h4>
              <div class="preview-actions">
                <button class="btn small primary" onclick="this.parentElement.parentElement.parentElement.parentElement.querySelector('.download-btn').click()">下载</button>
              </div>
            </div>
            <div class="image-content">
              <img src="${url}" alt="${file.name}" style="max-width: 100%; max-height: 400px; object-fit: contain;" />
            </div>
          </div>
        `
      }
    },
    
    // 显示PDF预览
    showPdfPreview(file, url) {
      const previewContent = document.querySelector('.preview-content')
      if (previewContent) {
        previewContent.innerHTML = `
          <div class="pdf-preview">
            <div class="preview-header">
              <h4>${file.name || file.originalFileName || '未知文件'}</h4>
              <div class="preview-actions">
                <button class="btn small primary" onclick="this.parentElement.parentElement.parentElement.parentElement.querySelector('.download-btn').click()">下载</button>
              </div>
            </div>
            <div class="pdf-content">
              <iframe src="${url}" width="100%" height="500px" style="border: none;"></iframe>
            </div>
          </div>
        `
      }
    },
    
    // 显示文件信息
    showFileInfo(file) {
      const previewContent = document.querySelector('.preview-content')
      if (previewContent) {
        previewContent.innerHTML = `
          <div class="file-info-preview">
            <div class="preview-header">
              <h4>${file.name || file.originalFileName || '未知文件'}</h4>
              <div class="preview-actions">
                <button class="btn small primary" onclick="this.parentElement.parentElement.parentElement.parentElement.querySelector('.download-btn').click()">下载</button>
              </div>
            </div>
            <div class="file-details">
              <div class="detail-item">
                <span class="detail-label">文件名：</span>
                <span class="detail-value">${file.name || file.originalFileName || '未知文件'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">文件类型：</span>
                <span class="detail-value">${this.getFileTypeDisplay(file.type)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">文件大小：</span>
                <span class="detail-value">${this.formatFileSize(file.size)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">上传时间：</span>
                <span class="detail-value">${file.time || '未知'}</span>
              </div>
            </div>
            <div class="file-preview-notice">
              <p>此文件类型暂不支持在线预览，您可以点击下载按钮下载到本地查看。</p>
            </div>
          </div>
        `
      }
    },
    
    // 检查是否有成果详细描述
    getAchievementDescription(file) {
      if (!file) return false
      
      // 检查各种类型的描述字段
      return file.paperName || file.paperId ||
             file.patentName || file.patentId ||
             file.datasetName || file.datasetId ||
             file.modelName || file.modelId ||
             file.reportName || file.reportId ||
             (file.descriptions && file.descriptions.length > 0)
    },
    
    // 测试 ArrayBuffer 转换
    testArrayBufferConversion(file) {
      if (file.fileBuffer) {
        console.log('原始 ArrayBuffer:', file.fileBuffer)
        console.log('ArrayBuffer 类型:', typeof file.fileBuffer)
        console.log('ArrayBuffer 构造函数:', file.fileBuffer.constructor.name)
        console.log('ArrayBuffer 长度:', file.fileBuffer.byteLength)
        
        // 尝试读取前几个字节
        const uint8Array = new Uint8Array(file.fileBuffer)
        console.log('前10个字节:', Array.from(uint8Array.slice(0, 10)))
      }
    },
    
    // HTML转义
    escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    },
    
    downloadSingleFile(file) {
      try {
        // 优先使用 ArrayBuffer，如果没有则使用 File 对象
        let fileData = null
        
        if (file.fileBuffer) {
          // 使用保存的 ArrayBuffer
          fileData = file.fileBuffer
          console.log('使用 ArrayBuffer 下载文件:', file.name, 'ArrayBuffer 长度:', file.fileBuffer.byteLength)
        } else if (file.file && file.file instanceof File) {
          // 使用原始 File 对象
          fileData = file.file
          console.log('使用 File 对象下载文件:', file.name)
        } else {
          console.warn('文件数据不存在，创建占位文件:', file)
          
          // 创建占位文件
          const fileName = file.name || file.originalFileName || '下载文件'
          const fileExtension = this.getFileExtension(fileName)
          const placeholderContent = this.createPlaceholderContent(fileName, file.type)
          
          const blob = new Blob([placeholderContent], { 
            type: file.type || this.getMimeType(fileExtension) || 'text/plain' 
          })
          const url = URL.createObjectURL(blob)
          
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          alert(`文件"${fileName}"的原始数据已丢失，已下载占位文件。请重新上传该文件以获得完整内容。`)
          return
        }
        
        // 确保 fileData 是有效的
        if (!fileData) {
          console.error('文件数据无效:', file)
          alert('文件数据无效，无法下载')
          return
        }
        
        // 创建 Blob 并下载
        const blob = new Blob([fileData], { type: file.type || 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = file.name || file.originalFileName || '下载文件'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        console.log('文件下载成功:', file.name)
      } catch (error) {
        console.error('下载文件时出错:', error)
        alert('下载失败，请重试')
      }
    },
    
    // 创建占位文件内容
    createPlaceholderContent(fileName, mimeType) {
      const timestamp = new Date().toLocaleString('zh-CN')
      const content = `文件信息
================
文件名: ${fileName}
类型: ${mimeType || '未知'}
创建时间: ${timestamp}

注意: 此文件为占位文件，原始文件数据已丢失。
请重新上传该文件以获得完整内容。

如需恢复原始文件，请联系系统管理员或重新上传。`
      
      return content
    },
    
    // 根据文件扩展名获取MIME类型
    getMimeType(extension) {
      const mimeMap = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'md': 'text/markdown',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'mp4': 'video/mp4',
        'avi': 'video/avi',
        'mov': 'video/quicktime',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'csv': 'text/csv',
        'json': 'application/json',
        'xml': 'text/xml',
        'html': 'text/html',
        'css': 'text/css',
        'py': 'text/x-python',
        'js': 'application/javascript'
      }
      return mimeMap[extension.toLowerCase()] || 'application/octet-stream'
    },
    
    deleteSingleFile(file, index) {
      const fileName = file.name || file.originalFileName || '未知文件'
      if (confirm(`确定要删除文件"${fileName}"吗？`)) {
        // 从成果的文件列表中删除
        this.viewingFile.files.splice(index, 1)
        this.viewingFile.fileCount = this.viewingFile.files.length
        
        // 如果删除了所有文件，删除整个成果
        if (this.viewingFile.files.length === 0) {
          this.deleteFile(this.viewingFile)
          this.closeViewDialog()
        } else {
          // 重新选择文件（如果删除的是当前选中的文件）
          if (this.selectedFileIndex === index) {
            this.selectedFileIndex = Math.max(0, index - 1)
          } else if (this.selectedFileIndex > index) {
            this.selectedFileIndex = this.selectedFileIndex - 1
          }
          
          // 保存到本地存储
          this.saveToLocalStorage()
          alert('文件删除成功！')
        }
      }
    },
    
    downloadAllFiles(achievement) {
      try {
        // 检查是否有文件
        if (!achievement.files || achievement.files.length === 0) {
          alert('没有可下载的文件')
          return
        }
        
        console.log('开始下载全部文件，共', achievement.files.length, '个文件')
        
        // 逐个下载文件，添加延迟避免浏览器阻止
        achievement.files.forEach((file, index) => {
          setTimeout(() => {
            try {
              this.downloadSingleFile(file)
            } catch (error) {
              console.error(`下载文件 ${file.name} 失败:`, error)
            }
          }, index * 800) // 增加延迟时间，避免浏览器阻止
        })
        
        // 显示提示信息
        alert(`开始下载 ${achievement.files.length} 个文件，请稍候...`)
        
      } catch (error) {
        console.error('批量下载时出错:', error)
        alert('批量下载失败，请重试')
      }
    },
    
    // 获取文件图标
    getFileIcon(fileName) {
      const name = fileName || 'unknown'
      const extension = this.getFileExtension(name).toLowerCase()
      const iconMap = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'ppt': '📽️',
        'pptx': '📽️',
        'txt': '📄',
        'md': '📝',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'svg': '🖼️',
        'mp4': '🎥',
        'avi': '🎥',
        'mov': '🎥',
        'mp3': '🎵',
        'wav': '🎵',
        'zip': '📦',
        'rar': '📦',
        '7z': '📦',
        'pkl': '🤖',
        'h5': '🤖',
        'pt': '🤖',
        'pth': '🤖',
        'onnx': '🤖',
        'csv': '📊',
        'json': '📋',
        'xml': '📋',
        'py': '🐍',
        'js': '📜',
        'html': '🌐',
        'css': '🎨'
      }
      return iconMap[extension] || '📄'
    },
    
    // 获取文件类型显示
    getFileTypeDisplay(mimeType) {
      const typeMap = {
        'application/pdf': 'PDF文档',
        'application/msword': 'Word文档',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
        'application/vnd.ms-excel': 'Excel表格',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
        'application/vnd.ms-powerpoint': 'PowerPoint演示',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint演示',
        'text/plain': '文本文件',
        'text/markdown': 'Markdown文档',
        'image/jpeg': 'JPEG图片',
        'image/png': 'PNG图片',
        'image/gif': 'GIF图片',
        'image/svg+xml': 'SVG图片',
        'video/mp4': 'MP4视频',
        'video/avi': 'AVI视频',
        'video/quicktime': 'MOV视频',
        'audio/mpeg': 'MP3音频',
        'audio/wav': 'WAV音频',
        'application/zip': 'ZIP压缩包',
        'application/x-rar-compressed': 'RAR压缩包',
        'application/x-7z-compressed': '7Z压缩包',
        'text/csv': 'CSV数据',
        'application/json': 'JSON数据',
        'text/xml': 'XML数据',
        'text/html': 'HTML文件',
        'text/css': 'CSS样式',
        'application/x-python-code': 'Python脚本'
      }
      return typeMap[mimeType] || '未知类型'
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
.file-info { display: flex; flex-direction: column; gap: 2px; }
.file-name { font-weight: 500; color: #333; }
.file-count { font-size: 12px; color: #6c757d; }
.file-dot { width: 10px; height: 10px; border-radius: 50%; }
.file-dot.doc { background: #3b82f6; }
.file-dot.patent { background: #f59e0b; }
.file-dot.dataset { background: #10b981; }
.file-dot.model { background: #8b5cf6; }
.file-dot.report { background: #fbbf24; }
.ops a { color: #4f46e5; text-decoration: none; margin-right: 12px; font-size: 13px; }
.ops a:hover { text-decoration: underline; }
.ops a.delete-link { color: #dc3545; }
.ops a.delete-link:hover { color: #c82333; text-decoration: underline; }

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
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.dialog-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.file-type-badge.doc {
  background: #3b82f6;
}

.file-type-badge.patent {
  background: #f59e0b;
}

.file-type-badge.dataset {
  background: #10b981;
}

.file-type-badge.model {
  background: #8b5cf6;
}

.file-type-badge.report {
  background: #fbbf24;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
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

/* 新增样式 */
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* 描述字段样式 */
.description-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.description-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.description-label {
  min-width: 80px;
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
}

.description-row .form-input {
  flex: 1;
}

.description-field {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.description-field .form-textarea {
  flex: 1;
}

.description-field .description-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.description-field .description-row .form-input {
  flex: 1;
}

/* 自定义字段尺寸样式 */
.form-input-small {
  flex: 0 0 120px !important; /* 左字段固定宽度，较小 */
  max-width: 120px;
}

.form-input-large {
  flex: 1 !important; /* 右字段占据剩余空间，较大 */
  min-width: 200px;
}

.remove-desc-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-desc-btn:hover {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.add-desc-btn {
  background: #f8f9fa;
  border: 1px dashed #6c757d;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: #6c757d;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
}

.add-desc-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
  border-color: #1976d2;
}

/* 文件上传区域样式 */
.file-upload-area {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
}

.uploaded-files {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.file-size {
  font-size: 12px;
  color: #6c757d;
  flex-shrink: 0;
}

.remove-file-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.upload-zone {
  border: 2px dashed #6c757d;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.upload-zone:hover {
  border-color: #4f46e5;
  background: #f8f9ff;
}

.upload-zone svg {
  color: #6c757d;
  margin-bottom: 12px;
}

.upload-zone:hover svg {
  color: #4f46e5;
}

.upload-zone p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #333;
}

.upload-hint {
  font-size: 12px !important;
  color: #6c757d !important;
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.file-view-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.file-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.achievement-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.achievement-badge.doc { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
.achievement-badge.patent { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.achievement-badge.dataset { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.achievement-badge.model { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
.achievement-badge.report { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }

.achievement-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.achievement-info h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-all;
  line-height: 1.3;
}

.file-count-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
  font-weight: 500;
}

.count-icon {
  font-size: 16px;
}

/* 多文件内容样式 */
.multi-file-content {
  display: flex;
  gap: 24px;
  height: 100%;
  padding: 24px 32px;
}

.file-list {
  width: 360px;
  border-right: 1px solid #e2e8f0;
  padding-right: 24px;
  overflow-y: auto;
  max-height: 600px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-item:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.file-item.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.file-item-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.file-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.file-icon {
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-details .file-name {
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.4;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.file-size {
  font-weight: 500;
  color: #475569;
}

.file-separator {
  color: #cbd5e1;
}

.file-type {
  color: #64748b;
}

.file-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.view-btn:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
  color: #1d4ed8;
}

.download-btn:hover {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #10b981;
  color: #059669;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-color: #ef4444;
  color: #dc2626;
}

.file-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.preview-file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-file-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.preview-file-details h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.preview-file-meta {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.btn.small {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn.small.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn.small.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.btn.small.secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn.small.secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.preview-placeholder {
  text-align: center;
  color: #64748b;
  max-width: 400px;
}

.preview-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.preview-placeholder h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.preview-placeholder p {
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.5;
}

/* 文件预览样式 */
.text-preview, .image-preview, .pdf-preview, .file-info-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.text-content {
  flex: 1;
  overflow: auto;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.text-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2d3748;
}

.image-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.image-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pdf-content {
  flex: 1;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.pdf-content iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.file-details {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #4a5568;
  min-width: 80px;
  margin-right: 12px;
}

.detail-value {
  color: #2d3748;
  flex: 1;
  word-break: break-all;
}

.file-preview-notice {
  margin-top: 20px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  text-align: center;
}

.file-preview-notice p {
  margin: 0;
  color: #856404;
  font-size: 14px;
}

.preview-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  color: #475569;
}

.feature-icon {
  font-size: 18px;
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

/* 成果详细描述样式 */
.achievement-description {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.achievement-description .detail-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  display: block;
}

.description-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.desc-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 80px;
}

.desc-value {
  color: #495057;
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  flex: 1;
  min-width: 120px;
}

.custom-description {
  margin: 4px 0;
}

.custom-description .desc-value {
  background: #e3f2fd;
  border-color: #bbdefb;
  color: #1976d2;
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
