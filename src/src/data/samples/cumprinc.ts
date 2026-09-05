import type { FunctionEntry } from '@/types';

/** CUMPRINC · 累计本金（financial 类 B9 批次） */

const cumprincEntry: FunctionEntry = {
  id: 'cumprinc',
  enName: 'CUMPRINC',
  zhName: '累计本金',
  zhCommon: ['CUMPRINC', '累计本金'],
  alias: ['本金合计'],
  category: 'financial',
  abbr: 'ljbj',
  pinyin: 'leijibenjin',
  keywords: ['cumprinc', '累计本金', '贷款'],
  difficulty: 4,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算一段期数内的总本金',
  summary: 'CUMPRINC 返回从起期到止期累计偿还的本金总额，和 CUMIPMT 互补。',
  syntax: {
    patternCn: '=CUMPRINC(利率, 总期数, 现值, 起期, 止期, 类型)',
    patternEn: '=CUMPRINC(rate, nper, pv, start, end, type)',
    args: [{ key: 'rate', zh: '利率', en: 'rate', required: true, desc: '每期利率' },
    { key: 'nper', zh: '总期数', en: 'nper', required: true, desc: '总期数' },
    { key: 'pv', zh: '现值', en: 'pv', required: true, desc: '贷款本金' },
    { key: 'start', zh: '起期', en: 'start_period', required: true, desc: '累计起始期' },
    { key: 'end', zh: '止期', en: 'end_period', required: true, desc: '累计结束期' },
    { key: 'type', zh: '类型', en: 'type', required: true, desc: '0 期末/1 期初' }],
  },
  returnValue: '累计本金（负数）',
  examples: [{ title: '示例：首年本金', scene: '同 CUMIPMT 示例', dataAnchor: 'B2', formula: '=CUMPRINC(5%/12,60,100000,1,12,0)', result: '约 -18313.0（首年本金合计）', explanation: '本金+利息 ≈ 当年总还款。' }],
  pitfalls: [{ title: '与 CUMIPMT 参数一致', reason: '两者参数相同，填错会不一致。', fix: '复制同一次参数。', level: 'mid' }],
  related: [{ id: 'cumipmt', kind: 'companion', why: 'CUMIPMT 与本品类相关' },
    { id: 'ppmt', kind: 'companion', why: 'PPMT 与本品类相关' },
    { id: 'pmt', kind: 'companion', why: 'PMT 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'rate', label: '利率', type: 'number', default: '0.0075' },
      { key: 'nper', label: '期数', type: 'number', default: '360' },
      { key: 'pv', label: '现值', type: 'number', default: '100000' },
      { key: 'start', label: '起始期', type: 'number', default: '13' },
      { key: 'end', label: '结束期', type: 'number', default: '24' },
      { key: 'type', label: '类型', type: 'number', default: '0' },
    ],
    template: '=CUMPRINC({rate},{nper},{pv},{start},{end},{type})',
    cases: [
      { label: '第13–24期本金 -747.285699', type: 'ok', values: {}, expect: '-747.285699', note: '同期累计偿还本金。' },
      { label: '利率非数字', type: 'error', values: { rate: 'abc' }, expect: '#VALUE!', note: 'rate 必须是数字。' },
      { label: '期数为0', type: 'error', values: { nper: '0' }, expect: '#NUM!', note: 'nper 必须 > 0。' },
      { label: '结束期超出期数', type: 'error', values: { end: '400' }, expect: '#NUM!', note: '需满足 end ≤ nper。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default cumprincEntry;
