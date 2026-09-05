import type { FunctionEntry } from '@/types';

/** AVERAGEA · 含文本的平均（statistical 类 B3 批次） */

const TSV = '姓名\t成绩\n张三\t85\n李四\t缺考\n王五\t72\n赵六\t0';

const averageaEntry: FunctionEntry = {
  id: 'averagea',
  enName: 'AVERAGEA',
  zhName: '含文本的平均',
  zhCommon: ['含文本平均', 'AVERAGEA', '全量平均'],
  alias: ['文本算0的平均', '不跳过文字', '所有格子都算'],
  category: 'statistical',
  abbr: 'hwbdpj',
  pinyin: 'hanwenbendepingjun',
  keywords: ['AVERAGEA', '含文本平均', '文本按0', '逻辑值参与', '不忽略文本'],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '算平均时把文本当 0、TRUE 当 1、FALSE 当 0 一起算进去',
  summary:
    'AVERAGE 会把文本和空格「跳过不计」，AVERAGEA 则把每个非空格子都算进来：文本和 FALSE 记 0 分、TRUE 记 1 分。所以同一个区域，AVERAGEA 的结果几乎总是比 AVERAGE 低——因为它把「缺考」「未填」这类文字当成了 0 分。想让缺考真的拉低平均分时用 AVERAGEA；想忽略它们时用 AVERAGE。',
  syntax: {
    patternCn: '=AVERAGEA(值1, [值2], …)',
    patternEn: '=AVERAGEA(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个要平均的单元格或区域。',
        accepts: '单元格、区域（如 B2:B5）、具体数字。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '区域内的文本按 0 参与计算，空单元格仍然被忽略。',
        example: 'B2:B5',
        pitfallRank: 1,
      },
      {
        key: 'value2',
        zh: '值2',
        en: 'value2',
        required: false,
        desc: '后续要一起平均的值或区域，可继续追加。',
        accepts: '同「值1」。',
        ifOmitted: '不写就只平均第一个参数。',
        tip: '可一直追加，没有数量上限（受公式长度限制）。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回所有非空值的平均数（文本=0、TRUE=1、FALSE=0、空单元格忽略）。',
  examples: [
    {
      title: '示例 1：缺考按 0 分计入平均',
      scene: '成绩表里有人写了「缺考」这种文字，老师要求缺考必须按 0 分拉低平均分。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGEA(B2:B5)',
      result: '(85 + 0 + 72 + 0) ÷ 4 = 39.25',
      explanation:
        '「缺考」被当成 0，所以总分只有 157，除以 4 人得 39.25。这正是要求「缺考算 0」时想要的结果。',
    },
    {
      title: '示例 2：与 AVERAGE 对比，看清差异',
      scene: '同一份数据，两种平均差很多，需要向同事解释原因。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGE(B2:B5)',
      result: '(85 + 72 + 0) ÷ 3 = 52.33（AVERAGE 直接跳过「缺考」这个文本）',
      explanation:
        'AVERAGE 只算了 3 个数字（85、72、0）得 52.33，AVERAGEA 算了 4 个（文本补 0）得 39.25。分母不同、分子也不同，结果自然会差很多。',
    },
    {
      title: '示例 3：逻辑值 TRUE/FALSE 参与计算',
      scene: '一列是否达标的逻辑值，想算「达标率」的平均。',
      dataTsv: '项目\t是否达标\n甲\tTRUE\n乙\tFALSE\n丙\tTRUE',
      dataAnchor: 'A1',
      formula: '=AVERAGEA(B2:B4)',
      result: '(1 + 0 + 1) ÷ 3 = 0.6667（即 66.67% 达标）',
      explanation:
        'TRUE 记 1、FALSE 记 0，所以 AVERAGEA 的平均值恰好等于 TRUE 的占比。这是它一个很实用的小技巧。',
    },
  ],
  pitfalls: [
    {
      title: '误以为它和 AVERAGE 一样会忽略文本',
      reason:
        '恰恰相反：AVERAGEA 的特色就是把文本按 0 计入。很多人只是随手用了带 A 的版本，结果平均分被莫名拉低。',
      fix: '想忽略文本用 AVERAGE；想让文本按 0 计入才用 AVERAGEA。选之前先想清楚业务口径。',
      level: 'high',
    },
    {
      title: '把「未填写」和「成绩 0 分」混为一谈',
      reason: 'AVERAGEA 把空白文字和真正的 0 分都算成 0，无法区分「缺考」与「考了 0 分」。',
      fix: '两者需要区分时，先用 COUNTBLANK/COUNTIF 单独统计缺考人数，再决定用哪种平均。',
      level: 'mid',
    },
    {
      title: '区域内有错误值',
      reason: '任何一个错误值都会让整个平均变成错误。',
      fix: '先用 IFERROR 清理上游，或改用 AGGREGATE 忽略错误。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'average',
      kind: 'confusable',
      why: 'AVERAGE 跳过文本、AVERAGEA 把文本当 0——两者最容易搞混，选错会让平均分差出一大截。',
    },
    {
      id: 'countblank',
      kind: 'companion',
      why: '先用 COUNTBLANK 弄清有多少真空单元格，再判断 AVERAGEA 的分母是否合理。',
    },
    {
      id: 'counta',
      kind: 'companion',
      why: 'COUNTA 数非空格子数，正好对应 AVERAGEA 的分母口径，可用来核对。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { values: 'B2:B5' },
    fields: [
      { key: 'values', label: '数据区域', type: 'ref', default: 'B2:B5', hint: '成绩列，文本「缺考」按 0 计入' },
    ],
    template: '=AVERAGEA({values})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '39.25', note: '文本按 0、85/72/0 参与，分母 4 → 39.25' },
      { label: '区域非法 B:B', type: 'error', values: { values: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { values: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
      { label: '区域非法 2:6', type: 'error', values: { values: '2:6' }, expect: '#REF!', note: '缺少列标 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default averageaEntry;
