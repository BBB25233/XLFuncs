import type { FunctionEntry } from '@/types';

/** ODDLYIELD · 奇日付息末收益（financial 类 B9 批次） */

const oddlyieldEntry: FunctionEntry = {
  id: 'oddlyield',
  enName: 'ODDLYIELD',
  zhName: '奇日付息末收益',
  zhCommon: ['ODDLYIELD', '末期奇收益'],
  alias: ['奇数末期收益'],
  category: 'financial',
  abbr: 'qrfxmsy',
  pinyin: 'qirifuximoshouyi',
  keywords: ['oddlyield', '债券', '收益'],
  difficulty: 5,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '末期不规则付息债券收益',
  summary: 'ODDLYIELD 是 ODDLPRICE 的逆运算：给定价格反推末期不规则付息债券的收益率。',
  syntax: {
    patternCn: '=ODDLYIELD(结算日, 到期日, 末息日, 票面率, 价格, 赎回价, 频率, [基准])',
    patternEn: '=ODDLYIELD(settlement, maturity, last_coupon, rate, pr, redemption, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'last', zh: '末息日', en: 'last_coupon', required: true, desc: '最后一个付息日' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'pr', zh: '价格', en: 'pr', required: true, desc: '每 100 面值现价' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '年化收益率',
  examples: [{ title: '示例：奇末期收益', scene: '已知价格反推', dataAnchor: 'B2', formula: '=ODDLYIELD(DATE(2024,2,1),DATE(2029,1,1),DATE(2028,10,1),0.08,99,100,2,0)', result: '按参数计算的收益率', explanation: '价格→收益用本函数。' }],
  pitfalls: [{ title: '与 ODDLPRICE 配对', reason: '两函数互逆易混。', fix: '已知价求收益用 ODDLYIELD。', level: 'low' }],
  related: [{ id: 'oddlprice', kind: 'companion', why: 'ODDLPRICE 与本品类相关' },
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
        "key": "last",
        "label": "末息日",
        "type": "text",
        "default": "2028-10-01"
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
    "template": "=ODDLYIELD({settlement},{maturity},{last},{rate},{pr},{redemption},{frequency},{basis})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2028-11-01",
          "maturity": "2029-01-01",
          "last": "2028-10-01",
          "rate": "0.08",
          "pr": "99",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "0.272376",
        "note": ""
      },
      {
        "label": "价格 101",
        "type": "ok",
        "values": {
          "settlement": "2028-11-01",
          "maturity": "2029-01-01",
          "last": "2028-10-01",
          "rate": "0.08",
          "pr": "101",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "0.14089",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2029-01-01",
          "last": "2028-10-01",
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
          "last": "2028-10-01",
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
          "settlement": "2028-11-01",
          "maturity": "2029-01-01",
          "last": "2028-10-01",
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

export default oddlyieldEntry;
