import type { FunctionEntry } from '@/types';

/** 逐列聚合 · 对每一列套用同一段计算，每列返回一个结果（lambda 类 B16 批次，Microsoft 365） */

const bycolEntry: FunctionEntry = {
  id: 'bycol',
  enName: 'BYCOL',
  zhName: '逐列聚合',
  zhCommon: ['BYCOL', '逐列', '按列汇总'],
  alias: ['按列计算', '每列一个结果', '列聚合'],
  category: 'lambda',
  abbr: 'zljh',
  pinyin: 'zhuliejuhe',
  keywords: ['BYCOL', '逐列', '按列汇总', 'LAMBDA', '列聚合'],
  difficulty: 3,
  usageLevel: 26,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '对每一列套用同一段计算，每列返回一个结果',
  summary: 'BYCOL 是 BYROW 的「转置版」：把数组的每一列交给 LAMBDA，返回一个「列数 = 原列数」的单行数组。适合做每列求和、每列求平均、每列找最值这类横向汇总——结果横向溢出一行，正好放在数据下方做汇总行。',
  syntax: {
    patternCn: '=BYCOL(数组, LAMBDA(列, 计算式))',
    patternEn: '=BYCOL(array, LAMBDA(column, calculation))',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要逐列处理的区域。',
      example: 'B2:D6'
    },
      {
      key: 'lambda',
      zh: 'LAMBDA',
      en: 'LAMBDA(column, …)',
      required: true,
      desc: '接收「一列」作为参数，返回该列的单个结果。',
      example: 'LAMBDA(c, SUM(c))',
      tip: '⚠️ 参数 c 是一整列数组，不是单个值。'
    }
    ]
  },
  returnValue: '返回一个单行数组，元素个数 = 原数组列数（自动溢出）。',
  examples: [
    {
    title: '示例 1：每列求和',
    scene: '各月销量按列汇总成一行。',
    dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
    dataAnchor: 'A1',
    formula: '=BYCOL(B2:C3, LAMBDA(c, SUM(c)))',
    result: '横向溢出为 {200, 350}',
    explanation: '结果是一行，正好放在数据下方当汇总行用。'
  },
    {
    title: '示例 2：每列找最大值',
    scene: '看每个月的最高销量。',
    dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
    dataAnchor: 'A1',
    formula: '=BYCOL(B2:C3, LAMBDA(c, MAX(c)))',
    result: '横向溢出为 {120, 200}',
    explanation: '逐列取最大，一个公式得到每月峰值。'
  }
  ],
  pitfalls: [
    {
    title: 'LAMBDA 参数当成单值',
    reason: '传进来的是一整列数组，不做聚合就返回数组，结果布局会乱。',
    fix: '用 SUM/MAX/AVERAGE 等把列聚合成单值。',
    level: 'high'
  },
    {
    title: '结果行被占住',
    reason: '横向溢出的单元格里有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  },
    {
    title: '和 BYROW 用反',
    reason: '想要每行一个结果却用了 BYCOL，方向就错了。',
    fix: '逐行用 BYROW，逐列用 BYCOL。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'byrow',
    kind: 'companion',
    why: 'BYROW 是逐行版本。'
  },
    {
    id: 'map',
    kind: 'alternative',
    why: '逐单元格变换用 MAP。'
  },
    {
    id: 'sum',
    kind: 'companion',
    why: '列内求和最常用 SUM。'
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

export default bycolEntry;
