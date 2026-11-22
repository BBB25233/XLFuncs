import type { FunctionEntry } from '@/types';

/** DAYS360 · 按 30/360 约定算天数（datetime 类 B6 批次） */

const TSV = '起息日\t到期日\n2024-1-1\t2024-12-31\n2024-1-15\t2024-7-15';

const days360Entry: FunctionEntry = {
  id: 'days360',
  enName: 'DAYS360',
  zhName: '取三十天制天数',
  zhCommon: ['DAYS360', '30/360天数', '计息天数'],
  alias: ['360天制天数', '债券计息天数'],
  category: 'datetime',
  abbr: 'qsstzts',
  pinyin: 'qusanshitianzhitianshu',
  keywords: ['DAYS360', '30/360', '计息天数', '债券'],
  difficulty: 3,
  usageLevel: 15,
  version: {
    min: '2007',
    label: 'Excel 2007 起可用（此前在 Analysis ToolPak 加载宏）',
    notes:
      'DAYS360 按「每月 30 天、每年 360 天」的银行约定算两个日期相差天数，常用于债券利息。每月 31 日当作 30 日处理。可选 method 参数切换美式/欧式。',
  },
  oneLiner: '按 30/360 银行约定算两日期天数',
  summary:
    '算债券利息、贷款计息时，银行不按真实日历，而是「每月 30 天、每年 360 天」。DAYS360 就是这套约定下的天数。它和真实的 DAYS 结果不同（比如整年算 360 天而非 365），金融对账务必用同一套。',
  syntax: {
    patternCn: '=DAYS360(开始日, 结束日, [方法])',
    patternEn: '=DAYS360(start_date, end_date, [method])',
    args: [
      {
        key: 'start_date',
        zh: '开始日',
        en: 'start_date',
        required: true,
        desc: '计息开始的真日期。',
        accepts: '日期单元格、DATE(2024,1,1)。',
        ifOmitted: '必填。',
        tip: '⚠️ 每月 31 日会被当 30 日。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'end_date',
        zh: '结束日',
        en: 'end_date',
        required: true,
        desc: '计息结束的真日期。',
        accepts: '日期单元格。',
        ifOmitted: '必填。',
        example: 'B2',
      },
      {
        key: 'method',
        zh: '方法',
        en: 'method',
        required: false,
        desc: 'FALSE/省略=美式(NASD)，TRUE=欧式。',
        accepts: 'TRUE / FALSE。',
        ifOmitted: '省略按美式(FALSE)。',
        example: 'FALSE',
      },
    ],
  },
  returnValue: '返回整数天数（30/360 约定）；日期非法则 #VALUE!。',
  examples: [
    {
      title: '示例 1：整年按 360 天制算',
      scene: '债券 2024 全年计息天数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DAYS360(A2,B2)',
      result: '360（每月30天：12×30）',
      explanation: '从 1/1 到 12/31，按 US 30/360 约定得 360 天（欧式口径 359），而非真实 365。',
    },
    {
      title: '示例 2：半年计息',
      scene: '1/15 到 7/15 的计息天数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DAYS360(A3,B3)',
      result: '180（6 个月 × 30）',
      explanation: '整齐的半年，正好是 180 天。',
    },
    {
      title: '示例 3：跨季 3 个月',
      scene: '3/15 到 6/15。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DAYS360("2024-3-15","2024-6-15")',
      result: '90（3 个月 × 30）',
      explanation: '每满 30 天一月，3 个月得 90。',
    },
  ],
  pitfalls: [
    {
      title: '和真实 DAYS 结果混用对不上账',
      reason: 'DAYS360 整年算 360 天，DAYS 算 365 天，金融对账必须用同一口径。',
      fix: '利息/债券统一用 DAYS360；日常天数用 DAYS。',
      level: 'high',
    },
    {
      title: '以为 31 日会多算一天',
      reason: '30/360 约定里 31 日当 30 日，不会多算。',
      fix: '记住「31→30」规则；月末相邻日差通常 30 天。',
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
      id: 'days',
      kind: 'companion',
      why: 'DAYS 给真实日历天数；DAYS360 给 30/360 约定天数。',
    },
    {
      id: 'yearfrac',
      kind: 'companion',
      why: 'YEARFRAC 的 basis 0/4 正是基于 30/360 天数。',
    },
    {
      id: 'date',
      kind: 'companion',
      why: 'DATE 拼真日期后交给 DAYS360 计息。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'start_date', label: '开始日', type: 'text', default: '"2024-1-1"' },
      { key: 'end_date', label: '结束日', type: 'text', default: '"2024-12-31"' },
      { key: 'method', label: '方法', type: 'text', default: 'FALSE' },
    ],
    template: '=DAYS360({start_date},{end_date},{method})',
    cases: [
      { label: '全年 30/360 = 359', type: 'ok', values: {}, expect: '360', note: '美式，每月 30 天' },
      { label: '半年 = 180', type: 'ok', values: { start_date: '"2024-1-15"', end_date: '"2024-7-15"' }, expect: '180', note: '6 个月 × 30' },
      { label: '欧式 2/29→3/1 = 2', type: 'ok', values: { start_date: '"2024-2-29"', end_date: '"2024-3-1"', method: 'TRUE' }, expect: '2', note: '欧式月末规则不同' },
      { label: '开始日非法 → #VALUE!', type: 'error', values: { start_date: '"bad"', end_date: '"2024-12-31"' }, expect: '#VALUE!', note: '开始日必须是合法日期' },
      { label: '结束日非法 → #VALUE!', type: 'error', values: { start_date: '"2024-1-1"', end_date: '"bad"' }, expect: '#VALUE!', note: '结束日必须是合法日期' },
      { label: 'method 非法 → #VALUE!', type: 'error', values: { start_date: '"2024-1-1"', end_date: '"2024-12-31"', method: 'MAYBE' }, expect: '#VALUE!', note: 'method 只能是 TRUE/FALSE' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default days360Entry;
