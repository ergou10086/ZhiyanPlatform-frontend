# Wiki API 快速参考

## 🚀 5分钟上手

### 第一步：引入API

```javascript
import { wikiAPI } from '@/api/wiki'
// 或者按需引入
import { wikiPageAPI, wikiSearchAPI } from '@/api/wiki'
```

### 第二步：调用API

```javascript
// 获取Wiki树
const response = await wikiAPI.page.getProjectWikiTree(projectId)
const wikiTree = response.data

// 创建页面
const newPage = await wikiAPI.page.createPage({
  projectId: 1,
  title: '新页面',
  pageType: 'DOCUMENT',
  content: '# 标题\n\n内容...'
})

// 搜索
const results = await wikiAPI.search.fullTextSearch(projectId, '关键词')
```

---

## 📋 常用功能速查

### 页面管理

```javascript
// 获取Wiki树
wikiAPI.page.getProjectWikiTree(projectId)

// 创建页面
wikiAPI.page.createPage({ projectId, title, pageType, content })

// 更新页面
wikiAPI.page.updatePage(pageId, { title, content })

// 删除页面
wikiAPI.page.deletePage(pageId)

// 获取详情
wikiAPI.page.getPageDetail(pageId)

// 移动页面
wikiAPI.page.movePage(pageId, newParentId)

// 复制页面
wikiAPI.page.copyPage(pageId)
```

### 搜索功能

```javascript
// 标题搜索
wikiAPI.search.searchByTitle(projectId, keyword, page, size)

// 全文搜索
wikiAPI.search.fullTextSearch(projectId, keyword, page, size)

// 简单搜索
wikiAPI.search.simpleSearch(projectId, keyword, limit)

// 高级搜索
wikiAPI.search.advancedSearch(projectId, {
  includeWords: '必须包含',
  excludeWords: '排除词',
  phrase: '精确短语'
}, page, size)
```

### 版本管理

```javascript
// 获取版本历史
wikiAPI.version.getVersionHistory(pageId)

// 获取指定版本内容
wikiAPI.version.getVersionContent(pageId, version)
```

### 导入导出

```javascript
// 导出Markdown
const blob = await wikiAPI.importExport.exportPage(pageId, 'MARKDOWN')
downloadFile(blob, 'wiki.md')

// 导入Markdown
await wikiAPI.importExport.importMarkdown(projectId, file)

// 批量导出
const zipBlob = await wikiAPI.importExport.exportPages(projectId, [1,2,3])
```

---

## 📦 返回数据格式

所有API返回统一的R对象格式：

```javascript
{
  code: 200,           // 状态码（200成功，其他失败）
  msg: "操作成功",      // 提示信息
  data: { ... }        // 返回数据
}
```

### Wiki树结构示例

```javascript
{
  code: 200,
  data: [
    {
      id: "1",
      title: "项目文档",
      pageType: "DIRECTORY",
      hasChildren: true,
      children: [
        {
          id: "2",
          title: "需求分析.md",
          pageType: "DOCUMENT",
          contentSummary: "这是文档摘要...",
          currentVersion: 3,
          updatedAt: "2025-01-05T10:30:00"
        }
      ]
    }
  ]
}
```

### 页面详情示例

```javascript
{
  code: 200,
  data: {
    id: "2",
    projectId: "1",
    title: "需求分析",
    pageType: "DOCUMENT",
    content: "# 需求分析\n\n## 功能需求\n...",
    currentVersion: 3,
    contentSize: 1024,
    creatorId: "100",
    lastEditorId: "101",
    createdAt: "2025-01-01T10:00:00",
    updatedAt: "2025-01-05T10:30:00"
  }
}
```

### 搜索结果示例

```javascript
{
  code: 200,
  data: {
    content: [
      {
        wikiPageId: "2",
        title: "需求分析",
        path: "/项目文档/需求分析",
        matchedSnippet: "...包含<mark>关键词</mark>的内容...",
        score: 8.5,
        matchCount: 3,
        updatedAt: "2025-01-05T10:30:00"
      }
    ],
    totalElements: 10,
    totalPages: 1
  }
}
```

---

## 🎨 工具函数

```javascript
import { downloadFile, formatFileSize, formatDateTime, timeAgo } from '@/api/wiki'

// 下载文件
downloadFile(blob, 'filename.md')

// 格式化文件大小
formatFileSize(1024)  // "1 KB"

// 格式化日期时间
formatDateTime('2025-01-05T10:30:00')  // "2025-01-05 10:30"

// 相对时间
timeAgo('2025-01-05T10:30:00')  // "5分钟前"
```

---

## 🔧 枚举常量

```javascript
import { PageType, ExportFormat } from '@/api/wiki'

// 页面类型
PageType.DIRECTORY  // "DIRECTORY" - 目录
PageType.DOCUMENT   // "DOCUMENT"  - 文档

// 导出格式
ExportFormat.MARKDOWN  // "MARKDOWN"
ExportFormat.PDF       // "PDF"
ExportFormat.WORD      // "WORD"
```

---

## ⚡ 实战模板

### 基础Wiki页面组件

```vue
<template>
  <div class="wiki-page">
    <!-- Wiki树 -->
    <aside class="wiki-tree">
      <tree-view :data="wikiTree" @select="selectPage" />
    </aside>
    
    <!-- 页面内容 -->
    <main class="wiki-content">
      <div v-if="currentPage">
        <h1>{{ currentPage.title }}</h1>
        <div v-html="renderedContent"></div>
      </div>
    </main>
  </div>
</template>

<script>
import { wikiAPI } from '@/api/wiki'
import { marked } from 'marked'

export default {
  data() {
    return {
      wikiTree: [],
      currentPage: null,
      projectId: this.$route.params.projectId
    }
  },
  computed: {
    renderedContent() {
      return this.currentPage?.content ? marked(this.currentPage.content) : ''
    }
  },
  async mounted() {
    await this.loadWikiTree()
  },
  methods: {
    async loadWikiTree() {
      const res = await wikiAPI.page.getProjectWikiTree(this.projectId)
      this.wikiTree = res.data
    },
    async selectPage(pageId) {
      const res = await wikiAPI.page.getPageDetail(pageId)
      this.currentPage = res.data
    }
  }
}
</script>
```

---

## 🐛 错误处理

```javascript
try {
  const response = await wikiAPI.page.createPage(pageData)
  if (response.code === 200) {
    this.$message.success('创建成功')
  } else {
    this.$message.error(response.msg)
  }
} catch (error) {
  console.error('API调用失败:', error)
  this.$message.error('操作失败，请重试')
}
```

---

## 📞 需要帮助？

- 📖 详细文档：查看 `WIKI_API_USAGE.md`
- 🔍 后端接口：查看 `ZhiyanPlatformgood/zhiyan-modules/zhiyan-wiki/README.md`
- 🚀 快速启动：查看 `ZhiyanPlatformgood/zhiyan-modules/zhiyan-wiki/QUICK_START.md`

**祝开发愉快！** 🎉

