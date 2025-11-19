/**
 * 成果数据转换工具函数
 * 用于前端数据与后端DTO之间的转换
 */

import { TYPE_MAPPING, TYPE_DISPLAY } from '@/api/knowledge'
import { getTypeClass } from '@/utils/catalogHelpers'
import { authAPI } from '@/api/auth'

/**
 * 将前端成果表单数据转换为后端DTO
 * @param {Object} formData - 前端表单数据
 * @param {Number} projectId - 项目ID
 * @param {String} fileType - 文件类型（中文）
 * @returns {Object} 后端DTO
 */
export function convertToCreateDTO(formData, projectId, fileType) {
  // 构建基础DTO
  const dto = {
    projectId: projectId,
    title: formData.name,
    type: TYPE_MAPPING[fileType] || 'custom',
    status: 'draft', // 默认为草稿状态
    isPublic: formData.isPublic !== undefined ? formData.isPublic : false // 公开性，默认为私有
  }

  // 构建detailData（详细信息）
  const detailData = {}
  
  // 根据类型添加相应的详细字段
  if (fileType === '论文') {
    if (formData.paperAuthors) detailData.authors = formData.paperAuthors.split(',').map(s => s.trim())
    if (formData.paperTitle) detailData.title = formData.paperTitle
    if (formData.journalName) detailData.journal = formData.journalName
    if (formData.publishYear) detailData.publishYear = parseInt(formData.publishYear) || null
    if (formData.volume) detailData.volume = formData.volume
    if (formData.issue) detailData.issue = formData.issue
  } else if (fileType === '专利') {
    if (formData.patentNumber) detailData.patentNo = formData.patentNumber
    if (formData.patentType) detailData.patentType = formData.patentType
    if (formData.patentName) detailData.patentName = formData.patentName
    if (formData.inventors) detailData.inventors = formData.inventors.split(',').map(s => s.trim())
    if (formData.applicants) detailData.applicants = formData.applicants
  } else if (fileType === '数据集') {
    if (formData.datasetVersion) detailData.version = formData.datasetVersion
    if (formData.datasetName) detailData.datasetName = formData.datasetName
    if (formData.datasetFormat) detailData.format = formData.datasetFormat
    if (formData.datasetSize) detailData.size = formData.datasetSize
    if (formData.datasetSource) detailData.source = formData.datasetSource
  } else if (fileType === '模型文件') {
    if (formData.modelFramework) detailData.framework = formData.modelFramework
    if (formData.modelName) detailData.modelName = formData.modelName
    if (formData.modelVersion) detailData.version = formData.modelVersion
    if (formData.modelType) detailData.modelType = formData.modelType
    if (formData.hyperparameters) detailData.hyperparameters = formData.hyperparameters
  } else if (fileType === '实验报告') {
    if (formData.reportType) detailData.reportType = formData.reportType
    if (formData.reportName) detailData.reportName = formData.reportName
    if (formData.reportDate) detailData.reportDate = formData.reportDate
  }

  // 如果有详细信息，添加到DTO
  if (Object.keys(detailData).length > 0) {
    dto.detailData = detailData
  }

  // 关联任务ID列表（可选），用于后端 TaskResultDetailDTO.linkedTaskIds
  if (Array.isArray(formData.linkedTaskIds) && formData.linkedTaskIds.length > 0) {
    dto.linkedTaskIds = formData.linkedTaskIds
  }

  return dto
}

/**
 * 将后端DTO转换为前端显示数据
 * @param {Object} dto - 后端DTO
 * @returns {Object} 前端显示数据
 */
export function convertFromDTO(dto) {
  // 尝试从多个可能的字段获取上传者信息（字符串类型）
  // 注意：如果creatorName是null（不是undefined），需要特殊处理
  let uploader = null
  
  // 优先使用creatorName（但要排除null和空字符串）
  if (dto.creatorName && typeof dto.creatorName === 'string' && dto.creatorName.trim() !== '') {
    uploader = dto.creatorName
  } else {
    // 尝试其他字段
    uploader = dto.creator || 
               dto.uploader ||
               dto.username ||
               dto.userName
  }
  
  // 检查是否有嵌套的用户对象
  if (!uploader || uploader === '未知用户' || (typeof uploader === 'string' && uploader.trim && uploader.trim() === '')) {
    // 尝试从嵌套对象获取
    if (dto.creatorUser && typeof dto.creatorUser === 'object') {
      uploader = dto.creatorUser.name || dto.creatorUser.username || dto.creatorUser.nickname
    } else if (dto.createdByUser && typeof dto.createdByUser === 'object') {
      uploader = dto.createdByUser.name || dto.createdByUser.username || dto.createdByUser.nickname
    } else if (dto.creatorInfo && typeof dto.creatorInfo === 'object') {
      uploader = dto.creatorInfo.name || dto.creatorInfo.username || dto.creatorInfo.nickname
    }
  }
  
  // 如果仍然没有上传者信息，但有creatorId，设置为'未知用户'（组件会异步获取）
  // 如果没有creatorId也没有uploader，也设置为'未知用户'
  if (!uploader || uploader === '未知用户' || (typeof uploader === 'string' && uploader.trim() === '')) {
    // 如果有creatorId，组件会异步获取，这里先设置为'未知用户'
    uploader = '未知用户'
  }
  
  // 确保uploader不是undefined或null（统一处理为字符串）
  if (!uploader) {
    uploader = '未知用户'
  }
  
  const frontendData = {
    id: dto.id,
    name: dto.title,
    type: TYPE_DISPLAY[dto.type] || dto.type,
    typeCls: getTypeClass(TYPE_DISPLAY[dto.type] || dto.type),
    uploader: uploader,
    creatorId: dto.creatorId, // 保存creatorId以便异步获取用户名
    time: formatDateTime(dto.createdAt),
    fileCount: dto.fileCount || 0,
    isPublic: dto.isPublic || false, // 公开性
    files: [] // 列表DTO不包含文件列表，留空
  }

  // 处理详细信息
  if (dto.detailData) {
    const detail = dto.detailData
    
    if (dto.type === 'paper') {
      frontendData.paperAuthors = Array.isArray(detail.authors) ? detail.authors.join(', ') : detail.authors
      frontendData.paperTitle = detail.title
      frontendData.journalName = detail.journal
      frontendData.publishYear = detail.publishYear
      frontendData.volume = detail.volume
      frontendData.issue = detail.issue
    } else if (dto.type === 'patent') {
      frontendData.patentNumber = detail.patentNo
      frontendData.patentType = detail.patentType
      frontendData.patentName = detail.patentName
      frontendData.inventors = Array.isArray(detail.inventors) ? detail.inventors.join(', ') : detail.inventors
      frontendData.applicants = detail.applicants
    } else if (dto.type === 'dataset') {
      frontendData.datasetVersion = detail.version
      frontendData.datasetName = detail.datasetName
      frontendData.datasetFormat = detail.format
      frontendData.datasetSize = detail.size
      frontendData.datasetSource = detail.source
    } else if (dto.type === 'model') {
      frontendData.modelFramework = detail.framework
      frontendData.modelName = detail.modelName
      frontendData.modelVersion = detail.version
      frontendData.modelType = detail.modelType
      frontendData.hyperparameters = detail.hyperparameters
    } else if (dto.type === 'report') {
      frontendData.reportType = detail.reportType
      frontendData.reportName = detail.reportName
      frontendData.reportDate = detail.reportDate
    }
  }

  return frontendData
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateString) {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

/**
 * 将前端编辑表单转换为后端字段更新对象
 * @param {Object} editForm - 编辑表单数据
 * @param {String} achievementType - 成果类型（中文）
 * @returns {Object} 后端字段更新对象
 */
export function convertEditFormToFieldUpdates(editForm, achievementType) {
  const fieldUpdates = {}
  
  if (achievementType === '论文') {
    if (editForm.paperAuthors) fieldUpdates.authors = editForm.paperAuthors.split(',').map(s => s.trim())
    if (editForm.paperTitle) fieldUpdates.title = editForm.paperTitle
    if (editForm.journalName) fieldUpdates.journal = editForm.journalName
    if (editForm.publishYear) fieldUpdates.publishYear = parseInt(editForm.publishYear) || null
    if (editForm.volume) fieldUpdates.volume = editForm.volume
    if (editForm.issue) fieldUpdates.issue = editForm.issue
  } else if (achievementType === '专利') {
    if (editForm.patentNumber) fieldUpdates.patentNo = editForm.patentNumber
    if (editForm.patentType) fieldUpdates.patentType = editForm.patentType
    if (editForm.patentName) fieldUpdates.patentName = editForm.patentName
    if (editForm.inventors) fieldUpdates.inventors = editForm.inventors.split(',').map(s => s.trim())
    if (editForm.applicants) fieldUpdates.applicants = editForm.applicants
  } else if (achievementType === '数据集') {
    if (editForm.datasetVersion) fieldUpdates.version = editForm.datasetVersion
    if (editForm.datasetName) fieldUpdates.datasetName = editForm.datasetName
    if (editForm.datasetFormat) fieldUpdates.format = editForm.datasetFormat
    if (editForm.datasetSize) fieldUpdates.size = editForm.datasetSize
    if (editForm.datasetSource) fieldUpdates.source = editForm.datasetSource
  } else if (achievementType === '模型文件') {
    if (editForm.modelFramework) fieldUpdates.framework = editForm.modelFramework
    if (editForm.modelName) fieldUpdates.modelName = editForm.modelName
    if (editForm.modelVersion) fieldUpdates.version = editForm.modelVersion
    if (editForm.modelType) fieldUpdates.modelType = editForm.modelType
    if (editForm.hyperparameters) fieldUpdates.hyperparameters = editForm.hyperparameters
  } else if (achievementType === '实验报告') {
    if (editForm.reportType) fieldUpdates.reportType = editForm.reportType
    if (editForm.reportName) fieldUpdates.reportName = editForm.reportName
    if (editForm.reportDate) fieldUpdates.reportDate = editForm.reportDate
  }
  
  return fieldUpdates
}

