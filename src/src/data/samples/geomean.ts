import type { FunctionEntry } from '@/types';

/** GEOMEAN · 几何平均（statistical 类 B3 批次） */

const TSV = '年份\t增长率\n2021\t1.2\n2022\t1.5\n2023\t0.8';

const geomeanEntry: FunctionEntry = {
  id: 'geomean',
  enName: 'GEOMEAN',
  zhName: '几何平均',
  zhCommon: ['几何平均', 'GEOMEAN', '增长率平均'],
  alias: ['连乘开方', '复合增长率', '平均比率'],
  category: 'statistical',
  abbr: 'jhpj',
  pinyin: 'jihepingjun',
  keywords: ['GEOMEAN', '几何平均', '平均增长率', '复合增长', '连乘开方'],
  difficulty: 4,
  usageLevel: 15,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把 n 个数连乘后开 n 次方，专用于算「平均增长率」',
  summary:
    '算增长率的平均必须用几何平均，不能用算术平均。举例：第一年涨 20%、第二年涨 50%、第三年跌 20%，算术平均是 (1.2+1.5+0.8)/3 = 1.167（看似年均 +16.7%），但真实情况是 1.2×1.5×0.8 = 1.44，三年总共只涨 44%，几何平均 1.44^(1/3) ≈ 1.129，即年均 +12.9%。差别很大，用错会高估收益。它要求所有数都为正，含 0 或负数会报 #NUM!。',
  syntax: {
    patternCn: '=GEOMEAN(数字1, [数字2], …)',
    patternEn: '=GEOMEAN(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个正数（通常写成 1+增长率 的形式）。',
        accepts: '正数、单元格区域。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 所有数必须大于 0；含 0 或负数会报 #NUM!。',
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
  returnValue: '返回这组正数的几何平均（连乘后开 n 次方）；含 0 或负数返回 #NUM!。',
  examples: [
    {
      title: '示例 1：算真正的年均增长率',
      scene: '三年增长率分别为 +20%、+50%、−20%，求年均增长。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=GEOMEAN(B2:B4)',
      result: '1.1289（即年均增长 12.89%）',
      explanation:
        '连乘 1.2×1.5×0.8 = 1.44，开三次方得 1.1289。这才是真实的年均复合增长率。',
    },
    {
      title: '示例 2：与 AVERAGE 的差距（用错会高估）',
      scene: '同样是这三年，用算术平均会得出过于乐观的数字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGE(B2:B4)',
      result: '1.1667（即看似年均 +16.67%）',
      explanation:
        '算术平均给出 16.67%，几何平均给出 12.89%——差了近 4 个百分点。任何复利、增长率的场景都必须用 GEOMEAN。',
    },
    {
      title: '示例 3：含 0 或负数时报错',
      scene: '数据里有 0（如某年颗粒无收），公式报错。',
      dataTsv: '增长率\n1.2\n0\n1.5',
      dataAnchor: 'A1',
      formula: '=GEOMEAN(A2:A4)',
      result: '#NUM!（含 0，几何平均无定义）',
      explanation:
        '连乘后为 0、开方仍为 0，数学上失去意义。含零或负增长时，改用「(终值/初值)^(1/期数) − 1」直接算复合增长率。',
    },
  ],
  pitfalls: [
    {
      title: '用 AVERAGE 算增长率的平均',
      reason: '增长率是连乘关系，算术平均会系统性高估，涨跌幅度越大偏差越大。',
      fix: '增长率、收益率、指数类数据一律用 GEOMEAN。',
      level: 'high',
    },
    {
      title: '数据里含 0 或负数时报 #NUM!',
      reason: '几何平均要求所有数为正；0 会让连乘为 0，负数开偶次方无实数解。',
      fix: '改用 (终值/初值)^(1/期数)−1 直接算；或先把增长率转成 1+r 且确保为正。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '把百分比直接当数字传进去',
      reason: '如直接写 20、50、−20，几何平均会把它们当倍数处理，结果荒谬。',
      fix: '先转成 1+r 的形式（1.2、1.5、0.8），算完再减 1 变回增长率。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'harmean',
      kind: 'confusable',
      why: '同属特殊平均数：几何平均用于连乘/增长率，调和平均用于速率/单价平均。',
    },
    {
      id: 'average',
      kind: 'confusable',
      why: '算术平均适用于「相加」关系的量；增长率是连乘关系，用 AVERAGE 会高估。',
    },
    {
      id: 'trimmean',
      kind: 'companion',
      why: '数据含极端值时，可先用 TRIMMEAN 去掉极值再算，思路类似但目的不同。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { numbers: 'B2:B4' },
    fields: [
      { key: 'numbers', label: '数据区域', type: 'ref', default: 'B2:B4', hint: '增长率列（1+增长率）' },
    ],
    template: '=GEOMEAN({numbers})',
    cases: [
      { label: 'ok 用例', type: 'ok', values: {}, expect: '1.129243', note: '几何平均（连乘开方）≈ 1.1292' },
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

export default geomeanEntry;
