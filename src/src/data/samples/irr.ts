import type { FunctionEntry } from '@/types';

/** IRR · 内部收益率（financial 类 B9 批次） */

const irrEntry: FunctionEntry = {
  id: 'irr',
  enName: 'IRR',
  zhName: '内部收益率',
  zhCommon: ['IRR', '内部收益'],
  alias: ['收益率'],
  category: 'financial',
  abbr: 'nbsyl',
  pinyin: 'neibushouyilv',
  keywords: ['irr', '内部收益', '投资'],
  difficulty: 3,
  usageLevel: 6,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算系列现金流的内部收益率',
  summary: 'IRR 返回使净现值为 0 的折现率，用来判断项目投资回报高低。',
  syntax: {
    patternCn: '=IRR(现金流, [猜测])',
    patternEn: '=IRR(values, [guess])',
    args: [{ key: 'values', zh: '现金流', en: 'values', required: true, desc: '按期排列的现金流（首笔常为负投入）' },
    { key: 'guess', zh: '猜测', en: 'guess', required: false, desc: '初始猜测，默认 0.1' }],
  },
  returnValue: '内部收益率',
  examples: [{ title: '示例：项目 IRR', scene: '投入 -10000、回款 4000/5000/6000', dataAnchor: 'B2', formula: '=IRR(B2:B5)', result: '约 0.189', explanation: 'NPV=0 时的折现率。' }],
  pitfalls: [{ title: '现金流要按期序', reason: '顺序错 IRR 会错或 #NUM!。', fix: '按时间顺序排列。', level: 'high' },
    { title: '可能多解', reason: '现金流符号多次变号会有多个 IRR。', fix: '改用 XIRR 或 MIRR。', level: 'mid' }],
  related: [{ id: 'mirr', kind: 'companion', why: 'MIRR 与本品类相关' },
    { id: 'xirr', kind: 'companion', why: 'XIRR 与本品类相关' },
    { id: 'npv', kind: 'companion', why: 'NPV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'values', label: '现金流', type: 'text', default: '"-70000,12000,15000,18000,21000,26000"' },
      { key: 'guess', label: '猜测值', type: 'number', default: '0.1' },
    ],
    template: '=IRR({values},{guess})',
    cases: [
      { label: '内部收益率 0.086631', type: 'ok', values: {}, expect: '0.086631', note: '一组典型现金流的内部收益率。' },
      { label: '无正负号变化', type: 'error', values: { values: '"1,2,3"' }, expect: '#NUM!', note: '现金流需同时存在正负值。' },
      { label: '现金流非数字', type: 'error', values: { values: '"abc"' }, expect: '#VALUE!', note: 'values 须为逗号分隔的数字列表。' },
      { label: '猜测值非数字', type: 'error', values: { guess: 'abc' }, expect: '#VALUE!', note: 'guess 必须是数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default irrEntry;
