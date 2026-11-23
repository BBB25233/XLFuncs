import type { FunctionEntry } from '@/types';

/** PPMT · 本金还款额（financial 类 B9 批次） */

const ppmtEntry: FunctionEntry = {
  id: 'ppmt',
  enName: 'PPMT',
  zhName: '本金还款额',
  zhCommon: ['PPMT', '本金', '分期'],
  alias: ['本金部分'],
  category: 'financial',
  abbr: 'bjhke',
  pinyin: 'benjinhaikuane',
  keywords: ['ppmt', '本金', '还款', '贷款'],
  difficulty: 3,
  usageLevel: 5,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算某期还了多少本金',
  summary: 'PPMT 返回等额分期里指定那一期偿还的本金部分，和 IPMT 相加等于当期总还款。',
  syntax: {
    patternCn: '=PPMT(利率, 第几期, 总期数, 现值, [终值], [类型])',
    patternEn: '=PPMT(rate, per, nper, pv, [fv], [type])',
    args: [{ key: 'rate', zh: '利率', en: 'rate', required: true, desc: '每期利率' },
    { key: 'per', zh: '第几期', en: 'per', required: true, desc: '要查的期数' },
    { key: 'nper', zh: '总期数', en: 'nper', required: true, desc: '还款总期数' },
    { key: 'pv', zh: '现值', en: 'pv', required: true, desc: '贷款本金' },
    { key: 'fv', zh: '终值', en: 'fv', required: false, desc: '期末余款，默认 0' },
    { key: 'type', zh: '类型', en: 'type', required: false, desc: '0 期末付/1 期初付，默认 0' }],
  },
  returnValue: '该期本金金额（负数表示支出）',
  examples: [
    {
      title: '示例：首期本金',
      scene: '贷款 10 万、5% 年利、60 期',
      dataAnchor: 'B2',
      formula: '=PPMT(5%/12,1,60,100000)',
      result: '约 -1470.46',
      explanation: '第 1 期偿还的本金部分。',
    },
    {
      title: '示例：第 12 期本金',
      scene: '月利率 0.6%、60 期',
      dataAnchor: 'B2',
      formula: '=PPMT(0.006,12,60,100000)',
      result: '约 -1484.08',
      explanation: '利息随余额下降，本金部分逐期上升。',
    },
  ],
  pitfalls: [{ title: '利率与期数单位不一致', reason: '年利率直接当月利率用会差 12 倍。', fix: '月供用 年利率/12、期数填月数。', level: 'high' }],
  related: [{ id: 'ipmt', kind: 'companion', why: 'IPMT 与本品类相关' },
    { id: 'pmt', kind: 'companion', why: 'PMT 与本品类相关' },
    { id: 'pv', kind: 'companion', why: 'PV 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "rate",
        "label": "利率",
        "type": "text",
        "default": "0.05/12"
      },
      {
        "key": "per",
        "label": "第几期",
        "type": "text",
        "default": "1"
      },
      {
        "key": "nper",
        "label": "总期数",
        "type": "text",
        "default": "60"
      },
      {
        "key": "pv",
        "label": "现值",
        "type": "text",
        "default": "100000"
      },
      {
        "key": "fv",
        "label": "终值",
        "type": "text",
        "default": "0"
      },
      {
        "key": "type",
        "label": "类型",
        "type": "text",
        "default": "0"
      }
    ],
    "template": "=PPMT({rate},{per},{nper},{pv},{fv},{type})",
    "cases": [
      {
        "label": "首期",
        "type": "ok",
        "values": {
          "rate": "0.0041667",
          "per": "1",
          "nper": "60",
          "pv": "100000",
          "fv": "0",
          "type": "0"
        },
        "expect": "-1470.455197",
        "note": ""
      },
      {
        "label": "第 12 期",
        "type": "ok",
        "values": {
          "rate": "0.0041667",
          "per": "12",
          "nper": "60",
          "pv": "100000",
          "fv": "0",
          "type": "0"
        },
        "expect": "-1539.273401",
        "note": ""
      },
      {
        "label": "期数 0",
        "type": "error",
        "values": {
          "rate": "0.0041667",
          "per": "1",
          "nper": "0",
          "pv": "100000",
          "fv": "0",
          "type": "0"
        },
        "expect": "#DIV/0!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "per> nper",
        "type": "error",
        "values": {
          "rate": "0.0041667",
          "per": "99",
          "nper": "60",
          "pv": "100000",
          "fv": "0",
          "type": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法利率",
        "type": "error",
        "values": {
          "rate": "abc",
          "per": "1",
          "nper": "60",
          "pv": "100000",
          "fv": "0",
          "type": "0"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ppmtEntry;
