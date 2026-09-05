import type { FunctionEntry } from '@/types';

/**
 * MULTINOMIAL · 多项系数
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const multinomialEntry: FunctionEntry = {
  id: 'multinomial',
  enName: 'MULTINOMIAL',
  zhName: '多项系数',
  zhCommon: ['多项系数', '多项式系数', '多重组合'],
  alias: ['多项式展开系数', '多类分组数', '多重排列'],
  category: 'math',
  abbr: 'dxxs',
  pinyin: 'duoxiangxishu',
  keywords: ['多项系数', '多项式展开', '多重组合', '分组计数', '排列组合', '计数函数'],
  difficulty: 3,
  usageLevel: 14,
  version: {
    min: 'all',
    label: 'Excel 2003 起可用',
    notes:
      '多项系数 = (各数之和)! / (各数阶乘之积)。它等于「把总数分成若干指定大小的组」的分配方式数。',
  },
  oneLiner: '把一堆数分成指定几堆的方案数',
  summary:
    '多项系数是组合数的推广：把 n 个东西分成「大小分别为 a、b、c…」的好几堆，有多少种分法？公式就是 (a+b+c+…)! / (a!·b!·c!·…)。比如 MULTINOMIAL(2,3,4) 表示把 9 个物体分成 2、3、4 三堆，结果是 1260。参数可以是一串数字，也可以直接框一个区域。',
  syntax: {
    patternCn: '=MULTINOMIAL(数字1, [数字2], …)',
    patternEn: '=MULTINOMIAL(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一堆的大小，也是必填参数。',
        accepts: '非负整数或单元格，如 2、A2。也支持直接框一个区域。',
        ifOmitted: '必填，至少给一个数。',
        tip: '可以混用单值和区域：=MULTINOMIAL(A2:A4) 或 =MULTINOMIAL(2,3,4)。',
        example: '2',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '数字2',
        en: 'number2',
        required: false,
        desc: '第二堆及以后各堆的大小。',
        accepts: '同「数字1」。',
        ifOmitted: '只给一个数时退化为 1（把 n 个分成一堆只有 1 种分法）。',
        tip: '堆数不限，用逗号往后接即可。',
        example: '3',
      },
    ],
  },
  returnValue:
    '返回多项系数 (sum)!/(a!·b!·…)，即把总数分成指定大小各堆的分配方式数；任何数为负返回 #NUM!。',
  examples: [
    {
      title: '示例 1：把 9 个物体分成 2、3、4 三堆',
      scene: '分组计数，各组大小已定，问有多少种分法。',
      dataTsv: '堆大小\n2\n3\n4',
      dataAnchor: 'A1',
      formula: '=MULTINOMIAL(A2:A4)',
      result: '9! / (2!·3!·4!) = 362880 / 288 = 1260',
      explanation: '总数 9，分成 2、3、4 三堆的方案数 = 1260。直接框区域 A2:A4 即可。',
    },
    {
      title: '示例 2：用逗号直接写多个数',
      scene: '不想先列小表，直接把堆大小写在公式里。',
      dataTsv: 'x\n1',
      dataAnchor: 'A1',
      formula: '=MULTINOMIAL(2,3,4)',
      result: '1260（与示例 1 等价）',
      explanation: '参数可以是一个个散写的数字，效果和框区域一样。',
    },
    {
      title: '示例 3：和组合数 COMBIN 的关系',
      scene: '两堆时多项系数就退化成组合数。',
      dataTsv: '两堆\n3\n5',
      dataAnchor: 'A1',
      formula: '=MULTINOMIAL(A2,A3)&" = COMBIN(8,3)"',
      result: '56 = 56（把 8 个分 3 和 5 两堆 = 先从 8 选 3）',
      explanation: '只有两堆时，MULTINOMIAL(a,b) 等于 COMBIN(a+b, a)，本质都是「先选第一堆」的选法数。',
    },
  ],
  pitfalls: [
    {
      title: '参数为负数，报 #NUM!',
      reason: '堆大小不能是负数，出现负数时 MULTINOMIAL 返回 #NUM!。',
      fix: '先确认每组大小 ≥0；负数多半是上游算错，检查一下来源。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '以为和 COMBIN 结果一样',
      reason:
        '多项系数是「多堆划分」，堆数 >2 时它比任何单组 COMBIN 都大，不能直接套组合数。',
      fix: '两堆才等于 COMBIN；三堆及以上用 MULTINOMIAL，或拆成连续 COMBIN 相乘。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'combin',
      kind: 'confusable',
      why: '两堆时多项系数退化成 COMBIN；多堆时得用 MULTINOMIAL，别只用 COMBIN。',
    },
    {
      id: 'fact',
      kind: 'companion',
      why: '多项系数公式底层就是一堆 FACT 相除，理解 FACT 更好懂它。',
    },
    {
      id: 'permut',
      kind: 'companion',
      why: '同属计数家族，PERMUT 管排列、MULTINOMIAL 管多堆分组。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number1', label: '数字1', type: 'number', default: '2' },
      { key: 'number2', label: '数字2', type: 'number', default: '3' },
      { key: 'number3', label: '数字3', type: 'number', default: '4' },
      { key: 'number4', label: '数字4（可选）', type: 'number', default: '' },
      { key: 'number5', label: '数字5（可选）', type: 'number', default: '' },
    ],
    template: '=MULTINOMIAL({number1},{number2},{number3})',
    cases: [
      { label: 'MULTINOMIAL(2,3,4) → 1260', type: 'ok', values: { number1: '2', number2: '3', number3: '4' }, expect: '1260', note: '9!/(2!3!4!) = 362880/288 = 1260。' },
      { label: '含负数 -1 → #NUM!', type: 'error', values: { number1: '2', number2: '-1', number3: '4' }, expect: '#NUM!', note: '参数不能为负，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number1: 'abc', number2: '3', number3: '4' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default multinomialEntry;
