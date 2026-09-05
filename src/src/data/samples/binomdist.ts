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
  examples: [{ title: '示例：单点概率', scene: '10 抛 6 次正面、硬币公平', dataAnchor: 'B2', formula: '=BINOMDIST(6,10,0.5,FALSE)', result: '约 0.2051', explanation: 'C(10,6)×0.5¹⁰。' }],
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
