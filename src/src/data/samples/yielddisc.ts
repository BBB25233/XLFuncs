import type { FunctionEntry } from '@/types';

/** YIELDDISC · 折价债券收益（financial 类 B9 批次） */

const yielddiscEntry: FunctionEntry = {
  id: 'yielddisc',
  enName: 'YIELDDISC',
  zhName: '折价债券收益',
  zhCommon: ['YIELDDISC', '折价收益'],
  alias: ['贴现收益'],
  category: 'financial',
  abbr: 'zjzqsy',
  pinyin: 'zhejiazhaiquanshouyi',
  keywords: ['yielddisc', '折价', '收益'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '折价债券的年化收益',
  summary: 'YIELDDISC 返回折价发行债券的年化收益率，是 PRICEDISC 的逆运算。',
  syntax: {
    patternCn: '=YIELDDISC(结算日, 到期日, 价格, 赎回价, [基准])',
    patternEn: '=YIELDDISC(settlement, maturity, pr, redemption, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'pr', zh: '价格', en: 'pr', required: true, desc: '每 100 面值现价' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '年化收益率',
  examples: [
    {
      title: '示例：贴现债券收益率',
      scene: '价格 98、面值 100、半年期',
      dataAnchor: 'B2',
      formula: '=YIELDDISC(DATE(2024,1,1),DATE(2024,7,1),98,100,0)',
      result: '约 0.0408',
      explanation: '与 INTRATE 口径接近，按 30/360。',
    },
    {
      title: '示例：价格 96',
      scene: '半年期',
      dataAnchor: 'B2',
      formula: '=YIELDDISC(DATE(2024,1,1),DATE(2024,7,1),96,100,0)',
      result: '约 0.0833',
      explanation: '折价越深，年化收益率越高。',
    },
  ],
  pitfalls: [{ title: '与 YIELD 区别', reason: '折价债无票息。', fix: '折价发行用 YIELDDISC。', level: 'low' }],
  related: [{ id: 'pricedisc', kind: 'companion', why: 'PRICEDISC 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' },
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
        "default": "2025-01-01"
      },
      {
        "key": "pr",
        "label": "价格",
        "type": "text",
        "default": "95.2"
      },
      {
        "key": "redemption",
        "label": "赎回价",
        "type": "text",
        "default": "100"
      },
      {
        "key": "basis",
        "label": "基准",
        "type": "text",
        "default": "0"
      }
    ],
    "template": "=YIELDDISC({settlement},{maturity},{pr},{redemption},{basis})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "pr": "95.2",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "0.05042",
        "note": ""
      },
      {
        "label": "价格 90",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "pr": "90",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "0.111111",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2025-01-01",
          "pr": "95.2",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "结算≥到期",
        "type": "error",
        "values": {
          "settlement": "2025-01-01",
          "maturity": "2025-01-01",
          "pr": "95.2",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "价格≤0",
        "type": "error",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "pr": "0",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default yielddiscEntry;
