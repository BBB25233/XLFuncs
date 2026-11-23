import type { FunctionEntry } from '@/types';

/** RIGHTB · 按字节从右截取（text 类 B5 批次） */

const TSV = '文本\t说明\nExcel中文\t英文前后\n数据表ABC\t中文在前';

const rightbEntry: FunctionEntry = {
  id: 'rightb',
  enName: 'RIGHTB',
  zhName: '按字节从右截取',
  zhCommon: ['RIGHTB', '字节右截取', '右字节'],
  alias: ['右字节', '按字节取右', 'RIGHTB'],
  category: 'text',
  abbr: 'azjcyjq',
  pinyin: 'anzijiecongyoujiequ',
  keywords: ['RIGHTB', '字节', '右边', '截取', '双字节', 'DBCS'],
  difficulty: 3,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: 'DBCS 环境下中文按 2 字节计；非 DBCS 环境与 RIGHT 等价。',
  },
  oneLiner: '按「字节数」从右边截取文本（中文等双字节字符算 2 字节）',
  summary:
    'RIGHTB 与 RIGHT 的区别同 LEFTB/LEFT：RIGHT 数字符、RIGHTB 数字节。中文环境下汉字占 2 字节，RIGHTB(文本,4) 取右边 2 个汉字。常用于按字节宽度从尾部截取编号、后缀等。非 DBCS 环境下与 RIGHT 一致。',
  syntax: {
    patternCn: '=RIGHTB(文本, [字节数])',
    patternEn: '=RIGHTB(text, [num_bytes])',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要截取的文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 中文占 2 字节，字节数≠字符数。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'num_bytes',
        zh: '字节数',
        en: 'num_bytes',
        required: false,
        desc: '从右边截取的字节数。',
        accepts: '非负整数。',
        ifOmitted: '默认 1 字节。',
        example: '4',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回从右边数指定字节数的文本。',
  examples: [
    {
      title: '示例 1：按字节取右边 4 字节',
      scene: '「Excel中文」想取右边 4 字节。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RIGHTB(A2,4)',
      result: '中文（英 5 字节在最左被全部排除）',
      explanation: '右边 4 字节正好是「中文」两个汉字。',
    },
    {
      title: '示例 2：与 RIGHT 的区别',
      scene: '同一文本，RIGHT(,2) vs RIGHTB(,2)。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RIGHT(A2,2)',
      result: '中文（按字符）；RIGHTB(A2,2) 只返回「文」（按字节）',
      explanation: 'RIGHT 数字符、RIGHTB 数字节，混排下差异明显。',
    },
  ],
  pitfalls: [
    {
      title: '把 RIGHTB 当 RIGHT 用',
      reason: '含中文时字节数≠字符数，RIGHTB 会「少取」字符。',
      fix: '按字符截取用 RIGHT；仅字节宽度场景用 RIGHTB。',
      level: 'high',
    },
    {
      title: '奇数字节跨汉字',
      reason: '字节截取落在双字节字符中间会被取整到字符边界。',
      fix: '偶数字节更稳妥。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'right',
      kind: 'confusable',
      why: 'RIGHT 数字符、RIGHTB 数字节。',
    },
    {
      id: 'leftb',
      kind: 'companion',
      why: 'LEFTB 是 RIGHTB 的从左字节版本。',
    },
    {
      id: 'lenb',
      kind: 'companion',
      why: 'LENB 给出总字节数，配合决定截取量。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"Excel中文"' },
      { key: 'num_bytes', label: '字节数', type: 'number', default: '4' },
    ],
    template: '=RIGHTB({text},{num_bytes})',
    cases: [
      { label: '默认：Excel中文 右 4 字节', type: 'ok', values: {}, expect: '中文', note: '右侧 4 字节正好是「中文」' },
      { label: '字节数为负 → #VALUE!', type: 'error', values: { num_bytes: '-1' }, expect: '#VALUE!', note: '负数非法' },
      { label: '字节数非数字 → #VALUE!', type: 'error', values: { num_bytes: 'abc' }, expect: '#VALUE!', note: '文本当字节数非法' },
      { label: '字节数小数 → #VALUE!', type: 'error', values: { num_bytes: '2.5' }, expect: '#VALUE!', note: '本实现要求整数（简化判错）' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default rightbEntry;
