import type { FunctionEntry } from '@/types';

/** LEFTB · 按字节从左截取（text 类 B5 批次） */

const TSV = '文本\t说明\n中文Excel\t中英混排\nABC中文\t英文在前';

const leftbEntry: FunctionEntry = {
  id: 'leftb',
  enName: 'LEFTB',
  zhName: '按字节从左截取',
  zhCommon: ['LEFTB', '字节左截取', '左字节'],
  alias: ['左字节', '按字节取左', 'LEFTB'],
  category: 'text',
  abbr: 'azjczjq',
  pinyin: 'anzijiecongzuojiequ',
  keywords: ['LEFTB', '字节', '左边', '截取', '双字节', 'DBCS'],
  difficulty: 3,
  usageLevel: 7,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: '在 DBCS 语言（中文/日文）环境下，中文等按 2 字节计，英文按 1 字节；非 DBCS 环境与 LEFT 等价。',
  },
  oneLiner: '按「字节数」从左边截取文本（中文等双字节字符算 2 字节）',
  summary:
    'LEFTB 和 LEFT 的唯一区别：LEFT 数「字符」、LEFTB 数「字节」。在中文环境下，一个汉字占 2 字节，所以 LEFTB(文本,2) 只取到 1 个汉字，而 LEFT(文本,2) 能取 2 个汉字。它常见于处理固定宽度字节报文、或需要按字节长度截断的场景。非 DBCS 语言（如纯英文 Excel）下两者结果一致。',
  syntax: {
    patternCn: '=LEFTB(文本, [字节数])',
    patternEn: '=LEFTB(text, [num_bytes])',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要截取的文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 字节数按双字节环境计，中文占 2 字节。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'num_bytes',
        zh: '字节数',
        en: 'num_bytes',
        required: false,
        desc: '从左边截取的字节数。',
        accepts: '非负整数。',
        ifOmitted: '默认 1 字节。',
        example: '4',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回从左边数指定字节数的文本；字节跨在双字节字符中间会取整处理。',
  examples: [
    {
      title: '示例 1：中英混排按字节取',
      scene: '「中文Excel」想取左边 4 字节。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LEFTB(A2,4)',
      result: '中文（2 汉字 = 4 字节，Excel 的 4 字节没取到）',
      explanation: '「中文」占 4 字节，正好耗尽，所以只返回「中文」。',
    },
    {
      title: '示例 2：与 LEFT 的区别',
      scene: '同一文本，LEFT(,2) vs LEFTB(,2)。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LEFT(A2,2)',
      result: '中文（按字符）；LEFTB(A2,2) 只返回「中」（按字节）',
      explanation: 'LEFT 数字符、LEFTB 数字节——混排文本下结果明显不同。',
    },
  ],
  pitfalls: [
    {
      title: '把 LEFTB 当 LEFT 用',
      reason: '含中文时字节数≠字符数，LEFTB 会「少取」字符。',
      fix: '要按字符数截取用 LEFT；只在需要字节宽度时用 LEFTB。',
      level: 'high',
    },
    {
      title: '字节跨在汉字中间',
      reason: '如 LEFTB(文本,3) 落在「中」的第 1 字节之后，结果会被取整到完整字符边界。',
      fix: '按偶数字节截取中文最稳妥，避免奇数跨字符。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'left',
      kind: 'confusable',
      why: 'LEFT 数字符、LEFTB 数字节，混排文本下结果不同。',
    },
    {
      id: 'rightb',
      kind: 'companion',
      why: 'RIGHTB 是 LEFTB 的从右字节截取版本。',
    },
    {
      id: 'lenb',
      kind: 'companion',
      why: '先用 LENB 知道总字节数，再决定截取多少。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"中文Excel"' },
      { key: 'num_bytes', label: '字节数', type: 'number', default: '4' },
    ],
    template: '=LEFTB({text},{num_bytes})',
    cases: [
      { label: '默认：中文Excel 左 4 字节', type: 'ok', values: {}, expect: '中文', note: '中文占 4 字节，正好取完' },
      { label: '字节数为负 → #VALUE!', type: 'error', values: { num_bytes: '-1' }, expect: '#VALUE!', note: '负数非法' },
      { label: '字节数非数字 → #VALUE!', type: 'error', values: { num_bytes: 'abc' }, expect: '#VALUE!', note: '文本当字节数非法' },
      { label: '字节数小数 → #VALUE!', type: 'error', values: { num_bytes: '2.5' }, expect: '#VALUE!', note: '本实现要求整数（Excel 会截断，此处简化判错）' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default leftbEntry;
