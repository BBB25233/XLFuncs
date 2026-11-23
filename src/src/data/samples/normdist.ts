import type { FunctionEntry } from '@/types';

/** NORMDIST · 正态累积分布（compatibility 类 B9 批次） */

const normdistEntry: FunctionEntry = {
  id: 'normdist',
  enName: 'NORMDIST',
  zhName: '正态累积分布',
  zhCommon: ['NORMDIST', '正态分布'],
  alias: ['正态累积'],
  category: 'compatibility',
  abbr: 'ztljfb',
  pinyin: 'zhengtaileijifenbu',
  keywords: ['normdist', '正态', '分布'],
  difficulty: 3,
  usageLevel: 6,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算正态分布的概率',
  summary: 'NORMDIST 返回正态分布在 x 处的累积概率或密度。新版请用 NORM.DIST。',
  syntax: { patternCn: '=NORMDIST(x, 均值, 标准差, 累积)', patternEn: '=NORMDIST(x, mean, standard_dev, cumulative)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '要计算的值' },
    { key: 'mean', zh: '均值', en: 'mean', required: true, desc: '分布均值' },
    { key: 'sd', zh: '标准差', en: 'standard_dev', required: true, desc: '分布标准差' },
    { key: 'cum', zh: '累积', en: 'cumulative', required: true, desc: 'TRUE 累积、FALSE 密度' }] },
  returnValue: '概率/密度',
  examples: [{ title: '示例：标准正态累积', scene: 'x=1、μ=0、σ=1、累积', dataAnchor: 'B2', formula: '=NORMDIST(1,0,1,TRUE)', result: '约 0.8413', explanation: '标准正态 P(Z≤1)。' },
    { title: '示例：密度', scene: 'x=0、μ=0、σ=1', dataAnchor: 'B2', formula: '=NORMDIST(0,0,1,FALSE)', result: '约 0.3989', explanation: '钟形曲线顶点高度。' }],
  pitfalls: [{ title: 'cumulative 必填', reason: '漏填默认 FALSE 得密度。', fix: '要累积概率填 TRUE。', level: 'low' }],
  related: [{ id: 'norminv', kind: 'companion', why: 'NORMINV 与本品类相关' },
    { id: 'normsdist', kind: 'companion', why: 'NORMSDIST 与本品类相关' },
    { id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'number', default: '42' },
      { key: 'mean', label: '均值', type: 'number', default: '40' },
      { key: 'sd', label: '标准差', type: 'number', default: '1.5' },
      { key: 'cum', label: '累积?', type: 'select', options: [{ label: 'TRUE（累积）', value: 'TRUE' }, { label: 'FALSE（密度）', value: 'FALSE' }], default: 'TRUE' },
    ],
    template: '=NORMDIST({x},{mean},{sd},{cum})',
    cases: [
      { label: 'ok 累积', type: 'ok', values: {}, expect: '0.908789', note: 'P(X≤42)。' },
      { label: '非法：标准差≤0', type: 'error', values: { sd: '0' }, expect: '#NUM!', note: '标准差必须 >0。' },
      { label: '非法：cum 不是布尔', type: 'error', values: { cum: 'MAYBE' }, expect: '#VALUE!', note: 'cum 只能 TRUE/FALSE。' },
          { label: '密度（不累积）', type: 'ok', values: { cum: 'FALSE' }, expect: '0.10934', note: 'cum=FALSE 时返回概率密度 0.10934。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default normdistEntry;
