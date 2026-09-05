import type { FunctionEntry } from '@/types';

/** COUPNUM · 付息次数（financial 类 B9 批次） */

const coupnumEntry: FunctionEntry = {
  id: 'coupnum',
  enName: 'COUPNUM',
  zhName: '付息次数',
  zhCommon: ['COUPNUM', '付息次数'],
  alias: ['剩余付息次数'],
  category: 'financial',
  abbr: 'fxcs',
  pinyin: 'fuxicishu',
  keywords: ['coupnum', '付息', '次数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '结算到到期的付息次数',
  summary: 'COUPNUM 返回从结算日到到期日之间还会付息的次数（含到期那次）。',
  syntax: {
    patternCn: '=COUPNUM(结算日, 到期日, 频率, [基准])',
    patternEn: '=COUPNUM(settlement, maturity, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '付息次数',
  examples: [{ title: '示例：付息次数', scene: '半年付、剩 6 年', dataAnchor: 'B2', formula: '=COUPNUM(DATE(2024,1,1),DATE(2030,1,1),2,0)', result: '12', explanation: '6 年×2=12 次。' }],
  pitfalls: [{ title: '含到期那次', reason: '以为不含到期日。', fix: 'COUPNUM 含到期付息。', level: 'low' }],
  related: [{ id: 'coupncd', kind: 'companion', why: 'COUPNCD 与本品类相关' },
    { id: 'couppcd', kind: 'companion', why: 'COUPPCD 与本品类相关' },
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
    template: '=COUPNUM({settlement},{maturity},{frequency},{basis})',
    cases: [
      { label: '剩余票息期数 78', type: 'ok', values: {}, expect: '78', note: '结算到到期共 78 个半年付息期。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2048-01-01', maturity: '2008-08-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default coupnumEntry;
