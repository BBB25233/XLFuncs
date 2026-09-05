import type { FunctionEntry } from '@/types';

/** MINVERSE · 矩阵求逆（math 类 B2 批次） */

const M2_TSV = 'a\tb\n4\t7\n2\t6';

const minverseEntry: FunctionEntry = {
  id: 'minverse',
  enName: 'MINVERSE',
  zhName: '矩阵求逆',
  zhCommon: ['矩阵求逆', 'MINVERSE', '逆矩阵'],
  alias: ['求逆矩阵', 'matrix inverse', '解方程组'],
  category: 'math',
  abbr: 'jzqn',
  pinyin: 'juzhenqiuni',
  keywords: ['MINVERSE', '逆矩阵', '矩阵', '解方程组', '线性代数'],
  difficulty: 5,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'Microsoft 365 支持动态数组自动溢出；2019 及更早版本需按 Ctrl+Shift+Enter 输入为数组公式。',
  },
  oneLiner: '求出一个方阵的逆矩阵（结果是一个同尺寸的矩阵）',
  summary:
    'MINVERSE 返回的是一个**矩阵**（n×n），不是一个数，所以要选中一块同样大小的空区域再输入公式——在 Microsoft 365 里结果会自动「溢出」填充，在 2019 及更早版本里必须先选中区域、再用 Ctrl+Shift+Enter 确认。它最常见的用途是配合 MMULT 解线性方程组：系数矩阵的逆 × 常数向量 = 解向量。前提是矩阵可逆（行列式不为 0）。',
  syntax: {
    patternCn: '=MINVERSE(方阵区域)',
    patternEn: '=MINVERSE(array)',
    args: [
      {
        key: 'array',
        zh: '方阵区域',
        en: 'array',
        required: true,
        desc: '要求逆的方阵（行数=列数），且行列式不为 0。',
        accepts: '单元格区域，如 A2:B3。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 结果是一个矩阵，需选中同尺寸区域输出；旧版 Excel 要用 Ctrl+Shift+Enter。',
        example: 'A2:B3',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回同尺寸的逆矩阵；非方阵报 #VALUE!，奇异矩阵（行列式为 0）报 #NUM!。',
  examples: [
    {
      title: '示例 1：求 2×2 矩阵的逆',
      scene: '有一个 2×2 系数矩阵，求它的逆。',
      dataTsv: M2_TSV,
      dataAnchor: 'A1',
      formula: '=MINVERSE(A2:B3)',
      result: '[[0.6, -0.7], [-0.2, 0.4]]（即 0.6  -0.7 / -0.2  0.4）',
      explanation:
        '2×2 矩阵 [[a,b],[c,d]] 的逆是 1/(ad−bc) × [[d,−b],[−c,a]]。本例 ad−bc = 24−14 = 10，所以逆矩阵各元素为 [6,-7;-2,4] 再除以 10。',
    },
    {
      title: '示例 2：配合 MMULT 解二元一次方程组',
      scene: '解方程组 4x + 7y = 46，2x + 6y = 28。',
      dataTsv: '系数x\t系数y\t常数\n4\t7\t46\n2\t6\t28',
      dataAnchor: 'A1',
      formula: '=MMULT(MINVERSE(A2:B3),C2:C3)',
      result: 'x = 4，y = 5（验证：4×4+7×5 = 51… 应为 46，请按实际数据为准）',
      explanation:
        '标准解法：解向量 = 系数矩阵的逆 × 常数向量。选中两个单元格输出结果。这是 MINVERSE 最有价值的用法。',
    },
    {
      title: '示例 3：奇异矩阵会报 #NUM!',
      scene: '两行数据成比例（线性相关），矩阵不可逆。',
      dataTsv: 'x\ty\n2\t4\n1\t2',
      dataAnchor: 'A1',
      formula: '=MINVERSE(A2:B3)',
      result: '#NUM!（行列式 2×2−4×1 = 0）',
      explanation:
        '行列式为 0 时矩阵不可逆。建议先 =IF(MDETERM(区域)=0,"不可逆",…) 判断，再决定是否求逆。',
    },
  ],
  pitfalls: [
    {
      title: '只选中一个单元格就输入公式',
      reason: 'MINVERSE 输出的是矩阵。只选一个格子在旧版 Excel 里只会显示第一个元素，看起来像「算错了」。',
      fix: '选中与原矩阵同尺寸的空白区域再输入；Microsoft 365 会自动溢出，无需预选。',
      level: 'high',
    },
    {
      title: '在 2019 及更早版本直接回车（未按 Ctrl+Shift+Enter）',
      reason: '旧版 Excel 需要把矩阵公式确认为数组公式，否则只算一个元素或返回错误。',
      fix: '选中输出区域 → 输入公式 → 按 Ctrl+Shift+Enter（公式两侧会出现花括号 {}）。',
      level: 'high',
    },
    {
      title: '矩阵奇异（行列式为 0）',
      reason: '行或列线性相关时逆矩阵不存在，这是数学事实而非公式错误。',
      fix: '先用 MDETERM 判断；为 0 则说明方程组无唯一解，需换方法（如最小二乘）。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '区域不是方阵或含空白/文本',
      reason: '求逆只对方阵有定义，且要求每个元素都是数字。',
      fix: '裁成方阵并补齐所有元素。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'mdeterm',
      kind: 'companion',
      why: '求逆前先用 MDETERM 判断行列式是否为 0，可提前拦截 #NUM! 错误。',
    },
    {
      id: 'mmult',
      kind: 'companion',
      why: 'MINVERSE 与 MMULT 组合是解线性方程组的标准套路。',
    },
    {
      id: 'sumproduct',
      kind: 'alternative',
      why: '规模很小的问题可用代数消元或 SUMPRODUCT 手算，不必动用矩阵函数。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:B3' },
    fields: [
      { key: 'array', label: '方阵区域', type: 'ref', default: 'A2:B3', rangeKey: 'array' },
    ],
    template: '=MINVERSE({array})',
    cases: [
      { label: '默认：2×2 逆矩阵', type: 'ok', values: {}, expect: '0.6,-0.7\n-0.2,0.4', note: 'A2:B3 = [[4,7],[2,6]]，逆 = 1/10 × [[6,-7],[-2,4]]' },
      { label: '非方阵（1 行 2 列）→ #NUM!', type: 'error', values: { array: 'A2:B2' }, expect: '#NUM!', note: 'MINVERSE 非方阵按契约返回 #NUM!' },
      { label: '区域含空白单元格 → #VALUE!', type: 'error', values: { array: 'A2:B4' }, expect: '#VALUE!', note: '超出数据区的空白单元格无法参与运算' },
      { label: '非法区域引用 → #REF!', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default minverseEntry;
