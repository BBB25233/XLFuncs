import type { FunctionEntry } from '@/types';

/** NETWORKDAYS.INTL · 自定义周末的工作日数（datetime 类 B6 批次） */

const TSV = '起始日\t结束日\n2024-1-1\t2024-1-7';

const networkdaysIntlEntry: FunctionEntry = {
  id: 'networkdays-intl',
  enName: 'NETWORKDAYS.INTL',
  zhName: '取指定周末工作日数',
  zhCommon: ['NETWORKDAYS.INTL', '自定义周末工作日', '国际工作日'],
  alias: ['INTL工作日', '指定休息日工作日'],
  category: 'datetime',
  abbr: 'qzdzmgzrs',
  pinyin: 'quzhidingzhoumogongzuorishu',
  keywords: ['NETWORKDAYS.INTL', '工作日', '自定义周末', '单休', '大小周'],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes:
      'NETWORKDAYS.INTL 和 NETWORKDAYS 一样数工作日，但第二参数能指定「哪几天算周末」：数字代码（1=六日休、2=日休、11=一休…）或 7 位字符串（周一到周日，1=休）。',
  },
  oneLiner: '自定义周末规则下算两日期的工作日数',
  summary:
    '单休、大小周、中东地区周五六休息——标准的 NETWORKDAYS 只认六日，算出来是错的。NETWORKDAYS.INTL 用周末代码或一串 "0000011" 字符串告诉 Excel 哪几天休息，再数工作日。第三参数同样能排除节假日。',
  syntax: {
    patternCn: '=NETWORKDAYS.INTL(开始日, 结束日, 周末代码, [节假日])',
    patternEn: '=NETWORKDAYS.INTL(start_date, end_date, weekend, [holidays])',
    args: [
      {
        key: 'start_date',
        zh: '开始日',
        en: 'start_date',
        required: true,
        desc: '起始真日期（含）。',
        accepts: '日期单元格。',
        ifOmitted: '必填。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'end_date',
        zh: '结束日',
        en: 'end_date',
        required: true,
        desc: '结束真日期（含）。',
        accepts: '日期单元格。',
        ifOmitted: '必填。',
        example: 'B2',
      },
      {
        key: 'weekend',
        zh: '周末代码',
        en: 'weekend',
        required: true,
        desc: '周末规则：1=六日、2=日、11=一、7=五六(中东)…或 7 位串如 "0000011"(六日休)。',
        accepts: '1 / 2 / 11 / 7 … 或 "0000011"。',
        ifOmitted: '必填（这是比 NETWORKDAYS 多出来的一参）。',
        tip: '⚠️ 字符串从「周一」排到「周日」。',
        example: '1',
      },
      {
        key: 'holidays',
        zh: '节假日',
        en: 'holidays',
        required: false,
        desc: '额外排除的节假日区域/数组。',
        accepts: '单元格区域、数组。',
        ifOmitted: '省略只按周末代码排除。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回工作日数（整数）；weekend 非法或日期非法则 #VALUE! / #NUM!。',
  examples: [
    {
      title: '示例 1：默认六日休（等同 NETWORKDAYS）',
      scene: '2024-1-1 到 1-7，周末代码 1。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NETWORKDAYS.INTL(A2,B2,1)',
      result: '5（六日休，周一到周五）',
      explanation: '代码 1 = 周六周日休息，结果和 NETWORKDAYS 一致。',
    },
    {
      title: '示例 2：只休周一',
      scene: '某些排班周一休息，代码 11。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NETWORKDAYS.INTL(A2,B2,11)',
      result: '6（只周一休，周日也上班）',
      explanation: '1/1 周一被排除，其余 6 天都算工作日。',
    },
    {
      title: '示例 3：中东式周五六休（代码 7）',
      scene: '2024-3-15 到 4-15，周五六休息。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NETWORKDAYS.INTL("2024-3-15","2024-4-15",7)',
      result: '23（排除每周五六）',
      explanation: '用数字代码 7 表示周五、周六为周末，自动跳过。',
    },
  ],
  pitfalls: [
    {
      title: '周末字符串顺序搞反',
      reason: '"0000011" 是从周一到周日排列，搞成周日到周一就全错。',
      fix: '记住顺序「一二三四五六日」，对应位 1 表示休息。',
      level: 'high',
    },
    {
      title: '和 NETWORKDAYS 漏了 weekend 参数',
      reason: 'INTL 版多了必填的 weekend 参数，省略会报错。',
      fix: '至少填 1（六日休）才等同 NETWORKDAYS。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '在 Excel 2007 及更早用 I.NTL',
      reason: 'NETWORKDAYS.INTL 是 2010 才加入。',
      fix: '旧版用 NETWORKDAYS 或加载宏。',
      level: 'low',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'networkdays',
      kind: 'companion',
      why: 'NETWORKDAYS 是固定六日休的简化版；INTL 可自定义。',
    },
    {
      id: 'workday-intl',
      kind: 'companion',
      why: 'WORKDAY.INTL 是反向：自定义周末下由天数反推日期。',
    },
    {
      id: 'weekday',
      kind: 'companion',
      why: '先用 WEEKDAY 看清排班里每天是周几，再定周末代码。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'start_date', label: '开始日期', type: 'text', default: '2024-01-01', placeholder: '如 2024-01-01', hint: '区间起点' },
      { key: 'end_date', label: '结束日期', type: 'text', default: '2024-01-31', placeholder: '如 2024-01-31', hint: '区间终点' },
      { key: 'weekend', label: '周末代码（演示版忽略）', type: 'text', default: '1', hint: '本演示版固定按周六+周日计算，忽略该参数' },
      { key: 'holidays', label: '节假日（演示版忽略）', type: 'text', default: '', hint: '本演示版忽略此列表' },
    ],
    template: '=NETWORKDAYS.INTL({start_date},{end_date},{weekend},{holidays})',
    cases: [
      { label: '默认：2024 年 1 月全月工作日', type: 'ok', values: {}, expect: '23', note: '简化按标准周末（六、日）计算，1 月共 23 个工作日' },
      { label: '2024-02-01 到 2024-02-29 → 21', type: 'ok', values: { start_date: '2024-02-01', end_date: '2024-02-29' }, expect: '21', note: '闰年 2 月剩 21 个工作日' },
      { label: '开始日期非法 → #VALUE!', type: 'error', values: { start_date: 'abc' }, expect: '#VALUE!', note: '开始日期不是合法日期' },
      { label: '结束日期月份越界 → #VALUE!', type: 'error', values: { end_date: '2024-13-01' }, expect: '#VALUE!', note: '月份 13 不存在' },
      { label: '结束日期日越界 → #VALUE!', type: 'error', values: { end_date: '2024-02-30' }, expect: '#VALUE!', note: '2024 不是闰年，2 月无 30 日' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default networkdaysIntlEntry;
