import type { FunctionEntry } from '@/types';

/** GAMMADIST · 伽马分布（compatibility 类 B9 批次） */

const gammadistEntry: FunctionEntry = {
  id: 'gammadist',
  enName: 'GAMMADIST',
  zhName: '伽马分布',
  zhCommon: ['GAMMADIST', '伽马'],
  alias: ['Gamma 分布'],
  category: 'compatibility',
  abbr: 'jmfb',
  pinyin: 'jiamafenbu',
  keywords: ['gammadist', '伽马', '分布'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算伽马分布的概率',
  summary: 'GAMMADIST 返回伽马分布在 x 处的概率密度或累积概率，常用于等待时间建模。',
  syntax: { patternCn: '=GAMMADIST(x, 形状, 尺度, 累积)', patternEn: '=GAMMADIST(x, alpha, beta, cumulative)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '要计算的值' },
    { key: 'alpha', zh: '形状', en: 'alpha', required: true, desc: '形状参数' },
    { key: 'beta', zh: '尺度', en: 'beta', required: true, desc: '尺度参数' },
    { key: 'cum', zh: '累积', en: 'cumulative', required: true, desc: 'TRUE 累积、FALSE 密度' }] },
  returnValue: '概率/密度',
  examples: [{ title: '示例：伽马密度', scene: 'x=10、形状 9、尺度 2', dataAnchor: 'B2', formula: '=GAMMADIST(10,9,2,FALSE)', result: '约 0.084', explanation: '形状 9 尺度 2 在 x=10 的密度。' }],
  pitfalls: [{ title: '尺度非速率', reason: 'GAMMADIST 用尺度 β=1/λ。', fix: '注意与指数分布的 λ 区别。', level: 'low' }],
  related: [{ id: 'gammainv', kind: 'companion', why: 'GAMMAINV 与本品类相关' },
    { id: 'weibull', kind: 'companion', why: 'WEIBULL 与本品类相关' },
    { id: 'expondist', kind: 'companion', why: 'EXPONDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'text', default: '10' },
      { key: 'alpha', label: 'Alpha', type: 'text', default: '9' },
      { key: 'beta', label: 'Beta(尺度)', type: 'text', default: '2' },
      { key: 'cum', label: '累积', type: 'text', default: 'TRUE' },
    ],
    template: '=GAMMADIST({x},{alpha},{beta},{cum})',
    cases: [
      { label: '累积分布', type: 'ok', values: {}, expect: '0.068094', note: 'TRUE 返回累积分布。' },
      { label: 'x 为负', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须大于等于 0。' },
      { label: 'alpha 非正', type: 'error', values: { alpha: '0' }, expect: '#NUM!', note: 'alpha、beta 必须大于 0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default gammadistEntry;
