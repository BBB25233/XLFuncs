import type { FunctionEntry } from '@/types';

/** SKEW · 偏度（statistical 类 B3 批次） */

const TSV = '员工\t月薪\n1\t8000\n2\t8500\n3\t9000\n4\t9500\n5\t10000\n6\t60000';

const skewEntry: FunctionEntry = {
  id: 'skew',
  enName: 'SKEW',
  zhName: '偏度',
  zhCommon: ['偏度', 'SKEW', '分布偏斜'],
  alias: ['偏态', '左偏右偏', '不对称程度'],
  category: 'statistical',
  abbr: 'pd',
  pinyin: 'piandu',
  keywords: ['SKEW', '偏度', '偏态', '右偏', '左偏', '分布形状'],
  difficulty: 4,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'Excel 2013 起另有 SKEW.P（总体偏度），SKEW 为样本口径。',
  },
  oneLiner: '衡量数据分布是否对称、往哪边拖尾巴',
  summary:
    '偏度描述分布的对称程度：约等于 0 表示基本对称（如正态分布）；**大于 0 表示右偏**——少数极大的值把右侧尾巴拉长（典型如收入、房价、响应时间）；小于 0 表示左偏（少数极小值拖左侧尾巴）。它的实用价值在于提醒你「这组数据不适合直接用均值和标准差描述」，该改用中位数和分位数。',
  syntax: {
    patternCn: '=SKEW(数字1, [数字2], …)',
    patternEn: '=SKEW(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个数字或区域。',
        accepts: '单元格区域、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '至少需要 3 个数字，否则报 #DIV/0!。',
        example: 'B2:B7',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '数字2',
        en: 'number2',
        required: false,
        desc: '后续数字或区域，可继续追加。',
        accepts: '同「数字1」。',
        ifOmitted: '不写就只用第一个参数。',
        tip: '建议样本量不少于 20 个，少于 10 个时偏度极不稳定。',
        example: 'C2:C7',
      },
    ],
  },
  returnValue: '返回偏度系数：>0 右偏、≈0 对称、<0 左偏；数据少于 3 个或标准差为 0 返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：收入数据的右偏',
      scene: '6 名员工月薪，其中一人远高于其他人。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SKEW(B2:B7)',
      result: '约 2.24（明显右偏）',
      explanation:
        '6 万那一个高值把右尾拉得很长，偏度远大于 0。这类数据用「平均月薪」汇报会明显高于大多数人的实际感受。',
    },
    {
      title: '示例 2：偏度大时改用中位数汇报',
      scene: '同样这组数据，比较均值与中位数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=MEDIAN(B2:B7)',
      result: '9250（而 AVERAGE 约 17500）',
      explanation:
        '偏度为正且较大时，均值被右尾抬高到 17500，中位数 9250 才代表中间水平。这正是偏度指标提醒我们做的事。',
    },
    {
      title: '示例 3：数据少于 3 个时报错',
      scene: '只有 2 个数，无法计算偏度。',
      dataTsv: '数值\n10\n20',
      dataAnchor: 'A1',
      formula: '=SKEW(A2:A3)',
      result: '#DIV/0!（至少需要 3 个数据）',
      explanation: '偏度公式需要至少 3 个点且标准差不为 0，否则无法计算。',
    },
  ],
  pitfalls: [
    {
      title: '样本量太小时偏度极不可靠',
      reason: '偏度对个别极端值非常敏感，小样本下数值波动剧烈，几乎没有参考价值。',
      fix: '样本不少于 20 个再解读偏度；样本少于 10 个时，直接画个直方图看分布更靠谱。',
      level: 'high',
    },
    {
      title: '把偏度正负方向理解反',
      reason: '正值代表右偏（右侧长尾、少数极大值），不是「数据偏小」。',
      fix: '记口诀：正 = 右偏 = 有少数特别大的值（收入型数据）。',
      level: 'high',
    },
    {
      title: '数据少于 3 个或全部相同时报 #DIV/0!',
      reason: '公式分母含标准差的幂次，标准差为 0 或样本不足时无法计算。',
      fix: '补充数据；全相同的数据本身没有分布形状可言。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'kurt',
      kind: 'companion',
      why: '偏度看对称性、峰度看尾巴厚薄，两者一起描述分布形状。',
    },
    {
      id: 'median',
      kind: 'companion',
      why: '偏度明显不为 0 时，应改用中位数与分位数来描述中心与离散。',
    },
    {
      id: 'stdev-s',
      kind: 'companion',
      why: '偏度大时标准差也会被极端值放大，需谨慎解读。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B7' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B7' },
    ],
    template: '=SKEW({array})',
    cases: [
      { label: '收入右偏', type: 'ok', values: { array: 'B2:B7' }, expect: '2.443143', note: '右偏' },
      { label: '数据不足3个', type: 'error', values: { array: 'B2:B3' }, expect: '#DIV/0!', note: 'n<3' },
      { label: '无数字区域', type: 'error', values: { array: 'A1' }, expect: '#DIV/0!', note: '表头文本列' },
      { label: '区域非法', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default skewEntry;
