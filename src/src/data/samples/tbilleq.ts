import type { FunctionEntry } from '@/types';

/** TBILLEQ · 国库券等价收益（financial 类 B9 批次） */

const tbilleqEntry: FunctionEntry = {
  id: 'tbilleq',
  enName: 'TBILLEQ',
  zhName: '国库券等价收益',
  zhCommon: ['TBILLEQ', '等价收益'],
  alias: ['债券等价收益'],
  category: 'financial',
  abbr: 'gkqdjsy',
  pinyin: 'guokuquandengjiashouyi',
  keywords: ['tbilleq', '国库券', '收益'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '国库券的债券等价收益',
  summary: 'TBILLEQ 把国库券的贴现收益换算成债券等价收益率（按 365 天），便于横向比较。',
  syntax: {
    patternCn: '=TBILLEQ(结算日, 到期日, 贴现率)',
    patternEn: '=TBILLEQ(settlement, maturity, discount)',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期（≤1 年）' },
    { key: 'discount', zh: '贴现率', en: 'discount', required: true, desc: '国库券贴现率' }],
  },
  returnValue: '债券等价收益率',
  examples: [
    {
      title: '示例：国库券等价收益率',
      scene: '182 天期、贴现率 4%',
      dataAnchor: 'B2',
      formula: '=TBILLEQ(DATE(2024,1,1),DATE(2024,7,1),0.04)',
      result: '约 0.0414',
      explanation: '把贴现率换算成债券等价收益率。',
    },
    {
      title: '示例：更短期限',
      scene: '91 天期、贴现率 4%',
      dataAnchor: 'B2',
      formula: '=TBILLEQ(DATE(2024,1,1),DATE(2024,4,1),0.04)',
      result: '约 0.0410',
      explanation: '期限越短，等价收益率与贴现率差距越小。',
    },
  ],
  pitfalls: [{ title: '期限 ≤1 年', reason: '国库券期限超过 1 年会 #NUM!。', fix: '仅用于 ≤365 天。', level: 'mid' }],
  related: [{ id: 'tbillprice', kind: 'companion', why: 'TBILLPRICE 与本品类相关' },
    { id: 'tbillyield', kind: 'companion', why: 'TBILLYIELD 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "settlement",
        "label": "结算日",
        "type": "text",
        "default": "2024-01-01"
      },
      {
        "key": "maturity",
        "label": "到期日",
        "type": "text",
        "default": "2024-04-01"
      },
      {
        "key": "discount",
        "label": "贴现率",
        "type": "text",
        "default": "0.05"
      }
    ],
    "template": "=TBILLEQ({settlement},{maturity},{discount})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2024-04-01",
          "discount": "0.05"
        },
        "expect": "0.051343",
        "note": ""
      },
      {
        "label": "贴现 3%",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2024-04-01",
          "discount": "0.03"
        },
        "expect": "0.030649",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2024-04-01",
          "discount": "0.05"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "结算≥到期",
        "type": "error",
        "values": {
          "settlement": "2024-04-01",
          "maturity": "2024-04-01",
          "discount": "0.05"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "期限>1年",
        "type": "error",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-04-01",
          "discount": "0.05"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default tbilleqEntry;
