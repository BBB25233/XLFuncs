import type { FunctionEntry } from '@/types';

/** FVSCHEDULE · 未来值系列（financial 类 B9 批次） */

const fvscheduleEntry: FunctionEntry = {
  id: 'fvschedule',
  enName: 'FVSCHEDULE',
  zhName: '未来值系列',
  zhCommon: ['复利未来值', '可变利率终值'],
  alias: ['复利终值'],
  category: 'financial',
  abbr: 'wlzxl',
  pinyin: 'weilaizhixilie',
  keywords: ['fv', '复利', '终值', 'series'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '按一串不同利率算复利终值',
  summary: 'FVSCHEDULE 把本金依次乘以 (1+各期利率)，适合每期利率都不一样的投资，算出最终本利和。',
  syntax: {
    patternCn: '=FVSCHEDULE(本金, 各期利率)',
    patternEn: '=FVSCHEDULE(principal, schedule)',
    args: [{ key: 'principal', zh: '本金', en: 'principal', required: true, desc: '初始投入金额' },
    { key: 'schedule', zh: '利率序列', en: 'schedule', required: true, desc: '各期利率所在区域，如 B2:B4' }],
  },
  returnValue: '复利终值（数字）',
  examples: [{ title: '示例：三档利率复利', scene: '每年利率不同', dataAnchor: 'B2', formula: '=FVSCHEDULE(1000,B2:B4)', result: '约 1157.6（1000×1.05×1.04×1.03）', explanation: '逐期连乘 (1+利率)。' }],
  pitfalls: [{ title: '利率区域含非数字', reason: 'schedule 里有文本会被当 0，结果偏小。', fix: '确保利率区域都是数字或 0。', level: 'mid' }],
  related: [{ id: 'fv', kind: 'companion', why: 'FV 与本品类相关' },
    { id: 'pv', kind: 'companion', why: 'PV 与本品类相关' },
    { id: 'npv', kind: 'companion', why: 'NPV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'principal', label: '本金', type: 'number', default: '1000' },
      { key: 'schedule', label: '利率序列', type: 'text', default: '"0.01,0.02,0.03"' },
    ],
    template: '=FVSCHEDULE({principal},{schedule})',
    cases: [
      { label: '未来值 1061.106', type: 'ok', values: {}, expect: '1061.106', note: '本金1000 按 1%/2%/3% 依次复利。' },
      { label: '本金非数字', type: 'error', values: { principal: 'abc' }, expect: '#VALUE!', note: 'principal 必须是数字。' },
      { label: '序列非数字', type: 'error', values: { schedule: '"abc"' }, expect: '#VALUE!', note: 'schedule 须为逗号分隔的数字列表。' },
      { label: '序列含非数字', type: 'error', values: { schedule: '"0.01,abc,0.03"' }, expect: '#VALUE!', note: 'schedule 中每项都须为数字。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default fvscheduleEntry;
