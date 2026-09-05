import type { FunctionEntry } from '@/types';

/** PERCENTRANK · 百分比排位（compatibility 类 B9 批次） */

const percentrankEntry: FunctionEntry = {
  id: 'percentrank',
  enName: 'PERCENTRANK',
  zhName: '百分比排位',
  zhCommon: ['PERCENTRANK', '百分比排位'],
  alias: ['百分排位'],
  category: 'compatibility',
  abbr: 'bfbpw',
  pinyin: 'baifenbipaiwei',
  keywords: ['percentrank', '排位', '百分'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算数值在数组中的百分比排位',
  summary: 'PERCENTRANK 返回某值在数组里的相对排位（0~1），即小于它的比例。新版请用 PERCENTRANK.INC。',
  syntax: { patternCn: '=PERCENTRANK(数组, x, [有效数字])', patternEn: '=PERCENTRANK(array, x, [significance])', args: [{ key: 'a', zh: '数组', en: 'array', required: true, desc: '数值区域' },
    { key: 'x', zh: 'x', en: 'x', required: true, desc: '要查排位的值' },
    { key: 'sig', zh: '有效数字', en: 'significance', required: false, desc: '结果保留位数，默认 3' }] },
  returnValue: '百分比排位',
  examples: [{ title: '示例：百分排位', scene: '数据 1..5、查 3', dataAnchor: 'A1', dataTsv: '数值\n1\n2\n3\n4\n5', formula: '=PERCENTRANK(A2:A6,3)', result: '约 0.625', explanation: '小于 3 的占 2 个、等于 1 个，得 (2+0.5)/4=0.625。' }],
  pitfalls: [{ title: 'x 不在数组仍插值', reason: 'x 不在数组中会按位置估算。', fix: '理解其为相对位置。', level: 'low' }],
  related: [{ id: 'percentile', kind: 'companion', why: 'PERCENTILE 与本品类相关' },
    { id: 'rank', kind: 'companion', why: 'RANK 与本品类相关' },
    { id: 'quartile', kind: 'companion', why: 'QUARTILE 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'a', label: '数值区域', type: 'ref', default: 'A2:A6' },
      { key: 'x', label: '要查的值', type: 'number', default: '3' },
      { key: 'sig', label: '保留位数', type: 'number', default: '3' },
    ],
    template: '=PERCENTRANK({a},{x},{sig})',
    cases: [
      { label: 'ok 排名', type: 'ok', values: { x: '3' }, expect: '0.625', note: '3 在数据中排 0.625。' },
      { label: '非法：值不在区域', type: 'error', values: { x: '99' }, expect: '#N/A', note: '要查的值不在区域里。' },
      { label: '非法：区域无效', type: 'error', values: { a: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default percentrankEntry;
