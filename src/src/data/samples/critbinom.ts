import type { FunctionEntry } from '@/types';

/** CRITBINOM · 临界二项式（compatibility 类 B9 批次） */

const critbinomEntry: FunctionEntry = {
  id: 'critbinom',
  enName: 'CRITBINOM',
  zhName: '临界二项式',
  zhCommon: ['CRITBINOM', '临界二项'],
  alias: ['二项临界值'],
  category: 'compatibility',
  abbr: 'ljexs',
  pinyin: 'linjieerxiangshi',
  keywords: ['critbinom', '二项', '临界'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '求二项分布的最小成功数',
  summary: 'CRITBINOM 返回使累积二项分布概率 ≥ 指定值的最小成功次数，用于质量验收判定。',
  syntax: { patternCn: '=CRITBINOM(试验数, 成功率, 目标概率)', patternEn: '=CRITBINOM(trials, probability_s, alpha)', args: [{ key: 'n', zh: '试验数', en: 'trials', required: true, desc: '总试验次数' },
    { key: 'p', zh: '成功率', en: 'probability_s', required: true, desc: '单次成功概率' },
    { key: 'alpha', zh: '目标概率', en: 'alpha', required: true, desc: '累积概率阈值' }] },
  returnValue: '最小成功次数',
  examples: [
    { title: '示例：临界成功数', scene: 'n=10、p=0.5、阈值 0.75', dataAnchor: 'B2', formula: '=CRITBINOM(10,0.5,0.75)', result: '6', explanation: 'P(X≤6)≈0.828≥0.75。' },
    {
      title: '示例 2：alpha 取 0、0.5、1 三个边界值',
      scene: '第 3 参数是累积概率阈值。把它取成 0、0.5、1 这三个特殊值，能看清「最小成功次数」到底是怎么定出来的。',
      dataTsv: '阈值 alpha\t最小成功次数\n0\t？\n0.5\t？\n1\t？',
      dataAnchor: 'A1',
      formula: '=CRITBINOM(10,0.5,A2)',
      result: 'alpha=0 → 0，alpha=0.5 → 5，alpha=1 → 10',
      explanation: 'alpha=0 时 k=0 就已经满足，因为累积概率必然不小于 0。alpha=1 时只有 k=n 的累积概率正好等于 1。中间值就是累积概率第一次跨过 alpha 的那个 k。',
    },
  ],
  pitfalls: [{ title: '阈值含义', reason: 'alpha 是累积概率阈值而非显著性。', fix: '理解其为下限概率。', level: 'low' }],
  related: [{ id: 'binomdist', kind: 'companion', why: 'BINOMDIST 与本品类相关' },
    { id: 'negbinomdist', kind: 'companion', why: 'NEGBINOMDIST 与本品类相关' },
    { id: 'poisson', kind: 'companion', why: 'POISSON 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'n', label: '试验次数 n', type: 'text', default: '6' },
      { key: 'p', label: '成功概率 p', type: 'text', default: '0.5' },
      { key: 'alpha', label: '临界值 alpha', type: 'text', default: '0.75' },
    ],
    template: '=CRITBINOM({n},{p},{alpha})',
    cases: [
      { label: '最小成功次数', type: 'ok', values: {}, expect: '4', note: '使累积概率首次 >= alpha 的最小 k。' },
      { label: 'alpha 越界', type: 'error', values: { alpha: '1.5' }, expect: '#NUM!', note: '需满足 0<=alpha<=1。' },
      { label: 'n 为负', type: 'error', values: { n: '-1' }, expect: '#NUM!', note: 'n 必须非负。' },
      { label: '❌ 成功率 p 越界', type: 'error', values: { p: '1.5' }, expect: '#NUM!', note: '意思：单次成功概率不可能大于 1。需满足 0≤p≤1。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default critbinomEntry;
