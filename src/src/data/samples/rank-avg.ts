import type { FunctionEntry } from '@/types';

/** RANK.AVG · 排名（并列取平均名次）（statistical 类 B3 批次） */

const TSV = '姓名\t成绩\n张三\t85\n李四\t95\n王五\t85\n赵六\t70';

const rankAvgEntry: FunctionEntry = {
  id: 'rank-avg',
  enName: 'RANK.AVG',
  zhName: '排名并列均值',
  zhCommon: ['RANK.AVG', '平均名次', '排名'],
  alias: ['并列取平均', '2.5名', '统计排名'],
  category: 'statistical',
  abbr: 'pmbljz',
  pinyin: 'paimingbingliejunzhi',
  keywords: ['RANK.AVG', '平均名次', '并列排名', '统计排名', '2.5'],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: '并列时返回平均名次；若需要整数名次请用 RANK.EQ。',
  },
  oneLiner: '排名，但并列时取这几个名次的平均值',
  summary:
    '与 RANK.EQ 的唯一区别就在并列处理：RANK.EQ 给并列者同一个靠前名次（两个并列第 2，下一个是第 4），RANK.AVG 则给并列者这些名次的平均值（两个并列第 2、3 名，就都算 2.5）。AVG 的结果可能是小数，适合做统计检验、百分位换算；日常发成绩单、做排行榜一般还是用 RANK.EQ 的整数名次。',
  syntax: {
    patternCn: '=RANK.AVG(要排名的数, 参照区域, [排序方式])',
    patternEn: '=RANK.AVG(number, ref, [order])',
    args: [
      {
        key: 'number',
        zh: '要排名的数',
        en: 'number',
        required: true,
        desc: '想知道它排第几的数值。',
        accepts: '单元格引用、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '通常引用同行单元格方便下拉。',
        example: 'B2',
        pitfallRank: 2,
      },
      {
        key: 'ref',
        zh: '参照区域',
        en: 'ref',
        required: true,
        desc: '参与排名的整组数据。',
        accepts: '单元格区域，如 B2:B5。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 下拉时必须锁成绝对引用 $B$2:$B$5。',
        example: '$B$2:$B$5',
        pitfallRank: 1,
      },
      {
        key: 'order',
        zh: '排序方式',
        en: 'order',
        required: false,
        desc: '0 或省略 = 降序；1 = 升序。',
        accepts: '0 / 1，或省略。',
        ifOmitted: '省略时按降序排名。',
        tip: '越小越好的指标（用时、成本）要写 1。',
        example: '1',
      },
    ],
  },
  returnValue: '返回排名；并列时返回这些名次的平均值（可能为小数）；数值不在区域内返回 #N/A。',
  examples: [
    {
      title: '示例 1：并列成绩取平均名次',
      scene: '两人都是 85 分，各占第 2、3 名，用平均名次表示。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RANK.AVG(B2,$B$2:$B$5)',
      result: '张三 → 2.5；李四 → 1；王五 → 2.5；赵六 → 4',
      explanation: '85 分的两人并列占据第 2、3 名，取平均得 2.5，符合统计口径。',
    },
    {
      title: '示例 2：与 RANK.EQ 对比',
      scene: '同一份数据，看看两种排名差在哪。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RANK.EQ(B2,$B$2:$B$5)',
      result: '张三 → 2（EQ 取靠前名次）',
      explanation:
        'EQ 给 2、AVG 给 2.5。做排行榜/发奖用 EQ（整数好读），做统计检验用 AVG（口径严谨）。',
    },
    {
      title: '示例 3：升序排名（越小越靠前）',
      scene: '按投诉次数排名，次数越少越好。',
      dataTsv: '门店\t投诉次数\nA店\t3\nB店\t1\nC店\t5\nD店\t1',
      dataAnchor: 'A1',
      formula: '=RANK.AVG(B2,$B$2:$B$5,1)',
      result: 'A店 → 3；B店 → 1.5；C店 → 4；D店 → 1.5',
      explanation: '两家都是 1 次投诉，并列第 1、2 名，取平均 1.5。第三参数 1 表示升序。',
    },
  ],
  pitfalls: [
    {
      title: '拿到 2.5 这种小数名次以为是算错',
      reason: 'AVG 的设计就是取平均名次，小数是正常输出。',
      fix: '要整数名次改用 RANK.EQ；或在外层套 ROUND 取整（注意这会改变统计含义）。',
      level: 'high',
    },
    {
      title: '下拉时参照区域没锁绝对引用',
      reason: '区域随公式下移，排名基准变化，结果全乱。',
      fix: '写成 $B$2:$B$5 再下拉。',
      level: 'high',
    },
    {
      title: '越小越好的指标忘了写第三参数 1',
      reason: '默认降序会把最大值排第 1。',
      fix: '用时、成本、投诉数这类指标，第三参数必须写 1。',
      level: 'high',
    },
    {
      title: '要排名的数不在区域内',
      reason: '函数需要在 ref 中找到该值。',
      fix: '确认 number 在 ref 内；注意浮点误差可能造成微小不匹配。',
      level: 'mid',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'rank-eq',
      kind: 'confusable',
      why: '两者参数完全一致，只在并列处理上不同：EQ 取靠前名次（整数），AVG 取平均名次（可能小数）。',
    },
    {
      id: 'percentile-inc',
      kind: 'alternative',
      why: '想知道「超过百分之多少的人」用百分位数，比绝对名次更适合不同规模群体之间比较。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: 'RANK.AVG 的并列名次本质上就是取这几个名次的平均值。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { ref: 'B2:B5' },
    fields: [
      { key: 'number', label: '要排名的数', type: 'number', default: '85' },
      { key: 'ref', label: '参照区域', type: 'ref', default: 'B2:B5' },
      { key: 'order', label: '排序方式', type: 'select', default: '0', options: [{ label: '降序(0)', value: '0' }, { label: '升序(1)', value: '1' }] },
    ],
    template: '=RANK.AVG({number},{ref},{order})',
    cases: [
      { label: '85 降序平均名次', type: 'ok', values: { number: '85', ref: 'B2:B5', order: '0' }, expect: '2.5', note: '并列平均' },
      { label: '95 第1', type: 'ok', values: { number: '95', ref: 'B2:B5', order: '0' }, expect: '1', note: '最高分第1' },
      { label: '目标不在区域内', type: 'error', values: { number: '999', ref: 'B2:B5', order: '0' }, expect: '#N/A', note: '找不到' },
      { label: 'number 非数字', type: 'error', values: { number: 'abc', ref: 'B2:B5', order: '0' }, expect: '#VALUE!', note: 'number 必须数字' },
      { label: '区域非法2', type: 'error', values: { number: '85', ref: '###', order: '0' }, expect: '#REF!', note: '非法区域' },
      { label: '区域非法', type: 'error', values: { number: '85', ref: 'ZZZ', order: '0' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default rankAvgEntry;
