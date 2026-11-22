import type { FunctionEntry } from '@/types';

/** DEC2OCT · 十进制转八进制（engineering 类 B9 批次） */

const dec2octEntry: FunctionEntry = {
  id: 'dec2oct',
  enName: 'DEC2OCT',
  zhName: '十进制转八进制',
  zhCommon: ['DEC2OCT', '十进制'],
  alias: ['10 进制转 8 进制'],
  category: 'engineering',
  abbr: 'sjzzbjz',
  pinyin: 'shijinzhizhuanbajinzhi',
  keywords: ['dec2oct', '进制', '十进制'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把十进制数转成八进制',
  summary: 'DEC2OCT 把十进制整数转成八进制文本，可指定位数。',
  syntax: { patternCn: '=DEC2OCT(数值, [位数])', patternEn: '=DEC2OCT(number, [places])', args: [{ key: 'number', zh: '数值', en: 'number', required: true, desc: '十进制整数' },
    { key: 'places', zh: '位数', en: 'places', required: false, desc: '结果最少位数' }] },
  returnValue: '八进制文本',
  examples: [
    {
      title: '示例：转八进制',
      scene: '十进制 58',
      dataAnchor: 'A2',
      formula: '=DEC2OCT(58)',
      result: '72',
      explanation: '58₁₀ = 72₈。',
    },
    {
      title: '示例：上限是 536870911，多 1 就报 #NUM!',
      scene: '算权限掩码时把 2^29 当成了上限，写成 536870912，公式直接报错。',
      dataAnchor: 'A2',
      formula: '=DEC2OCT(536870912)',
      result: '#NUM!',
      explanation:
        'DEC2OCT 输出的是 10 位八进制补码，最大只能到 536870911（写出来是 3777777777），再大 1 就溢出报 #NUM!，负数一侧也有对应的下界。需要更大范围请改用 DEC2HEX。',
    },
  ],
  pitfalls: [{ title: '范围限制', reason: '超限会 #NUM!。', fix: '在支持范围内取值。', level: 'low' }],
  related: [{ id: 'oct2dec', kind: 'companion', why: 'OCT2DEC 与本品类相关' },
    { id: 'dec2bin', kind: 'companion', why: 'DEC2BIN 与本品类相关' },
    { id: 'dec2hex', kind: 'companion', why: 'DEC2HEX 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "十进制数", type: "number", default: "58" },
    { key: "places", label: "最少位数", type: "number", default: "" }
  ],
  template: "=DEC2OCT({number},{places})",
  cases: [
    { label: "58 → 72₈", type: "ok", values: { number: "58" }, expect: "72", note: "58 = 72₈" },
    { label: "places=4 → 0072", type: "ok", values: { number: "58", places: "4" }, expect: "0072", note: "前导补 0" },
    { label: "小数报 #NUM!" + " → " + "#NUM!", type: "error", values: { number: "5.5" }, expect: "#NUM!", note: "小数报 #NUM!" },
    { label: "超过 2^29" + " → " + "#NUM!", type: "error", values: { number: "536870912" }, expect: "#NUM!", note: "超过 2^29" },
    { label: "低于 -2^29+1" + " → " + "#NUM!", type: "error", values: { number: "-536870913" }, expect: "#NUM!", note: "低于 -2^29+1" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default dec2octEntry;
