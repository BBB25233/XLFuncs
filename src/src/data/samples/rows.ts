import type { FunctionEntry } from '@/types';

/** ROWS · 取区域行数（lookup 类 B7 批次） */

const TSV = 'A\tB\tC\n1\t2\t3\n4\t5\t6\n7\t8\t9';

const rowsEntry: FunctionEntry = {
  id: 'rows',
  enName: 'ROWS',
  zhName: '取行计数',
  zhCommon: ['区域有几行', '行数', '高度', '取行计数'],
  alias: ['行计数', '区域行数', 'ROWS'],
  category: 'lookup',
  abbr: 'qxjs',
  pinyin: 'quxingjishu',
  keywords: ['区域行数', '几行', '动态行数', '配合OFFSET', 'ROWS'],
  difficulty: 1,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '中文版 Excel 不翻译这个函数名，输入「取行数」只会得到 #NAME?。ROWS 只干一件事：数一片区域有几行，返回个数字。常和 OFFSET/COUNTA 配合，用来算「动态数据区域的高度」，做滚动求和时很实用。',
  },
  oneLiner: '数一下一片区域有几行',
  summary:
    'ROWS 和 COLUMNS 是孪生兄弟：COLUMNS 数「列」，ROWS 数「行」。你给它一块区域，它告诉你这块区域竖着有几行（返回数字）。实战里常用来算动态区域的高度，比如 ROWS(数据区) 得到数据总行数，再喂给 OFFSET 做滚动窗口，数据增减时公式自动跟着变。',
  syntax: {
    patternCn: '=ROWS(区域)',
    patternEn: '=ROWS(array)',
    args: [
      {
        key: 'array',
        zh: '区域',
        en: 'array',
        required: true,
        desc: '你要数「有几行」的那片区域。',
        accepts: '任意矩形区域，如 A2:A100；也接受数组常量。',
        ifOmitted: '必填。',
        example: 'A2:A100',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回一个数字，表示区域包含的行数。',
  examples: [
    {
      title: '示例 1：数一片区域的行数',
      scene: 'A1:C3 这片区域，想知道它有几行。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ROWS(A1:C3)',
      result: '返回 3（3 行数据）',
      explanation: 'ROWS 直接数出区域纵向有 3 行。',
    },
    {
      title: '示例 2：配合 OFFSET 做滚动窗口高度',
      scene: '数据每天追加，想用 ROWS 算出当前数据总行数，作为 OFFSET 的高度。',
      dataTsv: '数据\n10\n20\n30\n40',
      dataAnchor: 'A1',
      formula: '=SUM(OFFSET(A2,0,0,ROWS(A2:A100),1))',
      result: '对 A2 起的所有数据求和（本例 100）',
      explanation: 'ROWS(A2:A100) 返回实际有数据的行数（这里 4），OFFSET 据此取对应高度的区域交给 SUM。数据增减时高度自动更新。',
    },
    {
      title: '示例 3：数组常量也算行数',
      scene: '给一个纵向数组常量，看它有几行。',
      dataTsv: 'x',
      dataAnchor: 'A1',
      formula: '=ROWS({1;2;3})',
      result: '返回 3（三行）',
      explanation: '数组常量用分号分隔行，{1;2;3} 是 3 行，ROWS 返回 3。',
    },
  ],
  pitfalls: [
    {
      title: '和 ROW 搞混',
      reason: 'ROW(单格) 返回那个格的行「号」（如第 5 行=5），ROWS(区域) 返回区域有几「行」（如 A2:A100=99 行）。含义不同。',
      fix: '要「行号」用 ROW，要「行数（高度）」用 ROWS。',
      level: 'mid',
    },
    {
      title: '给单列区域时仍返回行数',
      reason: 'ROWS 永远数「行」。即使你只给一列（如 A1:A10），它返回 10，不是 1。',
      fix: '想数「列数」用 COLUMNS，别用 ROWS。',
      level: 'low',
    },
  ],
  related: [
    { id: 'columns', kind: 'confusable', why: 'COLUMNS 数列数、ROWS 数行数，是一对孪生函数。' },
    { id: 'row', kind: 'confusable', why: 'ROW 返回单格行号，ROWS 返回区域行数，易混。' },
    { id: 'offset', kind: 'companion', why: 'ROWS 算出的行数常作为 OFFSET 的高度参数，做动态区域。' },
    { id: 'counta', kind: 'companion', why: 'COUNT 类函数算「有数据的行数」，和 ROWS 配合做动态高度更准。' },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:C4' },
    fields: [
      { key: 'array', label: '区域', type: 'ref', default: 'A2:C4', rangeKey: 'array' },
    ],
    template: '=ROWS({array})',
    cases: [
      { label: '默认：3 行数据区', type: 'ok', values: {}, expect: '3', note: 'A2:C4 覆盖 3 行数据，ROWS 返回 3' },
      { label: '单列数据区', type: 'ok', values: { array: 'A2:A4' }, expect: '3', note: 'A2:A4 同样有 3 行数据' },
      { label: '区域非法 → #REF!', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
      { label: '缺列字母 → #REF!', type: 'error', values: { array: 'A' }, expect: '#REF!', note: '单独的列字母无法解析成区域' },
      { label: '空区域 → #REF!', type: 'error', values: { array: '' }, expect: '#REF!', note: '区域不能为空' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default rowsEntry;
