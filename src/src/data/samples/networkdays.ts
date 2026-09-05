import type { FunctionEntry } from '@/types';

/** NETWORKDAYS · 两日期间的工作日数（datetime 类 B6 批次） */

const TSV = '起始日\t结束日\n2024-1-1\t2024-1-7';
const HOL_TSV = '节假日\n2024-3-20';

const networkdaysEntry: FunctionEntry = {
  id: 'networkdays',
  enName: 'NETWORKDAYS',
  zhName: '取工作日数',
  zhCommon: ['NETWORKDAYS', '工作日', '排除周末'],
  alias: ['工作日天数', '去周末天数'],
  category: 'datetime',
  abbr: 'qgzrs',
  pinyin: 'qugongzuorishu',
  keywords: ['NETWORKDAYS', '工作日', '周末', '节假日', '排期'],
  difficulty: 2,
  usageLevel: 40,
  version: {
    min: '2007',
    label: 'Excel 2007 起可用（此前在 Analysis ToolPak 加载宏）',
    notes:
      'NETWORKDAYS 算两个日期之间有几个「工作日」（周一到周五），还能再排除一列节假日。周末固定按周六周日算；要自定义周末用 NETWORKDAYS.INTL。',
  },
  oneLiner: '算两日期之间的工作日天数（自动跳过周末和节假日）',
  summary:
    '排期、算工期、统计出勤，最怕把周末算进去。NETWORKDAYS(开始,结束) 自动只数周一到周五，第三参数还能丢一串节假日进去一起排除。起止日都算在内。要自定义哪天休息（比如周日照常上班）用 NETWORKDAYS.INTL。',
  syntax: {
    patternCn: '=NETWORKDAYS(开始日, 结束日, [节假日])',
    patternEn: '=NETWORKDAYS(start_date, end_date, [holidays])',
    args: [
      {
        key: 'start_date',
        zh: '开始日',
        en: 'start_date',
        required: true,
        desc: '起始真日期（含）。',
        accepts: '日期单元格、DATE(2024,3,15)。',
        ifOmitted: '必填。',
        tip: '⚠️ 起止日都计入工作日。',
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
        key: 'holidays',
        zh: '节假日',
        en: 'holidays',
        required: false,
        desc: '要排除的节假日区域或数组。',
        accepts: '单元格区域如 C2:C5、数组。',
        ifOmitted: '省略只排除周末。',
        example: 'C2:C3',
      },
    ],
  },
  returnValue: '返回工作日数（整数）；日期非法则 #VALUE!。',
  examples: [
    {
      title: '示例 1：一周有几个工作日',
      scene: '算 2024-1-1 到 1-7。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NETWORKDAYS(A2,B2)',
      result: '5（周一到周五）',
      explanation: '1/1 是周一，到 1/7 周日，排除周末剩 5 个工作日。',
    },
    {
      title: '示例 2：月内工作日',
      scene: '3/15 到 3/31 的上班天数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NETWORKDAYS("2024-3-15","2024-3-31")',
      result: '11',
      explanation: '从周五 3/15 到周日 3/31，剔除周末得 11 个工作日。',
    },
    {
      title: '示例 3：跨月并排除节假日',
      scene: '3/15 到 4/15，且 3/20 是假期。',
      dataTsv: HOL_TSV,
      dataAnchor: 'A1',
      formula: '=NETWORKDAYS("2024-3-15","2024-4-15",A2)',
      result: '21（22 个工作日再扣掉 1 个节假日）',
      explanation: '先得 22 个工作日，再减去节假日 3/20 得 21。',
    },
  ],
  pitfalls: [
    {
      title: '忘记节假日被算进去了',
      reason: '不传第三参数就不排除任何节假日，法定假期照算工作日。',
      fix: '把节假日列表作为第三参数传入（区域或数组）。',
      level: 'high',
    },
    {
      title: '自定义周末（如单休）不适用',
      reason: 'NETWORKDAYS 周末固定周六周日，单休/大小周会算错。',
      fix: '改用 NETWORKDAYS.INTL，用周末代码或 7 位字符串自定义。',
      level: 'mid',
    },
    {
      title: '文本日期报 #VALUE!',
      reason: '要真日期。',
      fix: '先 DATEVALUE 化。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'workday',
      kind: 'companion',
      why: 'WORKDAY 是 NETWORKDAYS 的反向：给天数反推日期。',
    },
    {
      id: 'networkdays-intl',
      kind: 'companion',
      why: '要自定义周末用 NETWORKDAYS.INTL。',
    },
    {
      id: 'weekday',
      kind: 'companion',
      why: 'WEEKDAY 判断单天是周几，配合做更细的排班。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'start_date', label: '开始日期', type: 'text', default: '2024-01-01', placeholder: '如 2024-01-01', hint: '区间起点' },
      { key: 'end_date', label: '结束日期', type: 'text', default: '2024-01-31', placeholder: '如 2024-01-31', hint: '区间终点' },
      { key: 'holidays', label: '节假日（演示版忽略）', type: 'text', default: '', hint: '本演示版固定按标准周末计算，忽略此列表' },
    ],
    template: '=NETWORKDAYS({start_date},{end_date},{holidays})',
    cases: [
      { label: '默认：2024 年 1 月全月工作日', type: 'ok', values: {}, expect: '23', note: '1 月 31 天里去掉 8 个周末，剩 23 个工作日' },
      { label: '2024-02-01 到 2024-02-29 → 21', type: 'ok', values: { start_date: '2024-02-01', end_date: '2024-02-29' }, expect: '21', note: '闰年 2 月共 29 天，去掉 8 个周末剩 21 个工作日' },
      { label: '开始日期非法 → #VALUE!', type: 'error', values: { start_date: 'abc' }, expect: '#VALUE!', note: '开始日期不是合法日期' },
      { label: '结束日期月份越界 → #VALUE!', type: 'error', values: { end_date: '2024-13-01' }, expect: '#VALUE!', note: '月份 13 不存在' },
      { label: '结束日期日越界 → #VALUE!', type: 'error', values: { end_date: '2024-02-30' }, expect: '#VALUE!', note: '2024 不是闰年，2 月无 30 日' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default networkdaysEntry;
