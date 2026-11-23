import type { FunctionEntry } from '@/types';

/** WEEKDAY · 取星期几（datetime 类 B6 批次） */

const TSV = '日期\t事项\n2024-3-15\t周五例会\n2026-8-30\t周日值班\n2024-1-1\t元旦';

const weekdayEntry: FunctionEntry = {
  id: 'weekday',
  enName: 'WEEKDAY',
  zhName: '取星期几',
  zhCommon: ['WEEKDAY', '星期几', '周几'],
  alias: ['星期', '礼拜几', '星期数'],
  category: 'datetime',
  abbr: 'qxqj',
  pinyin: 'quxingqiji',
  keywords: ['WEEKDAY', '星期几', '周几', '周末', '排班'],
  difficulty: 2,
  usageLevel: 45,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'WEEKDAY 返回日期是星期几；第二参数 return_type 决定编号方式：省略或 1 = 周日1…周六7；2 = 周一1…周日7。文本日期（"2024-3-15"）Excel 会自动识别，不像日期的文本才报 #VALUE!。',
  },
  oneLiner: '算出某个日期是星期几（1–7）',
  summary:
    '做排班、判断周末、按星期分组时，WEEKDAY 一下就告诉你某天是周几。默认编号是「周日=1…周六=7」；如果习惯「周一=1」，把第二参数填 2 即可。参数可以是真日期，也可以直接是文本 "2024-3-15"（Excel 会自动识别成日期）。',
  syntax: {
    patternCn: '=WEEKDAY(日期, [编号方式])',
    patternEn: '=WEEKDAY(serial_number, [return_type])',
    args: [
      {
        key: 'serial_number',
        zh: '日期',
        en: 'serial_number',
        required: true,
        desc: '一个真日期（序列号）或日期单元格引用。',
        accepts: '日期单元格、TODAY()、DATE(2024,3,15)。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 文本 "2024-3-15" 能直接取（周五=6）；"abc" 这类文本才报 #VALUE!。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'return_type',
        zh: '编号方式',
        en: 'return_type',
        required: false,
        desc: '星期编号规则：省略/1 = 周日1…周六7；2 = 周一1…周日7；11 = 周一1…周日7（ISO 风格）。',
        accepts: '1 / 2 / 11 / 12 / 13 / 14 / 15 / 16 / 17。',
        ifOmitted: '省略按 1 处理（周日=1）。',
        tip: '国内常用周一为一周之首，填 2 最顺手。',
        example: '2',
      },
    ],
  },
  returnValue: '返回 1–7 的星期编号；参数不是日期则 #VALUE!。',
  examples: [
    {
      title: '示例 1：判断某天是否周末',
      scene: '有一批日期，想标出周六周日。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=IF(WEEKDAY(A2,2)>=6,"周末","工作日")',
      result: '2024-3-15→工作日；2026-8-30→周末',
      explanation: '用 return_type=2（周一=1），≥6 即周六周日；配合 IF 做标记。',
    },
    {
      title: '示例 2：两种编号方式对比',
      scene: '同一天用不同编号方式看结果。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=WEEKDAY(A2)&" / "&WEEKDAY(A2,2)',
      result: '2024-3-15 → 6 / 5（周五：周日制6、周一制5）',
      explanation: '默认 1 给「周日=1」的 6；填 2 给「周一=1」的 5。',
    },
    {
      title: '示例 3：文本日期也能直接取星期',
      scene: '单元格里存的是文本 "2024-3-15"（从系统导出、靠左对齐）。',
      dataTsv: '文本日期\n2024-3-15',
      dataAnchor: 'A1',
      formula: '=WEEKDAY(A2)',
      result: '6',
      explanation:
        'Excel 会把 "2024-3-15" 自动识别成日期，默认编号下周五是 6，不用先 DATEVALUE。换成 "abc" 这种不像日期的文本才报 #VALUE!。',
    },
  ],
  pitfalls: [
    {
      title: '文本写法不像日期，报 #VALUE!',
      reason: 'WEEKDAY 能识别 "2024-3-15" 和 "2024年3月15日"，但识别不了 "abc" 这类文本，直接报 #VALUE!。',
      fix: '把文本改成 "2024-3-15" 这种带分隔符的写法；实在改不了先用 DATEVALUE 转成序列号。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '记混编号方式导致周末判断错',
      reason: '默认周日=1，若按「周六=6 是周末」却用错编号，会把周日漏掉或错判。',
      fix: '统一用 return_type=2（周一=1），周末即 ≥6；或用 WEEKDAY(日期,2)>=6 判断。',
      level: 'mid',
    },
    {
      title: '想要 ISO 周数却用了 WEEKDAY',
      reason: 'WEEKDAY 只给「星期几」，不给「第几周」。',
      fix: '要第几周用 WEEKNUM / ISOWEEKNUM。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'weeknum',
      kind: 'companion',
      why: 'WEEKNUM/ISOWEEKNUM 取「第几周」，WEEKDAY 取「星期几」，配合做周期分析。',
    },
    {
      id: 'today',
      kind: 'companion',
      why: 'TODAY() 给今天，常作为 WEEKDAY 的参数判断今天是周几。',
    },
    {
      id: 'date',
      kind: 'companion',
      why: 'DATE 拼真日期后交给 WEEKDAY 计算星期。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'serial_number', label: '日期', type: 'text', default: '2024-01-15', placeholder: '如 2024-01-15 或序列号 45292', hint: '要算星期几的日期' },
      { key: 'return_type', label: '返回类型', type: 'select', default: '1', options: [ { value: '1', label: '1（周日=1）' }, { value: '2', label: '2（周一=1）' }, { value: '3', label: '3（周一=0）' } ] },
    ],
    template: '=WEEKDAY({serial_number},{return_type})',
    cases: [
      { label: '默认：2024-01-15（周一）→ 2', type: 'ok', values: {}, expect: '2', note: 'return_type 缺省为 1：周日=1…周六=7，周一得到 2' },
      { label: 'return_type=2：周一=1', type: 'ok', values: { return_type: '2' }, expect: '1', note: 'return_type 2 把周一当作 1' },
      { label: 'return_type=3：周一=0', type: 'ok', values: { return_type: '3' }, expect: '0', note: 'return_type 3 把周一当作 0' },
      { label: '日期非法 → #VALUE!', type: 'error', values: { serial_number: '2024-13-45' }, expect: '#VALUE!', note: '月份/日超出范围，Excel 报 #VALUE!' },
      { label: 'return_type=99 → #NUM!', type: 'error', values: { return_type: '99' }, expect: '#NUM!', note: 'return_type 仅支持 1/2/3/11-17' },
      { label: 'return_type 文本 → #VALUE!', type: 'error', values: { return_type: 'abc' }, expect: '#VALUE!', note: 'return_type 必须是数字' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default weekdayEntry;
