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
  examples: [{ title: '示例：伽马反函数', scene: '概率 0.5、形状 9、尺度 2', dataAnchor: 'B2', formula: '=GAMMAINV(0.5,9,2)', result: '约 17.34', explanation: '中位数附近。' },
    { title: '示例 2：求 95% 分位，定备件天数', scene: '同一台设备的故障间隔服从 Gamma（形状 2、尺度 3），仓库要求「95% 的情况下够用」，问要备多少天的量。', dataAnchor: 'B2', formula: '=GAMMAINV(0.95,2,3)', result: '约 14.23（天）', explanation: 'GAMMAINV 返回累积概率达到 95% 时对应的 x，和 GAMMADIST 互逆：把 14.23 代回 =GAMMADIST(14.23,2,3,TRUE) 会回到 0.95。' }],
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
      { label: 'alpha 非正', type: 'error', values: { alpha: '0' }, expect: '#NUM!', note: '形状参数 alpha 必须大于 0。' },
      { label: 'p 取边界 0', type: 'error', values: { p: '0' }, expect: '#NUM!', note: '概率必须严格落在 0 和 1 之间，填 0 或 1 都会报 #NUM!。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default gammainvEntry;
