import type { FunctionEntry } from '@/types';

/** ISNA · 是否空值（information 类 B8 批次） */

const isnaEntry: FunctionEntry = {
  id: 'isna',
  enName: 'ISNA',
  zhName: '是否空值',
  zhCommon: [
    'ISNA',
    '是否N/A',
    '查无结果'
  ],
  alias: [
    '是否N/A',
    '查无'
  ],
  category: 'information',
  abbr: 'sfkz',
  pinyin: 'shifoukongzhi',
  keywords: [
    'ISNA',
    'N/A',
    '查无',
    '错误'
  ],
  difficulty: 1,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ISNA 仅当值为 #N/A 时返回 TRUE，其它错误（#DIV/0! 等）和正常值都返回 FALSE。'
  },
  oneLiner: '判断是否 #N/A（查无结果）',
  summary: 'ISNA 专门识别 #N/A——也就是「查找没找到」这类结果。它和 ISERR 互补：ISERR 认除 #N/A 外的错误，ISNA 只认 #N/A。配合 IF 能把「查无」替换成更友好的提示。',
  syntax: {
    patternCn: '=ISNA(值)',
    patternEn: '=ISNA(value)',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '要检查的内容。',
        accepts: '单元格、查找公式。',
        ifOmitted: '必填。',
        example: 'A2'
      }
    ]
  },
  returnValue: '是 #N/A 返回 TRUE，否则 FALSE。',
  examples: [
    {
      title: '示例 1：查无命中',
      scene: 'A2=VLOOKUP 找不到。',
      dataTsv: '值\n=#N/A',
      dataAnchor: 'A1',
      formula: '=ISNA(A2)',
      result: 'TRUE',
      explanation: '#N/A 被识别。'
    },
    {
      title: '示例 2：配 IF 兜底',
      scene: '查无显示「无」。',
      dataTsv: '值\n=#N/A',
      dataAnchor: 'A1',
      formula: '=IF(ISNA(A2),"无",A2)',
      result: '无',
      explanation: '把 #N/A 换成友好文字。'
    }
  ],
  pitfalls: [
    {
      title: '只认 #N/A',
      reason: '其它错误（#VALUE! 等）ISNA 返回 FALSE。',
      fix: '要兜底全部错误用 IFERROR。',
      level: 'mid'
    },
    {
      title: '和 ISERR 互补易混',
      reason: '一个认 #N/A 一个不认。',
      fix: '记得分工。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'iserr',
      kind: 'companion',
      why: 'ISERR 认除 #N/A 外的错误。'
    },
    {
      id: 'iferror',
      kind: 'companion',
      why: 'IFERROR 一次性兜底所有错误。'
    }
  ],
  calc: {
    enabled: true,
    ranges: {

    },
    fields: [
      { key: 'value', label: '值', type: 'text', default: '"#N/A"', placeholder: '如 "#N/A"', hint: '要检查的值或错误' },
    ],
    template: '=ISNA({value})',
    cases: [
      { label: 'N/A', type: 'ok', values: {}, expect: 'TRUE', note: '#N/A 被识别' },
      { label: '除零不算', type: 'ok', values: { value: '"#DIV/0!"' }, expect: 'FALSE', note: 'ISNA 只认 #N/A' },
      { label: '普通文本', type: 'ok', values: { value: 'abc' }, expect: 'FALSE', note: '文本不是 #N/A' },
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

export default isnaEntry;
