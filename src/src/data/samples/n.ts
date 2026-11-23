import type { FunctionEntry } from '@/types';

/** N · 转数值（information 类 B8 批次） */

const nEntry: FunctionEntry = {
  id: 'n',
  enName: 'N',
  zhName: '转数值',
  zhCommon: [
    'N',
    '转数字',
    '值转数值'
  ],
  alias: [
    '转数字'
  ],
  category: 'information',
  abbr: 'zsz',
  pinyin: 'zhuanshuzhi',
  keywords: [
    'N',
    '数值',
    '转换',
    '逻辑转数'
  ],
  difficulty: 2,
  usageLevel: 9,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'N 把各类值转成数字：数字原样、TRUE→1、FALSE→0、日期→序列号、文本→0、错误原样返回错误。'
  },
  oneLiner: '把值转换成数字',
  summary: 'N 是个「强制数字」小工具：数字不变，TRUE→1、FALSE→0，日期变成序列号，而文本直接变 0（这点要小心），错误值原样透传。多数现代公式不需要它，但和老函数兼容、或要把逻辑值当 1/0 参与运算时会用到。',
  syntax: {
    patternCn: '=N(值)',
    patternEn: '=N(value)',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '要转换的内容。',
        accepts: '数字、逻辑、日期、文本、错误。',
        ifOmitted: '必填。',
        example: 'A2'
      }
    ]
  },
  returnValue: '转成的数字；文本→0，错误原样返回。',
  examples: [
    {
      title: '示例 1：逻辑转数',
      scene: 'A2=TRUE。',
      dataTsv: '值\nTRUE',
      dataAnchor: 'A1',
      formula: '=N(A2)',
      result: '1',
      explanation: 'TRUE→1。'
    },
    {
      title: '示例 2：文本变 0',
      scene: 'A2="abc"。',
      dataTsv: '值\nabc',
      dataAnchor: 'A1',
      formula: '=N(A2)',
      result: '0',
      explanation: '文本转成 0，注意别误用。'
    }
  ],
  pitfalls: [
    {
      title: '文本被转成 0',
      reason: 'N("123") 不是 123 而是 0，和 VALUE 不同。',
      fix: '要文本转数字用 VALUE 或 *1。',
      level: 'high'
    },
    {
      title: '日期变序列号',
      reason: 'N(日期)=序列号，可能不符合预期。',
      fix: '保留日期用别的方式。',
      level: 'mid'
    }
  ],
  related: [
    {
      id: 'value',
      kind: 'companion',
      why: 'VALUE 把文本数字转正，和 N 不同。'
    },
    {
      id: 'true',
      kind: 'companion',
      why: 'TRUE 经 N 得 1。'
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: 'ISNUMBER 验证结果是不是数字。'
    }
  ],
  calc: {
    enabled: true,
    ranges: {

    },
    fields: [
      { key: 'value', label: '值', type: 'text', default: '5', placeholder: '如 5 或 abc', hint: '要转成数字的值' },
    ],
    template: '=N({value})',
    cases: [
      { label: '数字', type: 'ok', values: {}, expect: '5', note: '数字原样' },
      { label: '文本', type: 'ok', values: { value: 'abc' }, expect: '0', note: '文本变 0' },
      { label: '空白', type: 'ok', values: { value: '' }, expect: '0', note: '空白变 0' },
      { label: '逻辑 TRUE', type: 'ok', values: { value: 'TRUE' }, expect: '1', note: 'TRUE → 1' },
      { label: '错误 N/A → #N/A', type: 'error', values: { value: '"#N/A"' }, expect: '#N/A', note: 'N 透传错误' },
      { label: '错误 VALUE → #N/A', type: 'error', values: { value: '"#VALUE!"' }, expect: '#N/A', note: 'N 透传错误' },
      { label: '错误 DIV0 → #N/A', type: 'error', values: { value: '"#DIV/0!"' }, expect: '#N/A', note: 'N 透传错误' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default nEntry;
