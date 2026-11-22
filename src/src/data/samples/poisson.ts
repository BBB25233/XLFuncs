import type { FunctionEntry } from '@/types';

/** POISSON · 旧泊松分布（compatibility 类 B9 批次） */

const poissonEntry: FunctionEntry = {
  id: 'poisson',
  enName: 'POISSON',
  zhName: '旧泊松分布',
  zhCommon: ['POISSON', '泊松'],
  alias: ['泊松分布'],
  category: 'compatibility',
  abbr: 'jbsfb',
  pinyin: 'jiubosongfenbu',
  keywords: ['poisson', '泊松', '分布'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算泊松分布的概率',
  summary: 'POISSON 返回单位时间/空间内发生 k 次事件的概率（或累积概率）。新版请用 POISSON.DIST。',
  syntax: { patternCn: '=POISSON(发生数, 均值, 累积)', patternEn: '=POISSON(x, mean, cumulative)', args: [{ key: 'x', zh: '发生数', en: 'x', required: true, desc: '事件次数' },
    { key: 'm', zh: '均值', en: 'mean', required: true, desc: '平均发生次数 λ' },
    { key: 'cum', zh: '累积', en: 'cumulative', required: true, desc: 'TRUE 累积、FALSE 单点' }] },
  returnValue: '概率值',
  examples: [
    { title: '示例：泊松累积', scene: 'x=2、λ=5', dataAnchor: 'B2', formula: '=POISSON(2,5,TRUE)', result: '约 0.1247', explanation: 'P(X≤2 | λ=5)。' },
    {
      title: '示例 2：只算「正好 k 通」的单点概率',
      scene: '客服中心平均每分钟来 3 通电话，想知道正好 5 通的概率有多大，用这个数来排班。这时不能用累积口径。',
      dataTsv: '来电数 k\t正好 k 通的概率\n0\t？\n3\t？\n5\t？',
      dataAnchor: 'A1',
      formula: '=POISSON(A2,3,FALSE)',
      result: '0 通 → 0.049787，3 通 → 0.224042，5 通 → 0.100819',
      explanation: '第 3 参数 FALSE 只算「正好 k 次」，TRUE 算「不超过 k 次」。注意正好 3 通的概率比正好 5 通高一倍多，泊松概率并不随 k 递增。',
    },
  ],
  pitfalls: [{ title: 'cumulative 必填', reason: '漏填默认 FALSE。', fix: '明确 TRUE/FALSE。', level: 'low' }],
  related: [{ id: 'expondist', kind: 'companion', why: 'EXPONDIST 与本品类相关' },
    { id: 'binomdist', kind: 'companion', why: 'BINOMDIST 与本品类相关' },
    { id: 'negbinomdist', kind: 'companion', why: 'NEGBINOMDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'number', default: '2' },
      { key: 'm', label: '均值 λ', type: 'number', default: '5' },
      { key: 'cum', label: '累积?', type: 'select', options: [{ label: 'TRUE（累积）', value: 'TRUE' }, { label: 'FALSE（概率）', value: 'FALSE' }], default: 'TRUE' },
    ],
    template: '=POISSON({x},{m},{cum})',
    cases: [
      { label: 'ok 累积', type: 'ok', values: {}, expect: '0.124652', note: 'P(X≤2 | λ=5)。' },
      { label: '非法：x<0', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须 ≥0 整数。' },
      { label: '非法：λ≤0', type: 'error', values: { m: '0' }, expect: '#NUM!', note: 'λ 必须 >0。' },
      { label: '❌ 累积参数填中文「是」', type: 'error', values: { cum: '是' }, expect: '#VALUE!', note: '意思：第 3 参数只认 TRUE 或 FALSE，填中文「是」会被当成文本。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default poissonEntry;
