<template>
  <div class="json-editor">
    <div class="json-header">
      <h3>{{ title }}</h3>
      <div class="json-actions">
        <button type="button" @click="handleFormat" class="btn-default">
          格式化
        </button>
        <button 
          type="button" 
          @click="handleImport" 
          class="btn-primary"
          v-if="showImport"
        >
          导入
        </button>
      </div>
    </div>
    
    <div class="json-body">
      <textarea 
        v-model="jsonText" 
        @input="onInput"
        @blur="onBlur"
        class="json-textarea"
        :class="{ 'json-error': hasError }"
        spellcheck="false"
      ></textarea>
      
      <div class="json-error-message" v-if="errorMessage">
        ❌ {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: 'JSON'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  showImport: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:value', 'import'])

const jsonText = ref('')
const errorMessage = ref('')
const hasError = computed(() => !!errorMessage.value)

watch(() => props.value, (newVal) => {
  try {
    jsonText.value = JSON.stringify(newVal, null, 2)
    errorMessage.value = ''
  } catch (e) {
    jsonText.value = ''
    errorMessage.value = '序列化失败: ' + e.message
  }
}, { immediate: true, deep: true })

function onInput() {
  if (props.readonly) return
  
  try {
    JSON.parse(jsonText.value)
    errorMessage.value = ''
  } catch (e) {
    errorMessage.value = 'JSON 格式错误: ' + e.message
  }
}

function onBlur() {
  if (props.readonly) return
  
  try {
    const parsed = JSON.parse(jsonText.value)
    emit('update:value', parsed)
    errorMessage.value = ''
  } catch (e) {
    errorMessage.value = 'JSON 格式错误: ' + e.message
  }
}

function handleFormat() {
  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed, null, 2)
    errorMessage.value = ''
  } catch (e) {
    errorMessage.value = '格式化失败: ' + e.message
  }
}

function handleImport() {
  if (errorMessage.value) return
  
  try {
    const parsed = JSON.parse(jsonText.value)
    emit('import', parsed)
  } catch (e) {
    errorMessage.value = '导入失败: ' + e.message
  }
}
</script>

<style scoped>
.json-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.json-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.json-actions {
  display: flex;
  gap: 8px;
}

.json-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.json-textarea {
  flex: 1;
  width: 100%;
  padding: 12px;
  border: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  background: var(--white);
  color: var(--text-color);
}

.json-textarea:focus {
  outline: none;
}

.json-textarea.json-error {
  background: rgba(255, 77, 79, 0.05);
}

.json-error-message {
  padding: 8px 12px;
  background: rgba(255, 77, 79, 0.1);
  color: var(--danger-color);
  font-size: 13px;
  border-top: 1px solid var(--border-color);
}
</style>
