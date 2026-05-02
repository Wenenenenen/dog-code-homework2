<template>
  <div class="input-panel">
    <div class="input-section">
      <div class="section-header">
        <span class="section-title">原始文本</span>
        <button class="clear-btn" @click="$emit('clear-old')">清空</button>
      </div>
      <textarea
        v-model="oldText"
        class="text-input"
        placeholder="请输入原始文本..."
        @input="handleOldInput"
      ></textarea>
    </div>
    <div class="input-section">
      <div class="section-header">
        <span class="section-title">新文本</span>
        <button class="clear-btn" @click="$emit('clear-new')">清空</button>
      </div>
      <textarea
        v-model="newText"
        class="text-input"
        placeholder="请输入新文本..."
        @input="handleNewInput"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ old: '', new: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'clear-old', 'clear-new'])

const oldText = ref(props.modelValue.old)
const newText = ref(props.modelValue.new)

watch(() => props.modelValue, (val) => {
  oldText.value = val.old
  newText.value = val.new
}, { deep: true })

watch(oldText, (val) => {
  emit('update:modelValue', { old: val, new: newText.value })
})

watch(newText, (val) => {
  emit('update:modelValue', { old: oldText.value, new: val })
})

const handleOldInput = () => {
  emit('update:modelValue', { old: oldText.value, new: newText.value })
}

const handleNewInput = () => {
  emit('update:modelValue', { old: oldText.value, new: newText.value })
}
</script>

<style scoped>
.input-panel {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.clear-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.text-input {
  flex: 1;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
</style>
