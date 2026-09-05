import type { FunctionEntry } from '@/types';

/** DELTA · 克罗内克德尔塔（engineering 类 B9 批次） */

const deltaEntry: FunctionEntry = {
  id: 'delta',
  enName: 'DELTA',
  zhName: '克罗内克德尔塔',
  zhCommon: ['DELTA', '相等判定'],
  alias: ['相等为1'],
  category: 'engineering',
  abbr: 'klnkdet',
  pinyin: 'keluoneikedeerta',
  keywords: ['delta', '相等', '判定'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '两数相等返回 1',
  summary: 'DELTA 判断两数是否相等：相等得 1，不等得 0，常用于求和时筛选特定值。',
  syntax: { patternCn: '=DELTA(数1, [数2])', patternEn: '=DELTA(number1, [number2])', args: [{ key: 'a', zh: '数1', en: 'number1', required: true, desc: '第一个数，默认与 0 比较' },
    { key: 'b', zh: '数2', en: 'number2', required: false, desc: '第二个数，默认 0' }] },
  returnValue: '1（相等）或 0（不等）',
  examples: [{ title: '示例：相等判定', scene: '5 与 5', dataAnchor: 'A2', formula: '=DELTA(5,5)', result: '1', explanation: '两数相等返回 1。' }],
  pitfalls: [{ title: '只判相等', reason: '不像 IF 能返回任意值。', fix: '要其他结果用 IF。', level: 'low' }],
  related: [{ id: 'gestep', kind: 'companion', why: 'GESTEP 与本品类相关' },
    { id: 'if', kind: 'companion', why: 'IF 与本品类相关' },
    { id: 'sumif', kind: 'companion', why: 'SUMIF 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number1", label: "数1", type: "number", default: "5" },
    { key: "number2", label: "数2", type: "number", default: "5" }
  ],
  template: "=DELTA({number1},{number2})",
  cases: [
    { label: "相等 → 1", type: "ok", values: { number1: "5", number2: "5" }, expect: "1", note: "两数相同" },
    { label: "不等 → 0", type: "ok", values: { number1: "5", number2: "3" }, expect: "0", note: "两数不同" },
    { label: "文本参数 → #VALUE!", type: "error", values: { number1: "abc", number2: "5" }, expect: "#VALUE!", note: "非数字" },
    { label: "第 2 参数文本 → #VALUE!", type: "error", values: { number1: "5", number2: "xyz" }, expect: "#VALUE!", note: "非数字" },
    { label: "空参数 → #VALUE!", type: "error", values: { number1: "", number2: "5" }, expect: "#VALUE!", note: "空单元格" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default deltaEntry;
