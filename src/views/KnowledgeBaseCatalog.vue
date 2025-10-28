<template>
  <div class="catalog-view">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="page-title">
            <span class="title-text">成果目录管理</span>
            <div class="title-decoration"></div>
          </h1>
          <p class="page-subtitle">
            <svg class="subtitle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            在这里您可以上传各类新的研究成果，并查看已有的成果档案
          </p>
        </div>
        <button class="archive-toggle-btn" @click="showArchivePanel = !showArchivePanel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM5 4H8V9H5V4ZM10 4H13V9H10V4ZM8 11V20H5V11H8ZM10 11V20H13V11H10ZM19 20H15V11H19V20ZM15 9V4H19V9H15Z" fill="currentColor"/>
          </svg>
          <span>已有成果档案</span>
        </button>
      </div>
    </div>

    <div class="section-card add-achievement-section">
      <div class="section-title small">添加新成果</div>
      <div class="add-grid">
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-blue"></span>
            <span class="add-name">论文</span>
          </div>
          <div class="add-desc">上传学术论文成果</div>
          <button class="add-btn" @click="uploadFile('论文')">上传论文</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-orange"></span>
            <span class="add-name">专利</span>
          </div>
          <div class="add-desc">记录专利信息</div>
          <button class="add-btn" @click="uploadFile('专利')">上传专利</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-green"></span>
            <span class="add-name">数据集</span>
          </div>
          <div class="add-desc">上传研究数据集</div>
          <button class="add-btn" @click="uploadFile('数据集')">上传数据集</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-purple"></span>
            <span class="add-name">模型文件</span>
          </div>
          <div class="add-desc">存储已训练模型</div>
          <button class="add-btn" @click="uploadFile('模型文件')">上传模型</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-yellow"></span>
            <span class="add-name">实验报告</span>
          </div>
          <div class="add-desc">上传实验报告文档</div>
          <button class="add-btn" @click="uploadFile('实验报告')">上传报告</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-pink"></span>
            <span class="add-name">自定义项目</span>
          </div>
          <div class="add-desc">创建自定义成果类型</div>
          <button class="add-btn" @click="createCustomType">新建类型</button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput" 
      type="file" 
      multiple
      style="display: none" 
      @change="handleFileSelect"
      :accept="showViewDialog ? '*' : fileAccept"
    />

    <!-- 成果上传对话框 -->
    <div v-if="showUploadDialog" class="upload-dialog-overlay" @click="closeUploadDialog">
      <div class="upload-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-title-section">
            <span class="file-type-badge" :class="getTypeClass(currentFileType)">{{ currentFileType }}</span>
            <h3>{{ isAddingToExisting ? '添加文件到现有成果' : '上传' + currentFileType }}</h3>
          </div>
          <button class="close-btn" @click="closeUploadDialog">×</button>
        </div>
        <div class="dialog-content">
          <!-- 成果名称 -->
          <div v-if="!isAddingToExisting" class="form-group">
            <label>成果名称：</label>
            <input 
              v-model="achievementForm.name" 
              type="text" 
              placeholder="请输入成果名称"
              class="form-input"
            />
          </div>
          
          <!-- 为现有成果添加文件时的提示 -->
          <div v-if="isAddingToExisting" class="form-group">
            <div class="existing-achievement-info">
              <span class="info-label">正在为成果添加文件：</span>
              <span class="achievement-name">{{ getTargetAchievementName() }}</span>
            </div>
          </div>
          
          <!-- 成果详细描述 - 根据类型显示不同的字段 -->
          <div class="form-group">
            <label>成果详细描述：</label>
            <div class="description-fields">
              <!-- 论文类型 -->
              <template v-if="currentFileType === '论文'">
                <div class="description-row">
                  <div class="description-label">作者：</div>
                  <input 
                    v-model="achievementForm.paperAuthors" 
                    type="text" 
                    placeholder="请输入作者（可多人，用逗号分隔）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">论文标题：</div>
                  <input 
                    v-model="achievementForm.paperTitle" 
                    type="text" 
                    placeholder="请输入论文标题"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">期刊名称：</div>
                  <input 
                    v-model="achievementForm.journalName" 
                    type="text" 
                    placeholder="请输入期刊名称"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">发表年份：</div>
                  <input 
                    v-model="achievementForm.publishYear" 
                    type="text" 
                    placeholder="请输入发表年份"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">卷号：</div>
                  <input 
                    v-model="achievementForm.volume" 
                    type="text" 
                    placeholder="请输入卷号"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">期号：</div>
                  <input 
                    v-model="achievementForm.issue" 
                    type="text" 
                    placeholder="请输入期号"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 专利类型 -->
              <template v-else-if="currentFileType === '专利'">
                <div class="description-row">
                  <div class="description-label">专利号：</div>
                  <input 
                    v-model="achievementForm.patentNumber" 
                    type="text" 
                    placeholder="请输入专利号"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">专利类型：</div>
                  <input 
                    v-model="achievementForm.patentType" 
                    type="text" 
                    placeholder="请输入专利类型"
                    class="form-input"
                  />
                </div>
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
                  <div class="description-label">发明人：</div>
                  <input 
                    v-model="achievementForm.inventors" 
                    type="text" 
                    placeholder="请输入发明人（可多人，用逗号分隔）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">申请人：</div>
                  <input 
                    v-model="achievementForm.applicants" 
                    type="text" 
                    placeholder="请输入申请人（单位或个人）"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 数据集类型 -->
              <template v-else-if="currentFileType === '数据集'">
                <div class="description-row">
                  <div class="description-label">数据集版本：</div>
                  <input 
                    v-model="achievementForm.datasetVersion" 
                    type="text" 
                    placeholder="请输入数据集版本（如：v1.0）"
                    class="form-input"
                  />
                </div>
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
                  <div class="description-label">数据格式：</div>
                  <input 
                    v-model="achievementForm.datasetFormat" 
                    type="text" 
                    placeholder="请输入数据集格式（如：CSV, JSON, XML）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">数据规模：</div>
                  <input 
                    v-model="achievementForm.datasetSize" 
                    type="text" 
                    placeholder="请输入数据集规模（如：10万条记录）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">数据来源：</div>
                  <input 
                    v-model="achievementForm.datasetSource" 
                    type="text" 
                    placeholder="请输入数据集来源（如：公开数据集、自建数据集）"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 模型文件类型 -->
              <template v-else-if="currentFileType === '模型文件'">
                <div class="description-row">
                  <div class="description-label">模型框架：</div>
                  <input 
                    v-model="achievementForm.modelFramework" 
                    type="text" 
                    placeholder="请输入模型框架（如：TensorFlow, PyTorch, Keras）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">模型名称：</div>
                  <input 
                    v-model="achievementForm.modelName" 
                    type="text" 
                    placeholder="请输入模型名称"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">模型版本：</div>
                  <input 
                    v-model="achievementForm.modelVersion" 
                    type="text" 
                    placeholder="请输入模型版本（如：v1.0, v2.1）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">模型类型：</div>
                  <input 
                    v-model="achievementForm.modelType" 
                    type="text" 
                    placeholder="请输入模型类型（如：CNN, RNN, Transformer）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">超参数：</div>
                  <input 
                    v-model="achievementForm.hyperparameters" 
                    type="text" 
                    placeholder="请输入超参数（如：learning_rate=0.001, batch_size=32）"
                    class="form-input"
                  />
                </div>
              </template>
              
              <!-- 实验报告类型 -->
              <template v-else-if="currentFileType === '实验报告'">
                <div class="description-row">
                  <div class="description-label">报告类型：</div>
                  <input 
                    v-model="achievementForm.reportType" 
                    type="text" 
                    placeholder="请输入报告类型（如：实验报告、阶段性报告、总结报告）"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">报告名称：</div>
                  <input 
                    v-model="achievementForm.reportName" 
                    type="text" 
                    placeholder="请输入报告名称"
                    class="form-input"
                  />
                </div>
                <div class="description-row">
                  <div class="description-label">报告日期：</div>
                  <input 
                    v-model="achievementForm.reportDate" 
                    type="date" 
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            
            <!-- 成果详细描述 -->
            <div v-if="viewingFile" class="achievement-description">
                <div class="description-header">
                <div class="detail-label">成果详细描述：</div>
                  <button class="edit-btn" @click="toggleEditMode" v-if="!isEditingDescription">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    编辑
                  </button>
                  <div v-else class="edit-actions">
                    <button class="save-btn" @click="saveDescriptionChanges">保存</button>
                    <button class="cancel-btn" @click="cancelEditMode">取消</button>
                  </div>
                  </div>
                
                <!-- 只读模式 -->
                <div v-if="!isEditingDescription" class="description-content">
                  <!-- 论文类型 -->
                  <div v-if="viewingFile.type === '论文'" class="description-fields">
                    <div class="description-item">
                      <span class="desc-label">作者：</span>
                      <span class="desc-value">{{ viewingFile.paperAuthors || '未填写' }}</span>
                  </div>
                    <div class="description-item">
                      <span class="desc-label">论文标题：</span>
                      <span class="desc-value">{{ viewingFile.paperTitle || '未填写' }}</span>
                  </div>
                    <div class="description-item">
                      <span class="desc-label">期刊名称：</span>
                      <span class="desc-value">{{ viewingFile.journalName || '未填写' }}</span>
                  </div>
                    <div class="description-item">
                      <span class="desc-label">发表年份：</span>
                      <span class="desc-value">{{ viewingFile.publishYear || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">卷号：</span>
                      <span class="desc-value">{{ viewingFile.volume || '未填写' }}</span>
                  </div>
                    <div class="description-item">
                      <span class="desc-label">期号：</span>
                      <span class="desc-value">{{ viewingFile.issue || '未填写' }}</span>
                </div>
              </div>
                  
                  <!-- 专利类型 -->
                  <div v-else-if="viewingFile.type === '专利'" class="description-fields">
                    <div class="description-item">
                      <span class="desc-label">专利号：</span>
                      <span class="desc-value">{{ viewingFile.patentNumber || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">专利类型：</span>
                      <span class="desc-value">{{ viewingFile.patentType || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">专利名：</span>
                      <span class="desc-value">{{ viewingFile.patentName || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">发明人：</span>
                      <span class="desc-value">{{ viewingFile.inventors || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">申请人：</span>
                      <span class="desc-value">{{ viewingFile.applicants || '未填写' }}</span>
                    </div>
                  </div>
                  
                  <!-- 数据集类型 -->
                  <div v-else-if="viewingFile.type === '数据集'" class="description-fields">
                    <div class="description-item">
                      <span class="desc-label">数据集版本：</span>
                      <span class="desc-value">{{ viewingFile.datasetVersion || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">数据集名：</span>
                      <span class="desc-value">{{ viewingFile.datasetName || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">数据格式：</span>
                      <span class="desc-value">{{ viewingFile.datasetFormat || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">数据规模：</span>
                      <span class="desc-value">{{ viewingFile.datasetSize || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">数据来源：</span>
                      <span class="desc-value">{{ viewingFile.datasetSource || '未填写' }}</span>
                    </div>
                  </div>
                  
                  <!-- 模型文件类型 -->
                  <div v-else-if="viewingFile.type === '模型文件'" class="description-fields">
                    <div class="description-item">
                      <span class="desc-label">模型框架：</span>
                      <span class="desc-value">{{ viewingFile.modelFramework || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">模型名称：</span>
                      <span class="desc-value">{{ viewingFile.modelName || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">模型版本：</span>
                      <span class="desc-value">{{ viewingFile.modelVersion || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">模型类型：</span>
                      <span class="desc-value">{{ viewingFile.modelType || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">超参数：</span>
                      <span class="desc-value">{{ viewingFile.hyperparameters || '未填写' }}</span>
                    </div>
                  </div>
                  
                  <!-- 实验报告类型 -->
                  <div v-else-if="viewingFile.type === '实验报告'" class="description-fields">
                    <div class="description-item">
                      <span class="desc-label">报告类型：</span>
                      <span class="desc-value">{{ viewingFile.reportType || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">报告名称：</span>
                      <span class="desc-value">{{ viewingFile.reportName || '未填写' }}</span>
                    </div>
                    <div class="description-item">
                      <span class="desc-label">报告日期：</span>
                      <span class="desc-value">{{ viewingFile.reportDate || '未填写' }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 编辑模式 -->
                <div v-else class="description-edit-form">
                  <div class="edit-fields">
                    <!-- 论文编辑字段 -->
                    <template v-if="viewingFile.type === '论文'">
                      <div class="edit-field">
                        <label>作者：</label>
                        <input v-model="editForm.paperAuthors" type="text" placeholder="请输入作者" />
                      </div>
                      <div class="edit-field">
                        <label>论文标题：</label>
                        <input v-model="editForm.paperTitle" type="text" placeholder="请输入论文标题" />
                      </div>
                      <div class="edit-field">
                        <label>期刊名称：</label>
                        <input v-model="editForm.journalName" type="text" placeholder="请输入期刊名称" />
                      </div>
                      <div class="edit-field">
                        <label>发表年份：</label>
                        <input v-model="editForm.publishYear" type="text" placeholder="请输入发表年份" />
                      </div>
                      <div class="edit-field">
                        <label>卷号：</label>
                        <input v-model="editForm.volume" type="text" placeholder="请输入卷号" />
                      </div>
                      <div class="edit-field">
                        <label>期号：</label>
                        <input v-model="editForm.issue" type="text" placeholder="请输入期号" />
                      </div>
                    </template>
                    
                    <!-- 专利编辑字段 -->
                    <template v-else-if="viewingFile.type === '专利'">
                      <div class="edit-field">
                        <label>专利号：</label>
                        <input v-model="editForm.patentNumber" type="text" placeholder="请输入专利号" />
                      </div>
                      <div class="edit-field">
                        <label>专利类型：</label>
                        <input v-model="editForm.patentType" type="text" placeholder="请输入专利类型" />
                      </div>
                      <div class="edit-field">
                        <label>专利名：</label>
                        <input v-model="editForm.patentName" type="text" placeholder="请输入专利名" />
                      </div>
                      <div class="edit-field">
                        <label>发明人：</label>
                        <input v-model="editForm.inventors" type="text" placeholder="请输入发明人" />
                      </div>
                      <div class="edit-field">
                        <label>申请人：</label>
                        <input v-model="editForm.applicants" type="text" placeholder="请输入申请人" />
                      </div>
                    </template>
                    
                    <!-- 数据集编辑字段 -->
                    <template v-else-if="viewingFile.type === '数据集'">
                      <div class="edit-field">
                        <label>数据集版本：</label>
                        <input v-model="editForm.datasetVersion" type="text" placeholder="请输入数据集版本" />
                      </div>
                      <div class="edit-field">
                        <label>数据集名：</label>
                        <input v-model="editForm.datasetName" type="text" placeholder="请输入数据集名" />
                      </div>
                      <div class="edit-field">
                        <label>数据格式：</label>
                        <input v-model="editForm.datasetFormat" type="text" placeholder="请输入数据格式" />
                      </div>
                      <div class="edit-field">
                        <label>数据规模：</label>
                        <input v-model="editForm.datasetSize" type="text" placeholder="请输入数据规模" />
                      </div>
                      <div class="edit-field">
                        <label>数据来源：</label>
                        <input v-model="editForm.datasetSource" type="text" placeholder="请输入数据来源" />
                      </div>
                    </template>
                    
                    <!-- 模型文件编辑字段 -->
                    <template v-else-if="viewingFile.type === '模型文件'">
                      <div class="edit-field">
                        <label>模型框架：</label>
                        <input v-model="editForm.modelFramework" type="text" placeholder="请输入模型框架" />
                      </div>
                      <div class="edit-field">
                        <label>模型名称：</label>
                        <input v-model="editForm.modelName" type="text" placeholder="请输入模型名称" />
                      </div>
                      <div class="edit-field">
                        <label>模型版本：</label>
                        <input v-model="editForm.modelVersion" type="text" placeholder="请输入模型版本" />
                      </div>
                      <div class="edit-field">
                        <label>模型类型：</label>
                        <input v-model="editForm.modelType" type="text" placeholder="请输入模型类型" />
                      </div>
                      <div class="edit-field">
                        <label>超参数：</label>
                        <input v-model="editForm.hyperparameters" type="text" placeholder="请输入超参数" />
                      </div>
                    </template>
                    
                    <!-- 实验报告编辑字段 -->
                    <template v-else-if="viewingFile.type === '实验报告'">
                      <div class="edit-field">
                        <label>报告类型：</label>
                        <input v-model="editForm.reportType" type="text" placeholder="请输入报告类型" />
                      </div>
                      <div class="edit-field">
                        <label>报告名称：</label>
                        <input v-model="editForm.reportName" type="text" placeholder="请输入报告名称" />
                      </div>
                      <div class="edit-field">
                        <label>报告日期：</label>
                        <input v-model="editForm.reportDate" type="date" />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              
              <!-- 预览区域已移除 -->
            </div>
          
          <!-- 单文件内容（保持原有逻辑） -->
          <div v-else>
            <!-- 文本文件内容 -->
            <div v-if="fileContentType === 'text'" class="text-content">
              <div class="content-header">
                <h4>文档内容</h4>
                <div class="content-actions">
                  <button v-if="!isEditingContent" class="edit-content-btn" @click="toggleContentEdit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    编辑
                  </button>
                  <div v-else class="content-edit-actions">
                    <button class="save-content-btn" @click="saveContentChanges" :disabled="!hasContentChanges">保存</button>
                    <button class="cancel-content-btn" @click="cancelContentEdit">取消</button>
                  </div>
                </div>
              </div>
              <div class="content-body">
                <pre v-if="!isEditingContent" class="content-display">{{ fileContent }}</pre>
                <textarea 
                  v-else 
                  v-model="editableContent" 
                  class="content-editor"
                  @input="markContentChanged"
                  placeholder="请输入文档内容..."
                ></textarea>
              </div>
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
                
                <!-- 成果详细描述（单文件分支统一为可编辑版本） -->
                <div v-if="viewingFile" class="achievement-description">
                  <div class="description-header">
                  <div class="detail-label">成果详细描述：</div>
                    <button class="edit-btn" @click="toggleEditMode" v-if="!isEditingDescription">编辑</button>
                    <div v-else class="edit-actions">
                      <button class="save-btn" @click="saveDescriptionChanges">保存</button>
                      <button class="cancel-btn" @click="cancelEditMode">取消</button>
                    </div>
                    </div>

                  <!-- 只读模式：空值显示"未填写" -->
                  <div v-if="!isEditingDescription" class="description-content">
                    <div v-if="viewingFile.type === '论文'" class="description-fields">
                      <div class="description-item"><span class="desc-label">作者：</span><span class="desc-value">{{ viewingFile.paperAuthors || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">论文标题：</span><span class="desc-value">{{ viewingFile.paperTitle || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">期刊名称：</span><span class="desc-value">{{ viewingFile.journalName || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">发表年份：</span><span class="desc-value">{{ viewingFile.publishYear || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">卷号：</span><span class="desc-value">{{ viewingFile.volume || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">期号：</span><span class="desc-value">{{ viewingFile.issue || '未填写' }}</span></div>
                    </div>

                    <div v-else-if="viewingFile.type === '专利'" class="description-fields">
                      <div class="description-item"><span class="desc-label">专利号：</span><span class="desc-value">{{ viewingFile.patentNumber || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">专利类型：</span><span class="desc-value">{{ viewingFile.patentType || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">专利名：</span><span class="desc-value">{{ viewingFile.patentName || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">发明人：</span><span class="desc-value">{{ viewingFile.inventors || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">申请人：</span><span class="desc-value">{{ viewingFile.applicants || '未填写' }}</span></div>
                    </div>

                    <div v-else-if="viewingFile.type === '数据集'" class="description-fields">
                      <div class="description-item"><span class="desc-label">数据集版本：</span><span class="desc-value">{{ viewingFile.datasetVersion || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">数据集名：</span><span class="desc-value">{{ viewingFile.datasetName || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">数据格式：</span><span class="desc-value">{{ viewingFile.datasetFormat || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">数据规模：</span><span class="desc-value">{{ viewingFile.datasetSize || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">数据来源：</span><span class="desc-value">{{ viewingFile.datasetSource || '未填写' }}</span></div>
                    </div>

                    <div v-else-if="viewingFile.type === '模型文件'" class="description-fields">
                      <div class="description-item"><span class="desc-label">模型框架：</span><span class="desc-value">{{ viewingFile.modelFramework || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">模型名称：</span><span class="desc-value">{{ viewingFile.modelName || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">模型版本：</span><span class="desc-value">{{ viewingFile.modelVersion || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">模型类型：</span><span class="desc-value">{{ viewingFile.modelType || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">超参数：</span><span class="desc-value">{{ viewingFile.hyperparameters || '未填写' }}</span></div>
                      </div>

                    <div v-else-if="viewingFile.type === '实验报告'" class="description-fields">
                      <div class="description-item"><span class="desc-label">报告类型：</span><span class="desc-value">{{ viewingFile.reportType || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">报告名称：</span><span class="desc-value">{{ viewingFile.reportName || '未填写' }}</span></div>
                      <div class="description-item"><span class="desc-label">报告日期：</span><span class="desc-value">{{ viewingFile.reportDate || '未填写' }}</span></div>
                    </div>
                  </div>

                  <!-- 编辑模式 -->
                  <div v-else class="description-edit-form">
                    <div class="edit-fields">
                      <template v-if="viewingFile.type === '论文'">
                        <div class="edit-field"><label>作者：</label><input v-model="editForm.paperAuthors" type="text" placeholder="请输入作者" /></div>
                        <div class="edit-field"><label>论文标题：</label><input v-model="editForm.paperTitle" type="text" placeholder="请输入论文标题" /></div>
                        <div class="edit-field"><label>期刊名称：</label><input v-model="editForm.journalName" type="text" placeholder="请输入期刊名称" /></div>
                        <div class="edit-field"><label>发表年份：</label><input v-model="editForm.publishYear" type="text" placeholder="请输入发表年份" /></div>
                        <div class="edit-field"><label>卷号：</label><input v-model="editForm.volume" type="text" placeholder="请输入卷号" /></div>
                        <div class="edit-field"><label>期号：</label><input v-model="editForm.issue" type="text" placeholder="请输入期号" /></div>
                      </template>

                      <template v-else-if="viewingFile.type === '专利'">
                        <div class="edit-field"><label>专利号：</label><input v-model="editForm.patentNumber" type="text" placeholder="请输入专利号" /></div>
                        <div class="edit-field"><label>专利类型：</label><input v-model="editForm.patentType" type="text" placeholder="请输入专利类型" /></div>
                        <div class="edit-field"><label>专利名：</label><input v-model="editForm.patentName" type="text" placeholder="请输入专利名" /></div>
                        <div class="edit-field"><label>发明人：</label><input v-model="editForm.inventors" type="text" placeholder="请输入发明人" /></div>
                        <div class="edit-field"><label>申请人：</label><input v-model="editForm.applicants" type="text" placeholder="请输入申请人" /></div>
                      </template>

                      <template v-else-if="viewingFile.type === '数据集'">
                        <div class="edit-field"><label>数据集版本：</label><input v-model="editForm.datasetVersion" type="text" placeholder="请输入数据集版本" /></div>
                        <div class="edit-field"><label>数据集名：</label><input v-model="editForm.datasetName" type="text" placeholder="请输入数据集名" /></div>
                        <div class="edit-field"><label>数据格式：</label><input v-model="editForm.datasetFormat" type="text" placeholder="请输入数据格式" /></div>
                        <div class="edit-field"><label>数据规模：</label><input v-model="editForm.datasetSize" type="text" placeholder="请输入数据规模" /></div>
                        <div class="edit-field"><label>数据来源：</label><input v-model="editForm.datasetSource" type="text" placeholder="请输入数据来源" /></div>
                      </template>

                      <template v-else-if="viewingFile.type === '模型文件'">
                        <div class="edit-field"><label>模型框架：</label><input v-model="editForm.modelFramework" type="text" placeholder="请输入模型框架" /></div>
                        <div class="edit-field"><label>模型名称：</label><input v-model="editForm.modelName" type="text" placeholder="请输入模型名称" /></div>
                        <div class="edit-field"><label>模型版本：</label><input v-model="editForm.modelVersion" type="text" placeholder="请输入模型版本" /></div>
                        <div class="edit-field"><label>模型类型：</label><input v-model="editForm.modelType" type="text" placeholder="请输入模型类型" /></div>
                        <div class="edit-field"><label>超参数：</label><input v-model="editForm.hyperparameters" type="text" placeholder="请输入超参数" /></div>
                      </template>

                      <template v-else-if="viewingFile.type === '实验报告'">
                        <div class="edit-field"><label>报告类型：</label><input v-model="editForm.reportType" type="text" placeholder="请输入报告类型" /></div>
                        <div class="edit-field"><label>报告名称：</label><input v-model="editForm.reportName" type="text" placeholder="请输入报告名称" /></div>
                        <div class="edit-field"><label>报告日期：</label><input v-model="editForm.reportDate" type="date" /></div>
                      </template>
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
          <div class="footer-left">
            <button class="add-file-btn" @click="showAddFileDialog">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              添加文件到此成果
            </button>
          </div>
          <div class="footer-right">
          <button class="btn secondary" @click="closeViewDialog">关闭</button>
          <button v-if="viewingFile?.files && viewingFile.files.length > 1" class="btn primary" @click="downloadAllFiles(viewingFile)">下载全部</button>
          <button v-else class="btn primary" @click="downloadFile(viewingFile)">下载</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成果档案滑动面板遮罩 -->
    <div v-if="showArchivePanel" class="archive-overlay" @click="showArchivePanel = false"></div>
    
    <!-- 成果档案滑动面板 -->
    <div class="archive-slide-panel notranslate" :class="{ 'open': showArchivePanel }" translate="no">
      <div class="panel-header">
        <div class="panel-title">已有成果档案</div>
        <button class="panel-close-btn" @click="showArchivePanel = false">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="panel-content">
        <!-- 搜索框 -->
        <div class="search-section">
          <div class="search-container">
            <input 
              v-model="searchText" 
              type="text" 
              placeholder="搜索成果名称、类型或上传者..." 
              class="search-input"
              @input="onSearchInput"
            />
            <div class="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <button 
              v-if="searchText" 
              @click="clearSearch" 
              class="clear-search-btn"
              title="清除搜索"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div v-if="searchText" class="search-results-info">
            找到 {{ filteredFiles.length }} 个结果
          </div>
        </div>
        
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
    </div>
  </div>
</template>

<script>
import { EventBus, EVENTS } from '@/utils/eventBus'
import { 
  formatFileSize, 
  getFileIcon, 
  getFileExtension, 
  getMimeType, 
  getFileTypeDisplay,
  getTypeClass,
  getFileAccept,
  isTextFile,
  isImageFile,
  isPdfFile,
  createPlaceholderContent,
  escapeHtml
} from '@/utils/catalogHelpers'
import { saveToLocalStorage, loadFromLocalStorage, updateFileContentInStorage } from '@/utils/catalogStorage'
import { downloadFile, downloadSingleFile, downloadAllFiles, loadTextFile, loadImageFile, loadPdfFile, getFileInfo, testArrayBufferConversion } from '@/utils/catalogFileHandler'

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
      showArchivePanel: false, // 控制成果档案面板的显示
      currentPage: 1,
      pageSize: 5,
      totalItems: 0,
      // 搜索相关
      searchText: '',
      // 添加文件到现有成果相关
      isAddingToExisting: false,
      targetAchievementId: null,
      showViewDialog: false,
      viewingFile: null,
      fileContent: '',
      fileContentType: 'text',
      selectedFileIndex: null,
      
      // 编辑模式
      isEditingDescription: false,
      isEditingContent: false,
      editableContent: '',
      hasContentChanges: false,
      editForm: {
        // 论文字段
        paperAuthors: '',
        paperTitle: '',
        journalName: '',
        publishYear: '',
        volume: '',
        issue: '',
        // 专利字段
        patentNumber: '',
        patentType: '',
        patentName: '',
        inventors: '',
        applicants: '',
        // 数据集字段
        datasetVersion: '',
        datasetName: '',
        datasetFormat: '',
        datasetSize: '',
        datasetSource: '',
        // 模型文件字段
        modelFramework: '',
        modelName: '',
        modelVersion: '',
        modelType: '',
        hyperparameters: '',
        // 实验报告字段
        reportType: '',
        reportName: '',
        reportDate: ''
      },
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
    
    // 搜索过滤后的数据
    filteredFiles() {
      if (!this.searchText.trim()) {
        return this.allFiles
      }
      
      const searchTerm = this.searchText.toLowerCase().trim()
      return this.allFiles.filter(file => {
        // 搜索成果名称
        const nameMatch = file.name && file.name.toLowerCase().includes(searchTerm)
        // 搜索类型
        const typeMatch = file.type && file.type.toLowerCase().includes(searchTerm)
        // 搜索上传者
        const uploaderMatch = file.uploader && file.uploader.toLowerCase().includes(searchTerm)
        // 搜索详细描述字段（根据类型）
        let detailMatch = false
        if (file.type === '论文') {
          detailMatch = (file.paperAuthors && file.paperAuthors.toLowerCase().includes(searchTerm)) ||
                       (file.paperTitle && file.paperTitle.toLowerCase().includes(searchTerm)) ||
                       (file.journalName && file.journalName.toLowerCase().includes(searchTerm))
        } else if (file.type === '专利') {
          detailMatch = (file.patentNumber && file.patentNumber.toLowerCase().includes(searchTerm)) ||
                       (file.patentName && file.patentName.toLowerCase().includes(searchTerm)) ||
                       (file.inventors && file.inventors.toLowerCase().includes(searchTerm))
        } else if (file.type === '数据集') {
          detailMatch = (file.datasetName && file.datasetName.toLowerCase().includes(searchTerm)) ||
                       (file.datasetFormat && file.datasetFormat.toLowerCase().includes(searchTerm))
        } else if (file.type === '模型文件') {
          detailMatch = (file.modelName && file.modelName.toLowerCase().includes(searchTerm)) ||
                       (file.modelFramework && file.modelFramework.toLowerCase().includes(searchTerm))
        } else if (file.type === '实验报告') {
          detailMatch = (file.reportName && file.reportName.toLowerCase().includes(searchTerm)) ||
                       (file.reportType && file.reportType.toLowerCase().includes(searchTerm))
        }
        
        return nameMatch || typeMatch || uploaderMatch || detailMatch
      })
    },
    
    // 分页后的数据
    paginatedFiles() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredFiles.slice(start, end)
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredFiles.length / this.pageSize)
    },
    
    // 分页信息
    paginationInfo() {
      const start = (this.currentPage - 1) * this.pageSize + 1
      const end = Math.min(this.currentPage * this.pageSize, this.filteredFiles.length)
      return `显示第 ${start} 到 ${end} 项，共 ${this.filteredFiles.length} 项`
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
    const loaded = loadFromLocalStorage(this.projectId)
    if (loaded) {
      this.uploadedFiles = loaded.uploadedFiles
      this.currentPage = loaded.currentPage
    }
  },
  watch: {
    showArchivePanel(newVal) {
      // 当面板状态变化时，通知全局用户信息框
      EventBus.$emit(EVENTS.ARCHIVE_PANEL_TOGGLE, newVal)
    }
  },
  beforeDestroy() {
    // 组件销毁前保存数据
    saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
  },
  methods: {
    uploadFile(type) {
      this.currentFileType = type
      this.fileAccept = getFileAccept(type)
      // 重置表单数据
      this.resetAchievementForm()
      this.showUploadDialog = true
    },
    
    async handleFileSelect(event) {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        console.log('文件选择事件:', {
          filesCount: files.length,
          isAddingToExisting: this.isAddingToExisting,
          showViewDialog: this.showViewDialog,
          viewingFile: this.viewingFile ? this.viewingFile.id : null
        })
        
        // 检查是否为现有成果添加文件
        if (this.isAddingToExisting && this.targetAchievementId) {
          console.log('为现有成果添加文件，直接处理')
          await this.addFilesToExistingAchievement(files)
        } else if (this.showCustomDialog) {
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
        paperAuthors: '',
        paperTitle: '',
        journalName: '',
        publishYear: '',
        volume: '',
        issue: '',
        // 专利字段
        patentNumber: '',
        patentType: '',
        patentName: '',
        inventors: '',
        applicants: '',
        // 数据集字段
        datasetVersion: '',
        datasetName: '',
        datasetFormat: '',
        datasetSize: '',
        datasetSource: '',
        // 模型文件字段
        modelFramework: '',
        modelName: '',
        modelVersion: '',
        modelType: '',
        hyperparameters: '',
        // 实验报告字段
        reportType: '',
        reportName: '',
        reportDate: '',
        files: []
      }
    },
    
    async confirmUpload() {
      if ((this.isAddingToExisting || this.achievementForm.name.trim()) && this.achievementForm.files.length > 0) {
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
          
          // 检查是否为现有成果添加文件
          console.log('检查添加文件状态:', {
            isAddingToExisting: this.isAddingToExisting,
            targetAchievementId: this.targetAchievementId,
            uploadedFilesCount: this.uploadedFiles.length
          })
          
          if (this.isAddingToExisting && this.targetAchievementId) {
            // 为现有成果添加文件
            const targetIndex = this.uploadedFiles.findIndex(item => item.id === this.targetAchievementId)
            console.log('查找目标成果:', { targetIndex, targetId: this.targetAchievementId })
            
            if (targetIndex !== -1) {
              // 将新文件添加到现有成果的文件列表中
              this.uploadedFiles[targetIndex].files.push(...filesWithBuffer)
              this.uploadedFiles[targetIndex].fileCount = this.uploadedFiles[targetIndex].files.length
              
              // 更新成果时间
              this.uploadedFiles[targetIndex].time = new Date().toLocaleString('zh-CN')
              
              // 触发文件编辑事件（因为成果被修改了）
              this.$emit('file-edited', this.uploadedFiles[targetIndex])
              
              // 重置状态
              this.resetAchievementForm()
              this.isAddingToExisting = false
              this.targetAchievementId = null
              this.showUploadDialog = false
              
              // 自动保存到本地存储
              saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
              
              alert(`已成功添加${this.achievementForm.files.length}个文件到成果"${this.uploadedFiles[targetIndex].name}"中！`)
              return
            }
          }
          
          // 创建新成果记录
          const newAchievement = {
            id: Date.now(),
            name: this.achievementForm.name,
            type: this.currentFileType,
            uploader: '当前用户',
            time: new Date().toLocaleString('zh-CN'),
            typeCls: this.getTypeClass(this.currentFileType),
            // 根据类型保存相应的字段
            ...(this.currentFileType === '论文' && {
              paperAuthors: this.achievementForm.paperAuthors,
              paperTitle: this.achievementForm.paperTitle,
              journalName: this.achievementForm.journalName,
              publishYear: this.achievementForm.publishYear,
              volume: this.achievementForm.volume,
              issue: this.achievementForm.issue
            }),
            ...(this.currentFileType === '专利' && {
              patentNumber: this.achievementForm.patentNumber,
              patentType: this.achievementForm.patentType,
              patentName: this.achievementForm.patentName,
              inventors: this.achievementForm.inventors,
              applicants: this.achievementForm.applicants
            }),
            ...(this.currentFileType === '数据集' && {
              datasetVersion: this.achievementForm.datasetVersion,
              datasetName: this.achievementForm.datasetName,
              datasetFormat: this.achievementForm.datasetFormat,
              datasetSize: this.achievementForm.datasetSize,
              datasetSource: this.achievementForm.datasetSource
            }),
            ...(this.currentFileType === '模型文件' && {
              modelFramework: this.achievementForm.modelFramework,
              modelName: this.achievementForm.modelName,
              modelVersion: this.achievementForm.modelVersion,
              modelType: this.achievementForm.modelType,
              hyperparameters: this.achievementForm.hyperparameters
            }),
            ...(this.currentFileType === '实验报告' && {
              reportType: this.achievementForm.reportType,
              reportName: this.achievementForm.reportName,
              reportDate: this.achievementForm.reportDate
            }),
            files: filesWithBuffer,
            fileCount: this.achievementForm.files.length
          }
          
          this.uploadedFiles.push(newAchievement)
          this.$emit('file-uploaded', newAchievement)
          
          // 重置状态
          this.resetAchievementForm()
          this.isAddingToExisting = false
          this.targetAchievementId = null
          this.showUploadDialog = false
          
          // 跳转到最后一页显示新上传的文件
          this.goToLastPage()
          
          // 自动保存到本地存储
          saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
          
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
    
    // 搜索相关方法
    onSearchInput() {
      // 搜索时重置到第一页
      this.currentPage = 1
    },
    
    clearSearch() {
      this.searchText = ''
      this.currentPage = 1
    },
    
    // 获取目标成果名称
    getTargetAchievementName() {
      if (this.targetAchievementId) {
        const targetAchievement = this.uploadedFiles.find(item => item.id === this.targetAchievementId)
        return targetAchievement ? targetAchievement.name : '未知成果'
      }
      return '未知成果'
    },
    
    closeUploadDialog() {
      this.showUploadDialog = false
      this.resetAchievementForm()
      this.isAddingToExisting = false
      this.targetAchievementId = null
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
              const fileExtension = getFileExtension(originalFileName)
              
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
          saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
          
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
      const fileExtension = getFileExtension(file.name).toLowerCase()
      
      if (['txt', 'md', 'json', 'csv', 'log'].includes(fileExtension)) {
        // 文本文件
        this.fileContentType = 'text'
        loadTextFile(file, (content) => { this.fileContent = content })
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        // 图片文件
        this.fileContentType = 'image'
        loadImageFile(file, (content) => { this.fileContent = content })
      } else if (fileExtension === 'pdf') {
        // PDF文件
        this.fileContentType = 'pdf'
        loadPdfFile(file, (content) => { this.fileContent = content })
      } else {
        // 其他文件类型，显示文件信息
        this.fileContentType = 'info'
        this.fileContent = getFileInfo(file)
      }
    },
    
    
    closeViewDialog() {
      this.showViewDialog = false
      this.viewingFile = null
      this.fileContent = ''
      this.fileContentType = 'text'
      this.selectedFileIndex = null
      this.isEditingDescription = false
      this.isEditingContent = false
      this.editableContent = ''
      this.hasContentChanges = false
      this.resetEditForm()
    },
    
    // 切换编辑模式
    toggleEditMode() {
      this.isEditingDescription = true
      this.initEditForm()
    },
    
    // 切换内容编辑模式
    toggleContentEdit() {
      this.isEditingContent = true
      this.editableContent = this.fileContent
      this.hasContentChanges = false
    },
    
    // 标记内容已更改
    markContentChanged() {
      this.hasContentChanges = this.editableContent !== this.fileContent
    },
    
    // 保存内容更改
    saveContentChanges() {
      if (this.hasContentChanges) {
        this.fileContent = this.editableContent
        this.hasContentChanges = false
        this.isEditingContent = false
        
        // 更新本地存储中的文件内容
        this.updateFileContentInStorage()
        
        alert('文档内容已保存！')
      }
    },
    
    // 取消内容编辑
    cancelContentEdit() {
      if (this.hasContentChanges) {
        if (confirm('您有未保存的更改，确定要取消编辑吗？')) {
          this.isEditingContent = false
          this.editableContent = ''
          this.hasContentChanges = false
        }
      } else {
        this.isEditingContent = false
        this.editableContent = ''
        this.hasContentChanges = false
      }
    },
    
    
    // 初始化编辑表单
    initEditForm() {
      if (!this.viewingFile) return
      
      // 根据成果类型初始化编辑表单
      if (this.viewingFile.type === '论文') {
        this.editForm.paperAuthors = this.viewingFile.paperAuthors || ''
        this.editForm.paperTitle = this.viewingFile.paperTitle || ''
        this.editForm.journalName = this.viewingFile.journalName || ''
        this.editForm.publishYear = this.viewingFile.publishYear || ''
        this.editForm.volume = this.viewingFile.volume || ''
        this.editForm.issue = this.viewingFile.issue || ''
      } else if (this.viewingFile.type === '专利') {
        this.editForm.patentNumber = this.viewingFile.patentNumber || ''
        this.editForm.patentType = this.viewingFile.patentType || ''
        this.editForm.patentName = this.viewingFile.patentName || ''
        this.editForm.inventors = this.viewingFile.inventors || ''
        this.editForm.applicants = this.viewingFile.applicants || ''
      } else if (this.viewingFile.type === '数据集') {
        this.editForm.datasetVersion = this.viewingFile.datasetVersion || ''
        this.editForm.datasetName = this.viewingFile.datasetName || ''
        this.editForm.datasetFormat = this.viewingFile.datasetFormat || ''
        this.editForm.datasetSize = this.viewingFile.datasetSize || ''
        this.editForm.datasetSource = this.viewingFile.datasetSource || ''
      } else if (this.viewingFile.type === '模型文件') {
        this.editForm.modelFramework = this.viewingFile.modelFramework || ''
        this.editForm.modelName = this.viewingFile.modelName || ''
        this.editForm.modelVersion = this.viewingFile.modelVersion || ''
        this.editForm.modelType = this.viewingFile.modelType || ''
        this.editForm.hyperparameters = this.viewingFile.hyperparameters || ''
      } else if (this.viewingFile.type === '实验报告') {
        this.editForm.reportType = this.viewingFile.reportType || ''
        this.editForm.reportName = this.viewingFile.reportName || ''
        this.editForm.reportDate = this.viewingFile.reportDate || ''
      }
    },
    
    // 重置编辑表单
    resetEditForm() {
      this.editForm = {
        paperAuthors: '',
        paperTitle: '',
        journalName: '',
        publishYear: '',
        volume: '',
        issue: '',
        patentNumber: '',
        patentType: '',
        patentName: '',
        inventors: '',
        applicants: '',
        datasetVersion: '',
        datasetName: '',
        datasetFormat: '',
        datasetSize: '',
        datasetSource: '',
        modelFramework: '',
        modelName: '',
        modelVersion: '',
        modelType: '',
        hyperparameters: '',
        reportType: '',
        reportName: '',
        reportDate: ''
      }
    },
    
    // 保存描述修改
    saveDescriptionChanges() {
      if (!this.viewingFile) return
      
      // 更新viewingFile的数据
      if (this.viewingFile.type === '论文') {
        this.viewingFile.paperAuthors = this.editForm.paperAuthors
        this.viewingFile.paperTitle = this.editForm.paperTitle
        this.viewingFile.journalName = this.editForm.journalName
        this.viewingFile.publishYear = this.editForm.publishYear
        this.viewingFile.volume = this.editForm.volume
        this.viewingFile.issue = this.editForm.issue
      } else if (this.viewingFile.type === '专利') {
        this.viewingFile.patentNumber = this.editForm.patentNumber
        this.viewingFile.patentType = this.editForm.patentType
        this.viewingFile.patentName = this.editForm.patentName
        this.viewingFile.inventors = this.editForm.inventors
        this.viewingFile.applicants = this.editForm.applicants
      } else if (this.viewingFile.type === '数据集') {
        this.viewingFile.datasetVersion = this.editForm.datasetVersion
        this.viewingFile.datasetName = this.editForm.datasetName
        this.viewingFile.datasetFormat = this.editForm.datasetFormat
        this.viewingFile.datasetSize = this.editForm.datasetSize
        this.viewingFile.datasetSource = this.editForm.datasetSource
      } else if (this.viewingFile.type === '模型文件') {
        this.viewingFile.modelFramework = this.editForm.modelFramework
        this.viewingFile.modelName = this.editForm.modelName
        this.viewingFile.modelVersion = this.editForm.modelVersion
        this.viewingFile.modelType = this.editForm.modelType
        this.viewingFile.hyperparameters = this.editForm.hyperparameters
      } else if (this.viewingFile.type === '实验报告') {
        this.viewingFile.reportType = this.editForm.reportType
        this.viewingFile.reportName = this.editForm.reportName
        this.viewingFile.reportDate = this.editForm.reportDate
      }
      
      // 同步更新已上传列表中的对应记录
      const uploadedIndex = this.uploadedFiles.findIndex(item => item.id === this.viewingFile.id)
      if (uploadedIndex !== -1) {
        this.$set(this.uploadedFiles, uploadedIndex, { ...this.viewingFile })
      }
      
      // 持久化保存
      saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
      
      // 触发编辑事件，通知父组件
      this.$emit('file-edited', this.viewingFile)
      
      // 切回只读模式
      this.isEditingDescription = false
      this.$message && this.$message.success && this.$message.success('成果详细描述已更新')
    },
    
    // 取消编辑模式
    cancelEditMode() {
      this.isEditingDescription = false
      this.resetEditForm()
    },
    
    // 显示添加文件对话框
    showAddFileDialog() {
      // 设置添加文件到现有成果的状态
      this.isAddingToExisting = true
      this.targetAchievementId = this.viewingFile.id
      console.log('准备为现有成果添加文件:', {
        achievementId: this.viewingFile.id,
        achievementName: this.viewingFile.name,
        isAddingToExisting: this.isAddingToExisting
      })
      
      // 直接触发文件选择，为当前成果添加文件
      this.$refs.fileInput.click()
    },
    
    // 为现有成果添加文件
    async addFilesToExistingAchievement(files) {
      try {
        console.log('为现有成果添加文件:', {
          achievementId: this.viewingFile.id,
          achievementName: this.viewingFile.name,
          filesCount: files.length
        })
        
        // 转换文件为 ArrayBuffer 以便保存到 localStorage
        const filesWithBuffer = await Promise.all(
          files.map(async (file, index) => {
            const arrayBuffer = await file.arrayBuffer()
            return {
              id: Date.now() + index,
              name: file.name,
              originalFileName: file.name,
              size: file.size,
              type: file.type,
              fileBuffer: arrayBuffer,
              file: file
            }
          })
        )
        
        // 查找目标成果在 uploadedFiles 中的索引
        const targetIndex = this.uploadedFiles.findIndex(item => item.id === this.viewingFile.id)
        console.log('查找目标成果索引:', { targetIndex, targetId: this.viewingFile.id })
        
        if (targetIndex !== -1) {
          // 将新文件添加到现有成果的文件列表中
          this.uploadedFiles[targetIndex].files.push(...filesWithBuffer)
          this.uploadedFiles[targetIndex].fileCount = this.uploadedFiles[targetIndex].files.length
          
          // 更新成果时间
          this.uploadedFiles[targetIndex].time = new Date().toLocaleString('zh-CN')
          
          // 更新当前查看的成果信息
          this.viewingFile = this.uploadedFiles[targetIndex]
          
          // 触发文件编辑事件（因为成果被修改了）
          this.$emit('file-edited', this.uploadedFiles[targetIndex])
          
          // 自动保存到本地存储
          saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
          
          // 重置状态
          this.isAddingToExisting = false
          this.targetAchievementId = null
          
          alert(`已成功添加${files.length}个文件到成果"${this.uploadedFiles[targetIndex].name}"中！`)
        } else {
          console.error('未找到目标成果:', this.viewingFile.id)
          alert('添加文件失败：未找到目标成果')
          
          // 重置状态
          this.isAddingToExisting = false
          this.targetAchievementId = null
        }
      } catch (error) {
        console.error('添加文件到现有成果失败:', error)
        alert('添加文件失败，请重试')
        
        // 重置状态
        this.isAddingToExisting = false
        this.targetAchievementId = null
      }
    },
    
    
    deleteFile(file) {
      if (confirm(`确定要删除成果"${file.name}"吗？此操作不可撤销。`)) {
        // 从上传的文件列表中删除
        const uploadedIndex = this.uploadedFiles.findIndex(f => f.id === file.id)
        if (uploadedIndex !== -1) {
          // 触发删除事件，通知父组件
          this.$emit('file-deleted', file)
          
          this.uploadedFiles.splice(uploadedIndex, 1)
          // 保存到本地存储
          saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
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
        
        // 文件预览功能已移除，直接提示下载
        console.log('文件预览功能已移除，请直接下载查看')
      } catch (error) {
        console.error('查看文件时出错:', error)
        alert('无法预览此文件，请下载后查看')
      }
    },
    
    // 预览功能已完全移除
    
    // 检查是否有成果详细描述
    getAchievementDescription(file) {
      if (!file) return false
      
      // 检查各种类型的描述字段 - 更新为新的字段结构
      return file.paperAuthors || file.paperTitle || file.journalName || file.publishYear || file.volume || file.issue ||
             file.patentNumber || file.patentType || file.patentName || file.inventors || file.applicants ||
             file.datasetVersion || file.datasetName || file.datasetFormat || file.datasetSize || file.datasetSource ||
             file.modelFramework || file.modelName || file.modelVersion || file.modelType || file.hyperparameters ||
             file.reportType || file.reportName || file.reportDate ||
             // 兼容旧字段
             file.paperName || file.paperId ||
             file.patentName || file.patentId ||
             file.datasetName || file.datasetId ||
             file.modelName || file.modelId ||
             file.reportName || file.reportId ||
             (file.descriptions && file.descriptions.length > 0)
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
          saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
          alert('文件删除成功！')
        }
      }
    },
    
    // 下载文件（包装工具函数）
    downloadFile(file) {
      downloadFile(file)
    },
    
    // 获取类型样式类名（包装工具函数）
    getTypeClass(type) {
      return getTypeClass(type)
    },
    
    // 获取文件图标（包装工具函数）
    getFileIcon(fileName) {
      return getFileIcon(fileName)
    },
    
    // 获取文件类型显示（包装工具函数）
    getFileTypeDisplay(mimeType) {
      return getFileTypeDisplay(mimeType)
    },
    
    // 格式化文件大小（包装工具函数）
    formatFileSize(bytes) {
      return formatFileSize(bytes)
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/catalog/main.css';
@import '@/assets/styles/catalog/dialog.css';
@import '@/assets/styles/catalog/panel.css';
@import '@/assets/styles/catalog/file-view.css';

/* 文件信息样式覆盖 */
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

.file-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  word-break: break-all;
}
</style>
