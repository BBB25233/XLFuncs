import type { FunctionEntry } from '@/types';

/** FINDB · 按字节查找位置（text 类 B5 批次） */

const TSV = '文本\t查找\t说明\n中文Excel\tExcel\t从字节定位\n数据表ABC\tABC\t英文子串';

const findbEntry: FunctionEntry = {
  id: 'findb',
  enName: 'FINDB',
  zhName: '按字节查找位置',
  zhCommon: ['FINDB', '字节查找', '字节位置'],
  alias: ['字节查找位置', '按字节定位', 'FINDB'],
  category: 'text',
  abbr: 'azjczwz',
  pinyin: 'anzijiechazhaoweizhi',
  keywords: ['FINDB', '字节', '查找', '位置', '区分大小写', 'DBCS'],
  difficulty: 3,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: '与 FIND 一样区分大小写、不支持通配符；区别是返回的是「字节位置」。',
  },
  oneLiner: '按字节定位子串首次出现的位置（区分大小写、不支持通配符）',
  summary:
    'FINDB 是 FIND 的字节版：返回的是子串起始处的字节序号，而非字符序号。在中文混排报文里，要配合 MIDB/LENB 做字节级定位时必须用 FINDB（而非 FIND）。它仍区分大小写、不支持通配符，找不到返回 #VALUE!。非 DBCS 环境下与 FIND 等价。',
  syntax: {
    patternCn: '=FINDB(查找文本, 原文本, [起始字节])',
    patternEn: '=FINDB(find_text, within_text, [start_num])',
    args: [
      {
        key: 'find_text',
        zh: '查找文本',
        en: 'find_text',
        required: true,
        desc: '要找的子串。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 区分大小写，且不支持 * ? 通配符。',
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
        desc: '从哪个字节开始往后找（字节序号）。',
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
      title: '示例 1：按字节定位英文子串',
      scene: '「中文Excel」里找 Excel 的起始字节。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FINDB(B2,A2)',
      result: '5（「中文」占 4 字节，第 5 字节起是 Excel）',
      explanation: '返回字节位置，正好与 MIDB 的起始字节对应。',
    },
    {
      title: '示例 2：区分大小写导致找不到',
      scene: '用大写去查小写子串。',
      dataTsv: '文本\t查找\n中文excel\tExcel',
      dataAnchor: 'A1',
      formula: '=FINDB(B2,A2)',
      result: '#VALUE!（大小写不匹配）',
      explanation: 'FINDB 区分大小写；要忽略大小写用 SEARCHB。',
    },
  ],
  pitfalls: [
    {
      title: '把 FINDB 当字符位置用',
      reason: '含中文时返回的是字节序号，直接当字符序号做 MID 会错位。',
      fix: '要字符序号用 FIND；字节级处理才用 FINDB + MIDB。',
      level: 'high',
    },
    {
      title: '用通配符却查不到',
      reason: 'FINDB/FIND 不支持 * ? 通配符，会把它当普通字符。',
      fix: '要通配符用 SEARCHB。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'find',
      kind: 'confusable',
      why: 'FIND 数字符位置、FINDB 数字节位置。',
    },
    {
      id: 'searchb',
      kind: 'alternative',
      why: 'SEARCHB 不区分大小写且支持通配符，其余同 FINDB。',
    },
    {
      id: 'midb',
      kind: 'companion',
      why: 'FINDB 的字节位置常作为 MIDB 的起始字节。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'find_text', label: '查找内容', type: 'text', default: '"中"' },
      { key: 'within_text', label: '源文本', type: 'text', default: '"中文A"' },
      { key: 'start_num', label: '起始字节', type: 'number', default: '1' },
    ],
    template: '=FINDB({find_text},{within_text},{start_num})',
    cases: [
      { label: '默认：在中文A 中找「中」', type: 'ok', values: {}, expect: '1', note: '「中」从第 1 字节开始' },
      { label: '找不到内容 → #VALUE!', type: 'error', values: { find_text: '"Z"' }, expect: '#VALUE!', note: 'Z 不在文本中' },
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

export default findbEntry;
