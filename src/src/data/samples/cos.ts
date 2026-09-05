import type { FunctionEntry } from '@/types';

/** COS · 余弦（math 类 B2 批次） */

const ANGLE_TSV = '角度\t弧度\n0\t0\n60\t1.0472\n90\t1.5708\n180\t3.1416';

const cosEntry: FunctionEntry = {
  id: 'cos',
  enName: 'COS',
  zhName: '余弦',
  zhCommon: ['余弦', 'cos', '求余弦'],
  alias: ['余弦值', '邻边比斜边', '水平分量'],
  category: 'math',
  abbr: 'yx',
  pinyin: 'yuxian',
  keywords: ['余弦', 'COS', '三角函数', '弧度', '水平分量', '投影'],
  difficulty: 2,
  usageLevel: 38,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '给一个弧度，算出它的余弦值',
  summary:
    '直角三角形里「邻边 ÷ 斜边」就是余弦，常用来算水平方向的投影长度。和 SIN 一样，COS 只认弧度：=COS(60) 算的是 60 弧度而不是 60 度，正确写法是 =COS(RADIANS(60))，得 0.5。记住 0° 的余弦是 1、90° 的余弦是 0，可以拿这两个值快速自检公式对不对。',
  syntax: {
    patternCn: '=COS(弧度)',
    patternEn: '=COS(number)',
    args: [
      {
        key: 'number',
        zh: '弧度',
        en: 'number',
        required: true,
        desc: '要用弧度表示的角度。',
        accepts: '弧度数值、单元格引用、RADIANS(60)、60*PI()/180。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '角度必须先转弧度，否则结果完全不对且不报错。',
        example: 'RADIANS(A2)',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该弧度的余弦值，范围在 -1 到 1 之间。',
  examples: [
    {
      title: '示例 1：用弧度列求余弦',
      scene: '表里已经有弧度，直接套 COS。',
      dataTsv: ANGLE_TSV,
      dataAnchor: 'A1',
      formula: '=COS(B2)',
      result: '0 弧度 → 1；1.0472 弧度（60°）→ 0.5；1.5708 弧度（90°）→ 约 0；3.1416 弧度（180°）→ -1',
      explanation: 'B 列是弧度，直接可用。90° 的余弦理论上是 0，浮点精度下会显示一个极小值（如 6.1E-17），可视为 0。',
    },
    {
      title: '示例 2：已知角度，先转弧度再求余弦',
      scene: '表里只有角度数字，必须先换算。',
      dataTsv: ANGLE_TSV,
      dataAnchor: 'A1',
      formula: '=COS(RADIANS(A3))',
      result: '0.5（A3 是 60，COS(60°)=0.5）',
      explanation: 'RADIANS 先转弧度。等价写法 =COS(A3*PI()/180)。',
    },
    {
      title: '示例 3：算斜拉索的水平投影长度',
      scene: '一根长 10 米、与地面夹角 60° 的斜拉索，求它在地面上的水平投影。',
      dataTsv: '长度\t角度\n10\t60\n10\t30\n8\t45',
      dataAnchor: 'A1',
      formula: '=A2*COS(RADIANS(B2))',
      result: '10 × COS(60°) = 10 × 0.5 = 5 米',
      explanation:
        '「斜边 × cos(角度)」就是邻边（水平投影）。下拉得 30° → 8.66 米、45° → 5.66 米。与 SIN 算竖直分量是同一套思路。',
    },
  ],
  pitfalls: [
    {
      title: '把角度直接当弧度用，如 =COS(60)',
      reason: '60 被当成 60 弧度，算出来约 -0.95，而 60° 的余弦应该是 0.5。不报错，纯静默错误。',
      fix: '一律写成 =COS(RADIANS(60)) 或 =COS(60*PI()/180)。',
      level: 'high',
    },
    {
      title: '把 COS 和 SIN 的分量方向搞反',
      reason: '竖直分量用 SIN、水平分量用 COS。搞反了结果会互换，图形上完全看不出异常。',
      fix: '记住：角度是相对水平面量的，那么 cos 管水平、sin 管竖直；角度若相对竖直方向量的，则相反。',
      level: 'mid',
    },
    {
      title: '期待 90° 的余弦精确等于 0',
      reason: '浮点运算有误差，COS(π/2) 会得到 6.1E-17 这样的极小值，不是精确 0。',
      fix: '要判断「是否为 0」时加容差，如 =IF(ABS(COS(x))<0.000001,0,COS(x))；或直接 ROUND 到需要的小数位。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'sin',
      kind: 'companion',
      why: 'SIN 管竖直分量、COS 管水平分量，两者是同一角度的两个分量，经常一起用。',
    },
    {
      id: 'acos',
      kind: 'alternative',
      why: '已知余弦值反推角度时用 ACOS，得到的是弧度，通常还要再套 DEGREES 转成度。',
    },
    {
      id: 'radians',
      kind: 'companion',
      why: '角度转弧度的必备前置函数。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '弧度', type: 'number', default: '0.5', placeholder: '如 0.5', hint: 'COS 只认弧度，角度需先 RADIANS()' },
    ],
    template: '=COS(A2)',
    cases: [
      { label: '余弦 0.5', type: 'ok', values: { number: '0.5' }, expect: '0.877583', note: 'cos(0.5)≈0.877583' },
      { label: '余弦 0', type: 'ok', values: { number: '0' }, expect: '1', note: 'cos(0)=1' },
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

export default cosEntry;
