import type { FunctionEntry } from '@/types';

/** BITRSHIFT · 按位右移（engineering 类 B9 批次） */

const bitrshiftEntry: FunctionEntry = {
  id: 'bitrshift',
  enName: 'BITRSHIFT',
  zhName: '按位右移',
  zhCommon: ['BITRSHIFT', '右移'],
  alias: ['位右移'],
  category: 'engineering',
  abbr: 'awyy',
  pinyin: 'anweiyouyi',
  keywords: ['bitrshift', '位运算', '右移'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: '2013', label: '需 Excel 2013 及以上' },
  oneLiner: '把整数二进制位右移',
  summary: 'BITRSHIFT 把非负整数的二进制位向右移 n 位，等价整除 2^n（高位补 0）。',
  syntax: { patternCn: '=BITRSHIFT(数, 移位数)', patternEn: '=BITRSHIFT(number, shift_amount)', args: [{ key: 'n', zh: '数', en: 'number', required: true, desc: '非负整数' },
    { key: 'shift', zh: '移位数', en: 'shift_amount', required: true, desc: '右移位数（可为负表左移）' }] },
  returnValue: '位移后结果',
  examples: [{ title: '示例：右移', scene: '64 右移 2 位', dataAnchor: 'A2', formula: '=BITRSHIFT(64,2)', result: '16', explanation: '1000000₂ 右移 2 = 10000₂ = 16。' }],
  pitfalls: [{ title: '负数移位是左移', reason: 'shift 为负相当于 BITLSHIFT。', fix: '负位移用 BITLSHIFT 更直观。', level: 'low' }],
  related: [{ id: 'bitlshift', kind: 'companion', why: 'BITLSHIFT 与本品类相关' },
    { id: 'bitand', kind: 'companion', why: 'BITAND 与本品类相关' },
    { id: 'bitor', kind: 'companion', why: 'BITOR 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "数", type: "number", default: "23" },
    { key: "shift", label: "位移量", type: "number", default: "2" }
  ],
  template: "=BITRSHIFT({number},{shift})",
  cases: [
    { label: "23 >> 2 = 5", type: "ok", values: { number: "23", shift: "2" }, expect: "5", note: "右移 2 位" },
    { label: "位移量小数 → #NUM!", type: "error", values: { number: "23", shift: "1.5" }, expect: "#NUM!", note: "需整数" },
    { label: "负数 → #NUM!", type: "error", values: { number: "-23", shift: "2" }, expect: "#NUM!", note: "需非负" },
    { label: "入参越界 → #NUM!", type: "error", values: { number: "281474976710656", shift: "1" }, expect: "#NUM!", note: "超过 2^48-1" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bitrshiftEntry;
