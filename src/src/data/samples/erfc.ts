import type { FunctionEntry } from '@/types';

/** ERFC · 互补误差函数（engineering 类 B9 批次） */

const erfcEntry: FunctionEntry = {
  id: 'erfc',
  enName: 'ERFC',
  zhName: '互补误差函数',
  zhCommon: ['ERFC', '互补误差'],
  alias: ['余误差函数'],
  category: 'engineering',
  abbr: 'hbwchs',
  pinyin: 'hubuwuchahanshu',
  keywords: ['erfc', '误差', '互补'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算互补误差函数',
  summary: 'ERFC 返回 1-ERF(x)，当 x 大时比 ERF 更稳定。',
  syntax: { patternCn: '=ERFC(下界)', patternEn: '=ERFC(x)', args: [{ key: 'x', zh: '下界', en: 'x', required: true, desc: '积分下界' }] },
  returnValue: '互补误差函数值',
  examples: [
    { title: '示例：erfc(1)', scene: '互补误差', dataAnchor: 'A2', formula: '=ERFC(1)', result: '约 0.1573', explanation: '1-ERF(1)。' },
    {
      title: '示例 2：用 ERFC 直接算单侧 p 值',
      scene: '抽样检验要给出「大于 1.96σ 的概率」当单侧 p 值。用 ERFC 一步就能得到，不必先算累积再拿 1 去减。',
      dataTsv: 'z 值\t单侧尾部\n1.96\t？\n2\t？\n3\t？',
      dataAnchor: 'A1',
      formula: '=ERFC(A2/SQRT(2))/2',
      result: 'z=1.96 → 0.024998，z=2 → 0.02275，z=3 → 0.00135',
      explanation: 'ERFC(x)=1−ERF(x)，它给的是两侧尾部加在一起的总量，所以单侧还要再除以 2。常用的 1.96 对应 0.025、2.58 对应 0.005。这种小概率直接用 ERFC 比写 1−ERF 更稳，大 x 时不会把精度丢光。',
    },
  ],
  pitfalls: [{ title: '与 ERF 互补', reason: 'ERF+ERFC=1。', fix: '两函数互补。', level: 'low' }],
  related: [{ id: 'erf', kind: 'companion', why: 'ERF 与本品类相关' },
    { id: 'erf.precise', kind: 'companion', why: 'ERF.PRECISE 与本品类相关' },
    { id: 'erfc.precise', kind: 'companion', why: 'ERFC.PRECISE 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "lower", label: "下界", type: "number", default: "1" }
  ],
  template: "=ERFC({lower})",
  cases: [
    { label: "ERFC(1)", type: "ok", values: { lower: "1" }, expect: "0.157299", note: "erfc(1)≈0.157299" },
    { label: "ERFC(0)", type: "ok", values: { lower: "0" }, expect: "1", note: "erfc(0)=1" },
    { label: "文本 → #VALUE!", type: "error", values: { lower: "abc" }, expect: "#VALUE!", note: "非数字" },
    { label: "空 → #VALUE!", type: "error", values: { lower: "" }, expect: "#VALUE!", note: "空单元格" },
    { label: "非法数字 → #VALUE!", type: "error", values: { lower: "3.14x" }, expect: "#VALUE!", note: "非数字" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default erfcEntry;
