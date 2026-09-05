import type { FunctionEntry } from '@/types';

/** PERCENTILE · 百分位值（compatibility 类 B9 批次） */

const percentileEntry: FunctionEntry = {
  id: 'percentile',
  enName: 'PERCENTILE',
  zhName: '百分位值',
  zhCommon: ['PERCENTILE', '百分位'],
  alias: ['百分位数'],
  category: 'compatibility',
  abbr: 'bfwz',
  pinyin: 'baifenweizhi',
  keywords: ['percentile', '百分位', '分位'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算指定百分位的值',
  summary: 'PERCENTILE 返回数组中第 k 百分位对应的值（线性插值）。新版请用 PERCENTILE.INC。',
  syntax: { patternCn: '=PERCENTILE(数组, k)', patternEn: '=PERCENTILE(array, k)', args: [{ key: 'a', zh: '数组', en: 'array', required: true, desc: '数值区域' },
    { key: 'k', zh: 'k', en: 'k', required: true, desc: '百分位 0~1' }] },
  returnValue: '百分位值',
  examples: [{ title: '示例：中位数（第 50 百分位）', scene: '数据 1..5、k=0.5', dataAnchor: 'A1', dataTsv: '数值\n1\n2\n3\n4\n5', formula: '=PERCENTILE(A2:A6,0.5)', result: '3', explanation: 'k=0.5 即中位数。' }],
  pitfalls: [{ title: 'k 越界报错', reason: 'k 不在 0~1 会 #NUM!。', fix: 'k 取 0~1。', level: 'low' }],
  related: [{ id: 'quartile', kind: 'companion', why: 'QUARTILE 与本品类相关' },
    { id: 'percentrank', kind: 'companion', why: 'PERCENTRANK 与本品类相关' },
    { id: 'rank', kind: 'companion', why: 'RANK 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'a', label: '数值区域', type: 'ref', default: 'A2:A6' },
      { key: 'k', label: '百分比 k', type: 'number', default: '0.5' },
    ],
    template: '=PERCENTILE({a},{k})',
    cases: [
      { label: 'ok 中位数', type: 'ok', values: {}, expect: '3', note: 'k=0.5 即中位数。' },
      { label: '非法：k>1', type: 'error', values: { k: '2' }, expect: '#NUM!', note: 'k 必须 0~1。' },
      { label: '非法：区域无效', type: 'error', values: { a: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default percentileEntry;
