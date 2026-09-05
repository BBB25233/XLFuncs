import type { FunctionEntry } from '@/types';

/**
 * ARABIC · 罗马数字转阿拉伯（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 * 注意：ARABIC 需 Excel 2013 及以上（类型 ExcelMinVersion 当前未含 '2013'，
 * 此处按 team-lead 字段口径填 '2013'，已向 lead 标注，待类型联合扩充）。
 */

/** 一批古典罗马数字，演示「罗马→阿拉伯」 */
const ROMAN_TSV = '罗马\t说明\nVII\t7\nIX\t9\nIV\t4';

/** 与 ROMAN 互转：数字→罗马→再转回数字 */
const ROMAN_PAIR_TSV = '数值\t罗马\n7\tVII\n1984\tMCMLXXXIV\n1999\tMCMXCIX';

/** 单元格里直接存罗马数字（文本格式） */
const ROMAN_CELL_TSV = '编号\nX\nXX\nXV';

const arabicEntry: FunctionEntry = {
  id: 'arabic',
  enName: 'ARABIC',
  zhName: '罗马数字转阿拉伯',
  zhCommon: ['罗马数字', '罗马转数字', '阿拉伯数字'],
  alias: ['罗马转阿拉伯', '罗马数字转数值', '反向ROMAN'],
  category: 'math',
  abbr: 'lmszzalb',
  pinyin: 'luomashuzizhuanalabo',
  keywords: ['罗马数字转阿拉伯', '罗马转数字', '罗马数字求值', '阿拉伯数字转换', '反向ROMAN', '古典数字'],
  difficulty: 2,
  usageLevel: 25,
  version: {
    min: '2013',
    label: '需 Excel 2013 及以上（含 Microsoft 365）；Excel 2010 及更早版本无此函数',
    notes:
      '它是 ROMAN 的反函数：=ROMAN(7) 得到 "VII"，=ARABIC("VII") 又得到 7。空文本 "" 返回 0；罗马数字不合法会报 #VALUE!。',
  },
  oneLiner: '把罗马数字变成普通阿拉伯数',
  summary:
    '手头有一列古典编号（IV、IX、MCMLXXXIV）或从老系统导出的罗马数字，想拿它做运算、排序，就得先转成 7、9、1984 这样的阿拉伯数字。ARABIC 干的就是这件「反向 ROMAN」的活，Excel 2013 才加进来。注意它不认带负号的罗马写法，文本不合法会直接报错。',
  syntax: {
    patternCn: '=ARABIC(罗马数字文本)',
    patternEn: '=ARABIC(text)',
    args: [
      {
        key: 'text',
        zh: '罗马数字文本',
        en: 'text',
        required: true,
        desc: '要转换的罗马数字，必须是带半角双引号的文本，或存着罗马数字的单元格。',
        accepts: '"VII" · "IX" · "MCMLXXXIV" · A2（单元格里是 VII）。',
        ifOmitted: '必填，只有一个参数，省略公式不成立。',
        tip: '罗马数字要加半角双引号；放单元格里也行，但单元格得是文本格式，数字格式会被当成数值。',
        example: '"VII"',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回对应的阿拉伯数字（整数）。空文本 "" 返回 0；文本不是合法罗马数字时返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：单个罗马数字转成数字',
      scene: '账本上记着 VII、IX、IV 这种古典编号，要变成能加减的数字。',
      dataTsv: ROMAN_TSV,
      dataAnchor: 'A1',
      formula: '=ARABIC(A2)',
      result: '7（A2 的 VII）· 9（A3 的 IX）· 4（A4 的 IV）',
      explanation: '罗马数字必须带引号或来自文本单元格，ARABIC 把它解析成对应的阿拉伯整数。',
    },
    {
      title: '示例 2：和 ROMAN 互转',
      scene: '先用 ROMAN 把数字变成罗马字存档，再用 ARABIC 还原回来做计算。',
      dataTsv: ROMAN_PAIR_TSV,
      dataAnchor: 'A1',
      formula: '=ARABIC(B2)',
      result: '7（VII）· 1984（MCMLXXXIV）· 1999（MCMXCIX）',
      explanation: 'ARABIC 是 ROMAN 的反函数，B 列罗马字原样转回 A 列的数字，可逆无损。',
    },
    {
      title: '示例 3：单元格里直接是罗马数字',
      scene: '别人发来的表，编号列全是 X、XX、XV，列格式是文本。',
      dataTsv: ROMAN_CELL_TSV,
      dataAnchor: 'A1',
      formula: '=ARABIC(A2)',
      result: '10（X）· 20（XX）· 15（XV）',
      explanation: '只要单元格是文本格式的罗马字，直接框进去即可，不必再手敲引号。',
    },
  ],
  pitfalls: [
    {
      title: '罗马数字忘了加半角双引号，写成 =ARABIC(VII)',
      reason: '没引号的 VII 会被 Excel 当成一个「定义的名称」去找，找不到就报错。',
      fix: '写成 =ARABIC("VII")；或把罗马字放进文本格式的单元格再引用。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '传入不合法的罗马数字，报 #VALUE!',
      reason: '像 "VX"、"ABC" 这种不是合法罗马写法的文本，ARABIC 解析不了。',
      fix: '检查罗马数字拼写（大数在前、相同字母最多连续三个）；合法写法如 "XIV" 才能转。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '在 Excel 2010 及更早版本用 ARABIC，报 #NAME?',
      reason: 'ARABIC 是 2013 年才加入的函数，老版本函数列表里根本没有它。',
      fix: '升级到 Excel 2013+；或老版本用辅助列 + 查找对照表手动换算罗马数字。',
      level: 'mid',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'value',
      kind: 'confusable',
      why: 'VALUE 把 "123" 这种普通文本数字转成数值；ARABIC 专转罗马数字，两者都是「文本→数值」方向。',
    },
    {
      id: 'round',
      kind: 'companion',
      why: '转成普通数字后，常要 =ROUND(...) 保留位数或继续参与计算。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: '一列罗马编号转成数字后，用 SUM 直接汇总这批数值。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'text', label: '罗马数字文本', type: 'text', default: '"XIV"' },
    ],
    template: '=ARABIC({text})',
    cases: [
      { label: 'ARABIC("XIV") → 14', type: 'ok', values: { text: '"XIV"' }, expect: '14', note: 'XIV = 10 + 4 = 14。' },
      { label: 'ARABIC("MMXIV") → 2014', type: 'ok', values: { text: '"MMXIV"' }, expect: '2014', note: 'MMXIV = 2000 + 14 = 2014。' },
      { label: '非法字符 XA → #VALUE!', type: 'error', values: { text: '"XA"' }, expect: '#VALUE!', note: 'A 不是罗马数字字符，报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default arabicEntry;
