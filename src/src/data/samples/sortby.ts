import type { FunctionEntry } from '@/types';

/** 按指定列排序 · 按另一个（或另几个）列的值来排序，支持多关键字（lambda 类 B16 批次，Microsoft 365） */

const sortbyEntry: FunctionEntry = {
  id: 'sortby',
  enName: 'SORTBY',
  zhName: '按指定列排序',
  zhCommon: ['SORTBY', '按列排序', '依据排序'],
  alias: ['依据列排序', '外部列排序', '多关键字排序'],
  category: 'lambda',
  abbr: 'azdlpx',
  pinyin: 'anzhidingliepaixu',
  keywords: ['SORTBY', '排序', '多关键字', '依据列', '动态数组'],
  difficulty: 2,
  usageLevel: 48,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '按另一个（或另几个）列的值来排序，支持多关键字',
  summary: 'SORT 只能按数组内部的列排，SORTBY 可以按「任意等长的列」排，而且支持多个排序关键字依次生效。=SORTBY(数组, 依据列1, [顺序1], [依据列2, 顺序2]…)。这是它比 SORT 灵活的地方：依据列甚至可以不在你要返回的结果里。做「先按部门、再按销售额」这种多关键字排序时，SORTBY 是唯一干净的方案。',
  syntax: {
    patternCn: '=SORTBY(数组, 依据列1, [顺序1], [依据列2, 顺序2]…)',
    patternEn: '=SORTBY(array, by_array1, [sort_order1], [by_array2, sort_order2], …)',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要排序并返回的区域。',
      example: 'A2:C10'
    },
      {
      key: 'by_array1',
      zh: '依据列1',
      en: 'by_array1',
      required: true,
      desc: '用于排序的列，行数必须与数组一致，可在数组之外。',
      example: 'D2:D10'
    },
      {
      key: 'sort_order1',
      zh: '顺序1',
      en: 'sort_order1',
      required: false,
      desc: '1=升序（默认），-1=降序。',
      example: '-1'
    },
      {
      key: 'by_array2',
      zh: '依据列2',
      en: 'by_array2',
      required: false,
      desc: '第二个排序关键字，在第一个相同时生效。',
      example: 'C2:C10'
    }
    ]
  },
  returnValue: '返回排序后的数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：按数组之外的列排序',
    scene: '返回姓名和部门，但按「权重」列（不在返回结果里）排序。',
    dataTsv: '姓名\t部门\t权重\n张三\t华东\t2\n李四\t华北\t1\n王五\t华东\t3',
    dataAnchor: 'A1',
    formula: '=SORTBY(A2:B4, C2:C4, -1)',
    result: '王五/华东、张三/华东、李四/华北',
    explanation: '依据列 C 不出现在返回结果中，这正是 SORTBY 相对 SORT 的优势。'
  },
    {
    title: '示例 2：多关键字排序',
    scene: '先按部门升序，同部门再按销售额降序。',
    dataTsv: '姓名\t部门\t销售额\n张三\t华东\t800\n李四\t华北\t300\n王五\t华东\t1200',
    dataAnchor: 'A1',
    formula: '=SORTBY(A2:C4, B2:B4, 1, C2:C4, -1)',
    result: '王五/华东/1200、张三/华东/800、李四/华北/300',
    explanation: '两组「依据列+顺序」依次生效，这就是多关键字排序。'
  }
  ],
  pitfalls: [
    {
    title: '依据列行数与数组不一致',
    reason: '行数不同无法一一对应，Excel 报错。',
    fix: '确保 by_array 与 array 行数完全相同。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '顺序参数写成了 0 或 2',
    reason: '顺序只认 1（升序）和 -1（降序），写 0/2 会报 #VALUE!。',
    fix: '升序写 1，降序写 -1。',
    level: 'mid',
    errorCode: '#VALUE!'
  },
    {
    title: '溢出区域被占住',
    reason: '结果溢出位置有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'sort',
    kind: 'alternative',
    why: '只按数组内部列排时用 SORT 更简单。'
  },
    {
    id: 'filter',
    kind: 'companion',
    why: 'FILTER 与 SORTBY 常一起用。'
  },
    {
    id: 'unique',
    kind: 'companion',
    why: '去重后排序是常见需求。'
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

export default sortbyEntry;
