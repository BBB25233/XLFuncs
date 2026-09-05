import type { FunctionEntry } from '@/types';

/**
 * ODD · 向上取奇（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

/** 正数取奇 */
const ODD_POS_TSV = '数量\n3\n2.1\n4';

/** 负数取奇（远离 0） */
const ODD_NEG_TSV = '数\n-2\n-2.1';

/** 奇数个样本 */
const ODD_SAMPLE_TSV = '样本数\n6\n10\n1';

const oddEntry: FunctionEntry = {
  id: 'odd',
  enName: 'ODD',
  zhName: '向上取奇',
  zhCommon: ['取奇数', '向上取奇', '奇数取整'],
  alias: ['向上取奇', '进到奇数', '取整为奇数'],
  category: 'math',
  abbr: 'xsqq',
  pinyin: 'xiangshangquqi',
  keywords: ['向上取奇', '取奇数', '奇数取整', '进到奇数', '奇数分组', '奇数'],
  difficulty: 2,
  usageLevel: 28,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'ODD 永远远离 0 方向进位到奇数：-2 → -3（更负），不是 -1。注意 ODD(3)=3（本身已奇数则保持不变），ODD(2)=3。',
  },
  oneLiner: '向上进到最近的奇数',
  summary:
    '和 EVEN 一对：要「数量必须是奇数」——某些奇数分组、算法要求奇数个样本——ODD 把数向上（远离 0）舍到最近的奇数。3→3（本身奇数不动），2→3，-2→-3。负数也朝更负方向。',
  syntax: {
    patternCn: '=ODD(数字)',
    patternEn: '=ODD(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要取奇数的原始数字。',
        accepts: 'A2 · 2 · -2.3。',
        ifOmitted: '必填，仅一个参数。',
        tip: '结果是奇数整数；本身已奇数则不变（ODD(3)=3）；负数远离 0。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回远离 0 方向最近奇数整数；本身已是奇数则原样返回。',
  examples: [
    {
      title: '示例 1：正数取奇',
      scene: '数据要归整成奇数，多出的零头向上进一位。',
      dataTsv: ODD_POS_TSV,
      dataAnchor: 'A1',
      formula: '=ODD(A2)',
      result: '3（3 本身奇）· 3（2.1）· 5（4）',
      explanation: '向上进到最近奇数：2.1→3，4→5；3 本身奇数不动。',
    },
    {
      title: '示例 2：负数取奇（远离 0）',
      scene: '负数也要「向上」取奇，方向容易想反。',
      dataTsv: ODD_NEG_TSV,
      dataAnchor: 'A1',
      formula: '=ODD(A2)',
      result: '-3（-2，更负）· -3（-2.1）',
      explanation: '负数朝更负：-2 最近奇数是 -3 而不是 -1。',
    },
    {
      title: '示例 3：奇数个样本',
      scene: '要求奇数个样本时，算「最少凑到几个」。',
      dataTsv: ODD_SAMPLE_TSV,
      dataAnchor: 'A1',
      formula: '=ODD(A2)',
      result: '7（6）· 11（10）· 1（1 本身奇）',
      explanation: '要求奇数个样本时，向上取奇即「最少要凑到的奇数个数」。',
    },
  ],
  pitfalls: [
    {
      title: '负数方向反了：ODD(-2) 是 -3 不是 -1',
      reason: 'ODD 远离 0 进位，-2 离 0 更远奇数是 -3。',
      fix: '想要「朝 0 取奇」需另写公式；ODD 本身只向上取奇。',
      level: 'high',
    },
    {
      title: '以为 ODD(3) 会变 5',
      reason: '本身已是奇数就保持不变，不强行 +2。',
      fix: 'ODD 取「≥原数的最近奇数」，3→3、4→5；不是一律 +2。',
      level: 'mid',
    },
    {
      title: '和 EVEN 混淆，奇数偶数搞混',
      reason: '两者方向相反（一个取奇一个取偶）。',
      fix: '要偶数用 EVEN，要奇数用 ODD。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'even',
      kind: 'confusable',
      why: 'EVEN 向上取偶、ODD 向上取奇；按「要偶数还是奇数」选。',
    },
    {
      id: 'ceiling-math',
      kind: 'confusable',
      why: '=CEILING.MATH(A2,2)+1 之类能造奇数，但 ODD 专为奇数更直观。',
    },
    {
      id: 'roundup',
      kind: 'companion',
      why: 'ROUNDUP 进到任意位数；ODD 是「进到奇数」的特例。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '2', placeholder: '如 2' },
    ],
    template: '=ODD(A2)',
    cases: [
      { label: 'ODD(2)', type: 'ok', values: { number: '2' }, expect: '3', note: 'ODD(2)=3' },
      { label: 'ODD(-2)', type: 'ok', values: { number: '-2' }, expect: '-3', note: 'ODD(-2)=-3（远离0）' },
      { label: 'ODD(0)', type: 'ok', values: { number: '0' }, expect: '1', note: 'ODD(0)=1' },
      { label: '数字非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default oddEntry;
