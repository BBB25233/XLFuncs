import type { FunctionEntry } from '@/types';

/** IMCOS · 复数余弦（engineering 类 B9 批次） */

const imcosEntry: FunctionEntry = {
  id: 'imcos',
  enName: 'IMCOS',
  zhName: '复数余弦',
  zhCommon: ['IMCOS', '复数余弦'],
  alias: ['复余弦'],
  category: 'engineering',
  abbr: 'fsyx',
  pinyin: 'fushuyuxian',
  keywords: ['imcos', '复数', '余弦'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的余弦',
  summary: 'IMCOS 返回复数的余弦（结果仍是复数）。',
  syntax: { patternCn: '=IMCOS(复数)', patternEn: '=IMCOS(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数余弦',
  examples: [{ title: '示例：余弦', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMCOS("1+i")', result: 'NaN+NaNi', explanation: '按 cos 复数公式算得。' }],
  pitfalls: [{ title: '结果为复数', reason: '别当实数用。', fix: '结果是复数文本。', level: 'low' }],
  related: [{ id: 'imsin', kind: 'companion', why: 'IMSIN 与本品类相关' },
    { id: 'imcosh', kind: 'companion', why: 'IMCOSH 与本品类相关' },
    { id: 'imcot', kind: 'companion', why: 'IMCOT 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMCOS({n})',
    cases: [
      { label: '默认：cos(1+i)', type: 'ok', values: {}, expect: '0.83373-0.988898i', note: 'cos(x+yi)=cos·cosh - i·sin·sinh，结果仍是复数。' },
      { label: 'cos(0) 就是 1', type: 'ok', values: { n: '"0"' }, expect: '1', note: '虚部为 0 时退化成普通实数余弦，Excel 直接返回 "1"。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imcosEntry;
