import type { FunctionEntry } from '@/types';

/** FREQUENCY · 频数分布（statistical 类 B3 批次） */

const TSV = '分数\n55\n68\n72\n85\n90\n93\n78\n61\n88\n95';

const frequencyEntry: FunctionEntry = {
  id: 'frequency',
  enName: 'FREQUENCY',
  zhName: '频数分布',
  zhCommon: ['频数', '频次分布', 'FREQUENCY'],
  alias: ['分段统计', '区间计数', '直方图数据'],
  category: 'statistical',
  abbr: 'psfb',
  pinyin: 'pinshufenbu',
  keywords: ['FREQUENCY', '频数', '分段统计', '区间计数', '直方图', '分数段'],
  difficulty: 4,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '结果为垂直数组；Microsoft 365 自动溢出，2019 及更早需选中区域后按 Ctrl+Shift+Enter。',
  },
  oneLiner: '一次统计出各分数段/区间分别有多少个数据',
  summary:
    '做成绩分段（60 以下、60–70、70–80…）、年龄分组、金额区间统计时，FREQUENCY 一个公式就能给出全部区间的个数，比写多个 COUNTIFS 简洁得多。它是**数组函数**：先准备一列「分段上限」作为第二参数，结果会比分段数多一行（最后一行是超过最大上限的个数）。Microsoft 365 会自动溢出；旧版需先选中区域再按 Ctrl+Shift+Enter。',
  syntax: {
    patternCn: '=FREQUENCY(数据区域, 分段上限区域)',
    patternEn: '=FREQUENCY(data_array, bins_array)',
    args: [
      {
        key: 'data_array',
        zh: '数据区域',
        en: 'data_array',
        required: true,
        desc: '要统计的一组数值。',
        accepts: '单元格区域，如 A2:A11。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '文本、空格会被忽略。',
        example: 'A2:A11',
        pitfallRank: 2,
      },
      {
        key: 'bins_array',
        zh: '分段上限区域',
        en: 'bins_array',
        required: true,
        desc: '一列升序排列的「区间上限」值。',
        accepts: '一列单元格，如 C2:C4（如 60、80、100）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 必须升序；结果行数 = 分段数 + 1（最后一行是超过最大上限的个数）。',
        example: 'C2:C4',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回垂直数组，依次为各区间内的数据个数（含一个「超过最大上限」的额外区间）。',
  examples: [
    {
      title: '示例 1：成绩分段统计',
      scene: '10 个分数，按 60 以下、60–80、80–100 三段统计人数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FREQUENCY(A2:A11,{60;80;100})',
      result: '2（<60）、4（60–80）、4（80–100）、0（>100）',
      explanation:
        '分段上限 {60;80;100} 把数据切成 ≤60、61–80、81–100、>100 四档。注意结果比分段数多一行。',
    },
    {
      title: '示例 2：用单元格区域做分段上限（便于调整）',
      scene: '把分段阈值放在单元格里，业务调整时只改阈值不改公式。',
      dataTsv: '分数\t上限\n55\t60\n68\t80\n72\t100\n85\t\n90\t\n93\t\n78\t\n61\t\n88\t\n95\t',
      dataAnchor: 'A1',
      formula: '=FREQUENCY(A2:A11,B2:B4)',
      result: '2、4、4、0（同上，但阈值可随时改）',
      explanation: '把阈值写在 B2:B4，公式引用它。以后改分段只需改 B 列，公式不用动。',
    },
    {
      title: '示例 3：输出区域选小了会丢结果',
      scene: '只选中 3 个单元格输出 4 个分段结果。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FREQUENCY(A2:A11,{60;80;100})',
      result: '只显示前 3 个（第 4 个「>100」的结果被截掉）',
      explanation:
        '数组结果行数 = 分段数 + 1，旧版 Excel 输出区域必须选够，否则末尾结果会静默丢失。',
    },
  ],
  pitfalls: [
    {
      title: '忘了结果比分段数多一行',
      reason: '额外的一行是「超过最大分段上限」的个数，即使为 0 也会占一行。',
      fix: '输出区域选「分段数 + 1」行；Microsoft 365 下自动溢出不用担心。',
      level: 'high',
    },
    {
      title: '分段上限没有按升序排列',
      reason: 'FREQUENCY 要求 bins 升序，乱序会得到错误的区间划分。',
      fix: '先把分段上限排序（可用 SORT 或手动排），再传入。',
      level: 'high',
    },
    {
      title: '旧版 Excel 直接回车只得到第一个数',
      reason: '它是数组函数，需按 Ctrl+Shift+Enter 确认。',
      fix: '先选中输出区域，输入公式后按 Ctrl+Shift+Enter；或升级到 Microsoft 365 自动溢出。',
      level: 'high',
    },
    {
      title: '区间边界的理解与直觉不符',
      reason: '分段值是该区间的「上限」（含），即统计 ≤ 该值的个数，不是「下界」。',
      fix: '记住 bins 是上限：{60;80} 得到 ≤60、61–80、>80 三档。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'countifs',
      kind: 'alternative',
      why: '分段较少时可用多个 COUNTIFS 实现，但区间一多就不如 FREQUENCY 简洁。',
    },
    {
      id: 'mode-sngl',
      kind: 'companion',
      why: 'FREQUENCY 能看出哪个区间最集中，比单看众数信息更完整。',
    },
    {
      id: 'percentile-inc',
      kind: 'companion',
      why: '频数分布看区间集中情况，百分位看具体位置，常配合分析。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { data_array: 'A2:A11' },
    fields: [
      { key: 'data_array', label: '数据区域', type: 'ref', default: 'A2:A11', hint: '分数列' },
      { key: 'bins', label: '分段上限', type: 'text', default: '60;80;100', hint: '分号隔开，如 60;80;100' },
    ],
    template: '=FREQUENCY({data_array},{bins})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '1;4;5;0', note: '≤60 / 61–80 / 81–100 / >100 的频数' },
      { label: '分段上限含非数字', type: 'error', values: { bins: '60;abc;100' }, expect: '#VALUE!', note: 'bins 必须都是数字 → #VALUE!' },
      { label: '数据区域非法 B:B', type: 'error', values: { data_array: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '分段上限为空', type: 'error', values: { bins: '' }, expect: '#NUM!', note: 'bins 不能为空 → #NUM!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default frequencyEntry;
