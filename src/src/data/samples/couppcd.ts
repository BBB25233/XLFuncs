import type { FunctionEntry } from '@/types';

/** COUPPCD · 上一付息日（financial 类 B9 批次） */

const couppcdEntry: FunctionEntry = {
  id: 'couppcd',
  enName: 'COUPPCD',
  zhName: '上一付息日',
  zhCommon: ['COUPPCD', '上次付息日'],
  alias: ['上个付息日'],
  category: 'financial',
  abbr: 'syfxr',
  pinyin: 'shangyifuxiri',
  keywords: ['couppcd', '付息日'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '结算日之前的最近付息日',
  summary: 'COUPPCD 返回结算日之前最后一个付息日的日期。',
  syntax: {
    patternCn: '=COUPPCD(结算日, 到期日, 频率, [基准])',
    patternEn: '=COUPPCD(settlement, maturity, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '上一付息日（日期）',
  examples: [{ title: '示例：上付息日', scene: '半年付', dataAnchor: 'B2', formula: '=COUPPCD(DATE(2024,2,15),DATE(2030,1,1),2,0)', result: '约 2024-01-01', explanation: '上一付息在 1 月。' }],
  pitfalls: [{ title: '返回日期序列号', reason: '结果需日期格式。', fix: '设为日期格式。', level: 'low' }],
  related: [{ id: 'coupncd', kind: 'companion', why: 'COUPNCD 与本品类相关' },
    { id: 'coupdaybs', kind: 'companion', why: 'COUPDAYBS 与本品类相关' },
    { id: 'coupdays', kind: 'companion', why: 'COUPDAYS 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'settlement', label: '结算日', type: 'text', default: '2008-08-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2048-01-01' },
      { key: 'frequency', label: '频率', type: 'number', default: '2' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=COUPPCD({settlement},{maturity},{frequency},{basis})',
    cases: [
      { label: '上一票息日序列号 39630', type: 'ok', values: {}, expect: '39630', note: '上一票息日 2008-07-01 的序列号。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2048-01-01', maturity: '2008-08-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default couppcdEntry;
