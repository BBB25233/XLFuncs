import type { FunctionEntry } from '@/types';

/** BIN2HEX · 二进制转十六进制（engineering 类 B9 批次） */

const bin2hexEntry: FunctionEntry = {
  id: 'bin2hex',
  enName: 'BIN2HEX',
  zhName: '二进制转十六进制',
  zhCommon: ['BIN2HEX', '二进制'],
  alias: ['2 进制转 16 进制'],
  category: 'engineering',
  abbr: 'ejzzsljz',
  pinyin: 'erjinzhizhuanshiliujinzhi',
  keywords: ['bin2hex', '进制', '二进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把二进制数转成十六进制',
  summary: 'BIN2HEX 把二进制文本转成十六进制文本，可指定结果位数（用前导 0 或补码）。',
  syntax: { patternCn: '=BIN2HEX(二进制文本, [位数])', patternEn: '=BIN2HEX(number, [places])', args: [{ key: 'number', zh: '二进制文本', en: 'number', required: true, desc: '二进制字符串' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '十六进制文本',
  examples: [
    {
      title: '示例：转十六进制',
      scene: '二进制 1111',
      dataAnchor: 'A2',
      formula: '=BIN2HEX("1111")',
      result: 'F',
      explanation: '1111₂ = F₁₆。',
    },
    {
      title: '示例：第 2 参数补齐位数，按 4 位十六进制对齐',
      scene: '设备手册把寄存器地址都写成 4 位十六进制，1111 这种短串要补成 000F 才好逐位对照。',
      dataAnchor: 'A2',
      formula: '=BIN2HEX("1111",4)',
      result: '000F',
      explanation:
        '第 2 参数是「最少位数」，不够就在左边补 0，所以 1111₂ 会变成 000F 而不是 F。补位只对非负结果生效：负数本来就按 10 位补码满宽输出，再补也没意义。',
    },
  ],
  pitfalls: [{ title: 'places 不足报错', reason: '结果位数超过 places 会 #NUM!。', fix: 'places 取足够大或省略。', level: 'low' }],
  related: [{ id: 'hex2bin', kind: 'companion', why: 'HEX2BIN 与本品类相关' },
    { id: 'bin2dec', kind: 'companion', why: 'BIN2DEC 与本品类相关' },
    { id: 'bin2oct', kind: 'companion', why: 'BIN2OCT 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "BIN 文本", type: "text", default: "\"101010\"" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=BIN2HEX({number},{places})",
  cases: [
    { label: "101010₂ → 2A₁₆", type: "ok", values: { number: "\"101010\"" }, expect: "2A", note: "101010₂ = 2A₁₆" },
    { label: "places=4 → 002A", type: "ok", values: { number: "\"101010\"", places: "4" }, expect: "002A", note: "前导补 0" },
    { label: "二进制只含 0/1" + " → " + "#NUM!", type: "error", values: { number: "\"12\"" }, expect: "#NUM!", note: "二进制只含 0/1" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"11111111111\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default bin2hexEntry;
