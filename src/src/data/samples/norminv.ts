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
  examples: [
    { title: '示例：正态分位数', scene: '概率 0.8413、μ=0、σ=1', dataAnchor: 'B2', formula: '=NORMINV(0.8413,0,1)', result: '约 1.0', explanation: '与 NORMDIST(1,0,1,TRUE) 互逆。' },
    {
      title: '示例 2：用分位数划三条分数线（μ=500、σ=100）',
      scene: '考试成绩近似正态，想按「前 10%」「前 5%」「前 1%」划三条线，这就是由概率反推分数。',
      dataTsv: '档位\t累积概率\n前 10%\t0.9\n前 5%\t0.95\n前 1%\t0.99',
      dataAnchor: 'A1',
      formula: '=NORMINV(B2,500,100)',
      result: '前 10% → 628.155157，前 5% → 664.485363，前 1% → 732.634787',
      explanation: '「前 10%」对应累积概率 0.9，不是 10，所以第 1 参数填 0.9。概率必须严格落在 0 和 1 之间，填 90 或 1 都会 #NUM!，标准差还必须大于 0。',
    },
  ],
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
      { label: '❌ 概率写成文本', type: 'error', values: { p: '九成' }, expect: '#VALUE!', note: '意思：参数不是数字。概率写成 0.9 这样的小数，别写成「九成」。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default norminvEntry;
