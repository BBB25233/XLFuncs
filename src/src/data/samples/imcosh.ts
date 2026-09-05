import type { FunctionEntry } from '@/types';

/** IMCOSH · 复数双曲余弦（engineering 类 B9 批次） */

const imcoshEntry: FunctionEntry = {
  id: 'imcosh',
  enName: 'IMCOSH',
  zhName: '复数双曲余弦',
  zhCommon: ['IMCOSH', '复数双曲余弦'],
  alias: ['复双曲余弦'],
  category: 'engineering',
  abbr: 'fssqyx',
  pinyin: 'fushushuangquyuxian',
  keywords: ['imcosh', '复数', '双曲余弦'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的双曲余弦',
  summary: 'IMCOSH 返回复数的双曲余弦。',
  syntax: { patternCn: '=IMCOSH(复数)', patternEn: '=IMCOSH(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数双曲余弦',
  examples: [{ title: '示例：双曲余弦', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMCOSH("1+i")', result: 'NaN+NaNi', explanation: '按 cosh 复数公式算得。' }],
  pitfalls: [{ title: '与 IMCOS 区分', reason: '双曲与三角别混。', fix: '双曲用 IMCOSH。', level: 'low' }],
  related: [{ id: 'imcos', kind: 'companion', why: 'IMCOS 与本品类相关' },
    { id: 'imsinh', kind: 'companion', why: 'IMSINH 与本品类相关' },
    { id: 'imsech', kind: 'companion', why: 'IMSECH 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMCOSH({n})',
    cases: [
      { label: '默认：cosh(1+i)', type: 'ok', values: {}, expect: '0.83373+0.988898i', note: 'cosh(x+yi)=cosh·cos y + i·sinh·sin y。注意虚部符号和 IMCOS 相反。' },
      { label: 'cosh(0) 就是 1', type: 'ok', values: { n: '"0"' }, expect: '1', note: '虚部为 0 时退化成普通实数双曲余弦。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imcoshEntry;
