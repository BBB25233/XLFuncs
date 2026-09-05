import type { FunctionEntry } from '@/types';

/**
 * SERIESSUM · 幂级数求和
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

/** 系数小表：3 个系数，纵向排列在 A2:A4 */
const COEFF_TSV = '系数\na\n1\n2\n3';

const seriesumEntry: FunctionEntry = {
  id: 'seriesum',
  enName: 'SERIESSUM',
  zhName: '幂级数求和',
  zhCommon: ['幂级数', '级数求和', '多项式展开'],
  alias: ['级数', '幂次求和', '系数求和'],
  category: 'math',
  abbr: 'mjsqh',
  pinyin: 'mijishuqiuhe',
  keywords: ['幂级数', '级数求和', '泰勒展开', '多项式', '系数', '幂次累加'],
  difficulty: 4,
  usageLevel: 18,
  version: {
    min: 'all',
    label: 'Excel 2003 起可用（工程类函数）',
    notes:
      'SERIESSUM 是工程/数学函数，普通加减汇总用 SUM 就够了，它专门用来算「系数 × x 的连续幂次」这种级数。',
  },
  oneLiner: '把一串「系数 × x 的幂」按规则加总',
  summary:
    '当你要算一个幂级数（比如 e^x、sin x 的展开式，或自定义的多项式）时，SERIESSUM 一把梭：你给它一个 x、一个起始幂次 n、一个步长 m，再给一列系数，它就自动算出 a₁·xⁿ + a₂·xⁿ⁺ᵐ + a₃·xⁿ⁺²ᵐ + …。系数写在哪一列、从几次方开始、每次加几次方，全由你定。',
  syntax: {
    patternCn: '=SERIESSUM(x, 起始幂次, 步长, 系数区域)',
    patternEn: '=SERIESSUM(x, n, m, coefficients)',
    args: [
      {
        key: 'x',
        zh: 'x',
        en: 'x',
        required: true,
        desc: '级数里的自变量，也就是公式里的底数 x。',
        accepts:
          '具体数字或单元格，如 2、B2。通常 |x|<1 收敛，但 Excel 不做收敛判断，你给多少算多少。',
        ifOmitted: '必填参数。',
        tip: 'x 就是一个数字，不是区域；系数才是区域。别把两者位置写反。',
        example: '2',
        pitfallRank: 1,
      },
      {
        key: 'n',
        zh: '起始幂次',
        en: 'n',
        required: true,
        desc: '第一个系数对应的 x 的幂次（从几次方开始）。',
        accepts: '整数，如 0、1、2。0 表示常数项（x⁰=1）。',
        ifOmitted: '必填参数。',
        tip: 'n=0 且 m=1 时就是标准的泰勒展开形式。',
        example: '2',
      },
      {
        key: 'm',
        zh: '步长',
        en: 'm',
        required: true,
        desc: '每往后一个系数，幂次增加多少。',
        accepts: '整数，如 1、2。1 表示幂次依次 +1。',
        ifOmitted: '必填参数。',
        tip: '想让幂次隔一个跳（如只取偶次项 0,2,4…）就把 m 写成 2。',
        example: '1',
      },
      {
        key: 'coefficients',
        zh: '系数区域',
        en: 'coefficients',
        required: true,
        desc: '一串系数，纵向或横向排列的区域，依次对应 xⁿ、xⁿ⁺ᵐ、xⁿ⁺²ᵐ…',
        accepts: '一列或一行数字区域，如 A2:A4。',
        ifOmitted: '必填参数。区域里每格一个系数。',
        tip: '系数区域必须与 x、n、m 分开放，x 是单值不是区域。',
        example: 'A2:A4',
        pitfallRank: 2,
      },
    ],
  },
  returnValue:
    '返回 a₁·xⁿ + a₂·xⁿ⁺ᵐ + a₃·xⁿ⁺²ᵐ + … 的累加和，项数等于系数区域里的系数个数。',
  examples: [
    {
      title: '示例 1：算 1·x² + 2·x³ + 3·x⁴（x=2）',
      scene: '自定义一个多项式，系数分别是 1、2、3，从 2 次方开始每次加 1 次方。',
      dataTsv: COEFF_TSV,
      dataAnchor: 'A1',
      formula: '=SERIESSUM(2, 2, 1, A2:A4)',
      result: '1·2² + 2·2³ + 3·2⁴ = 4 + 16 + 48 = 68',
      explanation:
        '系数区域 A2:A4 是 1、2、3，对应幂次 n, n+m, n+2m = 2, 3, 4。SERIESSUM 自动逐项相乘再相加。',
    },
    {
      title: '示例 2：近似算 e^x（泰勒展开前几项）',
      scene: 'e^x ≈ 1 + x + x²/2! + x³/3!，取 x=1 应接近 e≈2.718。',
      dataTsv: '系数\na\n1\n1\n0.5\n0.1667',
      dataAnchor: 'A1',
      formula: '=SERIESSUM(1, 0, 1, A2:A5)',
      result: '1 + 1 + 0.5 + 0.1667 = 2.6667（项数越多越接近 2.718）',
      explanation:
        'n=0、m=1，系数依次是 x⁰、x¹、x²、x³ 的系数 1、1、1/2、1/6。再多写几项就更准。',
    },
    {
      title: '示例 3：只取偶次项的级数（步长 m=2）',
      scene: '想算 1 + 3·x² + 5·x⁴（只取 0、2、4 次方）。',
      dataTsv: '系数\na\n1\n3\n5',
      dataAnchor: 'A1',
      formula: '=SERIESSUM(2, 0, 2, A2:A4)',
      result: '1·2⁰ + 3·2² + 5·2⁴ = 1 + 12 + 80 = 93',
      explanation: 'm=2 让幂次每次跳两级：0、2、4。系数 1、3、5 分别对应这三项。',
    },
  ],
  pitfalls: [
    {
      title: '把 x 写成区域，把系数写成单值（位置搞反）',
      reason:
        'SERIESSUM 第 1 个参数是单值 x，第 4 个才是系数区域。很多人照着 SUM 的习惯把区域放第一个，结果报错。',
      fix: '记住顺序：=SERIESSUM(单值x, n, m, 系数区域)。系数那一列单独放，别和 x 混。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '系数区域里有文本或空单元格，结果偏少或不报错',
      reason:
        '系数区域里混进文本会被当成 0，空单元格也会被当 0 处理，导致某一项「悄悄消失」，公式还照常出数。',
      fix: '确认系数区域是纯数字，没有标题行和空格混进来。',
      level: 'mid',
    },
    {
      title: '照搬数学上的「无穷级数」，却只给了几项',
      reason:
        'Excel 不会真正求无穷和，它只加你给出的系数个数。项数不够时结果只是近似值，不是精确值。',
      fix: '想要多精确就多写几项系数；别指望它自动收敛到无穷。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'power',
      kind: 'companion',
      why: '级数里每一项本质就是 POWER(x, 幂次)，SERIESSUM 只是帮你把「系数×幂」批量加总。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: '如果只是把一列数简单相加，用 SUM 就够了，不需要上 SERIESSUM。',
    },
    {
      id: 'fact',
      kind: 'confusable',
      why: '泰勒展开的系数常含阶乘（如 1/n!），但 FACT 只算阶乘、不算级数求和，别互相替代。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'x', label: 'x（输入值）', type: 'number', default: '2' },
      { key: 'n', label: 'n（起始指数）', type: 'number', default: '0' },
      { key: 'm', label: 'm（指数步长）', type: 'number', default: '1' },
      { key: 'coefficient1', label: '系数1', type: 'number', default: '1' },
      { key: 'coefficient2', label: '系数2', type: 'number', default: '2' },
      { key: 'coefficient3', label: '系数3', type: 'number', default: '3' },
      { key: 'coefficient4', label: '系数4（可选）', type: 'number', default: '' },
    ],
    template: '=SERIESSUM({x},{n},{m},{coefficient1})',
    cases: [
      { label: 'SERIESSUM(2,0,1,[1,2,3]) → 17', type: 'ok', values: { x: '2', n: '0', m: '1', coefficient1: '1', coefficient2: '2', coefficient3: '3' }, expect: '17', note: '1·2⁰ + 2·2¹ + 3·2² = 1 + 4 + 12 = 17。' },
      { label: 'SERIESSUM(1,0,1,[1,2,3]) → 6', type: 'ok', values: { x: '1', n: '0', m: '1', coefficient1: '1', coefficient2: '2', coefficient3: '3' }, expect: '6', note: '1·1⁰ + 2·1¹ + 3·1² = 1 + 2 + 3 = 6。' },
      { label: '文本系数 → #VALUE!', type: 'error', values: { x: '2', n: '0', m: '1', coefficient1: 'abc', coefficient2: '2' }, expect: '#VALUE!', note: '系数含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default seriesumEntry;
