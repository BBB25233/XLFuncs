import type { FunctionEntry } from '@/types';

/** ATAN · 反正切（math 类 B2 批次） */

const SLOPE_TSV = '坡度比值\n1\n0.5\n0\n-1';

const atanEntry: FunctionEntry = {
  id: 'atan',
  enName: 'ATAN',
  zhName: '反正切',
  zhCommon: ['反正切', 'atan', '反三角'],
  alias: ['由斜率求角度', 'arctan', '坡度转角度'],
  category: 'math',
  abbr: 'fzq',
  pinyin: 'fanzhengqie',
  keywords: ['反正切', 'ATAN', '斜率转角度', '坡度转角度', '反三角函数'],
  difficulty: 3,
  usageLevel: 24,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '已知斜率/坡度比值，反推出角度（结果是弧度）',
  summary:
    'TAN 的反向函数：给一个比值（比如坡度 0.5），返回对应角度的弧度值。值域是 -π/2 到 π/2（-90° 到 90°）。实际用得最多的是「坡度转角度」：=DEGREES(ATAN(0.1)) 约 5.7 度。它只有一个参数，无法判断象限——需要区分方向时请改用 ATAN2。',
  syntax: {
    patternCn: '=ATAN(比值)',
    patternEn: '=ATAN(number)',
    args: [
      {
        key: 'number',
        zh: '比值',
        en: 'number',
        required: true,
        desc: '正切值，即对边与邻边的比值（可以是任意实数）。',
        accepts: '单元格引用、0.5 这样的字面量、或 高差/水平距离 这类比值公式。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: 'ATAN 接受任意实数，不会像 ASIN/ACOS 那样越界报错。',
        example: 'A2/B2',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回弧度制的角度，范围 -π/2 到 π/2（-90° 到 90°）。',
  examples: [
    {
      title: '示例 1：坡度比值转角度',
      scene: '已知坡度是 1（即 100%，水平走 1 米升 1 米），求对应角度。',
      dataTsv: SLOPE_TSV,
      dataAnchor: 'A1',
      formula: '=DEGREES(ATAN(A2))',
      result: '45 度；0.5 → 26.57°；0 → 0°；-1 → -45°',
      explanation: 'ATAN 得弧度，DEGREES 转成度。斜率为 1 时正好 45°，是很好的校验点。',
    },
    {
      title: '示例 2：由高差和水平距离算倾角',
      scene: '一段路水平 100 米、升高 10 米，求路面倾角。',
      dataTsv: '水平距离\t高差\n100\t10\n100\t20\n50\t5',
      dataAnchor: 'A1',
      formula: '=DEGREES(ATAN(B2/A2))',
      result: '5.71 度（10÷100 = 0.1）',
      explanation: '注意「高差 ÷ 水平距离」的顺序，别写反。第二行 0.2 → 11.31°，第三行 0.1 → 5.71°。',
    },
    {
      title: '示例 3：把「百分比坡度」换算成角度',
      scene: '道路标示 8% 的坡，想知道实际是多少度。',
      dataTsv: '坡度百分比\n8\n15\n30',
      dataAnchor: 'A1',
      formula: '=DEGREES(ATAN(A2/100))',
      result: '8% → 4.57°；15% → 8.53°；30% → 16.70°',
      explanation:
        '百分比先除以 100 变成小数比值，再 ATAN 求弧度、DEGREES 转度。可见 30% 的坡其实只有 16.7 度，百分比比直觉大得多。',
    },
  ],
  pitfalls: [
    {
      title: '把弧度当角度',
      reason: 'ATAN(1) 返回 0.785（弧度）不是 45。',
      fix: '套 DEGREES：=DEGREES(ATAN(1))。',
      level: 'high',
    },
    {
      title: '比值写反（水平距离 ÷ 高差）',
      reason: '写成 ATAN(水平/高差) 得到的是「余角」，45° 时看不出差别，其他角度会明显偏大。',
      fix: '牢记 ATAN(对边 ÷ 邻边)，即 高差 ÷ 水平距离。',
      level: 'mid',
    },
    {
      title: '想用它区分第二、三象限的方向',
      reason: 'ATAN 值域只有 -90°–90°，只能给出一条直线与 x 轴的夹角，无法表达「指向哪个方向」。',
      fix: '需要 0–360° 或带方向的角度时用 ATAN2（注意它的参数顺序是 x 在前）。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'atan2',
      kind: 'alternative',
      why: 'ATAN2 接受两个坐标参数、能判断象限，求「指向角」时应优先用它；ATAN 只适合单纯的斜率转角度。',
    },
    {
      id: 'tan',
      kind: 'companion',
      why: 'TAN 是角度转斜率，ATAN 是斜率转角度，互为反向。',
    },
    {
      id: 'degrees',
      kind: 'companion',
      why: '把 ATAN 的弧度转成度，几乎必用。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '0.5', placeholder: '如 0.5' },
    ],
    template: '=ATAN(A2)',
    cases: [
      { label: '反正切 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'atan(0)=0' },
      { label: '反正切 0.5', type: 'ok', values: { number: '0.5' }, expect: '0.463648', note: 'atan(0.5)≈0.463648' },
      { label: '参数非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
      { label: '参数为空', type: 'error', values: { number: '' }, expect: '#VALUE!', note: '空单元格报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default atanEntry;
