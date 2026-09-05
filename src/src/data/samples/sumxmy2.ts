import type { FunctionEntry } from '@/types';

/** SUMXMY2 · 两数组差的平方和（math 类 B2 批次） */

const TSV = '实际\t预测\n100\t98\n120\t125\n90\t88\n110\t112';

const sumxmy2Entry: FunctionEntry = {
  id: 'sumxmy2',
  enName: 'SUMXMY2',
  zhName: '差的平方和',
  zhCommon: ['差的平方和', 'SUMXMY2', '误差平方和'],
  alias: ['SSE', '残差平方和', '两组差异平方'],
  category: 'math',
  abbr: 'cdpfh',
  pinyin: 'chadepingfanghe',
  keywords: ['SUMXMY2', '误差平方和', 'SSE', '残差', '预测误差', '最小二乘'],
  difficulty: 4,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '统计建模中计算残差平方和（SSE）时会用到。',
  },
  oneLiner: '两列数逐行相减，再把每个差值平方后全部加起来',
  summary:
    'SUMXMY2(x区域, y区域) = Σ(x − y)²，统计上就是著名的**误差平方和（SSE / 残差平方和）**——预测值与真实值差距的平方总和，是评估预测好坏、做最小二乘拟合的核心指标。同族三个函数里它最有实际价值。等价写法是 =SUMPRODUCT((x区域-y区域)^2)，后者更灵活也更好读。',
  syntax: {
    patternCn: '=SUMXMY2(x区域, y区域)',
    patternEn: '=SUMXMY2(array_x, array_y)',
    args: [
      {
        key: 'array_x',
        zh: 'x区域',
        en: 'array_x',
        required: true,
        desc: '第一组数值（通常放实际值）。',
        accepts: '单元格区域，如 A2:A5。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '两个区域必须等长，否则报 #N/A。',
        example: 'A2:A5',
        pitfallRank: 1,
      },
      {
        key: 'array_y',
        zh: 'y区域',
        en: 'array_y',
        required: true,
        desc: '第二组数值（通常放预测值）。',
        accepts: '单元格区域，如 B2:B5。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '行数必须与 x 区域相同。',
        example: 'B2:B5',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回 Σ(x − y)² 的结果；两区域大小不一致时返回 #N/A。',
  examples: [
    {
      title: '示例 1：算预测误差平方和（SSE）',
      scene: '有一组实际销售额和模型预测值，想量化预测偏差。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMXMY2(A2:A5,B2:B5)',
      result: '(100−98)²+(120−125)²+(90−88)²+(110−112)² = 4+25+4+4 = 37',
      explanation: '逐行相减再平方求和，得到误差平方和 37。数值越小说明预测越准。',
    },
    {
      title: '示例 2：用 SUMPRODUCT 得到同样结果',
      scene: '想要更灵活、可读性更好的写法。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SUMPRODUCT((A2:A5-B2:B5)^2)',
      result: '37（与 SUMXMY2 一致）',
      explanation:
        'SUMPRODUCT 写法同样结果，而且可以很方便地加权重或条件（如再乘一列权重），日常更推荐。',
    },
    {
      title: '示例 3：比较两套预测方案的优劣',
      scene: '两个模型各自给出预测，用 SSE 判断哪个更准。',
      dataTsv: '实际\t模型A\t模型B\n100\t98\t105\n120\t125\t118\n90\t88\t92\n110\t112\t108',
      dataAnchor: 'A1',
      formula: '=SUMXMY2(A2:A5,B2:B5)',
      result: '模型A：37；把区域换成 C2:C5 得模型B：25+4+4+4 = 37',
      explanation: '两列分别算 SSE 后比较，值小者更优。可配合 INDEX/MATCH 自动挑出最优模型。',
    },
  ],
  pitfalls: [
    {
      title: '两个区域大小不一致',
      reason: '逐元素运算要求长度相同。',
      fix: '核对两个区域的起止行是否对齐。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '与 SUMX2MY2 搞混：「差的平方」vs「平方的差」',
      reason:
        'SUMXMY2 = Σ(x−y)²（先减再平方），SUMX2MY2 = Σ(x²−y²)（先平方再减）。两者数学上完全不等价，名字只差一个 2 的位置。',
      fix: '做误差/残差分析时要用 SUMXMY2（先减后平方）；拿不准就用 SUMPRODUCT((A-B)^2) 手写，语义一目了然。',
      level: 'high',
    },
    {
      title: '直接用 SSE 横向比较不同规模的数据集',
      reason: 'SSE 会随样本量增大而增大，样本多的那组天然 SSE 更大，直接比不公平。',
      fix: '除以样本量得到均方误差 MSE，或再开方得到 RMSE：=SQRT(SUMXMY2(...)/COUNT(...))。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'sumx2my2',
      kind: 'confusable',
      why: '同族但含义不同：SUMX2MY2 是「平方的差」Σ(x²−y²)，SUMXMY2 是「差的平方」Σ(x−y)²。做残差分析要用后者。',
    },
    {
      id: 'sumx2py2',
      kind: 'confusable',
      why: '同族函数，算的是 Σ(x²+y²)，与误差分析无关。',
    },
    {
      id: 'sumproduct',
      kind: 'alternative',
      why: '=SUMPRODUCT((A-B)^2) 与 SUMXMY2 等价，且可加权重/条件，更灵活好读。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array_x: 'A2:A5', array_y: 'B2:B5' },
    fields: [
      { key: 'array_x', label: 'x区域', type: 'ref', default: 'A2:A5', rangeKey: 'array_x' },
      { key: 'array_y', label: 'y区域', type: 'ref', default: 'B2:B5', rangeKey: 'array_y' },
    ],
    template: '=SUMXMY2({array_x},{array_y})',
    cases: [
      { label: '默认：Σ((x−y)²)', type: 'ok', values: {}, expect: '37', note: '(100−98)²+(120−125)²+(90−88)²+(110−112)² = 4+25+4+4 = 37' },
      { label: '两区域大小不一致 → #N/A', type: 'error', values: { array_y: 'B2:B4' }, expect: '#N/A', note: 'x 区域 4 行、y 区域 3 行，长度不匹配' },
      { label: '区域含空白单元格 → #VALUE!', type: 'error', values: { array_x: 'A2:A6' }, expect: '#VALUE!', note: 'A2:A6 超出数据区，第 5 行是空白' },
      { label: '非法区域引用 → #REF!', type: 'error', values: { array_x: 'ZZZ' }, expect: '#REF!', note: 'ZZZ 不是合法区域引用' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default sumxmy2Entry;
