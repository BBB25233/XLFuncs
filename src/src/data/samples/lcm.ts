import type { FunctionEntry } from '@/types';

/**
 * LCM · 最小公倍数（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 周期小表 */
const CYC_TSV = '任务A\t任务B\n4\t6\n3\t5';

const lcmEntry: FunctionEntry = {
  id: 'lcm',
  enName: 'LCM',
  zhName: '最小公倍数',
  zhCommon: ['最小公倍数', '公倍数', '同步周期'],
  alias: ['公倍数', 'LCM', '周期重合'],
  category: 'math',
  abbr: 'zxgbs',
  pinyin: 'zuixiaogongbeishu',
  keywords: ['最小公倍数', '公倍数', '周期重合', '同步', '整数倍', '排程'],
  difficulty: 2,
  usageLevel: 20,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '求几个整数的最小公倍数',
  summary:
    'LCM 找「这几个数共同的倍数里最小的那一个」。最典型的场景是排程：A 每 4 天、B 每 6 天各做一次，问「多少天后它们又同一天出现」——就是 LCM(4,6)=12。和 GCD 一样，小数会被截断取整。',
  syntax: {
    patternCn: '=LCM(整数1, [整数2], …)',
    patternEn: '=LCM(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '整数1',
        en: 'number1',
        required: true,
        desc: '第一个整数。',
        accepts: '整数或整数单元格，如 4、A2。',
        ifOmitted: '必填，至少给一个整数。',
        tip: '传小数会被截断取整再算，不是四舍五入。',
        example: '4',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '整数2',
        en: 'number2',
        required: false,
        desc: '第二个及以后的整数，可继续逗号追加。',
        accepts: '同「整数1」。',
        ifOmitted: '不写就只算第一个数本身的最小公倍数（即它自己）。',
        tip: '三个数就 =LCM(a,b,c)。',
        example: '6',
      },
    ],
  },
  returnValue: '返回所有参数里整数的最小公倍数；含 0 时结果为 0；含负数按绝对值计算。',
  examples: [
    {
      title: '示例 1：两个周期多少天重合',
      scene: '设备 A 每 4 天保养、B 每 6 天保养，问多久后同一天保养。',
      dataTsv: CYC_TSV,
      dataAnchor: 'A1',
      formula: '=LCM(A2,B2)',
      result: 'LCM(4,6)=12（第 12 天两者再次重合）',
      explanation: '12 是 4 和 6 共同倍数里最小的一个，也就是它们下一次「撞车」的间隔。',
    },
    {
      title: '示例 2：三个数的最小公倍数',
      scene: '三班轮换，分别每 3、4、5 天一轮，问统一调度的最小周期。',
      dataTsv: '甲\t乙\t丙\n3\t4\t5',
      dataAnchor: 'A1',
      formula: '=LCM(A2,B2,C2)',
      result: 'LCM(3,4,5)=60',
      explanation: '三个数一起传，LCM 直接返回它们的最小公倍数 60。',
    },
    {
      title: '示例 3：通分（找公共分母）',
      scene: '要把 1/4 和 1/6 加起来，先找公分母。',
      dataTsv: '分母1\t分母2\n4\t6',
      dataAnchor: 'A1',
      formula: '=LCM(A2,B2)',
      result: '公分母 = 12，于是 1/4+1/6 = 3/12+2/12 = 5/12',
      explanation: 'LCM 给出的就是分数相加时最合适的公共分母。',
    },
  ],
  pitfalls: [
    {
      title: '传入小数被截断',
      reason: 'LCM 先把小数砍尾取整（4.9→4）再算，结果会和你四舍五入的预期不符。',
      fix: '先用 ROUND/INT 转整数：=LCM(ROUND(A2,0),B2)。',
      level: 'high',
    },
    {
      title: '参数里有 0，结果直接是 0',
      reason: '任何数和 0 的最小公倍数都是 0（0 的倍数只有 0），LCM 会返回 0 而不是报错，容易被忽略。',
      fix: '检查是否有空单元格被当成 0；必要时用 IF 过滤 0。',
      level: 'mid',
    },
    {
      title: '把 LCM 当成「乘起来」',
      reason: 'LCM(4,6) 是 12 不是 24；只有互质的两个数 LCM 才等于乘积。直接相乘会算大。',
      fix: '要最小公倍数就用 LCM，别手乘；乘积可用 PRODUCT。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'gcd',
      kind: 'companion',
      why: 'GCD 最大公约数、LCM 最小公倍数，两兄弟常一起用（还有关系 a×b = GCD×LCM）。',
    },
    {
      id: 'mod',
      kind: 'confusable',
      why: 'MOD 取余、LCM 取公倍数，都涉及整除概念但用途不同。',
    },
    {
      id: 'product',
      kind: 'confusable',
      why: 'PRODUCT 是把数乘起来，LCM 是找最小公共倍，别把「乘积」当「公倍数」。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number1', label: '数字1', type: 'number', default: '5' },
      { key: 'number2', label: '数字2', type: 'number', default: '2' },
      { key: 'number3', label: '数字3（可选）', type: 'number', default: '' },
      { key: 'number4', label: '数字4（可选）', type: 'number', default: '' },
      { key: 'number5', label: '数字5（可选）', type: 'number', default: '' },
    ],
    template: '=LCM({number1},{number2})',
    cases: [
      { label: 'LCM(5,2) → 10', type: 'ok', values: { number1: '5', number2: '2' }, expect: '10', note: '5 和 2 的最小公倍数是 10。' },
      { label: 'LCM(0,5) → 0', type: 'ok', values: { number1: '0', number2: '5' }, expect: '0', note: '任一为 0 则结果为 0。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number1: 'abc', number2: '2' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
      { label: '全部留空 → #VALUE!', type: 'error', values: { number1: '', number2: '' }, expect: '#VALUE!', note: '一个参数都没填会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default lcmEntry;
