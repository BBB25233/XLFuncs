import type { FunctionEntry } from '@/types';

/** TBILLPRICE · 国库券价格（financial 类 B9 批次） */

const tbillpriceEntry: FunctionEntry = {
  id: 'tbillprice',
  enName: 'TBILLPRICE',
  zhName: '国库券价格',
  zhCommon: ['TBILLPRICE', '国库券价'],
  alias: ['T-bill 价'],
  category: 'financial',
  abbr: 'gkqjg',
  pinyin: 'guokuquanjiage',
  keywords: ['tbillprice', '国库券', '价格'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '国库券每 100 面值价',
  summary: 'TBILLPRICE 返回面值 100 的国库券按贴现率折算的现价。',
  syntax: {
    patternCn: '=TBILLPRICE(结算日, 到期日, 贴现率)',
    patternEn: '=TBILLPRICE(settlement, maturity, discount)',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期（≤1 年）' },
    { key: 'discount', zh: '贴现率', en: 'discount', required: true, desc: '国库券贴现率' }],
  },
  returnValue: '每 100 面值价格',
  examples: [
    {
      title: '示例：国库券价格',
      scene: '182 天期、贴现率 4%',
      dataAnchor: 'B2',
      formula: '=TBILLPRICE(DATE(2024,1,1),DATE(2024,7,1),0.04)',
      result: '约 97.98',
      explanation: '按贴现率折算的每 100 面值价格。',
    },
    {
      title: '示例：91 天期',
      scene: '贴现率 4%',
      dataAnchor: 'B2',
      formula: '=TBILLPRICE(DATE(2024,1,1),DATE(2024,4,1),0.04)',
      result: '约 98.99',
      explanation: '期限缩短，贴现折价减半。',
    },
  ],
  pitfalls: [{ title: '期限 ≤1 年', reason: '超期报错。', fix: '仅 ≤365 天。', level: 'mid' }],
  related: [{ id: 'tbilleq', kind: 'companion', why: 'TBILLEQ 与本品类相关' },
    { id: 'tbillyield', kind: 'companion', why: 'TBILLYIELD 与本品类相关' },
    { id: 'disc', kind: 'companion', why: 'DISC 与本品类相关' }],
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
    "template": "=TBILLPRICE({settlement},{maturity},{discount})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2024-04-01",
          "discount": "0.05"
        },
        "expect": "98.736111",
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
        "expect": "99.241667",
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

export default tbillpriceEntry;
