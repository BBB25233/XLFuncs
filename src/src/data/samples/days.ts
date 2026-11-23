import type { FunctionEntry } from '@/types';

/** DAYS · 两日期相差天数（datetime 类 B6 批次） */

const TSV = '起始日\t结束日\n2024-1-1\t2024-12-31\n2026-1-1\t2026-8-30';

const daysEntry: FunctionEntry = {
  id: 'days',
  enName: 'DAYS',
  zhName: '取天数',
  zhCommon: ['DAYS', '相差天数', '天数差'],
  alias: ['日期相减', '天数'],
  category: 'datetime',
  abbr: 'qts',
  pinyin: 'qutianshu',
  keywords: ['DAYS', '天数差', '日期相减', '间隔天数'],
  difficulty: 1,
  usageLevel: 35,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes:
      'DAYS 专算两个日期相差多少天，语法是 DAYS(结束日, 开始日)——注意结束日在前。Excel 2013 才加入，老版本用「结束日−开始日」即可。',
  },
  oneLiner: '算两个日期相差多少天（结束日减开始日）',
  summary:
    '想知道 A 到 B 隔多少天，DAYS(结束日,开始日) 一句话搞定。注意参数顺序是「结束在前、开始在后」，和直接相减 A−B 相反——填反了会得到负数。2013 之前没有这个函数，老表用「结束日−开始日」也行。',
  syntax: {
    patternCn: '=DAYS(结束日, 开始日)',
    patternEn: '=DAYS(end_date, start_date)',
    args: [
      {
        key: 'end_date',
        zh: '结束日',
        en: 'end_date',
        required: true,
        desc: '较晚的日期（减号后面的那个）。',
        accepts: '日期单元格、DATE(2024,12,31)。',
        ifOmitted: '必填。',
        tip: '⚠️ 顺序是结束在前，填反得负数。',
        example: 'B2',
        pitfallRank: 1,
      },
      {
        key: 'start_date',
        zh: '开始日',
        en: 'start_date',
        required: true,
        desc: '较早的日期（被减的）。',
        accepts: '日期单元格。',
        ifOmitted: '必填。',
        example: 'A2',
      },
    ],
  },
  returnValue: '返回整数天数（结束日−开始日）；日期非法则 #VALUE!。',
  examples: [
    {
      title: '示例 1：一整年差多少天',
      scene: '算 2024 全年天数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DAYS(B2,A2)',
      result: '365（2024 闰年，1/1→12/31）',
      explanation: '结束日 B2 减开始日 A2，得 365 天。',
    },
    {
      title: '示例 2：年内某段天数',
      scene: '算 2026 年初到 8 月底。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DAYS(B3,A3)',
      result: '241（2026-1-1→2026-8-30）',
      explanation: '顺序同样是结束在前。',
    },
    {
      title: '示例 3：用文本日期直接算',
      scene: '没有单元格，直接写日期文本。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DAYS("2024-3-15","2024-1-1")',
      result: '74（1/1→3/15）',
      explanation: '直接喂 "年-月-日" 文本也行；顺序别写反。',
    },
  ],
  pitfalls: [
    {
      title: '参数顺序写反得到负数',
      reason: 'DAYS(结束,开始)，若写成 DAYS(开始,结束) 结果是负的。',
      fix: '记住「结束在前」；或直接用「结束日−开始日」更直观。',
      level: 'high',
    },
    {
      title: '文本日期不被识别报 #VALUE!',
      reason: '"2024年3月15日" 这类中文写法 DAYS 不认。',
      fix: '改成 "2024-3-15"，或 DATEVALUE 化。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '在 Excel 2010 及更早用 DAYS',
      reason: 'DAYS 是 2013 才加入。',
      fix: '老版本用「结束单元格−开始单元格」相减即可。',
      level: 'low',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'datevalue',
      kind: 'companion',
      why: '文本日期先 DATEVALUE 转真日期，再喂给 DAYS。',
    },
    {
      id: 'datedif',
      kind: 'companion',
      why: 'DATEDIF 能按年/月/日分段算差额；DAYS 只给总天数。',
    },
    {
      id: 'yearfrac',
      kind: 'companion',
      why: '要的是「年」比例用 YEARFRAC；要天数用 DAYS。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'end', label: '结束日', type: 'text', default: '"2024-3-15"' },
      { key: 'start', label: '开始日', type: 'text', default: '"2024-3-1"' },
    ],
    template: '=DAYS({end},{start})',
    cases: [
      { label: '3/15 - 3/1 = 14', type: 'ok', values: {}, expect: '14', note: '默认两天相差 14 天' },
      { label: '全年 = 365', type: 'ok', values: { end: '"2024-12-31"', start: '"2024-1-1"' }, expect: '365', note: '2024 闰年但 DAYS 按真实日历' },
      { label: '结束日非法 → #VALUE!', type: 'error', values: { end: 'bad', start: '"2024-3-1"' }, expect: '#VALUE!', note: '结束日必须是合法日期' },
      { label: '开始日非法 → #VALUE!', type: 'error', values: { end: '"2024-3-15"', start: 'bad' }, expect: '#VALUE!', note: '开始日必须是合法日期' },
      { label: '开始日空 → #VALUE!', type: 'error', values: { end: '"2024-3-15"', start: '' }, expect: '#VALUE!', note: '开始日不能为空' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default daysEntry;
