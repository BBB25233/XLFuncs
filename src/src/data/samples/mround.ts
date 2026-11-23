import type { FunctionEntry } from '@/types';

/**
 * MROUND · 按指定倍数舍入（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

/** 对齐到最近的 5 */
const MROUND_5_TSV = '数量\n23\n17\n8';

/** 时间对齐到 15 分钟（0.25 小时） */
const MROUND_15_TSV = '小时\n1.2\n2.4\n0.6';

/** 负数必须和倍数同号 */
const MROUND_NEG_TSV = '数\t倍数\n-17\t5\n-17\t-5';

const mroundEntry: FunctionEntry = {
  id: 'mround',
  enName: 'MROUND',
  zhName: '按指定倍数舍入',
  zhCommon: ['按倍数四舍五入', '舍到最近倍数', '最近倍数'],
  alias: ['四舍五入到倍数', '就近舍入', '对齐倍数'],
  category: 'math',
  abbr: 'azdbssr',
  pinyin: 'anzhidingbeishusheru',
  keywords: ['按倍数舍入', '四舍五入到倍数', '最近倍数', '对齐网格', '就近舍入', '舍入到倍数'],
  difficulty: 3,
  usageLevel: 42,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2007 起即内置）',
    notes:
      'number 与 multiple 必须同号（同正或同负），否则报 #NUM!。当 number 正好落在两个倍数正中间时，MROUND 向远离 0 的方向舍入。',
  },
  oneLiner: '舍到离它最近的那一个倍数',
  summary:
    'ROUND 只能按「小数位」舍，CEILING/FLOOR 只管单方向。想要「离哪个倍数近就取哪个」（比如时间对齐到最近的 15 分钟、数量对齐到最近的 10 个），用 MROUND。它四舍五入式地取最近倍数——不偏向进也不偏向去。注意 number 和 multiple 必须同号。',
  syntax: {
    patternCn: '=MROUND(数字, 倍数)',
    patternEn: '=MROUND(number, multiple)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要舍入的原始数字。',
        accepts: 'A2 · 23 · -17。',
        ifOmitted: '必填。',
        tip: '和 multiple 必须同号，否则 #NUM!。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'multiple',
        zh: '倍数',
        en: 'multiple',
        required: true,
        desc: '对齐到的倍数，如 5、10、0.25。',
        accepts: '5 · 10 · 0.25（到 15 分钟 = 0.25 小时）。',
        ifOmitted: '必填，省略报 #VALUE!。',
        tip: '正负要和 number 一致。',
        example: '5',
        pitfallRank: 2,
      },
    ],
  },
  returnValue:
    '返回舍入到 nearest multiple 的结果；取离 number 最近的那一档倍数，正中间时向远离 0 方向。',
  examples: [
    {
      title: '示例 1：对齐到最近的 5',
      scene: '数量想归整到 5 的倍数，离谁近取谁。',
      dataTsv: MROUND_5_TSV,
      dataAnchor: 'A1',
      formula: '=MROUND(A2,5)',
      result: '25（23，离 25 近）· 15（17，离 15 近）· 10（8，离 10 近）',
      explanation: '四舍五入到 5 的倍数：23 离 25 更近得 25，17 离 15 更近得 15。',
    },
    {
      title: '示例 2：时间对齐到 15 分钟',
      scene: '工时记录要对齐到最近的 15 分钟档。',
      dataTsv: MROUND_15_TSV,
      dataAnchor: 'A1',
      formula: '=MROUND(A2,0.25)',
      result: '1.25（1.2）· 2.5（2.4）· 0.5（0.6）',
      explanation: '0.25 小时 = 15 分钟，把工时对齐到最近的 15 分钟档。',
    },
    {
      title: '示例 3：负数必须和倍数同号',
      scene: '负数想对齐倍数，倍数符号写错会直接报错。',
      dataTsv: MROUND_NEG_TSV,
      dataAnchor: 'A1',
      formula: '=MROUND(A2,B2)',
      result: 'MROUND(-17,5) → #NUM!（异号）；MROUND(-17,-5) → -15（同号，最近 -15/-20 取 -15）',
      explanation: 'number 与 multiple 异号直接报 #NUM!；同号才正常算，结果也朝远离 0 取最近倍。',
    },
  ],
  pitfalls: [
    {
      title: 'number 与 multiple 异号，报 #NUM!',
      reason: 'MROUND 要求两者同正或同负，符号相反无法定义「最近倍数」。',
      fix: '把 multiple 写成和 number 同号，或先 ABS 统一符号再恢复正负。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '误以为 MROUND 会「向上进」，其实取最近倍数',
      reason: 'MROUND 是四舍五入式，23 到 5 的倍数得 25 还是 20 看谁更近，不是一律进。',
      fix: '要一律向上进用 CEILING.MATH，一律向下用 FLOOR.MATH。',
      level: 'mid',
    },
    {
      title: '正中间（halfway）向远离 0 方向取',
      reason: '如 MROUND(2.5,1) 中 2.5 恰在 2 与 3 中间，会向远离 0 取 3，少数人注意不到。',
      fix: '知道边界档会「向更远离 0」取；需要银行家舍入得另想办法。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'ceiling-math',
      kind: 'confusable',
      why: '要「一律向上进到倍数」用 CEILING.MATH；MROUND 是取最近倍数。',
    },
    {
      id: 'floor-math',
      kind: 'confusable',
      why: '要「一律向下去尾到倍数」用 FLOOR.MATH；MROUND 不偏向任一边。',
    },
    {
      id: 'round',
      kind: 'companion',
      why: 'ROUND 按「小数位」四舍五入；MROUND 按「任意倍数」四舍五入，是更通用的版本。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '10', placeholder: '如 10' },
      { key: 'multiple', label: '倍数', type: 'number', default: '3', placeholder: '如 3' },
    ],
    template: '=MROUND({number},{multiple})',
    cases: [
      { label: 'MROUND(10,3)', type: 'ok', values: { number: '10', multiple: '3' }, expect: '9', note: 'MROUND(10,3)=9' },
      { label: 'MROUND(11,3)', type: 'ok', values: { number: '11', multiple: '3' }, expect: '12', note: 'MROUND(11,3)=12' },
      { label: '异号报错', type: 'error', values: { number: '5', multiple: '-2' }, expect: '#NUM!', note: 'number 与 multiple 不能异号' },
      { label: '数字非数字', type: 'error', values: { number: 'abc', multiple: '3' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default mroundEntry;
