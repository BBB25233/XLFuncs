import type { FunctionEntry } from '@/types';

/** 逐元素变换 · 对数组里每个元素套用同一段计算，返回一个同形状的数组（lambda 类 B16 批次，Microsoft 365） */

const mapEntry: FunctionEntry = {
  id: 'map',
  enName: 'MAP',
  zhName: '逐元素变换',
  zhCommon: ['MAP', '逐元素', '批量映射'],
  alias: ['映射', '逐项处理', '数组变换'],
  category: 'lambda',
  abbr: 'zysbh',
  pinyin: 'zhuyuansubianhuan',
  keywords: ['MAP', '逐元素', '映射', '数组变换', 'LAMBDA'],
  difficulty: 3,
  usageLevel: 44,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '对数组里每个元素套用同一段计算，返回一个同形状的数组',
  summary: 'MAP 把 LAMBDA 依次作用到数组的每一个元素上，返回的结果数组与原数组行数列数完全一致。它是「我要对这一整片数据做同一个操作」的标准答案，替代了过去要写辅助列再下拉的做法。MAP 一次只能处理一个数组（要两个数组请配 MAP 的两个参数写法或用别的函数组合），LAMBDA 的参数与传入数组一一对应。',
  syntax: {
    patternCn: '=MAP(数组1, [数组2]…, LAMBDA(参数…, 计算式))',
    patternEn: '=MAP(array1, [array2], …, LAMBDA(parameter, calculation))',
    args: [
      {
      key: 'array1',
      zh: '数组1',
      en: 'array1',
      required: true,
      desc: '要逐项处理的区域或数组。',
      example: 'A2:A6'
    },
      {
      key: 'lambda',
      zh: 'LAMBDA',
      en: 'LAMBDA(parameter, calculation)',
      required: true,
      desc: '对每个元素执行的计算，参数个数要与传入数组个数一致。',
      example: 'LAMBDA(x, x*1.13)'
    }
    ]
  },
  returnValue: '返回一个与原数组尺寸相同的结果数组（会自动溢出）。',
  examples: [
    {
    title: '示例 1：整列统一加价',
    scene: '一批单价统一上调 13%。',
    dataTsv: '单价\n100\n250\n80',
    dataAnchor: 'A1',
    formula: '=MAP(A2:A4, LAMBDA(x, x*1.13))',
    result: '溢出为 {113; 282.5; 90.4} 一列',
    explanation: '一个公式算出整列结果并自动溢出到下方单元格，不需要下拉填充。'
  },
    {
    title: '示例 2：两个数组对应运算',
    scene: '单价 × 数量 逐行相乘。',
    dataTsv: '单价\t数量\n12\t10\n8\t30\n25\t4',
    dataAnchor: 'A1',
    formula: '=MAP(A2:A4, B2:B4, LAMBDA(p, q, p*q))',
    result: '溢出为 {120; 240; 100}',
    explanation: '传两个数组时 LAMBDA 就要有两个参数，按顺序一一对应。两个数组尺寸必须一致，否则报 #VALUE!。'
  }
  ],
  pitfalls: [
    {
    title: 'LAMBDA 参数个数与数组个数不匹配',
    reason: '传了两个数组却只写一个参数（或反过来），Excel 直接报错。',
    fix: '保持「数组个数 == LAMBDA 参数个数」。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '结果区域被占住导致溢出失败',
    reason: 'MAP 的结果要溢出到下方/右方单元格，那些格子若有内容就会挡住。',
    fix: '清空结果区域，或把公式放到空白处。',
    level: 'high',
    errorCode: '#SPILL!'
  },
    {
    title: '想「汇总成一个值」却用了 MAP',
    reason: 'MAP 是逐元素变换，返回同尺寸数组；要聚合成单个值该用 REDUCE。',
    fix: '汇总用 REDUCE，保留中间过程用 SCAN。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'reduce',
    kind: 'alternative',
    why: '要把数组聚合成单个值用 REDUCE。'
  },
    {
    id: 'scan',
    kind: 'alternative',
    why: '要保留每一步累积结果用 SCAN。'
  },
    {
    id: 'byrow',
    kind: 'companion',
    why: 'BYROW 是「逐行」版本，MAP 是「逐元素」。'
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

export default mapEntry;
