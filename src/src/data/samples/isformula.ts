import type { FunctionEntry } from '@/types';

/** ISFORMULA · 是否公式（information 类 B8 批次） */

const isformulaEntry: FunctionEntry = {
  id: 'isformula',
  enName: 'ISFORMULA',
  zhName: '是否公式',
  zhCommon: [
    'ISFORMULA',
    '是否含公式',
    '公式判断'
  ],
  alias: [
    '是否含公式'
  ],
  category: 'information',
  abbr: 'sfgs',
  pinyin: 'shifougongshi',
  keywords: [
    'ISFORMULA',
    '公式',
    '判断',
    '引用'
  ],
  difficulty: 2,
  usageLevel: 10,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'ISFORMULA 在引用单元格含有公式（而非常量）时返回 TRUE，引用空单元格或常量返回 FALSE。'
  },
  oneLiner: '判断单元格是否含公式',
  summary: 'ISFORMULA 检查一个单元格「里面是不是公式」——哪怕公式结果是文本，它仍返回 TRUE；常量或空单元格返回 FALSE。做模板审计、防止别人把公式改成死值时很有用。',
  syntax: {
    patternCn: '=ISFORMULA(引用)',
    patternEn: '=ISFORMULA(reference)',
    args: [
      {
        key: 'reference',
        zh: '引用',
        en: 'reference',
        required: true,
        desc: '要检查的单元格引用（必须是引用，不是值）。',
        accepts: '单元格。',
        ifOmitted: '必填。',
        example: 'A2'
      }
    ]
  },
  returnValue: '含公式 TRUE，否则 FALSE；引用非法 #VALUE!。',
  examples: [
    {
      title: '示例 1：含公式',
      scene: 'A2 里是 =B2*2。',
      dataTsv: '结果\n公式',
      dataAnchor: 'A1',
      formula: '=ISFORMULA(A2)',
      result: 'TRUE',
      explanation: 'A2 是公式。'
    },
    {
      title: '示例 2：常量',
      scene: 'A2 里是写死的 100。',
      dataTsv: '结果\n100',
      dataAnchor: 'A1',
      formula: '=ISFORMULA(A2)',
      result: 'FALSE',
      explanation: '常量不是公式。'
    }
  ],
  pitfalls: [
    {
      title: '必须传引用不是值',
      reason: '写 ISFORMULA(B2*2) 这类值会 #VALUE!。',
      fix: '传单元格引用。',
      level: 'mid',
      errorCode: '#VALUE!'
    },
    {
      title: '旧版没有',
      reason: 'ISFORMULA 是 2013 才有。',
      fix: '旧版用宏。',
      level: 'low',
      errorCode: '#NAME?'
    }
  ],
  related: [
    {
      id: 'cell',
      kind: 'companion',
      why: 'CELL("filename") 取表信息，ISFORMULA 取公式信息。'
    },
    {
      id: 'isref',
      kind: 'companion',
      why: 'ISREF 验证引用有效性。'
    },
    {
      id: 'iserror',
      kind: 'companion',
      why: 'ISERROR 判断单元格是否出错。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'reference', label: '引用', type: 'text', default: 'A2', placeholder: '如 A2 或 =A1+1', hint: '要检查的单元格引用' },
    ],
    template: '=ISFORMULA({reference})',
    cases: [
      { label: '常量引用', type: 'ok', values: {}, expect: 'FALSE', note: 'A2 是常量引用 → FALSE（简化规则）' },
      { label: '公式文本', type: 'ok', values: { reference: '"=A1+1"' }, expect: 'TRUE', note: '以 = 开头视为公式' },
      { label: '缺引用 → #VALUE!', type: 'error', values: { reference: '' }, expect: '#VALUE!', note: '需要引用' },
      { label: '裸值 → #VALUE!', type: 'error', values: { reference: 'abc' }, expect: '#VALUE!', note: 'ISFORMULA 需要引用不是值' },
      { label: '纯数字 → #VALUE!', type: 'error', values: { reference: '5' }, expect: '#VALUE!', note: '数字不是引用' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default isformulaEntry;
