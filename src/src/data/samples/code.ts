import type { FunctionEntry } from '@/types';

/** CODE · 字符转数字（text 类 B5 批次） */

const TSV = '字符\t\nA\t\na\t\n0\t\n中\t';

const codeEntry: FunctionEntry = {
  id: 'code',
  enName: 'CODE',
  zhName: '字符转数字',
  zhCommon: ['CODE', '字符转数字', '取字符代码'],
  alias: ['取ASCII码', '字符代码', '首字符编码'],
  category: 'text',
  abbr: 'zfzsz',
  pinyin: 'zifuzhuanshuzi',
  keywords: ['CODE', '字符转数字', 'ASCII码', '字符代码', '取首字符'],
  difficulty: 3,
  usageLevel: 15,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '返回文本第一个字符对应的数字代码',
  summary:
    'CODE 是 CHAR 的反向操作，但**只取第一个字符**——传 "ABC" 得到的是 65（A 的代码），不是整串的编码。它常用于判断首字符类型（是否字母、是否数字）：CODE ≥ 65 且 ≤ 90 就是大写字母。注意它用的是系统字符集，中文返回的是对应 ANSI 代码；需要 Unicode 码位请改用 UNICODE。',
  syntax: {
    patternCn: '=CODE(文本)',
    patternEn: '=CODE(text)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要取代码的文本，只取第一个字符。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 只返回第一个字符的代码，多字符文本会被截断处理。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回文本第一个字符的字符代码（1–255）；空文本返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：取常见字符的代码',
      scene: '看看字母与数字分别对应什么代码。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CODE(A2)',
      result: 'A → 65；a → 97；0 → 48；中 → 对应的 ANSI 代码',
      explanation: '大写 A–Z 是 65–90，小写 a–z 是 97–122，数字 0–9 是 48–57。',
    },
    {
      title: '示例 2：只取第一个字符（多字符会被截断）',
      scene: '传一整串文字看看会怎样。',
      dataTsv: '文本\nABC\nHello',
      dataAnchor: 'A1',
      formula: '=CODE(A2)',
      result: '65（只有 A 的代码，BC 被忽略）',
      explanation: '这是最容易误解的一点：CODE 不是「整串编码」，只认第一个字符。',
    },
    {
      title: '示例 3：判断是否以字母开头',
      scene: '要区分编码列是字母开头还是数字开头。',
      dataTsv: '编码\nAB-01\n12-CD\nxy-99',
      dataAnchor: 'A1',
      formula: '=IF(AND(CODE(A2)>=65,CODE(A2)<=90),"大写字母开头","其他")',
      result: '大写字母开头；其他；其他',
      explanation: '结合 AND 判断代码区间即可分类。判断字符类型是 CODE 最实用的场景。',
    },
  ],
  pitfalls: [
    {
      title: '以为它返回整串文本的代码',
      reason: 'CODE 只处理第一个字符，其余字符被忽略，且不报错。',
      fix: '要逐字符处理请配合 MID 拆分：=CODE(MID(A2,2,1)) 取第二个字符。',
      level: 'high',
    },
    {
      title: '对空文本报错',
      reason: '没有字符可取时返回 #VALUE!。',
      fix: '先用 IF 判断非空：=IF(A2="","",CODE(A2))。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '中文/Unicode 字符结果依赖系统字符集',
      reason: 'CODE 返回系统 ANSI 代码，不同平台可能不同，也不等于 Unicode 码位。',
      fix: '要统一的 Unicode 码位请用 UNICODE 函数。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'char',
      kind: 'companion',
      why: 'CHAR 是 CODE 的反向操作（代码 → 字符），两者互为逆运算。',
    },
    {
      id: 'unicode',
      kind: 'alternative',
      why: '需要跨平台一致的 Unicode 码位时用 UNICODE，而不是 CODE。',
    },
    {
      id: 'mid',
      kind: 'companion',
      why: '配合 MID 可以取出任意位置的字符再取代码。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"A"' },
    ],
    template: '=CODE({text})',
    cases: [
      { label: '默认：A 的码位 → 65', type: 'ok', values: {}, expect: '65', note: 'CODE("A") 返回 65' },
      { label: '空文本 → #VALUE!', type: 'error', values: { text: '""' }, expect: '#VALUE!', note: 'CODE 不接受空串' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'ABC' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { text: 'x' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default codeEntry;
