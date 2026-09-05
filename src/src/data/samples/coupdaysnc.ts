import type { FunctionEntry } from '@/types';

/** COUPDAYSNC · 下一付息天数（financial 类 B9 批次） */

const coupdaysncEntry: FunctionEntry = {
  id: 'coupdaysnc',
  enName: 'COUPDAYSNC',
  zhName: '下一付息天数',
  zhCommon: ['COUPDAYSNC', '到下次付息天数'],
  alias: ['剩余付息天数'],
  category: 'financial',
  abbr: 'xyfxts',
  pinyin: 'xiayifuxitianshu',
  keywords: ['coupdaysnc', '付息', '天数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '结算日到下一付息日天数',
  summary: 'COUPDAYSNC 返回从结算日到下一个付息日之间的实际天数。',
  syntax: {
    patternCn: '=COUPDAYSNC(结算日, 到期日, 频率, [基准])',
    patternEn: '=COUPDAYSNC(settlement, maturity, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '实际天数',
  examples: [{ title: '示例：剩余天数', scene: '半年付', dataAnchor: 'B2', formula: '=COUPDAYSNC(DATE(2024,2,15),DATE(2030,1,1),2,0)', result: '约 135', explanation: '距下一付息日 135 天。' }],
  pitfalls: [{ title: '与 COUPDAYBS 互补', reason: '两者相加≈当期天数。', fix: '两个函数配合用。', level: 'low' }],
  related: [{ id: 'coupdays', kind: 'companion', why: 'COUPDAYS 与本品类相关' },
    { id: 'coupdaybs', kind: 'companion', why: 'COUPDAYBS 与本品类相关' },
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
    template: '=COUPDAYSNC({settlement},{maturity},{frequency},{basis})',
    cases: [
      { label: '结算到下一票息 150 天', type: 'ok', values: {}, expect: '150', note: '2008-08-01 距下一票息日 150 天。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2048-01-01', maturity: '2008-08-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default coupdaysncEntry;
