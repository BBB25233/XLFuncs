import type { FunctionEntry } from '@/types';

/** STDEV · 标准偏差（compatibility 类 B9 批次） */

const stdevEntry: FunctionEntry = {
  id: 'stdev',
  enName: 'STDEV',
  zhName: '标准偏差',
  zhCommon: ['STDEV', '标准差'],
  alias: ['样本标准差'],
  category: 'compatibility',
  abbr: 'bzpc',
  pinyin: 'biaozhunpiancha',
  keywords: ['stdev', '标准差', '离散'],
  difficulty: 2,
  usageLevel: 6,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算样本标准差',
  summary: 'STDEV 返回样本标准差（除以 n-1），衡量数据离散程度。新版请用 STDEV.S。',
  syntax: { patternCn: '=STDEV(数值1, [数值2]…)', patternEn: '=STDEV(number1, [number2]…)', args: [{ key: 'n', zh: '数值', en: 'number1,[number2]…', required: true, desc: '样本数值区域' }] },
  returnValue: '样本标准差',
  examples: [{ title: '示例：样本标准差', scene: '数据 1,2,3,4,5', dataAnchor: 'A1', dataTsv: '数值\n1\n2\n3\n4\n5', formula: '=STDEV(A2:A6)', result: '约 1.581', explanation: '样本方差 2.5，开方。' }],
  pitfalls: [{ title: '样本 vs 总体', reason: 'STDEV 除以 n-1，总体用 STDEVP。', fix: '总体用 STDEVP/STDEV.P。', level: 'low' }],
  related: [{ id: 'var', kind: 'companion', why: 'VAR 与本品类相关' },
    { id: 'stdevp', kind: 'companion', why: 'STDEVP 与本品类相关' },
    { id: 'average', kind: 'companion', why: 'AVERAGE 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'n', label: '数值区域', type: 'ref', default: 'A2:A6' },
    ],
    template: '=STDEV({n})',
    cases: [
      { label: 'ok 样本标准差', type: 'ok', values: {}, expect: '1.581139', note: '除以 n-1。' },
      { label: '非法：少于2个', type: 'error', values: { n: 'A2' }, expect: '#DIV/0!', note: '样本数需 ≥2。' },
      { label: '非法：区域无效', type: 'error', values: { n: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default stdevEntry;
