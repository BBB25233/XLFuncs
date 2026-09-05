import type { FunctionEntry } from '@/types';

/** SUMX2PY2 · 两数组平方和之和（math 类 B2 批次） */

const TSV = 'x\ty\n3\t1\n4\t2\n5\t3\n6\t2';

const sumx2py2Entry: FunctionEntry = {
  id: 'sumx2py2',
  enName: 'SUMX2PY2',
  zhName: '平方和之和',
  zhCommon: ['平方和之和', 'SUMX2PY2', '两列平方和'],
  alias: ['x方加y方求和', '平方相加求和', '数组平方和'],
  category: 'math',
  abbr: 'pfhzh',
  pinyin: 'pingfanghezhihe',
  keywords: ['SUMX2PY2', '平方和', '数组运算', '两列合并', '回归计算'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '统计与回归计算中的专用函数，日常办公极少使用。',
  },
  oneLiner: '两列数各自平方后相加，再把和全部加起来',
  summary:
    'SUMX2PY2(x区域, y区域) = Σ(x² + y²)，即「各自平方 → 逐行相加 → 再求和」。它等价于 SUMSQ(x区域) + SUMSQ(y区域)，是同族三个函数里最容易理解的一个，也最容易被更直观的 SUMSQ 组合替代。',
  syntax: {
    patternCn: '=SUMX2PY2(x区域, y区域)',
    patternEn: '=SUMX2PY2(array_x, array_y)',
    args: [
      {
        key: 'array_x',
        zh: 'x区域',
        en: 'array_x',
        required: true,
        desc: '第一组数值所在的区域。',
        accepts: '单元格区域，如 A2:A5。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '两个区域必须等长，否则报 #N/A。',
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
        tip: '行数必须与 x 区域相同。',
        example: 'B2:B5',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回 Σ(x² + y²) 的结果；两区域大小不一致时返回 #N/A。',
  examples: [
    {
      title: '示例 1：基本计算（手算验证）',
      scene: '两组数各 4 行，算平方和之和。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMX2PY2(A2:A5,B2:B5)',
      result: '(9+1)+(16+4)+(25+9)+(36+4) = 10+20+34+40 = 104',
      explanation: '逐行算 x²+y² 再全部相加。也可验证为 SUMSQ(A)+SUMSQ(B) = 86+18 = 104。',
    },
    {
      title: '示例 2：用 SUMSQ 相加替代',
      scene: '用更直观的写法得到同样结果。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMSQ(A2:A5)+SUMSQ(B2:B5)',
      result: '86 + 18 = 104（与 SUMX2PY2 一致）',
      explanation: '因为 Σ(x²+y²) = Σx² + Σy²，两个 SUMSQ 相加即可，可读性远好于原函数。',
    },
    {
      title: '示例 3：区域长度不一致时报错',
      scene: 'x 区域 4 行、y 区域 3 行。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMX2PY2(A2:A5,B2:B4)',
      result: '#N/A（长度不匹配）',
      explanation: '必须严格等长，这是数组类函数的统一要求。',
    },
  ],
  pitfalls: [
    {
      title: '两个区域大小不一致',
      reason: '逐元素运算要求长度相同。',
      fix: '核对两个区域的起止行，确保行数一致。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '与 SUMX2MY2 搞混（M 与 P）',
      reason: '名字只差中间的字母：M 是 Minus（相减）、P 是 Plus（相加）。看错一个字母结果就完全不同。',
      fix: '记住 M=减、P=加；或直接用 SUMSQ 相加/相减，避免记混。',
      level: 'high',
    },
    {
      title: '区域里混入文本',
      reason: '文本无法平方。',
      fix: '清理数据后再算。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'sumx2my2',
      kind: 'confusable',
      why: '同族函数，算的是 Σ(x²−y²)（相减）。名字只差 M/P 一个字母，务必分清。',
    },
    {
      id: 'sumxmy2',
      kind: 'confusable',
      why: '同族函数，算的是 Σ(x−y)²（先减再平方）。',
    },
    {
      id: 'sumsq',
      kind: 'alternative',
      why: 'SUMSQ(x)+SUMSQ(y) 与 SUMX2PY2 完全等价，更好读。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array_x: 'A2:A5', array_y: 'B2:B5' },
    fields: [
      { key: 'array_x', label: 'x区域', type: 'ref', default: 'A2:A5', rangeKey: 'array_x' },
      { key: 'array_y', label: 'y区域', type: 'ref', default: 'B2:B5', rangeKey: 'array_y' },
    ],
    template: '=SUMX2PY2({array_x},{array_y})',
    cases: [
      { label: '默认：Σ(x²+y²)', type: 'ok', values: {}, expect: '104', note: '(9+1)+(16+4)+(25+9)+(36+4) = 10+20+34+40 = 104' },
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

export default sumx2py2Entry;
