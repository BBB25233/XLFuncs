import type { FunctionEntry } from '@/types';

/** BIN2OCT · 二进制转八进制（engineering 类 B9 批次） */

const bin2octEntry: FunctionEntry = {
  id: 'bin2oct',
  enName: 'BIN2OCT',
  zhName: '二进制转八进制',
  zhCommon: ['BIN2OCT', '二进制'],
  alias: ['2 进制转 8 进制'],
  category: 'engineering',
  abbr: 'ejzzbjz',
  pinyin: 'erjinzhizhuanbajinzhi',
  keywords: ['bin2oct', '进制', '二进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把二进制数转成八进制',
  summary: 'BIN2OCT 把二进制文本转成八进制文本，可指定结果位数。',
  syntax: { patternCn: '=BIN2OCT(二进制文本, [位数])', patternEn: '=BIN2OCT(number, [places])', args: [{ key: 'number', zh: '二进制文本', en: 'number', required: true, desc: '二进制字符串' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '八进制文本',
  examples: [
    {
      title: '示例：转八进制',
      scene: '二进制 101010',
      dataAnchor: 'A2',
      formula: '=BIN2OCT("101010")',
      result: '52',
      explanation: '101010₂ = 52₈。',
    },
    {
      title: '示例：转出来是 10 个 7，说明这是个负数',
      scene: '把一批 10 位有符号二进制统一转成八进制存档，发现有些结果突然变成满满的 10 位。',
      dataAnchor: 'A2',
      formula: '=BIN2OCT("1111111111")',
      result: '7777777777',
      explanation:
        '1111111111 是 10 位补码的 −1，转成八进制按 30 位补码写满，就是 10 个 7。正数最多 3 位（111111111 → 777），所以一看到满 10 位、首位还 ≥4，就该想到这是负数。',
    },
  ],
  pitfalls: [{ title: '与进制对应', reason: '二进制按 3 位一组对应八进制。', fix: '每 3 位二进制=1 位八进制。', level: 'low' }],
  related: [{ id: 'oct2bin', kind: 'companion', why: 'OCT2BIN 与本品类相关' },
    { id: 'bin2dec', kind: 'companion', why: 'BIN2DEC 与本品类相关' },
    { id: 'bin2hex', kind: 'companion', why: 'BIN2HEX 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "BIN 文本", type: "text", default: "\"101010\"" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=BIN2OCT({number},{places})",
  cases: [
    { label: "101010₂ → 52₈", type: "ok", values: { number: "\"101010\"" }, expect: "52", note: "101010₂ = 52₈" },
    { label: "places=4 → 0052", type: "ok", values: { number: "\"101010\"", places: "4" }, expect: "0052", note: "前导补 0" },
    { label: "二进制只含 0/1" + " → " + "#NUM!", type: "error", values: { number: "\"12\"" }, expect: "#NUM!", note: "二进制只含 0/1" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"11111111111\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bin2octEntry;
