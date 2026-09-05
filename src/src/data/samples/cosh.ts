import type { FunctionEntry } from '@/types';

/** COSH · 双曲余弦（math 类 B2 批次） */

const TSV = 'x\n0\n1\n2\n-2';

const coshEntry: FunctionEntry = {
  id: 'cosh',
  enName: 'COSH',
  zhName: '双曲余弦',
  zhCommon: ['双曲余弦', 'cosh', '双曲函数'],
  alias: ['悬链线函数', '双曲余弦值', 'cosh曲线'],
  category: 'math',
  abbr: 'sqyx',
  pinyin: 'shuangquyuxian',
  keywords: ['双曲余弦', 'COSH', '双曲函数', '悬链线', '最小值为1'],
  difficulty: 4,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '工程与统计建模使用较多，日常办公很少用到。',
  },
  oneLiner: '算双曲余弦值，等于 (eˣ + e⁻ˣ)/2',
  summary:
    'COSH(x) = (eˣ + e⁻ˣ)/2，是一条以 x=0 为最低点、最小值为 1 的 U 形曲线。它是偶函数：COSH(-x) = COSH(x)，所以左右对称。最著名的应用是悬链线——电线、链条两端固定后自然下垂的形状就是它。日常做表用不到，但在工程建模里是标准工具。',
  syntax: {
    patternCn: '=COSH(数值)',
    patternEn: '=COSH(number)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '任意实数（普通数值，不是弧度）。',
        accepts: '数字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '参数是普通实数，无需 RADIANS 转换。',
        example: 'A2',
      },
    ],
  },
  returnValue: '返回该数值的双曲余弦值，最小值为 1（在 x=0 处），向两侧对称增长。',
  examples: [
    {
      title: '示例 1：基本取值与对称性',
      scene: '看几个典型点，确认「最小值为 1、左右对称」这两个特征。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=COSH(A2)',
      result: 'COSH(0) = 1；COSH(1) ≈ 1.5431；COSH(2) ≈ 3.7622；COSH(-2) ≈ 3.7622',
      explanation: 'x=0 时取最小值 1；正负 x 结果相同（偶函数），这与 SINH 的奇函数性质正好相反。',
    },
    {
      title: '示例 2：用 EXP 验证定义',
      scene: '用自然指数手算一遍，确认 Excel 的 COSH 在算什么。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=(EXP(A4)+EXP(-A4))/2',
      result: '3.7622（与 =COSH(2) 一致）',
      explanation: 'COSH(x) 的定义就是 (eˣ + e⁻ˣ)/2。用 EXP 可以互相验证。',
    },
    {
      title: '示例 3：算两端固定链条的下垂曲线',
      scene: '跨距 20 米、参数 a=10 的悬链，求各点的相对高度。',
      dataTsv: '水平位置\t参数a\n0\t10\n5\t10\n10\t10',
      dataAnchor: 'A1',
      formula: '=B2*(COSH(A2/B2)-1)',
      result: 'x=0 → 0 米；x=5 → 1.276 米；x=10 → 5.431 米',
      explanation:
        '悬链线标准方程 y = a·(cosh(x/a) − 1)。跨中（x=0）最低，越往两端越高。工程上算电缆、吊桥索都用它。',
    },
  ],
  pitfalls: [
    {
      title: '误以为参数是角度、还要转弧度',
      reason: '双曲函数的参数是普通实数，与角度、圆周无关。',
      fix: '直接给实数即可，不要套 RADIANS。',
      level: 'mid',
    },
    {
      title: '期待结果落在 -1 到 1 之间',
      reason: 'COSH 最小是 1，向两侧无界增长，x=10 时约 11013。',
      fix: '它无上界；需要 [-1,1] 区间量时用 COS（三角余弦）或 TANH。',
      level: 'low',
    },
    {
      title: '参数传了文本',
      reason: 'COSH 只接受数字。',
      fix: '先用 VALUE() 转换。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'sinh',
      kind: 'companion',
      why: 'SINH 与 COSH 是双曲函数的基础对，且满足 COSH²(x) − SINH²(x) = 1（对应圆函数的 sin²+cos²=1）。',
    },
    {
      id: 'tanh',
      kind: 'alternative',
      why: 'TANH = SINH/COSH，有界于 ±1，做归一化时更常用。',
    },
    {
      id: 'cos',
      kind: 'confusable',
      why: '名字只差一个 H：COS 是周期三角函数、值域 [-1,1]；COSH 是双曲函数、值域 [1,+∞)。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '1', placeholder: '如 1' },
    ],
    template: '=COSH(A2)',
    cases: [
      { label: '双曲余弦 0', type: 'ok', values: { number: '0' }, expect: '1', note: 'cosh(0)=1' },
      { label: '双曲余弦 1', type: 'ok', values: { number: '1' }, expect: '1.543081', note: 'cosh(1)≈1.543081' },
      { label: '参数非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
      { label: '参数为空', type: 'error', values: { number: '' }, expect: '#VALUE!', note: '空单元格报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default coshEntry;
