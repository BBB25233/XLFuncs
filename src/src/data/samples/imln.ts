import type { FunctionEntry } from '@/types';

/** IMLN · 复数自然对数（engineering 类 B9 批次） */

const imlnEntry: FunctionEntry = {
  id: 'imln',
  enName: 'IMLN',
  zhName: '复数自然对数',
  zhCommon: ['IMLN', '复数对数'],
  alias: ['复对数'],
  category: 'engineering',
  abbr: 'fszrds',
  pinyin: 'fushuziranduishu',
  keywords: ['imln', '复数', '对数'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的自然对数',
  summary: 'IMLN 返回复数的自然对数（多值取主值）。',
  syntax: { patternCn: '=IMLN(复数)', patternEn: '=IMLN(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数对数',
  examples: [{ title: '示例：对数', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMLN("1+i")', result: '0.346574+0.785398i', explanation: 'ln|z|+i·arg(z) 算得。' },
    { title: '示例 2：把阻抗换成极坐标（对数形式）', scene: '阻抗 3+4j Ω 要送进按极坐标建模的仿真软件，需要「模的自然对数 + 相位」这种形式，正好就是 IMLN 的实部与虚部。', dataAnchor: 'A2', formula: '=IMLN("3+4j")', result: '1.609438+0.927295j', explanation: '实部 ln|z|=ln5≈1.609438、虚部是辐角 0.927295 rad；套 EXP 回去就是原阻抗。注意对数在复平面上是多值的（相位可加 2πk），Excel 只返回虚部落在 −π~π 的主值。' }],
  pitfalls: [{ title: '主值分支', reason: '对数多值，取主值。', fix: '理解主值即可。', level: 'low' }],
  related: [{ id: 'imexp', kind: 'companion', why: 'IMEXP 与本品类相关' },
    { id: 'imlog10', kind: 'companion', why: 'IMLOG10 与本品类相关' },
    { id: 'imlog2', kind: 'companion', why: 'IMLOG2 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMLN({n})',
    cases: [
      { label: '默认：ln(1+i)', type: 'ok', values: {}, expect: '0.346574+0.785398i', note: 'ln z = ln|z| + i·arg(z)，虚部正好是这个复数的辐角。' },
      { label: 'ln(8) 是实数', type: 'ok', values: { n: '"8"' }, expect: '2.079442', note: '正实数的对数是实数，虚部为 0 时不显示 i。' },
      { label: 'ln(0) 无定义 → #NUM!', type: 'error', values: { n: '"0"' }, expect: '#NUM!', note: '0 没有对数，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imlnEntry;
