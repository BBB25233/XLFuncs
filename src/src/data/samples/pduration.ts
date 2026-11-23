import type { FunctionEntry } from '@/types';

/** PDURATION · 达到目标值所需期数（financial 类 B9 批次） */

const pdurationEntry: FunctionEntry = {
  id: 'pduration',
  enName: 'PDURATION',
  zhName: '达到目标值所需期数',
  zhCommon: ['PDURATION', '所需期数'],
  alias: ['增值期数', '到达目标期数'],
  category: 'financial',
  abbr: 'qss',
  pinyin: 'suoxuqishu',
  keywords: ['pduration', '期数', '复利', '投资'],
  difficulty: 4,
  usageLevel: 1,
  version: { min: 'all', label: 'Excel 2013 起可用' },
  oneLiner: '算达到目标金额需要多少期',
  summary: 'PDURATION 返回在给定利率下，投资从现值增长到目标值所需的期数，按复利计算。',
  syntax: {
    patternCn: '=PDURATION(利率, 现值, 终值)',
    patternEn: '=PDURATION(rate, pv, fv)',
    args: [{ key: 'rate', zh: '利率', en: 'rate', required: true, desc: '每期利率' },
    { key: 'pv', zh: '现值', en: 'pv', required: true, desc: '期初价值' },
    { key: 'fv', zh: '终值', en: 'fv', required: true, desc: '目标价值' }],
  },
  returnValue: '所需期数',
  examples: [
    {
      title: '示例：达到目标金额所需期数',
      scene: '利率 5%，100 增长到 200',
      dataAnchor: 'B2',
      formula: '=PDURATION(0.05,100,200)',
      result: '约 14.2',
      explanation: '按复利计算翻倍所需年数。',
    },
    {
      title: '示例：4% 利率增长 50%',
      scene: '现值 100、终值 150',
      dataAnchor: 'B2',
      formula: '=PDURATION(0.04,100,150)',
      result: '约 10.34',
      explanation: '利率越低，达到目标所需期数越多。',
    },
  ],
  pitfalls: [{ title: '与 DURATION 不同', reason: 'PDURATION 是投资增值期数，非债券久期。', fix: '债券久期用 DURATION。', level: 'low' }],
  related: [{ id: 'rri', kind: 'companion', why: 'RRI 与本品类相关' },
    { id: 'duration', kind: 'companion', why: 'DURATION 与本品类相关' },
    { id: 'fv', kind: 'companion', why: 'FV 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "rate",
        "label": "利率",
        "type": "text",
        "default": "0.05"
      },
      {
        "key": "pv",
        "label": "现值",
        "type": "text",
        "default": "100"
      },
      {
        "key": "fv",
        "label": "终值",
        "type": "text",
        "default": "200"
      }
    ],
    "template": "=PDURATION({rate},{pv},{fv})",
    "cases": [
      {
        "label": "翻倍",
        "type": "ok",
        "values": {
          "rate": "0.05",
          "pv": "100",
          "fv": "200"
        },
        "expect": "14.206699",
        "note": ""
      },
      {
        "label": "翻倍2",
        "type": "ok",
        "values": {
          "rate": "0.1",
          "pv": "100",
          "fv": "200"
        },
        "expect": "7.272541",
        "note": ""
      },
      {
        "label": "现值≤0",
        "type": "error",
        "values": {
          "rate": "0.05",
          "pv": "0",
          "fv": "200"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "利率≤-1",
        "type": "error",
        "values": {
          "rate": "-2",
          "pv": "100",
          "fv": "200"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法数字",
        "type": "error",
        "values": {
          "rate": "abc",
          "pv": "100",
          "fv": "200"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default pdurationEntry;
