import type { FunctionEntry } from '@/types';

/** AMORDEGRC · 法国折旧利息（financial 类 B9 批次） */

const amordegrcEntry: FunctionEntry = {
  id: 'amordegrc',
  enName: 'AMORDEGRC',
  zhName: '法国折旧利息',
  zhCommon: ['AMORDEGRC', '法式折旧'],
  alias: ['法国折旧'],
  category: 'financial',
  abbr: 'fgzjlx',
  pinyin: 'faguozhejiulixi',
  keywords: ['amordegrc', '折旧', '法国'],
  difficulty: 5,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '法式会计折旧利息',
  summary: 'AMORDEGRC 按法国会计准则计算资产在结算期内的折旧额，系数随寿命分档。',
  syntax: {
    patternCn: '=AMORDEGRC(原值, 买入日, 首期结束, 残值, 期率, 基准)',
    patternEn: '=AMORDEGRC(cost, date_purchased, first_period, salvage, period, rate, basis)',
    args: [{ key: 'cost', zh: '原值', en: 'cost', required: true, desc: '资产成本' },
    { key: 'date', zh: '买入日', en: 'date_purchased', required: true, desc: '购入日期' },
    { key: 'first', zh: '首期结束', en: 'first_period', required: true, desc: '首个结算期结束日' },
    { key: 'salvage', zh: '残值', en: 'salvage', required: true, desc: '残值' },
    { key: 'rate', zh: '期率', en: 'rate', required: false, desc: '折旧率' },
    { key: 'basis', zh: '基准', en: 'basis', required: true, desc: '日计数基准 0–4' }],
  },
  returnValue: '该期折旧额',
  examples: [{ title: '示例：一期折旧', scene: '资产成本 2400、残值 300', dataAnchor: 'B2', formula: '=AMORDEGRC(2400,DATE(2024,1,1),DATE(2024,12,31),300,0.15,0)', result: '按法式系数折旧额', explanation: '寿命<5 年系数更高。' }],
  pitfalls: [{ title: '与 AMORLINC 区分', reason: '两函数易混。', fix: '法式用 AMORDEGRC，直线摊还用 AMORLINC。', level: 'low' }],
  related: [{ id: 'amorlinc', kind: 'companion', why: 'AMORLINC 与本品类相关' },
    { id: 'db', kind: 'companion', why: 'DB 与本品类相关' },
    { id: 'ddb', kind: 'companion', why: 'DDB 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'cost', label: '成本', type: 'number', default: '2400' },
      { key: 'date', label: '买入日', type: 'text', default: '2008-01-01' },
      { key: 'first', label: '首期结束日', type: 'text', default: '2008-12-31' },
      { key: 'salvage', label: '残值', type: 'number', default: '300' },
      { key: 'period', label: '期数', type: 'number', default: '1' },
      { key: 'rate', label: '折旧率', type: 'number', default: '0.15' },
      { key: 'basis', label: '基准', type: 'number', default: '0' },
    ],
    template: '=AMORDEGRC({cost},{date},{first},{salvage},{period},{rate},{basis})',
    cases: [
      { label: '首期折旧 897.5', type: 'ok', values: {}, expect: '897.5', note: '成本2400、残值300、折旧率15%、首期。' },
      { label: '成本非数字', type: 'error', values: { cost: 'abc' }, expect: '#VALUE!', note: 'cost 必须是数字。' },
      { label: '买入日晚于首期', type: 'error', values: { date: '2008-12-31', first: '2008-01-01' }, expect: '#NUM!', note: '买入日须早于首期结束日。' },
      { label: '折旧率<=0', type: 'error', values: { rate: '0' }, expect: '#NUM!', note: 'rate 必须为正。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default amordegrcEntry;
