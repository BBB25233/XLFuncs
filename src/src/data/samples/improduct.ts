import type { FunctionEntry } from '@/types';

/** IMPRODUCT · 复数乘积（engineering 类 B9 批次） */

const improductEntry: FunctionEntry = {
  id: 'improduct',
  enName: 'IMPRODUCT',
  zhName: '复数乘积',
  zhCommon: ['IMPRODUCT', '复数乘法'],
  alias: ['复乘法'],
  category: 'engineering',
  abbr: 'fscj',
  pinyin: 'fushuchengji',
  keywords: ['improduct', '复数', '乘法'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '多个复数相乘',
  summary: 'IMPRODUCT 返回 2~255 个复数的连乘积。',
  syntax: { patternCn: '=IMPRODUCT(复数1, [复数2]…)', patternEn: '=IMPRODUCT(inumber1, [inumber2]…)', args: [{ key: 'a', zh: '复数1', en: 'inumber1', required: true, desc: '复数文本' },
    { key: 'b', zh: '复数2', en: 'inumber2', required: false, desc: '复数文本' }] },
  returnValue: '复数乘积',
  examples: [{ title: '示例：相乘', scene: '两复数相乘', dataAnchor: 'A2', formula: '=IMPRODUCT("1+i","2+i")', result: 'NaN+NaNi', explanation: '(1+i)(2+i)=1+3i。' }],
  pitfalls: [{ title: '至少一个参数', reason: '无参数会 #VALUE!。', fix: '至少给一个复数。', level: 'low' }],
  related: [{ id: 'imdiv', kind: 'companion', why: 'IMDIV 与本品类相关' },
    { id: 'imsum', kind: 'companion', why: 'IMSUM 与本品类相关' },
    { id: 'imsub', kind: 'companion', why: 'IMSUB 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'a', label: '复数 1', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '第 1 个复数文本（Excel 里最多可给 255 个，这里简化为 2 个）' },
      { key: 'b', label: '复数 2', type: 'text', default: '"2+i"', placeholder: '"2+i"', hint: '第 2 个复数文本，后缀要和复数 1 一致' },
    ],
    template: '=IMPRODUCT({a},{b})',
    cases: [
      { label: '默认：(1+i)(2+i)', type: 'ok', values: {}, expect: '1+3i', note: '按 (a+bi)(c+di) = (ac-bd) + (ad+bc)i 展开得到 1+3i。' },
      { label: '统一用 j 后缀', type: 'ok', values: { a: '"1+2j"', b: '"3+4j"' }, expect: '-5+10j', note: '后缀统一成 j 时，结果也用 j 回显。' },
      { label: 'i 与 j 混用 → #VALUE!', type: 'error', values: { b: '"2+j"' }, expect: '#VALUE!', note: 'IMPRODUCT 的各参数必须统一用 i 或统一用 j，混用直接 #VALUE!。' },
      { label: '第 2 个不是复数 → #NUM!', type: 'error', values: { b: '"2+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '第 1 个填 abc → #NUM!', type: 'error', values: { a: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { b: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default improductEntry;
