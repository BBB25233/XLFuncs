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
  examples: [
    {
      title: '示例 1：算 cosh(1+i)',
      scene: '手上只有一个复数 1+i，想看看它的双曲余弦长什么样。',
      dataAnchor: 'A2',
      formula: '=IMCOSH("1+i")',
      result: '0.83373+0.988898i',
      explanation: '按 cosh(x+yi)=cosh x·cos y+i·sinh x·sin y 算得，虚部符号和 IMCOS 正好相反。',
    },
    {
      title: '示例 2：算有损传输线的双曲余弦',
      scene: '有损线用 γl=0.8+1.2i 描述（0.8 奈培衰减、1.2 弧度相移），cosh(γl) 是拼输入阻抗的一半。',
      dataAnchor: 'A2',
      formula: '=IMCOSH("0.8+1.2i")',
      result: '0.48463+0.827749i',
      explanation:
        '实部 0.48463、虚部 0.827749，结果仍是复数文本。它和 IMSINH 的 0.321812+1.246542i 是同一组「cosh / sinh」，双曲和三角别混。',
    },
  ],
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
