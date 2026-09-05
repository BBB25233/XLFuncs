import type { FunctionEntry } from '@/types';

/** KURT · 峰度（statistical 类 B3 批次） */

const TSV = '样本\t日活\n1\t1000\n2\t1010\n3\t990\n4\t1005\n5\t995\n6\t1002\n7\t1500\n8\t980';

const kurtEntry: FunctionEntry = {
  id: 'kurt',
  enName: 'KURT',
  zhName: '峰度',
  zhCommon: ['峰度', 'KURT', '尖峰厚尾'],
  alias: ['超额峰度', '尾部厚薄', '尖峭程度'],
  category: 'statistical',
  abbr: 'fd',
  pinyin: 'fengdu',
  keywords: ['KURT', '峰度', '超额峰度', '厚尾', '尖峰', '分布形状'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '衡量分布是「尖峰厚尾」还是「平峰薄尾」（正态分布的峰度为 0）',
  summary:
    'Excel 的 KURT 返回的是**超额峰度**：以正态分布为 0 基准。大于 0 说明分布比正态更尖、尾巴更厚（更容易出现极端值）；小于 0 说明更平、尾巴更薄。它和偏度一起用来判断「数据是否近似正态」——很多统计方法（如用均值±2倍标准差估计区间）都以正态为前提，峰度偏离 0 太多时这些方法就不太可靠了。',
  syntax: {
    patternCn: '=KURT(数字1, [数字2], …)',
    patternEn: '=KURT(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个数字或区域。',
        accepts: '单元格区域、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '至少需要 4 个数字。',
        example: 'B2:B9',
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
        tip: '样本量建议不少于 20 个，否则峰度很不稳定。',
        example: 'C2:C9',
      },
    ],
  },
  returnValue: '返回超额峰度（正态=0）；>0 尖峰厚尾、<0 平峰薄尾；数据少于 4 个或标准差为 0 返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：含突增值的日活数据',
      scene: '8 天日活，其中一天突然冲高，看分布的尾部特征。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=KURT(B2:B9)',
      result: '约 7.93（远大于 0，明显尖峰厚尾）',
      explanation:
        '大部分天数集中在 1000 附近，但有一天冲到 1500，形成厚尾。峰度远大于 0 说明「极端值出现的概率比正态假设下更高」。',
    },
    {
      title: '示例 2：均匀分布的数据峰度为负',
      scene: '数据比较均匀地铺开，没有明显集中。',
      dataTsv: '数值\n10\n30\n50\n70\n90\n20\n40\n60\n80',
      dataAnchor: 'A1',
      formula: '=KURT(A2:A10)',
      result: '约 -1.2（平峰薄尾）',
      explanation: '均匀铺开的数据没有中央尖峰，超额峰度为负，尾部也比正态薄。',
    },
    {
      title: '示例 3：数据少于 4 个时报错',
      scene: '只有 3 个数，无法计算峰度。',
      dataTsv: '数值\n10\n20\n30',
      dataAnchor: 'A1',
      formula: '=KURT(A2:A4)',
      result: '#DIV/0!（至少需要 4 个数据）',
      explanation: '峰度公式要求至少 4 个数据点且标准差不为 0。',
    },
  ],
  pitfalls: [
    {
      title: '误以为峰度就是「峰值高低」',
      reason: '峰度实际反映的是**尾部厚薄**（极端值出现概率），尖峰只是伴随现象，核心是尾部风险。',
      fix: '解读时聚焦「是否更容易出现极端值」，而不只是看形状尖不尖。',
      level: 'high',
    },
    {
      title: '样本量太小时数值毫无参考价值',
      reason: '峰度用到四次方，对个别极端值极度敏感，小样本下数值会剧烈跳动。',
      fix: '样本至少 20 个以上再解读；小样本直接看直方图。',
      level: 'high',
    },
    {
      title: '数据少于 4 个或全部相同时报 #DIV/0!',
      reason: '公式需要至少 4 个点且标准差非零。',
      fix: '补充数据；全相同的数据谈不上分布形状。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'skew',
      kind: 'companion',
      why: '偏度看对称性、峰度看尾部厚薄，两者共同判断数据是否近似正态。',
    },
    {
      id: 'stdev-s',
      kind: 'companion',
      why: '峰度偏离 0 时，用「均值 ± 2×标准差」估计区间会低估极端值风险。',
    },
    {
      id: 'percentile-inc',
      kind: 'alternative',
      why: '分布明显非正态时，用分位数（P95/P99）描述尾部比用标准差更可靠。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'B2:B9' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'B2:B9', hint: '日活列' },
    ],
    template: '=KURT({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '7.934586', note: '超额峰度（Excel 口径，右偏厚尾为正）' },
      { label: '数据少于 4 个', type: 'error', values: { numbers: 'B2:B2' }, expect: '#DIV/0!', note: '单格无法算峰度 → #DIV/0!' },
      { label: '区域非法 B:B', type: 'error', values: { numbers: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { numbers: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default kurtEntry;
