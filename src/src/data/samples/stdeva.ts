import type { FunctionEntry } from '@/types';

/** STDEVA · 含文本的样本标准差（statistical 类 B3 批次） */

const TSV = '姓名\t成绩\n张三\t85\n李四\t缺考\n王五\t72\n赵六\t0';

const stdevaEntry: FunctionEntry = {
  id: 'stdeva',
  enName: 'STDEVA',
  zhName: '含文本的样本标准差',
  zhCommon: ['STDEVA', '含文本标准差', '文本算0'],
  alias: ['文字按0的波动', '不忽略文本', '全量样本波动'],
  category: 'statistical',
  abbr: 'hwbdybbzc',
  pinyin: 'hanwenbendeyangbenbiaozhuncha',
  keywords: ['STDEVA', '含文本', '文本按0', '样本标准差', '逻辑值参与'],
  difficulty: 4,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '样本标准差，但把文本当 0、TRUE 当 1、FALSE 当 0 一起算进去',
  summary:
    'STDEVA = STDEV.S 的「不忽略文本」版本：文本记 0 分、TRUE 记 1、FALSE 记 0，再按样本口径（除以 n−1）算标准差。它与 AVERAGEA 是一套口径——既然平均时把「缺考」当 0，那算波动时也应该保持一致，否则分子分母口径不统一。空单元格仍然被忽略。',
  syntax: {
    patternCn: '=STDEVA(值1, [值2], …)',
    patternEn: '=STDEVA(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个值或区域。',
        accepts: '单元格、区域、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '文本按 0、TRUE 按 1 参与计算；空单元格仍被忽略。',
        example: 'B2:B5',
        pitfallRank: 1,
      },
      {
        key: 'value2',
        zh: '值2',
        en: 'value2',
        required: false,
        desc: '后续值或区域，可继续追加。',
        accepts: '同「值1」。',
        ifOmitted: '不写就只用第一个参数。',
        tip: '至少需要 2 个有效值。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回样本标准差（文本=0、TRUE=1、FALSE=0，除以 n−1）；有效值少于 2 个返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：缺考按 0 分时的成绩波动',
      scene: '成绩表里「缺考」要按 0 分处理，算整体分化程度。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEVA(B2:B5)',
      result: '约 45.63（把「缺考」当 0 后，4 个值的样本标准差）',
      explanation: '四个值 85、0、72、0 参与计算，波动很大，符合「缺考拉大差距」的直觉。',
    },
    {
      title: '示例 2：与 STDEV.S 对比（是否忽略文本）',
      scene: '同一份数据，看看忽略与不忽略文本的差别。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEV.S(B2:B5)',
      result: '约 45.79（只算 85、72、0 三个数字）',
      explanation:
        'STDEV.S 跳过文本只算 3 个数，STDEVA 算 4 个（补 0）。分母不同结果就不同——要用哪个，取决于业务上「缺考算不算 0 分」。',
    },
    {
      title: '示例 3：与 AVERAGEA 配套使用',
      scene: '平均值用了 AVERAGEA（文本算 0），波动就该配套用 STDEVA。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGEA(B2:B5)',
      result: '39.25（配套口径的平均值；波动用 STDEVA 才一致）',
      explanation:
        '统计口径要前后一致：平均用 AVERAGEA，波动就要用 STDEVA；平均用 AVERAGE，波动就用 STDEV.S。混着用会得出自相矛盾的结论。',
    },
  ],
  pitfalls: [
    {
      title: '与 AVERAGE/STDEV.S 的口径混用',
      reason: '平均忽略文本、波动却把文本算 0（或反过来），两个指标口径不一致，结论会自相矛盾。',
      fix: 'AVERAGEA + STDEVA 一套，AVERAGE + STDEV.S 一套，选定后贯穿全表。',
      level: 'high',
    },
    {
      title: '误以为它和 STDEV.S 一样会跳过文本',
      reason: '带 A 后缀的函数恰恰是不跳过文本，把文本按 0 计入。',
      fix: '想忽略文本用 STDEV.S；想让文本按 0 参与才用 STDEVA。',
      level: 'high',
    },
    {
      title: '有效值少于 2 个时报 #DIV/0!',
      reason: '样本标准差的除数是 n−1。',
      fix: '确保至少 2 个有效值，或用 IFERROR 兜底。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'stdev-s',
      kind: 'confusable',
      why: 'STDEV.S 跳过文本、STDEVA 把文本当 0，同一份数据结果不同。',
    },
    {
      id: 'averagea',
      kind: 'companion',
      why: 'AVERAGEA 与 STDEVA 是同一套口径（文本按 0），统计时应配对使用。',
    },
    {
      id: 'stdevpa',
      kind: 'confusable',
      why: 'STDEVPA 是总体口径（除以 n）的含文本版本，样本/总体别选错。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B5' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B5' },
    ],
    template: '=STDEVA({array})',
    cases: [
      { label: '含文本样本标准差', type: 'ok', values: { array: 'B2:B5' }, expect: '45.631678', note: '缺考按0' },
      { label: '只有1个有效值', type: 'error', values: { array: 'B2:B2' }, expect: '#DIV/0!', note: 'n<2' },
      { label: '无有效值', type: 'error', values: { array: 'B6' }, expect: '#DIV/0!', note: '空单元格' },
      { label: '区域非法', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default stdevaEntry;
