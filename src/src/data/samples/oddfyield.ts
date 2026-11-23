import type { FunctionEntry } from '@/types';

/** ODDFYIELD · 奇日付息收益（financial 类 B9 批次） */

const oddfyieldEntry: FunctionEntry = {
  id: 'oddfyield',
  enName: 'ODDFYIELD',
  zhName: '奇日付息收益',
  zhCommon: ['ODDFYIELD', '首期奇收益'],
  alias: ['奇数首期收益'],
  category: 'financial',
  abbr: 'qrfxsy',
  pinyin: 'qirifuxishouyi',
  keywords: ['oddfyield', '债券', '收益'],
  difficulty: 5,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '首期不规则付息债券收益',
  summary: 'ODDFYIELD 是 ODDFPRICE 的逆运算：给定价格反推收益率。',
  syntax: {
    patternCn: '=ODDFYIELD(结算日, 到期日, 发行日, 首息日, 票面率, 价格, 赎回价, 频率, [基准])',
    patternEn: '=ODDFYIELD(settlement, maturity, issue, first_coupon, rate, pr, redemption, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'issue', zh: '发行日', en: 'issue', required: true, desc: '发行日期' },
    { key: 'first', zh: '首息日', en: 'first_coupon', required: true, desc: '首个付息日' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'pr', zh: '价格', en: 'pr', required: true, desc: '每 100 面值现价' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '年化收益率',
  examples: [
    {
      title: '示例：奇首期收益率',
      scene: '由价格 113.6 反推',
      dataAnchor: 'B2',
      formula: '=ODDFYIELD(DATE(2008,11,11),DATE(2021,3,1),DATE(2008,10,15),DATE(2009,3,1),0.0785,113.6,100,2,1)',
      result: '约 0.0625',
      explanation: 'ODDFPRICE 的逆运算。',
    },
    {
      title: '示例：价格 99',
      scene: '其余参数不变',
      dataAnchor: 'B2',
      formula: '=ODDFYIELD(DATE(2008,11,11),DATE(2021,3,1),DATE(2008,10,15),DATE(2009,3,1),0.0785,99,100,2,1)',
      result: '约 0.0798',
      explanation: '价格下降，收益率上升。',
    },
  ],
  pitfalls: [{ title: '与 ODDFPRICE 配对', reason: '两函数互逆易混。', fix: '已知价求收益用 ODDFYIELD。', level: 'low' }],
  related: [{ id: 'oddfprice', kind: 'companion', why: 'ODDFPRICE 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' },
    { id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "settlement",
        "label": "结算日",
        "type": "text",
        "default": "2024-02-01"
      },
      {
        "key": "maturity",
        "label": "到期日",
        "type": "text",
        "default": "2029-01-01"
      },
      {
        "key": "issue",
        "label": "发行日",
        "type": "text",
        "default": "2024-01-01"
      },
      {
        "key": "first",
        "label": "首息日",
        "type": "text",
        "default": "2024-04-01"
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
        "default": "99"
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
    "template": "=ODDFYIELD({settlement},{maturity},{issue},{first},{rate},{pr},{redemption},{frequency},{basis})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-02-01",
          "maturity": "2029-01-01",
          "issue": "2024-01-01",
          "first": "2024-04-01",
          "rate": "0.08",
          "pr": "99",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "0.087925",
        "note": ""
      },
      {
        "label": "价格 101",
        "type": "ok",
        "values": {
          "settlement": "2024-02-01",
          "maturity": "2029-01-01",
          "issue": "2024-01-01",
          "first": "2024-04-01",
          "rate": "0.08",
          "pr": "101",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "0.082578",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2029-01-01",
          "issue": "2024-01-01",
          "first": "2024-04-01",
          "rate": "0.08",
          "pr": "99",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "日期顺序错",
        "type": "error",
        "values": {
          "settlement": "2029-01-01",
          "maturity": "2029-01-01",
          "issue": "2024-01-01",
          "first": "2024-04-01",
          "rate": "0.08",
          "pr": "99",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "价格≤0",
        "type": "error",
        "values": {
          "settlement": "2024-02-01",
          "maturity": "2029-01-01",
          "issue": "2024-01-01",
          "first": "2024-04-01",
          "rate": "0.08",
          "pr": "0",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default oddfyieldEntry;
