import type { FunctionEntry } from '@/types';

/** HEX2OCT · 十六进制转八进制（engineering 类 B9 批次） */

const hex2octEntry: FunctionEntry = {
  id: 'hex2oct',
  enName: 'HEX2OCT',
  zhName: '十六进制转八进制',
  zhCommon: ['HEX2OCT', '十六进制'],
  alias: ['16 进制转 8 进制'],
  category: 'engineering',
  abbr: 'sljzzbjz',
  pinyin: 'shiliujinzhizhuanbajinzhi',
  keywords: ['hex2oct', '进制', '十六进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把十六进制数转成八进制',
  summary: 'HEX2OCT 把十六进制文本转成八进制文本，可指定位数。',
  syntax: { patternCn: '=HEX2OCT(十六进制文本, [位数])', patternEn: '=HEX2OCT(number, [places])', args: [{ key: 'number', zh: '十六进制文本', en: 'number', required: true, desc: '十六进制字符串' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '八进制文本',
  examples: [
    {
      title: '示例：转八进制',
      scene: '十六进制 FF',
      dataAnchor: 'A2',
      formula: '=HEX2OCT("FF")',
      result: '377',
      explanation: 'FF₁₆ = 377₈。',
    },
    {
      title: '示例：0xFFF 是 7777，不能按位硬拼',
      scene: '权限掩码习惯写八进制，设备文档给的是 0xFFF，想换成 7777 好和配置说明对照。',
      dataAnchor: 'A2',
      formula: '=HEX2OCT("FFF")',
      result: '7777',
      explanation:
        '十六进制 1 位对 4 个二进制位、八进制 1 位对 3 个，位数对不齐就不能一位换一位地抄。正确做法是先落到同一个十进制值：FFF₁₆ = 4095₁₀ = 7777₈。',
    },
  ],
  pitfalls: [{ title: '位数上限', reason: 'HEX2OCT 最多 10 位八进制。', fix: '位数不超 10。', level: 'low' }],
  related: [{ id: 'oct2hex', kind: 'companion', why: 'OCT2HEX 与本品类相关' },
    { id: 'hex2dec', kind: 'companion', why: 'HEX2DEC 与本品类相关' },
    { id: 'hex2bin', kind: 'companion', why: 'HEX2BIN 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "HEX 文本", type: "text", default: "\"F\"" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=HEX2OCT({number},{places})",
  cases: [
    { label: "F₁₆ → 17₈", type: "ok", values: { number: "\"F\"" }, expect: "17", note: "F₁₆ = 17₈" },
    { label: "places=4 → 0017", type: "ok", values: { number: "\"F\"", places: "4" }, expect: "0017", note: "前导补 0" },
    { label: "G 非法十六进制" + " → " + "#NUM!", type: "error", values: { number: "\"G\"" }, expect: "#NUM!", note: "G 非法十六进制" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"11111111111\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default hex2octEntry;
