import type { FunctionEntry } from '@/types';

/** BITAND · 按位与（engineering 类 B9 批次） */

const bitandEntry: FunctionEntry = {
  id: 'bitand',
  enName: 'BITAND',
  zhName: '按位与',
  zhCommon: ['BITAND', '位与'],
  alias: ['按位且'],
  category: 'engineering',
  abbr: 'awy',
  pinyin: 'anweiyu',
  keywords: ['bitand', '位运算', '与'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: '2013', label: '需 Excel 2013 及以上' },
  oneLiner: '两个整数按位与',
  summary: 'BITAND 对两个非负十进制整数做按位 AND，只有两位都为 1 才得 1。',
  syntax: { patternCn: '=BITAND(数1, 数2)', patternEn: '=BITAND(number1, number2)', args: [{ key: 'a', zh: '数1', en: 'number1', required: true, desc: '非负整数' },
    { key: 'b', zh: '数2', en: 'number2', required: true, desc: '非负整数' }] },
  returnValue: '按位与结果',
  examples: [
    { title: '示例：位与', scene: '23 与 10', dataAnchor: 'A2', formula: '=BITAND(23,10)', result: '2', explanation: '10111 AND 01010 = 00010 = 2。' },
    {
      title: '示例 2：用掩码从状态字里取低 8 位',
      scene: '设备上报一个状态字 4660（十六进制的 0x1234），低 8 位存温度、高 8 位存电压。想单独把低 8 位取出来看。',
      dataTsv: '状态字\t掩码\t用途\n4660\t255\t取低 8 位\n4660\t65280\t取高 8 位\n4660\t4\t看第 3 位是否置位',
      dataAnchor: 'A1',
      formula: '=BITAND(A2,B2)',
      result: '低 8 位 → 52，高 8 位 → 4608，第 3 位 → 4（非 0 说明已置位）',
      explanation: '掩码里为 1 的位才会被保留。255 的二进制是 11111111，正好圈住低 8 位；判断某一位开没开，就用那一位的权值（第 3 位是 4）去 AND，结果非 0 就是开着。注意 Excel 不认 0x 前缀，4660 只能写十进制。',
    },
  ],
  pitfalls: [{ title: '需非负整数', reason: '负数或小数会 #NUM!。', fix: '先取绝对值或取整。', level: 'mid' }],
  related: [{ id: 'bitor', kind: 'companion', why: 'BITOR 与本品类相关' },
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
  template: "=BITAND({number1},{number2})",
  cases: [
    { label: "23 AND 10 = 2", type: "ok", values: { number1: "23", number2: "10" }, expect: "2", note: "10111 AND 01010" },
    { label: "小数 → #NUM!", type: "error", values: { number1: "5.5", number2: "10" }, expect: "#NUM!", note: "非整数" },
    { label: "负数 → #NUM!", type: "error", values: { number1: "-3", number2: "10" }, expect: "#NUM!", note: "需非负" },
    { label: "越界 → #NUM!", type: "error", values: { number1: "281474976710656", number2: "10" }, expect: "#NUM!", note: "超过 2^48-1" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bitandEntry;
