import type { FunctionEntry } from '@/types';

/** DOLLARFR · 美元分数转小数（financial 类 B9 批次） */

const dollarfrEntry: FunctionEntry = {
  id: 'dollarfr',
  enName: 'DOLLARFR',
  zhName: '美元分数转小数',
  zhCommon: ['DOLLARFR', '分数转小数'],
  alias: ['美元小数化'],
  category: 'financial',
  abbr: 'myfszxs',
  pinyin: 'meiyuanfenshuzhuanxiaoshu',
  keywords: ['dollarfr', '分数', '小数', '美元'],
  difficulty: 3,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把分数计价转成小数价',
  summary: 'DOLLARFR 是 DOLLARDE 的逆运算：把按分数表示的价格还原成小数形式。',
  syntax: {
    patternCn: '=DOLLARFR(分数价, 分数位数)',
    patternEn: '=DOLLARFR(decimal_dollar, fraction)',
    args: [{ key: 'dec', zh: '分数价', en: 'decimal_dollar', required: true, desc: '按分数表示的金额' },
    { key: 'fraction', zh: '分数位数', en: 'fraction', required: true, desc: '分数分母位数' }],
  },
  returnValue: '小数形式的金额',
  examples: [{ title: '示例：转小数', scene: '1.125 按 16 分位', dataAnchor: 'B2', formula: '=DOLLARFR(1.125,16)', result: '约 1.02', explanation: 'DOLLARDE 的逆运算。' }],
  pitfalls: [{ title: '与 DOLLARDE 配对', reason: '两函数互逆易混。', fix: '分数→小数用 DOLLARFR。', level: 'low' }],
  related: [{ id: 'dollarde', kind: 'companion', why: 'DOLLARDE 与本品类相关' },
    { id: 'round', kind: 'companion', why: 'ROUND 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'dec', label: '分数价', type: 'number', default: '1.125' },
      { key: 'fraction', label: '分数分母', type: 'number', default: '16' },
    ],
    template: '=DOLLARFR({dec},{fraction})',
    cases: [
      { label: '1.125 → 1.02', type: 'ok', values: {}, expect: '1.02', note: '十进制 1.125 转以 1/16 为单位 1.02。' },
      { label: '分数价非数字', type: 'error', values: { dec: 'abc' }, expect: '#VALUE!', note: 'dec 必须是数字。' },
      { label: '分母为0', type: 'error', values: { fraction: '0' }, expect: '#DIV/0!', note: 'fraction 不能为 0。' },
      { label: '分母非数字', type: 'error', values: { fraction: 'abc' }, expect: '#VALUE!', note: 'fraction 必须是数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default dollarfrEntry;
