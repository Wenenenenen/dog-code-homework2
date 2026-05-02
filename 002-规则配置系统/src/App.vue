<template>
  <div class="app-container">
    <header class="app-header">
      <h1>📋 可视化规则配置系统</h1>
      <p class="subtitle">风控 / 营销规则编辑器</p>
    </header>

    <main class="app-main">
      <div class="editor-section">
        <div class="section-header">
          <h2>规则编辑器</h2>
          <div class="header-actions">
            <button type="button" @click="loadExample" class="btn-default">
              加载示例
            </button>
            <button type="button" @click="saveToLocalStorage" class="btn-default">
              保存配置
            </button>
            <button type="button" @click="loadFromLocalStorage" class="btn-default">
              加载配置
            </button>
            <button type="button" @click="resetRules" class="btn-danger">
              重置
            </button>
          </div>
        </div>

        <div class="editor-wrapper">
          <RuleGroup
            v-if="currentRule"
            :rule="currentRule"
            :is-root="true"
            @update:rule="handleRuleUpdate"
          />
          <div class="empty-rules" v-else>
            <p>暂无规则，请点击下方按钮创建</p>
            <button type="button" @click="resetRules" class="btn-primary">
              创建规则
            </button>
          </div>
        </div>

        <div class="validation-section">
          <ValidationResult :result="validationResult" />
        </div>
      </div>

      <div class="json-section">
        <div class="json-output">
          <JsonEditor
            :value="currentRule"
            title="实时 JSON 输出"
            :readonly="true"
            :show-import="false"
          />
        </div>

        <div class="json-input">
          <JsonEditor
            :value="importJson"
            title="JSON 回显编辑"
            @update:value="importJson = $event"
            @import="handleImport"
          />
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>💡 提示：支持拖拽排序、嵌套层级调整、JSON 实时同步</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import RuleGroup from './components/RuleGroup.vue'
import JsonEditor from './components/JsonEditor.vue'
import ValidationResult from './components/ValidationResult.vue'
import { createGroup, RuleType, cloneRule } from './utils/ruleUtils'
import { validateRule } from './utils/validation'

const STORAGE_KEY = 'rule_config_system_rules'

const currentRule = ref(createGroup(RuleType.AND))
const importJson = ref(null)

const validationResult = computed(() => {
  if (!currentRule.value) return null
  return validateRule(currentRule.value)
})

watch(currentRule, (newRule) => {
  if (newRule) {
    importJson.value = cloneRule(newRule)
  }
}, { immediate: true, deep: true })

function handleRuleUpdate(newRule) {
  currentRule.value = newRule
}

function handleImport(importedRule) {
  try {
    const result = validateRule(importedRule)
    if (!result.isValid) {
      alert('导入的规则校验失败，请检查 JSON 格式和内容')
      return
    }
    currentRule.value = cloneRule(importedRule)
    alert('✅ 导入成功！')
  } catch (e) {
    alert('导入失败: ' + e.message)
  }
}

function loadExample() {
  const exampleRule = {
    type: 'AND',
    id: 'example_root',
    children: [
      {
        type: 'CONDITION',
        id: 'example_1',
        field: 'age',
        operator: 'gte',
        value: 18,
        valueType: 'number'
      },
      {
        type: 'OR',
        id: 'example_group_1',
        children: [
          {
            type: 'CONDITION',
            id: 'example_2',
            field: 'city',
            operator: 'in',
            value: ['beijing', 'shanghai'],
            valueType: 'enum'
          },
          {
            type: 'CONDITION',
            id: 'example_3',
            field: 'amount',
            operator: 'between',
            value: [1000, 10000],
            valueType: 'number'
          }
        ]
      },
      {
        type: 'CONDITION',
        id: 'example_4',
        field: 'name',
        operator: 'contains',
        value: '张',
        valueType: 'text'
      }
    ]
  }
  currentRule.value = exampleRule
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRule.value))
    alert('✅ 规则已保存到本地存储')
  } catch (e) {
    alert('保存失败: ' + e.message)
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const result = validateRule(parsed)
      if (!result.isValid) {
        alert('⚠️ 已保存的规则校验存在问题，仍将加载')
      }
      currentRule.value = parsed
      alert('✅ 规则已从本地存储加载')
    } else {
      alert('未找到已保存的规则')
    }
  } catch (e) {
    alert('加载失败: ' + e.message)
  }
}

function resetRules() {
  currentRule.value = createGroup(RuleType.AND)
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--white);
  padding: 24px 32px;
  text-align: center;
}

.app-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.editor-wrapper {
  flex: 1;
  min-height: 200px;
}

.empty-rules {
  text-align: center;
  padding: 48px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius);
  color: var(--text-secondary);
}

.empty-rules p {
  margin-bottom: 16px;
}

.validation-section {
  flex-shrink: 0;
}

.json-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.json-output {
  flex: 1;
  min-height: 300px;
}

.json-input {
  flex: 1;
  min-height: 300px;
}

.app-footer {
  background: var(--bg-color);
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.app-footer p {
  margin: 0;
}

@media (max-width: 1200px) {
  .app-main {
    grid-template-columns: 1fr;
  }
  
  .json-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 16px;
  }
  
  .app-header h1 {
    font-size: 22px;
  }
  
  .app-main {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .json-section {
    grid-template-columns: 1fr;
  }
}
</style>
