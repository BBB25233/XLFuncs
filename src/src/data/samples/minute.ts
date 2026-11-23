import type { FunctionEntry } from '@/types';

/** MINUTE · 从时间取分钟（datetime 类 B6 批次） */

const TSV = '时刻\n13:30:00\n9:05:00\n18:59:59';

const minuteEntry: FunctionEntry = {
  id: 'minute',
  enName: 'MINUTE',
  zhName: '取分钟',
  zhCommon: ['MINUTE', '取分钟', '几分'],
  alias: ['时间的分钟数', '分钟部分'],
  category: 'datetime',
  abbr: 'qfz',
  pinyin: 'qufenzhong',
  keywords: ['MINUTE', '分钟', '几分', '时间段', '时刻'],
  difficulty: 1,
  usageLevel: 32,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'MINUTE 从时间里取出「分钟」部分，返回 0–59。文本时间（"13:30"）Excel 会自动识别，只有不像时间的文本才报 #VALUE!。',
  },
  oneLiner: '从时间中取出分钟数（0–59）',
  summary:
    '拿到一个时间想单独用它的「分钟」做判断时，MINUTE 最方便。它只取分钟部分（13:30 → 30），不管小时秒。参数可以是真时间、日期时间，也可以直接是文本 "13:30"（Excel 会自动识别成时间）；只有不像时间的文本（如 "13点30"）才报 #VALUE!。',
  syntax: {
    patternCn: '=MINUTE(时间)',
    patternEn: '=MINUTE(serial_number)',
    args: [
      {
        key: 'serial_number',
        zh: '时间',
        en: 'serial_number',
        required: true,
        desc: '一个真时间或日期时间（序列号），或其中单元格引用。',
        accepts: '时间单元格、NOW()、TIME(13,30,0)。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 文本 "13:30" 能直接取（得 30）；写成 "13点30" 这类不像时间的文本才报 #VALUE!。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回分钟数（0–59）；参数不是时间则 #VALUE!。',
  examples: [
    {
      title: '示例 1：取出分钟做判断',
      scene: '有一批时刻，想标记是否整点（分钟为 0）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=IF(MINUTE(A2)=0,"整点","非整点")',
      result: '13:30→非整点；9:05→非整点；整点时刻→整点',
      explanation: 'MINUTE 取出分钟，配合 IF 判断整点/非整点。',
    },
    {
      title: '示例 2：和 HOUR 配合拼回标签',
      scene: '想把时刻显示成"13点30分"这种文字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=HOUR(A2)&"点"&MINUTE(A2)&"分"',
      result: '13点30分；9点5分',
      explanation: 'HOUR、MINUTE 分别取小时分钟，用 & 拼成中文标签。',
    },
    {
      title: '示例 3：文本时间也能直接取分钟',
      scene: '单元格里存的是文本 "13:30"（从系统导出、靠左对齐）。',
      dataTsv: '文本时刻\n13:30',
      dataAnchor: 'A1',
      formula: '=MINUTE(A2)',
      result: '30',
      explanation:
        'Excel 会把 "13:30" 自动识别成时间，不用先 TIMEVALUE 也能取到 30。换成 "13点30" 这种写法才会报 #VALUE!。',
    },
  ],
  pitfalls: [
    {
      title: '文本写法不像时间，报 #VALUE!',
      reason: 'MINUTE 能识别 "13:30"，但识别不了 "13点30" 这类写法，直接报 #VALUE!。',
      fix: '把文本改成带冒号的 "13:30" 或 "13:30:00"。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '以为 13:30 会变成 30 分钟整段',
      reason: 'MINUTE 只取分钟数字（30），不含小时；要总分钟用 小时*60+分钟。',
      fix: '需要「从当天 0 点起的总分钟」用 HOUR*60+MINUTE 计算。',
      level: 'mid',
    },
    {
      title: '日期里取分钟得到 0',
      reason: '纯日期没有时间部分，MINUTE 返回 0。',
      fix: '纯日期本就没有分钟；需要时刻就用带时间的 NOW/DATE+TIME。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'hour',
      kind: 'companion',
      why: 'HOUR 取小时、SECOND 取秒，和 MINUTE 一起把时间拆开。',
    },
    {
      id: 'time',
      kind: 'companion',
      why: 'TIME 是 MINUTE 的反向操作，用数字拼出时间。',
    },
    {
      id: 'second',
      kind: 'companion',
      why: 'SECOND 取秒，和 MINUTE 配合可精确到秒。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'value', label: '时间/序列号', type: 'text', default: '"13:30:00"' },
    ],
    template: '=MINUTE({value})',
    cases: [
      { label: '13:30:00 → 30', type: 'ok', values: {}, expect: '30', note: '默认即 13:30:00' },
      { label: '9:15:45 → 15', type: 'ok', values: { value: '"9:15:45"' }, expect: '15', note: '取分钟位' },
      { label: '非时间文本 → #VALUE!', type: 'error', values: { value: 'abc' }, expect: '#VALUE!', note: '参数必须是时间或序列号' },
      { label: '空 → #VALUE!', type: 'error', values: { value: '' }, expect: '#VALUE!', note: '参数不能为空' },
      { label: '非法时间 → #VALUE!', type: 'error', values: { value: '"xx"' }, expect: '#VALUE!', note: '只认 HH:MM(:SS)' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default minuteEntry;
