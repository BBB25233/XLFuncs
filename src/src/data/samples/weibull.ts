import type { FunctionEntry } from '@/types';

/** WEIBULL · 韦伯分布（compatibility 类 B9 批次） */

const weibullEntry: FunctionEntry = {
  id: 'weibull',
  enName: 'WEIBULL',
  zhName: '韦伯分布',
  zhCommon: ['WEIBULL', '韦伯'],
  alias: ['Weibull 分布'],
  category: 'compatibility',
  abbr: 'wbfb',
  pinyin: 'weibofenbu',
  keywords: ['weibull', '韦伯', '分布'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算韦伯分布的概率',
  summary: 'WEIBULL 返回韦伯分布在 x 处的概率密度或累积概率，可靠性/寿命分析常用。新版请用 WEIBULL.DIST。',
  syntax: { patternCn: '=WEIBULL(x, 形状, 尺度, 累积)', patternEn: '=WEIBULL(x, alpha, beta, cumulative)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '要计算的值' },
    { key: 'alpha', zh: '形状', en: 'alpha', required: true, desc: '形状参数' },
    { key: 'beta', zh: '尺度', en: 'beta', required: true, desc: '尺度参数' },
    { key: 'cum', zh: '累积', en: 'cumulative', required: true, desc: 'TRUE 累积、FALSE 密度' }] },
  returnValue: '概率/密度',
  examples: [{ title: '示例：韦伯累积', scene: 'x=105、形状 20、尺度 100', dataAnchor: 'B2', formula: '=WEIBULL(105,20,100,TRUE)', result: '约 0.9296', explanation: '1-e^-(1.05²⁰)。' },
    { title: '示例 2：算失效密度画曲线', scene: '零件寿命服从韦伯分布（形状 2、尺度 3 千小时），要画失效密度曲线，先算 x=2 千小时处的密度值。', dataAnchor: 'B2', formula: '=WEIBULL(2,2,3,FALSE)', result: '约 0.285', explanation: '第 4 参数填 FALSE 返回密度，填 TRUE 才是累积概率。密度不是概率，可以大于 1，只用来比较各点高低，画曲线别把它当概率读。' }],
  pitfalls: [{ title: '形状参数影响', reason: 'α 决定失效曲线形态。', fix: '结合业务选 α。', level: 'low' }],
  related: [{ id: 'expondist', kind: 'companion', why: 'EXPONDIST 与本品类相关' },
    { id: 'gammadist', kind: 'companion', why: 'GAMMADIST 与本品类相关' },
    { id: 'normdist', kind: 'companion', why: 'NORMDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'number', default: '2' },
      { key: 'alpha', label: '形状 α', type: 'number', default: '2' },
      { key: 'beta', label: '尺度 β', type: 'number', default: '3' },
      { key: 'cum', label: '累积?', type: 'select', options: [{ label: 'TRUE（累积）', value: 'TRUE' }, { label: 'FALSE（密度）', value: 'FALSE' }], default: 'TRUE' },
    ],
    template: '=WEIBULL({x},{alpha},{beta},{cum})',
    cases: [
      { label: 'ok 累积', type: 'ok', values: {}, expect: '0.35882', note: '1-e^-(x/β)^α。' },
      { label: '非法：x<0', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须 ≥0。' },
      { label: '非法：cum 非布尔', type: 'error', values: { cum: 'X' }, expect: '#VALUE!', note: 'cum 只能 TRUE/FALSE。' },
      { label: '非法：形状 ≤0', type: 'error', values: { alpha: '0' }, expect: '#NUM!', note: '形状参数 alpha 必须大于 0。' },
      { label: '非法：尺度 ≤0', type: 'error', values: { beta: '-1' }, expect: '#NUM!', note: '尺度参数 beta 必须大于 0，负数不行。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default weibullEntry;
