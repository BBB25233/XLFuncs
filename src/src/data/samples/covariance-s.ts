import type { FunctionEntry } from '@/types';

/** COVARIANCE.S · 样本协方差（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const covarianceSEntry: FunctionEntry = {
  id: 'covariance-s',
  enName: 'COVARIANCE.S',
  zhName: '样本协方差',
  zhCommon: ['样本协方差', 'COVARIANCE.S', '协方差'],
  alias: ['共同波动', '协同变化', '协变'],
  category: 'statistical',
  abbr: 'ybxfc',
  pinyin: 'yangbenxiefangcha',
  keywords: ['COVARIANCE.S', '协方差', '样本', '共同波动', '相关性基础'],
  difficulty: 4,
  usageLevel: 6,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 COVAR（新版保留为兼容性函数，但为总体口径）。',
  },
  oneLiner: '衡量两组数据是否朝同一方向波动（样本口径，除以 n−1）',
  summary:
    '协方差为正表示两组数据同向波动（一个高出均值时另一个也高），为负表示反向。但它的**数值受量纲影响**：同样是强相关，用「元」和用「万元」算出来的协方差差一万倍，无法直接判断强弱。所以实际分析中几乎总是用**相关系数**（CORREL）——它把协方差标准化到了 −1～1。协方差主要作为理论中间量出现，也是投资组合风险计算的基础。',
  syntax: {
    patternCn: '=COVARIANCE.S(第一组数据, 第二组数据)',
    patternEn: '=COVARIANCE.S(array1, array2)',
    args: [
      {
        key: 'array1',
        zh: '第一组数据',
        en: 'array1',
        required: true,
        desc: '第一组数值。',
        accepts: '单元格区域，如 B2:B6。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '文本、逻辑值、空格会被忽略。',
        example: 'B2:B6',
        pitfallRank: 2,
      },
      {
        key: 'array2',
        zh: '第二组数据',
        en: 'array2',
        required: true,
        desc: '第二组数值，个数必须与第一组相同。',
        accepts: '单元格区域，如 C2:C6。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 两组个数必须一致，否则报 #N/A。',
        example: 'C2:C6',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回样本协方差（可正可负，量纲为两变量单位的乘积）；个数不等返回 #N/A。',
  examples: [
    {
      title: '示例 1：广告费与销售额的协方差',
      scene: '看两组数据的共同波动方向与大小。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COVARIANCE.S(B2:B6,C2:C6)',
      result: '约 2600（正值，说明同向波动）',
      explanation: '正号表示广告费高于均值时销售额也倾向于高于均值。但 2600 这个数本身看不出「强不强」。',
    },
    {
      title: '示例 2：数值受量纲影响（换成万元就变了）',
      scene: '把销售额换算成万元（除以 10）后再算。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COVARIANCE.S(B2:B6,C2:C6/10)',
      result: '约 260（缩小到 1/10，但相关强度其实没变）',
      explanation:
        '这正是协方差的短板：单位一变数值就变。要判断强弱必须用相关系数 CORREL（本例恒为 0.9956）。',
    },
    {
      title: '示例 3：两组个数不等时报错',
      scene: '长度不一致。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COVARIANCE.S(B2:B6,C2:C5)',
      result: '#N/A（长度不一致）',
      explanation: '两组数据必须一一对应。',
    },
  ],
  pitfalls: [
    {
      title: '拿协方差数值判断相关强弱',
      reason: '数值受量纲影响极大，换个单位就完全不同，无法跨场景比较。',
      fix: '判断强弱一律用 CORREL（相关系数）；协方差只用于看方向或做理论计算。',
      level: 'high',
    },
    {
      title: '与 COVARIANCE.P 混淆',
      reason: '两者只差样本（n−1）与总体（n）口径，数值略有差异。',
      fix: '抽样数据用 .S，全量数据用 .P。',
      level: 'mid',
    },
    {
      title: '两组数据个数不等',
      reason: '无法一一配对。',
      fix: '核对两个区域的行数一致。',
      level: 'high',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'covariance-p',
      kind: 'confusable',
      why: '两者只差样本/总体口径（n−1 vs n），抽样用 .S、全量用 .P。',
    },
    {
      id: 'correl',
      kind: 'companion',
      why: '相关系数就是协方差除两者标准差之积，标准化后便于判断强弱，实际分析首选 CORREL。',
    },
    {
      id: 'var-s',
      kind: 'companion',
      why: '协方差是方差的推广：两组数据相同时，协方差就等于方差。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array1: 'B2:B6', array2: 'C2:C6' },
    fields: [
      { key: 'array1', label: '第一组数据', type: 'ref', default: 'B2:B6', hint: '广告费' },
      { key: 'array2', label: '第二组数据', type: 'ref', default: 'C2:C6', hint: '销售额' },
    ],
    template: '=COVARIANCE.S({array1},{array2})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '2600', note: '样本协方差，除以 n-1=4' },
      { label: '两组个数不一致', type: 'error', values: { array1: 'B2:B6', array2: 'C2:C5' }, expect: '#N/A', note: '行数不同 → #N/A' },
      { label: '区域非法 B:B', type: 'error', values: { array1: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { array1: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default covarianceSEntry;
