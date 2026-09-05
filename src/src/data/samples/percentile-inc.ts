import type { FunctionEntry } from '@/types';

/** PERCENTILE.INC · 百分位数（含 0 与 1）（statistical 类 B3 批次） */

const TSV = '分数\n60\n70\n75\n80\n85\n90\n95\n100';

const percentileIncEntry: FunctionEntry = {
  id: 'percentile-inc',
  enName: 'PERCENTILE.INC',
  zhName: '包含百分位数',
  zhCommon: ['百分位数', '分位数', 'PERCENTILE'],
  alias: ['百分之多少位置', 'P90', '中位数分位'],
  category: 'statistical',
  abbr: 'bhbfws',
  pinyin: 'baohanbaifenweishu',
  keywords: ['PERCENTILE.INC', '百分位数', '分位数', 'P95', '中位数', '线性插值'],
  difficulty: 4,
  usageLevel: 25,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 PERCENTILE（新版保留为兼容性函数）。',
  },
  oneLiner: '算出「有百分之多少的数据小于等于它」的那个值',
  summary:
    '百分位数回答的是「排在什么位置」：PERCENTILE.INC(区域, 0.5) 就是中位数，0.9 表示「90% 的数据都不超过它」（常说的 P90）。INC 表示 k 可以取 0 到 1 的**闭区间**（含 0 和 1），是最常用的版本。它不是简单地取某个现有数据，而是在相邻两个数之间做线性插值，所以结果常常是个没在数据里出现过的值。',
  syntax: {
    patternCn: '=PERCENTILE.INC(区域, 百分位)',
    patternEn: '=PERCENTILE.INC(array, k)',
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
        desc: '0 到 1 之间（含 0 和 1）的小数。0.5 = 中位数，0.9 = P90。',
        accepts: '0–1 的小数、百分比（如 90%）、或单元格引用。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 必须写成 0.9 或 90%，写成 90 会被当成 9000% 而报错。',
        example: '0.9',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该百分位对应的数值（相邻值之间线性插值）；k 越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：算中位数（50% 分位）',
      scene: '8 个分数，用百分位函数求中位数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERCENTILE.INC(A2:A9,0.5)',
      result: '82.5（第 4 个 80 与第 5 个 85 的中间值）',
      explanation: '8 个数时中位数落在第 4、5 个之间，线性插值得到 82.5，与 MEDIAN 结果一致。',
    },
    {
      title: '示例 2：算 P90（常用于性能/耗时指标）',
      scene: '接口响应时间，用 P90 而不是平均值来衡量用户体验。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERCENTILE.INC(A2:A9,0.9)',
      result: '96.5',
      explanation:
        '表示 90% 的数据不超过 96.5。做性能监控、SLA 承诺时，P90/P95 比平均值更能反映长尾用户的真实感受。',
    },
    {
      title: '示例 3：k 写成 90（而不是 0.9）会报错',
      scene: '按直觉写「90」表示 90%，结果报错。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PERCENTILE.INC(A2:A9,90)',
      result: '#NUM!（k 超出 0–1 范围）',
      explanation: '必须写 0.9 或 90%。写成 90 相当于 9000%，超出允许范围。',
    },
  ],
  pitfalls: [
    {
      title: '把百分位写成 90 而不是 0.9',
      reason: 'k 必须是 0–1 之间的小数（或百分比形式），写整数 90 会被理解为 9000%。',
      fix: '写成 0.9 或 90%。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '期待结果是数据里真实存在的某个值',
      reason: '函数在相邻两个数据之间做线性插值，结果往往不在原数据中（如 82.5、96.5）。',
      fix: '这是标准做法。若必须取原数据中的值，可配合 ROUND 与 MATCH 自行定位。',
      level: 'mid',
    },
    {
      title: '数据太少时分位数不稳定',
      reason: '样本量小的时候，一个极端值就能让 P90 大幅波动，结论不可靠。',
      fix: '样本量建议不少于 20–30 个；样本太少时直接看排序后的原始分布更稳妥。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'percentile-exc',
      kind: 'confusable',
      why: 'EXC 版本的 k 是开区间（0–1 不含端点），同一 k 下两者结果略有差异，混用会对不上。',
    },
    {
      id: 'median',
      kind: 'companion',
      why: 'PERCENTILE.INC(区域,0.5) 与 MEDIAN 结果相同，中位数就是 50% 分位数。',
    },
    {
      id: 'quartile-inc',
      kind: 'companion',
      why: 'QUARTILE.INC(区域,2) 等同于 50% 分位数；四分位是百分位的特例（25/50/75）。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'A2:A9' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'A2:A9' },
      { key: 'k', label: '百分位 k', type: 'number', default: '0.5' },
    ],
    template: '=PERCENTILE.INC({array},{k})',
    cases: [
      { label: 'k=0.5 中位数', type: 'ok', values: { array: 'A2:A9', k: '0.5' }, expect: '82.5', note: 'INC 中位数' },
      { label: 'k=0.9 P90', type: 'ok', values: { array: 'A2:A9', k: '0.9' }, expect: '96.5', note: 'P90' },
      { label: 'k 超出上界', type: 'error', values: { array: 'A2:A9', k: '1.5' }, expect: '#NUM!', note: 'k>1' },
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

export default percentileIncEntry;
