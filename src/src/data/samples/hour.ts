import type { FunctionEntry } from '@/types';

/** HOUR · 从时间取小时（datetime 类 B6 批次） */

const TSV = '时刻\n13:30:00\n9:00:00\n23:59:59';

const hourEntry: FunctionEntry = {
  id: 'hour',
  enName: 'HOUR',
  zhName: '取小时',
  zhCommon: ['HOUR', '取小时', '几点'],
  alias: ['时间的小时数', '钟点'],
  category: 'datetime',
  abbr: 'qxs',
  pinyin: 'quxiaoshi',
  keywords: ['HOUR', '小时', '几点', '时刻', '时间段'],
  difficulty: 1,
  usageLevel: 35,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'HOUR 从时间（或日期时间）里取出「小时」部分，返回 0–23。参数是真时间/日期时间，文本时间要先 TIMEVALUE 化。',
  },
  oneLiner: '从时间中取出小时数（0–23）',
  summary:
    '拿到一个时间想单独用它的「小时」做判断或分组时，HOUR 最方便。它只取小时部分（13:30 → 13），不管分钟秒。参数是真时间或日期时间；如果是文本写的 "13:30" 要先 TIMEVALUE 转一下，否则报 #VALUE!。',
  syntax: {
    patternCn: '=HOUR(时间)',
    patternEn: '=HOUR(serial_number)',
    args: [
      {
        key: 'serial_number',
        zh: '时间',
        en: 'serial_number',
        required: true,
        desc: '一个真时间或日期时间（序列号），或其中的单元格引用。',
        accepts: '时间单元格、NOW()、TIME(13,30,0)。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 文本时间 "13:30" 直接喂会报 #VALUE!，先 TIMEVALUE 化。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回小时数（0–23）；参数不是时间则 #VALUE!。',
  examples: [
    {
      title: '示例 1：取出小时做判断',
      scene: '有一批打卡时间，想标记是否晚于 18 点。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=IF(HOUR(A2)>=18,"晚班","正常")',
      result: '13:30→正常；23:59→晚班',
      explanation: 'HOUR 取出小时，配合 IF 就能按钟点分组或提醒。',
    },
    {
      title: '示例 2：和 NOW 配合判断是否上午',
      scene: '想在公式里根据当前时间走不同逻辑。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=IF(HOUR(NOW())<12,"上午好","下午好")',
      result: '随当前时间变化',
      explanation: 'NOW() 给当前时间，HOUR 取小时，小于 12 即上午。',
    },
    {
      title: '示例 3：文本时间直接喂报错',
      scene: '单元格里是文本 "13:30"。',
      dataTsv: '文本时刻\n13:30',
      dataAnchor: 'A1',
      formula: '=HOUR(A2)',
      result: '#VALUE!',
      explanation: '文本时间不是真时间，要先 TIMEVALUE(A2) 转成真时间再取小时。',
    },
  ],
  pitfalls: [
    {
      title: '文本时间直接喂 HOUR 报 #VALUE!',
      reason: 'HOUR 要真时间（序列号），文本 "13:30" 不是。',
      fix: '先 TIMEVALUE(A2) 或把单元格改成真时间再取。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '以为 HOUR 会把 13:30 变成 13.5',
      reason: 'HOUR 只取整小时部分，分钟秒被丢弃（13:30 → 13，不是 13.5）。',
      fix: '想要带小数的「时刻」用原时间乘 24；只要小时整数用 HOUR 即可。',
      level: 'mid',
    },
    {
      title: '日期里取小时得到 0',
      reason: '纯日期（如 2024-3-15）没有时间部分，HOUR 返回 0。',
      fix: '纯日期本就没有小时；需要时刻就用带时间的 NOW/DATE+TIME。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'minute',
      kind: 'companion',
      why: 'MINUTE 取分钟、SECOND 取秒，和 HOUR 一起把时间拆开。',
    },
    {
      id: 'time',
      kind: 'companion',
      why: 'TIME 是 HOUR 的反向操作，用数字拼出时间。',
    },
    {
      id: 'now',
      kind: 'companion',
      why: 'NOW() 提供当前时间，常作为 HOUR 的参数做实时判断。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'value', label: '时间/序列号', type: 'text', default: '"13:30:00"' },
    ],
    template: '=HOUR({value})',
    cases: [
      { label: '13:30:00 → 13', type: 'ok', values: {}, expect: '13', note: '默认即 13:30:00' },
      { label: '序列号 0.5 → 12', type: 'ok', values: { value: '0.5' }, expect: '12', note: '时间小数 0.5 = 中午' },
      { label: '非时间文本 → #VALUE!', type: 'error', values: { value: 'abc' }, expect: '#VALUE!', note: '参数必须是时间或序列号' },
      { label: '空 → #VALUE!', type: 'error', values: { value: '' }, expect: '#VALUE!', note: '参数不能为空' },
      { label: '非法时间 → #VALUE!', type: 'error', values: { value: '"notime"' }, expect: '#VALUE!', note: '只认 HH:MM(:SS)' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default hourEntry;
