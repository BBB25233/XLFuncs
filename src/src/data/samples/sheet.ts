import type { FunctionEntry } from '@/types';

/** SHEET · 表序号（information 类 B8 批次） */

const sheetEntry: FunctionEntry = {
  id: 'sheet',
  enName: 'SHEET',
  zhName: '表序号',
  zhCommon: [
    'SHEET',
    '工作表序号',
    '表编号'
  ],
  alias: [
    '工作表序号',
    '表编号'
  ],
  category: 'information',
  abbr: 'bxh',
  pinyin: 'biaoxuhao',
  keywords: [
    'SHEET',
    '工作表',
    '序号',
    '编号'
  ],
  difficulty: 2,
  usageLevel: 10,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'SHEET 返回工作表在 workbook 里的序号（从 1 起）；省略参数返回当前表序号。'
  },
  oneLiner: '返回工作表的序号',
  summary: 'SHEET 告诉你「这张表排第几」：省略参数返回公式所在表的序号；给一个表名/引用则返回那张表的序号。适合做跨表导航、或在汇总里标注数据来源表。',
  syntax: {
    patternCn: '=SHEET([值])',
    patternEn: '=SHEET([value])',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: false,
        desc: '表名（文本）或引用；省略返回当前表。',
        accepts: '"Sheet2" 或某表单元格。',
        ifOmitted: '返回公式所在工作表序号。',
        example: '"Sheet2"'
      }
    ]
  },
  returnValue: '返回表序号（数字）；表不存在 #N/A。',
  examples: [
    {
      title: '示例 1：当前表序号',
      scene: '公式写在 Sheet3。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=SHEET()',
      result: '3',
      explanation: '返回当前表序号 3。'
    },
    {
      title: '示例 2：指定表',
      scene: '查 Sheet2 的序号。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=SHEET("Sheet2")',
      result: '2',
      explanation: '返回指定表序号。'
    }
  ],
  pitfalls: [
    {
      title: '旧版没有',
      reason: 'SHEET 是 2013 才有。',
      fix: '旧版用宏或 VBA 取。',
      level: 'low',
      errorCode: '#NAME?'
    },
    {
      title: '表名拼错 #N/A',
      reason: '给的表名不存在返回 #N/A。',
      fix: '核对表名。',
      level: 'mid',
      errorCode: '#N/A'
    }
  ],
  related: [
    {
      id: 'sheets',
      kind: 'companion',
      why: 'SHEETS 返回表里的工作表总数。'
    },
    {
      id: 'cell',
      kind: 'companion',
      why: 'CELL("filename") 也能取表信息。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'value', label: '引用', type: 'text', default: '', placeholder: '可选：表名或引用', hint: '可选参数，省略返回当前表' },
    ],
    template: '=SHEET({value})',
    cases: [
      { label: '当前表', type: 'ok', values: {}, expect: '1', note: '省略返回当前表序号 1（简化）' },
      { label: '指定引用', type: 'ok', values: { value: 'A1' }, expect: '1', note: '简化始终返回 1' },
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

export default sheetEntry;
