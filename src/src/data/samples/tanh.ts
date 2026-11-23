import type { FunctionEntry } from '@/types';

/** TANH · 双曲正切（math 类 B2 批次） */

const TSV = 'x\n0\n1\n2\n-1';

const tanhEntry: FunctionEntry = {
  id: 'tanh',
  enName: 'TANH',
  zhName: '双曲正切',
  zhCommon: ['双曲正切', 'tanh', '双曲函数'],
  alias: ['S型压缩', '归一化到±1', '激活函数'],
  category: 'math',
  abbr: 'sqzq',
  pinyin: 'shuangquzhengqie',
  keywords: ['双曲正切', 'TANH', '归一化', 'S曲线', '激活函数', '双曲函数'],
  difficulty: 4,
  usageLevel: 12,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '在机器学习与数据归一化场景中使用较多。',
  },
  oneLiner: '算双曲正切，把任意实数压到 -1 到 1 之间',
  summary:
    'TANH(x) = SINH(x)/COSH(x)，输出永远落在 -1 到 1 之间，形状是一条平滑的 S 形曲线：x=0 时为 0，x 越大越接近 1，越小越接近 -1，但永远不会等于 ±1。这个「把任意大小压缩到固定区间」的特性，让它在数据归一化和神经网络激活函数里非常常见——也是双曲函数家族里最实用的一个。',
  syntax: {
    patternCn: '=TANH(数值)',
    patternEn: '=TANH(number)',
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
  returnValue: '返回 -1 到 1（不含端点）之间的双曲正切值；x=0 时为 0。',
  examples: [
    {
      title: '示例 1：基本取值与有界性',
      scene: '看几个典型点，确认它「怎么压都压在 ±1 内」。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TANH(A2)',
      result: 'TANH(0) = 0；TANH(1) ≈ 0.7616；TANH(2) ≈ 0.9640；TANH(-1) ≈ -0.7616',
      explanation: 'x=2 时已经到 0.964，x 再大也只会无限接近 1 而不会超过。这是它做归一化的价值所在。',
    },
    {
      title: '示例 2：把一列差异很大的数压缩到 -1 到 1',
      scene: '有一组量纲差异巨大的原始分数，想统一压到可比区间再比较。',
      dataTsv: '原始值\n0.5\n3\n25\n-8',
      dataAnchor: 'A1',
      formula: '=TANH(A2)',
      result: '0.4621；0.9951；1.0000（极接近 1）；-1.0000（极接近 -1）',
      explanation:
        '数值差异被大幅压缩。但要注意：压缩后大的数几乎都变成 1，会丢失区分度——所以压缩前通常要先除以一个合理的缩放系数。',
    },
    {
      title: '示例 3：先缩放再压缩，保留区分度',
      scene: '上例直接压导致大数都变 1。先除以 10 再压，区分度明显改善。',
      dataTsv: '原始值\t缩放系数\n0.5\t10\n3\t10\n25\t10\n-8\t10',
      dataAnchor: 'A1',
      formula: '=TANH(A2/B2)',
      result: '0.0499；0.2913；0.9866；-0.6640',
      explanation:
        '先缩放（除以 10）再 TANH，各值之间仍能区分。这是实际应用中的标准做法——缩放系数决定了压缩的激烈程度。',
    },
  ],
  pitfalls: [
    {
      title: '直接对原始大数用 TANH，结果全挤到 ±1',
      reason: 'TANH 增长极快，x 超过约 3 就基本饱和到 1，导致大值之间完全无法区分。',
      fix: '先除以合适的缩放系数（如最大值、标准差）再套 TANH。',
      level: 'high',
    },
    {
      title: '误以为参数是角度',
      reason: '双曲函数参数是普通实数，与角度无关。',
      fix: '直接给实数，不要套 RADIANS。',
      level: 'mid',
    },
    {
      title: '以为 TANH 能达到 ±1',
      reason: '它只能无限接近 ±1，永远取不到端点值。若业务要求必须达到 1，用 TANH 会一直差一点点。',
      fix: '用 ROUND 到足够精度后再判断，或改用其他归一化方式（如 MIN/MAX 线性归一）。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'sinh',
      kind: 'companion',
      why: 'TANH = SINH ÷ COSH，三者构成双曲函数族。',
    },
    {
      id: 'cosh',
      kind: 'companion',
      why: 'TANH 的分母就是 COSH，两者直接关联。',
    },
    {
      id: 'tan',
      kind: 'confusable',
      why: '名字只差一个 H：TAN 是周期三角函数、会趋向无穷；TANH 有界于 ±1，用途完全不同。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '1', placeholder: '如 1' },
    ],
    template: '=TANH({number})',
    cases: [
      { label: '双曲正切 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'tanh(0)=0' },
      { label: '双曲正切 1', type: 'ok', values: { number: '1' }, expect: '0.761594', note: 'tanh(1)≈0.761594' },
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

export default tanhEntry;
