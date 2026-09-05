import type { FunctionEntry } from '@/types';

/** ODDLPRICE · 奇日付息末价（financial 类 B9 批次） */

const oddlpriceEntry: FunctionEntry = {
  id: 'oddlprice',
  enName: 'ODDLPRICE',
  zhName: '奇日付息末价',
  zhCommon: ['ODDLPRICE', '末期奇付息'],
  alias: ['奇数末期价'],
  category: 'financial',
  abbr: 'qrfxmj',
  pinyin: 'qirifuximojia',
  keywords: ['oddlprice', '债券', '奇付息'],
  difficulty: 5,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '末期不规则付息债券价',
  summary: 'ODDLPRICE 计算最后一期付息日与常规不一致的债券每 100 面值价格。',
  syntax: {
    patternCn: '=ODDLPRICE(结算日, 到期日, 末息日, 票面率, 收益率, 赎回价, 频率, [基准])',
    patternEn: '=ODDLPRICE(settlement, maturity, last_coupon, rate, yld, redemption, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'last', zh: '末息日', en: 'last_coupon', required: true, desc: '最后一个付息日' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'yld', zh: '收益率', en: 'yld', required: true, desc: '年化收益率' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '每 100 面值价格',
  examples: [{ title: '示例：奇末期价', scene: '末息日非标准', dataAnchor: 'B2', formula: '=ODDLPRICE(DATE(2024,2,1),DATE(2029,1,1),DATE(2028,10,1),0.08,0.09,100,2,0)', result: '按参数计算的债券价格', explanation: '末期不规则用本函数。' }],
  pitfalls: [{ title: '末息日参数', reason: '把首息日当末息日。', fix: '末息日用 last_coupon 位置。', level: 'mid' }],
  related: [{ id: 'oddlyield', kind: 'companion', why: 'ODDLYIELD 与本品类相关' },
    { id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' },
    { id: 'yield', kind: 'companion', why: 'YIELD 与本品类相关' }],
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
    "template": "=ODDLPRICE({settlement},{maturity},{last},{rate},{yld},{redemption},{frequency},{basis})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2028-11-01",
          "maturity": "2029-01-01",
          "last": "2028-10-01",
          "rate": "0.08",
          "yld": "0.09",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "101.818554",
        "note": ""
      },
      {
        "label": "频率 1",
        "type": "ok",
        "values": {
          "settlement": "2028-11-01",
          "maturity": "2029-01-01",
          "last": "2028-10-01",
          "rate": "0.08",
          "yld": "0.09",
          "redemption": "100",
          "frequency": "1",
          "basis": "0"
        },
        "expect": "105.793222",
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
          "yld": "0.09",
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
          "settlement": "2028-11-01",
          "maturity": "2029-01-01",
          "last": "2028-10-01",
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

export default oddlpriceEntry;
