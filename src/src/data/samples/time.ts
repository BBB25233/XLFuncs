import type { FunctionEntry } from '@/types';

/** TIME · 时/分/秒拼成时间（datetime 类 B6 批次） */

const TSV = '上班\t下班\n9:00\t18:00\n13:30\t17:30';

const timeEntry: FunctionEntry = {
  id: 'time',
  enName: 'TIME',
  zhName: '时分秒转时间',
  zhCommon: ['TIME', '拼时间', '时分秒转时间'],
  alias: ['用数字合成时间', '小时分钟秒'],
  category: 'datetime',
  abbr: 'sfmzsj',
  pinyin: 'shifenmiaozhuanshijian',
  keywords: ['TIME', '时间', '时分秒', '工时', '钟表时间'],
  difficulty: 2,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'TIME 把时、分、秒三个数字拼成一个时间（底层是一个小于 1 的小数，代表占一天的比例）。结果记得把单元格格式设为「时间」才能看到 13:30:00。',
  },
  oneLiner: '把时、分、秒三个数字拼成时间',
  summary:
    '需要手填一个时间（比如上班 9:00、开会 13:30）又不方便直接打字时，用 TIME(时,分,秒) 拼出来最稳。它返回的是时间小数（13:30:00 = 0.5625），可以跟 NOW、HOUR、MINUTE 一起算时长。超过 24 的小时会自动进位到天数。',
  syntax: {
    patternCn: '=TIME(时, 分, 秒)',
    patternEn: '=TIME(hour, minute, second)',
    args: [
      {
        key: 'hour',
        zh: '时',
        en: 'hour',
        required: true,
        desc: '小时，0–23；超过 23 会进位到天。',
        accepts: '0–23 的数字、单元格引用。',
        ifOmitted: '必填，省略公式不成立。',
        tip: '⚠️ 小时填 25 会变成 第二天 1:00（多出的部分进位）。',
        example: '13',
        pitfallRank: 1,
      },
      {
        key: 'minute',
        zh: '分',
        en: 'minute',
        required: true,
        desc: '分钟，0–59；超过 59 进位到小时。',
        accepts: '0–59 的数字。',
        ifOmitted: '必填。',
        example: '30',
      },
      {
        key: 'second',
        zh: '秒',
        en: 'second',
        required: true,
        desc: '秒，0–59；超过 59 进位到分钟。',
        accepts: '0–59 的数字。',
        ifOmitted: '必填。',
        example: '0',
      },
    ],
  },
  returnValue: '返回时间小数（0–0.99999…）；单元格需设为时间格式才显示成 时:分:秒。',
  examples: [
    {
      title: '示例 1：拼一个具体时间',
      scene: '想用数字直接造出 13:30:00 这个时间。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TIME(13,30,0)',
      result: '0.5625（即 13:30:00）',
      explanation: '时/分/秒各给数字即得时间；把结果单元格格式设为时间就能看到 13:30:00。',
    },
    {
      title: '示例 2：算一段工时',
      scene: '已知上班、下班时间，算工作了多久。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=(TIME(18,0,0)-TIME(9,0,0))*24',
      result: '9（小时）',
      explanation: '两个时间相减得到天数差，乘 24 换算成小时；A2/B2 那种文本时间要先 TIME 化或 VALUE 化。',
    },
    {
      title: '示例 3：小时超过 24 自动进位',
      scene: '想表示 25 小时后的时刻。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TIME(25,0,0)',
      result: '0.04167（即第二天 1:00:00）',
      explanation: '小时 25 = 24+1，自动进位成 1:00 并多算 1 天；只想要时长用天数差更直观。',
    },
  ],
  pitfalls: [
    {
      title: '结果显示成一串小数而不是 13:30:00',
      reason: 'TIME 返回的是时间小数（0.5625），单元格默认常规格式只显示数字。',
      fix: '把单元格格式设为「时间」，立刻显示成 13:30:00。',
      level: 'high',
    },
    {
      title: '拿文本时间 "13:30" 直接相减算不出时长',
      reason: '文本时间不能相减，会被当 0 或报错。',
      fix: '先用 TIME(时,分,秒) 或 VALUE()/TIMEVALUE() 转成真时间再减。',
      level: 'mid',
    },
    {
      title: '小时填了 25 以为显示 25:00',
      reason: 'TIME 的小时超过 23 会进位到天，不会停在 25:00。',
      fix: '只想表达「25 小时时长」就直接写 25/24，或用时长（天）参与计算。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'now',
      kind: 'companion',
      why: 'NOW 返回当前日期+时间；TIME 用来人工拼一个指定时间，两者都是时间类型。',
    },
    {
      id: 'hour',
      kind: 'companion',
      why: 'HOUR/MINUTE/SECOND 是 TIME 的反向操作，从时间里把时/分/秒取出来。',
    },
    {
      id: 'timevalue',
      kind: 'companion',
      why: 'TIMEVALUE 把"13:30:00"这种文本时间转成时间小数，和 TIME 作用互补。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'hour', label: '时', type: 'number', default: '12' },
      { key: 'minute', label: '分', type: 'number', default: '0' },
      { key: 'second', label: '秒', type: 'number', default: '0' },
    ],
    template: '=TIME({hour},{minute},{second})',
    cases: [
      { label: '12:00:00', type: 'ok', values: { hour: '12', minute: '0', second: '0' }, expect: '0.5', note: '中午 = 0.5 天' },
      { label: '13:30:00', type: 'ok', values: { hour: '13', minute: '30', second: '0' }, expect: '0.5625', note: '13.5/24' },
      { label: '25 点进位', type: 'ok', values: { hour: '25', minute: '0', second: '0' }, expect: '0.041667', note: '超 24 小时取当天余数 ≈ 1:00' },
      { label: '负小时 → #NUM!', type: 'error', values: { hour: '-1', minute: '0', second: '0' }, expect: '#NUM!', note: '时分秒不能为负' },
      { label: '负分钟 → #NUM!', type: 'error', values: { hour: '0', minute: '-5', second: '0' }, expect: '#NUM!', note: '分钟不能为负' },
      { label: '非数字 → #VALUE!', type: 'error', values: { hour: 'abc', minute: '0', second: '0' }, expect: '#VALUE!', note: '参数必须是数字' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default timeEntry;
