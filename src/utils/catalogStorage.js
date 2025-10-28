/**
 * 成果目录本地存储相关的工具函数
 */

/**
 * 保存成果数据到本地存储
 */
export function saveToLocalStorage(uploadedFiles, currentPage, projectId) {
  try {
    // 转换 ArrayBuffer 为可序列化的格式
    const serializedFiles = uploadedFiles.map(achievement => {
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
      currentPage: currentPage
    }
    const storageKey = projectId ? `knowledgeBaseCatalog_${projectId}` : 'knowledgeBaseCatalog'
    localStorage.setItem(storageKey, JSON.stringify(dataToSave))
    console.log(`成果目录数据已保存到本地存储 (项目ID: ${projectId})`)
  } catch (error) {
    console.error('保存到本地存储失败:', error)
  }
}

/**
 * 从本地存储加载成果数据
 */
export function loadFromLocalStorage(projectId) {
  try {
    const storageKey = projectId ? `knowledgeBaseCatalog_${projectId}` : 'knowledgeBaseCatalog'
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
        console.log(`成果目录数据已从本地存储加载 (项目ID: ${projectId})`)
        return {
          uploadedFiles: deserializedFiles,
          currentPage: data.currentPage || 1
        }
      }
    }
    return null
  } catch (error) {
    console.error('从本地存储加载失败:', error)
    return null
  }
}

/**
 * 更新文件内容到本地存储
 */
export function updateFileContentInStorage(fileId, fileContent, projectId) {
  try {
    const storageKey = projectId ? `knowledgeBaseCatalog_${projectId}` : 'knowledgeBaseCatalog'
    const savedFiles = localStorage.getItem(storageKey)
    if (savedFiles) {
      const data = JSON.parse(savedFiles)
      const files = data.uploadedFiles || []
      const fileIndex = files.findIndex(f => f.id === fileId)
      if (fileIndex !== -1) {
        // 更新文件内容
        files[fileIndex].content = fileContent
        files[fileIndex].lastModified = new Date().toLocaleString('zh-CN')
        data.uploadedFiles = files
        localStorage.setItem(storageKey, JSON.stringify(data))
        console.log('文件内容已更新到本地存储')
        return true
      }
    }
    return false
  } catch (error) {
    console.error('更新文件内容到本地存储失败:', error)
    return false
  }
}

