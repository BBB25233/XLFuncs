import type { FunctionEntry } from '@/types';

/** HARMEAN · 调和平均（statistical 类 B3 批次） */

const TSV = '路段\t速度(km/h)\n上坡\t30\n平路\t60\n下坡\t90';

const harmeanEntry: FunctionEntry = {
  id: 'harmean',
  enName: 'HARMEAN',
  zhName: '调和平均',
  zhCommon: ['调和平均', 'HARMEAN', '速率平均'],
  alias: ['倒数平均', '平均速度', '单价平均'],
  category: 'statistical',
  abbr: 'thpj',
  pinyin: 'tiaohepingjun',
  keywords: ['HARMEAN', '调和平均', '平均速度', '等距离', '倒数平均', '速率'],
  difficulty: 4,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '倒数的算术平均的倒数，专用于算「等距离/等金额」下的平均速率',
  summary:
    '经典场景：去程 30 km/h、回程 60 km/h（距离相同），平均速度不是 45，而是 40——因为慢的那段耗时更长，权重更大。调和平均正是处理这种「相同距离/相同金额」下求平均速率的正确工具（等额分批买入股票算平均成本同理）。它要求所有数为正，含 0 或负数会报 #NUM!。三者关系恒为：调和平均 ≤ 几何平均 ≤ 算术平均。',
  syntax: {
    patternCn: '=HARMEAN(数字1, [数字2], …)',
    patternEn: '=HARMEAN(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个正数。',
        accepts: '正数、单元格区域。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 所有数必须大于 0；含 0 或负数报 #NUM!。',
        example: 'B2:B4',
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
        example: 'C2:C4',
      },
    ],
  },
  returnValue: '返回这组正数的调和平均；含 0 或负数返回 #NUM!。',
  examples: [
    {
      title: '示例 1：往返平均速度（等距离）',
      scene: '去程 30、回程 60，求全程平均速度。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=HARMEAN(B2:B3)',
      result: '40 km/h（而不是算术平均的 45）',
      explanation:
        '设单程 60 公里：去程 2 小时、回程 1 小时，总共 120 公里 / 3 小时 = 40。慢的一段耗时更长，所以平均值被拉向较慢的一侧。',
    },
    {
      title: '示例 2：等额分批买入的平均成本',
      scene: '每月固定投入 1000 元买基金，三次买入价不同，算平均持仓成本。',
      dataTsv: '批次\t买入价\n1\t10\n2\t12.5\n3\t8',
      dataAnchor: 'A1',
      formula: '=HARMEAN(B2:B4)',
      result: '约 9.87 元',
      explanation:
        '每批金额相同（等额买入）时，平均成本是调和平均；若每批买入的**份额**相同，才用算术平均。',
    },
    {
      title: '示例 3：含 0 或负数报错',
      scene: '数据里有一项为 0（如某段速度为 0，即停滞）。',
      dataTsv: '速度\n30\n0\n60',
      dataAnchor: 'A1',
      formula: '=HARMEAN(A2:A4)',
      result: '#NUM!（含 0，倒数不存在）',
      explanation: '调和平均要先取倒数，0 没有倒数，因此报错。先处理掉 0 值再计算。',
    },
  ],
  pitfalls: [
    {
      title: '用算术平均算往返速度',
      reason: '等距离场景下，慢的一段耗时更长、权重更大，算术平均会高估实际平均速度。',
      fix: '等距离/等金额求平均速率用 HARMEAN；等时间/等份额才用 AVERAGE。',
      level: 'high',
    },
    {
      title: '含 0 或负数时报 #NUM!',
      reason: '计算过程需要取倒数，0 无倒数；负数会导致结果失去意义。',
      fix: '先清洗数据：0 值需查明原因（是缺失还是真实为 0），处理后再算。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '不确定该用算术/几何/调和中的哪一个',
      reason: '三者适用场景不同，选错结果差异明显。',
      fix: '相加关系用算术平均（AVERAGE）；连乘/增长率用几何平均（GEOMEAN）；等距离/等金额的速率用调和平均（HARMEAN）。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'geomean',
      kind: 'confusable',
      why: '同属特殊平均数，几何平均管连乘/增长率、调和平均管速率，且恒有 调和 ≤ 几何 ≤ 算术。',
    },
    {
      id: 'average',
      kind: 'confusable',
      why: '算术平均最大；在速率类问题上误用它会高估结果。',
    },
    {
      id: 'trimmean',
      kind: 'companion',
      why: '若数据含极端值影响判断，可考虑先用 TRIMMEAN 去极值。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'B2:B3' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'B2:B3', hint: '速度列' },
    ],
    template: '=HARMEAN({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '40', note: '调和平均（等距离平均速度）= 40' },
      { label: '区域非法 B:B', type: 'error', values: { numbers: 'B:B' }, expect: '#REF!', note: '区域引用不合法 → #REF!' },
      { label: '区域非法 A:B', type: 'error', values: { numbers: 'A:B' }, expect: '#REF!', note: '缺少行号 → #REF!' },
      { label: '区域非法 2:6', type: 'error', values: { numbers: '2:6' }, expect: '#REF!', note: '缺少列标 → #REF!' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default harmeanEntry;
