import type { FunctionEntry } from '@/types';

/** IMEXP · 复数指数（engineering 类 B9 批次） */

const imexpEntry: FunctionEntry = {
  id: 'imexp',
  enName: 'IMEXP',
  zhName: '复数指数',
  zhCommon: ['IMEXP', '复数指数'],
  alias: ['复指数'],
  category: 'engineering',
  abbr: 'fszs',
  pinyin: 'fushuzhishu',
  keywords: ['imexp', '复数', '指数'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的自然指数',
  summary: 'IMEXP 返回 e 的复数次幂（欧拉公式）。',
  syntax: { patternCn: '=IMEXP(复数)', patternEn: '=IMEXP(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数指数',
  examples: [{ title: '示例：指数', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMEXP("1+i")', result: '1.468694+2.287355i', explanation: 'e^(1+i) 算得。' },
    { title: '示例 2：阻尼振荡的复指数因子', scene: '一个衰减振荡信号的复指数因子是 e^(−0.2+2j)（衰减率 0.2、角频率 2 rad/s），要算 t=1s 时的值。', dataAnchor: 'A2', formula: '=IMEXP("-0.2+2j")', result: '约 -0.340712+0.74447j', explanation: '欧拉公式 e^(a+bj)=e^a(cos b+j·sin b)：e^−0.2≈0.8187 是包络幅度，cos2≈−0.4161、sin2≈0.9093 决定相位。实部变成负数说明这一时刻已转过 90° 以上，不代表衰减为负。' }],
  pitfalls: [{ title: '结果为复数', reason: '不是实数。', fix: '结果按复数读。', level: 'low' }],
  related: [{ id: 'imln', kind: 'companion', why: 'IMLN 与本品类相关' },
    { id: 'impower', kind: 'companion', why: 'IMPOWER 与本品类相关' },
    { id: 'imsqrt', kind: 'companion', why: 'IMSQRT 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMEXP({n})',
    cases: [
      { label: '默认：e^(1+i)', type: 'ok', values: {}, expect: '1.468694+2.287355i', note: 'e^(x+yi)=e^x·(cos y + i·sin y)，这就是欧拉公式。' },
      { label: 'e^0 就是 1', type: 'ok', values: { n: '"0"' }, expect: '1', note: '退化成实数情形。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imexpEntry;
