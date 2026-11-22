import type { FunctionEntry } from '@/types';

/** CORREL · 相关系数（statistical 类 B4 批次） */

const TSV = '月份\t广告费\t销售额\n1\t10\t100\n2\t20\t180\n3\t30\t290\n4\t40\t380\n5\t50\t520';

const correlEntry: FunctionEntry = {
  id: 'correl',
  enName: 'CORREL',
  zhName: '相关系数',
  zhCommon: ['相关系数', 'CORREL', '相关性'],
  alias: ['相关度', '线性相关', 'r值'],
  category: 'statistical',
  abbr: 'xgxs',
  pinyin: 'xiangguanxishu',
  keywords: ['CORREL', '相关系数', '相关性', 'r值', '线性相关', '广告效果'],
  difficulty: 3,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '算两组数据的相关系数，看它们是不是同涨同跌',
  summary:
    '相关系数 r 取值 −1 到 1：接近 1 表示同向变化（广告费涨、销售额也涨），接近 −1 表示反向变化，接近 0 表示没什么线性关系。它是判断「两个指标是否相关」最常用的指标。但要记住两条：**相关不等于因果**，且它只衡量**线性**关系——如果两组数据是曲线关系（如先升后降），r 可能接近 0 却确实相关。',
  syntax: {
    patternCn: '=CORREL(第一组数据, 第二组数据)',
    patternEn: '=CORREL(array1, array2)',
    args: [
      {
        key: 'array1',
        zh: '第一组数据',
        en: 'array1',
        required: true,
        desc: '第一组数值。',
        accepts: '单元格区域，如 B2:B6。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '文本、逻辑值、空格会被忽略。',
        example: 'B2:B6',
        pitfallRank: 2,
      },
      {
        key: 'array2',
        zh: '第二组数据',
        en: 'array2',
        required: true,
        desc: '第二组数值，个数必须与第一组相同。',
        accepts: '单元格区域，如 C2:C6。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 两组数据个数必须一致，否则报 #N/A。',
        example: 'C2:C6',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 −1 到 1 之间的相关系数；两组数据个数不等或标准差为 0 返回 #N/A 或 #DIV/0!。',
  examples: [
    {
      title: '示例 1：广告费与销售额的相关性',
      scene: '投了 5 个月广告，想验证广告费与销售额是否同向变化。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CORREL(B2:B6,C2:C6)',
      result: '约 0.9956（极强正相关）',
      explanation: '广告费增加时销售额同步上升，r 接近 1，说明两者高度线性相关。',
    },
    {
      title: '示例 2：完全反向的数据得到 −1',
      scene: '一组递增、一组递减，看相关系数。',
      dataTsv: 'x\ty\n1\t10\n2\t8\n3\t6\n4\t4\n5\t2',
      dataAnchor: 'A1',
      formula: '=CORREL(A2:A6,B2:B6)',
      result: '-1（完全负相关）',
      explanation: 'x 每增加 1，y 固定减少 2，是完全的线性反向关系，r = −1。',
    },
    {
      title: '示例 3：两组数据个数不等时报错',
      scene: 'x 有 5 个、y 只有 4 个。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CORREL(B2:B6,C2:C5)',
      result: '#N/A（两组数据长度不一致）',
      explanation: '必须一一对应。检查两个区域的起止行是否对齐。',
    },
  ],
  pitfalls: [
    {
      title: '把相关当成因果',
      reason: 'r 高只说明两者同向变化，可能是巧合、也可能受第三个因素驱动（如季节同时推高冰淇淋销量与溺水人数）。',
      fix: '相关只能作为线索，要证明因果需做对照实验或结合业务机理分析。',
      level: 'high',
    },
    {
      title: '期待它能捕捉非线性关系',
      reason: 'CORREL 只衡量线性关系；抛物线型（先升后降）的数据 r 可能接近 0，但显然有关系。',
      fix: '先画散点图看形状；非线性关系改用其他方法（如先取对数再求相关）。',
      level: 'high',
    },
    {
      title: '两组数据个数不等或某组标准差为 0',
      reason: '无法一一配对，或除数为 0。',
      fix: '核对两个区域的行数一致；数据完全相同的那一组算不出相关性。',
      level: 'high',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'pearson',
      kind: 'companion',
      why: 'PEARSON 与 CORREL 数学上完全等价，只是来源不同，结果一致。',
    },
    {
      id: 'rsq',
      kind: 'companion',
      why: 'RSQ 是相关系数的平方，表示「能被对方解释的波动比例」，比 r 更容易解释。',
    },
    {
      id: 'slope',
      kind: 'companion',
      why: '相关看方向强度、斜率看变化幅度，分析两个变量时常一起用。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array1: 'B2:B6', array2: 'C2:C6' },
    fields: [
      { key: 'array1', label: '第一组数据', type: 'ref', default: 'B2:B6', hint: '广告费' },
      { key: 'array2', label: '第二组数据', type: 'ref', default: 'C2:C6', hint: '销售额' },
    ],
    template: '=CORREL({array1},{array2})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '0.995591', note: '广告费与销售额的 Pearson 相关系数' },
      { label: '两组数据个数不一致', type: 'error', values: { array1: 'B2:B6', array2: 'C2:C5' }, expect: '#N/A', note: 'y 与 x 行数不同 → #N/A' },
      { label: '区域非法 B:B', type: 'error', values: { array1: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { array1: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default correlEntry;
