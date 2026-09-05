import type { FunctionEntry } from '@/types';

/** ACCRINTM · 到期应计利息（financial 类 B9 批次） */

const accrintmEntry: FunctionEntry = {
  id: 'accrintm',
  enName: 'ACCRINTM',
  zhName: '到期应计利息',
  zhCommon: ['ACCRINTM', '到期计息'],
  alias: ['到期利息'],
  category: 'financial',
  abbr: 'dqyjlx',
  pinyin: 'daoqiyingjilixi',
  keywords: ['accrintm', '应计', '债券'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '按到期日算应计利息',
  summary: 'ACCRINTM 与 ACCRINT 类似，但以到期日为计息终点，适合到期一次付息债券。',
  syntax: {
    patternCn: '=ACCRINTM(发行日, 到期日, 票面率, 面值, [基准])',
    patternEn: '=ACCRINTM(issue, maturity, rate, par, [basis])',
    args: [{ key: 'issue', zh: '发行日', en: 'issue', required: true, desc: '发行日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'par', zh: '面值', en: 'par', required: true, desc: '债券面值' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '到期应计利息',
  examples: [{ title: '示例：到期计息', scene: '面值 1000、票面 8%、1 年期', dataAnchor: 'B2', formula: '=ACCRINTM(DATE(2024,1,1),DATE(2025,1,1),0.08,1000,0)', result: '约 80.0', explanation: '整年应计。' }],
  pitfalls: [{ title: '与 ACCRINT 区别', reason: '用错函数会差一个付息结构。', fix: '到期付息用 ACCRINTM。', level: 'low' }],
  related: [{ id: 'accrint', kind: 'companion', why: 'ACCRINT 与本品类相关' },
    { id: 'pricemat', kind: 'companion', why: 'PRICEMAT 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'issue', label: '发行日', type: 'text', default: '2008-01-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2008-12-31' },
      { key: 'rate', label: '票面率', type: 'number', default: '0.1' },
      { key: 'par', label: '面值', type: 'number', default: '1000' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=ACCRINTM({issue},{maturity},{rate},{par},{basis})',
    cases: [
      { label: '年末应计 99.722222', type: 'ok', values: {}, expect: '99.722222', note: '面值1000、票面10%、全年应计。' },
      { label: '票面率非数字', type: 'error', values: { rate: 'abc' }, expect: '#VALUE!', note: 'rate 必须是数字。' },
      { label: '到期日早于发行日', type: 'error', values: { maturity: '2008-01-01', issue: '2008-07-01' }, expect: '#NUM!', note: '到期日须晚于发行日。' },
      { label: '面值非数字', type: 'error', values: { par: 'abc' }, expect: '#VALUE!', note: 'par 必须是数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default accrintmEntry;
