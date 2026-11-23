import type { FunctionEntry } from '@/types';

/**
 * SQRT · 平方根（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 边长小表 */
const SIDE_TSV = '面积\n25\n144\n2';

const sqrtEntry: FunctionEntry = {
  id: 'sqrt',
  enName: 'SQRT',
  zhName: '平方根',
  zhCommon: ['平方根', '开方', '根号'],
  alias: ['开平方', '根号', '二次方根'],
  category: 'math',
  abbr: 'pfg',
  pinyin: 'pingfanggen',
  keywords: ['平方根', '开方', '根号', '二次方根', '面积求边长', '标准差前处理'],
  difficulty: 1,
  usageLevel: 38,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'SQRT 只接受非负数，负数会报 #NUM!；要算负数平方根请先 ABS 取正。等价写法 POWER(数,0.5)。',
  },
  oneLiner: '算出哪个数平方后等于它',
  summary:
    'SQRT 是「平方的逆运算」：SQRT(25)=5，因为 5×5=25。已知面积求边长、已知方差求标准差、几何/物理计算都常用。它只接受非负数，负数会直接报 #NUM!——这点比手算容易翻车。等价于 POWER(数, 0.5)。',
  syntax: {
    patternCn: '=SQRT(数字)',
    patternEn: '=SQRT(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要开平方的那个非负数。',
        accepts: '≥0 的数字或单元格，如 25、A2。',
        ifOmitted: '这是唯一必填参数，省略报 #VALUE!。',
        tip: '负数要先 ABS 取正；想开立方用 POWER(数,1/3)。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该数的算术平方根（非负）；参数为负数时返回 #NUM!。',
  examples: [
    {
      title: '示例 1：已知面积求正方形边长',
      scene: '一块正方形地面积 25，想知道边长多少。',
      dataTsv: SIDE_TSV,
      dataAnchor: 'A1',
      formula: '=SQRT(A2)',
      result: '25→5；144→12；2→约1.414',
      explanation: '边长 = 面积开平方，SQRT 一步给出。',
    },
    {
      title: '示例 2：已知平方和求「模长」',
      scene: '向量的分量平方和是 25，求向量长度（模）。',
      dataTsv: 'x²+y²\n25',
      dataAnchor: 'A1',
      formula: '=SQRT(A2)',
      result: '√25 = 5',
      explanation: '向量模长 = 各分量平方和再开平方，SQRT 就是最后那一步。',
    },
    {
      title: '示例 3：和 SUMSQ 配合求平方和的方根',
      scene: '已有若干数，要算它们平方和之后再开方（如欧氏距离）。',
      dataTsv: '数1\t数2\t数3\n3\t4\t0',
      dataAnchor: 'A1',
      formula: '=SQRT(SUMSQ(A2:C2))',
      result: 'SUMSQ(3,4,0)=25，√25 = 5',
      explanation: 'SUMSQ 先把各数平方相加，再用 SQRT 开方，组合出欧氏距离这类指标。',
    },
  ],
  pitfalls: [
    {
      title: '给负数报 #NUM!',
      reason: '实数范围内负数没有平方根，SQRT(-9) 直接报 #NUM!。',
      fix: '若业务上需要「绝对值的平方根」就先 ABS：=SQRT(ABS(A2))；否则检查数据为何为负。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '和 POWER 开方搞混写法',
      reason: 'SQRT(A2) 与 POWER(A2,0.5) 等价，但 SQRT 只能开平方、POWER 能开任意次（含立方 1/3）。需要开立方时 SQRT 用不了。',
      fix: '开平方用 SQRT 更直观；开立方/任意次用 POWER(数, 1/3 等)。',
      level: 'low',
    },
    {
      title: '参数为文本或空报 #VALUE!',
      reason: 'SQRT("abc") 或空单元格会报 #VALUE!，它只认非负数字。',
      fix: '先 VALUE() 转数字或筛选掉非数值格。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'power',
      kind: 'companion',
      why: 'SQRT 等价于 POWER(数,0.5)；开任意次方都靠 POWER。',
    },
    {
      id: 'sumsq',
      kind: 'companion',
      why: 'SUMSQ 把各数平方相加，SQRT 再开方，常组合算距离/标准差。',
    },
    {
      id: 'abs',
      kind: 'confusable',
      why: 'ABS 是去符号、SQRT 是开方，别把「距离」误用成绝对值平方根。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '9' },
    ],
    template: '=SQRT({number})',
    cases: [
      { label: 'SQRT(9) → 3', type: 'ok', values: { number: '9' }, expect: '3', note: '9 的平方根是 3。' },
      { label: 'SQRT(25) → 5', type: 'ok', values: { number: '25' }, expect: '5', note: '25 的平方根是 5。' },
      { label: '负数 -9 → #NUM!', type: 'error', values: { number: '-9' }, expect: '#NUM!', note: '负数不能开实数平方根，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default sqrtEntry;
