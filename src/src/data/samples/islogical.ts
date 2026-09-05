import type { FunctionEntry } from '@/types';

/** ISLOGICAL · 是否逻辑值（information 类 B8 批次） */

const islogicalEntry: FunctionEntry = {
  id: 'islogical',
  enName: 'ISLOGICAL',
  zhName: '是否逻辑值',
  zhCommon: [
    'ISLOGICAL',
    '是否布尔',
    '逻辑判断'
  ],
  alias: [
    '是否布尔'
  ],
  category: 'information',
  abbr: 'sfljz',
  pinyin: 'shifouluojizhi',
  keywords: [
    'ISLOGICAL',
    '逻辑',
    '布尔',
    '判断'
  ],
  difficulty: 1,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISLOGICAL 在值为 TRUE 或 FALSE（逻辑值）时返回 TRUE，其它一概 FALSE。'
  },
  oneLiner: '判断值是不是逻辑值',
  summary: 'ISLOGICAL 只认 TRUE/FALSE 这类逻辑值——哪怕单元格写着 "TRUE" 文本它都说 FALSE。适合在模板里校验某个开关格是不是真的逻辑值，防止被人填成文字。',
  syntax: {
    patternCn: '=ISLOGICAL(值)',
    patternEn: '=ISLOGICAL(value)',
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
  returnValue: '是逻辑值 TRUE，否则 FALSE。',
  examples: [
    {
      title: '示例 1：真值',
      scene: 'A2=TRUE。',
      dataTsv: '值\nTRUE',
      dataAnchor: 'A1',
      formula: '=ISLOGICAL(A2)',
      result: 'TRUE',
      explanation: 'TRUE 是逻辑值。'
    },
    {
      title: '示例 2：文本不算',
      scene: 'A2="TRUE"。',
      dataTsv: '值\nTRUE',
      dataAnchor: 'A1',
      formula: '=ISLOGICAL(A2)',
      result: 'FALSE',
      explanation: '带引号的 "TRUE" 是文本，不是逻辑值。'
    }
  ],
  pitfalls: [
    {
      title: '文本 TRUE 不认',
      reason: '单元格里是文本 "TRUE" 时返回 FALSE。',
      fix: '用 IF(A2="TRUE",...) 处理文本情况。',
      level: 'mid'
    }
  ],
  related: [
    {
      id: 'istext',
      kind: 'companion',
      why: 'ISTEXT 判文本，互补。'
    },
    {
      id: 'isnumber',
      kind: 'companion',
      why: 'ISNUMBER 判数字。'
    },
    {
      id: 'true',
      kind: 'companion',
      why: 'TRUE 是典型逻辑值。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'value', label: '值', type: 'text', default: 'TRUE', placeholder: '如 TRUE', hint: '要检查的值' },
    ],
    template: '=ISLOGICAL({value})',
    cases: [
      { label: 'TRUE', type: 'ok', values: {}, expect: 'TRUE', note: 'TRUE 是逻辑值（简化：文本 TRUE 当逻辑）' },
      { label: 'FALSE', type: 'ok', values: { value: 'FALSE' }, expect: 'TRUE', note: 'FALSE 是逻辑值' },
      { label: '数字', type: 'ok', values: { value: '5' }, expect: 'FALSE', note: '数字不是逻辑值' },
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

export default islogicalEntry;
