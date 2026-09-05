import type { FunctionEntry } from '@/types';

/** GAMMAINV · 伽马反函数（compatibility 类 B9 批次） */

const gammainvEntry: FunctionEntry = {
  id: 'gammainv',
  enName: 'GAMMAINV',
  zhName: '伽马反函数',
  zhCommon: ['GAMMAINV', '伽马反'],
  alias: ['Gamma 反函数'],
  category: 'compatibility',
  abbr: 'jmfhs',
  pinyin: 'jiamafanhanshu',
  keywords: ['gammainv', '伽马', '反函数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由概率反查伽马分布值',
  summary: 'GAMMAINV 是 GAMMADIST 的逆运算：给定累积概率反推 x。',
  syntax: { patternCn: '=GAMMAINV(概率, 形状, 尺度)', patternEn: '=GAMMAINV(probability, alpha, beta)', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '累积概率' },
    { key: 'alpha', zh: '形状', en: 'alpha', required: true, desc: '形状参数' },
    { key: 'beta', zh: '尺度', en: 'beta', required: true, desc: '尺度参数' }] },
  returnValue: '对应的 x 值',
  examples: [{ title: '示例：伽马反函数', scene: '概率 0.5、形状 9、尺度 2', dataAnchor: 'B2', formula: '=GAMMAINV(0.5,9,2)', result: '约 17.6', explanation: '中位数附近。' }],
  pitfalls: [{ title: '与 GAMMADIST 配对', reason: '两函数互逆。', fix: '已知概率求 x 用 GAMMAINV。', level: 'low' }],
  related: [{ id: 'gammadist', kind: 'companion', why: 'GAMMADIST 与本品类相关' },
    { id: 'betainv', kind: 'companion', why: 'BETAINV 与本品类相关' },
    { id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率 p', type: 'text', default: '0.068094' },
      { key: 'alpha', label: 'Alpha', type: 'text', default: '9' },
      { key: 'beta', label: 'Beta(尺度)', type: 'text', default: '2' },
    ],
    template: '=GAMMAINV({p},{alpha},{beta})',
    cases: [
      { label: '逆 CDF', type: 'ok', values: {}, expect: '10.000011', note: 'GAMMADIST 的逆函数，约回到 x=10。' },
      { label: 'p 越界', type: 'error', values: { p: '1.5' }, expect: '#NUM!', note: '需满足 0<p<1。' },
      { label: 'beta 非正', type: 'error', values: { beta: '0' }, expect: '#NUM!', note: 'alpha、beta 必须大于 0。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default gammainvEntry;
