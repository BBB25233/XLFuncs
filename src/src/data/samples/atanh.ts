import type { FunctionEntry } from '@/types';

/** ATANH · 反双曲正切（math 类 B2 批次） */

const TSV = '数值\n0\n0.5\n0.9\n-0.5';

const atanhEntry: FunctionEntry = {
  id: 'atanh',
  enName: 'ATANH',
  zhName: '反双曲正切',
  zhCommon: ['反双曲正切', 'atanh', '双曲反函数'],
  alias: ['反双曲函数', 'artanh', 'Fisher变换'],
  category: 'math',
  abbr: 'fsqzq',
  pinyin: 'fanshuangquzhengqie',
  keywords: ['ATANH', '反双曲正切', 'Fisher变换', '相关系数变换', '输入需在±1内'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'Excel 2010 及更早版本没有此函数，可用 0.5*LN((1+x)/(1-x)) 手写替代。',
  },
  oneLiner: '已知双曲正切值，反推出原数值（输入必须在 -1 到 1 之间，不含 ±1）',
  summary:
    'TANH 的反向函数。因为 TANH 的取值永远在 -1 到 1 之间且取不到端点，所以 ATANH 的输入也必须严格落在 -1 与 1 之间（不含 ±1），否则报 #NUM!。它最著名的用途是统计里的 **Fisher z 变换**：把相关系数 r 变换成近似正态分布的值，用于计算相关系数的置信区间。',
  syntax: {
    patternCn: '=ATANH(数值)',
    patternEn: '=ATANH(number)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '严格大于 -1 且严格小于 1 的实数。',
        accepts: '数字、单元格引用，如相关系数 r。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 不能等于 ±1，因为 TANH 永远取不到端点值。',
        example: '0.5',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回使 TANH(y) = 数值 成立的 y 值（任意实数）；输入越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：与 TANH 互为反向（验证）',
      scene: '先 TANH 再 ATANH，确认能还原原值。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ATANH(TANH(A4))',
      result: '-0.5（A4 是 -0.5，TANH(-0.5)≈-0.4621，ATANH 还原回 -0.5）',
      explanation: '正向再反向应还原原值，负数同样成立（它是奇函数）。',
    },
    {
      title: '示例 2：Fisher z 变换（相关系数的标准处理）',
      scene: '算得两组数据的相关系数 r=0.6，要做显著性检验，需先做 Fisher z 变换。',
      dataTsv: '相关系数r\t样本量n\n0.6\t30\n0.85\t50\n0.2\t25',
      dataAnchor: 'A1',
      formula: '=ATANH(A2)',
      result: '0.6931（r=0.6 的 z 值）；r=0.85 → 1.2555；r=0.2 → 0.2027',
      explanation:
        'z = ATANH(r) 后，z 近似服从正态分布，标准误为 1/√(n−3)，可据此算置信区间。变换后再用 TANH 变回 r 即可。',
    },
    {
      title: '示例 3：输入等于 1 时报错',
      scene: '相关系数为 1（完全相关）时公式报错。',
      dataTsv: '相关系数r\n1\n0.99\n-1',
      dataAnchor: 'A1',
      formula: '=ATANH(A2)',
      result: '#NUM!（r=1 越界）；0.99 → 2.6467；-1 同样 #NUM!',
      explanation:
        '数学上 ATANH(1) 趋向无穷，无定义。实际数据里 r=±1 通常意味着样本量太小或两列完全线性相关，需回头检查数据。',
    },
  ],
  pitfalls: [
    {
      title: '输入等于或超过 ±1',
      reason: 'TANH 永远取不到 ±1，所以 ATANH 在 ±1 处无定义（数学上趋向无穷）。',
      fix: '检查数据：相关系数恰为 ±1 通常说明样本过少或两列完全线性相关，应先核实数据再变换。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '在 Excel 2010 及更早版本中使用',
      reason: '该函数 Excel 2013 才加入。',
      fix: '升级 Excel，或改用 =0.5*LN((1+x)/(1-x))。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '忘记变换后还要变回去',
      reason: 'Fisher z 变换后得到的是 z 值空间的结果，直接当相关系数解读会偏大。',
      fix: '在区间端点上用 TANH 变回 r 空间再报告：=TANH(z ± 1.96*标准误)。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'tanh',
      kind: 'companion',
      why: 'TANH 正向、ATANH 反向；Fisher 变换中两者成对使用。',
    },
    {
      id: 'asinh',
      kind: 'companion',
      why: '同族反双曲函数，ASINH 输入无限制、ATANH 输入需在 ±1 内。',
    },
    {
      id: 'atan',
      kind: 'confusable',
      why: '名字只差一个 H：ATAN 输入任意实数、输出 ±90° 内；ATANH 输入需在 ±1 内、输出任意实数。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '0.5', placeholder: '如 0.5', hint: '必须严格在 (-1,1)' },
    ],
    template: '=ATANH(A2)',
    cases: [
      { label: '反双曲正切 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'atanh(0)=0' },
      { label: '反双曲正切 0.5', type: 'ok', values: { number: '0.5' }, expect: '0.549306', note: 'atanh(0.5)≈0.549306' },
      { label: '等于 1', type: 'error', values: { number: '1' }, expect: '#NUM!', note: '|x| 必须 < 1' },
      { label: '参数非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default atanhEntry;
