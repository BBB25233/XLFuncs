import type { FunctionEntry } from '@/types';

/** IMLOG2 · 复数二底对数（engineering 类 B9 批次） */

const imlog2Entry: FunctionEntry = {
  id: 'imlog2',
  enName: 'IMLOG2',
  zhName: '复数二底对数',
  zhCommon: ['IMLOG2', '复数log2'],
  alias: ['复二底对数'],
  category: 'engineering',
  abbr: 'fsedds',
  pinyin: 'fushuerdiduishu',
  keywords: ['imlog2', '复数', '对数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的以 2 为底对数',
  summary: 'IMLOG2 返回以 2 为底的复数对数 = IMLN/ln2。',
  syntax: { patternCn: '=IMLOG2(复数)', patternEn: '=IMLOG2(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数二底对数',
  examples: [
    {
      title: '示例 1：算 log2(1+i)',
      scene: '手上只有一个复数 1+i，想看看它的以 2 为底对数长什么样。',
      dataAnchor: 'A2',
      formula: '=IMLOG2("1+i")',
      result: '0.5+1.13309i',
      explanation: '就是 IMLN(1+i) 的实部、虚部各除以 ln2，结果仍是复数文本。',
    },
    {
      title: '示例 2：以 2 为底换算倍频程',
      scene: '滤波器衰减习惯按每倍频程说，要把同一点 3+4i 的增益换成以 2 为底的对数。',
      dataAnchor: 'A2',
      formula: '=IMLOG2("3+4i")',
      result: '2.321928+1.337804i',
      explanation:
        '实部 2.321928 就是 log2(5)，意思是模 5 相当于 2 的 2.32 次方；虚部 1.337804 是辐角 0.9273 弧度除以 ln2。对负实数取对数同样给复数主值，比如 IMLOG2("−1") 得 4.53236i。',
    },
  ],
  pitfalls: [{ title: '以 2 为底', reason: '不是自然对数。', fix: '自然对数用 IMLN。', level: 'low' }],
  related: [{ id: 'imln', kind: 'companion', why: 'IMLN 与本品类相关' },
    { id: 'imlog10', kind: 'companion', why: 'IMLOG10 与本品类相关' },
    { id: 'imexp', kind: 'companion', why: 'IMEXP 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMLOG2({n})',
    cases: [
      { label: '默认：log2(1+i)', type: 'ok', values: {}, expect: '0.5+1.13309i', note: '等于 IMLN(1+i) 的实部虚部各除以 ln2。' },
      { label: 'log2(8)=3', type: 'ok', values: { n: '"8"' }, expect: '3', note: '正实数退化成普通二进制对数。' },
      { label: 'log2(0) 无定义 → #NUM!', type: 'error', values: { n: '"0"' }, expect: '#NUM!', note: '0 没有对数，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imlog2Entry;
