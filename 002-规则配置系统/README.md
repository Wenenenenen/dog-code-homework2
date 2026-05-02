# 可视化规则配置系统

一个类似风控/营销规则编辑器的可视化配置系统，支持通过 UI 构建嵌套规则、实时生成 JSON、拖拽排序等功能。

## 功能特性

### ✅ 核心功能
- **嵌套规则构建**：支持 AND / OR 条件组合，支持无限层级嵌套
- **多种输入类型**：每条规则支持数值、枚举、文本三种输入类型
- **JSON 实时同步**：UI 操作实时生成对应 JSON 结构
- **JSON 回显编辑**：支持通过编辑 JSON 反向更新 UI
- **拖拽排序**：支持规则项和规则组的拖拽排序
- **嵌套层级调整**：支持将条件规则嵌套为规则组
- **规则校验**：提供实时的错误和警告提示

### 📦 附加功能
- **示例加载**：一键加载演示规则示例
- **本地存储**：支持保存和加载配置到 localStorage
- **重置功能**：一键重置为默认状态
- **响应式布局**：适配桌面和移动端

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **拖拽库**: vue-draggable-plus
- **语言**: JavaScript (ES6+)

## 项目结构

```
002-规则配置系统/
├── index.html              # 入口 HTML
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite 配置
├── README.md               # 项目说明文档
└── src/
    ├── main.js             # 应用入口
    ├── style.css           # 全局样式
    ├── App.vue             # 主应用组件
    ├── components/         # 组件目录
    │   ├── RuleGroup.vue       # 规则组组件（递归结构）
    │   ├── RuleCondition.vue   # 条件规则项组件
    │   ├── JsonEditor.vue      # JSON 编辑器组件
    │   └── ValidationResult.vue # 校验结果显示组件
    └── utils/              # 工具函数目录
        ├── ruleUtils.js        # 规则数据模型和工具函数
        └── validation.js       # 规则校验逻辑
```

## 快速开始

### 安装依赖

```bash
cd 002-规则配置系统
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动并自动打开浏览器。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 组件说明

### RuleGroup.vue (规则组组件)

核心递归组件，用于实现 AND/OR 规则组的嵌套结构。

**功能：**
- 支持 AND/OR 类型切换
- 递归渲染子规则（规则组或条件）
- 提供"添加条件"和"添加分组"按钮
- 支持拖拽排序（通过 vue-draggable-plus）
- 显示逻辑连接符（AND/OR）

**Props:**
- `rule`: 规则数据对象（必填）
- `isRoot`: 是否为根节点（默认 true）
- `draggable`: 是否可拖拽（默认 true）
- `isDragging`: 是否正在拖拽（默认 false）

### RuleCondition.vue (条件规则项组件)

用于配置单条条件规则的输入组件。

**支持的输入类型：**
1. **数值类型 (number)**
   - 支持等于、不等于、大于、小于、大于等于、小于等于、区间等操作符
   - 区间操作符提供双输入框
   
2. **枚举类型 (enum)**
   - 支持等于、不等于、属于、不属于操作符
   - "属于/不属于"支持多选，以标签形式显示
   
3. **文本类型 (text)**
   - 支持等于、不等于、包含、以...开头、以...结尾、正则匹配等操作符

**功能：**
- 字段选择器
- 操作符选择器（根据字段类型动态变化）
- 值输入框（根据操作符和类型动态变化）
- 删除按钮
- 嵌套按钮（将当前条件提升为规则组）

### JsonEditor.vue (JSON 编辑器组件)

用于显示和编辑 JSON 数据。

**功能：**
- 实时格式化显示 JSON
- 支持编辑 JSON 内容
- 提供格式化按钮
- 提供导入按钮
- 实时语法错误提示

### ValidationResult.vue (校验结果组件)

用于显示规则校验的结果。

**功能：**
- 显示校验状态（成功/失败/含警告）
- 错误列表展示
- 警告列表展示
- 显示问题路径

## 数据结构说明

### 规则节点类型

系统支持三种规则节点类型：

#### 1. 规则组 (AND/OR)
```javascript
{
  type: 'AND',  // 或 'OR'
  id: 'rule_xxx',
  children: [
    // 子规则数组，可以是规则组或条件
  ]
}
```

#### 2. 条件规则
```javascript
{
  type: 'CONDITION',
  id: 'rule_xxx',
  field: 'age',           // 字段名
  operator: 'gte',        // 操作符
  value: 18,              // 值（可以是单个值、数组）
  valueType: 'number'     // 值类型：'number' | 'enum' | 'text'
}
```

### 预定义字段

系统内置以下字段供选择：

| 字段名 | 显示名 | 类型 | 支持的操作符 |
|--------|--------|------|--------------|
| age | 年龄 | 数值 | eq, ne, gt, lt, gte, lte |
| gender | 性别 | 枚举 | eq, ne, in, notin |
| city | 城市 | 枚举 | eq, ne, in, notin |
| name | 姓名 | 文本 | eq, ne, contains, startswith, endswith |
| email | 邮箱 | 文本 | eq, ne, contains, regex |
| amount | 金额 | 数值 | eq, ne, gt, lt, gte, lte, between |

### 操作符说明

| 操作符 | 说明 | 适用类型 |
|--------|------|----------|
| eq | 等于 | 全部 |
| ne | 不等于 | 全部 |
| gt | 大于 | 数值 |
| lt | 小于 | 数值 |
| gte | 大于等于 | 数值 |
| lte | 小于等于 | 数值 |
| between | 区间 | 数值 |
| in | 属于（多选） | 枚举 |
| notin | 不属于（多选） | 枚举 |
| contains | 包含 | 文本 |
| startswith | 以...开头 | 文本 |
| endswith | 以...结尾 | 文本 |
| regex | 正则匹配 | 文本 |

## 校验规则说明

系统内置以下校验规则：

### 错误级别校验
- 规则组不能为空（必须至少有一条子规则）
- 无效的字段名
- 字段不支持的操作符
- 规则值为空
- 数值类型值无效
- 区间操作符需要数组类型的值
- 区间操作符需要提供两个值
- 无效的枚举值

### 警告级别校验
- 规则组只有一条子规则（建议简化）
- 区间起始值大于结束值

## 使用示例

### 示例 1：简单的 AND 组合
```json
{
  "type": "AND",
  "id": "root",
  "children": [
    {
      "type": "CONDITION",
      "id": "c1",
      "field": "age",
      "operator": "gte",
      "value": 18,
      "valueType": "number"
    },
    {
      "type": "CONDITION",
      "id": "c2",
      "field": "gender",
      "operator": "eq",
      "value": "male",
      "valueType": "enum"
    }
  ]
}
```

### 示例 2：嵌套的 OR 组合
```json
{
  "type": "AND",
  "id": "root",
  "children": [
    {
      "type": "CONDITION",
      "id": "c1",
      "field": "age",
      "operator": "between",
      "value": [18, 60],
      "valueType": "number"
    },
    {
      "type": "OR",
      "id": "g1",
      "children": [
        {
          "type": "CONDITION",
          "id": "c2",
          "field": "city",
          "operator": "in",
          "value": ["beijing", "shanghai"],
          "valueType": "enum"
        },
        {
          "type": "CONDITION",
          "id": "c3",
          "field": "name",
          "operator": "contains",
          "value": "张",
          "valueType": "text"
        }
      ]
    }
  ]
}
```

## 关键设计思路

### 1. 递归组件设计
`RuleGroup.vue` 组件内部引用自身，实现无限层级的规则嵌套：
```vue
<RuleGroup
  :rule="element"
  :is-root="false"
  ...
/>
```

### 2. 双向数据绑定
- 使用 Vue 的 `v-model` 和 `computed` 属性实现数据双向绑定
- `emit('update:rule')` 事件触发父组件数据更新
- 深度监听确保嵌套数据变化被捕获

### 3. 拖拽排序实现
使用 `vue-draggable-plus` 库实现拖拽功能：
- 通过 `handle` 属性指定拖拽抓手（⋮⋮ 图标）
- `group: 'rules'` 允许跨组拖拽
- `animation: 200` 提供平滑的动画效果

### 4. 动态输入类型
`RuleCondition.vue` 通过 `v-if` 和 `computed` 属性实现：
- 根据 `valueType` 渲染不同的输入组件
- 根据 `operator` 切换单值/多值输入模式
- 枚举类型的 `in/notin` 操作符显示多选标签

### 5. 校验系统设计
采用递归遍历的方式校验规则树：
- 深度优先遍历所有节点
- 收集所有错误和警告
- 按严重程度分类展示

## 验证步骤

### 验证 1：基础规则创建
1. 启动项目后，查看默认显示的 AND 规则组
2. 点击"添加条件"按钮，确认新增条件行
3. 点击"添加分组"按钮，确认新增 OR 规则组

### 验证 2：输入类型切换
1. 在条件行中，选择"性别"字段（枚举类型）
   - 确认操作符列表包含"属于"、"不属于"
   - 选择"属于"操作符
   - 确认显示多选标签，可添加多个城市
   
2. 选择"金额"字段（数值类型）
   - 选择"区间"操作符
   - 确认显示两个输入框（最小值 ~ 最大值）

### 验证 3：JSON 实时同步
1. 修改任一条件的值
2. 观察右侧"实时 JSON 输出"区域
3. 确认 JSON 数据同步更新

### 验证 4：JSON 回显编辑
1. 复制"实时 JSON 输出"中的内容
2. 粘贴到"JSON 回显编辑"区域
3. 修改某个值（如将 age: 18 改为 age: 25）
4. 点击"导入"按钮
5. 确认左侧规则编辑器中的值同步更新

### 验证 5：拖拽排序
1. 将鼠标悬停在条件行左侧的"⋮⋮"图标上
2. 按住鼠标左键拖拽
3. 拖拽到目标位置后释放
4. 确认规则顺序已改变

### 验证 6：规则校验
1. 点击"重置"按钮
2. 删除规则组中唯一的条件
3. 观察校验结果区域
4. 确认显示"规则组不能为空"的错误
5. 点击"添加条件"恢复
6. 确认错误消失

### 验证 7：嵌套层级调整
1. 在任一条件行上，点击"嵌套"按钮
2. 确认该条件被包装成一个新的 AND 规则组
3. 新规则组内可以继续添加条件或分组

### 验证 8：本地存储
1. 配置一些规则
2. 点击"保存配置"按钮
3. 刷新浏览器页面
4. 点击"加载配置"按钮
5. 确认之前的规则被恢复

### 验证 9：响应式布局
1. 将浏览器窗口缩放到 768px 以下
2. 确认布局变为垂直排列
3. 确认所有功能正常工作

## 扩展说明

### 如何添加新字段

在 `src/utils/ruleUtils.js` 的 `FieldDefinitions` 数组中添加新字段定义：

```javascript
{
  field: 'newField',      // 字段名
  label: '新字段',        // 显示名称
  valueType: ValueType.NUMBER,  // 类型：NUMBER / ENUM / TEXT
  operators: [            // 支持的操作符
    { value: 'eq', label: '等于' },
    { value: 'ne', label: '不等于' }
  ],
  options: [              // 枚举类型专用，定义选项
    { value: 'opt1', label: '选项1' },
    { value: 'opt2', label: '选项2' }
  ]
}
```

### 如何添加新操作符

1. 在 `FieldDefinitions` 中对应字段的 `operators` 数组添加
2. 在 `RuleCondition.vue` 中根据需要添加特殊的输入逻辑
3. 在 `validation.js` 中添加相应的校验规则（如有需要）

## 注意事项

1. **数据一致性**：修改 JSON 时请确保格式正确，否则导入会失败
2. **无限嵌套**：理论上支持无限层级嵌套，但过深的层级可能影响性能
3. **本地存储**：配置保存在浏览器 localStorage 中，清除浏览器数据会丢失
4. **拖拽限制**：只能拖拽同一层级的规则，不同层级间不能直接拖拽

## 版本历史

- **v1.0.0** (2026-05-02)
  - 初始版本发布
  - 实现嵌套规则构建
  - 实现多种输入类型支持
  - 实现 JSON 实时同步与回显
  - 实现拖拽排序
  - 实现规则校验

## 许可证

MIT License
