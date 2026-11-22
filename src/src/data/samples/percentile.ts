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
  examples: [
    {
      title: '示例：中位数（第 50 百分位）',
      scene: '数据 1..5、k=0.5',
      dataAnchor: 'A1',
      dataTsv: '数值\n1\n2\n3\n4\n5',
      formula: '=PERCENTILE(A2:A6,0.5)',
      result: '3',
      explanation: 'k=0.5 即中位数。',
    },
    {
      title: '示例：把 k 换成 0.9，算「前 10% 的门槛分」',
      scene: '6 个人的绩效分出来了，要定一条「前 10% 才够 A」的分界线，也就是第 90 百分位的分数。',
      dataAnchor: 'A1',
      dataTsv: '姓名\t绩效分\n张三\t50\n李四\t60\n王五\t70\n赵六\t80\n钱七\t90\n孙八\t100',
      formula: '=PERCENTILE(B2:B7,0.9)',
      result: '95（把 k 改成 0.75 就是第 75 百分位，得 87.5）',
      explanation:
        'k=0.9 表示 90% 的数据在它之下。位置 0.9×(6−1)=4.5，落在 90 和 100 中间，插值得 95。k 只能取 0~1，填 90 会报 #NUM!。',
    },
  ],
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
      { label: '非法：k 填文字', type: 'error', values: { k: '一半' }, expect: '#VALUE!', note: 'k 要填 0 到 1 的数字，写「一半」这种文字会报 #VALUE!。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default percentileEntry;
