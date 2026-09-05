import type { FunctionEntry } from '@/types';

/** GROWTH · 指数趋势值（statistical 类 B4 批次） */

const TSV = '年份\t用户数\n1\t1000\n2\t1500\n3\t2280\n4\t3400\n5\t5100';

const growthEntry: FunctionEntry = {
  id: 'growth',
  enName: 'GROWTH',
  zhName: '指数趋势值',
  zhCommon: ['指数趋势', 'GROWTH', '指数预测'],
  alias: ['指数拟合值', '复利外推', '指数增长预测'],
  category: 'statistical',
  abbr: 'zsqsz',
  pinyin: 'zhishuqushizhi',
  keywords: ['GROWTH', '指数趋势', '指数增长', '复利', '预测', '数组公式'],
  difficulty: 4,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '结果为数组；Microsoft 365 自动溢出，2019 及更早需选中区域后按 Ctrl+Shift+Enter。',
  },
  oneLiner: '按指数（复利）趋势一次算出多个 x 对应的 y',
  summary:
    'GROWTH 是 TREND 的指数版本，拟合的是 y = a·bˣ 这样的指数曲线。判断该用哪个：如果数据**每期乘上一个固定倍数**（用户数、病毒传播、复利增长），用 GROWTH；如果每期**加上一个固定量**（线性增长），用 TREND。一个简单的判断法是看相邻两期的比值是否大致恒定（指数）还是差值大致恒定（线性）。它是数组函数，用法与 TREND 完全一致。',
  syntax: {
    patternCn: '=GROWTH(已知的y, [已知的x], [新的x], [强制系数为1])',
    patternEn: '=GROWTH(known_y\'s, [known_x\'s], [new_x\'s], [const])',
    args: [
      {
        key: 'known_y\'s',
        zh: '已知的y',
        en: 'known_y\'s',
        required: true,
        desc: '已有的因变量观测值，必须全部为正。',
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
        desc: '已有的自变量观测值，个数与 y 相同。',
        accepts: '单元格区域，如 A2:A6。',
        ifOmitted: '省略时按 1、2、3… 的自然序列处理。',
        tip: '等间隔时间序列可省略。',
        example: 'A2:A6',
      },
      {
        key: 'new_x\'s',
        zh: '新的x',
        en: 'new_x\'s',
        required: false,
        desc: '要预测的那些新 x 值。',
        accepts: '单元格区域，如 {6;7}。',
        ifOmitted: '省略时返回历史数据的指数拟合值。',
        tip: '省略即求拟合值，可用于画指数趋势线。',
        example: '{6;7}',
      },
      {
        key: 'const',
        zh: '强制系数为1',
        en: 'const',
        required: false,
        desc: 'TRUE（默认）正常拟合系数 a；FALSE 强制 a=1。',
        accepts: 'TRUE / FALSE 或 1 / 0。',
        ifOmitted: '默认 TRUE。',
        tip: '除非有理论要求，保持默认。',
        example: 'TRUE',
      },
    ],
  },
  returnValue: '返回一组指数趋势拟合值（数组）；含非正 y 或数据不匹配返回 #NUM! / #REF!。',
  examples: [
    {
      title: '示例 1：预测用户数的指数增长',
      scene: '用户数每期约翻 1.5 倍，预测第 6、7 年。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=GROWTH(B2:B6,A2:A6,{6;7})',
      result: '约 7600、11400（延续约 1.5 倍/年的增速）',
      explanation: '相邻期的比值都在 1.5 左右，是典型的指数增长，用 GROWTH 比 TREND 贴切得多。',
    },
    {
      title: '示例 2：与 TREND 对比（选错模型的差距）',
      scene: '同样数据，若误用线性趋势会低估多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TREND(B2:B6,A2:A6,{6;7})',
      result: '约 6100、7130（明显低于 GROWTH 的 7600、11400）',
      explanation:
        '指数数据用线性模型会系统性低估后期。判断依据：相邻期**比值**恒定 → GROWTH；**差值**恒定 → TREND。',
    },
    {
      title: '示例 3：含 0 或负数时报错',
      scene: '数据里有 0，指数模型无法处理。',
      dataTsv: 'y\n1000\n0\n2280',
      dataAnchor: 'A1',
      formula: '=GROWTH(A2:A4)',
      result: '#NUM!（指数拟合要求 y > 0）',
      explanation: '指数函数的取值恒为正，含 0 或负值无法拟合。可改用 TREND，或先平移数据。',
    },
  ],
  pitfalls: [
    {
      title: '数据含 0 或负数时报 #NUM!',
      reason: '指数模型 y = a·bˣ 的取值恒为正，无法拟合非正值。',
      fix: '改用 TREND；或给数据加一个常数平移为正后再拟合（注意还原时要平移回去）。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '该用 TREND 时用了 GROWTH（或反之）',
      reason: '模型选错会让预测严重偏离：线性数据用指数会高估、指数数据用线性会低估。',
      fix: '看相邻期是「差值恒定」还是「比值恒定」；不确定的话两种都算，比较 R² 或画散点图。',
      level: 'high',
    },
    {
      title: '旧版 Excel 直接回车只得到一个值',
      reason: '数组函数需 Ctrl+Shift+Enter。',
      fix: '选中输出区域后按 Ctrl+Shift+Enter；Microsoft 365 自动溢出。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'trend',
      kind: 'confusable',
      why: 'TREND 拟合直线、GROWTH 拟合指数曲线，参数完全一致，关键在判断数据属于哪种增长。',
    },
    {
      id: 'logest',
      kind: 'companion',
      why: 'LOGEST 返回指数回归的参数，可用来核对 GROWTH 的拟合结果。',
    },
    {
      id: 'geomean',
      kind: 'companion',
      why: '指数增长的「平均倍数」就是几何平均，可用 GEOMEAN 估算年均增长倍率。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'B2:B6', known_xs: 'A2:A6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'B2:B6', hint: '用户数' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'A2:A6', hint: '年份' },
      { key: 'new_x', label: '新的 x', type: 'number', default: '6' },
    ],
    template: '=GROWTH({known_ys},{known_xs},{new_x})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '7687.293149', note: '指数拟合预测 x=6 的用户数（已简化）' },
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

export default growthEntry;
