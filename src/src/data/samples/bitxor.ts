import type { FunctionEntry } from '@/types';

/** BITXOR · 按位异或（engineering 类 B9 批次） */

const bitxorEntry: FunctionEntry = {
  id: 'bitxor',
  enName: 'BITXOR',
  zhName: '按位异或',
  zhCommon: ['BITXOR', '位异或'],
  alias: ['按位异或'],
  category: 'engineering',
  abbr: 'awyh',
  pinyin: 'anweiyihuo',
  keywords: ['bitxor', '位运算', '异或'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: '2013', label: '需 Excel 2013 及以上' },
  oneLiner: '两个整数按位异或',
  summary: 'BITXOR 对两个非负整数做按位 XOR，两位不同才得 1（同或同为 0）。',
  syntax: { patternCn: '=BITXOR(数1, 数2)', patternEn: '=BITXOR(number1, number2)', args: [{ key: 'a', zh: '数1', en: 'number1', required: true, desc: '非负整数' },
    { key: 'b', zh: '数2', en: 'number2', required: true, desc: '非负整数' }] },
  returnValue: '按位异或结果',
  examples: [
    { title: '示例：位异或', scene: '23 异或 10', dataAnchor: 'A2', formula: '=BITXOR(23,10)', result: '29', explanation: '10111 XOR 01010 = 11101 = 29。' },
    {
      title: '示例 2：用 BITXOR 翻转低 8 位做取反校验',
      scene: '状态字 4660（0x1234）要做低 8 位取反码，高 8 位必须原样不动，用来检查传输有没有出错。',
      dataTsv: '状态字\t翻转掩码\n4660\t255',
      dataAnchor: 'A1',
      formula: '=BITXOR(A2,B2)',
      result: '4811',
      explanation: '掩码为 1 的位被翻转，为 0 的位原样保留，所以 0x1234 XOR 0x00FF 等于 0x12CB，也就是 4811。同一个掩码再做一次 BITXOR 就还原成 4660，异或常被拿来做简单校验就是这个原因。',
    },
  ],
  pitfalls: [{ title: '需非负整数', reason: '负数会 #NUM!。', fix: '先取绝对值。', level: 'mid' }],
  related: [{ id: 'bitand', kind: 'companion', why: 'BITAND 与本品类相关' },
    { id: 'bitor', kind: 'companion', why: 'BITOR 与本品类相关' },
    { id: 'bitlshift', kind: 'companion', why: 'BITLSHIFT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number1", label: "数1", type: "number", default: "23" },
    { key: "number2", label: "数2", type: "number", default: "10" }
  ],
  template: "=BITXOR({number1},{number2})",
  cases: [
    { label: "23 XOR 10 = 29", type: "ok", values: { number1: "23", number2: "10" }, expect: "29", note: "10111 XOR 01010" },
    { label: "小数 → #NUM!", type: "error", values: { number1: "5.5", number2: "10" }, expect: "#NUM!", note: "非整数" },
    { label: "负数 → #NUM!", type: "error", values: { number1: "-3", number2: "10" }, expect: "#NUM!", note: "需非负" },
    { label: "越界 → #NUM!", type: "error", values: { number1: "281474976710656", number2: "10" }, expect: "#NUM!", note: "超过 2^48-1" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bitxorEntry;
