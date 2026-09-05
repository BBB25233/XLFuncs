import type { FunctionEntry } from '@/types';

/** BESSELK · 修正贝塞尔k（engineering 类 B9 批次） */

const besselkEntry: FunctionEntry = {
  id: 'besselk',
  enName: 'BESSELK',
  zhName: '修正贝塞尔k',
  zhCommon: ['BESSELK', '修正贝塞尔'],
  alias: ['第二类修正贝塞尔'],
  category: 'engineering',
  abbr: 'xzbsek',
  pinyin: 'xiuzhengbeisaierk',
  keywords: ['besselk', '贝塞尔', '修正'],
  difficulty: 5,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算修正贝塞尔函数 Kn(x)',
  summary: 'BESSELK 返回第二类修正贝塞尔函数，热传导等问题用。',
  syntax: { patternCn: '=BESSELK(x, n)', patternEn: '=BESSELK(x, n)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '自变量' },
    { key: 'n', zh: '阶数', en: 'n', required: true, desc: '整数阶数' }] },
  returnValue: '贝塞尔函数值',
  examples: [{ title: '示例：BESSELK', scene: 'x=1, n=1', dataAnchor: 'A2', formula: '=BESSELK(1,1)', result: '约 0.6019', explanation: '修正贝塞尔 K₁(1)。' }],
  pitfalls: [{ title: 'x 须 >0', reason: 'x≤0 会 #NUM!。', fix: 'x 取正。', level: 'low' }],
  related: [{ id: 'besseli', kind: 'companion', why: 'BESSELI 与本品类相关' },
    { id: 'besselj', kind: 'companion', why: 'BESSELJ 与本品类相关' },
    { id: 'bessely', kind: 'companion', why: 'BESSELY 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: "x", label: "x（自变量，须 >0）", type: "number", default: "1" },
      { key: "n", label: "阶数 n（整数）", type: "number", default: "0" }
    ],
    template: "=BESSELK({x},{n})",
    cases: [
      { label: "K0(1) → 0.421024", type: "ok", values: { x: "1", n: "0" }, expect: "0.421024", note: "K0(1)≈0.42102444" },
      { label: "K1(1) → 0.601907", type: "ok", values: { x: "1", n: "1" }, expect: "0.601907", note: "K1(1)≈0.60190723" },
      { label: "K0(2) → 0.113894", type: "ok", values: { x: "2", n: "0" }, expect: "0.113894", note: "K0(2)≈0.11389387" },
      { label: "x 非数字" + " → " + "#VALUE!", type: "error", values: { x: "abc", n: "0" }, expect: "#VALUE!", note: "x 必须是数字" },
      { label: "n 非数字" + " → " + "#VALUE!", type: "error", values: { x: "1", n: "abc" }, expect: "#VALUE!", note: "n 必须是数字" },
      { label: "x<0" + " → " + "#NUM!", type: "error", values: { x: "-1", n: "0" }, expect: "#NUM!", note: "BESSELK 要求 x>0" },
      { label: "x=0（奇点）" + " → " + "#NUM!", type: "error", values: { x: "0", n: "0" }, expect: "#NUM!", note: "K 在 x=0 处无定义" },
      { label: "n<0（截断后）" + " → " + "#NUM!", type: "error", values: { x: "1", n: "-1" }, expect: "#NUM!", note: "截断后 n=-1 < 0" }
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default besselkEntry;
