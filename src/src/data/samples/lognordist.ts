import type { FunctionEntry } from '@/types';

/** LOGNORMDIST · 对数正态分布（compatibility 类 B9 批次） */

const lognordistEntry: FunctionEntry = {
  id: 'lognordist',
  enName: 'LOGNORMDIST',
  zhName: '对数正态分布',
  zhCommon: ['LOGNORMDIST', '对数正态'],
  alias: ['对数正态'],
  category: 'compatibility',
  abbr: 'dsztfb',
  pinyin: 'duishuzhengtaifenbu',
  keywords: ['lognordist', '对数正态', '分布'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算对数正态的累积概率',
  summary: 'LOGNORMDIST 返回对数正态变量 ≤x 的累积概率，常用于收入、价格等右偏数据。',
  syntax: { patternCn: '=LOGNORMDIST(x, 均值, 标准差)', patternEn: '=LOGNORMDIST(x, mean, standard_dev)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '要计算的值' },
    { key: 'mean', zh: '均值', en: 'mean', required: true, desc: 'ln(x) 的均值' },
    { key: 'sd', zh: '标准差', en: 'standard_dev', required: true, desc: 'ln(x) 的标准差' }] },
  returnValue: '累积概率',
  examples: [{ title: '示例：对数正态累积', scene: 'x=4、ln 均值 3.5、sd 1.2', dataAnchor: 'B2', formula: '=LOGNORMDIST(4,3.5,1.2)', result: '约 0.039', explanation: '按 (ln4-3.5)/1.2 标准化后查正态。' }],
  pitfalls: [{ title: '与 NORMDIST 区别', reason: '对数正态偏态，正态对称。', fix: '右偏数据用 LOGNORMDIST。', level: 'low' }],
  related: [{ id: 'loginv', kind: 'companion', why: 'LOGINV 与本品类相关' },
    { id: 'normdist', kind: 'companion', why: 'NORMDIST 与本品类相关' },
    { id: 'expondist', kind: 'companion', why: 'EXPONDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'text', default: '4' },
      { key: 'mean', label: '均值 mean', type: 'text', default: '3.5' },
      { key: 'sd', label: '标准差 sd', type: 'text', default: '1.2' },
      { key: 'cum', label: '累积', type: 'text', default: 'TRUE' },
    ],
    template: '=LOGNORMDIST({x},{mean},{sd},{cum})',
    cases: [
      { label: '累积分布', type: 'ok', values: {}, expect: '0.039084', note: 'TRUE 返回累积分布。' },
      { label: 'x 非正', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须大于 0。' },
      { label: 'sd 非正', type: 'error', values: { sd: '0' }, expect: '#NUM!', note: 'sd 必须大于 0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default lognordistEntry;
