import type { FunctionEntry } from '@/types';

/** NORMSINV · 标准正态反函数（compatibility 类 B9 批次） */

const normsinvEntry: FunctionEntry = {
  id: 'normsinv',
  enName: 'NORMSINV',
  zhName: '标准正态反函数',
  zhCommon: ['NORMSINV', '标准正态反'],
  alias: ['标准正态分位数'],
  category: 'compatibility',
  abbr: 'bzztfhs',
  pinyin: 'biaozhunzhengtaifanhanshu',
  keywords: ['normsinv', '标准正态', '反函数'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由概率反查标准正态 z',
  summary: 'NORMSINV 是 NORMSDIST 的逆运算：给定累积概率反推 z 值。新版请用 NORM.S.INV。',
  syntax: { patternCn: '=NORMSINV(概率)', patternEn: '=NORMSINV(probability)', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '累积概率（0~1）' }] },
  returnValue: 'z 值',
  examples: [{ title: '示例：标准正态分位数', scene: '概率 0.8413', dataAnchor: 'B2', formula: '=NORMSINV(0.8413)', result: '约 1.0', explanation: '与 NORMSDIST(1) 互逆。' }],
  pitfalls: [{ title: '概率须 0~1', reason: '越界会 #NUM!。', fix: '输入合法概率。', level: 'low' }],
  related: [{ id: 'normsdist', kind: 'companion', why: 'NORMSDIST 与本品类相关' },
    { id: 'norminv', kind: 'companion', why: 'NORMINV 与本品类相关' },
    { id: 'normdist', kind: 'companion', why: 'NORMDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率', type: 'number', default: '0.8413447' },
    ],
    template: '=NORMSINV({p})',
    cases: [
      { label: 'ok 分位数', type: 'ok', values: {}, expect: '1', note: '与 NORMSDIST(1) 互逆。' },
      { label: '非法：概率越界', type: 'error', values: { p: '2' }, expect: '#NUM!', note: '概率必须 0<p<1。' },
      { label: '非法：概率=0', type: 'error', values: { p: '0' }, expect: '#NUM!', note: '概率必须 0<p<1。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default normsinvEntry;
