<template>
  <div class="validation-result" v-if="result">
    <div class="validation-header">
      <div class="validation-status" :class="statusClass">
        <span class="status-icon">{{ statusIcon }}</span>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div class="validation-stats" v-if="hasStats">
        <div class="stat-item">
          <span class="stat-number">{{ result.stats.totalNodes }}</span>
          <span class="stat-label">节点</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ result.stats.conditionCount }}</span>
          <span class="stat-label">条件</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ result.stats.groupCount }}</span>
          <span class="stat-label">分组</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ result.stats.maxDepth }}</span>
          <span class="stat-label">最大深度</span>
        </div>
        <div class="stat-item error-stat" v-if="result.stats.errorCount > 0">
          <span class="stat-number">{{ result.stats.errorCount }}</span>
          <span class="stat-label">错误</span>
        </div>
        <div class="stat-item warning-stat" v-if="result.stats.warningCount > 0">
          <span class="stat-number">{{ result.stats.warningCount }}</span>
          <span class="stat-label">警告</span>
        </div>
      </div>
    </div>

    <div class="validation-issues" v-if="hasIssues">
      <div class="issue-section errors" v-if="result.errors.length > 0">
        <div class="section-header">
          <span class="section-icon">❌</span>
          <span class="section-title">错误 ({{ result.errors.length }})</span>
        </div>
        <ul class="issue-list">
          <li v-for="(error, index) in result.errors" :key="index" class="issue-item error">
            <div class="issue-meta">
              <span class="issue-depth">深度: {{ error.depth }}</span>
              <span class="issue-type" v-if="error.type">{{ error.type }}</span>
            </div>
            <div class="issue-content">
              <span class="issue-message">{{ error.message }}</span>
              <span class="issue-details">{{ error.details }}</span>
              <span class="issue-path" v-if="error.path">路径: {{ error.path }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="issue-section warnings" v-if="result.warnings.length > 0">
        <div class="section-header">
          <span class="section-icon">⚠️</span>
          <span class="section-title">警告 ({{ result.warnings.length }})</span>
        </div>
        <ul class="issue-list">
          <li v-for="(warning, index) in result.warnings" :key="index" class="issue-item warning">
            <div class="issue-meta">
              <span class="issue-depth">深度: {{ warning.depth }}</span>
              <span class="issue-type" v-if="warning.type">{{ warning.type }}</span>
            </div>
            <div class="issue-content">
              <span class="issue-message">{{ warning.message }}</span>
              <span class="issue-details">{{ warning.details }}</span>
              <span class="issue-path" v-if="warning.path">路径: {{ warning.path }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="validation-summary" v-if="!hasIssues && result.isValid">
      <div class="summary-icon">✅</div>
      <div class="summary-message">
        <p class="summary-title">所有规则校验通过</p>
        <p class="summary-details">
          共 {{ result.stats.conditionCount }} 个条件，
          {{ result.stats.groupCount }} 个分组，
          最大深度 {{ result.stats.maxDepth }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    default: null
  }
})

const hasIssues = computed(() => {
  if (!props.result) return false
  return props.result.errors.length > 0 || props.result.warnings.length > 0
})

const hasStats = computed(() => {
  if (!props.result || !props.result.stats) return false
  return true
})

const statusClass = computed(() => {
  if (!props.result) return 'unknown'
  if (!props.result.isValid) return 'error'
  if (props.result.warnings.length > 0) return 'warning'
  return 'success'
})

const statusIcon = computed(() => {
  if (!props.result) return '?'
  if (!props.result.isValid) return '❌'
  if (props.result.warnings.length > 0) return '⚠️'
  return '✅'
})

const statusText = computed(() => {
  if (!props.result) return '未校验'
  if (!props.result.isValid) return '校验失败'
  if (props.result.warnings.length > 0) return '校验通过（含警告）'
  return '校验通过'
})
</script>

<style scoped>
.validation-result {
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--white);
  border: 1px solid var(--border-color);
}

.validation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 12px;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.validation-status.error {
  color: var(--danger-color);
}

.validation-status.warning {
  color: var(--warning-color);
}

.validation-status.success {
  color: var(--success-color);
}

.status-icon {
  font-size: 18px;
}

.status-text {
  font-size: 14px;
}

.validation-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-number {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-color);
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.error-stat .stat-number {
  color: var(--danger-color);
}

.warning-stat .stat-number {
  color: var(--warning-color);
}

.validation-issues {
  padding: 0;
}

.issue-section {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.issue-section.errors {
  background: rgba(255, 77, 79, 0.05);
}

.issue-section.warnings {
  background: rgba(250, 173, 20, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
}

.issue-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 4px;
  background: var(--white);
}

.issue-item.error {
  border-left: 3px solid var(--danger-color);
}

.issue-item.warning {
  border-left: 3px solid var(--warning-color);
}

.issue-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-secondary);
  font-family: 'Consolas', monospace;
}

.issue-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.issue-message {
  font-size: 13px;
  color: var(--text-color);
  font-weight: 500;
}

.issue-details {
  font-size: 12px;
  color: var(--text-secondary);
}

.issue-path {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: 'Consolas', monospace;
}

.validation-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
}

.summary-icon {
  font-size: 32px;
}

.summary-message {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--success-color);
}

.summary-details {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
