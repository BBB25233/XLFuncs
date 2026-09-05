import type { FunctionEntry } from '@/types';

/** RADIANS · 角度转弧度（math 类 B2 批次） */

const DEG_TSV = '角度\n0\n30\n90\n180';

const radiansEntry: FunctionEntry = {
  id: 'radians',
  enName: 'RADIANS',
  zhName: '角度转弧度',
  zhCommon: ['角度转弧度', '转弧度', '弧度换算'],
  alias: ['度化弧度', 'DEGREES 反向', '角度转换'],
  category: 'math',
  abbr: 'jdzhd',
  pinyin: 'jiaoduzhuanhudu',
  keywords: ['角度转弧度', 'RADIANS', '三角函数前置', '弧度', '度转弧度'],
  difficulty: 2,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把「多少度」换算成 Excel 三角函数能吃的弧度',
  summary:
    'Excel 的 SIN/COS/TAN 只认弧度，而人手上的数据通常是「度」。RADIANS 就是进入三角函数前的必经一步：RADIANS(180) = 3.14159（即 π）。**只要你要用三角函数，而手上是角度，就必须先过这一道**，否则会得到完全错误、且不报错的结果——这是三角函数里最常见的事故。',
  syntax: {
    patternCn: '=RADIANS(角度)',
    patternEn: '=RADIANS(angle)',
    args: [
      {
        key: 'angle',
        zh: '角度',
        en: 'angle',
        required: true,
        desc: '要转换的角度值（以度为单位）。',
        accepts: '角度数值、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '等价手写式：角度 × PI() / 180。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回对应的弧度值。',
  examples: [
    {
      title: '示例 1：常见角度转弧度',
      scene: '把 30°、90°、180° 转成弧度，建立对应关系。',
      dataTsv: DEG_TSV,
      dataAnchor: 'A1',
      formula: '=RADIANS(A2)',
      result: '0° → 0；30° → 0.5236；90° → 1.5708；180° → 3.1416',
      explanation: '180° 对应 π，90° 对应 π/2。这两个值可以用来快速验证换算是否正确。',
    },
    {
      title: '示例 2：算 30° 的正弦（标准写法）',
      scene: '手上是角度，想求正弦——必须先转弧度。',
      dataTsv: DEG_TSV,
      dataAnchor: 'A1',
      formula: '=SIN(RADIANS(A3))',
      result: '0.5（30° 的正弦）',
      explanation:
        '如果直接写 =SIN(30)，得到的是 -0.988，因为 30 被当成 30 弧度。这一层转换绝对不能省。',
    },
    {
      title: '示例 3：批量算一列角度的正弦与余弦',
      scene: '一张角度表，要一次算出每个角的 sin 和 cos。',
      dataTsv: '角度\n0\n30\n45\n60\n90',
      dataAnchor: 'A1',
      formula: '=ROUND(SIN(RADIANS(A2)),4)',
      result: '0 → 0；30 → 0.5；45 → 0.7071；60 → 0.866；90 → 1',
      explanation:
        'RADIANS 转弧度、SIN 求值、ROUND 收敛浮点误差，三层嵌套是这类计算的标准写法。COS 同理，把 SIN 换成 COS 即可。',
    },
  ],
  pitfalls: [
    {
      title: '跳过 RADIANS 直接把角度丢给三角函数',
      reason:
        'SIN/COS/TAN 一律以弧度计算。传 30 进去会当成 30 弧度（约 1718°），结果完全错误且不报错，极难排查。',
      fix: '凡是三角函数，只要输入单位是「度」，就先套 RADIANS（或乘 PI()/180）。',
      level: 'high',
    },
    {
      title: '对已经是弧度的值再转一次',
      reason: 'RADIANS 的输入必须是度。对弧度再转一次会把值缩小约 57 倍。',
      fix: '先确认数据单位：度 → RADIANS → 三角函数；弧度 → 直接进三角函数。',
      level: 'mid',
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
      id: 'degrees',
      kind: 'companion',
      why: 'DEGREES 是反向操作（弧度转度）；三角函数用之前用 RADIANS、之后用 DEGREES。',
    },
    {
      id: 'sin',
      kind: 'companion',
      why: 'SIN/COS/TAN 都要求弧度输入，RADIANS 是它们的标准前置步骤。',
    },
    {
      id: 'pi',
      kind: 'companion',
      why: '手写等价式是 角度×PI()/180；RADIANS(180) 就等于 PI()。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '角度', type: 'number', default: '180', placeholder: '如 180', hint: 'RADIANS 把角度转成弧度' },
    ],
    template: '=RADIANS(A2)',
    cases: [
      { label: '角度 → 弧度', type: 'ok', values: { number: '180' }, expect: '3.141593', note: 'RADIANS(180)=π≈3.141593' },
      { label: '角度 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'RADIANS(0)=0' },
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

export default radiansEntry;
