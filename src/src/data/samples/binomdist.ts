import type { FunctionEntry } from '@/types';

/** BINOMDIST · 二项式分布（compatibility 类 B9 批次） */

const binomdistEntry: FunctionEntry = {
  id: 'binomdist',
  enName: 'BINOMDIST',
  zhName: '二项式分布',
  zhCommon: ['BINOMDIST', '二项'],
  alias: ['二项分布'],
  category: 'compatibility',
  abbr: 'exsfb',
  pinyin: 'erxiangshifenbu',
  keywords: ['binomdist', '二项式', '概率'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算二项分布的概率',
  summary: 'BINOMDIST 返回 n 次独立试验中成功 k 次的概率（或累积概率），是统计推断基础。',
  syntax: { patternCn: '=BINOMDIST(成功数, 试验数, 成功率, 累积)', patternEn: '=BINOMDIST(number_s, trials, probability_s, cumulative)', args: [{ key: 'k', zh: '成功数', en: 'number_s', required: true, desc: '成功次数' },
    { key: 'n', zh: '试验数', en: 'trials', required: true, desc: '总试验次数' },
    { key: 'p', zh: '成功率', en: 'probability_s', required: true, desc: '单次成功概率' },
    { key: 'cum', zh: '累积', en: 'cumulative', required: true, desc: 'TRUE 累积概率、FALSE 单点概率' }] },
  returnValue: '概率值',
  examples: [
    { title: '示例：单点概率', scene: '10 抛 6 次正面、硬币公平', dataAnchor: 'B2', formula: '=BINOMDIST(6,10,0.5,FALSE)', result: '约 0.2051', explanation: 'C(10,6)×0.5¹⁰。' },
    {
      title: '示例 2：抽检 20 件、不良率 5%，算单点概率',
      scene: '来料抽检 20 件，历史不良率 5%。想知道「正好 2 件不良」和「正好 5 件不良」各有多大可能，用来定验收标准。',
      dataTsv: '不良件数\t正好这么多件的概率\n0\t？\n2\t？\n5\t？',
      dataAnchor: 'A1',
      formula: '=BINOMDIST(A2,20,0.05,FALSE)',
      result: '0 件 → 0.358486，2 件 → 0.188677，5 件 → 0.002245',
      explanation: '第 4 参数写 FALSE 才是「正好 k 件」的单点概率，写 TRUE 会变成「不超过 k 件」的累积概率。第 2 参数是抽检总数 20，别把不良率填到第 2 位。',
    },
  ],
  pitfalls: [{ title: 'cumulative 必填', reason: '漏填会被当 FALSE。', fix: '明确 TRUE/FALSE。', level: 'low' }],
  related: [{ id: 'critbinom', kind: 'companion', why: 'CRITBINOM 与本品类相关' },
    { id: 'negbinomdist', kind: 'companion', why: 'NEGBINOMDIST 与本品类相关' },
    { id: 'poisson', kind: 'companion', why: 'POISSON 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'k', label: '成功次数 k', type: 'text', default: '6' },
      { key: 'n', label: '试验次数 n', type: 'text', default: '10' },
      { key: 'p', label: '成功概率 p', type: 'text', default: '0.5' },
      { key: 'cum', label: '累积', type: 'text', default: 'TRUE' },
    ],
    template: '=BINOMDIST({k},{n},{p},{cum})',
    cases: [
      { label: '累积概率 P(X<=6)', type: 'ok', values: {}, expect: '0.828125', note: 'TRUE 返回累积分布。' },
      { label: '单点概率 P(X=6)', type: 'ok', values: { cum: 'FALSE' }, expect: '0.205078', note: 'FALSE 返回概率质量。' },
      { label: 'k 为负', type: 'error', values: { k: '-1' }, expect: '#NUM!', note: 'k、n 必须非负且 k<=n。' },
      { label: 'cumulative 非逻辑值', type: 'error', values: { cum: 'abc' }, expect: '#VALUE!', note: '第 4 参数填 TRUE 或 FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default binomdistEntry;
