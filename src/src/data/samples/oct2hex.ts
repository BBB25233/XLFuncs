import type { FunctionEntry } from '@/types';

/** OCT2HEX · 八进制转十六进制（engineering 类 B9 批次） */

const oct2hexEntry: FunctionEntry = {
  id: 'oct2hex',
  enName: 'OCT2HEX',
  zhName: '八进制转十六进制',
  zhCommon: ['OCT2HEX', '八进制'],
  alias: ['8 进制转 16 进制'],
  category: 'engineering',
  abbr: 'bjzzsljz',
  pinyin: 'bajinzhizhuanshiliujinzhi',
  keywords: ['oct2hex', '进制', '八进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把八进制数转成十六进制',
  summary: 'OCT2HEX 把八进制文本转成十六进制文本，可指定位数。',
  syntax: { patternCn: '=OCT2HEX(八进制文本, [位数])', patternEn: '=OCT2HEX(number, [places])', args: [{ key: 'number', zh: '八进制文本', en: 'number', required: true, desc: '八进制字符串' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '十六进制文本',
  examples: [{ title: '示例：转十六进制', scene: '八进制 377', dataAnchor: 'A2', formula: '=OCT2HEX("377")', result: 'FF', explanation: '377₈ = FF₁₆。' }],
  pitfalls: [{ title: '位数上限', reason: 'OCT2HEX 最多 10 位十六进制。', fix: '位数不超 10。', level: 'low' }],
  related: [{ id: 'hex2oct', kind: 'companion', why: 'HEX2OCT 与本品类相关' },
    { id: 'oct2dec', kind: 'companion', why: 'OCT2DEC 与本品类相关' },
    { id: 'oct2bin', kind: 'companion', why: 'OCT2BIN 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "OCT 文本", type: "text", default: "\"72\"" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=OCT2HEX({number},{places})",
  cases: [
    { label: "72₈ → 3A₁₆", type: "ok", values: { number: "\"72\"" }, expect: "3A", note: "72₈ = 3A₁₆" },
    { label: "places=4 → 003A", type: "ok", values: { number: "\"72\"", places: "4" }, expect: "003A", note: "前导补 0" },
    { label: "8 非法八进制" + " → " + "#NUM!", type: "error", values: { number: "\"8\"" }, expect: "#NUM!", note: "8 非法八进制" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"77777777777\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default oct2hexEntry;
