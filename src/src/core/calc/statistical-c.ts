import type { CalcContext, CalcHandler, CalcOutcome, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { columnOf, sliceSheet } from '@/core/ref';
import { formatNumber, numericValues, toNumber } from './helpers';
import { erf, lngamma } from './special';
import { fail, ok } from './types';

/**
 * 统计类（第二批 24 个：B13）试算实现（纯函数，零 DOM）。
 *
 * 数据区域统一通过 ctx.sheet + sliceSheet(ref) 读取，再用 columnOf(block,0) /
 * numericValues(...) 取数字。标量分布（NORM.DIST / BINOM.DIST）直接读字段数字。
 *
 * 复数形式 id（binom-dist / covariance-p …）在 JS 里不是合法标识符，故导出名用
 * 驼峰（binomDistCalc 等）；self-test 里用 { id: handler } 映射即可。
 */

/* ------------------------- 共享小工具 ------------------------- */

function sliceNumbers(
  sheet: Sheet,
  ref: string,
  fnId: string,
): { nums: number[]; fail: CalcOutcome | null } {
  const block = sliceSheet(sheet, ref.trim());
  if (block === null || block.header.length === 0) {
    return {
      nums: [],
      fail: fail(
        make(ERROR_CODES.REF, '区域引用不合法', '请填写合法的单元格区域，如 A2:A11'),
      ),
    };
  }
  return { nums: numericValues(columnOf(block, 0)), fail: null };
}

/** 把 TRUE/FALSE/1/0 解析为布尔；其它返回 null */
function parseLogical(raw: string): boolean | null {
  const s = (raw ?? '').trim().toUpperCase();
  if (s === 'TRUE' || s === '1') return true;
  if (s === 'FALSE' || s === '0') return false;
  return null;
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** 一元线性回归：返回 {slope,intercept}，分母为 0 时 slope=null */
function linreg(
  xs: number[],
  ys: number[],
): { slope: number | null; intercept: number } {
  const n = xs.length;
  const mx = avg(xs);
  const my = avg(ys);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - mx;
    sxx += dx * dx;
    sxy += (ys[i] - my) * dx;
  }
  if (sxx === 0) return { slope: null, intercept: my };
  const slope = sxy / sxx;
  return { slope, intercept: my - slope * mx };
}

/** 组合数 C(n,k) = exp(lngamma(n+1)-lngamma(k+1)-lngamma(n-k+1)) */
function combination(n: number, k: number): number {
  return Math.exp(lngamma(n + 1) - lngamma(k + 1) - lngamma(n - k + 1));
}

/* ====================================================================== */
/* AVEDEV — 平均绝对偏差                                                   */
/* ====================================================================== */
export const avedevCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'avedev');
  if (f) return f;
  if (nums.length === 0) {
    return fail(make(ERROR_CODES.DIV0, '区域中没有数字', '区域需至少包含一个数字'));
  }
  const mean = avg(nums);
  const sum = nums.reduce((a, b) => a + Math.abs(b - mean), 0);
  const r = sum / nums.length;
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* AVERAGEA — 含文本的平均（文本=0，TRUE=1，FALSE=0，空忽略）                */
/* ====================================================================== */
export const averageaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const block = sliceSheet(ctx.sheet, (ctx.args.values ?? '').trim());
  if (block === null || block.header.length === 0) {
    return fail(make(ERROR_CODES.REF, '区域引用不合法', '请填写合法的单元格区域'));
  }
  let sum = 0;
  let count = 0;
  for (const v of columnOf(block, 0)) {
    if (v === null || v === '') continue; // 空单元格忽略
    const n = toNumber(v);
    sum += n === null ? 0 : n; // 文本当 0，数字/布尔按值
    count += 1;
  }
  if (count === 0) {
    return fail(make(ERROR_CODES.DIV0, '区域中没有可参与计算的值', '区域需至少包含一个非空单元格'));
  }
  const r = sum / count;
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* BINOM.DIST — 二项分布（PMF / CDF）                                      */
/* ====================================================================== */
export const binomDistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const ks = toNumber(ctx.args.number_s);
  const ns = toNumber(ctx.args.trials);
  const ps = toNumber(ctx.args.probability_s);
  const cum = parseLogical(ctx.args.cumulative ?? '');
  if (ks === null || ns === null || ps === null) {
    return fail(make(ERROR_CODES.VALUE, '参数必须是数字', 'number_s/trials/probability_s 都应为数字'));
  }
  if (cum === null) {
    return fail(make(ERROR_CODES.VALUE, 'cumulative 必须是 TRUE 或 FALSE', '第四参数写 TRUE（累积）或 FALSE（恰好 k 次）'));
  }
  const k = Math.trunc(ks);
  const n = Math.trunc(ns);
  if (n < 0 || ps < 0 || ps > 1 || k < 0 || k > n) {
    return fail(make(ERROR_CODES.NUM, '参数越界', 'n≥0，0≤p≤1，且 0≤k≤n'));
  }
  const pmf = (i: number): number =>
    combination(n, i) * Math.pow(ps, i) * Math.pow(1 - ps, n - i);
  let r: number;
  if (cum) {
    r = 0;
    for (let i = 0; i <= k; i += 1) r += pmf(i);
  } else {
    r = pmf(k);
  }
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* CORREL / PEARSON — 皮尔逊相关系数（计算完全相同）                        */
/* ====================================================================== */
function pearsonOf(
  sheet: Sheet,
  r1: string,
  r2: string,
  fnId: string,
): CalcOutcome {
  const a = sliceNumbers(sheet, r1, fnId);
  if (a.fail) return a.fail;
  const b = sliceNumbers(sheet, r2, fnId);
  if (b.fail) return b.fail;
  if (a.nums.length !== b.nums.length || a.nums.length === 0) {
    return fail(make(ERROR_CODES.NA, '两组数据个数必须一致', '两个区域的行数要相同'));
  }
  const n = a.nums.length;
  const ma = avg(a.nums);
  const mb = avg(b.nums);
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < n; i += 1) {
    const da = a.nums[i] - ma;
    const db = b.nums[i] - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  if (va === 0 || vb === 0) {
    return fail(make(ERROR_CODES.DIV0, '某一组数据无波动', '标准差为 0 时无相关系数'));
  }
  const r = cov / Math.sqrt(va * vb);
  return ok(r, formatNumber(r));
}

export const correlCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  pearsonOf(ctx.sheet, (ctx.args.array1 ?? '').trim(), (ctx.args.array2 ?? '').trim(), 'correl');

export const pearsonCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  pearsonOf(ctx.sheet, (ctx.args.array1 ?? '').trim(), (ctx.args.array2 ?? '').trim(), 'pearson');

/* ====================================================================== */
/* COUNTBLANK — 空单元格计数                                               */
/* ====================================================================== */
export const countblankCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const block = sliceSheet(ctx.sheet, (ctx.args.range ?? '').trim());
  if (block === null || block.header.length === 0) {
    return fail(make(ERROR_CODES.REF, '区域引用不合法', '请填写合法的单元格区域'));
  }
  let count = 0;
  for (const row of block.rows) {
    for (const v of row) {
      if (v === null || v === '') count += 1;
    }
  }
  return ok(count, formatNumber(count));
};

/* ====================================================================== */
/* COVARIANCE.P / COVARIANCE.S — 协方差（总体/样本口径）                    */
/* ====================================================================== */
function covOf(
  sheet: Sheet,
  r1: string,
  r2: string,
  pop: boolean,
  fnId: string,
): CalcOutcome {
  const a = sliceNumbers(sheet, r1, fnId);
  if (a.fail) return a.fail;
  const b = sliceNumbers(sheet, r2, fnId);
  if (b.fail) return b.fail;
  if (a.nums.length !== b.nums.length || a.nums.length === 0) {
    return fail(make(ERROR_CODES.NA, '两组数据个数必须一致', '两个区域的行数要相同'));
  }
  const n = a.nums.length;
  const ma = avg(a.nums);
  const mb = avg(b.nums);
  let cov = 0;
  for (let i = 0; i < n; i += 1) cov += (a.nums[i] - ma) * (b.nums[i] - mb);
  const denom = pop ? n : n - 1;
  const r = cov / denom;
  return ok(r, formatNumber(r));
}

export const covariancePCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  covOf(ctx.sheet, (ctx.args.array1 ?? '').trim(), (ctx.args.array2 ?? '').trim(), true, 'covariance-p');

export const covarianceSCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  covOf(ctx.sheet, (ctx.args.array1 ?? '').trim(), (ctx.args.array2 ?? '').trim(), false, 'covariance-s');

/* ====================================================================== */
/* DEVSQ — 离差平方和                                                     */
/* ====================================================================== */
export const devsqCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'devsq');
  if (f) return f;
  if (nums.length === 0) {
    return fail(make(ERROR_CODES.DIV0, '区域中没有数字', '区域需至少包含一个数字'));
  }
  const mean = avg(nums);
  const r = nums.reduce((a, b) => a + (b - mean) * (b - mean), 0);
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* FORECAST.LINEAR — 线性预测                                             */
/* ====================================================================== */
export const forecastLinearCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const xv = toNumber(ctx.args.x);
  if (xv === null) {
    return fail(make(ERROR_CODES.VALUE, 'x 必须是数字', '要预测的 x 应为数字'));
  }
  const ys = sliceNumbers(ctx.sheet, (ctx.args.known_ys ?? '').trim(), 'forecast-linear');
  if (ys.fail) return ys.fail;
  const xs = sliceNumbers(ctx.sheet, (ctx.args.known_xs ?? '').trim(), 'forecast-linear');
  if (xs.fail) return xs.fail;
  if (ys.nums.length !== xs.nums.length || ys.nums.length === 0) {
    return fail(make(ERROR_CODES.NA, 'known_x 与 known_y 个数必须一致', '两个区域行数要相同'));
  }
  const { slope, intercept } = linreg(xs.nums, ys.nums);
  if (slope === null) {
    return fail(make(ERROR_CODES.DIV0, 'x 无波动', 'known_x 全部相同，无法拟合直线'));
  }
  const r = intercept + slope * xv;
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* FREQUENCY — 频数分布（简化为分号隔开的频数列表）                         */
/* ====================================================================== */
export const frequencyCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.data_array ?? '').trim(), 'frequency');
  if (f) return f;
  const binsRaw = (ctx.args.bins ?? '').trim();
  if (binsRaw === '') {
    return fail(make(ERROR_CODES.NUM, '分段上限不能为空', '请填写分号隔开的分段上限，如 60;80;100'));
  }
  const bins: number[] = [];
  for (const s of binsRaw.split(';')) {
    const bn = toNumber(s);
    if (bn === null) {
      return fail(make(ERROR_CODES.VALUE, '分段上限必须都是数字', 'bins 只接受数字，分号隔开'));
    }
    bins.push(bn);
  }
  const counts = new Array(bins.length + 1).fill(0);
  for (const v of nums) {
    let placed = false;
    for (let i = 0; i < bins.length; i += 1) {
      if (v <= bins[i]) {
        counts[i] += 1;
        placed = true;
        break;
      }
    }
    if (!placed) counts[bins.length] += 1;
  }
  const r = counts.join(';');
  return ok(r, r);
};

/* ====================================================================== */
/* GEOMEAN — 几何平均                                                     */
/* ====================================================================== */
export const geomeanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'geomean');
  if (f) return f;
  if (nums.length === 0) {
    return fail(make(ERROR_CODES.DIV0, '区域中没有数字', '区域需至少包含一个正数'));
  }
  let prod = 1;
  for (const v of nums) {
    if (v <= 0) {
      return fail(make(ERROR_CODES.NUM, '几何平均要求所有数大于 0', '含 0 或负数时无解'));
    }
    prod *= v;
  }
  const r = Math.pow(prod, 1 / nums.length);
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* GROWTH — 指数趋势值（简化为预测单个 new_x 的拟合值）                    */
/* ====================================================================== */
export const growthCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const ys = sliceNumbers(ctx.sheet, (ctx.args.known_ys ?? '').trim(), 'growth');
  if (ys.fail) return ys.fail;
  const xsRef = (ctx.args.known_xs ?? '').trim();
  let xs: number[];
  if (xsRef === '') {
    xs = ys.nums.map((_, i) => i + 1);
  } else {
    const xb = sliceNumbers(ctx.sheet, xsRef, 'growth');
    if (xb.fail) return xb.fail;
    xs = xb.nums;
  }
  if (xs.length !== ys.nums.length) {
    return fail(make(ERROR_CODES.NA, 'known_x 与 known_y 个数必须一致', '两个区域行数要相同'));
  }
  for (const y of ys.nums) {
    if (y <= 0) {
      return fail(make(ERROR_CODES.NUM, '指数拟合要求 y > 0', '含 0 或负数时无法拟合指数曲线'));
    }
  }
  const newX = toNumber(ctx.args.new_x);
  if (newX === null) {
    return fail(make(ERROR_CODES.VALUE, 'new_x 必须是数字', '要预测的 x 应为数字'));
  }
  const lnY = ys.nums.map((y) => Math.log(y));
  const { slope, intercept } = linreg(xs, lnY);
  if (slope === null) {
    return fail(make(ERROR_CODES.DIV0, 'x 无波动', 'known_x 全部相同，无法拟合'));
  }
  const r = Math.exp(intercept + slope * newX);
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* HARMEAN — 调和平均                                                     */
/* ====================================================================== */
export const harmeanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'harmean');
  if (f) return f;
  if (nums.length === 0) {
    return fail(make(ERROR_CODES.DIV0, '区域中没有数字', '区域需至少包含一个正数'));
  }
  let sum = 0;
  for (const v of nums) {
    if (v <= 0) {
      return fail(make(ERROR_CODES.NUM, '调和平均要求所有数大于 0', '含 0 或负数时倒数不存在'));
    }
    sum += 1 / v;
  }
  const r = nums.length / sum;
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* INTERCEPT — 线性回归截距                                              */
/* ====================================================================== */
export const interceptCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const ys = sliceNumbers(ctx.sheet, (ctx.args.known_ys ?? '').trim(), 'intercept');
  if (ys.fail) return ys.fail;
  const xs = sliceNumbers(ctx.sheet, (ctx.args.known_xs ?? '').trim(), 'intercept');
  if (xs.fail) return xs.fail;
  if (ys.nums.length !== xs.nums.length || ys.nums.length === 0) {
    return fail(make(ERROR_CODES.NA, 'known_x 与 known_y 个数必须一致', '两个区域行数要相同'));
  }
  const { slope, intercept } = linreg(xs.nums, ys.nums);
  if (slope === null) {
    return fail(make(ERROR_CODES.DIV0, 'x 无波动', 'known_x 全部相同，无法确定截距'));
  }
  return ok(intercept, formatNumber(intercept));
};

/* ====================================================================== */
/* KURT — 超额峰度（Excel 口径）                                          */
/* ====================================================================== */
export const kurtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'kurt');
  if (f) return f;
  const n = nums.length;
  if (n < 4) {
    return fail(make(ERROR_CODES.DIV0, '至少需要 4 个数据', '峰度公式要求 n≥4'));
  }
  const mean = avg(nums);
  let m2 = 0;
  let m4 = 0;
  for (const v of nums) {
    const d = v - mean;
    const d2 = d * d;
    m2 += d2;
    m4 += d2 * d2;
  }
  m2 /= n;
  m4 /= n;
  const s2 = (m2 * n) / (n - 1); // 样本方差
  if (s2 === 0) {
    return fail(make(ERROR_CODES.DIV0, '数据标准差为 0', '所有值相同，算不出峰度'));
  }
  const ratio = (n * m4) / (s2 * s2);
  const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * ratio;
  const term2 = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  const r = term1 - term2;
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* LARGE — 第 k 大                                                        */
/* ====================================================================== */
export const largeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.array ?? '').trim(), 'large');
  if (f) return f;
  const k = toNumber(ctx.args.k);
  if (k === null) {
    return fail(make(ERROR_CODES.VALUE, 'k 必须是数字', 'k 应为正整数'));
  }
  const ki = Math.trunc(k);
  if (ki < 1 || ki > nums.length) {
    return fail(make(ERROR_CODES.NUM, 'k 越界', 'k 必须介于 1 与数据个数之间'));
  }
  const sorted = nums.slice().sort((a, b) => b - a);
  const r = sorted[ki - 1];
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* LINEST — 线性回归参数（简化为返回斜率）                                */
/* ====================================================================== */
export const linestCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const ys = sliceNumbers(ctx.sheet, (ctx.args.known_ys ?? '').trim(), 'linest');
  if (ys.fail) return ys.fail;
  const xs = sliceNumbers(ctx.sheet, (ctx.args.known_xs ?? '').trim(), 'linest');
  if (xs.fail) return xs.fail;
  if (ys.nums.length !== xs.nums.length || ys.nums.length === 0) {
    return fail(make(ERROR_CODES.NA, 'known_x 与 known_y 个数必须一致', '两个区域行数要相同'));
  }
  const { slope } = linreg(xs.nums, ys.nums);
  if (slope === null) {
    return fail(make(ERROR_CODES.DIV0, 'x 无波动', 'known_x 全部相同，无法确定斜率'));
  }
  return ok(slope, formatNumber(slope));
};

/* ====================================================================== */
/* LOGEST — 指数回归参数（简化为返回底数 b）                               */
/* ====================================================================== */
export const logestCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const ys = sliceNumbers(ctx.sheet, (ctx.args.known_ys ?? '').trim(), 'logest');
  if (ys.fail) return ys.fail;
  const xsRef = (ctx.args.known_xs ?? '').trim();
  let xs: number[];
  if (xsRef === '') {
    xs = ys.nums.map((_, i) => i + 1);
  } else {
    const xb = sliceNumbers(ctx.sheet, xsRef, 'logest');
    if (xb.fail) return xb.fail;
    xs = xb.nums;
  }
  if (xs.length !== ys.nums.length) {
    return fail(make(ERROR_CODES.NA, 'known_x 与 known_y 个数必须一致', '两个区域行数要相同'));
  }
  for (const y of ys.nums) {
    if (y <= 0) {
      return fail(make(ERROR_CODES.NUM, '指数拟合要求 y > 0', '含 0 或负数时无法拟合'));
    }
  }
  const lnY = ys.nums.map((y) => Math.log(y));
  const { slope } = linreg(xs, lnY);
  if (slope === null) {
    return fail(make(ERROR_CODES.DIV0, 'x 无波动', 'known_x 全部相同，无法拟合'));
  }
  const b = Math.exp(slope);
  return ok(b, formatNumber(b));
};

/* ====================================================================== */
/* MEDIAN — 中位数                                                        */
/* ====================================================================== */
export const medianCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'median');
  if (f) return f;
  if (nums.length === 0) {
    return fail(make(ERROR_CODES.NUM, '区域中没有数字', '算不出中位数'));
  }
  const sorted = nums.slice().sort((a, b) => a - b);
  const n = sorted.length;
  const r = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* MODE.MULT — 多个众数（简化为分号隔开的列表）                            */
/* ====================================================================== */
export const modeMultCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'mode-mult');
  if (f) return f;
  if (nums.length === 0) {
    return fail(make(ERROR_CODES.NA, '没有众数', '区域内没有数字'));
  }
  const freq = new Map<number, number>();
  for (const v of nums) freq.set(v, (freq.get(v) ?? 0) + 1);
  let max = 0;
  for (const c of freq.values()) if (c > max) max = c;
  if (max <= 1) {
    return fail(make(ERROR_CODES.NA, '所有值只出现一次，没有众数', '数据里没有重复值'));
  }
  const modes = [...freq.entries()]
    .filter(([, c]) => c === max)
    .map(([v]) => v)
    .sort((a, b) => a - b);
  const r = modes.join(';');
  return ok(r, r);
};

/* ====================================================================== */
/* MODE.SNGL — 众数（并列时取先出现者）                                    */
/* ====================================================================== */
export const modeSnglCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNumbers(ctx.sheet, (ctx.args.numbers ?? '').trim(), 'mode-sngl');
  if (f) return f;
  if (nums.length === 0) {
    return fail(make(ERROR_CODES.NA, '没有众数', '区域内没有数字'));
  }
  const freq = new Map<number, number>();
  const order: number[] = [];
  for (const v of nums) {
    if (!freq.has(v)) order.push(v);
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  let max = 0;
  for (const c of freq.values()) if (c > max) max = c;
  if (max <= 1) {
    return fail(make(ERROR_CODES.NA, '所有值只出现一次，没有众数', '数据里没有重复值'));
  }
  let mode = 0;
  for (const v of order) {
    if (freq.get(v) === max) {
      mode = v;
      break;
    }
  }
  return ok(mode, formatNumber(mode));
};

/* ====================================================================== */
/* NORM.DIST — 正态分布（CDF / PDF）                                      */
/* ====================================================================== */
export const normDistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = toNumber(ctx.args.x);
  const mean = toNumber(ctx.args.mean);
  const sd = toNumber(ctx.args.standard_dev);
  const cum = parseLogical(ctx.args.cumulative ?? '');
  if (x === null || mean === null || sd === null) {
    return fail(make(ERROR_CODES.VALUE, '参数必须是数字', 'x/mean/standard_dev 都应为数字'));
  }
  if (cum === null) {
    return fail(make(ERROR_CODES.VALUE, 'cumulative 必须是 TRUE 或 FALSE', '第四参数写 TRUE 或 FALSE'));
  }
  if (sd <= 0) {
    return fail(make(ERROR_CODES.NUM, '标准差必须 > 0', 'standard_dev 为正数'));
  }
  const z = (x - mean) / sd;
  const r = cum
    ? 0.5 * (1 + erf(z / Math.SQRT2))
    : Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* NORM.S.DIST — 标准正态分布（CDF / PDF）                                */
/* ====================================================================== */
export const normSDistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const z = toNumber(ctx.args.z);
  const cum = parseLogical(ctx.args.cumulative ?? '');
  if (z === null) {
    return fail(make(ERROR_CODES.VALUE, 'z 必须是数字', 'z 值应为数字'));
  }
  if (cum === null) {
    return fail(make(ERROR_CODES.VALUE, 'cumulative 必须是 TRUE 或 FALSE', '第二参数写 TRUE 或 FALSE'));
  }
  const r = cum
    ? 0.5 * (1 + erf(z / Math.SQRT2))
    : Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  return ok(r, formatNumber(r));
};
