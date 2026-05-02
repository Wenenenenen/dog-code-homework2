<template>
  <div class="app">
    <header class="header">
      <h1>文件差异对比工具</h1>
      <p>类似 Git Diff 的文本比较工具</p>
    </header>
    <main class="main">
      <InputPanel
        v-model="texts"
        @clear-old="clearOld"
        @clear-new="clearNew"
      />
      <ControlPanel
        v-model:view-mode="viewMode"
        :stats="stats"
        :diff="diffResult"
        @navigate-to="navigateTo"
      />
      <DiffViewer
        ref="diffViewerRef"
        :diff="diffResult"
        :view-mode="viewMode"
        @highlight-block="handleHighlightBlock"
      />
      <div class="sample-buttons">
        <button class="sample-btn" @click="loadSample1">加载示例 1</button>
        <button class="sample-btn" @click="loadSample2">加载示例 2</button>
        <button class="sample-btn" @click="loadLargeSample">加载大文本</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputPanel from './components/InputPanel.vue'
import ControlPanel from './components/ControlPanel.vue'
import DiffViewer from './components/DiffViewer.vue'
import { diffLines, calculateStats } from './utils/diff.js'

const texts = ref({ old: '', new: '' })
const viewMode = ref('side-by-side')
const diffViewerRef = ref(null)

const diffResult = computed(() => {
  return diffLines(texts.value.old, texts.value.new)
})

const stats = computed(() => {
  return calculateStats(diffResult.value)
})

const clearOld = () => {
  texts.value.old = ''
}

const clearNew = () => {
  texts.value.new = ''
}

const handleHighlightBlock = ({ index }) => {
  diffViewerRef.value?.scrollToIndex(index)
}

const navigateTo = (index) => {
  diffViewerRef.value?.scrollToIndex(index)
}

const loadSample1 = () => {
  texts.value.old = `function hello() {
  console.log("Hello, World!");
  return 42;
}

function add(a, b) {
  return a + b;
}`
  texts.value.new = `function greet() {
  console.log("Hello, Everyone!");
  console.log("Nice to meet you!");
  return 42;
}

function multiply(a, b) {
  return a * b;
}

function subtract(a, b) {
  return a - b;
}`
}

const loadSample2 = () => {
  texts.value.old = `const arr = [1, 2, 3, 4, 5];
const sum = arr.reduce((a, b) => a + b, 0);
console.log(sum);`
  texts.value.new = `const arr = [1, 2, 3, 4, 5, 6, 7, 8];
const sum = arr.reduce((acc, curr) => acc + curr, 0);
const average = sum / arr.length;
console.log("Sum:", sum);
console.log("Average:", average);`
}

const loadLargeSample = () => {
  let oldText = ''
  let newText = ''
  for (let i = 0; i < 100; i++) {
    oldText += `Line ${i + 1}: This is some sample text\n`
    if (i % 5 === 0) {
      newText += `Line ${i + 1}: This is modified text\n`
    } else if (i % 7 === 0) {
      newText += `Line ${i + 1}: This is inserted text\n`
      newText += `Line ${i + 1.5}: Extra line here\n`
    } else if (i % 11 === 0) {
    } else {
      newText += `Line ${i + 1}: This is some sample text\n`
    }
  }
  texts.value.old = oldText
  texts.value.new = newText
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.header {
  text-align: center;
  color: #fff;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.header p {
  font-size: 14px;
  opacity: 0.9;
}

.main {
  max-width: 1400px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.sample-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.sample-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  background: #409eff;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.sample-btn:hover {
  background: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}
</style>
