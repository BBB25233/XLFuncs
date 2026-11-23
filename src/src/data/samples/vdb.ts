import type { FunctionEntry } from '@/types';

/** VDB · 可变余额递减（financial 类 B9 批次） */

const vdbEntry: FunctionEntry = {
  id: 'vdb',
  enName: 'VDB',
  zhName: '可变余额递减',
  zhCommon: ['VDB', '可变递减'],
  alias: ['切换折旧'],
  category: 'financial',
  abbr: 'kbyedj',
  pinyin: 'kebianyuedijian',
  keywords: ['vdb', '折旧', '可变'],
  difficulty: 5,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '任意期段的余额递减折旧',
  summary: 'VDB 返回指定期段（可跨多期）的余额递减折旧，还能在折旧额低于直线法时自动切换，最灵活。',
  syntax: {
    patternCn: '=VDB(原值, 残值, 寿命, 起期, 止期, [倍数], [切换])',
    patternEn: '=VDB(cost, salvage, life, start, end, [factor], [no_switch])',
    args: [{ key: 'cost', zh: '原值', en: 'cost', required: true, desc: '资产成本' },
    { key: 'salvage', zh: '残值', en: 'salvage', required: true, desc: '残值' },
    { key: 'life', zh: '寿命', en: 'life', required: true, desc: '总寿命期数' },
    { key: 'start', zh: '起期', en: 'start', required: true, desc: '期段起点（小数也行）' },
    { key: 'end', zh: '止期', en: 'end', required: true, desc: '期段终点' },
    { key: 'factor', zh: '倍数', en: 'factor', required: false, desc: '折旧倍数，默认 2' },
    { key: 'switch', zh: '切换', en: 'no_switch', required: false, desc: 'TRUE 不切换直线法' }],
  },
  returnValue: '该期段折旧额',
  examples: [
    {
      title: '示例：可变余额递减折旧',
      scene: '原值 10 万、残值 1 万、5 年、第 1–2 年',
      dataAnchor: 'B2',
      formula: '=VDB(100000,10000,5,1,2)',
      result: '24000',
      explanation: '可指定起止期间，按余额递减计提。',
    },
    {
      title: '示例：第 2–4 年折旧',
      scene: '同上前提',
      dataAnchor: 'B2',
      formula: '=VDB(100000,10000,5,2,4)',
      result: '23040',
      explanation: '跳过首年后，折旧基数逐年下降。',
    },
  ],
  pitfalls: [{ title: '起期可为小数', reason: '以为只能整数期，错过局部期段。', fix: 'start/end 可用小数。', level: 'low' }],
  related: [{ id: 'ddb', kind: 'companion', why: 'DDB 与本品类相关' },
    { id: 'db', kind: 'companion', why: 'DB 与本品类相关' },
    { id: 'sln', kind: 'companion', why: 'SLN 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "cost",
        "label": "原值",
        "type": "text",
        "default": "100000"
      },
      {
        "key": "salvage",
        "label": "残值",
        "type": "text",
        "default": "10000"
      },
      {
        "key": "life",
        "label": "寿命",
        "type": "text",
        "default": "5"
      },
      {
        "key": "start",
        "label": "起期",
        "type": "text",
        "default": "0"
      },
      {
        "key": "end",
        "label": "止期",
        "type": "text",
        "default": "2"
      },
      {
        "key": "factor",
        "label": "倍数",
        "type": "text",
        "default": "2"
      },
      {
        "key": "switch",
        "label": "切换",
        "type": "text",
        "default": "FALSE"
      }
    ],
    "template": "=VDB({cost},{salvage},{life},{start},{end},{factor},{switch})",
    "cases": [
      {
        "label": "前两年",
        "type": "ok",
        "values": {
          "cost": "100000",
          "salvage": "10000",
          "life": "5",
          "start": "0",
          "end": "2",
          "factor": "2",
          "switch": "FALSE"
        },
        "expect": "64000",
        "note": ""
      },
      {
        "label": "前一年",
        "type": "ok",
        "values": {
          "cost": "100000",
          "salvage": "10000",
          "life": "5",
          "start": "0",
          "end": "1",
          "factor": "2",
          "switch": "FALSE"
        },
        "expect": "40000",
        "note": ""
      },
      {
        "label": "寿命 0",
        "type": "error",
        "values": {
          "cost": "100000",
          "salvage": "10000",
          "life": "0",
          "start": "0",
          "end": "2",
          "factor": "2",
          "switch": "FALSE"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "起≥止",
        "type": "error",
        "values": {
          "cost": "100000",
          "salvage": "10000",
          "life": "5",
          "start": "3",
          "end": "3",
          "factor": "2",
          "switch": "FALSE"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法数字",
        "type": "error",
        "values": {
          "cost": "abc",
          "salvage": "10000",
          "life": "5",
          "start": "0",
          "end": "2",
          "factor": "2",
          "switch": "FALSE"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default vdbEntry;
