import type { FunctionEntry } from '@/types';

/** ERF.PRECISE · 精确误差函数（engineering 类 B9 批次） */

const erfpreciseEntry: FunctionEntry = {
  id: 'erf.precise',
  enName: 'ERF.PRECISE',
  zhName: '精确误差函数',
  zhCommon: ['ERF.PRECISE', '精确误差'],
  alias: ['精确erf'],
  category: 'engineering',
  abbr: 'jqwchs',
  pinyin: 'jingquewuchahanshu',
  keywords: ['erf.precise', '误差', '精确'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: '2010', label: '需 Excel 2010 及以上' },
  oneLiner: '精确版误差函数',
  summary: 'ERF.PRECISE 与 ERF 算法相同但数值更精确，下界从 0 起到 x。',
  syntax: { patternCn: '=ERF.PRECISE(上界)', patternEn: '=ERF.PRECISE(x)', args: [{ key: 'x', zh: '上界', en: 'x', required: true, desc: '积分上界' }] },
  returnValue: '误差函数值',
  examples: [{ title: '示例：精确 erf', scene: '标准误差函数', dataAnchor: 'A2', formula: '=ERF.PRECISE(1)', result: '约 0.8427', explanation: '与 ERF 同值、精度更高。' }],
  pitfalls: [{ title: '需 2010+', reason: '旧版 Excel 无此函数。', fix: '旧版用 ERF。', level: 'low' }],
  related: [{ id: 'erf', kind: 'companion', why: 'ERF 与本品类相关' },
    { id: 'erfc', kind: 'companion', why: 'ERFC 与本品类相关' },
    { id: 'erfc.precise', kind: 'companion', why: 'ERFC.PRECISE 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "lower", label: "下界", type: "number", default: "1" }
  ],
  template: "=ERF.PRECISE({lower})",
  cases: [
    { label: "ERF.PRECISE(1)", type: "ok", values: { lower: "1" }, expect: "0.842701", note: "erf.precise(1)≈0.842701" },
    { label: "ERF.PRECISE(0)", type: "ok", values: { lower: "0" }, expect: "0", note: "erf.precise(0)=0" },
    { label: "文本 → #VALUE!", type: "error", values: { lower: "abc" }, expect: "#VALUE!", note: "非数字" },
    { label: "空 → #VALUE!", type: "error", values: { lower: "" }, expect: "#VALUE!", note: "空单元格" },
    { label: "非法数字 → #VALUE!", type: "error", values: { lower: "3.14x" }, expect: "#VALUE!", note: "非数字" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default erfpreciseEntry;
