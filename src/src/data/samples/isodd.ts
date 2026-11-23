import type { FunctionEntry } from '@/types';

/** ISODD · 是否奇数（information 类 B8 批次） */

const isoddEntry: FunctionEntry = {
  id: 'isodd',
  enName: 'ISODD',
  zhName: '是否奇数',
  zhCommon: [
    'ISODD',
    '奇数',
    '奇偶判断'
  ],
  alias: [
    '奇数'
  ],
  category: 'information',
  abbr: 'sfjs',
  pinyin: 'shifoujishu',
  keywords: [
    'ISODD',
    '奇数',
    '奇偶',
    '判断'
  ],
  difficulty: 1,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISODD 判断数字是否为奇数，是返回 TRUE；非整数截断取整后判断。'
  },
  oneLiner: '判断数字是否为奇数',
  summary: 'ISODD 检查一个数除以 2 余 1 吗。和 ISEVEN 一对，常用于隔行处理、奇偶序号、分组。小数同样截断取整（ISODD(2.9) 看 2 → FALSE）。',
  syntax: {
    patternCn: '=ISODD(数)',
    patternEn: '=ISODD(number)',
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
  returnValue: '奇数 TRUE，偶数 FALSE；非数字 #VALUE!。',
  examples: [
    {
      title: '示例 1：奇数',
      scene: 'A2=3。',
      dataTsv: '数\n3',
      dataAnchor: 'A1',
      formula: '=ISODD(A2)',
      result: 'TRUE',
      explanation: '3 是奇数。'
    },
    {
      title: '示例 2：负数也行',
      scene: 'A2=-5。',
      dataTsv: '数\n-5',
      dataAnchor: 'A1',
      formula: '=ISODD(A2)',
      result: 'TRUE',
      explanation: '-5 也是奇数。'
    }
  ],
  pitfalls: [
    {
      title: '小数截断',
      reason: 'ISODD(2.9) 截断看 2 → FALSE。',
      fix: '先 ROUND。',
      level: 'mid'
    },
    {
      title: '文本数字报错',
      reason: '传文本 "3" 会 #VALUE!。',
      fix: 'VALUE 转换。',
      level: 'low',
      errorCode: '#VALUE!'
    }
  ],
  related: [
    {
      id: 'iseven',
      kind: 'companion',
      why: 'ISEVEN 判偶数。'
    },
    {
      id: 'mod',
      kind: 'companion',
      why: 'MOD(数,2)=1 等价奇数。'
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: '先 ISNUMBER 确认。'
    }
  ],
  calc: {
    enabled: true,
    ranges: {

    },
    fields: [
      { key: 'number', label: '数', type: 'number', default: '7', placeholder: '如 7', hint: '要判断的数字' },
    ],
    template: '=ISODD({number})',
    cases: [
      { label: '奇数', type: 'ok', values: {}, expect: 'TRUE', note: '7 是奇数' },
      { label: '偶数', type: 'ok', values: { number: '4' }, expect: 'FALSE', note: '4 是偶数' },
      { label: '小数截断', type: 'ok', values: { number: '3.9' }, expect: 'TRUE', note: 'ISODD(3.9) 截断看 3' },
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

export default isoddEntry;
