import type { FunctionEntry } from '@/types';

/** COLUMNS · 取区域列数（lookup 类 B7 批次） */

const TSV = 'A\tB\tC\n1\t2\t3\n4\t5\t6';

const columnsEntry: FunctionEntry = {
  id: 'columns',
  enName: 'COLUMNS',
  zhName: '取列数',
  zhCommon: ['区域有几列', '列数', '宽度'],
  alias: ['列计数', '区域列数', 'COLUMNS'],
  category: 'lookup',
  abbr: 'qls',
  pinyin: 'qulieshu',
  keywords: ['区域列数', '几列', '动态列数', '配合VLOOKUP', 'COLUMNS'],
  difficulty: 1,
  usageLevel: 33,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '中文版 Excel 不翻译这个函数名，输入「取列数」只会得到 #NAME?。COLUMNS 只干一件事：数一片区域有几列，返回个数字。常和 VLOOKUP 的 col_index_num 配合——用 COLUMNS(表) 自动算出「返回最后一列」，插入列也不失效。',
  },
  oneLiner: '数一下一片区域有几列',
  summary:
    'COLUMNS 非常简单：给它一块区域，它告诉你这块区域横着有几列（返回数字）。它和 COLUMN（返回单个单元格的列号）不同——COLUMNS 看的是「一整片」的宽度。最常见的实战用法是配合 VLOOKUP：把 col_index_num 写成 COLUMNS(表头区域)，就能「永远返回最后一列」，中间插入列也不会错位。',
  syntax: {
    patternCn: '=COLUMNS(区域)',
    patternEn: '=COLUMNS(array)',
    args: [
      {
        key: 'array',
        zh: '区域',
        en: 'array',
        required: true,
        desc: '你要数「有几列」的那片区域。',
        accepts: '任意矩形区域，如 A1:C10；也接受数组常量。',
        ifOmitted: '必填。',
        example: 'A1:C10',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回一个数字，表示区域包含的列数。',
  examples: [
    {
      title: '示例 1：数一片区域的列数',
      scene: 'A1:C10 这片区域，想知道它有几列。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COLUMNS(A1:C3)',
      result: '返回 3（A、B、C 共 3 列）',
      explanation: 'COLUMNS 直接数出区域横向有 3 列。',
    },
    {
      title: '示例 2：配合 VLOOKUP 永远返回最后一列',
      scene: '表会经常插入新列，写死列号会错位，用 COLUMNS 动态算最后一列。',
      dataTsv: '工号\t姓名\t部门\nA001\t张三\t技术部',
      dataAnchor: 'A1',
      formula: '=VLOOKUP("A001",A2:C3,COLUMNS(A1:C1),FALSE)',
      result: '返回「技术部」（最后一列）',
      explanation: 'COLUMNS(A1:C1) 算出表头有 3 列，VLOOKUP 据此返回第 3 列（部门）。插入列后表头变 4 列，这里自动跟着变。',
    },
    {
      title: '示例 3：数组常量也算列数',
      scene: '直接给一个数组常量，看它有几列。',
      dataTsv: 'x',
      dataAnchor: 'A1',
      formula: '=COLUMNS({1,2,3,4})',
      result: '返回 4（一行 4 个元素）',
      explanation: '数组常量 {1,2,3,4} 横着有 4 个，COLUMNS 返回 4。',
    },
  ],
  pitfalls: [
    {
      title: '和 COLUMN 搞混',
      reason: 'COLUMN(单个格) 返回那个格的列「号」（如 C=3），COLUMNS(区域) 返回区域有几「列」（如 A:C=3）。两者含义不同，混用会算错列号。',
      fix: '要「列号」用 COLUMN，要「列数（宽度）」用 COLUMNS。',
      level: 'mid',
    },
    {
      title: '给单行区域时仍返回列数',
      reason: 'COLUMNS 永远数「列」。即使你只给一行（如 A1:C1），它仍返回 3，不是 1。',
      fix: '想数「行数」用 ROWS，别用 COLUMNS。',
      level: 'low',
    },
  ],
  related: [
    { id: 'rows', kind: 'confusable', why: 'ROWS 数行数、COLUMNS 数列数，是一对孪生函数。' },
    { id: 'column', kind: 'confusable', why: 'COLUMN 返回单格列号，COLUMNS 返回区域列数，易混。' },
    { id: 'vlookup', kind: 'companion', why: 'COLUMNS 常作 VLOOKUP 的返回列号，实现「返回末列不写死」。' },
    { id: 'index', kind: 'companion', why: 'INDEX 的列号参数也常用 COLUMNS 动态算。' },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A1:C3' },
    fields: [
      { key: 'array', label: '区域', type: 'ref', default: 'A1:C3', rangeKey: 'array' },
    ],
    template: '=COLUMNS({array})',
    cases: [
      { label: '默认：3 列区域', type: 'ok', values: {}, expect: '3', note: 'A1:C3 横向有 A、B、C 共 3 列' },
      { label: '单列区域', type: 'ok', values: { array: 'A1:A3' }, expect: '1', note: 'A1:A3 只有 1 列' },
      { label: '区域非法 → #REF!', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
      { label: '缺列字母 → #REF!', type: 'error', values: { array: 'A' }, expect: '#REF!', note: '单独的列字母无法解析成区域' },
      { label: '空区域 → #REF!', type: 'error', values: { array: '' }, expect: '#REF!', note: '区域不能为空' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default columnsEntry;
