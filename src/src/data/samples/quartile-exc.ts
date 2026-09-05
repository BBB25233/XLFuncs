import type { FunctionEntry } from '@/types';

/** QUARTILE.EXC · 四分位数（不含 0 与 1）（statistical 类 B3 批次） */

const TSV = '分数\n60\n70\n75\n80\n85\n90\n95\n100';

const quartileExcEntry: FunctionEntry = {
  id: 'quartile-exc',
  enName: 'QUARTILE.EXC',
  zhName: '排除四分位数',
  zhCommon: ['QUARTILE.EXC', '排除四分位', 'EXC四分位'],
  alias: ['开区间四分位', '严格四分位', 'EXC Q1Q3'],
  category: 'statistical',
  abbr: 'pcsfws',
  pinyin: 'paichusifenweishu',
  keywords: ['QUARTILE.EXC', '排除端点', '四分位', 'Q1', 'Q3', '统计口径'],
  difficulty: 4,
  usageLevel: 6,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'quart 只能取 1、2、3（不能取 0 和 4），因为端点被排除。',
  },
  oneLiner: '四分位数，但采用排除端点的口径（只能取 Q1/Q2/Q3）',
  summary:
    'EXC 版本的四分位：与 INC 的区别是端点被排除，所以第二个参数**只能取 1、2、3**（Q1/中位数/Q3），取 0（最小值）或 4（最大值）会报错——因为它不认为 0% 和 100% 是合法分位。这种口径在部分统计教材里是默认的。Excel 里做箱线图、业务报表默认用 INC 即可。',
  syntax: {
    patternCn: '=QUARTILE.EXC(区域, 第几个四分位)',
    patternEn: '=QUARTILE.EXC(array, quart)',
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
        desc: '只能取 1(Q1)、2(中位数)、3(Q3)；0 和 4 不可用。',
        accepts: '1、2 或 3。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 端点被排除，写 0 或 4 会报 #NUM!。',
        example: '1',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回对应四分位的数值；quart 取 0、4 或超出 1–3 返回 #NUM!。',
  examples: [
    {
      title: '示例 1：求 Q1 与 Q3（EXC 口径）',
      scene: '8 个分数，用 EXC 口径算上下四分位。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=QUARTILE.EXC(A2:A9,1)',
      result: 'Q1 = 71.25；换成 3 得 Q3 = 92.5',
      explanation:
        '对比 INC 的 Q1=73.75、Q3=91.25，可见同口径差异：EXC 的区间更宽。这正是混用会导致结论不一致的原因。',
    },
    {
      title: '示例 2：取 0 或 4 会报错',
      scene: '想用 EXC 求最小值或最大值。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=QUARTILE.EXC(A2:A9,0)',
      result: '#NUM!（EXC 不允许取端点 0 和 4）',
      explanation: '要求最小值/最大值直接用 MIN/MAX，或改用 QUARTILE.INC 并传 0/4。',
    },
    {
      title: '示例 3：用中位数交叉校验',
      scene: '验证 EXC 的 Q2 是否等于中位数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=QUARTILE.EXC(A2:A9,2)',
      result: '82.5（与 MEDIAN 一致）',
      explanation: '无论 INC 还是 EXC，50% 分位都是中位数，可用它快速判断公式是否用对。',
    },
  ],
  pitfalls: [
    {
      title: '第二个参数写 0 或 4',
      reason: 'EXC 排除端点，只认 1/2/3。',
      fix: '改用 QUARTILE.INC 传 0/4，或直接用 MIN/MAX。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '与 QUARTILE.INC 混用，导致箱线图/异常值判定不一致',
      reason: '同数据的 Q1/Q3 不同，IQR 与异常值边界也随之改变。',
      fix: '全项目统一口径（默认 INC），并在报表注明用的是哪个版本。',
      level: 'high',
    },
    {
      title: '样本太少时报错',
      reason: 'EXC 要求数据个数足够（少于 3 个时无有效分位）。',
      fix: '样本少时改用 INC，或直接观察排序后的原始数据。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'quartile-inc',
      kind: 'confusable',
      why: '同一数据的 Q1/Q3 不同、可用参数范围也不同（INC 支持 0–4，EXC 仅 1–3），是最容易混用的一对。',
    },
    {
      id: 'percentile-exc',
      kind: 'companion',
      why: 'QUARTILE.EXC(区域,1) 等同于 PERCENTILE.EXC(区域,0.25)，两者同为排除端点口径。',
    },
    {
      id: 'median',
      kind: 'companion',
      why: 'EXC 的 Q2 与 MEDIAN 一致，可用于交叉校验。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:A9' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'A2:A9' },
      { key: 'quart', label: '四分位 quart', type: 'number', default: '1' },
    ],
    template: '=QUARTILE.EXC({array},{quart})',
    cases: [
      { label: 'Q1=quart1', type: 'ok', values: { array: 'A2:A9', quart: '1' }, expect: '71.25', note: 'EXC Q1' },
      { label: 'quart=0 报错', type: 'error', values: { array: 'A2:A9', quart: '0' }, expect: '#NUM!', note: 'EXC 不支持 0' },
      { label: 'quart=4 报错', type: 'error', values: { array: 'A2:A9', quart: '4' }, expect: '#NUM!', note: 'EXC 不支持 4' },
      { label: 'quart 非数字', type: 'error', values: { array: 'A2:A9', quart: 'abc' }, expect: '#VALUE!', note: 'quart 必须数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default quartileExcEntry;
