import type { FunctionEntry } from '@/types';

/** TRIMMEAN · 去极值平均（statistical 类 B3 批次） */

const TSV = '评委\t打分\n1\t9.0\n2\t9.2\n3\t9.1\n4\t10\n5\t2\n6\t9.3\n7\t9.1\n8\t9.2\n9\t9.0\n10\t9.4';

const trimmeanEntry: FunctionEntry = {
  id: 'trimmean',
  enName: 'TRIMMEAN',
  zhName: '去极值平均',
  zhCommon: ['去极值平均', 'TRIMMEAN', '截尾平均'],
  alias: ['去掉最高最低', '截尾均值', '去掉极端值'],
  category: 'statistical',
  abbr: 'qjzpj',
  pinyin: 'qujizhipingjun',
  keywords: ['TRIMMEAN', '去极值', '截尾平均', '去掉最高最低', '评委打分'],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '按百分比去掉两端极端值后再求平均',
  summary:
    '比赛打分、满意度评分这类场景，个别评委可能给出极端高分或恶意低分，TRIMMEAN 能按比例先砍掉两端的极端值再平均，比手动「去掉一个最高分一个最低分」更灵活（按百分比控制）。第二个参数是要剔除的**总比例**：写 0.2 表示总共去掉 20%，即两端各去掉 10%。',
  syntax: {
    patternCn: '=TRIMMEAN(区域, 剔除比例)',
    patternEn: '=TRIMMEAN(array, percent)',
    args: [
      {
        key: 'array',
        zh: '区域',
        en: 'array',
        required: true,
        desc: '参与计算的数值区域。',
        accepts: '单元格区域，如 B2:B11。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: 'Excel 会自动把最接近两端的值剔除。',
        example: 'B2:B11',
        pitfallRank: 2,
      },
      {
        key: 'percent',
        zh: '剔除比例',
        en: 'percent',
        required: true,
        desc: '要从两端**合计**剔除的比例，0 到 1 之间。',
        accepts: '0–1 的小数，如 0.2 表示共去掉 20%（两端各 10%）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 是「两端合计」的比例，不是每端各这么多。',
        example: '0.2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回剔除两端极端值后的平均数；percent 越界返回 #NUM!。',
  examples: [
    {
      title: '示例 1：评委打分去掉两端各 10%',
      scene: '10 位评委，其中一位给了 2 分（明显异常），想排除极端值。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TRIMMEAN(B2:B11,0.2)',
      result: '约 9.16（去掉最低的 2 分和最高的 10 分后，剩余 8 个分数的平均）',
      explanation:
        '0.2 表示共剔除 20%，10 个数据即 2 个，两端各 1 个（最低 2、最高 10），剩下的 8 个分数平均得 9.16。',
    },
    {
      title: '示例 2：与 AVERAGE 对比看异常值影响',
      scene: '不剔除的话，一个恶意低分能把平均分拉低多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGE(B2:B11)',
      result: '8.53（被那个 2 分拉低了约 0.63 分）',
      explanation: 'TRIMMEAN 得 9.16、AVERAGE 得 8.53，一个极端值就造成 0.6 分以上的差距。',
    },
    {
      title: '示例 3：剔除比例写太大导致数据被砍光',
      scene: '_percent_ 写到 0.9，几乎把所有数据都剔除了。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TRIMMEAN(B2:B11,0.9)',
      result: '约 9.2（只剩中间 1 个数据，结果已不可靠）',
      explanation: '剔除比例过大会让样本量骤减，统计意义丧失。一般取 0.1–0.2 即可。',
    },
  ],
  pitfalls: [
    {
      title: '把 percent 当成「每端」的比例',
      reason: '实际是两端**合计**比例：0.2 表示两端各去掉 10%，不是各去掉 20%。',
      fix: '想两端各去掉 10% 就写 0.2；各去掉 20% 就写 0.4。',
      level: 'high',
    },
    {
      title: '剔除比例过大导致剩余样本太少',
      reason: '大量数据被砍掉后，平均值失去代表性。',
      fix: '一般取 0.1–0.2；同时确认剔除后仍有足够样本（建议不少于原数据的 60%）。',
      level: 'mid',
    },
    {
      title: '期望它精确去掉「一个最高一个最低」',
      reason: 'TRIMMEAN 按**百分比**剔除，具体个数由 Excel 取整决定，未必正好是你想要的个数。',
      fix: '要精确去掉固定个数，改用 (SUM(区域)-MAX(区域)-MIN(区域))/(COUNT(区域)-2)。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'average',
      kind: 'confusable',
      why: 'AVERAGE 不做任何剔除，容易被个别极端值带偏；数据脏时优先用 TRIMMEAN。',
    },
    {
      id: 'median',
      kind: 'alternative',
      why: '中位数天然抗极值且不需设置比例，是另一种稳健的中心度量方式。',
    },
    {
      id: 'large',
      kind: 'companion',
      why: '可用 LARGE/SMALL 先定位被剔除的极端值，验证 TRIMMEAN 剔除的是不是预期的那几个。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B11' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B11' },
      { key: 'percent', label: '剔除比例', type: 'number', default: '0.2' },
    ],
    template: '=TRIMMEAN({array}, {percent})',
    cases: [
      { label: '去掉两端各 10%', type: 'ok', values: { array: 'B2:B11', percent: '0.2' }, expect: '9.1625', note: '去掉最低 2 与最高 10 后平均' },
      { label: '剔除比例=1', type: 'error', values: { array: 'B2:B11', percent: '1' }, expect: '#NUM!', note: 'percent 须<1' },
      { label: '剔除比例为负', type: 'error', values: { array: 'B2:B11', percent: '-0.1' }, expect: '#NUM!', note: 'percent 须≥0' },
      { label: '非法区域', type: 'error', values: { array: 'ZZZ', percent: '0.2' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default trimmeanEntry;
