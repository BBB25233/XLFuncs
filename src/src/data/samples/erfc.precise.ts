import type { FunctionEntry } from '@/types';

/** ERFC.PRECISE · 精确互补误差（engineering 类 B9 批次） */

const erfcpreciseEntry: FunctionEntry = {
  id: 'erfc.precise',
  enName: 'ERFC.PRECISE',
  zhName: '精确互补误差',
  zhCommon: ['ERFC.PRECISE', '精确互补误差'],
  alias: ['精确erfc'],
  category: 'engineering',
  abbr: 'jqhbwc',
  pinyin: 'jingquehubuwucha',
  keywords: ['erfc.precise', '误差', '精确'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: '2010', label: '需 Excel 2010 及以上' },
  oneLiner: '精确版互补误差函数',
  summary: 'ERFC.PRECISE 是 ERFC 的高精度版本。',
  syntax: { patternCn: '=ERFC.PRECISE(下界)', patternEn: '=ERFC.PRECISE(x)', args: [{ key: 'x', zh: '下界', en: 'x', required: true, desc: '积分下界' }] },
  returnValue: '互补误差函数值',
  examples: [
    { title: '示例：精确 erfc', scene: '互补误差', dataAnchor: 'A2', formula: '=ERFC.PRECISE(1)', result: '约 0.1573', explanation: '与 ERFC 同值、精度更高。' },
    {
      title: '示例 2：3σ 之外的异常率只剩 0.27%',
      scene: '质量报告要写「按 3σ 控制线，正常波动之外的异常率是多少」。这个数就是 ERFC.PRECISE 直接给的。',
      dataTsv: 'σ 倍数\t异常率\n2\t？\n3\t？\n4\t？',
      dataAnchor: 'A1',
      formula: '=ERFC.PRECISE(A2/SQRT(2))',
      result: '2σ 之外 → 0.0455，3σ 之外 → 0.0027，4σ 之外 → 0.000063',
      explanation: 'ERFC.PRECISE 算的是两侧尾部加起来的总量，所以不用像 ERFC 那样再除以 2。2σ 之外还有 4.55%，到 3σ 就只剩 0.27%、4σ 只剩 0.0063%，收紧一档成本高很多，六西格玛追求的 3.4ppm 大约对应 4.5σ。',
    },
  ],
  pitfalls: [{ title: '需 2010+', reason: '旧版 Excel 无此函数。', fix: '旧版用 ERFC。', level: 'low' }],
  related: [{ id: 'erfc', kind: 'companion', why: 'ERFC 与本品类相关' },
    { id: 'erf', kind: 'companion', why: 'ERF 与本品类相关' },
    { id: 'erf.precise', kind: 'companion', why: 'ERF.PRECISE 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "lower", label: "下界", type: "number", default: "1" }
  ],
  template: "=ERFC.PRECISE({lower})",
  cases: [
    { label: "ERFC.PRECISE(1)", type: "ok", values: { lower: "1" }, expect: "0.157299", note: "erfc.precise(1)≈0.157299" },
    { label: "ERFC.PRECISE(0)", type: "ok", values: { lower: "0" }, expect: "1", note: "erfc.precise(0)=1" },
    { label: "文本 → #VALUE!", type: "error", values: { lower: "abc" }, expect: "#VALUE!", note: "非数字" },
    { label: "空 → #VALUE!", type: "error", values: { lower: "" }, expect: "#VALUE!", note: "空单元格" },
    { label: "非法数字 → #VALUE!", type: "error", values: { lower: "3.14x" }, expect: "#VALUE!", note: "非数字" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default erfcpreciseEntry;
