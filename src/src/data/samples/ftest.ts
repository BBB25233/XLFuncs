import type { FunctionEntry } from '@/types';

/** FTEST · F检验（compatibility 类 B9 批次） */

const ftestEntry: FunctionEntry = {
  id: 'ftest',
  enName: 'FTEST',
  zhName: 'F检验',
  zhCommon: ['FTEST', 'F检验'],
  alias: ['方差齐性检验'],
  category: 'compatibility',
  abbr: 'fjy',
  pinyin: 'fjianyan',
  keywords: ['ftest', 'F检验', '方差'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '做两样本方差齐性检验',
  summary: 'FTEST 返回两样本方差是否显著不同的 p 值（F 检验），判断方差齐性。',
  syntax: { patternCn: '=FTEST(数组1, 数组2)', patternEn: '=FTEST(array1, array2)', args: [{ key: 'a', zh: '数组1', en: 'array1', required: true, desc: '第一组样本' },
    { key: 'b', zh: '数组2', en: 'array2', required: true, desc: '第二组样本' }] },
  returnValue: '检验 p 值',
  examples: [{ title: '示例：方差齐性', scene: '两组样本', dataAnchor: 'A1', dataTsv: '样本1\t样本2\n5\t3\n7\t4\n6\t5\n8\t4\n7\t4', formula: '=FTEST(A2:A6,B2:B6)', result: '约 0.38（p 值）', explanation: 'p 大说明方差无显著差异。' }],
  pitfalls: [{ title: '对正态性敏感', reason: 'F 检验要求样本近似正态。', fix: '非正态用其他检验。', level: 'mid' }],
  related: [{ id: 'fdist', kind: 'companion', why: 'FDIST 与本品类相关' },
    { id: 'finv', kind: 'companion', why: 'FINV 与本品类相关' },
    { id: 'ttest', kind: 'companion', why: 'TTEST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'a', label: '数组1', type: 'ref', default: 'A2:A6' },
      { key: 'b', label: '数组2', type: 'ref', default: 'B2:B6' },
    ],
    template: '=FTEST({a},{b})',
    cases: [
      { label: '方差齐性检验', type: 'ok', values: {}, expect: '0.377229', note: '返回双尾 F 检验的 p 值。' },
      { label: '区域无效', type: 'error', values: { a: 'ZZZ' }, expect: '#REF!', note: '区域要写成「左上角:右下角」。' },
      { label: '样本量不足', type: 'error', values: { a: 'A2:A2', b: 'B2:B2' }, expect: '#DIV/0!', note: '每组都需要 n>=2 才能算方差。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ftestEntry;
