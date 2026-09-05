import type { FunctionEntry } from '@/types';

/**
 * COMBIN · 组合数
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const combinEntry: FunctionEntry = {
  id: 'combin',
  enName: 'COMBIN',
  zhName: '组合数',
  zhCommon: ['组合数', '任选', '不排序选取'],
  alias: ['组合', '选几个', '无序选取'],
  category: 'math',
  abbr: 'zhs',
  pinyin: 'zuheshu',
  keywords: ['组合数', 'C(n,k)', '任选', '无序选取', '抽奖组合', '排列组合'],
  difficulty: 2,
  usageLevel: 45,
  version: {
    min: 'all',
    label: 'Excel 2003 起可用',
    notes:
      'COMBIN 不考虑顺序（选 A 再选 B = 选 B 再选 A）。要考虑顺序用 PERMUT；允许重复选同一项用 COMBINA。',
  },
  oneLiner: '从 n 个里挑 k 个，不计顺序',
  summary:
    '组合数回答「从 n 个东西里随便挑 k 个，有多少种挑法（顺序不重要）」。比如 8 个人里选 2 人组队，和谁先谁后无关，答案是 COMBIN(8,2)=28。公式 C(n,k)=n!/(k!·(n-k)!)。它不管选取的先后，这是和 PERMUT（排列）最大的区别。',
  syntax: {
    patternCn: '=COMBIN(总数, 选取个数)',
    patternEn: '=COMBIN(number, number_chosen)',
    args: [
      {
        key: 'number',
        zh: '总数',
        en: 'number',
        required: true,
        desc: '一共有多少个可选的对象（n）。',
        accepts: '非负整数或单元格，如 8、A2。',
        ifOmitted: '必填参数。',
        tip: '总数必须 ≥ 选取个数，否则报 #NUM!。',
        example: '8',
        pitfallRank: 1,
      },
      {
        key: 'number_chosen',
        zh: '选取个数',
        en: 'number_chosen',
        required: true,
        desc: '要挑出来几个（k）。',
        accepts: '非负整数或单元格，如 2、B2。',
        ifOmitted: '必填参数。',
        tip: '顺序不重要，所以选 (A,B) 和 (B,A) 算同一种。',
        example: '2',
        pitfallRank: 2,
      },
    ],
  },
  returnValue:
    '返回 C(n,k) = n!/(k!·(n-k)!)，即从 n 个中不计顺序选 k 个的方案数；n<k 或负数为 #NUM!。',
  examples: [
    {
      title: '示例 1：8 人选 2 人组队',
      scene: '团建分组，从 8 人里挑 2 人，谁先谁后无所谓。',
      dataTsv: '总数\t选取\n8\t2',
      dataAnchor: 'A1',
      formula: '=COMBIN(A2,B2)',
      result: '28',
      explanation: '8 个里挑 2 个不计顺序，C(8,2)=8×7/2=28 种组合。',
    },
    {
      title: '示例 2：双色球红球组合数',
      scene: '33 个红球选 6 个，问有多少种红球组合。',
      dataTsv: '总数\t选取\n33\t6',
      dataAnchor: 'A1',
      formula: '=COMBIN(A2,B2)',
      result: 'C(33,6) = 1107568（约 110 万种）',
      explanation: '这就是彩票「红球组合」的总数，纯粹不计顺序，所以不是 33×32×…×28。',
    },
    {
      title: '示例 3：选 0 个或全选',
      scene: '特殊情况：一个都不选，或全选，组合数都是 1。',
      dataTsv: '总数\t选取\n5\t0',
      dataAnchor: 'A1',
      formula: '=COMBIN(A2,B2)',
      result: '1（一个都不选只有 1 种「空选」方案）',
      explanation: 'COMBIN(n,0)=1、COMBIN(n,n)=1，这是组合数公式的约定，别以为是 0。',
    },
  ],
  pitfalls: [
    {
      title: '总数小于选取个数，报 #NUM!',
      reason: '从 3 个里挑 5 个不可能，COMBIN(3,5) 返回 #NUM!。',
      fix: '先用 IF 判断 number≥number_chosen；或检查上游数据有没有填反。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '把 COMBIN 当 PERMUT 用（忘了顺序）',
      reason:
        'COMBIN 不计顺序，8 选 2 = 28；若「谁当队长谁当队员」要区分，应该用 PERMUT，结果是 56。',
      fix: '选出来要排座次/分角色→用 PERMUT；只凑一拨人、不分先后→用 COMBIN。',
      level: 'high',
    },
    {
      title: '允许重复选取却用了 COMBIN',
      reason: 'COMBIN 默认「同一个不能选两次」。抽奖里「有放回、可重复」要用 COMBINA。',
      fix: '可重复选同一项（如掷骰子的点数组合）用 COMBINA(number, k)。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'permut',
      kind: 'confusable',
      why: 'PERMUT 计顺序、COMBIN 不计顺序；同是 n 选 k，PERMUT 结果更大。',
    },
    {
      id: 'combina',
      kind: 'confusable',
      why: 'COMBINA 允许重复选取，COMBIN 不允许；可重复时结果更大。',
    },
    {
      id: 'fact',
      kind: 'companion',
      why: '组合数公式底层就是 FACT 相除，理解 FACT 更易懂。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '总数 n', type: 'number', default: '5' },
      { key: 'number2', label: '选取数 k', type: 'number', default: '2' },
    ],
    template: '=COMBIN({number},{number2})',
    cases: [
      { label: 'COMBIN(5,2) → 10', type: 'ok', values: { number: '5', number2: '2' }, expect: '10', note: '从 5 个里选 2 个不重复，共 10 种。' },
      { label: 'k 大于 n → #NUM!', type: 'error', values: { number: '3', number2: '5' }, expect: '#NUM!', note: '选取数不能大于总数，报 #NUM!。' },
      { label: 'k 为负 → #NUM!', type: 'error', values: { number: '5', number2: '-1' }, expect: '#NUM!', note: '选取数不能为负，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc', number2: '2' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default combinEntry;
