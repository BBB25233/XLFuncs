import type { FunctionEntry } from '@/types';

/** DURATION · 麦考利久期（financial 类 B9 批次） */

const durationEntry: FunctionEntry = {
  id: 'duration',
  enName: 'DURATION',
  zhName: '麦考利久期',
  zhCommon: ['DURATION', '久期'],
  alias: ['麦考利久期'],
  category: 'financial',
  abbr: 'mkljq',
  pinyin: 'maikaolijiuqi',
  keywords: ['duration', '久期', '债券'],
  difficulty: 5,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算债券收回成本的年限',
  summary: 'DURATION 返回债券的麦考利久期，衡量价格对收益率变动的敏感度，是利率风险管理核心。',
  syntax: {
    patternCn: '=DURATION(结算日, 到期日, 票面率, 收益率, 频率, [基准])',
    patternEn: '=DURATION(settlement, maturity, coupon, yld, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'coupon', zh: '票面率', en: 'coupon', required: true, desc: '年化票面利率' },
    { key: 'yld', zh: '收益率', en: 'yld', required: true, desc: '年化收益率' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数 1/2/4' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '久期（年）',
  examples: [
    {
      title: '示例：麦考利久期',
      scene: '票面 8%、收益 9%、十年期半年付',
      dataAnchor: 'B2',
      formula: '=DURATION(DATE(2024,1,1),DATE(2034,1,1),0.08,0.09,2,0)',
      result: '约 6.95',
      explanation: '现金流按现值加权的平均回收时间。',
    },
    {
      title: '示例：五年期久期',
      scene: '票面 6%、收益 7%',
      dataAnchor: 'B2',
      formula: '=DURATION(DATE(2024,1,1),DATE(2029,1,1),0.06,0.07,2,0)',
      result: '约 4.38',
      explanation: '期限越短，久期越短。',
    },
  ],
  pitfalls: [{ title: '收益率非价格', reason: '把价格当收益率填会错。', fix: 'yld 是收益率不是价格。', level: 'mid' }],
  related: [{ id: 'mduration', kind: 'companion', why: 'MDURATION 与本品类相关' },
    { id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'settlement', label: '结算日', type: 'text', default: '2018-07-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2048-01-01' },
      { key: 'coupon', label: '票面率', type: 'number', default: '0.08' },
      { key: 'yld', label: '收益率', type: 'number', default: '0.09' },
      { key: 'frequency', label: '频率', type: 'number', default: '2' },
      { key: 'basis', label: '基准', type: 'number', default: '1' },
    ],
    template: '=DURATION({settlement},{maturity},{coupon},{yld},{frequency},{basis})',
    cases: [
      { label: '麦考利久期 10.919145', type: 'ok', values: {}, expect: '10.919145', note: '票面8%、收益9%、半年付、实际/实际基准的麦考利久期。' },
      { label: '频率非法', type: 'error', values: { frequency: '3' }, expect: '#NUM!', note: 'frequency 只能是 1/2/4。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2048-01-01', maturity: '2018-07-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default durationEntry;
