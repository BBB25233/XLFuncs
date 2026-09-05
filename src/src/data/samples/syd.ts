import type { FunctionEntry } from '@/types';

/** SYD · 年数总和折旧（financial 类 B9 批次） */

const sydEntry: FunctionEntry = {
  id: 'syd',
  enName: 'SYD',
  zhName: '年数总和折旧',
  zhCommon: ['SYD', '年数总和'],
  alias: ['加速折旧'],
  category: 'financial',
  abbr: 'nszhzj',
  pinyin: 'nianshuzonghezhejiu',
  keywords: ['syd', '折旧', '加速'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '前期多提的加速折旧',
  summary: 'SYD 按年数总和法折旧，前期折旧多、后期少，体现资产效能递减。',
  syntax: {
    patternCn: '=SYD(原值, 残值, 寿命, 第几期)',
    patternEn: '=SYD(cost, salvage, life, per)',
    args: [{ key: 'cost', zh: '原值', en: 'cost', required: true, desc: '资产成本' },
    { key: 'salvage', zh: '残值', en: 'salvage', required: true, desc: '残值' },
    { key: 'life', zh: '寿命', en: 'life', required: true, desc: '总寿命期数' },
    { key: 'per', zh: '第几期', en: 'per', required: true, desc: '要算的期数' }],
  },
  returnValue: '该期折旧额',
  examples: [{ title: '示例：首年折旧', scene: '原值 10000、残值 1000、5 年', dataAnchor: 'B2', formula: '=SYD(10000,1000,5,1)', result: '3000（首年）', explanation: '(10000-1000)×(5/15)。' }],
  pitfalls: [{ title: 'per 超出寿命', reason: 'per 大于 life 会 #NUM!。', fix: 'per 不超过 life。', level: 'low' }],
  related: [{ id: 'sln', kind: 'companion', why: 'SLN 与本品类相关' },
    { id: 'db', kind: 'companion', why: 'DB 与本品类相关' },
    { id: 'ddb', kind: 'companion', why: 'DDB 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "cost",
        "label": "原值",
        "type": "text",
        "default": "10000"
      },
      {
        "key": "salvage",
        "label": "残值",
        "type": "text",
        "default": "1000"
      },
      {
        "key": "life",
        "label": "寿命",
        "type": "text",
        "default": "5"
      },
      {
        "key": "per",
        "label": "第几期",
        "type": "text",
        "default": "1"
      }
    ],
    "template": "=SYD({cost},{salvage},{life},{per})",
    "cases": [
      {
        "label": "首年",
        "type": "ok",
        "values": {
          "cost": "10000",
          "salvage": "1000",
          "life": "5",
          "per": "1"
        },
        "expect": "3000",
        "note": ""
      },
      {
        "label": "末年",
        "type": "ok",
        "values": {
          "cost": "10000",
          "salvage": "1000",
          "life": "5",
          "per": "5"
        },
        "expect": "600",
        "note": ""
      },
      {
        "label": "寿命 0",
        "type": "error",
        "values": {
          "cost": "10000",
          "salvage": "1000",
          "life": "0",
          "per": "1"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "per>life",
        "type": "error",
        "values": {
          "cost": "10000",
          "salvage": "1000",
          "life": "5",
          "per": "9"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法数字",
        "type": "error",
        "values": {
          "cost": "abc",
          "salvage": "1000",
          "life": "5",
          "per": "1"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default sydEntry;
