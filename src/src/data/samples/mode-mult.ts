import type { FunctionEntry } from '@/types';

/** MODE.MULT · 多个众数（statistical 类 B3 批次） */

const TSV = '数值\n10\n20\n10\n20\n30\n30';

const modeMultEntry: FunctionEntry = {
  id: 'mode-mult',
  enName: 'MODE.MULT',
  zhName: '多个众数',
  zhCommon: ['多个众数', 'MODE.MULT', '并列众数'],
  alias: ['全部众数', '返回多个热门值', '多众数'],
  category: 'statistical',
  abbr: 'dgzs',
  pinyin: 'duogezhongshu',
  keywords: ['MODE.MULT', '多个众数', '并列', '数组公式', '垂直数组'],
  difficulty: 4,
  usageLevel: 10,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: '结果为垂直数组；Microsoft 365 自动溢出，2019 及更早需选中区域后按 Ctrl+Shift+Enter。',
  },
  oneLiner: '把所有并列「出现最多」的值一次性全部返回',
  summary:
    'MODE.SNGL 在多个值并列最多时只给一个，MODE.MULT 则把全部并列值作为**垂直数组**返回。因为结果是数组，用法上有讲究：Microsoft 365 里直接回车会自动溢出；2019 及更早版本必须先选中一列足够高的区域，再按 Ctrl+Shift+Enter 确认，否则只会得到第一个值。',
  syntax: {
    patternCn: '=MODE.MULT(数字1, [数字2], …)',
    patternEn: '=MODE.MULT(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个数字或区域。',
        accepts: '单元格区域、具体数字、数组。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 结果是垂直数组，需要一列区域来接收。',
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
  returnValue: '返回由所有并列众数组成的垂直数组；无重复值时返回 #N/A。',
  examples: [
    {
      title: '示例 1：取回全部并列众数',
      scene: '10、20、30 都出现 2 次，想一次性拿到这三个值。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=MODE.MULT(A2:A7)',
      result: '纵向返回 10 / 20 / 30 三个值',
      explanation:
        '三个值并列最多，全部返回。Microsoft 365 里在目标单元格回车即可自动向下溢出；旧版需先选中 3 个单元格再按 Ctrl+Shift+Enter。',
    },
    {
      title: '示例 2：用 COUNTA 接住结果个数',
      scene: '不确定有几个并列众数，想先知道会返回几个，避免输出区域选大或选小。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COUNTA(MODE.MULT(A2:A7))',
      result: '3（表示有 3 个并列众数）',
      explanation: '用 COUNTA 包一层可以先探明结果个数，再据此选择输出区域大小。',
    },
    {
      title: '示例 3：无重复值时报错',
      scene: '所有数值都不重复，没有众数。',
      dataTsv: '数值\n1\n2\n3',
      dataAnchor: 'A1',
      formula: '=MODE.MULT(A2:A4)',
      result: '#N/A（不存在众数）',
      explanation: '与 MODE.SNGL 一致，数学上无众数时报错，可用 IFERROR 兜底。',
    },
  ],
  pitfalls: [
    {
      title: '只选中一个单元格就回车',
      reason: '结果是数组，只选一格在旧版 Excel 里只显示第一个值，看起来像「漏了」。',
      fix: 'Microsoft 365 会自动溢出；2019 及更早需先选中一列足够高的区域，再按 Ctrl+Shift+Enter。',
      level: 'high',
    },
    {
      title: '输出区域选大了，多出的格子报 #N/A',
      reason: '数组结果比选中的区域短时，剩余单元格会填 #N/A。',
      fix: '先用 COUNTA(MODE.MULT(...)) 探明个数，或直接用 Microsoft 365 的自动溢出。',
      level: 'mid',
      errorCode: '#N/A',
    },
    {
      title: '在 Excel 2007 中使用',
      reason: 'MODE.MULT 是 Excel 2010 才加入的函数。',
      fix: '升级 Excel，或改用「COUNTIF 统计每个值的频次 → 再用 LARGE/IF 取出最高频的值」这套组合。',
      level: 'high',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'mode-sngl',
      kind: 'alternative',
      why: '只要一个众数时用 MODE.SNGL 更简单；需要全部并列值才用 MODE.MULT。',
    },
    {
      id: 'frequency',
      kind: 'alternative',
      why: 'FREQUENCY 能完整给出各值出现次数，比 MODE.MULT 信息更全，也更可控。',
    },
    {
      id: 'counta',
      kind: 'companion',
      why: '用 COUNTA 包住 MODE.MULT 可以先探明返回几个结果。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'A2:A7' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'A2:A7', hint: '数值列（含并列）' },
    ],
    template: '=MODE.MULT({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '10;20;30', note: '10/20/30 均出现 2 次，全部众数（已简化，分号分隔）' },
      { label: '区域非法 B:B', type: 'error', values: { numbers: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { numbers: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
      { label: '区域非法 2:6', type: 'error', values: { numbers: '2:6' }, expect: '#REF!', note: '缺少列标 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default modeMultEntry;
