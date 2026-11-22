import type { FunctionEntry } from '@/types';

/** COMPLEX · 构造复数（engineering 类 B9 批次） */

const complexEntry: FunctionEntry = {
  id: 'complex',
  enName: 'COMPLEX',
  zhName: '构造复数',
  zhCommon: ['COMPLEX', '复数'],
  alias: ['生成复数'],
  category: 'engineering',
  abbr: 'gzfs',
  pinyin: 'gouzaofushu',
  keywords: ['complex', '复数', '构造'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由实部虚部拼出复数',
  summary: 'COMPLEX 把实部与虚部组合成复数文本，可指定虚部后缀（i 或 j）。',
  syntax: { patternCn: '=COMPLEX(实部, 虚部, [后缀])', patternEn: '=COMPLEX(real, imaginary, [suffix])', args: [{ key: 'real', zh: '实部', en: 'real', required: true, desc: '实部数字' },
    { key: 'imag', zh: '虚部', en: 'imaginary', required: true, desc: '虚部数字' },
    { key: 'suffix', zh: '后缀', en: 'suffix', required: false, desc: '虚部后缀，i 或 j，默认 i' }] },
  returnValue: '复数文本（如 3+4i）',
  examples: [{ title: '示例：构造复数', scene: '实部 3、虚部 4', dataAnchor: 'A2', formula: '=COMPLEX(3,4)', result: '3+4i', explanation: '实部 3、虚部 4 → 3+4i。' },
    { title: '示例 2：把容性阻抗写成 j 后缀', scene: '电路里一个容性负载的电阻分量是 6Ω、容抗是 −8Ω，电气图习惯用 j 表示虚数单位（避开电流符号 i），要把它写成一个复数。', dataAnchor: 'A2', formula: '=COMPLEX(6,-8,"j")', result: '6-8j', explanation: '虚部填 −8 会原样带出负号；后缀一旦选了 j，后面所有复数函数都得用 j，同一张表里混用 i 和 j 会报 #VALUE!。' }],
  pitfalls: [{ title: '后缀只 i/j', reason: '后缀不是 i/j 会 #VALUE!。', fix: '后缀填 "i" 或 "j"。', level: 'mid' }],
  related: [{ id: 'imreal', kind: 'companion', why: 'IMREAL 与本品类相关' },
    { id: 'imaginary', kind: 'companion', why: 'IMAGINARY 与本品类相关' },
    { id: 'imabs', kind: 'companion', why: 'IMABS 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'real', label: '实部', type: 'number', default: '3', placeholder: '3', hint: '复数的实数部分，必须是数字' },
      { key: 'imag', label: '虚部', type: 'number', default: '4', placeholder: '4', hint: '虚部系数，只填数字，不要带 i' },
      { key: 'suffix', label: '虚部后缀', type: 'select', default: 'i', options: [{ label: 'i（数学 / 物理常用）', value: 'i' }, { label: 'j（电气工程常用）', value: 'j' }], hint: '只能是 i 或 j，留空则默认 i' },
    ],
    template: '=COMPLEX({real},{imag},"{suffix}")',
    cases: [
      { label: '默认：实部 3 + 虚部 4', type: 'ok', values: {}, expect: '3+4i', note: '实部 3、虚部 4，后缀默认 i，得到复数文本 3+4i。' },
      { label: '后缀改 j', type: 'ok', values: { suffix: 'j' }, expect: '3+4j', note: '电气工程里习惯用 j 表示虚数单位，避免和电流的 i 混淆。' },
      { label: '虚部为 0 → 只返回实数', type: 'ok', values: { real: '5', imag: '0' }, expect: '5', note: '虚部为 0 时 Excel 直接返回 "5"，不会画蛇添足写成 5+0i。' },
      { label: '后缀写成 k → #VALUE!', type: 'error', values: { suffix: 'k' }, expect: '#VALUE!', note: '第 3 参数只认 "i" 和 "j"，其它后缀（含大写 I/J 之外的字母）一律 #VALUE!。' },
      { label: '实部填文本 abc → #VALUE!', type: 'error', values: { real: 'abc' }, expect: '#VALUE!', note: '实部必须是数字；文本型数字要先用 VALUE() 转换。' },
      { label: '虚部留空 → #VALUE!', type: 'error', values: { imag: '' }, expect: '#VALUE!', note: '虚部是必填参数，空值当不成数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default complexEntry;
