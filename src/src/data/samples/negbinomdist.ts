import type { FunctionEntry } from '@/types';

/** NEGBINOMDIST · 负二项式分布（compatibility 类 B9 批次） */

const negbinomdistEntry: FunctionEntry = {
  id: 'negbinomdist',
  enName: 'NEGBINOMDIST',
  zhName: '负二项式分布',
  zhCommon: ['NEGBINOMDIST', '负二项'],
  alias: ['负二项'],
  category: 'compatibility',
  abbr: 'fexsfb',
  pinyin: 'fuerxiangshifenbu',
  keywords: ['negbinomdist', '负二项', '分布'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算负二项分布的概率',
  summary: 'NEGBINOMDIST 返回在达到指定成功数前失败 r 次的概率，用于「先成功后停止」场景。',
  syntax: { patternCn: '=NEGBINOMDIST(失败数, 成功数, 成功率)', patternEn: '=NEGBINOMDIST(number_f, number_s, probability_s)', args: [{ key: 'f', zh: '失败数', en: 'number_f', required: true, desc: '失败次数' },
    { key: 's', zh: '成功数', en: 'number_s', required: true, desc: '目标成功次数' },
    { key: 'p', zh: '成功率', en: 'probability_s', required: true, desc: '单次成功概率' }] },
  returnValue: '概率值',
  examples: [{ title: '示例：负二项概率', scene: '失败 10、成功 5、p=0.25', dataAnchor: 'B2', formula: '=NEGBINOMDIST(10,5,0.25)', result: '约 0.055', explanation: 'C(14,4)×0.25⁵×0.75¹⁰。' }],
  pitfalls: [{ title: '与 BINOMDIST 区别', reason: '负二项固定成功数、变失败数。', fix: '按停止条件选函数。', level: 'mid' }],
  related: [{ id: 'binomdist', kind: 'companion', why: 'BINOMDIST 与本品类相关' },
    { id: 'critbinom', kind: 'companion', why: 'CRITBINOM 与本品类相关' },
    { id: 'poisson', kind: 'companion', why: 'POISSON 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'f', label: '失败次数', type: 'number', default: '3' },
      { key: 's', label: '成功次数', type: 'number', default: '2' },
      { key: 'p', label: '成功概率', type: 'number', default: '0.4' },
    ],
    template: '=NEGBINOMDIST({f},{s},{p})',
    cases: [
      { label: 'ok 概率', type: 'ok', values: {}, expect: '0.13824', note: 'C(4,1)×0.4²×0.6³。' },
      { label: '非法：失败次数<0', type: 'error', values: { f: '-1' }, expect: '#NUM!', note: 'f 必须 ≥0 整数。' },
      { label: '非法：概率越界', type: 'error', values: { p: '2' }, expect: '#NUM!', note: 'p 必须 0~1。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default negbinomdistEntry;
