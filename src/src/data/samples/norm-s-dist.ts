import type { FunctionEntry } from '@/types';

/** NORM.S.DIST · 标准正态分布（statistical 类 B4 批次） */

const TSV = 'z值\n0\n1\n1.96\n-1';

const normSDistEntry: FunctionEntry = {
  id: 'norm-s-dist',
  enName: 'NORM.S.DIST',
  zhName: '标准正态分布',
  zhCommon: ['标准正态', 'NORM.S.DIST', 'z值概率'],
  alias: ['z分布', '标准正态累积', 'z查表'],
  category: 'statistical',
  abbr: 'bzztfb',
  pinyin: 'biaozhunzhengtaifenbu',
  keywords: ['NORM.S.DIST', '标准正态', 'z值', 'z分数', '累积概率', '查表'],
  difficulty: 4,
  usageLevel: 10,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用 NORMSDIST（新版保留为兼容性函数）。',
  },
  oneLiner: '标准正态分布（均值 0、标准差 1）下的概率，替代表尾查表',
  summary:
    '标准正态分布就是把任意正态数据标准化后的形态（z = (x−均值)/标准差）。NORM.S.DIST 省去了手动标准化的步骤：直接给 z 值就得到累积概率。学生时代查的「正态分布表」就是它——z=1.96 对应 0.975，正是 95% 双侧置信区间常用的临界值。',
  syntax: {
    patternCn: '=NORM.S.DIST(z值, 累积与否)',
    patternEn: '=NORM.S.DIST(z, cumulative)',
    args: [
      {
        key: 'z',
        zh: 'z值',
        en: 'z',
        required: true,
        desc: '标准化后的值，即 (x − 均值) ÷ 标准差。',
        accepts: '数字或单元格引用。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '若手上只有原始值 x，用 (x−AVERAGE)/STDEV 先算出 z。',
        example: '1.96',
        pitfallRank: 1,
      },
      {
        key: 'cumulative',
        zh: '累积与否',
        en: 'cumulative',
        required: true,
        desc: 'TRUE = 累积概率（≤z 的概率）；FALSE = 概率密度。',
        accepts: 'TRUE / FALSE 或 1 / 0。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '日常用 TRUE；FALSE 用于画标准正态曲线。',
        example: 'TRUE',
      },
    ],
  },
  returnValue: 'cumulative=TRUE 返回 ≤z 的累积概率（0–1）；FALSE 返回标准正态的概率密度。',
  examples: [
    {
      title: '示例 1：替代表尾查表',
      scene: '想知道 z=1 时左侧累积概率是多少（过去要翻表）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NORM.S.DIST(A3,TRUE)',
      result: '约 0.8413（z=1 时约 84.13% 的数据在左侧）',
      explanation: '这正是正态分布表里 z=1.00 对应的值，用函数一步得到，不用查表。',
    },
    {
      title: '示例 2：95% 置信区间常用的 1.96',
      scene: '做统计推断需要 95% 双侧区间的临界值。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NORM.S.DIST(A4,TRUE)',
      result: '约 0.975（z=1.96 时左侧累积 97.5%）',
      explanation: '左右两侧各留 2.5%，中间正好 95%——这就是 1.96 成为常用临界值的原因。',
    },
    {
      title: '示例 3：原始值先标准化再用',
      scene: '手上只有原始分数，先转成 z 值。',
      dataTsv: '分数\t均值\t标准差\n115\t100\t15',
      dataAnchor: 'A1',
      formula: '=NORM.S.DIST((A2-B2)/C2,TRUE)',
      result: '约 0.8413（与 NORM.DIST(115,100,15,TRUE) 完全一致）',
      explanation: '手动标准化后结果与 NORM.DIST 相同，可用来交叉验证。',
    },
  ],
  pitfalls: [
    {
      title: '把原始值直接当 z 值传进去',
      reason: 'z 是标准化后的值；直接传 115 这种原始分数，会被当成 z=115，结果恒为 1。',
      fix: '先算 z = (x − 均值)/标准差；或直接用 NORM.DIST(x, 均值, 标准差, TRUE)。',
      level: 'high',
    },
    {
      title: '把 FALSE 的密度值当概率',
      reason: '概率密度不是概率。',
      fix: '求概率用 TRUE。',
      level: 'mid',
    },
    {
      title: '假设数据服从正态而不做检验',
      reason: '偏态数据套正态会得出错误概率。',
      fix: '先用 SKEW / 直方图检验分布形态。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'norm-dist',
      kind: 'companion',
      why: 'NORM.DIST 直接接受原始值与均值标准差；先标准化再用 NORM.S.DIST 结果相同。',
    },
    {
      id: 'stdev-s',
      kind: 'companion',
      why: '算 z 值需要标准差，通常由 STDEV.S 估算。',
    },
    {
      id: 'percentile-inc',
      kind: 'alternative',
      why: '不假设正态时，直接用真实数据的分位数更可靠。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'z', label: 'z 值', type: 'number', default: '1' },
      { key: 'cumulative', label: '累积?', type: 'text', default: 'TRUE', hint: 'TRUE=累积概率，FALSE=概率密度' },
    ],
    template: '=NORM.S.DIST({z},{cumulative})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '0.841345', note: '标准正态分布 z=1 处累积概率 ≈ 0.8413' },
      { label: 'z 非数字', type: 'error', values: { z: 'abc' }, expect: '#VALUE!', note: 'z 必须是数字 → #VALUE!' },
      { label: '累积参数非 TRUE/FALSE', type: 'error', values: { cumulative: 'YES' }, expect: '#VALUE!', note: '累积参数必须是逻辑值 → #VALUE!' },
      { label: 'z 为空白', type: 'error', values: { z: '' }, expect: '#VALUE!', note: 'z 不能为空 → #VALUE!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default normSDistEntry;
