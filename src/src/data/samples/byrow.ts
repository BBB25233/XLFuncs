import type { FunctionEntry } from '@/types';

/** 逐行聚合 · 对每一行套用同一段计算，每行返回一个结果（lambda 类 B16 批次，Microsoft 365） */

const byrowEntry: FunctionEntry = {
  id: 'byrow',
  enName: 'BYROW',
  zhName: '逐行聚合',
  zhCommon: ['BYROW', '逐行', '按行汇总'],
  alias: ['按行计算', '每行一个结果', '行聚合'],
  category: 'lambda',
  abbr: 'zxjh',
  pinyin: 'zhuxingjuhe',
  keywords: ['BYROW', '逐行', '按行汇总', 'LAMBDA', '行聚合'],
  difficulty: 3,
  usageLevel: 34,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '对每一行套用同一段计算，每行返回一个结果',
  summary: 'BYROW 把数组的每一行当作一个整体交给 LAMBDA 处理，返回一个「行数 = 原行数」的单列数组。典型场景是每行求合计、每行找最大值、每行判断是否达标——过去要在最右列写公式再下拉，现在一个公式溢出整列。它和 MAP 的区别很关键：MAP 是逐「单元格」，BYROW 是逐「行」（你的 LAMBDA 拿到的是一整行数组）。',
  syntax: {
    patternCn: '=BYROW(数组, LAMBDA(行, 计算式))',
    patternEn: '=BYROW(array, LAMBDA(row, calculation))',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要逐行处理的区域。',
      example: 'A2:C6'
    },
      {
      key: 'lambda',
      zh: 'LAMBDA',
      en: 'LAMBDA(row, …)',
      required: true,
      desc: '接收「一行」作为参数，返回该行的单个结果。',
      example: 'LAMBDA(r, SUM(r))',
      tip: '⚠️ 参数 r 是一整行数组，不是单个值。'
    }
    ]
  },
  returnValue: '返回一个单列数组，元素个数 = 原数组行数（自动溢出）。',
  examples: [
    {
    title: '示例 1：每行求和',
    scene: '三个月销量按行合计。',
    dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
    dataAnchor: 'A1',
    formula: '=BYROW(B2:C3, LAMBDA(r, SUM(r)))',
    result: '溢出为 {320; 230}',
    explanation: 'LAMBDA 的 r 拿到的是整行（如 {120,200}），SUM(r) 就是这一行的合计。不用在 D 列写公式再下拉。'
  },
    {
    title: '示例 2：每行判断达标',
    scene: '任一个月超过 180 就算达标。',
    dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
    dataAnchor: 'A1',
    formula: '=BYROW(B2:C3, LAMBDA(r, IF(MAX(r)>=180, "达标", "未达标")))',
    result: '溢出为 {"达标"; "未达标"}',
    explanation: '逐行做判断并返回文本，结果同样溢出成一列。'
  }
  ],
  pitfalls: [
    {
    title: '把 LAMBDA 参数当成单个值用',
    reason: 'BYROW 传进来的是「一整行数组」，直接写 r*2 会返回数组而不是单值，导致结果溢出成多行。',
    fix: '在 LAMBDA 里用 SUM/MAX/AVERAGE 等把行聚合成单值。',
    level: 'high'
  },
    {
    title: '和 MAP 用反了',
    reason: 'MAP 逐单元格、BYROW 逐行；想逐单元格却用 BYROW，结果会莫名其妙。',
    fix: '逐单元格变换用 MAP，逐行聚合用 BYROW，逐列用 BYCOL。',
    level: 'high'
  },
    {
    title: '结果列被占住',
    reason: '溢出区域有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'bycol',
    kind: 'companion',
    why: 'BYCOL 是逐列版本。'
  },
    {
    id: 'map',
    kind: 'alternative',
    why: '逐单元格变换用 MAP。'
  },
    {
    id: 'sum',
    kind: 'companion',
    why: '行内求和最常用 SUM。'
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

export default byrowEntry;
