import type { FunctionEntry } from '@/types';

/** MIRR · 修正内部收益（financial 类 B9 批次） */

const mirrEntry: FunctionEntry = {
  id: 'mirr',
  enName: 'MIRR',
  zhName: '修正内部收益',
  zhCommon: ['MIRR', '修正IRR'],
  alias: ['修正收益'],
  category: 'financial',
  abbr: 'xznbsy',
  pinyin: 'xiuzhengneibushouyi',
  keywords: ['mirr', '修正收益', '投资'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '考虑再投资的修正IRR',
  summary: 'MIRR 改进 IRR：正现金流按再投资率、负现金流按融资率分别折现，结果更稳定唯一。',
  syntax: {
    patternCn: '=MIRR(现金流, 融资率, 再投资率)',
    patternEn: '=MIRR(values, finance_rate, reinvest_rate)',
    args: [{ key: 'values', zh: '现金流', en: 'values', required: true, desc: '按期排列的现金流' },
    { key: 'finance', zh: '融资率', en: 'finance_rate', required: true, desc: '借款利率' },
    { key: 'reinvest', zh: '再投资率', en: 'reinvest_rate', required: true, desc: '回款再投资收益率' }],
  },
  returnValue: '修正内部收益率',
  examples: [{ title: '示例：MIRR', scene: '融资 10%、再投资 12%', dataAnchor: 'B2', formula: '=MIRR(B2:B5,0.1,0.12)', result: '按两率修正的收益率', explanation: '比 IRR 更贴近现实。' }],
  pitfalls: [{ title: '需正负现金流都有', reason: '缺一类会 #DIV/0!。', fix: '确保有投入也有回款。', level: 'mid' }],
  related: [{ id: 'irr', kind: 'companion', why: 'IRR 与本品类相关' },
    { id: 'xirr', kind: 'companion', why: 'XIRR 与本品类相关' },
    { id: 'npv', kind: 'companion', why: 'NPV 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "values",
        "label": "现金流",
        "type": "text",
        "default": "\"-120000,39000,30000,21000,37000\""
      },
      {
        "key": "finance",
        "label": "融资率",
        "type": "text",
        "default": "0.1"
      },
      {
        "key": "reinvest",
        "label": "再投资率",
        "type": "text",
        "default": "0.12"
      }
    ],
    "template": "=MIRR({values},{finance},{reinvest})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "values": "\"-120000,39000,30000,21000,37000\"",
          "finance": "0.1",
          "reinvest": "0.12"
        },
        "expect": "0.069914",
        "note": ""
      },
      {
        "label": "另一组",
        "type": "ok",
        "values": {
          "values": "\"-100,20,30,40,50\"",
          "finance": "0.08",
          "reinvest": "0.1"
        },
        "expect": "0.111272",
        "note": ""
      },
      {
        "label": "全为正",
        "type": "error",
        "values": {
          "values": "\"100,20,30,40\"",
          "finance": "0.1",
          "reinvest": "0.12"
        },
        "expect": "#DIV/0!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "全为负",
        "type": "error",
        "values": {
          "values": "\"-100,-20,-30\"",
          "finance": "0.1",
          "reinvest": "0.12"
        },
        "expect": "#DIV/0!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法数字",
        "type": "error",
        "values": {
          "values": "\"abc,20\"",
          "finance": "0.1",
          "reinvest": "0.12"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default mirrEntry;
