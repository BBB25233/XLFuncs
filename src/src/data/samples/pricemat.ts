import type { FunctionEntry } from '@/types';

/** PRICEMAT · 到期债券价（financial 类 B9 批次） */

const pricematEntry: FunctionEntry = {
  id: 'pricemat',
  enName: 'PRICEMAT',
  zhName: '到期债券价',
  zhCommon: ['PRICEMAT', '到期价'],
  alias: ['到期付息价'],
  category: 'financial',
  abbr: 'dqzqj',
  pinyin: 'daoqizhaiquanjia',
  keywords: ['pricemat', '到期', '债券'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '到期一次付息债券价',
  summary: 'PRICEMAT 返回到期一次付息债券每 100 面值的现价，由票面率与收益率折现。',
  syntax: {
    patternCn: '=PRICEMAT(结算日, 到期日, 发行日, 票面率, 收益率, [基准])',
    patternEn: '=PRICEMAT(settlement, maturity, issue, rate, yld, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'issue', zh: '发行日', en: 'issue', required: true, desc: '发行日期' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'yld', zh: '收益率', en: 'yld', required: true, desc: '年化收益率' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '每 100 面值价格',
  examples: [{ title: '示例：到期价', scene: '票面 8%、收益 8%、1 年', dataAnchor: 'B2', formula: '=PRICEMAT(DATE(2024,1,1),DATE(2025,1,1),DATE(2024,1,1),0.08,0.08,0)', result: '约 100.0', explanation: '收益=票面，价≈面值。' }],
  pitfalls: [{ title: '与 PRICE 区分', reason: 'PRICEMAT 是到期一次付息。', fix: '定期付息用 PRICE。', level: 'low' }],
  related: [{ id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' },
    { id: 'pricedisc', kind: 'companion', why: 'PRICEDISC 与本品类相关' },
    { id: 'yieldmat', kind: 'companion', why: 'YIELDMAT 与本品类相关' }],
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
        "key": "yld",
        "label": "收益率",
        "type": "text",
        "default": "0.08"
      },
      {
        "key": "basis",
        "label": "基准",
        "type": "text",
        "default": "0"
      }
    ],
    "template": "=PRICEMAT({settlement},{maturity},{issue},{rate},{yld},{basis})",
    "cases": [
      {
        "label": "平价",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "issue": "2024-01-01",
          "rate": "0.08",
          "yld": "0.08",
          "basis": "0"
        },
        "expect": "100",
        "note": ""
      },
      {
        "label": "收益 0.09",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "issue": "2024-01-01",
          "rate": "0.08",
          "yld": "0.09",
          "basis": "0"
        },
        "expect": "99.082569",
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
          "yld": "0.08",
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
          "yld": "0.08",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "基准非法",
        "type": "error",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "issue": "2024-01-01",
          "rate": "0.08",
          "yld": "0.08",
          "basis": "9"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default pricematEntry;
