import type { FunctionEntry } from '@/types';

/** LINEST · 线性回归参数（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const linestEntry: FunctionEntry = {
  id: 'linest',
  enName: 'LINEST',
  zhName: '线性回归参数',
  zhCommon: ['LINEST', '回归参数', '线性拟合参数'],
  alias: ['最小二乘参数', '回归统计量', '斜截距统计'],
  category: 'statistical',
  abbr: 'xxhgcs',
  pinyin: 'xianxinghuiguicanshu',
  keywords: ['LINEST', '回归参数', '最小二乘', '统计量', '数组公式', '多元回归'],
  difficulty: 5,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '结果为数组；Microsoft 365 自动溢出，2019 及更早需选中区域后按 Ctrl+Shift+Enter。',
  },
  oneLiner: '用最小二乘法一次返回回归的斜率、截距及一组统计量',
  summary:
    'LINEST 是 Excel 里最完整的线性回归函数：默认返回 1 行 2 列（斜率、截距）；把第四参数设为 TRUE 则返回 5 行，额外给出标准误、R²、F 统计量、自由度、回归平方和与残差平方和。它还能做**多元回归**（x 区域给多列即可）。缺点是结果是数组、读起来不直观，日常只要斜率/截距/预测值时，用 SLOPE/INTERCEPT/FORECAST.LINEAR 更简单。',
  syntax: {
    patternCn: '=LINEST(已知的y, [已知的x], [强制截距为0], [返回附加统计量])',
    patternEn: '=LINEST(known_y\'s, [known_x\'s], [const], [stats])',
    args: [
      {
        key: 'known_y\'s',
        zh: '已知的y',
        en: 'known_y\'s',
        required: true,
        desc: '因变量的一组观测值。',
        accepts: '单元格区域，如 C2:C6。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ y 在前、x 在后。',
        example: 'C2:C6',
        pitfallRank: 1,
      },
      {
        key: 'known_x\'s',
        zh: '已知的x',
        en: 'known_x\'s',
        required: false,
        desc: '自变量区域；给多列就是多元回归。',
        accepts: '单列区域如 B2:B6，或多列区域如 B2:C6。',
        ifOmitted: '省略时按 1、2、3… 的自然序列处理。',
        tip: '多列 = 多元回归；默认单列 = 一元回归。',
        example: 'B2:B6',
      },
      {
        key: 'const',
        zh: '强制截距为0',
        en: 'const',
        required: false,
        desc: 'TRUE（默认）正常计算截距；FALSE 强制截距为 0。',
        accepts: 'TRUE / FALSE。',
        ifOmitted: '默认 TRUE。',
        tip: '除非有理论要求「过原点」，保持默认。',
        example: 'TRUE',
      },
      {
        key: 'stats',
        zh: '返回附加统计量',
        en: 'stats',
        required: false,
        desc: 'FALSE（默认）只返回斜率与截距；TRUE 返回 5 行完整统计量。',
        accepts: 'TRUE / FALSE。',
        ifOmitted: '默认 FALSE。',
        tip: '需要 R²、标准误、F 统计量时设为 TRUE，并选中 5 行区域。',
        example: 'TRUE',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回回归参数数组；stats=TRUE 时为 5 行（含 R²、标准误、F、自由度、平方和）。',
  examples: [
    {
      title: '示例 1：只要斜率与截距',
      scene: '想一次拿到回归方程的两个参数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LINEST(C2:C6,B2:B6)',
      result: '约 {10.4, -6}（斜率 10.4、截距 -6）',
      explanation: '结果是一行两列：先斜率后截距（注意顺序是反的）。与 SLOPE、INTERCEPT 结果一致。',
    },
    {
      title: '示例 2：取完整统计量（含 R²）',
      scene: '做回归分析需要 R²、标准误、F 值等。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LINEST(C2:C6,B2:B6,TRUE,TRUE)',
      result: '5 行 × 2 列：斜率和截距、各自标准误、R² 与 y 标准误、F 与自由度、回归平方和与残差平方和',
      explanation: '需选中 5 行 2 列区域（Microsoft 365 自动溢出）。第三行第一列就是 R²。',
    },
    {
      title: '示例 3：多元回归（两个自变量）',
      scene: '销售额同时受广告费和促销力度影响。',
      dataTsv: '广告费\t促销\t销售额\n10\t2\t100\n20\t3\t180\n30\t5\t290\n40\t4\t380\n50\t7\t520',
      dataAnchor: 'A1',
      formula: '=LINEST(C2:C6,A2:B6)',
      result: '三个系数（促销的系数、广告费的系数、截距）',
      explanation: 'x 区域给多列即为多元回归。注意返回的系数顺序与 x 列的顺序**相反**。',
    },
  ],
  pitfalls: [
    {
      title: '结果顺序与直觉相反',
      reason: '一元回归返回 {斜率, 截距}；多元回归的系数顺序与 x 列的顺序相反（最右列的系数在最前）。',
      fix: '读结果时务必对照顺序，或用 INDEX 明确取出对应位置的值。',
      level: 'high',
    },
    {
      title: 'stats=TRUE 却只选了 1 行输出区域',
      reason: '5 行统计量会被截断，只显示第一行。',
      fix: '选中 5 行 ×（自变量数+1）列的区域；Microsoft 365 自动溢出则无需操心。',
      level: 'high',
    },
    {
      title: '旧版 Excel 直接回车只得到第一个值',
      reason: '数组函数需 Ctrl+Shift+Enter。',
      fix: '选中输出区域后按 Ctrl+Shift+Enter；Microsoft 365 自动溢出。',
      level: 'high',
    },
  ],
  related: [
    {
      id: 'slope',
      kind: 'alternative',
      why: '只要斜率时用 SLOPE 更简单直观，不必处理数组结果。',
    },
    {
      id: 'logest',
      kind: 'companion',
      why: 'LOGEST 是指数回归版本的 LINEST，数据呈指数增长时用它。',
    },
    {
      id: 'rsq',
      kind: 'companion',
      why: '只要 R² 时用 RSQ 一步到位，不必解析 LINEST 的 5 行结果。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'C2:C6', known_xs: 'B2:B6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'C2:C6', hint: '销售额' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'B2:B6', hint: '广告费' },
    ],
    template: '=LINEST({known_ys},{known_xs})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '10.4', note: '线性回归斜率（已简化，仅返回斜率）' },
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

export default linestEntry;
