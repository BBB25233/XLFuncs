import type { FunctionEntry } from '@/types';

/** FORECAST.LINEAR · 线性预测（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const forecastLinearEntry: FunctionEntry = {
  id: 'forecast-linear',
  enName: 'FORECAST.LINEAR',
  zhName: '线性预测',
  zhCommon: ['线性预测', 'FORECAST', '预测值'],
  alias: ['回归预测', '趋势外推', '按线性外推'],
  category: 'statistical',
  abbr: 'xxyc',
  pinyin: 'xianxingyuce',
  keywords: ['FORECAST.LINEAR', '预测', '线性回归', '外推', '趋势'],
  difficulty: 3,
  usageLevel: 28,
  version: {
    min: '2016',
    label: 'Excel 2016 起可用',
    notes: 'Excel 2013 及更早用 FORECAST（新版保留为兼容性函数，行为相同）。',
  },
  oneLiner: '根据已有的 x、y 关系，预测一个新 x 对应的 y',
  summary:
    'FORECAST.LINEAR 内部就是「用最小二乘拟合出直线，再把新 x 代进去」，等价于 INTERCEPT + SLOPE × x。它最适合「有明显的线性趋势、且新 x 落在原数据范围内」的场景（内插）。要格外小心**外推**：把 x 推到历史范围之外时，误差会迅速放大，广告费投到 10 倍并不代表销售额也能到 10 倍。',
  syntax: {
    patternCn: '=FORECAST.LINEAR(要预测的x, 已知的y, 已知的x)',
    patternEn: '=FORECAST.LINEAR(x, known_y\'s, known_x\'s)',
    args: [
      {
        key: 'x',
        zh: '要预测的x',
        en: 'x',
        required: true,
        desc: '想预测它对应的 y 的那个 x 值。',
        accepts: '数字或单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 尽量让 x 落在历史数据范围内，外推风险大。',
        example: '60',
        pitfallRank: 1,
      },
      {
        key: 'known_y\'s',
        zh: '已知的y',
        en: 'known_y\'s',
        required: true,
        desc: '已有的因变量观测值。',
        accepts: '单元格区域，如 C2:C6。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '参数顺序：x 在最前，然后 y、x。',
        example: 'C2:C6',
        pitfallRank: 2,
      },
      {
        key: 'known_x\'s',
        zh: '已知的x',
        en: 'known_x\'s',
        required: true,
        desc: '已有的自变量观测值，个数与 y 相同。',
        accepts: '单元格区域，如 B2:B6。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '个数必须与 known_y\'s 一致。',
        example: 'B2:B6',
      },
    ],
  },
  returnValue: '返回按线性趋势预测的 y 值；数据个数不等或 x 无波动返回 #N/A 或 #DIV/0!。',
  examples: [
    {
      title: '示例 1：按广告预算预测销售额',
      scene: '计划投 60 万广告费，预估能带来多少销售额。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FORECAST.LINEAR(60,C2:C6,B2:B6)',
      result: '约 618',
      explanation: '历史范围是 10–50，预测 60 属于轻度外推，结论可用但需谨慎。',
    },
    {
      title: '示例 2：与 INTERCEPT+SLOPE 手算结果一致',
      scene: '验证预测值是否符合回归方程。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=INTERCEPT(C2:C6,B2:B6)+SLOPE(C2:C6,B2:B6)*60',
      result: '约 618（与 FORECAST.LINEAR 一致）',
      explanation: '两者等价，可用来交叉验证公式是否写对。',
    },
    {
      title: '示例 3：极端外推会得出荒谬结论',
      scene: '把广告费推到 1000（远超历史范围）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FORECAST.LINEAR(1000,C2:C6,B2:B6)',
      result: '约 10394（数学上正确，但业务上毫无意义）',
      explanation:
        '线性模型不会自动「饱和」。离开历史范围越远，结论越不可信——这是误用预测函数最常见的问题。',
    },
  ],
  pitfalls: [
    {
      title: '外推过远导致结论荒谬',
      reason: '直线会一直延伸，但真实业务存在饱和、天花板、季节性，线性关系只在局部成立。',
      fix: '尽量内插（x 在历史范围内）；必须外推时限定在合理幅度内，并说明假设。',
      level: 'high',
    },
    {
      title: '参数顺序记错（x 的位置）',
      reason: 'FORECAST.LINEAR 是 (x, known_y\'s, known_x\'s)，x 在最前，与 SLOPE/INTERCEPT 的 (y, x) 不同。',
      fix: '记住 FORECAST 系列把「要预测的 x」放在第一个参数。',
      level: 'high',
    },
    {
      title: '两组数据个数不等或 x 无波动',
      reason: '无法配对或除数为 0。',
      fix: '核对区域行数一致，且 x 有变化。',
      level: 'high',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'trend',
      kind: 'alternative',
      why: '需要一次预测多个 x 时用 TREND（返回数组），比反复用 FORECAST.LINEAR 简洁。',
    },
    {
      id: 'slope',
      kind: 'companion',
      why: 'FORECAST.LINEAR 等价于 INTERCEPT + SLOPE×x，可用两者交叉验证。',
    },
    {
      id: 'steyx',
      kind: 'companion',
      why: '预测值应配合 STEYX 给出误差范围，单点预测容易误导。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'C2:C6', known_xs: 'B2:B6' },
    fields: [
      { key: 'x', label: '要预测的 x', type: 'number', default: '60' },
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'C2:C6', hint: '销售额' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'B2:B6', hint: '广告费' },
    ],
    template: '=FORECAST.LINEAR({x},{known_ys},{known_xs})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '606', note: '线性外推 x=60 的预测值（截距−18+斜率10.4×60）' },
      { label: 'x 非数字', type: 'error', values: { x: 'abc' }, expect: '#VALUE!', note: 'x 必须是数字 → #VALUE!' },
      { label: '已知 x 与 y 个数不一致', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'B2:B5' }, expect: '#N/A', note: '行数不同 → #N/A' },
      { label: '区域非法 B:B', type: 'error', values: { known_ys: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default forecastLinearEntry;
