<template>
  <div class="wiki-collab-overlay" ref="overlay">
    <!-- 所有用户的光标（包括自己） -->
    <div
      v-for="cursor in visibleCursors"
      :key="`cursor-${cursor.userId}`"
      class="collab-cursor"
      :class="{ 'is-self': String(cursor.userId) === String(selfUserId) }"
      :style="getCursorStyle(cursor)"
      :title="getCursorTitle(cursor)"
    >
      <div class="cursor-line"></div>
      <div class="cursor-label">
        <img 
          v-if="getCursorAvatar(cursor)" 
          :src="getCursorAvatar(cursor)" 
          class="cursor-avatar"
          :alt="getCursorLabel(cursor)"
        />
        <span class="cursor-name">{{ getCursorLabel(cursor) }}</span>
      </div>
    </div>
    
    <!-- 编辑区域高亮 -->
    <div
      v-for="(range, index) in visibleRanges"
      :key="`range-${range.userId}-${index}`"
      class="collab-range"
      :style="getRangeStyle(range)"
      :class="{ 'is-self': String(range.userId) === String(selfUserId) }"
    >
      <div class="range-label">{{ getRangeLabel(range) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WikiCollaborationOverlay',
  props: {
    textarea: {
      type: HTMLTextAreaElement,
      default: null
    },
    cursors: {
      type: Array,
      default: () => []
    },
    editRanges: {
      type: Array,
      default: () => []
    },
    selfUserId: {
      type: [String, Number],
      default: null
    },
    editorInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      textareaStyle: null,
      updateTimer: null
    }
  },
  computed: {
    visibleCursors() {
      if (!this.cursors || !Array.isArray(this.cursors)) return []
      // 显示所有光标，包括自己的
      return this.cursors.filter(c => c && c.userId && c.offset !== undefined)
    },
    visibleRanges() {
      if (!this.editRanges || !Array.isArray(this.editRanges)) return []
      return this.editRanges.filter(r => r && r.userId && r.start !== undefined && r.end !== undefined)
    }
  },
  watch: {
    textarea: {
      immediate: true,
      handler() {
        this.updateOverlay()
      }
    },
    cursors: {
      deep: true,
      handler() {
        this.updateOverlay()
      }
    },
    editRanges: {
      deep: true,
      handler() {
        this.updateOverlay()
      }
    }
  },
  mounted() {
    this.updateOverlay()
    window.addEventListener('resize', this.updateOverlay)
    window.addEventListener('scroll', this.updateOverlay, true)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateOverlay)
    window.removeEventListener('scroll', this.updateOverlay, true)
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }
  },
  methods: {
    updateOverlay() {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer)
      }
      this.updateTimer = setTimeout(() => {
        this._updateOverlay()
      }, 10)
    },
    _updateOverlay() {
      if (!this.textarea || !this.$refs.overlay) return
      
      const textareaRect = this.textarea.getBoundingClientRect()
      const overlay = this.$refs.overlay
      
      overlay.style.top = `${textareaRect.top}px`
      overlay.style.left = `${textareaRect.left}px`
      overlay.style.width = `${textareaRect.width}px`
      overlay.style.height = `${textareaRect.height}px`
      
      this.textareaStyle = window.getComputedStyle(this.textarea)
    },
    getCursorStyle(cursor) {
      if (!this.textarea || !cursor || cursor.offset === undefined) return {}
      
      const text = this.textarea.value || ''
      if (!text && cursor.offset === 0) {
        // 空文本且光标在开头
        const lineHeight = parseFloat(this.textareaStyle?.lineHeight || '20') || 20
        const paddingTop = parseFloat(this.textareaStyle?.paddingTop || '0') || 0
        const paddingLeft = parseFloat(this.textareaStyle?.paddingLeft || '0') || 0
        const isSelf = String(cursor.userId) === String(this.selfUserId)
        return {
          top: `${paddingTop}px`,
          left: `${paddingLeft}px`,
          '--cursor-color': this.getUserColor(cursor.userId),
          opacity: isSelf ? 0.7 : 1
        }
      }
      
      const lines = text.split('\n')
      let currentOffset = 0
      let lineIndex = 0
      let columnIndex = 0
      
      // 处理光标位置计算
      const offset = Math.max(0, Math.min(cursor.offset, text.length))
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1 // +1 for newline
        if (currentOffset + lineLength > offset) {
          lineIndex = i
          columnIndex = offset - currentOffset
          break
        }
        currentOffset += lineLength
      }
      
      // 如果光标在文本末尾或超出
      if (offset >= text.length && lines.length > 0) {
        lineIndex = lines.length - 1
        columnIndex = lines[lines.length - 1].length
      }
      
      const lineHeight = parseFloat(this.textareaStyle?.lineHeight || '20') || 20
      const paddingTop = parseFloat(this.textareaStyle?.paddingTop || '0') || 0
      const paddingLeft = parseFloat(this.textareaStyle?.paddingLeft || '0') || 0
      const fontSize = parseFloat(this.textareaStyle?.fontSize || '14') || 14
      const fontFamily = this.textareaStyle?.fontFamily || 'monospace'
      
      // 计算字符宽度（近似）
      const charWidth = this.getCharWidth(fontSize, fontFamily)
      
      const top = paddingTop + (lineIndex * lineHeight)
      const left = paddingLeft + (columnIndex * charWidth)
      
      const isSelf = String(cursor.userId) === String(this.selfUserId)
      
      return {
        top: `${top}px`,
        left: `${left}px`,
        '--cursor-color': this.getUserColor(cursor.userId),
        opacity: isSelf ? 0.7 : 1 // 自己的光标稍微透明一些
      }
    },
    getRangeStyle(range) {
      if (!this.textarea || !range || range.start === undefined || range.end === undefined) return {}
      
      const text = this.textarea.value || ''
      const startPos = this.getTextPosition(text, range.start)
      const endPos = this.getTextPosition(text, range.end)
      
      if (!startPos || !endPos) return {}
      
      const lineHeight = parseFloat(this.textareaStyle?.lineHeight || '20')
      const paddingTop = parseFloat(this.textareaStyle?.paddingTop || '10')
      const paddingLeft = parseFloat(this.textareaStyle?.paddingLeft || '10')
      const fontSize = parseFloat(this.textareaStyle?.fontSize || '14')
      const fontFamily = this.textareaStyle?.fontFamily || 'monospace'
      const charWidth = this.getCharWidth(fontSize, fontFamily)
      
      const top = paddingTop + (startPos.line * lineHeight)
      const left = paddingLeft + (startPos.column * charWidth)
      const width = endPos.line === startPos.line
        ? (endPos.column - startPos.column) * charWidth
        : '100%'
      const height = endPos.line === startPos.line
        ? lineHeight
        : ((endPos.line - startPos.line + 1) * lineHeight)
      
      return {
        top: `${top}px`,
        left: `${left}px`,
        width: typeof width === 'number' ? `${width}px` : width,
        height: `${height}px`,
        '--range-color': this.getUserColor(range.userId)
      }
    },
    getTextPosition(text, offset) {
      const lines = text.split('\n')
      let currentOffset = 0
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1
        if (currentOffset + lineLength > offset) {
          return {
            line: i,
            column: offset - currentOffset
          }
        }
        currentOffset += lineLength
      }
      
      return {
        line: lines.length - 1,
        column: lines[lines.length - 1].length
      }
    },
    getCharWidth(fontSize, fontFamily) {
      // 近似计算字符宽度
      if (fontFamily.includes('monospace')) {
        return fontSize * 0.6
      }
      return fontSize * 0.55
    },
    getUserColor(userId) {
      const colors = [
        '#5EB6E4', '#F59E0B', '#10B981', '#EF4444',
        '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
      ]
      const index = parseInt(String(userId || '0'), 10) % colors.length
      return colors[index]
    },
    getCursorLabel(cursor) {
      const editor = this.editorInfo[cursor.userId]
      return editor?.username || `用户${cursor.userId}`
    },
    getCursorAvatar(cursor) {
      const editor = this.editorInfo[cursor.userId]
      return editor?.avatar || null
    },
    getCursorTitle(cursor) {
      const editor = this.editorInfo[cursor.userId]
      const isSelf = String(cursor.userId) === String(this.selfUserId)
      return isSelf 
        ? '您正在编辑'
        : `${editor?.username || `用户${cursor.userId}`} 正在编辑`
    },
    getRangeLabel(range) {
      const editor = this.editorInfo[range.userId]
      return editor?.username || `用户${range.userId}`
    }
  }
}
</script>

<style scoped>
.wiki-collab-overlay {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
}

.collab-cursor {
  position: absolute;
  width: 2px;
  height: 20px;
  background-color: var(--cursor-color, #5EB6E4);
  animation: cursor-blink 1s infinite;
  pointer-events: none;
  z-index: 1;
}

.collab-cursor.is-self {
  opacity: 0.7;
  width: 2px;
}

.collab-cursor .cursor-line {
  width: 100%;
  height: 100%;
  background-color: var(--cursor-color, #5EB6E4);
}

.collab-cursor .cursor-label {
  position: absolute;
  top: -22px;
  left: 2px;
  padding: 2px 6px;
  background-color: var(--cursor-color, #5EB6E4);
  color: white;
  font-size: 11px;
  white-space: nowrap;
  border-radius: 4px;
  opacity: 0.95;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-width: 150px;
}

.collab-cursor .cursor-avatar {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.collab-cursor .cursor-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collab-range {
  position: absolute;
  background-color: var(--range-color, #5EB6E4);
  opacity: 0.2;
  border-left: 2px solid var(--range-color, #5EB6E4);
  pointer-events: none;
}

.collab-range.is-self {
  opacity: 0.15;
  border-left-width: 3px;
}

.collab-range .range-label {
  position: absolute;
  top: -18px;
  left: 0;
  padding: 2px 6px;
  background-color: var(--range-color, #5EB6E4);
  color: white;
  font-size: 11px;
  white-space: nowrap;
  border-radius: 3px;
  opacity: 0.9;
  pointer-events: none;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}
</style>

