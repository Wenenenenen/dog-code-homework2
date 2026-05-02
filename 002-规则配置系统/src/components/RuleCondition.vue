<template>
  <div class="rule-condition">
    <div class="condition-handle" v-if="draggable">
      <span class="drag-handle">⋮⋮</span>
    </div>

    <div class="condition-content">
      <select
        :value="rule.field"
        @change="handleFieldChange"
        class="field-select"
      >
        <option v-for="field in fieldDefinitions" :key="field.field" :value="field.field">
          {{ field.label }}
        </option>
      </select>

      <select
        :value="rule.operator"
        @change="handleOperatorChange"
        class="operator-select"
      >
        <option v-for="op in currentOperators" :key="op.value" :value="op.value">
          {{ op.label }}
        </option>
      </select>

      <div class="value-input-wrapper" v-if="currentFieldDef">
        <template v-if="currentFieldDef.valueType === 'number'">
          <template v-if="rule.operator === 'between'">
            <input
              type="number"
              :value="valueArray[0] || ''"
              @change="(e) => handleBetweenChange(0, e.target.value)"
              placeholder="最小值"
              class="number-input"
            />
            <span class="range-separator">~</span>
            <input
              type="number"
              :value="valueArray[1] || ''"
              @change="(e) => handleBetweenChange(1, e.target.value)"
              placeholder="最大值"
              class="number-input"
            />
          </template>
          <template v-else>
            <input
              type="number"
              :value="rule.value"
              @change="handleValueChange"
              placeholder="请输入数值"
              class="number-input"
            />
          </template>
        </template>

        <template v-else-if="currentFieldDef.valueType === 'enum'">
          <template v-if="rule.operator === 'in' || rule.operator === 'notin'">
            <div class="multi-select-wrapper">
              <div class="selected-items" v-if="selectedEnumValues.length > 0">
                <span
                  v-for="val in selectedEnumValues"
                  :key="val"
                  class="selected-tag"
                >
                  {{ getEnumLabel(val) }}
                  <button type="button" @click="toggleEnumValue(val)" class="tag-remove">×</button>
                </span>
              </div>
              <select
                @change="(e) => toggleEnumValue(e.target.value)"
                class="enum-select"
                value=""
              >
                <option value="" disabled>选择选项</option>
                <option
                  v-for="opt in currentFieldDef.options"
                  :key="opt.value"
                  :value="opt.value"
                  :disabled="selectedEnumValues.includes(opt.value)"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </template>
          <template v-else>
            <select
              :value="rule.value"
              @change="handleValueChange"
              class="enum-select"
            >
              <option
                v-for="opt in currentFieldDef.options"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </template>
        </template>

        <template v-else>
          <input
            type="text"
            :value="rule.value"
            @change="handleValueChange"
            @input="handleValueChange"
            placeholder="请输入值"
            class="text-input"
          />
        </template>
      </div>
    </div>

    <div class="condition-actions">
      <button type="button" @click="$emit('delete')" class="btn-delete" title="删除">
        🗑️
      </button>
      <button type="button" @click="$emit('nest')" class="btn-nest" title="嵌套为组">
        嵌套
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FieldDefinitions, getFieldDefinition, updateConditionValue } from '../utils/ruleUtils'

const props = defineProps({
  rule: {
    type: Object,
    required: true
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

const emit = defineEmits(['update:rule', 'delete', 'nest'])

const fieldDefinitions = computed(() => FieldDefinitions)

const currentFieldDef = computed(() => getFieldDefinition(props.rule.field))

const currentOperators = computed(() => {
  return currentFieldDef.value?.operators || []
})

const valueArray = computed(() => {
  if (Array.isArray(props.rule.value)) {
    return props.rule.value
  }
  return [props.rule.value, '']
})

const selectedEnumValues = computed(() => {
  if (Array.isArray(props.rule.value)) {
    return props.rule.value
  }
  return props.rule.value ? [props.rule.value] : []
})

function getEnumLabel(val) {
  const opt = currentFieldDef.value?.options?.find(o => o.value === val)
  return opt?.label || val
}

function handleFieldChange(event) {
  const newRule = updateConditionValue(props.rule, 'field', event.target.value)
  emit('update:rule', newRule)
}

function handleOperatorChange(event) {
  const newRule = updateConditionValue(props.rule, 'operator', event.target.value)

  if (event.target.value === 'between') {
    newRule.value = [0, 100]
  } else if (event.target.value === 'in' || event.target.value === 'notin') {
    if (currentFieldDef.value?.options) {
      newRule.value = [currentFieldDef.value.options[0].value]
    } else {
      newRule.value = []
    }
  }

  emit('update:rule', newRule)
}

function handleValueChange(event) {
  let value = event.target.value
  if (currentFieldDef.value?.valueType === 'number') {
    value = value === '' ? '' : Number(value)
  }
  const newRule = updateConditionValue(props.rule, 'value', value)
  emit('update:rule', newRule)
}

function handleBetweenChange(index, value) {
  const newArray = [...valueArray.value]
  newArray[index] = value === '' ? '' : Number(value)
  const newRule = updateConditionValue(props.rule, 'value', newArray)
  emit('update:rule', newRule)
}

function toggleEnumValue(value) {
  if (!value) return

  let newValues
  if (Array.isArray(props.rule.value)) {
    if (props.rule.value.includes(value)) {
      newValues = props.rule.value.filter(v => v !== value)
    } else {
      newValues = [...props.rule.value, value]
    }
  } else {
    if (props.rule.value === value) {
      newValues = []
    } else {
      newValues = props.rule.value ? [props.rule.value, value] : [value]
    }
  }

  const newRule = updateConditionValue(props.rule, 'value', newValues)
  emit('update:rule', newRule)
}
</script>

<style scoped>
.rule-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  transition: all 0.3s;
}

.rule-condition:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.condition-handle {
  cursor: grab;
  padding: 4px;
  color: var(--text-secondary);
  user-select: none;
}

.condition-handle:active {
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

.condition-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}

select, input {
  height: 32px;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--white);
  font-size: 14px;
  transition: border-color 0.3s;
}

select:focus, input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.field-select {
  width: 120px;
}

.operator-select {
  width: 100px;
}

.value-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.number-input {
  width: 100px;
}

.text-input {
  width: 180px;
}

.enum-select {
  width: 120px;
}

.range-separator {
  color: var(--text-secondary);
  font-size: 14px;
}

.multi-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--primary-color);
  color: var(--white);
  border-radius: 4px;
  font-size: 12px;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--white);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  opacity: 0.8;
}

.condition-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-delete, .btn-nest {
  background: none;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 14px;
  border-radius: var(--radius);
  transition: background 0.3s;
}

.btn-delete:hover {
  background: rgba(255, 77, 79, 0.1);
}

.btn-nest {
  font-size: 12px;
  color: var(--primary-color);
}

.btn-nest:hover {
  background: rgba(24, 144, 255, 0.1);
}
</style>
