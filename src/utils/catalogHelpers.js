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
 * 根据文件扩展名获取文件类型显示名称
 */
export function getFileTypeDisplayByExtension(extension) {
  const ext = (extension || '').toLowerCase()
  const extensionMap = {
    // 文档类型
    'pdf': 'PDF文档',
    'doc': 'Word文档',
    'docx': 'Word文档',
    'txt': '文本文件',
    'md': 'Markdown文档',
    'rtf': 'RTF文档',
    'odt': 'OpenDocument文档',
    // 表格类型
    'xls': 'Excel表格',
    'xlsx': 'Excel表格',
    'csv': 'CSV数据',
    'ods': 'OpenDocument表格',
    // 演示文稿
    'ppt': 'PowerPoint演示',
    'pptx': 'PowerPoint演示',
    'odp': 'OpenDocument演示',
    // 图片类型
    'jpg': 'JPEG图片',
    'jpeg': 'JPEG图片',
    'png': 'PNG图片',
    'gif': 'GIF图片',
    'bmp': 'BMP图片',
    'webp': 'WebP图片',
    'svg': 'SVG图片',
    'ico': '图标文件',
    'tiff': 'TIFF图片',
    'tif': 'TIFF图片',
    // 视频类型
    'mp4': 'MP4视频',
    'avi': 'AVI视频',
    'mov': 'MOV视频',
    'wmv': 'WMV视频',
    'flv': 'FLV视频',
    'webm': 'WebM视频',
    'mkv': 'MKV视频',
    'm4v': 'M4V视频',
    '3gp': '3GP视频',
    // 音频类型
    'mp3': 'MP3音频',
    'wav': 'WAV音频',
    'ogg': 'OGG音频',
    'm4a': 'M4A音频',
    'flac': 'FLAC音频',
    'aac': 'AAC音频',
    'wma': 'WMA音频',
    // 压缩包
    'zip': 'ZIP压缩包',
    'rar': 'RAR压缩包',
    '7z': '7Z压缩包',
    'tar': 'TAR压缩包',
    'gz': 'GZ压缩包',
    'bz2': 'BZ2压缩包',
    // 数据格式
    'json': 'JSON数据',
    'xml': 'XML数据',
    'yaml': 'YAML数据',
    'yml': 'YAML数据',
    // 代码文件
    'html': 'HTML文件',
    'htm': 'HTML文件',
    'css': 'CSS样式',
    'js': 'JavaScript文件',
    'jsx': 'JSX文件',
    'ts': 'TypeScript文件',
    'tsx': 'TSX文件',
    'py': 'Python脚本',
    'java': 'Java文件',
    'cpp': 'C++文件',
    'c': 'C文件',
    'h': 'C头文件',
    'cs': 'C#文件',
    'php': 'PHP文件',
    'rb': 'Ruby文件',
    'go': 'Go文件',
    'rs': 'Rust文件',
    'swift': 'Swift文件',
    'kt': 'Kotlin文件',
    'sql': 'SQL文件',
    'sh': 'Shell脚本',
    'bash': 'Bash脚本',
    // 模型文件
    'pkl': 'Python模型',
    'h5': 'HDF5模型',
    'pt': 'PyTorch模型',
    'pth': 'PyTorch模型',
    'onnx': 'ONNX模型',
    'pb': 'TensorFlow模型',
    'tflite': 'TensorFlow Lite模型',
    // 其他
    'exe': '可执行文件',
    'dll': '动态链接库',
    'so': '共享库',
    'dmg': '磁盘镜像',
    'iso': 'ISO镜像'
  }
  return extensionMap[ext] || null
}

/**
 * 获取文件类型显示名称
 * @param {string} mimeType - MIME类型
 * @param {string} fileName - 文件名（可选，当MIME类型不可用时用于推断）
 */
export function getFileTypeDisplay(mimeType, fileName) {
  // 首先尝试根据MIME类型判断
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
    'image/bmp': 'BMP图片',
    'image/webp': 'WebP图片',
    'image/x-icon': '图标文件',
    'image/tiff': 'TIFF图片',
    'video/mp4': 'MP4视频',
    'video/avi': 'AVI视频',
    'video/quicktime': 'MOV视频',
    'video/x-ms-wmv': 'WMV视频',
    'video/x-flv': 'FLV视频',
    'video/webm': 'WebM视频',
    'video/x-matroska': 'MKV视频',
    'audio/mpeg': 'MP3音频',
    'audio/wav': 'WAV音频',
    'audio/ogg': 'OGG音频',
    'audio/mp4': 'M4A音频',
    'audio/flac': 'FLAC音频',
    'audio/aac': 'AAC音频',
    'audio/x-ms-wma': 'WMA音频',
    'application/zip': 'ZIP压缩包',
    'application/x-rar-compressed': 'RAR压缩包',
    'application/x-7z-compressed': '7Z压缩包',
    'application/x-tar': 'TAR压缩包',
    'application/gzip': 'GZ压缩包',
    'application/x-bzip2': 'BZ2压缩包',
    'text/csv': 'CSV数据',
    'application/json': 'JSON数据',
    'text/xml': 'XML数据',
    'application/xml': 'XML数据',
    'text/yaml': 'YAML数据',
    'text/html': 'HTML文件',
    'text/css': 'CSS样式',
    'application/javascript': 'JavaScript文件',
    'text/javascript': 'JavaScript文件',
    'application/x-python-code': 'Python脚本',
    'text/x-python': 'Python脚本',
    'text/x-java-source': 'Java文件',
    'text/x-c++': 'C++文件',
    'text/x-c': 'C文件',
    'text/x-csharp': 'C#文件',
    'text/x-php': 'PHP文件',
    'text/x-ruby': 'Ruby文件',
    'text/x-go': 'Go文件',
    'text/x-rust': 'Rust文件',
    'text/x-swift': 'Swift文件',
    'text/x-kotlin': 'Kotlin文件',
    'application/x-sql': 'SQL文件',
    'application/x-sh': 'Shell脚本',
    'application/x-bash': 'Bash脚本'
  }
  
  // 如果MIME类型存在且在映射表中，直接返回
  if (mimeType && typeMap[mimeType]) {
    return typeMap[mimeType]
  }
  
  // 如果MIME类型不可用或不在映射表中，尝试根据文件名后缀推断
  if (fileName) {
    const extension = getFileExtension(fileName)
    const typeByExtension = getFileTypeDisplayByExtension(extension)
    if (typeByExtension) {
      return typeByExtension
    }
  }
  
  // 如果MIME类型存在但不在映射表中，尝试从MIME类型中提取主要类型
  if (mimeType) {
    const mainType = mimeType.split('/')[0]
    const mainTypeMap = {
      'image': '图片文件',
      'video': '视频文件',
      'audio': '音频文件',
      'text': '文本文件',
      'application': '应用程序'
    }
    if (mainTypeMap[mainType]) {
      return mainTypeMap[mainType]
    }
  }
  
  // 最后返回未知类型
  return '未知类型'
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

