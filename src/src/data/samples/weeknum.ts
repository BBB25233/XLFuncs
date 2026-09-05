import type { FunctionEntry } from '@/types';

/** WEEKNUM · 取第几周（datetime 类 B6 批次） */

const TSV = '日期\t事项\n2024-3-15\t项目周报\n2024-6-15\t年中复盘\n2026-8-30\t暑期排期';

const weeknumEntry: FunctionEntry = {
  id: 'weeknum',
  enName: 'WEEKNUM',
  zhName: '取周数',
  zhCommon: ['WEEKNUM', '第几周', '周数'],
  alias: ['年内周序号', '周序号'],
  category: 'datetime',
  abbr: 'qzs',
  pinyin: 'quzhoushu',
  keywords: ['WEEKNUM', '第几周', '周数', '周报', '排期'],
  difficulty: 2,
  usageLevel: 38,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'WEEKNUM 返回日期是当年的第几周；第二参数 return_type 决定一周从哪天起：1 = 周日开头，2 = 周一开头。要和 ISO 标准对齐用 ISOWEEKNUM。',
  },
  oneLiner: '算出某个日期是当年的第几周',
  summary:
    '写周报、做周维度统计时，WEEKNUM 一下告诉你某天属于第几周。默认一周从周日开始（return_type=1）；若按「周一开始」统计填 2。注意它和 ISO 周（ISOWEEKNUM）在年初年末可能差一周。参数是真日期。',
  syntax: {
    patternCn: '=WEEKNUM(日期, [周起始])',
    patternEn: '=WEEKNUM(serial_number, [return_type])',
    args: [
      {
        key: 'serial_number',
        zh: '日期',
        en: 'serial_number',
        required: true,
        desc: '一个真日期（序列号）或日期单元格引用。',
        accepts: '日期单元格、TODAY()、DATE(2024,3,15)。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 文本日期直接喂会报 #VALUE!，先 DATEVALUE 化。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'return_type',
        zh: '周起始',
        en: 'return_type',
        required: false,
        desc: '一周从哪天算起点：1 = 周日开头，2 = 周一开头（其余 11–17 对应不同起点）。',
        accepts: '1 / 2。',
        ifOmitted: '省略按 1（周日开头）处理。',
        tip: '国内常用周一开头，填 2 更符合直觉。',
        example: '2',
      },
    ],
  },
  returnValue: '返回 1–53 的周序号；参数不是日期则 #VALUE!。',
  examples: [
    {
      title: '示例 1：给每行打上周序号',
      scene: '有一批带日期的记录，想按周汇总。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WEEKNUM(A2,2)',
      result: '2024-3-15→11；2024-6-15→24；2026-8-30→36',
      explanation: '用 return_type=2（周一开始），六月那行和周日开头算法差 1 周，体现起点差异。',
    },
    {
      title: '示例 2：周起始方式导致差一周',
      scene: '同一天用两种起点看周数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WEEKNUM(A3,1)&" / "&WEEKNUM(A3,2)',
      result: '2024-6-15 → 25 / 24',
      explanation: '周日开头算第 25 周、周一开头算第 24 周，跨周界时差 1。',
    },
    {
      title: '示例 3：和 ISO 标准对不齐',
      scene: '财务/跨国用 ISO 周，发现和 WEEKNUM 对不上。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ISOWEEKNUM(A2)',
      result: '2024-3-15→11（与 WEEKNUM(,2) 一致，但年初年末可能不同）',
      explanation: 'ISO 周以「含当年第一周四的周」为第 1 周，年末跨年日可能和 WEEKNUM 差 1。',
    },
  ],
  pitfalls: [
    {
      title: '文本日期直接喂 WEEKNUM 报 #VALUE!',
      reason: 'WEEKNUM 要真日期（序列号），文本 "2024-3-15" 不是。',
      fix: '先 DATEVALUE(A2) 或把单元格改成真日期。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '周起始方式选错导致周数差 1',
      reason: '默认周日开头，若团队按周一开始统计却用默认，整年的周序号会偏。',
      fix: '统一用 return_type=2（周一开头）或 ISOWEEKNUM（ISO 标准）。',
      level: 'mid',
    },
    {
      title: '年初/年末跨年日周数对不上 ISO',
      reason: 'WEEKNUM(1) 把 1 月 1 日所在周算第 1 周，ISO 可能把它归为上一年最后一周。',
      fix: '跨国/财务口径用 ISOWEEKNUM 统一。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'isoweeknum',
      kind: 'companion',
      why: 'ISOWEEKNUM 是 ISO 8601 标准周数，跨国/财务口径更稳。',
    },
    {
      id: 'weekday',
      kind: 'companion',
      why: 'WEEKDAY 取「星期几」，WEEKNUM 取「第几周」，配合做周期分析。',
    },
    {
      id: 'today',
      kind: 'companion',
      why: 'TODAY() 给今天，常作为 WEEKNUM 的参数算当前周。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'serial_number', label: '日期', type: 'text', default: '2024-01-01', placeholder: '如 2024-01-01', hint: '要算第几周的日期' },
      { key: 'return_type', label: '返回类型', type: 'select', default: '1', options: [ { value: '1', label: '1（周日起）' }, { value: '2', label: '2（周一起）' } ] },
    ],
    template: '=WEEKNUM({serial_number},{return_type})',
    cases: [
      { label: '默认：2024-01-01 → 第 1 周', type: 'ok', values: {}, expect: '1', note: 'return_type 缺省为 1，含 1 月 1 日的那周是第 1 周' },
      { label: 'return_type=2（周一起）：2024-01-01 → 1', type: 'ok', values: { return_type: '2' }, expect: '1', note: '周一起算时 1 月 1 日周一仍属第 1 周' },
      { label: '2024-03-15（周一起）→ 11', type: 'ok', values: { serial_number: '2024-03-15', return_type: '2' }, expect: '11', note: '3 月中旬落在第 11 周' },
      { label: '日期非法 → #VALUE!', type: 'error', values: { serial_number: '2024-13-45' }, expect: '#VALUE!', note: '月份超出范围' },
      { label: 'return_type=99 → #NUM!', type: 'error', values: { return_type: '99' }, expect: '#NUM!', note: '仅支持 1/2/11-17' },
      { label: 'return_type 文本 → #VALUE!', type: 'error', values: { return_type: 'abc' }, expect: '#VALUE!', note: 'return_type 必须是数字' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default weeknumEntry;
