import type { FunctionEntry } from '@/types';

/** YIELDMAT · 到期债券收益（financial 类 B9 批次） */

const yieldmatEntry: FunctionEntry = {
  id: 'yieldmat',
  enName: 'YIELDMAT',
  zhName: '到期债券收益',
  zhCommon: ['YIELDMAT', '到期收益'],
  alias: ['到期付息收益'],
  category: 'financial',
  abbr: 'dqzqsy',
  pinyin: 'daoqizhaiquanshouyi',
  keywords: ['yieldmat', '到期', '收益'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '到期一次付息债券收益',
  summary: 'YIELDMAT 返回到期一次付息债券的年化收益率，是 PRICEMAT 的逆运算。',
  syntax: {
    patternCn: '=YIELDMAT(结算日, 到期日, 发行日, 票面率, 价格, [基准])',
    patternEn: '=YIELDMAT(settlement, maturity, issue, rate, pr, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'issue', zh: '发行日', en: 'issue', required: true, desc: '发行日期' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'pr', zh: '价格', en: 'pr', required: true, desc: '每 100 面值现价' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '年化收益率',
  examples: [
    {
      title: '示例：到期付息债收益率',
      scene: '票面 6%、价格 98.5、半年后到期',
      dataAnchor: 'B2',
      formula: '=YIELDMAT(DATE(2024,3,15),DATE(2024,6,15),DATE(2023,11,15),0.06,98.5,0)',
      result: '约 0.1194',
      explanation: '价格低于面值时收益率高于票面。',
    },
    {
      title: '示例：接近面值',
      scene: '票面 5%、价格 99、实际天数基准',
      dataAnchor: 'B2',
      formula: '=YIELDMAT(DATE(2024,3,15),DATE(2024,9,30),DATE(2023,12,1),0.05,99,1)',
      result: '约 0.0681',
      explanation: '价格接近面值时，收益率略高于票面。',
    },
  ],
  pitfalls: [{ title: '与 YIELDDISC 区分', reason: '到期付息 vs 折价。', fix: '按付息方式选。', level: 'low' }],
  related: [{ id: 'pricemat', kind: 'companion', why: 'PRICEMAT 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' },
    { id: 'yielddisc', kind: 'companion', why: 'YIELDDISC 与本品类相关' }],
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
        "key": "issue",
        "label": "发行日",
        "type": "text",
        "default": "2024-01-01"
      },
      {
        "key": "rate",
        "label": "票面率",
        "type": "text",
        "default": "0.08"
      },
      {
        "key": "pr",
        "label": "价格",
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
    "template": "=YIELDMAT({settlement},{maturity},{issue},{rate},{pr},{basis})",
    "cases": [
      {
        "label": "平价",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "issue": "2024-01-01",
          "rate": "0.08",
          "pr": "100",
          "basis": "0"
        },
        "expect": "0.08",
        "note": ""
      },
      {
        "label": "价格 95",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "issue": "2024-01-01",
          "rate": "0.08",
          "pr": "95",
          "basis": "0"
        },
        "expect": "0.136842",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2025-01-01",
          "issue": "2024-01-01",
          "rate": "0.08",
          "pr": "100",
          "basis": "0"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "日期顺序错",
        "type": "error",
        "values": {
          "settlement": "2025-01-01",
          "maturity": "2025-01-01",
          "issue": "2024-01-01",
          "rate": "0.08",
          "pr": "100",
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
          "issue": "2024-01-01",
          "rate": "0.08",
          "pr": "0",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default yieldmatEntry;
