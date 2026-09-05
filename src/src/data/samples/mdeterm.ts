import type { FunctionEntry } from '@/types';

/** MDETERM · 矩阵行列式（math 类 B2 批次） */

const M2_TSV = 'a\tb\n3\t8\n4\t6';

const mdetermEntry: FunctionEntry = {
  id: 'mdeterm',
  enName: 'MDETERM',
  zhName: '矩阵行列式',
  zhCommon: ['行列式', 'MDETERM', '矩阵求值'],
  alias: ['求行列式', '矩阵 determinant', '判别式'],
  category: 'math',
  abbr: 'jzhls',
  pinyin: 'juzhenhanglieshi',
  keywords: ['MDETERM', '行列式', '矩阵', '方阵', '是否可逆', '线性代数'],
  difficulty: 4,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '属于线性代数专用函数，日常办公极少使用。',
  },
  oneLiner: '算一个方阵的行列式（一个能反映矩阵性质的数值）',
  summary:
    '行列式是线性代数里的一个标量值，最实用的判断是：**行列式为 0 说明这个矩阵不可逆（奇异矩阵）**，对应到业务上就是方程组无唯一解。所以 MDETERM 常用来先「探路」——算出来是 0 就别再求逆了，必然报错。它要求输入必须是方阵（行数=列数），否则报 #VALUE!。',
  syntax: {
    patternCn: '=MDETERM(方阵区域)',
    patternEn: '=MDETERM(array)',
    args: [
      {
        key: 'array',
        zh: '方阵区域',
        en: 'array',
        required: true,
        desc: '行数与列数相等的数值区域。',
        accepts: '单元格区域，如 A2:B3（2×2）、A2:C4（3×3）。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 必须是方阵，3 行 2 列这类矩形区域会直接报 #VALUE!。',
        example: 'A2:B3',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该方阵的行列式数值；非方阵返回 #VALUE!；区域含空单元格或文本返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：2×2 矩阵的行列式',
      scene: '算一个 2×2 矩阵的行列式，用 ad−bc 手算验证。',
      dataTsv: M2_TSV,
      dataAnchor: 'A1',
      formula: '=MDETERM(A2:B3)',
      result: '3×6 − 8×4 = 18 − 32 = -14',
      explanation: '2×2 的行列式就是「主对角线之积 − 副对角线之积」，即 ad−bc = -14。',
    },
    {
      title: '示例 2：用行列式判断矩阵是否可逆',
      scene: '准备求逆矩阵，先用行列式探一下路，避免直接撞上 #NUM!。',
      dataTsv: 'x\ty\n2\t4\n1\t2',
      dataAnchor: 'A1',
      formula: '=IF(MDETERM(A2:B3)=0,"不可逆","可逆")',
      result: '不可逆（因为 2×2 − 4×1 = 0，行列式为 0）',
      explanation:
        '这一组数据第二行是第一行的 0.5 倍（线性相关），行列式为 0。先用 MDETERM 判断能给出友好提示，比让 MINVERSE 直接抛 #NUM! 好得多。',
    },
    {
      title: '示例 3：非方阵会报错',
      scene: '选中了一个 3 行 2 列的矩形区域。',
      dataTsv: 'a\tb\n1\t2\n3\t4\n5\t6',
      dataAnchor: 'A1',
      formula: '=MDETERM(A2:B4)',
      result: '#VALUE!（3 行 2 列，不是方阵）',
      explanation: '行列式只对方阵有定义。要算行列式必须先把区域裁成方形。',
    },
  ],
  pitfalls: [
    {
      title: '区域不是方阵（行数≠列数）',
      reason: '数学上只有方阵才有行列式。',
      fix: '把区域调整成 n 行 n 列。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '区域里有空单元格或文本',
      reason: 'MDETERM 要求区域内每个格子都是数字，缺一不可。',
      fix: '补齐所有单元格；空值在业务上应填 0 而不是留空（注意这会改变行列式的值，需确认业务含义）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '把行列式为 0 当成「计算失败」',
      reason: '行列式等于 0 是一个合法的数学结果，含义是矩阵奇异（行或列线性相关、不可逆）。',
      fix: '它是有效答案。若接下来要求逆，先判断是否为 0 并给出提示。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'minverse',
      kind: 'companion',
      why: '求逆前先用 MDETERM 判断行列式是否为 0，可以避免 MINVERSE 直接报 #NUM!。',
    },
    {
      id: 'mmult',
      kind: 'companion',
      why: '同属 Excel 的矩阵函数三件套，常一起用于解线性方程组。',
    },
    {
      id: 'sumproduct',
      kind: 'alternative',
      why: '简单的 2×2 行列式可用 =A1*B2-A2*B1 直接算，不必动用 MDETERM。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:B3' },
    fields: [
      { key: 'array', label: '方阵区域', type: 'ref', default: 'A2:B3', rangeKey: 'array' },
    ],
    template: '=MDETERM({array})',
    cases: [
      { label: '默认：2×2 行列式', type: 'ok', values: {}, expect: '-14', note: 'A2:B3 = [[3,8],[4,6]]，行列式 = 3×6 − 8×4 = -14' },
      { label: '非方阵（1 行 2 列）→ #VALUE!', type: 'error', values: { array: 'A2:B2' }, expect: '#VALUE!', note: '行数 ≠ 列数，MDETERM 只接受方阵' },
      { label: '区域含空白单元格 → #VALUE!', type: 'error', values: { array: 'A2:B4' }, expect: '#VALUE!', note: '超出数据区的第 3 行被补成空白，空白无法参与运算' },
      { label: '非法区域引用 → #REF!', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default mdetermEntry;
