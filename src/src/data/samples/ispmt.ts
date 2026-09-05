import type { FunctionEntry } from '@/types';

/** ISPMT · 本金利息额（financial 类 B9 批次） */

const ispmtEntry: FunctionEntry = {
  id: 'ispmt',
  enName: 'ISPMT',
  zhName: '本金利息额',
  zhCommon: ['ISPMT', '利息额'],
  alias: ['期间利息'],
  category: 'financial',
  abbr: 'bjlxe',
  pinyin: 'benjinlixie',
  keywords: ['ispmt', '利息', '本金'],
  difficulty: 3,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算某期利息（等额本金）',
  summary: 'ISPMT 返回在等额本金还款下，指定期间因剩余本金产生的利息额。',
  syntax: {
    patternCn: '=ISPMT(利率, 第几期, 总期数, 现值)',
    patternEn: '=ISPMT(rate, per, nper, pv)',
    args: [{ key: 'rate', zh: '利率', en: 'rate', required: true, desc: '每期利率' },
    { key: 'per', zh: '第几期', en: 'per', required: true, desc: '要算的期数' },
    { key: 'nper', zh: '总期数', en: 'nper', required: true, desc: '总期数' },
    { key: 'pv', zh: '现值', en: 'pv', required: true, desc: '贷款本金' }],
  },
  returnValue: '该期利息额',
  examples: [{ title: '示例：期间利息', scene: '贷款 100000、月率 0.5%、5 年', dataAnchor: 'B2', formula: '=ISPMT(0.005,1,60,100000)', result: '约 -500（首期利息）', explanation: '剩余本金×期利率。' }],
  pitfalls: [{ title: '等额本金口径', reason: '与 IPMT（等额本息）不同。', fix: '等额本金用 ISPMT。', level: 'mid' }],
  related: [{ id: 'ipmt', kind: 'companion', why: 'IPMT 与本品类相关' },
    { id: 'ppmt', kind: 'companion', why: 'PPMT 与本品类相关' },
    { id: 'pmt', kind: 'companion', why: 'PMT 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'rate', label: '利率', type: 'number', default: '0.1' },
      { key: 'per', label: '期数', type: 'number', default: '1' },
      { key: 'nper', label: '总期数', type: 'number', default: '3' },
      { key: 'pv', label: '现值', type: 'number', default: '8000000' },
    ],
    template: '=ISPMT({rate},{per},{nper},{pv})',
    cases: [
      { label: '第1期利息 -533333.333333', type: 'ok', values: {}, expect: '-533333.333333', note: '利率10%、3期、现值800万，等额本金第1期利息。' },
      { label: '利率非数字', type: 'error', values: { rate: 'abc' }, expect: '#VALUE!', note: 'rate 必须是数字。' },
      { label: '总期数为0', type: 'error', values: { nper: '0' }, expect: '#NUM!', note: 'nper 必须 > 0。' },
      { label: '期数超总期数', type: 'error', values: { per: '4' }, expect: '#NUM!', note: 'per 须在 1…nper 之间。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ispmtEntry;
