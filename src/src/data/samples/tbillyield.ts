import type { FunctionEntry } from '@/types';

/** TBILLYIELD · 国库券收益（financial 类 B9 批次） */

const tbillyieldEntry: FunctionEntry = {
  id: 'tbillyield',
  enName: 'TBILLYIELD',
  zhName: '国库券收益',
  zhCommon: ['TBILLYIELD', '国库券收益'],
  alias: ['T-bill 收益'],
  category: 'financial',
  abbr: 'gkqsy',
  pinyin: 'guokuquanshouyi',
  keywords: ['tbillyield', '国库券', '收益'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由价格反推国库券收益',
  summary: 'TBILLYIELD 是 TBILLPRICE 的逆运算：给定现价反推国库券的贴现收益。',
  syntax: {
    patternCn: '=TBILLYIELD(结算日, 到期日, 价格)',
    patternEn: '=TBILLYIELD(settlement, maturity, pr)',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期（≤1 年）' },
    { key: 'pr', zh: '价格', en: 'pr', required: true, desc: '每 100 面值现价' }],
  },
  returnValue: '贴现收益率',
  examples: [{ title: '示例：国库券收益', scene: '现价 98.75', dataAnchor: 'B2', formula: '=TBILLYIELD(DATE(2024,1,1),DATE(2024,4,1),98.75)', result: '约 0.05', explanation: '价格→收益用本函数。' }],
  pitfalls: [{ title: '与 TBILLEQ 区别', reason: 'TBILLEQ 是等价收益，TBILLYIELD 是贴现收益。', fix: '按需要选对函数。', level: 'low' }],
  related: [{ id: 'tbillprice', kind: 'companion', why: 'TBILLPRICE 与本品类相关' },
    { id: 'tbilleq', kind: 'companion', why: 'TBILLEQ 与本品类相关' },
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
        "key": "pr",
        "label": "价格",
        "type": "text",
        "default": "98.75"
      }
    ],
    "template": "=TBILLYIELD({settlement},{maturity},{pr})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2024-04-01",
          "pr": "98.75"
        },
        "expect": "0.050077",
        "note": ""
      },
      {
        "label": "价格 99",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2024-04-01",
          "pr": "99"
        },
        "expect": "0.03996",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2024-04-01",
          "pr": "98.75"
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
          "pr": "98.75"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "价格≤0",
        "type": "error",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2024-04-01",
          "pr": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default tbillyieldEntry;
