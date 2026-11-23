import type { FunctionEntry } from '@/types';

/**
 * COMBINA · 含重复组合数
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const combinaEntry: FunctionEntry = {
  id: 'combina',
  enName: 'COMBINA',
  zhName: '含重复组合数',
  zhCommon: ['含重复组合', '可重复组合', '有放回选取'],
  alias: ['可重复选', '重复组合', '多重组合'],
  category: 'math',
  abbr: 'hcfzhs',
  pinyin: 'hanchongfuzuheshu',
  keywords: ['含重复组合', '可重复组合', 'COMBINA', '有放回', '多重选取', '排列组合'],
  difficulty: 3,
  usageLevel: 20,
  version: {
    min: '2013',
    label: 'Excel 2013 及以上可用',
    notes:
      'COMBINA(n,k) = C(n+k-1, k)，即「允许重复地从 n 类里选 k 个」。对比 COMBIN 不允许重复，结果总是更大。',
  },
  oneLiner: '从 n 类里挑 k 个，同一个可重复挑',
  summary:
    'COMBINA 是「有放回」版的组合数：同一种东西可以选好几次。比如 4 种口味冰淇淋选 3 个（可以 3 个都香草），方案数是 COMBINA(4,3)=20，比不放回的 COMBIN(4,3)=4 大得多。公式 COMBINA(n,k)=C(n+k-1,k)。需要 Excel 2013 及以上。',
  syntax: {
    patternCn: '=COMBINA(类别数, 选取个数)',
    patternEn: '=COMBINA(number, number_chosen)',
    args: [
      {
        key: 'number',
        zh: '类别数',
        en: 'number',
        required: true,
        desc: '一共有多少「类」可选对象（n）。',
        accepts: '非负整数或单元格，如 4、A2。',
        ifOmitted: '必填参数。',
        tip: '这里的 n 是「种类数」，不是「总个数」；同一种可以选多次。',
        example: '4',
        pitfallRank: 1,
      },
      {
        key: 'number_chosen',
        zh: '选取个数',
        en: 'number_chosen',
        required: true,
        desc: '总共要挑出来几个（k），可重复。',
        accepts: '非负整数或单元格，如 3、B2。',
        ifOmitted: '必填参数。',
        tip: 'COMBINA(n,k) 结果恒等于 COMBIN(n+k-1,k)，可互相验算。',
        example: '3',
        pitfallRank: 2,
      },
    ],
  },
  returnValue:
    '返回允许重复的组合数 C(n+k-1,k)；顺序仍不计。number 或 number_chosen 为负时返回 #NUM!。',
  examples: [
    {
      title: '示例 1：4 种口味选 3 个（可重复）',
      scene: '冰淇淋 4 种口味，买 3 个，可以 3 个都同一口味。',
      dataTsv: '种类\t选取\n4\t3',
      dataAnchor: 'A1',
      formula: '=COMBINA(A2,B2)',
      result: 'C(4+3-1,3)=C(6,3)=20',
      explanation: '允许重复时方案数暴涨到 20，包括「香草香草香草」「香草草莓芒果」等所有可重复搭配。',
    },
    {
      title: '示例 2：和不允许重复的 COMBIN 对比',
      scene: '同一个问题，不放回只能选 4 种。',
      dataTsv: '种类\t选取\n4\t3',
      dataAnchor: 'A1',
      formula: '=COMBINA(A2,B2)&" vs "&COMBIN(A2,B2)',
      result: '20 vs 4',
      explanation: 'COMBIN(4,3)=4 是「每种最多一个」；COMBINA 允许重复，所以多很多。',
    },
    {
      title: '示例 3：用 COMBIN 验算 COMBINA',
      scene: '验证两者恒等关系，避免版本差异算错。',
      dataTsv: '种类\t选取\n4\t3',
      dataAnchor: 'A1',
      formula: '=COMBIN(A2+B2-1,B2)',
      result: 'COMBIN(6,3)=20（与 COMBINA(4,3) 一致）',
      explanation: 'COMBINA(n,k) 本质就是 COMBIN(n+k-1,k)，老版本没 COMBINA 时可用这招替代。',
    },
  ],
  pitfalls: [
    {
      title: '在 Excel 2010 及更早版本用 COMBINA 报 #NAME?',
      reason: 'COMBINA 是 2013 年才加入的函数，旧版 Excel 不认识这个名字。',
      fix: '旧版改用 =COMBIN(n+k-1,k) 等价替代；或确认文件在 2013+ 环境打开。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '把「类别数」误解成「总个数」',
      reason:
        'COMBINA 的 n 是种类数。若把「库存 100 个、4 种口味」的 100 当 n，就完全算错了。',
      fix: 'n 填「有多少种」，k 填「要选几个」；库存上限不影响可重复组合数（除非超过库存才另算）。',
      level: 'mid',
    },
    {
      title: '不该允许重复却用了 COMBINA',
      reason: '真人抽奖「一个人不能中两次奖」是不放回，应该用 COMBIN；误用 COMBINA 会把方案数算大。',
      fix: '不放回/不可重复 → COMBIN；有放回/可重复 → COMBINA。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'combin',
      kind: 'confusable',
      why: 'COMBIN 不放回、COMBINA 有放回；同是 n 选 k，COMBINA 结果更大。',
    },
    {
      id: 'permut',
      kind: 'companion',
      why: '都属计数家族；PERMUT 计顺序且不放回，COMBINA 不计顺序且可重复。',
    },
    {
      id: 'multinomial',
      kind: 'companion',
      why: '多类分配问题时两者常配套出现，理解组合有助于懂多项系数。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '总数 n', type: 'number', default: '4' },
      { key: 'number2', label: '选取数 k', type: 'number', default: '3' },
    ],
    template: '=COMBINA({number},{number2})',
    cases: [
      { label: 'COMBINA(4,3) → 20', type: 'ok', values: { number: '4', number2: '3' }, expect: '20', note: '可重复选取，等价于 COMBIN(6,3)=20。' },
      { label: '含负数 → #NUM!', type: 'error', values: { number: '-4', number2: '3' }, expect: '#NUM!', note: 'n 不能为负，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc', number2: '3' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
          { label: 'COMBINA(5,2) → 15', type: 'ok', values: { number: '5', number2: '2' }, expect: '15', note: '等价于 COMBIN(6,2)=15。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default combinaEntry;
