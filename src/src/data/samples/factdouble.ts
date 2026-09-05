import type { FunctionEntry } from '@/types';

/**
 * FACTDOUBLE · 双阶乘
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const factdoubleEntry: FunctionEntry = {
  id: 'factdouble',
  enName: 'FACTDOUBLE',
  zhName: '双阶乘',
  zhCommon: ['双阶乘', '隔项相乘', 'n双阶乘'],
  alias: ['隔一个乘', '半阶乘', '双乘积'],
  category: 'math',
  abbr: 'sjc',
  pinyin: 'shuangjiecheng',
  keywords: ['双阶乘', '隔项连乘', 'n!!', '奇偶乘积', '排列组合', '数学函数'],
  difficulty: 3,
  usageLevel: 16,
  version: {
    min: 'all',
    label: 'Excel 2003 起可用',
    notes:
      '双阶乘符号是 n!!（两个感叹号），不是 (n!)!。它只乘同奇偶的数：偶数 6!!=6×4×2，奇数 7!!=7×5×3×1。',
  },
  oneLiner: '只乘和自己同奇偶的数（隔一个乘一个）',
  summary:
    '双阶乘 n!! 是「跳着乘」：偶数就 6×4×2，奇数就 7×5×3×1，每次减 2 直到乘到 2 或 1。它专门出现在某些排列（如错排、配对问题）和组合公式里。FACTDOUBLE(6)=48，FACTDOUBLE(7)=105。注意它和 (n!)! 完全不同。',
  syntax: {
    patternCn: '=FACTDOUBLE(数字)',
    patternEn: '=FACTDOUBLE(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要算双阶乘的非负整数 n。',
        accepts: '整数或单元格，如 6、A2。',
        ifOmitted: '必填参数，只有一个。',
        tip: '偶数从 n 往下每次减 2 乘到 2；奇数减 2 乘到 1。负数按定义 FACTDOUBLE(-1)=1、FACTDOUBLE(-2)=2。',
        example: '6',
        pitfallRank: 1,
      },
    ],
  },
  returnValue:
    '返回 n!!：偶数 n!!=n×(n-2)×…×2，奇数 n!!=n×(n-2)×…×1；n 为负奇数得 1、负偶数得 2。',
  examples: [
    {
      title: '示例 1：偶数双阶乘 6!!',
      scene: '算 6 的双阶乘，只乘偶数项。',
      dataTsv: 'n\n6',
      dataAnchor: 'A1',
      formula: '=FACTDOUBLE(A2)',
      result: '6×4×2 = 48',
      explanation: '从 6 开始每次减 2，乘到 2 为止：6×4×2=48。',
    },
    {
      title: '示例 2：奇数双阶乘 7!!',
      scene: '算 7 的双阶乘，只乘奇数项。',
      dataTsv: 'n\n7',
      dataAnchor: 'A1',
      formula: '=FACTDOUBLE(A2)',
      result: '7×5×3×1 = 105',
      explanation: '从 7 开始每次减 2，乘到 1 为止：7×5×3×1=105。',
    },
    {
      title: '示例 3：和 FACT 的差别',
      scene: '同样是 6，FACT(6) 和 FACTDOUBLE(6) 结果完全不同。',
      dataTsv: 'n\n6',
      dataAnchor: 'A1',
      formula: '=FACT(A2)&" vs "&FACTDOUBLE(A2)',
      result: '720 vs 48',
      explanation: 'FACT(6)=6×5×4×3×2×1=720（全乘），FACTDOUBLE(6)=6×4×2=48（只乘偶数项）。',
    },
  ],
  pitfalls: [
    {
      title: '把 n!! 当成 (n!)!（两个感叹号 ≠ 阶乘的阶乘）',
      reason:
        '双阶乘是两个感叹号，但不是「先算阶乘再算阶乘」。6!!=48，而 (6!)! 是个天文数字。',
      fix: '记住 FACTDOUBLE 是「隔项相乘」，永远比 FACT 小得多；需要 (n!)! 这种没有现成函数。',
      level: 'high',
    },
    {
      title: '误以为双阶乘一定是偶数结果',
      reason: '奇数双阶乘（如 7!!=105）是奇数乘积，结果仍是奇数；只有偶数双阶乘才是偶数。',
      fix: '看清 n 的奇偶：偶数项跳乘得偶、奇数项跳乘得奇。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'fact',
      kind: 'confusable',
      why: 'FACT 连乘到底、FACTDOUBLE 隔项连乘，n 相同时结果差很多，别混用。',
    },
    {
      id: 'combin',
      kind: 'companion',
      why: '某些配对/错排问题会同时用到双阶乘和组合数，配套出现。',
    },
    {
      id: 'permut',
      kind: 'companion',
      why: '双阶乘常见于部分排列的计数，和 PERMUT 同属计数家族。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '7' },
    ],
    template: '=FACTDOUBLE({number})',
    cases: [
      { label: 'FACTDOUBLE(7) → 105', type: 'ok', values: { number: '7' }, expect: '105', note: '7!! = 7×5×3×1 = 105。' },
      { label: '负数 -7 → #NUM!', type: 'error', values: { number: '-7' }, expect: '#NUM!', note: '负数不能双阶乘，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default factdoubleEntry;
