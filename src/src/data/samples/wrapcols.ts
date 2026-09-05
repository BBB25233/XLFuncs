import type { FunctionEntry } from '@/types';

/** 按列折列 · 把一维数组按「每列 N 个」折成一个多列表格（lambda 类 B17 批次，Microsoft 365） */

const wrapcolsEntry: FunctionEntry = {
  id: 'wrapcols',
  enName: 'WRAPCOLS',
  zhName: '按列折列',
  zhCommon: ['WRAPCOLS', '折列', '一列折多列'],
  alias: ['按个数折列', '纵向重排', '折成矩阵'],
  category: 'lambda',
  abbr: 'alzl',
  pinyin: 'anliezhelie',
  keywords: ['WRAPCOLS', '折列', '重排', '矩阵', '动态数组'],
  difficulty: 3,
  usageLevel: 10,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把一维数组按「每列 N 个」折成一个多列表格',
  summary: 'WRAPCOLS(向量, 每列个数, [填充值]) 与 WRAPROWS 对称：它按「列」方向填充——先填满第一列的 N 个，再填第二列。适合把长列表按纵向重排成多列（比如把一列名单排成 3 列以节省打印空间）。',
  syntax: {
    patternCn: '=WRAPCOLS(向量, 每列个数, [填充值])',
    patternEn: '=WRAPCOLS(vector, wrap_count, [pad_with])',
    args: [
      {
      key: 'vector',
      zh: '向量',
      en: 'vector',
      required: true,
      desc: '要折列的一维数组。',
      example: 'A2:A10'
    },
      {
      key: 'wrap_count',
      zh: '每列个数',
      en: 'wrap_count',
      required: true,
      desc: '每列放几个元素，必须 > 0。',
      example: '3'
    },
      {
      key: 'pad_with',
      zh: '填充值',
      en: 'pad_with',
      required: false,
      desc: '最后一列不足时的补位内容，省略为 #N/A。',
      example: '""'
    }
    ]
  },
  returnValue: '返回折列后的多列数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：9 个数字折成每列 3 个',
    scene: '把一列数据纵向重排成 3 列。',
    dataTsv: '数值\n1\n2\n3\n4\n5\n6\n7\n8\n9',
    dataAnchor: 'A1',
    formula: '=WRAPCOLS(A2:A10, 3)',
    result: '3 行 3 列：{1,4,7; 2,5,8; 3,6,9}',
    explanation: '注意顺序与 WRAPROWS 不同：它是先填满一列再换下一列。'
  },
    {
    title: '示例 2：长名单排成 3 列省纸',
    scene: '12 个人名排成 3 列。',
    dataTsv: '姓名\nA\nB\nC\nD\nE\nF',
    dataAnchor: 'A1',
    formula: '=WRAPCOLS(A2:A7, 2, "")',
    result: '2 行 3 列：{A,C,E; B,D,F}',
    explanation: '打印长名单时折成多列能显著省纸。'
  }
  ],
  pitfalls: [
    {
    title: '和 WRAPROWS 的顺序搞混',
    reason: '两者填充方向不同（一个按行、一个按列），用错会导致数据顺序看着「乱了」。',
    fix: '要「横向读完再换行」用 WRAPROWS；要「纵向读完再换列」用 WRAPCOLS。',
    level: 'high'
  },
    {
    title: '每列个数写 0 或负数',
    reason: 'wrap_count 必须为正整数。',
    fix: '确保 > 0。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '末列补位出现 #N/A',
    reason: '不能整除时省略了填充值。',
    fix: '显式指定 pad_with。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'wraprows',
    kind: 'companion',
    why: 'WRAPROWS 是按行折行的版本。'
  },
    {
    id: 'torow',
    kind: 'companion',
    why: '先 TOROW 拉平再折列是标准套路。'
  },
    {
    id: 'hstack',
    kind: 'alternative',
    why: '拼接已有数组用 HSTACK。'
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

export default wrapcolsEntry;
