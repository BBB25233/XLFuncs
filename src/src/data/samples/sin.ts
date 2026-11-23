import type { FunctionEntry } from '@/types';

/** SIN · 正弦（math 类 B2 批次） */

/** 角度小表：表头占第 1 行，数据在第 2–5 行 */
const ANGLE_TSV = '角度\t弧度\n0\t0\n30\t0.5236\n90\t1.5708\n180\t3.1416';

const sinEntry: FunctionEntry = {
  id: 'sin',
  enName: 'SIN',
  zhName: '正弦',
  zhCommon: ['正弦', 'sin', '求正弦'],
  alias: ['正弦值', '三角函数', '对边比斜边'],
  category: 'math',
  abbr: 'zx',
  pinyin: 'zhengxian',
  keywords: ['正弦', 'SIN', '三角函数', '弧度', '角度转弧度', '求高'],
  difficulty: 2,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '给一个弧度，算出它的正弦值',
  summary:
    '直角三角形里「对边 ÷ 斜边」就是正弦。Excel 的 SIN 只认**弧度**，不认角度——这是它最大的坑：=SIN(30) 得到的不是 0.5，而是 -0.988，因为 30 被当成了 30 弧度。要算 30° 的正弦，得写成 =SIN(RADIANS(30)) 或 =SIN(30*PI()/180)，结果才是 0.5。',
  syntax: {
    patternCn: '=SIN(弧度)',
    patternEn: '=SIN(number)',
    args: [
      {
        key: 'number',
        zh: '弧度',
        en: 'number',
        required: true,
        desc: '要用弧度表示的角度，不是角度制数字。',
        accepts: '弧度数值、单元格引用、RADIANS(30)、30*PI()/180 这类换算式。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '手上只有角度时，务必先用 RADIANS() 转成弧度，别直接把 30 丢进去。',
        example: 'RADIANS(A2)',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该弧度的正弦值，范围在 -1 到 1 之间。',
  examples: [
    {
      title: '示例 1：用现成的弧度列求正弦',
      scene: '表里已经有换算好的弧度，直接丢进 SIN。',
      dataTsv: ANGLE_TSV,
      dataAnchor: 'A1',
      formula: '=SIN(B2)',
      result: '0 弧度 → 0；0.5236 弧度（30°）→ 0.5；1.5708 弧度（90°）→ 1；3.1416 弧度（180°）→ 约 0',
      explanation:
        'B 列是弧度，SIN 直接吃弧度，所以结果正确。90° 的正弦是 1，180° 接近 0（浮点误差导致不是精确的 0）。',
    },
    {
      title: '示例 2：手上是角度，先转成弧度',
      scene: '最常见的情况：表里只有「30°」这样的角度数字，必须先换算。',
      dataTsv: ANGLE_TSV,
      dataAnchor: 'A1',
      formula: '=SIN(RADIANS(A3))',
      result: '0.5（因为 A3 是 30，RADIANS(30)=0.5236，SIN 得 0.5）',
      explanation:
        'RADIANS 把角度转成弧度，再交给 SIN。等价写法是 =SIN(A3*PI()/180)。这是用三角函数时最该养成的习惯。',
    },
    {
      title: '示例 3：已知斜边和倾角，算竖直高度',
      scene: '梯子长 5 米，靠墙倾角 60°，求梯子顶端离地多高。',
      dataTsv: '斜边\t角度\n5\t60\n5\t30\n10\t45',
      dataAnchor: 'A1',
      formula: '=A2*SIN(RADIANS(B2))',
      result: '5 × SIN(60°) = 5 × 0.866 = 4.33 米',
      explanation:
        '「斜边 × sin(角度)」就是对边长度。下拉可得 30° → 2.5 米、45° → 7.07 米。工程测量里这类换算非常常用。',
    },
  ],
  pitfalls: [
    {
      title: '直接写 =SIN(30) 想算 30 度的正弦',
      reason:
        'Excel 的三角函数一律用弧度。30 被当成 30 弧度（约等于 1718 度），算出来是 -0.988，跟 0.5 差了十万八千里，而且**不报错**，非常难发现。',
      fix: '写成 =SIN(RADIANS(30))，或 =SIN(30*PI()/180)。只要手上单位是「度」，就必须先转。',
      level: 'high',
    },
    {
      title: '反过来把弧度当成角度去解释结果',
      reason: '算完 SIN 得到 0.5，有人会以为「结果是 0.5 度」。其实 SIN 的输出是一个比值（没有单位），不是角度。',
      fix: '要由正弦值反推角度，用 ASIN 求弧度，再用 DEGREES 转成度：=DEGREES(ASIN(0.5)) 得 30。',
      level: 'mid',
    },
    {
      title: '参数里混进文本或空单元格',
      reason: 'SIN 只接受数字，传文本会直接报错。',
      fix: '确保参数是数值单元格，必要时用 VALUE() 转换。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'cos',
      kind: 'companion',
      why: 'COS 是「邻边 ÷ 斜边」，与 SIN 成对出现，一个管竖直分量一个管水平分量。',
    },
    {
      id: 'tan',
      kind: 'companion',
      why: 'TAN = SIN/COS，已知角度求坡度时用它，同样必须先转弧度。',
    },
    {
      id: 'radians',
      kind: 'companion',
      why: 'RADIANS 是把角度转弧度的专用函数；只要用三角函数，几乎都要先过它一道。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '弧度', type: 'number', default: '0.5', placeholder: '如 0.5', hint: 'SIN 只认弧度，角度需先 RADIANS()' },
    ],
    template: '=SIN({number})',
    cases: [
      { label: '正弦 0.5', type: 'ok', values: { number: '0.5' }, expect: '0.479426', note: 'sin(0.5)≈0.479426' },
      { label: '正弦 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'sin(0)=0' },
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

export default sinEntry;
