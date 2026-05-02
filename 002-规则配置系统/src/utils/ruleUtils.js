export const RuleType = {
  AND: 'AND',
  OR: 'OR',
  CONDITION: 'CONDITION'
}

export const ValueType = {
  NUMBER: 'number',
  ENUM: 'enum',
  TEXT: 'text'
}

export const FieldDefinitions = [
  {
    field: 'age',
    label: '年龄',
    valueType: ValueType.NUMBER,
    operators: [
      { value: 'eq', label: '等于' },
      { value: 'ne', label: '不等于' },
      { value: 'gt', label: '大于' },
      { value: 'lt', label: '小于' },
      { value: 'gte', label: '大于等于' },
      { value: 'lte', label: '小于等于' }
    ]
  },
  {
    field: 'gender',
    label: '性别',
    valueType: ValueType.ENUM,
    operators: [
      { value: 'eq', label: '等于' },
      { value: 'ne', label: '不等于' },
      { value: 'in', label: '属于' },
      { value: 'notin', label: '不属于' }
    ],
    options: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
      { value: 'unknown', label: '未知' }
    ]
  },
  {
    field: 'city',
    label: '城市',
    valueType: ValueType.ENUM,
    operators: [
      { value: 'eq', label: '等于' },
      { value: 'ne', label: '不等于' },
      { value: 'in', label: '属于' },
      { value: 'notin', label: '不属于' }
    ],
    options: [
      { value: 'beijing', label: '北京' },
      { value: 'shanghai', label: '上海' },
      { value: 'guangzhou', label: '广州' },
      { value: 'shenzhen', label: '深圳' },
      { value: 'hangzhou', label: '杭州' }
    ]
  },
  {
    field: 'name',
    label: '姓名',
    valueType: ValueType.TEXT,
    operators: [
      { value: 'eq', label: '等于' },
      { value: 'ne', label: '不等于' },
      { value: 'contains', label: '包含' },
      { value: 'startswith', label: '以...开头' },
      { value: 'endswith', label: '以...结尾' }
    ]
  },
  {
    field: 'email',
    label: '邮箱',
    valueType: ValueType.TEXT,
    operators: [
      { value: 'eq', label: '等于' },
      { value: 'ne', label: '不等于' },
      { value: 'contains', label: '包含' },
      { value: 'regex', label: '正则匹配' }
    ]
  },
  {
    field: 'amount',
    label: '金额',
    valueType: ValueType.NUMBER,
    operators: [
      { value: 'eq', label: '等于' },
      { value: 'ne', label: '不等于' },
      { value: 'gt', label: '大于' },
      { value: 'lt', label: '小于' },
      { value: 'gte', label: '大于等于' },
      { value: 'lte', label: '小于等于' },
      { value: 'between', label: '区间' }
    ]
  }
]

export function generateId() {
  return 'rule_' + Math.random().toString(36).substr(2, 9)
}

export function createDefaultCondition() {
  const defaultField = FieldDefinitions[0]
  return {
    type: RuleType.CONDITION,
    id: generateId(),
    field: defaultField.field,
    operator: defaultField.operators[0].value,
    value: defaultField.valueType === ValueType.NUMBER ? 0 : 
           defaultField.valueType === ValueType.ENUM ? (defaultField.options ? defaultField.options[0].value : '') : '',
    valueType: defaultField.valueType
  }
}

export function createGroup(type = RuleType.AND) {
  return {
    type,
    id: generateId(),
    children: [createDefaultCondition()]
  }
}

export function getFieldDefinition(field) {
  return FieldDefinitions.find(f => f.field === field)
}

export function cloneRule(rule) {
  return JSON.parse(JSON.stringify(rule))
}

export function updateRuleField(rule, fieldName, value) {
  const cloned = cloneRule(rule)
  cloned[fieldName] = value
  return cloned
}

export function updateConditionValue(rule, field, value) {
  const cloned = cloneRule(rule)
  if (field === 'field') {
    const fieldDef = getFieldDefinition(value)
    cloned.field = value
    cloned.valueType = fieldDef.valueType
    cloned.operator = fieldDef.operators[0].value
    cloned.value = fieldDef.valueType === ValueType.NUMBER ? 0 : 
                   fieldDef.valueType === ValueType.ENUM ? (fieldDef.options ? fieldDef.options[0].value : '') : ''
  } else {
    cloned[field] = value
  }
  return cloned
}
