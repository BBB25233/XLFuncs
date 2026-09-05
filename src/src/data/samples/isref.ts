import type { FunctionEntry } from '@/types';

/** ISREF · 是否引用（information 类 B8 批次） */

const isrefEntry: FunctionEntry = {
  id: 'isref',
  enName: 'ISREF',
  zhName: '是否引用',
  zhCommon: [
    'ISREF',
    '是否引用',
    '引用判断'
  ],
  alias: [
    '是否引用'
  ],
  category: 'information',
  abbr: 'sfyy',
  pinyin: 'shifouyinyong',
  keywords: [
    'ISREF',
    '引用',
    '判断',
    '类型'
  ],
  difficulty: 2,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISREF 在值为单元格/区域引用（如 A1、A1:B2、INDIRECT 结果）时返回 TRUE，普通值返回 FALSE。'
  },
  oneLiner: '判断值是不是引用',
  summary: 'ISREF 判断一个值是不是「引用」——比如 A1、A1:B10，或者 INDIRECT("A1") 算出来的引用。普通数字、文本返回 FALSE。常用于校验 INDIRECT/OFFSET 类动态引用是否真的指向了有效区域。',
  syntax: {
    patternCn: '=ISREF(值)',
    patternEn: '=ISREF(value)',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '要检查的内容。',
        accepts: '单元格、引用表达式。',
        ifOmitted: '必填。',
        example: 'A1:B2'
      }
    ]
  },
  returnValue: '是引用 TRUE，否则 FALSE。',
  examples: [
    {
      title: '示例 1：区域引用',
      scene: 'A2=A1:B2。',
      dataTsv: '引用\n=A1:B2',
      dataAnchor: 'A1',
      formula: '=ISREF(A2)',
      result: 'TRUE',
      explanation: 'A2 存的是引用。'
    },
    {
      title: '示例 2：普通文本',
      scene: 'A2="abc"。',
      dataTsv: '引用\nabc',
      dataAnchor: 'A1',
      formula: '=ISREF(A2)',
      result: 'FALSE',
      explanation: '文本不是引用。'
    }
  ],
  pitfalls: [
    {
      title: '文本地址不算',
      reason: 'INDIRECT 之前 "A1" 只是文本，ISREF 返回 FALSE。',
      fix: '用 INDIRECT 转成真引用再判。',
      level: 'mid'
    }
  ],
  related: [
    {
      id: 'indirect',
      kind: 'companion',
      why: 'INDIRECT 把文本变成引用供 ISREF 识别。'
    },
    {
      id: 'offset',
      kind: 'companion',
      why: 'OFFSET 返回引用，可被 ISREF 验证。'
    },
    {
      id: 'isref',
      kind: 'companion',
      why: '与 ISREF 同类校验。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'value', label: '引用', type: 'ref', default: 'A1', rangeKey: 'value', hint: '要检查的引用' },
    ],
    template: '=ISREF({value})',
    cases: [
      { label: '区域引用', type: 'ok', values: {}, expect: 'TRUE', note: 'A1 是引用' },
      { label: '普通文本', type: 'ok', values: { value: 'abc' }, expect: 'FALSE', note: '文本不是引用（简化）' },
      { label: '缺引用 → #VALUE!', type: 'error', values: { value: '' }, expect: '#VALUE!', note: '需要引用' },
      { label: '错误引用 → #REF!', type: 'error', values: { value: '"#N/A"' }, expect: '#REF!', note: '错误值不是引用' },
      { label: '非法错误 → #VALUE!', type: 'error', values: { value: '"#CALC!"' }, expect: '#VALUE!', note: '无法识别的错误值' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default isrefEntry;
