import type { FunctionEntry } from '@/types';

/** 扩充到指定尺寸 · 把数组扩到指定的行列数，空出来的位置用指定值填充（lambda 类 B17 批次，Microsoft 365） */

const expandEntry: FunctionEntry = {
  id: 'expand',
  enName: 'EXPAND',
  zhName: '扩充到指定尺寸',
  zhCommon: ['EXPAND', '扩充数组', '补齐行列'],
  alias: ['扩到N行M列', '数组补白', '对齐尺寸'],
  category: 'lambda',
  abbr: 'kcdzdcc',
  pinyin: 'kuochongdaozhidingchicun',
  keywords: ['EXPAND', '扩充', '补齐', 'pad', '动态数组'],
  difficulty: 3,
  usageLevel: 14,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把数组扩到指定的行列数，空出来的位置用指定值填充',
  summary: 'EXPAND(数组, 行数, [列数], [填充值]) 把一个小数组撑大到指定尺寸，多出来的单元格用填充值补上（省略填充值时填 #N/A）。它的用武之地是「对齐尺寸」：比如 HSTACK/VSTACK 要求两侧尺寸匹配时，先用 EXPAND 把短的那边补齐；或者造固定大小的报表模板。注意它只能变大，不能变小（要变小用 TAKE）。',
  syntax: {
    patternCn: '=EXPAND(数组, 行数, [列数], [填充值])',
    patternEn: '=EXPAND(array, rows, [columns], [pad_with])',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要扩充的数组。',
      example: 'A2:A4'
    },
      {
      key: 'rows',
      zh: '行数',
      en: 'rows',
      required: true,
      desc: '目标行数，必须 >= 原数组行数。',
      example: '6',
      tip: '⚠️ 小于原行数会报 #VALUE!，缩小请用 TAKE。'
    },
      {
      key: 'columns',
      zh: '列数',
      en: 'columns',
      required: false,
      desc: '目标列数，省略则保持原列数。',
      example: '2'
    },
      {
      key: 'pad_with',
      zh: '填充值',
      en: 'pad_with',
      required: false,
      desc: '补位内容，省略则填 #N/A。',
      example: '0',
      tip: '做数值报表通常填 0。'
    }
    ]
  },
  returnValue: '返回扩充后的数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：把 3 行扩成 5 行，空位填 0',
    scene: '凑齐固定 5 行的报表模板。',
    dataTsv: '数值\n10\n20\n30',
    dataAnchor: 'A1',
    formula: '=EXPAND(A2:A4, 5, , 0)',
    result: '{10; 20; 30; 0; 0}',
    explanation: '多出来的两行用 0 补齐。省略列数即保持单列。'
  },
    {
    title: '示例 2：为 HSTACK 补齐行数',
    scene: '两列数据行数不同，拼之前先对齐。',
    dataTsv: 'A列\tB列\n1\t10\n2\t\n3\t',
    dataAnchor: 'A1',
    formula: '=HSTACK(A2:A4, EXPAND(B2:B3, 3, , ""))',
    result: '三行两列，第三行 B 列为空文本',
    explanation: 'EXPAND 把 2 行的 B 列补成 3 行，HSTACK 才不会因为行数不一致而报错。这是 EXPAND 最实用的场景。'
  }
  ],
  pitfalls: [
    {
    title: '目标行数小于原行数',
    reason: 'EXPAND 只能放大不能缩小，写小了直接报 #VALUE!。',
    fix: '要缩小请用 TAKE；也可先用 TAKE 截断再 EXPAND。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '忘了填 pad_with 导致满屏 #N/A',
    reason: '省略填充值时补位全是 #N/A，在数值报表里很难看。',
    fix: '明确给填充值，数值填 0、文本填 ""。',
    level: 'mid'
  },
    {
    title: '溢出区域被占住',
    reason: '扩充后的数组要占用更多单元格。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'take',
    kind: 'companion',
    why: '缩小数组用 TAKE。'
  },
    {
    id: 'hstack',
    kind: 'companion',
    why: 'HSTACK 拼接前常用 EXPAND 对齐行/列数。'
  },
    {
    id: 'makearray',
    kind: 'alternative',
    why: '从零造数组用 MAKEARRAY。'
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

export default expandEntry;
