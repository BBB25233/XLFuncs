import type { FunctionEntry } from '@/types';

/** COUPDAYBS · 付息起息天数（financial 类 B9 批次） */

const coupdaybsEntry: FunctionEntry = {
  id: 'coupdaybs',
  enName: 'COUPDAYBS',
  zhName: '付息起息天数',
  zhCommon: ['COUPDAYBS', '起息天数'],
  alias: ['结算到付息天数'],
  category: 'financial',
  abbr: 'fxqxts',
  pinyin: 'fuxiqixitianshu',
  keywords: ['coupdaybs', '付息', '天数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '结算日到上一付息日天数',
  summary: 'COUPDAYBS 返回从上一付息日到结算日之间的实际天数，是票息计算的中间量。',
  syntax: {
    patternCn: '=COUPDAYBS(结算日, 到期日, 频率, [基准])',
    patternEn: '=COUPDAYBS(settlement, maturity, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '实际天数',
  examples: [{ title: '示例：起息天数', scene: '半年付、结算在付息间', dataAnchor: 'B2', formula: '=COUPDAYBS(DATE(2024,2,15),DATE(2030,1,1),2,0)', result: '约 45', explanation: '距上一付息日 45 天。' }],
  pitfalls: [{ title: '基准影响天数', reason: '不同 basis 天数算法不同。', fix: '确认 basis。', level: 'low' }],
  related: [{ id: 'coupdays', kind: 'companion', why: 'COUPDAYS 与本品类相关' },
    { id: 'coupdaysnc', kind: 'companion', why: 'COUPDAYSNC 与本品类相关' },
    { id: 'couppcd', kind: 'companion', why: 'COUPPCD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'settlement', label: '结算日', type: 'text', default: '2008-08-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2048-01-01' },
      { key: 'frequency', label: '频率', type: 'number', default: '2' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=COUPDAYBS({settlement},{maturity},{frequency},{basis})',
    cases: [
      { label: '结算到上一票息 30 天', type: 'ok', values: {}, expect: '30', note: '2008-08-01 距上一票息日 30 天（US30/360）。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2048-01-01', maturity: '2008-08-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default coupdaybsEntry;
