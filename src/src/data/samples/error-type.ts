import type { FunctionEntry } from '@/types';

/** ERROR.TYPE · 错误类型（information 类 B8 批次） */

const errortypeEntry: FunctionEntry = {
  id: 'error-type',
  enName: 'ERROR.TYPE',
  zhName: '错误类型',
  zhCommon: [
    'ERROR.TYPE',
    '错误码',
    '错误编号'
  ],
  alias: [
    '错误码',
    '错误编号'
  ],
  category: 'information',
  abbr: 'cwlx',
  pinyin: 'cuowuleixing',
  keywords: [
    'ERROR.TYPE',
    '错误',
    '类型',
    '编号'
  ],
  difficulty: 2,
  usageLevel: 12,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'ERROR.TYPE 把七种标准错误（#NULL! #DIV/0! #VALUE! #REF! #NAME? #NUM! #N/A）映射成 1–7 的数字，非错误值返回 #N/A。'
  },
  oneLiner: '返回错误值对应的编号',
  summary: 'ERROR.TYPE 给错误「贴标签」：#DIV/0!→2、#N/A→7、#VALUE!→3…返回对应编号。配合 CHOOSE 就能把一堆错误翻译成中文说明，做友好的错误提示。',
  syntax: {
    patternCn: '=ERROR.TYPE([错误值])',
    patternEn: '=ERROR.TYPE([error_val])',
    args: [
      {
        key: 'error_val',
        zh: '错误值',
        en: 'error_val',
        required: false,
        desc: '要识别的错误（通常引用一个会出错的公式）。',
        accepts: '含错误的单元格。',
        ifOmitted: '省略时取最近错误。',
        example: 'A2'
      }
    ]
  },
  returnValue: '1–7 对应七种错误；非错误值返回 #N/A。',
  examples: [
    {
      title: '示例 1：除零错误',
      scene: 'A2=1/0。',
      dataTsv: '值\n=#DIV/0!',
      dataAnchor: 'A1',
      formula: '=ERROR.TYPE(A2)',
      result: '2',
      explanation: '#DIV/0! 对应编号 2。'
    },
    {
      title: '示例 2：转中文说明',
      scene: '用 CHOOSE 翻译编号。',
      dataTsv: '值\n=#N/A',
      dataAnchor: 'A1',
      formula: '=CHOOSE(ERROR.TYPE(A2),"空交","除零","值错","引用","名称","数字","无值")',
      result: '无值',
      explanation: '#N/A=7 命中末项。'
    }
  ],
  pitfalls: [
    {
      title: '非错误返回 #N/A',
      reason: '正常数值传进去会返回 #N/A 而不是 0。',
      fix: '先用 ISERROR 判断再取编号。',
      level: 'mid',
      errorCode: '#N/A'
    },
    {
      title: '编号记错',
      reason: '编号顺序不是字母序，别硬记。',
      fix: '查表：1 #NULL! 2 #DIV/0! 3 #VALUE! 4 #REF! 5 #NAME? 6 #NUM! 7 #N/A。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'iserror',
      kind: 'companion',
      why: 'ISERROR 先判是否出错，再调 ERROR.TYPE。'
    },
    {
      id: 'choose',
      kind: 'companion',
      why: 'CHOOSE 把编号翻译成说明文字。'
    },
    {
      id: 'iferror',
      kind: 'companion',
      why: 'IFERROR 直接兜底错误。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'value', label: '错误值', type: 'text', default: '"#DIV/0!"', placeholder: '如 "#N/A"', hint: '要识别的错误值' },
    ],
    template: '=ERROR.TYPE({value})',
    cases: [
      { label: '除零错误', type: 'ok', values: {}, expect: '2', note: '#DIV/0! → 2' },
      { label: '空值错误', type: 'ok', values: { value: '"#N/A"' }, expect: '7', note: '#N/A → 7' },
      { label: '值错误', type: 'ok', values: { value: '"#VALUE!"' }, expect: '3', note: '#VALUE! → 3' },
      { label: '空交错误', type: 'ok', values: { value: '"#NULL!"' }, expect: '1', note: '#NULL! → 1' },
      { label: '普通数字 → #N/A', type: 'error', values: { value: '5' }, expect: '#N/A', note: '非错误返回 #N/A' },
      { label: '普通文本 → #N/A', type: 'error', values: { value: 'abc' }, expect: '#N/A', note: '非错误返回 #N/A' },
      { label: 'TRUE → #N/A', type: 'error', values: { value: 'TRUE' }, expect: '#N/A', note: '逻辑值非错误' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default errortypeEntry;
