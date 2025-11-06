/**
 * 本地模糊搜索工具
 * 用于增强MongoDB全文搜索，提供本地标题/路径的模糊匹配
 * 
 * 功能特点：
 * 1. 支持中文模糊搜索
 * 2. 计算相似度评分
 * 3. 递归遍历树形结构
 * 4. 合并去重搜索结果
 */

/**
 * 计算字符串相似度（Levenshtein距离）
 * @param {String} str1 
 * @param {String} str2 
 * @returns {Number} 相似度分数 (0-1)
 */
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  
  if (s1 === s2) return 1.0
  if (s1.includes(s2) || s2.includes(s1)) return 0.8
  
  const len1 = s1.length
  const len2 = s2.length
  const matrix = []

  // 初始化矩阵
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // 填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j] + 1      // 删除
        )
      }
    }
  }

  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return 1 - distance / maxLen
}

/**
 * 检查是否包含关键词（支持中文模糊匹配）
 * @param {String} text 
 * @param {String} keyword 
 * @returns {Boolean}
 */
function containsKeyword(text, keyword) {
  if (!text || !keyword) return false
  
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  
  // 直接包含
  if (lowerText.includes(lowerKeyword)) return true
  
  // 分词匹配（按空格分割）
  const words = lowerKeyword.split(/\s+/)
  return words.every(word => lowerText.includes(word))
}

/**
 * 计算匹配分数
 * @param {Object} page - Wiki页面对象
 * @param {String} keyword - 搜索关键词
 * @returns {Number} 匹配分数 (0-100)
 */
function calculateMatchScore(page, keyword) {
  let score = 0
  const lowerKeyword = keyword.toLowerCase()
  
  // 标题完全匹配 +50分
  if (page.title && page.title.toLowerCase() === lowerKeyword) {
    score += 50
  }
  // 标题包含关键词 +30分
  else if (page.title && containsKeyword(page.title, keyword)) {
    score += 30
    // 相似度加分
    score += calculateSimilarity(page.title, keyword) * 10
  }
  
  // 路径包含关键词 +20分
  if (page.path && containsKeyword(page.path, keyword)) {
    score += 20
  }
  
  // 内容包含关键词 +10分（如果有内容字段）
  if (page.content && containsKeyword(page.content, keyword)) {
    score += 10
  }
  
  return score
}

/**
 * 递归提取树结构中的所有页面
 * @param {Array} folders - 文件夹数组
 * @returns {Array} 扁平化的页面数组
 */
function flattenPages(folders) {
  const pages = []
  
  function traverse(items) {
    if (!Array.isArray(items)) return
    
    for (const item of items) {
      // 添加当前项（文件夹或页面）
      if (item.pageType === 'DOCUMENT') {
        pages.push({
          id: item.id,
          wikiPageId: item.id,
          title: item.title,
          path: item.path || item.title,
          pageType: item.pageType,
          content: item.content || '',
          updatedAt: item.updatedAt,
          projectId: item.projectId
        })
      } else if (item.pageType === 'DIRECTORY') {
        // 目录也可以被搜索到
        pages.push({
          id: item.id,
          wikiPageId: item.id,
          title: item.title,
          path: item.path || item.title,
          pageType: item.pageType,
          updatedAt: item.updatedAt,
          projectId: item.projectId
        })
      }
      
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  
  traverse(folders)
  return pages
}

/**
 * 本地模糊搜索（在树形结构中搜索）
 * @param {Array} folders - 文件夹树形结构
 * @param {String} keyword - 搜索关键词
 * @param {Number} limit - 结果数量限制
 * @returns {Array} 搜索结果数组
 */
export function localFuzzySearch(folders, keyword, limit = 10) {
  if (!keyword || !keyword.trim()) return []
  
  const trimmedKeyword = keyword.trim()
  
  // 提取所有页面
  const allPages = flattenPages(folders)
  
  // 计算每个页面的匹配分数
  const scoredPages = allPages
    .map(page => ({
      ...page,
      score: calculateMatchScore(page, trimmedKeyword),
      matchedSnippet: generateSnippet(page, trimmedKeyword)
    }))
    .filter(page => page.score > 0) // 只保留有分数的
    .sort((a, b) => b.score - a.score) // 按分数降序
    .slice(0, limit) // 限制数量
  
  return scoredPages
}

/**
 * 生成匹配摘要
 * @param {Object} page 
 * @param {String} keyword 
 * @returns {String}
 */
function generateSnippet(page, keyword) {
  const title = page.title || ''
  const path = page.path || ''
  
  if (containsKeyword(title, keyword)) {
    return `标题: ${highlightText(title, keyword)}`
  }
  
  if (containsKeyword(path, keyword)) {
    return `路径: ${highlightText(path, keyword)}`
  }
  
  return `${title}`
}

/**
 * 高亮文本中的关键词
 * @param {String} text 
 * @param {String} keyword 
 * @returns {String}
 */
function highlightText(text, keyword) {
  if (!text || !keyword) return text
  
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 转义正则表达式特殊字符
 * @param {String} str 
 * @returns {String}
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 合并MongoDB搜索结果和本地搜索结果
 * @param {Array} mongoResults - MongoDB搜索结果
 * @param {Array} localResults - 本地搜索结果
 * @param {Number} maxTotal - 最大结果数
 * @returns {Array} 合并后的结果
 */
export function mergeSearchResults(mongoResults, localResults, maxTotal = 20) {
  const seen = new Set()
  const merged = []
  
  // 先添加MongoDB结果（优先级更高）
  for (const result of mongoResults) {
    const id = result.wikiPageId || result.id
    if (id && !seen.has(String(id))) {
      seen.add(String(id))
      merged.push({
        ...result,
        source: 'mongodb' // 标记来源
      })
    }
  }
  
  // 如果MongoDB结果不足，补充本地结果
  if (merged.length < maxTotal) {
    for (const result of localResults) {
      const id = result.wikiPageId || result.id
      if (id && !seen.has(String(id))) {
        seen.add(String(id))
        merged.push({
          ...result,
          source: 'local' // 标记来源
        })
        
        if (merged.length >= maxTotal) break
      }
    }
  }
  
  return merged
}

/**
 * 导出所有方法
 */
export default {
  localFuzzySearch,
  mergeSearchResults,
  calculateSimilarity,
  containsKeyword
}

