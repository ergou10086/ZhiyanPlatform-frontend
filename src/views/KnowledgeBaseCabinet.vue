<template>
  <div class="cabinet-view">
    <div class="section-card">
      <div class="section-title">知识柜 · 团队文档中心</div>
      <div class="section-subtitle">集中管理团队知识文档</div>
    </div>

    <div class="cabinet-layout">
      <!-- 左侧列表 -->
      <div class="list-pane">
        <div class="toolbar">
          <button class="btn primary small">+ 新建文档</button>
          <input class="search" type="text" placeholder="搜索文档" />
        </div>
        <div class="group-title">项目管理规范</div>
        <ul class="doc-list">
          <li v-for="d in docs" :key="d.id" :class="{ active: d.id===activeId }" @click="activeId=d.id">{{ d.title }}</li>
        </ul>
        <div class="group-title">会议纪要</div>
        <ul class="doc-list">
          <li>2023-10 月度会议</li>
          <li>2023-11 月度会议</li>
        </ul>
        <div class="group-title">培训资料</div>
        <ul class="doc-list">
          <li>新员工入职培训</li>
          <li>技术分享资料</li>
        </ul>
      </div>

      <!-- 右侧编辑区 -->
      <div class="editor-pane">
        <div class="doc-meta">
          <div class="doc-title">{{ activeDoc.title }}</div>
          <div class="doc-updated">更新日期：{{ activeDoc.updated }}</div>
        </div>
        <textarea class="editor" v-model="content"></textarea>
        <div class="editor-footer">
          <button class="btn">版本历史</button>
          <button class="btn">差异对比</button>
          <div class="flex-spacer" />
          <button class="btn primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBaseCabinet',
  data() {
    return {
      activeId: 1,
      docs: [
        { id: 1, title: '项目管理规范 v2.1', updated: '2023年11月15日' },
        { id: 2, title: '项目管理规范 v2.0', updated: '2023年10月15日' },
        { id: 3, title: '项目管理规范 v1.9', updated: '2023年09月15日' }
      ],
      content: `项目管理规范 v2.1\n更新日期：2023年11月15日\n1. 项目启动阶段...\n(此处为示例内容，可替换为真实文档内容。)`
    }
  },
  computed: {
    activeDoc() {
      return this.docs.find(d => d.id === this.activeId) || this.docs[0]
    }
  }
}
</script>

<style scoped>
.cabinet-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 40px - 28px); /* 减去顶部导航、主内容padding和底部padding */
}

.section-card { background: #fff; border: 1px solid #eef0f2; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: #333; }
.section-subtitle { color: #9ca3af; font-size: 12px; margin-top: 6px; }

.cabinet-layout { 
  display: grid; 
  grid-template-columns: 260px 1fr; 
  gap: 16px; 
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许grid子元素收缩 */
}

.list-pane { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  padding: 12px; 
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许flex子元素收缩 */
}
.toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-shrink: 0; }
.search { flex: 1; height: 32px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0 10px; font-size: 12px; }
.group-title { color: #6b7280; font-size: 12px; margin: 10px 0 6px; }
.doc-list { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; }
.doc-list li { padding: 8px 10px; border-radius: 8px; cursor: pointer; color: #374151; font-size: 13px; }
.doc-list li:hover { background: #f6f7fb; }
.doc-list li.active { background: #eef2ff; color: #4f46e5; }

.editor-pane { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  padding: 12px; 
  display: flex; 
  flex-direction: column; 
  min-height: 0; /* 允许flex子元素收缩 */
}
.doc-meta { padding: 6px 4px 10px; flex-shrink: 0; }
.doc-title { font-size: 14px; font-weight: 600; color: #111827; }
.doc-updated { color: #9aa0a6; font-size: 12px; margin-top: 4px; }
.editor { 
  flex: 1; 
  border: 1px solid #e5e7eb; 
  border-radius: 10px; 
  padding: 10px; 
  font-size: 13px; 
  resize: none; /* 禁用resize，使用flex布局控制高度 */
  min-height: 0; /* 允许flex子元素收缩 */
}
.editor-footer { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-shrink: 0; }
.flex-spacer { flex: 1; }

.btn { height: 32px; padding: 0 12px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 12px; }
.btn.primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
.btn.small { height: 28px; }

@media (max-width: 900px) {
  .cabinet-layout { grid-template-columns: 1fr; }
}
</style>
