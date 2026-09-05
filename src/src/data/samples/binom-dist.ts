import type { FunctionEntry } from '@/types';

/** BINOM.DIST · 二项分布（statistical 类 B4 批次） */

const TSV = '参数\t值\n试验次数\t10\n单次成功率\t0.3\n成功次数\t4';

const binomDistEntry: FunctionEntry = {
  id: 'binom-dist',
  enName: 'BINOM.DIST',
  zhName: '二项分布',
  zhCommon: ['二项分布', 'BINOM.DIST', '成功次数概率'],
  alias: ['n次试验k次成功', '伯努利重复', '抽检概率'],
  category: 'statistical',
  abbr: 'exfb',
  pinyin: 'erxiangfenbu',
  keywords: ['BINOM.DIST', '二项分布', '成功次数', '抽检', '概率', '质量检验'],
  difficulty: 4,
  usageLevel: 12,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用 BINOMDIST（新版保留为兼容性函数）。',
  },
  oneLiner: '算「做 n 次独立试验，恰好成功 k 次」的概率',
  summary:
    '二项分布描述的是「重复 n 次、每次成功率固定为 p、各次互不影响」时的成功次数分布。典型场景：抽 10 件产品恰有 4 件次品的概率、投 20 次硬币恰有 12 次正面的概率。第四参数决定是「恰好 k 次」（FALSE，概率质量）还是「最多 k 次」（TRUE，累积概率）——日常提问「不超过 2 个次品的概率」要用 TRUE。',
  syntax: {
    patternCn: '=BINOM.DIST(成功次数, 试验次数, 单次成功率, 累积与否)',
    patternEn: '=BINOM.DIST(number_s, trials, probability_s, cumulative)',
    args: [
      {
        key: 'number_s',
        zh: '成功次数',
        en: 'number_s',
        required: true,
        desc: '你关心的成功次数 k，取值 0 到 trials。',
        accepts: '非负整数或单元格引用。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '⚠️ 超过试验次数会被截为试验次数；负数报 #NUM!。',
        example: '4',
        pitfallRank: 2,
      },
      {
        key: 'trials',
        zh: '试验次数',
        en: 'trials',
        required: true,
        desc: '总共做了多少次试验 n。',
        accepts: '非负整数。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '必须 ≥ number_s。',
        example: '10',
        pitfallRank: 2,
      },
      {
        key: 'probability_s',
        zh: '单次成功率',
        en: 'probability_s',
        required: true,
        desc: '每一次试验成功的概率 p，0 到 1 之间。',
        accepts: '0–1 的小数，如 0.3 或 30%。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '⚠️ 写 30 表示 3000%，会报 #NUM!。',
        example: '0.3',
        pitfallRank: 1,
      },
      {
        key: 'cumulative',
        zh: '累积与否',
        en: 'cumulative',
        required: true,
        desc: 'FALSE = 恰好 k 次的概率；TRUE = 最多 k 次的累积概率。',
        accepts: 'TRUE / FALSE 或 1 / 0。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '问「恰好」用 FALSE，问「不超过 / 至少」用 TRUE（至少需配合 1−）。',
        example: 'FALSE',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回对应概率（0–1）；参数越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：恰有 4 次成功的概率',
      scene: '单次成功率 30%，做 10 次，恰好成功 4 次的概率。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=BINOM.DIST(B4,B2,B3,FALSE)',
      result: '约 0.2001（约 20.01%）',
      explanation: '这是「恰好 4 次」的概率，也是分布曲线在 k=4 处的高度。',
    },
    {
      title: '示例 2：最多 4 次成功的概率（累积）',
      scene: '质检关心「次品不超过 4 个」的概率。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=BINOM.DIST(B4,B2,B3,TRUE)',
      result: '约 0.8497（约 84.97%）',
      explanation: 'TRUE 给出的是 0、1、2、3、4 次成功的概率之和，即「最多 4 次」。',
    },
    {
      title: '示例 3：至少 3 次成功的概率',
      scene: '问「至少」时要做一点转换。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=1-BINOM.DIST(2,B2,B3,TRUE)',
      result: '约 0.6172（1 减去「最多 2 次」的概率）',
      explanation: '「至少 3 次」= 1 − 「最多 2 次」，这是求右尾概率的标准写法。',
    },
  ],
  pitfalls: [
    {
      title: '把「恰好」和「最多」的参数搞混',
      reason: '第四参数 FALSE 是恰好 k 次、TRUE 是最多 k 次，选错结果差很多。',
      fix: '问「恰好 / 正好」用 FALSE；问「不超过 / 至多」用 TRUE；问「至少」用 1−TRUE(k−1)。',
      level: 'high',
    },
    {
      title: '单次成功率写成 30 而不是 0.3',
      reason: '概率参数必须是 0–1 之间的小数，30 相当于 3000%。',
      fix: '写 0.3 或 30%。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '忽略「各次独立、概率恒定」的前提',
      reason: '二项分布假设每次试验互不影响且成功率固定；抽检不放回、次品率波动时不适用。',
      fix: '不放回抽检的场景应改用超几何分布 HYPGEOM.DIST。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'poisson-dist',
      kind: 'companion',
      why: '当试验次数很大、单次概率很小时，二项分布可用泊松分布近似。',
    },
    {
      id: 'frequency',
      kind: 'alternative',
      why: '若只想知道真实数据中各次数出现了多少，用 FREQUENCY 直接统计即可，不必建模。',
    },
    {
      id: 'permut',
      kind: 'companion',
      why: '二项分布的概率公式里包含组合数，与 COMBIN 相关。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number_s', label: '成功次数 k', type: 'number', default: '4' },
      { key: 'trials', label: '试验次数 n', type: 'number', default: '10' },
      { key: 'probability_s', label: '单次成功率 p', type: 'number', default: '0.3' },
      { key: 'cumulative', label: '累积?', type: 'text', default: 'FALSE', hint: 'TRUE=最多 k 次，FALSE=恰好 k 次' },
    ],
    template: '=BINOM.DIST({number_s},{trials},{probability_s},{cumulative})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '0.200121', note: '恰好 4 次成功的概率质量 ≈ 0.2001' },
      { label: '成功率写成 2（>1）', type: 'error', values: { probability_s: '2' }, expect: '#NUM!', note: 'p 必须在 0–1，写 2 报 #NUM!' },
      { label: '成功次数大于试验次数', type: 'error', values: { number_s: '11', trials: '10' }, expect: '#NUM!', note: 'k>n 报 #NUM!' },
      { label: '累积参数非 TRUE/FALSE', type: 'error', values: { cumulative: 'YES' }, expect: '#VALUE!', note: '累积参数必须是逻辑值 → #VALUE!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default binomDistEntry;
