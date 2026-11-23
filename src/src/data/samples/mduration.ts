import type { FunctionEntry } from '@/types';

/** MDURATION · 修正久期（financial 类 B9 批次） */

const mdurationEntry: FunctionEntry = {
  id: 'mduration',
  enName: 'MDURATION',
  zhName: '修正久期',
  zhCommon: ['MDURATION', '修正久期'],
  alias: ['修正久期'],
  category: 'financial',
  abbr: 'xzjq',
  pinyin: 'xiuzhengjiuqi',
  keywords: ['mduration', '修正久期', '债券'],
  difficulty: 5,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算价格变动的修正久期',
  summary: 'MDURATION 返回修正久期 = 麦考利久期/(1+收益率/频率)，直接估算收益率变动 1% 的价格变化。',
  syntax: {
    patternCn: '=MDURATION(结算日, 到期日, 票面率, 收益率, 频率, [基准])',
    patternEn: '=MDURATION(settlement, maturity, coupon, yld, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'coupon', zh: '票面率', en: 'coupon', required: true, desc: '年化票面利率' },
    { key: 'yld', zh: '收益率', en: 'yld', required: true, desc: '年化收益率' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数 1/2/4' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '修正久期',
  examples: [
    {
      title: '示例：修正久期',
      scene: '票面 8%、收益 9%、十年期',
      dataAnchor: 'B2',
      formula: '=MDURATION(DATE(2024,1,1),DATE(2034,1,1),0.08,0.09,2,0)',
      result: '约 6.66',
      explanation: '麦考利久期除以 (1+收益率/频率)。',
    },
    {
      title: '示例：五年期修正久期',
      scene: '票面 6%、收益 7%',
      dataAnchor: 'B2',
      formula: '=MDURATION(DATE(2024,1,1),DATE(2029,1,1),0.06,0.07,2,0)',
      result: '约 4.23',
      explanation: '用于估算收益率变动 1% 的价格敏感度。',
    },
  ],
  pitfalls: [{ title: '与 DURATION 关系', reason: '忘了除以 (1+y/f)。', fix: '修正久期 = 麦考利久期/(1+y/f)。', level: 'low' }],
  related: [{ id: 'duration', kind: 'companion', why: 'DURATION 与本品类相关' },
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
        "default": "2024-01-01"
      },
      {
        "key": "maturity",
        "label": "到期日",
        "type": "text",
        "default": "2034-01-01"
      },
      {
        "key": "coupon",
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
    "template": "=MDURATION({settlement},{maturity},{coupon},{yld},{frequency},{basis})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
          "coupon": "0.08",
          "yld": "0.09",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "6.65502",
        "note": ""
      },
      {
        "label": "频率 4",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
          "coupon": "0.08",
          "yld": "0.09",
          "frequency": "4",
          "basis": "0"
        },
        "expect": "6.70616",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2034-01-01",
          "coupon": "0.08",
          "yld": "0.09",
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
          "coupon": "0.08",
          "yld": "0.09",
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
          "coupon": "0.08",
          "yld": "0.09",
          "frequency": "3",
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
          "maturity": "2034-01-01",
          "coupon": "0.08",
          "yld": "0.09",
          "frequency": "2",
          "basis": "9"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default mdurationEntry;
