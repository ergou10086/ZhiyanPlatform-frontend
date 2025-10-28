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
    this.loadFromLocalStorage()
  },
  watch: {
    showArchivePanel(newVal) {
      // 当面板状态变化时，通知全局用户信息框
      EventBus.$emit(EVENTS.ARCHIVE_PANEL_TOGGLE, newVal)
    }
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
              this.saveToLocalStorage()
              
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
    
    // 更新本地存储中的文件内容
    updateFileContentInStorage() {
      if (this.viewingFile && this.viewingFile.id) {
        try {
          const savedFiles = localStorage.getItem('uploadedFiles')
          if (savedFiles) {
            const files = JSON.parse(savedFiles)
            const fileIndex = files.findIndex(f => f.id === this.viewingFile.id)
            if (fileIndex !== -1) {
              // 更新文件内容
              files[fileIndex].content = this.fileContent
              files[fileIndex].lastModified = new Date().toLocaleString('zh-CN')
              localStorage.setItem('uploadedFiles', JSON.stringify(files))
              console.log('文件内容已更新到本地存储')
            }
          }
        } catch (error) {
          console.error('更新文件内容到本地存储失败:', error)
        }
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
      this.saveToLocalStorage()
      
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
          this.saveToLocalStorage()
          
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
          // 触发删除事件，通知父组件
          this.$emit('file-deleted', file)
          
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
        
        // 文件预览功能已移除，直接提示下载
        console.log('文件预览功能已移除，请直接下载查看')
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
.catalog-view {
  position: relative;
  animation: fadeInUp 0.6s ease-out;
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

.page-header {
  margin-bottom: 32px;
  animation: fadeInDown 0.6s ease-out;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-title-section {
  flex: 1;
}

.page-title {
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

.page-subtitle {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.archive-toggle-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
  flex-shrink: 0;
}

.archive-toggle-btn:hover {
  background: linear-gradient(135deg, #0044CC 0%, #003399 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 68, 204, 0.4);
}

.archive-toggle-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 滑动面板遮罩 */
.archive-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

/* 滑动面板样式 */
.archive-slide-panel {
  position: fixed;
  top: 0;
  right: -600px;
  width: 600px;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  transition: right 0.3s ease;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.archive-slide-panel.open {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 2px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  gap: 12px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.panel-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  flex-shrink: 0;
}

.panel-close-btn:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.05);
}

.panel-close-btn svg {
  width: 20px;
  height: 20px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 面板内表格样式 */
.archive-slide-panel .table-wrap {
  overflow-x: auto;
  margin-top: 16px;
}

.archive-slide-panel .doc-table {
  min-width: 100%;
}

.archive-slide-panel .doc-table thead th {
  font-size: 12px;
  padding: 10px 8px;
  white-space: nowrap;
}

.archive-slide-panel .doc-table tbody td {
  font-size: 13px;
  padding: 10px 8px;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.archive-slide-panel .doc-table tbody .filename {
  max-width: 200px;
}

.archive-slide-panel .doc-table .file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.archive-slide-panel .ops {
  white-space: nowrap;
}

.archive-slide-panel .ops a {
  margin-right: 8px;
  font-size: 12px;
  display: inline-block;
}

.section-card { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  padding: 24px 28px; 
  margin-bottom: 20px; 
}

.add-achievement-section {
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  padding: 16px 48px 32px;
}

.section-title { 
  font-size: 20px; 
  font-weight: 600; 
  color: #1f2937; 
}

.section-title.small { 
  font-size: 18px; 
  margin-bottom: 4px;
}
.section-subtitle { 
  color: #6b7280; 
  font-size: 13px; 
  margin-top: 6px; 
}

/* 搜索框样式 */
.search-section {
  margin-bottom: 16px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 40px 0 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background: #fff;
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  right: 40px;
  color: #9ca3af;
  pointer-events: none;
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.search-results-info {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* 现有成果信息样式 */
.existing-achievement-info {
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.achievement-name {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
  background: #e0f2fe;
  padding: 4px 8px;
  border-radius: 4px;
}

.add-grid { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 20px 28px; 
  padding: 0 40px 20px;
  flex: 1;
  align-content: center;
}

.add-card { 
  border: 2px solid #eef0f2; 
  border-radius: 12px; 
  padding: 20px 18px; 
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 140px;
  display: flex;
  flex-direction: column;
}

.add-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #5b6bff;
}

.add-head { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  margin-bottom: 10px; 
}

.add-name { 
  color: #1f2937; 
  font-weight: 600; 
  font-size: 17px;
}

.add-desc { 
  color: #6b7280; 
  font-size: 14px; 
  margin-bottom: 12px; 
  flex: 1;
  line-height: 1.4;
}

.add-btn {
  margin-top: auto;
  padding: 11px 20px;
  background: linear-gradient(135deg, #5b6bff 0%, #4a5bff 100%);
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 3px 10px rgba(91, 107, 255, 0.2);
}

.add-btn:hover {
  background: linear-gradient(135deg, #4a5bff 0%, #3a4bef 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(91, 107, 255, 0.4);
}

.add-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(91, 107, 255, 0.3);
}
.dot { 
  width: 12px; 
  height: 12px; 
  border-radius: 50%; 
  display: inline-block; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
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
  z-index: 1100;
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
  width: 56px;
  height: 56px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 28px;
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
  min-width: 100px;
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
  z-index: 1100;
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
  width: 350px;
  min-width: 320px;
  border-right: 1px solid #e2e8f0;
  padding-right: 24px;
  overflow-y: auto;
  max-height: 600px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 80px;
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
  gap: 20px;
  flex: 1;
  min-width: 0;
}

.file-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.file-icon {
  font-size: 24px;
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
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.5;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
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
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
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

/* 文件预览相关样式已完全移除 */

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
  flex: 1;
  min-width: 0;
}

/* 重复的预览样式已移除 */

/* 成果详细描述样式 */
.achievement-description {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  flex: 1;
  min-width: 0;
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
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  gap: 12px;
}

/* 新增：编辑模式样式 */
.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.achievement-description .detail-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  margin: 0;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #5b6bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #4c5ae8;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn, .cancel-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #10b981;
  color: white;
}

.save-btn:hover {
  background: #059669;
}

.cancel-btn {
  background: #6b7280;
  color: white;
}

.cancel-btn:hover {
  background: #4b5563;
}

.description-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 编辑表单样式 */
.description-edit-form {
  margin-top: 12px;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-field label {
  font-weight: 500;
  color: #374151;
  min-width: 100px;
  flex-shrink: 0;
}

.edit-field input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.edit-field input:focus {
  outline: none;
  border-color: #5b6bff;
  box-shadow: 0 0 0 3px rgba(91, 107, 255, 0.1);
}

/* 添加文件按钮样式 */
.add-file-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
  text-align: center;
}

.add-file-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #5b6bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-file-btn:hover {
  background: #4c5ae8;
  transform: translateY(-1px);
}

.add-file-btn svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 1400px) {
  .add-grid { 
    gap: 20px 24px;
    padding: 0 30px 20px;
  }
  
  .add-achievement-section {
    padding: 14px 36px 28px;
  }
  
  .section-title.small {
    margin-bottom: 4px;
  }
}

@media (max-width: 1200px) {
  .add-grid { 
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 0 24px 20px;
  }
  
  .add-achievement-section {
    padding: 12px 32px 24px;
  }
  
  .section-title.small {
    margin-bottom: 4px;
  }
}

@media (max-width: 768px) {
  .add-grid { 
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 20px 16px;
  }
  
  .add-card {
    min-height: 130px;
    padding: 18px 16px;
  }
  
  .section-card {
    padding: 20px 16px;
  }
  
  .add-achievement-section {
    padding: 12px 20px;
  }
  
  .archive-toggle-btn {
    font-size: 13px;
    padding: 8px 16px;
  }
  
  .section-title.small {
    margin-bottom: 4px;
  }
}

/* 内容编辑相关样式 */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.content-header h4 {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-content-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-content-btn:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.content-edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-content-btn {
  padding: 6px 16px;
  background-color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-content-btn:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.save-content-btn:disabled {
  background-color: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.cancel-content-btn {
  padding: 6px 16px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-content-btn:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.content-body {
  margin-top: 16px;
}

.content-display {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.content-editor {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  background-color: #ffffff;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.content-editor:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
