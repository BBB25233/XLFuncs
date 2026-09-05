import type { FunctionEntry } from '@/types';

/** YEARFRAC · 取两日期之间的年化比例（datetime 类 B6 批次） */

const TSV = '起息日\t到期日\t说明\n2024-1-1\t2024-12-31\t持有整年\n2024-6-15\t2025-6-15\t跨年投资期';

const yearfracEntry: FunctionEntry = {
  id: 'yearfrac',
  enName: 'YEARFRAC',
  zhName: '取年化比例',
  zhCommon: ['YEARFRAC', '年化', '年分数'],
  alias: ['年化比例', '占全年比例', '年份小数'],
  category: 'datetime',
  abbr: 'qnhbl',
  pinyin: 'qunianhuabili',
  keywords: ['YEARFRAC', '年化', '年份比例', '持有期', '计息天数'],
  difficulty: 3,
  usageLevel: 20,
  version: {
    min: '2007',
    label: 'Excel 2007 起可用（此前在 Analysis ToolPak 加载宏）',
    notes:
      'YEARFRAC 告诉我们「一段日期占了多少年」，常用于算利息、折旧、按年分摊。第三参数 basis 决定一年按多少天算：0=美式30/360，1=实际/实际，2=实际/360，3=实际/365，4=欧式30/360。basis 不同，同一段日期算出来的年数会略有差异。',
  },
  oneLiner: '返回两个日期之间占全年比例（带计息基准）',
  summary:
    '算「这笔钱持有了多久（按年算）」时，YEARFRAC 比直接相减天数更专业——它考虑了闰年、计息基准。比如债券利息、会员按年分摊费、项目跨年折旧都会用到。basis 选错会导致利息差一点，金融场景务必确认对方用哪种基准。',
  syntax: {
    patternCn: '=YEARFRAC(开始日, 结束日, [基准])',
    patternEn: '=YEARFRAC(start_date, end_date, [basis])',
    args: [
      {
        key: 'start_date',
        zh: '开始日',
        en: 'start_date',
        required: true,
        desc: '计息/起始的真日期。',
        accepts: '日期单元格、DATE(2024,1,1)。',
        ifOmitted: '必填。',
        tip: '⚠️ 文本日期先 DATEVALUE 化。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'end_date',
        zh: '结束日',
        en: 'end_date',
        required: true,
        desc: '结束的真日期。',
        accepts: '日期单元格。',
        ifOmitted: '必填。',
        example: 'B2',
      },
      {
        key: 'basis',
        zh: '基准',
        en: 'basis',
        required: false,
        desc: '计息基准：0=30/360(美)，1=实际/实际，2=实际/360，3=实际/365，4=30/360(欧)。',
        accepts: '0 / 1 / 2 / 3 / 4。',
        ifOmitted: '省略按 0（美式 30/360）处理。',
        tip: '金融报利息时务必和对方对齐 basis。',
        example: '1',
      },
    ],
  },
  returnValue: '返回小数（占全年比例）；日期非法或 basis 不在 0–4 则 #VALUE! / #NUM!。',
  examples: [
    {
      title: '示例 1：持有整年占多少年（实际/实际）',
      scene: '一笔 2024 全年持有的投资，想按年算比例。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=YEARFRAC(A2,B2,1)',
      result: '0.9973（basis 1 实际/实际，2024 闰年 366 天）',
      explanation: '1 月 1 日到 12 月 31 日按实际天数占 366 天，得 0.9973。',
    },
    {
      title: '示例 2：换基准直接得 1.0',
      scene: '同一整年，用实际/365 基准看结果。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=YEARFRAC(A2,B2,3)',
      result: '1.0000（basis 3 实际/365，整年即 1.0）',
      explanation: 'basis 3 把一年固定当 365 天，整年刚好 1.0；basis 不同小数会略有出入。',
    },
    {
      title: '示例 3：跨年投资持有期',
      scene: '2024-6-15 买入、2025-6-15 卖出，算持有年数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=YEARFRAC(A3,B3,1)',
      result: '0.9985（basis 1，跨年实际天数占比）',
      explanation: '跨年时段按每年实际天数分摊，得到接近 1 的比例。',
    },
  ],
  pitfalls: [
    {
      title: 'basis 没和对方对齐导致利息算错',
      reason: 'basis 0/1/3 对同段日期给出不同年数（如整年 0.9972 / 0.9973 / 1.0000），混用就差一点。',
      fix: '合同或报表先约定 basis；金融用 1（实际/实际）或 3（实际/365）最常见。',
      level: 'high',
    },
    {
      title: '文本日期直接喂 YEARFRAC 报 #VALUE!',
      reason: '要真日期，文本 "2024-1-1" 不是。',
      fix: '先 DATEVALUE(A2)；或引用真日期单元格。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '以为 YEARFRAC 返回天数',
      reason: '它返回「年」的小数（0.5≈半年），不是天数。',
      fix: '要天数用 DAYS；要年数才用 YEARFRAC。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'days',
      kind: 'companion',
      why: 'DAYS 直接给相差天数；YEARFRAC 把天数换算成「年」的比例。',
    },
    {
      id: 'date',
      kind: 'companion',
      why: 'DATE 拼真日期后交给 YEARFRAC 计算持有年数。',
    },
    {
      id: 'days360',
      kind: 'companion',
      why: 'DAYS360 按 30/360 约定算天数，对应 YEARFRAC 的 basis 0/4。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'start_date', label: '开始日期', type: 'text', default: '2024-01-01', placeholder: '如 2024-01-01', hint: '区间起点' },
      { key: 'end_date', label: '结束日期', type: 'text', default: '2025-01-01', placeholder: '如 2025-01-01', hint: '区间终点' },
      { key: 'basis', label: '计息基准', type: 'select', default: '0', options: [ { value: '0', label: '0（美式 30/360）' }, { value: '1', label: '1（实际/实际）' }, { value: '2', label: '2（实际/360）' }, { value: '3', label: '3（实际/365）' }, { value: '4', label: '4（欧式 30/360）' } ] },
    ],
    template: '=YEARFRAC({start_date},{end_date},{basis})',
    cases: [
      { label: '默认：2024 全年（basis 0）→ 1', type: 'ok', values: {}, expect: '1', note: 'basis 0 用 30/360，整年恰好 360/360 = 1' },
      { label: '2024-01-01 到 2024-07-01（basis 1）→ 0.497268', type: 'ok', values: { start_date: '2024-01-01', end_date: '2024-07-01', basis: '1' }, expect: '0.497268', note: '实际/实际：182 天 ÷ 闰年 366 天' },
      { label: '2024 全年（basis 3）→ 1.00274', type: 'ok', values: { start_date: '2024-01-01', end_date: '2025-01-01', basis: '3' }, expect: '1.00274', note: '实际/365：366 天 ÷ 365 ≈ 1.00274' },
      { label: '开始日期非法 → #VALUE!', type: 'error', values: { start_date: '2024-13-45' }, expect: '#VALUE!', note: '开始日期不合法' },
      { label: 'basis=5 → #NUM!', type: 'error', values: { basis: '5' }, expect: '#NUM!', note: 'basis 仅支持 0-4' },
      { label: 'basis 文本 → #VALUE!', type: 'error', values: { basis: 'abc' }, expect: '#VALUE!', note: 'basis 必须是数字' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default yearfracEntry;
