import type { FunctionEntry } from '@/types';

/** UNICHAR · Unicode 数字转字符（text 类 B5 批次） */

const TSV = '码位\t说明\n8730\t根号√\n8592\t左箭头←\n128512\t笑脸emoji';

const unicharEntry: FunctionEntry = {
  id: 'unichar',
  enName: 'UNICHAR',
  zhName: '码值转字符',
  zhCommon: ['UNICHAR', 'Unicode字符', '码位转字符'],
  alias: ['Unicode转字符', '特殊符号', 'emoji'],
  category: 'text',
  abbr: 'mzzzf',
  pinyin: 'mazhizhuanzifu',
  keywords: ['UNICHAR', 'Unicode', '码位', '特殊符号', 'emoji', '对勾', '箭头'],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'CHAR 只支持 1–255 且依赖系统字符集；UNICHAR 覆盖全部 Unicode 且跨平台一致。',
  },
  oneLiner: '按 Unicode 码位返回对应字符（可输出各种符号与 emoji）',
  summary:
    'UNICHAR 是 CHAR 的 Unicode 升级版：CHAR 只能输出 1–255 且不同系统可能不同，UNICHAR 覆盖整个 Unicode 字符集、跨平台一致。常见用途：插入对勾 ✓（8730 是根号，对勾是 10003/10004）、箭头 ←（8592）、星级 ★（9733），以及各类 emoji。若某些符号显示为方框，说明当前字体不支持该字符。',
  syntax: {
    patternCn: '=UNICHAR(码位)',
    patternEn: '=UNICHAR(number)',
    args: [
      {
        key: 'number',
        zh: '码位',
        en: 'number',
        required: true,
        desc: 'Unicode 码位数字（十进制，非十六进制）。',
        accepts: '正整数、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 用的是十进制码位；查到的 U+2713 要换算成 10003 再传入。',
        example: '9733',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该 Unicode 码位对应的字符；码位非法返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：插入常用符号',
      scene: '想在报表里加对勾、箭头、星星等符号。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=UNICHAR(A2)',
      result: '√（8730）；←（8592）；😀（128512）',
      explanation: '传入十进制码位即可得到对应符号，比从别处复制粘贴更可靠（不会丢字体）。',
    },
    {
      title: '示例 2：做状态标记（对勾/叉）',
      scene: '想把 TRUE/FALSE 变成直观的 ✓ / ✗。',
      dataTsv: '项目\t是否完成\n甲\tTRUE\n乙\tFALSE',
      dataAnchor: 'A1',
      formula: '=IF(B2,UNICHAR(10003),UNICHAR(10007))',
      result: '✓；✗',
      explanation: '10003 是对勾、10007 是叉。配合 IF 就能把逻辑值变成直观图标。',
    },
    {
      title: '示例 3：与 CHAR 的区别（跨平台一致性）',
      scene: '同一份文件在不同电脑上打开都要显示一致。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=UNICHAR(9733)',
      result: '★（Unicode 统一编码，Windows/Mac 显示一致）',
      explanation: 'CHAR 的 128–255 区间依赖系统字符集，UNICHAR 用统一 Unicode 编码，跨平台更稳。',
    },
  ],
  pitfalls: [
    {
      title: '把十六进制码位直接传进去',
      reason: '网上查到的 Unicode 多写作 U+2713 这类十六进制，而 UNICHAR 要十进制。',
      fix: '先把十六进制换算成十进制（U+2713 = 10003），或用 =UNICHAR(HEX2DEC("2713"))。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '符号显示成方框（豆腐块）',
      reason: '当前字体不包含该 Unicode 字符。',
      fix: '换用支持该字符的字体（如 Segoe UI Symbol、Arial Unicode MS），或改用常见符号。',
      level: 'mid',
    },
    {
      title: '在 Excel 2010 及更早版本中使用',
      reason: 'UNICHAR 是 Excel 2013 才加入的。',
      fix: '升级 Excel，或改用 CHAR（仅限 1–255）。',
      level: 'high',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'unicode',
      kind: 'companion',
      why: 'UNICODE 是 UNICHAR 的反向操作（字符 → 码位），两者互为逆运算。',
    },
    {
      id: 'char',
      kind: 'confusable',
      why: 'CHAR 只支持 1–255 且依赖系统字符集，UNICHAR 覆盖全 Unicode 且跨平台一致。',
    },
    {
      id: 'rept',
      kind: 'companion',
      why: 'REPT(UNICHAR(9733),N) 可以做出 N 颗星的效果。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '66' },
    ],
    template: '=UNICHAR({number})',
    cases: [
      { label: '默认：码位 66 → B', type: 'ok', values: {}, expect: 'B', note: 'UNICHAR(66) 返回大写字母 B' },
      { label: '非数字文本 → #VALUE!', type: 'error', values: { number: 'xyz' }, expect: '#VALUE!', note: 'UNICHAR 要求数字' },
      { label: '小于 1 → #VALUE!', type: 'error', values: { number: '0' }, expect: '#VALUE!', note: 'UNICHAR 不接受 0' },
      { label: '负数 → #VALUE!', type: 'error', values: { number: '-5' }, expect: '#VALUE!', note: 'UNICHAR 不接受负数' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default unicharEntry;
