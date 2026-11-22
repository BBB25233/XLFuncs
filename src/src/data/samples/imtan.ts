import type { FunctionEntry } from '@/types';

/** IMTAN · 复数正切（engineering 类 B9 批次） */

const imtanEntry: FunctionEntry = {
  id: 'imtan',
  enName: 'IMTAN',
  zhName: '复数正切',
  zhCommon: ['IMTAN', '复数正切'],
  alias: ['复正切'],
  category: 'engineering',
  abbr: 'fszq',
  pinyin: 'fushuzhengqie',
  keywords: ['imtan', '复数', '正切'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的正切',
  summary: 'IMTAN 返回复数的正切 = sin/cos。',
  syntax: { patternCn: '=IMTAN(复数)', patternEn: '=IMTAN(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数正切',
  examples: [
    {
      title: '示例 1：算 tan(1+i)',
      scene: '手上只有一个复数 1+i，想看看它的正切长什么样。',
      dataAnchor: 'A2',
      formula: '=IMTAN("1+i")',
      result: '0.271753+1.083923i',
      explanation: 'IMTAN 内部就是 sin/cos 相除，结果仍是带 i 后缀的复数文本。',
    },
    {
      title: '示例 2：算传输线输入阻抗里的 tan(γl)',
      scene: '微波里用 tan(γl) 求一段线的归一化输入阻抗，电长度取 0.5+0.5i（0.5 弧度相位、0.5 衰减）。',
      dataAnchor: 'A2',
      formula: '=IMTAN("0.5+0.5i")',
      result: '0.403896+0.564083i',
      explanation:
        '得 0.403896+0.564083i，还是 a+bi 文本。它的倒数正是 IMCOT 的 0.83914−1.171945i，两者相乘约为 1，可以互相验算。',
    },
  ],
  pitfalls: [{ title: '与 IMCOT 互逆', reason: 'tan 与 cot 互为倒数。', fix: 'cot 用 IMCOT。', level: 'low' }],
  related: [{ id: 'imcot', kind: 'companion', why: 'IMCOT 与本品类相关' },
    { id: 'imsin', kind: 'companion', why: 'IMSIN 与本品类相关' },
    { id: 'imcos', kind: 'companion', why: 'IMCOS 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMTAN({n})',
    cases: [
      { label: '默认：tan(1+i)', type: 'ok', values: {}, expect: '0.271753+1.083923i', note: 'tan = sin/cos，和 IMCOT 互为倒数。' },
      { label: 'tan(0) 就是 0', type: 'ok', values: { n: '"0"' }, expect: '0', note: '虚部为 0 时退化成普通实数正切。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imtanEntry;
