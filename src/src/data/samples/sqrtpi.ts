import type { FunctionEntry } from '@/types';

/** SQRTPI · 乘 π 后开方（math 类 B2 批次） */

const TSV = '数值\n1\n4\n9\n16';

const sqrtpiEntry: FunctionEntry = {
  id: 'sqrtpi',
  enName: 'SQRTPI',
  zhName: '乘圆周率后开方',
  zhCommon: ['SQRTPI', '根号下派', '乘派开方'],
  alias: ['乘以π再开方', '根号πx', '特殊开方'],
  category: 'math',
  abbr: 'cyzlhkf',
  pinyin: 'chengyuanzhoulvhoukaifang',
  keywords: ['SQRTPI', '乘π开方', '平方根', '统计计算', '正态分布'],
  difficulty: 3,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '等价于 SQRT(数值*PI())；属于较冷门的专用函数。',
  },
  oneLiner: '把数值先乘以 π，再开平方根',
  summary:
    'SQRTPI(x) 完全等价于 SQRT(x × π)，只是一个语法糖——把「乘 π 再开方」这个统计计算里常出现的组合打包成一个函数。它要求参数非负，负数会报 #NUM!。日常做表几乎用不到，见到它时按 SQRT(x*PI()) 理解即可。',
  syntax: {
    patternCn: '=SQRTPI(数值)',
    patternEn: '=SQRTPI(number)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '要处理的非负数。',
        accepts: '数字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '参数必须 ≥ 0，负数没有实数平方根。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 √(数值 × π)；参数为负时返回 #NUM!。',
  examples: [
    {
      title: '示例 1：基本计算',
      scene: '对几个数值求「乘 π 后开方」。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SQRTPI(A2)',
      result: 'SQRTPI(1) ≈ 1.7725（即 √π）；SQRTPI(4) ≈ 3.5449；SQRTPI(9) ≈ 5.3174；SQRTPI(16) ≈ 7.0898',
      explanation: 'SQRTPI(1) 就是 √π ≈ 1.7725，这是最常用的一个特例，可用来验证函数是否用对。',
    },
    {
      title: '示例 2：用 SQRT 与 PI 手写验证',
      scene: '确认 SQRTPI 到底在算什么，用等价式对比一遍。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SQRT(A4*PI())',
      result: '5.3174（与 =SQRTPI(9) 结果一致）',
      explanation: 'SQRTPI(x) = SQRT(x × π)。两者完全等价，手写式在旧版本或需要改写时同样可用。',
    },
    {
      title: '示例 3：负参数会报错',
      scene: '上游算出了负数，公式直接报错。',
      dataTsv: '数值\n-4\n0\n4',
      dataAnchor: 'A1',
      formula: '=SQRTPI(A2)',
      result: '#NUM!（-4 越界）；0 → 0；4 → 3.5449',
      explanation: '负数乘以 π 后仍是负数，实数范围内无法开方。要先检查上游为何出现负值。',
    },
  ],
  pitfalls: [
    {
      title: '传入负数导致 #NUM!',
      reason: '实数范围内负数没有平方根，这是数学限制。',
      fix: '检查上游数据；若确实需要处理，先取绝对值 ABS() 并明确业务含义。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '误以为它是在算「π 的开方」本身',
      reason: '函数名容易让人以为 SQRTPI(x) = √π，其实它是 √(x×π)。只有 x=1 时才等于 √π。',
      fix: '记住公式：√(数值×π)。要算 √π 本身，写 =SQRTPI(1) 或 =SQRT(PI())。',
      level: 'mid',
    },
    {
      title: '参数传了文本',
      reason: '函数只接受数字。',
      fix: '先用 VALUE() 转换。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'sqrt',
      kind: 'alternative',
      why: 'SQRTPI(x) 完全等价于 SQRT(x*PI())，日常用 SQRT 组合 PI 更直观、也更不容易记错。',
    },
    {
      id: 'pi',
      kind: 'companion',
      why: 'PI() 提供 π 值，是手写等价式的组成部分。',
    },
    {
      id: 'power',
      kind: 'alternative',
      why: '也可以用 POWER(x*PI(),0.5) 得到同样结果，但可读性不如 SQRT。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数值', type: 'number', default: '1', placeholder: '如 1', hint: '必须 ≥ 0' },
    ],
    template: '=SQRTPI({number})',
    cases: [
      { label: 'sqrtpi 0', type: 'ok', values: { number: '0' }, expect: '0', note: 'SQRTPI(0)=0' },
      { label: 'sqrtpi 1', type: 'ok', values: { number: '1' }, expect: '1.772454', note: 'SQRTPI(1)=√π≈1.772454' },
      { label: '负数', type: 'error', values: { number: '-1' }, expect: '#NUM!', note: '参数必须 ≥ 0' },
      { label: '参数非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '文本参数报错' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default sqrtpiEntry;
