import type { FunctionEntry } from '@/types';

/** 生成数组 · 按行列下标逐格计算，凭空生成一个数组（lambda 类 B16 批次，Microsoft 365） */

const makearrayEntry: FunctionEntry = {
  id: 'makearray',
  enName: 'MAKEARRAY',
  zhName: '生成数组',
  zhCommon: ['MAKEARRAY', '生成数组', '构造数组'],
  alias: ['造数组', '按行列生成', '自定义矩阵'],
  category: 'lambda',
  abbr: 'scsz',
  pinyin: 'shengchengshuzu',
  keywords: ['MAKEARRAY', '生成数组', '矩阵', '乘法表', 'LAMBDA'],
  difficulty: 3,
  usageLevel: 22,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '按行列下标逐格计算，凭空生成一个数组',
  summary: 'MAKEARRAY(行数, 列数, LAMBDA(行号, 列号, 计算式)) 会遍历每一个位置，用你给的计算式算出该格的值，拼成一个数组。它是「凭空造表」的工具：乘法表、日程矩阵、坐标网格、批量编号都能做。LAMBDA 拿到的是当前格的行号与列号（从 1 开始），你可以用它们做任何运算。',
  syntax: {
    patternCn: '=MAKEARRAY(行数, 列数, LAMBDA(行号, 列号, 计算式))',
    patternEn: '=MAKEARRAY(rows, cols, LAMBDA(r, c, calculation))',
    args: [
      {
      key: 'rows',
      zh: '行数',
      en: 'rows',
      required: true,
      desc: '要生成的行数，必须 > 0。',
      example: '9'
    },
      {
      key: 'cols',
      zh: '列数',
      en: 'cols',
      required: true,
      desc: '要生成的列数，必须 > 0。',
      example: '9'
    },
      {
      key: 'lambda',
      zh: 'LAMBDA',
      en: 'LAMBDA(r, c, …)',
      required: true,
      desc: '接收当前行号、列号（均从 1 开始），返回该格的值。',
      example: 'LAMBDA(r, c, r*c)'
    }
    ]
  },
  returnValue: '返回指定行列的数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：九九乘法表',
    scene: '一次性生成整张乘法表。',
    dataTsv: '说明\n生成 9×9 乘法表',
    dataAnchor: 'A1',
    formula: '=MAKEARRAY(9, 9, LAMBDA(r, c, r*c))',
    result: '溢出为 9 行 9 列，第 r 行第 c 列 = r×c',
    explanation: '行号列号都从 1 开始，直接相乘即是乘法表。不用填 81 个公式。'
  },
    {
    title: '示例 2：批量生成编号/日期',
    scene: '生成 3 行 4 列的序号矩阵。',
    dataTsv: '说明\n生成 3×4 序号',
    dataAnchor: 'A1',
    formula: '=MAKEARRAY(3, 4, LAMBDA(r, c, (r-1)*4+c))',
    result: '溢出为 {1,2,3,4; 5,6,7,8; 9,10,11,12}',
    explanation: '用行列号推算线性序号，是批量造测试数据的常用写法。'
  }
  ],
  pitfalls: [
    {
    title: '行列数写成 0 或负数',
    reason: 'MAKEARRAY 要求行列数 > 0，否则报错。',
    fix: '确保行列数是正整数，需要动态计算时用 ROUNDUP 等处理。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '以为行列号从 0 开始',
    reason: 'Excel 的 MAKEARRAY 行列号从 1 开始，按 0 起算会导致整体偏移一行一列。',
    fix: '记住 r、c 最小是 1；需要 0 基下标就写 (r-1)、(c-1)。',
    level: 'high'
  },
    {
    title: '生成超大数组拖慢表格',
    reason: '几千×几千的 MAKEARRAY 会瞬间产生百万级单元格，Excel 会卡死。',
    fix: '控制规模，或改用 SEQUENCE 等更轻量的方案。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'sequence',
    kind: 'alternative',
    why: '只要一列/一行序列，SEQUENCE 更轻便。'
  },
    {
    id: 'map',
    kind: 'companion',
    why: 'MAP 变换已有数组，MAKEARRAY 从零生成。'
  },
    {
    id: 'expand',
    kind: 'companion',
    why: 'EXPAND 把已有数组扩到指定尺寸。'
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

export default makearrayEntry;
