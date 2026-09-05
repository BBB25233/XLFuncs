import type { FunctionEntry } from '@/types';

/** IMSIN · 复数正弦（engineering 类 B9 批次） */

const imsinEntry: FunctionEntry = {
  id: 'imsin',
  enName: 'IMSIN',
  zhName: '复数正弦',
  zhCommon: ['IMSIN', '复数正弦'],
  alias: ['复正弦'],
  category: 'engineering',
  abbr: 'fszx',
  pinyin: 'fushuzhengxian',
  keywords: ['imsin', '复数', '正弦'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的正弦',
  summary: 'IMSIN 返回复数的正弦（结果仍是复数）。',
  syntax: { patternCn: '=IMSIN(复数)', patternEn: '=IMSIN(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数正弦',
  examples: [{ title: '示例：正弦', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMSIN("1+i")', result: 'NaN+NaNi', explanation: '按 sin 复数公式算得。' }],
  pitfalls: [{ title: '结果为复数', reason: '别当实数用。', fix: '结果是复数文本。', level: 'low' }],
  related: [{ id: 'imcos', kind: 'companion', why: 'IMCOS 与本品类相关' },
    { id: 'imsinh', kind: 'companion', why: 'IMSINH 与本品类相关' },
    { id: 'imtan', kind: 'companion', why: 'IMTAN 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMSIN({n})',
    cases: [
      { label: '默认：sin(1+i)', type: 'ok', values: {}, expect: '1.298458+0.634964i', note: 'sin(x+yi)=sin x·cosh y + i·cos x·sinh y，结果仍是复数。' },
      { label: 'sin(0) 就是 0', type: 'ok', values: { n: '"0"' }, expect: '0', note: '虚部为 0 时退化成普通实数正弦。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsinEntry;
