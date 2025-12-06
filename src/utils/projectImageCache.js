// 项目封面图本地缓存工具
// 按项目 ID + 当前图片 URL 做版本控制，缓存为 data:URL，存储在 localStorage 中

const STORAGE_PREFIX = 'project_cover_cache_'

function getStorageKey(projectId) {
  return `${STORAGE_PREFIX}${projectId}`
}

function safeParse(json) {
  try {
    return json ? JSON.parse(json) : null
  } catch (e) {
    console.warn('[projectImageCache] 解析缓存失败，将清空:', e)
    return null
  }
}

function extractVersion(url) {
  if (!url) return null
  // 直接使用完整 URL 作为版本标识，避免不同参数组合导致误命中
  return String(url)
}

export function getCachedProjectCover(projectId, currentUrl) {
  if (!projectId) return null
  try {
    const raw = localStorage.getItem(getStorageKey(projectId))
    const cached = safeParse(raw)
    if (!cached || !cached.dataUrl || !cached.version) {
      return null
    }
    const version = extractVersion(currentUrl)
    if (version && cached.version === version) {
      return cached
    }
    return null
  } catch (e) {
    console.warn('[projectImageCache] 读取缓存失败:', e)
    return null
  }
}

export function saveProjectCover(projectId, dataUrl, currentUrl) {
  if (!projectId || !dataUrl) return
  try {
    const version = extractVersion(currentUrl)
    const payload = {
      dataUrl,
      version,
      updatedAt: Date.now()
    }
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(payload))
  } catch (e) {
    console.warn('[projectImageCache] 保存缓存失败，可能是 localStorage 空间不足:', e)
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 如果本地还没有对应版本的封面缓存，则从远程 URL 拉取并缓存
 * @param {string|number} projectId
 * @param {string} imageUrl - 当前用于展示的图片 URL（可能带版本参数）
 * @returns {Promise<string|null>} 返回 data:URL（如果成功）
 */
export async function cacheProjectCoverIfNeeded(projectId, imageUrl) {
  if (!projectId || !imageUrl) return null

  // 如果已经有匹配当前 URL 的缓存，直接返回
  const existing = getCachedProjectCover(projectId, imageUrl)
  if (existing && existing.dataUrl) {
    return existing.dataUrl
  }

  try {
    const response = await fetch(imageUrl, { credentials: 'include' })
    if (!response.ok) {
      console.warn('[projectImageCache] 获取封面失败:', imageUrl, response.status)
      return null
    }
    const blob = await response.blob()
    const dataUrl = await blobToDataUrl(blob)
    saveProjectCover(projectId, dataUrl, imageUrl)
    return dataUrl
  } catch (e) {
    console.warn('[projectImageCache] 拉取或转换封面失败:', e)
    return null
  }
}
