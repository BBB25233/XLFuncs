import type { FunctionEntry } from '@/types';

/** CONFIDENCE · 置信区间（compatibility 类 B9 批次） */

const confidenceEntry: FunctionEntry = {
  id: 'confidence',
  enName: 'CONFIDENCE',
  zhName: '置信区间',
  zhCommon: ['CONFIDENCE', '置信'],
  alias: ['置信半径'],
  category: 'compatibility',
  abbr: 'zxqj',
  pinyin: 'zhixinqujian',
  keywords: ['confidence', '置信区间', '估计'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算总体均值的置信半径',
  summary: 'CONFIDENCE 返回在给定置信水平下总体均值的置信区间半径 = z·σ/√n，再由样本均值 ± 半径得区间。',
  syntax: { patternCn: '=CONFIDENCE(显著性水平, 标准差, 样本量)', patternEn: '=CONFIDENCE(alpha, standard_dev, size)', args: [{ key: 'alpha', zh: '显著性水平', en: 'alpha', required: true, desc: '如 0.05 对应 95% 置信' },
    { key: 'sd', zh: '标准差', en: 'standard_dev', required: true, desc: '总体标准差' },
    { key: 'n', zh: '样本量', en: 'size', required: true, desc: '样本量' }] },
  returnValue: '置信半径',
  examples: [
    {
      title: '示例：95% 置信半径',
      scene: 'α=0.05、σ=2.5、n=50',
      dataAnchor: 'B2',
      formula: '=CONFIDENCE(0.05,2.5,50)',
      result: '约 0.693',
      explanation: '1.96×2.5/√50。',
    },
    {
      title: '示例：置信度提到 99%，半径一定会变宽',
      scene: '同一批样本，老板要求「再保险一点」，把置信度从 95% 提到 99%。这时第一个参数要填 0.01，不是 0.99。',
      dataAnchor: 'B2',
      formula: '=CONFIDENCE(0.01,2.5,50)',
      result: '约 0.911（α=0.05 时只有 0.693）',
      explanation:
        '95% 置信对应 α=0.05、z=1.96；99% 置信对应 α=0.01、z=2.576。z 变大，半径 2.576×2.5/√50 也跟着变宽。把 0.99 当 α 填进去，结果会变成 0.004 左右，完全不沾边。',
    },
  ],
  pitfalls: [{ title: 'α 不是置信度', reason: '把 0.95 当 α 会算错。', fix: '95% 置信填 α=0.05。', level: 'mid' }],
  related: [{ id: 'normdist', kind: 'companion', why: 'NORMDIST 与本品类相关' },
    { id: 'var', kind: 'companion', why: 'VAR 与本品类相关' },
    { id: 'average', kind: 'companion', why: 'AVERAGE 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'alpha', label: '显著性 alpha', type: 'text', default: '0.05' },
      { key: 'sd', label: '标准差 sd', type: 'text', default: '2.5' },
      { key: 'n', label: '样本量 n', type: 'text', default: '50' },
    ],
    template: '=CONFIDENCE({alpha},{sd},{n})',
    cases: [
      { label: '95% 置信半宽', type: 'ok', values: {}, expect: '0.692952', note: '总体均值的置信区间半宽。' },
      { label: 'alpha 越界', type: 'error', values: { alpha: '1.5' }, expect: '#NUM!', note: '需满足 0<alpha<1。' },
      { label: '标准差非正', type: 'error', values: { sd: '-1' }, expect: '#NUM!', note: 'sd 必须大于 0。' },
      { label: 'alpha 填文字', type: 'error', values: { alpha: '5%' }, expect: '#VALUE!', note: 'alpha 必须是数字，写带百分号的「5%」会报 #VALUE!，要写 0.05。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default confidenceEntry;
