import type { FunctionEntry } from '@/types';

/** SHEETS · 表计数（information 类 B8 批次） */

const sheetsEntry: FunctionEntry = {
  id: 'sheets',
  enName: 'SHEETS',
  zhName: '表计数',
  zhCommon: [
    'SHEETS',
    '工作表数',
    '表总数'
  ],
  alias: [
    '工作表数',
    '表总数'
  ],
  category: 'information',
  abbr: 'bjs',
  pinyin: 'biaojishu',
  keywords: [
    'SHEETS',
    '工作表',
    '计数',
    '总数'
  ],
  difficulty: 2,
  usageLevel: 10,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'SHEETS 返回 workbook 中的工作表数量；给一个引用区域则返回该区域横跨的工作表数（跨表三维引用时）。'
  },
  oneLiner: '返回工作表总数',
  summary: 'SHEETS 返回整本工作簿里有多少张工作表（省略参数时）。如果给它一个三维引用如 Sheet1:Sheet3!A1，则返回跨过的表数。做汇总表时用来动态确认表数量很方便。',
  syntax: {
    patternCn: '=SHEETS([引用])',
    patternEn: '=SHEETS([reference])',
    args: [
      {
        key: 'reference',
        zh: '引用',
        en: 'reference',
        required: false,
        desc: '可选的三维引用；省略返回整本表数。',
        accepts: 'Sheet1:Sheet3!A1 之类。',
        ifOmitted: '返回当前 workbook 的工作表总数。',
        example: 'Sheet1:Sheet3!A1'
      }
    ]
  },
  returnValue: '返回表数（数字）；引用非法 #N/A。',
  examples: [
    {
      title: '示例 1：总表数',
      scene: '工作簿有 5 张表。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=SHEETS()',
      result: '5',
      explanation: '返回工作表总数。'
    },
    {
      title: '示例 2：跨表计数',
      scene: 'Sheet1 到 Sheet3。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=SHEETS(Sheet1:Sheet3!A1)',
      result: '3',
      explanation: '三维引用跨 3 张表。'
    }
  ],
  pitfalls: [
    {
      title: '旧版没有',
      reason: 'SHEETS 是 2013 才有。',
      fix: '旧版用 VBA。',
      level: 'low',
      errorCode: '#NAME?'
    },
    {
      title: '含隐藏表',
      reason: '隐藏工作表也计入总数。',
      fix: '要排除隐藏需用 VBA。',
      level: 'mid'
    }
  ],
  related: [
    {
      id: 'sheet',
      kind: 'companion',
      why: 'SHEET 取单张表序号。'
    },
    {
      id: 'cell',
      kind: 'companion',
      why: 'CELL 取单元格信息。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'value', label: '引用', type: 'text', default: '', placeholder: '可选：三维引用', hint: '可选参数，省略返回总表数' },
    ],
    template: '=SHEETS({value})',
    cases: [
      { label: '总表数', type: 'ok', values: {}, expect: '1', note: '省略返回总表数 1（简化）' },
      { label: '指定引用', type: 'ok', values: { value: 'A1:B2' }, expect: '1', note: '简化始终返回 1' },
      { label: '错误引用 → #REF!', type: 'error', values: { value: '"#N/A"' }, expect: '#REF!', note: '错误值不是引用' },
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

export default sheetsEntry;
