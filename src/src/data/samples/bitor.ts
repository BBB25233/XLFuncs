import type { FunctionEntry } from '@/types';

/** BITOR · 按位或（engineering 类 B9 批次） */

const bitorEntry: FunctionEntry = {
  id: 'bitor',
  enName: 'BITOR',
  zhName: '按位或',
  zhCommon: ['BITOR', '位或'],
  alias: ['按位或'],
  category: 'engineering',
  abbr: 'awh',
  pinyin: 'anweihuo',
  keywords: ['bitor', '位运算', '或'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: '2013', label: '需 Excel 2013 及以上' },
  oneLiner: '两个整数按位或',
  summary: 'BITOR 对两个非负整数做按位 OR，任一位为 1 即得 1。',
  syntax: { patternCn: '=BITOR(数1, 数2)', patternEn: '=BITOR(number1, number2)', args: [{ key: 'a', zh: '数1', en: 'number1', required: true, desc: '非负整数' },
    { key: 'b', zh: '数2', en: 'number2', required: true, desc: '非负整数' }] },
  returnValue: '按位或结果',
  examples: [
    { title: '示例：位或', scene: '23 或 10', dataAnchor: 'A2', formula: '=BITOR(23,10)', result: '31', explanation: '10111 OR 01010 = 11111 = 31。' },
    {
      title: '示例 2：用 BITOR 批量置位（8 路告警一起点亮）',
      scene: '设备状态字当前是 4608（0x1200），现在要把低 8 位全部打开，表示 8 路传感器同时告警。',
      dataTsv: '原状态字\t置位掩码\n4608\t255',
      dataAnchor: 'A1',
      formula: '=BITOR(A2,B2)',
      result: '4863',
      explanation: 'BITOR 只会把位「打开」，不会关掉任何已经亮着的位：掩码里是 1 的位，结果一定是 1。0x1200 OR 0x00FF 等于 0x12FF，也就是 4863。想清位得用 BITAND 配一个反掩码，Excel 没有 BITNOT。',
    },
  ],
  pitfalls: [{ title: '需非负整数', reason: '负数会 #NUM!。', fix: '先取绝对值。', level: 'mid' }],
  related: [{ id: 'bitand', kind: 'companion', why: 'BITAND 与本品类相关' },
    { id: 'bitxor', kind: 'companion', why: 'BITXOR 与本品类相关' },
    { id: 'bitlshift', kind: 'companion', why: 'BITLSHIFT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number1", label: "数1", type: "number", default: "23" },
    { key: "number2", label: "数2", type: "number", default: "10" }
  ],
  template: "=BITOR({number1},{number2})",
  cases: [
    { label: "23 OR 10 = 31", type: "ok", values: { number1: "23", number2: "10" }, expect: "31", note: "10111 OR 01010" },
    { label: "小数 → #NUM!", type: "error", values: { number1: "5.5", number2: "10" }, expect: "#NUM!", note: "非整数" },
    { label: "负数 → #NUM!", type: "error", values: { number1: "-3", number2: "10" }, expect: "#NUM!", note: "需非负" },
    { label: "越界 → #NUM!", type: "error", values: { number1: "281474976710656", number2: "10" }, expect: "#NUM!", note: "超过 2^48-1" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bitorEntry;
