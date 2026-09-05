import type { FunctionEntry } from '@/types';

/** MEDIAN · 中位数（statistical 类 B3 批次） */

const TSV = '姓名\t月薪\n张三\t8000\n李四\t9500\n王五\t12000\n赵六\t15000\n孙七\t80000';

const medianEntry: FunctionEntry = {
  id: 'median',
  enName: 'MEDIAN',
  zhName: '中位数',
  zhCommon: ['中位数', '中值', '中间值'],
  alias: ['排在中间的数', '去掉极值看中间', '50分位'],
  category: 'statistical',
  abbr: 'zws',
  pinyin: 'zhongweishu',
  keywords: ['MEDIAN', '中位数', '中值', '抗极值', '平均工资', '排序取中'],
  difficulty: 2,
  usageLevel: 45,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把所有数从小到大排，取正中间那个（偶数个取中间两个的平均）',
  summary:
    '中位数最大的好处是「抗极值」：一个老板月薪 8 万，会把 5 个人的平均月薪从 1.1 万拉到 2.49 万，但中位数仍是 1.2 万，更能反映普通人的真实水平。所以谈工资、房价这类分布很偏的数据时，中位数比平均数可信得多。个数为奇数时取正中间；偶数时取中间两个的平均值。',
  syntax: {
    patternCn: '=MEDIAN(数字1, [数字2], …)',
    patternEn: '=MEDIAN(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个数字或区域。',
        accepts: '单元格、区域（如 B2:B6）、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '区域里的文本、逻辑值、空格会被自动忽略。',
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
        tip: '可一直追加。',
        example: 'C2:C6',
      },
    ],
  },
  returnValue: '返回这组数的中位数；偶数个数字时返回中间两个数的平均值。',
  examples: [
    {
      title: '示例 1：奇数个数据取正中间',
      scene: '5 个人的月薪，想看「中间那个人」挣多少。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=MEDIAN(B2:B6)',
      result: '12000（排序后为 8000、9500、12000、15000、80000，正中间是 12000）',
      explanation: '5 个数排序后第 3 个就是中位数。注意它完全没有被 80000 这个极值影响。',
    },
    {
      title: '示例 2：与 AVERAGE 对比，看清极值的影响',
      scene: '同组数据，平均数被老板的 8 万拉高，需要用中位数说明真实情况。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGE(B2:B6)',
      result: '24900（而中位数只有 12000）',
      explanation:
        '平均数 24900 比 4 个普通员工的工资都高，明显失真；中位数 12000 才代表「中间水平」。汇报收入、房价时优先用中位数。',
    },
    {
      title: '示例 3：偶数个数据取中间两个的平均',
      scene: '4 个分数，中位数落在中间两个数之间。',
      dataTsv: '分数\n60\n70\n85\n95',
      dataAnchor: 'A1',
      formula: '=MEDIAN(A2:A5)',
      result: '(70 + 85) ÷ 2 = 77.5',
      explanation: '偶数个时没有唯一的「中间值」，Excel 取中间两个数的平均，得 77.5。',
    },
  ],
  pitfalls: [
    {
      title: '期待偶数个数据时返回某个真实存在的数',
      reason: '偶数个时返回的是中间两个数的平均，这个值可能根本不在原数据里（如 77.5）。',
      fix: '这是正常结果。若必须取原数据中的某个值，可改用 LARGE/SMALL 配合计数取第 n 个。',
      level: 'mid',
    },
    {
      title: '把中位数当成「平均数」汇报',
      reason: '两者口径不同，中位数代表中间水平、平均数代表总体水平，混用会误导决策。',
      fix: '偏态分布（工资、房价）用中位数；需要算总额/均摊时用平均数。汇报时注明用的是哪个。',
      level: 'mid',
    },
    {
      title: '区域里混进了不该参与的文本',
      reason: 'MEDIAN 会忽略文本，但如果本该是数字的位置填了文字，等于静默丢样本。',
      fix: '先用 COUNT 核对参与计算的数字个数是否与预期一致。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'average',
      kind: 'confusable',
      why: '两者都描述「中心水平」，但平均数受极值影响大、中位数抗极值。偏态数据优先用 MEDIAN。',
    },
    {
      id: 'percentile-inc',
      kind: 'companion',
      why: 'PERCENTILE.INC(区域,0.5) 的结果与 MEDIAN 相同，中位数就是 50% 分位数。',
    },
    {
      id: 'mode-sngl',
      kind: 'companion',
      why: '众数看「哪个值出现最多」，与中位数、平均数合称三大集中趋势指标。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'B2:B6' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'B2:B6', hint: '月薪列' },
    ],
    template: '=MEDIAN({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '12000', note: '奇数个数据取正中间 = 12000' },
      { label: '区域为纯文本（无数字）', type: 'error', values: { numbers: 'A2:A6' }, expect: '#NUM!', note: '姓名列无数字，算不出中位数 → #NUM!' },
      { label: '区域非法 B:B', type: 'error', values: { numbers: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { numbers: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default medianEntry;
