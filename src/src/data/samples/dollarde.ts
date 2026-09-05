import type { FunctionEntry } from '@/types';

/** DOLLARDE · 美元小数转分数（financial 类 B9 批次） */

const dollardeEntry: FunctionEntry = {
  id: 'dollarde',
  enName: 'DOLLARDE',
  zhName: '美元小数转分数',
  zhCommon: ['DOLLARDE', '小数转分数'],
  alias: ['美元小数化'],
  category: 'financial',
  abbr: 'myxszfs',
  pinyin: 'meiyuanxiaoshuzhuanfenshu',
  keywords: ['dollarde', '小数', '分数', '美元'],
  difficulty: 3,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把小数计价转成分数价',
  summary: 'DOLLARDE 把按小数表示的价格（如 1.02 表示 1 元 2 分）按指定位数转成分数形式。',
  syntax: {
    patternCn: '=DOLLARDE(小数价, 分数位数)',
    patternEn: '=DOLLARDE(fractional_dollar, fraction)',
    args: [{ key: 'frac', zh: '小数价', en: 'fractional_dollar', required: true, desc: '按小数表示的金额' },
    { key: 'fraction', zh: '分数位数', en: 'fraction', required: true, desc: '分数分母位数，如 16 表示 1/16' }],
  },
  returnValue: '分数形式的金额',
  examples: [{ title: '示例：转分数', scene: '1.02 按 16 分位', dataAnchor: 'B2', formula: '=DOLLARDE(1.02,16)', result: '约 1.125', explanation: '0.02×16/100 折算。' }],
  pitfalls: [{ title: '分数位数含义', reason: '不是小数位数，是分母指数。', fix: 'fraction 填 16/32 等。', level: 'mid' }],
  related: [{ id: 'dollarfr', kind: 'companion', why: 'DOLLARFR 与本品类相关' },
    { id: 'round', kind: 'companion', why: 'ROUND 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'frac', label: '小数价', type: 'number', default: '1.02' },
      { key: 'fraction', label: '分数分母', type: 'number', default: '16' },
    ],
    template: '=DOLLARDE({frac},{fraction})',
    cases: [
      { label: '1.02 → 1.125', type: 'ok', values: {}, expect: '1.125', note: '以 1/16 为单位的 1.02 转十进制 1.125。' },
      { label: '小数价非数字', type: 'error', values: { frac: 'abc' }, expect: '#VALUE!', note: 'frac 必须是数字。' },
      { label: '分母为0', type: 'error', values: { fraction: '0' }, expect: '#DIV/0!', note: 'fraction 不能为 0。' },
      { label: '分母非数字', type: 'error', values: { fraction: 'abc' }, expect: '#VALUE!', note: 'fraction 必须是数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default dollardeEntry;
