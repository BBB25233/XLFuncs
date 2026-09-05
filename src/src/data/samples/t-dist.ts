import type { FunctionEntry } from '@/types';

/** T.DIST · t 分布（statistical 类 B4 批次） */

const TSV = '参数\t值\nt值\t2.0\n自由度\t10\n单侧/双侧\t2';

const tDistEntry: FunctionEntry = {
  id: 't-dist',
  enName: 'T.DIST',
  zhName: 't分布',
  zhCommon: ['t分布', 'T.DIST', '学生t分布'],
  alias: ['小样本分布', 't检验分布', '自由度分布'],
  category: 'statistical',
  abbr: 'tfb',
  pinyin: 'tfenbu',
  keywords: ['T.DIST', 't分布', '自由度', '小样本', 't检验', '置信区间'],
  difficulty: 5,
  usageLevel: 8,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'T.DIST 返回左尾概率；另有 T.DIST.2T（双尾）与 T.DIST.RT（右尾）。',
  },
  oneLiner: '按给定自由度算 t 分布的左尾概率（小样本推断的基础）',
  summary:
    '样本量小（通常 <30）、总体标准差未知时，用正态分布估计会偏乐观，这时该用 t 分布——它的尾巴更厚，给出更保守（更宽）的区间。自由度越大越接近正态分布（自由度 >30 后差别很小）。T.DIST 返回的是**左尾**概率；实际做检验更常用 T.DIST.2T（双尾 p 值）与 T.TEST。',
  syntax: {
    patternCn: '=T.DIST(t值, 自由度, 累积与否)',
    patternEn: '=T.DIST(x, deg_freedom, cumulative)',
    args: [
      {
        key: 'x',
        zh: 't值',
        en: 'x',
        required: true,
        desc: '要计算概率的 t 值。',
        accepts: '数字或单元格引用。',
        ifOmitted: '三个参数都必填，省略公式无法成立。',
        tip: 't 值通常由 (样本均值 − 假设值) ÷ 标准误 算得。',
        example: '2',
        pitfallRank: 1,
      },
      {
        key: 'deg_freedom',
        zh: '自由度',
        en: 'deg_freedom',
        required: true,
        desc: '自由度，通常为 样本量 − 1，必须 ≥ 1。',
        accepts: '≥1 的整数。',
        ifOmitted: '三个参数都必填，省略公式无法成立。',
        tip: '⚠️ 小于 1 会报 #NUM!。',
        example: '10',
        pitfallRank: 2,
      },
      {
        key: 'cumulative',
        zh: '累积与否',
        en: 'cumulative',
        required: true,
        desc: 'TRUE = 累积分布（左尾概率）；FALSE = 概率密度。',
        accepts: 'TRUE / FALSE。',
        ifOmitted: '三个参数都必填，省略公式无法成立。',
        tip: '求概率用 TRUE；FALSE 仅用于画曲线。',
        example: 'TRUE',
      },
    ],
  },
  returnValue: '返回左尾概率（0–1）；自由度 < 1 返回 #NUM!。',
  examples: [
    {
      title: '示例 1：t 分布的左尾概率',
      scene: 't=2、自由度 10，求左尾累积概率。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=T.DIST(B2,B3,TRUE)',
      result: '约 0.9633（即 t ≤ 2 的概率约 96.33%）',
      explanation: '右尾就是 1 − 0.9633 ≈ 3.67%，这就是单侧检验的 p 值。',
    },
    {
      title: '示例 2：与正态分布的差别（自由度越小差别越大）',
      scene: '同样 t=2，看看 t 分布与正态的差异。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NORM.S.DIST(B2,TRUE)',
      result: '约 0.9772（正态下右尾 2.28%）',
      explanation:
        't 分布右尾 3.67% 明显大于正态的 2.28%——尾巴更厚，结论更保守。自由度越大，两者越接近。',
    },
    {
      title: '示例 3：自由度小于 1 时报错',
      scene: '误把 0 当自由度传入。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=T.DIST(B2,0,TRUE)',
      result: '#NUM!（自由度必须 ≥ 1）',
      explanation: '自由度 = 样本量 − 1，样本量至少要有 2 个。',
    },
  ],
  pitfalls: [
    {
      title: '把 T.DIST 的结果直接当双尾 p 值',
      reason: 'T.DIST 返回左尾概率；双尾检验的 p 值需要用 T.DIST.2T 或对结果做转换。',
      fix: '双尾检验直接用 T.DIST.2T(ABS(t), 自由度)，语义清晰不易错。',
      level: 'high',
    },
    {
      title: '自由度取错（用样本量而不是 n−1）',
      reason: '单样本 t 检验的自由度是 n−1，用错会改变分布形状与结论。',
      fix: '确认检验类型：单样本/配对用 n−1，两样本另有公式。',
      level: 'high',
    },
    {
      title: '大样本仍用 t 分布（无必要地保守）',
      reason: '自由度 >30 后 t 分布与正态几乎重合，用哪个差别很小。',
      fix: '大样本可直用正态分布；小样本（<30）才必须用 t 分布。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'norm-s-dist',
      kind: 'confusable',
      why: '两者形态相似，但 t 分布尾部更厚；大样本时 t 趋近正态。',
    },
    {
      id: 'stdev-s',
      kind: 'companion',
      why: '总体标准差未知、用 STDEV.S 估计时，正是需要用 t 分布的情形。',
    },
    {
      id: 'count',
      kind: 'companion',
      why: '自由度 = COUNT(数据) − 1，需先确认样本量。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 't 值', type: 'number', default: '2' },
      { key: 'deg_freedom', label: '自由度', type: 'number', default: '10' },
      { key: 'cumulative', label: '累积', type: 'select', default: 'TRUE', options: [{ label: 'TRUE', value: 'TRUE' }, { label: 'FALSE', value: 'FALSE' }] },
    ],
    template: '=T.DIST({x}, {deg_freedom}, {cumulative})',
    cases: [
      { label: '左尾累积概率', type: 'ok', values: { x: '2', deg_freedom: '10', cumulative: 'TRUE' }, expect: '0.963306', note: 'P(T≤2), ν=10' },
      { label: '概率密度', type: 'ok', values: { x: '2', deg_freedom: '10', cumulative: 'FALSE' }, expect: '0.061146', note: 'f(2), ν=10' },
      { label: '自由度<1', type: 'error', values: { x: '2', deg_freedom: '0', cumulative: 'TRUE' }, expect: '#NUM!', note: 'ν 须≥1' },
      { label: '自由度非整数<1', type: 'error', values: { x: '2', deg_freedom: '0.5', cumulative: 'TRUE' }, expect: '#NUM!', note: 'ν 须≥1' },
      { label: '非数字 t', type: 'error', values: { x: 'a', deg_freedom: '10', cumulative: 'TRUE' }, expect: '#VALUE!', note: 'x 须为数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default tDistEntry;
