import type { FunctionEntry } from '@/types';

/** ACOS · 反余弦（math 类 B2 批次） */

const RATIO_TSV = '比值\n0.5\n1\n0\n-1';

const acosEntry: FunctionEntry = {
  id: 'acos',
  enName: 'ACOS',
  zhName: '反余弦',
  zhCommon: ['反余弦', 'acos', '反三角'],
  alias: ['由余弦求角度', 'arccos', '反求夹角'],
  category: 'math',
  abbr: 'fyx',
  pinyin: 'fanyuxian',
  keywords: ['反余弦', 'ACOS', '反三角函数', '求夹角', '弧度'],
  difficulty: 3,
  usageLevel: 20,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '已知余弦值，反推出角度（结果是弧度）',
  summary:
    'COS 的反向函数：给它一个 -1 到 1 的余弦值，返回对应的角度（弧度制）。值域是 0 到 π（0° 到 180°），所以它特别适合求「两个方向之间的夹角」——这类问题天然落在 0–180° 范围内，不需要象限判断，比 ASIN 更好用。同样记得外面套 DEGREES。',
  syntax: {
    patternCn: '=ACOS(余弦值)',
    patternEn: '=ACOS(number)',
    args: [
      {
        key: 'number',
        zh: '余弦值',
        en: 'number',
        required: true,
        desc: '一个 -1 到 1 之间的比值。',
        accepts: '单元格引用、0.5 这样的字面量、或邻边/斜边这类比值公式。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '越界会报 #NUM!，通常说明上游比值算错或数据填反。',
        example: '0.5',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回弧度制的角度，范围 0 到 π（0° 到 180°）；输入越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：由余弦值反推角度（转成度）',
      scene: '已知余弦是 0.5，求角度。',
      dataTsv: RATIO_TSV,
      dataAnchor: 'A1',
      formula: '=DEGREES(ACOS(A2))',
      result: '60 度；1 → 0°；0 → 90°；-1 → 180°',
      explanation: 'ACOS 得弧度，DEGREES 转成度。0/90/180 这三个点可以拿来快速验证公式是否写对。',
    },
    {
      title: '示例 2：已知邻边与斜边求夹角',
      scene: '直角三角形邻边 4、斜边 8，求邻边与斜边的夹角。',
      dataTsv: '邻边\t斜边\n4\t8\n5\t10\n3\t6',
      dataAnchor: 'A1',
      formula: '=DEGREES(ACOS(A2/B2))',
      result: '60 度（4÷8=0.5，ACOS 得 60°）',
      explanation: '比值 = 邻边 ÷ 斜边。本例三行比值都是 0.5，结果都是 60°。',
    },
    {
      title: '示例 3：求两个方向向量的夹角',
      scene: '已知两个方向向量的点积与各自长度，求它们之间的夹角。',
      dataTsv: '点积\t长度1\t长度2\n6\t3\t4\n0\t5\t5\n-6\t3\t4',
      dataAnchor: 'A1',
      formula: '=DEGREES(ACOS(A2/(B2*C2)))',
      result: '60 度（6 ÷ (3×4) = 0.5）；第二行 0 → 90°（垂直）；第三行 -0.5 → 120°（钝角）',
      explanation:
        'cos(夹角) = 点积 ÷ (两长度之积)。ACOS 的值域 0–180° 正好覆盖夹角定义，所以求夹角优先用 ACOS 而不是 ASIN。',
    },
  ],
  pitfalls: [
    {
      title: '把弧度结果当角度读',
      reason: 'ACOS(0.5) 返回 1.047（弧度），不是 60。',
      fix: '外面套 DEGREES：=DEGREES(ACOS(0.5))。',
      level: 'high',
    },
    {
      title: '输入越界（>1 或 <-1），常因浮点误差触发',
      reason:
        '理论上比值不会超过 1，但浮点计算可能产生 1.0000000000000002，Excel 照样报 #NUM!。这类“看起来刚好等于 1 却报错”最让人困惑。',
      fix: '用 MIN/MAX 夹住范围：=DEGREES(ACOS(MAX(-1,MIN(1,比值))))，避免因极小浮点误差报错。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '想用它判断方向（顺时针/逆时针）',
      reason: 'ACOS 只返回 0–180°，无法区分 +60° 和 -60°。它给的是「夹角大小」，不是「有方向的角度」。',
      fix: '需要带方向的角度时用 ATAN2，它能给出 -180° 到 180° 的完整结果。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'cos',
      kind: 'companion',
      why: 'COS 正向、ACOS 反向，在 0–180° 内互逆。',
    },
    {
      id: 'asin',
      kind: 'alternative',
      why: 'ASIN 值域只有 -90°–90°，求 0–180° 的夹角时 ACOS 更合适；需要带方向则用 ATAN2。',
    },
    {
      id: 'degrees',
      kind: 'companion',
      why: '把 ACOS 的弧度结果转成度，几乎必用。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '0.5', placeholder: '如 0.5', hint: '必须在 [-1,1]' },
    ],
    template: '=ACOS({number})',
    cases: [
      { label: '反余弦 1', type: 'ok', values: { number: '1' }, expect: '0', note: 'acos(1)=0' },
      { label: '反余弦 0.5', type: 'ok', values: { number: '0.5' }, expect: '1.047198', note: 'acos(0.5)≈1.047198（60°）' },
      { label: '超出 [-1,1]', type: 'error', values: { number: '2' }, expect: '#NUM!', note: '参数必须在 [-1,1]' },
      { label: '参数非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default acosEntry;
