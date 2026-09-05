import type { FunctionEntry } from '@/types';

/** NORM.DIST · 正态分布（statistical 类 B4 批次） */

const TSV = '参数\t值\n均值\t100\n标准差\t15\n待求值\t115';

const normDistEntry: FunctionEntry = {
  id: 'norm-dist',
  enName: 'NORM.DIST',
  zhName: '正态分布',
  zhCommon: ['正态分布', 'NORM.DIST', '钟形曲线'],
  alias: ['高斯分布', '正态概率', '累积概率'],
  category: 'statistical',
  abbr: 'ztfb',
  pinyin: 'zhengtaifenbu',
  keywords: ['NORM.DIST', '正态分布', '累积概率', '概率密度', '钟形曲线', '百分位'],
  difficulty: 4,
  usageLevel: 14,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用 NORMDIST（新版保留为兼容性函数）。',
  },
  oneLiner: '按指定的均值和标准差，算正态分布下的概率',
  summary:
    'NORM.DIST 有两种模式：第四参数 TRUE（累积）返回「小于等于 x 的概率」，即累积分布函数；FALSE 返回该点的概率密度（不是概率，可大于 1，主要用于画图）。日常最常用的是累积模式——比如「均值 100、标准差 15 时，小于 115 的人占多少比例」。它的反函数是 NORM.INV（已知概率求值）。',
  syntax: {
    patternCn: '=NORM.DIST(待求值, 均值, 标准差, 累积与否)',
    patternEn: '=NORM.DIST(x, mean, standard_dev, cumulative)',
    args: [
      {
        key: 'x',
        zh: '待求值',
        en: 'x',
        required: true,
        desc: '要求概率的那个数值。',
        accepts: '数字或单元格引用。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '就是横轴上你要查询的那个点。',
        example: '115',
        pitfallRank: 1,
      },
      {
        key: 'mean',
        zh: '均值',
        en: 'mean',
        required: true,
        desc: '该正态分布的平均值（决定曲线的中心位置）。',
        accepts: '数字。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '可先用 AVERAGE 从数据里估算。',
        example: '100',
      },
      {
        key: 'standard_dev',
        zh: '标准差',
        en: 'standard_dev',
        required: true,
        desc: '该正态分布的标准差（决定曲线的胖瘦），必须 > 0。',
        accepts: '正数。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '⚠️ 必须为正，等于 0 会报 #NUM!。',
        example: '15',
        pitfallRank: 2,
      },
      {
        key: 'cumulative',
        zh: '累积与否',
        en: 'cumulative',
        required: true,
        desc: 'TRUE = 累积概率（≤x 的概率）；FALSE = 概率密度。',
        accepts: 'TRUE / FALSE 或 1 / 0。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '日常几乎都用 TRUE。FALSE 得到的「密度」不是概率，别当概率解读。',
        example: 'TRUE',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: 'cumulative=TRUE 返回 ≤x 的累积概率（0–1）；FALSE 返回该点的概率密度。',
  examples: [
    {
      title: '示例 1：算「低于某个值」的占比',
      scene: '考试成绩均值 100、标准差 15，问低于 115 分的人占多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NORM.DIST(B4,B2,B3,TRUE)',
      result: '约 0.8413（即约 84.13% 的人低于 115 分）',
      explanation: '115 比均值高 1 个标准差，正态分布下约 84% 的数据落在它左边。',
    },
    {
      title: '示例 2：算「高于某个值」的占比',
      scene: '想知道超过 115 分的人占多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=1-NORM.DIST(B4,B2,B3,TRUE)',
      result: '约 0.1587（即约 15.87% 的人超过 115 分）',
      explanation: '用 1 减去累积概率就是「右尾」比例。这是求「超过阈值占比」的标准写法。',
    },
    {
      title: '示例 3：区间概率（两个数之间）',
      scene: '想知道分数落在 85 到 115 之间的人占多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NORM.DIST(115,B2,B3,TRUE)-NORM.DIST(85,B2,B3,TRUE)',
      result: '约 0.6827（约 68.27%，正是「均值±1 标准差」覆盖的比例）',
      explanation: '两个累积概率相减即区间概率。±1σ ≈ 68%、±2σ ≈ 95% 是常用的经验法则。',
    },
  ],
  pitfalls: [
    {
      title: '把 FALSE 模式得到的「密度」当成概率',
      reason: '概率密度不是概率，数值可以大于 1，且只在极小区间上积分才有概率意义。',
      fix: '要概率一律用 TRUE（累积模式）；FALSE 仅用于绘制分布曲线。',
      level: 'high',
    },
    {
      title: '标准差传 0 或负数',
      reason: '正态分布的标准差必须为正。',
      fix: '检查传入值；用 STDEV.S 从数据估算时确认样本足够。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '直接套用正态假设而不检验数据',
      reason: '很多业务数据（收入、响应时间）明显偏态，套正态会得出错误概率。',
      fix: '先用 SKEW 看偏度、画直方图；明显偏态时改用经验分位数（PERCENTILE）而非正态模型。',
      level: 'high',
    },
  ],
  related: [
    {
      id: 'norm-s-dist',
      kind: 'companion',
      why: '标准正态分布（均值0、标准差1）是 NORM.DIST 的特例，可先标准化再用。',
    },
    {
      id: 'percentile-inc',
      kind: 'alternative',
      why: '不假设分布形态时，直接用 PERCENTILE 从真实数据取分位数更稳妥。',
    },
    {
      id: 'stdev-s',
      kind: 'companion',
      why: '正态分布的 standard_dev 参数通常由 STDEV.S 从样本估算得到。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: '待求值', type: 'number', default: '115' },
      { key: 'mean', label: '均值', type: 'number', default: '100' },
      { key: 'standard_dev', label: '标准差', type: 'number', default: '15' },
      { key: 'cumulative', label: '累积?', type: 'text', default: 'TRUE', hint: 'TRUE=累积概率，FALSE=概率密度' },
    ],
    template: '=NORM.DIST({x},{mean},{standard_dev},{cumulative})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '0.841345', note: 'N(100,15²) 在 115 处的累积概率 ≈ 0.8413' },
      { label: '标准差为 0', type: 'error', values: { standard_dev: '0' }, expect: '#NUM!', note: 'sd 必须 >0 → #NUM!' },
      { label: '标准差为负数', type: 'error', values: { standard_dev: '-5' }, expect: '#NUM!', note: 'sd 不能为负 → #NUM!' },
      { label: '累积参数非 TRUE/FALSE', type: 'error', values: { cumulative: 'YES' }, expect: '#VALUE!', note: '累积参数必须是逻辑值 → #VALUE!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default normDistEntry;
