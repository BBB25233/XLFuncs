import type { FunctionEntry } from '@/types';

/** IMSINH · 复数双曲正弦（engineering 类 B9 批次） */

const imsinhEntry: FunctionEntry = {
  id: 'imsinh',
  enName: 'IMSINH',
  zhName: '复数双曲正弦',
  zhCommon: ['IMSINH', '复数双曲正弦'],
  alias: ['复双曲正弦'],
  category: 'engineering',
  abbr: 'fssqzx',
  pinyin: 'fushushuangquzhengxian',
  keywords: ['imsinh', '复数', '双曲正弦'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的双曲正弦',
  summary: 'IMSINH 返回复数的双曲正弦。',
  syntax: { patternCn: '=IMSINH(复数)', patternEn: '=IMSINH(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数双曲正弦',
  examples: [{ title: '示例：双曲正弦', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMSINH("1+i")', result: 'NaN+NaNi', explanation: '按 sinh 复数公式算得。' }],
  pitfalls: [{ title: '与 IMSIN 区分', reason: '双曲与三角别混。', fix: '双曲用 IMSINH。', level: 'low' }],
  related: [{ id: 'imsin', kind: 'companion', why: 'IMSIN 与本品类相关' },
    { id: 'imcosh', kind: 'companion', why: 'IMCOSH 与本品类相关' },
    { id: 'imsech', kind: 'companion', why: 'IMSECH 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMSINH({n})',
    cases: [
      { label: '默认：sinh(1+i)', type: 'ok', values: {}, expect: '0.634964+1.298458i', note: 'sinh(x+yi)=sinh x·cos y + i·cosh x·sin y。实部虚部正好和 IMSIN 对调。' },
      { label: 'sinh(0) 就是 0', type: 'ok', values: { n: '"0"' }, expect: '0', note: '虚部为 0 时退化成普通实数双曲正弦。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsinhEntry;
