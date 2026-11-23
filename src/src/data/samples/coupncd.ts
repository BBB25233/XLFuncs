import type { FunctionEntry } from '@/types';

/** COUPNCD · 下一付息日（financial 类 B9 批次） */

const coupncdEntry: FunctionEntry = {
  id: 'coupncd',
  enName: 'COUPNCD',
  zhName: '下一付息日',
  zhCommon: ['COUPNCD', '下次付息日'],
  alias: ['下个付息日'],
  category: 'financial',
  abbr: 'xyfxr',
  pinyin: 'xiayifuxiri',
  keywords: ['coupncd', '付息日'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '结算日之后的下一付息日',
  summary: 'COUPNCD 返回结算日之后第一个付息日的日期。',
  syntax: {
    patternCn: '=COUPNCD(结算日, 到期日, 频率, [基准])',
    patternEn: '=COUPNCD(settlement, maturity, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '下一付息日（日期）',
  examples: [
    {
      title: '示例：下一个付息日',
      scene: '结算 2024-1-1、半年付',
      dataAnchor: 'B2',
      formula: '=COUPNCD(DATE(2024,1,1),DATE(2030,1,1),2,0)',
      result: '2024-07-01',
      explanation: '返回结算日之后最近的付息日。',
    },
    {
      title: '示例：季付下一个付息日',
      scene: '结算 2024-2-15、季付',
      dataAnchor: 'B2',
      formula: '=COUPNCD(DATE(2024,2,15),DATE(2032,1,1),4,1)',
      result: '2024-04-01',
      explanation: '季付时下一付息日更近。',
    },
  ],
  pitfalls: [{ title: '返回日期序列号', reason: '结果需设日期格式才显示。', fix: '单元格设为日期格式。', level: 'low' }],
  related: [{ id: 'couppcd', kind: 'companion', why: 'COUPPCD 与本品类相关' },
    { id: 'coupncd', kind: 'companion', why: 'COUPNCD 与本品类相关' },
    { id: 'coupdaysnc', kind: 'companion', why: 'COUPDAYSNC 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'settlement', label: '结算日', type: 'text', default: '2008-08-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2048-01-01' },
      { key: 'frequency', label: '频率', type: 'number', default: '2' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=COUPNCD({settlement},{maturity},{frequency},{basis})',
    cases: [
      { label: '下一票息日序列号 39814', type: 'ok', values: {}, expect: '39814', note: '下一票息日 2009-01-01 的序列号。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2048-01-01', maturity: '2008-08-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default coupncdEntry;
