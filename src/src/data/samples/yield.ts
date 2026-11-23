import type { FunctionEntry } from '@/types';

/** YIELD · 债券收益率（financial 类 B9 批次） */

const yieldEntry: FunctionEntry = {
  id: 'yield',
  enName: 'YIELD',
  zhName: '债券收益率',
  zhCommon: ['YIELD', '收益率'],
  alias: ['到期收益'],
  category: 'financial',
  abbr: 'zqsyl',
  pinyin: 'zhaiquanshouyilv',
  keywords: ['yield', '债券', '收益'],
  difficulty: 4,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算定期付息债券收益率',
  summary: 'YIELD 返回定期付息债券的年化收益率，是 PRICE 的逆运算，投资决策常用。',
  syntax: {
    patternCn: '=YIELD(结算日, 到期日, 票面率, 价格, 赎回价, 频率, [基准])',
    patternEn: '=YIELD(settlement, maturity, rate, pr, redemption, frequency, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'rate', zh: '票面率', en: 'rate', required: true, desc: '年化票面利率' },
    { key: 'pr', zh: '价格', en: 'pr', required: true, desc: '每 100 面值现价' },
    { key: 'redemption', zh: '赎回价', en: 'redemption', required: true, desc: '每 100 面值赎回价' },
    { key: 'frequency', zh: '频率', en: 'frequency', required: true, desc: '年付息次数 1/2/4' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '年化收益率',
  examples: [
    {
      title: '示例：由价格反推收益率',
      scene: '票面 8%、价格 93.5、十年期',
      dataAnchor: 'B2',
      formula: '=YIELD(DATE(2024,1,1),DATE(2034,1,1),0.08,93.5,100,2,0)',
      result: '约 0.09',
      explanation: 'PRICE 的逆运算。',
    },
    {
      title: '示例：五年期折价债',
      scene: '票面 6%、价格 95、半年付息',
      dataAnchor: 'B2',
      formula: '=YIELD(DATE(2024,1,1),DATE(2029,1,1),0.06,95,100,2,0)',
      result: '约 0.0721',
      explanation: '折价越小，收益率越接近票面利率。',
    },
  ],
  pitfalls: [{ title: '与 PRICE 互逆', reason: '已知价求收益用 YIELD。', fix: '不要拿 PRICE 当收益。', level: 'low' }],
  related: [{ id: 'price', kind: 'companion', why: 'PRICE 与本品类相关' },
    { id: 'yielddisc', kind: 'companion', why: 'YIELDDISC 与本品类相关' },
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
        "default": "2034-01-01"
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
        "default": "93.5"
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
    "template": "=YIELD({settlement},{maturity},{rate},{pr},{redemption},{frequency},{basis})",
    "cases": [
      {
        "label": "折价",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
          "rate": "0.08",
          "pr": "93.5",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "0.090337",
        "note": ""
      },
      {
        "label": "溢价",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
          "rate": "0.08",
          "pr": "105",
          "redemption": "100",
          "frequency": "2",
          "basis": "0"
        },
        "expect": "0.072623",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2034-01-01",
          "rate": "0.08",
          "pr": "93.5",
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
          "pr": "93.5",
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
          "settlement": "2024-01-01",
          "maturity": "2034-01-01",
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

export default yieldEntry;
