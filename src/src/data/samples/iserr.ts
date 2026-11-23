import type { FunctionEntry } from '@/types';

/** ISERR · 是否错误值（information 类 B8 批次） */

const iserrEntry: FunctionEntry = {
  id: 'iserr',
  enName: 'ISERR',
  zhName: '是否错误值',
  zhCommon: [
    'ISERR',
    '是否出错',
    '除NA外错误'
  ],
  alias: [
    '是否出错'
  ],
  category: 'information',
  abbr: 'sfcwz',
  pinyin: 'shifoucuowuzhi',
  keywords: [
    'ISERR',
    '错误',
    '判断',
    '除N/A'
  ],
  difficulty: 1,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISERR 在值为任意错误（#DIV/0! #VALUE! #REF! #NAME? #NUM! #NULL!）时返回 TRUE；注意它「不认」#N/A。'
  },
  oneLiner: '判断是否出错（不含 #N/A）',
  summary: 'ISERR 检查一个值是不是错误——但刻意把 #N/A 排除在外。为什么这样设计？因为 #N/A 常是「查无结果」这种「正常找不到」，而其它错误才是真 bug。要连 #N/A 一起判就用 ISERROR。',
  syntax: {
    patternCn: '=ISERR(值)',
    patternEn: '=ISERR(value)',
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
  returnValue: '是错误(非 #N/A)返回 TRUE，否则 FALSE。',
  examples: [
    {
      title: '示例 1：除零被识别',
      scene: 'A2=1/0。',
      dataTsv: '值\n=#DIV/0!',
      dataAnchor: 'A1',
      formula: '=ISERR(A2)',
      result: 'TRUE',
      explanation: '#DIV/0! 是错误，返回 TRUE。'
    },
    {
      title: '示例 2：#N/A 不算',
      scene: 'A2=VLOOKUP 查无。',
      dataTsv: '值\n=#N/A',
      dataAnchor: 'A1',
      formula: '=ISERR(A2)',
      result: 'FALSE',
      explanation: '#N/A 被 ISERR 排除，返回 FALSE；要用 ISERROR。'
    }
  ],
  pitfalls: [
    {
      title: '漏掉 #N/A',
      reason: 'ISERR 不认 #N/A，查无结果时它会说 FALSE。',
      fix: '连 #N/A 一起判用 ISERROR。',
      level: 'high'
    },
    {
      title: '和 ISERROR 混用',
      reason: '前者排除 #N/A，后者包含全部。',
      fix: '按需选。',
      level: 'mid'
    }
  ],
  related: [
    {
      id: 'iserror',
      kind: 'companion',
      why: 'ISERROR 包含全部错误含 #N/A。'
    },
    {
      id: 'iferror',
      kind: 'companion',
      why: 'IFERROR 直接给错误兜底。'
    },
    {
      id: 'isna',
      kind: 'companion',
      why: 'ISNA 专门判 #N/A。'
    }
  ],
  calc: {
    enabled: true,
    ranges: {

    },
    fields: [
      { key: 'value', label: '值', type: 'text', default: '"#DIV/0!"', placeholder: '如 "#N/A"', hint: '要检查的值或错误' },
    ],
    template: '=ISERR({value})',
    cases: [
      { label: '除零错误', type: 'ok', values: {}, expect: 'TRUE', note: '#DIV/0! 是错误' },
      { label: 'N/A 不算', type: 'ok', values: { value: '"#N/A"' }, expect: 'FALSE', note: 'ISERR 排除 #N/A' },
      { label: '普通文本', type: 'ok', values: { value: 'abc' }, expect: 'FALSE', note: '文本不是错误' },
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

export default iserrEntry;
