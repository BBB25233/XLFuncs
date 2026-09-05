import type { FunctionEntry } from '@/types';

/** QUARTILE · 四分位值（compatibility 类 B9 批次） */

const quartileEntry: FunctionEntry = {
  id: 'quartile',
  enName: 'QUARTILE',
  zhName: '四分位值',
  zhCommon: ['QUARTILE', '四分位'],
  alias: ['四分位数'],
  category: 'compatibility',
  abbr: 'sfwz',
  pinyin: 'sifenweizhi',
  keywords: ['quartile', '四分位', '分位'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算四分位点的值',
  summary: 'QUARTILE 返回数组的第 quart 个四分位值（0=最小、1=下四分位、2=中位、3=上四分位、4=最大）。新版请用 QUARTILE.INC。',
  syntax: { patternCn: '=QUARTILE(数组, 四分位)', patternEn: '=QUARTILE(array, quart)', args: [{ key: 'a', zh: '数组', en: 'array', required: true, desc: '数值区域' },
    { key: 'q', zh: '四分位', en: 'quart', required: true, desc: '0~4 的整数' }] },
  returnValue: '四分位值',
  examples: [{ title: '示例：中位数（第 2 四分位）', scene: '数据 1..5、quart=2', dataAnchor: 'A1', dataTsv: '数值\n1\n2\n3\n4\n5', formula: '=QUARTILE(A2:A6,2)', result: '3', explanation: 'q=2 即中位数。' }],
  pitfalls: [{ title: 'quart 限 0~4', reason: '超出会 #NUM!。', fix: 'quart 取 0~4 整数。', level: 'low' }],
  related: [{ id: 'percentile', kind: 'companion', why: 'PERCENTILE 与本品类相关' },
    { id: 'rank', kind: 'companion', why: 'RANK 与本品类相关' },
    { id: 'percentrank', kind: 'companion', why: 'PERCENTRANK 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'a', label: '数值区域', type: 'ref', default: 'A2:A6' },
      { key: 'q', label: '四分位 q', type: 'number', default: '2' },
    ],
    template: '=QUARTILE({a},{q})',
    cases: [
      { label: 'ok 中位数', type: 'ok', values: {}, expect: '3', note: 'q=2 即中位数。' },
      { label: '非法：q>4', type: 'error', values: { q: '5' }, expect: '#NUM!', note: 'q 必须 0~4 整数。' },
      { label: '非法：区域无效', type: 'error', values: { a: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default quartileEntry;
