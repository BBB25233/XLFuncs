import type { FunctionEntry } from '@/types';

/** IMCSCH · 复数双曲正割（engineering 类 B9 批次） */

const imcschEntry: FunctionEntry = {
  id: 'imcsch',
  enName: 'IMCSCH',
  zhName: '复数双曲正割',
  zhCommon: ['IMCSCH', '复数双曲正割'],
  alias: ['复双曲正割'],
  category: 'engineering',
  abbr: 'fssqzg',
  pinyin: 'fushushuangquzhengge',
  keywords: ['imcsch', '复数', '双曲正割'],
  difficulty: 4,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的双曲正割',
  summary: 'IMCSCH 返回复数的双曲正割 = 1/sinh。',
  syntax: { patternCn: '=IMCSCH(复数)', patternEn: '=IMCSCH(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数双曲正割',
  examples: [{ title: '示例：双曲正割', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMCSCH("1+i")', result: 'NaN+NaNi', explanation: '1/sinh 算得。' }],
  pitfalls: [{ title: '与 IMCSC 区分', reason: '双曲与三角别混。', fix: '双曲用 IMCSCH。', level: 'low' }],
  related: [{ id: 'imsech', kind: 'companion', why: 'IMSECH 与本品类相关' },
    { id: 'imsinh', kind: 'companion', why: 'IMSINH 与本品类相关' },
    { id: 'imcsc', kind: 'companion', why: 'IMCSC 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMCSCH({n})',
    cases: [
      { label: '默认：csch(1+i)', type: 'ok', values: {}, expect: '0.303931-0.621518i', note: 'csch = 1/sinh，和 IMSINH 互为倒数。' },
      { label: 'sinh 为 0 的奇点 → #NUM!', type: 'error', values: { n: '"0"' }, expect: '#NUM!', note: '0 的 sinh 是 0，1/0 没有意义，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imcschEntry;
