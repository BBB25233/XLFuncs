import type { FunctionEntry } from '@/types';

/** ACCRINT · 应计利息（financial 类 B9 批次） */

const accrintEntry: FunctionEntry = {
  id: 'accrint',
  enName: 'ACCRINT',
  zhName: '应计利息',
  zhCommon: ['ACCRINT', '应计利息'],
  alias: ['累计利息'],
  category: 'financial',
  abbr: 'yjlx',
  pinyin: 'yingjilixi',
  keywords: ['accrint', '应计', '债券', '利息'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算定期付息债券到结算日利息',
  summary: 'ACCRINT 返回从发行日到结算日之间，按票面利率应计的债券利息。',
  syntax: {
    patternCn: '=ACCRINT(发行日, 首息日, 结算日, 票面率, 面值, 频率, [基准])',
    patternEn: '=ACCRINT(issue, first_interest, settlement, rate, par, frequency, [basis])',
    args: [{ key: 'issue', zh: '发行日', en: 'issue', required: true, desc: '发行日期' },
    { key: 'first', zh: '首息日', en: 'first_interest', required: true, desc: '首次付息日' },
    { key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'par', zh: '面值', en: 'par', required: true, desc: '债券面值' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数 1/2/4' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '应计利息（数字）',
  examples: [
    {
      title: '示例：三个月应计利息',
      scene: '面值 1000、票面 8%、半年付',
      dataAnchor: 'B2',
      formula: '=ACCRINT(DATE(2024,1,1),DATE(2024,7,1),DATE(2024,4,1),0.08,1000,2,1)',
      result: '20',
      explanation: '发行到结算 3 个月，按实际天数基准计息。',
    },
    {
      title: '示例：九个月应计利息',
      scene: '票面 5%、结算日已过首息日',
      dataAnchor: 'B2',
      formula: '=ACCRINT(DATE(2024,1,1),DATE(2024,7,1),DATE(2024,10,1),0.05,1000,2,0)',
      result: '37.5',
      explanation: '结算日晚于首息日时按 30/360 累计 9 个月。',
    },
  ],
  pitfalls: [{ title: '结算日早于发行日', reason: '会返回 #NUM!。', fix: '结算日须晚于发行日。', level: 'mid' }],
  related: [{ id: 'accrintm', kind: 'companion', why: 'ACCRINTM 与本品类相关' },
    { id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'issue', label: '发行日', type: 'text', default: '2008-01-01' },
      { key: 'first', label: '首息日', type: 'text', default: '2008-07-01' },
      { key: 'settlement', label: '结算日', type: 'text', default: '2008-04-01' },
      { key: 'rate', label: '票面率', type: 'number', default: '0.1' },
      { key: 'par', label: '面值', type: 'number', default: '1000' },
      { key: 'frequency', label: '频率', type: 'number', default: '2' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=ACCRINT({issue},{first},{settlement},{rate},{par},{frequency},{basis})',
    cases: [
      { label: '应计利息 25', type: 'ok', values: {}, expect: '25', note: '面值1000、票面10%、半年付，发行至结算3个月应计 25。' },
      { label: '票面率非数字', type: 'error', values: { rate: 'abc' }, expect: '#VALUE!', note: 'rate 必须是数字。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '结算日早于发行日', type: 'error', values: { settlement: '2008-01-01', issue: '2008-07-01' }, expect: '#NUM!', note: '结算日须晚于发行日。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default accrintEntry;
