import type { FunctionEntry } from '@/types';

/** IMCOT · 复数余切（engineering 类 B9 批次） */

const imcotEntry: FunctionEntry = {
  id: 'imcot',
  enName: 'IMCOT',
  zhName: '复数余切',
  zhCommon: ['IMCOT', '复数余切'],
  alias: ['复余切'],
  category: 'engineering',
  abbr: 'fsyq',
  pinyin: 'fushuyuqie',
  keywords: ['imcot', '复数', '余切'],
  difficulty: 4,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的余切',
  summary: 'IMCOT 返回复数的余切 = cos/sin。',
  syntax: { patternCn: '=IMCOT(复数)', patternEn: '=IMCOT(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数余切',
  examples: [
    {
      title: '示例 1：算 cot(1+i)',
      scene: '手上只有一个复数 1+i，想看看它的余切长什么样。',
      dataAnchor: 'A2',
      formula: '=IMCOT("1+i")',
      result: '0.217622-0.868014i',
      explanation: 'IMCOT 内部就是 cos/sin 相除，结果仍是带 i 后缀的复数文本。',
    },
    {
      title: '示例 2：同一段线的 cot(γl)',
      scene: '同一条传输线，这次要的是余切（求并联支节导纳时常用），γl 还是 0.5+0.5i。',
      dataAnchor: 'A2',
      formula: '=IMCOT("0.5+0.5i")',
      result: '0.83914-1.171945i',
      explanation:
        '得 0.83914−1.171945i，乘上 IMTAN 的 0.403896+0.564083i 约为 1，说明两者互为倒数。输入别落在 sin=0 的奇点上（比如 0），那种情况会报 #NUM!。',
    },
  ],
  pitfalls: [{ title: '除零情况', reason: 'sin 为 0 时无解。', fix: '避开使 sin 为 0 的输入。', level: 'low' }],
  related: [{ id: 'imtan', kind: 'companion', why: 'IMTAN 与本品类相关' },
    { id: 'imcos', kind: 'companion', why: 'IMCOS 与本品类相关' },
    { id: 'imsin', kind: 'companion', why: 'IMSIN 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMCOT({n})',
    cases: [
      { label: '默认：cot(1+i)', type: 'ok', values: {}, expect: '0.217622-0.868014i', note: 'cot = cos/sin，和 IMTAN 互为倒数。' },
      { label: 'sin 为 0 的奇点 → #NUM!', type: 'error', values: { n: '"0"' }, expect: '#NUM!', note: '0 的 sin 是 0，cot = cos/sin 相当于除以 0，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imcotEntry;
