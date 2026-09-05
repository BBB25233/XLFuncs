import type { FunctionEntry } from '@/types';

/** SUMX2MY2 · 两数组平方差之和（math 类 B2 批次） */

const TSV = 'x\ty\n3\t1\n4\t2\n5\t3\n6\t2';

const sumx2my2Entry: FunctionEntry = {
  id: 'sumx2my2',
  enName: 'SUMX2MY2',
  zhName: '平方差之和',
  zhCommon: ['平方差之和', 'SUMX2MY2', '两列平方差'],
  alias: ['x方减y方求和', '平方差求和', '数组平方差'],
  category: 'math',
  abbr: 'pfczh',
  pinyin: 'pingfangchazhihe',
  keywords: ['SUMX2MY2', '平方差', '数组运算', '两列对比', '回归计算'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '统计与回归计算中的专用函数，日常办公极少使用。',
  },
  oneLiner: '两列数各自平方后相减，再把差全部加起来',
  summary:
    'SUMX2MY2(x区域, y区域) = Σ(x² − y²)，即「先各自平方、再逐行相减、最后求和」。它和统计里的回归计算有关，日常做表基本用不到。容易混淆的是同族的三个函数：SUMX2MY2 是平方**差**之和、SUMX2PY2 是平方**和**之和、SUMXMY2 是**差的平方**之和——三者名字只差一两个字符，含义完全不同。',
  syntax: {
    patternCn: '=SUMX2MY2(x区域, y区域)',
    patternEn: '=SUMX2MY2(array_x, array_y)',
    args: [
      {
        key: 'array_x',
        zh: 'x区域',
        en: 'array_x',
        required: true,
        desc: '第一组数值所在的区域。',
        accepts: '单元格区域，如 A2:A5。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '两个区域的大小必须一致，否则报 #N/A。',
        example: 'A2:A5',
        pitfallRank: 1,
      },
      {
        key: 'array_y',
        zh: 'y区域',
        en: 'array_y',
        required: true,
        desc: '第二组数值所在的区域。',
        accepts: '单元格区域，如 B2:B5。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '行数/列数必须与 x 区域相同。',
        example: 'B2:B5',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回 Σ(x² − y²) 的结果；两区域大小不一致时返回 #N/A。',
  examples: [
    {
      title: '示例 1：基本计算（手算验证）',
      scene: '两组数各 4 行，算平方差之和。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMX2MY2(A2:A5,B2:B5)',
      result: '(9−1)+(16−4)+(25−9)+(36−4) = 8+12+16+32 = 68',
      explanation: '逐行算 x²−y² 再全部相加。可拆成 =SUMSQ(A2:A5)-SUMSQ(B2:B5) 验证，结果同样是 68。',
    },
    {
      title: '示例 2：用 SUMSQ 组合得到同样结果',
      scene: '想用更直观的写法替代这个冷门函数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMSQ(A2:A5)-SUMSQ(B2:B5)',
      result: '86 − 18 = 68（与 SUMX2MY2 一致）',
      explanation:
        '因为 Σ(x²−y²) = Σx² − Σy²，所以两个 SUMSQ 相减完全等价，而且更好读、更好维护。日常推荐这种写法。',
    },
    {
      title: '示例 3：区域大小不一致时报错',
      scene: '两个区域行数不同，函数拒绝计算。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMX2MY2(A2:A5,B2:B4)',
      result: '#N/A（x 区域 4 行、y 区域 3 行，长度不匹配）',
      explanation: '必须严格等长。这是这类数组函数最常见的报错原因。',
    },
  ],
  pitfalls: [
    {
      title: '两个区域大小不一致',
      reason: '数组运算要求逐元素对应，长度不同无法配对。',
      fix: '确保两个区域的行数（或列数）完全相同，包括起始行要对齐。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '与 SUMXMY2 / SUMX2PY2 搞混',
      reason: '三个函数名字极其相似：平方差之和（x²−y²）、差的平方之和（(x−y)²）、平方和之和（x²+y²）。数学含义完全不同。',
      fix: '看名字中间那段：X2MY2 = x²减y²；XMY2 = (x−y)²；X2PY2 = x²加y²。不确定时用 SUMSQ/SUMPRODUCT 组合手写，可读性更好。',
      level: 'high',
    },
    {
      title: '区域里混入文本或空单元格',
      reason: '文本无法参与平方运算。',
      fix: '清理数据或改用 SUMPRODUCT 配合 N() 做容错处理。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'sumx2py2',
      kind: 'confusable',
      why: '同族函数，算的是 Σ(x²+y²)。名字只差一个字符（M/P），极易混淆。',
    },
    {
      id: 'sumxmy2',
      kind: 'confusable',
      why: '同族函数，算的是 Σ(x−y)²，即「差的平方」，与「平方的差」不同。',
    },
    {
      id: 'sumsq',
      kind: 'alternative',
      why: 'SUMSQ(x区域)-SUMSQ(y区域) 与 SUMX2MY2 完全等价，且可读性更好。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array_x: 'A2:A5', array_y: 'B2:B5' },
    fields: [
      { key: 'array_x', label: 'x区域', type: 'ref', default: 'A2:A5', rangeKey: 'array_x' },
      { key: 'array_y', label: 'y区域', type: 'ref', default: 'B2:B5', rangeKey: 'array_y' },
    ],
    template: '=SUMX2MY2({array_x},{array_y})',
    cases: [
      { label: '默认：Σ(x²−y²)', type: 'ok', values: {}, expect: '68', note: '(9−1)+(16−4)+(25−9)+(36−4) = 8+12+16+32 = 68' },
      { label: '两区域大小不一致 → #N/A', type: 'error', values: { array_y: 'B2:B4' }, expect: '#N/A', note: 'x 区域 4 行、y 区域 3 行，长度不匹配' },
      { label: '区域含空白单元格 → #VALUE!', type: 'error', values: { array_x: 'A2:A6' }, expect: '#VALUE!', note: 'A2:A6 超出数据区，第 5 行是空白' },
      { label: '非法区域引用 → #REF!', type: 'error', values: { array_x: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default sumx2my2Entry;
