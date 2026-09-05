import type { FunctionEntry } from '@/types';

/**
 * QUOTIENT · 商的整数部分（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 分箱小表 */
const BOX_TSV = '总数\t每箱容量\n23\t5\n17\t5\n10\t5';

const quotientEntry: FunctionEntry = {
  id: 'quotient',
  enName: 'QUOTIENT',
  zhName: '商的整数部分',
  zhCommon: ['商的整数部分', '整除', '取整商'],
  alias: ['整除', '取商', '去余数'],
  category: 'math',
  abbr: 'sdzsbf',
  pinyin: 'shangdezhengshubufen',
  keywords: ['商的整数部分', '整除', '取整商', '舍去余数', '装箱', '分组数'],
  difficulty: 2,
  usageLevel: 28,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '只保留除法结果里整数部分',
  summary:
    'QUOTIENT 做除法但把余数直接扔掉，只留商的整数部分：QUOTIENT(23,5)=4（23÷5 商 4 余 3，它只给你 4）。和 INT(数/除数) 的区别在于负数：QUOTIENT 是「朝 0 截断」（只砍小数），INT 是「向下取整」。要算「能装满几整箱」用最合适。',
  syntax: {
    patternCn: '=QUOTIENT(被除数, 除数)',
    patternEn: '=QUOTIENT(numerator, denominator)',
    args: [
      {
        key: 'numerator',
        zh: '被除数',
        en: 'numerator',
        required: true,
        desc: '要被除的数。',
        accepts: '数字或单元格，如 A2、23。',
        ifOmitted: '必填。',
        tip: '结果只保留整数商，余数被丢弃。',
        example: '23',
        pitfallRank: 2,
      },
      {
        key: 'denominator',
        zh: '除数',
        en: 'denominator',
        required: true,
        desc: '用来除的数。',
        accepts: '非零数字，如 5、B2。',
        ifOmitted: '必填，且不能为 0。',
        tip: '除数为 0 会报 #DIV/0!。',
        example: '5',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 numerator 除以 denominator 的商的整数部分（朝 0 截断）；除数为 0 时返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：23 个苹果每箱装 5 个，能装满几箱',
      scene: '装箱问题，只关心「完整的整箱」有几个，零头不管。',
      dataTsv: BOX_TSV,
      dataAnchor: 'A1',
      formula: '=QUOTIENT(A2,B2)',
      result: '23÷5=4（满 4 箱，余 3 个不算）；17÷5=3；10÷5=2',
      explanation: 'QUOTIENT 直接丢弃余数，给出能装满的整箱数。',
    },
    {
      title: '示例 2：与 MOD 配合，同时拿到商和余',
      scene: '既想知道装几箱，也想知道剩几个。',
      dataTsv: BOX_TSV,
      dataAnchor: 'A1',
      formula: '=QUOTIENT(A2,B2)&"箱剩"&MOD(A2,B2)&"个"',
      result: '23 → "4箱剩3个"；17 → "3箱剩2个"',
      explanation: 'QUOTIENT 拿商、MOD 拿余数，两者拼起来就是完整的「箱+余」。',
    },
    {
      title: '示例 3：负数时 QUOTIENT 与 INT 结果不同',
      scene: '亏损分摊等出现负数场景，要确认你要的是哪种「取整」。',
      dataTsv: '被除数\t除数\n-23\t5',
      dataAnchor: 'A1',
      formula: '=QUOTIENT(A2,B2)',
      result: 'QUOTIENT(-23,5) = -4（朝0截断，扔掉余数）',
      explanation: 'INT(-23/5)=INT(-4.6)=-5（向下取整），而 QUOTIENT(-23,5)=-4。负数时两者不一样，按需选取。',
    },
  ],
  pitfalls: [
    {
      title: '除数为 0 报 #DIV/0!',
      reason: 'QUOTIENT(数,0) 数学上无意义，直接报除零，且会传染整条公式。',
      fix: '确保除数非 0；来源为引用时先 IFERROR 或 IF(除数=0, …) 兜底。',
      level: 'high',
      errorCode: '#DIV/0!',
    },
    {
      title: '以为 QUOTIENT 会四舍五入',
      reason: 'QUOTIENT 只「砍」小数不进位，23÷5=4.6 也是 4，没有四舍五入。',
      fix: '要四舍五入用 ROUND(数/除数,0)；要保留余数用 MOD。',
      level: 'mid',
    },
    {
      title: '负数时和 INT 混淆',
      reason: 'QUOTIENT 朝 0 截断（只砍小数），INT 向下取整，负数时结果不同（-23/5：QUOTIENT=-4，INT=-5）。',
      fix: '要「朝 0 去尾」用 QUOTIENT；要「向下取整」用 INT。',
      level: 'high',
    },
  ],
  related: [
    {
      id: 'mod',
      kind: 'companion',
      why: 'QUOTIENT 给商、MOD 给余数，装箱/分组时两者常一起出现。',
    },
    {
      id: 'int',
      kind: 'confusable',
      why: '都做整除取整，但负数时 QUOTIENT 朝 0、INT 向负无穷，结果不同。',
    },
    {
      id: 'rounddown',
      kind: 'confusable',
      why: 'ROUNDDOWN(数/除数,0) 也是朝 0 去尾，和 QUOTIENT 正数时等价，但写法更啰嗦。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number1', label: '被除数', type: 'number', default: '7' },
      { key: 'number2', label: '除数', type: 'number', default: '2' },
    ],
    template: '=QUOTIENT({number1},{number2})',
    cases: [
      { label: 'QUOTIENT(7,2) → 3', type: 'ok', values: { number1: '7', number2: '2' }, expect: '3', note: '7÷2 的整数部分是 3。' },
      { label: 'QUOTIENT(-7,2) → -3', type: 'ok', values: { number1: '-7', number2: '2' }, expect: '-3', note: '向零取整，-3.5 → -3。' },
      { label: '除数为 0 → #DIV/0!', type: 'error', values: { number1: '7', number2: '0' }, expect: '#DIV/0!', note: '除数为 0 报 #DIV/0!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number1: 'abc', number2: '2' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default quotientEntry;
