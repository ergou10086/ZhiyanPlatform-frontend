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
                :class="{ active: String(doc.id) === String(activeId) }"
                class="doc-item"
                @click="selectDocument(doc.id)">
              <span class="doc-title">{{ doc.title }}</span>
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
          <button class="export-btn" @click="exportDocument" :disabled="!activeDoc" title="导出文档">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>导出</span>
          </button>
        </div>
        <div class="doc-meta" v-else>
          <div class="doc-title">暂无文档</div>
          <div class="doc-updated">请创建或选择文档</div>
        </div>
        <!-- 非编辑模式：显示渲染后的Markdown -->
        <div v-if="activeDoc && !isEditing" class="markdown-viewer" v-html="renderedMarkdown"></div>
        <!-- 编辑模式：显示源代码 -->
        <textarea 
          v-else-if="activeDoc && isEditing"
          class="editor" 
          v-model="activeDocContent" 
          @input="updateContent"
        ></textarea>
        <div v-else class="empty-editor">
          <p>暂无文档内容</p>
        </div>
        <div class="editor-footer">
          <button class="btn" @click="showVersionHistory" :disabled="!activeDoc">版本历史</button>
          <button class="btn" @click="showVersionCompare" :disabled="!activeDoc">差异对比</button>
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
             <button class="btn secondary" @click="closeNewDocDialog" :disabled="isCreatingDoc">取消</button>
             <button class="btn primary" @click="confirmNewDoc" :disabled="!selectedFile || !newDocTitle.trim() || isCreatingDoc">
               {{ isCreatingDoc ? '创建中...' : '确认创建' }}
             </button>
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
             <button class="btn secondary" @click="closeNewFolderDialog" :disabled="isCreatingFolder">取消</button>
             <button class="btn primary" @click="confirmNewFolder" :disabled="!newFolderName || isCreatingFolder">
               {{ isCreatingFolder ? '创建中...' : '确认创建' }}
             </button>
           </div>
        </div>
      </div>
    </div>

    <!-- 版本历史对话框（带存档位） -->
    <div v-if="showVersionHistoryDialog" class="upload-dialog-overlay" @click="closeVersionHistoryDialog">
      <div class="upload-dialog version-history-dialog" @click.stop>
        <div class="dialog-header">
          <h3>版本历史</h3>
          <button class="close-btn" @click="closeVersionHistoryDialog">×</button>
        </div>
        <div class="dialog-content">
          <!-- 三个存档位 -->
          <div class="archive-slots">
              <div v-for="slot in 3" :key="slot" class="archive-slot">
                <div class="slot-header">
                  <div class="slot-number">存档位 {{ slot }}</div>
                  <button v-if="getArchiveSlot(slot)" class="btn-small danger" @click="clearArchiveSlot(slot)">清空</button>
                </div>
                <div v-if="getArchiveSlot(slot)" class="slot-content filled">
                  <div class="slot-info">
                    <div class="slot-title">{{ getArchiveSlot(slot).customName || `版本 ${getArchiveSlot(slot).version}` }}</div>
                    <div class="slot-meta">
                      <span>版本号: {{ getArchiveSlot(slot).version }}</span>
                      <span>{{ getArchiveSlot(slot).creatorName || '未知' }}</span>
                      <span>{{ formatDateTime(getArchiveSlot(slot).createdAt) }}</span>
                    </div>
                    <div class="slot-desc" v-if="getArchiveSlot(slot).changeDescription">
                      {{ getArchiveSlot(slot).changeDescription }}
                    </div>
                  </div>
                  <div class="slot-actions">
                    <button class="btn-small" @click="viewVersionContent(getArchiveSlot(slot).version)">查看</button>
                    <button class="btn-small primary" @click="restoreToVersion(getArchiveSlot(slot).version)">恢复</button>
                  </div>
                </div>
                <div v-else class="slot-content empty">
                  <div class="empty-slot-message">空存档位</div>
                  <button class="btn-small" @click="showSaveToSlotDialog(slot)">保存当前版本</button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- 查看版本内容对话框 -->
    <div v-if="showVersionViewDialog" class="upload-dialog-overlay" @click="closeVersionViewDialog">
      <div class="upload-dialog version-view-dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ viewingArchiveName || `查看版本 ${viewingVersion}` }}</h3>
          <button class="close-btn" @click="closeVersionViewDialog">×</button>
        </div>
        <div class="dialog-content">
          <!-- 版本信息 -->
          <div v-if="viewingVersionInfo || viewingVersion" class="version-info-header">
            <div class="version-info-item" v-if="viewingVersion">
              <span class="info-label">版本号：</span>
              <span class="info-value">{{ viewingVersion }}</span>
            </div>
            <div class="version-info-item" v-if="viewingVersionInfo">
              <span class="info-label">创建者：</span>
              <span class="info-value">{{ viewingVersionInfo.creatorName || '未知' }}</span>
            </div>
            <div class="version-info-item" v-if="viewingVersionInfo">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ formatDateTime(viewingVersionInfo.createdAt) }}</span>
            </div>
            <div class="version-info-item" v-if="viewingVersionInfo && viewingVersionInfo.changeDescription">
              <span class="info-label">变更说明：</span>
              <span class="info-value">{{ viewingVersionInfo.changeDescription }}</span>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loadingVersionContent" class="loading-indicator">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          
          <!-- 版本内容（Markdown渲染） -->
          <div v-else class="version-content-viewer">
            <div class="markdown-viewer" v-html="formatMarkdown(viewingVersionContent)"></div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn secondary" @click="closeVersionViewDialog">关闭</button>
          <button class="btn primary" @click="restoreFromViewDialog">恢复到此版本</button>
        </div>
      </div>
    </div>

    <!-- 保存到存档位对话框 -->
    <div v-if="showSaveSlotDialog" class="upload-dialog-overlay" @click="closeSaveSlotDialog">
      <div class="upload-dialog save-slot-dialog" @click.stop>
        <div class="dialog-header">
          <h3>保存版本到存档位</h3>
          <button class="close-btn" @click="closeSaveSlotDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>选择存档位：</label>
            <div class="slot-selector">
              <div
                v-for="slot in 3"
                :key="slot"
                class="slot-option"
                :class="{ 'selected': selectedSlotNumber === slot, 'occupied': getArchiveSlot(slot) }"
                @click="selectedSlotNumber = slot">
                <div class="slot-option-header">
                  <div class="slot-option-number">存档位 {{ slot }}</div>
                  <div class="slot-option-status" v-if="getArchiveSlot(slot)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="slot-option-content" v-if="getArchiveSlot(slot)">
                  <div class="slot-option-name">{{ getArchiveSlot(slot).customName || `版本 ${getArchiveSlot(slot).version}` }}</div>
                  <div class="slot-option-time">{{ formatDateTime(getArchiveSlot(slot).createdAt) }}</div>
                  <div class="overwrite-hint">⚠️ 将覆盖此存档</div>
                </div>
                <div class="slot-option-content empty" v-else>
                  <div class="empty-slot-hint">空存档位</div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>存档名称（可选）：</label>
            <input v-model="archiveCustomName" type="text" placeholder="例如：完成XX功能" maxlength="50" />
          </div>
          <div class="dialog-actions">
            <button class="btn secondary" @click="closeSaveSlotDialog">取消</button>
            <button class="btn primary" @click="confirmSaveToSlot" :disabled="!selectedSlotNumber">
              {{ getArchiveSlot(selectedSlotNumber) ? '覆盖保存' : '确认保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本对比对话框（使用存档位） -->
    <div v-if="showVersionCompareDialog" class="upload-dialog-overlay" @click="closeVersionCompareDialog">
      <div class="upload-dialog version-compare-dialog" @click.stop>
        <div class="dialog-header">
          <h3>差异对比</h3>
          <button class="close-btn" @click="closeVersionCompareDialog">×</button>
        </div>
        <div class="dialog-content">
          <!-- 存档位选择 -->
          <div class="compare-slots">
            <div class="compare-slot-item" v-for="slot in 3" :key="slot"
                 :class="{ 'selected': selectedCompareSlot === slot, 'occupied': getArchiveSlot(slot) }"
                 @click="selectCompareSlot(slot)">
              <div class="compare-slot-info">
                <div class="slot-badge">存档{{ slot }}</div>
                <div class="slot-details" v-if="getArchiveSlot(slot)">
                  <div class="slot-name">{{ getArchiveSlot(slot).customName || `版本 ${getArchiveSlot(slot).version}` }}</div>
                  <div class="slot-time">{{ formatDateTime(getArchiveSlot(slot).createdAt) }}</div>
                </div>
                <div class="slot-details" v-else>
                  <div class="slot-name empty">空存档位</div>
                </div>
              </div>
              <div class="check-icon" v-if="selectedCompareSlot === slot">✓</div>
            </div>
          </div>

          <!-- 版本对比显示区域 -->
          <div v-if="selectedCompareSlot" class="version-compare-viewer">
            <div class="compare-panel-left">
              <div class="compare-panel-header">
                <span class="panel-title">当前版本</span>
              </div>
              <div 
                class="compare-panel-content" 
                ref="leftScrollPanel"
                @scroll="syncScroll('left', $event)">
                <div v-if="loadingVersionCompare" class="loading-indicator">
                  <div class="loading-spinner"></div>
                  <p>加载中...</p>
                </div>
                <div v-else class="diff-viewer" v-html="formatDiffContent(activeDocContent, versionDiff, 'left')"></div>
              </div>
            </div>
            <div class="compare-panel-right">
              <div class="compare-panel-header">
                <span class="panel-title">{{ getArchiveSlot(selectedCompareSlot)?.customName || `版本 ${getArchiveSlot(selectedCompareSlot)?.version}` }}</span>
              </div>
              <div 
                class="compare-panel-content" 
                ref="rightScrollPanel"
                @scroll="syncScroll('right', $event)">
                <div v-if="loadingVersionCompare" class="loading-indicator">
                  <div class="loading-spinner"></div>
                  <p>加载中...</p>
                </div>
                <div v-else class="diff-viewer" v-html="formatDiffContent(compareVersionContent, versionDiff, 'right')"></div>
              </div>
            </div>
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
      isEditing: false,
      isSaving: false, // 防止重复保存的标志
      sidebarCollapsed: false,
      folders: [], // 从API获取的目录节点
      docs: [], // 从API获取的文档节点
      wikiTree: [], // Wiki树形结构
      loading: false,
      currentPage: null, // 当前查看的页面详情
      originalContent: '', // 原始内容（用于取消编辑）
      selectedParentId: null, // 新建页面时选择的父页面ID
      isCreatingFolder: false, // 防止重复创建节点
      isCreatingDoc: false, // 防止重复创建文档
      loadingDocIds: new Set(), // 正在加载的文档ID集合，避免重复加载

      // 版本历史相关
      showVersionHistoryDialog: false,

      // 版本存档位相关（3个存档位）
      archiveSlots: [], // 存储用户保存的3个版本存档
      showSaveSlotDialog: false,
      selectedSlotNumber: null,
      archiveCustomName: '',
      versionToArchive: null, // 要保存到存档位的版本

      // 版本对比相关
      showVersionCompareDialog: false,
      selectedCompareSlot: null, // 选中要对比的存档位
      compareVersionContent: '', // 对比版本的内容
      currentVersionNumber: null, // 当前版本的版本号
      versionDiff: null, // 差异数据
      loadingVersionCompare: false,
      isScrolling: false, // 防止滚动循环

      // 查看版本内容相关
      showVersionViewDialog: false,
      viewingVersion: null, // 正在查看的版本号
      viewingVersionContent: '', // 正在查看的版本内容
      viewingVersionInfo: null, // 正在查看的版本信息
      viewingArchiveName: null, // 正在查看的版本对应的存档名字
      loadingVersionContent: false
    }
  },
  computed: {
    activeDoc() {
      if (!this.docs || this.docs.length === 0) return null
      if (!this.activeId) return null
      return this.docs.find(d => String(d.id) === String(this.activeId)) || this.docs[0]
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
    // 渲染后的Markdown内容
    renderedMarkdown() {
      if (!this.activeDocContent) return ''
      return this.formatMarkdown(this.activeDocContent)
    },
    // 扁平化树形结构用于节点选择器
    flatNodeList() {
      const result = []
      const flatten = (nodes, level = 0) => {
        if (!Array.isArray(nodes)) return
        nodes.forEach(node => {
          if (node.pageType === 'DIRECTORY') {
            result.push({
              id: String(node.id), // 保持字符串格式，避免大整数精度丢失
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

      // 在清空数据前，先保存已有文档的内容缓存
      const contentCache = new Map()
      this.docs.forEach(doc => {
        if (doc.content && doc.content !== '') {
          contentCache.set(String(doc.id), doc.content)
        }
      })

      // 清空现有数据，避免重复添加
      this.folders = []
      this.docs = []

      try {
        console.log('[loadWikiTree] 加载Wiki树, projectId:', this.projectId)
        const response = await wikiAPI.page.getProjectWikiTree(this.projectId)
        
        if (response && response.code === 200) {
          this.wikiTree = response.data || []
          console.log('[loadWikiTree] Wiki树加载成功:', this.wikiTree)
          
          // 解析树形结构，分离目录和文档（传递内容缓存）
          this.parseWikiTree(this.wikiTree, null, contentCache)
          
          // 延迟加载第一个文档，让界面先渲染，提升用户体验
          if (this.docs.length > 0) {
            // 使用 nextTick 确保界面先渲染，然后再异步加载文档内容
            this.$nextTick(() => {
              // 使用 setTimeout 进一步延迟，让用户先看到文档列表
              setTimeout(() => {
                this.selectDocument(this.docs[0].id)
              }, 100)
            })
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
     * @param {Array} tree - Wiki树
     * @param {String|null} parentId - 父节点ID
     * @param {Map} contentCache - 内容缓存Map
     */
    parseWikiTree(tree, parentId = null, contentCache = null) {
      if (!Array.isArray(tree)) return
      
      // 如果是最外层调用且没有传入缓存，创建新的缓存
      if (!contentCache) {
        contentCache = new Map()
      }

      tree.forEach(node => {
        if (node.pageType === 'DIRECTORY') {
          // 目录节点 - 使用字符串 ID 避免精度丢失
          this.folders.push({
            id: String(node.id),
            name: node.title,
            description: '',
            expanded: true,
            parentId: parentId
          })
          
          // 递归处理子节点，传递同一个缓存
          if (node.children && node.children.length > 0) {
            this.parseWikiTree(node.children, String(node.id), contentCache)
          }
        } else if (node.pageType === 'DOCUMENT') {
          // 文档节点 - 使用字符串 ID 避免精度丢失
          const docId = String(node.id)
          // 从缓存中获取已有内容，避免重复加载
          const cachedContent = contentCache.get(docId) || ''
          this.docs.push({
            id: docId,
            title: node.title,
            updated: node.updatedAt || node.createdAt || '',
            content: cachedContent, // 保留缓存内容，如果没有则为空
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
      
      const pageIdStr = String(pageId)

      // 立即更新选中状态，确保界面立即响应（放在最前面）
      this.activeId = pageIdStr

      // 如果已经选中该文档且有完整内容，直接返回（避免重复操作）
      if (this.currentPage && this.currentPage.id === pageIdStr && this.currentPage.content) {
        return
      }

      // 先检查本地是否已有内容（已加载过的文档）
      const existingDoc = this.docs.find(d => String(d.id) === pageIdStr)
      if (existingDoc) {
        // 如果本地已有完整内容，直接使用
        if (existingDoc.content !== undefined && existingDoc.content !== '') {
          console.log('[selectDocument] 使用本地缓存:', existingDoc.title)
          this.currentPage = {
            id: pageIdStr,
            title: existingDoc.title,
            content: existingDoc.content,
            pageType: 'DOCUMENT',
            updatedAt: existingDoc.updated
          }
          this.originalContent = existingDoc.content || ''
          return
        }

        // 如果本地没有内容，先显示基本信息，然后异步加载内容
        this.currentPage = {
          id: pageIdStr,
          title: existingDoc.title,
          content: '', // 暂时为空，等待加载
          pageType: 'DOCUMENT',
          updatedAt: existingDoc.updated
        }
        this.originalContent = ''
      } else {
        // 如果文档不在列表中，立即创建基本结构
        this.currentPage = {
          id: pageIdStr,
          title: '加载中...',
          content: '',
          pageType: 'DOCUMENT',
          updatedAt: ''
        }
        this.originalContent = ''
      }

      // 如果文档正在加载中，不重复加载，但界面已经更新了选中状态
      if (this.loadingDocIds.has(pageIdStr)) {
        console.log('[selectDocument] 文档正在加载中，界面已更新:', pageIdStr)
        return
      }

      // 标记为正在加载，防止重复请求
      this.loadingDocIds.add(pageIdStr)

      // 使用 nextTick 确保界面已更新，然后再加载内容
      this.$nextTick(async () => {
        // 异步加载文档内容（不阻塞界面切换）
        try {
          console.log('[selectDocument] 从API加载页面详情, pageId:', pageId)
          const response = await wikiAPI.page.getPageDetail(pageId)
        
        if (response && response.code === 200) {
          // 检查是否仍然选中该文档（用户可能在加载过程中切换了其他文档）
          if (String(this.activeId) !== pageIdStr) {
            console.log('[selectDocument] 用户已切换文档，忽略此次加载结果')
            return
          }
          
          // 更新文档内容
          this.currentPage = {
            ...this.currentPage,
            ...response.data,
            content: response.data.content || ''
          }

          // 更新docs数组中的内容
          const doc = this.docs.find(d => String(d.id) === pageIdStr)
          if (doc) {
            doc.content = this.currentPage.content || ''
            doc.updated = this.currentPage.updatedAt || doc.updated
            doc.title = this.currentPage.title || doc.title
          } else {
            // 如果文档不在docs数组中，添加到数组中
            this.docs.push({
              id: pageIdStr,
              title: this.currentPage.title || '',
              updated: this.currentPage.updatedAt || '',
              content: this.currentPage.content || '',
              folderId: null
            })
          }
          
          // 保存原始内容
          this.originalContent = this.currentPage.content || ''
          
          console.log('[selectDocument] 页面详情加载成功:', this.currentPage.title)
        } else {
          console.error('[selectDocument] 加载页面失败:', response)
          this.$message?.error(response.msg || '加载页面失败')

          // 如果页面不存在，重新加载Wiki树
          if (response.code === 404 || response.msg?.includes('不存在')) {
            console.warn('[selectDocument] 页面不存在，重新加载Wiki树')
            await this.loadWikiTree()
          }
        }
      } catch (error) {
        console.error('[selectDocument] 加载页面失败:', error)

        // 检查是否是404错误（页面不存在）
        if (error.response?.status === 404 || error.message?.includes('不存在')) {
          this.$message?.error('页面不存在，可能已被删除')
          // 重新加载Wiki树以同步最新数据
          await this.loadWikiTree()
        } else {
          this.$message?.error('加载页面失败，请重试')
        }
        } finally {
          this.loadingDocIds.delete(pageIdStr)
        }
      })
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
      // 如果正在创建中，不允许关闭对话框
      if (this.isCreatingDoc) {
        return
      }
      this.showNewDocDialog = false
      this.newDocTitle = ''
      this.newDocCategory = ''
      this.selectedNodeId = null
      this.selectedNodeName = ''
      this.nodeSearchText = ''
      this.selectedFile = null
      this.showNodePicker = false
      this.isCreatingDoc = false
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
      // 如果正在创建中，不允许关闭对话框
      if (this.isCreatingFolder) {
        return
      }
      this.showNewFolderDialog = false
      this.newFolderName = ''
      this.isCreatingFolder = false
    },

    async confirmNewFolder() {
      if (!this.newFolderName.trim()) return
      
      // 防止重复点击
      if (this.isCreatingFolder) {
        console.log('[confirmNewFolder] 正在创建中，忽略重复点击')
        return
      }

      this.isCreatingFolder = true

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
          
          // 直接关闭对话框并重置状态
          this.showNewFolderDialog = false
          this.newFolderName = ''
          this.isCreatingFolder = false

          // 重新加载Wiki树
          this.folders = []
          this.docs = []
          await this.loadWikiTree()
        } else {
          console.error('[confirmNewFolder] 创建失败:', response)
          this.$message?.error(response.msg || '创建节点失败')
        }
      } catch (error) {
        console.error('[confirmNewFolder] 创建节点失败:', error)
        this.$message?.error('创建节点失败，请重试')
      } finally {
        this.isCreatingFolder = false
      }
    },

    toggleFolder(folderId) {
      const folder = this.folders.find(f => String(f.id) === String(folderId))
      if (folder) {
        folder.expanded = !folder.expanded
      }
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    getDocsInFolder(folderId) {
      return this.docs.filter(doc => String(doc.folderId) === String(folderId))
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
      
      // 防止重复点击
      if (this.isCreatingDoc) {
        console.log('[confirmNewDoc] 正在创建中，忽略重复点击')
        return
      }

      this.isCreatingDoc = true

      try {
        console.log('[confirmNewDoc] 创建Wiki文档')
        
        // 确定父页面ID（如果选择了节点）
        // 保持字符串格式，避免大整数精度丢失
        let parentId = null
        if (this.selectedNodeId !== null && this.selectedNodeId !== undefined) {
          parentId = String(this.selectedNodeId)
          console.log('[confirmNewDoc] 选择的父节点ID:', parentId)
        }
        
        // 读取文件内容
        const fileContent = await this.readFileContent(this.selectedFile)
        
        // 调用后端API创建Wiki文档
        const response = await wikiAPI.page.createPage({
          projectId: this.projectId,
          title: this.newDocTitle.trim(),
          pageType: 'DOCUMENT',
          content: fileContent,
          parentId: parentId, // 作为字符串传递，后端会自动转换为Long
          isPublic: false,
          changeDescription: '创建文档'
        })
        
        if (response && response.code === 200) {
          console.log('[confirmNewDoc] 文档创建成功:', response.data)
          this.$message?.success('文档创建成功！')

          // 保存文档标题用于后续使用
          const docTitle = this.newDocTitle.trim()

          // 直接关闭对话框并重置状态
          this.showNewDocDialog = false
          this.newDocTitle = ''
          this.newDocCategory = ''
          this.selectedNodeId = null
          this.selectedNodeName = ''
          this.nodeSearchText = ''
          this.selectedFile = null
          this.showNodePicker = false
          this.isCreatingDoc = false
          // 清空文件输入框
          if (this.$refs.fileInput) {
            this.$refs.fileInput.value = ''
          }

          // 重新加载Wiki树以获取最新数据
          await this.loadWikiTree()

          // 自动选择新创建的文档
          const newPageId = String(response.data.id || response.data)
          if (newPageId && newPageId !== 'null' && newPageId !== 'undefined') {
            await this.selectDocument(newPageId)

            // 如果文档在文件夹中，确保文件夹展开
            if (parentId) {
              const folder = this.folders.find(f => String(f.id) === String(parentId))
              if (folder && !folder.expanded) {
                folder.expanded = true
              }
            }
          }

          // 通知父组件
          this.$emit('document-created', {
            id: newPageId,
            title: docTitle
          })

          console.log('[confirmNewDoc] 文档已创建并自动选中')
        } else {
          console.error('[confirmNewDoc] 创建失败:', response)
          this.$message?.error(response.msg || '创建文档失败')
        }
      } catch (error) {
        console.error('[confirmNewDoc] 创建文档失败:', error)
        this.$message?.error('创建文档失败：' + (error.message || '请重试'))
      } finally {
        this.isCreatingDoc = false
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
      }
    },
    
    async saveDocument() {
      if (!this.activeDoc) {
        console.warn('[saveDocument] 没有活动文档')
        this.$message?.error('没有可保存的文档')
        return
      }
      
      if (!this.activeId) {
        console.warn('[saveDocument] 没有活动文档ID')
        this.$message?.error('无法保存文档：缺少文档ID')
        return
      }

      // 防止重复保存 - 如果正在保存中，直接返回
      if (this.isSaving) {
        console.log('[saveDocument] 正在保存中，跳过重复请求')
        return
      }

      this.isSaving = true

      try {
        console.log('[saveDocument] 保存文档到后端, ID:', this.activeId)
        
        // 调用后端API更新文档内容
        const response = await wikiAPI.page.updatePage(this.activeId, {
          content: this.activeDocContent,
          changeDescription: '手动保存'
        })

        if (response && response.code === 200) {
          // 更新本地文档内容
        this.activeDoc.content = this.activeDocContent
        this.activeDoc.updated = new Date().toLocaleString('zh-CN')
          this.originalContent = this.activeDocContent
        
        // 标记已保存并退出编辑模式
        this.hasUnsavedChanges = false
        this.isEditing = false
        
          console.log('[saveDocument] 文档保存成功')
          this.$message?.success('文档保存成功！')

          // 通知父组件
          this.$emit('document-saved', this.activeDoc)
        } else {
          console.error('[saveDocument] 保存失败:', response)
          this.$message?.error(response.msg || '保存文档失败')
        }
      } catch (error) {
        console.error('[saveDocument] 保存文档失败:', error)
        this.$message?.error('保存文档失败：' + (error.message || '请重试'))
      } finally {
        this.isSaving = false
      }
    },
    
    async autoSave() {
      // 如果正在保存或没有未保存的更改，跳过
      if (this.isSaving || !this.hasUnsavedChanges || !this.activeDoc || !this.activeId) {
        return
      }

      this.isSaving = true

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
      } finally {
        this.isSaving = false
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
     * 显示版本历史
     */
    showVersionHistory() {
      if (!this.activeId) {
        this.$message?.warning('请先选择一个文档')
        return
      }

      this.showVersionHistoryDialog = true
      this.loadingVersionHistory = false

      // 加载存档位数据
      this.loadArchiveSlotsFromStorage()
    },

    /**
     * 关闭版本历史对话框
     */
    closeVersionHistoryDialog() {
      this.showVersionHistoryDialog = false
    },

    /**
     * 查看指定版本的内容（在新弹窗中显示）
     */
    async viewVersionContent(version) {
      if (!this.activeId) return

      // 关闭版本历史对话框（如果打开的话）
      this.closeVersionHistoryDialog()

      // 查找对应的存档位，获取存档名字
      const archiveSlot = this.archiveSlots.find(slot => slot.version === version)
      this.viewingArchiveName = archiveSlot ? archiveSlot.customName : null

      // 打开查看版本弹窗
      this.showVersionViewDialog = true
      this.viewingVersion = version
      this.viewingVersionContent = ''
      this.viewingVersionInfo = null
      this.loadingVersionContent = true

      try {
        console.log('[viewVersionContent] 查看版本内容, pageId:', this.activeId, 'version:', version)
        const response = await wikiAPI.version.getVersionContent(this.activeId, version)

        if (response && response.code === 200) {
          const content = response.data || ''
          this.viewingVersionContent = content
          
          // 尝试获取版本信息（如果有的话）
          try {
            const versionHistoryResponse = await wikiAPI.version.getVersionHistory(this.activeId)
            if (versionHistoryResponse && versionHistoryResponse.code === 200) {
              const versionInfo = versionHistoryResponse.data.find(v => v.version === version)
              if (versionInfo) {
                this.viewingVersionInfo = versionInfo
              }
            }
          } catch (e) {
            console.warn('[viewVersionContent] 获取版本信息失败:', e)
          }
        } else {
          console.error('[viewVersionContent] 加载失败:', response)
          this.$message?.error(response.msg || '加载版本内容失败')
          this.closeVersionViewDialog()
        }
      } catch (error) {
        console.error('[viewVersionContent] 加载版本内容失败:', error)
        this.$message?.error('加载版本内容失败：' + (error.message || '请重试'))
        this.closeVersionViewDialog()
      } finally {
        this.loadingVersionContent = false
      }
    },

    /**
     * 关闭版本查看对话框
     */
    closeVersionViewDialog() {
      this.showVersionViewDialog = false
      this.viewingVersion = null
      this.viewingVersionContent = ''
      this.viewingVersionInfo = null
      this.viewingArchiveName = null
      this.loadingVersionContent = false
    },

    /**
     * 恢复到指定版本
     */
    async restoreToVersion(version) {
      if (!this.activeId) return

      if (!confirm(`确定要恢复到版本 ${version} 吗？这将创建一个新版本。`)) {
        return
      }

      try {
        console.log('[restoreToVersion] 恢复到版本, pageId:', this.activeId, 'version:', version)

        // 先获取该版本的内容
        const response = await wikiAPI.version.getVersionContent(this.activeId, version)

        if (response && response.code === 200) {
          const content = response.data || ''

          // 使用该版本内容更新页面
          const updateResponse = await wikiAPI.page.updatePage(this.activeId, {
            content: content,
            changeDescription: `恢复到版本 ${version}`
          })

          if (updateResponse && updateResponse.code === 200) {
            this.$message?.success('已恢复到指定版本')

            // 重新加载文档内容
            await this.selectDocument(this.activeId)

            // 关闭版本历史对话框
            this.closeVersionHistoryDialog()
          } else {
            this.$message?.error(updateResponse.msg || '恢复版本失败')
          }
        }
      } catch (error) {
        console.error('[restoreToVersion] 恢复版本失败:', error)
        this.$message?.error('恢复版本失败：' + (error.message || '请重试'))
      }
    },

    /**
     * 从查看版本对话框恢复到该版本
     */
    async restoreFromViewDialog() {
      if (!this.viewingVersion || !this.activeId) return

      if (!confirm(`确定要恢复到版本 ${this.viewingVersion} 吗？这将创建一个新版本。`)) {
        return
      }

      try {
        // 使用正在查看的内容更新页面
        const updateResponse = await wikiAPI.page.updatePage(this.activeId, {
          content: this.viewingVersionContent,
          changeDescription: `恢复到版本 ${this.viewingVersion}`
        })

        if (updateResponse && updateResponse.code === 200) {
          this.$message?.success('已恢复到指定版本')

          // 关闭查看版本对话框
          this.closeVersionViewDialog()

          // 重新加载文档内容
          await this.selectDocument(this.activeId)

          // 关闭版本历史对话框（如果打开的话）
          this.closeVersionHistoryDialog()
        } else {
          this.$message?.error(updateResponse.msg || '恢复版本失败')
        }
      } catch (error) {
        console.error('[restoreFromViewDialog] 恢复版本失败:', error)
        this.$message?.error('恢复版本失败：' + (error.message || '请重试'))
      }
    },

    /**
     * 显示版本对比对话框
     */
    async showVersionCompare() {
      if (!this.activeId) {
        this.$message?.warning('请先选择一个文档')
        return
      }

      // 加载存档位数据
      this.loadArchiveSlotsFromStorage()

      // 如果没有存档位，提示用户
      if (this.archiveSlots.length === 0) {
        this.$message?.warning('请先在"版本历史"中保存至少一个存档位')
        return
      }

      this.showVersionCompareDialog = true
      this.selectedCompareSlot = null
      this.compareVersionContent = ''
    },

    /**
     * 关闭版本对比对话框
     */
    closeVersionCompareDialog() {
      this.showVersionCompareDialog = false
      this.selectedCompareSlot = null
      this.compareVersionContent = ''
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },

    /**
     * 获取指定存档位的数据
     */
    getArchiveSlot(slotNumber) {
      return this.archiveSlots.find(slot => slot.slotNumber === slotNumber)
    },

    /**
     * 显示保存当前版本到存档位的对话框
     */
    async showSaveToSlotDialog(slotNumber) {
      // 如果指定了存档位，使用该存档位，否则找第一个空的或使用存档位1
      if (slotNumber) {
        this.selectedSlotNumber = slotNumber
      } else {
        // 找到第一个空的存档位，如果都满了则默认选择存档位1
        let foundEmpty = false
        for (let i = 1; i <= 3; i++) {
          if (!this.getArchiveSlot(i)) {
            this.selectedSlotNumber = i
            foundEmpty = true
            break
          }
        }
        if (!foundEmpty) {
          this.selectedSlotNumber = 1 // 默认选择存档位1
        }
      }

      this.archiveCustomName = ''
      this.versionToArchive = null // 保存当前版本（最新版本）
      this.showSaveSlotDialog = true
    },


    /**
     * 关闭保存到存档位对话框
     */
    closeSaveSlotDialog() {
      this.showSaveSlotDialog = false
      this.selectedSlotNumber = null
      this.archiveCustomName = ''
      this.versionToArchive = null
    },

    /**
     * 确认保存到存档位
     */
    async confirmSaveToSlot() {
      if (!this.selectedSlotNumber) return

      try {
        // 获取当前文档的最新版本信息
        let versionData
        if (this.versionToArchive) {
          // 保存指定版本（从存档位传入）
          versionData = this.versionToArchive
        } else {
          // 保存当前最新版本，需要先获取版本历史
          try {
            const response = await wikiAPI.version.getVersionHistory(this.activeId)
            if (response && response.code === 200 && response.data && response.data.length > 0) {
              versionData = response.data[0] // 第一个就是最新版本
            } else {
              // 如果没有版本历史，创建一个临时版本数据
              versionData = {
                version: 1,
                creatorName: '当前用户',
                createdAt: new Date().toISOString(),
                changeDescription: '当前版本'
              }
            }
          } catch (error) {
            console.error('[confirmSaveToSlot] 获取版本历史失败:', error)
            // 如果获取失败，创建临时版本数据
            versionData = {
              version: 1,
              creatorName: '当前用户',
              createdAt: new Date().toISOString(),
              changeDescription: '当前版本'
            }
          }
        }

        // 创建存档数据
        const archiveData = {
          slotNumber: this.selectedSlotNumber,
          version: versionData.version,
          customName: this.archiveCustomName.trim() || '',
          creatorName: versionData.creatorName,
          createdAt: versionData.createdAt,
          changeDescription: versionData.changeDescription,
          pageId: this.activeId
        }

        // 移除该存档位的旧数据（如果有）
        this.archiveSlots = this.archiveSlots.filter(slot => slot.slotNumber !== this.selectedSlotNumber)

        // 添加新存档
        this.archiveSlots.push(archiveData)

        // 保存到 localStorage
        this.saveArchiveSlotsToStorage()

        this.$message?.success(`已保存到存档位 ${this.selectedSlotNumber}`)
        this.closeSaveSlotDialog()
      } catch (error) {
        console.error('[confirmSaveToSlot] 保存失败:', error)
        this.$message?.error('保存失败，请重试')
      }
    },

    /**
     * 清空指定存档位
     */
    clearArchiveSlot(slotNumber) {
      if (!confirm(`确定要清空存档位 ${slotNumber} 吗？`)) {
        return
      }

      this.archiveSlots = this.archiveSlots.filter(slot => slot.slotNumber !== slotNumber)
      this.saveArchiveSlotsToStorage()
      this.$message?.success('存档位已清空')
    },

    /**
     * 保存存档位数据到 localStorage
     */
    saveArchiveSlotsToStorage() {
      try {
        const storageKey = this.activeId ? `wikiArchiveSlots_${this.activeId}` : 'wikiArchiveSlots'
        localStorage.setItem(storageKey, JSON.stringify(this.archiveSlots))
      } catch (error) {
        console.error('[saveArchiveSlotsToStorage] 保存失败:', error)
      }
    },

    /**
     * 从 localStorage 加载存档位数据
     */
    loadArchiveSlotsFromStorage() {
      try {
        const storageKey = this.activeId ? `wikiArchiveSlots_${this.activeId}` : 'wikiArchiveSlots'
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const loaded = JSON.parse(saved)
          // 只保留slotNumber为1、2、3的存档位，过滤掉脏数据
          this.archiveSlots = Array.isArray(loaded) 
            ? loaded.filter(slot => slot.slotNumber >= 1 && slot.slotNumber <= 3)
            : []
          // 如果过滤后数据有变化，保存回去
          if (loaded.length !== this.archiveSlots.length) {
            this.saveArchiveSlotsToStorage()
          }
        } else {
          this.archiveSlots = []
        }
      } catch (error) {
        console.error('[loadArchiveSlotsFromStorage] 加载失败:', error)
        this.archiveSlots = []
      }
    },

    /**
     * 选择要对比的存档位
     */
    async selectCompareSlot(slotNumber) {
      this.selectedCompareSlot = slotNumber
      this.compareVersionContent = ''
      this.versionDiff = null
      this.currentVersionNumber = null
      
      // 自动加载选中版本的内容
      const selectedSlot = this.getArchiveSlot(slotNumber)
      if (!selectedSlot || !this.activeId) return
      
      this.loadingVersionCompare = true
      
      try {
        // 获取当前版本的版本号
        try {
          const versionHistoryResponse = await wikiAPI.version.getVersionHistory(this.activeId)
          if (versionHistoryResponse && versionHistoryResponse.code === 200 && versionHistoryResponse.data && versionHistoryResponse.data.length > 0) {
            this.currentVersionNumber = versionHistoryResponse.data[0].version // 第一个是最新版本
          }
        } catch (e) {
          console.warn('[selectCompareSlot] 获取当前版本号失败:', e)
        }
        
        // 并行加载版本内容和差异数据
        const [contentResponse, diffResponse] = await Promise.allSettled([
          wikiAPI.version.getVersionContent(this.activeId, selectedSlot.version),
          this.currentVersionNumber ? wikiAPI.version.compareVersions(this.activeId, this.currentVersionNumber, selectedSlot.version) : Promise.resolve(null)
        ])
        
        if (contentResponse.status === 'fulfilled' && contentResponse.value && contentResponse.value.code === 200) {
          this.compareVersionContent = contentResponse.value.data || ''
        } else {
          this.$message?.error(contentResponse.value?.msg || '加载版本内容失败')
        }
        
        if (diffResponse.status === 'fulfilled' && diffResponse.value && diffResponse.value.code === 200) {
          this.versionDiff = diffResponse.value.data
          console.log('[selectCompareSlot] 差异数据:', this.versionDiff)
        } else {
          console.warn('[selectCompareSlot] 获取差异数据失败:', diffResponse)
        }
      } catch (error) {
        console.error('[selectCompareSlot] 加载失败:', error)
        this.$message?.error('加载版本内容失败：' + (error.message || '请重试'))
      } finally {
        this.loadingVersionCompare = false
      }
    },
    
    /**
     * 同步左右滚动
     */
    syncScroll(source, event) {
      if (this.isScrolling) return
      
      this.isScrolling = true
      
      const sourcePanel = source === 'left' ? this.$refs.leftScrollPanel : this.$refs.rightScrollPanel
      const targetPanel = source === 'left' ? this.$refs.rightScrollPanel : this.$refs.leftScrollPanel
      
      if (sourcePanel && targetPanel) {
        const scrollTop = sourcePanel.scrollTop
        const scrollHeight = sourcePanel.scrollHeight
        const clientHeight = sourcePanel.clientHeight
        const maxScroll = scrollHeight - clientHeight
        
        // 计算滚动比例
        const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0
        
        // 同步到另一个面板
        const targetScrollHeight = targetPanel.scrollHeight
        const targetClientHeight = targetPanel.clientHeight
        const targetMaxScroll = targetScrollHeight - targetClientHeight
        
        if (targetMaxScroll > 0) {
          targetPanel.scrollTop = scrollRatio * targetMaxScroll
        }
      }
      
      // 使用 nextTick 确保滚动完成后再允许下一次同步
      this.$nextTick(() => {
        this.isScrolling = false
      })
    },
    
    /**
     * 格式化差异内容显示
     */
    formatDiffContent(content, diffData, side) {
      console.log('[formatDiffContent] side:', side, 'content length:', content?.length, 'activeDocContent length:', this.activeDocContent?.length, 'compareVersionContent length:', this.compareVersionContent?.length)
      
      // 获取两个版本的内容用于对比
      const leftLines = this.activeDocContent ? this.activeDocContent.split('\n') : []
      const rightLines = this.compareVersionContent ? this.compareVersionContent.split('\n') : []
      const lines = content ? content.split('\n') : []
      
      console.log('[formatDiffContent] leftLines:', leftLines.length, 'rightLines:', rightLines.length, 'current lines:', lines.length)
      
      let diffMap = {}
      
      // 解析差异数据
      if (diffData) {
        // 如果是字符串格式的unified diff
        if (typeof diffData === 'string' && diffData.trim()) {
          const diffLines = diffData.split('\n')
          diffMap = this.parseDiff(diffLines, side)
          console.log('[formatDiffContent] parsed diffMap (string):', diffMap)
        }
        // 如果是对象格式
        else if (typeof diffData === 'object') {
          // 如果包含lines数组
          if (Array.isArray(diffData.lines)) {
            diffData.lines.forEach((diffLine, index) => {
              if (diffLine && diffLine.type) {
                diffMap[index] = diffLine.type
              }
            })
            console.log('[formatDiffContent] parsed diffMap (lines array):', diffMap)
          }
          // 如果包含diff字符串
          else if (diffData.diff && typeof diffData.diff === 'string') {
            const diffLines = diffData.diff.split('\n')
            diffMap = this.parseDiff(diffLines, side)
            console.log('[formatDiffContent] parsed diffMap (diff string):', diffMap)
          }
        }
      }
      
      // 始终使用内容对比生成差异（不依赖后端差异数据）
      // 强制重新计算，确保对比当前显示的内容和存档内容
      if (leftLines.length > 0 || rightLines.length > 0) {
        // 总是使用内容对比生成差异，确保准确性
        diffMap = this.simpleLineDiff(leftLines, rightLines, side)
        console.log('[formatDiffContent] generated diffMap (simple diff):', Object.keys(diffMap).length, 'entries')
        
        // 统计差异数量并显示前几个差异行的索引
        const added = Object.entries(diffMap).filter(([idx, v]) => v === 'added').map(([idx]) => parseInt(idx))
        const removed = Object.entries(diffMap).filter(([idx, v]) => v === 'removed').map(([idx]) => parseInt(idx))
        const unchanged = Object.values(diffMap).filter(v => v === 'unchanged').length
        console.log('[formatDiffContent] diff stats - added:', added.length, 'lines:', added.slice(0, 10), 'removed:', removed.length, 'lines:', removed.slice(0, 10), 'unchanged:', unchanged)
      }
      
      // 将内容按行分割并添加高亮（使用内联样式确保生效）
      const linesWithDiff = lines.map((line, index) => {
        let diffType = diffMap[index]
        const escapedLine = this.escapeHtml(line || '')
        const isEmpty = !line || line.trim() === ''
        
        // 强制：空行始终标记为unchanged，不显示高亮
        if (isEmpty) {
          diffType = 'unchanged'
        }
        
        // 如果没有diffType，默认为unchanged
        if (!diffType) {
          diffType = 'unchanged'
        }
        
        // 使用内联样式确保高亮显示
        // 左边（当前版本）：added = 当前版本新增的（绿色）
        // 右边（存档版本）：removed = 当前版本删除的（红色）
        if (diffType === 'added' && side === 'left' && !isEmpty) {
          return `<div class="diff-line diff-added" data-line="${index}" data-type="added" style="background-color: #d1fae5; border-left: 5px solid #10b981; padding: 4px 12px; margin: 0; white-space: pre-wrap; word-break: break-word; display: block; min-height: 22px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13px; line-height: 1.8;">${escapedLine || '\u00A0'}</div>`
        } else if (diffType === 'removed' && side === 'right' && !isEmpty) {
          return `<div class="diff-line diff-removed" data-line="${index}" data-type="removed" style="background-color: #fee2e2; border-left: 5px solid #ef4444; padding: 4px 12px; margin: 0; white-space: pre-wrap; word-break: break-word; display: block; min-height: 22px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13px; line-height: 1.8;">${escapedLine || '\u00A0'}</div>`
        } else {
          // 其他情况（包括空行和unchanged）都显示为白色背景，无高亮
          return `<div class="diff-line diff-unchanged" data-line="${index}" data-type="unchanged" style="background-color: #ffffff; border-left: 5px solid transparent; padding: 4px 12px; margin: 0; white-space: pre-wrap; word-break: break-word; display: block; min-height: 22px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13px; line-height: 1.8;">${escapedLine || '\u00A0'}</div>`
        }
      })
      
      // 统计实际生成的差异行
      const addedLines = linesWithDiff.filter((line, idx) => diffMap[idx] === 'added' && side === 'left').length
      const removedLines = linesWithDiff.filter((line, idx) => diffMap[idx] === 'removed' && side === 'right').length
      console.log('[formatDiffContent] generated HTML with', linesWithDiff.length, 'lines, added:', addedLines, 'removed:', removedLines)
      
      return linesWithDiff.join('')
    },
    
    /**
     * 简单的行级别差异对比（使用LCS算法思路，忽略空行位置差异）
     */
    simpleLineDiff(leftLines, rightLines, side) {
      const diffMap = {}
      
      // 过滤掉空行，只对比有内容的行
      const leftNonEmpty = leftLines.map((line, idx) => ({ line: line.trim(), originalIdx: idx })).filter(item => item.line !== '')
      const rightNonEmpty = rightLines.map((line, idx) => ({ line: line.trim(), originalIdx: idx })).filter(item => item.line !== '')
      
      const leftLength = leftNonEmpty.length
      const rightLength = rightNonEmpty.length
      
      // 创建匹配矩阵（只匹配非空行）
      const dp = []
      for (let i = 0; i <= leftLength; i++) {
        dp[i] = []
        for (let j = 0; j <= rightLength; j++) {
          if (i === 0 || j === 0) {
            dp[i][j] = 0
          } else if (leftNonEmpty[i - 1].line === rightNonEmpty[j - 1].line) {
            dp[i][j] = dp[i - 1][j - 1] + 1
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
          }
        }
      }
      
      // 回溯找出匹配的非空行
      const matched = new Set()
      let i = leftLength
      let j = rightLength
      while (i > 0 && j > 0) {
        if (leftNonEmpty[i - 1].line === rightNonEmpty[j - 1].line) {
          matched.add(`${leftNonEmpty[i - 1].originalIdx}-${rightNonEmpty[j - 1].originalIdx}`)
          i--
          j--
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
          i--
        } else {
          j--
        }
      }
      
      // 标记差异（只标记非空行的差异，空行都标记为unchanged）
      // 左边（当前版本）：如果当前版本有但存档版本没有，标记为 'added'（绿色，表示新增）
      // 右边（存档版本）：如果存档版本有但当前版本没有，标记为 'removed'（红色，表示删除）
      if (side === 'left') {
        for (let idx = 0; idx < leftLines.length; idx++) {
          const line = leftLines[idx]
          const isEmpty = !line || line.trim() === ''
          
          // 空行都标记为unchanged
          if (isEmpty) {
            diffMap[idx] = 'unchanged'
            continue
          }
          
          // 检查非空行是否在右侧有匹配
          let found = false
          for (let jdx = 0; jdx < rightLines.length; jdx++) {
            if (matched.has(`${idx}-${jdx}`)) {
              diffMap[idx] = 'unchanged'
              found = true
              break
            }
          }
          // 当前版本有但存档版本没有 = 新增（绿色）
          if (!found) {
            diffMap[idx] = 'added'
          }
        }
      } else {
        for (let idx = 0; idx < rightLines.length; idx++) {
          const line = rightLines[idx]
          const isEmpty = !line || line.trim() === ''
          
          // 空行都标记为unchanged
          if (isEmpty) {
            diffMap[idx] = 'unchanged'
            continue
          }
          
          // 检查非空行是否在左侧有匹配
          let found = false
          for (let jdx = 0; jdx < leftLines.length; jdx++) {
            if (matched.has(`${jdx}-${idx}`)) {
              diffMap[idx] = 'unchanged'
              found = true
              break
            }
          }
          // 存档版本有但当前版本没有 = 删除（红色）
          if (!found) {
            diffMap[idx] = 'removed'
          }
        }
      }
      
      // 验证：检查是否有实际差异
      const addedCount = Object.values(diffMap).filter(v => v === 'added').length
      const removedCount = Object.values(diffMap).filter(v => v === 'removed').length
      console.log('[simpleLineDiff] side:', side, 'leftLines:', leftLines.length, 'rightLines:', rightLines.length, 'leftNonEmpty:', leftLength, 'rightNonEmpty:', rightLength, 'matched pairs:', matched.size, 'added:', addedCount, 'removed:', removedCount)
      
      return diffMap
    },
    
    /**
     * 解析unified diff格式
     */
    parseDiff(diffLines, side) {
      const diffMap = {}
      let leftLineIndex = -1
      let rightLineIndex = -1
      
      for (let i = 0; i < diffLines.length; i++) {
        const line = diffLines[i]
        
        // 跳过文件头信息
        if (line.startsWith('---') || line.startsWith('+++')) {
          continue
        }
        
        // 匹配 @@ 开头的行号信息行
        if (line.startsWith('@@')) {
          const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/)
          if (match) {
            leftLineIndex = parseInt(match[1]) - 1
            rightLineIndex = parseInt(match[3]) - 1
          }
          continue
        }
        
        // 处理差异行
        // unified diff 格式：- 表示左侧（原始版本/旧版本），+ 表示右侧（新版本）
        // 我们的场景：左边面板=当前版本（新），右边面板=存档版本（旧）
        // 在 unified diff 中：leftLineIndex 对应旧版本，rightLineIndex 对应新版本
        // 所以：+ 行（新版本）应该在左边面板显示为 added（绿色），- 行（旧版本）应该在右边面板显示为 removed（红色）
        if (line.startsWith('+') && !line.startsWith('+++')) {
          // + 表示新版本新增的行（相对于旧版本）
          const content = line.substring(1)
          const isEmpty = !content || content.trim() === ''
          
          // 空行标记为unchanged，不标记为added
          if (isEmpty) {
            if (side === 'left') {
              diffMap[rightLineIndex] = 'unchanged'
            }
          } else {
            // + 行在左边面板（当前版本，新版本）显示为 added（绿色）
            // rightLineIndex 对应新版本的行号
            if (side === 'left') {
              diffMap[rightLineIndex] = 'added'
            }
          }
          rightLineIndex++
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          // - 表示旧版本删除的行（相对于新版本，即新版本没有的）
          const content = line.substring(1)
          const isEmpty = !content || content.trim() === ''
          
          // 空行标记为unchanged，不标记为removed
          if (isEmpty) {
            if (side === 'right') {
              diffMap[leftLineIndex] = 'unchanged'
            }
          } else {
            // - 行在右边面板（存档版本，旧版本）显示为 removed（红色）
            // leftLineIndex 对应旧版本的行号
            if (side === 'right') {
              diffMap[leftLineIndex] = 'removed'
            }
          }
          leftLineIndex++
        } else if (line.startsWith(' ') || line === '') {
          // 未变化的行（包括空行）
          // 两边都有这一行，所以两边都标记为unchanged
          if (side === 'left') {
            diffMap[rightLineIndex] = 'unchanged'
          } else {
            diffMap[leftLineIndex] = 'unchanged'
          }
          leftLineIndex++
          rightLineIndex++
        }
      }
      
      console.log('[parseDiff] side:', side, 'diffMap:', diffMap)
      return diffMap
    },
    
    /**
     * HTML转义
     */
    escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
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
    },

    /**
     * 格式化Markdown内容为HTML
     */
    formatMarkdown(content) {
      if (!content) return ''

      let formatted = content

      // 先保存代码块，避免被其他规则影响
      const codeBlocks = []
      formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const id = `__CODE_BLOCK_${codeBlocks.length}__`
        codeBlocks.push({
          id,
          lang: lang || 'text',
          code: code.trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
        })
        return id
      })

      // 转义HTML特殊字符
      formatted = formatted
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      // 恢复代码块
      codeBlocks.forEach(block => {
        formatted = formatted.replace(block.id, `<pre class="markdown-code-block"><code class="language-${block.lang}">${block.code}</code></pre>`)
      })

      // 行内代码（必须在代码块之后处理）
      formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="markdown-inline-code">$1</code>')

      // 标题（从大到小处理，避免冲突）
      formatted = formatted.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
      formatted = formatted.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
      formatted = formatted.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
      formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

      // 粗体（** 和 __）
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>')

      // 斜体（单个 * 和 _，简单处理）
      // 注意：这里不处理斜体，因为容易与粗体和列表冲突
      // 如果需要支持斜体，可以使用更复杂的解析逻辑

      // 删除线
      formatted = formatted.replace(/~~([^~]+)~~/g, '<del>$1</del>')

      // 链接
      formatted = formatted.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

      // 图片
      formatted = formatted.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />')

      // 水平分割线
      formatted = formatted.replace(/^---$/gm, '<hr class="markdown-hr" />')
      formatted = formatted.replace(/^\*\*\*$/gm, '<hr class="markdown-hr" />')
      formatted = formatted.replace(/^___$/gm, '<hr class="markdown-hr" />')

      // 处理列表
      const lines = formatted.split('\n')
      let inList = false
      let listType = null
      let result = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/)
        const unorderedMatch = line.match(/^[\*\-\+]\s+(.+)$/)

        // 跳过代码块和标题行
        if (line.includes('markdown-code-block') || line.match(/^<h[1-6]>/)) {
          if (inList) {
            result.push(`</${listType}>`)
            inList = false
            listType = null
          }
          result.push(line)
          continue
        }

        if (orderedMatch) {
          if (!inList || listType !== 'ol') {
            if (inList) result.push(`</${listType}>`)
            result.push('<ol>')
            inList = true
            listType = 'ol'
          }
          result.push(`<li>${orderedMatch[2]}</li>`)
        } else if (unorderedMatch) {
          if (!inList || listType !== 'ul') {
            if (inList) result.push(`</${listType}>`)
            result.push('<ul>')
            inList = true
            listType = 'ul'
          }
          result.push(`<li>${unorderedMatch[1]}</li>`)
        } else {
          if (inList) {
            result.push(`</${listType}>`)
            inList = false
            listType = null
          }
          result.push(line)
        }
      }
      if (inList) result.push(`</${listType}>`)

      formatted = result.join('\n')

      // 段落处理（将连续的非空行包裹成段落）
      formatted = formatted.split('\n\n').map(para => {
        para = para.trim()
        if (!para) return ''
        // 如果已经是HTML标签（h1-h6, pre, ul, ol, hr, p），不包裹
        if (/^<(h[1-6]|pre|ul|ol|hr|p)/.test(para)) return para
        // 如果包含列表，不包裹
        if (para.includes('<ul>') || para.includes('<ol>')) return para
        return `<p>${para}</p>`
      }).join('\n')

      // 单个换行转换为 <br>（但不在代码块和列表内）
      formatted = formatted.replace(/\n/g, '<br>')

      return formatted
    },

    /**
     * 导出文档为Markdown文件
     */
    exportDocument() {
      if (!this.activeDoc) {
        this.$message?.error('没有可导出的文档')
        return
      }

      try {
        // 获取当前文档内容（使用最新的内容，包括未保存的修改）
        const content = this.activeDocContent || this.activeDoc.content || ''
        const fileName = `${this.activeDoc.title || '未命名文档'}.md`

        // 创建Blob对象
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })

        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.style.display = 'none'

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 释放URL对象
        URL.revokeObjectURL(url)

        console.log('[exportDocument] 文档导出成功:', fileName)
        this.$message?.success('文档导出成功！')
      } catch (error) {
        console.error('[exportDocument] 导出文档失败:', error)
        this.$message?.error('导出文档失败，请重试')
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
  position: relative;
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
.export-btn {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 68, 204, 0.2);
}
.export-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0044CC 0%, #003399 100%);
  box-shadow: 0 4px 12px rgba(0, 68, 204, 0.3);
  transform: translateY(-1px);
}
.export-btn:active:not(:disabled) {
  transform: translateY(0);
}
.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.export-btn svg {
  flex-shrink: 0;
}
/* Markdown渲染视图 */
.markdown-viewer {
  flex: 1; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  background-color: #fff;
  overflow-y: auto;
  min-height: 0;
}

.markdown-viewer :deep(h1) {
  font-size: 28px;
  font-weight: 700;
  margin: 24px 0 16px;
  color: #1e293b;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.markdown-viewer :deep(h2) {
  font-size: 24px;
  font-weight: 700;
  margin: 20px 0 12px;
  color: #1e293b;
}

.markdown-viewer :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 10px;
  color: #374151;
}

.markdown-viewer :deep(h4) {
  font-size: 18px;
  font-weight: 600;
  margin: 14px 0 8px;
  color: #4b5563;
}

.markdown-viewer :deep(h5) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 6px;
  color: #6b7280;
}

.markdown-viewer :deep(h6) {
  font-size: 14px;
  font-weight: 600;
  margin: 10px 0 4px;
  color: #9ca3af;
}

.markdown-viewer :deep(p) {
  margin: 8px 0;
  line-height: 1.8;
}

.markdown-viewer :deep(strong) {
  font-weight: 700;
  color: #1e293b;
}

.markdown-viewer :deep(em) {
  font-style: italic;
}

.markdown-viewer :deep(del) {
  text-decoration: line-through;
  color: #9ca3af;
}

.markdown-viewer :deep(ul),
.markdown-viewer :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.markdown-viewer :deep(li) {
  margin: 6px 0;
  line-height: 1.6;
}

.markdown-viewer :deep(ul li) {
  list-style-type: disc;
}

.markdown-viewer :deep(ol li) {
  list-style-type: decimal;
}

.markdown-viewer :deep(a) {
  color: #5EB6E4;
  text-decoration: none;
  border-bottom: 1px solid #5EB6E4;
  transition: all 0.2s;
}

.markdown-viewer :deep(a:hover) {
  color: #0044CC;
  border-bottom-color: #0044CC;
}

.markdown-viewer :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.markdown-viewer :deep(.markdown-code-block) {
  background-color: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 13px; 
  line-height: 1.5;
}

.markdown-viewer :deep(.markdown-code-block code) {
  background: transparent;
  padding: 0;
  font-size: inherit;
}

.markdown-viewer :deep(.markdown-inline-code) {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 0.9em;
  color: #ef4444;
}

.markdown-viewer :deep(.markdown-hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 24px 0;
}

.markdown-viewer :deep(blockquote) {
  border-left: 4px solid #5EB6E4;
  padding-left: 16px;
  margin: 16px 0;
  color: #6b7280;
  font-style: italic;
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
  background-color: #fff;
  color: #111827;
  font-family: 'Courier New', Consolas, monospace;
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

/* 版本历史对话框样式 */
.version-history-dialog {
  max-width: 850px;
  max-height: 85vh;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.version-history-dialog .dialog-header {
  background: #ffffff;
  color: #1e293b;
  border-bottom: 2px solid #f1f5f9;
  padding: 24px 28px;
}

.version-history-dialog .dialog-header h3 {
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.version-history-dialog .dialog-header h3::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 2px;
}

.version-history-dialog .close-btn {
  color: #64748b;
  opacity: 0.8;
}

.version-history-dialog .close-btn:hover {
  opacity: 1;
  background: #f1f5f9;
  border-radius: 50%;
  color: #1e293b;
}

.version-history-dialog .dialog-content {
  padding: 28px;
  background: #ffffff;
}

/* 存档位样式 */
.archive-slots {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 0;
}

.archive-slot {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
}

.archive-slot::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.archive-slot:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.archive-slot:hover::before {
  opacity: 1;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.slot-number {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-small.danger {
  background: #ffffff;
  color: #dc2626;
  border: 1px solid #fecaca;
  box-shadow: none;
  transition: all 0.2s ease;
}

.btn-small.danger:hover {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
  transform: none;
}

.slot-content {
  padding: 20px;
}

.slot-content.filled {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  gap: 20px;
}

.slot-content.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 32px 24px;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.slot-content.empty:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.empty-slot-message {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.slot-info {
  flex: 1;
  min-width: 0;
}

.slot-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
  word-break: break-word;
}

.slot-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.slot-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-weight: 500;
}

.slot-desc {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-left: 3px solid #cbd5e1;
  border-radius: 4px;
}

.slot-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* 分隔线 */
.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);
  margin: 24px 0;
}

/* 版本历史区域 */
.version-history-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.loading-indicator {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #5EB6E4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.version-list {
  max-height: 500px;
  overflow-y: auto;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.version-item:hover {
  background: #f9fafb;
  border-color: #5EB6E4;
  transform: translateX(4px);
}

.version-info {
  flex: 1;
}

.version-number {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.version-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.version-author {
  font-weight: 500;
}

.version-time {
  color: #9ca3af;
}

.version-desc {
  font-size: 13px;
  color: #4b5563;
  font-style: italic;
  margin-top: 6px;
}

.version-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  height: 34px;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  color: #475569;
  box-shadow: none;
}

.btn-small:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
  transform: none;
}

.btn-small.primary {
  background: #1e293b;
  color: white;
  border-color: #1e293b;
  box-shadow: none;
}

.btn-small.primary:hover {
  background: #334155;
  border-color: #334155;
  transform: none;
}

/* 版本对比对话框样式 */
.version-compare-dialog {
  max-width: 1400px;
  width: 95vw;
  max-height: 90vh;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

/* 对比存档位选择 */
.compare-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.compare-slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.compare-slot-item:hover {
  border-color: #5EB6E4;
  box-shadow: 0 4px 12px rgba(94, 182, 228, 0.15);
  transform: translateY(-2px);
}

.compare-slot-item.selected {
  border-color: #5EB6E4;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
  box-shadow: 0 4px 12px rgba(94, 182, 228, 0.25);
}

.compare-slot-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.slot-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #5EB6E4 0%, #0044CC 100%);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.slot-details {
  flex: 1;
}

.slot-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.slot-time {
  font-size: 12px;
  color: #6b7280;
}

.check-icon {
  font-size: 24px;
  color: #5EB6E4;
  font-weight: bold;
}

.empty-compare-hint {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
}

.hint-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 16px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
  font-size: 14px;
}

.compare-actions {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}

.version-diff {
  margin-top: 20px;
}

.version-diff h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.diff-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.diff-legend .added {
  color: #16a34a;
}

.diff-legend .removed {
  color: #dc2626;
}

.diff-legend .unchanged {
  color: #6b7280;
}

.diff-content {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.version-compare-dialog .dialog-content {
  padding: 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 版本对比显示区域 */
.version-compare-viewer {
  display: flex;
  gap: 1px;
  flex: 1;
  min-height: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #e2e8f0;
}

.compare-panel-left,
.compare-panel-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #ffffff;
}

.compare-panel-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.compare-panel-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 16px;
}

.compare-panel-content .markdown-viewer {
  height: 100%;
  overflow-y: auto;
}

/* 差异显示样式 */
.diff-viewer {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  background: #ffffff;
}

.diff-line {
  padding: 4px 12px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  display: block;
  min-height: 22px;
  border-left: 5px solid transparent;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  background-color: #ffffff;
}

.diff-line.diff-added {
  background-color: #d1fae5 !important;
  border-left-color: #10b981 !important;
  border-left-width: 5px !important;
}

.diff-line.diff-added:empty,
.diff-line.diff-added:empty::before {
  content: '\00A0';
  display: inline-block;
}

.diff-line.diff-removed {
  background-color: #fee2e2 !important;
  border-left-color: #ef4444 !important;
  border-left-width: 5px !important;
}

.diff-line.diff-removed:empty,
.diff-line.diff-removed:empty::before {
  content: '\00A0';
  display: inline-block;
}

.diff-line.diff-unchanged {
  background-color: #ffffff;
  border-left-color: transparent;
}

/* 确保差异行样式优先级 - 使用更高优先级选择器 */
.version-compare-viewer .compare-panel-content .diff-viewer .diff-line.diff-added,
.version-compare-viewer .compare-panel-left .diff-viewer .diff-line.diff-added,
.version-compare-viewer .compare-panel-right .diff-viewer .diff-line.diff-added {
  background-color: #d1fae5 !important;
  border-left-color: #10b981 !important;
  border-left-width: 5px !important;
}

.version-compare-viewer .compare-panel-content .diff-viewer .diff-line.diff-removed,
.version-compare-viewer .compare-panel-left .diff-viewer .diff-line.diff-removed,
.version-compare-viewer .compare-panel-right .diff-viewer .diff-line.diff-removed {
  background-color: #fee2e2 !important;
  border-left-color: #ef4444 !important;
  border-left-width: 5px !important;
}

/* 确保data-type属性的样式生效 */
.diff-viewer [data-type="added"].diff-added {
  background-color: #d1fae5 !important;
  border-left-color: #10b981 !important;
}

.diff-viewer [data-type="removed"].diff-removed {
  background-color: #fee2e2 !important;
  border-left-color: #ef4444 !important;
}

/* 保存到存档位对话框 */
.save-slot-dialog {
  max-width: 550px;
}

/* 存档位选择器 */
.slot-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.slot-option {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.slot-option:hover {
  border-color: #5EB6E4;
  box-shadow: 0 4px 12px rgba(94, 182, 228, 0.15);
  transform: translateY(-2px);
}

.slot-option.selected {
  border-color: #5EB6E4;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
  box-shadow: 0 4px 12px rgba(94, 182, 228, 0.25);
}

.slot-option.occupied {
  background: #fef3c7;
}

.slot-option.occupied.selected {
  background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
  border-color: #f59e0b;
}

.slot-option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slot-option-number {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.slot-option-status {
  color: #10b981;
  display: flex;
  align-items: center;
}

.slot-option-content {
  font-size: 13px;
}

.slot-option-content.empty {
  color: #9ca3af;
  text-align: center;
  padding: 8px 0;
}

.empty-slot-hint {
  font-style: italic;
}

.slot-option-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.slot-option-time {
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 6px;
}

.overwrite-hint {
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}

/* 查看版本内容对话框样式 */
.version-view-dialog {
  max-width: 950px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.version-view-dialog .dialog-header {
  background: #ffffff;
  color: #1e293b;
  border-bottom: 2px solid #f1f5f9;
  padding: 10px 18px;
  position: relative;
  flex-shrink: 0;
}

.version-view-dialog .dialog-header h3 {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-view-dialog .dialog-header h3::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 2px;
}

.version-view-dialog .close-btn {
  color: #64748b;
  opacity: 0.8;
}

.version-view-dialog .close-btn:hover {
  opacity: 1;
  background: #f1f5f9;
  border-radius: 50%;
  color: #1e293b;
}

.version-view-dialog .dialog-content {
  padding: 8px 18px;
  background: #ffffff;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.version-info-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 0;
  border: 1px solid #e2e8f0;
  position: relative;
  flex-shrink: 0;
}

.version-info-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #6366f1;
  border-radius: 8px 0 0 8px;
}

.version-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 2px 0;
}

.info-label {
  font-weight: 600;
  color: #64748b;
  min-width: 70px;
  font-size: 12px;
}

.info-value {
  color: #1e293b;
  font-weight: 500;
  padding: 4px 10px;
  background: #ffffff;
  border-radius: 4px;
  flex: 1;
  border: 1px solid #e2e8f0;
}

.version-content-viewer {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.version-content-viewer .markdown-viewer {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 32px 40px;
  background: #ffffff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
  flex: 1;
  min-height: 100%;
}

.version-view-dialog .dialog-footer {
  padding: 10px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
}
</style>