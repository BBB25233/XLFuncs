import type { FunctionEntry } from '@/types';

/** NOMINAL · 名义年利率（financial 类 B9 批次） */

const nominalEntry: FunctionEntry = {
  id: 'nominal',
  enName: 'NOMINAL',
  zhName: '名义年利率',
  zhCommon: ['NOMINAL', '名义利率'],
  alias: ['标称利率'],
  category: 'financial',
  abbr: 'mynll',
  pinyin: 'mingyinianlilv',
  keywords: ['nominal', '名义利率', '复利'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把有效利率反推名义利率',
  summary: 'NOMINAL 是 EFFECT 的逆运算：给定有效年利率和复利次数，反推名义年利率。',
  syntax: {
    patternCn: '=NOMINAL(有效年利率, 复利次数)',
    patternEn: '=NOMINAL(effect_rate, npery)',
    args: [{ key: 'effect', zh: '有效年利率', en: 'effect_rate', required: true, desc: '实际到手年利率' },
    { key: 'npery', zh: '复利次数', en: 'npery', required: true, desc: '每年复利次数' }],
  },
  returnValue: '名义年利率（数字）',
  examples: [{ title: '示例：由实效反推', scene: '实效 6.17%、月复利', dataAnchor: 'B2', formula: '=NOMINAL(0.0617,12)', result: '约 0.06（6%）', explanation: '与 EFFECT(0.06,12) 互逆。' }],
  pitfalls: [{ title: '参数顺序别反', reason: '把有效利率当名义利率填会错。', fix: '第一参是有效利率。', level: 'low' }],
  related: [{ id: 'effect', kind: 'companion', why: 'EFFECT 与本品类相关' },
    { id: 'rate', kind: 'companion', why: 'RATE 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "effect",
        "label": "有效年利率",
        "type": "text",
        "default": "0.0617"
      },
      {
        "key": "npery",
        "label": "复利次数",
        "type": "text",
        "default": "12"
      }
    ],
    "template": "=NOMINAL({effect},{npery})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "effect": "0.0617",
          "npery": "12"
        },
        "expect": "0.060021",
        "note": ""
      },
      {
        "label": "季复利",
        "type": "ok",
        "values": {
          "effect": "0.0614",
          "npery": "4"
        },
        "expect": "0.060035",
        "note": ""
      },
      {
        "label": "复利次数 0",
        "type": "error",
        "values": {
          "effect": "0.0617",
          "npery": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法数字",
        "type": "error",
        "values": {
          "effect": "abc",
          "npery": "12"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "复利次数负",
        "type": "error",
        "values": {
          "effect": "0.0617",
          "npery": "-1"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default nominalEntry;
