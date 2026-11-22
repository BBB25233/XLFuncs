import type { FunctionEntry } from '@/types';

/** DEC2HEX · 十进制转十六进制（engineering 类 B9 批次） */

const dec2hexEntry: FunctionEntry = {
  id: 'dec2hex',
  enName: 'DEC2HEX',
  zhName: '十进制转十六进制',
  zhCommon: ['DEC2HEX', '十进制'],
  alias: ['10 进制转 16 进制'],
  category: 'engineering',
  abbr: 'sjzzsljz',
  pinyin: 'shijinzhizhuanshiliujinzhi',
  keywords: ['dec2hex', '进制', '十进制'],
  difficulty: 2,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把十进制数转成十六进制',
  summary: 'DEC2HEX 把十进制整数转成十六进制文本，可指定位数。',
  syntax: { patternCn: '=DEC2HEX(数值, [位数])', patternEn: '=DEC2HEX(number, [places])', args: [{ key: 'number', zh: '数值', en: 'number', required: true, desc: '十进制整数' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '十六进制文本',
  examples: [
    {
      title: '示例：转十六进制',
      scene: '十进制 255',
      dataAnchor: 'A2',
      formula: '=DEC2HEX(255)',
      result: 'FF',
      explanation: '255₁₀ = FF₁₆。',
    },
    {
      title: '示例：负数按 40 位补码输出，−1 是 10 个 F',
      scene: '温度传感器给的是有符号数 −1，转成十六进制准备填进报文，结果得到一长串 F。',
      dataAnchor: 'A2',
      formula: '=DEC2HEX(-1)',
      result: 'FFFFFFFFFF',
      explanation:
        '负十进制一律按 40 位（10 位十六进制）补码输出：−1 就是 10 个 F，不是「-1」也不是 1 个 F。只想要低 4 位（16 位整数）得自己截：=RIGHT(DEC2HEX(-1),4) 得到 FFFF。',
    },
  ],
  pitfalls: [{ title: '负数用补码', reason: '负十进制按二进制补码输出。', fix: '负数结果是其补码的十六进制。', level: 'low' }],
  related: [{ id: 'hex2dec', kind: 'companion', why: 'HEX2DEC 与本品类相关' },
    { id: 'dec2bin', kind: 'companion', why: 'DEC2BIN 与本品类相关' },
    { id: 'dec2oct', kind: 'companion', why: 'DEC2OCT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "十进制数", type: "number", default: "255" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=DEC2HEX({number},{places})",
  cases: [
    { label: "255 → FF₁₆", type: "ok", values: { number: "255" }, expect: "FF", note: "255 = FF₁₆" },
    { label: "places=4 → 00FF", type: "ok", values: { number: "255", places: "4" }, expect: "00FF", note: "前导补 0" },
    { label: "小数报 #NUM!" + " → " + "#NUM!", type: "error", values: { number: "5.5" }, expect: "#NUM!", note: "小数报 #NUM!" },
    { label: "超过 2^39" + " → " + "#NUM!", type: "error", values: { number: "549755813888" }, expect: "#NUM!", note: "超过 2^39" },
    { label: "低于 -2^39+1" + " → " + "#NUM!", type: "error", values: { number: "-549755813889" }, expect: "#NUM!", note: "低于 -2^39+1" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default dec2hexEntry;
