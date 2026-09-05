import type { FunctionEntry } from '@/types';

/** COVARIANCE.P · 总体协方差（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const covariancePEntry: FunctionEntry = {
  id: 'covariance-p',
  enName: 'COVARIANCE.P',
  zhName: '总体协方差',
  zhCommon: ['总体协方差', 'COVARIANCE.P', '全量协方差'],
  alias: ['全量共同波动', '总体协变', 'COVAR新版'],
  category: 'statistical',
  abbr: 'ztxfc',
  pinyin: 'zongtixiefangcha',
  keywords: ['COVARIANCE.P', '总体协方差', '全量', '共同波动', '除以n'],
  difficulty: 4,
  usageLevel: 4,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: '与旧函数 COVAR 口径相同（总体，除以 n），COVAR 保留为兼容性函数。',
  },
  oneLiner: '衡量两组数据的共同波动（总体口径，除以 n）',
  summary:
    'COVARIANCE.P 与 COVARIANCE.S 只差一个除数：前者除以 n（数据即全部），后者除以 n−1（数据为抽样）。因为 n/(n−1) > 1，样本版本数值略大。选择原则与方差/标准差一致：全量数据用 .P，抽样数据用 .S。同样要注意协方差受量纲影响，判断相关强弱请用 CORREL。',
  syntax: {
    patternCn: '=COVARIANCE.P(第一组数据, 第二组数据)',
    patternEn: '=COVARIANCE.P(array1, array2)',
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
        tip: '⚠️ 两组个数必须一致。',
        example: 'C2:C6',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回总体协方差（除以 n）；个数不等返回 #N/A。',
  examples: [
    {
      title: '示例 1：全量数据的协方差',
      scene: '这 5 个月就是全部数据（非抽样），算总体协方差。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COVARIANCE.P(B2:B6,C2:C6)',
      result: '约 2080（正值，同向波动）',
      explanation: '除以 n=5。若改用样本口径 COVARIANCE.S（除以 n−1=4）结果约 2600。',
    },
    {
      title: '示例 2：与样本口径的差别',
      scene: '对比两个版本，确认除数不同带来的差异。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COVARIANCE.S(B2:B6,C2:C6)',
      result: '约 2600（比总体口径的 2080 大）',
      explanation: '2600 ÷ 2080 = 1.25 = 5/4，正好是 n/(n−1)。样本越多，两者越接近。',
    },
    {
      title: '示例 3：个数不等时报错',
      scene: '两组长度不同。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COVARIANCE.P(B2:B6,C2:C5)',
      result: '#N/A（长度不一致）',
      explanation: '必须一一对应。',
    },
  ],
  pitfalls: [
    {
      title: '抽样数据用了总体口径',
      reason: '除以 n 会略微低估共同波动。',
      fix: '抽样用 .S，全量用 .P；与方差/标准差的选择原则一致。',
      level: 'high',
    },
    {
      title: '拿协方差数值判断相关强弱',
      reason: '数值受量纲影响，换个单位就变。',
      fix: '判断强弱用 CORREL。',
      level: 'high',
    },
    {
      title: '两组数据个数不等',
      reason: '无法配对。',
      fix: '核对区域行数一致。',
      level: 'high',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'covariance-s',
      kind: 'confusable',
      why: '两者只差样本/总体口径（n−1 vs n），是最容易选错的一对。',
    },
    {
      id: 'correl',
      kind: 'companion',
      why: '相关强弱一律用 CORREL 判断，协方差只用于看方向或做理论计算。',
    },
    {
      id: 'var-p',
      kind: 'companion',
      why: '两组数据相同时，总体协方差就等于总体方差。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array1: 'B2:B6', array2: 'C2:C6' },
    fields: [
      { key: 'array1', label: '第一组数据', type: 'ref', default: 'B2:B6', hint: '广告费' },
      { key: 'array2', label: '第二组数据', type: 'ref', default: 'C2:C6', hint: '销售额' },
    ],
    template: '=COVARIANCE.P({array1},{array2})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '2080', note: '总体协方差，除以 n=5' },
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

export default covariancePEntry;
