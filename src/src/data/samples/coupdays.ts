import type { FunctionEntry } from '@/types';

/** COUPDAYS · 付息期天数（financial 类 B9 批次） */

const coupdaysEntry: FunctionEntry = {
  id: 'coupdays',
  enName: 'COUPDAYS',
  zhName: '付息期天数',
  zhCommon: ['COUPDAYS', '付息期天数'],
  alias: ['当期天数'],
  category: 'financial',
  abbr: 'fxqts',
  pinyin: 'fuxiqitianshu',
  keywords: ['coupdays', '付息', '天数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '结算日所在付息期天数',
  summary: 'COUPDAYS 返回包含结算日的那一个付息周期的总天数。',
  syntax: {
    patternCn: '=COUPDAYS(结算日, 到期日, 频率, [基准])',
    patternEn: '=COUPDAYS(settlement, maturity, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '付息期天数',
  examples: [
    {
      title: '示例：一个付息周期天数',
      scene: '半年付、30/360 基准',
      dataAnchor: 'B2',
      formula: '=COUPDAYS(DATE(2024,1,1),DATE(2030,1,1),2,0)',
      result: '180',
      explanation: '30/360 下半年固定按 180 天。',
    },
    {
      title: '示例：季付周期天数',
      scene: '季付、实际天数基准',
      dataAnchor: 'B2',
      formula: '=COUPDAYS(DATE(2024,2,15),DATE(2032,1,1),4,1)',
      result: '91',
      explanation: '实际天数基准下周期为 91 天。',
    },
  ],
  pitfalls: [{ title: '含闰年差异', reason: '实际天数随年份浮动。', fix: '用具体日期核算。', level: 'low' }],
  related: [{ id: 'coupdaybs', kind: 'companion', why: 'COUPDAYBS 与本品类相关' },
    { id: 'coupdaysnc', kind: 'companion', why: 'COUPDAYSNC 与本品类相关' },
    { id: 'coupncd', kind: 'companion', why: 'COUPNCD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'settlement', label: '结算日', type: 'text', default: '2008-08-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2048-01-01' },
      { key: 'frequency', label: '频率', type: 'number', default: '2' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=COUPDAYS({settlement},{maturity},{frequency},{basis})',
    cases: [
      { label: '当前票息期 180 天', type: 'ok', values: {}, expect: '180', note: '2008-08-01 所处票息期 180 天（US30/360）。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2048-01-01', maturity: '2008-08-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default coupdaysEntry;
