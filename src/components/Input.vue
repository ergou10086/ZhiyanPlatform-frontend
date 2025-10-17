<template>
  <div class="input-group">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="input-wrapper" :class="{ 'input-error': hasError, 'input-disabled': disabled }">
      <div v-if="$slots.prefix" class="input-prefix">
        <slot name="prefix"></slot>
      </div>
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :minlength="minlength"
        :maxlength="maxlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        class="input-field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      
      <div v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix"></slot>
      </div>
      
      <div v-if="clearable && modelValue && !disabled" class="input-clear" @click="handleClear">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
    </div>
    
    <div v-if="helpText || hasError" class="input-help">
      <span v-if="hasError" class="text-red-600">{{ errorMessage }}</span>
      <span v-else-if="helpText" class="text-gray-500">{{ helpText }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    },
    // HTML input 属性
    min: {
      type: [String, Number],
      default: undefined
    },
    max: {
      type: [String, Number],
      default: undefined
    },
    step: {
      type: [String, Number],
      default: undefined
    },
    minlength: {
      type: [String, Number],
      default: undefined
    },
    maxlength: {
      type: [String, Number],
      default: undefined
    },
    pattern: {
      type: String,
      default: undefined
    },
    autocomplete: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'keydown', 'clear'],
  computed: {
    inputId() {
      return `input-${this._uid}`
    },
    hasError() {
      return !!this.errorMessage
    }
  },
  methods: {
    handleInput(event) {
      this.$emit('update:modelValue', event.target.value)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleKeydown(event) {
      this.$emit('keydown', event)
    },
    handleClear() {
      this.$emit('update:modelValue', '')
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>
.input-group {
  @apply w-full;
}

.input-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.input-wrapper {
  @apply relative flex items-center border border-gray-300 rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500;
}

.input-wrapper.input-error {
  @apply border-red-500 focus-within:ring-red-500 focus-within:border-red-500;
}

.input-wrapper.input-disabled {
  @apply bg-gray-100 cursor-not-allowed;
}

.input-field {
  @apply w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-transparent border-0 outline-none focus:ring-0;
}

.input-field:disabled {
  @apply text-gray-500 cursor-not-allowed;
}

.input-field:read-only {
  @apply cursor-default;
}

.input-prefix {
  @apply pl-3 text-gray-500;
}

.input-suffix {
  @apply pr-3 text-gray-500;
}

.input-clear {
  @apply pr-3 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200;
}

.input-help {
  @apply mt-1 text-xs;
}

/* 尺寸变体 */
.input-wrapper.size-sm .input-field {
  @apply px-2 py-1 text-xs;
}

.input-wrapper.size-lg .input-field {
  @apply px-4 py-3 text-base;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .input-wrapper.size-lg .input-field {
    @apply px-3 py-2 text-sm;
  }
}
</style>
