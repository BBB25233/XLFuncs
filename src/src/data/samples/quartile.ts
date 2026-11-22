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
  examples: [
    {
      title: '示例：中位数（第 2 四分位）',
      scene: '数据 1..5、quart=2',
      dataAnchor: 'A1',
      dataTsv: '数值\n1\n2\n3\n4\n5',
      formula: '=QUARTILE(A2:A6,2)',
      result: '3',
      explanation: 'q=2 即中位数。',
    },
    {
      title: '示例：q 换成 1 和 3，看下四分位 / 上四分位',
      scene: '8 个工单的处理时长，想知道「偏快的四分之一」和「偏慢的四分之一」分别卡在多少分钟。',
      dataAnchor: 'A1',
      dataTsv: '工单\t耗时(分)\n1\t12\n2\t15\n3\t18\n4\t20\n5\t22\n6\t25\n7\t28\n8\t30',
      formula: '=QUARTILE(B2:B9,1)',
      result: '17.25（q 换成 3 得 25.75；q=0 是最小值 12，q=4 是最大值 30）',
      explanation:
        'q=1 是四分之一位置的插值：位置 0.25×(8−1)=1.75，落在 15 和 18 之间，15+0.75×3=17.25。q 只能是 0~4 的整数，写 1.5 会报 #NUM!。',
    },
  ],
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
      { label: '非法：q 填文字', type: 'error', values: { q: '中位' }, expect: '#VALUE!', note: 'q 要填 0~4 的数字，写文字会报 #VALUE!。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default quartileEntry;
