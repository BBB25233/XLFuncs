import type { FunctionEntry } from '@/types';

/** XNPV · 不规则净现值（financial 类 B9 批次） */

const xnpvEntry: FunctionEntry = {
  id: 'xnpv',
  enName: 'XNPV',
  zhName: '不规则净现值',
  zhCommon: ['XNPV', '日期折现'],
  alias: ['按日折现'],
  category: 'financial',
  abbr: 'bgzjxz',
  pinyin: 'buguizejingxianzhi',
  keywords: ['xnpv', '净现值', '不规则日期'],
  difficulty: 4,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '按各自日期折现现金流',
  summary: 'XNPV 与 NPV 类似，但每笔现金流都带自己的日期，用实际天数折现，适合付款日不规律的场景。',
  syntax: {
    patternCn: '=XNPV(折现率, 现金流, 日期)',
    patternEn: '=XNPV(rate, values, dates)',
    args: [{ key: 'rate', zh: '折现率', en: 'rate', required: true, desc: '年化折现率' },
    { key: 'values', zh: '现金流', en: 'values', required: true, desc: '现金流区域' },
    { key: 'dates', zh: '日期', en: 'dates', required: true, desc: '与各现金流对应的日期区域' }],
  },
  returnValue: '按日期折现的净现值（数字）',
  examples: [{ title: '示例：不定期回款', scene: '三笔回款日期不同', dataAnchor: 'B2', formula: '=XNPV(0.09,B2:B4,C2:C4)', result: '按实际天数折现的现值之和', explanation: '每笔按距首期的实际天数折现。' }],
  pitfalls: [{ title: '日期须升序且对应', reason: 'dates 与 values 行数、顺序必须一一对应。', fix: '核对两个区域行数一致。', level: 'mid' }],
  related: [{ id: 'npv', kind: 'companion', why: 'NPV 与本品类相关' },
    { id: 'xirr', kind: 'companion', why: 'XIRR 与本品类相关' },
    { id: 'irr', kind: 'companion', why: 'IRR 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "rate",
        "label": "折现率",
        "type": "text",
        "default": "0.09"
      },
      {
        "key": "values",
        "label": "现金流",
        "type": "text",
        "default": "\"-100,50,80,40\""
      },
      {
        "key": "dates",
        "label": "日期",
        "type": "text",
        "default": "\"2024-01-01,2024-06-01,2025-01-01,2025-06-01\""
      }
    ],
    "template": "=XNPV({rate},{values},{dates})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "rate": "0.09",
          "values": "\"-100,50,80,40\"",
          "dates": "\"2024-01-01,2024-06-01,2025-01-01,2025-06-01\""
        },
        "expect": "57.01822",
        "note": ""
      },
      {
        "label": "折现 0.05",
        "type": "ok",
        "values": {
          "rate": "0.05",
          "values": "\"-100,50,80,40\"",
          "dates": "\"2024-01-01,2024-06-01,2025-01-01,2025-06-01\""
        },
        "expect": "62.503664",
        "note": ""
      },
      {
        "label": "数量不一致",
        "type": "error",
        "values": {
          "rate": "0.09",
          "values": "\"-100,50\"",
          "dates": "\"2024-01-01\""
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法折现率",
        "type": "error",
        "values": {
          "rate": "abc",
          "values": "\"-100,50\"",
          "dates": "\"2024-01-01,2024-06-01\""
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "rate": "0.09",
          "values": "\"-100,50\"",
          "dates": "\"abc,2024-06-01\""
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default xnpvEntry;
