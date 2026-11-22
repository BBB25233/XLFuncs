import type { FunctionEntry } from '@/types';

/** OCT2DEC · 八进制转十进制（engineering 类 B9 批次） */

const oct2decEntry: FunctionEntry = {
  id: 'oct2dec',
  enName: 'OCT2DEC',
  zhName: '八进制转十进制',
  zhCommon: ['OCT2DEC', '八进制'],
  alias: ['8 进制转 10 进制'],
  category: 'engineering',
  abbr: 'bjzzsjz',
  pinyin: 'bajinzhizhuanshijinzhi',
  keywords: ['oct2dec', '进制', '八进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把八进制数转成十进制',
  summary: 'OCT2DEC 把最多 10 位的八进制文本转成十进制整数，最高位为符号位。',
  syntax: { patternCn: '=OCT2DEC(八进制文本)', patternEn: '=OCT2DEC(number)', args: [{ key: 'number', zh: '八进制文本', en: 'number', required: true, desc: '八进制字符串' }] },
  returnValue: '十进制整数',
  examples: [
    {
      title: '示例：转十进制',
      scene: '八进制 77',
      dataAnchor: 'A2',
      formula: '=OCT2DEC("77")',
      result: '63',
      explanation: '77₈ = 63₁₀。',
    },
    {
      title: '示例：10 个 7 是 −1，八进制也有符号位',
      scene: '从老设备导出的字段是 10 位八进制补码，7777777777 看着像个大数，转出来却是 −1。',
      dataAnchor: 'A2',
      formula: '=OCT2DEC("7777777777")',
      result: '-1',
      explanation:
        '八进制最高位是符号位：7777777777 是 10 位补码的 −1，满 10 位且首位 ≥4 基本就是负数。9 位以内才是纯正数，777777777 是 134217727。',
    },
  ],
  pitfalls: [{ title: '只含 0-7', reason: '八进制出现 8/9 会 #NUM!。', fix: '八进制只用 0-7。', level: 'mid' }],
  related: [{ id: 'dec2oct', kind: 'companion', why: 'DEC2OCT 与本品类相关' },
    { id: 'oct2bin', kind: 'companion', why: 'OCT2BIN 与本品类相关' },
    { id: 'oct2hex', kind: 'companion', why: 'OCT2HEX 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "OCT 文本", type: "text", default: "\"72\"" }
  ],
  template: "=OCT2DEC({number})",
  cases: [
    { label: "72₈ → 58", type: "ok", values: { number: "\"72\"" }, expect: "58", note: "72₈ = 58₁₀" },
    { label: "8 非法八进制" + " → " + "#NUM!", type: "error", values: { number: "\"8\"" }, expect: "#NUM!", note: "8 非法八进制" },
    { label: "文本为空" + " → " + "#NUM!", type: "error", values: { number: "\"\"" }, expect: "#NUM!", note: "文本为空" },
    { label: "超过 10 位" + " → " + "#NUM!", type: "error", values: { number: "\"77777777777\"" }, expect: "#NUM!", note: "超过 10 位" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default oct2decEntry;
