import type { FunctionEntry } from '@/types';

/** XIRR · 不规则内部收益（financial 类 B9 批次） */

const xirrEntry: FunctionEntry = {
  id: 'xirr',
  enName: 'XIRR',
  zhName: '不规则内部收益',
  zhCommon: ['XIRR', '不规则IRR'],
  alias: ['按日内部收益'],
  category: 'financial',
  abbr: 'bgznbsy',
  pinyin: 'buguizeneibushouyi',
  keywords: ['xirr', '内部收益', '不规则'],
  difficulty: 4,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '按日期算内部收益率',
  summary: 'XIRR 是 IRR 的按日版本：每笔现金流带自己的日期，适合付款日不规律的项目的内部收益率。',
  syntax: {
    patternCn: '=XIRR(现金流, 日期, [猜测])',
    patternEn: '=XIRR(values, dates, [guess])',
    args: [{ key: 'values', zh: '现金流', en: 'values', required: true, desc: '现金流区域（含一笔负值投入）' },
    { key: 'dates', zh: '日期', en: 'dates', required: true, desc: '对应日期区域' },
    { key: 'guess', zh: '猜测', en: 'guess', required: false, desc: '初始猜测，默认 0.1' }],
  },
  returnValue: '内部收益率',
  examples: [
    {
      title: '示例：不定期回款',
      scene: '投入 1 万，四笔现金流日期不同',
      dataAnchor: 'B2',
      formula: '=XIRR(B2:B5,C2:C5)',
      result: '约 0.5138',
      explanation: '按实际天数折现求年化收益率。',
      dataTsv: '现金流\t日期\n-10000\t2024-01-01\n4000\t2024-06-01\n5000\t2025-01-01\n6000\t2025-06-01',
    },
    {
      title: '示例：等额回款三年',
      scene: '投入 5000，三年各回 2500',
      dataAnchor: 'B2',
      formula: '=XIRR(B2:B5,C2:C5)',
      result: '约 0.3701',
      explanation: '回款间隔不等也能按天折算。',
      dataTsv: '现金流\t日期\n-5000\t2024-01-01\n2500\t2024-09-01\n2500\t2025-05-01\n2500\t2026-01-01',
    },
  ],
  pitfalls: [{ title: '需一笔负现金流', reason: '全正或全负会 #NUM!。', fix: '至少一笔为负（投入）。', level: 'high' }],
  related: [{ id: 'irr', kind: 'companion', why: 'IRR 与本品类相关' },
    { id: 'mirr', kind: 'companion', why: 'MIRR 与本品类相关' },
    { id: 'npv', kind: 'companion', why: 'NPV 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "values",
        "label": "现金流",
        "type": "text",
        "default": "{-100,50,80,40}"
      },
      {
        "key": "dates",
        "label": "日期",
        "type": "text",
        "default": "{45292,45444,45658,45809}"
      },
      {
        "key": "guess",
        "label": "猜测",
        "type": "text",
        "default": "0.1"
      }
    ],
    "template": "=XIRR({values},{dates},{guess})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "values": "{-100,50,80,40}",
          "dates": "{45292,45444,45658,45809}",
          "guess": "0.1"
        },
        "expect": "0.81947",
        "note": ""
      },
      {
        "label": "另一组",
        "type": "ok",
        "values": {
          "values": "{-1000,500,500,500}",
          "dates": "{45292,45658,46023,46388}",
          "guess": "0.1"
        },
        "expect": "0.233371",
        "note": ""
      },
      {
        "label": "全为正",
        "type": "error",
        "values": {
          "values": "{100,50,80}",
          "dates": "{45292,45444,45658}",
          "guess": "0.1"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "数量不一致",
        "type": "error",
        "values": {
          "values": "{-100,50}",
          "dates": "\"2024-01-01\"",
          "guess": "0.1"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "values": "{-100,50}",
          "dates": "\"abc,2024-06-01\"",
          "guess": "0.1"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default xirrEntry;
