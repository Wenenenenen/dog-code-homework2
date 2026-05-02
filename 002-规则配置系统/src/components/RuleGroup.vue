<template>
  <div class="rule-group" :data-id="rule.id">
    <div class="group-header">
      <div class="group-handle" v-if="draggable && !isRoot">
        <span class="drag-handle">⋮⋮</span>
      </div>

      <div class="group-title">
        <select
          :value="rule.type"
          @change="handleTypeChange"
          class="type-select"
        >
          <option value="AND">全部满足 (AND)</option>
          <option value="OR">满足任一 (OR)</option>
        </select>
      </div>

      <div class="group-actions">
        <button type="button" @click="addCondition" class="btn-add">
          + 添加条件
        </button>
        <button type="button" @click="addGroup" class="btn-add-group">
          + 添加分组
        </button>
        <button
          type="button"
          @click="$emit('delete')"
          class="btn-delete"
          v-if="!isRoot"
          title="删除分组"
        >
          🗑️
        </button>
      </div>
    </div>

    <div class="group-body">
      <div class="rule-list">
        <div class="rule-item" v-for="(child, index) in children" :key="child.id">
          <div class="item-wrapper">
            <div class="drag-handle-wrapper" v-if="draggable">
              <span class="drag-handle">⋮⋮</span>
            </div>

            <template v-if="child.type === 'AND' || child.type === 'OR'">
              <RuleGroup
                :rule="child"
                :is-root="false"
                :draggable="true"
                @update:rule="(newRule) => updateChild(index, newRule)"
                @delete="() => removeChild(index)"
              />
            </template>
            <template v-else>
              <RuleCondition
                :rule="child"
                :draggable="true"
                @update:rule="(newRule) => updateChild(index, newRule)"
                @delete="() => removeChild(index)"
                @nest="() => nestCondition(index)"
              />
            </template>
          </div>

          <div class="logic-connector" v-if="index < children.length - 1">
            <span class="connector-text">{{ rule.type }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="children.length === 0">
        <p>该分组为空，请添加条件或子分组</p>
        <button type="button" @click="addCondition" class="btn-primary">
          添加条件
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RuleCondition from './RuleCondition.vue'
import { RuleType, createDefaultCondition, createGroup, cloneRule } from '../utils/ruleUtils'

const props = defineProps({
  rule: {
    type: Object,
    required: true
  },
  isRoot: {
    type: Boolean,
    default: true
  },
  draggable: {
    type: Boolean,
    default: true
  },
  isDragging: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:rule', 'delete'])

const children = computed(() => {
  return props.rule.children || []
})

function handleTypeChange(event) {
  const newRule = cloneRule(props.rule)
  newRule.type = event.target.value
  emit('update:rule', newRule)
}

function addCondition() {
  const newRule = cloneRule(props.rule)
  newRule.children = [...(newRule.children || []), createDefaultCondition()]
  emit('update:rule', newRule)
}

function addGroup() {
  const newRule = cloneRule(props.rule)
  newRule.children = [...(newRule.children || []), createGroup(RuleType.AND)]
  emit('update:rule', newRule)
}

function removeChild(index) {
  const newRule = cloneRule(props.rule)
  newRule.children = newRule.children.filter((_, i) => i !== index)
  emit('update:rule', newRule)
}

function updateChild(index, newChildRule) {
  const newRule = cloneRule(props.rule)
  newRule.children = [...newRule.children]
  newRule.children[index] = newChildRule
  emit('update:rule', newRule)
}

function nestCondition(index) {
  const childToNest = children.value[index]
  const newGroup = createGroup(RuleType.AND)
  newGroup.children = [childToNest]

  const newRule = cloneRule(props.rule)
  newRule.children = [...newRule.children]
  newRule.children[index] = newGroup
  emit('update:rule', newRule)
}
</script>

<style scoped>
.rule-group {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  overflow: hidden;
  transition: all 0.3s;
}

.rule-group:hover {
  border-color: var(--primary-color);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--white);
}

.group-handle {
  cursor: grab;
  padding: 4px;
  user-select: none;
  color: rgba(255, 255, 255, 0.8);
}

.group-handle:active {
  cursor: grabbing;
}

.drag-handle {
  cursor: grab;
  padding: 4px 8px;
  user-select: none;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.group-title {
  flex: 1;
}

.type-select {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 14px;
  cursor: pointer;
}

.type-select option {
  background: var(--white);
  color: var(--text-color);
}

.type-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add, .btn-add-group {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
  padding: 4px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add:hover, .btn-add-group:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-add-group {
  background: rgba(255, 255, 255, 0.15);
}

.btn-delete {
  background: rgba(255, 77, 79, 0.8);
  border: none;
  padding: 4px 8px;
  border-radius: var(--radius);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: var(--danger-color);
}

.group-body {
  padding: 16px;
  min-height: 100px;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  position: relative;
}

.item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle-wrapper {
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.rule-item:hover .drag-handle-wrapper {
  opacity: 1;
}

.logic-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.connector-text {
  background: var(--primary-color);
  color: var(--white);
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius);
}

.empty-state p {
  margin-bottom: 16px;
}
</style>
