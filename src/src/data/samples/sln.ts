import type { FunctionEntry } from '@/types';

/** SLN · 直线折旧（financial 类 B9 批次） */

const slnEntry: FunctionEntry = {
  id: 'sln',
  enName: 'SLN',
  zhName: '直线折旧',
  zhCommon: ['SLN', '直线法'],
  alias: ['平均折旧'],
  category: 'financial',
  abbr: 'zxzj',
  pinyin: 'zhixianzhejiu',
  keywords: ['sln', '折旧', '直线'],
  difficulty: 2,
  usageLevel: 5,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '每期平均分摊折旧',
  summary: 'SLN 用直线法把资产成本减残值后，在寿命期内等额折旧，最简单直观。',
  syntax: {
    patternCn: '=SLN(原值, 残值, 寿命)',
    patternEn: '=SLN(cost, salvage, life)',
    args: [{ key: 'cost', zh: '原值', en: 'cost', required: true, desc: '资产购入成本' },
    { key: 'salvage', zh: '残值', en: 'salvage', required: true, desc: '报废时残值' },
    { key: 'life', zh: '寿命', en: 'life', required: true, desc: '折旧期数（年/期）' }],
  },
  returnValue: '每期折旧额（正数）',
  examples: [
    {
      title: '示例：直线折旧',
      scene: '原值 1 万、残值 1000、5 年',
      dataAnchor: 'B2',
      formula: '=SLN(10000,1000,5)',
      result: '1800',
      explanation: '每年折旧额相同。',
    },
    {
      title: '示例：十年期资产',
      scene: '原值 5 万、残值 5000、10 年',
      dataAnchor: 'B2',
      formula: '=SLN(50000,5000,10)',
      result: '4500',
      explanation: '延长折旧年限会摊薄每年折旧。',
    },
  ],
  pitfalls: [{ title: '寿命为 0 报错', reason: 'life 为 0 会 #DIV/0!。', fix: '寿命必须 >0。', level: 'low' }],
  related: [{ id: 'syd', kind: 'companion', why: 'SYD 与本品类相关' },
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
      }
    ],
    "template": "=SLN({cost},{salvage},{life})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "cost": "10000",
          "salvage": "1000",
          "life": "5"
        },
        "expect": "1800",
        "note": ""
      },
      {
        "label": "寿命 10",
        "type": "ok",
        "values": {
          "cost": "10000",
          "salvage": "1000",
          "life": "10"
        },
        "expect": "900",
        "note": ""
      },
      {
        "label": "寿命 0",
        "type": "error",
        "values": {
          "cost": "10000",
          "salvage": "1000",
          "life": "0"
        },
        "expect": "#DIV/0!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法数字",
        "type": "error",
        "values": {
          "cost": "abc",
          "salvage": "1000",
          "life": "5"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "缺少残值",
        "type": "error",
        "values": {
          "cost": "10000",
          "salvage": "abc",
          "life": "5"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default slnEntry;
