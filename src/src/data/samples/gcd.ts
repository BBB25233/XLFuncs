import type { FunctionEntry } from '@/types';

/**
 * GCD · 最大公约数（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 分数化简小表 */
const FRAC_TSV = '分子\t分母\n18\t24\n12\t30\n7\t13';

const gcdEntry: FunctionEntry = {
  id: 'gcd',
  enName: 'GCD',
  zhName: '最大公约数',
  zhCommon: ['最大公约数', '公约', '化简分数'],
  alias: ['公约数', '最大公因数', 'GCD'],
  category: 'math',
  abbr: 'zdgys',
  pinyin: 'zuidagongyueshu',
  keywords: ['最大公约数', '公因数', '化简分数', '约分', '整数公约', '整除最大数'],
  difficulty: 2,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '求几个整数的最大公约数',
  summary:
    'GCD 帮你找「能同时整除这几个数的最大整数」。做分数化简最常用：分子分母同除以 GCD，分数就化到最简。它一次能接受多个整数，小数会被先截断成整数再算（这点容易踩坑）。',
  syntax: {
    patternCn: '=GCD(整数1, [整数2], …)',
    patternEn: '=GCD(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '整数1',
        en: 'number1',
        required: true,
        desc: '第一个整数。',
        accepts: '整数或整数单元格，如 18、A2。',
        ifOmitted: '必填，至少给一个整数。',
        tip: '传小数会被截断取整（18.9 → 18）再算，不是四舍五入。',
        example: '18',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '整数2',
        en: 'number2',
        required: false,
        desc: '第二个及以后的整数，可继续用逗号追加。',
        accepts: '同「整数1」。',
        ifOmitted: '不写就只算第一个数本身的最大公约（即它自己）。',
        tip: '想求三个数的 GCD 就 =GCD(a,b,c)。',
        example: '24',
      },
    ],
  },
  returnValue: '返回所有参数里整数的最大公约数；含负数时按绝对值计算；含 0 时返回非 0 数的绝对值。',
  examples: [
    {
      title: '示例 1：化简分数 18/24',
      scene: '有一堆分数，要自动约到最简，手动除太累。',
      dataTsv: FRAC_TSV,
      dataAnchor: 'A1',
      formula: '=GCD(A2,B2)',
      result: 'GCD(18,24)=6，所以 18/24 约成 3/4',
      explanation: '算出来分子分母的最大公约是 6，分子分母同除以 6 即得最简分数。',
    },
    {
      title: '示例 2：配合得到最简分数分子/分母',
      scene: '不光要 GCD，还要直接算出约分后的分子分母。',
      dataTsv: FRAC_TSV,
      dataAnchor: 'A1',
      formula: '=A2/GCD(A2,B2)&"/"&B2/GCD(A2,B2)',
      result: '18/24 → "3/4"；12/30 → "2/5"；7/13 → "7/13"',
      explanation: '分子分母分别除以 GCD，再用 & 拼成「分子/分母」的文本。',
    },
    {
      title: '示例 3：三个数的最大公约数',
      scene: '一批包装要分装成同样大小的整数份，找能整除三组数量的最大份数。',
      dataTsv: 'A\tB\tC\n12\t18\t30',
      dataAnchor: 'A1',
      formula: '=GCD(A2,B2,C2)',
      result: 'GCD(12,18,30)=6',
      explanation: 'GCD 支持多参数，直接把三列一起丢进去找共同的最大公约数。',
    },
  ],
  pitfalls: [
    {
      title: '传入小数被截断而非四舍五入',
      reason: 'GCD 只接受整数，Excel 会先把小数「直接砍掉」取整：GCD(18.9,24) 实际算的是 GCD(18,24)=6，和你预期的 19 无关。',
      fix: '先用 ROUND/INT 把小数转成你想要的整值再传：=GCD(ROUND(A2,0),B2)。',
      level: 'high',
    },
    {
      title: '参数里有负数',
      reason: 'GCD 计算时按绝对值处理，不会报错，但结果可能和你「带符号」的直觉不同。',
      fix: '先 ABS 再算，或确认负号是无心之失：=GCD(ABS(A2),B2)。',
      level: 'mid',
    },
    {
      title: '传了非整数文本报 #VALUE!',
      reason: 'GCD 不容忍文本型数字或文字，会直接报 #VALUE!。',
      fix: '用 VALUE() 转数字，或确保单元格是标准数字格式。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'lcm',
      kind: 'companion',
      why: 'GCD 找最大公约数、LCM 找最小公倍数，是整数的两个互补运算。',
    },
    {
      id: 'mod',
      kind: 'confusable',
      why: 'MOD 是取余数、GCD 是取公约，都跟整除有关但用途完全不同。',
    },
    {
      id: 'quotient',
      kind: 'confusable',
      why: 'QUOTIENT 是整除的商、GCD 是公约，别把「约分」和「求商」搞混。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number1', label: '数字1', type: 'number', default: '12' },
      { key: 'number2', label: '数字2', type: 'number', default: '18' },
      { key: 'number3', label: '数字3（可选）', type: 'number', default: '' },
      { key: 'number4', label: '数字4（可选）', type: 'number', default: '' },
      { key: 'number5', label: '数字5（可选）', type: 'number', default: '' },
    ],
    template: '=GCD({number1},{number2})',
    cases: [
      { label: 'GCD(12,18) → 6', type: 'ok', values: { number1: '12', number2: '18' }, expect: '6', note: '12 和 18 的最大公约数是 6。' },
      { label: 'GCD(0,5) → 5', type: 'ok', values: { number1: '0', number2: '5' }, expect: '5', note: '与 0 的最大公约数是另一个数本身。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number1: 'abc', number2: '18' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
      { label: '全部留空 → #VALUE!', type: 'error', values: { number1: '', number2: '' }, expect: '#VALUE!', note: '一个参数都没填会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default gcdEntry;
