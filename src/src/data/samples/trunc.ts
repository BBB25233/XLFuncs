import type { FunctionEntry } from '@/types';

/**
 * TRUNC · 截断小数（math 类 · 本批次 10 条之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

/** 砍掉全部小数 */
const TRUNC_INT_TSV = '原始\n3.99\n-2.9\n5.01';

/** 保留两位（只砍不进） */
const TRUNC_2_TSV = '原始\n3.149\n3.999';

/** 砍到十位 */
const TRUNC_10_TSV = '原始\n1234.56\n9876.54';

const truncEntry: FunctionEntry = {
  id: 'trunc',
  enName: 'TRUNC',
  zhName: '截断小数',
  zhCommon: ['截断小数', '直接砍小数', '取整去尾'],
  alias: ['截断', '去小数', '截位'],
  category: 'math',
  abbr: 'jdxs',
  pinyin: 'jieduanxiaoshu',
  keywords: ['截断小数', '直接砍小数', '去尾', '截位', '取整', '去掉小数部分'],
  difficulty: 2,
  usageLevel: 55,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'TRUNC 只「砍」小数不四舍五入，且负数也朝 0（和 ROUNDDOWN 等价）。想保留指定位数用第二参数。',
  },
  oneLiner: '直接砍掉小数部分，不四舍五入',
  summary:
    '只要整数部分、小数一概不要，且「绝不进位」——这就是 TRUNC。3.99→3，-2.9→-2。它和 ROUNDDOWN 结果一样，但语义更直白：「截断」。也能指定保留几位（TRUNC(3.149,2)=3.14）。常用来「只看整数天」「取金额整数部分」。',
  syntax: {
    patternCn: '=TRUNC(数字, [位数])',
    patternEn: '=TRUNC(number, [num_digits])',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要截断的原始数字。',
        accepts: 'A2 · 3.99 · -2.9。',
        ifOmitted: '必填。',
        tip: 'TRUNC 不四舍五入，直接砍。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'num_digits',
        zh: '位数',
        en: 'num_digits',
        required: false,
        desc: '保留到第几位：0=只留整数（默认），2=留两位，负=砍到十位/百位。',
        accepts: '0（默认）· 2 · -1（到十位）。',
        ifOmitted: '省略等于 0，即砍掉所有小数只留整数。',
        tip: '想留两位写 2；想砍到十位写 -1。',
        example: '0',
        pitfallRank: 2,
      },
    ],
  },
  returnValue:
    '返回截掉指定位数之后、朝 0 方向的数值；正数变小、负数变大（绝对值都减小），不四舍五入。',
  examples: [
    {
      title: '示例 1：砍掉全部小数',
      scene: '只要整数部分，小数一律不要，且不进位。',
      dataTsv: TRUNC_INT_TSV,
      dataAnchor: 'A1',
      formula: '=TRUNC(A2)',
      result: '3（3.99）· -2（-2.9）· 5（5.01）',
      explanation: '默认位数 0，直接砍小数：3.99→3，-2.9→-2。',
    },
    {
      title: '示例 2：保留两位（只砍不进）',
      scene: '金额想看两位，但「宁少勿多」不四舍五入。',
      dataTsv: TRUNC_2_TSV,
      dataAnchor: 'A1',
      formula: '=TRUNC(A2,2)',
      result: '3.14（3.149）· 3.99（3.999）',
      explanation: '第二参数 2 留两位，后面的直接砍，不四舍五入。',
    },
    {
      title: '示例 3：砍到十位',
      scene: '大金额报表按十元为单位向下取。',
      dataTsv: TRUNC_10_TSV,
      dataAnchor: 'A1',
      formula: '=TRUNC(A2,-1)',
      result: '1230（1234.56）· 9870（9876.54）',
      explanation: '第二参数 -1 砍到十位：1234.56→1230。',
    },
  ],
  pitfalls: [
    {
      title: '以为 TRUNC 会四舍五入',
      reason: 'TRUNC 只砍不进，3.99 也是 3。',
      fix: '要四舍五入用 ROUND；只砍小数用 TRUNC。',
      level: 'mid',
    },
    {
      title: '负数方向：TRUNC(-2.9)=-2 不是 -3',
      reason: 'TRUNC 朝 0 截断，-2.9 朝 0 是 -2（和 INT 不同，INT 得 -3）。',
      fix: '要「向下取整到负无穷」用 INT；要「朝 0 去尾」用 TRUNC/ROUNDDOWN。',
      level: 'high',
    },
    {
      title: '和 ROUNDDOWN 分不清谁更合适',
      reason: '两者结果完全一样，TRUNC 语义是「截断」、ROUNDDOWN 是「向下舍」。',
      fix: '想强调「砍小数」用 TRUNC 更直观，效果等同 ROUNDDOWN(数,位)。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'round',
      kind: 'confusable',
      why: 'ROUND 会四舍五入，TRUNC 只砍不进；按「是否允许进位」选。',
    },
    {
      id: 'rounddown',
      kind: 'confusable',
      why: 'ROUNDDOWN 与 TRUNC 结果一致，前者强调「向下舍」、后者强调「截断」，负数都朝 0。',
    },
    {
      id: 'int',
      kind: 'confusable',
      why: '正数两者一样；负数 INT 向负无穷（-2.9→-3）、TRUNC 向 0（-2.9→-2）。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '3.14159' },
      { key: 'digits', label: '保留位数（可选）', type: 'number', default: '2' },
    ],
    template: '=TRUNC({number},{digits})',
    cases: [
      { label: 'TRUNC(3.14159,2) → 3.14', type: 'ok', values: { number: '3.14159', digits: '2' }, expect: '3.14', note: '保留 2 位，直接截断不是四舍五入。' },
      { label: 'TRUNC(-3.14159,2) → -3.14', type: 'ok', values: { number: '-3.14159', digits: '2' }, expect: '-3.14', note: '向零截断，负数也朝 0 方向。' },
      { label: 'TRUNC(3.9) → 3', type: 'ok', values: { number: '3.9', digits: '' }, expect: '3', note: '位数默认 0，截断到整数。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc', digits: '2' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default truncEntry;
