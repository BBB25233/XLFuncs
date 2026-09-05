import type { FunctionEntry } from '@/types';

/** REPLACEB · 按字节替换（text 类 B5 批次） */

const TSV = '文本\t说明\n"中文Excel"\t要替换\n"中文测试"\t纯中文';

const replacebEntry: FunctionEntry = {
  id: 'replaceb',
  enName: 'REPLACEB',
  zhName: '按字节替换',
  zhCommon: ['REPLACEB', '字节替换', '替换子串'],
  alias: ['字节替换文本', '按字节替换', 'REPLACEB'],
  category: 'text',
  abbr: 'azjth',
  pinyin: 'anzijietihuan',
  keywords: ['REPLACEB', '字节', '替换', '位置替换', 'DBCS'],
  difficulty: 3,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: '是 REPLACE 的字节版：start_num 与 num_bytes 都是字节数。',
  },
  oneLiner: '从指定字节位置起，按字节数替换一段文本',
  summary:
    'REPLACEB 是 REPLACE 的字节版：按字节位置定位、按字节数决定替换长度。在中文混排、按字节宽度维护报文/编号时，必须用 REPLACEB 而不是 REPLACE（否则字符数≠字节数会错位）。SUBSTITUTE 是按内容替换、REPLACEB 是按位置替换，别混淆。',
  syntax: {
    patternCn: '=REPLACEB(原文本, 起始字节, 替换字节数, 新文本)',
    patternEn: '=REPLACEB(old_text, start_num, num_bytes, new_text)',
    args: [
      {
        key: 'old_text',
        zh: '原文本',
        en: 'old_text',
        required: true,
        desc: '要被替换的源文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 起始/长度都是字节数，中文占 2 字节。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'start_num',
        zh: '起始字节',
        en: 'start_num',
        required: true,
        desc: '从左边第几个字节开始替换（含该字节）。',
        accepts: '正整数。',
        ifOmitted: '这是必填参数。',
        example: '5',
        pitfallRank: 2,
      },
      {
        key: 'num_bytes',
        zh: '替换字节数',
        en: 'num_bytes',
        required: true,
        desc: '要替换掉的字节数（从起始字节起算）。',
        accepts: '非负整数。',
        ifOmitted: '这是必填参数。',
        example: '5',
        pitfallRank: 3,
      },
      {
        key: 'new_text',
        zh: '新文本',
        en: 'new_text',
        required: true,
        desc: '用来替换进去的文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数。',
        example: 'B2',
        pitfallRank: 4,
      },
    ],
  },
  returnValue: '返回替换后的新文本。',
  examples: [
    {
      title: '示例 1：按字节替换英文段',
      scene: '「中文Excel」把第 5 字节起的 5 字节（Excel）换成「表格」。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=REPLACEB(A2,5,5,"表格")',
      result: '中文表格',
      explanation: '「中文」占 4 字节，第 5 字节起 5 字节是 Excel，整段替换为「表格」。',
    },
    {
      title: '示例 2：与 REPLACE 的区别',
      scene: '同一文本，REPLACE(,3,5,...) vs REPLACEB(,5,5,...)。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=REPLACE(A2,3,5,"表格")',
      result: '中文表格（按字符）；REPLACEB 按字节起始位置不同',
      explanation: 'REPLACE 数字符位置、REPLACEB 数字节位置，混排必须分清。',
    },
  ],
  pitfalls: [
    {
      title: '把 REPLACEB 当 REPLACE 用',
      reason: '含中文时字节≠字符，起始/长度要按字节重算。',
      fix: '按字符定位用 REPLACE；字节宽度场景用 REPLACEB。',
      level: 'high',
    },
    {
      title: '与 SUBSTITUTE 混淆',
      reason: 'SUBSTITUTE 按「内容」替换、REPLACEB 按「位置」替换，语义不同。',
      fix: '知道要换的具体文字用 SUBSTITUTE；只知道位置用 REPLACEB。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'replace',
      kind: 'confusable',
      why: 'REPLACE 数字符位置、REPLACEB 数字节位置。',
    },
    {
      id: 'substitute',
      kind: 'confusable',
      why: 'SUBSTITUTE 按内容替换，REPLACEB 按位置替换。',
    },
    {
      id: 'findb',
      kind: 'companion',
      why: '先用 FINDB 找字节位置，再 REPLACEB 替换。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'old_text', label: '原文本', type: 'text', default: '"中文AB"' },
      { key: 'start_num', label: '起始字节', type: 'number', default: '5' },
      { key: 'num_bytes', label: '字节数', type: 'number', default: '2' },
      { key: 'new_text', label: '新文本', type: 'text', default: '"XY"' },
    ],
    template: '=REPLACEB({old_text},{start_num},{num_bytes},{new_text})',
    cases: [
      { label: '默认：中文AB 第5字节起替换2字节', type: 'ok', values: {}, expect: '中文XY', note: '第5字节起是 AB，替换为 XY → 中文XY' },
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

export default replacebEntry;
