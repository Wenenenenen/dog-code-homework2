<template>
  <div class="virtual-list" ref="containerRef" @scroll="handleScroll">
    <div
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    ></div>
    <div
      class="virtual-list-content"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <slot
        v-for="(item, index) in visibleData"
        :item="item"
        :index="index"
        :visible-start="visibleStart"
        :key="getItemKey(item, visibleStart + index)"
      ></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    default: 24
  },
  bufferSize: {
    type: Number,
    default: 5
  },
  getItemKey: {
    type: Function,
    default: (item, index) => index
  }
})

const containerRef = ref(null)
const scrollTop = ref(0)

const totalHeight = computed(() => props.data.length * props.itemHeight)

const visibleCount = computed(() => {
  if (!containerRef.value) return 10
  return Math.ceil(containerRef.value.clientHeight / props.itemHeight)
})

const visibleStart = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, start - props.bufferSize)
})

const visibleEnd = computed(() => {
  const end = visibleStart.value + visibleCount.value + props.bufferSize * 2
  return Math.min(props.data.length, end)
})

const visibleData = computed(() => {
  return props.data.slice(visibleStart.value, visibleEnd.value)
})

const offset = computed(() => {
  return visibleStart.value * props.itemHeight
})

const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}

const scrollToIndex = (index) => {
  if (containerRef.value) {
    containerRef.value.scrollTop = index * props.itemHeight
  }
}

defineExpose({ scrollToIndex, visibleStart })
</script>

<style scoped>
.virtual-list {
  position: relative;
  height: 100%;
  overflow-y: auto;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
</style>
