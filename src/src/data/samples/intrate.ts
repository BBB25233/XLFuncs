import type { FunctionEntry } from '@/types';

/** INTRATE · 期利率（financial 类 B9 批次） */

const intrateEntry: FunctionEntry = {
  id: 'intrate',
  enName: 'INTRATE',
  zhName: '期利率',
  zhCommon: ['INTRATE', '期利率'],
  alias: ['利息率'],
  category: 'financial',
  abbr: 'qll',
  pinyin: 'qililv',
  keywords: ['intrate', '利率', '债券'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算全额投资债券的期利率',
  summary: 'INTRATE 返回按面值折价/溢价发行、到期一次性还本付息的债券在持有期内的利率。',
  syntax: {
    patternCn: '=INTRATE(结算日, 到期日, 投资, 赎回价, [基准])',
    patternEn: '=INTRATE(settlement, maturity, investment, redemption, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'investment', zh: '投资', en: 'investment', required: true, desc: '购买价' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '到期赎回总额' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '持有期利率',
  examples: [
    {
      title: '示例：贴现债券收益率',
      scene: '价格 98、面值 100、半年期',
      dataAnchor: 'B2',
      formula: '=INTRATE(DATE(2024,1,1),DATE(2024,7,1),98,100,0)',
      result: '约 0.0408',
      explanation: '按 30/360 折算年化。',
    },
    {
      title: '示例：折价更深',
      scene: '价格 96、面值 100',
      dataAnchor: 'B2',
      formula: '=INTRATE(DATE(2024,1,1),DATE(2024,7,1),96,100,0)',
      result: '约 0.0833',
      explanation: '折价越深，收益率越高。',
    },
  ],
  pitfalls: [{ title: '与 RATE 区别', reason: 'RATE 是分期现金流，INTRATE 是一次性。', fix: '一次性还本付息用 INTRATE。', level: 'low' }],
  related: [{ id: 'rate', kind: 'companion', why: 'RATE 与本品类相关' },
    { id: 'disc', kind: 'companion', why: 'DISC 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'settlement', label: '结算日', type: 'text', default: '2008-01-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2008-12-31' },
      { key: 'investment', label: '投资额', type: 'number', default: '10000' },
      { key: 'redemption', label: '赎回额', type: 'number', default: '10500' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=INTRATE({settlement},{maturity},{investment},{redemption},{basis})',
    cases: [
      { label: '利率 0.05', type: 'ok', values: {}, expect: '0.05', note: '投资10000、赎回10500、一年期贴现利率。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2008-12-31', maturity: '2008-01-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '投资额为0', type: 'error', values: { investment: '0' }, expect: '#NUM!', note: 'investment 必须 > 0。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default intrateEntry;
