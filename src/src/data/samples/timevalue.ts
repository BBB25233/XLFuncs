import type { FunctionEntry } from '@/types';

/** TIMEVALUE · 文本时间转时间小数（datetime 类 B6 批次） */

const TSV = '文本时间\t说明\n9:00\t整点\n13:30:00\t带秒\n18:30\t下班时间';

const timevalueEntry: FunctionEntry = {
  id: 'timevalue',
  enName: 'TIMEVALUE',
  zhName: '文本转时间序列',
  zhCommon: ['TIMEVALUE', '文本转时间', '时间转小数'],
  alias: ['文字时间变真时间', '时间文本转小数'],
  category: 'datetime',
  abbr: 'wbzsjxl',
  pinyin: 'wenbenzhuanshijianxulie',
  keywords: ['文本时间', 'TIMEVALUE', '转时间小数', '真时间', '工时'],
  difficulty: 2,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'TIMEVALUE 把 "13:30:00" 这类文本时间变成时间小数（0.5625）。已经是真时间的单元格（靠右对齐）再套它会报 #VALUE!。',
  },
  oneLiner: '把"13:30:00"这样的文字时间变成可计算的时间',
  summary:
    '和 DATEVALUE 是一对：DATEVALUE 管日期文本，TIMEVALUE 管时间文本。手打的 "13:30" 变成了文本时，不能直接相减算时长，TIMEVALUE 把它转成真时间小数，转完就能跟 NOW、TIME 一起算间隔。已经是真时间的单元格不要再套。',
  syntax: {
    patternCn: '=TIMEVALUE(文本时间)',
    patternEn: '=TIMEVALUE(time_text)',
    args: [
      {
        key: 'time_text',
        zh: '文本时间',
        en: 'time_text',
        required: true,
        desc: '用引号包起来的时间文本，或存着时间文本的单元格引用。',
        accepts: '"13:30:00" / "9:00"；单元格引用。',
        ifOmitted: '参数必填，省略公式不成立。',
        tip: '⚠️ 必须是文本，真时间单元格套它会报 #VALUE!。',
        example: '"13:30:00"',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回时间小数（0–0.99999…）；单元格需设为时间格式才显示成 时:分:秒。',
  examples: [
    {
      title: '示例 1：文本时间转运算时长',
      scene: 'A 列是手打的文本时间，想算两个时间差多少小时。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TIMEVALUE(A4)',
      result: '0.77083（即 18:30:00）',
      explanation:
        '18:30 对应 0.77083 天；换算成两个时间的间隔就写 (TIMEVALUE(A4)-TIMEVALUE(A2))*24，即 (0.77083-0.375)*24 = 9.5 小时。',
    },
    {
      title: '示例 2：和 NOW 比早晚',
      scene: '想知道某文本写的时刻是否已经过了。',
      dataTsv: '签到时间\n9:30:00',
      dataAnchor: 'A1',
      formula: '=TIMEVALUE(A2)<NOW()',
      result: 'TRUE / FALSE（随现在变化）',
      explanation: '文本时间先转小数，再跟 NOW() 比较；TRUE 表示已过期。',
    },
    {
      title: '示例 3：真时间直接套会报错',
      scene: '单元格里已经是真时间，又套了 TIMEVALUE。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TIMEVALUE(B2)',
      result: '#VALUE!（B2 已是真时间）',
      explanation: '真时间本身就是小数，不需要再转；只有文本时间才用 TIMEVALUE。',
    },
  ],
  pitfalls: [
    {
      title: '对已经是真时间的单元格套 TIMEVALUE',
      reason: '真时间本身已是小数，TIMEVALUE 要的是文本，喂真时间会报 #VALUE!。',
      fix: '真时间直接拿去计算；不确定就看单元格是否靠左对齐（文本特征）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '结果显示成小数而非 18:30:00',
      reason: 'TIMEVALUE 返回时间小数，常规格式只显示数字。',
      fix: '把单元格格式设为「时间」即可看到 18:30:00。',
      level: 'mid',
    },
    {
      title: '只写了小时没写分钟',
      reason: '"9" 单独一个整数会被当成日期序列号而非时间。',
      fix: '时间文本写成 "9:00" 这种带冒号的格式，TIMEVALUE 才识别为时间。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'time',
      kind: 'companion',
      why: 'TIME 用数字拼时间；TIMEVALUE 把现成文本时间转成时间，两者互补。',
    },
    {
      id: 'now',
      kind: 'companion',
      why: 'TIMEVALUE 转出的时间小数可以直接和 NOW() 比较早晚。',
    },
    {
      id: 'datevalue',
      kind: 'alternative',
      why: 'DATEVALUE 管日期文本，TIMEVALUE 管时间文本，都是「文本转真值」思路。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'time_text', label: '时间文本', type: 'text', default: '"13:30:00"' },
    ],
    template: '=TIMEVALUE({time_text})',
    cases: [
      { label: '13:30:00', type: 'ok', values: { time_text: '"13:30:00"' }, expect: '0.5625', note: '13.5/24 天' },
      { label: '18:00', type: 'ok', values: { time_text: '"18:00"' }, expect: '0.75', note: '18/24 天' },
      { label: '非法时间文本 → #VALUE!', type: 'error', values: { time_text: '"notatime"' }, expect: '#VALUE!', note: '只认 HH:MM 或 HH:MM:SS' },
      { label: '空文本 → #VALUE!', type: 'error', values: { time_text: '' }, expect: '#VALUE!', note: '文本不能为空' },
      { label: '裸文本 → #VALUE!', type: 'error', values: { time_text: 'badtext' }, expect: '#VALUE!', note: '非时间写法报 #VALUE!' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default timevalueEntry;
