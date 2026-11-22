import type { FunctionEntry } from '@/types';

/** VARA · 含文本的样本方差（statistical 类 B3 批次） */

const TSV = '姓名\t成绩\n张三\t85\n李四\t缺考\n王五\t72\n赵六\t0';

const varaEntry: FunctionEntry = {
  id: 'vara',
  enName: 'VARA',
  zhName: '含文本的样本方差',
  zhCommon: ['VARA', '含文本方差', '文本算0方差'],
  alias: ['文字按0的方差', '不忽略文本方差', '全量样本方差'],
  category: 'statistical',
  abbr: 'hwbdybfc',
  pinyin: 'hanwenbendeyangbenfangcha',
  keywords: ['VARA', '含文本', '样本方差', '文本按0', '逻辑值参与'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '样本方差，且把文本当 0、TRUE 当 1、FALSE 当 0 一起算进去',
  summary:
    'VARA = VAR.S 的「不忽略文本」版本：文本记 0、TRUE 记 1、FALSE 记 0，再按样本口径（除以 n−1）算方差。它与 AVERAGEA、STDEVA 属于同一套口径——三者要成对使用，否则平均值和离散度会出现口径矛盾。空单元格依然被忽略。',
  syntax: {
    patternCn: '=VARA(值1, [值2], …)',
    patternEn: '=VARA(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个值或区域。',
        accepts: '单元格、区域、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '文本按 0、TRUE 按 1 参与；空单元格忽略。',
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
  returnValue: '返回样本方差（文本=0、TRUE=1、FALSE=0，除以 n−1）；有效值少于 2 个返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：缺考按 0 分时的成绩方差',
      scene: '「缺考」按 0 分参与统计，算方差。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VARA(B2:B5)',
      result: '约 2082（STDEVA ≈ 45.63，45.63² ≈ 2082）',
      explanation: '四个值 85、0、72、0 参与，方差数值很大，反映了缺考造成的分化。',
    },
    {
      title: '示例 2：与 VAR.S 对比（是否忽略文本）',
      scene: '同一份数据，忽略文本时结果不同。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VAR.S(B2:B5)',
      result: '约 2096（只算 85、72、0 三个数字）',
      explanation: 'VAR.S 跳过文本只算 3 个数，VARA 算 4 个（补 0）。业务口径决定该用哪个。',
    },
    {
      title: '示例 3：与 STDEVA 的关系验证',
      scene: '确认方差与标准差是否匹配。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SQRT(VARA(B2:B5))',
      result: '45.63（与 STDEVA 一致）',
      explanation: 'SQRT(VARA(...)) = STDEVA(...)，可用来交叉验证。',
    },
  ],
  pitfalls: [
    {
      title: '与 AVERAGE/VAR.S 口径混用',
      reason: '平均忽略文本、方差却把文本算 0，两个指标口径不一致，结论自相矛盾。',
      fix: 'AVERAGEA + VARA/STDEVA 一套，AVERAGE + VAR.S/STDEV.S 一套，选定后贯穿全表。',
      level: 'high',
    },
    {
      title: '误以为它和 VAR.S 一样跳过文本',
      reason: '带 A 后缀恰恰是不跳过文本、按 0 计入。',
      fix: '想忽略文本用 VAR.S；想让文本按 0 参与才用 VARA。',
      level: 'high',
    },
    {
      title: '有效值少于 2 个时报 #DIV/0!',
      reason: '样本方差除数为 n−1。',
      fix: '确保至少 2 个有效值，或用 IFERROR 兜底。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'var-s',
      kind: 'confusable',
      why: 'VAR.S 跳过文本、VARA 把文本当 0，同一份数据结果不同。',
    },
    {
      id: 'stdeva',
      kind: 'companion',
      why: 'SQRT(VARA(...)) = STDEVA(...)，两者同为「含文本 + 样本」口径。',
    },
    {
      id: 'varpa',
      kind: 'confusable',
      why: 'VARPA 是总体口径（除以 n）的含文本版本，样本/总体别选错。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B5' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B5' },
    ],
    template: '=VARA({array})',
    cases: [
      { label: '含文本的样本方差', type: 'ok', values: { array: 'B2:B5' }, expect: '2082.25', note: '85/缺考(0)/72/0 文本按0' },
      { label: '单文本格（有效值不足）', type: 'error', values: { array: 'A2:A2' }, expect: '#DIV/0!', note: '有效值不足2个' },
      { label: '非法区域', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: '非法区域' },
      { label: '非法区域2', type: 'error', values: { array: '###' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default varaEntry;
