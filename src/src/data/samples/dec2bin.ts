import type { FunctionEntry } from '@/types';

/** DEC2BIN · 十进制转二进制（engineering 类 B9 批次） */

const dec2binEntry: FunctionEntry = {
  id: 'dec2bin',
  enName: 'DEC2BIN',
  zhName: '十进制转二进制',
  zhCommon: ['DEC2BIN', '十进制'],
  alias: ['10 进制转 2 进制'],
  category: 'engineering',
  abbr: 'sjzzejz',
  pinyin: 'shijinzhizhuanerjinzhi',
  keywords: ['dec2bin', '进制', '十进制'],
  difficulty: 2,
  usageLevel: 5,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把十进制数转成二进制',
  summary: 'DEC2BIN 把 -512~511 的十进制整数转成二进制文本，可指定位数。',
  syntax: { patternCn: '=DEC2BIN(数值, [位数])', patternEn: '=DEC2BIN(number, [places])', args: [{ key: 'number', zh: '数值', en: 'number', required: true, desc: '十进制整数（-512~511）' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '二进制文本',
  examples: [{ title: '示例：转二进制', scene: '十进制 100', dataAnchor: 'A2', formula: '=DEC2BIN(100)', result: '1100100', explanation: '100₁₀ = 1100100₂。' }],
  pitfalls: [{ title: '范围限制', reason: '超出 -512~511 会 #NUM!。', fix: '范围外先拆算。', level: 'mid' }],
  related: [{ id: 'bin2dec', kind: 'companion', why: 'BIN2DEC 与本品类相关' },
    { id: 'dec2hex', kind: 'companion', why: 'DEC2HEX 与本品类相关' },
    { id: 'dec2oct', kind: 'companion', why: 'DEC2OCT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "十进制数", type: "number", default: "42" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=DEC2BIN({number},{places})",
  cases: [
    { label: "42 → 101010₂", type: "ok", values: { number: "42" }, expect: "101010", note: "42 = 101010₂" },
    { label: "places=4 → 0101", type: "ok", values: { number: "5", places: "4" }, expect: "0101", note: "前导补 0" },
    { label: "小数报 #NUM!" + " → " + "#NUM!", type: "error", values: { number: "5.5" }, expect: "#NUM!", note: "小数报 #NUM!" },
    { label: "超过范围 511" + " → " + "#NUM!", type: "error", values: { number: "512" }, expect: "#NUM!", note: "超过范围 511" },
    { label: "低于范围 -512" + " → " + "#NUM!", type: "error", values: { number: "-513" }, expect: "#NUM!", note: "低于范围 -512" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default dec2binEntry;
