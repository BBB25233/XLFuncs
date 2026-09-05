import type { FunctionEntry } from '@/types';

/** 筛选并溢出 · 按条件筛出符合条件的行，结果自动溢出（lambda 类 B16 批次，Microsoft 365） */

const filterEntry: FunctionEntry = {
  id: 'filter',
  enName: 'FILTER',
  zhName: '筛选并溢出',
  zhCommon: ['FILTER', '筛选', '动态筛选'],
  alias: ['条件筛选', '溢出筛选', '动态过滤'],
  category: 'lambda',
  abbr: 'sxbyc',
  pinyin: 'shaixuanbingyichu',
  keywords: ['FILTER', '筛选', '过滤', '条件', '动态数组'],
  difficulty: 2,
  usageLevel: 78,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '按条件筛出符合条件的行，结果自动溢出',
  summary: 'FILTER 是动态数组时代的招牌函数：=FILTER(数组, 条件, [无结果时显示])，把条件为 TRUE 的行整行筛出来，结果自动溢出到下方。它彻底改变了「筛选」这件事——不用点筛选按钮、不用刷新、源数据一改结果立刻变。条件通常写成比较表达式（如 B2:B10>500），可以叠加多个条件（乘号 = 且，加号 = 或）。筛选不出结果时，第三个参数可以给出友好提示，否则返回 #CALC!。',
  syntax: {
    patternCn: '=FILTER(数组, 条件, [无结果时显示])',
    patternEn: '=FILTER(array, include, [if_empty])',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要筛选的数据区域（可含多列）。',
      example: 'A2:C10'
    },
      {
      key: 'include',
      zh: '条件',
      en: 'include',
      required: true,
      desc: '与目标数组行数相同的布尔数组，TRUE 的行被保留。',
      example: 'C2:C10>500',
      tip: '多条件：乘号*表「且」，加号+表「或」。'
    },
      {
      key: 'if_empty',
      zh: '无结果时显示',
      en: 'if_empty',
      required: false,
      desc: '一行都筛不到时返回的内容，省略则报 #CALC!。',
      example: '"无匹配"',
      tip: '强烈建议填上，避免出现难懂的 #CALC!。'
    }
    ]
  },
  returnValue: '返回符合条件的行组成的数组（自动溢出）；无匹配且未给第三参数时返回 #CALC!。',
  examples: [
    {
    title: '示例 1：单条件筛选',
    scene: '筛出销售额超过 500 的记录。',
    dataTsv: '姓名\t部门\t销售额\n张三\t华东\t800\n李四\t华北\t300\n王五\t华东\t1200',
    dataAnchor: 'A1',
    formula: '=FILTER(A2:C4, C2:C4>500, "无匹配")',
    result: '溢出两行：张三/华东/800、王五/华东/1200',
    explanation: '条件数组 C2:C4>500 得到 {TRUE;FALSE;TRUE}，只有 TRUE 的行被保留。整行一起返回。'
  },
    {
    title: '示例 2：多条件（且）',
    scene: '华东且销售额超 500。',
    dataTsv: '姓名\t部门\t销售额\n张三\t华东\t800\n李四\t华北\t300\n王五\t华东\t1200',
    dataAnchor: 'A1',
    formula: '=FILTER(A2:C4, (B2:B4="华东")*(C2:C4>500), "无匹配")',
    result: '溢出两行：张三、王五',
    explanation: '两个布尔数组相乘即「且」。要「或」就把乘号换成加号 +。'
  }
  ],
  pitfalls: [
    {
    title: '条件数组行数与目标不一致',
    reason: '条件是 10 行、数据是 8 行，Excel 无法对应，直接报错。',
    fix: '确保条件区域与数据区域行数完全相同。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '筛不到就报 #CALC!',
    reason: '条件太严时结果为空，没给第三参数就显示 #CALC!，看起来像公式坏了。',
    fix: '始终补上第三参数，如 "无匹配" 或 ""。',
    level: 'high',
    errorCode: '#CALC!'
  },
    {
    title: '溢出区域被占住',
    reason: '结果要溢出的下方单元格有内容（哪怕只是个空格）。',
    fix: '清空溢出区域；这是动态数组最常见的 #SPILL! 原因。',
    level: 'high',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'sort',
    kind: 'companion',
    why: '筛完常要排序，两者常嵌套使用。'
  },
    {
    id: 'unique',
    kind: 'companion',
    why: 'UNIQUE 去重，常与 FILTER 组合。'
  },
    {
    id: 'sortby',
    kind: 'companion',
    why: 'SORTBY 按另一列排序。'
  }
  ],
  calc: {
    enabled: false,
    ranges: {},
    fields: [],
    template: '',
    cases: []
  },
  meta: {
    updatedAt: '2026-09-01',
    status: 'published',
    customEdited: false
  }
};

export default filterEntry;
