import type { FunctionEntry } from '@/types';

/** OCT2BIN · 八进制转二进制（engineering 类 B9 批次） */

const oct2binEntry: FunctionEntry = {
  id: 'oct2bin',
  enName: 'OCT2BIN',
  zhName: '八进制转二进制',
  zhCommon: ['OCT2BIN', '八进制'],
  alias: ['8 进制转 2 进制'],
  category: 'engineering',
  abbr: 'bjzzejz',
  pinyin: 'bajinzhizhuanerjinzhi',
  keywords: ['oct2bin', '进制', '八进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把八进制数转成二进制',
  summary: 'OCT2BIN 把八进制文本转成二进制文本，可指定位数。',
  syntax: { patternCn: '=OCT2BIN(八进制文本, [位数])', patternEn: '=OCT2BIN(number, [places])', args: [{ key: 'number', zh: '八进制文本', en: 'number', required: true, desc: '八进制字符串' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '二进制文本',
  examples: [{ title: '示例：转二进制', scene: '八进制 72', dataAnchor: 'A2', formula: '=OCT2BIN("72")', result: '111010', explanation: '72₈ = 111010₂。' }],
  pitfalls: [{ title: '位数上限', reason: 'OCT2BIN 最多 10 位二进制。', fix: '位数不超 10。', level: 'low' }],
  related: [{ id: 'bin2oct', kind: 'companion', why: 'BIN2OCT 与本品类相关' },
    { id: 'oct2dec', kind: 'companion', why: 'OCT2DEC 与本品类相关' },
    { id: 'oct2hex', kind: 'companion', why: 'OCT2HEX 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "OCT 文本", type: "text", default: "\"72\"" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=OCT2BIN({number},{places})",
  cases: [
    { label: "72₈ → 111010₂", type: "ok", values: { number: "\"72\"" }, expect: "111010", note: "72₈ = 111010₂" },
    { label: "places=8 → 00111010", type: "ok", values: { number: "\"72\"", places: "8" }, expect: "00111010", note: "前导补 0" },
    { label: "8 非法八进制" + " → " + "#NUM!", type: "error", values: { number: "\"8\"" }, expect: "#NUM!", note: "8 非法八进制" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"77777777777\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default oct2binEntry;
