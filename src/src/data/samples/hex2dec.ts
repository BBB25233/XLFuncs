import type { FunctionEntry } from '@/types';

/** HEX2DEC · 十六进制转十进制（engineering 类 B9 批次） */

const hex2decEntry: FunctionEntry = {
  id: 'hex2dec',
  enName: 'HEX2DEC',
  zhName: '十六进制转十进制',
  zhCommon: ['HEX2DEC', '十六进制'],
  alias: ['16 进制转 10 进制'],
  category: 'engineering',
  abbr: 'sljzzsjz',
  pinyin: 'shiliujinzhizhuanshijinzhi',
  keywords: ['hex2dec', '进制', '十六进制'],
  difficulty: 2,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把十六进制数转成十进制',
  summary: 'HEX2DEC 把最多 10 位的十六进制文本转成十进制整数，最高位为符号位。',
  syntax: { patternCn: '=HEX2DEC(十六进制文本)', patternEn: '=HEX2DEC(number)', args: [{ key: 'number', zh: '十六进制文本', en: 'number', required: true, desc: '十六进制字符串（A-F 不区分大小写）' }] },
  returnValue: '十进制整数',
  examples: [{ title: '示例：转十进制', scene: '十六进制 FF', dataAnchor: 'A2', formula: '=HEX2DEC("FF")', result: '255', explanation: 'FF₁₆ = 255₁₀。' }],
  pitfalls: [{ title: '字母大小写无关', reason: 'A-F 与 a-f 等价。', fix: '混用大小写无妨。', level: 'low' }],
  related: [{ id: 'dec2hex', kind: 'companion', why: 'DEC2HEX 与本品类相关' },
    { id: 'hex2bin', kind: 'companion', why: 'HEX2BIN 与本品类相关' },
    { id: 'hex2oct', kind: 'companion', why: 'HEX2OCT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "HEX 文本", type: "text", default: "\"FF\"" }
  ],
  template: "=HEX2DEC({number})",
  cases: [
    { label: "FF₁₆ → 255", type: "ok", values: { number: "\"FF\"" }, expect: "255", note: "FF₁₆ = 255₁₀" },
    { label: "9 个 F → 68719476735", type: "ok", values: { number: "\"FFFFFFFFF\"" }, expect: "68719476735", note: "16^9-1" },
    { label: "G 非法十六进制" + " → " + "#NUM!", type: "error", values: { number: "\"G\"" }, expect: "#NUM!", note: "G 非法十六进制" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"11111111111\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default hex2decEntry;
