import type { FunctionEntry } from '@/types';

/** STDEVP · 总体标准偏差（compatibility 类 B9 批次） */

const stdevpEntry: FunctionEntry = {
  id: 'stdevp',
  enName: 'STDEVP',
  zhName: '总体标准偏差',
  zhCommon: ['STDEVP', '总体标准差'],
  alias: ['总体标准差'],
  category: 'compatibility',
  abbr: 'ztbzpc',
  pinyin: 'zongtibiaozhunpiancha',
  keywords: ['stdevp', '标准差', '总体'],
  difficulty: 2,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算总体标准差',
  summary: 'STDEVP 返回总体标准差（除以 n），适用于完整总体。新版请用 STDEV.P。',
  syntax: { patternCn: '=STDEVP(数值1, [数值2]…)', patternEn: '=STDEVP(number1, [number2]…)', args: [{ key: 'n', zh: '数值', en: 'number1,[number2]…', required: true, desc: '总体数值区域' }] },
  returnValue: '总体标准差',
  examples: [{ title: '示例：总体标准差', scene: '数据 1,2,3,4,5（视为总体）', dataAnchor: 'A1', dataTsv: '数值\n1\n2\n3\n4\n5', formula: '=STDEVP(A2:A6)', result: '约 1.414', explanation: '总体方差 2，开方为 √2。' }],
  pitfalls: [{ title: '与 STDEV 区别', reason: '分母 n 与 n-1 不同。', fix: '样本用 STDEV、总体用 STDEVP。', level: 'low' }],
  related: [{ id: 'stdev', kind: 'companion', why: 'STDEV 与本品类相关' },
    { id: 'varp', kind: 'companion', why: 'VARP 与本品类相关' },
    { id: 'average', kind: 'companion', why: 'AVERAGE 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'n', label: '数值区域', type: 'ref', default: 'A2:A6' },
    ],
    template: '=STDEVP({n})',
    cases: [
      { label: 'ok 总体标准差', type: 'ok', values: {}, expect: '1.414214', note: '除以 n。' },
      { label: '非法：无数字', type: 'error', values: { n: 'B2' }, expect: '#DIV/0!', note: '区域需至少 1 个数字。' },
      { label: '非法：区域无效', type: 'error', values: { n: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default stdevpEntry;
