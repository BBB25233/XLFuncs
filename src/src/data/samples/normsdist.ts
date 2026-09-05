import type { FunctionEntry } from '@/types';

/** NORMSDIST · 标准正态累积（compatibility 类 B9 批次） */

const normsdistEntry: FunctionEntry = {
  id: 'normsdist',
  enName: 'NORMSDIST',
  zhName: '标准正态累积',
  zhCommon: ['NORMSDIST', '标准正态'],
  alias: ['标准正态累积'],
  category: 'compatibility',
  abbr: 'bzztlj',
  pinyin: 'biaozhunzhengtaileiji',
  keywords: ['normsdist', '标准正态', '分布'],
  difficulty: 3,
  usageLevel: 5,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算标准正态的累积概率',
  summary: 'NORMSDIST 返回标准正态（μ=0、σ=1）的累积概率，等价于 NORMDIST(x,0,1,TRUE)。新版请用 NORM.S.DIST。',
  syntax: { patternCn: '=NORMSDIST(z)', patternEn: '=NORMSDIST(z)', args: [{ key: 'z', zh: 'z', en: 'z', required: true, desc: '标准分（z 值）' }] },
  returnValue: '累积概率',
  examples: [{ title: '示例：标准正态累积', scene: 'z=1', dataAnchor: 'B2', formula: '=NORMSDIST(1)', result: '0.8413', explanation: 'P(Z≤1)。' }],
  pitfalls: [{ title: '仅限标准正态', reason: '非标准正态要先标准化。', fix: '用 (x-μ)/σ 得 z 再查。', level: 'low' }],
  related: [{ id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' },
    { id: 'normdist', kind: 'companion', why: 'NORMDIST 与本品类相关' },
    { id: 'norminv', kind: 'companion', why: 'NORMINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'z', label: 'z', type: 'number', default: '1' },
    ],
    template: '=NORMSDIST({z})',
    cases: [
      { label: 'ok 累积', type: 'ok', values: {}, expect: '0.841345', note: 'P(Z≤1)。' },
      { label: '非法：非数字', type: 'error', values: { z: 'abc' }, expect: '#VALUE!', note: 'z 必须是数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default normsdistEntry;
