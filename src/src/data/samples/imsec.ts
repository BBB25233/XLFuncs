import type { FunctionEntry } from '@/types';

/** IMSEC · 复数余割（engineering 类 B9 批次） */

const imsecEntry: FunctionEntry = {
  id: 'imsec',
  enName: 'IMSEC',
  zhName: '复数正割',
  zhCommon: ['IMSEC', '复数正割'],
  alias: ['复正割'],
  category: 'engineering',
  abbr: 'fszg',
  pinyin: 'fushuzhengge',
  keywords: ['imsec', '复数', '正割'],
  difficulty: 4,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的余割',
  summary: 'IMSEC 返回复数的余割 = 1/cos。',
  syntax: { patternCn: '=IMSEC(复数)', patternEn: '=IMSEC(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数余割',
  examples: [
    {
      title: '示例 1：算 sec(1+i)',
      scene: '手上只有一个复数 1+i，想看看它的 sec（余弦的倒数）长什么样。',
      dataAnchor: 'A2',
      formula: '=IMSEC("1+i")',
      result: '0.498337+0.591084i',
      explanation: '就是 1/cos，结果仍是带 i 后缀的复数文本。',
    },
    {
      title: '示例 2：把余弦结果倒过来做归一化',
      scene: '已经算出 cos(2+0.5i)=−0.469258−0.473831i，做阻抗归一化要的正好是它的倒数。',
      dataAnchor: 'A2',
      formula: '=IMSEC("2+0.5i")',
      result: '-1.05518+1.065462i',
      explanation:
        '得 −1.05518+1.065462i，乘上 IMCOS 的 −0.469258−0.473831i 约为 1。结果依旧是复数文本，别和 IMCSC（1/sin）混着用。',
    },
  ],
  pitfalls: [{ title: '与 IMCSC 区分', reason: '正割是 1/cos，余割是 1/sin。', fix: '正割用 IMSEC，余割用 IMCSC。', level: 'low' }],
  related: [{ id: 'imcsc', kind: 'companion', why: 'IMCSC 与本品类相关' },
    { id: 'imcos', kind: 'companion', why: 'IMCOS 与本品类相关' },
    { id: 'imsech', kind: 'companion', why: 'IMSECH 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMSEC({n})',
    cases: [
      { label: '默认：sec(1+i)', type: 'ok', values: {}, expect: '0.498337+0.591084i', note: 'sec = 1/cos，和 IMCOS 互为倒数。别和 IMCSC（1/sin）搞混。' },
      { label: 'sec(0) 就是 1', type: 'ok', values: { n: '"0"' }, expect: '1', note: 'cos(0)=1，所以 1/cos(0)=1。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsecEntry;
