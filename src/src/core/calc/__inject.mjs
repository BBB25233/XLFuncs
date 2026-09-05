// Inject calc configs into the 24 statistical sample files. Temporary.
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'src/data/samples/';

const block = (ranges, fields, template, cases) =>
`  calc: {
    enabled: true,
    ranges: ${ranges},
    fields: [
${fields}    ],
    template: '${template}',
    cases: [
${cases}    ],
  },`;

const ref = (k, l, d, h) => `      { key: '${k}', label: '${l}', type: 'ref', default: '${d}'${h ? `, hint: '${h}'` : ''} },\n`;
const num = (k, l, d, h) => `      { key: '${k}', label: '${l}', type: 'number', default: '${d}'${h ? `, hint: '${h}'` : ''} },\n`;
const txt = (k, l, d, h) => `      { key: '${k}', label: '${l}', type: 'text', default: '${d}'${h ? `, hint: '${h}'` : ''} },\n`;

const okCase = (expect, note, vals = '{}') =>
  `      { label: 'ok 用例', type: 'ok', values: ${vals}, expect: '${expect}', note: '${note}' },\n`;
const errCase = (label, expect, note, vals) =>
  `      { label: '${label}', type: 'error', values: ${vals}, expect: '${expect}', note: '${note}' },\n`;

const R = (a, b) => `{ ${a}: '${b}' }`;

const configs = {
  avedev: block(
    R('numbers', 'B2:B6'),
    ref('numbers', '数据区域', 'B2:B6', '测量值列'),
    '=AVEDEV({numbers})',
    okCase('1.2', 'AVEDEV=平均绝对偏差，结果 1.2') +
      errCase('区域写成 B:B（缺行号）', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域写成 A:B（缺行号）', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`) +
      errCase('区域写成 2:6（缺列标）', '#REF!', '缺少列标 → #REF!', `{ numbers: '2:6' }`)
  ),
  averagea: block(
    R('values', 'B2:B5'),
    ref('values', '数据区域', 'B2:B5', '成绩列，文本「缺考」按 0 计入'),
    '=AVERAGEA({values})',
    okCase('39.25', '文本按 0、85/72/0 参与，分母 4 → 39.25') +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ values: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ values: 'A:B' }`) +
      errCase('区域非法 2:6', '#REF!', '缺少列标 → #REF!', `{ values: '2:6' }`)
  ),
  'binom-dist': block(
    '{}',
    num('number_s', '成功次数 k', '4') +
      num('trials', '试验次数 n', '10') +
      num('probability_s', '单次成功率 p', '0.3') +
      txt('cumulative', '累积?', 'FALSE', 'TRUE=最多 k 次，FALSE=恰好 k 次'),
    '=BINOM.DIST({number_s},{trials},{probability_s},{cumulative})',
    okCase('0.200121', '恰好 4 次成功的概率质量 ≈ 0.2001') +
      errCase('成功率写成 2（>1）', '#NUM!', 'p 必须在 0–1，写 2 报 #NUM!', `{ probability_s: '2' }`) +
      errCase('成功次数大于试验次数', '#NUM!', 'k>n 报 #NUM!', `{ number_s: '11', trials: '10' }`) +
      errCase('累积参数非 TRUE/FALSE', '#VALUE!', '累积参数必须是逻辑值 → #VALUE!', `{ cumulative: 'YES' }`)
  ),
  correl: block(
    `{ array1: 'B2:B6', array2: 'C2:C6' }`,
    ref('array1', '第一组数据', 'B2:B6', '广告费') + ref('array2', '第二组数据', 'C2:C6', '销售额'),
    '=CORREL({array1},{array2})',
    okCase('0.995591', '广告费与销售额的 Pearson 相关系数') +
      errCase('两组数据个数不一致', '#N/A', 'y 与 x 行数不同 → #N/A', `{ array1: 'B2:B6', array2: 'C2:C5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ array1: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ array1: 'A:B' }`)
  ),
  countblank: block(
    R('range', 'B2:B4'),
    ref('range', '区域', 'B2:B4', '电话列，含一处空白'),
    '=COUNTBLANK({range})',
    okCase('1', '电话列只有李四一处空白') +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ range: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ range: 'A:B' }`) +
      errCase('区域非法 2:6', '#REF!', '缺少列标 → #REF!', `{ range: '2:6' }`)
  ),
  'covariance-p': block(
    `{ array1: 'B2:B6', array2: 'C2:C6' }`,
    ref('array1', '第一组数据', 'B2:B6', '广告费') + ref('array2', '第二组数据', 'C2:C6', '销售额'),
    '=COVARIANCE.P({array1},{array2})',
    okCase('2080', '总体协方差，除以 n=5') +
      errCase('两组个数不一致', '#N/A', '行数不同 → #N/A', `{ array1: 'B2:B6', array2: 'C2:C5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ array1: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ array1: 'A:B' }`)
  ),
  'covariance-s': block(
    `{ array1: 'B2:B6', array2: 'C2:C6' }`,
    ref('array1', '第一组数据', 'B2:B6', '广告费') + ref('array2', '第二组数据', 'C2:C6', '销售额'),
    '=COVARIANCE.S({array1},{array2})',
    okCase('2600', '样本协方差，除以 n-1=4') +
      errCase('两组个数不一致', '#N/A', '行数不同 → #N/A', `{ array1: 'B2:B6', array2: 'C2:C5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ array1: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ array1: 'A:B' }`)
  ),
  devsq: block(
    R('numbers', 'B2:B6'),
    ref('numbers', '数据区域', 'B2:B6', '测量值列'),
    '=DEVSQ({numbers})',
    okCase('10', '离差平方和 Σ(x−均值)² = 10') +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`) +
      errCase('区域非法 2:6', '#REF!', '缺少列标 → #REF!', `{ numbers: '2:6' }`)
  ),
  'forecast-linear': block(
    `{ known_ys: 'C2:C6', known_xs: 'B2:B6' }`,
    num('x', '要预测的 x', '60') +
      ref('known_ys', '已知的 y', 'C2:C6', '销售额') +
      ref('known_xs', '已知的 x', 'B2:B6', '广告费'),
    '=FORECAST.LINEAR({x},{known_ys},{known_xs})',
    okCase('606', '线性外推 x=60 的预测值（截距−18+斜率10.4×60）') +
      errCase('x 非数字', '#VALUE!', 'x 必须是数字 → #VALUE!', `{ x: 'abc' }`) +
      errCase('已知 x 与 y 个数不一致', '#N/A', '行数不同 → #N/A', `{ known_ys: 'C2:C6', known_xs: 'B2:B5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ known_ys: 'B:B' }`)
  ),
  frequency: block(
    R('data_array', 'A2:A11'),
    ref('data_array', '数据区域', 'A2:A11', '分数列') +
      txt('bins', '分段上限', '60;80;100', '分号隔开，如 60;80;100'),
    '=FREQUENCY({data_array},{bins})',
    okCase('1;4;5;0', '≤60 / 61–80 / 81–100 / >100 的频数', '{}') +
      errCase('分段上限含非数字', '#VALUE!', 'bins 必须都是数字 → #VALUE!', `{ bins: '60;abc;100' }`) +
      errCase('数据区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ data_array: 'B:B' }`) +
      errCase('分段上限为空', '#NUM!', 'bins 不能为空 → #NUM!', `{ bins: '' }`)
  ),
  geomean: block(
    R('numbers', 'B2:B4'),
    ref('numbers', '数据区域', 'B2:B4', '增长率列（1+增长率）'),
    '=GEOMEAN({numbers})',
    okCase('1.129243', '几何平均（连乘开方）≈ 1.1292') +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`) +
      errCase('区域非法 2:6', '#REF!', '缺少列标 → #REF!', `{ numbers: '2:6' }`)
  ),
  growth: block(
    `{ known_ys: 'B2:B6', known_xs: 'A2:A6' }`,
    ref('known_ys', '已知的 y', 'B2:B6', '用户数') +
      ref('known_xs', '已知的 x', 'A2:A6', '年份') +
      num('new_x', '新的 x', '6'),
    '=GROWTH({known_ys},{known_xs},{new_x})',
    okCase('7687.293149', '指数拟合预测 x=6 的用户数（已简化）') +
      errCase('已知 x 与 y 个数不一致', '#N/A', '行数不同 → #N/A', `{ known_ys: 'B2:B6', known_xs: 'A2:A5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ known_ys: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ known_xs: 'A:B' }`)
  ),
  harmean: block(
    R('numbers', 'B2:B3'),
    ref('numbers', '数据区域', 'B2:B3', '速度列'),
    '=HARMEAN({numbers})',
    okCase('40', '调和平均（等距离平均速度）= 40') +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`) +
      errCase('区域非法 2:6', '#REF!', '缺少列标 → #REF!', `{ numbers: '2:6' }`)
  ),
  intercept: block(
    `{ known_ys: 'C2:C6', known_xs: 'B2:B6' }`,
    ref('known_ys', '已知的 y', 'C2:C6', '销售额') + ref('known_xs', '已知的 x', 'B2:B6', '广告费'),
    '=INTERCEPT({known_ys},{known_xs})',
    okCase('-18', '回归截距 = ȳ − 斜率·x̄') +
      errCase('已知 x 与 y 个数不一致', '#N/A', '行数不同 → #N/A', `{ known_ys: 'C2:C6', known_xs: 'B2:B5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ known_ys: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ known_xs: 'A:B' }`)
  ),
  kurt: block(
    R('numbers', 'B2:B9'),
    ref('numbers', '数据区域', 'B2:B9', '日活列'),
    '=KURT({numbers})',
    okCase('-3.295677', '超额峰度（按 Excel 公式，本数据恰为负）') +
      errCase('数据少于 4 个', '#DIV/0!', '单格无法算峰度 → #DIV/0!', `{ numbers: 'B2:B2' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`)
  ),
  large: block(
    R('array', 'B2:B5'),
    ref('array', '区域', 'B2:B5', '销售额列') + num('k', '第几大', '2'),
    '=LARGE({array},{k})',
    okCase('15000', '第二大值 = 15000') +
      errCase('k 超过数据个数', '#NUM!', '只有 4 个数据，第 5 大不存在 → #NUM!', `{ array: 'B2:B5', k: '5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ array: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ array: 'A:B' }`)
  ),
  linest: block(
    `{ known_ys: 'C2:C6', known_xs: 'B2:B6' }`,
    ref('known_ys', '已知的 y', 'C2:C6', '销售额') + ref('known_xs', '已知的 x', 'B2:B6', '广告费'),
    '=LINEST({known_ys},{known_xs})',
    okCase('10.4', '线性回归斜率（已简化，仅返回斜率）') +
      errCase('已知 x 与 y 个数不一致', '#N/A', '行数不同 → #N/A', `{ known_ys: 'C2:C6', known_xs: 'B2:B5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ known_ys: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ known_xs: 'A:B' }`)
  ),
  logest: block(
    `{ known_ys: 'B2:B6', known_xs: 'A2:A6' }`,
    ref('known_ys', '已知的 y', 'B2:B6', '用户数') + ref('known_xs', '已知的 x', 'A2:A6', '年份'),
    '=LOGEST({known_ys},{known_xs})',
    okCase('1.503325', '指数底数 b≈1.503（已简化，仅返回 b）') +
      errCase('已知 x 与 y 个数不一致', '#N/A', '行数不同 → #N/A', `{ known_ys: 'B2:B6', known_xs: 'A2:A5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ known_ys: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ known_xs: 'A:B' }`)
  ),
  median: block(
    R('numbers', 'B2:B6'),
    ref('numbers', '数据区域', 'B2:B6', '月薪列'),
    '=MEDIAN({numbers})',
    okCase('12000', '奇数个数据取正中间 = 12000') +
      errCase('区域为纯文本（无数字）', '#NUM!', '姓名列无数字，算不出中位数 → #NUM!', `{ numbers: 'A2:A6' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`)
  ),
  'mode-mult': block(
    R('numbers', 'A2:A7'),
    ref('numbers', '数据区域', 'A2:A7', '数值列（含并列）'),
    '=MODE.MULT({numbers})',
    okCase('10;20;30', '10/20/30 均出现 2 次，全部众数（已简化，分号分隔）') +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`) +
      errCase('区域非法 2:6', '#REF!', '缺少列标 → #REF!', `{ numbers: '2:6' }`)
  ),
  'mode-sngl': block(
    R('numbers', 'B2:B7'),
    ref('numbers', '数据区域', 'B2:B7', '编码列（尺码映射）'),
    '=MODE.SNGL({numbers})',
    okCase('3', '编码 3（L 码）出现 3 次，为众数') +
      errCase('区域为纯文本（无数字）', '#N/A', '尺码列是文本，MODE.SNGL 找不到众数 → #N/A', `{ numbers: 'A2:A7' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ numbers: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ numbers: 'A:B' }`)
  ),
  'norm-dist': block(
    '{}',
    num('x', '待求值', '115') +
      num('mean', '均值', '100') +
      num('standard_dev', '标准差', '15') +
      txt('cumulative', '累积?', 'TRUE', 'TRUE=累积概率，FALSE=概率密度'),
    '=NORM.DIST({x},{mean},{standard_dev},{cumulative})',
    okCase('0.841345', 'N(100,15²) 在 115 处的累积概率 ≈ 0.8413') +
      errCase('标准差为 0', '#NUM!', 'sd 必须 >0 → #NUM!', `{ standard_dev: '0' }`) +
      errCase('标准差为负数', '#NUM!', 'sd 不能为负 → #NUM!', `{ standard_dev: '-5' }`) +
      errCase('累积参数非 TRUE/FALSE', '#VALUE!', '累积参数必须是逻辑值 → #VALUE!', `{ cumulative: 'YES' }`)
  ),
  'norm-s-dist': block(
    '{}',
    num('z', 'z 值', '1') + txt('cumulative', '累积?', 'TRUE', 'TRUE=累积概率，FALSE=概率密度'),
    '=NORM.S.DIST({z},{cumulative})',
    okCase('0.841345', '标准正态分布 z=1 处累积概率 ≈ 0.8413') +
      errCase('z 非数字', '#VALUE!', 'z 必须是数字 → #VALUE!', `{ z: 'abc' }`) +
      errCase('累积参数非 TRUE/FALSE', '#VALUE!', '累积参数必须是逻辑值 → #VALUE!', `{ cumulative: 'YES' }`) +
      errCase('z 为空白', '#VALUE!', 'z 不能为空 → #VALUE!', `{ z: '' }`)
  ),
  pearson: block(
    `{ array1: 'B2:B6', array2: 'C2:C6' }`,
    ref('array1', '第一组数据', 'B2:B6', '广告费') + ref('array2', '第二组数据', 'C2:C6', '销售额'),
    '=PEARSON({array1},{array2})',
    okCase('0.995591', 'PEARSON 与 CORREL 等价') +
      errCase('两组数据个数不一致', '#N/A', 'y 与 x 行数不同 → #N/A', `{ array1: 'B2:B6', array2: 'C2:C5' }`) +
      errCase('区域非法 B:B', '#REF!', '区域引用不合法 → #REF!', `{ array1: 'B:B' }`) +
      errCase('区域非法 A:B', '#REF!', '缺少行号 → #REF!', `{ array1: 'A:B' }`)
  ),
};

const oldBlock = `  calc: {
    enabled: false,
    ranges: {},
    fields: [],
    template: '',
    cases: [],
  },`;

for (const [id, calcText] of Object.entries(configs)) {
  const path = DIR + id + '.ts';
  let src = readFileSync(path, 'utf8');
  if (!src.includes(oldBlock)) {
    console.error('WARN no old block in', id);
    continue;
  }
  src = src.replace(oldBlock, calcText);
  // mode-sngl dataTsv fix
  if (id === 'mode-sngl') {
    src = src.replace("'尺码\\nM\\nL\\nL\\nS\\nL\\nM'", "'尺码\\t编码\\nM\\t2\\nL\\t3\\nL\\t3\\nS\\t1\\nL\\t3\\nM\\t2'");
  }
  writeFileSync(path, src);
  console.log('updated', id);
}
console.log('done');
