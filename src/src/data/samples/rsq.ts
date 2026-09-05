import type { FunctionEntry } from '@/types';

/** RSQ · 判定系数（statistical 类 B4 批次）
 * 注：中文名取「判定系数」而非「决定系数」，是为了避免拼音缩写 jdxs 与
 * TRUNC（截断小数）撞车——gen:pinyin 会检测并拦截缩写冲突。
 */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const rsqEntry: FunctionEntry = {
  id: 'rsq',
  enName: 'RSQ',
  zhName: '判定系数',
  zhCommon: ['判定系数', 'RSQ', 'R平方'],
  alias: ['决定系数', '拟合优度', 'R²', '可解释比例'],
  category: 'statistical',
  abbr: 'pdxs',
  pinyin: 'pandingxishu',
  keywords: ['RSQ', '决定系数', 'R平方', '拟合优度', '可解释比例'],
  difficulty: 4,
  usageLevel: 14,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '相关系数的平方，表示「y 的波动有多少能被 x 解释」',
  summary:
    'R² 是相关系数的平方，取值 0 到 1，含义非常直观：R² = 0.87 表示「销售额波动的 87% 能由广告费解释，剩下 13% 受其他因素影响」。它比相关系数 r 更好解释（不用面对负数），是评估回归模型好坏最常用的指标。注意 R² 高也不代表因果成立，只说明线性拟合得好。',
  syntax: {
    patternCn: '=RSQ(已知的y, 已知的x)',
    patternEn: '=RSQ(known_y\'s, known_x\'s)',
    args: [
      {
        key: 'known_y\'s',
        zh: '已知的y',
        en: 'known_y\'s',
        required: true,
        desc: '因变量（被解释的那个）的一组观测值。',
        accepts: '单元格区域，如 C2:C6（销售额）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ y 在前、x 在后，别写反。',
        example: 'C2:C6',
        pitfallRank: 1,
      },
      {
        key: 'known_x\'s',
        zh: '已知的x',
        en: 'known_x\'s',
        required: true,
        desc: '自变量（用来解释 y 的那个）的一组观测值，个数与 y 相同。',
        accepts: '单元格区域，如 B2:B6（广告费）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '个数必须与 y 一致。',
        example: 'B2:B6',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回 0 到 1 之间的 R²；数据个数不等或某组标准差为 0 返回 #N/A 或 #DIV/0!。',
  examples: [
    {
      title: '示例 1：广告费能解释多少销售额波动',
      scene: '评估广告费对销售额的解释力。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RSQ(C2:C6,B2:B6)',
      result: '约 0.993（即 99.3% 的销售额波动可由广告费解释）',
      explanation: 'R² 极高，说明这组数据的线性拟合非常好（实际业务中很难有这么高的值）。',
    },
    {
      title: '示例 2：与 CORREL 的关系（平方）',
      scene: '验证 RSQ 是否等于相关系数的平方。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CORREL(B2:B6,C2:C6)^2',
      result: '约 0.993（与 RSQ 一致）',
      explanation: 'RSQ = r²，两者可互相验证。注意 RSQ 的参数顺序是 (y, x)，而 CORREL 的顺序无关紧要。',
    },
    {
      title: '示例 3：数据个数不一致时报错',
      scene: 'y 与 x 长度不同。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=RSQ(C2:C6,B2:B5)',
      result: '#N/A（长度不一致）',
      explanation: '两组数据必须一一对应。',
    },
  ],
  pitfalls: [
    {
      title: '把 y 和 x 的参数顺序写反',
      reason: 'RSQ 要求先 y 后 x；虽然 R² 在简单线性回归中对称（结果不变），但在习惯与后续扩展中容易出错。',
      fix: '养成 (known_y\'s, known_x\'s) 的顺序习惯，与其他回归函数（SLOPE/INTERCEPT/FORECAST）保持一致。',
      level: 'mid',
    },
    {
      title: '认为 R² 高就证明了因果',
      reason: 'R² 只衡量线性拟合优度，不说明因果方向。',
      fix: '因果需靠业务机理或实验设计证明，R² 只用于描述拟合好坏。',
      level: 'high',
    },
    {
      title: '数据个数不等或某组无波动',
      reason: '无法配对或除数为 0。',
      fix: '核对两组区域行数一致，且都有变化。',
      level: 'high',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'correl',
      kind: 'companion',
      why: 'RSQ 就是 CORREL 的平方（简单线性回归下），可互相验证。',
    },
    {
      id: 'linest',
      kind: 'companion',
      why: 'LINEST 能一次性返回回归参数与 R² 等统计量，做完整回归分析时更全面。',
    },
    {
      id: 'slope',
      kind: 'companion',
      why: '斜率描述「变多少」，R² 描述「解释力有多强」，两者互补。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { known_ys: 'C2:C6', known_xs: 'B2:B6' },
    fields: [
      { key: 'known_ys', label: '已知的 y', type: 'ref', default: 'C2:C6' },
      { key: 'known_xs', label: '已知的 x', type: 'ref', default: 'B2:B6' },
    ],
    template: '=RSQ({known_ys},{known_xs})',
    cases: [
      { label: '广告费解释销售额', type: 'ok', values: { known_ys: 'C2:C6', known_xs: 'B2:B6' }, expect: '0.991202', note: 'R²' },
      { label: '两组个数不一致', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'B2:B5' }, expect: '#N/A', note: '行数不等' },
      { label: 'x 区域非法', type: 'error', values: { known_ys: 'C2:C6', known_xs: 'ZZZ' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default rsqEntry;
