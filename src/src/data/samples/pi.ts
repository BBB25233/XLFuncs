import type { FunctionEntry } from '@/types';

/**
 * PI · 圆周率（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 * PI 无任何参数，括号里必须留空。
 */

/** 圆面积（半径） */
const PI_AREA_TSV = '半径\n2\n5\n10';

/** 圆周长（半径） */
const PI_CIRC_TSV = '半径\n2\n5';

/** 球体积（半径） */
const PI_SPHERE_TSV = '半径\n3';

const piEntry: FunctionEntry = {
  id: 'pi',
  enName: 'PI',
  zhName: '圆周率',
  zhCommon: ['圆周率', 'π', '3.14'],
  alias: ['π值', '派', '圆周长系数'],
  category: 'math',
  abbr: 'yzl',
  pinyin: 'yuanzhoulv',
  keywords: ['圆周率', 'π', '3.14159', '圆形计算', '面积周长', '数学常数'],
  difficulty: 1,
  usageLevel: 65,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'PI 不需任何参数，连括号里都别填东西（=PI(3) 会报 #VALUE!）。精度约 15 位：3.14159265358979。',
  },
  oneLiner: '返回圆周率 π（约 3.14159）',
  summary:
    '算圆面积、周长、球体积，永远离不开 π。PI() 一条公式直接吐出 3.14159265358979，不用手敲一长串。它不带任何参数，括号里空着写 =PI() 就行。配合 POWER、半径，圆面积 =PI()*半径^2 一行搞定。',
  syntax: {
    patternCn: '=PI()',
    patternEn: '=PI()',
    args: [],
  },
  returnValue: '返回圆周率 π 的数值，约 3.14159265358979（15 位精度）。',
  examples: [
    {
      title: '示例 1：圆面积 = π·r²',
      scene: '给半径算圆面积。',
      dataTsv: PI_AREA_TSV,
      dataAnchor: 'A1',
      formula: '=PI()*A2^2',
      result: '12.57（r=2）· 78.54（r=5）· 314.16（r=10）',
      explanation: '圆面积 = π·r²，PI() 提供 π，A2^2 是半径平方。',
    },
    {
      title: '示例 2：圆周长 = 2πr',
      scene: '给半径算圆周长。',
      dataTsv: PI_CIRC_TSV,
      dataAnchor: 'A1',
      formula: '=2*PI()*A2',
      result: '12.57（r=2）· 31.42（r=5）',
      explanation: '周长 = 2πr，2*PI()*半径。',
    },
    {
      title: '示例 3：球体积 = 4/3·π·r³',
      scene: '给半径算球体积。',
      dataTsv: PI_SPHERE_TSV,
      dataAnchor: 'A1',
      formula: '=4/3*PI()*A2^3',
      result: '113.10（r=3）',
      explanation: '球体积 = 4/3·π·r³，半径立方用 ^3。',
    },
  ],
  pitfalls: [
    {
      title: '括号里多填参数，报 #VALUE!',
      reason: 'PI 无参数，=PI(3) 会被当成「传了参数」而报错。',
      fix: '老老实实写 =PI()，括号留空。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '把 PI 当「可改精度的变量」',
      reason: 'PI() 固定返回约 15 位，没法减精度；要显示两位靠单元格格式。',
      fix: '想「看着是 3.14」用 ROUND(PI(),2) 或把单元格小数位设为 2。',
      level: 'mid',
    },
    {
      title: '幂运算优先级写错，导致圆面积算错',
      reason: '=PI()*A2^2 里 ^ 先于 *，先平方再乘 π，符合预期；但若写成 PI()*A2 再手动平方就错了。',
      fix: '复杂式加括号明确顺序，如 =(2*PI()*A2) 算周长，避免漏掉 ^2。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'round',
      kind: 'companion',
      why: '想让 π 或圆面积只显示两位，用 ROUND(...,2)。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: '一列半径算完圆面积后，用 SUM 汇总总面积。',
    },
    {
      id: 'int',
      kind: 'companion',
      why: '想只取 π 或结果的整数部分（砍小数不进），可用 INT/TRUNC。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [],
    template: '=PI()',
    cases: [
      { label: 'PI() → 3.141593', type: 'ok', values: {}, expect: '3.141593', note: '圆周率，约等于 3.141593（保留 6 位小数）。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default piEntry;
