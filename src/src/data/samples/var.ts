import type { FunctionEntry } from '@/types';

/** VAR · 方差（compatibility 类 B9 批次） */

const varEntry: FunctionEntry = {
  id: 'var',
  enName: 'VAR',
  zhName: '方差',
  zhCommon: ['VAR', '方差'],
  alias: ['样本方差'],
  category: 'compatibility',
  abbr: 'fc',
  pinyin: 'fangcha',
  keywords: ['var', '方差', '离散'],
  difficulty: 2,
  usageLevel: 6,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算样本方差',
  summary: 'VAR 返回样本方差（除以 n-1），是标准差的平方。新版请用 VAR.S。',
  syntax: { patternCn: '=VAR(数值1, [数值2]…)', patternEn: '=VAR(number1, [number2]…)', args: [{ key: 'n', zh: '数值', en: 'number1,[number2]…', required: true, desc: '样本数值区域' }] },
  returnValue: '样本方差',
  examples: [
    {
      title: '示例：样本方差',
      scene: '数据 1,2,3,4,5',
      dataAnchor: 'A1',
      dataTsv: '数值\n1\n2\n3\n4\n5',
      formula: '=VAR(A2:A6)',
      result: '约 2.5',
      explanation: '偏差平方和 10 / (5-1)=2.5。',
    },
    {
      title: '示例：方差就是「偏差平方和 ÷ (n−1)」，手算能对上',
      scene: '6 天的客服通话时长，想知道波动有多大。手算一遍才能确认 VAR 到底除以几。',
      dataAnchor: 'A1',
      dataTsv: '日期\t通话时长(分)\n周一\t2\n周二\t4\n周三\t4\n周四\t4\n周五\t5\n周六\t5',
      formula: '=VAR(B2:B7)',
      result: '1.2（同样数据按总体算 VARP 是 1）',
      explanation:
        '6 个数均值是 4，偏差平方和 4+0+0+0+1+1=6；VAR 除以 n−1=5 得 1.2，VARP 除以 n=6 得 1。看分母是 5 还是 6，就知道用的是哪个函数。',
    },
  ],
  pitfalls: [{ title: '样本 vs 总体', reason: 'VAR 除以 n-1，总体用 VARP。', fix: '总体用 VARP/VAR.P。', level: 'low' }],
  related: [{ id: 'stdev', kind: 'companion', why: 'STDEV 与本品类相关' },
    { id: 'varp', kind: 'companion', why: 'VARP 与本品类相关' },
    { id: 'average', kind: 'companion', why: 'AVERAGE 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'n', label: '数值区域', type: 'ref', default: 'A2:A6' },
    ],
    template: '=VAR({n})',
    cases: [
      { label: 'ok 样本方差', type: 'ok', values: {}, expect: '2.5', note: '除以 n-1。' },
      { label: '非法：少于2个', type: 'error', values: { n: 'A2' }, expect: '#DIV/0!', note: '样本数需 ≥2。' },
      { label: '非法：区域无效', type: 'error', values: { n: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
      { label: '非法：区域全是空白', type: 'error', values: { n: 'B2:B6' }, expect: '#DIV/0!', note: '整列空白等于 0 个数字，算不出方差。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default varEntry;
