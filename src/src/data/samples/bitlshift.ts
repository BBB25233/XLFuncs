import type { FunctionEntry } from '@/types';

/** BITLSHIFT · 按位左移（engineering 类 B9 批次） */

const bitlshiftEntry: FunctionEntry = {
  id: 'bitlshift',
  enName: 'BITLSHIFT',
  zhName: '按位左移',
  zhCommon: ['BITLSHIFT', '左移'],
  alias: ['位左移'],
  category: 'engineering',
  abbr: 'awzy',
  pinyin: 'anweizuoyi',
  keywords: ['bitlshift', '位运算', '左移'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: '2013', label: '需 Excel 2013 及以上' },
  oneLiner: '把整数二进制位左移',
  summary: 'BITLSHIFT 把非负整数的二进制位向左移 n 位，等价乘 2^n（低位移入 0）。',
  syntax: { patternCn: '=BITLSHIFT(数, 移位数)', patternEn: '=BITLSHIFT(number, shift_amount)', args: [{ key: 'n', zh: '数', en: 'number', required: true, desc: '非负整数' },
    { key: 'shift', zh: '移位数', en: 'shift_amount', required: true, desc: '左移位数（可为负表右移）' }] },
  returnValue: '位移后结果',
  examples: [
    { title: '示例：左移', scene: '4 左移 2 位', dataAnchor: 'A2', formula: '=BITLSHIFT(4,2)', result: '16', explanation: '100₂ 左移 2 = 10000₂ = 16。' },
    {
      title: '示例 2：左移 47 位可以，48 位就溢出',
      scene: '拼 48 位寄存器地址时习惯用 1 左移 n 位表示第 n 位。想知道位移到第几位就到头了。',
      dataTsv: '数值\t移位数\n1\t47\n1\t48',
      dataAnchor: 'A1',
      formula: '=BITLSHIFT(A2,B2)',
      result: '1 左移 47 位 → 140737488355328，左移 48 位 → #NUM!',
      explanation: '左移 n 位等于乘 2ⁿ，但结果必须落在 0 到 281474976710655（2⁴⁸−1）之间，1×2⁴⁸ 刚好越界就报 #NUM!。Excel 里移位数写负数表示反向移位（BITLSHIFT(4660,-8) 等于右移 8 位），本页试算只接受非负移位数，要右移请直接用 BITRSHIFT。',
    },
  ],
  pitfalls: [{ title: '负数移位是右移', reason: 'shift 为负相当于 BITRSHIFT。', fix: '负位移用 BITRSHIFT 更直观。', level: 'low' }],
  related: [{ id: 'bitrshift', kind: 'companion', why: 'BITRSHIFT 与本品类相关' },
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
  template: "=BITLSHIFT({number},{shift})",
  cases: [
    { label: "23 << 2 = 92", type: "ok", values: { number: "23", shift: "2" }, expect: "92", note: "左移 2 位" },
    { label: "位移量小数 → #NUM!", type: "error", values: { number: "23", shift: "1.5" }, expect: "#NUM!", note: "需整数" },
    { label: "负数 → #NUM!", type: "error", values: { number: "-23", shift: "2" }, expect: "#NUM!", note: "需非负" },
    { label: "结果越界 → #NUM!", type: "error", values: { number: "281474976710655", shift: "1" }, expect: "#NUM!", note: "超过 2^48-1" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bitlshiftEntry;
