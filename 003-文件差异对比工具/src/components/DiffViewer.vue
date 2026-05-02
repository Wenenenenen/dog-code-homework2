<template>
  <div class="diff-viewer">
    <div v-if="viewMode === 'side-by-side'" class="side-by-side">
      <div class="diff-column">
        <div class="column-header">原始文本</div>
        <div class="diff-content" ref="leftContainerRef">
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div :style="{ transform: `translateY(${leftOffset}px)` }">
              <div
                v-for="(item, idx) in visibleLeftLines"
                :key="item.key"
                :class="['diff-line', item.type, { clickable: item.type !== 'empty' && item.type !== 'equal' }, { highlighted: highlightedIndex === item.absoluteIndex }]"
                @click="handleLineClick(item.absoluteIndex, item)"
              >
                <span class="line-num">{{ item.lineNum }}</span>
                <span class="line-content">{{ item.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="diff-column">
        <div class="column-header">新文本</div>
        <div class="diff-content" ref="rightContainerRef">
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div :style="{ transform: `translateY(${rightOffset}px)` }">
              <div
                v-for="(item, idx) in visibleRightLines"
                :key="item.key"
                :class="['diff-line', item.type, { clickable: item.type !== 'empty' && item.type !== 'equal' }, { highlighted: highlightedIndex === item.absoluteIndex }]"
                @click="handleLineClick(item.absoluteIndex, item)"
              >
                <span class="line-num">{{ item.lineNum }}</span>
                <span class="line-content">{{ item.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="unified">
      <div class="column-header">合并视图</div>
      <div class="diff-content" ref="unifiedContainerRef">
        <div :style="{ height: unifiedTotalHeight + 'px', position: 'relative' }">
          <div :style="{ transform: `translateY(${unifiedOffset}px)` }">
            <div
              v-for="(item, idx) in visibleUnifiedLines"
              :key="item.key"
              :class="['diff-line', item.type, { clickable: item.type !== 'equal' }, { highlighted: highlightedIndex === item.absoluteIndex }]"
              @click="handleLineClick(item.absoluteIndex, item)"
            >
              <span class="line-nums">
                <span class="line-num-old">{{ item.oldLineNum }}</span>
                <span class="line-num-new">{{ item.newLineNum }}</span>
              </span>
              <span class="line-content">{{ item.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  diff: {
    type: Array,
    required: true
  },
  viewMode: {
    type: String,
    default: 'side-by-side'
  }
})

const emit = defineEmits(['highlight-block'])

const ITEM_HEIGHT = 24
const BUFFER_SIZE = 5

const leftContainerRef = ref(null)
const rightContainerRef = ref(null)
const unifiedContainerRef = ref(null)

const leftScrollTop = ref(0)
const rightScrollTop = ref(0)
const unifiedScrollTop = ref(0)

const highlightedIndex = ref(-1)

const leftLines = computed(() => {
  const lines = []
  let lineNum = 1
  for (const item of props.diff) {
    if (item.type === 'delete' || item.type === 'equal') {
      lines.push({
        type: item.type,
        content: item.oldLine || '',
        lineNum: lineNum++,
        absoluteIndex: lines.length
      })
    } else if (item.type === 'insert') {
      lines.push({
        type: 'empty',
        content: '',
        lineNum: '',
        absoluteIndex: lines.length
      })
    } else if (item.type === 'modify') {
      lines.push({
        type: 'modify-old',
        content: item.oldLine || '',
        lineNum: lineNum++,
        absoluteIndex: lines.length
      })
    }
  }
  lines.forEach((line, idx) => line.key = `left-${idx}`)
  return lines
})

const rightLines = computed(() => {
  const lines = []
  let lineNum = 1
  for (const item of props.diff) {
    if (item.type === 'insert' || item.type === 'equal') {
      lines.push({
        type: item.type,
        content: item.newLine || '',
        lineNum: lineNum++,
        absoluteIndex: lines.length
      })
    } else if (item.type === 'delete') {
      lines.push({
        type: 'empty',
        content: '',
        lineNum: '',
        absoluteIndex: lines.length
      })
    } else if (item.type === 'modify') {
      lines.push({
        type: 'modify-new',
        content: item.newLine || '',
        lineNum: lineNum++,
        absoluteIndex: lines.length
      })
    }
  }
  lines.forEach((line, idx) => line.key = `right-${idx}`)
  return lines
})

const unifiedLines = computed(() => {
  const lines = []
  let oldLineNum = 1
  let newLineNum = 1
  for (const item of props.diff) {
    if (item.type === 'delete') {
      lines.push({
        type: 'delete',
        content: item.oldLine || '',
        oldLineNum: oldLineNum++,
        newLineNum: '',
        absoluteIndex: lines.length
      })
    } else if (item.type === 'insert') {
      lines.push({
        type: 'insert',
        content: item.newLine || '',
        oldLineNum: '',
        newLineNum: newLineNum++,
        absoluteIndex: lines.length
      })
    } else if (item.type === 'modify') {
      lines.push({
        type: 'modify-old',
        content: item.oldLine || '',
        oldLineNum: oldLineNum++,
        newLineNum: '',
        absoluteIndex: lines.length
      })
      lines.push({
        type: 'modify-new',
        content: item.newLine || '',
        oldLineNum: '',
        newLineNum: newLineNum++,
        absoluteIndex: lines.length
      })
    } else {
      lines.push({
        type: 'equal',
        content: item.oldLine || '',
        oldLineNum: oldLineNum++,
        newLineNum: newLineNum++,
        absoluteIndex: lines.length
      })
    }
  }
  lines.forEach((line, idx) => line.key = `unified-${idx}`)
  return lines
})

const totalHeight = computed(() => leftLines.value.length * ITEM_HEIGHT)
const unifiedTotalHeight = computed(() => unifiedLines.value.length * ITEM_HEIGHT)

const getVisibleLines = (lines, scrollTop, containerHeight) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
  const endIndex = Math.min(
    lines.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
  )
  return lines.slice(startIndex, endIndex).map((item, idx) => ({
    ...item,
    key: item.key || `item-${startIndex + idx}`,
    visibleIndex: startIndex + idx
  }))
}

const visibleLeftLines = computed(() => {
  if (!leftContainerRef.value) return leftLines.value.slice(0, 20)
  return getVisibleLines(leftLines.value, leftScrollTop.value, leftContainerRef.value.clientHeight)
})

const visibleRightLines = computed(() => {
  if (!rightContainerRef.value) return rightLines.value.slice(0, 20)
  return getVisibleLines(rightLines.value, rightScrollTop.value, rightContainerRef.value.clientHeight)
})

const visibleUnifiedLines = computed(() => {
  if (!unifiedContainerRef.value) return unifiedLines.value.slice(0, 20)
  return getVisibleLines(unifiedLines.value, unifiedScrollTop.value, unifiedContainerRef.value.clientHeight)
})

const leftOffset = computed(() => {
  if (!leftContainerRef.value) return 0
  const startIndex = Math.max(0, Math.floor(leftScrollTop.value / ITEM_HEIGHT) - BUFFER_SIZE)
  return startIndex * ITEM_HEIGHT
})

const rightOffset = computed(() => {
  if (!rightContainerRef.value) return 0
  const startIndex = Math.max(0, Math.floor(rightScrollTop.value / ITEM_HEIGHT) - BUFFER_SIZE)
  return startIndex * ITEM_HEIGHT
})

const unifiedOffset = computed(() => {
  if (!unifiedContainerRef.value) return 0
  const startIndex = Math.max(0, Math.floor(unifiedScrollTop.value / ITEM_HEIGHT) - BUFFER_SIZE)
  return startIndex * ITEM_HEIGHT
})

const handleScroll = (side, e) => {
  if (side === 'left') {
    leftScrollTop.value = e.target.scrollTop
  } else if (side === 'right') {
    rightScrollTop.value = e.target.scrollTop
  } else {
    unifiedScrollTop.value = e.target.scrollTop
  }
}

const handleLineClick = (index, item) => {
  if (item.type !== 'empty' && item.type !== 'equal') {
    highlightedIndex.value = index
    emit('highlight-block', { index, type: item.type })
    scrollToIndex(index)
  }
}

const scrollToIndex = (index) => {
  highlightedIndex.value = index
  nextTick(() => {
    const targetTop = index * ITEM_HEIGHT
    if (props.viewMode === 'side-by-side') {
      if (leftContainerRef.value) {
        leftContainerRef.value.scrollTop = targetTop
        leftScrollTop.value = targetTop
      }
      if (rightContainerRef.value) {
        rightContainerRef.value.scrollTop = targetTop
        rightScrollTop.value = targetTop
      }
    } else {
      if (unifiedContainerRef.value) {
        unifiedContainerRef.value.scrollTop = targetTop
        unifiedScrollTop.value = targetTop
      }
    }
  })
}

watch(() => props.viewMode, () => {
  highlightedIndex.value = -1
})

watch(() => props.diff, () => {
  highlightedIndex.value = -1
  leftScrollTop.value = 0
  rightScrollTop.value = 0
  unifiedScrollTop.value = 0
}, { deep: true })

onMounted(() => {
  if (leftContainerRef.value) {
    leftContainerRef.value.addEventListener('scroll', (e) => handleScroll('left', e))
  }
  if (rightContainerRef.value) {
    rightContainerRef.value.addEventListener('scroll', (e) => handleScroll('right', e))
  }
  if (unifiedContainerRef.value) {
    unifiedContainerRef.value.addEventListener('scroll', (e) => handleScroll('unified', e))
  }
})

onUnmounted(() => {
  if (leftContainerRef.value) {
    leftContainerRef.value.removeEventListener('scroll', (e) => handleScroll('left', e))
  }
  if (rightContainerRef.value) {
    rightContainerRef.value.removeEventListener('scroll', (e) => handleScroll('right', e))
  }
  if (unifiedContainerRef.value) {
    unifiedContainerRef.value.removeEventListener('scroll', (e) => handleScroll('unified', e))
  }
})

defineExpose({
  scrollToIndex
})
</script>

<style scoped>
.diff-viewer {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.side-by-side {
  display: flex;
  height: 500px;
}

.diff-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
}

.diff-column:last-child {
  border-right: none;
}

.column-header {
  padding: 12px 16px;
  background: #f5f5f5;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
}

.diff-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.unified {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.diff-line {
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 24px;
  white-space: pre;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  height: 24px;
  box-sizing: border-box;
}

.diff-line.clickable {
  cursor: pointer;
}

.diff-line.clickable:hover {
  filter: brightness(0.95);
}

.diff-line.highlighted {
  box-shadow: inset 0 0 0 2px #409eff;
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: inset 0 0 0 2px #409eff;
  }
  50% {
    box-shadow: inset 0 0 0 4px rgba(64, 158, 255, 0.3);
  }
}

.diff-line.insert {
  background: #e6ffec;
}

.diff-line.delete {
  background: #ffeef0;
}

.diff-line.modify-old {
  background: #fffbe6;
}

.diff-line.modify-new {
  background: #fffbe6;
}

.diff-line.empty {
  background: #fafafa;
}

.line-num {
  display: inline-block;
  width: 50px;
  text-align: right;
  padding-right: 12px;
  color: #999;
  flex-shrink: 0;
}

.line-nums {
  display: inline-flex;
  flex-shrink: 0;
}

.line-num-old,
.line-num-new {
  display: inline-block;
  width: 50px;
  text-align: right;
  padding-right: 12px;
  color: #999;
}

.line-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
