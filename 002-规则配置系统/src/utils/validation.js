import { RuleType, ValueType, getFieldDefinition } from './ruleUtils'

export function validateRule(rule) {
  const errors = []
  const warnings = []
  const validationInfo = []

  function validateNode(node, path = '', level = 0) {
    const currentPath = path ? `${path} > ${node.id}` : node.id
    const depth = level

    if (node.type === RuleType.AND || node.type === RuleType.OR) {
      validationInfo.push({
        id: node.id,
        type: node.type,
        path: currentPath,
        depth: depth,
        childrenCount: node.children?.length || 0
      })

      if (!node.children || node.children.length === 0) {
        errors.push({
          id: node.id,
          path: currentPath,
          depth: depth,
          type: 'empty_group',
          severity: 'error',
          message: '规则组为空',
          details: '请至少添加一条条件或子规则组'
        })
      } else if (node.children.length === 1) {
        warnings.push({
          id: node.id,
          path: currentPath,
          depth: depth,
          type: 'single_child',
          severity: 'warning',
          message: '规则组只有一条子规则',
          details: '建议简化结构，直接使用子规则'
        })
      }

      if (node.children) {
        node.children.forEach((child, index) => {
          validateNode(child, currentPath, depth + 1)
        })
      }
    } else if (node.type === RuleType.CONDITION) {
      validationInfo.push({
        id: node.id,
        type: 'CONDITION',
        path: currentPath,
        depth: depth,
        field: node.field,
        operator: node.operator,
        value: node.value,
        valueType: node.valueType
      })

      const fieldDef = getFieldDefinition(node.field)

      if (!fieldDef) {
        errors.push({
          id: node.id,
          path: currentPath,
          depth: depth,
          type: 'invalid_field',
          severity: 'error',
          message: '无效的字段',
          details: `字段 ${node.field} 不存在`
        })
        return
      }

      const validOperator = fieldDef.operators.find(op => op.value === node.operator)
      if (!validOperator) {
        errors.push({
          id: node.id,
          path: currentPath,
          depth: depth,
          type: 'invalid_operator',
          severity: 'error',
          message: '无效的操作符',
          details: `字段 ${fieldDef.label} 不支持操作符 ${node.operator}`
        })
      }

      if (node.value === null || node.value === undefined || node.value === '') {
        if (fieldDef.valueType === ValueType.NUMBER) {
          if (typeof node.value !== 'number') {
            errors.push({
              id: node.id,
              path: currentPath,
              depth: depth,
              type: 'empty_value',
              severity: 'error',
              message: '数值为空',
              details: '请输入有效的数值'
            })
          }
        } else {
          errors.push({
            id: node.id,
            path: currentPath,
            depth: depth,
            type: 'empty_value',
            severity: 'error',
            message: '值为空',
            details: '请输入规则值'
          })
        }
      }

      if (fieldDef.valueType === ValueType.NUMBER) {
        if (node.operator === 'between') {
          if (Array.isArray(node.value)) {
            if (node.value.length !== 2) {
              errors.push({
                id: node.id,
                path: currentPath,
                depth: depth,
                type: 'invalid_range',
                severity: 'error',
                message: '区间值无效',
                details: '区间操作符需要两个值'
              })
            } else {
              if (node.value[0] === '' || node.value[0] === null || isNaN(Number(node.value[0]))) {
                errors.push({
                  id: node.id,
                  path: currentPath,
                  depth: depth,
                  type: 'invalid_min_value',
                  severity: 'error',
                  message: '最小值无效',
                  details: '请输入有效的最小值'
                })
              }
              if (node.value[1] === '' || node.value[1] === null || isNaN(Number(node.value[1]))) {
                errors.push({
                  id: node.id,
                  path: currentPath,
                  depth: depth,
                  type: 'invalid_max_value',
                  severity: 'error',
                  message: '最大值无效',
                  details: '请输入有效的最大值'
                })
              }
              if (!isNaN(Number(node.value[0])) && !isNaN(Number(node.value[1])) && Number(node.value[0]) > Number(node.value[1])) {
                warnings.push({
                  id: node.id,
                  path: currentPath,
                  depth: depth,
                  type: 'invalid_range_order',
                  severity: 'warning',
                  message: '区间值顺序有误',
                  details: '最小值大于最大值'
                })
              }
            }
          } else {
            errors.push({
              id: node.id,
              path: currentPath,
              depth: depth,
              type: 'invalid_range',
              severity: 'error',
              message: '区间类型错误',
              details: '区间操作符需要数组类型的值'
            })
          }
        } else {
          if (node.value !== '' && isNaN(Number(node.value))) {
            errors.push({
              id: node.id,
              path: currentPath,
              depth: depth,
              type: 'invalid_number',
              severity: 'error',
              message: '数值无效',
              details: `${node.value} 不是有效的数值`
            })
          }
        }
      }

      if (fieldDef.valueType === ValueType.ENUM && fieldDef.options) {
        const validValues = fieldDef.options.map(opt => opt.value)
        if (node.operator === 'in' || node.operator === 'notin') {
          if (Array.isArray(node.value)) {
            const invalidValues = node.value.filter(val => !validValues.includes(val))
            if (invalidValues.length > 0) {
              errors.push({
                id: node.id,
                path: currentPath,
                depth: depth,
                type: 'invalid_enum',
                severity: 'error',
                message: '无效的枚举值',
                details: `值 ${invalidValues.join(', ')} 不在允许范围内`
              })
            }
            if (node.value.length === 0) {
              warnings.push({
                id: node.id,
                path: currentPath,
                depth: depth,
                type: 'empty_enum_selection',
                severity: 'warning',
                message: '未选择选项',
                details: '建议至少选择一个选项'
              })
            }
          } else {
            errors.push({
              id: node.id,
              path: currentPath,
              depth: depth,
              type: 'invalid_enum_type',
              severity: 'error',
              message: '多选类型错误',
              details: 'in/notin 操作符需要数组类型的值'
            })
          }
        } else {
          if (!validValues.includes(node.value)) {
            errors.push({
              id: node.id,
              path: currentPath,
              depth: depth,
              type: 'invalid_enum',
              severity: 'error',
              message: '无效的枚举值',
              details: `值 ${node.value} 不在允许范围内`
            })
          }
        }
      }

      if (fieldDef.valueType === ValueType.TEXT) {
        if (typeof node.value === 'string' && node.operator === 'regex') {
          try {
            new RegExp(node.value)
          } catch (e) {
            errors.push({
              id: node.id,
              path: currentPath,
              depth: depth,
              type: 'invalid_regex',
              severity: 'error',
              message: '正则表达式无效',
              details: e.message
            })
          }
        }
      }
    }
  }

  if (rule) {
    validateNode(rule)
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    validationInfo: validationInfo,
    stats: {
      totalNodes: validationInfo.length,
      conditionCount: validationInfo.filter(n => n.type === 'CONDITION').length,
      groupCount: validationInfo.filter(n => n.type === 'AND' || n.type === 'OR').length,
      errorCount: errors.length,
      warningCount: warnings.length,
      maxDepth: validationInfo.length > 0 ? Math.max(...validationInfo.map(n => n.depth)) : 0
    }
  }
}

export function formatValidationResult(result) {
  const messages = []

  if (result.errors.length > 0) {
    messages.push('❌ 错误:')
    result.errors.forEach(err => messages.push(`  - ${err.message}: ${err.details}`))
  }

  if (result.warnings.length > 0) {
    messages.push('⚠️ 警告:')
    result.warnings.forEach(warn => messages.push(`  - ${warn.message}: ${warn.details}`))
  }

  if (messages.length === 0) {
    messages.push('✅ 规则校验通过')
  }

  return messages.join('\n')
}
