import type { FunctionEntry } from '@/types';

/**
 * RAND · 随机小数（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 * RAND 为易失函数（volatile）：每次重算都会重新生成新随机数。
 */

/** 随机百分比：给每人一个 0~1 的随机小数 */
const RAND_PCT_TSV = '姓名\n张三\n李四\n王五';

/** 随机整数：用 RAND 造 0~100 的随机编号 */
const RAND_INT_TSV = '样本\nA\nB\nC\nD\nE';

/** 随机洗牌：给每行一个随机数，按它排序即可打乱顺序 */
const RAND_SHUFFLE_TSV = '物品\n苹果\n香蕉\n橙子\n西瓜';

const randEntry: FunctionEntry = {
  id: 'rand',
  enName: 'RAND',
  zhName: '随机小数',
  zhCommon: ['随机', '随机数', '随机小数'],
  alias: ['随机生成', '0到1随机数', '随机概率'],
  category: 'math',
  abbr: 'sjxs',
  pinyin: 'suijixiaoshu',
  keywords: ['随机小数', '随机数', '0到1随机', '随机百分比', '模拟抽样', '随机概率'],
  difficulty: 1,
  usageLevel: 70,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'RAND 是「易失函数」：每次表格重算（输入、删除、F9）都会重新生成一个新随机数。要「冻结」随机数，复制后「粘贴为值」。',
  },
  oneLiner: '生成一个 0 到 1 之间的随机小数',
  summary:
    '想要一个谁也猜不中的随机比例、随机概率，就用 RAND。它不填任何参数，每次重算都变一个新数，固定在 [0,1) 区间（含 0 不含 1）。配合 ROUND、INT、RANDBETWEEN 能变出各种随机玩法：随机抽签、随机抽样、模拟数据都靠它。',
  syntax: {
    patternCn: '=RAND()',
    patternEn: '=RAND()',
    args: [],
  },
  returnValue: '返回大于等于 0 且小于 1 的随机实数。每次工作表重算都会变化。',
  examples: [
    {
      title: '示例 1：生成一个 0~1 的随机小数',
      scene: '想给每个人一个随机权重或随机百分比，不需要管具体是多少。',
      dataTsv: RAND_PCT_TSV,
      dataAnchor: 'A1',
      formula: '=RAND()',
      result: '0~1 之间的随机小数，如 0.382、0.771、0.054',
      explanation: 'RAND 不填参数，直接出 [0,1) 的随机数；把单元格格式设为百分比就能当概率看。',
    },
    {
      title: '示例 2：造一个 0~100 的随机整数',
      scene: '抽样编号想是 0~100 的整数，而不是 0.x 的小数。',
      dataTsv: RAND_INT_TSV,
      dataAnchor: 'A1',
      formula: '=ROUND(RAND()*100,0)',
      result: '0~100 的随机整数，如 37、82、5',
      explanation: 'RAND()*100 把范围拉到 [0,100)，再 ROUND 取整，就得到随机整数编号。',
    },
    {
      title: '示例 3：随机打乱顺序（辅助列排序法）',
      scene: '有一列物品要随机排序，比如抽奖前洗牌。',
      dataTsv: RAND_SHUFFLE_TSV,
      dataAnchor: 'A1',
      formula: '=RAND()',
      result: '每行一个随机数；按 B 列升序排序，A 列顺序即被随机打乱',
      explanation: '给每行一个 RAND 当辅助列，再按这一列排序，顺序就被随机洗牌；洗完记得「粘贴为值」固定。',
    },
  ],
  pitfalls: [
    {
      title: '易失函数一直变，引用它的结果会不断「飘」',
      reason: 'RAND 每次重算都重新生成，导致表格里所有用到它的数字跟着变，看着像出 bug。',
      fix: '想要固定结果：选中这些单元格 → 复制 → 右键「粘贴为值」，把公式变成死数字。',
      level: 'high',
    },
    {
      title: '误以为 RAND 能直接给整数',
      reason: 'RAND 只给 [0,1) 的小数，直接用它做「抽工号」会得到一堆 0.x。',
      fix: '要整数用 RANDBETWEEN(bottom,top)，或 =INT(RAND()*N)+1、=ROUND(RAND()*N,0)。',
      level: 'mid',
    },
    {
      title: '用 RAND 排序洗牌，排序后数字又变了',
      reason: '排序本身触发重算，RAND 重新随机，刚排好的顺序又乱了。',
      fix: '排序前先「复制→粘贴为值」固定随机数，再排序。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'randbetween',
      kind: 'alternative',
      why: '要「整数」随机（如 1~100 抽一个），直接用 RANDBETWEEN 比 RAND 套公式省事。',
    },
    {
      id: 'round',
      kind: 'companion',
      why: '想把 RAND 的随机小数修到指定位数或取整，用 ROUND。',
    },
    {
      id: 'int',
      kind: 'companion',
      why: '想「向下取整」出随机整数，可用 =INT(RAND()*N)；更可控的随机整数交给 RANDBETWEEN。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [],
    template: '=RAND()',
    cases: [
      { label: '随机 [0,1)', type: 'ok', values: {}, expect: '0', note: '自定义断言：结果在 [0,1) 且为数字（不比对 display）' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default randEntry;
