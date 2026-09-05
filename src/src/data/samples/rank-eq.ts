import type { FunctionEntry } from '@/types';

/** RANK.EQ · 排名（并列同名次）（statistical 类 B3 批次） */

const TSV = '姓名\t成绩\n张三\t85\n李四\t95\n王五\t85\n赵六\t70';

const rankEqEntry: FunctionEntry = {
  id: 'rank-eq',
  enName: 'RANK.EQ',
  zhName: '排名并列同名',
  zhCommon: ['排名', 'RANK.EQ', '第几名'],
  alias: ['名次', '并列排名', '降序排名'],
  category: 'statistical',
  abbr: 'pmbltm',
  pinyin: 'paimingbinglietongming',
  keywords: ['RANK.EQ', '排名', '名次', '并列', '降序', 'order'],
  difficulty: 3,
  usageLevel: 45,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 RANK（新版保留为兼容性函数）。',
  },
  oneLiner: '算出某个值在一组数里排第几（并列时都取靠前的名次）',
  summary:
    'RANK.EQ 默认按**降序**排名（数值越大名次越靠前，最大的排第 1）。并列时所有人都拿到同一个（靠前的）名次，并且会**跳号**：两个并列第 2，下一个是第 4，没有第 3。若希望并列者取平均名次（两个并列第 2 就都算 2.5），改用 RANK.AVG。想按升序排（越小越靠前）把第三参数设为 1。',
  syntax: {
    patternCn: '=RANK.EQ(要排名的数, 参照区域, [排序方式])',
    patternEn: '=RANK.EQ(number, ref, [order])',
    args: [
      {
        key: 'number',
        zh: '要排名的数',
        en: 'number',
        required: true,
        desc: '想知道它排第几的那个数值。',
        accepts: '单元格引用、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '通常引用同一行的单元格，方便下拉填充。',
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
        tip: '⚠️ 下拉时必须用绝对引用 $B$2:$B$5 锁住，否则区域会跟着移动。',
        example: '$B$2:$B$5',
        pitfallRank: 1,
      },
      {
        key: 'order',
        zh: '排序方式',
        en: 'order',
        required: false,
        desc: '0 或省略 = 降序（大者靠前）；1 = 升序（小者靠前）。',
        accepts: '0 / 1，或省略。',
        ifOmitted: '省略时按降序排名（默认）。',
        tip: '算「耗时最短」这类越小越好的排行时，一定要写 1。',
        example: '1',
      },
    ],
  },
  returnValue: '返回该数值的排名（正整数）；并列时返回相同名次并跳号；数值不在区域内返回 #N/A。',
  examples: [
    {
      title: '示例 1：成绩降序排名（并列同名次）',
      scene: '给全班成绩排名，分数相同的要拿同名次。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RANK.EQ(B2,$B$2:$B$5)',
      result: '张三 85 → 2；李四 95 → 1；王五 85 → 2；赵六 70 → 4',
      explanation:
        '张三和王五都是 85 分，并列第 2；注意接下来是第 4 名而不是第 3——名次会跳号。',
    },
    {
      title: '示例 2：升序排名（越小越靠前）',
      scene: '跑步用时排名，用时越短名次越靠前。',
      dataTsv: '姓名\t用时(秒)\n甲\t13.2\n乙\t12.5\n丙\t14.0',
      dataAnchor: 'A1',
      formula: '=RANK.EQ(B2,$B$2:$B$4,1)',
      result: '甲 13.2 → 2；乙 12.5 → 1；丙 14.0 → 3',
      explanation: '第三参数写 1 表示升序，用时最短的乙排第 1。忘了写 1 就会把最慢的排成第 1。',
    },
    {
      title: '示例 3：并列时与 RANK.AVG 的差别',
      scene: '同样是 85 分并列，两种函数给出的名次不同。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RANK.AVG(B2,$B$2:$B$5)',
      result: '张三 → 2.5（85 分两人并列第 2、3 名，取平均 2.5）',
      explanation:
        'EQ 取靠前名次（2），AVG 取平均名次（2.5）。做成绩排名通常用 EQ，做统计分位数时用 AVG。',
    },
  ],
  pitfalls: [
    {
      title: '下拉时参照区域没加绝对引用',
      reason: '区域会随公式一起下移，导致每个人都在跟不同的范围比较，排名全乱。',
      fix: '写成 $B$2:$B$5（或按 F4 切到绝对引用）后再下拉。',
      level: 'high',
    },
    {
      title: '「越小越好」的场景忘了写第三参数 1',
      reason: '默认是降序，会把耗时最长、成本最高的排成第 1 名，结果完全相反。',
      fix: '凡是越小越好的指标（用时、成本、错误数），第三参数必须写 1。',
      level: 'high',
    },
    {
      title: '并列导致名次跳号，被误认为算错',
      reason: '两个并列第 2 之后直接是第 4，中间没有第 3，这是 EQ 的设计而非错误。',
      fix: '这是正常现象。若需要连续名次（1、2、3 不跳号），需改用 SUMPRODUCT/COUNTIF 组合自定义排名。',
      level: 'mid',
    },
    {
      title: '要排名的数不在参照区域内',
      reason: 'RANK.EQ 要求该数能在 ref 中找到对应值。',
      fix: '确认 number 单元格在 ref 范围内，或检查是否有浮点精度造成的微小差异。',
      level: 'mid',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'rank-avg',
      kind: 'confusable',
      why: '并列时 EQ 取靠前名次、AVG 取平均名次，两者结果不同，选错会让名次对不上。',
    },
    {
      id: 'large',
      kind: 'alternative',
      why: 'LARGE 是「已知名次求值」，RANK.EQ 是「已知值求名次」，方向相反、常配合使用。',
    },
    {
      id: 'percentile-inc',
      kind: 'companion',
      why: '想知道「排在前百分之多少」时用百分位数，比绝对名次更适合跨规模比较。',
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
    template: '=RANK.EQ({number},{ref},{order})',
    cases: [
      { label: '85 降序并列', type: 'ok', values: { number: '85', ref: 'B2:B5', order: '0' }, expect: '2', note: '并列取靠前名次' },
      { label: '95 第1', type: 'ok', values: { number: '95', ref: 'B2:B5', order: '0' }, expect: '1', note: '最高分第1' },
      { label: '目标不在区域内', type: 'error', values: { number: '999', ref: 'B2:B5', order: '0' }, expect: '#N/A', note: '找不到' },
      { label: 'number 非数字', type: 'error', values: { number: 'abc', ref: 'B2:B5', order: '0' }, expect: '#VALUE!', note: 'number 必须数字' },
      { label: '区域非法2', type: 'error', values: { number: '85', ref: '###', order: '0' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default rankEqEntry;
