import type { FunctionEntry } from '@/types';

/** HEX2BIN · 十六进制转二进制（engineering 类 B9 批次） */

const hex2binEntry: FunctionEntry = {
  id: 'hex2bin',
  enName: 'HEX2BIN',
  zhName: '十六进制转二进制',
  zhCommon: ['HEX2BIN', '十六进制'],
  alias: ['16 进制转 2 进制'],
  category: 'engineering',
  abbr: 'sljzzejz',
  pinyin: 'shiliujinzhizhuanerjinzhi',
  keywords: ['hex2bin', '进制', '十六进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把十六进制数转成二进制',
  summary: 'HEX2BIN 把十六进制文本转成二进制文本，可指定位数。',
  syntax: { patternCn: '=HEX2BIN(十六进制文本, [位数])', patternEn: '=HEX2BIN(number, [places])', args: [{ key: 'number', zh: '十六进制文本', en: 'number', required: true, desc: '十六进制字符串' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '二进制文本',
  examples: [{ title: '示例：转二进制', scene: '十六进制 F', dataAnchor: 'A2', formula: '=HEX2BIN("F")', result: '1111', explanation: 'F₁₆ = 1111₂。' }],
  pitfalls: [{ title: '位数上限', reason: 'HEX2BIN 最多 10 位二进制。', fix: '位数不超 10。', level: 'low' }],
  related: [{ id: 'bin2hex', kind: 'companion', why: 'BIN2HEX 与本品类相关' },
    { id: 'hex2dec', kind: 'companion', why: 'HEX2DEC 与本品类相关' },
    { id: 'hex2oct', kind: 'companion', why: 'HEX2OCT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "HEX 文本", type: "text", default: "\"F\"" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=HEX2BIN({number},{places})",
  cases: [
    { label: "F₁₆ → 1111₂", type: "ok", values: { number: "\"F\"" }, expect: "1111", note: "F₁₆ = 1111₂" },
    { label: "places=6 → 001111", type: "ok", values: { number: "\"F\"", places: "6" }, expect: "001111", note: "前导补 0" },
    { label: "G 非法十六进制" + " → " + "#NUM!", type: "error", values: { number: "\"G\"" }, expect: "#NUM!", note: "G 非法十六进制" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"11111111111\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default hex2binEntry;
