import type { FunctionEntry } from '@/types';

/** RRI · 等价利率（financial 类 B9 批次） */

const rriEntry: FunctionEntry = {
  id: 'rri',
  enName: 'RRI',
  zhName: '等价利率',
  zhCommon: ['RRI', '等价利率'],
  alias: ['期间收益率'],
  category: 'financial',
  abbr: 'djll',
  pinyin: 'dengjialilv',
  keywords: ['rri', '利率', '投资'],
  difficulty: 3,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算投资的期间等价利率',
  summary: 'RRI 返回让现值增长到终值的等效各期利率，相当于 (终值/现值)^(1/期数)-1。',
  syntax: {
    patternCn: '=RRI(期数, 现值, 终值)',
    patternEn: '=RRI(nper, pv, fv)',
    args: [{ key: 'nper', zh: '期数', en: 'nper', required: true, desc: '总期数' },
    { key: 'pv', zh: '现值', en: 'pv', required: true, desc: '期初价值' },
    { key: 'fv', zh: '终值', en: 'fv', required: true, desc: '期末价值' }],
  },
  returnValue: '等效每期利率',
  examples: [
    {
      title: '示例：十年翻倍',
      scene: '现值 100、终值 200、10 年',
      dataAnchor: 'B2',
      formula: '=RRI(10,100,200)',
      result: '约 0.0718',
      explanation: '复合年增长率 7.18%。',
    },
    {
      title: '示例：五年增长 50%',
      scene: '现值 100、终值 150、5 年',
      dataAnchor: 'B2',
      formula: '=RRI(5,100,150)',
      result: '约 0.0845',
      explanation: '期限越短，达到同样增幅所需的年化增长率越高。',
    },
  ],
  pitfalls: [{ title: '终值需 >0', reason: 'fv≤0 会 #NUM!。', fix: '终值取正。', level: 'low' }],
  related: [{ id: 'rate', kind: 'companion', why: 'RATE 与本品类相关' },
    { id: 'fv', kind: 'companion', why: 'FV 与本品类相关' },
    { id: 'pv', kind: 'companion', why: 'PV 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "nper",
        "label": "期数",
        "type": "text",
        "default": "4"
      },
      {
        "key": "pv",
        "label": "现值",
        "type": "text",
        "default": "96"
      },
      {
        "key": "fv",
        "label": "终值",
        "type": "text",
        "default": "100"
      }
    ],
    "template": "=RRI({nper},{pv},{fv})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "nper": "4",
          "pv": "96",
          "fv": "100"
        },
        "expect": "0.010258",
        "note": ""
      },
      {
        "label": "期数 2",
        "type": "ok",
        "values": {
          "nper": "2",
          "pv": "96",
          "fv": "100"
        },
        "expect": "0.020621",
        "note": ""
      },
      {
        "label": "期数 0",
        "type": "error",
        "values": {
          "nper": "0",
          "pv": "96",
          "fv": "100"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "现值 0",
        "type": "error",
        "values": {
          "nper": "4",
          "pv": "0",
          "fv": "100"
        },
        "expect": "#DIV/0!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "非法数字",
        "type": "error",
        "values": {
          "nper": "abc",
          "pv": "96",
          "fv": "100"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default rriEntry;
