import type { FunctionEntry } from '@/types';

/** POISSON.DIST · 泊松分布（statistical 类 B4 批次） */

const TSV = '参数\t值\n平均发生次数(λ)\t3\n发生次数\t5';

const poissonDistEntry: FunctionEntry = {
  id: 'poisson-dist',
  enName: 'POISSON.DIST',
  zhName: '泊松分布',
  zhCommon: ['泊松分布', 'POISSON.DIST', '稀有事件'],
  alias: ['单位时间次数', '到店人数', '故障次数分布'],
  category: 'statistical',
  abbr: 'bsfb',
  pinyin: 'bosongfenbu',
  keywords: ['POISSON.DIST', '泊松分布', '稀有事件', '单位时间次数', '排队', 'λ'],
  difficulty: 4,
  usageLevel: 10,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用 POISSON（新版保留为兼容性函数）。',
  },
  oneLiner: '算「单位时间/空间内稀有事件发生 k 次」的概率',
  summary:
    '泊松分布用来描述「平均发生 λ 次、每次独立、发生概率低」的稀有事件：一小时内的到店客数、一天的服务器故障数、一平方米布料的瑕疵数。它只需要一个参数 λ（平均发生次数），非常简洁。第四参数同样是 FALSE（恰好 k 次）与 TRUE（最多 k 次）的区别。它的特点是均值等于方差（都等于 λ），可用来快速检验数据是否适合泊松模型。',
  syntax: {
    patternCn: '=POISSON.DIST(发生次数, 平均发生次数, 累积与否)',
    patternEn: '=POISSON.DIST(x, mean, cumulative)',
    args: [
      {
        key: 'x',
        zh: '发生次数',
        en: 'x',
        required: true,
        desc: '你关心的发生次数 k（非负整数）。',
        accepts: '非负整数或单元格引用。',
        ifOmitted: '三个参数都必填，省略公式无法成立。',
        tip: '小数会被截尾取整。',
        example: '5',
        pitfallRank: 2,
      },
      {
        key: 'mean',
        zh: '平均发生次数',
        en: 'mean',
        required: true,
        desc: '单位时间/空间内的平均发生次数 λ，必须 ≥ 0。',
        accepts: '非负数，如 3。',
        ifOmitted: '三个参数都必填，省略公式无法成立。',
        tip: '⚠️ 必须 ≥ 0，负数报 #NUM!。',
        example: '3',
        pitfallRank: 1,
      },
      {
        key: 'cumulative',
        zh: '累积与否',
        en: 'cumulative',
        required: true,
        desc: 'FALSE = 恰好 k 次；TRUE = 最多 k 次的累积概率。',
        accepts: 'TRUE / FALSE。',
        ifOmitted: '三个参数都必填，省略公式无法成立。',
        tip: '容量规划常用 TRUE（「不超过 k 次的概率」）。',
        example: 'FALSE',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回对应概率（0–1）；mean < 0 或 x < 0 返回 #NUM!。',
  examples: [
    {
      title: '示例 1：恰好发生 5 次的概率',
      scene: '平均每小时来 3 位顾客，问恰好来 5 位的概率。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=POISSON.DIST(B3,B2,FALSE)',
      result: '约 0.1008（约 10.08%）',
      explanation: '这是分布曲线在 k=5 处的高度，即「正好 5 位客人」的概率。',
    },
    {
      title: '示例 2：最多 5 位的概率（做容量规划）',
      scene: '店里最多能同时接待 5 位，想知道不超负荷的概率。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=POISSON.DIST(B3,B2,TRUE)',
      result: '约 0.9161（约 91.61% 的时间不会超负荷）',
      explanation: 'TRUE 累积了 0 到 5 次的概率，直接可用于服务能力评估。',
    },
    {
      title: '示例 3：超过 5 位的概率（右尾）',
      scene: '想知道超出接待能力的风险有多大。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=1-POISSON.DIST(B3,B2,TRUE)',
      result: '约 0.0839（约 8.39% 的时间会超负荷）',
      explanation: '用 1 减去累积概率得到右尾风险，是容量规划中最关心的数字。',
    },
  ],
  pitfalls: [
    {
      title: '把「恰好」和「最多」搞混',
      reason: '第四参数 FALSE 是恰好 k 次、TRUE 是最多 k 次，容量规划通常用 TRUE。',
      fix: '问「恰好」用 FALSE；问「不超过」用 TRUE；问「至少/超过」用 1−TRUE。',
      level: 'high',
    },
    {
      title: 'mean 传负数或 x 传负数',
      reason: '平均次数与发生次数都不能为负。',
      fix: '检查参数；x 为小数时会被截尾，需注意是否符合预期。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '数据不满足「独立、稀有、均值恒定」的前提',
      reason: '事件成簇发生（如促销日客流暴增）或均值随时间变化时，泊松模型会失真。',
      fix: '先检验均值≈方差；明显不符时改用负二项分布或直接用经验频率。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'binom-dist',
      kind: 'companion',
      why: '试验次数大、单次概率小时，泊松是二项分布的近似，两者可互相印证。',
    },
    {
      id: 'frequency',
      kind: 'alternative',
      why: '若只关心真实数据中各次数出现多少次，直接统计频数比建模更直接。',
    },
    {
      id: 'var-s',
      kind: 'companion',
      why: '泊松分布均值等于方差，可用 AVERAGE 与 VAR.S 是否接近来检验适用性。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: '发生次数', type: 'number', default: '5' },
      { key: 'mean', label: '平均发生次数', type: 'number', default: '3' },
      { key: 'cumulative', label: '累积', type: 'select', default: 'TRUE', options: [{ label: 'TRUE', value: 'TRUE' }, { label: 'FALSE', value: 'FALSE' }] },
    ],
    template: '=POISSON.DIST({x}, {mean}, {cumulative})',
    cases: [
      { label: '最多 5 次（累积）', type: 'ok', values: { x: '5', mean: '3', cumulative: 'TRUE' }, expect: '0.916082', note: 'P(X≤5), λ=3' },
      { label: '恰好 5 次', type: 'ok', values: { x: '5', mean: '3', cumulative: 'FALSE' }, expect: '0.100819', note: 'P(X=5), λ=3' },
      { label: 'x 非整数', type: 'error', values: { x: '2.5', mean: '3', cumulative: 'TRUE' }, expect: '#NUM!', note: 'x 须为非负整数' },
      { label: '均值≤0', type: 'error', values: { x: '5', mean: '0', cumulative: 'TRUE' }, expect: '#NUM!', note: 'mean 须>0' },
      { label: '非数字 x', type: 'error', values: { x: 'a', mean: '3', cumulative: 'TRUE' }, expect: '#VALUE!', note: 'x 须为数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default poissonDistEntry;
