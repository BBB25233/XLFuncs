import type { FunctionEntry } from '@/types';

/** IMSUB · 复数相减（engineering 类 B9 批次） */

const imsubEntry: FunctionEntry = {
  id: 'imsub',
  enName: 'IMSUB',
  zhName: '复数相减',
  zhCommon: ['IMSUB', '复数减法'],
  alias: ['复减法'],
  category: 'engineering',
  abbr: 'fsxj',
  pinyin: 'fushuxiangjian',
  keywords: ['imsub', '复数', '减法'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '两个复数相减',
  summary: 'IMSUB 返回两个复数的差（复数）。',
  syntax: { patternCn: '=IMSUB(被减, 减)', patternEn: '=IMSUB(inumber1, inumber2)', args: [{ key: 'a', zh: '被减', en: 'inumber1', required: true, desc: '复数文本' },
    { key: 'b', zh: '减', en: 'inumber2', required: true, desc: '复数文本' }] },
  returnValue: '复数差',
  examples: [{ title: '示例：相减', scene: '两复数相减', dataAnchor: 'A2', formula: '=IMSUB("3+4i","1+i")', result: '2+3i', explanation: '实部虚部分别相减。' },
    { title: '示例 2：两端电压相量求电压降', scene: '回路里 A 点电压是 12+5j V、B 点是 7+2j V，要算 A 到 B 的电压降（A 减 B），单位 V。', dataAnchor: 'A2', formula: '=IMSUB("12+5j","7+2j")', result: '5+3j', explanation: '实部 12−7=5、虚部 5−2=3，得 5+3j。顺序一反就变成 −5−3j，相位差 180°，所以「谁减谁」一定要按物理方向来。' }],
  pitfalls: [{ title: '顺序别反', reason: '被减与减顺序错结果取反。', fix: '注意第 1 减第 2。', level: 'low' }],
  related: [{ id: 'imsum', kind: 'companion', why: 'IMSUM 与本品类相关' },
    { id: 'imdiv', kind: 'companion', why: 'IMDIV 与本品类相关' },
    { id: 'improduct', kind: 'companion', why: 'IMPRODUCT 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'a', label: '被减数', type: 'text', default: '"3+4i"', placeholder: '"3+4i"', hint: '第 1 个复数文本（减号左边）' },
      { key: 'b', label: '减数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '第 2 个复数文本（减号右边），后缀要和被减数一致' },
    ],
    template: '=IMSUB({a},{b})',
    cases: [
      { label: '默认：(3+4i)-(1+i)', type: 'ok', values: {}, expect: '2+3i', note: '实部相减得 2、虚部相减得 3，结果 2+3i。' },
      { label: '两个实数相减', type: 'ok', values: { a: '"5"', b: '"2"' }, expect: '3', note: '没有虚部时就是普通减法。' },
      { label: 'i 与 j 混用 → #VALUE!', type: 'error', values: { b: '"1+j"' }, expect: '#VALUE!', note: 'IMSUB 的两个参数必须统一用 i 或统一用 j。' },
      { label: '减数不是复数 → #NUM!', type: 'error', values: { b: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '被减数填 abc → #NUM!', type: 'error', values: { a: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '减数留空 → #NUM!', type: 'error', values: { b: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsubEntry;
