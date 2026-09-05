import type { FunctionEntry } from '@/types';

/** 生成序列 · 一键生成连续数字（或日期）序列，自动溢出（lambda 类 B16 批次，Microsoft 365） */

const sequenceEntry: FunctionEntry = {
  id: 'sequence',
  enName: 'SEQUENCE',
  zhName: '生成序列',
  zhCommon: ['SEQUENCE', '序列', '自动生成序号'],
  alias: ['序号', '连续数字', '日期序列'],
  category: 'lambda',
  abbr: 'scxl',
  pinyin: 'shengchengxulie',
  keywords: ['SEQUENCE', '序列', '序号', '连续数字', '动态数组'],
  difficulty: 1,
  usageLevel: 66,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '一键生成连续数字（或日期）序列，自动溢出',
  summary: 'SEQUENCE(行数, [列数], [起始值], [步长]) 生成一个等差数列数组。它替代了「在 A1 输 1、A2 输 2 然后下拉」这种体力活，也替代了 ROW(1:10) 这类取巧写法。因为结果是动态数组，行数由参数决定，增删数据不用重新拉填充。起始值给日期序列号（或配合 DATE）还能生成连续日期，做日程表、摊销表非常方便。',
  syntax: {
    patternCn: '=SEQUENCE(行数, [列数], [起始值], [步长])',
    patternEn: '=SEQUENCE(rows, [columns], [start], [step])',
    args: [
      {
      key: 'rows',
      zh: '行数',
      en: 'rows',
      required: true,
      desc: '要生成的行数。',
      example: '10'
    },
      {
      key: 'columns',
      zh: '列数',
      en: 'columns',
      required: false,
      desc: '要生成的列数，省略为 1。',
      example: '3'
    },
      {
      key: 'start',
      zh: '起始值',
      en: 'start',
      required: false,
      desc: '第一个数，省略为 1。',
      example: '100',
      tip: '填日期序列号可生成日期序列。'
    },
      {
      key: 'step',
      zh: '步长',
      en: 'step',
      required: false,
      desc: '相邻两个数的差，省略为 1，可为负（递减）。',
      example: '-1'
    }
    ]
  },
  returnValue: '返回按行列排布的等差数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：生成 1 到 10',
    scene: '快速造一列序号。',
    dataTsv: '说明\n生成 1~10',
    dataAnchor: 'A1',
    formula: '=SEQUENCE(10)',
    result: '溢出为 {1;2;3;4;5;6;7;8;9;10}',
    explanation: '只给行数时生成 1 起的单列序列。比下拉填充更稳，插入行也不会错乱。'
  },
    {
    title: '示例 2：生成连续日期',
    scene: '从 2026-01-01 起生成 5 天日期。',
    dataTsv: '说明\n生成连续日期',
    dataAnchor: 'A1',
    formula: '=DATE(2026,1,1)+SEQUENCE(5)-1',
    result: '溢出为 2026/1/1 ~ 2026/1/5',
    explanation: 'SEQUENCE 生成 0~4 的增量加到起始日期上，即得连续日期。做排班表、摊销表很好用。'
  },
    {
    title: '示例 3：倒序 / 矩阵',
    scene: '从 10 倒数到 1，或生成 3 行 4 列。',
    dataTsv: '说明\n倒序与矩阵',
    dataAnchor: 'A1',
    formula: '=SEQUENCE(10, , 10, -1)',
    result: '{10;9;8;7;6;5;4;3;2;1}',
    explanation: '步长为负即递减；给列数则可生成多行多列矩阵。'
  }
  ],
  pitfalls: [
    {
    title: '行列数写成 0 或负数',
    reason: 'SEQUENCE 要求行列数为正，否则报错。',
    fix: '行列数取正整数；动态计算时用 MAX(1, …) 兜底。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '溢出区域被占住',
    reason: '生成的序列要占用的单元格有内容。',
    fix: '清空溢出区域。',
    level: 'high',
    errorCode: '#SPILL!'
  },
    {
    title: '想要「跟着数据行数变」却写死数字',
    reason: '把行数写死成 10，数据变成 15 行后序列不跟着长。',
    fix: '行数用 COUNTA/ROWS 动态算，如 SEQUENCE(COUNTA(A2:A100))。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'makearray',
    kind: 'alternative',
    why: '要按行列号自定义计算用 MAKEARRAY。'
  },
    {
    id: 'row',
    kind: 'companion',
    why: 'ROW 也能造序号，但 SEQUENCE 更直观可控。'
  },
    {
    id: 'sort',
    kind: 'companion',
    why: 'SEQUENCE 常与排序类函数组合造测试数据。'
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

export default sequenceEntry;
