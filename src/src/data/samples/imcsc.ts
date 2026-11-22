import type { FunctionEntry } from '@/types';

/** IMCSC · 复数正割（engineering 类 B9 批次） */

const imcscEntry: FunctionEntry = {
  id: 'imcsc',
  enName: 'IMCSC',
  zhName: '复数余割',
  zhCommon: ['IMCSC', '复数余割'],
  alias: ['复余割'],
  category: 'engineering',
  abbr: 'fsyg',
  pinyin: 'fushuyuge',
  keywords: ['imcsc', '复数', '余割'],
  difficulty: 4,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的正割',
  summary: 'IMCSC 返回复数的正割 = 1/sin。',
  syntax: { patternCn: '=IMCSC(复数)', patternEn: '=IMCSC(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数正割',
  examples: [
    {
      title: '示例 1：算 csc(1+i)',
      scene: '手上只有一个复数 1+i，想看看它的 csc（正弦的倒数）长什么样。',
      dataAnchor: 'A2',
      formula: '=IMCSC("1+i")',
      result: '0.621518-0.303931i',
      explanation: '就是 1/sin，结果仍是带 i 后缀的复数文本。',
    },
    {
      title: '示例 2：同一路信号取 1/sin',
      scene: '滤波器极点计算里要用到正弦的倒数，输入沿用那一路 2+0.5i（相位 2 弧度、衰减 0.5）。',
      dataAnchor: 'A2',
      formula: '=IMCSC("2+0.5i")',
      result: '0.933524+0.197432i',
      explanation:
        '得 0.933524+0.197432i，乘上 IMSIN 的 1.025347−0.216852i 约为 1。输入若让 sin 为 0（比如 0）会报 #NUM!，别拿它硬算。',
    },
  ],
  pitfalls: [{ title: '与 IMSEC 区分', reason: '余割是 1/sin，正割是 1/cos，两者最容易记反。', fix: '余割用 IMCSC，正割用 IMSEC。', level: 'low' }],
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
