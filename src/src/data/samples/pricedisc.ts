import type { FunctionEntry } from '@/types';

/** PRICEDISC · 折价债券价（financial 类 B9 批次） */

const pricediscEntry: FunctionEntry = {
  id: 'pricedisc',
  enName: 'PRICEDISC',
  zhName: '折价债券价',
  zhCommon: ['PRICEDISC', '折价价'],
  alias: ['贴现债券价'],
  category: 'financial',
  abbr: 'zjzqj',
  pinyin: 'zhejiazhaiquanjia',
  keywords: ['pricedisc', '折价', '债券'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '折价发行债券的价格',
  summary: 'PRICEDISC 返回折价发行（不付票息）债券每 100 面值的现价，由贴现率折现赎回价。',
  syntax: {
    patternCn: '=PRICEDISC(结算日, 到期日, 贴现率, 赎回价, [基准])',
    patternEn: '=PRICEDISC(settlement, maturity, discount, redemption, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'discount', zh: '贴现率', en: 'discount', required: true, desc: '年化贴现率' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '每 100 面值价格',
  examples: [{ title: '示例：折价价', scene: '贴现 5%、赎回 100', dataAnchor: 'B2', formula: '=PRICEDISC(DATE(2024,1,1),DATE(2025,1,1),0.05,100,0)', result: '约 95.2', explanation: '按贴现率折价。' }],
  pitfalls: [{ title: '用 discount 非 yield', reason: '折价债用贴现率，不是票息收益率。', fix: '第一参填贴现率。', level: 'low' }],
  related: [{ id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' },
    { id: 'yielddisc', kind: 'companion', why: 'YIELDDISC 与本品类相关' },
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
        "key": "discount",
        "label": "贴现率",
        "type": "text",
        "default": "0.05"
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
    "template": "=PRICEDISC({settlement},{maturity},{discount},{redemption},{basis})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "discount": "0.05",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "95",
        "note": ""
      },
      {
        "label": "贴现 3%",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "discount": "0.03",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "97",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2025-01-01",
          "discount": "0.05",
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
          "discount": "0.05",
          "redemption": "100",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "贴现率≤0",
        "type": "error",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "discount": "0",
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

export default pricediscEntry;
