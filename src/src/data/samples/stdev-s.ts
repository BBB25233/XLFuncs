import type { FunctionEntry } from '@/types';

/** STDEV.S · 样本标准差（statistical 类 B3 批次） */

const TSV = '批次\t重量(g)\n1\t100\n2\t102\n3\t98\n4\t101\n5\t99';

const stdevSEntry: FunctionEntry = {
  id: 'stdev-s',
  enName: 'STDEV.S',
  zhName: '样本标准差',
  zhCommon: ['标准差', '样本标准差', 'STDEV.S'],
  alias: ['离散程度', '波动大小', '均方根偏差'],
  category: 'statistical',
  abbr: 'ybbzc',
  pinyin: 'yangbenbiaozhuncha',
  keywords: ['STDEV.S', '标准差', '样本', '离散程度', '波动', 'n-1'],
  difficulty: 3,
  usageLevel: 38,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 STDEV（新版保留为兼容性函数）。',
  },
  oneLiner: '衡量一组数据的波动大小（按样本口径，除以 n−1）',
  summary:
    '标准差是最常用的离散程度指标：值越大说明数据越分散、越不稳定。STDEV.S 用于**样本**——即这批数据只是总体中的一部分（抽检、抽样），计算时除以 n−1（贝塞尔校正），结果略大，是对总体波动的无偏估计。如果你手上就是全部数据（如全班成绩、全部订单），应该用 STDEV.P。日常绝大多数场景都是抽样，所以 STDEV.S 用得更多。',
  syntax: {
    patternCn: '=STDEV.S(数字1, [数字2], …)',
    patternEn: '=STDEV.S(number1, [number2], …)',
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
        tip: '至少需要 2 个数字才可能算出标准差。',
        example: 'C2:C6',
      },
    ],
  },
  returnValue: '返回样本标准差的估计值（除以 n−1）；有效数字少于 2 个返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：评估生产重量的稳定性',
      scene: '抽检 5 个产品的重量，看批次波动是否在允许范围内。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEV.S(B2:B6)',
      result: '约 1.58 克（平均 100 克，波动 ±1.58 克）',
      explanation: '标准差 1.58 克配合均值 100 克，可以判断这批产品的重量稳定性是否达标。',
    },
    {
      title: '示例 2：与 STDEV.P 对比（样本 vs 总体）',
      scene: '同一组数据，看看两种口径差多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEV.P(B2:B6)',
      result: '约 1.41 克（比 STDEV.S 的 1.58 小）',
      explanation:
        'STDEV.S 除以 n−1=4，STDEV.P 除以 n=5，所以 S 的结果更大。抽样数据用 S，全量数据用 P。',
    },
    {
      title: '示例 3：只有一个数字时报 #DIV/0!',
      scene: '数据只有一行，无法计算离散程度。',
      dataTsv: '重量\n100',
      dataAnchor: 'A1',
      formula: '=STDEV.S(A2:A2)',
      result: '#DIV/0!（样本标准差至少需要 2 个数字）',
      explanation: 'n−1 在 n=1 时为 0，数学上无法计算。',
    },
  ],
  pitfalls: [
    {
      title: '该用 P 的时候用了 S（或反之）',
      reason: '样本与总体的除数不同（n−1 vs n），混用会让波动被系统性高估或低估。',
      fix: '抽样数据用 STDEV.S；手上就是全部数据（全班成绩、全部订单）用 STDEV.P。',
      level: 'high',
    },
    {
      title: '数据少于 2 个时报 #DIV/0!',
      reason: '样本标准差的除数是 n−1，只有一个数时为 0。',
      fix: '确保区域里至少 2 个有效数字；或用 IFERROR 兜底。',
      level: 'high',
      errorCode: '#DIV/0!',
    },
    {
      title: '把「含文本的」当成了 S 版本',
      reason: 'STDEV.S 会忽略文本；若需要把文本按 0 计入，要用 STDEVA。',
      fix: '先确认文本该不该参与：不该参与用 STDEV.S，该按 0 参与用 STDEVA。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'stdev-p',
      kind: 'confusable',
      why: '两者只差样本/总体口径（n−1 vs n），选错会系统性影响波动的估计。',
    },
    {
      id: 'var-s',
      kind: 'companion',
      why: '方差就是标准差的平方；VAR.S 与 STDEV.S 口径一致，常一起看。',
    },
    {
      id: 'stdeva',
      kind: 'alternative',
      why: '需要把文本按 0、TRUE 按 1 计入时改用 STDEVA。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B6' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B6' },
    ],
    template: '=STDEV.S({array})',
    cases: [
      { label: '样本标准差', type: 'ok', values: { array: 'B2:B6' }, expect: '1.581139', note: '抽检数据' },
      { label: '只有1个数', type: 'error', values: { array: 'B2:B2' }, expect: '#DIV/0!', note: 'n<2' },
      { label: '无数字区域', type: 'error', values: { array: 'A1' }, expect: '#DIV/0!', note: '表头文本列' },
      { label: '区域非法', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default stdevSEntry;
