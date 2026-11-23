import type { FunctionEntry } from '@/types';

/** PRICE · 债券价格（financial 类 B9 批次） */

const priceEntry: FunctionEntry = {
  id: 'price',
  enName: 'PRICE',
  zhName: '债券价格',
  zhCommon: ['PRICE', '债券价'],
  alias: ['每百面值价'],
  category: 'financial',
  abbr: 'zqjg',
  pinyin: 'zhaiquanjiage',
  keywords: ['price', '债券', '价格'],
  difficulty: 4,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算每 100 面值的债券价',
  summary: 'PRICE 返回定期付息债券每 100 面值的现价，由收益率折现各期票息与本金得到。',
  syntax: {
    patternCn: '=PRICE(结算日, 到期日, 票面率, 收益率, 赎回价, 频率, [基准])',
    patternEn: '=PRICE(settlement, maturity, rate, yld, redemption, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'yld', zh: '收益率', en: 'yld', required: true, desc: '年化收益率' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数 1/2/4' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '每 100 面值价格',
  examples: [
    {
      title: '示例：十年期债券定价',
      scene: '票面 8%、市场收益 9%、半年付息',
      dataAnchor: 'B2',
      formula: '=PRICE(DATE(2024,1,1),DATE(2034,1,1),0.08,0.09,100,2,0)',
      result: '约 93.5',
      explanation: '收益率高于票面，价格低于面值。',
    },
    {
      title: '示例：五年期债券定价',
      scene: '票面 6%、市场收益 7%',
      dataAnchor: 'B2',
      formula: '=PRICE(DATE(2024,1,1),DATE(2029,1,1),0.06,0.07,100,2,0)',
      result: '约 95.84',
      explanation: '期限缩短，折价幅度收窄。',
    },
  ],
  pitfalls: [{ title: '价格按每 100 面值', reason: '直接用实际面值会量级错。', fix: '单位用每 100 面值。', level: 'mid' }],
  related: [{ id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' },
    { id: 'pricedisc', kind: 'companion', why: 'PRICEDISC 与本品类相关' },
    { id: 'pricemat', kind: 'companion', why: 'PRICEMAT 与本品类相关' }],
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
        "default": "2034-01-01"
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
        "default": "0.09"
      },
      {
        "key": "redemption",
        "label": "赎回价",
        "type": "text",
        "default": "100"
      },
      {
        "key": "frequency",
        "label": "频率",
        "type": "text",
        "default": "2"
      },
      {
        "key": "basis",
        "label": "基准",
        "type": "text",
        "default": "0"
      }
    ],
    "template": "=PRICE({settlement},{maturity},{rate},{yld},{redemption},{frequency},{basis})",
    "cases": [
      {
        "label": "折价",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
          "rate": "0.08",
          "yld": "0.09",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "93.703353",
        "note": ""
      },
      {
        "label": "溢价",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
          "rate": "0.10",
          "yld": "0.09",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "106.296647",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2034-01-01",
          "rate": "0.08",
          "yld": "0.09",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "结算≥到期",
        "type": "error",
        "values": {
          "settlement": "2034-01-01",
          "maturity": "2034-01-01",
          "rate": "0.08",
          "yld": "0.09",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "频率非法",
        "type": "error",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
          "rate": "0.08",
          "yld": "0.09",
          "redemption": "100",
          "frequency": "3",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default priceEntry;
