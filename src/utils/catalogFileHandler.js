/**
 * 成果目录文件处理相关的工具函数
 */

import { formatFileSize, getFileExtension, getMimeType, createPlaceholderContent } from './catalogHelpers'

/**
 * 下载单个文件
 */
export function downloadSingleFile(file) {
  try {
    // 如果有 downloadUrl，直接通过URL下载
    if (file.downloadUrl) {
      console.log('通过URL下载文件:', file.name, 'URL:', file.downloadUrl)
      const a = document.createElement('a')
      a.href = file.downloadUrl
      a.download = file.name || file.originalFileName || '下载文件'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      console.log('文件下载成功:', file.name)
      return
    }
    
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
      const fileExtension = getFileExtension(fileName)
      const placeholderContent = createPlaceholderContent(fileName, file.type)
      
      const blob = new Blob([placeholderContent], { 
        type: file.type || getMimeType(fileExtension) || 'text/plain' 
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
}

/**
 * 批量下载所有文件
 */
export function downloadAllFiles(achievement) {
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
          downloadSingleFile(file)
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
}

/**
 * 下载文件（自动判断单文件或多文件）
 */
export function downloadFile(file) {
  try {
    // 检查是否是单文件成果
    if (file.files && file.files.length > 1) {
      // 多文件成果，下载全部
      downloadAllFiles(file)
      return
    }
    
    // 单文件成果或文件对象
    const fileToDownload = file.files && file.files.length === 1 ? file.files[0] : file
    downloadSingleFile(fileToDownload)
  } catch (error) {
    console.error('下载文件时出错:', error)
    alert('下载失败，请重试')
  }
}

/**
 * 加载文本文件内容
 */
export function loadTextFile(file, callback) {
  if (file.file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      callback(e.target.result)
    }
    reader.readAsText(file.file, 'UTF-8')
  } else {
    // 模拟文本内容
    const content = `文件名：${file.name}\n类型：${file.type}\n上传者：${file.uploader}\n上传时间：${file.time}\n\n这是一个示例文件内容。\n实际应用中，这里会显示文件的真实内容。`
    callback(content)
  }
}

/**
 * 加载图片文件
 */
export function loadImageFile(file, callback) {
  if (file.file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      callback(e.target.result)
    }
    reader.readAsDataURL(file.file)
  } else {
    // 模拟图片
    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='
    callback(placeholder)
  }
}

/**
 * 加载PDF文件
 */
export function loadPdfFile(file, callback) {
  const url = file.file ? URL.createObjectURL(file.file) : '#'
  callback(url)
}

/**
 * 获取文件信息
 */
export function getFileInfo(file) {
  return {
    name: file.name,
    type: file.type,
    uploader: file.uploader,
    time: file.time,
    size: file.file ? formatFileSize(file.file.size) : '未知大小'
  }
}

/**
 * 测试 ArrayBuffer 转换
 */
export function testArrayBufferConversion(file) {
  if (file.fileBuffer) {
    console.log('原始 ArrayBuffer:', file.fileBuffer)
    console.log('ArrayBuffer 类型:', typeof file.fileBuffer)
    console.log('ArrayBuffer 构造函数:', file.fileBuffer.constructor.name)
    console.log('ArrayBuffer 长度:', file.fileBuffer.byteLength)
    
    // 尝试读取前几个字节
    const uint8Array = new Uint8Array(file.fileBuffer)
    console.log('前10个字节:', Array.from(uint8Array.slice(0, 10)))
  }
}

