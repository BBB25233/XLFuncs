import type { FunctionEntry } from '@/types';

/** BIN2DEC · 二进制转十进制（engineering 类 B9 批次） */

const bin2decEntry: FunctionEntry = {
  id: 'bin2dec',
  enName: 'BIN2DEC',
  zhName: '二进制转十进制',
  zhCommon: ['BIN2DEC', '二进制'],
  alias: ['2 进制转 10 进制'],
  category: 'engineering',
  abbr: 'ejzzsjz',
  pinyin: 'erjinzhizhuanshijinzhi',
  keywords: ['bin2dec', '进制', '二进制'],
  difficulty: 2,
  usageLevel: 5,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把二进制数转成十进制',
  summary: 'BIN2DEC 把最多 10 位的二进制文本转成十进制整数，最高位为符号位，所以 10 个 1 表示 -1。',
  syntax: { patternCn: '=BIN2DEC(二进制文本)', patternEn: '=BIN2DEC(number)', args: [{ key: 'number', zh: '二进制文本', en: 'number', required: true, desc: '二进制字符串，最多 10 位' }] },
  returnValue: '十进制整数',
  examples: [
    {
      title: '示例：转十进制',
      scene: '二进制 101010',
      dataAnchor: 'A2',
      formula: '=BIN2DEC("101010")',
      result: '42',
      explanation: '101010₂ = 42₁₀。',
    },
    {
      title: '示例：最高位是符号位，"1000000000" 是 −512 不是 512',
      scene: '从 PLC 读回来的 10 位二进制串，看到 1000000000 以为是 512，转出来却是负数。',
      dataAnchor: 'A2',
      formula: '=BIN2DEC("1000000000")',
      result: '-512',
      explanation:
        '10 位补码里最高位是符号位，取值范围是 −512~511：1000000000 是 −512，10 个 1 是 −1。只有 9 位以内才是纯正数（111111111 = 511）。',
    },
  ],
  pitfalls: [{ title: '超过 10 位报错', reason: 'BIN2DEC 只支持 10 位二进制。', fix: '超出请用 DEC2BIN 反向或分段。', level: 'mid' }],
  related: [{ id: 'dec2bin', kind: 'companion', why: 'DEC2BIN 与本品类相关' },
    { id: 'bin2hex', kind: 'companion', why: 'BIN2HEX 与本品类相关' },
    { id: 'bin2oct', kind: 'companion', why: 'BIN2OCT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "BIN 文本", type: "text", default: "\"101010\"" }
  ],
  template: "=BIN2DEC({number})",
  cases: [
    { label: "二进制 101010 → 42", type: "ok", values: { number: "\"101010\"" }, expect: "42", note: "101010₂ = 42₁₀" },
    { label: "补码 10 个 1 → -1", type: "ok", values: { number: "\"1111111111\"" }, expect: "-1", note: "10 位补码 -1" },
    { label: "二进制只含 0/1" + " → " + "#NUM!", type: "error", values: { number: "\"12\"" }, expect: "#NUM!", note: "二进制只含 0/1" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"11111111111\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bin2decEntry;
