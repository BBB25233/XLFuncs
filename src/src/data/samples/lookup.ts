import type { FunctionEntry } from '@/types';

/** LOOKUP · 向量/数组查找（lookup 类 B7 批次） */

const TSV = '姓名\t单价\n橙子\t8\n香蕉\t3\n苹果\t5';

const lookupEntry: FunctionEntry = {
  id: 'lookup',
  enName: 'LOOKUP',
  zhName: '向量查找',
  zhCommon: ['向量查找', '查值', 'LOOKUP'],
  alias: ['老式查找', '单行查找', '单查找'],
  category: 'lookup',
  abbr: 'xlcz',
  pinyin: 'xiangliangchazhao',
  keywords: ['向量查找', '单行/单列查找', '老式查表', '近似匹配', 'LOOKUP'],
  difficulty: 3,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '中文版 Excel 不翻译这个函数名，输入「纵向查找」只会得到 #NAME?。LOOKUP 有两种用法：向量形式（自己指定查找列和返回列）和数组形式（自动用区域首列查、末列返）。它只支持「升序模糊匹配」，没有精确匹配的可靠开关，新表建议用 VLOOKUP/XLOOKUP。',
  },
  oneLiner: '在一行或一列里找值，返回同行/列对应的另一个值',
  summary:
    'LOOKUP 是个「老前辈」查找函数，有两种写法。向量形式 =LOOKUP(值,查找向量,返回向量) 最直观：在查找列里找到值，返回返回列对应位置的值。数组形式 =LOOKUP(值,区域) 则默认用区域的第一列查、最后一列返。它最大的坑是：只认「升序模糊匹配」，找不到精确值时不会报错而是给你一个近似结果。正因为这个隐患，新公式基本被 VLOOKUP / XLOOKUP 取代。',
  syntax: {
    patternCn: '向量形式：=LOOKUP(找什么, 查找列, [返回列])；数组形式：=LOOKUP(找什么, 区域)',
    patternEn: 'vector: =LOOKUP(lookup_value, lookup_vector, [result_vector]); array: =LOOKUP(lookup_value, array)',
    args: [
      {
        key: 'lookup_value',
        zh: '找什么',
        en: 'lookup_value',
        required: true,
        desc: '要查找的值。',
        accepts: '单元格、文字或数字。',
        ifOmitted: '必填。',
        example: '"香蕉"',
        pitfallRank: 2,
      },
      {
        key: 'lookup_vector',
        zh: '查找列',
        en: 'lookup_vector',
        required: true,
        desc: '（向量形式）只包含查找值的一行或一列，必须升序排列。',
        accepts: '单列或单行区域，如 $B$1:$B$4。',
        ifOmitted: '向量形式必填；数组形式则用区域首列代替。',
        example: '$B$1:$B$4',
        pitfallRank: 1,
      },
      {
        key: 'result_vector',
        zh: '返回列',
        en: 'result_vector',
        required: false,
        desc: '（向量形式）与查找列等高的返回值列；省略时返回查找列自身。',
        accepts: '单列或单行区域，如 $C$1:$C$4。',
        ifOmitted: '省略等于直接返回查找列里那个值本身。',
        example: '$C$1:$C$4',
      },
    ],
  },
  returnValue: '返回查找值在返回列中对应位置的值；找不到时返回「升序中小于等于它的最大项」对应值，而非报错。',
  examples: [
    {
      title: '示例 1：向量形式精确对应（数据恰好升序）',
      scene: '查找列是已排序的姓名，想返回对应的单价。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LOOKUP("香蕉",A2:A4,B2:B4)',
      result: '返回 3（香蕉对应的单价）',
      explanation: '在 A 列（已升序）找到「香蕉」，返回 B 列同位置的值 3。注意查找列必须升序，否则结果不可靠。',
    },
    {
      title: '示例 2：数组形式（首列查、末列返）',
      scene: '给一片区域，LOOKUP 自动用第一列查、最后一列返回。',
      dataTsv: '代码\t名称\t单价\nA1\t苹果\t5\nA2\t香蕉\t3\nA3\t橙子\t8',
      dataAnchor: 'A1',
      formula: '=LOOKUP("A2",A2:C5)',
      result: '返回「香蕉」（A2 所在行的最后一列名称）',
      explanation: '数组形式默认查首列（代码）、返末列（本例末列是名称），所以返回「香蕉」。想返哪一列，就把那一列放到区域最右。',
    },
    {
      title: '示例 3：近似匹配分档（经典用法）',
      scene: '用升序分数段查等级，LOOKUP 自动落到对应档。',
      dataTsv: '分数\t等级\n0\t不及格\n60\t及格\n80\t良好\n90\t优秀',
      dataAnchor: 'A1',
      formula: '=LOOKUP(85,A2:A5,B2:B5)',
      result: '返回「良好」（85 落在 80 档）',
      explanation: '查找列升序，85 找不到精确值就取「小于等于它的最大项」80 对应的等级「良好」。这正是 LOOKUP 最适合的近似匹配场景。',
    },
  ],
  pitfalls: [
    {
      title: '查找列没升序，结果乱跳',
      reason: 'LOOKUP 只做「升序近似匹配」。查找列若乱序，它返回的「小于等于查找值的最大项」毫无意义，且绝不报错。',
      fix: '用 LOOKUP 前务必把查找列升序排序；要精确匹配优先用 VLOOKUP(...,FALSE) 或 XLOOKUP。',
      level: 'high',
    },
    {
      title: '误以为它能精确匹配',
      reason: 'LOOKUP 没有「精确匹配」的可靠开关。写死的值若不在查找列里，它悄悄给你一个近似结果，排查极难。',
      fix: '新表改用 XLOOKUP（精确、双向、容错好）；老表至少用 VLOOKUP(...,FALSE)。',
      level: 'high',
    },
    {
      title: '返回向量和查找向量高度不一致',
      reason: '向量形式要求查找列和返回列行数相同，否则位置对不上。',
      fix: '两个向量选取相同行数（如都选第 2~4 行）。',
      level: 'mid',
      errorCode: '#N/A',
    },
  ],
  related: [
    { id: 'vlookup', kind: 'alternative', why: 'VLOOKUP 支持精确匹配且更直观，基本是 LOOKUP 的现代化替代。' },
    { id: 'hlookup', kind: 'companion', why: 'HLOOKUP 是横向版查找，LOOKUP 偏向向量/数组形式，场景有重叠。' },
    { id: 'xlookup', kind: 'alternative', why: 'XLOOKUP 精确、可双向、默认不近似，全面优于 LOOKUP。需 365/2021。' },
    { id: 'match', kind: 'companion', why: 'LOOKUP 的「找位置」思路与 MATCH 相通，但 MATCH 只返位置不返值。' },
  ],
  calc: {
    enabled: true,
    ranges: { lookup_vector: 'A2:A4', result_vector: 'B2:B4' },
    fields: [
      { key: 'lookup_value', label: '找什么', type: 'text', default: '"香蕉"' },
      { key: 'lookup_vector', label: '查找列', type: 'ref', default: 'A2:A4', rangeKey: 'lookup_vector' },
      { key: 'result_vector', label: '返回列', type: 'ref', default: 'B2:B4', rangeKey: 'result_vector' },
    ],
    template: '=LOOKUP({lookup_value},{lookup_vector},{result_vector})',
    cases: [
      { label: '默认：查香蕉的单价', type: 'ok', values: {}, expect: '3', note: '查找列找到「香蕉」在第 2 行，返回列同位置 = 3' },
      { label: '省略返回列 → 返回查找值本身', type: 'ok', values: { lookup_value: '"苹果"', result_vector: '' }, expect: '苹果', note: '没给返回列时，直接返回查找列对应位置的值「苹果」' },
      { label: '找不到 → #N/A', type: 'error', values: { lookup_value: '"西瓜"' }, expect: '#N/A', note: '「西瓜」不在查找列里' },
      { label: '查找列非法 → #REF!', type: 'error', values: { lookup_vector: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
      { label: '返回列太短 → #N/A', type: 'error', values: { lookup_value: '"苹果"', result_vector: 'B2:B3' }, expect: '#N/A', note: '返回列只有 2 行，取不到第 3 行对应的位置' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default lookupEntry;
