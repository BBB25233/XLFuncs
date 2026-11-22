import type { FunctionEntry } from '@/types';

/** IMARGUMENT · 复数辐角（engineering 类 B9 批次） */

const imargumentEntry: FunctionEntry = {
  id: 'imargument',
  enName: 'IMARGUMENT',
  zhName: '复数辐角',
  zhCommon: ['IMARGUMENT', '辐角'],
  alias: ['复数角度'],
  category: 'engineering',
  abbr: 'fsfj',
  pinyin: 'fushufujiao',
  keywords: ['imargument', '复数', '辐角'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的辐角（弧度）',
  summary: 'IMARGUMENT 返回复数在复平面上的辐角 θ（弧度），θ = atan2(虚部, 实部)。',
  syntax: { patternCn: '=IMARGUMENT(复数)', patternEn: '=IMARGUMENT(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '辐角（弧度）',
  examples: [{ title: '示例：辐角', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMARGUMENT("1+i")', result: '约 0.785', explanation: 'atan2(1,1)=π/4≈0.785。' },
    { title: '示例 2：算阻抗的相位角', scene: '阻抗 6+8j Ω 要写进设备台账，除了模 10Ω，还要给出功率因数角，但表里只有弧度没法直接看。', dataAnchor: 'A2', formula: '=DEGREES(IMARGUMENT("6+8j"))', result: '约 53.13（度）', explanation: 'IMARGUMENT 本身返回弧度（这里约 0.927295），套一层 DEGREES 才是 53.13°。直接拿弧度当角度填，会差了 57 倍多；实部为 0 的纯虚数辐角是 ±90°。' }],
  pitfalls: [{ title: '结果是弧度', reason: '要角度需乘 180/π。', fix: '=DEGREES(IMARGUMENT(...))。', level: 'mid' }],
  related: [{ id: 'imabs', kind: 'companion', why: 'IMABS 与本品类相关' },
    { id: 'imreal', kind: 'companion', why: 'IMREAL 与本品类相关' },
    { id: 'imaginary', kind: 'companion', why: 'IMAGINARY 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMARGUMENT({n})',
    cases: [
      { label: '默认：1+i 的辐角', type: 'ok', values: {}, expect: '0.785398', note: 'atan2(1,1)=π/4≈0.785398 弧度，也就是 45°。' },
      { label: '-1 的辐角是 π', type: 'ok', values: { n: '"-1"' }, expect: '3.141593', note: '负实轴方向的辐角是 π（180°），不是 0。' },
      { label: '0 没有辐角 → #NUM!', type: 'error', values: { n: '"0"' }, expect: '#NUM!', note: '原点没有方向，atan2(0,0) 无定义，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imargumentEntry;
