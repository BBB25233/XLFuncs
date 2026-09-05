import type { FunctionEntry } from '@/types';

/** MODE.SNGL · 众数（statistical 类 B3 批次） */

const TSV = '尺码\t编码\nM\t2\nL\t3\nL\t3\nS\t1\nL\t3\nM\t2';

const modeSnglEntry: FunctionEntry = {
  id: 'mode-sngl',
  enName: 'MODE.SNGL',
  zhName: '众数',
  zhCommon: ['众数', '出现最多', 'MODE'],
  alias: ['最常出现的值', '频数最高', '热门值'],
  category: 'statistical',
  abbr: 'zs',
  pinyin: 'zhongshu',
  keywords: ['MODE.SNGL', '众数', '出现次数最多', '热门尺码', '频数最高'],
  difficulty: 2,
  usageLevel: 30,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 MODE（新版中仍保留为兼容性函数）。',
  },
  oneLiner: '找出一组数据里出现次数最多的那个值',
  summary:
    '众数 = 出现频率最高的值，特别适合「非数值」的统计场景：卖得最好的尺码、最常被选的选项、投诉最多的问题类型。它对数字同样有效，但要注意：如果所有值都只出现一次，它会报 #N/A（因为没有众数）；如果有多个值并列最多，它只返回最先遇到的那个——想拿到全部并列值要用 MODE.MULT。',
  syntax: {
    patternCn: '=MODE.SNGL(数字1, [数字2], …)',
    patternEn: '=MODE.SNGL(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个数字或区域。',
        accepts: '单元格区域、具体数字、数组。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 文本区域不适用——MODE.SNGL 只处理数字。',
        example: 'A2:A7',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '数字2',
        en: 'number2',
        required: false,
        desc: '后续数字或区域，可继续追加。',
        accepts: '同「数字1」。',
        ifOmitted: '不写就只用第一个参数。',
        tip: '可一直追加。',
        example: 'B2:B7',
      },
    ],
  },
  returnValue: '返回出现次数最多的值；若所有值只出现一次（无众数）返回 #N/A。',
  examples: [
    {
      title: '示例 1：找出卖得最好的尺码（需先编码）',
      scene: '订单表里的尺码是文本，MODE.SNGL 只认数字，需先把文本映射成编码再求众数。',
      dataTsv: '尺码\t编码\nS\t1\nM\t2\nL\t3\nL\t3\nM\t2\nL\t3',
      dataAnchor: 'A1',
      formula: '=MODE.SNGL(B2:B7)',
      result: '3（即 L 码出现 3 次，是最热门尺码）',
      explanation:
        '先用编码列把文本转成数字，MODE.SNGL 求出编码 3，再对照映射表还原成「L 码」。这是处理文本型众数的标准做法。',
    },
    {
      title: '示例 2：并列最多时只返回一个',
      scene: '两个值并列出现最多，函数只给了一个结果。',
      dataTsv: '数值\n10\n20\n10\n20\n30',
      dataAnchor: 'A1',
      formula: '=MODE.SNGL(A2:A6)',
      result: '10（10 和 20 都出现 2 次，只返回先遇到的 10）',
      explanation:
        'SNGL = single，只给单个结果。想拿到全部并列众数，必须改用 MODE.MULT（数组公式）。',
    },
    {
      title: '示例 3：没有重复值时报 #N/A',
      scene: '一组数据各不相同，公式报错。',
      dataTsv: '数值\n1\n2\n3\n4',
      dataAnchor: 'A1',
      formula: '=MODE.SNGL(A2:A5)',
      result: '#N/A（每个值都只出现一次，不存在众数）',
      explanation: '这不是公式写错，而是数学上「没有众数」。可用 IFERROR 包一层给出友好提示。',
    },
  ],
  pitfalls: [
    {
      title: '直接对文本区域求众数',
      reason: 'MODE.SNGL 只接受数字，文本区域会报 #N/A，即使那些文本明显有「出现最多」的。',
      fix: '先把文本映射成数字编码（如 S=1/M=2/L=3）再求众数；或用 COUNTIF 统计每类出现次数后取最大。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '以为它能返回所有并列众数',
      reason: 'SNGL 版本只返回一个值，并列时静默取其中一个，容易让人误以为那就是唯一答案。',
      fix: '需要全部并列众数时改用 MODE.MULT。',
      level: 'high',
    },
    {
      title: '所有值都不重复时报 #N/A',
      reason: '数学上不存在众数。',
      fix: '用 IFERROR 兜底：=IFERROR(MODE.SNGL(区域),"无重复值")。',
      level: 'mid',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'mode-mult',
      kind: 'alternative',
      why: '需要返回全部并列的众数时用 MODE.MULT（数组公式，Excel 2010 起）。',
    },
    {
      id: 'median',
      kind: 'companion',
      why: '众数、中位数、平均数是三大集中趋势指标，分析时常常一起看。',
    },
    {
      id: 'frequency',
      kind: 'companion',
      why: 'FREQUENCY 能直接统计各值/各区间出现次数，比众数信息更完整。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'B2:B7' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'B2:B7', hint: '编码列（尺码映射）' },
    ],
    template: '=MODE.SNGL({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '3', note: '编码 3（L 码）出现 3 次，为众数' },
      { label: '区域为纯文本（无数字）', type: 'error', values: { numbers: 'A2:A7' }, expect: '#N/A', note: '尺码列是文本，MODE.SNGL 找不到众数 → #N/A' },
      { label: '区域非法 B:B', type: 'error', values: { numbers: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { numbers: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default modeSnglEntry;
