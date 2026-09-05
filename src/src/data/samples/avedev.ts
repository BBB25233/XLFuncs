import type { FunctionEntry } from '@/types';

/** AVEDEV · 平均绝对偏差（statistical 类 B3 批次） */

const TSV = '样本\t测量值\n1\t100\n2\t102\n3\t98\n4\t101\n5\t99';

const avedevEntry: FunctionEntry = {
  id: 'avedev',
  enName: 'AVEDEV',
  zhName: '平均绝对偏差',
  zhCommon: ['平均绝对偏差', 'AVEDEV', '平均偏差'],
  alias: ['平均离差', '绝对偏差均值', 'MAD相关'],
  category: 'statistical',
  abbr: 'pjjdpc',
  pinyin: 'pingjunjueduipiancha',
  keywords: ['AVEDEV', '平均绝对偏差', '离差', '离散程度', '绝对偏差'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '每个数减均值取绝对值，再求平均',
  summary:
    'AVEDEV = 平均(|x − 均值|)。与标准差思路相近，但用绝对值而不是平方，所以**不会被少数极端值放大**——数据里有离群点时，它比标准差更稳健，数值也更直观（单位与原数据一致，可理解为「平均来看每个数离均值有多远」）。缺点是数学性质不如方差好，在统计检验里用得少。',
  syntax: {
    patternCn: '=AVEDEV(数字1, [数字2], …)',
    patternEn: '=AVEDEV(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个数字或区域。',
        accepts: '单元格区域、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '文本、逻辑值、空格会被忽略。',
        example: 'B2:B6',
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
        tip: '可一直追加。',
        example: 'C2:C6',
      },
    ],
  },
  returnValue: '返回各数值与均值之差的绝对值的平均数。',
  examples: [
    {
      title: '示例 1：算平均偏差',
      scene: '5 个测量值，看平均每个数离均值多远。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVEDEV(B2:B6)',
      result: '1.2（偏差为 0、2、2、1、1，平均 = 6/5 = 1.2）',
      explanation: '均值 100，各值距均值的距离平均为 1.2，单位仍是「克」，很好解释。',
    },
    {
      title: '示例 2：有离群点时比标准差稳健',
      scene: '数据里混入一个极端值，对比两种指标的反应。',
      dataTsv: '数值\n100\n101\n99\n100\n500',
      dataAnchor: 'A1',
      formula: '=AVEDEV(A2:A6)',
      result: '128（而 STDEV.S 约 178.7）',
      explanation:
        '极端值 500 对标准差的影响（平方放大）明显大于对平均绝对偏差的影响，所以 AVEDEV 更稳健。',
    },
    {
      title: '示例 3：所有值相同时为 0',
      scene: '数据完全一致，没有任何偏差。',
      dataTsv: '数值\n50\n50\n50\n50',
      dataAnchor: 'A1',
      formula: '=AVEDEV(A2:A5)',
      result: '0（每个值都等于均值）',
      explanation: '结果为 0 表示无离散，是正常结果。',
    },
  ],
  pitfalls: [
    {
      title: '把它和标准差混为一谈直接对比数值',
      reason: '两者算法不同（绝对值 vs 平方），数值不具可比性，AVEDEV 通常小于标准差。',
      fix: '同一份报告里固定用一种离散指标；需要抗离群点时选 AVEDEV，需要统计检验时选标准差。',
      level: 'high',
    },
    {
      title: '用它做需要方差的统计推导',
      reason: '绝对值在数学上不可导、性质不如平方和，无法用于方差分析、回归分解。',
      fix: '统计建模请用 DEVSQ / VAR.S / VAR.P；AVEDEV 只用于描述性说明。',
      level: 'mid',
    },
    {
      title: '区域混入文本导致均值偏移',
      reason: '文本被忽略，参与计算的个数与均值都变化。',
      fix: '先用 COUNT 核对有效数字个数。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'stdev-s',
      kind: 'confusable',
      why: '两者都衡量离散程度，但标准差用平方（对极端值敏感）、AVEDEV 用绝对值（更稳健），数值不可直接比较。',
    },
    {
      id: 'devsq',
      kind: 'companion',
      why: 'DEVSQ 是偏差平方和，AVEDEV 是偏差绝对值的平均，同源于「偏差」概念。',
    },
    {
      id: 'median',
      kind: 'companion',
      why: '数据含离群点时，中心用中位数、离散用 AVEDEV，是更稳健的搭配。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'B2:B6' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'B2:B6', hint: '测量值列' },
    ],
    template: '=AVEDEV({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '1.2', note: 'AVEDEV=平均绝对偏差，结果 1.2' },
      { label: '区域写成 B:B（缺行号）', type: 'error', values: { numbers: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域写成 A:B（缺行号）', type: 'error', values: { numbers: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
      { label: '区域写成 2:6（缺列标）', type: 'error', values: { numbers: '2:6' }, expect: '#REF!', note: '缺少列标 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default avedevEntry;
