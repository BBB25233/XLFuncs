import type { FunctionEntry } from '@/types';

/**
 * FLOOR.MATH · 向下舍入(按倍数)（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 * 注意：FLOOR.MATH 需 Excel 2013 及以上（类型 ExcelMinVersion 当前未含 '2013'，
 * 此处按 team-lead 字段口径填 '2013'，已向 lead 标注，待类型联合扩充）。
 */

/** 去尾到 5（能装几整箱） */
const FLOOR_5_TSV = '数量\n23\n17\n8';

/** 去尾到 0.5 */
const FLOOR_05_TSV = '工时\n1.2\n2.7\n0.3';

/** 负数方向（mode 参数） */
const FLOOR_NEG_TSV = '数\n-4.3\n-2.1';

const floorMathEntry: FunctionEntry = {
  id: 'floor-math',
  enName: 'FLOOR.MATH',
  zhName: '按倍数向下舍入',
  zhCommon: ['向下取整到倍数', '按倍数去尾', '向下舍入'],
  alias: ['向下舍入倍数', '去尾到倍数', 'FLOOR升级版'],
  category: 'math',
  abbr: 'absxxsr',
  pinyin: 'anbeishuxiangxiasheru',
  keywords: ['向下舍入', '按倍数舍入', '去尾到倍数', '向下取整', '舍入到下', '截断到倍数'],
  difficulty: 3,
  usageLevel: 38,
  version: {
    min: '2013',
    label: '需 Excel 2013 及以上（含 Microsoft 365）；旧版用 FLOOR。',
    notes:
      'FLOOR.MATH 是 FLOOR 的现代替代：默认朝 -∞ 舍入，负数多一个 mode 参数控制方向。mode 非 0 时负数改为远离 0（更负）。',
  },
  oneLiner: '向下舍到最近的指定倍数',
  summary:
    '和 CEILING.MATH 一对反义词：给个数和倍数，把数向下（朝 0）舍到最近的那个倍数。报价「宁少勿多」按 100 向下取整、装箱按 5 个一组向下算能装几整箱，都用它。Excel 2013 加入，旧版用 FLOOR。',
  syntax: {
    patternCn: '=FLOOR.MATH(数字, [倍数], [模式])',
    patternEn: '=FLOOR.MATH(number, [significance], [mode])',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要向下舍入的原始数字。',
        accepts: 'A2 · 23 · -12.3。',
        ifOmitted: '必填。',
        tip: '正数变小、负数默认朝 -∞（更负）。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'significance',
        zh: '倍数',
        en: 'significance',
        required: false,
        desc: '要舍到的倍数，如 5、0.5、10。',
        accepts: '5（到 5 的倍数）· 0.5 · 10（到十位）。',
        ifOmitted: '省略默认 1，即去尾到整数。',
        tip: '倍数与 number 最好同号。',
        example: '5',
        pitfallRank: 1,
      },
      {
        key: 'mode',
        zh: '模式',
        en: 'mode',
        required: false,
        desc: '仅对负数生效：0（默认）=朝 -∞（更负）；非 0=朝 0（绝对值变小）。',
        accepts: '0 · 1 · -1。',
        ifOmitted: '省略或 0：负数朝 -∞ 舍去。',
        tip: '正数不受 mode 影响；要控制负数方向才填。',
        example: '0',
      },
    ],
  },
  returnValue:
    '返回朝 -∞ 舍入到 significance 倍数的结果；负数默认更负，mode 非 0 时改为朝 0。',
  examples: [
    {
      title: '示例 1：去尾到 5（能装几整箱）',
      scene: '货品按 5 个一箱，只算装满的整箱数，零头舍去。',
      dataTsv: FLOOR_5_TSV,
      dataAnchor: 'A1',
      formula: '=FLOOR.MATH(A2,5)',
      result: '20（23）· 15（17）· 5（8）',
      explanation: '向下舍到 5 的倍数：23→20，17→15，8→5。',
    },
    {
      title: '示例 2：去尾到 0.5',
      scene: '工时按 0.5 小时向下取，多出的零头不算钱。',
      dataTsv: FLOOR_05_TSV,
      dataAnchor: 'A1',
      formula: '=FLOOR.MATH(A2,0.5)',
      result: '1（1.2）· 2.5（2.7）· 0（0.3）',
      explanation: '按 0.5 向下取：1.2→1，2.7→2.5，0.3 不足 0.5 得 0。',
    },
    {
      title: '示例 3：负数方向（mode 参数）',
      scene: '负数默认更负，有时想让它朝 0（绝对值变小）。',
      dataTsv: FLOOR_NEG_TSV,
      dataAnchor: 'A1',
      formula: '=FLOOR.MATH(A2,1,1)',
      result: '默认 =FLOOR.MATH(-4.3,1) → -5（更负）；加 mode 非0 的 =FLOOR.MATH(-4.3,1,1) → -4（朝0）',
      explanation: 'mode 只管负数：默认更负（-4.3→-5），非 0 朝 0（-4.3→-4）。',
    },
  ],
  pitfalls: [
    {
      title: '和旧函数 FLOOR 混淆参数顺序/方向',
      reason: 'FLOOR(number, significance) 老版要求同号否则 #NUM!，FLOOR.MATH 更宽容且默认朝 0。',
      fix: '2013+ 优先用 FLOOR.MATH；涉及负数时明确 mode 参数。',
      level: 'mid',
    },
    {
      title: '负数默认更负，和「朝 0」直觉相反',
      reason: '默认 mode 0，负数朝 -∞ 即 -4.3 → -5。',
      fix: '想负数更负，加第三参数非 0：=FLOOR.MATH(A2,1,1)。',
      level: 'high',
    },
    {
      title: '旧版 Excel（2010 及更早）没有 FLOOR.MATH，报 #NAME?',
      reason: '它是 2013 年才加入的函数。',
      fix: '旧版用 FLOOR（注意同号要求），或升级到 2013+。',
      level: 'mid',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'ceiling-math',
      kind: 'confusable',
      why: 'CEILING.MATH 是向上（远离0）舍倍数；要向下去尾用它。',
    },
    {
      id: 'mround',
      kind: 'confusable',
      why: 'MROUND 四舍五入到最近倍数；FLOOR.MATH 是向下（宁小勿大）。',
    },
    {
      id: 'rounddown',
      kind: 'confusable',
      why: 'ROUNDDOWN 只能按小数位去尾，不能指定任意倍数；要任意倍数用 FLOOR.MATH。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '3.7', placeholder: '如 3.7' },
      { key: 'significance', label: '倍数', type: 'number', default: '1', placeholder: '如 1' },
    ],
    template: '=FLOOR.MATH({number},{significance})',
    cases: [
      { label: '向下去尾到整数', type: 'ok', values: { number: '3.7', significance: '1' }, expect: '3', note: 'FLOOR.MATH(3.7,1)=3' },
      { label: '负数向 -∞ 舍去', type: 'ok', values: { number: '-3.7', significance: '1' }, expect: '-4', note: '负值更负：-3.7→-4' },
      { label: '去尾到 5 的倍数', type: 'ok', values: { number: '17', significance: '5' }, expect: '15', note: 'FLOOR.MATH(17,5)=15' },
      { label: '数字非数字', type: 'error', values: { number: 'abc', significance: '1' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default floorMathEntry;
