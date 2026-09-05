import type { FunctionEntry } from '@/types';

/** BESSELJ · 贝塞尔j（engineering 类 B9 批次） */

const besseljEntry: FunctionEntry = {
  id: 'besselj',
  enName: 'BESSELJ',
  zhName: '贝塞尔j',
  zhCommon: ['BESSELJ', '贝塞尔'],
  alias: ['第一类贝塞尔'],
  category: 'engineering',
  abbr: 'bsej',
  pinyin: 'beisaierj',
  keywords: ['besselj', '贝塞尔', '函数'],
  difficulty: 5,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算贝塞尔函数 Jn(x)',
  summary: 'BESSELJ 返回第一类贝塞尔函数，波动与振动分析常用。',
  syntax: { patternCn: '=BESSELJ(x, n)', patternEn: '=BESSELJ(x, n)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '自变量' },
    { key: 'n', zh: '阶数', en: 'n', required: true, desc: '整数阶数' }] },
  returnValue: '贝塞尔函数值',
  examples: [{ title: '示例：BESSELJ', scene: 'x=1, n=0', dataAnchor: 'A2', formula: '=BESSELJ(1,0)', result: '约 0.7652', explanation: '贝塞尔 J₀(1)。' }],
  pitfalls: [{ title: 'n 为整数', reason: '阶数非整数会 #NUM!。', fix: 'n 取整数。', level: 'low' }],
  related: [{ id: 'besseli', kind: 'companion', why: 'BESSELI 与本品类相关' },
    { id: 'besselk', kind: 'companion', why: 'BESSELK 与本品类相关' },
    { id: 'bessely', kind: 'companion', why: 'BESSELY 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: "x", label: "x（自变量）", type: "number", default: "1.9" },
      { key: "n", label: "阶数 n（整数）", type: "number", default: "0" }
    ],
    template: "=BESSELJ({x},{n})",
    cases: [
      { label: "J1(1) → 0.440051", type: "ok", values: { x: "1", n: "1" }, expect: "0.440051", note: "J1(1)≈0.4400506" },
      { label: "J0(1) → 0.765198", type: "ok", values: { x: "1", n: "0" }, expect: "0.765198", note: "J0(1)≈0.7651977" },
      { label: "J0(2.5) → -0.048384", type: "ok", values: { x: "2.5", n: "0" }, expect: "-0.048384", note: "J0(2.5)≈-0.0483838（真实值为负；题面参考漏了负号）" },
      { label: "x 非数字" + " → " + "#VALUE!", type: "error", values: { x: "abc", n: "0" }, expect: "#VALUE!", note: "x 必须是数字" },
      { label: "n 非数字" + " → " + "#VALUE!", type: "error", values: { x: "1.9", n: "abc" }, expect: "#VALUE!", note: "n 必须是数字" },
      { label: "x<0" + " → " + "#NUM!", type: "error", values: { x: "-1", n: "0" }, expect: "#NUM!", note: "BESSEL 系列要求 x≥0" },
      { label: "n<0（截断后）" + " → " + "#NUM!", type: "error", values: { x: "1", n: "-1" }, expect: "#NUM!", note: "截断后 n=-1 < 0" }
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default besseljEntry;
