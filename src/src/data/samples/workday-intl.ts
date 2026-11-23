import type { FunctionEntry } from '@/types';

/** WORKDAY.INTL · 自定义周末下推 N 个工作日（datetime 类 B6 批次） */

const TSV = '起始日\t天数\n2024-3-15\t5\n2024-3-15\t10';

const workdayIntlEntry: FunctionEntry = {
  id: 'workday-intl',
  enName: 'WORKDAY.INTL',
  zhName: '取指定周末工作日后日期',
  zhCommon: ['WORKDAY.INTL', '自定义周末推算', '国际工作日推算'],
  alias: ['INTL工作日推算', '指定休息日推算'],
  category: 'datetime',
  abbr: 'qzdzmgzrhrq',
  pinyin: 'quzhidingzhoumogongzuorihouriqi',
  keywords: ['WORKDAY.INTL', '工作日推算', '自定义周末', '单休'],
  difficulty: 3,
  usageLevel: 16,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes:
      'WORKDAY.INTL 和 WORKDAY 一样往后推工作日，但第二参数指定周末规则（代码或 7 位字符串），适合单休、大小周、中东排班。第三参数可排除节假日。',
  },
  oneLiner: '自定义周末规则下，从某天推 N 个工作日',
  summary:
    '单休、大小周、周日照常上班——标准 WORKDAY 只认六日，推出来的交期是错的。WORKDAY.INTL 用周末代码或 "0000011" 字符串告诉 Excel 哪天休息，再反推日期。这是 WORKDAY 的自定义周末版。',
  syntax: {
    patternCn: '=WORKDAY.INTL(起始日, 天数, 周末代码, [节假日])',
    patternEn: '=WORKDAY.INTL(start_date, days, weekend, [holidays])',
    args: [
      {
        key: 'start_date',
        zh: '起始日',
        en: 'start_date',
        required: true,
        desc: '基准真日期（当天不计入）。',
        accepts: '日期单元格。',
        ifOmitted: '必填。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'days',
        zh: '天数',
        en: 'days',
        required: true,
        desc: '要推的工作日数量，可正可负。',
        accepts: '正整数。',
        ifOmitted: '必填。',
        example: 'B2',
      },
      {
        key: 'weekend',
        zh: '周末代码',
        en: 'weekend',
        required: true,
        desc: '周末规则：1=六日、11=一、7=五六…或 7 位串。',
        accepts: '1 / 11 / 7 … 或 "0000011"。',
        ifOmitted: '必填。',
        tip: '⚠️ 字符串顺序「周一到周日」。',
        example: '1',
      },
      {
        key: 'holidays',
        zh: '节假日',
        en: 'holidays',
        required: false,
        desc: '额外排除的节假日区域/数组。',
        accepts: '单元格区域、数组。',
        ifOmitted: '省略只按周末代码。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回推算出的真日期；weekend 非法则 #VALUE! / #NUM!。',
  examples: [
    {
      title: '示例 1：默认六日休推 5 天',
      scene: '3/15 起推 5 个工作日（代码 1）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WORKDAY.INTL(A2,5,1)',
      result: '2024-3-22（与 WORKDAY 一致）',
      explanation: '代码 1 = 六日休，结果等于 WORKDAY(A2,5)。',
    },
    {
      title: '示例 2：只休周一推 5 天',
      scene: '排班周一休，代码 11。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WORKDAY.INTL(A2,5,11)',
      result: '2024-3-21',
      explanation: '3/15 周五起数 5 个工作日（跳过每周一），落到 3/21 周四。',
    },
    {
      title: '示例 3：中东式五六休推 10 天',
      scene: '3/15 起推 10 个工作日（代码 7）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WORKDAY.INTL(A3,10,7)',
      result: '2024-3-27',
      explanation: '代码 7 = 周五周六休，按此跳过再数 10 个工作日。',
    },
  ],
  pitfalls: [
    {
      title: '周末字符串顺序搞反',
      reason: '"0000011" 是周一到周日，写反就休息日全错。',
      fix: '顺序记「一二三四五六日」，1=休息。',
      level: 'high',
    },
    {
      title: '漏了必填的 weekend 参数',
      reason: 'INTL 版比 WORKDAY 多一个 weekend 参数。',
      fix: '至少填 1（六日休）才等同 WORKDAY。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '在 Excel 2007 及更早用 I.NTL',
      reason: 'WORKDAY.INTL 是 2010 才加入。',
      fix: '旧版用 WORKDAY 或加载宏。',
      level: 'low',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'workday',
      kind: 'companion',
      why: 'WORKDAY 是固定六日休版；INTL 可自定义周末。',
    },
    {
      id: 'networkdays-intl',
      kind: 'companion',
      why: 'NETWORKDAYS.INTL 是反向：自定义周末下算工作日数。',
    },
    {
      id: 'weekday',
      kind: 'companion',
      why: '先用 WEEKDAY 看清排班，再定周末代码。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'start_date', label: '开始日期', type: 'text', default: '2024-01-01', placeholder: '如 2024-01-01', hint: '基准日期' },
      { key: 'days', label: '工作日数', type: 'number', default: '10', hint: '要往前/后跳几个工作日（整数）' },
      { key: 'weekend', label: '周末代码（演示版忽略）', type: 'number', default: '1', hint: '本演示版固定按周六+周日计算，忽略该参数' },
      { key: 'holidays', label: '节假日（演示版忽略）', type: 'text', default: '', hint: '本演示版忽略此列表' },
    ],
    template: '=WORKDAY.INTL({start_date},{days},{weekend},{holidays})',
    cases: [
      { label: '默认：从 2024-01-01 往后 10 个工作日', type: 'ok', values: {}, expect: '45306', note: '简化按标准周末（六、日）计算，落到 2024-01-15（序列号 45306）' },
      { label: '2024-02-28 往后 5 个工作日 → 2024-03-06', type: 'ok', values: { start_date: '2024-02-28', days: '5' }, expect: '45357', note: '跨周末到 3 月 6 日（序列号 45357）' },
      { label: '日期非法 → #VALUE!', type: 'error', values: { start_date: '2024-13-45' }, expect: '#VALUE!', note: '开始日期不合法' },
      { label: 'days 小数 → #NUM!', type: 'error', values: { days: '2.5' }, expect: '#NUM!', note: 'days 必须是整数' },
      { label: 'days 文本 → #VALUE!', type: 'error', values: { days: 'abc' }, expect: '#VALUE!', note: 'days 必须是数字' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default workdayIntlEntry;
