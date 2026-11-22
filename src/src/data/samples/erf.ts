import type { FunctionEntry } from '@/types';

/** ERF · 误差函数（engineering 类 B9 批次） */

const erfEntry: FunctionEntry = {
  id: 'erf',
  enName: 'ERF',
  zhName: '误差函数',
  zhCommon: ['ERF', '误差函数'],
  alias: ['高斯误差'],
  category: 'engineering',
  abbr: 'wchs',
  pinyin: 'wuchahanshu',
  keywords: ['erf', '误差', '积分'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算误差函数 erf(x)',
  summary: 'ERF 返回误差函数 ∫₀ˣ (2/√π)e^(-t²)dt，统计与概率里常用。',
  syntax: { patternCn: '=ERF(下界, [上界])', patternEn: '=ERF(lower_limit, [upper_limit])', args: [{ key: 'lower', zh: '下界', en: 'lower_limit', required: true, desc: '积分下界（默认从 0）' },
    { key: 'upper', zh: '上界', en: 'upper_limit', required: false, desc: '积分上界' }] },
  returnValue: '误差函数值',
  examples: [
    { title: '示例：erf(1)', scene: '标准误差函数', dataAnchor: 'A2', formula: '=ERF(1)', result: '约 0.8427', explanation: 'erf(1) 的常用近似值。' },
    {
      title: '示例 2：±1.96σ 覆盖 95% 就是它算出来的',
      scene: '做正态分布的质量控制时，常说「±1.96σ 覆盖 95%」。这个 0.95 不是查表得来的，用 ERF 一步就能算。',
      dataTsv: 'z 值\t区间\n1.96\t±1.96σ\n2\t±2σ\n3\t±3σ',
      dataAnchor: 'A1',
      formula: '=ERF(A2/SQRT(2))',
      result: '±1.96σ → 0.950004，±2σ → 0.9545，±3σ → 0.9973',
      explanation: '标准正态的累积概率 Φ(z)=0.5×(1+erf(z/√2))，两边一减，区间概率 P(−z<Z<z) 正好等于 erf(z/√2)，所以这里不用再乘 2。老版 ERF 还能写两个参数直接给区间，如 ERF(-1.3859,1.3859)，ERF.PRECISE 就只能写一个。',
    },
  ],
  pitfalls: [{ title: '与 ERFC 关系', reason: 'ERF(x)+ERFC(x)=1。', fix: '余误差用 ERFC。', level: 'low' }],
  related: [{ id: 'erfc', kind: 'companion', why: 'ERFC 与本品类相关' },
    { id: 'erf.precise', kind: 'companion', why: 'ERF.PRECISE 与本品类相关' },
    { id: 'erfc.precise', kind: 'companion', why: 'ERFC.PRECISE 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "lower", label: "下界", type: "number", default: "1" }
  ],
  template: "=ERF({lower})",
  cases: [
    { label: "ERF(1)", type: "ok", values: { lower: "1" }, expect: "0.842701", note: "erf(1)≈0.842701" },
    { label: "ERF(0)", type: "ok", values: { lower: "0" }, expect: "0", note: "erf(0)=0" },
    { label: "文本 → #VALUE!", type: "error", values: { lower: "abc" }, expect: "#VALUE!", note: "非数字" },
    { label: "空 → #VALUE!", type: "error", values: { lower: "" }, expect: "#VALUE!", note: "空单元格" },
    { label: "非法数字 → #VALUE!", type: "error", values: { lower: "3.14x" }, expect: "#VALUE!", note: "非数字" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default erfEntry;
