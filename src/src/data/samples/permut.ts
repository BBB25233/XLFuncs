import type { FunctionEntry } from '@/types';

/**
 * PERMUT · 排列数
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const permutEntry: FunctionEntry = {
  id: 'permut',
  enName: 'PERMUT',
  zhName: '排列数',
  zhCommon: ['排列数', '有序选取', '排座次'],
  alias: ['排列', '顺序组合', '先后选取'],
  category: 'math',
  abbr: 'pls',
  pinyin: 'pailieshu',
  keywords: ['排列数', 'P(n,k)', '有序选取', '排座次', '冠军亚军', '排列组合'],
  difficulty: 2,
  usageLevel: 40,
  version: {
    min: 'all',
    label: 'Excel 2003 起可用',
    notes:
      'PERMUT 考虑顺序且不放回。要考虑顺序但可重复选 → 用 PERMUTATIONA；不考虑顺序 → 用 COMBIN。',
  },
  oneLiner: '从 n 个里挑 k 个，还分先后',
  summary:
    '排列数回答「从 n 个里挑 k 个，并且谁先谁后算不同方案」。比如 8 个人竞选冠亚军（冠、亚不同），方案数是 PERMUT(8,2)=56，比组合数 28 大一倍，因为 (甲冠,乙亚) 和 (乙冠,甲亚) 是两回事。公式 P(n,k)=n!/(n-k)!。',
  syntax: {
    patternCn: '=PERMUT(总数, 选取个数)',
    patternEn: '=PERMUT(number, number_chosen)',
    args: [
      {
        key: 'number',
        zh: '总数',
        en: 'number',
        required: true,
        desc: '一共有多少个可选对象（n）。',
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
        desc: '要挑出来几个并排顺序（k）。',
        accepts: '非负整数或单元格，如 2、B2。',
        ifOmitted: '必填参数。',
        tip: '顺序重要，所以 (甲,乙) 和 (乙,甲) 算两种。',
        example: '2',
        pitfallRank: 2,
      },
    ],
  },
  returnValue:
    '返回 P(n,k)=n!/(n-k)!，即从 n 个中计顺序选 k 个的方案数；n<k 或负数为 #NUM!。',
  examples: [
    {
      title: '示例 1：8 人竞选冠亚军',
      scene: '冠军和亚军是不同名次，顺序要算进去。',
      dataTsv: '总数\t选取\n8\t2',
      dataAnchor: 'A1',
      formula: '=PERMUT(A2,B2)',
      result: '8×7 = 56',
      explanation: '先选冠军 8 种，再选亚军 7 种，共 56 种名次安排。',
    },
    {
      title: '示例 2：和 COMBIN 对比（差一个 k!）',
      scene: '同一批人只组队不分角色，方案数减半。',
      dataTsv: '总数\t选取\n8\t2',
      dataAnchor: 'A1',
      formula: '=PERMUT(A2,B2)&" vs "&COMBIN(A2,B2)',
      result: '56 vs 28',
      explanation: 'PERMUT 比 COMBIN 大 k! 倍：分组不分先后用 COMBIN，排座次用 PERMUT。',
    },
    {
      title: '示例 3：全排列（选满 n 个）',
      scene: '5 个人排成一列照完全部位置。',
      dataTsv: '总数\t选取\n5\t5',
      dataAnchor: 'A1',
      formula: '=PERMUT(A2,B2)',
      result: '5! = 120',
      explanation: 'k=n 时 PERMUT(n,n)=n!，就是全排列，和 FACT(n) 相等。',
    },
  ],
  pitfalls: [
    {
      title: '总数小于选取个数，报 #NUM!',
      reason: '从 3 个里挑 5 个排顺序不可能，PERMUT(3,5) 返回 #NUM!。',
      fix: '先确认 number≥number_chosen；检查上游是不是填反了。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '不该分先后却用了 PERMUT',
      reason: '只凑一拨人、不分角色时用 PERMUT 会把方案数算大（多了个 k!）。',
      fix: '不分先后 → COMBIN；分座次/分角色 → PERMUT。',
      level: 'high',
    },
    {
      title: '允许重复选却用 PERMUT',
      reason: 'PERMUT 默认不放回（同一个人不能同时当冠亚军）。可重复的有序选取要用 PERMUTATIONA。',
      fix: '可重复有序（如密码、掷骰）用 PERMUTATIONA(n,k)=n^k。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'combin',
      kind: 'confusable',
      why: 'COMBIN 不计顺序、PERMUT 计顺序；同是 n 选 k，PERMUT 大 k! 倍。',
    },
    {
      id: 'combina',
      kind: 'companion',
      why: '都属计数家族；PERMUT 计顺序不放回，COMBINA 不计顺序可重复。',
    },
    {
      id: 'fact',
      kind: 'companion',
      why: '排列数公式底层是 FACT 相除，理解 FACT 更易懂。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '总数 n', type: 'number', default: '5' },
      { key: 'number2', label: '选取数 k', type: 'number', default: '2' },
    ],
    template: '=PERMUT({number},{number2})',
    cases: [
      { label: 'PERMUT(5,2) → 20', type: 'ok', values: { number: '5', number2: '2' }, expect: '20', note: '从 5 个里有序选 2 个，共 20 种。' },
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

export default permutEntry;
