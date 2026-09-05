import type { FunctionEntry } from '@/types';

/** COVAR · 协方差（compatibility 类 B9 批次） */

const covarEntry: FunctionEntry = {
  id: 'covar',
  enName: 'COVAR',
  zhName: '协方差',
  zhCommon: ['COVAR', '协方差'],
  alias: ['样本协方差'],
  category: 'compatibility',
  abbr: 'xfc',
  pinyin: 'xiefangcha',
  keywords: ['covar', '协方差', '相关'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算两变量的协方差',
  summary: 'COVAR 返回两数组的样本协方差，衡量它们同向变动的程度，正值同向、负值反向。',
  syntax: { patternCn: '=COVAR(数组1, 数组2)', patternEn: '=COVAR(array1, array2)', args: [{ key: 'a', zh: '数组1', en: 'array1', required: true, desc: '第一组数值' },
    { key: 'b', zh: '数组2', en: 'array2', required: true, desc: '第二组数值（同长度）' }] },
  returnValue: '协方差',
  examples: [{ title: '示例：协方差', scene: 'X=1..5、Y=2..6', dataAnchor: 'A1', dataTsv: '数组1\t数组2\n1\t2\n2\t3\n3\t4\n4\t5\n5\t6', formula: '=COVAR(A2:A6,B2:B6)', result: '2.5', explanation: '偏差乘积和/(n-1)。' }],
  pitfalls: [{ title: '用总体还是样本', reason: 'COVAR 是样本协方差（除以 n-1）。', fix: '总体协方差用 COVARIANCE.P（新版）。', level: 'low' }],
  related: [{ id: 'var', kind: 'companion', why: 'VAR 与本品类相关' },
    { id: 'stdev', kind: 'companion', why: 'STDEV 与本品类相关' },
    { id: 'correl', kind: 'companion', why: 'CORREL 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'a', label: '数组1', type: 'ref', default: 'A2:A6' },
      { key: 'b', label: '数组2', type: 'ref', default: 'B2:B6' },
    ],
    template: '=COVAR({a},{b})',
    cases: [
      { label: '样本协方差', type: 'ok', values: {}, expect: '2.5', note: '同向变动程度，除以 n-1。' },
      { label: '区域无效', type: 'error', values: { a: 'ZZZ' }, expect: '#REF!', note: '区域要写成「左上角:右下角」。' },
      { label: '长度不一致', type: 'error', values: { b: 'B2:B3' }, expect: '#N/A', note: '两个数组单元格个数必须相同。' },
      { label: '数据少于 2 个', type: 'error', values: { a: 'A2:A2', b: 'B2:B2' }, expect: '#DIV/0!', note: '协方差需要 n>=2。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default covarEntry;
