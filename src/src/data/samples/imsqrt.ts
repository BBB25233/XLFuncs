import type { FunctionEntry } from '@/types';

/** IMSQRT · 复数平方根（engineering 类 B9 批次） */

const imsqrtEntry: FunctionEntry = {
  id: 'imsqrt',
  enName: 'IMSQRT',
  zhName: '复数平方根',
  zhCommon: ['IMSQRT', '复数开方'],
  alias: ['复平方根'],
  category: 'engineering',
  abbr: 'fspfg',
  pinyin: 'fushupingfanggen',
  keywords: ['imsqrt', '复数', '平方根'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的平方根',
  summary: 'IMSQRT 返回复数的主平方根（复数）。',
  syntax: { patternCn: '=IMSQRT(复数)', patternEn: '=IMSQRT(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数平方根',
  examples: [
    {
      title: '示例 1：算 √(1+i)',
      scene: '手上只有一个复数 1+i，想看看它开方后是多少。',
      dataAnchor: 'A2',
      formula: '=IMSQRT("1+i")',
      result: '1.098684+0.45509i',
      explanation: '平方根有两个值，Excel 只返回主值（虚部符号跟着原数走），结果仍是复数文本。',
    },
    {
      title: '示例 2：极坐标开方：模开方、幅角减半',
      scene: '阻抗变换要把 5+12i 开方：模是 13、辐角 67.38°，开方后模变成 √13、辐角只剩一半。',
      dataAnchor: 'A2',
      formula: '=IMSQRT("5+12i")',
      result: '3+2i',
      explanation:
        '按「模开方、幅角减半」得 √13≈3.6056 和 33.69°，换回直角坐标正好是 3+2i（因为 (3+2i)²=5+12i），所以结果不是 3.6056 这种单个数字。对负数开方也不报错：SQRT(−4) 给 #NUM!，IMSQRT(−4) 给主值 2i。',
    },
  ],
  pitfalls: [{ title: '取主值', reason: '平方根有两值，取主值。', fix: '理解主值即可。', level: 'low' }],
  related: [{ id: 'impower', kind: 'companion', why: 'IMPOWER 与本品类相关' },
    { id: 'imexp', kind: 'companion', why: 'IMEXP 与本品类相关' },
    { id: 'imabs', kind: 'companion', why: 'IMABS 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMSQRT({n})',
    cases: [
      { label: '默认：√(1+i)', type: 'ok', values: {}, expect: '1.098684+0.45509i', note: '平方根有两个值，Excel 只返回「主值」（虚部符号与原虚部一致）。' },
      { label: '√4 就是 2', type: 'ok', values: { n: '"4"' }, expect: '2', note: '正实数退化成普通平方根。' },
      { label: '负实数开方得到纯虚数', type: 'ok', values: { n: '"-4"' }, expect: '2i', note: '这是 IMSQRT 和 SQRT 最大的区别：SQRT(-4) 会报 #NUM!，IMSQRT(-4) 给出 2i。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsqrtEntry;
