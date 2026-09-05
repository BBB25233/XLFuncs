import type { FunctionEntry } from '@/types';

/** COUNTBLANK · 空单元格计数（statistical 类 B3 批次） */

const TSV = '姓名\t电话\t备注\n张三\t13800000001\t\n李四\t\t\n王五\t13900000002\t已回访';

const countblankEntry: FunctionEntry = {
  id: 'countblank',
  enName: 'COUNTBLANK',
  zhName: '空单元格计数',
  zhCommon: ['空格子计数', 'COUNTBLANK', '数空白'],
  alias: ['有多少个没填', '空白数量', '漏填统计'],
  category: 'statistical',
  abbr: 'kdygjs',
  pinyin: 'kongdanyuangejishu',
  keywords: ['COUNTBLANK', '空单元格', '漏填', '未填写', '空白统计', '数据完整性'],
  difficulty: 1,
  usageLevel: 42,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '数一数区域里有多少个完全是空的格子',
  summary:
    '做数据完整性检查时的第一选择：哪几列漏填最多、登记表有没有填全。它只认「彻底空白」的单元格——注意**空文本 "" 不算空**：如果某个格子是公式算出来的空字符串（=IF(...,"",...)），COUNTBLANK 会认为它不是空的。这常常导致「明明看起来是空的，却数不出来」，排查时很花时间。',
  syntax: {
    patternCn: '=COUNTBLANK(区域)',
    patternEn: '=COUNTBLANK(range)',
    args: [
      {
        key: 'range',
        zh: '区域',
        en: 'range',
        required: true,
        desc: '要统计空白个数的单元格区域。',
        accepts: '单元格区域，如 B2:B10；也可以是多个不连续区域。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 只统计「真空」；公式返回的空文本 "" 不被计入。',
        example: 'B2:B10',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回区域内完全空白的单元格个数。',
  examples: [
    {
      title: '示例 1：统计电话列漏填了几个人',
      scene: '收集上来的登记表，要检查联系方式填全没有。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COUNTBLANK(B2:B4)',
      result: '1（李四的电话没填）',
      explanation: '直接数出电话列的空白数，配合 COUNTA 就能算出「填写率」。',
    },
    {
      title: '示例 2：配合 COUNTA 算填写率',
      scene: '想汇报「联系方式填写率 66.7%」这样的指标。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COUNTA(B2:B4)/(COUNTA(B2:B4)+COUNTBLANK(B2:B4))',
      result: '2 ÷ 3 = 66.7%',
      explanation: '已填数 ÷（已填数 + 空白数）。这是做数据质量看板的常用组合。',
    },
    {
      title: '示例 3：公式产生的空文本 "" 不被计入',
      scene: '单元格看着是空的，但 COUNTBLANK 数出来是 0。',
      dataTsv: '姓名\t结果\n张三\t\n李四\t=IF(A2="x","","有值")',
      dataAnchor: 'A1',
      formula: '=COUNTBLANK(B2:B3)',
      result: '1（只数出真正空白的 B2，公式返回 "" 的 B3 不算空）',
      explanation:
        '这是最常见的困扰：公式输出的空字符串在 COUNTBLANK 眼里「有内容」。要一并统计，改用 =SUMPRODUCT(--(B2:B3=""))。',
    },
  ],
  pitfalls: [
    {
      title: '公式返回的空文本 "" 被当成「有内容」',
      reason:
        'COUNTBLANK 只识别真空单元格；=IF(...,"",...) 这类公式产出的空字符串属于文本，不算空。于是「看起来空」却数不出来。',
      fix: '要连同公式空值一起统计，改用 =SUMPRODUCT(--(区域=""))，或用 =COUNTIF(区域,"")。',
      level: 'high',
    },
    {
      title: '含空格的单元格被当成「已填」',
      reason: '不小心敲了一个空格，视觉上是空的，实际内容是空格字符。',
      fix: '先用 TRIM 清理，或统计时用 =SUMPRODUCT(--(TRIM(区域)=""))。',
      level: 'mid',
    },
    {
      title: '把 COUNTBLANK 和 COUNT/COUNTA 的分母搞混',
      reason: 'COUNT 只数数字、COUNTA 数所有非空、COUNTBLANK 数空白，三者加起来才等于区域总格数。',
      fix: '区域总格数 = COUNTA + COUNTBLANK；不要拿 COUNT + COUNTBLANK 当总数（会漏掉文本）。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'counta',
      kind: 'companion',
      why: 'COUNTA 数非空、COUNTBLANK 数空白，两者相加等于区域总格数，常配对算填写率。',
    },
    {
      id: 'count',
      kind: 'confusable',
      why: 'COUNT 只数数字，不数空白也不数文本；别拿它来做漏填检查。',
    },
    {
      id: 'isblank',
      kind: 'companion',
      why: 'ISBLANK 逐格判断是否为空（同样不认公式空文本），适合定位具体哪几行漏填。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'B2:B4' },
    fields: [
      { key: 'range', label: '区域', type: 'ref', default: 'B2:B4', hint: '电话列，含一处空白' },
    ],
    template: '=COUNTBLANK({range})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '1', note: '电话列只有李四一处空白' },
      { label: '区域非法 B:B', type: 'error', values: { range: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { range: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
      { label: '区域非法 2:6', type: 'error', values: { range: '2:6' }, expect: '#REF!', note: '缺少列标 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default countblankEntry;
