import type { FunctionEntry } from '@/types';

/**
 * CEILING.MATH · 向上舍入(按倍数)（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 * 注意：CEILING.MATH 需 Excel 2013 及以上（类型 ExcelMinVersion 当前未含 '2013'，
 * 此处按 team-lead 字段口径填 '2013'，已向 lead 标注，待类型联合扩充）。
 */

/** 进到最近的 5（装箱场景） */
const CEIL_5_TSV = '数量\n23\n17\n8';

/** 进到最近的 0.5（工时计费） */
const CEIL_05_TSV = '工时\n1.2\n2.7\n0.3';

/** 负数方向（mode 参数） */
const CEIL_NEG_TSV = '数\n-4.3\n-2.1';

const ceilingMathEntry: FunctionEntry = {
  id: 'ceiling-math',
  enName: 'CEILING.MATH',
  zhName: '按倍数向上舍入',
  zhCommon: ['向上取整到倍数', '按倍数进位', '向上舍入'],
  alias: ['向上舍入倍数', '进到最近倍数', 'CEILING升级版'],
  category: 'math',
  abbr: 'absxssr',
  pinyin: 'anbeishuxiangshangsheru',
  keywords: ['向上舍入', '按倍数舍入', '进到最近倍数', '向上取整', '批量装箱', '舍入到上'],
  difficulty: 3,
  usageLevel: 40,
  version: {
    min: '2013',
    label: '需 Excel 2013 及以上（含 Microsoft 365）；旧版用 CEILING。',
    notes:
      'CEILING.MATH 是 CEILING 的现代替代：默认朝 +∞ 进位，负数多一个 mode 参数控制方向。第三参数 mode 非 0 时，负数改为朝 0 方向（绝对值变小）舍入。',
  },
  oneLiner: '向上进到最近的指定倍数',
  summary:
    'ROUNDUP 只能按「小数位/十位」进位，但想「进到最近的 5 的倍数」「进到最近的 0.5」就够不着了。CEILING.MATH 专门干这个：给个数和倍数，它把数向上（远离 0）舍到最近的那个倍数。装箱按 5 个一箱、计时按 0.5 小时、报价按 100 向上取整都靠它。Excel 2013 才加入，旧版用 CEILING。',
  syntax: {
    patternCn: '=CEILING.MATH(数字, [倍数], [模式])',
    patternEn: '=CEILING.MATH(number, [significance], [mode])',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要向上舍入的原始数字。',
        accepts: 'A2 · 23 · 12.3。',
        ifOmitted: '必填。',
        tip: '正负都接受；正数向上变大，负数默认朝 0（绝对值变小）。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'significance',
        zh: '倍数',
        en: 'significance',
        required: false,
        desc: '要进到的倍数，如 5、0.5、10。',
        accepts: '5（进到 5 的倍数）· 0.5（进到 0.5 的倍数）· 10（进到十位）。',
        ifOmitted: '省略时默认 1，即进到最近整数。',
        tip: '倍数最好和 number 同号；正负不一致时行为可能不合直觉。',
        example: '5',
        pitfallRank: 1,
      },
      {
        key: 'mode',
        zh: '模式',
        en: 'mode',
        required: false,
        desc: '仅对负数生效：0（默认）=朝 0 方向（绝对值变小）；任意非 0=远离 0（更负）。',
        accepts: '0 · 1 · -1。',
        ifOmitted: '省略或 0：负数按朝 0 方向舍入。',
        tip: '正数不受 mode 影响；只想控制负数方向才填。',
        example: '0',
      },
    ],
  },
  returnValue:
    '返回朝 +∞ 舍入到 significance 倍数的结果；负数默认朝 0，mode 非 0 时改为更负。',
  examples: [
    {
      title: '示例 1：进到最近的 5（装箱）',
      scene: '货品按 5 个一箱装，不够 5 个也要算一整箱，向上进。',
      dataTsv: CEIL_5_TSV,
      dataAnchor: 'A1',
      formula: '=CEILING.MATH(A2,5)',
      result: '25（23）· 20（17）· 10（8）',
      explanation: '向上进到 5 的倍数：23 进到 25，17 进到 20，8 进到 10。',
    },
    {
      title: '示例 2：进到最近的 0.5（工时计费）',
      scene: '咨询按 0.5 小时一档向上计费，1.2 小时也要算 1.5。',
      dataTsv: CEIL_05_TSV,
      dataAnchor: 'A1',
      formula: '=CEILING.MATH(A2,0.5)',
      result: '1.5（1.2）· 3（2.7）· 0.5（0.3）',
      explanation: '计费按 0.5 小时一档向上进：1.2→1.5，2.7→3。',
    },
    {
      title: '示例 3：负数方向（mode 参数）',
      scene: '负数默认朝 0（绝对值变小），想让它更负时用 mode。',
      dataTsv: CEIL_NEG_TSV,
      dataAnchor: 'A1',
      formula: '=CEILING.MATH(A2,1,1)',
      result: '默认 =CEILING.MATH(-4.3,1) → -4（朝0）；加 mode 非0 的 =CEILING.MATH(-4.3,1,1) → -5（远离0更负）',
      explanation: 'mode 只管负数：默认朝 0（-4.3→-4），非 0 更负（-4.3→-5）。正数两种写法结果一样。',
    },
  ],
  pitfalls: [
    {
      title: '把 CEILING.MATH 当 ROUNDUP 理解，忽略「倍数」语义',
      reason: '它的第二参是「倍数」不是「小数位」，CEILING.MATH(23,5) 是进到 5 的倍数而非留 5 位。',
      fix: '想要「进到十位」写 CEILING.MATH(A2,10)；想要「留两位」仍用 ROUNDUP(A2,2)。',
      level: 'mid',
    },
    {
      title: '负数默认朝 0，和直觉「更负」相反',
      reason: '默认 mode 0，负数朝 0 即 -4.3 → -4。',
      fix: '想负数更负，加第三参数非 0：=CEILING.MATH(A2,1,1)。',
      level: 'high',
    },
    {
      title: '旧版 Excel（2010 及更早）没有 CEILING.MATH，报 #NAME?',
      reason: '它是 2013 年才加入的函数。',
      fix: '旧版用 CEILING（注意参数顺序与方向差异），或升级到 2013+。',
      level: 'mid',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'floor-math',
      kind: 'confusable',
      why: 'FLOOR.MATH 是反方向——向下（朝0）舍到倍数；要「向下取整到倍数」用它。',
    },
    {
      id: 'mround',
      kind: 'confusable',
      why: 'MROUND 是「四舍五入到最近倍数」（不偏向进）；要「一律向上进」才用 CEILING.MATH。',
    },
    {
      id: 'roundup',
      kind: 'confusable',
      why: 'ROUNDUP 只能按小数位/十位进位，没法指定任意倍数；要任意倍数用 CEILING.MATH。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '3.7', placeholder: '如 3.7' },
      { key: 'significance', label: '倍数', type: 'number', default: '1', placeholder: '如 1' },
    ],
    template: '=CEILING.MATH({number},{significance})',
    cases: [
      { label: '向上进到整数', type: 'ok', values: { number: '3.7', significance: '1' }, expect: '4', note: 'CEILING.MATH(3.7,1)=4' },
      { label: '负数朝 0 进位', type: 'ok', values: { number: '-3.7', significance: '1' }, expect: '-3', note: '负值朝 0：-3.7→-3' },
      { label: '进到 5 的倍数', type: 'ok', values: { number: '23', significance: '5' }, expect: '25', note: 'CEILING.MATH(23,5)=25' },
      { label: '数字非数字', type: 'error', values: { number: 'abc', significance: '1' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default ceilingMathEntry;
