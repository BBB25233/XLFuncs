import type { FunctionEntry } from '@/types';

/** PEARSON · 皮尔逊相关系数（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const pearsonEntry: FunctionEntry = {
  id: 'pearson',
  enName: 'PEARSON',
  zhName: '皮尔逊相关系数',
  zhCommon: ['皮尔逊', 'PEARSON', '相关系数'],
  alias: ['积矩相关', 'r值', '线性相关'],
  category: 'statistical',
  abbr: 'pexxgxs',
  pinyin: 'pierxunxiangguanxishu',
  keywords: ['PEARSON', '皮尔逊', '相关系数', 'r值', '线性相关'],
  difficulty: 3,
  usageLevel: 12,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '皮尔逊积矩相关系数——与 CORREL 数学上完全等价',
  summary:
    'PEARSON 与 CORREL 计算的是同一个东西，结果完全相同，只是名字来源不同（PEARSON 来自统计学家的命名，CORREL 是 Excel 的通用命名）。实际使用中二选一即可，多数人用 CORREL。它同样只衡量线性关系，取值 −1 到 1。',
  syntax: {
    patternCn: '=PEARSON(第一组数据, 第二组数据)',
    patternEn: '=PEARSON(array1, array2)',
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
        tip: '⚠️ 两组数据个数必须一致。',
        example: 'C2:C6',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 −1 到 1 之间的皮尔逊相关系数；数据个数不等或标准差为 0 返回 #N/A 或 #DIV/0!。',
  examples: [
    {
      title: '示例 1：算广告费与销售额的相关性',
      scene: '与 CORREL 用同一组数据，验证结果一致。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PEARSON(B2:B6,C2:C6)',
      result: '约 0.9956（与 =CORREL(B2:B6,C2:C6) 完全相同）',
      explanation: '两者数学等价，选一个用即可。',
    },
    {
      title: '示例 2：弱相关的情况',
      scene: '两组数据没什么明显关系。',
      dataTsv: 'x\ty\n1\t5\n2\t2\n3\t8\n4\t3\n5\t6',
      dataAnchor: 'A1',
      formula: '=PEARSON(A2:A6,B2:B6)',
      result: '约 0.199（弱相关）',
      explanation: '接近 0 表示线性关系很弱，不能据此下结论说两者有关联。',
    },
    {
      title: '示例 3：数据个数不一致时报错',
      scene: '两组长度不同。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PEARSON(B2:B6,C2:C5)',
      result: '#N/A（长度不一致）',
      explanation: '必须一一对应，检查区域范围。',
    },
  ],
  pitfalls: [
    {
      title: '以为它和 CORREL 是两个不同的指标',
      reason: '两者数学公式相同、结果完全一致，只是命名不同，没必要同时算两遍。',
      fix: '任选其一（推荐 CORREL），保持报表口径统一即可。',
      level: 'mid',
    },
    {
      title: '把相关当因果 / 忽略非线性关系',
      reason: '与 CORREL 相同的局限：只反映线性相关，且不证明因果。',
      fix: '先画散点图看形状；因果需结合业务机理或实验验证。',
      level: 'high',
    },
    {
      title: '两组数据个数不等或某组无波动',
      reason: '无法配对或除数为 0。',
      fix: '核对区域行数一致，且两组都有变化。',
      level: 'high',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'correl',
      kind: 'companion',
      why: '两者数学等价、结果相同，实际二选一即可（多数人用 CORREL）。',
    },
    {
      id: 'rsq',
      kind: 'companion',
      why: 'RSQ = 相关系数的平方，表示可解释的波动比例。',
    },
    {
      id: 'covariance-s',
      kind: 'companion',
      why: '协方差是相关系数的分子来源，但数值受量纲影响，不如相关系数好解释。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array1: 'B2:B6', array2: 'C2:C6' },
    fields: [
      { key: 'array1', label: '第一组数据', type: 'ref', default: 'B2:B6', hint: '广告费' },
      { key: 'array2', label: '第二组数据', type: 'ref', default: 'C2:C6', hint: '销售额' },
    ],
    template: '=PEARSON({array1},{array2})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '0.995591', note: 'PEARSON 与 CORREL 等价' },
      { label: '两组数据个数不一致', type: 'error', values: { array1: 'B2:B6', array2: 'C2:C5' }, expect: '#N/A', note: 'y 与 x 行数不同 → #N/A' },
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

export default pearsonEntry;
