import type { FunctionEntry } from '@/types';

/** 按列号挑列 · 按列号挑出指定的若干列，顺手调整列顺序（lambda 类 B17 批次，Microsoft 365） */

const choosecolsEntry: FunctionEntry = {
  id: 'choosecols',
  enName: 'CHOOSECOLS',
  zhName: '按列号挑列',
  zhCommon: ['CHOOSEROWS列', 'CHOOSECOLS', '挑列'],
  alias: ['提取指定列', '调整列序', '取第几列'],
  category: 'lambda',
  abbr: 'alhtl',
  pinyin: 'anliehaotiaolie',
  keywords: ['CHOOSECOLS', '挑列', '列号', '调整列顺序', '动态数组'],
  difficulty: 2,
  usageLevel: 26,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '按列号挑出指定的若干列，顺手调整列顺序',
  summary: 'CHOOSECOLS(数组, 列号1, [列号2]…) 与 CHOOSEROWS 完全对称，只是作用在列上。它最常见的用途是「从宽表里挑出需要的几列」以及「重排列顺序」——不用剪切粘贴，改公式参数即可。列号从 1 开始，支持负数（倒数第几列），可重复。',
  syntax: {
    patternCn: '=CHOOSECOLS(数组, 列号1, [列号2]…)',
    patternEn: '=CHOOSECOLS(array, col_num1, [col_num2], …)',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要挑列的区域或数组。',
      example: 'A2:E10'
    },
      {
      key: 'col_num1',
      zh: '列号1',
      en: 'col_num1',
      required: true,
      desc: '要取的列号，从 1 开始；负数为倒数第几列。',
      example: '2'
    },
      {
      key: 'col_num2',
      zh: '列号2',
      en: 'col_num2',
      required: false,
      desc: '继续追加列号，顺序即结果的列顺序。',
      example: '1'
    }
    ]
  },
  returnValue: '返回由指定列组成的新数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：从宽表挑出需要的两列',
    scene: '员工表有 4 列，只要「姓名」和「销售额」。',
    dataTsv: '工号\t姓名\t部门\t销售额\n1\t张三\t华东\t800\n2\t李四\t华北\t300',
    dataAnchor: 'A1',
    formula: '=CHOOSECOLS(A2:D3, 2, 4)',
    result: '张三/800、李四/300',
    explanation: '列号按传入区域内从左往右数，2=姓名，4=销售额。'
  },
    {
    title: '示例 2：交换两列顺序',
    scene: '把「销售额」放到「姓名」前面。',
    dataTsv: '工号\t姓名\t部门\t销售额\n1\t张三\t华东\t800\n2\t李四\t华北\t300',
    dataAnchor: 'A1',
    formula: '=CHOOSECOLS(A2:D3, 4, 2)',
    result: '800/张三、300/李四',
    explanation: '交换参数顺序即可换列，比剪切粘贴干净得多，且源数据完全不动。'
  }
  ],
  pitfalls: [
    {
    title: '列号超出范围或写 0',
    reason: '列号从 1 开始，0 或超过总列数都会报 #VALUE!。',
    fix: '列号取 1..总列数，或 -总列数..-1。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '列数是动态变化时写死列号',
    reason: '源表插入一列后，原写死的列号会指错列，而且不报错，很难发现。',
    fix: '结构经常变时，考虑用 FILTER/CHOOSECOLS 配合 MATCH 动态定位列号。',
    level: 'high'
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
    id: 'chooserows',
    kind: 'companion',
    why: 'CHOOSEROWS 是按行号挑行。'
  },
    {
    id: 'hstack',
    kind: 'alternative',
    why: '拼接已有数组用 HSTACK。'
  },
    {
    id: 'drop',
    kind: 'companion',
    why: '去掉某几列也可用 DROP 的列数参数。'
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

export default choosecolsEntry;
