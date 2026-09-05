import type { FunctionEntry } from '@/types';

/** PERMUTATIONA · 允许重复的排列数（statistical 类 B3 批次） */

const TSV = '场景\t对象数\t选取数\n密码(数字)\t10\t4\n三位数(0-9可重复)\t10\t3';

const permutationaEntry: FunctionEntry = {
  id: 'permutationa',
  enName: 'PERMUTATIONA',
  zhName: '允许重复的排列数',
  zhCommon: ['可重复排列', 'PERMUTATIONA', '有放回排列'],
  alias: ['允许重复的排法', '密码组合数', 'n的k次方排列'],
  category: 'statistical',
  abbr: 'yxcfdpls',
  pinyin: 'yunxuchongfudepailieshu',
  keywords: ['PERMUTATIONA', '可重复排列', '有放回', '密码组合', 'n^k'],
  difficulty: 3,
  usageLevel: 8,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: '与 PERMUT（不允许重复）相对，结果是 number^number_chosen。',
  },
  oneLiner: '从 n 个对象里取 k 个排成一列，且同一个对象可以重复取，有多少种排法',
  summary:
    'PERMUTATIONA 的结果就是 nᵏ（对象的 k 次方）。典型场景是密码/编码的位数估算：4 位数字密码每位可选 0–9，就是 PERMUTATIONA(10,4) = 10000 种。与之相对，PERMUT(10,4) = 5040 是不允许重复时的排法（抽走不放回）。选哪个取决于「同一个对象能不能被重复取用」。',
  syntax: {
    patternCn: '=PERMUTATIONA(对象总数, 每个排列取几个)',
    patternEn: '=PERMUTATIONA(number, number_chosen)',
    args: [
      {
        key: 'number',
        zh: '对象总数',
        en: 'number',
        required: true,
        desc: '可供选择的对象总数，必须 ≥ 0。',
        accepts: '非负整数、单元格引用。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '可以是 0（结果为 0 或 1，取决于 k）。',
        example: '10',
        pitfallRank: 2,
      },
      {
        key: 'number_chosen',
        zh: '每个排列取几个',
        en: 'number_chosen',
        required: true,
        desc: '每个排列中要放几个位置，必须 ≥ 0。',
        accepts: '非负整数、单元格引用。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 小数会被截尾取整；负数会报 #NUM!。',
        example: '4',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回允许重复时的排列总数（nᵏ）；参数为负返回 #NUM!。',
  examples: [
    {
      title: '示例 1：4 位数字密码有多少种',
      scene: '估算一个 4 位纯数字密码的组合总数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERMUTATIONA(B2,C2)',
      result: '10000（10⁴ = 10000 种）',
      explanation: '每一位都能从 0–9 中任选（可重复），所以是 10 的 4 次方。',
    },
    {
      title: '示例 2：与 PERMUT 对比（能否重复）',
      scene: '同样从 10 个里取 4 个，不允许重复时少多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERMUT(B2,C2)',
      result: '5040（不允许重复）',
      explanation:
        'PERMUT 是 10×9×8×7 = 5040（抽走不放回），PERMUTATIONA 是 10⁴ = 10000。区别在于「同一个对象能不能重复用」。',
    },
    {
      title: '示例 3：参数为负时报错',
      scene: '不小心传了负数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERMUTATIONA(-10,4)',
      result: '#NUM!（对象数不能为负）',
      explanation: '两个参数都必须 ≥ 0，负数没有组合意义。',
    },
  ],
  pitfalls: [
    {
      title: '该用 PERMUT 时用了 PERMUTATIONA（或反之）',
      reason: '两者差在「是否允许重复」，结果相差很大（10000 vs 5040），选错会严重高估/低估可能性。',
      fix: '先问：同一个对象能否被重复选取？能（密码、编码）用 PERMUTATIONA；不能（抽奖、排队）用 PERMUT。',
      level: 'high',
    },
    {
      title: '把「组合」（不计顺序）当成了排列',
      reason: '排列计较先后顺序，组合不计。若顺序无关，答案会少得多。',
      fix: '不计顺序时用 COMBIN / COMBINA，而不是 PERMUT / PERMUTATIONA。',
      level: 'high',
    },
    {
      title: '参数为负或超出范围',
      reason: '负数无组合意义；Excel 对超大结果也有上限。',
      fix: '确保两个参数都是非负整数；超大数注意可能溢出为科学计数法。',
      level: 'mid',
      errorCode: '#NUM!',
    },
  ],
  related: [
    {
      id: 'permut',
      kind: 'confusable',
      why: 'PERMUT 不允许重复、PERMUTATIONA 允许重复，同一组参数结果相差很大。',
    },
    {
      id: 'combin',
      kind: 'companion',
      why: 'COMBIN 是不计顺序且不允许重复的组合数，与排列数形成对照。',
    },
    {
      id: 'combina',
      kind: 'companion',
      why: 'COMBINA 是不计顺序但允许重复的组合数，与 PERMUTATIONA 的「允许重复」口径一致。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '对象总数', type: 'number', default: '10' },
      { key: 'number_chosen', label: '每个排列取几个', type: 'number', default: '4' },
    ],
    template: '=PERMUTATIONA({number}, {number_chosen})',
    cases: [
      { label: '4 位数字密码排法', type: 'ok', values: { number: '10', number_chosen: '4' }, expect: '10000', note: '10^4 = 10000' },
      { label: '对象数为负', type: 'error', values: { number: '-1', number_chosen: '2' }, expect: '#NUM!', note: 'number 须≥0' },
      { label: '非数字参数', type: 'error', values: { number: 'a', number_chosen: '2' }, expect: '#VALUE!', note: '参数须为数字' },
      { label: '选取数为负', type: 'error', values: { number: '10', number_chosen: '-2' }, expect: '#NUM!', note: 'number_chosen 须≥0' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default permutationaEntry;
