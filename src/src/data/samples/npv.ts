import type { FunctionEntry } from '@/types';

/** NPV · 净现值（financial 类 B9 批次） */

const npvEntry: FunctionEntry = {
  id: 'npv',
  enName: 'NPV',
  zhName: '净现值',
  zhCommon: ['NPV', '折现', '投资回报'],
  alias: ['净现值'],
  category: 'financial',
  abbr: 'jxz',
  pinyin: 'jingxianzhi',
  keywords: ['npv', '净现值', '折现', '投资'],
  difficulty: 2,
  usageLevel: 8,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把未来现金流折成今天的价值',
  summary: 'NPV 按固定折现率把各期现金流折算成现值并求和，>0 说明项目赚钱。投资评估核心函数。',
  syntax: {
    patternCn: '=NPV(折现率, 现金流1, [现金流2]…)',
    patternEn: '=NPV(rate, value1, [value2]…)',
    args: [{ key: 'rate', zh: '折现率', en: 'rate', required: true, desc: '每期折现率，如 10% 写 0.1' },
    { key: 'value', zh: '现金流', en: 'value1,[value2]…', required: true, desc: '按顺序的各期现金流' }],
  },
  returnValue: '净现值（数字）',
  examples: [{ title: '示例：三年项目评估', scene: '后三年分别回款 3000/4200/6800，折现 10%', dataAnchor: 'B2', formula: '=NPV(0.1,B2:B4)', result: '约 10765.7', explanation: '三笔现金流折到今天相加。' },
    { title: '示例：含期初投入', scene: '期初先投 10000', dataAnchor: 'B1', formula: '=B1+NPV(0.1,B2:B4)', result: '约 765.7', explanation: 'NPV 从第 1 期起算，期初投入要单独加减。' }],
  pitfalls: [{ title: '期初投入被多折一期', reason: 'NPV 默认现金流从第 1 期开始，把期初投入也放进去会多折一次。', fix: '期初投入单列：=B1+NPV(rate,后续)。', level: 'high' }],
  related: [{ id: 'irr', kind: 'companion', why: 'IRR 与本品类相关' },
    { id: 'xnpv', kind: 'companion', why: 'XNPV 与本品类相关' },
    { id: 'pv', kind: 'companion', why: 'PV 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "rate",
        "label": "折现率",
        "type": "text",
        "default": "0.1"
      },
      {
        "key": "value",
        "label": "现金流",
        "type": "text",
        "default": "\"3000,4200,6800\""
      }
    ],
    "template": "=NPV({rate},{value})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "rate": "0.1",
          "value": "\"3000,4200,6800\""
        },
        "expect": "11307.287754",
        "note": ""
      },
      {
        "label": "单笔",
        "type": "ok",
        "values": {
          "rate": "0.1",
          "value": "\"1000\""
        },
        "expect": "909.090909",
        "note": ""
      },
      {
        "label": "非法折现率",
        "type": "error",
        "values": {
          "rate": "abc",
          "value": "\"3000,4200\""
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法现金流",
        "type": "error",
        "values": {
          "rate": "0.1",
          "value": "\"abc,4200\""
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "空列表",
        "type": "error",
        "values": {
          "rate": "0.1",
          "value": "\"\""
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default npvEntry;
