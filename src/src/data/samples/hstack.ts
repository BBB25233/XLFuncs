import type { FunctionEntry } from '@/types';

/** 横向拼接 · 把多个数组左右并排拼成一个大数组（lambda 类 B17 批次，Microsoft 365） */

const hstackEntry: FunctionEntry = {
  id: 'hstack',
  enName: 'HSTACK',
  zhName: '横向拼接',
  zhCommon: ['HSTACK', '横向拼接', '左右拼接'],
  alias: ['左右合并', '并排拼接', '横向堆叠'],
  category: 'lambda',
  abbr: 'hxpj',
  pinyin: 'hengxiangpinjie',
  keywords: ['HSTACK', '横向拼接', '合并列', '并排', '动态数组'],
  difficulty: 2,
  usageLevel: 44,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把多个数组左右并排拼成一个大数组',
  summary: 'HSTACK(数组1, [数组2]…) 把若干区域并排拼在一起，行数以最高的为准（行数不同时会报错，需先用 EXPAND 补齐）。它是合并多张结构相同表格的首选：把「1 月表」和「2 月表」并排放，或者把计算结果列追加到原数据右侧。要上下拼接请用 VSTACK。',
  syntax: {
    patternCn: '=HSTACK(数组1, [数组2]…)',
    patternEn: '=HSTACK(array1, [array2], …)',
    args: [
      {
      key: 'array1',
      zh: '数组1',
      en: 'array1',
      required: true,
      desc: '放在最左边的数组。',
      example: 'A2:B5'
    },
      {
      key: 'array2',
      zh: '数组2',
      en: 'array2',
      required: false,
      desc: '依次向右拼接的数组，可继续追加。',
      example: 'D2:E5',
      tip: '⚠️ 各数组行数必须一致，否则报 #N/A。'
    }
    ]
  },
  returnValue: '返回横向拼接后的数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：两张表并排',
    scene: '把华东、华北两张表并排放。',
    dataTsv: '华东姓名\t华东额\t华北姓名\t华北额\n张三\t800\t李四\t300',
    dataAnchor: 'A1',
    formula: '=HSTACK(A2:B2, C2:D2)',
    result: '一行四列：张三/800/李四/300',
    explanation: '两段区域行数相同，直接并排拼接。'
  },
    {
    title: '示例 2：给原数据追加计算列',
    scene: '在姓名右侧追加一列「含税额」。',
    dataTsv: '姓名\t金额\n张三\t800\n李四\t300',
    dataAnchor: 'A1',
    formula: '=HSTACK(A2:B3, B2:B3*1.13)',
    result: '两行三列，第三列为 904 与 339',
    explanation: '可以直接把表达式作为第二个参数，不必先落地成区域。'
  }
  ],
  pitfalls: [
    {
    title: '各数组行数不一致',
    reason: 'HSTACK 要求所有数组行数相同，不同则结果里出现 #N/A（而不是直接报错，容易被忽略）。',
    fix: '用 EXPAND 把短的数组补齐到相同行数再拼。',
    level: 'high',
    errorCode: '#N/A'
  },
    {
    title: '以为它会自动对齐/补全',
    reason: 'HSTACK 只是机械并排，不会按关键列对齐数据。',
    fix: '需要按关键字对齐请用 XLOOKUP 取数后再拼。',
    level: 'high'
  },
    {
    title: '溢出区域被占住',
    reason: '拼接后变宽，右侧单元格有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'vstack',
    kind: 'companion',
    why: 'VSTACK 是上下拼接版本。'
  },
    {
    id: 'expand',
    kind: 'companion',
    why: '行数不一致时先用 EXPAND 补齐。'
  },
    {
    id: 'choosecols',
    kind: 'alternative',
    why: '从同一数组里挑列用 CHOOSECOLS。'
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

export default hstackEntry;
