import type { FunctionEntry } from '@/types';

/** ISEVEN · 是否偶数（information 类 B8 批次） */

const isevenEntry: FunctionEntry = {
  id: 'iseven',
  enName: 'ISEVEN',
  zhName: '是否偶数',
  zhCommon: [
    'ISEVEN',
    '偶数',
    '奇偶判断'
  ],
  alias: [
    '偶数'
  ],
  category: 'information',
  abbr: 'sfos',
  pinyin: 'shifououshu',
  keywords: [
    'ISEVEN',
    '偶数',
    '奇偶',
    '判断'
  ],
  difficulty: 1,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISEVEN 判断数字是否为偶数，是返回 TRUE；非整数会被截断取整后判断。'
  },
  oneLiner: '判断数字是否为偶数',
  summary: 'ISEVEN 检查一个数除以 2 余 0 吗。常用于按奇偶行隔行填色、分组、做棋盘式排版。注意小数会被直接截断取整（ISEVEN(2.9) 看 2）。',
  syntax: {
    patternCn: '=ISEVEN(数)',
    patternEn: '=ISEVEN(number)',
    args: [
      {
        key: 'number',
        zh: '数',
        en: 'number',
        required: true,
        desc: '要判断的数字。',
        accepts: '数字、含数字的单元格。',
        ifOmitted: '必填。',
        example: 'A2'
      }
    ]
  },
  returnValue: '偶数 TRUE，奇数 FALSE；非数字则 #VALUE!。',
  examples: [
    {
      title: '示例 1：偶数',
      scene: 'A2=4。',
      dataTsv: '数\n4',
      dataAnchor: 'A1',
      formula: '=ISEVEN(A2)',
      result: 'TRUE',
      explanation: '4 是偶数。'
    },
    {
      title: '示例 2：小数截断',
      scene: 'A2=2.9。',
      dataTsv: '数\n2.9',
      dataAnchor: 'A1',
      formula: '=ISEVEN(A2)',
      result: 'TRUE',
      explanation: '截断取整看 2，仍偶数。'
    }
  ],
  pitfalls: [
    {
      title: '小数被截断',
      reason: 'ISEVEN(2.9) 不是按四舍五入，是截断成 2。',
      fix: '需要四舍五入先 ROUND。',
      level: 'mid'
    },
    {
      title: '文本数字报错',
      reason: '传 "4" 文本会 #VALUE!。',
      fix: '用 VALUE 转数字。',
      level: 'low',
      errorCode: '#VALUE!'
    }
  ],
  related: [
    {
      id: 'isodd',
      kind: 'companion',
      why: 'ISODD 判奇数。'
    },
    {
      id: 'mod',
      kind: 'companion',
      why: 'MOD(数,2)=0 等价于偶数判定。'
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: '先 ISNUMBER 确认真是数字。'
    }
  ],
  calc: {
    enabled: true,
    ranges: {

    },
    fields: [
      { key: 'number', label: '数', type: 'number', default: '4', placeholder: '如 4', hint: '要判断的数字' },
    ],
    template: '=ISEVEN({number})',
    cases: [
      { label: '偶数', type: 'ok', values: {}, expect: 'TRUE', note: '4 是偶数' },
      { label: '奇数', type: 'ok', values: { number: '7' }, expect: 'FALSE', note: '7 是奇数' },
      { label: '小数截断', type: 'ok', values: { number: '2.9' }, expect: 'TRUE', note: 'ISEVEN(2.9) 截断看 2' },
      { label: '文本数字 → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '非数字报错' },
      { label: '缺参数 → #VALUE!', type: 'error', values: { number: '' }, expect: '#VALUE!', note: 'number 必填' },
      { label: '乱码 → #VALUE!', type: 'error', values: { number: 'xyz' }, expect: '#VALUE!', note: '非数字报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default isevenEntry;
