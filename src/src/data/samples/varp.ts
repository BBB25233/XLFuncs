import type { FunctionEntry } from '@/types';

/** VARP · 旧总体方差（compatibility 类 B9 批次） */

const varpEntry: FunctionEntry = {
  id: 'varp',
  enName: 'VARP',
  zhName: '旧总体方差',
  zhCommon: ['VARP', '总体方差'],
  alias: ['总体方差'],
  category: 'compatibility',
  abbr: 'jztfc',
  pinyin: 'jiuzongtifangcha',
  keywords: ['varp', '方差', '总体'],
  difficulty: 2,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算总体方差',
  summary: 'VARP 返回总体方差（除以 n），适用于完整总体。新版请用 VAR.P。',
  syntax: { patternCn: '=VARP(数值1, [数值2]…)', patternEn: '=VARP(number1, [number2]…)', args: [{ key: 'n', zh: '数值', en: 'number1,[number2]…', required: true, desc: '总体数值区域' }] },
  returnValue: '总体方差',
  examples: [{ title: '示例：总体方差', scene: '数据 1,2,3,4,5（视为总体）', dataAnchor: 'A1', dataTsv: '数值\n1\n2\n3\n4\n5', formula: '=VARP(A2:A6)', result: '2', explanation: '偏差平方和 10 / 5=2。' }],
  pitfalls: [{ title: '与 VAR 区别', reason: '分母 n 与 n-1 不同。', fix: '样本用 VAR、总体用 VARP。', level: 'low' }],
  related: [{ id: 'var', kind: 'companion', why: 'VAR 与本品类相关' },
    { id: 'stdevp', kind: 'companion', why: 'STDEVP 与本品类相关' },
    { id: 'average', kind: 'companion', why: 'AVERAGE 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'n', label: '数值区域', type: 'ref', default: 'A2:A6' },
    ],
    template: '=VARP({n})',
    cases: [
      { label: 'ok 总体方差', type: 'ok', values: {}, expect: '2', note: '除以 n。' },
      { label: '非法：无数字', type: 'error', values: { n: 'B2' }, expect: '#DIV/0!', note: '区域需至少 1 个数字。' },
      { label: '非法：区域无效', type: 'error', values: { n: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default varpEntry;
