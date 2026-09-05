import type { FunctionEntry } from '@/types';

/** BETADIST · 贝塔分布（compatibility 类 B9 批次） */

const betadistEntry: FunctionEntry = {
  id: 'betadist',
  enName: 'BETADIST',
  zhName: '贝塔分布',
  zhCommon: ['BETADIST', '贝塔'],
  alias: ['Beta 分布'],
  category: 'compatibility',
  abbr: 'btfb',
  pinyin: 'beitafenbu',
  keywords: ['betadist', '贝塔', '概率'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算贝塔分布的累积概率',
  summary: 'BETADIST 返回贝塔分布在指定区间上的累积概率密度，用于建模 0~1 之间的比例型随机变量。',
  syntax: { patternCn: '=BETADIST(x, α, β, [A], [B])', patternEn: '=BETADIST(x, alpha, beta, [A], [B])', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '要计算概率的值' },
    { key: 'alpha', zh: 'α', en: 'alpha', required: true, desc: '形状参数 α' },
    { key: 'beta', zh: 'β', en: 'beta', required: true, desc: '形状参数 β' },
    { key: 'a', zh: '下限', en: 'A', required: false, desc: '区间下限，默认 0' },
    { key: 'b', zh: '上限', en: 'B', required: false, desc: '区间上限，默认 1' }] },
  returnValue: '累积概率',
  examples: [{ title: '示例：贝塔累积概率', scene: 'α=8、β=10、区间[1,3]', dataAnchor: 'B2', formula: '=BETADIST(2,8,10,1,3)', result: '约 0.685', explanation: '把 x=2 映射到标准 Beta 后求累积概率。' }],
  pitfalls: [{ title: '区间与参数限制', reason: 'x 须在 [A,B] 内，α、β 必须 >0。', fix: '检查区间与形状参数。', level: 'mid' }],
  related: [{ id: 'betainv', kind: 'companion', why: 'BETAINV 与本品类相关' },
    { id: 'tdist', kind: 'companion', why: 'TDIST 与本品类相关' },
    { id: 'fdist', kind: 'companion', why: 'FDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'text', default: '2' },
      { key: 'alpha', label: 'Alpha', type: 'text', default: '8' },
      { key: 'beta', label: 'Beta', type: 'text', default: '10' },
      { key: 'a', label: '下界 A', type: 'text', default: '1' },
      { key: 'b', label: '上界 B', type: 'text', default: '3' },
    ],
    template: '=BETADIST({x},{alpha},{beta},{a},{b})',
    cases: [
      { label: '区间 [1,3] 上的 CDF', type: 'ok', values: {}, expect: '0.685471', note: '返回 Beta 分布在该点的累积概率。' },
      { label: 'x 超出区间', type: 'error', values: { x: '5' }, expect: '#NUM!', note: 'x 必须落在 [a,b] 内。' },
      { label: 'alpha 非正', type: 'error', values: { alpha: '-1' }, expect: '#NUM!', note: 'alpha、beta 必须大于 0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default betadistEntry;
