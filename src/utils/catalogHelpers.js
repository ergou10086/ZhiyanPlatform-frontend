/**
 * 成果目录相关的工具函数
 */

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取文件图标
 */
export function getFileIcon(fileName) {
  const name = fileName || 'unknown'
  const extension = getFileExtension(name).toLowerCase()
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
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename) {
  return filename.split('.').pop() || ''
}

/**
 * 根据文件扩展名获取MIME类型
 */
export function getMimeType(extension) {
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
}

/**
 * 获取文件类型显示名称
 */
export function getFileTypeDisplay(mimeType) {
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

/**
 * 获取成果类型对应的CSS类
 */
export function getTypeClass(type) {
  const typeMap = {
    '论文': 'doc',
    '专利': 'patent',
    '数据集': 'dataset',
    '模型文件': 'model',
    '实验报告': 'report'
  }
  return typeMap[type] || 'doc'
}

/**
 * 获取文件接受类型
 */
export function getFileAccept(type) {
  const acceptMap = {
    '论文': '.pdf,.doc,.docx',
    '专利': '.doc,.docx,.pdf',
    '数据集': '.csv,.xlsx,.json,.txt',
    '模型文件': '.pkl,.h5,.pt,.pth,.onnx',
    '实验报告': '.pdf,.doc,.docx'
  }
  return acceptMap[type] || '*'
}

/**
 * 判断是否为文本文件
 */
export function isTextFile(mimeType, extension) {
  const textTypes = ['text/', 'application/json', 'application/xml']
  const textExtensions = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'py', 'csv']
  return textTypes.some(type => mimeType.startsWith(type)) || textExtensions.includes(extension)
}

/**
 * 判断是否为图片文件
 */
export function isImageFile(mimeType, extension) {
  const imageTypes = ['image/']
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp']
  return imageTypes.some(type => mimeType.startsWith(type)) || imageExtensions.includes(extension)
}

/**
 * 判断是否为PDF文件
 */
export function isPdfFile(mimeType, extension) {
  return mimeType === 'application/pdf' || extension === 'pdf'
}

/**
 * 创建占位文件内容
 */
export function createPlaceholderContent(fileName, mimeType) {
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
}

/**
 * HTML转义
 */
export function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

