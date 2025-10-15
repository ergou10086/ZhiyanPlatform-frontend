<template>
  <div class="catalog-view">
    <div class="section-card">
      <div class="section-title">成果目录管理</div>
      <div class="section-subtitle">在这里您可以上传各类新的研究成果，并查看已有的成果档案</div>
    </div>

    <div class="section-card">
      <div class="section-title small">添加新成果</div>
      <div class="add-grid">
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-blue"></span>
            <span class="add-name">论文</span>
          </div>
          <div class="add-desc">上传学术论文成果</div>
          <a class="add-link" href="#">上传论文</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-orange"></span>
            <span class="add-name">专利</span>
          </div>
          <div class="add-desc">记录专利信息</div>
          <a class="add-link" href="#">上传专利</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-green"></span>
            <span class="add-name">数据集</span>
          </div>
          <div class="add-desc">上传研究数据集</div>
          <a class="add-link" href="#">上传数据集</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-purple"></span>
            <span class="add-name">模型文件</span>
          </div>
          <div class="add-desc">存储已训练模型</div>
          <a class="add-link" href="#">上传模型</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-yellow"></span>
            <span class="add-name">实验报告</span>
          </div>
          <div class="add-desc">上传实验报告文档</div>
          <a class="add-link" href="#">上传报告</a>
        </div>
        <div class="add-card">
          <div class="add-head">
            <span class="dot dot-pink"></span>
            <span class="add-name">自定义项目</span>
          </div>
          <div class="add-desc">创建自定义成果类型</div>
          <a class="add-link" href="#">新建类型</a>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title small">已有成果档案</div>
      <div class="table-wrap">
        <table class="doc-table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>类型</th>
              <th>上传者</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in archiveRows" :key="row.id">
              <td class="filename">
                <span class="file-dot" :class="row.typeCls"></span>
                {{ row.name }}
              </td>
              <td>{{ row.type }}</td>
              <td>{{ row.uploader }}</td>
              <td>{{ row.time }}</td>
              <td class="ops">
                <a href="#">查看</a>
                <a href="#">下载</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination line">
        <span class="pager-text">显示第 1 到 5 项，共 12 项</span>
        <div class="pager-group">
          <button class="pager small">上一页</button>
          <button class="page-num small active">1</button>
          <button class="page-num small">2</button>
          <button class="page-num small">3</button>
          <button class="pager small">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBaseCatalog',
  props: {
    archiveRows: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.section-card { background: #fff; border: 1px solid #eef0f2; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: #333; }
.section-title.small { font-size: 14px; }
.section-subtitle { color: #9ca3af; font-size: 12px; margin-top: 6px; }

.add-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.add-card { border: 1px solid #eef0f2; border-radius: 12px; padding: 14px; background: #fff; }
.add-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.add-name { color: #374151; font-weight: 600; }
.add-desc { color: #9ca3af; font-size: 12px; margin-bottom: 8px; }
.add-link { color: #4f46e5; font-size: 12px; text-decoration: none; }
.add-link:hover { text-decoration: underline; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-blue { background: #3b82f6; }
.dot-orange { background: #f59e0b; }
.dot-green { background: #10b981; }
.dot-purple { background: #8b5cf6; }
.dot-yellow { background: #fbbf24; }
.dot-pink { background: #f472b6; }

.table-wrap { width: 100%; overflow: auto; border: 1px solid #eef0f2; border-radius: 12px; background: #fff; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-table thead th { text-align: left; font-size: 13px; color: #6b7280; padding: 12px 14px; border-bottom: 1px solid #f1f3f5; }
.doc-table tbody td { padding: 12px 14px; font-size: 14px; color: #374151; border-bottom: 1px solid #f7f7f8; }
.filename { display: flex; align-items: center; gap: 8px; }
.file-dot { width: 10px; height: 10px; border-radius: 50%; }
.file-dot.doc { background: #3b82f6; }
.file-dot.patent { background: #f59e0b; }
.file-dot.dataset { background: #10b981; }
.file-dot.model { background: #8b5cf6; }
.file-dot.report { background: #fbbf24; }
.ops a { color: #4f46e5; text-decoration: none; margin-right: 12px; font-size: 13px; }
.ops a:hover { text-decoration: underline; }

.pagination.line { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.pager-text { color: #9aa0a6; font-size: 12px; }
.pager-group { display: flex; gap: 6px; align-items: center; }
.pager.small, .page-num.small { height: 28px; min-width: 28px; padding: 0 10px; border: 1px solid #e0e0e0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; }
.page-num.small.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }

@media (max-width: 900px) {
  .add-grid { grid-template-columns: 1fr; }
}
</style>
