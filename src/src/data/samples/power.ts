import type { FunctionEntry } from '@/types';

/**
 * POWER · 乘幂（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 复利小表 */
const CMP_TSV = '本金\t年利率\t年数\n1000\t0.05\t3';

const powerEntry: FunctionEntry = {
  id: 'power',
  enName: 'POWER',
  zhName: '乘幂',
  zhCommon: ['乘幂', '幂函数', '次方'],
  alias: ['求幂', '几次方', '指数运算'],
  category: 'math',
  abbr: 'cm',
  pinyin: 'chengmi',
  keywords: ['乘幂', '求幂', '次方', '指数运算', '平方', '立方', '复利'],
  difficulty: 1,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'POWER(数, 指数) 等价于 数^指数，用 ^ 运算符写更短。负数底数的分数次幂会返回 #NUM!。',
  },
  oneLiner: '算出一个数的几次方',
  summary:
    'POWER 就是「乘方」：POWER(2,3)=2×2×2=8，POWER(10,2)=100。复利、面积体积、科学计算都离不了它。它和 ^ 运算符完全等价（2^3 就是 POWER(2,3)），也别和 PRODUCT（连乘一堆数）搞混——POWER 是「同一个数自乘」。',
  syntax: {
    patternCn: '=POWER(底数, 指数)',
    patternEn: '=POWER(number, power)',
    args: [
      {
        key: 'number',
        zh: '底数',
        en: 'number',
        required: true,
        desc: '要被乘方（自乘）的那个数。',
        accepts: '数字或单元格，如 2、A2。',
        ifOmitted: '必填。',
        tip: '负数底数配整数指数没问题；配分数指数会报 #NUM!。',
        example: '2',
        pitfallRank: 2,
      },
      {
        key: 'power',
        zh: '指数',
        en: 'power',
        required: true,
        desc: '乘几次方：2=平方、3=立方、0.5=开平方、1/3=开立方。',
        accepts: '数字或单元格，如 2、1/2、A2。',
        ifOmitted: '必填。',
        tip: '指数为 0.5 等价于 SQRT；负指数表示「1 除以该数的正次幂」。',
        example: '3',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回底数的指定次幂；底数为负且指数为非整数（分数）时返回 #NUM!。',
  examples: [
    {
      title: '示例 1：算平方、立方',
      scene: '面积要平方、体积要立方，手算麻烦。',
      dataTsv: '边长\n5',
      dataAnchor: 'A1',
      formula: '=POWER(A2,2)',
      result: '5² = 25（面积）；=POWER(A2,3) 得 125（体积）',
      explanation: '第二参数 2 是平方、3 是立方，直接给指数即可。',
    },
    {
      title: '示例 2：复利终值',
      scene: '本金 1000、年利率 5%、存 3 年，算到期本利和。',
      dataTsv: CMP_TSV,
      dataAnchor: 'A1',
      formula: '=A2*POWER(1+B2,C2)',
      result: '1000×(1.05)^3 ≈ 1157.63',
      explanation: '复利就是「本金 × (1+利率)^年数」，POWER 负责把 (1+利率) 自乘年数这么多次。',
    },
    {
      title: '示例 3：用 0.5 当开方（等价于 SQRT）',
      scene: '想开平方但忘了 SQRT，用 POWER 也能凑。',
      dataTsv: '数值\n16',
      dataAnchor: 'A1',
      formula: '=POWER(A2,0.5)',
      result: '16^0.5 = 4（同 SQRT(16)）',
      explanation: '指数为 0.5 就是平方根；1/3 是立方根。不过开方还是建议直接 SQRT 更直观。',
    },
  ],
  pitfalls: [
    {
      title: '负数底数 + 分数指数报 #NUM!',
      reason: 'POWER(-8, 1/3) 这类「负数开偶次根」在实数里没意义，Excel 直接报 #NUM!。',
      fix: '先 ABS 取正再开根：=POWER(ABS(A2),1/3)；或确认底数应为非负。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '和 PRODUCT 混淆',
      reason: 'POWER(2,3) 是 2 自乘 3 次（=8）；PRODUCT(2,3) 是把 2 和 3 相乘（=6）。一个自乘、一个连乘，别用错。',
      fix: '同一个数多次方用 POWER；不同数相乘用 PRODUCT。',
      level: 'mid',
    },
    {
      title: '以为指数只能是整数',
      reason: 'POWER 的指数可以是任何实数，0.5 是开方、负数是指倒数的正次幂（如 2^-1=0.5）。',
      fix: '要开方/负次幂直接用小数或负数指数，不必硬凑整数。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'product',
      kind: 'confusable',
      why: 'POWER 是「同一个数自乘」、PRODUCT 是「不同数相乘」，概念别混。',
    },
    {
      id: 'sqrt',
      kind: 'companion',
      why: 'SQRT 是 POWER(数,0.5) 的专用写法，开方更直观时直接用 SQRT。',
    },
    {
      id: 'sumsq',
      kind: 'companion',
      why: 'SUMSQ 把各数平方后求和，里面每个平方就是 POWER(数,2)，常一起用于方差类计算。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '底数', type: 'number', default: '2' },
      { key: 'power', label: '指数', type: 'number', default: '10' },
    ],
    template: '=POWER({number},{power})',
    cases: [
      { label: 'POWER(2,10) → 1024', type: 'ok', values: { number: '2', power: '10' }, expect: '1024', note: '2 的 10 次方是 1024。' },
      { label: 'POWER(5,2) → 25', type: 'ok', values: { number: '5', power: '2' }, expect: '25', note: '5 的平方是 25。' },
      { label: '负底数且小数指数 → #NUM!', type: 'error', values: { number: '-4', power: '0.5' }, expect: '#NUM!', note: '负底数的非整数指数会算出复数，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc', power: '2' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default powerEntry;
