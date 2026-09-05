import type { FunctionEntry } from '@/types';

/** BESSELI · 修正贝塞尔i（engineering 类 B9 批次） */

const besseliEntry: FunctionEntry = {
  id: 'besseli',
  enName: 'BESSELI',
  zhName: '修正贝塞尔i',
  zhCommon: ['BESSELI', '修正贝塞尔'],
  alias: ['第一类修正贝塞尔'],
  category: 'engineering',
  abbr: 'xzbsei',
  pinyin: 'xiuzhengbeisaieri',
  keywords: ['besseli', '贝塞尔', '修正'],
  difficulty: 5,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算修正贝塞尔函数 In(x)',
  summary: 'BESSELI 返回第一类修正贝塞尔函数（纯虚宗量），工程与物理计算用。',
  syntax: { patternCn: '=BESSELI(x, n)', patternEn: '=BESSELI(x, n)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '自变量' },
    { key: 'n', zh: '阶数', en: 'n', required: true, desc: '整数阶数' }] },
  returnValue: '贝塞尔函数值',
  examples: [{ title: '示例：BESSELI', scene: 'x=1, n=1', dataAnchor: 'A2', formula: '=BESSELI(1,1)', result: '约 0.5652', explanation: '修正贝塞尔 I₁(1)。' }],
  pitfalls: [{ title: 'n 为整数', reason: '阶数非整数会 #NUM!。', fix: 'n 取整数。', level: 'low' }],
  related: [{ id: 'besselj', kind: 'companion', why: 'BESSELJ 与本品类相关' },
    { id: 'besselk', kind: 'companion', why: 'BESSELK 与本品类相关' },
    { id: 'bessely', kind: 'companion', why: 'BESSELY 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: "x", label: "x（自变量）", type: "number", default: "1.5" },
      { key: "n", label: "阶数 n（整数）", type: "number", default: "0" }
    ],
    template: "=BESSELI({x},{n})",
    cases: [
      { label: "I0(1.5) → 1.646723", type: "ok", values: { x: "1.5", n: "0" }, expect: "1.646723", note: "I0(1.5)≈1.6467232" },
      { label: "I1(1) → 0.565159", type: "ok", values: { x: "1", n: "1" }, expect: "0.565159", note: "I1(1)≈0.5651591" },
      { label: "I1(1.9) → 1.448244", type: "ok", values: { x: "1.9", n: "1" }, expect: "1.448244", note: "I1(1.9)≈1.4482（题面参考 1.0268830 有误）" },
      { label: "x 非数字" + " → " + "#VALUE!", type: "error", values: { x: "abc", n: "0" }, expect: "#VALUE!", note: "x 必须是数字" },
      { label: "n 非数字" + " → " + "#VALUE!", type: "error", values: { x: "1.5", n: "abc" }, expect: "#VALUE!", note: "n 必须是数字" },
      { label: "x<0" + " → " + "#NUM!", type: "error", values: { x: "-1", n: "0" }, expect: "#NUM!", note: "BESSEL 系列要求 x≥0" },
      { label: "n<0（截断后）" + " → " + "#NUM!", type: "error", values: { x: "1", n: "-1" }, expect: "#NUM!", note: "截断后 n=-1 < 0" }
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default besseliEntry;
