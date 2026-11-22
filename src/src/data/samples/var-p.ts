import type { FunctionEntry } from '@/types';

/** VAR.P · 总体方差（statistical 类 B3 批次） */

const TSV = '学生\t成绩\n张三\t85\n李四\t92\n王五\t78\n赵六\t88\n孙七\t95';

const varPEntry: FunctionEntry = {
  id: 'var-p',
  enName: 'VAR.P',
  zhName: '总体方差',
  zhCommon: ['总体方差', 'VAR.P', '全量方差'],
  alias: ['全量波动平方', '除以n方差', '总体离散平方'],
  category: 'statistical',
  abbr: 'ztfc',
  pinyin: 'zongtifangcha',
  keywords: ['VAR.P', '总体方差', '全量', '除以n', '离散程度'],
  difficulty: 4,
  usageLevel: 14,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 VARP（新版保留为兼容性函数）。',
  },
  oneLiner: '总体方差——全量数据下标准差的平方（除以 n）',
  summary:
    'VAR.P 用于数据就是全部（非抽样）的场景，除以 n，结果比 VAR.S 小。它同样面临「单位是原单位平方」的可读性问题，所以日常汇报还是用 STDEV.P。VAR.P 主要出现在总体已知的描述统计、以及某些需要方差本身（而非标准差）的公式里。',
  syntax: {
    patternCn: '=VAR.P(数字1, [数字2], …)',
    patternEn: '=VAR.P(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个数字或区域。',
        accepts: '单元格区域、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '文本、逻辑值、空格会被忽略。',
        example: 'B2:B6',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '数字2',
        en: 'number2',
        required: false,
        desc: '后续数字或区域，可继续追加。',
        accepts: '同「数字1」。',
        ifOmitted: '不写就只用第一个参数。',
        tip: '总体口径下 1 个数字也能算（结果为 0）。',
        example: 'C2:C6',
      },
    ],
  },
  returnValue: '返回总体方差（除以 n）；无有效数字返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：全班成绩的总体方差',
      scene: '5 人就是全部学生（非抽样），算方差。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VAR.P(B2:B6)',
      result: '约 34.64（因为 STDEV.P ≈ 5.89，5.89² ≈ 34.64）',
      explanation: '全量数据除以 n=5。若这是抽样，就该改用 VAR.S（结果约 43.3）。',
    },
    {
      title: '示例 2：用 SQRT 验证与 STDEV.P 的关系',
      scene: '确认方差与标准差是否对得上。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SQRT(VAR.P(B2:B6))',
      result: '5.89（与 STDEV.P 完全一致）',
      explanation: 'SQRT(VAR.P(...)) = STDEV.P(...)，这是检查公式是否用对的好办法。',
    },
    {
      title: '示例 3：数据全相同时方差为 0',
      scene: '5 个数完全一样，没有任何离散。',
      dataTsv: '数值\n50\n50\n50\n50\n50',
      dataAnchor: 'A1',
      formula: '=VAR.P(A2:A6)',
      result: '0（无波动）',
      explanation: '方差为 0 表示数据完全一致，是正常结果。',
    },
  ],
  pitfalls: [
    {
      title: '抽样数据误用总体口径',
      reason: '除以 n 会低估波动，抽检推断场景应用 VAR.S。',
      fix: '全量用 VAR.P，抽样用 VAR.S。',
      level: 'high',
    },
    {
      title: '拿方差数值直接向业务方汇报',
      reason: '单位是原单位的平方，数值不直观。',
      fix: '汇报用标准差（STDEV.P / STDEV.S），方差留在统计计算内部使用。',
      level: 'high',
    },
    {
      title: '与 VAR.S 混用导致跨表对不上',
      reason: '两者口径不同，同一数据结果不同。',
      fix: '全项目统一口径并注明。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'stdev-p',
      kind: 'companion',
      why: 'SQRT(VAR.P(...)) = STDEV.P(...)，两者同属总体口径。',
    },
    {
      id: 'var-s',
      kind: 'confusable',
      why: '两者只差样本/总体口径（n−1 vs n），是最容易选错的一对。',
    },
    {
      id: 'varpa',
      kind: 'alternative',
      why: '需要把文本按 0、TRUE 按 1 计入时改用 VARPA。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B6' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B6' },
    ],
    template: '=VAR.P({array})',
    cases: [
      { label: '总体方差', type: 'ok', values: { array: 'B2:B6' }, expect: '34.64', note: '85/92/78/88/95 总体方差' },
      { label: '全文本列', type: 'error', values: { array: 'A2:A6' }, expect: '#DIV/0!', note: '区域无有效数字' },
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

export default varPEntry;
