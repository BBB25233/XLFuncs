import type { FunctionEntry } from '@/types';

/**
 * FACT · 阶乘
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const factEntry: FunctionEntry = {
  id: 'fact',
  enName: 'FACT',
  zhName: '阶乘',
  zhCommon: ['阶乘', '连乘', 'n的阶乘'],
  alias: ['连乘积', '全排列数', '阶乘计算'],
  category: 'math',
  abbr: 'jc',
  pinyin: 'jiecheng',
  keywords: ['阶乘', '连乘', 'n!', '全排列', '排列数基础', '概率计算'],
  difficulty: 2,
  usageLevel: 35,
  version: {
    min: 'all',
    label: 'Excel 2003 起可用',
    notes:
      'FACT 只接受 ≥0 的整数；小数会被直接截断取整再算（如 FACT(4.9) 实际算 FACT(4)）。',
  },
  oneLiner: '把 1 到 n 所有整数乘起来',
  summary:
    '阶乘是排列组合的基石：n! = 1×2×3×…×n。算彩票组合数、排座位方案数、概率题都绕不开它。FACT(5)=120，FACT(0)=1（规定 0 的阶乘是 1，不是 0）。注意它只吃非负整数，负数会直接报错。',
  syntax: {
    patternCn: '=FACT(数字)',
    patternEn: '=FACT(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要算阶乘的那个非负整数 n。',
        accepts: '整数或单元格，如 5、A2。小数会被截断取整。',
        ifOmitted: '必填参数，只有一个。',
        tip: 'FACT 会先把小数「去尾」成整数再算：FACT(4.9) 等于 FACT(4)=24。',
        example: '5',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 n! = 1×2×…×n 的乘积；FACT(0)=1；n 为负数时返回 #NUM!。',
  examples: [
    {
      title: '示例 1：5 的阶乘',
      scene: '算 5 个人全排列有多少种站法。',
      dataTsv: '人数\n5',
      dataAnchor: 'A1',
      formula: '=FACT(A2)',
      result: '1×2×3×4×5 = 120',
      explanation: '5 个人排成一列的方案数就是 5! = 120。',
    },
    {
      title: '示例 2：0 的阶乘是 1，不是 0',
      scene: '组合数公式里常出现 FACT(0)，很多人直觉以为是 0，其实规定是 1。',
      dataTsv: 'n\n0',
      dataAnchor: 'A1',
      formula: '=FACT(A2)',
      result: '1',
      explanation: '数学上规定 0! = 1，这是组合数、排列数公式能自洽的基础。',
    },
    {
      title: '示例 3：小数被截断再算',
      scene: '手滑写成 4.9，结果和 4 一样。',
      dataTsv: 'n\n4.9',
      dataAnchor: 'A1',
      formula: '=FACT(A2)',
      result: 'FACT(4.9) = 24（等同于 FACT(4)）',
      explanation: 'FACT 不会四舍五入，而是直接砍掉小数部分当 4 来算，所以 4.9 得 24。要精确就先 ROUND 再传。',
    },
  ],
  pitfalls: [
    {
      title: '给负数，报 #NUM!',
      reason: '阶乘只对非负整数有意义，FACT(-1) 这类直接返回 #NUM!（数值错误）。',
      fix: '先确认数字 ≥0；如果可能为负，用 MAX(0, A2) 或 IF 兜一下。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '小数被悄悄截断，结果比预期小',
      reason: 'FACT 把 4.9 当 4 算，得到 24 而不是你以为的「4.9 的阶乘」。',
      fix: '想按四舍五入的整数算，用 =FACT(ROUND(A2,0))；或先确认输入就是整数。',
      level: 'mid',
    },
    {
      title: 'n 太大溢出（170 以上）',
      reason: 'Excel 数值上限约 1.8E+308，FACT(171) 已经超出，返回 #NUM!。',
      fix: '超大阶乘用对数或换专业工具；普通业务 FACT(170) 以内都安全（FACT(170)≈7.26E+306）。',
      level: 'low',
      errorCode: '#NUM!',
    },
  ],
  related: [
    {
      id: 'factdouble',
      kind: 'confusable',
      why: 'FACTDOUBLE 是「隔一个乘一个」的双阶乘，FACT 是连乘到底，两者不同。',
    },
    {
      id: 'combin',
      kind: 'companion',
      why: '组合数 C(n,k) = FACT(n)/(FACT(k)*FACT(n-k))，直接用 COMBIN 更省事。',
    },
    {
      id: 'permut',
      kind: 'companion',
      why: '排列数 P(n,k) = FACT(n)/FACT(n-k)，直接用 PERMUT 更省事。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '5' },
    ],
    template: '=FACT({number})',
    cases: [
      { label: 'FACT(5) → 120', type: 'ok', values: { number: '5' }, expect: '120', note: '5! = 120。' },
      { label: '负数 -5 → #NUM!', type: 'error', values: { number: '-5' }, expect: '#NUM!', note: '负数不能阶乘，报 #NUM!。' },
      { label: '小数 5.5 → #NUM!', type: 'error', values: { number: '5.5' }, expect: '#NUM!', note: 'FACT 只接受整数，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default factEntry;
