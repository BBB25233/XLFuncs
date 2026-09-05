import type { FunctionEntry } from '@/types';

/** DEGREES · 弧度转角度（math 类 B2 批次） */

const RAD_TSV = '弧度\n0\n0.5236\n1.5708\n3.1416';

const degreesEntry: FunctionEntry = {
  id: 'degrees',
  enName: 'DEGREES',
  zhName: '弧度转角度',
  zhCommon: ['弧度转角度', '转角度', '弧度换算'],
  alias: ['弧度化度', 'RADIANS 反向', '角度转换'],
  category: 'math',
  abbr: 'hdzjd',
  pinyin: 'huduzhuanjiaodu',
  keywords: ['弧度转角度', 'DEGREES', '角度换算', '反三角函数配套', '度'],
  difficulty: 2,
  usageLevel: 25,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把弧度换算成日常说的「多少度」',
  summary:
    'Excel 的所有三角函数（SIN/COS/TAN）用弧度输入输出，而人习惯看「度」。DEGREES 就是两者之间的翻译官：DEGREES(π) 得到 180。它最常见的用法是套在反三角函数外面——ASIN/ACOS/ATAN/ATAN2 算出来都是弧度，要变成能读懂的角度，几乎一定要再套一层 DEGREES。',
  syntax: {
    patternCn: '=DEGREES(弧度)',
    patternEn: '=DEGREES(angle)',
    args: [
      {
        key: 'angle',
        zh: '弧度',
        en: 'angle',
        required: true,
        desc: '要转换的弧度值。',
        accepts: '弧度数值、单元格引用，或另一个返回弧度的公式（如 ASIN(0.5)）。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '等价手写式：弧度 × 180 / PI()。',
        example: 'A2',
      },
    ],
  },
  returnValue: '返回对应的角度值（度）。',
  examples: [
    {
      title: '示例 1：几个常用弧度值转换',
      scene: '把常见弧度换成角度，建立直觉。',
      dataTsv: RAD_TSV,
      dataAnchor: 'A1',
      formula: '=DEGREES(A2)',
      result: '0 弧度 → 0°；0.5236 → 30°；1.5708 → 90°；3.1416 → 180°',
      explanation: 'π 弧度 = 180°，π/2 = 90°。记住这两个点，检查公式时很有用。',
    },
    {
      title: '示例 2：套在 ATAN 外面，把坡度转成角度',
      scene: '这是 DEGREES 最高频的用法：反三角函数算完立刻转度。',
      dataTsv: '水平距离\t高差\n100\t10\n100\t20',
      dataAnchor: 'A1',
      formula: '=DEGREES(ATAN(B2/A2))',
      result: '5.71 度；11.31 度',
      explanation:
        'ATAN 先算出弧度，DEGREES 转成度。如果去掉 DEGREES，只会得到 0.0997 这样的弧度值，没法直接读。',
    },
    {
      title: '示例 3：用 PI 验证换算关系',
      scene: '确认 180° 与 π 的对应关系，检验公式链路是否正确。',
      dataTsv: '说明\t值\n圆周率\t3.14159\n半圆\t1.5708',
      dataAnchor: 'A1',
      formula: '=DEGREES(PI())',
      result: '180（度）',
      explanation: 'PI() 返回 π，DEGREES(π) 正好 180，这是最简洁的自检公式。',
    },
  ],
  pitfalls: [
    {
      title: '对已经是角度的值再转一次',
      reason: 'DEGREES 的输入必须是弧度。若把 30（度）传进去，会得到 1718.87，明显不合理。',
      fix: '先确认上游数据的单位。三角函数输出是弧度、才需要 DEGREES；原始数据若是度，不要再转。',
      level: 'high',
    },
    {
      title: '反三角函数外面忘了套 DEGREES',
      reason: 'ASIN(0.5) 返回 0.5236，直接读会误以为角度是 0.52 度，实际是 30 度。',
      fix: '养成习惯：只要用了 ASIN/ACOS/ATAN/ATAN2，外面一律套 DEGREES。',
      level: 'high',
    },
    {
      title: '参数传了文本',
      reason: '函数只接受数字。',
      fix: '先用 VALUE() 转换。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'radians',
      kind: 'companion',
      why: 'RADIANS 是反向操作（度转弧度）；用三角函数前要用 RADIANS，之后要用 DEGREES。',
    },
    {
      id: 'atan',
      kind: 'companion',
      why: '反三角函数的输出都是弧度，几乎总要套 DEGREES 才能读出角度。',
    },
    {
      id: 'pi',
      kind: 'companion',
      why: 'PI() 返回 π，DEGREES(PI()) = 180，是换算关系的基准点。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '弧度', type: 'number', default: '1.5707963267948966', placeholder: '如 1.5708', hint: 'DEGREES 把弧度转成角度' },
    ],
    template: '=DEGREES(A2)',
    cases: [
      { label: '弧度 → 角度', type: 'ok', values: { number: '1.5707963267948966' }, expect: '90', note: 'DEGREES(π/2)=90' },
      { label: '弧度 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'DEGREES(0)=0' },
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

export default degreesEntry;
