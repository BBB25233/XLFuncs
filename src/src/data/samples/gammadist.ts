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
  examples: [{ title: '示例：伽马密度', scene: 'x=10、形状 9、尺度 2', dataAnchor: 'B2', formula: '=GAMMADIST(10,9,2,FALSE)', result: '约 0.0326', explanation: '形状 9 尺度 2 在 x=10 的密度。' },
    { title: '示例 2：换设备 6 天内再次故障的累积概率', scene: '某设备连续两次故障的间隔天数服从 Gamma（形状 2、尺度 3），运维想知道 6 天内又坏的概率，好决定备件量。', dataAnchor: 'B2', formula: '=GAMMADIST(6,2,3,TRUE)', result: '约 0.594（约 59.4% 的概率 6 天内再次故障）', explanation: '第 4 参数填 TRUE 得到累积概率。形状 2、尺度 3 的均值正好是 2×3=6 天，但落在均值处的累积概率是 0.594 而不是 0.5——伽马分布右偏，一半概率落在均值左边更早的位置。' }],
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
      { label: 'Beta 非正', type: 'error', values: { beta: '0' }, expect: '#NUM!', note: 'beta 是尺度参数，必须大于 0，不能填 0 或负数。' },
      { label: '累积参数非布尔', type: 'error', values: { cum: 'X' }, expect: '#VALUE!', note: '第 4 参数只能填 TRUE（累积）或 FALSE（密度），填文字会报 #VALUE!。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default gammadistEntry;
