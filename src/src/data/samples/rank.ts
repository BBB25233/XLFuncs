import type { FunctionEntry } from '@/types';

/** RANK · 排名（compatibility 类 B9 批次） */

const rankEntry: FunctionEntry = {
  id: 'rank',
  enName: 'RANK',
  zhName: '排名',
  zhCommon: ['RANK', '排名'],
  alias: ['名次'],
  category: 'compatibility',
  abbr: 'pm',
  pinyin: 'paiming',
  keywords: ['rank', '排名', '排序'],
  difficulty: 2,
  usageLevel: 6,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算数值在数组中的名次',
  summary: 'RANK 返回某值在数组中的排位（默认降序，并列同名次）。新版请用 RANK.EQ/RANK.AVG。',
  syntax: { patternCn: '=RANK(数值, 区域, [次序])', patternEn: '=RANK(number, ref, [order])', args: [{ key: 'n', zh: '数值', en: 'number', required: true, desc: '要排名的值' },
    { key: 'ref', zh: '区域', en: 'ref', required: true, desc: '参照区域' },
    { key: 'order', zh: '次序', en: 'order', required: false, desc: '0/省略=降序、1=升序' }] },
  returnValue: '名次',
  examples: [
    {
      title: '示例：降序排名',
      scene: '数据 1..5、查 3',
      dataAnchor: 'A1',
      dataTsv: '数值\n1\n2\n3\n4\n5',
      formula: '=RANK(3,A2:A6)',
      result: '3',
      explanation: '3 在降序中排第 3。',
    },
    {
      title: '示例：第三参数写 1，换成「越小越靠前」的升序排名',
      scene: '客服工单的处理时长，越快越好。这时不能按默认降序排，否则最慢的人反而成了第 1 名。',
      dataAnchor: 'A1',
      dataTsv: '姓名\t耗时(分钟)\n张三\t12\n李四\t8\n王五\t15\n赵六\t10\n钱七\t9',
      formula: '=RANK(B2,B2:B6,1)',
      result: '张三 12 分钟 → 第 4 名；李四 8 分钟 → 第 1 名；王五 15 分钟 → 第 5 名',
      explanation:
        '第三参数写 1 是升序，最小值排第 1；省略或写 0 是降序，最大值排第 1。方向搞反，整列名次会整体倒过来。',
    },
  ],
  pitfalls: [{ title: '并列同名次留空', reason: '并列后下一名次会跳过。', fix: '需平均名次用 RANK.AVG。', level: 'low' }],
  related: [{ id: 'percentile', kind: 'companion', why: 'PERCENTILE 与本品类相关' },
    { id: 'quartile', kind: 'companion', why: 'QUARTILE 与本品类相关' },
    { id: 'percentrank', kind: 'companion', why: 'PERCENTRANK 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'n', label: '要排名的值', type: 'number', default: '3' },
      { key: 'ref', label: '数值区域', type: 'ref', default: 'A2:A6' },
      { key: 'order', label: '顺序', type: 'select', options: [{ label: '0（降序）', value: '0' }, { label: '1（升序）', value: '1' }], default: '0' },
    ],
    template: '=RANK({n},{ref},{order})',
    cases: [
      { label: 'ok 降序排名', type: 'ok', values: {}, expect: '3', note: '3 在降序中排第 3。' },
      { label: '非法：值不在区域', type: 'error', values: { n: '99' }, expect: '#N/A', note: '要排名的值不在区域里。' },
      { label: '非法：区域无效', type: 'error', values: { ref: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
      { label: '非法：值填文字', type: 'error', values: { n: 'abc' }, expect: '#VALUE!', note: '要排名的值必须是数字，填文字算不出名次。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default rankEntry;
