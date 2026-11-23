import type { FunctionEntry } from '@/types';

/** MIDB · 按字节中间截取（text 类 B5 批次） */

const TSV = '文本\t说明\n中文Excel中文\t中英混排\nAB中文CD\t中英夹心';

const midbEntry: FunctionEntry = {
  id: 'midb',
  enName: 'MIDB',
  zhName: '按字节中间截取',
  zhCommon: ['MIDB', '字节中间截取', '中字节'],
  alias: ['字节取中', '按字节取子串', 'MIDB'],
  category: 'text',
  abbr: 'azjzjjq',
  pinyin: 'anzijiezhongjianjiequ',
  keywords: ['MIDB', '字节', '中间', '截取', '子串', 'DBCS'],
  difficulty: 3,
  usageLevel: 7,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: 'DBCS 环境下中文按 2 字节计；start 与 num 均为「字节数」。',
  },
  oneLiner: '从指定字节位置起，按字节数从中间截取一段文本',
  summary:
    'MIDB 是 MID 的字节版：start_num 和 num_bytes 都是字节数。在中文混排场景里，用 MIDB 才能按「字节宽度」精确截取（比如处理固定字节宽度报文的某一段）。注意起始字节落在双字节字符中间时，会从该字符边界开始。非 DBCS 环境下与 MID 等价。',
  syntax: {
    patternCn: '=MIDB(文本, 起始字节, 字节数)',
    patternEn: '=MIDB(text, start_num, num_bytes)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要截取的源文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 起始位置是按字节计，中文占 2 字节。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'start_num',
        zh: '起始字节',
        en: 'start_num',
        required: true,
        desc: '从左边第几个字节开始取（含该字节）。',
        accepts: '正整数。',
        ifOmitted: '这是必填参数。',
        example: '5',
        pitfallRank: 2,
      },
      {
        key: 'num_bytes',
        zh: '字节数',
        en: 'num_bytes',
        required: true,
        desc: '要截取的字节数。',
        accepts: '非负整数。',
        ifOmitted: '这是必填参数。',
        example: '4',
        pitfallRank: 3,
      },
    ],
  },
  returnValue: '返回从指定字节起、指定字节数的子串。',
  examples: [
    {
      title: '示例 1：按字节取中间',
      scene: '「中文Excel中文」从第 5 字节取 4 字节。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=MIDB(A2,5,4)',
      result: 'Excel（前 4 字节是「中文」，第 5 字节起是 Excel）',
      explanation: '「中文」占 4 字节，第 5 字节起正好进入英文 Excel。',
    },
    {
      title: '示例 2：与 MID 的区别',
      scene: '同一文本，MID(,3,4) vs MIDB(,5,4)。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=MID(A2,3,4)',
      result: 'Excel中（按字符）；MIDB 按字节结果不同',
      explanation: 'MID 数字符位置、MIDB 数字节位置，混排时务必分清。',
    },
  ],
  pitfalls: [
    {
      title: '把 MIDB 当 MID 用',
      reason: '含中文时字节≠字符，起始/长度都要按字节重算。',
      fix: '按字符定位用 MID；只有字节宽度需求才用 MIDB。',
      level: 'high',
    },
    {
      title: '起始字节跨在汉字中间',
      reason: '起始字节落在双字节字符内部会回退到该字符边界。',
      fix: '起始字节尽量落在字符边界（中文用偶数/合理偏移）。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'mid',
      kind: 'confusable',
      why: 'MID 数字符、MIDB 数字节。',
    },
    {
      id: 'leftb',
      kind: 'companion',
      why: 'LEFTB/MIDB/RIGHTB 是同族字节截取函数。',
    },
    {
      id: 'lenb',
      kind: 'companion',
      why: 'LENB 给出总字节数，便于定位起始字节。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"中文A1B"' },
      { key: 'start_num', label: '起始字节', type: 'number', default: '3' },
      { key: 'num_bytes', label: '字节数', type: 'number', default: '3' },
    ],
    template: '=MIDB({text},{start_num},{num_bytes})',
    cases: [
      { label: '默认：中文A1B 从第 3 字节取 3 字节', type: 'ok', values: {}, expect: '文A', note: '第3字节起=文(2字节)+A(1字节)=文A' },
      { label: '起始字节 0 → #VALUE!', type: 'error', values: { start_num: '0' }, expect: '#VALUE!', note: '起始字节必须 ≥1' },
      { label: '起始字节超出范围 → #VALUE!', type: 'error', values: { start_num: '99' }, expect: '#VALUE!', note: '起始字节超过总字节数' },
      { label: '字节数为负 → #VALUE!', type: 'error', values: { num_bytes: '-1' }, expect: '#VALUE!', note: '负数非法' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default midbEntry;
