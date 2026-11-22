import type { FunctionEntry } from '@/types';

/** SEARCHB · 按字节查找位置（不区分大小写/支持通配符，text 类 B5 批次） */

const TSV = '文本\t查找\t说明\n中文Excel\texcel\t忽略大小写\n数据表A*C\tA*C\t通配符';

const searchbEntry: FunctionEntry = {
  id: 'searchb',
  enName: 'SEARCHB',
  zhName: '按字节查找',
  zhCommon: ['SEARCHB', '字节查找', '不区分大小写查找'],
  alias: ['字节查找位置', '按字节定位', 'SEARCHB'],
  category: 'text',
  abbr: 'azjcz',
  pinyin: 'anzijiechazhao',
  keywords: ['SEARCHB', '字节', '查找', '忽略大小写', '通配符', 'DBCS'],
  difficulty: 3,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: '是 SEARCH 的字节版：返回字节位置；不区分大小写、支持 * ? 通配符。',
  },
  oneLiner: '按字节定位子串（不区分大小写、支持通配符），返回字节位置',
  summary:
    'SEARCHB 是 SEARCH 的字节版，也是 FINDB 的「宽松版」：不区分大小写、支持 *（任意多字符）和 ?（单个字符）通配符，返回的是字节序号。在中文混排、又要模糊匹配时最顺手。找不到返回 #VALUE!。非 DBCS 环境下与 SEARCH 等价。',
  syntax: {
    patternCn: '=SEARCHB(查找文本, 原文本, [起始字节])',
    patternEn: '=SEARCHB(find_text, within_text, [start_num])',
    args: [
      {
        key: 'find_text',
        zh: '查找文本',
        en: 'find_text',
        required: true,
        desc: '要找的子串，可含 * ? 通配符。',
        accepts: '文本字符串、带通配符的模式。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 不区分大小写；* 任意多字符、? 单个字符。',
        example: 'B2',
        pitfallRank: 1,
      },
      {
        key: 'within_text',
        zh: '原文本',
        en: 'within_text',
        required: true,
        desc: '被查找的源文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'start_num',
        zh: '起始字节',
        en: 'start_num',
        required: false,
        desc: '从哪个字节开始往后找。',
        accepts: '正整数，默认 1。',
        ifOmitted: '默认从第一个字节开始。',
        example: '1',
        pitfallRank: 3,
      },
    ],
  },
  returnValue: '返回子串起始字节位置；未找到返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：忽略大小写按字节定位',
      scene: '「中文Excel」里用小写 excel 找。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SEARCHB(B2,A2)',
      result: '5（不区分大小写，字节位置仍是 5）',
      explanation: '与 FINDB 不同，这里大小写不匹配也能命中。',
    },
    {
      title: '示例 2：配合通配符',
      scene: '「数据表A*C」想匹配 A…C 这段。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SEARCHB(B3,A3)',
      result: '字节位置（* 匹配中间任意字符）',
      explanation: '* 代表任意多个字符，可模糊捕获子串位置。',
    },
  ],
  pitfalls: [
    {
      title: '把 SEARCHB 当字符位置用',
      reason: '含中文时返回字节序号，直接当字符序号会错位。',
      fix: '要字符序号用 SEARCH；字节级处理才用 SEARCHB + MIDB。',
      level: 'high',
    },
    {
      title: '忘了它区分大小写与否的差异',
      reason: 'SEARCHB 不区分大小写，而 FINDB 区分——易选错。',
      fix: '需大小写敏感用 FINDB，否则用 SEARCHB。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'findb',
      kind: 'confusable',
      why: 'FINDB 区分大小写且不支持通配符；SEARCHB 相反。',
    },
    {
      id: 'search',
      kind: 'confusable',
      why: 'SEARCH 数字符位置、SEARCHB 数字节位置。',
    },
    {
      id: 'midb',
      kind: 'companion',
      why: 'SEARCHB 的字节位置常作为 MIDB 起始字节。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'find_text', label: '查找内容', type: 'text', default: '"a"' },
      { key: 'within_text', label: '源文本', type: 'text', default: '"中文A"' },
      { key: 'start_num', label: '起始字节', type: 'number', default: '1' },
    ],
    template: '=SEARCHB({find_text},{within_text},{start_num})',
    cases: [
      { label: '默认：不区分大小写找 a', type: 'ok', values: {}, expect: '5', note: '「中文A」中 A 在第 5 字节（大小写不敏感）' },
      { label: '找不到内容 → #VALUE!', type: 'error', values: { find_text: '"z"' }, expect: '#VALUE!', note: 'z 不在文本中' },
      { label: '起始字节 0 → #VALUE!', type: 'error', values: { start_num: '0' }, expect: '#VALUE!', note: '起始字节必须 ≥1' },
      { label: '起始字节超出范围 → #VALUE!', type: 'error', values: { start_num: '99' }, expect: '#VALUE!', note: '起始字节超过总字节数' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default searchbEntry;
