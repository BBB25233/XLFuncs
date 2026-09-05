import type { FunctionEntry } from '@/types';

/** STDEV.P · 总体标准差（statistical 类 B3 批次） */

const TSV = '学生\t成绩\n张三\t85\n李四\t92\n王五\t78\n赵六\t88\n孙七\t95';

const stdevPEntry: FunctionEntry = {
  id: 'stdev-p',
  enName: 'STDEV.P',
  zhName: '总体标准差',
  zhCommon: ['总体标准差', 'STDEV.P', '全量标准差'],
  alias: ['全量波动', '除以n的标准差', '总体离散'],
  category: 'statistical',
  abbr: 'ztbzc',
  pinyin: 'zongtibiaozhuncha',
  keywords: ['STDEV.P', '总体标准差', '全量', '离散程度', '除以n'],
  difficulty: 3,
  usageLevel: 25,
  version: {
    min: '2010',
    label: 'Excel 2010 起可用',
    notes: 'Excel 2007 及更早用旧函数 STDEVP（新版保留为兼容性函数）。',
  },
  oneLiner: '衡量整组数据的波动大小（按总体口径，除以 n）',
  summary:
    'STDEV.P 假设你手上的数据**就是全部**（不是抽样），计算时直接除以 n，结果比 STDEV.S 略小。典型场景：全班 50 人的成绩都在表里、某商品全部历史订单都在表里——这时候不存在「用样本估计总体」的问题，就该用 P。反之，如果你只是抽检了 5 个产品去推断整批，必须用 S。',
  syntax: {
    patternCn: '=STDEV.P(数字1, [数字2], …)',
    patternEn: '=STDEV.P(number1, [number2], …)',
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
        tip: '至少需要 1 个数字（P 版本允许 n=1，结果为 0）。',
        example: 'C2:C6',
      },
    ],
  },
  returnValue: '返回总体标准差（除以 n）；有效数字为空返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：全班成绩的波动（全量数据）',
      scene: '5 名学生的成绩都在表里，不是抽样，算整体波动。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEV.P(B2:B6)',
      result: '约 5.91 分',
      explanation: '因为这就是全部数据，除以 n=5，得到总体标准差 5.91，可直接用于描述这批学生的分化程度。',
    },
    {
      title: '示例 2：与 STDEV.S 的差别',
      scene: '同样 5 个成绩，改用样本口径会略大。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEV.S(B2:B6)',
      result: '约 6.61 分（比 P 版本的 5.91 大）',
      explanation: 'S 除以 n−1=4、P 除以 n=5，所以 S 更大。全量数据用 P 才准确。',
    },
    {
      title: '示例 3：所有数据都一样时结果为 0',
      scene: '5 个数值完全相同，没有任何波动。',
      dataTsv: '数值\n50\n50\n50\n50\n50',
      dataAnchor: 'A1',
      formula: '=STDEV.P(A2:A6)',
      result: '0（完全无波动）',
      explanation: '标准差为 0 表示数据完全一致，这是正常的数学结果，不是公式出错。',
    },
  ],
  pitfalls: [
    {
      title: '抽样数据误用 P 版本',
      reason: 'P 除以 n 会低估总体波动，抽检推断场景应该用 S（除以 n−1）。',
      fix: '先判断数据是全量还是样本：全量用 P，样本用 S。',
      level: 'high',
    },
    {
      title: '与 STDEV.S 混用导致前后数字对不上',
      reason: '两者口径不同，同一批数据结果不同，跨表核对时容易误判为算错。',
      fix: '全项目统一口径，并在报表注明用的是 S 还是 P。',
      level: 'high',
    },
    {
      title: '区域里没有有效数字',
      reason: '全是文本或空格时无法计算。',
      fix: '检查数据类型，必要时清理或改用 STDEVPA。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'stdev-s',
      kind: 'confusable',
      why: '两者只差样本/总体口径，是最容易选错的一对：抽样用 S、全量用 P。',
    },
    {
      id: 'var-p',
      kind: 'companion',
      why: '方差是标准差的平方；VAR.P 与 STDEV.P 口径一致。',
    },
    {
      id: 'stdevpa',
      kind: 'alternative',
      why: '需要把文本按 0、TRUE 按 1 计入时改用 STDEVPA。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B6' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B6' },
    ],
    template: '=STDEV.P({array})',
    cases: [
      { label: '全班成绩总体标准差', type: 'ok', values: { array: 'B2:B6' }, expect: '5.885576', note: '全量数据' },
      { label: '无数字区域', type: 'error', values: { array: 'A2:A6' }, expect: '#DIV/0!', note: '全文本列' },
      { label: '区域非法1', type: 'error', values: { array: 'ZZZ' }, expect: '#REF!', note: '非法区域' },
      { label: '区域非法2', type: 'error', values: { array: '###' }, expect: '#REF!', note: '非法区域' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default stdevPEntry;
