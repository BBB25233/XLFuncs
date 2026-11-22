import type { FunctionEntry } from '@/types';

/** IMSUM · 复数求和（engineering 类 B9 批次） */

const imsumEntry: FunctionEntry = {
  id: 'imsum',
  enName: 'IMSUM',
  zhName: '复数求和',
  zhCommon: ['IMSUM', '复数加法'],
  alias: ['复加法'],
  category: 'engineering',
  abbr: 'fsqh',
  pinyin: 'fushuqiuhe',
  keywords: ['imsum', '复数', '加法'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '多个复数相加',
  summary: 'IMSUM 返回 1~255 个复数的和（实部、虚部分别相加）。',
  syntax: { patternCn: '=IMSUM(复数1, [复数2]…)', patternEn: '=IMSUM(inumber1, [inumber2]…)', args: [{ key: 'a', zh: '复数1', en: 'inumber1', required: true, desc: '复数文本' },
    { key: 'b', zh: '复数2', en: 'inumber2', required: false, desc: '复数文本' }] },
  returnValue: '复数和',
  examples: [{ title: '示例：相加', scene: '两复数相加', dataAnchor: 'A2', formula: '=IMSUM("3+4i","1+i")', result: '4+5i', explanation: '实+实、虚+虚。' },
    { title: '示例 2：三段串联阻抗相加', scene: '一条回路里串了三个元件，阻抗分别是 4+3j、6-5j、2-4j Ω，串联总阻抗等于三者相加。', dataAnchor: 'A2', formula: '=IMSUM("4+3j","6-5j","2-4j")', result: '12-6j', explanation: '实部 4+6+2=12、虚部 3−5−4=−6，得到 12-6j。三个参数必须都用 j（或都用 i），只要有一个写成 i 就整条 #VALUE!。' }],
  pitfalls: [{ title: '文本要加引号', reason: '复数常量作参数需引号。', fix: '写 "3+4i" 形式。', level: 'mid' }],
  related: [{ id: 'imsub', kind: 'companion', why: 'IMSUB 与本品类相关' },
    { id: 'improduct', kind: 'companion', why: 'IMPRODUCT 与本品类相关' },
    { id: 'imdiv', kind: 'companion', why: 'IMDIV 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'a', label: '复数 1', type: 'text', default: '"3+4i"', placeholder: '"3+4i"', hint: '第 1 个复数文本（Excel 里最多可给 255 个，这里简化为 2 个）' },
      { key: 'b', label: '复数 2', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '第 2 个复数文本，后缀要和复数 1 一致' },
    ],
    template: '=IMSUM({a},{b})',
    cases: [
      { label: '默认：(3+4i)+(1+i)', type: 'ok', values: {}, expect: '4+5i', note: '实部加实部、虚部加虚部，得到 4+5i。' },
      { label: '统一用 j 后缀', type: 'ok', values: { a: '"1+2j"', b: '"3+4j"' }, expect: '4+6j', note: '后缀统一成 j 时，结果也用 j 回显。' },
      { label: 'i 与 j 混用 → #VALUE!', type: 'error', values: { b: '"1+j"' }, expect: '#VALUE!', note: 'IMSUM 的各参数必须统一用 i 或统一用 j，混用直接 #VALUE!。' },
      { label: '第 2 个不是复数 → #NUM!', type: 'error', values: { b: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '第 1 个填 abc → #NUM!', type: 'error', values: { a: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { b: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsumEntry;
