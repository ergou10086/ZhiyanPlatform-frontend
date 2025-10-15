<template>
  <div class="ai-view">
    <div class="section-card">
      <div class="section-title">AI赋能助手</div>
      <div class="section-subtitle">智能问答与内容生成服务</div>
    </div>

    <div class="chat-card">
      <div class="chat-window">
        <div class="bubble left">
          您好！我是您的AI助手，可以帮您生成文档结构提纲、关键词摘要，也可以结合知识库回答问题。请问您有什么要协助的吗？
        </div>
        <div class="bubble right">
          请为《基于深度学习的个性化教育推荐系统》这篇论文生成摘要和关键字
        </div>
        <div class="bubble left">
          好的，我已为您生成该论文的摘要和关键字：
          <br/><br/>
          摘要：本文提出了一种基于深度学习的个性化教育推荐系统，通过分析学生的学习行为数据和图谱特征，构建了多层神经网络模型，实现结果推荐。该系统在高校在线教学场景中提升了推荐准确率与个性化体验。
          <br/><br/>
          关键词：深度学习；个性化推荐；教育数据挖掘；知识图谱；在线学习
        </div>
      </div>
      <div class="composer">
        <input class="composer-input" type="text" placeholder="输入您的问题..."/>
        <button class="send-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBaseAI'
}
</script>

<style scoped>
.ai-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 40px - 28px); /* 减去顶部导航、主内容padding和底部padding */
}

.section-card { background: #fff; border: 1px solid #eef0f2; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: #333; }
.section-subtitle { color: #9ca3af; font-size: 12px; margin-top: 6px; }

.chat-card { 
  background: #fff; 
  border: 1px solid #eef0f2; 
  border-radius: 12px; 
  padding: 12px; 
  display: flex; 
  flex-direction: column; 
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许flex子元素收缩 */
}
.chat-window { 
  flex: 1; 
  padding: 10px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  overflow: auto; 
  min-height: 0; /* 允许滚动 */
}
.bubble { max-width: 70%; padding: 10px 12px; border-radius: 12px; font-size: 14px; line-height: 1.6; }
.bubble.left { align-self: flex-start; background: #f3f4f6; color: #374151; }
.bubble.right { align-self: flex-end; background: #4f46e5; color: #fff; }

.composer { display: flex; gap: 8px; padding-top: 10px; flex-shrink: 0; }
.composer-input { flex: 1; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0 12px; }
.send-btn { width: 40px; height: 40px; border-radius: 10px; background: #4f46e5; color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>
