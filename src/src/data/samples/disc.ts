import type { FunctionEntry } from '@/types';

/** DISC · 贴现率（financial 类 B9 批次） */

const discEntry: FunctionEntry = {
  id: 'disc',
  enName: 'DISC',
  zhName: '贴现率',
  zhCommon: ['DISC', '贴现'],
  alias: ['折价率'],
  category: 'financial',
  abbr: 'txl',
  pinyin: 'tiexianlv',
  keywords: ['disc', '贴现', '债券'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算折价债券的贴现率',
  summary: 'DISC 返回折价发行债券的年化贴现率（收益率口径），由发行价与到期价反推。',
  syntax: {
    patternCn: '=DISC(结算日, 到期日, 价格, 赎回价, [基准])',
    patternEn: '=DISC(settlement, maturity, pr, redemption, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'pr', zh: '价格', en: 'pr', required: true, desc: '每 100 面值现价' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '年化贴现率',
  examples: [{ title: '示例：贴现率', scene: '现价 97.5、赎回 100', dataAnchor: 'B2', formula: '=DISC(DATE(2024,1,1),DATE(2025,1,1),97.5,100,0)', result: '约 0.0256', explanation: '由折价反推收益。' }],
  pitfalls: [{ title: '价格/赎回按每 100 面值', reason: '单位错会量级偏差。', fix: '都用每 100 面值。', level: 'mid' }],
  related: [{ id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' },
    { id: 'yielddisc', kind: 'companion', why: 'YIELDDISC 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'settlement', label: '结算日', type: 'text', default: '2008-01-01' },
      { key: 'maturity', label: '到期日', type: 'text', default: '2008-12-31' },
      { key: 'pr', label: '价格', type: 'number', default: '97.5' },
      { key: 'redemption', label: '赎回价', type: 'number', default: '100' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=DISC({settlement},{maturity},{pr},{redemption},{basis})',
    cases: [
      { label: '贴现率 0.02507', type: 'ok', values: {}, expect: '0.02507', note: '价格97.5、赎回100、一年期。' },
      { label: '结算日晚于到期日', type: 'error', values: { settlement: '2008-12-31', maturity: '2008-01-01' }, expect: '#NUM!', note: '结算日须早于到期日。' },
      { label: '价格为0', type: 'error', values: { pr: '0' }, expect: '#NUM!', note: 'pr 必须 > 0。' },
      { label: '基准非法', type: 'error', values: { basis: '5' }, expect: '#VALUE!', note: 'basis 只能是 0–4。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default discEntry;
