import type { FunctionEntry } from '@/types';

/** TYPE · 值类型（information 类 B8 批次） */

const typeEntry: FunctionEntry = {
  id: 'type',
  enName: 'TYPE',
  zhName: '值类型',
  zhCommon: [
    'TYPE',
    '类型编号',
    '值类型'
  ],
  alias: [
    '类型编号'
  ],
  category: 'information',
  abbr: 'zlx',
  pinyin: 'zhileixing',
  keywords: [
    'TYPE',
    '类型',
    '编号',
    '判断'
  ],
  difficulty: 2,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'TYPE 把值类型编码成数字：数字=1、文本=2、逻辑=4、错误=16、数组=64。'
  },
  oneLiner: '返回值的数据类型编号',
  summary: 'TYPE 给一个值「贴类型标签」：1=数字、2=文本、4=逻辑值、16=错误、64=数组。当你写的公式要兼容多种输入、或排查「为什么不相等」时，用 TYPE 看两边是不是同一类。',
  syntax: {
    patternCn: '=TYPE(值)',
    patternEn: '=TYPE(value)',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '要检查的内容。',
        accepts: '单元格、表达式、数组。',
        ifOmitted: '必填。',
        example: 'A2'
      }
    ]
  },
  returnValue: '1 数字 / 2 文本 / 4 逻辑 / 16 错误 / 64 数组。',
  examples: [
    {
      title: '示例 1：数字',
      scene: 'A2=100。',
      dataTsv: '值\n100',
      dataAnchor: 'A1',
      formula: '=TYPE(A2)',
      result: '1',
      explanation: '数字类型=1。'
    },
    {
      title: '示例 2：逻辑',
      scene: 'A2=TRUE。',
      dataTsv: '值\nTRUE',
      dataAnchor: 'A1',
      formula: '=TYPE(A2)',
      result: '4',
      explanation: '逻辑值类型=4。'
    }
  ],
  pitfalls: [
    {
      title: '数组返回 64',
      reason: '动态数组溢出区 TYPE 返回 64，别当普通类型。',
      fix: '注意数组上下文。',
      level: 'mid'
    },
    {
      title: '只判类型不判值',
      reason: 'TYPE 不比较内容，只分类。',
      fix: '要比较值用 =。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'istext',
      kind: 'companion',
      why: 'ISTEXT 等价于 TYPE=2 的语义判断。'
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: 'ISNUMBER 等价于 TYPE=1。'
    },
    {
      id: 'islogical',
      kind: 'companion',
      why: 'ISLOGICAL 等价于 TYPE=4。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'value', label: '值', type: 'text', default: '5', placeholder: '如 5 或 abc', hint: '要检查的值' },
    ],
    template: '=TYPE({value})',
    cases: [
      { label: '数字', type: 'ok', values: {}, expect: '1', note: '数字 → 1' },
      { label: '文本', type: 'ok', values: { value: 'abc' }, expect: '2', note: '文本 → 2' },
      { label: '逻辑', type: 'ok', values: { value: 'TRUE' }, expect: '4', note: '逻辑值 → 4（简化：文本 TRUE 当逻辑）' },
      { label: '错误', type: 'ok', values: { value: '"#N/A"' }, expect: '16', note: '错误 → 16' },
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

export default typeEntry;
