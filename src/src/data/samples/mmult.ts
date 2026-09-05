import type { FunctionEntry } from '@/types';

/** MMULT · 矩阵相乘（math 类 B2 批次） */

const SALES_TSV = '单价\t销量1\t销量2\n12\t3\t5\n8\t7\t2\n25\t1\t4';

const mmultEntry: FunctionEntry = {
  id: 'mmult',
  enName: 'MMULT',
  zhName: '矩阵相乘',
  zhCommon: ['矩阵相乘', 'MMULT', '矩阵乘法'],
  alias: ['矩阵乘积', 'matrix multiply', '加权汇总'],
  category: 'math',
  abbr: 'jzxc',
  pinyin: 'juzhenxiangcheng',
  keywords: ['MMULT', '矩阵乘法', '加权汇总', '批量计算', '线性代数'],
  difficulty: 5,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'Microsoft 365 支持动态数组自动溢出；2019 及更早版本需按 Ctrl+Shift+Enter 输入为数组公式。',
  },
  oneLiner: '两个矩阵相乘，一次性算出多个加权汇总结果',
  summary:
    'MMULT 是矩阵函数三件套里最实用的一个。它的经典业务用法是「一次算出一整列加权合计」：比如三行单价 × 两列销量，一个公式就能得到 2 个总金额，比写多个 SUMPRODUCT 干净得多。硬条件是**第一个矩阵的列数必须等于第二个矩阵的行数**（如 3×2 乘 2×1 得 3×1），不满足就报 #VALUE!。结果也是矩阵，需要相应大小的输出区域。',
  syntax: {
    patternCn: '=MMULT(矩阵1, 矩阵2)',
    patternEn: '=MMULT(array1, array2)',
    args: [
      {
        key: 'array1',
        zh: '矩阵1',
        en: 'array1',
        required: true,
        desc: '第一个矩阵（左矩阵）。',
        accepts: '单元格区域，如 A2:A4（3 行 1 列）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 它的**列数**必须等于矩阵2的**行数**。',
        example: 'A2:A4',
        pitfallRank: 1,
      },
      {
        key: 'array2',
        zh: '矩阵2',
        en: 'array2',
        required: true,
        desc: '第二个矩阵（右矩阵）。',
        accepts: '单元格区域，如 B2:C4。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '它的**行数**必须等于矩阵1的**列数**。',
        example: 'B2:C4',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回乘积矩阵（行数取矩阵1、列数取矩阵2）；维度不匹配报 #VALUE!。',
  examples: [
    {
      title: '示例 1：一次算出两列销量各自的总金额',
      scene: '三种商品的单价（1 列 3 行）与两期的销量（3 行 2 列），要一次算出两期总金额。',
      dataTsv: SALES_TSV,
      dataAnchor: 'A1',
      formula: '=MMULT(TRANSPOSE(A2:A4),B2:C4)',
      result: '一期：12×3+8×7+25×1 = 117；二期：12×5+8×2+25×4 = 176',
      explanation:
        '单价是 3×1，先用 TRANSPOSE 转成 1×3，再与 3×2 的销量相乘，得到 1×2 的结果（两个总金额）。选中 1 行 2 列区域输出。',
    },
    {
      title: '示例 2：配合 MINVERSE 解方程组',
      scene: '解方程组 4x + 7y = 46，2x + 6y = 28。',
      dataTsv: '系数x\t系数y\t常数\n4\t7\t46\n2\t6\t28',
      dataAnchor: 'A1',
      formula: '=MMULT(MINVERSE(A2:B3),C2:C3)',
      result: '解向量（x, y）——本例系数矩阵行列式为 10，可逆，有唯一解',
      explanation:
        '解向量 = 系数矩阵的逆 × 常数向量。这是线性方程组的通用解法，规模再大也适用。',
    },
    {
      title: '示例 3：维度不匹配会报错',
      scene: '矩阵1 是 3 行 1 列、矩阵2 是 3 行 2 列，列数(1) ≠ 行数(3)。',
      dataTsv: SALES_TSV,
      dataAnchor: 'A1',
      formula: '=MMULT(A2:A4,B2:C4)',
      result: '#VALUE!（3×1 与 3×2 无法相乘：1 ≠ 3）',
      explanation:
        '乘法规则是「前列 = 后行」。本例要么把矩阵1转置成 1×3（用 TRANSPOSE），要么调整区域形状。',
    },
  ],
  pitfalls: [
    {
      title: '维度不匹配（矩阵1 的列数 ≠ 矩阵2 的行数）',
      reason: '这是矩阵乘法的硬性规则，不满足在数学上无法相乘。',
      fix: '用 TRANSPOSE 转置其中一个，或调整区域形状使「前列 = 后行」。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '只选中一个单元格输出',
      reason: 'MMULT 结果是矩阵，只选一格在旧版 Excel 里只显示左上角一个值。',
      fix: '按结果尺寸（矩阵1 的行数 × 矩阵2 的列数）选中区域；Microsoft 365 自动溢出。',
      level: 'high',
    },
    {
      title: '在 2019 及更早版本未按 Ctrl+Shift+Enter',
      reason: '旧版需确认为数组公式。',
      fix: '选中输出区域 → 输入公式 → Ctrl+Shift+Enter。',
      level: 'high',
    },
    {
      title: '区域含空单元格或文本',
      reason: '矩阵元素必须都是数字，缺一不可。',
      fix: '补齐数据，空值按业务含义填 0。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'minverse',
      kind: 'companion',
      why: 'MMULT(MINVERSE(系数), 常数) 是解线性方程组的标准组合。',
    },
    {
      id: 'mdeterm',
      kind: 'companion',
      why: '求逆前先用 MDETERM 判断可逆性，避免 MINVERSE 报 #NUM!。',
    },
    {
      id: 'sumproduct',
      kind: 'alternative',
      why: '只算单个加权合计时用 SUMPRODUCT 更简单；需要一次产出多个结果时才值得用 MMULT。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array1: 'A2:C2', array2: 'A2:A4' },
    fields: [
      { key: 'array1', label: '矩阵1', type: 'ref', default: 'A2:C2', rangeKey: 'array1' },
      { key: 'array2', label: '矩阵2', type: 'ref', default: 'A2:A4', rangeKey: 'array2' },
    ],
    template: '=MMULT({array1},{array2})',
    cases: [
      { label: '默认：1×3 × 3×1 = 1×1', type: 'ok', values: {}, expect: '293', note: 'A2:C2=[12,3,5]，A2:A4=[12,8,25]，点积 = 12×12+3×8+5×25 = 293' },
      { label: '维度不匹配 → #VALUE!', type: 'error', values: { array1: 'A2:A4', array2: 'B2:C4' }, expect: '#VALUE!', note: '矩阵1 是 3×1（1 列）、矩阵2 是 3×2（3 行），前列 ≠ 后行' },
      { label: '区域含空白单元格 → #VALUE!', type: 'error', values: { array1: 'A2:B5' }, expect: '#VALUE!', note: 'A2:B5 超出数据区，第 4 行是空白，无法运算' },
      { label: '非法区域引用 → #REF!', type: 'error', values: { array1: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default mmultEntry;
