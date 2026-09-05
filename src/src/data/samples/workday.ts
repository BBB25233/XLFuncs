import type { FunctionEntry } from '@/types';

/** WORKDAY · N 个工作日后的日期（datetime 类 B6 批次） */

const TSV = '起始日\t天数\n2024-3-15\t5\n2024-3-15\t10';

const workdayEntry: FunctionEntry = {
  id: 'workday',
  enName: 'WORKDAY',
  zhName: '取工作日后日期',
  zhCommon: ['WORKDAY', 'N个工作日后', '推算工作日'],
  alias: ['工作日推算', '几工作日后'],
  category: 'datetime',
  abbr: 'qgzrhrq',
  pinyin: 'qugongzuorihouriqi',
  keywords: ['WORKDAY', '工作日推算', '交期', '截止日'],
  difficulty: 2,
  usageLevel: 42,
  version: {
    min: '2007',
    label: 'Excel 2007 起可用（此前在 Analysis ToolPak 加载宏）',
    notes:
      'WORKDAY 从某天往后推 N 个工作日（自动跳过周末），还能排除节假日。工作日不含起始日当天——推 1 天是下一个工作日。要自定义周末用 WORKDAY.INTL。',
  },
  oneLiner: '从某天往后推 N 个工作日，得到交期/截止日',
  summary:
    '「合同签了，5 个工作日发货，哪天到？」WORKDAY(起始日, N) 自动跳过周末给出答案，第三参数还能排除节假日。注意起始日当天不算，推 1 天是紧接着的下一个工作日。自定义休息日用 WORKDAY.INTL。',
  syntax: {
    patternCn: '=WORKDAY(起始日, 天数, [节假日])',
    patternEn: '=WORKDAY(start_date, days, [holidays])',
    args: [
      {
        key: 'start_date',
        zh: '起始日',
        en: 'start_date',
        required: true,
        desc: '基准真日期（当天不计入）。',
        accepts: '日期单元格、DATE(2024,3,15)。',
        ifOmitted: '必填。',
        tip: '⚠️ 起始日当天不算，推 1 天=下一工作日。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'days',
        zh: '天数',
        en: 'days',
        required: true,
        desc: '要往后推的工作日数量，可正可负。',
        accepts: '正整数、单元格。',
        ifOmitted: '必填。',
        example: 'B2',
      },
      {
        key: 'holidays',
        zh: '节假日',
        en: 'holidays',
        required: false,
        desc: '额外排除的节假日区域/数组。',
        accepts: '单元格区域、数组。',
        ifOmitted: '省略只跳过周末。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回推算出的真日期；日期非法或天数非整数则 #VALUE!。',
  examples: [
    {
      title: '示例 1：5 个工作日后是哪天',
      scene: '3/15 起算 5 个工作日。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WORKDAY(A2,5)',
      result: '2024-3-22（跳过周末）',
      explanation: '3/15 周五，往后数 5 个工作日到 3/22 周五。',
    },
    {
      title: '示例 2：10 个工作日后',
      scene: '两周工作量交期。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WORKDAY(A3,10)',
      result: '2024-3-29',
      explanation: '10 个工作日跨过两个周末，落到 3/29。',
    },
    {
      title: '示例 3：推 1 个工作日',
      scene: '签单次日发货。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WORKDAY("2024-3-15",1)',
      result: '2024-3-18（下一个工作日周一）',
      explanation: '起始日 3/15 当天不算，跳过周末得 3/18。',
    },
  ],
  pitfalls: [
    {
      title: '误以为起始日算第 1 个工作日',
      reason: 'WORKDAY 的起始日不计入，推 1 是下一个工作日。',
      fix: '要含当天就把天数 +1，或改用「起始日+天数」直接加。',
      level: 'high',
    },
    {
      title: '忘记排除节假日',
      reason: '不传节假日参数，法定假期照算。',
      fix: '把节假日区域作为第三参数传入。',
      level: 'mid',
    },
    {
      title: '自定义周末不适用',
      reason: 'WORKDAY 周末固定六日。',
      fix: '用 WORKDAY.INTL 自定义周末代码。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'networkdays',
      kind: 'companion',
      why: 'NETWORKDAYS 是反向：给起止日算工作日数。',
    },
    {
      id: 'workday-intl',
      kind: 'companion',
      why: '要自定义周末用 WORKDAY.INTL。',
    },
    {
      id: 'today',
      kind: 'companion',
      why: '以 TODAY() 为起点算「N 个工作日后」的交期。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'start_date', label: '开始日期', type: 'text', default: '2024-01-01', placeholder: '如 2024-01-01', hint: '基准日期' },
      { key: 'days', label: '工作日数', type: 'number', default: '10', hint: '要往前/后跳几个工作日（整数）' },
      { key: 'holidays', label: '节假日（演示版忽略）', type: 'text', default: '', hint: '本演示版固定按标准周末计算，忽略此列表' },
    ],
    template: '=WORKDAY({start_date},{days},{holidays})',
    cases: [
      { label: '默认：从 2024-01-01 往后 10 个工作日', type: 'ok', values: {}, expect: '45306', note: '跳过周六周日，结果落在 2024-01-15（序列号 45306）' },
      { label: '2024-02-28 往后 5 个工作日 → 2024-03-06', type: 'ok', values: { start_date: '2024-02-28', days: '5' }, expect: '45357', note: '2 月 28 日起跳，跨周末到 3 月 6 日（序列号 45357）' },
      { label: '日期非法 → #VALUE!', type: 'error', values: { start_date: '2024-13-45' }, expect: '#VALUE!', note: '开始日期不合法' },
      { label: 'days 小数 → #NUM!', type: 'error', values: { days: '2.5' }, expect: '#NUM!', note: 'days 必须是整数' },
      { label: 'days 文本 → #VALUE!', type: 'error', values: { days: 'abc' }, expect: '#VALUE!', note: 'days 必须是数字' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default workdayEntry;
