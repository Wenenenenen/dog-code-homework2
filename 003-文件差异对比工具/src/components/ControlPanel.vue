<template>
  <div class="control-panel">
    <div class="view-toggle">
      <button
        :class="['toggle-btn', { active: viewMode === 'side-by-side' }]"
        @click="$emit('update:viewMode', 'side-by-side')"
      >
        并排对比
      </button>
      <button
        :class="['toggle-btn', { active: viewMode === 'unified' }]"
        @click="$emit('update:viewMode', 'unified')"
      >
        合并视图
      </button>
    </div>
    <div class="stats">
      <span class="stat-item changes">
        <span class="stat-label">变更:</span>
        <span class="stat-value">{{ stats.changes }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">新增:</span>
        <span class="stat-value insert">{{ stats.inserts }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">删除:</span>
        <span class="stat-value delete">{{ stats.deletes }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">修改:</span>
        <span class="stat-value modify">{{ stats.modifies }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">不变:</span>
        <span class="stat-value equal">{{ stats.equals }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">总计:</span>
        <span class="stat-value total">{{ stats.total }}</span>
      </span>
    </div>
    <div class="diff-nav" v-if="diffBlocks.length > 0">
      <span class="diff-nav-label">差异定位:</span>
      <button 
        class="nav-btn prev"
        @click="navigateDiff(-1)"
        :disabled="currentDiffIndex <= 0"
      >
        上一个
      </button>
      <span class="diff-index">{{ currentDiffIndex + 1 }} / {{ diffBlocks.length }}</span>
      <button 
        class="nav-btn next"
        @click="navigateDiff(1)"
        :disabled="currentDiffIndex >= diffBlocks.length - 1"
      >
        下一个
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { mergeDiffBlocks } from '../utils/diff.js'

const props = defineProps({
  viewMode: {
    type: String,
    default: 'side-by-side'
  },
  stats: {
    type: Object,
    default: () => ({ inserts: 0, deletes: 0, modifies: 0, equals: 0, total: 0, changes: 0 })
  },
  diff: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:viewMode', 'navigate-to'])

const currentDiffIndex = ref(0)

const diffBlocks = computed(() => {
  return mergeDiffBlocks(props.diff).filter(b => b.type !== 'equal')
})

watch(() => props.diff, () => {
  currentDiffIndex.value = 0
}, { deep: true })

const navigateDiff = (direction) => {
  const newIndex = currentDiffIndex.value + direction
  if (newIndex >= 0 && newIndex < diffBlocks.value.length) {
    currentDiffIndex.value = newIndex
    const block = diffBlocks.value[newIndex]
    if (block && block.items && block.items.length > 0) {
      const firstItem = block.items[0]
      let targetIndex = props.diff.indexOf(firstItem)
      if (targetIndex !== -1) {
        emit('navigate-to', targetIndex)
      }
    }
  }
}
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  gap: 16px;
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #f0f0f0;
}

.toggle-btn.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  gap: 6px;
  align-items: center;
}

.stat-item.changes {
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
}

.stat-item.changes .stat-label,
.stat-item.changes .stat-value {
  color: #fff;
  font-weight: 600;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.stat-value.insert {
  color: #52c41a;
}

.stat-value.delete {
  color: #ff4d4f;
}

.stat-value.modify {
  color: #faad14;
}

.stat-value.equal {
  color: #8c8c8c;
}

.stat-value.total {
  color: #333;
}

.diff-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diff-nav-label {
  font-size: 13px;
  color: #666;
}

.nav-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.diff-index {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}
</style>
