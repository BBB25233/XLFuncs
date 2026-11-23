import type { FunctionEntry } from '@/types';

/** SLOPE · 线性回归斜率（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const slopeEntry: FunctionEntry = {
  id: 'slope',
  enName: 'SLOPE',
  zhName: '线性回归斜率',
  zhCommon: ['斜率', 'SLOPE', '回归斜率'],
  alias: ['每单位变化量', '趋势线斜率', '边际效应'],
  category: 'statistical',
  abbr: 'xxhgxl',
  pinyin: 'xianxinghuiguixielv',
  keywords: ['SLOPE', '斜率', '线性回归', '趋势', '边际', '每增加一单位'],
  difficulty: 4,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '算出最佳拟合直线的斜率：x 每增加 1，y 平均变多少',
  summary:
    'SLOPE 用最小二乘法拟合出 y = a + b·x 中的 b，业务含义非常直接：「广告费每增加 1 万元，销售额平均增加多少」。它和 INTERCEPT 是一对——斜率定方向幅度、截距定起点，合起来就是完整的一元线性回归方程。做预测时通常直接用 FORECAST.LINEAR 或 TREND，不必手写方程。',
  syntax: {
    patternCn: '=SLOPE(已知的y, 已知的x)',
    patternEn: '=SLOPE(known_y\'s, known_x\'s)',
    args: [
      {
        key: 'known_y\'s',
        zh: '已知的y',
        en: 'known_y\'s',
        required: true,
        desc: '因变量的一组观测值。',
        accepts: '单元格区域，如 C2:C6。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ y 在前、x 在后。',
        example: 'C2:C6',
        pitfallRank: 1,
      },
      {
        key: 'known_x\'s',
        zh: '已知的x',
        en: 'known_x\'s',
        required: true,
        desc: '自变量的一组观测值，个数与 y 相同。',
        accepts: '单元格区域，如 B2:B6。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '个数必须与 y 一致。',
        example: 'B2:B6',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回拟合直线的斜率；数据个数不等或 x 无波动返回 #N/A 或 #DIV/0!。',
  examples: [
    {
      title: '示例 1：广告费每增加 1 万能带来多少销售额',
      scene: '评估广告投放的边际产出。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SLOPE(C2:C6,B2:B6)',
      result: '约 10.4（广告费每增加 1，销售额平均增加约 10.4）',
      explanation: '这个斜率就是「单位广告投入的产出」，可直接用于预算决策。',
    },
    {
      title: '示例 2：配合 INTERCEPT 拼出回归方程',
      scene: '想写出 y = a + b·x 的完整方程用于预测。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=INTERCEPT(C2:C6,B2:B6)',
      result: '约 -18（截距 a）；结合斜率 10.4 得 y = -18 + 10.4x',
      explanation: '有了斜率和截距就能手算预测值：x=60 时 y ≈ -18 + 624 = 606。',
    },
    {
      title: '示例 3：x 完全无波动时报 #DIV/0!',
      scene: '所有 x 都取同一个值，拟合不出直线。',
      dataTsv: 'x\ty\n5\t10\n5\t20\n5\t30',
      dataAnchor: 'A1',
      formula: '=SLOPE(B2:B4,A2:A4)',
      result: '#DIV/0!（x 的标准差为 0）',
      explanation: 'x 没有变化时无法确定「x 每增加 1 会怎样」，数学上无解。',
    },
  ],
  pitfalls: [
    {
      title: '参数顺序写反（写成 x 在前）',
      reason: 'SLOPE 要求 (known_y\'s, known_x\'s)，写反会得到完全不同的斜率（近似倒数关系）。',
      fix: '牢记「先 y 后 x」，与 INTERCEPT、FORECAST、RSQ 保持一致。',
      level: 'high',
    },
    {
      title: '把斜率当成因果效应',
      reason: '回归斜率只描述伴随关系，不代表「增加 x 就一定导致 y 增加这么多」。',
      fix: '作为决策参考时需结合业务机理；因果结论要有实验或准实验设计支撑。',
      level: 'high',
    },
    {
      title: 'x 无波动或数据个数不等',
      reason: '除数为 0 或无法配对。',
      fix: '核对区域行数一致，且 x 有变化。',
      level: 'high',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'intercept',
      kind: 'companion',
      why: '截距与斜率合起来构成完整的回归方程 y = a + b·x。',
    },
    {
      id: 'rsq',
      kind: 'companion',
      why: 'R² 说明这条拟合线能解释多少波动，判断斜率结论是否可信。',
    },
    {
      id: 'forecast-linear',
      kind: 'alternative',
      why: '只想得到预测值时，FORECAST.LINEAR 一步到位，不必自己拼方程。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'C2:C6', known_xs: 'B2:B6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'C2:C6' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'B2:B6' },
    ],
    template: '=SLOPE({known_ys},{known_xs})',
    cases: [
      { label: '回归斜率', type: 'ok', values: { known_ys: 'C2:C6', known_xs: 'B2:B6' }, expect: '10.4', note: '每增加1单位' },
      { label: '两组个数不一致', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'B2:B5' }, expect: '#N/A', note: '行数不等' },
      { label: 'x 区域非法', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'ZZZ' }, expect: '#REF!', note: '非法区域' },
          { label: '前三个月回归', type: 'ok', values: { known_ys: 'C2:C4', known_xs: 'B2:B4' }, expect: '9.5', note: '样本缩短后拟合斜率略降。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default slopeEntry;
