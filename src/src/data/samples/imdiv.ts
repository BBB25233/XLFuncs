import type { FunctionEntry } from '@/types';

/** IMDIV · 复数相除（engineering 类 B9 批次） */

const imdivEntry: FunctionEntry = {
  id: 'imdiv',
  enName: 'IMDIV',
  zhName: '复数相除',
  zhCommon: ['IMDIV', '复数除法'],
  alias: ['复除法'],
  category: 'engineering',
  abbr: 'fsxc',
  pinyin: 'fushuxiangchu',
  keywords: ['imdiv', '复数', '除法'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '两个复数相除',
  summary: 'IMDIV 返回两个复数的商（复数）。',
  syntax: { patternCn: '=IMDIV(被除数, 除数)', patternEn: '=IMDIV(inumber1, inumber2)', args: [{ key: 'a', zh: '被除数', en: 'inumber1', required: true, desc: '复数文本' },
    { key: 'b', zh: '除数', en: 'inumber2', required: true, desc: '复数文本' }] },
  returnValue: '复数商',
  examples: [{ title: '示例：相除', scene: '复数相除', dataAnchor: 'A2', formula: '=IMDIV("3+4i","1+i")', result: '3.5+0.5i', explanation: '按复数除法公式算得。' },
    { title: '示例 2：由电压电流反算阻抗', scene: '测得某负载两端电压 220V（相量 220+0j）、电流 44-33j A，按 Z=U/I 反算阻抗，再做温升核算。', dataAnchor: 'A2', formula: '=IMDIV("220","44-33j")', result: '3.2+2.4j（Ω）', explanation: '分子分母同乘分母共轭 (44+33j)：实部 9680/3025=3.2、虚部 7260/3025=2.4。分母的实部虚部不能同时为 0，否则直接 #NUM!；分子是纯实数 220、没写后缀，所以不会触发「i 和 j 混用」的 #VALUE!。' }],
  pitfalls: [{ title: '除数非零', reason: '除零会 #NUM!。', fix: '除数不能为 0。', level: 'mid' }],
  related: [{ id: 'improduct', kind: 'companion', why: 'IMPRODUCT 与本品类相关' },
    { id: 'imsum', kind: 'companion', why: 'IMSUM 与本品类相关' },
    { id: 'imsub', kind: 'companion', why: 'IMSUB 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'a', label: '被除数', type: 'text', default: '"3+4i"', placeholder: '"3+4i"', hint: '作为分子的复数文本' },
      { key: 'b', label: '除数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '作为分母的复数文本，不能是 0' },
    ],
    template: '=IMDIV({a},{b})',
    cases: [
      { label: '默认：(3+4i)÷(1+i)', type: 'ok', values: {}, expect: '3.5+0.5i', note: '分子分母同乘共轭 (1-i) 后化简得到 3.5+0.5i。' },
      { label: '两个实数相除', type: 'ok', values: { a: '"1"', b: '"2"' }, expect: '0.5', note: '没有虚部时就是普通除法。' },
      { label: '除数为 0 → #NUM!', type: 'error', values: { b: '"0"' }, expect: '#NUM!', note: '除数实部虚部都是 0，复数除法没法做。' },
      { label: 'i 与 j 混用 → #VALUE!', type: 'error', values: { b: '"1+j"' }, expect: '#VALUE!', note: 'IMDIV 的两个参数必须统一用 i 或统一用 j。' },
      { label: '除数写得不是复数 → #NUM!', type: 'error', values: { b: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '被除数留空 → #NUM!', type: 'error', values: { a: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imdivEntry;
