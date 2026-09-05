import type { FunctionEntry } from '@/types';

/** IMCSC · 复数正割（engineering 类 B9 批次） */

const imcscEntry: FunctionEntry = {
  id: 'imcsc',
  enName: 'IMCSC',
  zhName: '复数正割',
  zhCommon: ['IMCSC', '复数正割'],
  alias: ['复正割'],
  category: 'engineering',
  abbr: 'fszg',
  pinyin: 'fushuzhengge',
  keywords: ['imcsc', '复数', '正割'],
  difficulty: 4,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的正割',
  summary: 'IMCSC 返回复数的正割 = 1/sin。',
  syntax: { patternCn: '=IMCSC(复数)', patternEn: '=IMCSC(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数正割',
  examples: [{ title: '示例：正割', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMCSC("1+i")', result: 'NaN+NaNi', explanation: '1/sin 算得。' }],
  pitfalls: [{ title: '与 IMSEC 区分', reason: '正割是 1/sin、正割易混。', fix: '正割用 IMCSC、余割用 IMSEC。', level: 'low' }],
  related: [{ id: 'imsec', kind: 'companion', why: 'IMSEC 与本品类相关' },
    { id: 'imsin', kind: 'companion', why: 'IMSIN 与本品类相关' },
    { id: 'imcos', kind: 'companion', why: 'IMCOS 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMCSC({n})',
    cases: [
      { label: '默认：csc(1+i)', type: 'ok', values: {}, expect: '0.621518-0.303931i', note: 'csc = 1/sin，和 IMSIN 互为倒数。' },
      { label: 'sin 为 0 的奇点 → #NUM!', type: 'error', values: { n: '"0"' }, expect: '#NUM!', note: '0 的 sin 是 0，1/0 没有意义，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imcscEntry;
