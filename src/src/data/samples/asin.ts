import type { FunctionEntry } from '@/types';

/** ASIN · 反正弦（math 类 B2 批次） */

const RATIO_TSV = '比值\n0.5\n0\n1\n-0.5';

const asinEntry: FunctionEntry = {
  id: 'asin',
  enName: 'ASIN',
  zhName: '反正弦',
  zhCommon: ['反正弦', 'asin', '反三角'],
  alias: ['由正弦求角度', 'arcsin', '反求角度'],
  category: 'math',
  abbr: 'fzx',
  pinyin: 'fanzhengxian',
  keywords: ['反正弦', 'ASIN', '反三角函数', '由比值求角度', '弧度'],
  difficulty: 3,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '已知正弦值，反推出角度（结果是弧度）',
  summary:
    'SIN 是「给角度求比值」，ASIN 反过来「给比值求角度」。它的输入必须在 -1 到 1 之间——因为正弦值不可能超出这个范围，超了就报 #NUM!。输出是**弧度**，想看多少度还要再套一层 DEGREES。完整写法通常是 =DEGREES(ASIN(0.5))，得 30。',
  syntax: {
    patternCn: '=ASIN(正弦值)',
    patternEn: '=ASIN(number)',
    args: [
      {
        key: 'number',
        zh: '正弦值',
        en: 'number',
        required: true,
        desc: '一个 -1 到 1 之间的比值。',
        accepts: '单元格引用、直接写 0.5、或另一个公式算出的比值（如 对边/斜边）。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '超出 [-1, 1] 会直接报 #NUM!，这通常意味着上游数据算错了。',
        example: '0.5',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回弧度制的角度，范围 -π/2 到 π/2（即 -90° 到 90°）；输入越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：由正弦值反推角度（转成度）',
      scene: '已知某个角的正弦是 0.5，想知道这个角是多少度。',
      dataTsv: RATIO_TSV,
      dataAnchor: 'A1',
      formula: '=DEGREES(ASIN(A2))',
      result: '30（度）；A3 的 0 → 0°；A4 的 1 → 90°；A5 的 -0.5 → -30°',
      explanation:
        'ASIN 先算出弧度 0.5236，DEGREES 再转成 30 度。这是反三角函数的标准连招，几乎不会单独用 ASIN。',
    },
    {
      title: '示例 2：已知对边和斜边，求夹角',
      scene: '直角三角形对边长 3、斜边长 6，求这条边对的角是多少度。',
      dataTsv: '对边\t斜边\n3\t6\n4\t5\n1\t2',
      dataAnchor: 'A1',
      formula: '=DEGREES(ASIN(A2/B2))',
      result: '30 度（3÷6=0.5，ASIN 得 30°）',
      explanation: '先算比值 0.5，再反推角度。下拉得 4÷5=0.8 → 53.13°，1÷2=0.5 → 30°。',
    },
    {
      title: '示例 3：越界时报 #NUM! 的排查',
      scene: '上游数据算出的比值大于 1，公式突然报错。',
      dataTsv: '对边\t斜边\n7\t5\n3\t6',
      dataAnchor: 'A1',
      formula: '=DEGREES(ASIN(A2/B2))',
      result: '#NUM!（因为 7÷5 = 1.4，超出正弦值可能范围）',
      explanation:
        '对边不可能比斜边长。出现 #NUM! 时先回头检查原始数据是否填反了，这是最常见的根因。',
    },
  ],
  pitfalls: [
    {
      title: '忘记结果单位是弧度，直接当度用',
      reason: 'ASIN(0.5) 返回 0.5236（弧度），不是 30。直接拿来当角度用会整片错。',
      fix: '外面套 DEGREES：=DEGREES(ASIN(0.5))。这是反三角函数最高频的错误。',
      level: 'high',
    },
    {
      title: '输入超过 1 或小于 -1',
      reason: '正弦值数学上不可能超出 [-1,1]，Excel 会拒绝计算。',
      fix: '检查上游比值是否算错（常见是分子分母填反）。必要时加 IFERROR 兜底。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '想求出 120° 这类钝角',
      reason: 'ASIN 的值域只有 -90° 到 90°，cos 为负的钝角（如 120°）它给不出——120° 的正弦和 60° 相同，无法区分。',
      fix: '需要先判断所在象限，或用 ACOS 配合符号判断；工程上常改用 ATAN2 来得到 0–360° 的完整角度。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'sin',
      kind: 'companion',
      why: 'SIN 正向、ASIN 反向，是一对互逆运算（在值域内）。',
    },
    {
      id: 'degrees',
      kind: 'companion',
      why: 'ASIN 输出弧度，几乎总要再套 DEGREES 才能读出「多少度」。',
    },
    {
      id: 'acos',
      kind: 'alternative',
      why: '已知邻边与斜边时用 ACOS 更直接；需要判断象限或求完整 0–360° 角度时用 ATAN2。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '0.5', placeholder: '如 0.5', hint: '必须在 [-1,1]' },
    ],
    template: '=ASIN(A2)',
    cases: [
      { label: '反正弦 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'asin(0)=0' },
      { label: '反正弦 0.5', type: 'ok', values: { number: '0.5' }, expect: '0.523599', note: 'asin(0.5)≈0.523599（30°）' },
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

export default asinEntry;
