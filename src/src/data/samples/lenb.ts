import type { FunctionEntry } from '@/types';

/** LENB · 字节长度（text 类 B5 批次） */

const TSV = '文本\t说明\n"中文"\t纯中文\n"Excel"\t纯英文\n"中文A"\t混排';

const lenbEntry: FunctionEntry = {
  id: 'lenb',
  enName: 'LENB',
  zhName: '字节长度',
  zhCommon: ['LENB', '字节数', '字节长度'],
  alias: ['字符字节数', '双字节长度', 'LENB'],
  category: 'text',
  abbr: 'zjcd',
  pinyin: 'zijiechangdu',
  keywords: ['LENB', '字节', '长度', '字符数', '双字节', 'DBCS'],
  difficulty: 2,
  usageLevel: 14,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: 'DBCS 环境下中文按 2 字节计，所以「中文A」的 LENB 是 5（2+2+1）；非 DBCS 环境与 LEN 等价。',
  },
  oneLiner: '返回文本的「字节数」（中文等双字节字符算 2 字节）',
  summary:
    'LENB 是 LEN 的字节版：返回文本占用的字节数。在中文环境下，一个汉字占 2 字节，所以 LENB 常用于判断含中文文本的真实存储宽度、校验固定字节长度字段。常见技巧：用 LENB(文本)-LEN(文本) 反推出中文字符个数（每个中文多 1 字节）。',
  syntax: {
    patternCn: '=LENB(文本)',
    patternEn: '=LENB(text)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要测字节长度的文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 中文 2 字节、英文 1 字节；空格也算 1 字节。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回文本的字节数（整数）。',
  examples: [
    {
      title: '示例 1：中英文字节数差异',
      scene: '对比「中文」「Excel」「中文A」的字节长度。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LENB(A2)',
      result: '4（中文）；5（Excel）；5（中文A = 2+2+1）',
      explanation: '中文按 2 字节、英文按 1 字节，混排时直接相加。',
    },
    {
      title: '示例 2：用 LENB-LEN 算中文字数',
      scene: '想知道「中文A」里有几个汉字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LENB(A4)-LEN(A4)',
      result: '2（2 个汉字）',
      explanation: '每多 1 个中文，LENB 比 LEN 多 1，差值即中文字数。',
    },
  ],
  pitfalls: [
    {
      title: '把 LENB 当字符数用',
      reason: '含中文时 LENB 是字节数，不是肉眼看到的字符个数。',
      fix: '要字符个数用 LEN；只有字节宽度需求才用 LENB。',
      level: 'high',
    },
    {
      title: '以为空格不计数',
      reason: '空格也是 1 字节，会计入 LENB。',
      fix: '统计前可用 SUBSTITUTE(文本," ","") 先去掉空格再算。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'len',
      kind: 'confusable',
      why: 'LEN 数字符、LENB 数字节，混排中文时结果不同。',
    },
    {
      id: 'leftb',
      kind: 'companion',
      why: 'LENB 的字节数常作为 LEFTB/MIDB 的截取依据。',
    },
    {
      id: 'substitute',
      kind: 'companion',
      why: '去空格/去特定字符后再算字节长度更准。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"中文A"' },
    ],
    template: '=LENB({text})',
    cases: [
      { label: '默认：中文A 的字节数', type: 'ok', values: {}, expect: '5', note: '中文A = 中(2)+文(2)+A(1) = 5 字节' },
      { label: '空文本 → #VALUE!', type: 'error', values: { text: '' }, expect: '#VALUE!', note: '空文本无法计算字节数（本实现按试算场要求判 #VALUE!）' },
      { label: '纯空白 → #VALUE!', type: 'error', values: { text: '   ' }, expect: '#VALUE!', note: '纯空白视为无效输入' },
      { label: '制表符空白 → #VALUE!', type: 'error', values: { text: '\t' }, expect: '#VALUE!', note: '纯空白视为无效输入' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default lenbEntry;
