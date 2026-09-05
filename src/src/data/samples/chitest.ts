import type { FunctionEntry } from '@/types';

/** CHITEST · 卡方检验（compatibility 类 B9 批次） */

const chitestEntry: FunctionEntry = {
  id: 'chitest',
  enName: 'CHITEST',
  zhName: '卡方检验',
  zhCommon: ['CHITEST', '卡方检验'],
  alias: ['独立性检验'],
  category: 'compatibility',
  abbr: 'kfjy',
  pinyin: 'kafangjianyan',
  keywords: ['chitest', '卡方', '检验'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '做卡方独立性检验',
  summary: 'CHITEST 比较实际频数与期望频数，返回卡方检验的 p 值，判断两分类变量是否独立。',
  syntax: { patternCn: '=CHITEST(实际频数, 期望频数)', patternEn: '=CHITEST(actual_range, expected_range)', args: [{ key: 'actual', zh: '实际频数', en: 'actual_range', required: true, desc: '观测频数区域' },
    { key: 'expected', zh: '期望频数', en: 'expected_range', required: true, desc: '期望频数区域' }] },
  returnValue: '检验 p 值',
  examples: [{ title: '示例：独立性检验', scene: '性别与偏好交叉表', dataAnchor: 'A1', dataTsv: '实际\t期望\n10\t12\n20\t18\n30\t33\n40\t37', formula: '=CHITEST(A2:A5,B2:B5)', result: '约 0.78（p 值）', explanation: 'p 小说明变量不独立。' }],
  pitfalls: [{ title: '区域须同形', reason: '两个区域行列数要一致。', fix: '核对区域形状。', level: 'mid' }],
  related: [{ id: 'chidist', kind: 'companion', why: 'CHIDIST 与本品类相关' },
    { id: 'chiinv', kind: 'companion', why: 'CHIINV 与本品类相关' },
    { id: 'ftest', kind: 'companion', why: 'FTEST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'actual', label: '实际观测', type: 'ref', default: 'A2:A5' },
      { key: 'expected', label: '理论期望', type: 'ref', default: 'B2:B5' },
    ],
    template: '=CHITEST({actual},{expected})',
    cases: [
      { label: '独立性检验', type: 'ok', values: {}, expect: '0.783952', note: '返回卡方检验的 p 值。' },
      { label: '区域无效', type: 'error', values: { actual: 'ZZZ' }, expect: '#REF!', note: 'actual 要写成「左上角:右下角」。' },
      { label: '长度不一致', type: 'error', values: { expected: 'B2:B3' }, expect: '#N/A', note: '两个区域单元格个数必须相同。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default chitestEntry;
