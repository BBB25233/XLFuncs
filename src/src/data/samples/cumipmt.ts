import type { FunctionEntry } from '@/types';

/** CUMIPMT · 累计利息（financial 类 B9 批次） */

const cumipmtEntry: FunctionEntry = {
  id: 'cumipmt',
  enName: 'CUMIPMT',
  zhName: '累计利息',
  zhCommon: ['CUMIPMT', '累计利息'],
  alias: ['利息合计'],
  category: 'financial',
  abbr: 'ljlx',
  pinyin: 'leijilixi',
  keywords: ['cumipmt', '累计利息', '贷款'],
  difficulty: 4,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算一段期数内的总利息',
  summary: 'CUMIPMT 返回从起始期到结束期之间累计支付的利息总额，常用于算一年还了多少利息。',
  syntax: {
    patternCn: '=CUMIPMT(利率, 总期数, 现值, 起期, 止期, 类型)',
    patternEn: '=CUMIPMT(rate, nper, pv, start, end, type)',
    args: [{ key: 'rate', zh: '利率', en: 'rate', required: true, desc: '每期利率' },
    { key: 'nper', zh: '总期数', en: 'nper', required: true, desc: '总期数' },
    { key: 'pv', zh: '现值', en: 'pv', required: true, desc: '贷款本金' },
    { key: 'start', zh: '起期', en: 'start_period', required: true, desc: '累计起始期' },
    { key: 'end', zh: '止期', en: 'end_period', required: true, desc: '累计结束期' },
    { key: 'type', zh: '类型', en: 'type', required: true, desc: '0 期末/1 期初' }],
  },
  returnValue: '累计利息（负数）',
  examples: [{ title: '示例：首年利息', scene: '贷款 10 万、月率 5%/12、5 年', dataAnchor: 'B2', formula: '=CUMIPMT(5%/12,60,100000,1,12,0)', result: '约 -4687.0（首年利息合计）', explanation: '把第 1–12 期利息加总。' }],
  pitfalls: [{ title: 'type 必填且单位一致', reason: '漏填 type 或利率非月率都会报错/错值。', fix: '月率配 月期数，type 写 0 或 1。', level: 'high' }],
  related: [{ id: 'cumprinc', kind: 'companion', why: 'CUMPRINC 与本品类相关' },
    { id: 'ipmt', kind: 'companion', why: 'IPMT 与本品类相关' },
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
    template: '=CUMIPMT({rate},{nper},{pv},{start},{end},{type})',
    cases: [
      { label: '第13–24期利息 -8908.185705', type: 'ok', values: {}, expect: '-8908.185705', note: '年利率9%、30年、贷款10万，第13–24期累计利息。' },
      { label: '利率非数字', type: 'error', values: { rate: 'abc' }, expect: '#VALUE!', note: 'rate 必须是数字。' },
      { label: '期数为0', type: 'error', values: { nper: '0' }, expect: '#NUM!', note: 'nper 必须 > 0。' },
      { label: '结束期早于起始期', type: 'error', values: { start: '24', end: '13' }, expect: '#NUM!', note: '需满足 start ≤ end。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default cumipmtEntry;
