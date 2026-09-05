import type { FunctionEntry } from '@/types';

/** INTERCEPT · 线性回归截距（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const interceptEntry: FunctionEntry = {
  id: 'intercept',
  enName: 'INTERCEPT',
  zhName: '线性回归截距',
  zhCommon: ['截距', 'INTERCEPT', '回归截距'],
  alias: ['基线值', 'x为0时的y', '回归起点'],
  category: 'statistical',
  abbr: 'xxhgjj',
  pinyin: 'xianxinghuiguijieju',
  keywords: ['INTERCEPT', '截距', '线性回归', '基线', 'x为0'],
  difficulty: 4,
  usageLevel: 15,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '算出最佳拟合直线与 y 轴的交点（x=0 时的 y 值）',
  summary:
    'INTERCEPT 给出回归方程 y = a + b·x 中的 a。它的业务含义是「自变量为 0 时的基准水平」，比如「不投广告时也有约 -6 的销售额」——这个例子里截距为负显然不合常理，正说明**外推要谨慎**：截距是数学拟合的产物，只有在 x=0 落在观测范围内时才有实际意义。它主要用来和 SLOPE 配合拼出完整方程。',
  syntax: {
    patternCn: '=INTERCEPT(已知的y, 已知的x)',
    patternEn: '=INTERCEPT(known_y\'s, known_x\'s)',
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
  returnValue: '返回拟合直线在 y 轴上的截距；数据个数不等或 x 无波动返回 #N/A 或 #DIV/0!。',
  examples: [
    {
      title: '示例 1：求回归方程的截距',
      scene: '已知斜率，再求截距以拼出完整方程。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=INTERCEPT(C2:C6,B2:B6)',
      result: '约 -6（即回归方程 y = -6 + 10.4x）',
      explanation: '配合 SLOPE 的 10.4，得到完整方程。注意截距为负在此例中并不合理，说明不能拿它做「零投放时的销售额」推断。',
    },
    {
      title: '示例 2：基线有实际意义的情况',
      scene: 'x 的取值范围包含 0 附近，截距就能当基线用。',
      dataTsv: '月份\t销量\n0\t50\n1\t62\n2\t71\n3\t85',
      dataAnchor: 'A1',
      formula: '=INTERCEPT(B2:B5,A2:A5)',
      result: '约 50.5（第 0 月的基线销量）',
      explanation: '这里 x=0 在观测范围内，截距 50.5 就是有意义的「起始水平」。',
    },
    {
      title: '示例 3：x 无波动时报 #DIV/0!',
      scene: '所有 x 相同，拟合不出直线。',
      dataTsv: 'x\ty\n5\t10\n5\t20\n5\t30',
      dataAnchor: 'A1',
      formula: '=INTERCEPT(B2:B4,A2:A4)',
      result: '#DIV/0!（x 无变化）',
      explanation: '无法确定直线的斜率，自然也定不出截距。',
    },
  ],
  pitfalls: [
    {
      title: '把截距当成「x=0 时的真实业务值」',
      reason: '截距是拟合产物；若 x=0 远离观测范围，外推出的值可能荒谬（如负数销售额）。',
      fix: '只有当 x=0 在数据范围内时，截距才有业务含义；否则只把它当作方程的一部分。',
      level: 'high',
    },
    {
      title: '参数顺序写反',
      reason: '要求 (known_y\'s, known_x\'s)，写反结果完全不同。',
      fix: '牢记先 y 后 x。',
      level: 'high',
    },
    {
      title: 'x 无波动或两组个数不等',
      reason: '除数为 0 或无法配对。',
      fix: '核对区域行数一致，且 x 有变化。',
      level: 'high',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'slope',
      kind: 'companion',
      why: '截距与斜率合起来就是完整的回归方程 y = a + b·x。',
    },
    {
      id: 'forecast-linear',
      kind: 'alternative',
      why: '只要预测结果时，FORECAST.LINEAR 内部已含截距与斜率，不必自己拼。',
    },
    {
      id: 'linest',
      kind: 'companion',
      why: 'LINEST 一次返回斜率、截距及更多统计量，做完整回归时更高效。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'C2:C6', known_xs: 'B2:B6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'C2:C6', hint: '销售额' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'B2:B6', hint: '广告费' },
    ],
    template: '=INTERCEPT({known_ys},{known_xs})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '-18', note: '回归截距 = ȳ − 斜率·x̄' },
      { label: '已知 x 与 y 个数不一致', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'B2:B5' }, expect: '#N/A', note: '行数不同 → #N/A' },
      { label: '区域非法 B:B', type: 'error', values: { known_ys: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { known_xs: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default interceptEntry;
