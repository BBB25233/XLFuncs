import type { FunctionEntry } from '@/types';

/** BESSELY · 贝塞尔y（engineering 类 B9 批次） */

const besselyEntry: FunctionEntry = {
  id: 'bessely',
  enName: 'BESSELY',
  zhName: '贝塞尔y',
  zhCommon: ['BESSELY', '贝塞尔'],
  alias: ['第二类贝塞尔'],
  category: 'engineering',
  abbr: 'bsey',
  pinyin: 'beisaiery',
  keywords: ['bessely', '贝塞尔', '函数'],
  difficulty: 5,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算贝塞尔函数 Yn(x)',
  summary: 'BESSELY 返回第二类贝塞尔函数（诺依曼函数），波动分析用。',
  syntax: { patternCn: '=BESSELY(x, n)', patternEn: '=BESSELY(x, n)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '自变量' },
    { key: 'n', zh: '阶数', en: 'n', required: true, desc: '整数阶数' }] },
  returnValue: '贝塞尔函数值',
  examples: [
    { title: '示例：BESSELY', scene: 'x=1, n=0', dataAnchor: 'A2', formula: '=BESSELY(1,0)', result: '约 0.0883', explanation: '贝塞尔 Y₀(1)。' },
    {
      title: '示例 2：x 越小 Y 越负，趋近 0 处发散',
      scene: '圆柱外的场要用第二类贝塞尔 Y 描述。它和 J 最大的区别是 x 趋近 0 时直奔负无穷，所以内场不能用它。',
      dataTsv: 'x\t阶数 n\n0.5\t0\n3\t0',
      dataAnchor: 'A1',
      formula: '=BESSELY(A2,B2)',
      result: 'Y₀(0.5) → −0.444519，Y₀(3) → 0.37685',
      explanation: 'x 从 0.5 走到 3，Y₀ 从 −0.444519 爬升到 0.37685，中间穿过零点。x 趋近 0 时 Y 发散到负无穷，所以 x=0 会直接 #NUM!，这也正是「圆柱内部用 J、外部用 Y」的原因。',
    },
  ],
  pitfalls: [{ title: 'x 须 >0', reason: 'x≤0 会 #NUM!。', fix: 'x 取正。', level: 'low' }],
  related: [{ id: 'besselj', kind: 'companion', why: 'BESSELJ 与本品类相关' },
    { id: 'besseli', kind: 'companion', why: 'BESSELI 与本品类相关' },
    { id: 'besselk', kind: 'companion', why: 'BESSELK 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: "x", label: "x（自变量，须 >0）", type: "number", default: "1" },
      { key: "n", label: "阶数 n（整数）", type: "number", default: "0" }
    ],
    template: "=BESSELY({x},{n})",
    cases: [
      { label: "Y0(1) → 0.088257", type: "ok", values: { x: "1", n: "0" }, expect: "0.088257", note: "Y0(1)≈0.08825696" },
      { label: "Y1(1) → -0.781213", type: "ok", values: { x: "1", n: "1" }, expect: "-0.781213", note: "Y1(1)≈-0.7812128" },
      { label: "Y0(2) → 0.510376", type: "ok", values: { x: "2", n: "0" }, expect: "0.510376", note: "Y0(2)≈0.5103757" },
      { label: "x 非数字" + " → " + "#VALUE!", type: "error", values: { x: "abc", n: "0" }, expect: "#VALUE!", note: "x 必须是数字" },
      { label: "n 非数字" + " → " + "#VALUE!", type: "error", values: { x: "1", n: "abc" }, expect: "#VALUE!", note: "n 必须是数字" },
      { label: "x<0" + " → " + "#NUM!", type: "error", values: { x: "-1", n: "0" }, expect: "#NUM!", note: "BESSELY 要求 x>0" },
      { label: "x=0（奇点）" + " → " + "#NUM!", type: "error", values: { x: "0", n: "0" }, expect: "#NUM!", note: "Y 在 x=0 处无定义" },
      { label: "n<0（截断后）" + " → " + "#NUM!", type: "error", values: { x: "1", n: "-1" }, expect: "#NUM!", note: "截断后 n=-1 < 0" }
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default besselyEntry;
