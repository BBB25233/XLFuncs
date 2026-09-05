import type { FunctionEntry } from '@/types';

/** MODE · 旧版众数（compatibility 类 B9 批次） */

const modeEntry: FunctionEntry = {
  id: 'mode',
  enName: 'MODE',
  zhName: '旧版众数',
  zhCommon: ['MODE', '众数'],
  alias: ['出现最多'],
  category: 'compatibility',
  abbr: 'jbzs',
  pinyin: 'jiubanzhongshu',
  keywords: ['mode', '众数', '统计'],
  difficulty: 2,
  usageLevel: 5,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '找出现次数最多的数',
  summary: 'MODE 返回数据集中出现频率最高的值；多众数时只返回最小的那个。新版请用 MODE.SNGL/MODE.MULT。',
  syntax: { patternCn: '=MODE(数值1, [数值2]…)', patternEn: '=MODE(number1, [number2]…)', args: [{ key: 'n', zh: '数值', en: 'number1,[number2]…', required: true, desc: '待统计的数值区域' }] },
  returnValue: '众数',
  examples: [{ title: '示例：求众数', scene: '数据 1,2,2,3,4', dataAnchor: 'A1', dataTsv: '数值\n1\n2\n2\n3\n4', formula: '=MODE(A2:A6)', result: '2', explanation: '2 出现次数最多。' }],
  pitfalls: [{ title: '无重复返回 #N/A', reason: '所有值只出现一次会报错。', fix: '无众数数据换其他集中趋势。', level: 'mid' },
    { title: '多众数只取最小', reason: '有多个众数时旧版只返回最小的。', fix: '多众数用新版 MODE.MULT。', level: 'low' }],
  related: [{ id: 'average', kind: 'companion', why: 'AVERAGE 与本品类相关' },
    { id: 'median', kind: 'companion', why: 'MEDIAN 与本品类相关' },
    { id: 'rank', kind: 'companion', why: 'RANK 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'n', label: '数值区域', type: 'ref', default: 'A2:A6' },
    ],
    template: '=MODE({n})',
    cases: [
      { label: 'ok 众数', type: 'ok', values: {}, expect: '2', note: '2 出现次数最多。' },
      { label: '非法：无众数', type: 'error', values: { n: 'A2' }, expect: '#N/A', note: '区域只有一个值，没有众数。' },
      { label: '非法：区域无效', type: 'error', values: { n: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default modeEntry;
