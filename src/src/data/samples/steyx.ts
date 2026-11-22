import type { FunctionEntry } from '@/types';

/** STEYX · 预测标准误差（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const steyxEntry: FunctionEntry = {
  id: 'steyx',
  enName: 'STEYX',
  zhName: '预测标准误差',
  zhCommon: ['预测标准误差', 'STEYX', '回归残差'],
  alias: ['残差标准差', '预测误差', '回归误差'],
  category: 'statistical',
  abbr: 'ycbzwc',
  pinyin: 'yucebiaozhunwucha',
  keywords: ['STEYX', '预测标准误差', '残差', '回归精度', '预测区间'],
  difficulty: 5,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '衡量回归预测的误差有多大（残差的标准差）',
  summary:
    'STEYX 回答「用这条回归线做预测，典型会偏多少」。数值越小说明数据点越贴近拟合线、预测越准；数值越大说明离散越严重。它的实用价值是给出**预测的不确定范围**：经验上约 95% 的真实值会落在「预测值 ± 2×STEYX」之内。R² 高不代表预测误差小（还要看 y 本身的量级），所以两者要一起看。',
  syntax: {
    patternCn: '=STEYX(已知的y, 已知的x)',
    patternEn: '=STEYX(known_y\'s, known_x\'s)',
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
  returnValue: '返回回归预测的标准误差（残差标准差）；数据个数不等或不足返回 #N/A 或 #DIV/0!。',
  examples: [
    {
      title: '示例 1：评估预测的典型偏差',
      scene: '用广告费预测销售额，想知道预测通常偏多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STEYX(C2:C6,B2:B6)',
      result: '约 17.89（即预测值典型偏差约 ±17.89）',
      explanation: '配合 FORECAST 的预测值，可给出「实际值大概在预测值 ±17.89 附近」的判断。',
    },
    {
      title: '示例 2：构造约 95% 的预测区间',
      scene: '想给出一个有参考价值的预测范围，而不是一个孤零零的数字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FORECAST.LINEAR(60,C2:C6,B2:B6)',
      result: '约 606（x=60 时的预测值）',
      explanation:
        '经验做法：预测区间 ≈ 606 ± 2×17.89，即约 570～642。汇报预测时给区间比给单点更专业。',
    },
    {
      title: '示例 3：数据点太少时结果不可靠',
      scene: '只有 3 个点，算出的误差没有参考价值。',
      dataTsv: 'x\ty\n1\t10\n2\t20\n3\t30',
      dataAnchor: 'A1',
      formula: '=STEYX(B2:B4,A2:A4)',
      result: '接近 0（三点几乎共线，但样本太少不足以外推）',
      explanation: '样本量太小时残差被低估，预测误差会被严重乐观化。建议至少 10–20 组数据。',
    },
  ],
  pitfalls: [
    {
      title: '只看 R² 不看 STEYX',
      reason: 'R² 是相对比例，与 y 的量级无关；即使 R² 很高，绝对误差仍可能大到业务上无法接受。',
      fix: '两个指标一起看：R² 看解释力、STEYX 看实际误差大小，并对照 y 的量级判断能否接受。',
      level: 'high',
    },
    {
      title: '样本量太小导致误差被严重低估',
      reason: '点太少时拟合线容易穿过所有点，残差接近 0，看起来「预测极准」，实则不可外推。',
      fix: '建议 10–20 组以上数据；样本少时不要轻易给出预测区间。',
      level: 'high',
    },
    {
      title: '参数顺序写反或两组个数不等',
      reason: '要求 (known_y\'s, known_x\'s) 且一一对应。',
      fix: '牢记先 y 后 x，并核对区域行数一致。',
      level: 'high',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'forecast-linear',
      kind: 'companion',
      why: 'FORECAST.LINEAR 给点预测、STEYX 给误差范围，两者结合才能给出有价值的预测区间。',
    },
    {
      id: 'rsq',
      kind: 'companion',
      why: 'R² 看解释力比例，STEYX 看绝对误差，需结合判断。',
    },
    {
      id: 'slope',
      kind: 'companion',
      why: '同属一元线性回归的配套指标。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'C2:C6', known_xs: 'B2:B6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'C2:C6' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'B2:B6' },
    ],
    template: '=STEYX({known_ys},{known_xs})',
    cases: [
      { label: '预测标准误差', type: 'ok', values: { known_ys: 'C2:C6', known_xs: 'B2:B6' }, expect: '17.888544', note: '残差标准差' },
      { label: '两组个数不一致', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'B2:B5' }, expect: '#N/A', note: '行数不等' },
      { label: 'y 区域非法', type: 'error', values: { known_ys: 'ZZZ', known_xs: 'B2:B6' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default steyxEntry;
