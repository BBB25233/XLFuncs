import type { FunctionEntry } from '@/types';

/** STDEVPA · 含文本的总体标准差（statistical 类 B3 批次） */

const TSV = '姓名\t成绩\n张三\t85\n李四\t缺考\n王五\t72\n赵六\t0';

const stdevpaEntry: FunctionEntry = {
  id: 'stdevpa',
  enName: 'STDEVPA',
  zhName: '含文本的总体标准差',
  zhCommon: ['STDEVPA', '含文本总体标准差', '全量含文本'],
  alias: ['文本算0的总体波动', '不忽略文本全量', 'STDEVPA波动'],
  category: 'statistical',
  abbr: 'hwbdztbzc',
  pinyin: 'hanwenbendezongtibiaozhuncha',
  keywords: ['STDEVPA', '含文本', '总体标准差', '除以n', '文本按0'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '总体标准差，且把文本当 0、TRUE 当 1、FALSE 当 0 一起算进去',
  summary:
    'STDEVPA = STDEV.P 的「不忽略文本」版本：文本记 0、TRUE 记 1、FALSE 记 0，并按总体口径（除以 n）计算。它对应「数据就是全量 + 文本必须按 0 参与」这两个条件同时成立的场景，与 AVERAGEA/STDEVA 属于同一族口径，只是除数用 n 而非 n−1。',
  syntax: {
    patternCn: '=STDEVPA(值1, [值2], …)',
    patternEn: '=STDEVPA(value1, [value2], …)',
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
        tip: '总体口径下 1 个值也能算（结果为 0）。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回总体标准差（文本=0、TRUE=1、FALSE=0，除以 n）；无有效值返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：全量数据且缺考按 0 分',
      scene: '这 4 人就是全部参考人员，且「缺考」按 0 分计，算整体波动。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEVPA(B2:B5)',
      result: '约 39.52（85、0、72、0 四个值的总体标准差）',
      explanation: '除以 n=4（而非 n−1=3），所以结果比 STDEVA 的 45.63 小。',
    },
    {
      title: '示例 2：与 STDEVA 的差别（除数不同）',
      scene: '同样把文本算 0，样本口径与总体口径差在哪。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=STDEVA(B2:B5)',
      result: '约 45.63（除以 n−1=3）',
      explanation: 'STDEVA 用 n−1、STDEVPA 用 n。全量数据用 PA，抽样数据用 A。',
    },
    {
      title: '示例 3：与 AVERAGEA 配套',
      scene: '平均用 AVERAGEA（文本算 0）时，波动配套用同口径函数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGEA(B2:B5)',
      result: '39.25（配套口径的平均值）',
      explanation: '全量场景：AVERAGEA + STDEVPA；抽样场景：AVERAGEA + STDEVA。口径要成对统一。',
    },
  ],
  pitfalls: [
    {
      title: '抽样数据用了总体口径（PA）',
      reason: '除以 n 会低估波动，抽检推断场景应该用 STDEVA（除以 n−1）。',
      fix: '全量用 STDEVPA，抽样用 STDEVA。',
      level: 'high',
    },
    {
      title: '与 STDEV.P 混用导致结果对不上',
      reason: 'STDEV.P 忽略文本、STDEVPA 把文本按 0，同一份数据结果不同。',
      fix: '确认文本该不该参与，再选对应版本，并全表统一。',
      level: 'high',
    },
    {
      title: '区域里没有任何有效值',
      reason: '除数为 0。',
      fix: '检查数据区域是否正确、是否全是空单元格。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'stdeva',
      kind: 'confusable',
      why: '两者都把文本按 0，区别只在样本（n−1）与总体（n）口径。',
    },
    {
      id: 'stdev-p',
      kind: 'confusable',
      why: 'STDEV.P 忽略文本、STDEVPA 把文本按 0，同为总体口径但处理方式不同。',
    },
    {
      id: 'averagea',
      kind: 'companion',
      why: 'AVERAGEA 与 STDEVPA 同属「文本按 0」口径，统计时应配对使用。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B5' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B5' },
    ],
    template: '=STDEVPA({array})',
    cases: [
      { label: '含文本总体标准差', type: 'ok', values: { array: 'B2:B5' }, expect: '39.518192', note: '缺考按0' },
      { label: '无有效值', type: 'error', values: { array: 'B6' }, expect: '#DIV/0!', note: '空单元格' },
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

export default stdevpaEntry;
