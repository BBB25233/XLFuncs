import type { FunctionEntry } from '@/types';

/** IMSECH · 复数双曲余割（engineering 类 B9 批次） */

const imsechEntry: FunctionEntry = {
  id: 'imsech',
  enName: 'IMSECH',
  zhName: '复数双曲余割',
  zhCommon: ['IMSECH', '复数双曲余割'],
  alias: ['复双曲余割'],
  category: 'engineering',
  abbr: 'fssqyg',
  pinyin: 'fushushuangquyuge',
  keywords: ['imsech', '复数', '双曲余割'],
  difficulty: 4,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的双曲余割',
  summary: 'IMSECH 返回复数的双曲余割 = 1/cosh。',
  syntax: { patternCn: '=IMSECH(复数)', patternEn: '=IMSECH(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数双曲余割',
  examples: [
    {
      title: '示例 1：算 sech(1+i)',
      scene: '手上只有一个复数 1+i，想看看它的 sech（双曲余弦的倒数）长什么样。',
      dataAnchor: 'A2',
      formula: '=IMSECH("1+i")',
      result: '0.498337-0.591084i',
      explanation: '就是 1/cosh，结果仍是带 i 后缀的复数文本，虚部符号和 IMSEC 相反。',
    },
    {
      title: '示例 2：有损线上取 1/cosh',
      scene: '算反射系数要在分母上放 cosh(γl)，取它的倒数直接用 IMSECH，γl=0.8+1.2i。',
      dataAnchor: 'A2',
      formula: '=IMSECH("0.8+1.2i")',
      result: '0.526751-0.899693i',
      explanation:
        '得 0.526751−0.899693i，乘上 IMCOSH 的 0.48463+0.827749i 约为 1。它和 IMSEC（1/cos）不是同一个函数，别看到名字像就替用。',
    },
  ],
  pitfalls: [{ title: '与 IMCSCH 区分', reason: '双曲与三角别混。', fix: '双曲用 IMSECH。', level: 'low' }],
  related: [{ id: 'imcsch', kind: 'companion', why: 'IMCSCH 与本品类相关' },
    { id: 'imcosh', kind: 'companion', why: 'IMCOSH 与本品类相关' },
    { id: 'imsec', kind: 'companion', why: 'IMSEC 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMSECH({n})',
    cases: [
      { label: '默认：sech(1+i)', type: 'ok', values: {}, expect: '0.498337-0.591084i', note: 'sech = 1/cosh，和 IMCOSH 互为倒数。虚部符号与 IMSEC 相反。' },
      { label: 'sech(0) 就是 1', type: 'ok', values: { n: '"0"' }, expect: '1', note: 'cosh(0)=1，所以 1/cosh(0)=1。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsechEntry;
