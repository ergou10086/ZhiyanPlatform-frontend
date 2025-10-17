<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    :type="type"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot v-if="!loading">{{ text }}</slot>
    <span v-if="loading" class="ml-2">{{ loadingText }}</span>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'success', 'warning', 'error', 'ghost'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    text: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'button'
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClasses() {
      const baseClasses = [
        'btn',
        `btn-${this.variant}`,
        `btn-${this.size}`,
        this.fullWidth ? 'btn-full' : '',
        this.loading ? 'btn-loading' : ''
      ].filter(Boolean)

      return baseClasses.join(' ')
    }
  },
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

/* 尺寸变体 */
.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.btn-md {
  @apply px-4 py-2 text-sm;
}

.btn-lg {
  @apply px-6 py-3 text-base;
}

.btn-xl {
  @apply px-8 py-4 text-lg;
}

/* 颜色变体 */
.btn-primary {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 focus:ring-gray-500;
}

.btn-success {
  @apply bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-sm hover:from-green-700 hover:to-green-800 hover:shadow-md focus:ring-green-500;
}

.btn-warning {
  @apply bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-sm hover:from-yellow-600 hover:to-yellow-700 hover:shadow-md focus:ring-yellow-500;
}

.btn-error {
  @apply bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-sm hover:from-red-700 hover:to-red-800 hover:shadow-md focus:ring-red-500;
}

.btn-ghost {
  @apply bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500;
}

/* 全宽按钮 */
.btn-full {
  @apply w-full;
}

/* 加载状态 */
.btn-loading {
  @apply cursor-wait;
}

/* 动画 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 悬停效果 */
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}
</style>
