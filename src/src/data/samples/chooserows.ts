import type { FunctionEntry } from '@/types';

/** 按行号挑行 · 按行号挑出指定的若干行，还能顺手重排顺序（lambda 类 B17 批次，Microsoft 365） */

const chooserowsEntry: FunctionEntry = {
  id: 'chooserows',
  enName: 'CHOOSEROWS',
  zhName: '按行号挑行',
  zhCommon: ['CHOOSEROWS', '挑行', '按行号'],
  alias: ['提取指定行', '重排行序', '取第几行'],
  category: 'lambda',
  abbr: 'ahhtx',
  pinyin: 'anhanghaotiaoxing',
  keywords: ['CHOOSEROWS', '挑行', '行号', '重排', '动态数组'],
  difficulty: 2,
  usageLevel: 24,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '按行号挑出指定的若干行，还能顺手重排顺序',
  summary: 'CHOOSEROWS(数组, 行号1, [行号2]…) 按行号把需要的行挑出来组成新数组。行号从 1 开始，支持负数（-1 = 倒数第一行），可以重复、可以任意顺序——所以它同时也是一个「重排/复制行」的工具。想挑列就用它的姐妹函数 CHOOSECOLS。',
  syntax: {
    patternCn: '=CHOOSEROWS(数组, 行号1, [行号2]…)',
    patternEn: '=CHOOSEROWS(array, row_num1, [row_num2], …)',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要挑行的区域或数组。',
      example: 'A2:C10'
    },
      {
      key: 'row_num1',
      zh: '行号1',
      en: 'row_num1',
      required: true,
      desc: '要取的行号，从 1 开始；负数表示倒数第几行。',
      example: '3',
      tip: '可以重复写同一个行号来复制该行。'
    },
      {
      key: 'row_num2',
      zh: '行号2',
      en: 'row_num2',
      required: false,
      desc: '继续追加行号，顺序即结果的顺序。',
      example: '1'
    }
    ]
  },
  returnValue: '返回由指定行组成的新数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：挑出第 1 行和第 3 行',
    scene: '只要张三和王五两条记录。',
    dataTsv: '姓名\t部门\n张三\t华东\n李四\t华北\n王五\t华南',
    dataAnchor: 'A1',
    formula: '=CHOOSEROWS(A2:B4, 1, 3)',
    result: '张三/华东、王五/华南',
    explanation: '行号按「传入区域内」从 1 数起，结果顺序与书写顺序一致。'
  },
    {
    title: '示例 2：倒序排列（重排技巧）',
    scene: '把数据整体倒过来排。',
    dataTsv: '姓名\t部门\n张三\t华东\n李四\t华北\n王五\t华南',
    dataAnchor: 'A1',
    formula: '=CHOOSEROWS(A2:B4, 3, 2, 1)',
    result: '王五/华南、李四/华北、张三/华东',
    explanation: '因为可以任意指定顺序，CHOOSEROWS 也能当「手动重排」用。数据多时改用 SORT 更省事。'
  }
  ],
  pitfalls: [
    {
    title: '行号超出数组范围',
    reason: '写 5 但数组只有 3 行，Excel 报 #VALUE!。',
    fix: '行号必须在 1..行数 或 -行数..-1 之间。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '行号写 0',
    reason: '行号从 1 开始，0 是非法的。',
    fix: '从 1 开始数；倒数用 -1。',
    level: 'high',
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
    id: 'choosecols',
    kind: 'companion',
    why: 'CHOOSECOLS 是按列号挑列。'
  },
    {
    id: 'take',
    kind: 'alternative',
    why: '连续取前/后 N 行用 TAKE 更简洁。'
  },
    {
    id: 'vstack',
    kind: 'companion',
    why: '挑出来的行常用 VSTACK 拼在一起。'
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

export default chooserowsEntry;
