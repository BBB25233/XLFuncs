import type { FunctionEntry } from '@/types';

/** TREND · 线性趋势值（statistical 类 B4 批次） */

const TSV = '月份\t销量\n1\t100\n2\t120\n3\t141\n4\t158\n5\t180';

const trendEntry: FunctionEntry = {
  id: 'trend',
  enName: 'TREND',
  zhName: '线性趋势值',
  zhCommon: ['趋势值', 'TREND', '线性拟合值'],
  alias: ['回归拟合值', '趋势线取值', '批量预测'],
  category: 'statistical',
  abbr: 'xxqsz',
  pinyin: 'xianxingqushizhi',
  keywords: ['TREND', '趋势值', '线性拟合', '批量预测', '数组公式'],
  difficulty: 4,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '结果为数组；Microsoft 365 自动溢出，2019 及更早需选中区域后按 Ctrl+Shift+Enter。',
  },
  oneLiner: '按线性趋势一次算出多个 x 对应的 y（拟合值/预测值）',
  summary:
    'TREND 是 FORECAST.LINEAR 的「批量版」：一次给出一组 x 对应的拟合值。两种典型用法：① 填「拟合值」列，把实际值与拟合值画在一张图上看趋势线；② 一次预测未来若干期。它是数组函数，Microsoft 365 会自动溢出，旧版需先选中区域再按 Ctrl+Shift+Enter。',
  syntax: {
    patternCn: '=TREND(已知的y, [已知的x], [新的x], [强制截距为0])',
    patternEn: '=TREND(known_y\'s, [known_x\'s], [new_x\'s], [const])',
    args: [
      {
        key: 'known_y\'s',
        zh: '已知的y',
        en: 'known_y\'s',
        required: true,
        desc: '已有的因变量观测值。',
        accepts: '单元格区域，如 B2:B6。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 与 FORECAST.LINEAR 不同，TREND 是 y 在最前。',
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
        tip: '做时间序列预测（等间隔）时可省略，Excel 自动用序号。',
        example: 'A2:A6',
      },
      {
        key: 'new_x\'s',
        zh: '新的x',
        en: 'new_x\'s',
        required: false,
        desc: '要预测的那些新 x 值。',
        accepts: '单元格区域，如 A7:A9（未来 3 期）。',
        ifOmitted: '省略时返回 known_y\'s 对应的拟合值（用于画趋势线）。',
        tip: '省略它就是「求历史数据的拟合值」，常用来画趋势线对比。',
        example: 'A7:A9',
      },
      {
        key: 'const',
        zh: '强制截距为0',
        en: 'const',
        required: false,
        desc: 'TRUE（默认）正常计算截距；FALSE 强制截距为 0。',
        accepts: 'TRUE / FALSE 或 1 / 0。',
        ifOmitted: '默认 TRUE，即正常拟合截距。',
        tip: '除非有明确理论要求「过原点」，否则保持默认。',
        example: 'TRUE',
      },
    ],
  },
  returnValue: '返回一组线性趋势拟合值（数组）；数据个数不匹配返回 #REF! 或 #VALUE!。',
  examples: [
    {
      title: '示例 1：一次预测未来 3 期',
      scene: '有 5 个月销量，想预测第 6、7、8 月。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TREND(B2:B6,A2:A6,{6;7;8})',
      result: '约 200、220、240（按每月约 +20 的线性趋势）',
      explanation: '一次给出三个预测值。Microsoft 365 下自动向下溢出；旧版需先选中 3 个单元格再按 Ctrl+Shift+Enter。',
    },
    {
      title: '示例 2：省略 new_x 求历史拟合值（画趋势线）',
      scene: '想在同一张图里画出实际值与趋势线，需要每个月的拟合值。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TREND(B2:B6,A2:A6)',
      result: '5 个拟合值（如 102、121、140、159、178）',
      explanation: '这些拟合值与实际值非常接近，画成折线就是趋势线，可直观看出哪些月份偏离了趋势。',
    },
    {
      title: '示例 3：等间隔序列可省略 known_x',
      scene: '数据是按月等间隔排列的，不想再单独准备 x 列。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TREND(B2:B6)',
      result: '与示例 2 相同（Excel 自动用 1、2、3、4、5 作为 x）',
      explanation: '等间隔时间序列可以省掉 x 参数，公式更简洁。',
    },
  ],
  pitfalls: [
    {
      title: '参数顺序与 FORECAST.LINEAR 不同',
      reason: 'TREND 是 (known_y\'s, known_x\'s, new_x\'s)，y 在前；FORECAST.LINEAR 是 (x, known_y\'s, known_x\'s)，x 在最前。',
      fix: '写完先用一个已知点验证，别把两个函数的参数顺序记混。',
      level: 'high',
    },
    {
      title: '旧版 Excel 直接回车只得到第一个值',
      reason: '它是数组函数，需按 Ctrl+Shift+Enter 确认。',
      fix: '先选中输出区域，输入公式后按 Ctrl+Shift+Enter；Microsoft 365 会自动溢出。',
      level: 'high',
    },
    {
      title: '外推过远',
      reason: '线性趋势不会自动饱和，推得越远越不可信。',
      fix: '预测期数控制在已有数据的 1/3 以内，并结合业务规律修正。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'forecast-linear',
      kind: 'confusable',
      why: '两者都做线性预测，但参数顺序不同、TREND 可一次返回多个值。单个预测用 FORECAST.LINEAR，批量用 TREND。',
    },
    {
      id: 'growth',
      kind: 'alternative',
      why: '数据呈指数增长（而非线性）时改用 GROWTH。',
    },
    {
      id: 'linest',
      kind: 'companion',
      why: 'LINEST 给出斜率和截距，可用来核对 TREND 的拟合结果。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'B2:B6', known_xs: 'A2:A6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'B2:B6' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'A2:A6' },
      { key: 'new_x', label: '新的 x', type: 'number', default: '6' },
    ],
    template: '=TREND({known_ys},{known_xs},{new_x})',
    cases: [
      { label: '预测第6期', type: 'ok', values: { known_ys: 'B2:B6', known_xs: 'A2:A6', new_x: '6' }, expect: '199.2', note: '简化拟合值' },
      { label: 'y 区域无数字', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'A2:A6', new_x: '6' }, expect: '#N/A', note: '行数不匹配' },
      { label: 'x 区域非法', type: 'error', values: { known_ys: 'B2:B6', known_xs: 'ZZZ', new_x: '6' }, expect: '#REF!', note: '非法区域' },
      { label: 'new_x 非数字', type: 'error', values: { known_ys: 'B2:B6', known_xs: 'A2:A6', new_x: 'abc' }, expect: '#VALUE!', note: 'new_x 必须数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default trendEntry;
