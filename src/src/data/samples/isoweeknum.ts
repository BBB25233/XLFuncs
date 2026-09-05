import type { FunctionEntry } from '@/types';

/** ISOWEEKNUM · 取 ISO 标准周数（datetime 类 B6 批次） */

const TSV = '日期\t事项\n2024-3-15\t项目周报\n2024-12-31\t年末\n2026-8-30\t暑期排期';

const isoweeknumEntry: FunctionEntry = {
  id: 'isoweeknum',
  enName: 'ISOWEEKNUM',
  zhName: '取国际周数',
  zhCommon: ['ISOWEEKNUM', 'ISO周数', '标准周序号'],
  alias: ['ISO周', '国际周序号'],
  category: 'datetime',
  abbr: 'qgjzs',
  pinyin: 'quguojizhoushu',
  keywords: ['ISOWEEKNUM', 'ISO周', '第几周', '国际标准周', '周报'],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes:
      'ISOWEEKNUM 返回符合 ISO 8601 的周序号：每周从周一开始，含当年「第一个周四」的那周为第 1 周。年初几天可能算作上一年第 52/53 周，而年末几天也可能已算作下一年第 1 周（如 2024-12-31 属 2025 年第 1 周）；WEEKNUM 在年初年末会和它对不上。',
  },
  oneLiner: '按 ISO 8601 标准算某天是第几周',
  summary:
    '跨国团队、财务、和欧洲系统对接时，ISO 周才是统一口径：周一为一周之首，含当年第一个周四的周为第 1 周（所以 1 月头几天可能算作上一年的第 52/53 周）。ISOWEEKNUM 直接给这个标准周号，避免和 WEEKNUM 在年初年末对不上。参数是真日期。',
  syntax: {
    patternCn: '=ISOWEEKNUM(日期)',
    patternEn: '=ISOWEEKNUM(date)',
    args: [
      {
        key: 'date',
        zh: '日期',
        en: 'date',
        required: true,
        desc: '一个真日期（序列号）或日期单元格引用。',
        accepts: '日期单元格、TODAY()、DATE(2024,3,15)。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 文本日期直接喂会报 #VALUE!，先 DATEVALUE 化。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 1–53 的 ISO 周序号；参数不是日期则 #VALUE!。',
  examples: [
    {
      title: '示例 1：给记录打上 ISO 周号',
      scene: '跨国周报要统一用 ISO 周编号。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ISOWEEKNUM(A2)',
      result: '2024-3-15→11；2026-8-30→35；2024-12-31→1',
      explanation: 'ISO 周从周一开始；注意 2024-12-31 虽是 2024 年的最后一天（周二），却落入「2025 年第 1 周」（该周含 2025 年首个周四 1/2），所以返回 1 而非 53。',
    },
    {
      title: '示例 2：和 WEEKNUM 在年初年末差 1',
      scene: '想确认两套周号何时不一致。',
      dataTsv: '日期\n2024-12-31',
      dataAnchor: 'A1',
      formula: '=ISOWEEKNUM(A2)&" / WEEKNUM(,2) "&WEEKNUM(A2,2)',
      result: '1 / 53（跨年边界两者口径不同）',
      explanation: '2024-12-31 按 ISO 归入 2025 年第 1 周（返回 1），而 WEEKNUM(,2) 按自然年算成 2024 第 53 周——年初年末边界两者会显著不同，跨国/财务对接务必统一用 ISO。',
    },
    {
      title: '示例 3：旧版 Excel 没有这个函数',
      scene: '在 Excel 2010 及更早版本使用。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ISOWEEKNUM(A2)',
      result: '#NAME?（2010 及更早）',
      explanation: 'ISOWEEKNUM 是 2013 才加入；旧版可用 WEEKNUM(日期,21) 近似替代。',
    },
  ],
  pitfalls: [
    {
      title: '文本日期直接喂 ISOWEEKNUM 报 #VALUE!',
      reason: 'ISOWEEKNUM 要真日期（序列号），文本 "2024-3-15" 不是。',
      fix: '先 DATEVALUE(A2) 或把单元格改成真日期。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '在 Excel 2010 及更早版本用 ISOWEEKNUM',
      reason: 'ISOWEEKNUM 是 Excel 2013 才加入的函数。',
      fix: '升级 Excel，或用 WEEKNUM(日期, 21) 近似得到 ISO 风格周号。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '年初几天周号比 WEEKNUM 小',
      reason: 'ISO 把含当年第一周四的周定为第 1 周，1 月头几天可能算上一年第 52/53 周。',
      fix: '跨国对齐本就用 ISO；别混用 WEEKNUM，避免年初统计口径打架。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'weeknum',
      kind: 'companion',
      why: 'WEEKNUM 是通用周号；ISOWEEKNUM 是 ISO 标准版，年初年末可能与它差 1。',
    },
    {
      id: 'weekday',
      kind: 'companion',
      why: '两者配合：WEEKDAY 取星期几，ISOWEEKNUM 取 ISO 第几周。',
    },
    {
      id: 'today',
      kind: 'companion',
      why: 'TODAY() 给今天，常作为 ISOWEEKNUM 的参数算当前 ISO 周。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'serial_number', label: '日期', type: 'text', default: '2024-01-01', placeholder: '如 2024-01-01', hint: '要算 ISO 周数的日期' },
    ],
    template: '=ISOWEEKNUM({serial_number})',
    cases: [
      { label: '默认：2024-01-01 → 第 1 周', type: 'ok', values: {}, expect: '1', note: 'ISO 周以周一为起点，含该年第一个周四的周为第 1 周' },
      { label: '2024-06-15 → 第 24 周', type: 'ok', values: { serial_number: '2024-06-15' }, expect: '24', note: '年中某天落在第 24 个 ISO 周' },
      { label: '日期非法（文本）→ #VALUE!', type: 'error', values: { serial_number: 'abc' }, expect: '#VALUE!', note: '文本不是合法日期' },
      { label: '日期非法（月份越界）→ #VALUE!', type: 'error', values: { serial_number: '2024-13-01' }, expect: '#VALUE!', note: '月份 13 不存在' },
      { label: '日期非法（日越界）→ #VALUE!', type: 'error', values: { serial_number: '2024-02-30' }, expect: '#VALUE!', note: '2024 不是闰年，2 月没有 30 日' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default isoweeknumEntry;
