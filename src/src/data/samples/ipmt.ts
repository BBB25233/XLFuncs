import type { FunctionEntry } from '@/types';

/** IPMT · 利息还款额（financial 类 B9 批次） */

const ipmtEntry: FunctionEntry = {
  id: 'ipmt',
  enName: 'IPMT',
  zhName: '利息还款额',
  zhCommon: ['IPMT', '利息', '分期'],
  alias: ['利息部分'],
  category: 'financial',
  abbr: 'lxhke',
  pinyin: 'lixihaikuane',
  keywords: ['ipmt', '利息', '还款', '贷款'],
  difficulty: 3,
  usageLevel: 5,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算某期还了多少利息',
  summary: 'IPMT 返回等额分期里指定那一期偿还的利息部分，+PPMT = 当期总还款额。',
  syntax: {
    patternCn: '=IPMT(利率, 第几期, 总期数, 现值, [终值], [类型])',
    patternEn: '=IPMT(rate, per, nper, pv, [fv], [type])',
    args: [{ key: 'rate', zh: '利率', en: 'rate', required: true, desc: '每期利率' },
    { key: 'per', zh: '第几期', en: 'per', required: true, desc: '要查的期数' },
    { key: 'nper', zh: '总期数', en: 'nper', required: true, desc: '还款总期数' },
    { key: 'pv', zh: '现值', en: 'pv', required: true, desc: '贷款本金' },
    { key: 'fv', zh: '终值', en: 'fv', required: false, desc: '期末余款，默认 0' },
    { key: 'type', zh: '类型', en: 'type', required: false, desc: '0 期末/1 期初' }],
  },
  returnValue: '该期利息金额（负数表示支出）',
  examples: [{ title: '示例：首期利息', scene: '同 PPMT 示例', dataAnchor: 'B2', formula: '=IPMT(5%/12,1,60,100000)', result: '约 -416.7（首月利息）', explanation: '首期本金未还，利息最高。' }],
  pitfalls: [{ title: '与 PPMT 单位要一致', reason: '利率/期数单位不对，利息也会错。', fix: '月供用 年利率/12。', level: 'high' }],
  related: [{ id: 'ppmt', kind: 'companion', why: 'PPMT 与本品类相关' },
    { id: 'pmt', kind: 'companion', why: 'PMT 与本品类相关' },
    { id: 'pv', kind: 'companion', why: 'PV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'rate', label: '利率', type: 'number', default: '0.05' },
      { key: 'per', label: '期数', type: 'number', default: '1' },
      { key: 'nper', label: '总期数', type: 'number', default: '10' },
      { key: 'pv', label: '现值', type: 'number', default: '10000' },
      { key: 'fv', label: '终值', type: 'number', default: '0' },
      { key: 'type', label: '类型', type: 'number', default: '0' },
    ],
    template: '=IPMT({rate},{per},{nper},{pv},{fv},{type})',
    cases: [
      { label: '第1期利息 -500', type: 'ok', values: {}, expect: '-500', note: '年利率5%、10期、贷款1万，第1期利息。' },
      { label: '利率非数字', type: 'error', values: { rate: 'abc' }, expect: '#VALUE!', note: 'rate 必须是数字。' },
      { label: '总期数为0', type: 'error', values: { nper: '0' }, expect: '#NUM!', note: 'nper 必须 > 0。' },
      { label: '期数超总期数', type: 'error', values: { per: '11' }, expect: '#NUM!', note: 'per 须在 1…nper 之间。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ipmtEntry;
