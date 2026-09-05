import type { FunctionEntry } from '@/types';

/** ISTEXT · 是否文本（information 类 B8 批次） */

const istextEntry: FunctionEntry = {
  id: 'istext',
  enName: 'ISTEXT',
  zhName: '是否文本',
  zhCommon: [
    'ISTEXT',
    '是否文字',
    '文本判断'
  ],
  alias: [
    '是否文字'
  ],
  category: 'information',
  abbr: 'sfwb',
  pinyin: 'shifouwenben',
  keywords: [
    'ISTEXT',
    '文本',
    '判断',
    '类型'
  ],
  difficulty: 1,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISTEXT 在值为文本时返回 TRUE；数字、逻辑值、错误、空单元格都返回 FALSE。'
  },
  oneLiner: '判断值是不是文本',
  summary: 'ISTEXT 检查一个值是不是文本。注意：数字长得像文本（左对齐）但本质是数字时返回 FALSE；纯文本、或公式返回的 "abc" 文本才返回 TRUE。常用来校验录入是不是填成了文字。',
  syntax: {
    patternCn: '=ISTEXT(值)',
    patternEn: '=ISTEXT(value)',
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
  returnValue: '是文本 TRUE，否则 FALSE。',
  examples: [
    {
      title: '示例 1：文本',
      scene: 'A2="你好"。',
      dataTsv: '值\n你好',
      dataAnchor: 'A1',
      formula: '=ISTEXT(A2)',
      result: 'TRUE',
      explanation: '文本被识别。'
    },
    {
      title: '示例 2：数字不算',
      scene: 'A2=123（数字）。',
      dataTsv: '值\n123',
      dataAnchor: 'A1',
      formula: '=ISTEXT(A2)',
      result: 'FALSE',
      explanation: '数字不是文本。'
    }
  ],
  pitfalls: [
    {
      title: '文本型数字',
      reason: '单元格里像 "123" 的文本，ISTEXT 返回 TRUE，但求和会当成 0。',
      fix: '用 VALUE 或乘 1 转数字。',
      level: 'mid'
    },
    {
      title: '公式返回文本也算',
      reason: '=TEXT(今天,"yyyy") 结果是文本，ISTEXT=TRUE。',
      fix: '注意 TEXT 类结果类型。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'isnontext',
      kind: 'companion',
      why: 'ISNONTEXT 判非文本，互补。'
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: 'ISNUMBER 判数字。'
    },
    {
      id: 'type',
      kind: 'companion',
      why: 'TYPE 给类型编号（文本=2）。'
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
    template: '=ISTEXT({value})',
    cases: [
      { label: '文本', type: 'ok', values: {}, expect: 'TRUE', note: '"abc" 是文本' },
      { label: '数字', type: 'ok', values: { value: '5' }, expect: 'FALSE', note: '数字不是文本' },
      { label: '错误', type: 'ok', values: { value: '"#DIV/0!"' }, expect: 'FALSE', note: '错误不是文本' },
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

export default istextEntry;
