import type { FunctionEntry } from '@/types';

/** LOGINV · 对数正态反函数（compatibility 类 B9 批次） */

const loginvEntry: FunctionEntry = {
  id: 'loginv',
  enName: 'LOGINV',
  zhName: '对数正态反函数',
  zhCommon: ['LOGINV', '对数正态反'],
  alias: ['对数正态反'],
  category: 'compatibility',
  abbr: 'dsztfhs',
  pinyin: 'duishuzhengtaifanhanshu',
  keywords: ['loginv', '对数正态', '反函数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由概率反查对数正态值',
  summary: 'LOGINV 是 LOGNORMDIST 的逆运算：给定累积概率反推对数正态变量值。',
  syntax: { patternCn: '=LOGINV(概率, 均值, 标准差)', patternEn: '=LOGINV(probability, mean, standard_dev)', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '累积概率' },
    { key: 'mean', zh: '均值', en: 'mean', required: true, desc: 'ln(x) 的均值' },
    { key: 'sd', zh: '标准差', en: 'standard_dev', required: true, desc: 'ln(x) 的标准差' }] },
  returnValue: '对应的 x 值',
  examples: [{ title: '示例：对数正态反函数', scene: '概率 0.1、ln 均值 0、标准差 1', dataAnchor: 'B2', formula: '=LOGINV(0.1,0,1)', result: '约 0.2776', explanation: 'e^(0+1×NORMSINV(0.1))。' },
    { title: '示例 2：p=0.5 直接给出中位数', scene: '某城市收入服从对数正态分布，ln(收入) 均值 3.5、标准差 1.2，报告里要写「一半人收入低于多少」。', dataAnchor: 'B2', formula: '=LOGINV(0.5,3.5,1.2)', result: '约 33.12（万元）', explanation: 'p=0.5 时 NORMSINV(0.5)=0，公式退化成 e^3.5≈33.12。对数正态的中位数是 e^μ，不等于算术均值，别拿均值当「典型值」。' }],
  pitfalls: [{ title: '参数是 ln(x) 的', reason: 'mean/sd 是取对数后的，不是 x 本身的。', fix: '先取 ln 再填。', level: 'mid' }],
  related: [{ id: 'lognordist', kind: 'companion', why: 'LOGNORDIST 与本品类相关' },
    { id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' },
    { id: 'gammainv', kind: 'companion', why: 'GAMMAINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率 p', type: 'text', default: '0.9' },
      { key: 'mean', label: '均值 mean', type: 'text', default: '3.5' },
      { key: 'sd', label: '标准差 sd', type: 'text', default: '1.2' },
    ],
    template: '=LOGINV({p},{mean},{sd})',
    cases: [
      { label: '逆 CDF', type: 'ok', values: {}, expect: '154.140092', note: '对数正态的逆函数。' },
      { label: 'p 越界', type: 'error', values: { p: '1.5' }, expect: '#NUM!', note: '需满足 0<p<1。' },
      { label: 'sd 非正', type: 'error', values: { sd: '0' }, expect: '#NUM!', note: 'sd 必须大于 0。' },
      { label: 'p 取边界 0', type: 'error', values: { p: '0' }, expect: '#NUM!', note: '概率必须严格落在 0 和 1 之间。' },
      { label: 'mean 填了文字', type: 'error', values: { mean: 'abc' }, expect: '#VALUE!', note: '均值必须是数字，文字参数会直接报 #VALUE!。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default loginvEntry;
