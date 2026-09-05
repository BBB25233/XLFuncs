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
  examples: [{ title: '示例：临界成功数', scene: 'n=10、p=0.5、阈值 0.75', dataAnchor: 'B2', formula: '=CRITBINOM(10,0.5,0.75)', result: '6', explanation: 'P(X≤6)≈0.828≥0.75。' }],
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
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default critbinomEntry;
