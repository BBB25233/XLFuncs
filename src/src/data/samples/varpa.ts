import type { FunctionEntry } from '@/types';

/** VARPA · 含文本的总体方差（statistical 类 B3 批次） */

const TSV = '姓名\t成绩\n张三\t85\n李四\t缺考\n王五\t72\n赵六\t0';

const varpaEntry: FunctionEntry = {
  id: 'varpa',
  enName: 'VARPA',
  zhName: '含文本的总体方差',
  zhCommon: ['VARPA', '含文本总体方差', '全量含文本'],
  alias: ['文本算0的总体方差', '不忽略文本全量', 'VARPA方差'],
  category: 'statistical',
  abbr: 'hwbdztfc',
  pinyin: 'hanwenbendezongtifangcha',
  keywords: ['VARPA', '含文本', '总体方差', '除以n', '文本按0'],
  difficulty: 4,
  usageLevel: 4,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '总体方差，且把文本当 0、TRUE 当 1、FALSE 当 0 一起算进去',
  summary:
    'VARPA = VAR.P 的「不忽略文本」版本：文本记 0、TRUE 记 1、FALSE 记 0，并按总体口径（除以 n）计算。它同时满足两个条件：数据是全量（非抽样）+ 文本必须按 0 参与。与 AVERAGEA、STDEVPA 属于同一族口径，三者应成对使用。',
  syntax: {
    patternCn: '=VARPA(值1, [值2], …)',
    patternEn: '=VARPA(value1, [value2], …)',
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
  returnValue: '返回总体方差（文本=0、TRUE=1、FALSE=0，除以 n）；无有效值返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：全量数据且缺考按 0 分',
      scene: '这 4 人就是全部参考人员，缺考按 0 分，算方差。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VARPA(B2:B5)',
      result: '约 1280（STDEVPA ≈ 35.8，35.8² ≈ 1280）',
      explanation: '除以 n=4。若这是抽样数据，就该改用 VARA（结果约 1706）。',
    },
    {
      title: '示例 2：与 VARA 的差别（除数不同）',
      scene: '同样把文本算 0，样本与总体口径的差异。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VARA(B2:B5)',
      result: '约 1706（除以 n−1=3）',
      explanation: 'VARA 用 n−1、VARPA 用 n。全量用 VARPA，抽样用 VARA。',
    },
    {
      title: '示例 3：与 STDEVPA 的关系验证',
      scene: '确认方差与标准差是否匹配。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=SQRT(VARPA(B2:B5))',
      result: '35.8（与 STDEVPA 一致）',
      explanation: 'SQRT(VARPA(...)) = STDEVPA(...)，可用于交叉验证。',
    },
  ],
  pitfalls: [
    {
      title: '抽样数据用了总体口径',
      reason: '除以 n 会低估波动，抽检场景应使用 VARA（除以 n−1）。',
      fix: '全量用 VARPA，抽样用 VARA。',
      level: 'high',
    },
    {
      title: '与 VAR.P 混用导致结果对不上',
      reason: 'VAR.P 忽略文本、VARPA 把文本按 0，同一份数据结果不同。',
      fix: '确认文本是否该参与，再选版本并全表统一。',
      level: 'high',
    },
    {
      title: '区域里没有有效值',
      reason: '除数为 0。',
      fix: '检查数据区域是否正确。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'vara',
      kind: 'confusable',
      why: '两者都把文本按 0，区别只在样本（n−1）与总体（n）口径。',
    },
    {
      id: 'var-p',
      kind: 'confusable',
      why: 'VAR.P 忽略文本、VARPA 把文本按 0，同为总体口径但处理方式不同。',
    },
    {
      id: 'stdevpa',
      kind: 'companion',
      why: 'SQRT(VARPA(...)) = STDEVPA(...)，两者同为「含文本 + 总体」口径。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array: 'B2:B5' },
    fields: [
      { key: 'array', label: '数据区域', type: 'ref', default: 'B2:B5' },
    ],
    template: '=VARPA({array})',
    cases: [
      { label: '含文本的总体方差', type: 'ok', values: { array: 'B2:B5' }, expect: '1561.6875', note: '85/缺考(0)/72/0 文本按0' },
      { label: '空区域（无有效值）', type: 'error', values: { array: 'A10:A20' }, expect: '#DIV/0!', note: '无有效值' },
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

export default varpaEntry;
