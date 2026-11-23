import type { FunctionEntry } from '@/types';

/** EOMONTH · 月末最后一天（datetime 类 B6 批次） */

const TSV = '起始日\t用途\n2024-3-15\t月度统计\n2024-1-15\t算2月月底\n2024-3-15\t往前推一月';

const eomonthEntry: FunctionEntry = {
  id: 'eomonth',
  enName: 'EOMONTH',
  zhName: '月末日期',
  zhCommon: ['EOMONTH', '月末', '月底最后一天'],
  alias: ['月末日期', '月底', '当月最后一天'],
  category: 'datetime',
  abbr: 'ymrq',
  pinyin: 'yuemoriqi',
  keywords: ['EOMONTH', '月末', '月底', '月结', '区间终点'],
  difficulty: 2,
  usageLevel: 42,
  version: {
    min: '2007',
    label: 'Excel 2007 起可用',
    notes:
      'EOMONTH 返回某日期往前/往后推若干个月之后的「那个月最后一天」。比如算工资所属月份、月度区间的终点特别好用。目标月没有这一天（如 31 日推到小月）会自动落到当月最后一天。',
  },
  oneLiner: '返回某日期前后第 N 个月的月末最后一天',
  summary:
    '做「本月工资期」「月度汇总区间终点」「合同月结日」时，EOMONTH 一下给出那个月的最后一天（30 日/31 日/28 日/29 日闰月都自动处理）。第二参数是「偏移几个月」：0 = 当月，正数往后、负数往前。常和 EDATE 搭配（EDATE 给同月同日，EOMONTH 给月末）。',
  syntax: {
    patternCn: '=EOMONTH(起始日, 偏移月数)',
    patternEn: '=EOMONTH(start_date, months)',
    args: [
      {
        key: 'start_date',
        zh: '起始日',
        en: 'start_date',
        required: true,
        desc: '一个真日期（序列号）或日期单元格引用。',
        accepts: '日期单元格、TODAY()、DATE(2024,3,15)。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 文本日期直接喂会报 #VALUE!，先 DATEVALUE 化。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'months',
        zh: '偏移月数',
        en: 'months',
        required: true,
        desc: '相对起始日往前/往后推几个月；0 表示当月。',
        accepts: '整数，可正可负；单元格引用。',
        ifOmitted: '必填。',
        tip: '负数表示往前推，如 -1 是上个月的月末。',
        example: '0',
      },
    ],
  },
  returnValue: '返回目标月的最后一天（真日期）；参数不是日期或月数非整数则 #VALUE!。',
  examples: [
    {
      title: '示例 1：求当月月末',
      scene: '已知某日期，想拿到它所在月的最后一天。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=EOMONTH(A2,0)',
      result: '2024-03-31（3 月最后一天）',
      explanation: '偏移 0 即当月，自动返回 31 日（小月会返回 30/28/29）。',
    },
    {
      title: '示例 2：往后推一个月的月底',
      scene: '合同按月结算，要算下个月月底。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=EOMONTH(A2,1)',
      result: '2024-04-30（4 月最后一天）',
      explanation: '偏移 1 即下个月，返回 4 月 30 日。',
    },
    {
      title: '示例 3：闰年 2 月自动处理 + 往前推',
      scene: '从 3 月 15 日往前推一个月，落到 2 月底。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=EOMONTH(A2,-1)',
      result: '2024-02-29（2024 是闰年）',
      explanation: '负数往前推；2024 闰年 2 月有 29 天，自动返回 29 日而非 28 日。',
    },
  ],
  pitfalls: [
    {
      title: '文本日期直接喂 EOMONTH 报 #VALUE!',
      reason: 'EOMONTH 要真日期（序列号），文本 "2024-3-15" 不是。',
      fix: '先 DATEVALUE(A2) 或把单元格改成真日期。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '偏移月数填了小数',
      reason: 'EOMONTH 的月数必须是整数，填 1.5 会报 #VALUE!。',
      fix: '月数用整数；要半个月的偏移没有意义，改用具体日期。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '以为 EOMONTH 返回同月同日',
      reason: 'EOMONTH 只给「月末最后一天」，不是推算后的对应日。',
      fix: '想要「同月同日」用 EDATE；想要「月末」才用 EOMONTH。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'edate',
      kind: 'companion',
      why: 'EDATE 给「同月同日」的偏移结果；EOMONTH 给那个月的月末，两者常搭配做区间。',
    },
    {
      id: 'date',
      kind: 'companion',
      why: 'DATE 拼真日期后交给 EOMONTH 推算月末。',
    },
    {
      id: 'today',
      kind: 'companion',
      why: 'TODAY() 给今天，EOMONTH(TODAY(),0) 即本月月底，做月度看板常用。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'start_date', label: '开始日期', type: 'text', default: '2024-01-15', placeholder: '如 2024-01-15', hint: '作为基准的日期' },
      { key: 'months', label: '月数偏移', type: 'number', default: '1', hint: '正数往后、负数往前，整数' },
    ],
    template: '=EOMONTH({start_date},{months})',
    cases: [
      { label: '默认：1 月 15 日 +1 月 → 2 月 29 日', type: 'ok', values: {}, expect: '45351', note: '返回目标月最后一天的序列号；2024 是闰年，2 月有 29 天' },
      { label: '3 月 10 日 -1 月 → 2 月 29 日', type: 'ok', values: { start_date: '2024-03-10', months: '-1' }, expect: '45351', note: '-1 回到 2 月末' },
      { label: '12 月 15 日 +0 月 → 12 月 31 日', type: 'ok', values: { start_date: '2024-12-15', months: '0' }, expect: '45657', note: '偏移 0 仍是当月最后一天' },
      { label: '日期非法 → #VALUE!', type: 'error', values: { start_date: '2024-13-45' }, expect: '#VALUE!', note: '月份/日超出范围' },
      { label: 'months 小数 → #NUM!', type: 'error', values: { months: '1.5' }, expect: '#NUM!', note: 'months 必须是整数' },
      { label: 'months 文本 → #VALUE!', type: 'error', values: { months: 'abc' }, expect: '#VALUE!', note: 'months 必须是数字' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default eomonthEntry;
