import type { FunctionEntry } from '@/types';

/**
 * SUMSQ · 平方求和（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 偏差小表 */
const DEV_TSV = '数1\t数2\t数3\n3\t4\t0';

const sumsqEntry: FunctionEntry = {
  id: 'sumsq',
  enName: 'SUMSQ',
  zhName: '平方求和',
  zhCommon: ['平方求和', '平方和', '各数平方相加'],
  alias: ['平方和', '各数平方后相加', '方差前处理'],
  category: 'math',
  abbr: 'pfqh',
  pinyin: 'pingfangqiuhe',
  keywords: ['平方求和', '平方和', '各数平方相加', '方差', '欧氏距离', '归一化前处理'],
  difficulty: 2,
  usageLevel: 25,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '先把每个数平方，再把平方加起来',
  summary:
    'SUMSQ 干两件事：把每个数先平方，再把所有平方值相加。3、4、0 进来 → 9+16+0=25。它最常用于统计前处理：平方和配合 SQRT 就是欧氏距离/向量模长，再配合均值就能算方差。比自己写 =A1^2+A2^2+… 更稳，也能直接框一整列区域。',
  syntax: {
    patternCn: '=SUMSQ(数字1, [数字2], …)',
    patternEn: '=SUMSQ(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个要平方再相加的数或区域。',
        accepts: '数字、单元格、区域，如 A2:A10、3、B2。',
        ifOmitted: '必填，至少给一个。',
        tip: '框一整列区域最方便：=SUMSQ(A2:A100)。',
        example: 'A2:A10',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '数字2',
        en: 'number2',
        required: false,
        desc: '第二个及以后的数字/区域，逗号继续追加。',
        accepts: '同「数字1」。',
        ifOmitted: '不写就只平方相加第一个参数。',
        tip: '多个区域可一起传：=SUMSQ(A2:A5, C2:C5)。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回所有参数里每个数平方后的总和；文本与空格被自动忽略。',
  examples: [
    {
      title: '示例 1：几个数的平方求和',
      scene: '手算 3²+4²+0² 容易漏，用函数一步出。',
      dataTsv: DEV_TSV,
      dataAnchor: 'A1',
      formula: '=SUMSQ(A2:C2)',
      result: '3²+4²+0² = 9+16+0 = 25',
      explanation: 'SUMSQ 内部对每个数平方再求和，3、4、0 进来得 25。',
    },
    {
      title: '示例 2：配合 SQRT 求欧氏距离',
      scene: '平面上两点差值是 (3,4)，求两点间距离。',
      dataTsv: 'Δx\tΔy\n3\t4',
      dataAnchor: 'A1',
      formula: '=SQRT(SUMSQ(A2:B2))',
      result: '√(3²+4²)=√25 = 5',
      explanation: 'SUMSQ 给出平方和 25，外层的 SQRT 开方得到距离 5，这就是欧氏距离的标准写法。',
    },
    {
      title: '示例 3：算一组数据的平方和（方差前处理）',
      scene: '有一组成绩，要算「平方和」为后续方差/标准差做准备。',
      dataTsv: '成绩\n80\n90\n70\n60',
      dataAnchor: 'A1',
      formula: '=SUMSQ(A2:A5)',
      result: '80²+90²+70²+60² = 6400+8100+4900+3600 = 23000',
      explanation: '方差公式是「平方和 - n×均值²」再除以 n，SUMSQ 就是前面那个「平方和」部分。',
    },
  ],
  pitfalls: [
    {
      title: '以为 SUMSQ 会先求和再平方',
      reason: 'SUMSQ 是「先各自平方再相加」（Σx²），不是「(总和)²」。SUMSQ(3,4)=25，而 (3+4)²=49，两者差很远。',
      fix: '要「先加再平方」用 POWER(SUM(区域),2)；要「先平方再加」才用 SUMSQ。',
      level: 'high',
    },
    {
      title: '和 SUM 混淆用途',
      reason: 'SUM 是直接相加（3+4=7），SUMSQ 是先平方再加（25）。求「和」别用 SUMSQ，否则数字被放大。',
      fix: '普通求和用 SUM；要平方和/距离/方差前处理才用 SUMSQ。',
      level: 'mid',
    },
    {
      title: '区域里混了文本会被忽略',
      reason: 'SUMSQ 自动跳过文本和空格，公式不报错，但少算了几项可能和你预期不符。',
      fix: '先用 VALUE()/分列把文本转数字，确认没有漏项再算。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'sum',
      kind: 'confusable',
      why: 'SUM 直接相加、SUMSQ 先平方再加，用途不同，别把求和误用成平方和。',
    },
    {
      id: 'sqrt',
      kind: 'companion',
      why: 'SUMSQ 给平方和，外裹 SQRT 就是距离/模长，常成对出现。',
    },
    {
      id: 'power',
      kind: 'companion',
      why: 'SUMSQ 里每个平方就是 POWER(数,2)，等价于 =SUM(区域^2) 的数组写法。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number1', label: '数字1', type: 'number', default: '3' },
      { key: 'number2', label: '数字2', type: 'number', default: '4' },
      { key: 'number3', label: '数字3（可选）', type: 'number', default: '' },
      { key: 'number4', label: '数字4（可选）', type: 'number', default: '' },
      { key: 'number5', label: '数字5（可选）', type: 'number', default: '' },
    ],
    template: '=SUMSQ({number1},{number2})',
    cases: [
      { label: 'SUMSQ(3,4) → 25', type: 'ok', values: { number1: '3', number2: '4' }, expect: '25', note: '3² + 4² = 9 + 16 = 25。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number1: 'abc', number2: '4' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default sumsqEntry;
