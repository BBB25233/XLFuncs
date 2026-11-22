import type { FunctionEntry } from '@/types';

/** QUARTILE.INC · 四分位数（含 0 与 1）（statistical 类 B3 批次） */

const TSV = '分数\n60\n70\n75\n80\n85\n90\n95\n100';

const quartileIncEntry: FunctionEntry = {
  id: 'quartile-inc',
  enName: 'QUARTILE.INC',
  zhName: '四分位数',
  zhCommon: ['四分位数', '四分位', 'QUARTILE'],
  alias: ['四等分', 'Q1Q2Q3', '上下四分位'],
  category: 'statistical',
  abbr: 'sfws',
  pinyin: 'sifenweishu',
  keywords: ['QUARTILE.INC', '四分位数', 'Q1', 'Q3', '箱体图', '四等分'],
  difficulty: 3,
  usageLevel: 25,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 QUARTILE（新版保留为兼容性函数）。',
  },
  oneLiner: '把数据四等分，取第 1/2/3 个分界点的值',
  summary:
    '四分位数就是把数据切成四段的三个切点：Q1（25%，较小的四分之一到这里为止）、Q2（50%，即中位数）、Q3（75%）。它是画箱线图、判断离群值的基础——常用 Q1−1.5×IQR 与 Q3+1.5×IQR 作为异常值边界（IQR = Q3−Q1）。第二个参数用 0–4 表示：0=最小值、1=Q1、2=中位数、3=Q3、4=最大值。',
  syntax: {
    patternCn: '=QUARTILE.INC(区域, 第几个四分位)',
    patternEn: '=QUARTILE.INC(array, quart)',
    args: [
      {
        key: 'array',
        zh: '区域',
        en: 'array',
        required: true,
        desc: '参与计算的数值区域。',
        accepts: '单元格区域，如 A2:A9。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '文本、空单元格会被忽略。',
        example: 'A2:A9',
        pitfallRank: 2,
      },
      {
        key: 'quart',
        zh: '第几个四分位',
        en: 'quart',
        required: true,
        desc: '0=最小值，1=Q1(25%)，2=中位数(Q2)，3=Q3(75%)，4=最大值。',
        accepts: '0 到 4 的整数。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 这里是 0–4 的整数，不是 0–1 的小数（那是 PERCENTILE 的写法）。',
        example: '1',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回对应四分位的数值；quart 超出 0–4 返回 #NUM!。',
  examples: [
    {
      title: '示例 1：求 Q1 与 Q3',
      scene: '8 个分数，算上下四分位。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=QUARTILE.INC(A2:A9,1)',
      result: 'Q1 = 73.75；把参数换成 3 得 Q3 = 91.25',
      explanation: 'Q1 是 25% 位置、Q3 是 75% 位置，中间 50% 的数据落在 73.75 到 91.25 之间。',
    },
    {
      title: '示例 2：用 IQR 判断异常值',
      scene: '箱线图常用 Q1−1.5×IQR、Q3+1.5×IQR 作为异常值边界。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=QUARTILE.INC(A2:A9,3)-QUARTILE.INC(A2:A9,1)',
      result: 'IQR = 91.25 − 73.75 = 17.5',
      explanation:
        '进而算出下界 73.75−26.25=47.5、上界 91.25+26.25=117.5。超出这个范围的值可视作异常值。',
    },
    {
      title: '示例 3：第二个参数写成 0.25 会报错',
      scene: '把四分位当成百分位写（0.25），公式报错。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=QUARTILE.INC(A2:A9,0.25)',
      result: '#NUM!（quart 必须是 0–4 的整数）',
      explanation: '四分位用 1/2/3 表示，百分位才用 0.25/0.5/0.75。用混了就会报错。',
    },
  ],
  pitfalls: [
    {
      title: '把 quart 写成 0.25 这类小数',
      reason: 'QUARTILE 的第二个参数是 0–4 的整数档位，不是 0–1 的小数比例。',
      fix: 'Q1 写 1、中位数写 2、Q3 写 3；若想用小数比例，改去用 PERCENTILE.INC。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '与 QUARTILE.EXC 混用导致 Q1/Q3 对不上',
      reason: '两者插值基准不同，同一份数据算出的 Q1/Q3 会有差异。',
      fix: '全项目统一口径（业务默认 INC），并在报表注明。',
      level: 'high',
    },
    {
      title: '数据太少时四分位数不稳定',
      reason: '样本量小的时候插值结果受单个值影响很大。',
      fix: '样本建议不少于 8–10 个；太少时直接看排序后的原始分布。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'quartile-exc',
      kind: 'confusable',
      why: 'EXC 采用排除端点的口径，同一数据的 Q1/Q3 与 INC 不同，混用会对不上。',
    },
    {
      id: 'percentile-inc',
      kind: 'companion',
      why: 'QUARTILE.INC(区域,1) 等同于 PERCENTILE.INC(区域,0.25)；四分位是百分位的特例。',
    },
    {
      id: 'median',
      kind: 'companion',
      why: 'QUARTILE.INC(区域,2) 就是中位数，可用来交叉校验。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:A9' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'A2:A9' },
      { key: 'quart', label: '四分位 quart', type: 'number', default: '2' },
    ],
    template: '=QUARTILE.INC({array},{quart})',
    cases: [
      { label: 'Q2=quart2 中位数', type: 'ok', values: { array: 'A2:A9', quart: '2' }, expect: '82.5', note: 'INC Q2' },
      { label: 'Q1=quart1', type: 'ok', values: { array: 'A2:A9', quart: '1' }, expect: '73.75', note: 'INC Q1' },
      { label: 'quart=5 报错', type: 'error', values: { array: 'A2:A9', quart: '5' }, expect: '#NUM!', note: 'quart>4' },
      { label: 'quart=0.5 → 60', type: 'ok', values: { array: 'A2:A9', quart: '0.5' }, expect: '60', note: 'Excel 对小数 quart 向零截尾，0.5 → 0 取最小值' },
      { label: 'quart 非数字', type: 'error', values: { array: 'A2:A9', quart: 'abc' }, expect: '#VALUE!', note: 'quart 必须数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default quartileIncEntry;
