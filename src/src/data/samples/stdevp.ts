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
  examples: [
    {
      title: '示例：总体标准差',
      scene: '数据 1,2,3,4,5（视为总体）',
      dataAnchor: 'A1',
      dataTsv: '数值\n1\n2\n3\n4\n5',
      formula: '=STDEVP(A2:A6)',
      result: '约 1.414',
      explanation: '总体方差 2，开方为 √2。',
    },
    {
      title: '示例：就这 5 个人，按总体算而不是按样本算',
      scene: '只关心这 5 个人、不是拿他们推断全校，这时候该用 STDEVP；错用 STDEV 会把离散程度算大一点。',
      dataAnchor: 'A1',
      dataTsv: '姓名\t分数\n张三\t60\n李四\t70\n王五\t70\n赵六\t80\n钱七\t90',
      formula: '=STDEVP(B2:B6)',
      result: '约 10.198（同样数据换成 STDEV 是 11.402）',
      explanation:
        '均值 74、偏差平方和 520：除以 n=5 得方差 104，开方 10.198；STDEV 除以 4 得 130，开方 11.402。总体方差永远比样本方差小。',
    },
  ],
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
      { label: '非法：只框到表头', type: 'error', values: { n: 'A1:A1' }, expect: '#DIV/0!', note: '只框了表头那一格，表头是文字不算数字，等于 0 个数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default stdevpEntry;
