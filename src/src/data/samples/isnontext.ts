import type { FunctionEntry } from '@/types';

/** ISNONTEXT · 是否非文本（information 类 B8 批次） */

const isnontextEntry: FunctionEntry = {
  id: 'isnontext',
  enName: 'ISNONTEXT',
  zhName: '是否非文本',
  zhCommon: [
    'ISNONTEXT',
    '非文本',
    '不是文字'
  ],
  alias: [
    '非文本'
  ],
  category: 'information',
  abbr: 'sffwb',
  pinyin: 'shifoufeiwenben',
  keywords: [
    'ISNONTEXT',
    '文本',
    '判断',
    '类型'
  ],
  difficulty: 1,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISNONTEXT 在值不是文本时返回 TRUE（数字、逻辑值、错误、空单元格都算「非文本」）；只有纯文本才返回 FALSE。'
  },
  oneLiner: '判断是否不是文本',
  summary: 'ISNONTEXT 和 ISTEXT 相反：只要不是文本就返回 TRUE——包括数字、TRUE/FALSE、错误值，甚至连空单元格也返回 TRUE。所以「非文本」不等于「是数字」。',
  syntax: {
    patternCn: '=ISNONTEXT(值)',
    patternEn: '=ISNONTEXT(value)',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '要检查的内容。',
        accepts: '单元格、表达式。',
        ifOmitted: '必填。',
        example: 'A2'
      }
    ]
  },
  returnValue: '非文本 TRUE，纯文本 FALSE。',
  examples: [
    {
      title: '示例 1：数字',
      scene: 'A2=100。',
      dataTsv: '值\n100',
      dataAnchor: 'A1',
      formula: '=ISNONTEXT(A2)',
      result: 'TRUE',
      explanation: '数字是非文本。'
    },
    {
      title: '示例 2：空单元格也非文本',
      scene: 'A2 为空。',
      dataTsv: '值\n',
      dataAnchor: 'A1',
      formula: '=ISNONTEXT(A2)',
      result: 'TRUE',
      explanation: '空单元格被当作非文本。'
    }
  ],
  pitfalls: [
    {
      title: '空单元格也算非文本',
      reason: 'ISNONTEXT(空)=TRUE，别当成「有数字」。',
      fix: '要判数字用 ISNUMBER。',
      level: 'mid'
    },
    {
      title: '和 ISTEXT 互补但不对称',
      reason: '两者并不覆盖「错误/逻辑」的特殊处理。',
      fix: '按需组合 ISNUMBER 等。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'istext',
      kind: 'companion',
      why: 'ISTEXT 判文本，ISNONTEXT 判非文本。'
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: 'ISNUMBER 精确判数字。'
    },
    {
      id: 'type',
      kind: 'companion',
      why: 'TYPE 给值类型编号。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'value', label: '值', type: 'text', default: 'abc', placeholder: '如 abc', hint: '要检查的值' },
    ],
    template: '=ISNONTEXT({value})',
    cases: [
      { label: '文本', type: 'ok', values: {}, expect: 'FALSE', note: '"abc" 是文本' },
      { label: '数字', type: 'ok', values: { value: '5' }, expect: 'TRUE', note: '数字是非文本' },
      { label: '错误', type: 'ok', values: { value: '"#DIV/0!"' }, expect: 'TRUE', note: '错误是非文本' },
      { label: '缺值 → #VALUE!', type: 'error', values: { value: '' }, expect: '#VALUE!', note: 'value 必填' },
      { label: '非法错误 → #VALUE!', type: 'error', values: { value: '"#CALC!"' }, expect: '#VALUE!', note: '无法识别的错误值' },
      { label: '乱码错误 → #VALUE!', type: 'error', values: { value: '"#???"' }, expect: '#VALUE!', note: '无法识别的错误值' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default isnontextEntry;
