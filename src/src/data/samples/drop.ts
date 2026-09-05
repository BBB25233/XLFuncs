import type { FunctionEntry } from '@/types';

/** 丢弃前几行或列 · 从数组开头（或末尾）丢弃指定行数、列数（lambda 类 B17 批次，Microsoft 365） */

const dropEntry: FunctionEntry = {
  id: 'drop',
  enName: 'DROP',
  zhName: '丢弃前几行或列',
  zhCommon: ['DROP', '去掉前N行', '丢弃'],
  alias: ['砍掉开头', '去掉表头', '剔除行列'],
  category: 'lambda',
  abbr: 'dqqjhhl',
  pinyin: 'diuqiqianjihanghuolie',
  keywords: ['DROP', '丢弃', '去掉前几行', '去表头', '动态数组'],
  difficulty: 2,
  usageLevel: 30,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '从数组开头（或末尾）丢弃指定行数、列数',
  summary: 'DROP(数组, 行数, [列数]) 与 TAKE 相反：它丢掉若干行/列，返回剩下的部分。正数从开头丢，负数从末尾丢。最典型用途是「去掉表头行」或「砍掉汇总行」——比如对整张表（含标题）做运算前先把第一行丢掉。',
  syntax: {
    patternCn: '=DROP(数组, 行数, [列数])',
    patternEn: '=DROP(array, rows, [columns])',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要处理的区域或数组。',
      example: 'A1:C10'
    },
      {
      key: 'rows',
      zh: '行数',
      en: 'rows',
      required: true,
      desc: '正数从开头丢弃，负数从末尾丢弃。',
      example: '1',
      tip: '丢掉表头行就写 1。'
    },
      {
      key: 'columns',
      zh: '列数',
      en: 'columns',
      required: false,
      desc: '同样支持正负，省略则不动列。',
      example: '-1'
    }
    ]
  },
  returnValue: '返回丢弃后的剩余数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：去掉表头行',
    scene: '区域包含标题行，运算前先丢掉它。',
    dataTsv: '姓名\t销售额\n张三\t800\n李四\t300',
    dataAnchor: 'A1',
    formula: '=DROP(A1:B3, 1)',
    result: '张三/800、李四/300',
    explanation: '把 A1 的表头丢掉，只留数据行。配合 SUM/AVERAGE 等聚合时很常用。'
  },
    {
    title: '示例 2：去掉末尾汇总行',
    scene: '区域最后一行是合计，不参与计算。',
    dataTsv: '姓名\t销售额\n张三\t800\n合计\t800',
    dataAnchor: 'A1',
    formula: '=DROP(A2:B4, -1)',
    result: '张三/800',
    explanation: '负数 -1 表示从末尾丢 1 行，正好去掉合计行。'
  }
  ],
  pitfalls: [
    {
    title: '和 TAKE 的方向搞反',
    reason: 'DROP(…, 2) 丢掉开头 2 行；TAKE(…, -2) 保留末尾 2 行——两者结果相同，但语义不同，混用会让公式难以理解。',
    fix: '明确意图：要「剩下多少」用 TAKE，要「砍掉多少」用 DROP。',
    level: 'high'
  },
    {
    title: '丢弃行数 >= 数组行数',
    reason: '全丢光后返回空，Excel 会报 #CALC!，看起来像公式写错。',
    fix: '确认行数参数小于数组总行数。',
    level: 'mid',
    errorCode: '#CALC!'
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
    id: 'take',
    kind: 'companion',
    why: 'TAKE 是「保留 N 行」的反向操作。'
  },
    {
    id: 'chooserows',
    kind: 'alternative',
    why: '要挑指定行号用 CHOOSEROWS。'
  },
    {
    id: 'hstack',
    kind: 'companion',
    why: '拼接后常需去掉重复表头，会用到 DROP。'
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

export default dropEntry;
