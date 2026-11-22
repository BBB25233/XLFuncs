import type { FunctionEntry } from '@/types';

/** HYPGEOMDIST · 超几何分布（compatibility 类 B9 批次） */

const hypgeomdistEntry: FunctionEntry = {
  id: 'hypgeomdist',
  enName: 'HYPGEOMDIST',
  zhName: '超几何分布',
  zhCommon: ['HYPGEOMDIST', '超几何'],
  alias: ['超几何分布'],
  category: 'compatibility',
  abbr: 'cjhfb',
  pinyin: 'chaojihefenbu',
  keywords: ['hypgeomdist', '超几何', '抽样'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算不放回抽样的概率',
  summary: 'HYPGEOMDIST 返回从总体中不放回抽取时抽到指定成功数的概率，用于有限总体抽样。',
  syntax: { patternCn: '=HYPGEOMDIST(抽中数, 抽取数, 总体成功数, 总体数)', patternEn: '=HYPGEOMDIST(sample_s, number_sample, population_s, number_pop)', args: [{ key: 's', zh: '抽中数', en: 'sample_s', required: true, desc: '样本中成功数' },
    { key: 'n', zh: '抽取数', en: 'number_sample', required: true, desc: '样本量' },
    { key: 'ps', zh: '总体成功数', en: 'population_s', required: true, desc: '总体中成功数' },
    { key: 'np', zh: '总体数', en: 'number_pop', required: true, desc: '总体大小' }] },
  returnValue: '概率值',
  examples: [{ title: '示例：超几何概率', scene: '总体 20 含 8 成功、抽 4 中 1', dataAnchor: 'B2', formula: '=HYPGEOMDIST(1,4,8,20)', result: '约 0.3635', explanation: 'C(8,1)×C(12,3)/C(20,4)。' },
    { title: '示例 2：抽检恰好发现 2 个次品', scene: '一批 20 个零件里有 8 个次品，质检不放回随机抽 4 个，问恰好抽到 2 个次品的概率，用来评估抽检方案。', dataAnchor: 'B2', formula: '=HYPGEOMDIST(2,4,8,20)', result: '约 0.3814', explanation: 'C(8,2)×C(12,2)/C(20,4) = 28×66/4845 ≈ 0.3814。抽一个少一个、不放回，所以用超几何；放回抽样才用 BINOMDIST。' }],
  pitfalls: [{ title: '不放回假设', reason: '与二项分布（放回）不同。', fix: '不放回用本函数。', level: 'mid' }],
  related: [{ id: 'binomdist', kind: 'companion', why: 'BINOMDIST 与本品类相关' },
    { id: 'critbinom', kind: 'companion', why: 'CRITBINOM 与本品类相关' },
    { id: 'poisson', kind: 'companion', why: 'POISSON 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 's', label: '样本成功数 s', type: 'text', default: '3' },
      { key: 'n', label: '抽样数 n', type: 'text', default: '4' },
      { key: 'ps', label: '总体成功数', type: 'text', default: '8' },
      { key: 'np', label: '总体大小', type: 'text', default: '20' },
    ],
    template: '=HYPGEOMDIST({s},{n},{ps},{np})',
    cases: [
      { label: '概率质量', type: 'ok', values: {}, expect: '0.1387', note: '不放回抽样的超几何概率。' },
      { label: 's 超出总体成功数', type: 'error', values: { s: '9' }, expect: '#NUM!', note: '需满足 0<=s<=ps<=np。' },
      { label: 'n 为负', type: 'error', values: { n: '-1' }, expect: '#NUM!', note: '需满足 0<=n<=np。' },
      { label: '总体成功数超过总体', type: 'error', values: { ps: '25' }, expect: '#NUM!', note: '需满足 population_s<=number_pop，成功数不可能多过总体。' },
      { label: '抽样数不是整数', type: 'error', values: { n: '2.5' }, expect: '#NUM!', note: '四个参数都必须是整数，抽 2.5 个没有意义。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default hypgeomdistEntry;
