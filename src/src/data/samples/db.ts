import type { FunctionEntry } from '@/types';

/** DB · 余额递减折旧（financial 类 B9 批次） */

const dbEntry: FunctionEntry = {
  id: 'db',
  enName: 'DB',
  zhName: '余额递减折旧',
  zhCommon: ['DB', '余额递减'],
  alias: ['固定率折旧'],
  category: 'financial',
  abbr: 'yedjzj',
  pinyin: 'yuedijianzhejiu',
  keywords: ['db', '折旧', '余额递减'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '按固定折旧率递减',
  summary: 'DB 用固定折旧率乘以期初账面值，折旧额逐年递减，是常见加速折旧法。',
  syntax: {
    patternCn: '=DB(原值, 残值, 寿命, 第几期, [首年月数])',
    patternEn: '=DB(cost, salvage, life, period, [month])',
    args: [{ key: 'cost', zh: '原值', en: 'cost', required: true, desc: '资产成本' },
    { key: 'salvage', zh: '残值', en: 'salvage', required: true, desc: '残值' },
    { key: 'life', zh: '寿命', en: 'life', required: true, desc: '总寿命期数' },
    { key: 'per', zh: '第几期', en: 'period', required: true, desc: '要算的期数' },
    { key: 'month', zh: '首年月数', en: 'month', required: false, desc: '首年折旧月数，默认 12' }],
  },
  returnValue: '该期折旧额',
  examples: [{ title: '示例：第 1 期', scene: '原值 100000、残值 10000、寿命 5', dataAnchor: 'B2', formula: '=DB(100000,10000,5,1)', result: '约 36900（按固定率）', explanation: '折旧率 = 1-(残值/原值)^(1/寿命)。' }],
  pitfalls: [{ title: '寿命期数与月数单位', reason: 'life 用年、month 用月，混用会错。', fix: '统一期数单位。', level: 'mid' }],
  related: [{ id: 'ddb', kind: 'companion', why: 'DDB 与本品类相关' },
    { id: 'sln', kind: 'companion', why: 'SLN 与本品类相关' },
    { id: 'syd', kind: 'companion', why: 'SYD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'cost', label: '成本', type: 'number', default: '1000000' },
      { key: 'salvage', label: '残值', type: 'number', default: '100000' },
      { key: 'life', label: '寿命', type: 'number', default: '10' },
      { key: 'per', label: '期数', type: 'number', default: '1' },
      { key: 'month', label: '首年月数', type: 'number', default: '12' },
    ],
    template: '=DB({cost},{salvage},{life},{per},{month})',
    cases: [
      { label: '第1期折旧 205671.765276', type: 'ok', values: {}, expect: '205671.765276', note: '成本100万、残值10万、寿命10年、首年12个月。' },
      { label: '成本非数字', type: 'error', values: { cost: 'abc' }, expect: '#VALUE!', note: 'cost 必须是数字。' },
      { label: '寿命为0', type: 'error', values: { life: '0' }, expect: '#NUM!', note: 'life 必须 > 0。' },
      { label: '期数超寿命', type: 'error', values: { per: '11' }, expect: '#NUM!', note: 'period 须在 1…life 之间。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default dbEntry;
