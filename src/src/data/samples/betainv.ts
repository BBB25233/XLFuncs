import type { FunctionEntry } from '@/types';

/** BETAINV · 贝塔反函数（compatibility 类 B9 批次） */

const betainvEntry: FunctionEntry = {
  id: 'betainv',
  enName: 'BETAINV',
  zhName: '贝塔反函数',
  zhCommon: ['BETAINV', '贝塔反'],
  alias: ['Beta 反函数'],
  category: 'compatibility',
  abbr: 'btfhs',
  pinyin: 'beitafanhanshu',
  keywords: ['betainv', '贝塔', '反函数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由概率反查贝塔分布值',
  summary: 'BETAINV 是 BETADIST 的逆运算：给定累积概率反推对应的 x。',
  syntax: { patternCn: '=BETAINV(概率, α, β, [A], [B])', patternEn: '=BETAINV(probability, alpha, beta, [A], [B])', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '累积概率（0~1）' },
    { key: 'alpha', zh: 'α', en: 'alpha', required: true, desc: '形状参数 α' },
    { key: 'beta', zh: 'β', en: 'beta', required: true, desc: '形状参数 β' },
    { key: 'a', zh: '下限', en: 'A', required: false, desc: '区间下限，默认 0' },
    { key: 'b', zh: '上限', en: 'B', required: false, desc: '区间上限，默认 1' }] },
  returnValue: '对应的 x 值',
  examples: [{ title: '示例：贝塔反函数', scene: '同 BETADIST 例', dataAnchor: 'B2', formula: '=BETAINV(0.685,8,10,1,3)', result: '约 2', explanation: '与 BETADIST(2,8,10,1,3) 互逆。' }],
  pitfalls: [{ title: '与 BETADIST 配对', reason: '两函数互逆易混。', fix: '已知概率求 x 用 BETAINV。', level: 'low' }],
  related: [{ id: 'betadist', kind: 'companion', why: 'BETADIST 与本品类相关' },
    { id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' },
    { id: 'gammainv', kind: 'companion', why: 'GAMMAINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率 p', type: 'text', default: '0.685471' },
      { key: 'alpha', label: 'Alpha', type: 'text', default: '8' },
      { key: 'beta', label: 'Beta', type: 'text', default: '10' },
      { key: 'a', label: '下界 A', type: 'text', default: '1' },
      { key: 'b', label: '上界 B', type: 'text', default: '3' },
    ],
    template: '=BETAINV({p},{alpha},{beta},{a},{b})',
    cases: [
      { label: '逆 CDF', type: 'ok', values: {}, expect: '2.000002', note: 'BETADIST 的逆函数，结果约回到 x=2。' },
      { label: 'p 越界', type: 'error', values: { p: '1.5' }, expect: '#NUM!', note: '需满足 0<p<1。' },
      { label: 'alpha 非正', type: 'error', values: { alpha: '-1' }, expect: '#NUM!', note: 'alpha、beta 必须大于 0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default betainvEntry;
