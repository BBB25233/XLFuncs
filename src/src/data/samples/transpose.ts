import type { FunctionEntry } from '@/types';

/** TRANSPOSE · 行列转置（lookup 类 B7 批次） */

const TSV = 'A\tB\tC\n1\t2\t3\n4\t5\t6';

const transposeEntry: FunctionEntry = {
  id: 'transpose',
  enName: 'TRANSPOSE',
  zhName: '行列转置',
  zhCommon: ['行列对调', '转置', '行列互换'],
  alias: ['矩阵转置', '横竖翻转', 'TRANSPOSE'],
  category: 'lookup',
  abbr: 'hlzz',
  pinyin: 'hangliezhuanzhi',
  keywords: ['行列互换', '横变竖', '竖变横', '数组公式', 'TRANSPOSE'],
  difficulty: 2,
  usageLevel: 35,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '中文版 Excel 不翻译这个函数名，输入「行列转置」只会得到 #NAME?。TRANSPOSE 把区域的「行变列、列变行」。它是数组函数：老版本要选中与结果等大的区域、输入公式后按 Ctrl+Shift+Enter；Microsoft 365 直接回车会自动溢出。结果区域被挡会报 #SPILL!。',
  },
  oneLiner: '把一块区域的行和列对调（横竖翻转）',
  summary:
    'TRANSPOSE 干的是「转置」：你给它一片 m 行 n 列的区域，它返回一个 n 行 m 列的区域，原来的第 1 行变成第 1 列、第 1 列变成第 1 行。它是数组函数——在 Microsoft 365 / 2021 里直接回车就会「溢出」填满整片结果区；在老版本里要先选中与结果同样大小的空白区域，输入公式后按 Ctrl+Shift+Enter 录入。结果区被别的已有数据挡住会报 #SPILL!。',
  syntax: {
    patternCn: '=TRANSPOSE(区域)',
    patternEn: '=TRANSPOSE(array)',
    args: [
      {
        key: 'array',
        zh: '区域',
        en: 'array',
        required: true,
        desc: '要转置的那片区域（行数、列数随意）。',
        accepts: '任意矩形区域，如 A1:C2。',
        ifOmitted: '必填。',
        example: 'A1:C2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回一个「行列互换」后的数组区域（自动溢出）；结果区被挡则 #SPILL!。',
  examples: [
    {
      title: '示例 1：整块区域转置（2 行 3 列 → 3 行 2 列）',
      scene: 'A2:C3 是 2 行 3 列的小表，想把行列整体对调。',
      dataTsv: 'A\tB\tC\n1\t2\t3\n4\t5\t6',
      dataAnchor: 'A1',
      formula: '=TRANSPOSE(A2:C3)',
      result: '返回 3 行 2 列：第 1 行 1/4，第 2 行 2/5，第 3 行 3/6',
      explanation: '原区域的行变成新区域的列、列变成行。A2:C3 不含表头，转置后正好是 3×2。',
    },
    {
      title: '示例 2：整块区域转置',
      scene: 'A1:C2 是 2 行 3 列，想整体翻转行列。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TRANSPOSE(A1:C2)',
      result: '返回 3 行 2 列：第 1 行 1/4，第 2 行 2/5，第 3 行 3/6',
      explanation: '原区域的行变成新区域的列，列变成行。结果区要留 3 行 2 列的空白。',
    },
    {
      title: '示例 3：结果区被挡 → #SPILL!',
      scene: '公式下方/右方已有数据，TRANSPOSE 没地方溢出。',
      dataTsv: 'x\tx\n1\t2',
      dataAnchor: 'A1',
      formula: '=TRANSPOSE(A1:B1)',
      result: '#SPILL!（下方被占用）',
      explanation: '动态数组需要一片空白来溢出。清掉挡路的格子后公式自动展开。',
    },
  ],
  pitfalls: [
    {
      title: '老版本忘了 Ctrl+Shift+Enter',
      reason: '在 Excel 2019 及更早版本，TRANSPOSE 是数组公式，直接回车只返回一个值。必须先选中与结果等大的区域、输入公式、再按 Ctrl+Shift+Enter 录入。',
      fix: 'Microsoft 365/2021 直接回车即可溢出；老版本务必用三键录入，且预先框好结果区域大小。',
      level: 'high',
    },
    {
      title: '结果区域被挡 → #SPILL!',
      reason: 'TRANSPOSE 的结果会溢出占用一片格子，若被已有数据挡住就报 #SPILL!。',
      fix: '把公式放到一片完全空白的区域，或清掉挡路的内容。',
      level: 'high',
      errorCode: '#SPILL!',
    },
    {
      title: '选的区域大小和结果不匹配（老版本）',
      reason: '老版本里若选中区域比转置结果小，会截断；比结果大，多余格子显示 #N/A。',
      fix: '选中区域应正好等于「原列数 × 原行数」的转置尺寸。',
      level: 'mid',
    },
  ],
  related: [
    { id: 'rows', kind: 'companion', why: 'TRANSPOSE 后行数变列数，ROWS/COLUMNS 常用来预判结果尺寸。' },
    { id: 'columns', kind: 'companion', why: '转置后原列数成新行数，COLUMNS 配合确认结果宽度。' },
    { id: 'unique', kind: 'companion', why: 'UNIQUE 等动态数组函数同样会溢出，和 TRANSPOSE 的 #SPILL! 行为一致。' },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:C3' },
    fields: [
      { key: 'array', label: '区域', type: 'ref', default: 'A2:C3', rangeKey: 'array' },
    ],
    template: '=TRANSPOSE({array})',
    cases: [
      { label: '默认：2×3 转置为 3×2', type: 'ok', values: {}, expect: '1,4\n2,5\n3,6', note: 'A2:C3 是 2 行 3 列，转置后 3 行 2 列，用换行+逗号拼接' },
      { label: '区域非法 → #REF!', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
      { label: '缺列字母 → #REF!', type: 'error', values: { array: 'A' }, expect: '#REF!', note: '单独的列字母无法解析成区域' },
      { label: '空区域 → #REF!', type: 'error', values: { array: '' }, expect: '#REF!', note: '区域不能为空' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default transposeEntry;
