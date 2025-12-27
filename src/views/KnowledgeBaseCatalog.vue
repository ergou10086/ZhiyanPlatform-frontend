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
          <button class="add-btn" :class="{ 'disabled': isNotMember || isArchived }" :disabled="isNotMember || isArchived" @click="uploadFile('论文')">上传论文</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-orange"></span>
            <span class="add-name">专利</span>
          </div>
          <div class="add-desc">记录专利信息</div>
          <button class="add-btn" :class="{ 'disabled': isNotMember || isArchived }" :disabled="isNotMember || isArchived" @click="uploadFile('专利')">上传专利</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-green"></span>
            <span class="add-name">数据集</span>
          </div>
          <div class="add-desc">上传研究数据集</div>
          <button class="add-btn" :class="{ 'disabled': isNotMember || isArchived }" :disabled="isNotMember || isArchived" @click="uploadFile('数据集')">上传数据集</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-purple"></span>
            <span class="add-name">模型文件</span>
          </div>
          <div class="add-desc">存储已训练模型</div>
          <button class="add-btn" :class="{ 'disabled': isNotMember || isArchived }" :disabled="isNotMember || isArchived" @click="uploadFile('模型文件')">上传模型</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-yellow"></span>
            <span class="add-name">实验报告</span>
          </div>
          <div class="add-desc">上传实验报告文档</div>
          <button class="add-btn" :class="{ 'disabled': isNotMember || isArchived }" :disabled="isNotMember || isArchived" @click="uploadFile('实验报告')">上传报告</button>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-pink"></span>
            <span class="add-name">自定义项目</span>
          </div>
          <div class="add-desc">创建自定义成果类型</div>
          <button class="add-btn" :class="{ 'disabled': isNotMember || isArchived }" :disabled="isNotMember || isArchived" @click="createCustomType">新建类型</button>
        </div>
        <!-- 任务成果（AI助手联动） -->
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-task"></span>
            <span class="add-name">任务成果</span>
          </div>
          <div class="add-desc">跳转到 AI 实验分析助手 · 任务成果草稿页面，生成并上传任务成果</div>
          <button
            class="add-btn"
            :class="{ 'disabled': isNotMember || isArchived }"
            :disabled="isNotMember || isArchived"
            @click="openTaskResultAssistant"
          >
            打开任务成果面板
          </button>
        </div>
      </div>
    </div>

    <!-- 成果贡献热力图 -->
    <AchievementContributionHeatmap 
      v-if="projectId"
      :project-id="projectId"
    />

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
    <div v-if="showUploadDialog" class="upload-dialog-overlay" :class="{ 'no-click-close': isAddingToExisting }" @click="handleUploadDialogOverlayClick" @wheel.self.prevent @touchmove.self.prevent>
      <div class="upload-dialog" @click.stop @wheel.stop @touchmove.stop>
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
            <label>成果名称：<span class="required-asterisk">*</span></label>
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
          
          <!-- 成果公开性设置 -->
          <div v-if="!isAddingToExisting" class="form-group">
            <label>公开性设置：</label>
            <div class="visibility-options">
              <div class="visibility-option" @click="achievementForm.isPublic = false" :class="{ active: !achievementForm.isPublic }">
                <div class="option-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19.4 15C18.2 17.2 15.4 19 12 19C8.6 19 5.8 17.2 4.6 15C5.8 12.8 8.6 11 12 11C15.4 11 18.2 12.8 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="option-content">
                  <div class="option-title">项目私有</div>
                  <div class="option-desc">仅项目成员可见</div>
                </div>
              </div>
              <div class="visibility-option" @click="achievementForm.isPublic = true" :class="{ active: achievementForm.isPublic }">
                <div class="option-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="option-content">
                  <div class="option-title">公开</div>
                  <div class="option-desc">所有人可见</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 关联项目任务（可选） -->
          <div v-if="!isAddingToExisting" class="form-group">
            <label>关联项目任务（可选）：</label>
            <div class="task-link-section">
              <button
                type="button"
                class="btn primary"
                :disabled="!projectId"
                @click="openTaskLinkDialogForUpload"
              >
                从本项目中选择已完成任务
              </button>
              <p v-if="!projectId" class="hint-text">当前没有项目ID，无法加载任务。</p>

              <div v-if="achievementForm.linkedTaskSummaries && achievementForm.linkedTaskSummaries.length > 0" class="linked-tasks-list">
                <div class="linked-tasks-header">
                  <span>已关联任务 ({{ achievementForm.linkedTaskSummaries.length }})</span>
                  <button type="button" class="link-btn clear-link" @click="clearUploadLinkedTasks">清空</button>
                </div>
                <div class="linked-task-item" v-for="task in achievementForm.linkedTaskSummaries" :key="task.id">
                  <div class="task-main">
                    <div class="task-title-row">
                      <span class="task-title" :title="task.title">{{ task.title || '未命名任务' }}</span>
                    </div>
                    <span v-if="task.assignee" class="task-meta">负责人：{{ task.assignee }}</span>
                  </div>
                  <button type="button" class="task-remove-btn" @click="removeUploadLinkedTask(task.id)">×</button>
                </div>
              </div>
              <div v-else class="linked-tasks-empty">
                <p class="hint-text">尚未关联任务，如有需要可从本项目中选择已完成任务。</p>
              </div>
            </div>
          </div>

          <!-- 文件上传区域 -->
          <div class="form-group">
            <label>上传文件：</label>
            <div 
              class="file-upload-area"
              :class="{ 'drag-over': isDragging }"
              @drop.prevent="handleDrop"
              @dragover.prevent="handleDragOver"
              @dragenter.prevent="handleDragEnter"
              @dragleave.prevent="handleDragLeave"
            >
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
                  <!-- 上传进度条 -->
                  <div v-if="uploadProgress[index] !== undefined" class="upload-progress-bar">
                    <div class="upload-progress-fill" :style="{ width: uploadProgress[index] + '%' }"></div>
                    <span class="upload-progress-text">{{ uploadProgress[index] }}%</span>
                  </div>
                  <button class="remove-file-btn" @click="removeFile(index)" title="删除文件" :disabled="isUploading">
                    ×
                  </button>
                </div>
              </div>
              <div class="upload-zone" @click="triggerFileSelect" :class="{ 'drag-over': isDragging }">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p v-if="!isDragging">点击添加文件或拖拽文件到此处</p>
                <p v-else class="drag-hint">松开鼠标以添加文件</p>
                <p class="upload-hint">支持多文件上传</p>
              </div>
            </div>
          </div>
          
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeUploadDialog">取消</button>
            <button 
              class="btn primary" 
              @click="confirmUpload" 
              :disabled="(!isAddingToExisting && !achievementForm.name.trim()) || achievementForm.files.length === 0"
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
            <label>成果名称：<span class="required-asterisk">*</span></label>
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
            <div 
              class="file-upload-area"
              :class="{ 'drag-over': isDragging }"
              @drop.prevent="handleDrop"
              @dragover.prevent="handleDragOver"
              @dragenter.prevent="handleDragEnter"
              @dragleave.prevent="handleDragLeave"
            >
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
                  <!-- 上传进度条 -->
                  <div v-if="uploadProgress[index] !== undefined" class="upload-progress-bar">
                    <div class="upload-progress-fill" :style="{ width: uploadProgress[index] + '%' }"></div>
                    <span class="upload-progress-text">{{ uploadProgress[index] }}%</span>
                  </div>
                  <button class="remove-file-btn" @click="removeCustomFile(index)" title="删除文件" :disabled="isUploading">
                    ×
                  </button>
                </div>
              </div>
              <div class="upload-zone" @click="triggerCustomFileSelect" :class="{ 'drag-over': isDragging }">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p v-if="!isDragging">点击添加文件或拖拽文件到此处</p>
                <p v-else class="drag-hint">松开鼠标以添加文件</p>
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
        <div class="file-view-content" @wheel="handleContentWheel" @touchstart="handleContentTouchStart" @touchmove="handleContentTouchMove">
          <!-- 统一布局：成果信息 + 成果详细描述 + 文件卡片（支持多文件） -->
          <!-- 成果信息 -->
          <div v-if="viewingFile" class="achievement-info-section">
              <div class="file-details">
                <div class="detail-item">
                  <span class="detail-label">成果名：</span>
                  <span class="detail-value">{{ viewingFile.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">成果类型：</span>
                  <span class="detail-value">{{ viewingFile.type }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">上传者：</span>
                  <span class="detail-value">{{ viewingFile.uploader || '未知' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">公开性：</span>
                  <span class="detail-value visibility-badge" :class="{ 'public': viewingFile.isPublic }">
                    <svg v-if="!viewingFile.isPublic" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
                      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    {{ viewingFile.isPublic ? '公开' : '项目私有' }}
                  </span>
                  <button v-if="canEditAchievement(viewingFile)" class="change-visibility-btn" @click="toggleVisibility(viewingFile)" title="修改公开性">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 20H21M16 5L19 8M3 17V20H6L17 9L14 6L3 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div class="detail-item">
                  <span class="detail-label">上传时间：</span>
                  <span class="detail-value">{{ viewingFile.time || viewingFile.uploadTime || '未知' }}</span>
                </div>
                <div
                  class="detail-item detail-item-linked-tasks"
                  v-if="viewingLinkedTasks && viewingLinkedTasks.length > 0"
                >
                  <span class="detail-label">关联任务：</span>
                  <div class="detail-linked-tasks">
                    <div
                      class="linked-task-item small"
                      v-for="task in viewingLinkedTasks"
                      :key="task.id"
                    >
                      <div class="task-main">
                        <div class="task-title-row">
                          <span class="task-title" :title="task.title">{{ task.title || '未命名任务' }}</span>
                        </div>
                        <div v-if="task.assignee" class="task-meta">负责人：{{ task.assignee }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <!-- 成果详细描述（统一可编辑版本） -->
          <div v-if="viewingFile" class="achievement-description">
            <div class="description-header">
              <div class="detail-label">成果详细描述：</div>
              <button v-if="canEditAchievement(viewingFile) && !isEditingDescription" class="edit-btn" @click="toggleEditMode">编辑</button>
              <div v-if="isEditingDescription" class="edit-actions">
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

          <!-- 文件卡片样式（类似AI赋能，支持多文件） -->
          <div v-if="viewingFile && viewingFile.files && viewingFile.files.length > 0" class="single-file-card-container">
            <div
              class="file-preview-card"
              v-for="(file, index) in viewingFile.files"
              :key="file.id || index"
              @click="previewFile(file)"
              style="cursor: pointer;"
            >
              <div class="file-preview-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 2V9H20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="file-preview-info">
                <div class="file-preview-name">{{ file.name || file.originalFileName || viewingFile.name || '未知文件' }}</div>
                <div class="file-preview-meta">
                  <span class="file-preview-type">{{ getFileTypeDisplay(file.type, file.name || file.originalFileName) }}</span>
                  <span v-if="file.size" class="file-preview-size">{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
              <div class="file-preview-actions">
                <!--<div class="file-preview-hint">点击查看</div>-->
                <button
                  v-if="canEditAchievement(viewingFile) && !isArchived && !isNotMember"
                  class="file-delete-btn"
                  @click.stop="deleteSingleFile(file, index)"
                  title="删除文件"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 11V17M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="file-view-footer">
          <div class="footer-left">
            <button class="add-file-btn" @click.stop="showAddFileDialog" :disabled="!viewingFile || !viewingFile.id">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              添加文件到此成果
            </button>
            <button
              v-if="projectId && canEditAchievement(viewingFile)"
              type="button"
              class="btn secondary"
              @click.stop="openTaskLinkDialogForExisting"
            >
              关联/修改关联任务
            </button>
            <div class="status-selector">
              <label>成果状态：</label>
              <select 
                v-model="viewingFile.status" 
                @change="handleStatusChange"
                class="status-select"
              >
                <option value="draft">草稿</option>
                <option value="under_review">审核中</option>
                <option value="published">已发布</option>
                <option value="obsolete">已归档</option>
              </select>
            </div>
          </div>
          <div class="footer-right">
          <button class="btn secondary" @click="closeViewDialog">关闭</button>
          <button v-if="viewingFile?.files && viewingFile.files.length > 1" class="btn primary" @click="downloadAllFiles(viewingFile)">下载全部</button>
          <button v-else class="btn primary" @click="downloadFile(viewingFile)">下载</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件预览对话框 -->
    <div v-if="showFilePreviewDialog" class="file-preview-overlay" @click="closeFilePreview">
      <div class="file-preview-dialog" @click.stop>
        <div class="file-preview-header">
          <div class="file-preview-title">
            <span class="file-preview-icon-small">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="file-preview-name-text">{{ previewingFile?.name || previewingFile?.originalFileName || '文件预览' }}</span>
            <span v-if="previewingFile?.size" class="file-preview-size-text">({{ formatFileSize(previewingFile.size) }})</span>
          </div>
          <div class="file-preview-actions">
            <button class="file-preview-download-btn" @click="downloadPreviewFile" title="下载文件">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="file-preview-close-btn" @click="closeFilePreview" title="关闭">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="file-preview-content">
          <!-- 加载状态 -->
          <div v-if="previewLoading" class="file-preview-loading">
            <div class="loading-spinner"></div>
            <p>正在加载文件...</p>
          </div>
          <!-- 错误状态 -->
          <div v-else-if="previewError" class="file-preview-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>{{ previewError }}</p>
            <button class="btn primary" @click="retryPreview">重试</button>
          </div>
          <!-- 图片预览 -->
          <div v-else-if="previewFileType === 'image'" class="file-preview-image-container">
            <img :src="previewFileUrl" :alt="previewingFile?.name" class="file-preview-image" @error="handlePreviewError" />
          </div>
          <!-- PDF预览（使用 pdf.js 在前端渲染，避免浏览器直接下载） -->
          <div v-else-if="previewFileType === 'pdf'" class="file-preview-pdf-container">
            <div class="file-preview-pdf-canvas-wrapper">
              <canvas ref="pdfCanvas"></canvas>
            </div>
            <div class="pdf-viewer-toolbar">
              <button class="btn small" @click="renderPrevPdfPage" :disabled="pdfPage <= 1">上一页</button>
              <span class="pdf-page-info">{{ pdfPage }} / {{ pdfTotalPages || '?' }}</span>
              <button class="btn small" @click="renderNextPdfPage" :disabled="pdfPage >= pdfTotalPages">下一页</button>
              <span class="pdf-zoom">
                <button class="btn small" @click="zoomOutPdf" :disabled="pdfScale <= 0.5">-</button>
                <span>{{ Math.round(pdfScale * 100) }}%</span>
                <button class="btn small" @click="zoomInPdf" :disabled="pdfScale >= 2">+</button>
              </span>
            </div>
          </div>
          <!-- Office文档预览（始终使用在线查看器，避免浏览器直接下载 doc/docx 等文件） -->
          <div v-else-if="previewFileType === 'office'" class="file-preview-office-container">
            <div class="office-viewer-wrapper">
              <iframe
                  :src="useMicrosoftViewer ? getMicrosoftViewerUrl(previewFileUrl) : getGoogleDocsViewerUrl(previewFileUrl)"
                  class="file-preview-office"
                  frameborder="0"
                  @error="handleOfficeViewerError"
                  title="Office文档预览"
              ></iframe>
              <!-- 备选方案：如果在线查看器加载失败，可以在这里提示用户改为下载 -->
              <div v-if="officeViewerError" class="office-viewer-fallback">
                <!-- ... 错误提示 ... -->
              </div>
            </div>
          </div>
          <!-- 文本预览 -->
          <div v-else-if="previewFileType === 'text'" class="file-preview-text-container">
            <pre class="file-preview-text"><code>{{ previewFileContent }}</code></pre>
          </div>
          <!-- 文本/Markdown 预览（Google Docs Viewer，与 docx 体验一致） -->
          <div v-else-if="previewFileType === 'text_iframe'" class="file-preview-pdf-container">
            <iframe :src="previewFileUrl" class="file-preview-pdf" frameborder="0"></iframe>
            <div style="position:absolute;right:12px;top:12px;">
              <button class="btn primary" @click.stop="switchToPlainText">切换为纯文本模式</button>
            </div>
          </div>
          <!-- Markdown 预览（前端渲染） -->
          <div v-else-if="previewFileType === 'markdown'" class="file-preview-text-container">
            <div class="file-preview-text markdown-body" v-html="previewMarkdownHtml"></div>
          </div>
          <!-- 视频预览 -->
          <div v-else-if="previewFileType === 'video'" class="file-preview-video-container">
            <video :src="previewFileUrl" controls class="file-preview-video" @error="handlePreviewError">
              您的浏览器不支持视频播放
            </video>
          </div>
          <!-- 音频预览 -->
          <div v-else-if="previewFileType === 'audio'" class="file-preview-audio-container">
            <div class="file-preview-audio-wrapper">
              <audio :src="previewFileUrl" controls class="file-preview-audio" @error="handlePreviewError">
                您的浏览器不支持音频播放
              </audio>
            </div>
          </div>
          <!-- 代码文件预览 -->
          <div v-else-if="previewFileType === 'code'" class="file-preview-code-container">
            <pre class="file-preview-code"><code v-html="highlightedCode"></code></pre>
          </div>
          <!-- 不支持预览的文件类型 -->
          <div v-else class="file-preview-unsupported">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>此文件类型暂不支持在线预览</p>
            <p class="file-preview-unsupported-hint">请下载后使用相应软件打开</p>
            <button class="btn primary" @click="downloadPreviewFile">下载文件</button>
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

    <!-- 关联任务选择弹窗（上传成果时使用） -->
    <div v-if="showTaskLinkDialog" class="modal-overlay" @click="closeTaskLinkDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">选择已完成任务</h3>
          <button class="modal-close" @click="closeTaskLinkDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">从当前项目中选择一个或多个状态为 DONE 的任务，作为成果的关联依据</p>
          <div v-if="taskLinkLoading" class="loading-container">
            <div class="loading-spinner-large"></div>
            <p class="loading-text">正在加载已完成任务...</p>
          </div>
          <div v-else-if="candidateDoneTasks.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="empty-text">当前项目中暂未查询到已完成任务。</p>
          </div>
          <div v-else class="file-list-container">
            <div class="file-list">
              <div
                v-for="task in candidateDoneTasks"
                :key="task.id"
                class="file-card"
                :class="{ 'selected': selectedTaskIdsForDialog.includes(task.id) }"
                @click="toggleTaskSelectionForDialog(task.id)"
              >
                <div class="file-card-content">
                  <div class="file-card-main">
                    <div class="file-name-wrapper">
                      <div class="file-name">{{ task.title || '未命名任务' }}</div>
                      <div class="file-badge-group">
                        <span class="file-type-badge">DONE</span>
                        <span v-if="task.assignee" class="file-count-badge">负责人：{{ task.assignee }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="file-select-indicator" :class="{ 'active': selectedTaskIdsForDialog.includes(task.id) }">
                    <div class="checkmark-circle">
                      <svg v-if="selectedTaskIdsForDialog.includes(task.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeTaskLinkDialog">取消</button>
          <button
            type="button"
            class="btn btn-primary"
            @click="confirmTaskLinkSelection"
            :disabled="selectedTaskIdsForDialog.length === 0"
          >
            确认选择<span v-if="selectedTaskIdsForDialog.length > 0">（{{ selectedTaskIdsForDialog.length }}）</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 删除成果确认弹窗 -->
    <div v-if="deleteConfirmOpen" class="modal-overlay" @click="cancelDeleteFile">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">删除成果</h3>
          <button class="modal-close" @click="cancelDeleteFile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>确定要删除成果"{{ fileToDelete ? fileToDelete.name : '' }}"吗？此操作不可撤销。</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelDeleteFile">取消</button>
          <button type="button" class="btn btn-primary" @click="confirmDeleteFile">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 成功提示弹窗（居中，自动消失） -->
    <div v-if="successToastVisible" class="success-modal-overlay">
      <div class="success-modal-content">
        <div class="success-modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#10b981" stroke-width="2" fill="#d1fae5"/>
            <path d="M8 12L11 15L16 9" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="success-modal-title">操作成功</h3>
        <p class="success-modal-message">{{ successToastMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { eventBus, EventTypes } from '@/utils/eventBus'
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
import { downloadFile as downloadFileUtil, downloadSingleFile, downloadAllFiles as downloadAllFilesUtil, loadTextFile, loadImageFile, loadPdfFile, getFileInfo, testArrayBufferConversion } from '@/utils/catalogFileHandler'
import { knowledgeAPI, STATUS_DISPLAY, STATUS_CLASS } from '@/api/knowledge'
import { convertToCreateDTO, convertFromDTO, convertEditFormToFieldUpdates } from '@/utils/achievementHelper'
import { projectAPI } from '@/api/project'
import { getCurrentUserId } from '@/utils/auth'
import { marked } from 'marked'
import { getLinkedTasks as apiGetLinkedTasks, linkTasksToAchievement as apiLinkTasks, unlinkTasksFromAchievement as apiUnlinkTasks } from '@/api/taskResult'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // 代码高亮主题
import AchievementContributionHeatmap from '@/components/AchievementContributionHeatmap.vue'

export default {
  name: 'KnowledgeBaseCatalog',
  components: {
    AchievementContributionHeatmap
  },
  props: {
    archiveRows: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: [String, Number],
      default: null
    },
    isNotMember: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
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
      searchResults: [], // 搜索结果
      isSearching: false, // 是否处于搜索状态
      searchDebounceTimer: null, // 防抖定时器
      // 添加文件到现有成果相关
      isAddingToExisting: false,
      targetAchievementId: null,
      showViewDialog: false,
      viewingFile: null,
      fileContent: '',
      fileContentType: 'text',
      selectedFileIndex: null,
      lastTouchY: null, // 用于触摸滚动处理
      // 文件预览相关
      showFilePreviewDialog: false,
      previewingFile: null,
      previewFileUrl: null,
      previewFileContent: '', // 文本和代码文件的内容
      previewFileType: 'unknown', // image, pdf, text, video, audio, office, code, unknown
      previewLoading: false,
      previewError: null,
      previewMarkdownHtml: '', // 渲染后的Markdown HTML
      highlightedCode: '', // 代码高亮后的HTML
      // PDF.js 预览相关
      pdfDoc: null,
      pdfPage: 1,
      pdfTotalPages: 0,
      pdfScale: 1.0,
      // Office查看器相关
      officeViewerError: false,
      useMicrosoftViewer: false,
      useOnlineViewer: false, // 是否使用在线查看器（false=直接加载，true=使用在线查看器）
      officeIframeLoaded: false, // iframe是否成功加载
      // 编辑模式
      isEditingDescription: false,
      isEditingContent: false,
      editableContent: '',
      hasContentChanges: false,
      // 拖拽上传相关
      isDragging: false,
      dragCounter: 0,
      // 上传进度相关
      uploadProgress: {}, // { fileIndex: progress }
      isUploading: false,
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
        isPublic: false, // 公开性，默认为私有
        descriptions: [
          { content: '' }
        ],
        files: [],
        // 关联任务
        linkedTaskIds: [],
        linkedTaskSummaries: []
      },
      // 新增：自定义类型上传表单
      customUploadForm: {
        typeName: '',
        name: '',
        descriptions: [
          { content: '' }
        ],
        files: []
      },
      // 上传成功提示弹窗
      successToastVisible: false,
      successToastMessage: '',
      successToastTimer: null,
      // 删除成果确认弹窗
      deleteConfirmOpen: false,
      fileToDelete: null,
      // 任务关联选择弹窗
      showTaskLinkDialog: false,
      taskLinkLoading: false,
      candidateDoneTasks: [],
      selectedTaskIdsForDialog: [],
      // 查看成果时的已关联任务
      viewingLinkedTasks: [],
      // 当前任务关联弹窗作用目标（upload: 上传表单；existing: 已有成果）
      taskLinkDialogTarget: 'upload'
    }
  },
  computed: {
    // 获取当前用户ID
    currentUserId() {
      return getCurrentUserId()
    },
    
    // 只显示从后端加载的数据（不再合并模拟数据）
    allFiles() {
      // 如果有后端数据，只显示后端数据
      // 否则显示archiveRows（兼容没有projectId的情况）
      return this.uploadedFiles.length > 0 ? this.uploadedFiles : this.archiveRows
    },
    
    // 搜索过滤后的数据
    filteredFiles() {
      // 如果处于搜索状态，返回搜索结果
      if (this.isSearching && this.searchText.trim()) {
        return this.searchResults
      }
      // 否则返回所有文件
      return this.allFiles
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
  async mounted() {
    // 加载成果列表（从后端加载真实数据）
    await this.loadAchievements()
    
    // 注意：不再从localStorage加载数据，只保存分页状态
    const loaded = loadFromLocalStorage(this.projectId)
    if (loaded && loaded.currentPage) {
      this.currentPage = loaded.currentPage
    }
  },
  watch: {
    showArchivePanel(newVal) {
      // 当面板状态变化时，通知全局用户信息框
      eventBus.emit(EventTypes.ARCHIVE_PANEL_TOGGLE, newVal)
    },
    showViewDialog(newVal) {
      // 当模态框打开/关闭时，锁定/解锁背景页面滚动
      if (newVal) {
        this.lockBodyScroll()
      } else {
        this.unlockBodyScroll()
      }
    }
  },
  beforeDestroy() {
    // 组件销毁前保存数据
    saveToLocalStorage(this.uploadedFiles, this.currentPage, this.projectId)
    
    // 清除搜索防抖定时器
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = null
    }
    
    // 确保解锁背景滚动（无论是查看对话框还是上传对话框）
    if (this.showViewDialog || this.showUploadDialog) {
      this.unlockBodyScroll()
    }
  },
  methods: {
    checkNotArchived(actionDesc) {
      if (this.isArchived) {
        const msg = actionDesc
          ? `项目已归档，仅支持查看，不能${actionDesc}`
          : '项目已归档，仅支持查看，不能修改成果目录'
        if (this.$message) {
          this.$message.error(msg)
        } else {
          alert(msg)
        }
        return false
      }
      return true
    },
    // 显示上传成功提示（自动消失）
    showSuccessToast(message) {
      this.successToastMessage = message
      this.successToastVisible = true
      if (this.successToastTimer) {
        clearTimeout(this.successToastTimer)
      }
      this.successToastTimer = setTimeout(() => {
        this.successToastVisible = false
        this.successToastMessage = ''
        this.successToastTimer = null
      }, 1500)
    },
    // === 成果上传/查看时关联任务相关 ===
    async openTaskLinkDialogForUpload() {
      if (!this.projectId) {
        return
      }
      this.taskLinkDialogTarget = 'upload'
      await this.openTaskLinkDialogInternal(this.achievementForm.linkedTaskIds || [])
    },
    async openTaskLinkDialogForExisting() {
      if (!this.projectId || !this.viewingFile || !this.viewingFile.id) {
        return
      }
      this.taskLinkDialogTarget = 'existing'
      const existingIds = (this.viewingLinkedTasks || []).map(t => t.id)
      await this.openTaskLinkDialogInternal(existingIds)
    },
    async openTaskLinkDialogInternal(initialSelectedIds) {
      this.showTaskLinkDialog = true
      this.taskLinkLoading = true
      this.selectedTaskIdsForDialog = [...initialSelectedIds]
      try {
        const resp = await projectAPI.getProjectTasksByStatus(this.projectId, 'DONE', 0, 100)
        console.log('[KnowledgeBaseCatalog] DONE 任务列表响应:', resp)
        if (resp && resp.code === 200 && resp.data) {
          const content = Array.isArray(resp.data.content) ? resp.data.content : []
          this.candidateDoneTasks = content.map(t => ({
            id: t.id,
            title: t.title || t.name || '未命名任务',
            assignee: t.assigneeNames || t.assigneeName || t.assignee || ''
          }))
        } else {
          this.candidateDoneTasks = []
        }
      } catch (e) {
        console.error('[KnowledgeBaseCatalog] 加载 DONE 任务失败:', e)
        this.candidateDoneTasks = []
      } finally {
        this.taskLinkLoading = false
      }
    },
    closeTaskLinkDialog() {
      this.showTaskLinkDialog = false
    },
    toggleTaskSelectionForDialog(taskId) {
      const idx = this.selectedTaskIdsForDialog.indexOf(taskId)
      if (idx >= 0) {
        this.selectedTaskIdsForDialog.splice(idx, 1)
      } else {
        this.selectedTaskIdsForDialog.push(taskId)
      }
    },
    confirmTaskLinkSelection() {
      const ids = [...this.selectedTaskIdsForDialog]
      const map = new Map(this.candidateDoneTasks.map(t => [t.id, t]))

      if (this.taskLinkDialogTarget === 'existing' && this.viewingFile && this.viewingFile.id) {
        // 为已有成果更新关联任务
        const achievementId = this.viewingFile.id
        apiLinkTasks(achievementId, ids)
          .then(resp => {
            console.log('[KnowledgeBaseCatalog] 更新已有成果关联任务响应:', resp)
            if (resp && resp.code === 200) {
              this.viewingLinkedTasks = ids
                .map(id => map.get(id))
                .filter(Boolean)
                .map(t => ({ id: t.id, title: t.title, assignee: t.assignee }))
              this.showSuccessToast('已更新成果关联任务')
            } else {
              alert(resp?.msg || '更新关联任务失败，请重试')
            }
          })
          .catch(e => {
            console.error('[KnowledgeBaseCatalog] 更新已有成果关联任务失败:', e)
            alert('更新关联任务失败，请稍后重试')
          })
          .finally(() => {
            this.showTaskLinkDialog = false
          })
      } else {
        // 上传表单场景，仅在前端记录
        this.achievementForm.linkedTaskIds = ids
        this.achievementForm.linkedTaskSummaries = ids
          .map(id => map.get(id))
          .filter(Boolean)
          .map(t => ({ id: t.id, title: t.title, assignee: t.assignee }))
        this.showTaskLinkDialog = false
      }
    },
    clearUploadLinkedTasks() {
      this.achievementForm.linkedTaskIds = []
      this.achievementForm.linkedTaskSummaries = []
    },
    removeUploadLinkedTask(taskId) {
      this.achievementForm.linkedTaskIds = (this.achievementForm.linkedTaskIds || []).filter(id => id !== taskId)
      this.achievementForm.linkedTaskSummaries = (this.achievementForm.linkedTaskSummaries || []).filter(t => t.id !== taskId)
    },
    // 从 iframe 文本预览切换为纯文本模式
    switchToPlainText() {
      if (this.previewFileUrl) {
        this.previewLoading = true
        this.previewError = null
        this.previewFileType = 'text'
        this.loadTextContentForPreview(this.previewFileUrl).finally(() => {
          this.previewLoading = false
        })
      }
    },

    // 从成果目录跳转到 AI 实验分析助手的「任务成果草稿」模式
    openTaskResultAssistant() {
      const projectId = this.projectId || this.$route.params.id
      console.log('[任务成果] 点击打开任务成果面板, projectId:', projectId)
      
      if (!projectId) {
        console.warn('[任务成果] 项目ID为空，无法跳转')
        alert('项目ID无效，无法打开任务成果面板')
        return
      }
      
      console.log('[任务成果] 准备跳转到 AIAssistant 页面')
      this.$router.push({
        name: 'AIAssistant',
        query: {
          projectId: projectId || '',
          mode: 'taskResult',
          from: 'knowledgeCatalog'
        }
      }).then(() => {
        console.log('[任务成果] 路由跳转成功')
      }).catch(err => {
        console.error('[任务成果] 路由跳转失败:', err)
      })
    },
    /**
     * 判断当前用户是否可以编辑指定成果
     */
    canEditAchievement(achievement) {
      if (!achievement || !this.currentUserId) {
        return false
      }
      // 简单判断：只有创建者才能编辑（后端会做更完整的权限检查）
      // 这里为了更好的用户体验，只在前端隐藏按钮
      return String(achievement.creatorId) === String(this.currentUserId)
    },
    
    /**
     * 从后端加载成果列表
     */
    async loadAchievements() {
      if (!this.projectId) {
        console.warn('projectId为空，无法加载成果列表')
        return
      }
      
      try {
        console.log('加载成果列表, projectId:', this.projectId)
        
        // 调用API获取成果列表
        const response = await knowledgeAPI.getProjectAchievements(this.projectId, 0, 50)
        console.log('成果列表加载成功:', response)
        
        // response是R对象，结构为 { code, msg, data }
        if (response && response.code === 200 && response.data) {
          // data是Page对象，包含content数组
          const achievements = response.data.content || []
          
          // 调试：打印原始DTO数据结构，查看上传者信息在哪个字段
          if (achievements.length > 0) {
            console.log('📋 原始成果DTO示例（第一个）:', achievements[0])
            console.log('📋 DTO所有字段:', Object.keys(achievements[0]))
            console.log('📋 上传者相关字段:', {
              creatorName: achievements[0].creatorName,
              creator: achievements[0].creator,
              createdBy: achievements[0].createdBy,
              uploader: achievements[0].uploader,
              username: achievements[0].username,
              userName: achievements[0].userName,
              creatorInfo: achievements[0].creatorInfo,
              creatorUser: achievements[0].creatorUser,
              createdByUser: achievements[0].createdByUser
            })
          }
          
          // 使用响应式更新方式
          const convertedAchievements = achievements.map(dto => convertFromDTO(dto))
          
          // 清空原数组并填充新数据，确保响应式
          this.uploadedFiles.splice(0, this.uploadedFiles.length, ...convertedAchievements)
          
          // 对于uploader为null的记录，异步获取用户名
          await this.fetchMissingCreatorNames()
          
          console.log('✅ 转换后的成果列表:', this.uploadedFiles.length, '条记录')
          console.log('✅ 成果列表详情:', this.uploadedFiles)
        } else {
          console.warn('成果列表响应格式异常:', response)
          // 失败时清空数组，使用响应式方式
          this.uploadedFiles.splice(0, this.uploadedFiles.length)
        }
      } catch (error) {
        console.error('加载成果列表失败:', error)
        // 失败时清空数组，使用响应式方式
        this.uploadedFiles.splice(0, this.uploadedFiles.length)
      }
    },
    
    /**
     * 异步获取缺失的上传者姓名
     * 通过项目成员列表获取，避免权限问题
     */
    async fetchMissingCreatorNames() {
      // 找出所有需要获取用户名的成果（uploader为null/undefined/'未知用户'且有creatorId）
      const achievementsNeedingFetch = this.uploadedFiles.filter(
        file => (!file.uploader || file.uploader === '未知用户') && file.creatorId
      )
      
      if (achievementsNeedingFetch.length === 0) {
        console.log('🔍 没有需要获取上传者姓名的成果')
        return
      }
      
      if (!this.projectId) {
        console.warn('⚠️ projectId为空，无法获取项目成员列表')
        return
      }
      
      console.log(`🔍 需要获取 ${achievementsNeedingFetch.length} 个上传者姓名`)
      console.log('🔍 需要获取的成果列表:', achievementsNeedingFetch.map(f => ({ id: f.id, name: f.name, creatorId: f.creatorId, uploader: f.uploader })))
      
      // 获取唯一的creatorId列表（避免重复查找）
      const uniqueCreatorIds = [...new Set(achievementsNeedingFetch.map(f => String(f.creatorId)))]
      console.log('🔍 唯一的creatorId列表:', uniqueCreatorIds)
      
      // 创建用户ID到用户名的映射（使用字符串作为key）
      const userIdToNameMap = new Map()
      
      try {
        // 通过项目成员列表获取用户信息（这个接口应该是可用的）
        console.log(`📡 开始获取项目成员列表: projectId=${this.projectId}`)
        const response = await projectAPI.getProjectMembers(this.projectId, 0, 1000)
        
        console.log('📡 项目成员列表API响应:', response)
        
        if (response && response.code === 200) {
          let members = []
          if (response.data && response.data.content) {
            members = response.data.content
          } else if (Array.isArray(response.data)) {
            members = response.data
          }
          
          console.log(`📋 获取到 ${members.length} 个项目成员`)
          
          // 遍历成员列表，建立ID到姓名的映射
          members.forEach(member => {
            const memberId = String(member.userId || member.id)
            const memberName = member.username || member.name || member.nickname
            if (memberName && memberName.trim() !== '') {
              userIdToNameMap.set(memberId, memberName)
              console.log(`✅ 添加成员映射: ID=${memberId}, 姓名="${memberName}"`)
            }
          })
          
          console.log('📋 成员映射表:', Array.from(userIdToNameMap.entries()))
        } else {
          console.warn('⚠️ 获取项目成员列表失败:', response)
        }
      } catch (error) {
        console.error('❌ 获取项目成员列表异常:', error)
      }
      
      // 如果映射表为空，说明无法获取成员信息
      if (userIdToNameMap.size === 0) {
        console.warn('⚠️ 无法获取项目成员信息，无法解析上传者姓名')
        return
      }
      
      // 更新成果列表中的上传者姓名
      let updateCount = 0
      // 使用数组索引更新，确保响应式
      for (let index = 0; index < this.uploadedFiles.length; index++) {
        const achievement = this.uploadedFiles[index]
        const creatorIdStr = String(achievement.creatorId)
        
        // 如果这个成果需要更新且我们在成员列表中找到了对应的用户名
        if ((!achievement.uploader || achievement.uploader === '未知用户') && userIdToNameMap.has(creatorIdStr)) {
          const userName = userIdToNameMap.get(creatorIdStr)
          
          // 创建新对象并替换，确保响应式更新
          const updatedAchievement = {
            ...achievement,
            uploader: userName
          }
          
          // 使用Vue.set替换数组中的元素
          this.$set(this.uploadedFiles, index, updatedAchievement)
          
          updateCount++
          console.log(`✅✅✅ [${index + 1}] 更新成果上传者: "${achievement.name}" (ID: ${achievement.id}) -> "${userName}" (creatorId: ${creatorIdStr})`)
        } else if ((!achievement.uploader || achievement.uploader === '未知用户') && achievement.creatorId) {
          console.warn(`⚠️ 未在成员列表中找到creatorId: ${creatorIdStr}, 成果: ${achievement.name}`)
        }
      }
      
      console.log(`✅ 所有上传者姓名获取完成，共更新 ${updateCount} 条记录`)
      console.log('📋 更新后的uploadedFiles:', this.uploadedFiles.map(f => ({ id: f.id, name: f.name, uploader: f.uploader, creatorId: f.creatorId })))
      
      // 在下一个tick中强制更新视图
      await this.$nextTick()
      this.$forceUpdate()
    },
    
    uploadFile(type) {
      // 如果不是项目成员或项目已归档，禁止上传
      if (this.isNotMember) {
        return
      }
      if (!this.checkNotArchived('上传成果文件')) {
        return
      }
      this.currentFileType = type
      this.fileAccept = getFileAccept(type)
      // 重置表单数据
      this.resetAchievementForm()
      this.showUploadDialog = true
      // 锁定背景滚动
      this.$nextTick(() => {
        this.lockBodyScroll()
      })
    },
    
    async handleFileSelect(event) {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        console.log('文件选择事件:', {
          filesCount: files.length,
          isAddingToExisting: this.isAddingToExisting,
          showUploadDialog: this.showUploadDialog,
          showCustomDialog: this.showCustomDialog,
          showViewDialog: this.showViewDialog,
          viewingFile: this.viewingFile ? this.viewingFile.id : null
        })
        
        // 优先检查是否在上传对话框中（无论是新建还是添加文件到现有成果）
        if (this.showUploadDialog) {
          // 上传对话框已打开，将文件添加到表单中
          console.log('将文件添加到上传表单')
          files.forEach(file => {
            this.achievementForm.files.push({
              name: file.name,
              size: file.size,
              type: file.type,
              file: file
            })
          })
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
        } else if (this.isAddingToExisting && this.targetAchievementId) {
          // 如果不在对话框中，但标记为添加文件到现有成果，直接处理（兼容旧逻辑）
          if (!this.checkNotArchived('为成果添加文件')) {
            this.$refs.fileInput.value = ''
            return
          }
          console.log('为现有成果添加文件，直接处理')
          await this.addFilesToExistingAchievement(files)
        }
        // 清空文件输入
        this.$refs.fileInput.value = ''
      }
    },
    
    triggerFileSelect() {
      this.$refs.fileInput.click()
    },
    
    // 拖拽上传相关方法
    handleDragEnter(e) {
      e.preventDefault()
      this.dragCounter++
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        this.isDragging = true
      }
    },
    
    handleDragLeave(e) {
      e.preventDefault()
      this.dragCounter--
      if (this.dragCounter === 0) {
        this.isDragging = false
      }
    },
    
    handleDragOver(e) {
      e.preventDefault()
    },
    
    handleDrop(e) {
      e.preventDefault()
      this.isDragging = false
      this.dragCounter = 0
      
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        if (this.showUploadDialog) {
          // 上传对话框已打开，将文件添加到表单中
          files.forEach(file => {
            this.achievementForm.files.push({
              name: file.name,
              size: file.size,
              type: file.type,
              file: file
            })
          })
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
        }
      }
    },
    
    removeFile(index) {
      this.achievementForm.files.splice(index, 1)
      // 清除对应的上传进度
      if (this.uploadProgress[index] !== undefined) {
        delete this.uploadProgress[index]
      }
    },
    
    
    resetAchievementForm() {
      this.achievementForm = {
        name: '',
        isPublic: false, // 公开性，默认为私有
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
          if (!this.checkNotArchived(this.isAddingToExisting ? '为成果添加文件' : '创建成果并上传文件')) {
            return
          }
          // 检查是否为现有成果添加文件
          if (this.isAddingToExisting && this.targetAchievementId) {
            // 为现有成果添加文件
            console.log('为现有成果添加文件, achievementId:', this.targetAchievementId)
            
            // 准备文件对象列表（只保留真实的File对象）
            const files = this.achievementForm.files.map(f => f.file)
            
            // 初始化上传进度
            this.isUploading = true
            this.uploadProgress = {}
            files.forEach((_, index) => {
              this.$set(this.uploadProgress, index, 0)
            })
            
            // 调用批量上传API（带进度回调）
            const response = await knowledgeAPI.uploadFilesBatch(
              files, 
              this.targetAchievementId,
              (progress) => {
                // 更新所有文件的上传进度（批量上传时统一进度）
                files.forEach((_, index) => {
                  this.$set(this.uploadProgress, index, progress)
                })
              }
            )
            console.log('批量上传文件成功:', response)
            
            // 清除上传进度
            this.isUploading = false
            this.uploadProgress = {}
            
            // 如果当前正在查看这个成果，需要更新 viewingFile 的文件列表
            if (this.showViewDialog && this.viewingFile && this.viewingFile.id === this.targetAchievementId) {
              console.log('更新当前查看成果的文件列表')
              // 重新获取文件列表
              const filesResponse = await knowledgeAPI.getAchievementFiles(this.targetAchievementId)
              if (filesResponse && filesResponse.code === 200 && filesResponse.data) {
                // 更新 viewingFile 的文件列表（追加而不是替换）
                const newFiles = filesResponse.data.map(fileDto => ({
                  id: fileDto.id,
                  name: fileDto.fileName,
                  originalFileName: fileDto.originalFileName,
                  type: fileDto.mimeType,
                  size: fileDto.fileSize,
                  uploadTime: fileDto.uploadedAt,
                  downloadUrl: fileDto.downloadUrl || fileDto.accessUrl
                }))
                // 更新文件列表和文件数量
                this.viewingFile.files = newFiles
                this.viewingFile.fileCount = newFiles.length
                console.log('文件列表已更新，共', newFiles.length, '个文件')
              }
            }
            
            // 刷新成果列表（重新加载当前页数据）
            await this.loadAchievements()
            
            // 重置状态
            this.resetAchievementForm()
            this.isAddingToExisting = false
            this.targetAchievementId = null
            this.showUploadDialog = false

            this.showSuccessToast(`已成功添加${files.length}个文件到成果中！`)
            return
          }
          
          // 创建新成果
          console.log('创建新成果, projectId:', this.projectId)
          
          // 1. 准备成果创建数据
          const createDTO = convertToCreateDTO(this.achievementForm, this.projectId, this.currentFileType)
          console.log('创建成果DTO:', createDTO)
          
          // 2. 调用创建成果API
          const createResponse = await knowledgeAPI.createAchievement(createDTO)
          console.log('创建成果响应:', createResponse)
          
          // response是R对象，检查code
          if (createResponse.code !== 200 || !createResponse.data) {
            throw new Error(createResponse.msg || '创建成果失败')
          }
          
          const achievement = createResponse.data
          const achievementId = achievement.id
          
          // 3. 批量上传文件
          const files = this.achievementForm.files.map(f => f.file)
          console.log('准备批量上传文件, 数量:', files.length)
          
          // 初始化上传进度
          this.isUploading = true
          this.uploadProgress = {}
          files.forEach((_, index) => {
            this.$set(this.uploadProgress, index, 0)
          })
          
          const uploadResponse = await knowledgeAPI.uploadFilesBatch(
            files, 
            achievementId,
            (progress) => {
              // 更新所有文件的上传进度（批量上传时统一进度）
              files.forEach((_, index) => {
                this.$set(this.uploadProgress, index, progress)
              })
            }
          )
          console.log('批量上传文件成功:', uploadResponse)
          
          // 清除上传进度
          this.isUploading = false
          this.uploadProgress = {}
          
          // 4. 刷新成果列表
          await this.loadAchievements()
          
          // 5. 重置状态
          this.resetAchievementForm()
          this.isAddingToExisting = false
          this.targetAchievementId = null
          this.showUploadDialog = false
          
          // 6. 跳转到最后一页显示新上传的成果
          this.goToLastPage()

          this.showSuccessToast(`成果"${this.achievementForm.name}"创建成功！已上传${files.length}个文件。`)
          
        } catch (error) {
          console.error('上传失败:', error)
          alert('上传失败: ' + (error.message || '请重试'))
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
      // 清除之前的防抖定时器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      
      // 如果搜索框为空，清除搜索状态
      if (!this.searchText.trim()) {
        this.clearSearch()
        return
      }
      
      // 设置防抖定时器，500ms后执行搜索
      this.searchDebounceTimer = setTimeout(() => {
        this.performSearch()
      }, 500)
    },
    
    /**
     * 执行搜索
     */
    async performSearch() {
      if (!this.searchText.trim() || !this.projectId) {
        return
      }
      
      try {
        console.log('执行搜索, 关键词:', this.searchText)
        this.isSearching = true
        
        // 调用后端搜索API
        const response = await knowledgeAPI.searchAchievements(this.searchText, 0, 50)
        console.log('搜索响应:', response)
        
        if (response && response.code === 200 && response.data) {
          // 将搜索结果转换为前端格式
          const achievements = response.data.content || []
          const convertedResults = achievements.map(dto => convertFromDTO(dto))
          
          // 使用响应式方式更新搜索结果
          this.searchResults.splice(0, this.searchResults.length, ...convertedResults)
          
          console.log('✅ 搜索结果:', this.searchResults.length, '条记录')
          
          // 重置到第一页
          this.currentPage = 1
        } else {
          console.warn('搜索响应格式异常:', response)
          // 清空搜索结果，使用响应式方式
          this.searchResults.splice(0, this.searchResults.length)
        }
      } catch (error) {
        console.error('搜索失败:', error)
        // 清空搜索结果，使用响应式方式
        this.searchResults.splice(0, this.searchResults.length)
        alert('搜索失败: ' + (error.message || '请重试'))
      }
    },
    
    clearSearch() {
      this.searchText = ''
      // 清空搜索结果，使用响应式方式
      this.searchResults.splice(0, this.searchResults.length)
      this.isSearching = false
      this.currentPage = 1
      
      // 清除防抖定时器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
    },
    
    // 获取目标成果名称
    getTargetAchievementName() {
      if (this.targetAchievementId) {
        const targetAchievement = this.uploadedFiles.find(item => item.id === this.targetAchievementId)
        return targetAchievement ? targetAchievement.name : '未知成果'
      }
      return '未知成果'
    },
    
    // 检查上传表单是否有未保存的内容
    hasUploadFormContent() {
      const form = this.achievementForm
      // 检查成果名称
      if (form.name && form.name.trim()) {
        return true
      }
      // 检查文件
      if (form.files && form.files.length > 0) {
        return true
      }
      // 检查关联任务
      if (form.linkedTaskIds && form.linkedTaskIds.length > 0) {
        return true
      }
      // 检查不同类型的具体字段
      if (this.currentFileType === '论文') {
        if (form.paperAuthors?.trim() || form.paperTitle?.trim() || form.journalName?.trim() || 
            form.publishYear?.trim() || form.volume?.trim() || form.issue?.trim()) {
          return true
        }
      } else if (this.currentFileType === '专利') {
        if (form.patentNumber?.trim() || form.patentType?.trim() || form.patentName?.trim() || 
            form.inventors?.trim() || form.applicants?.trim()) {
          return true
        }
      } else if (this.currentFileType === '数据集') {
        if (form.datasetVersion?.trim() || form.datasetName?.trim() || form.datasetFormat?.trim() || 
            form.datasetSize?.trim() || form.datasetSource?.trim()) {
          return true
        }
      } else if (this.currentFileType === '模型文件') {
        if (form.modelFramework?.trim() || form.modelName?.trim() || form.modelVersion?.trim() || 
            form.modelType?.trim() || form.hyperparameters?.trim()) {
          return true
        }
      } else if (this.currentFileType === '实验报告') {
        if (form.reportType?.trim() || form.reportName?.trim() || form.reportDate?.trim()) {
          return true
        }
      }
      return false
    },
    
    // 检查自定义表单是否有未保存的内容
    hasCustomFormContent() {
      const form = this.customUploadForm
      // 检查类型名称
      if (form.typeName && form.typeName.trim()) {
        return true
      }
      // 检查成果名称
      if (form.name && form.name.trim()) {
        return true
      }
      // 检查文件
      if (form.files && form.files.length > 0) {
        return true
      }
      // 检查描述字段
      if (form.descriptions && form.descriptions.length > 0) {
        const hasContent = form.descriptions.some(desc => 
          (desc.leftField && desc.leftField.trim()) || (desc.rightField && desc.rightField.trim())
        )
        if (hasContent) {
          return true
        }
      }
      return false
    },
    
    // 处理上传弹窗遮罩层点击事件
    handleUploadDialogOverlayClick(event) {
      // 如果正在为现有成果添加文件，不允许点击外部关闭
      if (this.isAddingToExisting) {
        return
      }
      // 否则调用原有的关闭逻辑
      this.closeUploadDialog()
    },
    
    closeUploadDialog() {
      // 检查是否有未保存的内容
      if (this.hasUploadFormContent()) {
        if (!confirm('您有未保存的内容，关闭对话框将丢失这些信息。确定要关闭吗？')) {
          return
        }
      }
      this.showUploadDialog = false
      this.resetAchievementForm()
      this.isAddingToExisting = false
      this.targetAchievementId = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      // 解锁背景滚动
      this.unlockBodyScroll()
    },
    
    createCustomType() {
      // 如果不是项目成员，禁止创建
      if (this.isNotMember) {
        return
      }
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
      // 基础校验
      if (!this.customUploadForm.typeName.trim() || !this.customUploadForm.name.trim() || this.customUploadForm.files.length === 0) {
        return
      }

      // 必须有项目ID，且项目未归档
      if (!this.projectId) {
        alert('当前没有项目ID，无法创建自定义成果')
        return
      }
      if (!this.checkNotArchived('创建自定义成果')) {
        return
      }

      try {
        const typeDisplay = this.customUploadForm.typeName.trim()

        // 1. 构建后端 CreateAchievementDTO（类型固定为 custom）
        const detailFields = (this.customUploadForm.descriptions || [])
          .filter(d => (d.leftField && d.leftField.trim()) || (d.rightField && d.rightField.trim()))
          .map(d => ({
            label: d.leftField || '',
            value: d.rightField || ''
          }))

        const createDTO = {
          projectId: this.projectId,
          title: this.customUploadForm.name.trim(),
          type: 'custom',              // 后端枚举：自定义成果
          status: 'draft',
          isPublic: false,
          detailData: detailFields.length > 0 ? { fields: detailFields, typeName: typeDisplay } : { typeName: typeDisplay }
        }

        console.log('[自定义成果] 创建DTO:', createDTO)

        // 2. 调用后端创建成果
        const createResp = await knowledgeAPI.createAchievement(createDTO)
        console.log('[自定义成果] 创建成果响应:', createResp)

        if (!createResp || createResp.code !== 200 || !createResp.data || !createResp.data.id) {
          throw new Error(createResp?.msg || '创建自定义成果失败')
        }

        const achievementId = createResp.data.id

        // 3. 批量上传文件
        const files = this.customUploadForm.files.map(f => f.file)
        console.log('[自定义成果] 准备批量上传文件, achievementId:', achievementId, 'files:', files)
        const uploadResp = await knowledgeAPI.uploadFilesBatch(files, achievementId)
        console.log('[自定义成果] 批量上传文件响应:', uploadResp)

        // 4. 重新加载成果列表，并跳转到最后一页
        await this.loadAchievements()
        this.goToLastPage()

        // 5. 重置状态并关闭弹窗
        this.resetCustomForm()
        this.showCustomDialog = false

        this.showSuccessToast(`自定义类型"${typeDisplay}"的成果已创建并上传${files.length}个文件`)
      } catch (error) {
        console.error('自定义类型成果创建/上传失败:', error)
        alert('自定义成果创建失败: ' + (error.message || '请重试'))
      }
    },
    
    closeCustomDialog() {
      // 检查是否有未保存的内容
      if (this.hasCustomFormContent()) {
        if (!confirm('您有未保存的内容，关闭对话框将丢失这些信息。确定要关闭吗？')) {
          return
        }
      }
      this.showCustomDialog = false
      this.resetCustomForm()
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    async viewFile(file) {
      try {
        console.log('查看成果, ID:', file.id, '名称:', file.name)
        
        // 先获取完整的成果详情（包括文件列表）
        const response = await knowledgeAPI.getAchievementDetail(file.id)
        console.log('成果详情响应:', response)
        
        if (response && response.code === 200 && response.data) {
          // 转换DTO为前端格式
          const detailData = convertFromDTO(response.data)
          console.log('转换后的成果详情:', detailData)

          // 如果详情中的上传者为空或为“未知用户”，尝试使用列表行中的上传者
          if ((!detailData.uploader || detailData.uploader === '未知用户') && file && file.uploader) {
            detailData.uploader = file.uploader
          }
          
          // 获取文件列表
          const filesResponse = await knowledgeAPI.getAchievementFiles(file.id)
          console.log('文件列表响应:', filesResponse)
          
          if (filesResponse && filesResponse.code === 200 && filesResponse.data) {
            // 将文件列表添加到成果对象中
            detailData.files = filesResponse.data.map(fileDto => ({
              id: fileDto.id,
              name: fileDto.fileName,
              originalFileName: fileDto.originalFileName,
              type: fileDto.mimeType,
              size: fileDto.fileSize,
              uploadTime: fileDto.uploadedAt,
              downloadUrl: fileDto.downloadUrl || fileDto.accessUrl
            }))
            detailData.fileCount = detailData.files.length
            console.log('文件列表处理完成，共', detailData.files.length, '个文件')
          } else {
            console.warn('获取文件列表失败或文件列表为空')
            detailData.files = []
            detailData.fileCount = 0
          }

          // 获取成果已关联任务
          try {
            const linkedResp = await apiGetLinkedTasks(file.id)
            console.log('[KnowledgeBaseCatalog] 获取成果已关联任务响应:', linkedResp)
            if (linkedResp && linkedResp.code === 200 && Array.isArray(linkedResp.data)) {
              this.viewingLinkedTasks = linkedResp.data.map(t => ({
                id: t.id,
                title: t.title || t.name || '未命名任务',
                assignee: t.assigneeNames || t.assigneeName || t.assignee || ''
              }))
            } else {
              this.viewingLinkedTasks = []
            }
          } catch (e) {
            console.error('[KnowledgeBaseCatalog] 获取成果已关联任务失败:', e)
            this.viewingLinkedTasks = []
          }
          
          this.viewingFile = detailData
          this.loadFileContent(detailData)
          this.showViewDialog = true
        } else {
          throw new Error(response?.msg || '获取成果详情失败')
        }
      } catch (error) {
        console.error('查看成果失败:', error)
        alert('查看成果失败: ' + (error.message || '请重试'))
      }
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
      this.lastTouchY = null
      this.resetEditForm()
      this.unlockBodyScroll()
    },
    
    // 锁定背景页面滚动
    lockBodyScroll() {
      // 保存当前滚动位置
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    },
    
    // 解锁背景页面滚动
    unlockBodyScroll() {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    },
    
    // 处理内容区域滚动事件，防止滚动穿透
    handleContentWheel(e) {
      const content = e.currentTarget
      const { scrollTop, scrollHeight, clientHeight } = content
      
      // 如果内容不需要滚动（内容高度小于容器高度），直接阻止事件传播
      if (scrollHeight <= clientHeight) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      const isAtTop = scrollTop <= 1 // 允许1px的误差
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 // 允许1px的误差
      
      // 如果已经滚动到顶部，且继续向上滚动，阻止事件传播
      if (isAtTop && e.deltaY < 0) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      // 如果已经滚动到底部，且继续向下滚动，阻止事件传播
      if (isAtBottom && e.deltaY > 0) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      // 其他情况允许正常滚动，不阻止事件
    },
    
    // 处理触摸开始事件
    handleContentTouchStart(e) {
      if (e.touches && e.touches.length > 0) {
        this.lastTouchY = e.touches[0].clientY
      }
    },
    
    // 处理触摸滚动事件，防止滚动穿透
    handleContentTouchMove(e) {
      const content = e.currentTarget
      const { scrollTop, scrollHeight, clientHeight } = content
      const touch = e.touches[0]
      if (!touch) return
      
      // 如果内容不需要滚动（内容高度小于容器高度），直接阻止事件传播
      if (scrollHeight <= clientHeight) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      const currentY = touch.clientY
      const isAtTop = scrollTop <= 1 // 允许1px的误差
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 // 允许1px的误差
      
      // 如果已经滚动到顶部，且继续向上滑动，阻止事件
      if (isAtTop && this.lastTouchY && currentY > this.lastTouchY) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      // 如果已经滚动到底部，且继续向下滑动，阻止事件
      if (isAtBottom && this.lastTouchY && currentY < this.lastTouchY) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      this.lastTouchY = currentY
      // 其他情况允许正常滚动，不阻止事件
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
    
    // 切换成果公开性
    async toggleVisibility(achievement) {
      try {
        const newVisibility = !achievement.isPublic
        const confirmMsg = newVisibility
          ? '确定要将此成果设置为公开吗？所有人都可以查看。'
          : '确定要将此成果设置为项目私有吗？只有项目成员可以查看。'

        if (!confirm()) {
          return
        }

        // 调用API更新公开性
        await knowledgeAPI.updateAchievementVisibility(achievement.id, newVisibility)

        // 更新本地数据
        achievement.isPublic = newVisibility

        // 如果当前正在查看这个成果，也更新查看对话框中的数据
        if (this.viewingFile && this.viewingFile.id === achievement.id) {
          this.viewingFile.isPublic = newVisibility
        }

        alert(`公开性已更新为：${newVisibility ? '公开' : '项目私有'}`)
      } catch (error) {
        console.error('更新公开性失败:', error)
        alert('更新公开性失败: ' + (error.message || '请重试'))
      }
    },

    // 保存描述修改
    async saveDescriptionChanges() {
      if (!this.viewingFile) return
      
      try {
        console.log('保存成果详情修改, ID:', this.viewingFile.id, '类型:', this.viewingFile.type)
        
        // 将编辑表单转换为后端字段更新对象
        const fieldUpdates = convertEditFormToFieldUpdates(this.editForm, this.viewingFile.type)
        console.log('字段更新对象:', fieldUpdates)
        
        // 调用后端API更新成果详情
        const response = await knowledgeAPI.updateDetailFields(this.viewingFile.id, fieldUpdates)
        console.log('更新成果详情响应:', response)
        
        if (response && response.code === 200) {
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
          
          // 触发编辑事件，通知父组件
          this.$emit('file-edited', this.viewingFile)
          
          // 切回只读模式
          this.isEditingDescription = false
          
          alert('成果详细描述已更新')
        } else {
          throw new Error(response.msg || '更新失败')
        }
      } catch (error) {
        console.error('保存成果详情失败:', error)
        alert('保存失败: ' + (error.message || '请重试'))
      }
    },
    
    // 取消编辑模式
    cancelEditMode() {
      this.isEditingDescription = false
      this.resetEditForm()
    },
    
    // 显示添加文件对话框
    showAddFileDialog() {
      // 检查 viewingFile 是否存在
      if (!this.viewingFile || !this.viewingFile.id) {
        console.error('无法添加文件：viewingFile 不存在或没有 id')
        alert('无法添加文件：成果信息不完整')
        return
      }
      
      // 设置添加文件到现有成果的状态
      this.isAddingToExisting = true
      this.targetAchievementId = this.viewingFile.id
      
      // 自动设置文件类型为成果的类型（如果成果有类型）
      if (this.viewingFile.type) {
        this.currentFileType = this.viewingFile.type
        this.fileAccept = getFileAccept(this.viewingFile.type)
        console.log('自动设置文件类型为成果类型:', {
          achievementType: this.viewingFile.type,
          currentFileType: this.currentFileType
        })
      }
      
      console.log('准备为现有成果添加文件:', {
        achievementId: this.viewingFile.id,
        achievementName: this.viewingFile.name,
        achievementType: this.viewingFile.type,
        currentFileType: this.currentFileType,
        isAddingToExisting: this.isAddingToExisting
      })
      
      // 打开上传对话框，让用户选择文件
      this.showUploadDialog = true
      // 重置表单，但保留 isAddingToExisting 和 targetAchievementId
      this.achievementForm = {
        name: '',
        type: '',
        description: '',
        files: [],
        isPublic: false
      }
      // 锁定背景滚动
      this.$nextTick(() => {
        this.lockBodyScroll()
      })
    },
    
    // 为现有成果添加文件
    async addFilesToExistingAchievement(files) {
      if (!this.checkNotArchived('为成果添加文件')) {
        return
      }
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
    
    
    // 打开删除成果确认弹窗
    deleteFile(file) {
      this.fileToDelete = file
      this.deleteConfirmOpen = true
    },
    // 取消删除成果
    cancelDeleteFile() {
      this.deleteConfirmOpen = false
      this.fileToDelete = null
    },
    // 确认删除成果
    async confirmDeleteFile() {
      if (!this.fileToDelete) {
        this.cancelDeleteFile()
        return
      }
      const file = this.fileToDelete
      try {
        console.log('删除成果, ID:', file.id, '名称:', file.name)
          
          // 调用后端API删除成果
          const response = await knowledgeAPI.deleteAchievement(file.id)
          console.log('删除成果响应:', response)
          console.log('响应类型:', typeof response)
          console.log('响应码:', response?.code)
          console.log('响应消息:', response?.msg)
          
          // 检查多种可能的成功响应格式
          const isSuccess = response && (
            response.code === 200 || 
            response.code === '200' || 
            response.status === 200 ||
            response.status === 'success' ||
            (response.data !== undefined && response.code !== 500)
          )
          
          if (isSuccess) {
            console.log('✅ 删除成功，重新加载数据')
            
            // 如果当前页删除后没有数据了，跳转到上一页
            const currentPageItems = this.paginatedFiles.length
            if (currentPageItems === 1 && this.currentPage > 1) {
              this.currentPage = this.currentPage - 1
              console.log('✅ 当前页将无数据，先跳转到上一页:', this.currentPage)
            }
            
            // 重新从后端加载数据，确保数据一致性
            await this.loadAchievements()
            
            // 如果处于搜索状态，重新执行搜索
            if (this.isSearching && this.searchText.trim()) {
              await this.performSearch()
            }
            
            // 触发删除事件，通知父组件
            this.$emit('file-deleted', file)
            
            // 确保在下一个tick中强制更新视图，保证DOM更新完成
            await this.$nextTick()
            this.$forceUpdate()
            
            console.log('✅ 视图更新完成，当前列表数量:', this.uploadedFiles.length)
            console.log('✅ 当前页数据:', this.paginatedFiles)
            
            this.showSuccessToast('成果删除成功！')
            this.cancelDeleteFile()
          } else {
            const errorMsg = response?.msg || response?.message || '删除失败，服务器返回异常'
            console.error('❌ 删除失败:', errorMsg)
            this.cancelDeleteFile()
            alert('删除失败: ' + errorMsg)
          }
        } catch (error) {
          console.error('❌ 删除成果异常:', error)
          console.error('错误详情:', {
            message: error.message,
            response: error.response,
            stack: error.stack
          })
          this.cancelDeleteFile()
          alert('删除失败: ' + (error.message || error.toString() || '请重试'))
        }
    },
    
    // 多文件相关方法
    selectFile(index) {
      this.selectedFileIndex = index
    },
    
    viewSingleFile(file) {
      // 已改为使用previewFile方法
      this.previewFile(file)
    },
    
    // 文件预览功能
    async previewFile(file) {
      try {
        console.log('📄 [预览] 开始预览文件:', file)
        this.previewingFile = file
        this.showFilePreviewDialog = true
        this.previewLoading = true
        this.previewError = null
        this.previewFileUrl = null
        this.previewFileContent = ''
        
        // 确定文件类型
        const fileExtension = getFileExtension(file.name || file.originalFileName || '').toLowerCase()
        const mimeType = file.type || getMimeType(fileExtension)
        
        console.log('📄 [预览] 文件信息:', {
          name: file.name || file.originalFileName,
          extension: fileExtension,
          mimeType: mimeType,
          size: file.size
        })
        
        // 判断文件类型（增强版，支持更多文件类型预览）
        if (this.isPdfFile(fileExtension, mimeType)) {
          this.previewFileType = 'pdf'
          console.log('🔍 [预览] 识别为 PDF 文件')
          // PDF 使用浏览器原生预览
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        } else if (this.isOfficeFile(fileExtension, mimeType)) {
          // Office 文档统一走在线查看器（例如 doc/docx/xls/ppt 等），以尽量保留原始排版 / 表格 / 字体
          this.previewFileType = 'office'
          console.log('🔍 [预览] 识别为 Office 文件，默认使用 Microsoft Office Online 进行预览')
          this.useOnlineViewer = true
          // 默认优先使用 Microsoft Viewer（效果最接近本地 Word），Google 作为备用
          this.useMicrosoftViewer = true
        } else if (this.isImageFile(fileExtension, mimeType)) {
          this.previewFileType = 'image'
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        } else if (this.isMarkdownFile(fileExtension, mimeType)) {
          // Markdown：前端拉取并渲染为HTML
          this.previewFileType = 'markdown'
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        } else if (this.isCodeFile(fileExtension, mimeType)) {
          // 代码文件：使用语法高亮
          this.previewFileType = 'code'
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        } else if (this.isTextFile(fileExtension, mimeType)) {
          // 纯文本：前端拉取渲染，失败再回退iframe
          this.previewFileType = 'text'
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        } else if (this.isVideoFile(fileExtension, mimeType)) {
          this.previewFileType = 'video'
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        } else if (this.isAudioFile(fileExtension, mimeType)) {
          this.previewFileType = 'audio'
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        } else if (this.isOfficeFile(fileExtension, mimeType)) {
          // 兜底逻辑：再次识别为 Office 时同样使用在线查看器
          this.previewFileType = 'office'
          this.useOnlineViewer = true
          this.useMicrosoftViewer = false
        } else {
          // 未知类型，尝试作为文本预览
          this.previewFileType = 'text'
          this.useOnlineViewer = false
          this.useMicrosoftViewer = false
        }
        
        // 获取文件访问URL
        let fileUrl = file.downloadUrl || file.accessUrl
        
        if (!fileUrl && file.id) {
          // 如果没有URL，从后端获取
          console.log('📄 [预览] 获取文件下载URL, fileId:', file.id)
          try {
            const urlResponse = await knowledgeAPI.getFileDownloadUrl(String(file.id))
            console.log('📄 [预览] URL响应:', urlResponse)
            
            if (urlResponse && urlResponse.code === 200 && urlResponse.data) {
              fileUrl = urlResponse.data
              if (typeof fileUrl === 'object') {
                fileUrl = fileUrl.url || fileUrl.downloadUrl || fileUrl.accessUrl
              }
            }
          } catch (urlError) {
            console.error('📄 [预览] 获取URL失败:', urlError)
            throw new Error('无法获取文件访问地址')
          }
        }
        
        if (!fileUrl) {
          throw new Error('文件访问地址不可用')
        }
        
        console.log('📄 [预览] 文件URL:', fileUrl)
        this.previewFileUrl = fileUrl

        // 文本 / Markdown / 代码 / PDF 需要预加载内容
        if (this.previewFileType === 'markdown') {
          await this.loadMarkdownForPreview(fileUrl)
        } else if (this.previewFileType === 'code') {
          await this.loadCodeContentForPreview(fileUrl, fileExtension)
        } else if (this.previewFileType === 'text') {
          await this.loadTextContentForPreview(fileUrl)
        } else if (this.previewFileType === 'pdf') {
          // 等待 DOM 切换到 PDF 预览分支（canvas 挂载完成）后再渲染第一页
          await this.$nextTick()
          await this.loadPdfForPreview(fileUrl)
        } else if (this.previewingFile === 'office') {
          console.log(`🔍 [预览] Office 文件将通过在线查看器加载`)
        }
        
        this.previewLoading = false
        this.lockBodyScroll()
      } catch (error) {
        console.error('📄 [预览] 预览失败:', error)
        this.previewLoading = false
        this.previewError = error.message || '预览文件失败，请重试'
      }
    },
    
    // 判断是否为图片文件
    isImageFile(extension, mimeType) {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif']
      const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/tiff']
      return imageExtensions.includes(extension) || imageMimeTypes.some(mt => mimeType && mimeType.includes(mt))
    },
    
    // 判断是否为PDF文件
    isPdfFile(extension, mimeType) {
      return extension === 'pdf' || (mimeType && mimeType.includes('pdf'))
    },
    
    // 判断是否为文本文件
    isTextFile(extension, mimeType) {
      const textExtensions = ['txt', 'log', 'csv']
      const textMimeTypes = ['text/plain', 'text/csv']
      return textExtensions.includes(extension) || textMimeTypes.some(mt => mimeType && mimeType.includes(mt))
    },
    
    // 判断是否为Markdown文件
    isMarkdownFile(extension, mimeType) {
      return extension === 'md' || (mimeType && mimeType.includes('text/markdown'))
    },
    
    // 判断是否为视频文件
    isVideoFile(extension, mimeType) {
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp']
      const videoMimeTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm']
      return videoExtensions.includes(extension) || (mimeType && mimeType.startsWith('video/'))
    },
    
    // 判断是否为音频文件
    isAudioFile(extension, mimeType) {
      const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma']
      const audioMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/aac']
      return audioExtensions.includes(extension) || (mimeType && mimeType.startsWith('audio/'))
    },
    
    // 判断是否为Office文件
    isOfficeFile(extension, mimeType) {
      const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp']
      const officeMimeTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
      return officeExtensions.includes(extension) || officeMimeTypes.some(mt => mimeType && mimeType.includes(mt))
    },
    
    // 判断是否为代码文件
    isCodeFile(extension, mimeType) {
      const codeExtensions = [
        'js', 'jsx', 'ts', 'tsx', 'vue', 'html', 'css', 'scss', 'less', 'json', 'xml',
        'java', 'py', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
        'sql', 'sh', 'bash', 'yaml', 'yml', 'toml', 'ini', 'conf', 'properties'
      ]
      return codeExtensions.includes(extension)
    },
    
    // 加载文本内容用于预览
    async loadTextContentForPreview(url) {
      try {
        console.log('📄 [预览] 加载文本内容:', url)
        const token = localStorage.getItem('access_token')
        const headers = { 'Accept': 'text/plain, text/html, text/css, text/javascript, application/json, */*' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(url, { method: 'GET', headers, credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        // 优先使用二进制 + 多编码解码，避免中文出现乱码（涵盖 UTF-8/UTF-16/GBK/GB18030/Big5）
        const buf = await res.arrayBuffer()
        const contentType = (res.headers.get('content-type') || '').toLowerCase()

        const tryDecode = (enc) => {
          try {
            // 某些浏览器不支持部分编码，捕获异常
            const dec = new TextDecoder(enc)
            return dec.decode(buf)
          } catch (_) {
            return null
          }
        }

        let candidates = []
        // 根据响应头的charset优先解码
        const charsetMatch = contentType.match(/charset=([^;]+)/)
        if (charsetMatch) {
          const byHeader = tryDecode(charsetMatch[1].trim())
          if (byHeader) candidates.push(byHeader)
        }

        // BOM 检测
        const bytes = new Uint8Array(buf)
        const hasUtf8Bom = bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF
        const hasUtf16LEBom = bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE
        const hasUtf16BEBom = bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF
        if (hasUtf8Bom) { const s = tryDecode('utf-8'); if (s) candidates.push(s) }
        if (hasUtf16LEBom) { const s = tryDecode('utf-16le'); if (s) candidates.push(s) }
        if (hasUtf16BEBom) { const s = tryDecode('utf-16be'); if (s) candidates.push(s) }

        // 常见中文编码依次尝试（以及 UTF-16）
        const utf8 = tryDecode('utf-8'); if (utf8 && !hasUtf8Bom) candidates.push(utf8)
        const utf16le = tryDecode('utf-16le'); if (utf16le && !hasUtf16LEBom) candidates.push(utf16le)
        const utf16be = tryDecode('utf-16be'); if (utf16be && !hasUtf16BEBom) candidates.push(utf16be)
        const gb18030 = tryDecode('gb18030'); if (gb18030) candidates.push(gb18030)
        const gbk = tryDecode('gbk'); if (gbk) candidates.push(gbk)
        const big5 = tryDecode('big5'); if (big5) candidates.push(big5)

        // 选出“�”最少的结果
        let best = candidates[0] || ''
        let bestScore = (best.match(/�/g) || []).length
        for (let i = 1; i < candidates.length; i++) {
          const s = candidates[i]
          const score = (s.match(/�/g) || []).length
          if (score < bestScore) {
            best = s; bestScore = score
          }
        }

        // 如果还是大量乱码，回退到 iframe 直开
        if (!best || bestScore > (best.length / 50)) {
          console.warn('📄 [预览] 文本乱码较多，回退为 iframe 打开')
          this.previewFileType = 'text_iframe'
          this.previewError = null
          this.previewFileContent = ''
          return
        }

        this.previewFileContent = best
        console.log('📄 [预览] 文本内容加载成功，长度:', best.length, '乱码数:', bestScore)
      } catch (error) {
        console.error('📄 [预览] 加载文本内容失败:', error)
        // 文本失败时回退 iframe 直接打开
        this.previewFileType = 'text_iframe'
        this.previewError = null
      }
    },
    
    // 加载Markdown并渲染为HTML
    async loadMarkdownForPreview(url) {
      try {
        console.log('📄 [预览] 加载Markdown:', url)
        const token = localStorage.getItem('access_token')
        const headers = { 'Accept': 'text/markdown, text/plain, */*' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(url, { method: 'GET', headers, credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const md = await res.text()
        this.previewMarkdownHtml = marked.parse(md || '')
        console.log('📄 [预览] Markdown渲染完成，长度:', md.length)
      } catch (e) {
        console.error('📄 [预览] Markdown加载失败，回退为纯文本:', e)
        // 回退为纯文本模式
        this.previewFileType = 'text'
        await this.loadTextContentForPreview(url)
      }
    },

    // 加载 PDF 内容并使用 pdf.js 渲染到 canvas
    async loadPdfForPreview(url) {
      try {
        console.log('📄 [预览] 加载 PDF 内容用于在线预览:', url)
        const token = localStorage.getItem('access_token')
        const headers = { 'Accept': 'application/pdf,*/*' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(url, { method: 'GET', headers, credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        const arrayBuffer = await res.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        const pdfjsLib = window.pdfjsLib
        if (!pdfjsLib || !pdfjsLib.getDocument) {
          console.warn('📄 [预览] pdf.js 未就绪，无法解析 PDF')
          this.previewError = '当前环境暂不支持 PDF 在线预览，请尝试下载后查看'
          return
        }

        // 配置 worker
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
        }

        const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
        const pdf = await loadingTask.promise
        this.pdfDoc = pdf
        this.pdfTotalPages = pdf.numPages || 1
        this.pdfPage = 1
        this.pdfScale = 1.0

        // 首次渲染当前页
        await this.renderPdfPage(this.pdfPage)
        // 再异步触发一次渲染，避免某些浏览器首次进入时出现空白的问题
        setTimeout(() => {
          this.renderPdfPage(this.pdfPage)
        }, 50)
        console.log('📄 [预览] PDF 加载并渲染成功，页数:', this.pdfTotalPages)
      } catch (error) {
        console.error('📄 [预览] PDF 在线预览失败:', error)
        this.previewError = '无法在线预览该 PDF 文档，请尝试下载后查看'
      }
    },

    async renderPdfPage(pageNumber) {
      if (!this.pdfDoc) return
      try {
        const page = await this.pdfDoc.getPage(pageNumber)
        const viewport = page.getViewport({ scale: this.pdfScale })
        const canvas = this.$refs.pdfCanvas
        if (!canvas) return
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport
        }

        await page.render(renderContext).promise
      } catch (e) {
        console.error('📄 [预览] 渲染 PDF 页面失败:', e)
        this.previewError = '渲染 PDF 页面失败'
      }
    },

    async renderPrevPdfPage() {
      if (!this.pdfDoc || this.pdfPage <= 1) return
      this.pdfPage -= 1
      await this.renderPdfPage(this.pdfPage)
    },

    async renderNextPdfPage() {
      if (!this.pdfDoc || this.pdfPage >= this.pdfTotalPages) return
      this.pdfPage += 1
      await this.renderPdfPage(this.pdfPage)
    },

    async zoomInPdf() {
      if (!this.pdfDoc) return
      this.pdfScale = Math.min(this.pdfScale + 0.1, 2)
      await this.renderPdfPage(this.pdfPage)
    },

    async zoomOutPdf() {
      if (!this.pdfDoc) return
      this.pdfScale = Math.max(this.pdfScale - 0.1, 0.5)
      await this.renderPdfPage(this.pdfPage)
    },
    
    // 加载代码内容并应用语法高亮
    async loadCodeContentForPreview(url, extension) {
      try {
        console.log('📄 [预览] 加载代码内容:', url, '扩展名:', extension)
        const token = localStorage.getItem('access_token')
        const headers = { 'Accept': 'text/plain, text/html, text/css, text/javascript, application/json, */*' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        
        const res = await fetch(url, { method: 'GET', headers, credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        
        // 使用二进制 + 多编码解码，避免中文出现乱码
        const buf = await res.arrayBuffer()
        const contentType = (res.headers.get('content-type') || '').toLowerCase()
        
        const tryDecode = (enc) => {
          try {
            const dec = new TextDecoder(enc)
            return dec.decode(buf)
          } catch (_) {
            return null
          }
        }
        
        let candidates = []
        // 根据响应头的charset优先解码
        const charsetMatch = contentType.match(/charset=([^;]+)/)
        if (charsetMatch) {
          const byHeader = tryDecode(charsetMatch[1].trim())
          if (byHeader) candidates.push(byHeader)
        }
        
        // BOM 检测
        const bytes = new Uint8Array(buf)
        const hasUtf8Bom = bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF
        if (hasUtf8Bom) { const s = tryDecode('utf-8'); if (s) candidates.push(s) }
        
        // 常见编码依次尝试
        const utf8 = tryDecode('utf-8'); if (utf8 && !hasUtf8Bom) candidates.push(utf8)
        const gb18030 = tryDecode('gb18030'); if (gb18030) candidates.push(gb18030)
        const gbk = tryDecode('gbk'); if (gbk) candidates.push(gbk)
        
        // 选出乱码最少的结果（使用替换字符 \uFFFD）
        let best = candidates[0] || ''
        let bestScore = (best.match(/\uFFFD/g) || []).length
        for (let i = 1; i < candidates.length; i++) {
          const s = candidates[i]
          const score = (s.match(/\uFFFD/g) || []).length
          if (score < bestScore) {
            best = s; bestScore = score
          }
        }
        
        this.previewFileContent = best
        
        // 根据文件扩展名确定语言类型
        const langMap = {
          'java': 'java',
          'py': 'python',
          'c': 'c',
          'cpp': 'cpp',
          'h': 'c',
          'js': 'javascript',
          'jsx': 'javascript',
          'ts': 'typescript',
          'tsx': 'typescript',
          'vue': 'vue',
          'html': 'html',
          'css': 'css',
          'scss': 'scss',
          'less': 'less',
          'json': 'json',
          'xml': 'xml',
          'php': 'php',
          'rb': 'ruby',
          'go': 'go',
          'rs': 'rust',
          'swift': 'swift',
          'kt': 'kotlin',
          'sql': 'sql',
          'sh': 'bash',
          'bash': 'bash',
          'yaml': 'yaml',
          'yml': 'yaml',
          'toml': 'toml',
          'ini': 'ini',
          'conf': 'ini',
          'properties': 'properties'
        }
        
        const language = langMap[extension] || extension || 'plaintext'
        
        // 使用 highlight.js 进行语法高亮
        try {
          if (hljs.getLanguage(language)) {
            this.highlightedCode = hljs.highlight(best, { language: language }).value
          } else {
            // 如果语言不支持，尝试自动检测
            this.highlightedCode = hljs.highlightAuto(best).value
          }
        } catch (e) {
          console.warn('📄 [预览] 代码高亮失败，使用纯文本:', e)
          // 如果高亮失败，转义HTML并显示纯文本
          this.highlightedCode = escapeHtml(best)
        }
        
        console.log('📄 [预览] 代码内容加载成功，长度:', best.length, '语言:', language)
      } catch (error) {
        console.error('📄 [预览] 加载代码内容失败:', error)
        throw error
      }
    },
    
    // 获取Google Docs Viewer URL
    getGoogleDocsViewerUrl(fileUrl) {
      // 这里直接把 COS 预签名 URL 交给 Google Docs Viewer，
      // 不再通过后端 `/download-url` 代理（那个接口返回的是 JSON 而不是文件本身，会导致预览失败）
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
    },
    
    // 获取Microsoft Office Online Viewer URL
    getMicrosoftViewerUrl(fileUrl) {
      // 同样直接使用 COS 预签名 URL，让 Microsoft Office Online 直接拉取文件进行渲染
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
    },
    
    // 处理Office iframe加载成功
    handleOfficeIframeLoad() {
      console.log('📄 [预览] Office文件iframe加载成功')
      this.officeIframeLoaded = true
      this.officeViewerError = false
    },
    
    // 处理Office iframe加载错误
    handleOfficeIframeError() {
      console.warn('📄 [预览] Office文件直接加载失败，尝试在线查看器')
      // 如果直接加载失败，尝试使用在线查看器
      this.useOnlineViewer = true
      this.officeViewerError = false
      // 延迟一下再显示，给在线查看器一些时间加载
      setTimeout(() => {
        if (!this.officeIframeLoaded) {
          this.officeViewerError = true
        }
      }, 5000)
    },
    
    // 处理Office查看器错误
    handleOfficeViewerError() {
      console.warn('📄 [预览] 在线查看器加载失败')
      this.officeViewerError = true
    },
    
    // 尝试使用Microsoft查看器
    tryMicrosoftViewer() {
      this.useMicrosoftViewer = true
      this.officeViewerError = false
    },
    
    // 尝试直接加载文件
    tryDirectLoad() {
      this.useOnlineViewer = false
      this.useMicrosoftViewer = false
      this.officeViewerError = false
      this.officeIframeLoaded = false
    },
    
    // 关闭文件预览
    closeFilePreview() {
      this.showFilePreviewDialog = false
      this.previewingFile = null
      this.previewFileUrl = null
      this.previewFileContent = ''
      this.previewFileType = 'unknown'
      this.previewLoading = false
      this.previewError = null
      this.officeViewerError = false
      this.useMicrosoftViewer = false
      this.useOnlineViewer = false
      this.officeIframeLoaded = false
      this.unlockBodyScroll()
    },
    
    // 下载预览中的文件
    async downloadPreviewFile() {
      if (this.previewingFile) {
        await this.downloadSingleFile(this.previewingFile)
      }
    },
    
    // 重试预览
    retryPreview() {
      if (this.previewingFile) {
        this.previewFile(this.previewingFile)
      }
    },
    
    // 处理预览错误
    handlePreviewError(event) {
      console.error('📄 [预览] 预览错误:', event)
      this.previewError = '文件加载失败，请检查文件是否可访问'
      this.previewLoading = false
    },
    
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
    
    async deleteSingleFile(file, index) {
      const fileName = file.name || file.originalFileName || '未知文件'
      if (confirm(`确定要删除文件"${fileName}"吗？`)) {
        try {
          console.log('删除单个文件, fileId:', file.id, '文件名:', fileName)
          
          // 调用后端API删除文件
          const response = await knowledgeAPI.deleteFile(file.id)
          console.log('删除文件响应:', response)
          
          // 检查响应是否成功
          const isSuccess = response && (
            response.code === 200 || 
            response.code === '200' || 
            response.status === 200
          )
          
          if (isSuccess) {
            console.log('✅ 文件删除成功')
            
            // 从当前查看的成果文件列表中删除
            this.viewingFile.files.splice(index, 1)
            this.viewingFile.fileCount = this.viewingFile.files.length
            
            // 重新选择文件（如果删除的是当前选中的文件）
            if (this.selectedFileIndex === index) {
              this.selectedFileIndex = Math.max(0, index - 1)
            } else if (this.selectedFileIndex > index) {
              this.selectedFileIndex = this.selectedFileIndex - 1
            }
            
            // 重新加载成果列表以保持数据同步
            await this.loadAchievements()
            
            // 如果当前正在查看这个成果，需要更新文件列表
            if (this.showViewDialog && this.viewingFile && this.viewingFile.id) {
              // 重新获取文件列表
              const filesResponse = await knowledgeAPI.getAchievementFiles(this.viewingFile.id)
              if (filesResponse && filesResponse.code === 200 && filesResponse.data) {
                // 更新 viewingFile 的文件列表
                const newFiles = filesResponse.data.map(fileDto => ({
                  id: fileDto.id,
                  name: fileDto.fileName,
                  originalFileName: fileDto.originalFileName,
                  type: fileDto.mimeType,
                  size: fileDto.fileSize,
                  uploadTime: fileDto.uploadedAt,
                  downloadUrl: fileDto.downloadUrl || fileDto.accessUrl
                }))
                this.viewingFile.files = newFiles
                this.viewingFile.fileCount = newFiles.length
                console.log('文件列表已更新，剩余', newFiles.length, '个文件')
              }
            }
            
            this.showSuccessToast('文件删除成功！')
          } else {
            throw new Error(response?.msg || '删除文件失败')
          }
        } catch (error) {
          console.error('❌ 删除文件失败:', error)
          alert('删除文件失败: ' + (error.message || '请重试'))
        }
      }
    },
    
    // 下载文件（包装工具函数，支持从后端获取文件）
    async downloadFile(achievement) {
      try {
        console.log('📥 [下载] 开始下载成果文件')
        console.log('📥 [下载] 成果ID:', achievement.id)
        console.log('📥 [下载] 成果名称:', achievement.name)
        
        // 1. 获取文件列表
        const filesResponse = await knowledgeAPI.getAchievementFiles(achievement.id)
        console.log('📥 [下载] 文件列表响应:', filesResponse)
        
        if (!filesResponse || filesResponse.code !== 200) {
          throw new Error(filesResponse?.msg || '获取文件列表失败')
        }
        
        // 2. 解析文件列表
        let fileList = []
          if (Array.isArray(filesResponse.data)) {
            fileList = filesResponse.data
          } else if (filesResponse.data && Array.isArray(filesResponse.data.content)) {
            fileList = filesResponse.data.content
          }
        
        if (fileList.length === 0) {
          alert('该成果暂无可下载的文件')
          return
        }
        
        console.log('📥 [下载] 文件列表:', fileList.length, '个文件')
        console.log('📥 [下载] 文件列表详情:', fileList)
        
        // 3. 为每个文件获取下载URL并立即下载
        let successCount = 0
        let failCount = 0
        
        for (let i = 0; i < fileList.length; i++) {
          const fileDto = fileList[i]
          
          try {
            console.log(`📥 [下载] 处理文件 ${i + 1}/${fileList.length}:`, fileDto.fileName)
            console.log(`📥 [下载] 文件对象详情:`, fileDto)
            
            // 获取下载URL - 关键修复：确保fileId是字符串格式
            const fileId = String(fileDto.id)
            console.log(`📥 [下载] 准备获取下载URL`)
            console.log(`📥 [下载] - fileId:`, fileId, '(类型:', typeof fileId, ')')
            console.log(`📥 [下载] - fileName:`, fileDto.fileName)
            
            const urlResponse = await knowledgeAPI.getFileDownloadUrl(fileId)
            console.log(`📥 [下载] API响应:`, urlResponse)
            console.log(`📥 [下载] 响应码:`, urlResponse?.code)
            console.log(`📥 [下载] 响应数据:`, urlResponse?.data)
            console.log(`📥 [下载] 响应消息:`, urlResponse?.msg)
            
            if (!urlResponse) {
              throw new Error('API响应为空')
            }
            
            if (urlResponse.code !== 200) {
              throw new Error(`API返回错误: ${urlResponse.msg || urlResponse.code}`)
            }
            
            if (!urlResponse.data) {
              throw new Error('响应数据为空')
            }
            
            // 提取下载URL
            let downloadUrl = urlResponse.data
            if (typeof downloadUrl === 'object') {
              downloadUrl = downloadUrl.url || downloadUrl.downloadUrl || downloadUrl.accessUrl
            }
            
            if (!downloadUrl || typeof downloadUrl !== 'string') {
              console.error('❌ [下载] 无效的下载URL:', downloadUrl)
              throw new Error('下载URL无效')
            }
            
            console.log(`📥 [下载] 下载URL:`, downloadUrl)
            
            // 立即触发下载
            const fileName = fileDto.fileName || fileDto.originalFileName || `文件${i + 1}`
            this.triggerDownload(downloadUrl, fileName)
            
            successCount++
            console.log(`✅ [下载] 文件下载触发成功: ${fileName}`)
            
            // 延迟避免浏览器阻止多文件下载
            if (i < fileList.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
            
          } catch (error) {
            failCount++
            console.error(`❌ [下载] 文件下载失败:`, fileDto.fileName)
            console.error(`❌ [下载] 错误详情:`, error)
            console.error(`❌ [下载] 错误消息:`, error.message)
            console.error(`❌ [下载] 错误堆栈:`, error.stack)
            
            // 显示第一个文件的错误详情
            if (i === 0) {
              alert(`下载失败: ${error.message}\n文件: ${fileDto.fileName}\n\n请查看控制台获取详细信息`)
            }
            // 继续下载其他文件
          }
        }
        
        console.log(`📥 [下载] 下载完成统计: 成功 ${successCount} 个, 失败 ${failCount} 个`)
        
        if (fileList.length > 1) {
          alert(`已触发下载 ${fileList.length} 个文件，请在浏览器下载栏查看`)
        }
        
      } catch (error) {
        console.error('❌ [下载] 下载失败:', error)
        
        // 检查是否是认证错误
        if (error.response && error.response.status === 401) {
          alert('登录已过期，请重新登录')
          this.$router.push('/login')
        } else if (error.code === 401 || error.msg?.includes('登录')) {
          alert('登录已过期，请重新登录')
          this.$router.push('/login')
        } else {
          alert('下载失败: ' + (error.message || error.msg || '请重试'))
        }
      }
    },
    
    // 触发浏览器下载
    triggerDownload(url, filename) {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'  // 在新标签页打开，避免导航
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      
      // 延迟移除元素，确保下载已触发
      setTimeout(() => {
        document.body.removeChild(a)
      }, 100)
    },
    
    // 下载单个文件
    async downloadSingleFile(file) {
      try {
        console.log('📥 [单文件下载] ============ 开始 ============')
        console.log('📥 [单文件下载] 文件对象:', file)
        console.log('📥 [单文件下载] 文件名:', file.name || file.fileName)
        console.log('📥 [单文件下载] 文件ID:', file.id, '类型:', typeof file.id)
        
        // 如果文件对象已有downloadUrl，直接使用
        if (file.downloadUrl) {
          console.log('📥 [单文件下载] 使用已有的downloadUrl:', file.downloadUrl)
          this.triggerDownload(file.downloadUrl, file.name || file.fileName || '下载文件')
          return
        }
        
        // 否则，获取下载URL
        const fileId = String(file.id)
        console.log('📥 [单文件下载] 准备调用API')
        console.log('📥 [单文件下载] - 转换后fileId:', fileId, '类型:', typeof fileId)
        console.log('📥 [单文件下载] - API路径:', `/zhiyan/achievement/file/${fileId}/download-url`)
        
        try {
          const urlResponse = await knowledgeAPI.getFileDownloadUrl(fileId)
          console.log('📥 [单文件下载] ✅ API调用成功')
          console.log('📥 [单文件下载] 完整响应:', JSON.stringify(urlResponse, null, 2))
          console.log('📥 [单文件下载] 响应码:', urlResponse?.code)
          console.log('📥 [单文件下载] 响应消息:', urlResponse?.msg)
          console.log('📥 [单文件下载] 响应数据:', urlResponse?.data)
          console.log('📥 [单文件下载] 响应数据类型:', typeof urlResponse?.data)
          
          if (!urlResponse) {
            throw new Error('API返回undefined或null')
          }
          
          if (urlResponse.code !== 200) {
            throw new Error(`API错误: ${urlResponse.msg || urlResponse.code}`)
          }
          
          if (!urlResponse.data) {
            throw new Error('响应data字段为空')
          }
          
          // 提取下载URL
          let downloadUrl = urlResponse.data
          if (typeof downloadUrl === 'object') {
            console.log('📥 [单文件下载] data是对象，尝试提取URL')
            downloadUrl = downloadUrl.url || downloadUrl.downloadUrl || downloadUrl.accessUrl
            console.log('📥 [单文件下载] 提取后的URL:', downloadUrl)
          }
          
          if (!downloadUrl || typeof downloadUrl !== 'string') {
            console.error('❌ [单文件下载] 无效的URL:', downloadUrl, '类型:', typeof downloadUrl)
            throw new Error('下载URL无效或不是字符串')
          }
          
          console.log('📥 [单文件下载] 最终下载URL:', downloadUrl)
          
          const fileName = file.name || file.fileName || file.originalFileName || '下载文件'
          this.triggerDownload(downloadUrl, fileName)
          
          console.log('✅ [单文件下载] ============ 成功 ============')
          
        } catch (apiError) {
          console.error('❌ [单文件下载] API调用异常')
          console.error('❌ [单文件下载] 错误对象:', apiError)
          console.error('❌ [单文件下载] 错误消息:', apiError.message)
          console.error('❌ [单文件下载] 错误响应:', apiError.response)
          console.error('❌ [单文件下载] 错误堆栈:', apiError.stack)
          throw apiError
        }
        
      } catch (error) {
        console.error('❌ [单文件下载] ============ 失败 ============')
        console.error('❌ [单文件下载] 最终错误:', error)
        
        // 检查是否是认证错误
        if (error.response && error.response.status === 401) {
          alert('登录已过期，请重新登录')
          this.$router.push('/login')
        } else if (error.code === 401 || error.msg?.includes('登录')) {
          alert('登录已过期，请重新登录')
          this.$router.push('/login')
        } else {
          alert(`下载失败: ${error.message || error.msg || '未知错误'}\n\n请按F12查看控制台获取详细信息`)
        }
      }
    },
    
    // 下载所有文件（批量下载的快捷方法）
    async downloadAllFiles(achievement) {
      // 直接调用downloadFile方法，它已经支持多文件下载
      await this.downloadFile(achievement)
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
    getFileTypeDisplay(mimeType, fileName) {
      return getFileTypeDisplay(mimeType, fileName)
    },
    
    // 格式化文件大小（包装工具函数）
    formatFileSize(bytes) {
      return formatFileSize(bytes)
    },
    
    // 处理成果状态变更
    async handleStatusChange() {
      if (!this.viewingFile || !this.viewingFile.id) {
        return
      }
      
      try {
        console.log('更新成果状态:', {
          achievementId: this.viewingFile.id,
          newStatus: this.viewingFile.status
        })
        
        // 调用后端API更新状态
        const response = await knowledgeAPI.updateAchievementStatus(
          this.viewingFile.id,
          this.viewingFile.status
        )
        
        console.log('状态更新响应:', response)
        
        if (response && response.code === 200) {
          // 更新本地列表中的状态
          const uploadedIndex = this.uploadedFiles.findIndex(item => item.id === this.viewingFile.id)
          if (uploadedIndex !== -1) {
            this.uploadedFiles[uploadedIndex].status = this.viewingFile.status
          }
          
          // 如果处于搜索状态，也更新搜索结果
          if (this.isSearching) {
            const searchIndex = this.searchResults.findIndex(item => item.id === this.viewingFile.id)
            if (searchIndex !== -1) {
              this.searchResults[searchIndex].status = this.viewingFile.status
            }
          }
          
          alert('成果状态已更新为：' + STATUS_DISPLAY[this.viewingFile.status])
        } else {
          throw new Error(response.msg || '状态更新失败')
        }
      } catch (error) {
        console.error('更新成果状态失败:', error)
        alert('状态更新失败: ' + (error.message || '请重试'))
        
        // 恢复原状态（从列表中获取）
        const original = this.uploadedFiles.find(item => item.id === this.viewingFile.id)
        if (original) {
          this.viewingFile.status = original.status
        }
      }
    },
    
    // 获取成果详情（完整信息）
    async fetchAchievementDetail(achievementId) {
      try {
        console.log('获取成果详情:', achievementId)
        
        const response = await knowledgeAPI.getAchievementDetail(achievementId)
        console.log('成果详情响应:', response)
        
        if (response && response.code === 200 && response.data) {
          return convertFromDTO(response.data)
        } else {
          throw new Error(response.msg || '获取详情失败')
        }
      } catch (error) {
        console.error('获取成果详情失败:', error)
        alert('获取详情失败: ' + (error.message || '请重试'))
        return null
      }
    },
    
    // 获取状态显示文本
    getStatusDisplay(status) {
      return STATUS_DISPLAY[status] || status
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      return STATUS_CLASS[status] || ''
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/catalog/main.css';
@import '@/assets/styles/catalog/dialog.css';
@import '@/assets/styles/catalog/panel.css';
@import '@/assets/styles/catalog/file-view.css';

/* 归档项目禁用按钮样式 */
.add-btn.disabled,
.add-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
  color: #e5e7eb !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
  transform: none !important;
}

.add-btn.disabled:hover,
.add-btn:disabled:hover {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 关联任务 & 删除确认弹窗样式（参考 AI 助手的文件选择弹窗） */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 与附件预览保持一致的最高层级，盖住成果详情和档案面板 */
  z-index: 12000;
}

.modal-content {
  /* 日间模式：整体使用白色背景 */
  background: #ffffff;
  border-radius: 20px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 520px;
  width: 88%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  margin: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 12px;
  /* 日间模式：头部也使用白色背景，仅保留底部分割线 */
  background: #ffffff;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.modal-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  /* 深色文字，适配白色背景 */
  color: #111827;
}

.modal-subtitle {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(241, 245, 249, 0.9);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: rotate(90deg) scale(1.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 24px 4px;
  /* 日间模式：内容区域白色背景 */
  background: #ffffff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  gap: 20px;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #0044CC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  gap: 16px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5EB6E4;
}

.empty-text {
  font-size: 15px;
  font-weight: 500;
  color: #94a3b8;
}

.file-list-container {
  padding: 8px 28px 24px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-card {
  background: #1e293b;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  min-height: 70px;
}

.file-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 68, 204, 0.03) 0%, rgba(94, 182, 228, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.25s;
}

.file-card:hover {
  border-color: #5EB6E4;
  transform: translateY(-2px);
  box-shadow:
    0 8px 16px -4px rgba(0, 68, 204, 0.15),
    0 0 0 1px rgba(94, 182, 228, 0.2);
}

.file-card:hover::before {
  opacity: 1;
}

.file-card.selected {
  border-color: #0044CC;
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2ff 100%);
  box-shadow:
    0 4px 12px -2px rgba(0, 68, 204, 0.2),
    0 0 0 1px rgba(0, 68, 204, 0.15);
}

.file-card.selected::before {
  opacity: 1;
}

.file-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.file-card-main {
  flex: 1;
  min-width: 0;
}

.file-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1.5;
  /* 默认允许换行，但不要对每个字符都强制换行 */
  white-space: normal;
}

.file-card.selected .file-name {
  color: #0044CC;
}

.file-badge-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.file-type-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  border: 1px solid rgba(30, 64, 175, 0.1);
}

.file-card.selected .file-type-badge {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  color: #1e3a8a;
  border-color: rgba(30, 64, 175, 0.2);
}

.file-count-badge {
  padding: 3px 8px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.file-select-indicator {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.file-select-indicator.active {
  background: linear-gradient(135deg, #0044CC 0%, #5EB6E4 100%);
  border-color: #0044CC;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
}

.checkmark-circle {
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 24px 18px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.modal-body p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

/* ================= 深色模式下的删除弹窗样式 ================= */
html.dark-mode .modal-content {
  background: #1e293b;
}

html.dark-mode .modal-header {
  background: linear-gradient(135deg, #1f2937 0%, #020617 100%);
  border-bottom-color: rgba(15, 23, 42, 0.9);
}

html.dark-mode .modal-title {
  color: #e5e7eb;
}

html.dark-mode .modal-body {
  background: #020617;
}

html.dark-mode .modal-body p {
  color: #e5e7eb;
}

html.dark-mode .modal-footer {
  background: linear-gradient(135deg, #020617 0%, #020617 100%);
  border-top-color: rgba(30, 64, 175, 0.6);
}

html.dark-mode .modal-footer .btn.btn-secondary,
html.dark-mode .modal-footer .btn.secondary {
  background: transparent;
  color: #e5e7eb;
  border-color: #4b5563;
}

html.dark-mode .modal-footer .btn.btn-secondary:hover,
html.dark-mode .modal-footer .btn.secondary:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: #9ca3af;
}

html.dark-mode .modal-footer .btn.btn-primary,
html.dark-mode .modal-footer .btn.primary {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

.modal-footer .btn {
  min-width: 96px;
  height: 38px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
}

.modal-footer .btn.btn-secondary,
.modal-footer .btn.secondary {
  background: #ffffff;
  color: #111827;
  border-color: #e5e7eb;
}

.modal-footer .btn.btn-secondary:hover,
.modal-footer .btn.secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.modal-footer .btn.btn-primary,
.modal-footer .btn.primary {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

.modal-footer .btn.btn-primary:hover,
.modal-footer .btn.primary:hover {
  background: #dc2626;
  border-color: #dc2626;
}

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

/* 黑夜模式下，文件查看弹窗顶部信息条强制使用深色背景 */
html.dark-mode .file-view-dialog .file-info {
  background: #020617 !important;
  color: #e5e7eb;
}

/* 成果档案表格：只控制“成果名”这一列的文字换行，不影响其他地方 */
.doc-table .filename {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-table .file-name {
  /* 普通文本样式 */
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  line-height: 1.5;
  /* 正常情况下单行显示，超出列宽时按单词/长串自动换行 */
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* 已关联任务标签样式（上传 & 查看 共用） */
.linked-tasks-list {
  margin-top: 8px;
}

.linked-tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.linked-tasks-header .clear-link {
  padding: 0;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #9ca3af;
  cursor: pointer;
}

.linked-tasks-header .clear-link:hover {
  color: #ef4444;
}

.linked-task-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  margin: 4px 4px 0 0;
  border-radius: 999px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  max-width: 100%;
}

.linked-task-item.small {
  padding: 3px 8px;
  margin: 3px 4px 0 0;
}

.task-main {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
}

.task-title-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
}

.task-title {
  font-size: 12px;
  font-weight: 500;
  color: #0f172a;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-id-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.task-meta {
  font-size: 11px;
  color: #64748b;
  margin-left: 4px;
}

.task-remove-btn {
  margin-left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #cbd5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  padding: 0;
  transition: all 0.15s ease;
}
  
.task-remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.detail-item-linked-tasks {
  align-items: flex-start;
}

.detail-linked-tasks {
  flex: 1;
}

/* 状态选择器样式 */
.status-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.status-selector label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.status-select {
  height: 36px;
  padding: 0 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.status-select:hover {
  border-color: #9ca3af;
}

.status-select:focus {
  outline: none;
  border-color: #5EB6E4;
  box-shadow: 0 0 0 2px rgba(94, 182, 228, 0.2);
  background-color: #1e293b;
}

/* ===== 暗黑模式下的成果状态选择器样式 ===== */
.dark-mode .status-selector label {
  color: #e5e7eb;
}

.dark-mode .status-select {
  background: #020617;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-mode .status-select option {
  background: #020617;
  color: #f9fafb;
}

/* ===== 白日模式下（非 dark-mode）强制使用浅色样式 ===== */
html:not(.dark-mode) .status-select {
  background: #ffffff !important;
  border-color: #e5e7eb !important;
  color: #111827 !important;
}

html:not(.dark-mode) .status-select option {
  background: #ffffff !important;
  color: #111827 !important;
}

/* 状态徽章样式（用于列表显示） */
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-draft {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.status-badge.status-review {
  background: #dbeafe;
  color: #1e3a8a;
  border: 1px solid #3b82f6;
}

.status-badge.status-published {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.status-badge.status-obsolete {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #9ca3af;
}

/* 文件预览对话框样式 */
.file-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  /* 层级最高：高于成果详情弹窗的 11000 */
  z-index: 12000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.file-preview-dialog {
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  max-height: 900px;
  background: #1e293b;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.file-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #334155;
  background: #1e293b;
  flex-shrink: 0;
  color: #ffffff;
}

.file-preview-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-preview-icon-small {
  display: flex;
  align-items: center;
  color: #6b7280;
  flex-shrink: 0;
}

.file-preview-name-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-preview-size-text {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: normal;
}

.file-preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-preview-download-btn,
.file-preview-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #e2e8f0;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.file-preview-download-btn:hover,
.file-preview-close-btn:hover {
  background: #334155;
  color: #ffffff;
}

.file-preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
  background: #1e293b;
  color: #ffffff;
}

/* 加载状态 */
.file-preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #ffffff;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.file-preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #dc2626;
  padding: 40px;
  text-align: center;
}

.file-preview-error svg {
  color: #dc2626;
}

/* 图片预览 */
.file-preview-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f9fafb;
  overflow: auto;
}

.file-preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* PDF预览 */
.file-preview-pdf-container {
  width: 100%;
  height: 100%;
  background: #1e293b;
}

.file-preview-pdf {
  width: 100%;
  height: 100%;
  border: none;
}

/* 文本预览 */
.file-preview-text-container {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow: auto;
  background: #1e293b;
  color: #ffffff;
}

.file-preview-text {
  margin: 0;
  padding: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #ffffff;
}

.file-preview-text code {
  font-family: inherit;
  background: transparent;
  padding: 0;
}

/* 代码预览 */
.file-preview-code-container {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow: auto;
  background: #1e293b;
  color: #ffffff;
}

.file-preview-code {
  margin: 0;
  padding: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre;
  word-wrap: break-word;
  color: #ffffff;
  overflow-x: auto;
}

.file-preview-code code {
  font-family: inherit;
  background: transparent;
  padding: 0;
  display: block;
  width: 100%;
}

/* 视频预览 */
.file-preview-video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #000000;
}

.file-preview-video {
  max-width: 100%;
  max-height: 100%;
  outline: none;
}

/* 音频预览 */
.file-preview-audio-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f9fafb;
}

.file-preview-audio-wrapper {
  width: 100%;
  max-width: 600px;
}

.file-preview-audio {
  width: 100%;
  outline: none;
}

/* Office文档预览 */
.file-preview-office-container {
  width: 100%;
  height: 100%;
  background: #f9fafb;
}

.office-viewer-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.file-preview-office {
  width: 100%;
  height: 100%;
  border: none;
}

.office-viewer-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #6b7280;
  padding: 40px;
  text-align: center;
}

.office-viewer-fallback svg {
  color: #9ca3af;
}

.office-viewer-hint {
  font-size: 14px;
  color: #9ca3af;
  margin-top: -8px;
}

.office-viewer-options {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

/* 代码预览 */
.file-preview-code-container {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow: auto;
  background: #1e1e1e;
}

.file-preview-code {
  margin: 0;
  padding: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre;
  word-wrap: break-word;
}

.file-preview-code code {
  font-family: inherit;
  background: transparent;
  padding: 0;
  color: inherit;
}

/* 不支持预览 */
.file-preview-unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #6b7280;
  padding: 40px;
  text-align: center;
}

.file-preview-unsupported svg {
  color: #9ca3af;
}

.file-preview-unsupported-hint {
  font-size: 14px;
  color: #9ca3af;
  margin-top: -8px;
}

/* 文件卡片点击提示 */
.file-preview-hint {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  color: #6b7280;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-preview-card:hover .file-preview-hint {
  opacity: 1;
}

.file-preview-card {
  position: relative;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 成功提示弹窗样式 */
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.success-modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 320px;
  max-width: 480px;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-modal-icon {
  margin: 0 auto 20px;
  animation: checkmarkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
}

.success-modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #10b981;
  margin: 0 0 12px 0;
}

.success-modal-message {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes checkmarkPop {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
