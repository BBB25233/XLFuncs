import type { FunctionEntry } from '@/types';

/** PERCENTILE.EXC · 百分位数（不含 0 与 1）（statistical 类 B3 批次） */

const TSV = '分数\n60\n70\n75\n80\n85\n90\n95\n100';

const percentileExcEntry: FunctionEntry = {
  id: 'percentile-exc',
  enName: 'PERCENTILE.EXC',
  zhName: '排除百分位数',
  zhCommon: ['PERCENTILE.EXC', '排除分位', '开区间分位'],
  alias: ['不含端点分位', 'EXC分位数', '严格分位'],
  category: 'statistical',
  abbr: 'pcbfws',
  pinyin: 'paichubaifenweishu',
  keywords: ['PERCENTILE.EXC', '排除端点', '开区间', '分位数', '统计口径'],
  difficulty: 4,
  usageLevel: 8,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'k 的有效范围是 1/(n+1) 到 n/(n+1)，比 INC 版本更严格。',
  },
  oneLiner: '百分位数，但 k 取不到 0 和 1（严格开区间）',
  summary:
    'EXC = exclusive，与 INC 的区别只在端点：EXC 的 k 必须落在 1/(n+1) 与 n/(n+1) 之间（n 为数据个数），不能取 0 或 1，也不能取太靠近端点的极小/极大分位。这种口径在某些统计教材和统计软件（如 SPSS）里是默认做法。日常业务（P90、P95 监控）用 INC 即可，两者结果在中间区域非常接近，但端点附近差异明显。',
  syntax: {
    patternCn: '=PERCENTILE.EXC(区域, 百分位)',
    patternEn: '=PERCENTILE.EXC(array, k)',
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
        key: 'k',
        zh: '百分位',
        en: 'k',
        required: true,
        desc: '严格介于 1/(n+1) 与 n/(n+1) 之间的小数（不含 0 和 1）。',
        accepts: '0–1 之间的小数（但端点不可用）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ k=0、k=1 或过于靠近端点都会报 #NUM!。',
        example: '0.9',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该百分位对应的数值；k 超出 1/(n+1)~n/(n+1) 范围返回 #NUM!。',
  examples: [
    {
      title: '示例 1：与 INC 版本对比',
      scene: '同一组数据、同一个 k，看看两个版本差多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERCENTILE.EXC(A2:A9,0.5)',
      result: '82.5（本例与 PERCENTILE.INC 的中位数结果相同）',
      explanation:
        '在中间区域两者通常一致或极为接近；差异主要体现在靠近 0 或 1 的极端分位上。',
    },
    {
      title: '示例 2：k=0 或 k=1 会报错（INC 则允许）',
      scene: '想用 EXC 求最小值（0%）或最大值（100%）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERCENTILE.EXC(A2:A9,0)',
      result: '#NUM!（EXC 不允许取端点）',
      explanation: '这正是 EXC 的「排除」含义。要求最小值/最大值请直接用 MIN/MAX，或改用 INC 版本。',
    },
    {
      title: '示例 3：数据很少时可用范围非常窄',
      scene: '只有 3 个数据，k 的可用区间被压缩得很厉害。',
      dataTsv: '数值\n10\n20\n30',
      dataAnchor: 'A1',
      formula: '=PERCENTILE.EXC(A2:A4,0.5)',
      result: '20（n=3 时允许 0.25~0.75，0.5 可用）',
      explanation:
        'n=3 时 k 只能取 0.25 到 0.75 之间，取 0.1 或 0.9 都会报 #NUM!。样本越少，EXC 越容易报错。',
    },
  ],
  pitfalls: [
    {
      title: 'k 取 0、1 或过于靠近端点时报 #NUM!',
      reason: 'EXC 的有效范围是 1/(n+1) 到 n/(n+1)，端点被排除，这是设计使然。',
      fix: '改用 PERCENTILE.INC，或直接要最小值/最大值用 MIN/MAX。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '与 INC 混用导致同一 k 结果对不上',
      reason: '两者插值基准不同，同一个 k 会给出不同值，跨表核对时容易误判为「算错」。',
      fix: '全项目统一用一个版本（业务上默认 INC），并在报表注明口径。',
      level: 'high',
    },
    {
      title: '样本量小时频繁报错',
      reason: '数据越少，允许的 k 区间越窄。',
      fix: '样本少时改用 INC，或直接看排序后的原始数据。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'percentile-inc',
      kind: 'confusable',
      why: '同一 k 下两者口径不同（端点是否可取），是最容易混用出错的一对。',
    },
    {
      id: 'quartile-exc',
      kind: 'companion',
      why: 'QUARTILE.EXC 是 EXC 口径在 25/50/75 分位上的特例。',
    },
    {
      id: 'median',
      kind: 'companion',
      why: '中位数 = 50% 分位数，可用它快速校验分位计算是否落在合理位置。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:A9' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'A2:A9' },
      { key: 'k', label: '百分位 k', type: 'number', default: '0.5' },
    ],
    template: '=PERCENTILE.EXC({array},{k})',
    cases: [
      { label: 'k=0.5 中位数', type: 'ok', values: { array: 'A2:A9', k: '0.5' }, expect: '82.5', note: '8 个数据的 EXC 中位数' },
      { label: 'k=0 端点报错', type: 'error', values: { array: 'A2:A9', k: '0' }, expect: '#NUM!', note: 'EXC 不允许端点' },
      { label: 'k=1 端点报错', type: 'error', values: { array: 'A2:A9', k: '1' }, expect: '#NUM!', note: 'EXC 不允许端点' },
      { label: 'k 非数字', type: 'error', values: { array: 'A2:A9', k: 'abc' }, expect: '#VALUE!', note: 'k 必须数字' },
      { label: '区域非法', type: 'error', values: { array: 'ZZZ', k: '0.5' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default percentileExcEntry;
