import type { FunctionEntry } from '@/types';

/** ACOSH · 反双曲余弦（math 类 B2 批次） */

const TSV = '数值\n1\n2\n5\n10';

const acoshEntry: FunctionEntry = {
  id: 'acosh',
  enName: 'ACOSH',
  zhName: '反双曲余弦',
  zhCommon: ['反双曲余弦', 'acosh', '双曲反函数'],
  alias: ['反双曲函数', 'arcosh', '反求双曲角'],
  category: 'math',
  abbr: 'fsqyx',
  pinyin: 'fanshuangquyuxian',
  keywords: ['ACOSH', '反双曲余弦', '双曲反函数', '输入需≥1'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'Excel 2010 及更早版本没有此函数，可用 LN(x+SQRT(x*x-1)) 手写替代。',
  },
  oneLiner: '已知双曲余弦值，反推出原数值（输入必须 ≥ 1）',
  summary:
    'COSH 的反向函数。因为 COSH 的最小值是 1，所以 ACOSH 的输入必须大于等于 1，小于 1 会直接报 #NUM!。它等价于 LN(x + √(x²−1))。工程上偶尔用于反解悬链线参数、统计里用于某些分布变换，日常办公极少用到。',
  syntax: {
    patternCn: '=ACOSH(数值)',
    patternEn: '=ACOSH(number)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '大于等于 1 的实数。',
        accepts: '数字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 输入必须 ≥ 1，因为 COSH 的取值最小就是 1。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回使 COSH(y) = 数值 成立的 y 值（≥ 0）；输入小于 1 返回 #NUM!。',
  examples: [
    {
      title: '示例 1：与 COSH 互为反向（验证）',
      scene: '先 COSH 再 ACOSH，确认能还原。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ACOSH(COSH(A3))',
      result: '5（A3 是 5，COSH(5)≈74.21，ACOSH 还原回 5）',
      explanation: '正向再反向应还原原值。注意 ACOSH 只返回非负值，这也是双曲函数的一个特点。',
    },
    {
      title: '示例 2：输入小于 1 时的报错',
      scene: '有人把 0.5 传进去，公式直接报错。',
      dataTsv: '数值\n0.5\n1\n2',
      dataAnchor: 'A1',
      formula: '=ACOSH(A2)',
      result: '#NUM!（0.5 < 1，不在定义域内）',
      explanation:
        'COSH 的取值永远 ≥ 1，所以不存在「双曲余弦等于 0.5」的数。这是数学定义决定的，不是公式写错。',
    },
    {
      title: '示例 3：手写等价式兼容旧版 Excel',
      scene: ' recipients 使用 Excel 2010，没有 ACOSH 函数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LN(A3+SQRT(A3*A3-1))',
      result: '2.2924（与 =ACOSH(5) 结果一致）',
      explanation: 'ACOSH(x) = ln(x + √(x²−1))。旧版 Excel 可以用这个手写式替代。',
    },
  ],
  pitfalls: [
    {
      title: '输入小于 1 导致 #NUM!',
      reason: 'COSH 的值域是 [1, +∞)，小于 1 的输入在数学上无解。',
      fix: '检查数据来源；若确实需要处理小于 1 的值，说明该场景不适合用双曲余弦模型。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '在 Excel 2010 及更早版本中使用',
      reason: '该函数 Excel 2013 才加入，旧版返回 #NAME?。',
      fix: '升级 Excel，或改用 =LN(x+SQRT(x*x-1))。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '期待它能返回负值结果',
      reason: 'ACOSH 只返回 ≥ 0 的值（因为 COSH 是偶函数，正负 x 给出同一个结果，反推时只能取非负）。',
      fix: '若需要带符号的原值，需另存原始符号信息，在外部再乘上 -1。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'cosh',
      kind: 'companion',
      why: 'COSH 正向、ACOSH 反向，互为反函数（在 x≥0 范围内）。',
    },
    {
      id: 'asinh',
      kind: 'companion',
      why: '同族反双曲函数，ASINH 输入无限制、ACOSH 输入需 ≥1。',
    },
    {
      id: 'acos',
      kind: 'confusable',
      why: '名字只差一个 H：ACOS 输入需在 ±1 内、输出 0–180°；ACOSH 输入需 ≥1、输出 ≥0。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '2', placeholder: '如 2', hint: '必须 ≥ 1' },
    ],
    template: '=ACOSH(A2)',
    cases: [
      { label: '反双曲余弦 1', type: 'ok', values: { number: '1' }, expect: '0', note: 'acosh(1)=0' },
      { label: '反双曲余弦 2', type: 'ok', values: { number: '2' }, expect: '1.316958', note: 'acosh(2)≈1.316958' },
      { label: '小于 1', type: 'error', values: { number: '0' }, expect: '#NUM!', note: '参数必须 ≥ 1' },
      { label: '参数非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default acoshEntry;
