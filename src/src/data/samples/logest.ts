import type { FunctionEntry } from '@/types';

/** LOGEST · 指数回归参数（statistical 类 B4 批次） */

const TSV = '年份\t用户数\n1\t1000\n2\t1500\n3\t2280\n4\t3400\n5\t5100';

const logestEntry: FunctionEntry = {
  id: 'logest',
  enName: 'LOGEST',
  zhName: '指数回归参数',
  zhCommon: ['指数回归', 'LOGEST', '指数拟合参数'],
  alias: ['指数最小二乘', '指数模型参数', '复利拟合'],
  category: 'statistical',
  abbr: 'zshgcs',
  pinyin: 'zhishuhuiguicanshu',
  keywords: ['LOGEST', '指数回归', '指数拟合', '复利', '数组公式'],
  difficulty: 5,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '结果为数组；Microsoft 365 自动溢出，2019 及更早需选中区域后按 Ctrl+Shift+Enter。',
  },
  oneLiner: '拟合指数曲线 y = a·bˣ，返回系数 b 与 a 及统计量',
  summary:
    'LOGEST 是 GROWTH 背后的「参数版」：GROWTH 直接给拟合值，LOGEST 给出指数模型的参数（底数 b 与系数 a）。若 b ≈ 1.5，就表示「每期约增长 50%」，这个数字比拟合值更便于汇报。用法、参数顺序与 LINEST 完全一致，同样支持 stats=TRUE 返回完整统计量。',
  syntax: {
    patternCn: '=LOGEST(已知的y, [已知的x], [强制系数为1], [返回附加统计量])',
    patternEn: '=LOGEST(known_y\'s, [known_x\'s], [const], [stats])',
    args: [
      {
        key: 'known_y\'s',
        zh: '已知的y',
        en: 'known_y\'s',
        required: true,
        desc: '因变量观测值，必须全部为正。',
        accepts: '单元格区域，如 B2:B6。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 指数拟合要求 y > 0，含 0 或负数会报错。',
        example: 'B2:B6',
        pitfallRank: 1,
      },
      {
        key: 'known_x\'s',
        zh: '已知的x',
        en: 'known_x\'s',
        required: false,
        desc: '自变量区域。',
        accepts: '单元格区域，如 A2:A6。',
        ifOmitted: '省略时按 1、2、3… 的自然序列处理。',
        tip: '等间隔序列可省略。',
        example: 'A2:A6',
      },
      {
        key: 'const',
        zh: '强制系数为1',
        en: 'const',
        required: false,
        desc: 'TRUE（默认）正常拟合 a；FALSE 强制 a=1。',
        accepts: 'TRUE / FALSE。',
        ifOmitted: '默认 TRUE。',
        tip: '除非理论要求，保持默认。',
        example: 'TRUE',
      },
      {
        key: 'stats',
        zh: '返回附加统计量',
        en: 'stats',
        required: false,
        desc: 'TRUE 返回完整统计量（标准误、R² 等）。',
        accepts: 'TRUE / FALSE。',
        ifOmitted: '默认 FALSE。',
        tip: '需要 R² 时设为 TRUE 并选中 5 行区域。',
        example: 'TRUE',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回指数回归参数数组 {b, a}；stats=TRUE 时返回 5 行统计量。',
  examples: [
    {
      title: '示例 1：求年均增长倍数',
      scene: '用户数呈指数增长，想知道「每年约翻多少倍」。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LOGEST(B2:B6,A2:A6)',
      result: '约 {1.5, 667}（b≈1.5 表示每期约 ×1.5，a≈667 为系数）',
      explanation: 'b=1.5 直接读作「每年增长约 50%」，这是最便于汇报的指标。',
    },
    {
      title: '示例 2：与 GROWTH 的关系',
      scene: '验证参数与预测值是否吻合。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=GROWTH(B2:B6,A2:A6,{6})',
      result: '约 7600（与用 667×1.5⁶ 手算一致）',
      explanation: 'GROWTH 内部就是用 LOGEST 的参数在算，两者可交叉验证。',
    },
    {
      title: '示例 3：含 0 或负数时报错',
      scene: '数据里有非正值。',
      dataTsv: 'y\n1000\n0\n2280',
      dataAnchor: 'A1',
      formula: '=LOGEST(A2:A4)',
      result: '#NUM!（指数拟合要求 y > 0）',
      explanation: '指数模型取值为正，无法处理 0 或负数。改用 LINEST，或先平移数据。',
    },
  ],
  pitfalls: [
    {
      title: '数据含 0 或负数时报 #NUM!',
      reason: '指数模型要求 y 恒为正。',
      fix: '改用 LINEST 做线性拟合，或把数据整体平移为正后再拟合。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '结果顺序与直觉相反',
      reason: '返回 {b, a}，即先底数后系数，不是习惯上的「先系数」。',
      fix: '读结果时注意顺序，或用 INDEX 明确取值。',
      level: 'high',
    },
    {
      title: '旧版 Excel 直接回车只得到第一个值',
      reason: '数组函数需 Ctrl+Shift+Enter。',
      fix: '选中输出区域后按 Ctrl+Shift+Enter；Microsoft 365 自动溢出。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'growth',
      kind: 'companion',
      why: 'GROWTH 直接给指数拟合值，LOGEST 给背后的参数，两者可互相验证。',
    },
    {
      id: 'linest',
      kind: 'confusable',
      why: 'LINEST 拟合直线、LOGEST 拟合指数曲线，参数与用法完全一致，区别在于数据属于哪种增长。',
    },
    {
      id: 'geomean',
      kind: 'companion',
      why: 'LOGEST 得到的 b 本质上就是各期增长倍率的几何平均，与 GEOMEAN 口径一致。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'B2:B6', known_xs: 'A2:A6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'B2:B6', hint: '用户数' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'A2:A6', hint: '年份' },
    ],
    template: '=LOGEST({known_ys},{known_xs})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '1.503325', note: '指数底数 b≈1.503（已简化，仅返回 b）' },
      { label: '已知 x 与 y 个数不一致', type: 'error', values: { known_ys: 'B2:B6', known_xs: 'A2:A5' }, expect: '#N/A', note: '行数不同 → #N/A' },
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

export default logestEntry;
