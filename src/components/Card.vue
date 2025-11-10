<template>
  <div :class="cardClasses" @click="handleClick">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    
    <div v-if="$slots.media" class="card-media">
      <slot name="media"></slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'elevated', 'outlined', 'filled'].includes(value)
    },
    hover: {
      type: Boolean,
      default: true
    },
    clickable: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String,
      default: 'md',
      validator: value => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    }
  },
  computed: {
    cardClasses() {
      const baseClasses = [
        'card',
        `card-${this.variant}`,
        `card-padding-${this.padding}`,
        this.hover ? 'card-hover' : '',
        this.clickable ? 'card-clickable' : ''
      ].filter(Boolean)

      return baseClasses.join(' ')
    }
  },
  methods: {
    handleClick(event) {
      if (this.clickable) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200;
}

/* 变体样式 */
.card-default {
  @apply shadow-sm;
}

.card-elevated {
  @apply shadow-lg;
}

.card-outlined {
  @apply shadow-none border-2;
}

.card-filled {
  @apply bg-gray-50 shadow-none border-0;
}

/* 内边距变体 */
.card-padding-none {
  @apply p-0;
}

.card-padding-sm {
  @apply p-3;
}

.card-padding-md {
  @apply p-4;
}

.card-padding-lg {
  @apply p-6;
}

.card-padding-xl {
  @apply p-8;
}

/* 悬停效果 */
.card-hover:hover {
  @apply shadow-md transform -translate-y-1;
}

/* 可点击样式 */
.card-clickable {
  @apply cursor-pointer;
}

.card-clickable:hover {
  @apply border-blue-300;
}

/* 卡片部分 */
.card-header {
  @apply px-4 py-3 border-b border-gray-200 bg-gray-50;
}

.card-media {
  @apply w-full;
}

.card-body {
  @apply flex-1;
}

.card-footer {
  @apply px-4 py-3 border-t border-gray-200 bg-gray-50;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .card-padding-lg {
    @apply p-4;
  }
  
  .card-padding-xl {
    @apply p-6;
  }
}
</style>
