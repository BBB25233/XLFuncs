import type { FunctionEntry } from '@/types';

/** CHIDIST · 卡方分布（compatibility 类 B9 批次） */

const chidistEntry: FunctionEntry = {
  id: 'chidist',
  enName: 'CHIDIST',
  zhName: '卡方分布',
  zhCommon: ['CHIDIST', '卡方'],
  alias: ['卡方右尾'],
  category: 'compatibility',
  abbr: 'kffb',
  pinyin: 'kafangfenbu',
  keywords: ['chidist', '卡方', '分布'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算卡方分布的右尾概率',
  summary: 'CHIDIST 返回卡方分布在自由度 df 下、≥x 的右尾概率，卡方检验用。',
  syntax: { patternCn: '=CHIDIST(x, 自由度)', patternEn: '=CHIDIST(x, deg_freedom)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '检验统计量' },
    { key: 'df', zh: '自由度', en: 'deg_freedom', required: true, desc: '自由度' }] },
  returnValue: '右尾概率',
  examples: [
    { title: '示例：卡方右尾', scene: 'x=3、df=5', dataAnchor: 'B2', formula: '=CHIDIST(3,5)', result: '约 0.6999', explanation: 'P(X≥3 | df=5)。' },
    {
      title: '示例 2：三个常用 5% 临界值代进去会得到什么',
      scene: '卡方检验算完统计量要换 p 值再和 0.05 比。3.84、11.07、18.31 是三个常用的 5% 临界值，正好用来确认口径。',
      dataTsv: '卡方统计量 x\t自由度 df\n3.84\t1\n11.07\t5\n18.31\t10',
      dataAnchor: 'A1',
      formula: '=CHIDIST(A2,B2)',
      result: '3.84、df=1 → 0.050044，11.07、df=5 → 0.05001，18.31、df=10 → 0.049954',
      explanation: 'CHIDIST 返回的是右尾概率 P(X≥x)，所以临界值代进去大约得到 0.05。它和教材里的左尾累积表方向相反，别拿左尾表来对。',
    },
  ],
  pitfalls: [{ title: '返回右尾', reason: '旧版 CHIDIST 是右尾，与部分教材左尾相反。', fix: '需左尾用 1-CHIDIST。', level: 'mid' }],
  related: [{ id: 'chiinv', kind: 'companion', why: 'CHIINV 与本品类相关' },
    { id: 'chitest', kind: 'companion', why: 'CHITEST 与本品类相关' },
    { id: 'fdist', kind: 'companion', why: 'FDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'text', default: '3' },
      { key: 'df', label: '自由度 df', type: 'text', default: '5' },
    ],
    template: '=CHIDIST({x},{df})',
    cases: [
      { label: '右尾概率', type: 'ok', values: {}, expect: '0.699986', note: 'P(X>x) 的右尾卡方概率。' },
      { label: 'x 为负', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须大于等于 0。' },
      { label: '自由度非正', type: 'error', values: { df: '0' }, expect: '#NUM!', note: 'df 必须是不小于 1 的整数。' },
      { label: '❌ x 写成文本', type: 'error', values: { x: '三点八四' }, expect: '#VALUE!', note: '意思：第 1 参数不是数字。统计量要填数值 3.84。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default chidistEntry;
