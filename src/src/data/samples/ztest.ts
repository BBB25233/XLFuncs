import type { FunctionEntry } from '@/types';

/** ZTEST · z检验（compatibility 类 B9 批次） */

const ztestEntry: FunctionEntry = {
  id: 'ztest',
  enName: 'ZTEST',
  zhName: 'z检验',
  zhCommon: ['ZTEST', 'z检验'],
  alias: ['单样本 z 检验'],
  category: 'compatibility',
  abbr: 'zjy',
  pinyin: 'zjianyan',
  keywords: ['ztest', 'z检验', '均值'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '做单样本 z 检验',
  summary: 'ZTEST 返回样本均值与假设总体均值无差异的 p 值（已知总体标准差时）。新版请用 Z.TEST。',
  syntax: { patternCn: '=ZTEST(数组, 假设均值, [标准差])', patternEn: '=ZTEST(array, x, [sigma])', args: [{ key: 'a', zh: '数组', en: 'array', required: true, desc: '样本区域' },
    { key: 'x', zh: '假设均值', en: 'x', required: true, desc: '原假设总体均值' },
    { key: 'sigma', zh: '标准差', en: 'sigma', required: false, desc: '总体标准差，省略用样本标准差' }] },
  returnValue: '检验 p 值',
  examples: [
    {
      title: '示例：z 检验',
      scene: '数据 1..5、检验值 3、σ=1.5',
      dataAnchor: 'A1',
      dataTsv: '数值\n1\n2\n3\n4\n5',
      formula: '=ZTEST(A2:A6,3,1.5)',
      result: '0.5（p 值）',
      explanation: '样本均值=检验值，z=0，p=0.5。',
    },
    {
      title: '示例：样本均值高于假设值，p 值会小于 0.5',
      scene: '5 天抽检的客单价均值是 12，公司标准写的是 11。要判断「高这一点」是不是偶然，看的就是这个 p 值。',
      dataAnchor: 'A1',
      dataTsv: '日期\t客单价\n周一\t10\n周二\t11\n周三\t12\n周四\t13\n周五\t14',
      formula: '=ZTEST(B2:B6,11,2)',
      result: '约 0.132（p 值）',
      explanation:
        '样本均值 12、总体标准差 2、n=5，z=(12−11)/(2/√5)=1.118，右尾概率约 0.132。p 大于 0.05 说明差异不显著。ZTEST 只算单侧（右尾），想要双侧自己乘 2。',
    },
  ],
  pitfalls: [{ title: '需已知总体标准差', reason: '未知时改用 TTEST 更合适。', fix: 'σ 未知用 t 检验。', level: 'mid' }],
  related: [{ id: 'average', kind: 'companion', why: 'AVERAGE 与本品类相关' },
    { id: 'stdev', kind: 'companion', why: 'STDEV 与本品类相关' },
    { id: 'ttest', kind: 'companion', why: 'TTEST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'a', label: '数值区域', type: 'ref', default: 'A2:A6' },
      { key: 'x', label: '检验值', type: 'number', default: '3' },
      { key: 'sigma', label: '总体标准差', type: 'number', default: '1.5' },
    ],
    template: '=ZTEST({a},{x},{sigma})',
    cases: [
      { label: 'ok 单样本 z', type: 'ok', values: {}, expect: '0.5', note: '均值=检验值，p=0.5。' },
      { label: '非法：σ≤0', type: 'error', values: { sigma: '0' }, expect: '#NUM!', note: 'σ 必须 >0。' },
      { label: '非法：区域无效', type: 'error', values: { a: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
      { label: '非法：区域没有数字', type: 'error', values: { a: 'B2' }, expect: '#DIV/0!', note: 'B 列是空白，样本量 0，算不出 z 统计量。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ztestEntry;
