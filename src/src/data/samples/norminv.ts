import type { FunctionEntry } from '@/types';

/** NORMINV · 正态反函数（compatibility 类 B9 批次） */

const norminvEntry: FunctionEntry = {
  id: 'norminv',
  enName: 'NORMINV',
  zhName: '正态反函数',
  zhCommon: ['NORMINV', '正态反'],
  alias: ['正态分位数'],
  category: 'compatibility',
  abbr: 'ztfhs',
  pinyin: 'zhengtaifanhanshu',
  keywords: ['norminv', '正态', '反函数'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由概率反查正态值',
  summary: 'NORMINV 是 NORMDIST 的逆运算：给定累积概率反推 x。新版请用 NORM.INV。',
  syntax: { patternCn: '=NORMINV(概率, 均值, 标准差)', patternEn: '=NORMINV(probability, mean, standard_dev)', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '累积概率（0~1）' },
    { key: 'mean', zh: '均值', en: 'mean', required: true, desc: '分布均值' },
    { key: 'sd', zh: '标准差', en: 'standard_dev', required: true, desc: '分布标准差' }] },
  returnValue: '对应的 x 值',
  examples: [{ title: '示例：正态分位数', scene: '概率 0.8413、μ=0、σ=1', dataAnchor: 'B2', formula: '=NORMINV(0.8413,0,1)', result: '约 1.0', explanation: '与 NORMDIST(1,0,1,TRUE) 互逆。' }],
  pitfalls: [{ title: '与 NORMSINV 区别', reason: 'NORMINV 可指定 μ/σ。', fix: '标准化情形用 NORMSINV。', level: 'low' }],
  related: [{ id: 'normdist', kind: 'companion', why: 'NORMDIST 与本品类相关' },
    { id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' },
    { id: 'normsdist', kind: 'companion', why: 'NORMSDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率', type: 'number', default: '0.9087888' },
      { key: 'mean', label: '均值', type: 'number', default: '40' },
      { key: 'sd', label: '标准差', type: 'number', default: '1.5' },
    ],
    template: '=NORMINV({p},{mean},{sd})',
    cases: [
      { label: 'ok 分位数', type: 'ok', values: {}, expect: '42', note: '与 NORMDIST(42,40,1.5,TRUE) 互逆。' },
      { label: '非法：概率越界', type: 'error', values: { p: '2' }, expect: '#NUM!', note: '概率必须 0<p<1。' },
      { label: '非法：标准差≤0', type: 'error', values: { sd: '0' }, expect: '#NUM!', note: '标准差必须 >0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default norminvEntry;
