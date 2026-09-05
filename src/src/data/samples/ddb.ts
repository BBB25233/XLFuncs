import type { FunctionEntry } from '@/types';

/** DDB · 双倍余额递减（financial 类 B9 批次） */

const ddbEntry: FunctionEntry = {
  id: 'ddb',
  enName: 'DDB',
  zhName: '双倍余额递减',
  zhCommon: ['DDB', '双倍余额'],
  alias: ['加倍递减'],
  category: 'financial',
  abbr: 'sbyedj',
  pinyin: 'shuangbeiyuedijian',
  keywords: ['ddb', '折旧', '双倍'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '双倍率加速折旧',
  summary: 'DDB 用 (2/寿命) 的折旧率乘账面值，前期提得多，可指定其他倍数 factor。',
  syntax: {
    patternCn: '=DDB(原值, 残值, 寿命, 第几期, [倍数])',
    patternEn: '=DDB(cost, salvage, life, period, [factor])',
    args: [{ key: 'cost', zh: '原值', en: 'cost', required: true, desc: '资产成本' },
    { key: 'salvage', zh: '残值', en: 'salvage', required: true, desc: '残值' },
    { key: 'life', zh: '寿命', en: 'life', required: true, desc: '总寿命期数' },
    { key: 'per', zh: '第几期', en: 'period', required: true, desc: '要算的期数' },
    { key: 'factor', zh: '倍数', en: 'factor', required: false, desc: '折旧倍数，默认 2' }],
  },
  returnValue: '该期折旧额',
  examples: [{ title: '示例：首年', scene: '原值 2400、残值 300、寿命 5', dataAnchor: 'B2', formula: '=DDB(2400,300,5,1)', result: '960（2400×2/5）', explanation: '首年按双倍率。' }],
  pitfalls: [{ title: '最后一期受残值限制', reason: 'DDB 不会把账面值折到残值以下。', fix: '末段手动调到剩残值。', level: 'low' }],
  related: [{ id: 'db', kind: 'companion', why: 'DB 与本品类相关' },
    { id: 'sln', kind: 'companion', why: 'SLN 与本品类相关' },
    { id: 'syd', kind: 'companion', why: 'SYD 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'cost', label: '成本', type: 'number', default: '2400' },
      { key: 'salvage', label: '残值', type: 'number', default: '300' },
      { key: 'life', label: '寿命', type: 'number', default: '10' },
      { key: 'per', label: '期数', type: 'number', default: '1' },
      { key: 'factor', label: '倍数', type: 'number', default: '2' },
    ],
    template: '=DDB({cost},{salvage},{life},{per},{factor})',
    cases: [
      { label: '第1期折旧 480', type: 'ok', values: {}, expect: '480', note: '成本2400、残值300、寿命10年、双倍余额递减。' },
      { label: '成本非数字', type: 'error', values: { cost: 'abc' }, expect: '#VALUE!', note: 'cost 必须是数字。' },
      { label: '寿命为0', type: 'error', values: { life: '0' }, expect: '#NUM!', note: 'life 必须 > 0。' },
      { label: '倍数为0', type: 'error', values: { factor: '0' }, expect: '#NUM!', note: 'factor 必须 > 0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ddbEntry;
