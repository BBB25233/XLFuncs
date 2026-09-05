import type { FunctionEntry } from '@/types';

/** SINH · 双曲正弦（math 类 B2 批次） */

const TSV = 'x\n0\n1\n2\n-1';

const sinhEntry: FunctionEntry = {
  id: 'sinh',
  enName: 'SINH',
  zhName: '双曲正弦',
  zhCommon: ['双曲正弦', 'sinh', '双曲函数'],
  alias: ['双曲正矢', '悬链线', '双曲三角'],
  category: 'math',
  abbr: 'sqzx',
  pinyin: 'shuangquzhengxian',
  keywords: ['双曲正弦', 'SINH', '双曲函数', '悬链线', '指数增长'],
  difficulty: 4,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '工程与统计建模使用较多，日常办公很少用到。',
  },
  oneLiner: '算双曲正弦值，等于 (eˣ − e⁻ˣ)/2',
  summary:
    '双曲函数和普通三角函数名字像，但完全不是一回事——它跟角度、圆周无关，而是基于自然常数 e 的指数运算。SINH(x) = (eˣ − e⁻ˣ)/2，x 越大增长越快。工程上用来描述悬链线（两端固定的绳子自然下垂的形状）、统计里的某些变换也会用到。日常做表基本碰不到，属于「知道有它、需要时能用」的函数。',
  syntax: {
    patternCn: '=SINH(数值)',
    patternEn: '=SINH(number)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '任意实数（注意：这里是普通数值，不是弧度）。',
        accepts: '数字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '参数是普通实数，不需要像 SIN 那样先转弧度。',
        example: 'A2',
      },
    ],
  },
  returnValue: '返回该数值的双曲正弦值；x 为负时结果为负，x 越大结果增长越快。',
  examples: [
    {
      title: '示例 1：基本取值（含 0 和负数）',
      scene: '先看看双曲正弦在几个典型点上的值，建立直觉。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SINH(A2)',
      result: 'SINH(0) = 0；SINH(1) ≈ 1.1752；SINH(2) ≈ 3.6269；SINH(-1) ≈ -1.1752',
      explanation: '和正弦不同，它的值不受 ±1 限制，x=2 时已经到 3.6 了。它是奇函数：SINH(-x) = -SINH(x)。',
    },
    {
      title: '示例 2：用 EXP 验证公式定义',
      scene: '想确认 Excel 的 SINH 到底在算什么，用定义式手算一遍对比。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=(EXP(A3)-EXP(-A3))/2',
      result: '3.6269（与 =SINH(2) 结果完全一致）',
      explanation: 'SINH(x) 的定义就是 (eˣ − e⁻ˣ)/2，用 EXP 手算可以互相验证结果。',
    },
    {
      title: '示例 3：算悬链线的下垂高度',
      scene: '两根等高电线杆之间跨距 20 米，求悬链在跨中相对最低点的抬升量（参数 a=10）。',
      dataTsv: '水平位置\t参数a\n0\t10\n5\t10\n10\t10',
      dataAnchor: 'A1',
      formula: '=A4*(COSH(A2/A4)-1)',
      result: 'x=0 → 0；x=5 → 1.276 米；x=10 → 5.431 米',
      explanation:
        '悬链线方程是 y = a·(cosh(x/a) − 1)。这里用 COSH 配合参数 a 计算，SINH 则用于算曲线长度。这是双曲函数最经典的工程应用。',
    },
  ],
  pitfalls: [
    {
      title: '把双曲函数当成三角函数用（以为参数是角度）',
      reason: 'SINH 的参数是普通实数，不是弧度，也不需要 RADIANS 转换。按角度思路去用会得出无意义的结果。',
      fix: '记住：SIN/COS/TAN 管角度（要弧度），SINH/COSH/TANH 管指数型的双曲量（直接给实数）。',
      level: 'mid',
    },
    {
      title: '期待结果落在 -1 到 1 之间',
      reason: '受三角函数影响，有人以为 sinh 也bounded。实际上它随 x 指数增长，x=10 时已达 11013。',
      fix: '它是无界的，用来建模增长/下垂这类发散现象；想做归一化可配合 TANH（它有界于 ±1）。',
      level: 'low',
    },
    {
      title: '参数传了文本',
      reason: 'SINH 只接受数字。',
      fix: '先用 VALUE() 转换或确保单元格是数值。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'cosh',
      kind: 'companion',
      why: 'COSH 与 SINH 构成双曲函数的基础对，悬链线、 relativ istics 计算常成对出现。',
    },
    {
      id: 'tanh',
      kind: 'alternative',
      why: 'TANH 有界于 -1 到 1，做归一化/机器学习激活函数时比 SINH 常用得多。',
    },
    {
      id: 'sin',
      kind: 'confusable',
      why: '名字只差一个 H，但 SIN 是周期三角函数、SINH 是双曲函数，参数含义与值域都不同，别混用。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '1', placeholder: '如 1' },
    ],
    template: '=SINH(A2)',
    cases: [
      { label: '双曲正弦 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'sinh(0)=0' },
      { label: '双曲正弦 1', type: 'ok', values: { number: '1' }, expect: '1.175201', note: 'sinh(1)≈1.175201' },
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

export default sinhEntry;
