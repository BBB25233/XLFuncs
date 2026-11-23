import type { FunctionEntry } from '@/types';

/** EXACT · 区分大小写比较（text 类 B5 批次） */

const TSV = '系统A\t系统B\nABC-123\tabc-123\nOK-99\tOK-99\nX1\tX2';

const exactEntry: FunctionEntry = {
  id: 'exact',
  enName: 'EXACT',
  zhName: '区分大小写比较',
  zhCommon: ['区分大小写', 'EXACT', '精确比较'],
  alias: ['大小写敏感比较', '完全一致判断', '严格相等'],
  category: 'text',
  abbr: 'qfdxxbj',
  pinyin: 'qufendaxiaoxiebijiao',
  keywords: ['EXACT', '区分大小写', '精确比较', '大小写敏感', '核对编码'],
  difficulty: 2,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '判断两段文字是否完全相同，并且区分大小写',
  summary:
    'Excel 里用 `=` 比较两个文本时**不区分大小写**：`="ABC"="abc"` 会返回 TRUE。EXACT 补上了这个缺口——它做严格比较，大小写不同就返回 FALSE。核对订单号、SKU、优惠券码这类「大小写有意义」的编码时必须用它。注意它**忽略格式**（字体颜色、加粗不影响结果），只比较字符内容。',
  syntax: {
    patternCn: '=EXACT(文本1, 文本2)',
    patternEn: '=EXACT(text1, text2)',
    args: [
      {
        key: 'text1',
        zh: '文本1',
        en: 'text1',
        required: true,
        desc: '要比较的第一段文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '数字也会被当文本比较；=EXACT(1,"1") 返回 FALSE（类型不同）。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'text2',
        zh: '文本2',
        en: 'text2',
        required: true,
        desc: '要比较的第二段文本。',
        accepts: '同「文本1」。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '前后有空格也会导致 FALSE，比较前最好先 TRIM。',
        example: 'B2',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '两段文本完全一致（含大小写）返回 TRUE，否则返回 FALSE。',
  examples: [
    {
      title: '示例 1：核对两个系统的编码是否一致',
      scene: '两个系统导出的编码看起来一样，要找出大小写不一致的记录。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=EXACT(A2,B2)',
      result: 'FALSE（ABC-123 ≠ abc-123）；第二行 TRUE；第三行 FALSE',
      explanation: '第 1 行大小写不同 → FALSE，正是需要人工核对的异常记录。',
    },
    {
      title: '示例 2：与 = 运算符的对比',
      scene: '说明为什么必须用 EXACT 而不是等号。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=A2=B2',
      result: 'TRUE（等号不区分大小写，把 ABC-123 和 abc-123 当成一样）',
      explanation: '这就是最危险的坑：用等号核对编码会漏掉所有大小写差异。',
    },
    {
      title: '示例 3：批量找出不一致的行',
      scene: '上千行数据，只想看哪些行不一致。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=IF(EXACT(A2,B2),"","不一致")',
      result: '第 1、3 行标记「不一致」，第 2 行留空',
      explanation: '配合 IF 把结果转成可读标记，再筛选即可快速定位问题行。',
    },
  ],
  pitfalls: [
    {
      title: '用 = 等号代替 EXACT 来核对编码',
      reason: '等号比较文本时不区分大小写，会漏掉所有大小写差异，且不报错。',
      fix: '凡「大小写有意义」的编码核对（订单号、券码、SKU）一律用 EXACT。',
      level: 'high',
    },
    {
      title: '前后空格导致明明一样却返回 FALSE',
      reason: 'EXACT 逐字符比较，一个尾随空格就会让结果变成 FALSE，肉眼很难发现。',
      fix: '先清理：=EXACT(TRIM(A2),TRIM(B2))。',
      level: 'high',
    },
    {
      title: '拿它比较数字与文本形式的数字',
      reason: '=EXACT(1,"1") 返回 FALSE，因为类型不同（数值 vs 文本）。',
      fix: '统一类型后再比较，如 =EXACT(TEXT(A2,"0"),B2)。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'trim',
      kind: 'companion',
      why: '比较前先用 TRIM 去掉多余空格，避免「看起来一样却 FALSE」。',
    },
    {
      id: 'find',
      kind: 'confusable',
      why: 'FIND 区分大小写、SEARCH 不区分；与 EXACT 的严格/宽松思路一致。',
    },
    {
      id: 'if',
      kind: 'companion',
      why: '常配合 IF 把 TRUE/FALSE 转成可读的核对结论。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text1', label: '文本1', type: 'text', default: '"abc"' },
      { key: 'text2', label: '文本2', type: 'text', default: '"abc"' },
    ],
    template: '=EXACT({text1},{text2})',
    cases: [
      { label: '默认：两串相同 → TRUE', type: 'ok', values: {}, expect: 'TRUE', note: 'EXACT 区分大小写，完全相同才 TRUE' },
      { label: '两串不同 → FALSE', type: 'ok', values: { text2: '"xyz"' }, expect: 'FALSE', note: '内容不一致返回 FALSE' },
      { label: '文本1 未加引号 → #NAME?', type: 'error', values: { text1: 'abc' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '文本2 未加引号 → #NAME?', type: 'error', values: { text2: 'xyz' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '两处都未加引号 → #NAME?', type: 'error', values: { text1: 'foo', text2: 'bar' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default exactEntry;
