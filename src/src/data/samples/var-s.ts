import type { FunctionEntry } from '@/types';

/** VAR.S · 样本方差（statistical 类 B3 批次） */

const TSV = '批次\t重量(g)\n1\t100\n2\t102\n3\t98\n4\t101\n5\t99';

const varSEntry: FunctionEntry = {
  id: 'var-s',
  enName: 'VAR.S',
  zhName: '样本方差',
  zhCommon: ['方差', '样本方差', 'VAR.S'],
  alias: ['离散程度平方', '波动平方', '均方差'],
  category: 'statistical',
  abbr: 'ybfc',
  pinyin: 'yangbenfangcha',
  keywords: ['VAR.S', '方差', '样本', '离散程度', 'n-1', '标准差平方'],
  difficulty: 4,
  usageLevel: 20,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 VAR（新版保留为兼容性函数）。',
  },
  oneLiner: '样本方差——标准差的平方（按样本口径，除以 n−1）',
  summary:
    '方差就是标准差的平方，同样衡量离散程度。它的缺点很直观：单位是原单位的平方（重量是「克」，方差就是「平方克」），没法直接和均值比较，所以**汇报时几乎总是用标准差**。方差的价值在于数学性质好，是方差分析（ANOVA）、回归分解等统计方法的基石。日常只要记住「方差 = 标准差²」、抽样用 VAR.S 即可。',
  syntax: {
    patternCn: '=VAR.S(数字1, [数字2], …)',
    patternEn: '=VAR.S(number1, [number2], …)',
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
        tip: '至少需要 2 个数字。',
        example: 'C2:C6',
      },
    ],
  },
  returnValue: '返回样本方差（除以 n−1）；有效数字少于 2 个返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：算样本方差',
      scene: '抽检 5 个产品重量，算方差。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VAR.S(B2:B6)',
      result: '2.5（因为 STDEV.S = 1.58，1.58² ≈ 2.5）',
      explanation: '方差 2.5 的单位是「平方克」，不直观——这正是汇报时更常用标准差的原因。',
    },
    {
      title: '示例 2：用 SQRT 转回标准差',
      scene: '已经有了方差，想看回标准差。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SQRT(VAR.S(B2:B6))',
      result: '1.58（与直接用 STDEV.S 一致）',
      explanation: 'SQRT(VAR.S(...)) 恒等于 STDEV.S(...)，可用来交叉验证公式是否正确。',
    },
    {
      title: '示例 3：与 VAR.P 对比',
      scene: '同一组数据，总体口径会更小。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VAR.P(B2:B6)',
      result: '2.0（除以 n=5，比 VAR.S 的 2.5 小）',
      explanation: '抽样用 VAR.S，全量用 VAR.P。',
    },
  ],
  pitfalls: [
    {
      title: '直接把方差当波动大小汇报',
      reason: '方差单位是原单位的平方，数值会被放大（或缩小）到难以直观理解，读者无法判断「大还是小」。',
      fix: '对外汇报一律用标准差；方差只在做统计检验、方差分解时使用。',
      level: 'high',
    },
    {
      title: '抽样数据误用 VAR.P',
      reason: '除以 n 会低估波动。',
      fix: '抽样用 VAR.S，全量用 VAR.P。',
      level: 'high',
    },
    {
      title: '数据少于 2 个时报 #DIV/0!',
      reason: '样本方差除数为 n−1。',
      fix: '确保至少 2 个有效数字。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'stdev-s',
      kind: 'companion',
      why: '标准差是方差的平方根，两者口径一致；SQRT(VAR.S(...)) = STDEV.S(...)。',
    },
    {
      id: 'var-p',
      kind: 'confusable',
      why: '两者只差样本/总体口径（n−1 vs n），选错会系统性影响结果。',
    },
    {
      id: 'vara',
      kind: 'alternative',
      why: '需要把文本按 0、TRUE 按 1 计入时改用 VARA。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B6' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B6' },
    ],
    template: '=VAR.S({array})',
    cases: [
      { label: '样本方差', type: 'ok', values: { array: 'B2:B6' }, expect: '2.5', note: '100/102/98/101/99 样本方差' },
      { label: '单文本格（无数字）', type: 'error', values: { array: 'A2:A2' }, expect: '#DIV/0!', note: '区域无有效数字' },
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

export default varSEntry;
