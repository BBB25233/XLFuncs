import type { FunctionEntry } from '@/types';

/** DEVSQ · 离差平方和（statistical 类 B3 批次） */

const TSV = '样本\t测量值\n1\t100\n2\t102\n3\t98\n4\t101\n5\t99';

const devsqEntry: FunctionEntry = {
  id: 'devsq',
  enName: 'DEVSQ',
  zhName: '离差平方和',
  zhCommon: ['离差平方和', 'DEVSQ', '偏差平方和'],
  alias: ['各值减均值再平方', '平方偏差和', 'SS'],
  category: 'statistical',
  abbr: 'lcpfh',
  pinyin: 'lichapingfanghe',
  keywords: ['DEVSQ', '离差平方和', '偏差平方', '方差分析', '离散程度'],
  difficulty: 4,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '每个数减去平均值、平方，再全部加起来',
  summary:
    'DEVSQ = Σ(x − 均值)²，是所有离散指标的共同「原料」：把它除以 n 就是总体方差（VAR.P）、除以 n−1 就是样本方差（VAR.S）。做方差分析（ANOVA）、回归的平方和分解时，它是绕不开的基础量。日常单独用它汇报意义不大（数值随样本量线性增大），主要出现在统计推导和方差分解的公式里。',
  syntax: {
    patternCn: '=DEVSQ(数字1, [数字2], …)',
    patternEn: '=DEVSQ(number1, [number2], …)',
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
  returnValue: '返回各数值与均值之差的平方和。',
  examples: [
    {
      title: '示例 1：算离差平方和',
      scene: '5 个测量值，算它们相对均值的离散平方和。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DEVSQ(B2:B6)',
      result: '10（均值 100，各偏差为 0、2、−2、1、−1，平方和为 0+4+4+1+1 = 10）',
      explanation: '先算均值 100，再对每个值求偏差、平方、求和，得到 10。',
    },
    {
      title: '示例 2：由它推出方差与标准差',
      scene: '验证 DEVSQ 与 VAR.P / VAR.S 的关系。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DEVSQ(B2:B6)/COUNT(B2:B6)',
      result: '2（等于 VAR.P；若除以 COUNT−1 得 2.5，即 VAR.S）',
      explanation: 'DEVSQ ÷ n = VAR.P，DEVSQ ÷ (n−1) = VAR.S。这组恒等式可用来交叉验证统计结果。',
    },
    {
      title: '示例 3：所有值相同时结果为 0',
      scene: '5 个数完全一样，没有任何离散。',
      dataTsv: '数值\n50\n50\n50\n50\n50',
      dataAnchor: 'A1',
      formula: '=DEVSQ(A2:A6)',
      result: '0（每个值都等于均值，偏差全为 0）',
      explanation: '结果为 0 表示数据完全一致，这是正常的数学结果。',
    },
  ],
  pitfalls: [
    {
      title: '拿它直接衡量离散程度并跨样本比较',
      reason: '数值会随样本量线性增长：样本越多，平方和天然越大，无法反映「平均波动」。',
      fix: '比较离散程度请改用方差（VAR.S/P）或标准差（STDEV.S/P）；DEVSQ 只用于方差分解等推导场景。',
      level: 'high',
    },
    {
      title: '区域里混入文本导致参与个数与预期不符',
      reason: '文本被忽略，均值与偏差都随之改变，结果静默偏差。',
      fix: '先用 COUNT 核对参与计算的数字个数。',
      level: 'mid',
    },
    {
      title: '期待它返回「平均」意义上的量',
      reason: '它是**和**而不是平均，量纲为原单位平方且随样本增大。',
      fix: '需要平均量时除以 COUNT 或 COUNT−1（对应 VAR.P / VAR.S）。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'var-p',
      kind: 'companion',
      why: 'DEVSQ ÷ n = VAR.P，两者直接换算。',
    },
    {
      id: 'var-s',
      kind: 'companion',
      why: 'DEVSQ ÷ (n−1) = VAR.S，是样本方差的来源。',
    },
    {
      id: 'stdev-s',
      kind: 'alternative',
      why: '要向业务方汇报离散程度，用标准差（开方后量纲一致）比 DEVSQ 直观得多。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'B2:B6' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'B2:B6', hint: '测量值列' },
    ],
    template: '=DEVSQ({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '10', note: '离差平方和 Σ(x−均值)² = 10' },
      { label: '区域非法 B:B', type: 'error', values: { numbers: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { numbers: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
      { label: '区域非法 2:6', type: 'error', values: { numbers: '2:6' }, expect: '#REF!', note: '缺少列标 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default devsqEntry;
