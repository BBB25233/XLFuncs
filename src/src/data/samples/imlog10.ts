import type { FunctionEntry } from '@/types';

/** IMLOG10 · 复数常用对数（engineering 类 B9 批次） */

const imlog10Entry: FunctionEntry = {
  id: 'imlog10',
  enName: 'IMLOG10',
  zhName: '复数常用对数',
  zhCommon: ['IMLOG10', '复数lg'],
  alias: ['复常用对数'],
  category: 'engineering',
  abbr: 'fscyds',
  pinyin: 'fushuchangyongduishu',
  keywords: ['imlog10', '复数', '对数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的常用对数',
  summary: 'IMLOG10 返回以 10 为底的复数对数 = IMLN/ln10。',
  syntax: { patternCn: '=IMLOG10(复数)', patternEn: '=IMLOG10(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数常用对数',
  examples: [{ title: '示例：常用对数', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMLOG10("1+i")', result: 'NaN+NaNi', explanation: 'IMLN 除以 ln10。' }],
  pitfalls: [{ title: '以 10 为底', reason: '不是自然对数。', fix: '自然对数用 IMLN。', level: 'low' }],
  related: [{ id: 'imln', kind: 'companion', why: 'IMLN 与本品类相关' },
    { id: 'imlog2', kind: 'companion', why: 'IMLOG2 与本品类相关' },
    { id: 'imexp', kind: 'companion', why: 'IMEXP 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMLOG10({n})',
    cases: [
      { label: '默认：log10(1+i)', type: 'ok', values: {}, expect: '0.150515+0.341094i', note: '等于 IMLN(1+i) 的实部虚部各除以 ln10。' },
      { label: 'log10(1000)=3', type: 'ok', values: { n: '"1000"' }, expect: '3', note: '正实数退化成普通常用对数。' },
      { label: 'log10(0) 无定义 → #NUM!', type: 'error', values: { n: '"0"' }, expect: '#NUM!', note: '0 没有对数，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imlog10Entry;
