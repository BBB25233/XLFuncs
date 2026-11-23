import type { FunctionEntry } from '@/types';

/** EFFECT · 有效年利率（financial 类 B9 批次） */

const effectEntry: FunctionEntry = {
  id: 'effect',
  enName: 'EFFECT',
  zhName: '有效年利率',
  zhCommon: ['EFFECT', '有效利率'],
  alias: ['实际年利率'],
  category: 'financial',
  abbr: 'yxnll',
  pinyin: 'youxiaonianlilv',
  keywords: ['effect', '有效利率', '复利'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把名义利率换算成年化实效',
  summary: 'EFFECT 把名义年利率按每年复利次数换算成真正到手的有效年利率，体现复利效应。',
  syntax: {
    patternCn: '=EFFECT(名义年利率, 复利次数)',
    patternEn: '=EFFECT(nominal_rate, npery)',
    args: [{ key: 'nominal', zh: '名义年利率', en: 'nominal_rate', required: true, desc: '标称年利率，如 0.06' },
    { key: 'npery', zh: '复利次数', en: 'npery', required: true, desc: '每年复利次数，如 12' }],
  },
  returnValue: '有效年利率（数字）',
  examples: [
    {
      title: '示例：月复利年化',
      scene: '名义利率 6%、每年复利 12 次',
      dataAnchor: 'B2',
      formula: '=EFFECT(0.06,12)',
      result: '约 0.0617',
      explanation: '实际年利率高于名义利率。',
    },
    {
      title: '示例：季复利年化',
      scene: '名义利率 5%、每年复利 4 次',
      dataAnchor: 'B2',
      formula: '=EFFECT(0.05,4)',
      result: '约 0.0509',
      explanation: '复利次数越少，实际利率越接近名义利率。',
    },
  ],
  pitfalls: [{ title: '与 NOMINAL 互逆', reason: '忘了 NOMINAL 是把有效利率反推名义。', fix: '反向用 NOMINAL 函数。', level: 'low' }],
  related: [{ id: 'nominal', kind: 'companion', why: 'NOMINAL 与本品类相关' },
    { id: 'fv', kind: 'companion', why: 'FV 与本品类相关' },
    { id: 'rate', kind: 'companion', why: 'RATE 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'nominal', label: '名义利率', type: 'number', default: '0.0525' },
      { key: 'npery', label: '年复利次数', type: 'number', default: '4' },
    ],
    template: '=EFFECT({nominal},{npery})',
    cases: [
      { label: '有效利率 0.053543', type: 'ok', values: {}, expect: '0.053543', note: '名义5.25%、季度复利的有效年利率。' },
      { label: '名义利率非数字', type: 'error', values: { nominal: 'abc' }, expect: '#VALUE!', note: 'nominal 必须是数字。' },
      { label: '复利次数为0', type: 'error', values: { npery: '0' }, expect: '#NUM!', note: 'npery 必须 ≥ 1。' },
      { label: '复利次数为负', type: 'error', values: { npery: '-1' }, expect: '#NUM!', note: 'npery 必须 ≥ 1。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default effectEntry;
