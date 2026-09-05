import type { FunctionEntry } from '@/types';

/** EXPONDIST · 指数分布（compatibility 类 B9 批次） */

const expondistEntry: FunctionEntry = {
  id: 'expondist',
  enName: 'EXPONDIST',
  zhName: '指数分布',
  zhCommon: ['EXPONDIST', '指数'],
  alias: ['指数分布'],
  category: 'compatibility',
  abbr: 'zsfb',
  pinyin: 'zhishufenbu',
  keywords: ['expondist', '指数', '分布'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算指数分布的概率',
  summary: 'EXPONDIST 返回指数分布在 x 处的概率密度或累积概率，常用于寿命/等待时间建模。',
  syntax: { patternCn: '=EXPONDIST(x, λ, 累积)', patternEn: '=EXPONDIST(x, lambda, cumulative)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '要计算的值' },
    { key: 'lambda', zh: 'λ', en: 'lambda', required: true, desc: '速率参数' },
    { key: 'cum', zh: '累积', en: 'cumulative', required: true, desc: 'TRUE 累积、FALSE 密度' }] },
  returnValue: '概率/密度',
  examples: [{ title: '示例：指数累积概率', scene: 'x=0.2、λ=10', dataAnchor: 'B2', formula: '=EXPONDIST(0.2,10,TRUE)', result: '约 0.8647', explanation: '1-e^(-10×0.2)。' }],
  pitfalls: [{ title: 'λ 与均值关系', reason: '均值是 1/λ，别填反。', fix: '均值 = 1/λ。', level: 'low' }],
  related: [{ id: 'poisson', kind: 'companion', why: 'POISSON 与本品类相关' },
    { id: 'weibull', kind: 'companion', why: 'WEIBULL 与本品类相关' },
    { id: 'gammadist', kind: 'companion', why: 'GAMMADIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'text', default: '5' },
      { key: 'lambda', label: 'lambda', type: 'text', default: '2' },
      { key: 'cum', label: '累积', type: 'text', default: 'TRUE' },
    ],
    template: '=EXPONDIST({x},{lambda},{cum})',
    cases: [
      { label: '累积分布', type: 'ok', values: {}, expect: '0.999955', note: 'TRUE 返回累积分布。' },
      { label: 'x 为负', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须大于等于 0。' },
      { label: 'lambda 非正', type: 'error', values: { lambda: '0' }, expect: '#NUM!', note: 'lambda 必须大于 0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default expondistEntry;
