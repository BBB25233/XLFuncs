import type { FunctionEntry } from '@/types';

/** CLEAN · 清除不可打印字符（text 类 B5 批次） */

const TSV = '系统导出内容\t长度\nABC\t3\nXY\t2\nPQRS\t4';

const cleanEntry: FunctionEntry = {
  id: 'clean',
  enName: 'CLEAN',
  zhName: '清除不可打印字符',
  zhCommon: ['清除不可见字符', 'CLEAN', '清理控制符'],
  alias: ['去掉不可打印字符', '清除控制字符', '系统导出清理'],
  category: 'text',
  abbr: 'qcbkdyzf',
  pinyin: 'qingchubukedayinzifu',
  keywords: ['CLEAN', '清除不可打印字符', '控制字符', '系统导出', '数据清洗', 'CHAR(10)'],
  difficulty: 2,
  usageLevel: 28,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '去掉文本里那些看不见、打印不出来的控制字符',
  summary:
    '从业务系统、网页、ERP 导出的数据里常常夹带不可打印的控制字符（代码 0–31），它们不显示却会让 VLOOKUP 匹配失败、LEN 长度对不上。CLEAN 就是专门清理这些字符的。注意它**不处理空格**（多余空格要用 TRIM），也不处理 Unicode 里的特殊不可见字符（如不换行空格 CHAR(160)），后者需要用 SUBSTITUTE 单独处理。',
  syntax: {
    patternCn: '=CLEAN(文本)',
    patternEn: '=CLEAN(text)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要清除不可打印字符的文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '只清除代码 0–31 的控制字符，不动空格与可见字符。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回清除了不可打印字符后的文本。',
  examples: [
    {
      title: '示例 1：清理系统导出数据',
      scene: 'ERP 导出的编码表面正常，但 VLOOKUP 就是匹配不上。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CLEAN(A2)',
      result: 'ABC（去掉了肉眼看不见的控制字符）',
      explanation:
        '用 LEN 对比清洗前后的长度能验证是否真的有隐藏字符——清洗前长度可能是 5、清洗后是 3。',
    },
    {
      title: '示例 2：与 TRIM 组合做标准清洗',
      scene: '数据既有多余空格又有控制字符。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TRIM(CLEAN(A2))',
      result: 'ABC',
      explanation:
        'CLEAN 管不可打印字符、TRIM 管多余空格，两者职责不同，清洗流程通常两个都要用。',
    },
    {
      title: '示例 3：清不掉 CHAR(160) 不换行空格',
      scene: '网页复制的数据里有一种特殊空格，TRIM 和 CLEAN 都去不掉。',
      dataTsv: '内容',
      dataAnchor: 'A1',
      formula: '=SUBSTITUTE("ABC"&CHAR(160),CHAR(160),"")',
      result: 'ABC（用 SUBSTITUTE 精确替换掉不换行空格）',
      explanation:
        'CHAR(160) 是常见的不换行空格（Unicode 里的 NBSP），CLEAN 覆盖不到，必须用 SUBSTITUTE + CHAR(160) 处理。',
    },
  ],
  pitfalls: [
    {
      title: '以为它能去掉多余空格',
      reason: 'CLEAN 只清除代码 0–31 的控制字符，普通空格（代码 32）不在其列。',
      fix: '去空格用 TRIM；两者常组合使用：=TRIM(CLEAN(A2))。',
      level: 'high',
    },
    {
      title: '清不掉 CHAR(160) 等特殊 Unicode 不可见字符',
      reason: 'CLEAN 只针对 0–31 的 ASCII 控制字符，覆盖不到 Unicode 区的特殊空格。',
      fix: '用 =SUBSTITUTE(A2,CHAR(160),"") 单独替换，或嵌套多个 SUBSTITUTE。',
      level: 'high',
    },
    {
      title: '把换行符 CHAR(10) 也清掉了',
      reason: 'CHAR(10) 属于控制字符，CLEAN 会一并删除——如果那些换行是你刻意保留的就麻烦了。',
      fix: '需要保留换行时不要用 CLEAN，改用 SUBSTITUTE 精确清除特定字符。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'trim',
      kind: 'companion',
      why: 'TRIM 管多余空格、CLEAN 管不可打印字符，数据清洗通常两者一起用。',
    },
    {
      id: 'substitute',
      kind: 'companion',
      why: '处理 CLEAN 覆盖不到的特殊字符（如 CHAR(160)）要靠 SUBSTITUTE。',
    },
    {
      id: 'char',
      kind: 'companion',
      why: '配合 CHAR 可以精确定位要清除的特殊字符代码。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"Hello\x07World"' },
    ],
    template: '=CLEAN({text})',
    cases: [
      { label: '默认：去掉不可打印字符', type: 'ok', values: {}, expect: 'HelloWorld', note: '中间的控制字符（如响铃符）被剔除' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'Hello' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { text: 'abc' }, expect: '#NAME?', note: '文本必须带引号' },
      { label: '第三处未加引号 → #NAME?', type: 'error', values: { text: 'test' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default cleanEntry;
