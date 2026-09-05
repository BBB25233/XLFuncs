import type { FunctionEntry } from '@/types';

/** SECOND · 从时间取秒（datetime 类 B6 批次） */

const TSV = '时刻\n13:30:45\n9:00:05\n23:59:59';

const secondEntry: FunctionEntry = {
  id: 'second',
  enName: 'SECOND',
  zhName: '取秒钟',
  zhCommon: ['SECOND', '取秒', '几秒'],
  alias: ['时间的秒数', '秒钟部分'],
  category: 'datetime',
  abbr: 'qmz',
  pinyin: 'qumiaozhong',
  keywords: ['SECOND', '秒', '几秒', '时刻', '时间段'],
  difficulty: 1,
  usageLevel: 26,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'SECOND 从时间里取出「秒」部分，返回 0–59。参数是真时间/日期时间，文本时间要先 TIMEVALUE 化。',
  },
  oneLiner: '从时间中取出秒数（0–59）',
  summary:
    '需要精确到秒时（比如打卡、计时、日志时间戳），SECOND 把时间的秒部分单独取出来（13:30:45 → 45）。参数是真时间或日期时间；文本 "13:30:45" 要先 TIMEVALUE 转一下，否则报 #VALUE!。',
  syntax: {
    patternCn: '=SECOND(时间)',
    patternEn: '=SECOND(serial_number)',
    args: [
      {
        key: 'serial_number',
        zh: '时间',
        en: 'serial_number',
        required: true,
        desc: '一个真时间或日期时间（序列号），或其中单元格引用。',
        accepts: '时间单元格、NOW()、TIME(13,30,45)。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 文本时间直接喂会报 #VALUE!，先 TIMEVALUE 化。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回秒数（0–59）；参数不是时间则 #VALUE!。',
  examples: [
    {
      title: '示例 1：取出秒做判断',
      scene: '有一批时间戳，想标记是否整分（秒为 0）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=IF(SECOND(A2)=0,"整分","带秒")',
      result: '13:30:45→带秒；9:00:05→带秒；整分时刻→整分',
      explanation: 'SECOND 取出秒，配合 IF 判断整分/带秒。',
    },
    {
      title: '示例 2：和时间函数拼回完整标签',
      scene: '想把时刻显示成"13:30:45"这种文字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=HOUR(A2)&":"&MINUTE(A2)&":"&SECOND(A2)',
      result: '13:30:45',
      explanation: 'HOUR/MINUTE/SECOND 三者配合，用 & 和冒号拼回时刻文字。',
    },
    {
      title: '示例 3：文本时间直接喂报错',
      scene: '单元格里是文本 "13:30:45"。',
      dataTsv: '文本时刻\n13:30:45',
      dataAnchor: 'A1',
      formula: '=SECOND(A2)',
      result: '#VALUE!',
      explanation: '文本时间不是真时间，先 TIMEVALUE(A2) 转成真时间再取秒。',
    },
  ],
  pitfalls: [
    {
      title: '文本时间直接喂 SECOND 报 #VALUE!',
      reason: 'SECOND 要真时间（序列号），文本 "13:30:45" 不是。',
      fix: '先 TIMEVALUE(A2) 或把单元格改成真时间再取。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '以为 13:30:45 的秒是小数',
      reason: 'SECOND 只取整秒数字（45），毫秒/小数秒被丢弃。',
      fix: '需要更高精度用原时间减去取整时间再乘 86400。',
      level: 'mid',
    },
    {
      title: '日期里取秒得到 0',
      reason: '纯日期没有时间部分，SECOND 返回 0。',
      fix: '纯日期本就没有秒；需要时刻就用带时间的 NOW/DATE+TIME。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'minute',
      kind: 'companion',
      why: 'MINUTE 取分钟、HOUR 取小时，和 SECOND 一起把时间拆到秒。',
    },
    {
      id: 'time',
      kind: 'companion',
      why: 'TIME 是 SECOND 的反向操作，用数字拼出带秒的时间。',
    },
    {
      id: 'now',
      kind: 'companion',
      why: 'NOW() 提供当前日期时间，常作为 SECOND 的参数做实时判断。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'value', label: '时间/序列号', type: 'text', default: '"13:30:45"' },
    ],
    template: '=SECOND({value})',
    cases: [
      { label: '13:30:45 → 45', type: 'ok', values: {}, expect: '45', note: '默认即 13:30:45' },
      { label: '9:15:45 → 45', type: 'ok', values: { value: '"9:15:45"' }, expect: '45', note: '取秒位' },
      { label: '非时间文本 → #VALUE!', type: 'error', values: { value: 'abc' }, expect: '#VALUE!', note: '参数必须是时间或序列号' },
      { label: '空 → #VALUE!', type: 'error', values: { value: '' }, expect: '#VALUE!', note: '参数不能为空' },
      { label: '非法时间 → #VALUE!', type: 'error', values: { value: '"xx"' }, expect: '#VALUE!', note: '只认 HH:MM(:SS)' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default secondEntry;
