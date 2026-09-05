import type { FunctionEntry } from '@/types';

/** 按行折行 · 把一维数组按「每行 N 个」折成一个多行表格（lambda 类 B17 批次，Microsoft 365） */

const wraprowsEntry: FunctionEntry = {
  id: 'wraprows',
  enName: 'WRAPROWS',
  zhName: '按行折行',
  zhCommon: ['WRAPROWS', '折行', '一行折多行'],
  alias: ['按行数换行', '重排成矩阵', '折成表格'],
  category: 'lambda',
  abbr: 'axzx',
  pinyin: 'anxingzhexing',
  keywords: ['WRAPROWS', '折行', '换行', '重排', '动态数组'],
  difficulty: 3,
  usageLevel: 12,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把一维数组按「每行 N 个」折成一个多行表格',
  summary: 'WRAPROWS(向量, 每行个数, [填充值]) 把一行/一列数据按指定个数换行，重排成多行矩阵。它和 TOROW/TOCOL 正好互逆：先用 TOCOL 把区域拉平成一列，再用 WRAPROWS 折回想要的行数，就能完成「重新排版」。最后一行的空位用填充值补（省略则填 #N/A）。',
  syntax: {
    patternCn: '=WRAPROWS(向量, 每行个数, [填充值])',
    patternEn: '=WRAPROWS(vector, wrap_count, [pad_with])',
    args: [
      {
      key: 'vector',
      zh: '向量',
      en: 'vector',
      required: true,
      desc: '要折行的一维数组（一行或一列）。',
      example: 'A2:A10'
    },
      {
      key: 'wrap_count',
      zh: '每行个数',
      en: 'wrap_count',
      required: true,
      desc: '每行放几个元素，必须 > 0。',
      example: '3'
    },
      {
      key: 'pad_with',
      zh: '填充值',
      en: 'pad_with',
      required: false,
      desc: '最后一行不足时的补位内容，省略为 #N/A。',
      example: '""'
    }
    ]
  },
  returnValue: '返回折行后的多行数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：9 个数字折成每行 3 个',
    scene: '把一列数据排成 3×3 表格。',
    dataTsv: '数值\n1\n2\n3\n4\n5\n6\n7\n8\n9',
    dataAnchor: 'A1',
    formula: '=WRAPROWS(A2:A10, 3)',
    result: '3 行 3 列：{1,2,3; 4,5,6; 7,8,9}',
    explanation: '按行依次填充，填满 3 个换下一行。'
  },
    {
    title: '示例 2：折行并补齐空位',
    scene: '10 个数字每行 3 个，最后一行只有 1 个，其余补空。',
    dataTsv: '数值\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
    dataAnchor: 'A1',
    formula: '=WRAPROWS(A2:A11, 3, "")',
    result: '4 行 3 列，第 4 行为 {10, "", ""}',
    explanation: '不给填充值时补 #N/A，做表格通常填 "" 更美观。'
  }
  ],
  pitfalls: [
    {
    title: '每行个数写 0 或负数',
    reason: 'wrap_count 必须是正整数，否则报 #VALUE!。',
    fix: '确保 > 0。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '忘了填充值导致 #N/A',
    reason: '不能整除时末行补 #N/A，报表里很难看。',
    fix: '显式给 pad_with，如 "" 或 0。',
    level: 'mid'
  },
    {
    title: '以为它是按列折',
    reason: 'WRAPROWS 是按「行」填充；按列填充应改用 WRAPCOLS。',
    fix: '横向填用 WRAPROWS，纵向填用 WRAPCOLS。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'wrapcols',
    kind: 'companion',
    why: 'WRAPCOLS 是按列折列的版本。'
  },
    {
    id: 'tocol',
    kind: 'companion',
    why: '先 TOCOL 拉平再 WRAPROWS 折回，是重排版的标准套路。'
  },
    {
    id: 'makearray',
    kind: 'alternative',
    why: '按行列号计算生成用 MAKEARRAY。'
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

export default wraprowsEntry;
