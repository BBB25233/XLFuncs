import type { FunctionEntry } from '@/types';

/** TTEST · t检验（compatibility 类 B9 批次） */

const ttestEntry: FunctionEntry = {
  id: 'ttest',
  enName: 'TTEST',
  zhName: 't检验',
  zhCommon: ['TTEST', 't检验'],
  alias: ['均值差异检验'],
  category: 'compatibility',
  abbr: 'tjy',
  pinyin: 'tjianyan',
  keywords: ['ttest', 't检验', '均值'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '做两样本 t 检验',
  summary: 'TTEST 返回两样本均值是否显著差异的 p 值，tails 与 type 指定检验方式。新版请用 T.TEST。',
  syntax: { patternCn: '=TTEST(数组1, 数组2, 尾数, 类型)', patternEn: '=TTEST(array1, array2, tails, type)', args: [{ key: 'a', zh: '数组1', en: 'array1', required: true, desc: '第一组样本' },
    { key: 'b', zh: '数组2', en: 'array2', required: true, desc: '第二组样本' },
    { key: 'tails', zh: '尾数', en: 'tails', required: true, desc: '1=单尾、2=双尾' },
    { key: 'type', zh: '类型', en: 'type', required: true, desc: '1=配对、2=等方差、3=异方差' }] },
  returnValue: '检验 p 值',
  examples: [{ title: '示例：配对 t 检验', scene: '两组样本 1..5 与 2,4,6,8,10、双尾', dataAnchor: 'A1', dataTsv: '数值A\t数值B\n1\t2\n2\t4\n3\t6\n4\t8\n5\t10', formula: '=TTEST(A2:A6,B2:B6,2,1)', result: '约 0.013（p 值）', explanation: '配对差值显著，p 很小。' }],
  pitfalls: [{ title: 'type 别选错', reason: '配对/等方差/异方差结果不同。', fix: '按数据性质选 type。', level: 'mid' }],
  related: [{ id: 'tdist', kind: 'companion', why: 'TDIST 与本品类相关' },
    { id: 'ftest', kind: 'companion', why: 'FTEST 与本品类相关' },
    { id: 'tinv', kind: 'companion', why: 'TINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'a', label: '第1组区域', type: 'ref', default: 'A2:A6' },
      { key: 'b', label: '第2组区域', type: 'ref', default: 'B2:B6' },
      { key: 'tails', label: '尾数', type: 'select', options: [{ label: '1（单尾）', value: '1' }, { label: '2（双尾）', value: '2' }], default: '2' },
      { key: 'type', label: '检验类型', type: 'select', options: [{ label: '1（配对）', value: '1' }, { label: '2（等方差）', value: '2' }, { label: '3（异方差）', value: '3' }], default: '1' },
    ],
    template: '=TTEST({a},{b},{tails},{type})',
    cases: [
      { label: 'ok 配对双尾', type: 'ok', values: {}, expect: '0.013236', note: '配对 t 检验的 p 值。' },
      { label: '非法：尾数错误', type: 'error', values: { tails: '3' }, expect: '#NUM!', note: '尾数只能 1 或 2。' },
      { label: '非法：区域无效', type: 'error', values: { a: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ttestEntry;
