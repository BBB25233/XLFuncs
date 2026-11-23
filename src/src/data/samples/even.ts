import type { FunctionEntry } from '@/types';

/**
 * EVEN · 向上取偶（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

/** 正数取偶 */
const EVEN_POS_TSV = '数量\n3\n2.1\n5';

/** 负数取偶（远离 0） */
const EVEN_NEG_TSV = '数\n-3\n-2.1';

/** 成对装箱需要偶数件 */
const EVEN_BOX_TSV = '件数\n7\n11\n3';

const evenEntry: FunctionEntry = {
  id: 'even',
  enName: 'EVEN',
  zhName: '向上取偶',
  zhCommon: ['取偶数', '向上取偶', '偶数取整'],
  alias: ['向上取偶', '进到偶数', '取整为偶数'],
  category: 'math',
  abbr: 'xsqo',
  pinyin: 'xiangshangquou',
  keywords: ['向上取偶', '取偶数', '偶数取整', '进到偶数', '配对装箱', '偶数'],
  difficulty: 2,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'EVEN 永远远离 0 方向进位到偶数：-3 → -4（更负），不是 -2。',
  },
  oneLiner: '向上进到最近的偶数',
  summary:
    '要「数量必须是偶数」——比如成对装箱、双数分组、行数要偶数才能排版——EVEN 一条公式搞定：它把数向上（远离 0）舍到最近的偶数。3→4，-3→-4。注意负数也是朝更负方向进。',
  syntax: {
    patternCn: '=EVEN(数字)',
    patternEn: '=EVEN(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要取偶数的原始数字。',
        accepts: 'A2 · 3 · -2.3。',
        ifOmitted: '必填，仅一个参数。',
        tip: '结果是偶数整数；负数远离 0 方向（-3 → -4）。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回大于等于（绝对值上远离 0）原数的最近偶数整数。',
  examples: [
    {
      title: '示例 1：正数取偶',
      scene: '数据要归整成偶数，多出来的零头向上进一位。',
      dataTsv: EVEN_POS_TSV,
      dataAnchor: 'A1',
      formula: '=EVEN(A2)',
      result: '4（3）· 4（2.1）· 6（5）',
      explanation: '向上进到最近偶数：3→4，2.1→4，5→6。',
    },
    {
      title: '示例 2：负数取偶（远离 0）',
      scene: '负数也要「向上」取偶，方向容易想反。',
      dataTsv: EVEN_NEG_TSV,
      dataAnchor: 'A1',
      formula: '=EVEN(A2)',
      result: '-4（-3，更负）· -4（-2.1）',
      explanation: '负数也朝更负方向：-3 的最近偶数是 -4 而不是 -2。',
    },
    {
      title: '示例 3：成对装箱需要偶数件',
      scene: '每件要成对，算「最少凑到几件才能成双」。',
      dataTsv: EVEN_BOX_TSV,
      dataAnchor: 'A1',
      formula: '=EVEN(A2)',
      result: '8（7）· 12（11）· 4（3）',
      explanation: '件数要成对，向上取偶即「最少要凑到的偶数件数」。',
    },
  ],
  pitfalls: [
    {
      title: '负数方向反了：EVEN(-3) 是 -4 不是 -2',
      reason: 'EVEN 永远远离 0 进位，-3 离 0 更远的是 -4。',
      fix: '想要「朝 0 取偶」需另写公式（如先用 SIGN/ABS 处理）；EVEN 本身只向上取偶。',
      level: 'high',
    },
    {
      title: '和 INT/ROUNDDOWN 混淆，以为会直接砍',
      reason: 'EVEN 是「进到偶数」，3.9 → 4 不是 3。',
      fix: '要砍小数用 INT/ROUNDDOWN；要偶数化用 EVEN。',
      level: 'mid',
    },
    {
      title: '奇数本身会直接 +1',
      reason: '5 已是奇数，EVEN(5)=6，并不是保持 5。',
      fix: 'EVEN 取「≥原数的最近偶数」，5→6、3→4；想要「最近偶数含向下」得换思路。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'odd',
      kind: 'confusable',
      why: 'ODD 是向上取奇；要奇数化用 ODD，偶数化用 EVEN，两者方向相反。',
    },
    {
      id: 'ceiling-math',
      kind: 'confusable',
      why: 'CEILING.MATH(A2,2) 也能进到偶数（2 的倍数），但 EVEN 更直白、专为偶数。',
    },
    {
      id: 'roundup',
      kind: 'companion',
      why: 'ROUNDUP 是进到任意位数；EVEN 是「进到偶数」的特例。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '3', placeholder: '如 3' },
    ],
    template: '=EVEN({number})',
    cases: [
      { label: 'EVEN(1.5)', type: 'ok', values: { number: '1.5' }, expect: '2', note: 'EVEN(1.5)=2' },
      { label: 'EVEN(-1.5)', type: 'ok', values: { number: '-1.5' }, expect: '-2', note: 'EVEN(-1.5)=-2（远离0）' },
      { label: 'EVEN(3)', type: 'ok', values: { number: '3' }, expect: '4', note: 'EVEN(3)=4' },
      { label: '数字非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default evenEntry;
