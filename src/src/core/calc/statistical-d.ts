import type { CalcContext, CalcHandler, CalcOutcome, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { columnOf, sliceSheet } from '@/core/ref';
import { formatNumber, numericValues, toNumber } from './helpers';
import { erf, gamma, lngamma, lowerRegBeta, upperRegGamma } from './special';
import { percentileExc, percentileInc, rank as rankAvg } from './quantile';
import { fail, ok } from './types';

/**
 * 统计类（第三批 24 个：B13 后半）试算实现（纯函数，零 DOM）。
 * 复数 / 连字符 id 导出名用驼峰（percentileExcCalc 等）。
 */

/* ------------------------- 共享小工具 ------------------------- */

function sliceNums(sheet: Sheet, ref: string): { nums: number[]; fail: CalcOutcome | null } {
  const block = sliceSheet(sheet, ref.trim());
  if (block === null || block.header.length === 0) {
    return { nums: [], fail: fail(make(ERROR_CODES.REF, '区域引用不合法', '请填写合法的单元格区域，如 A2:A9')) };
  }
  return { nums: numericValues(columnOf(block, 0)), fail: null };
}

/** A 类变体读取：文本当 0、TRUE=1/FALSE=0、空单元格忽略、数字按值。 */
function sliceA(sheet: Sheet, ref: string): { vals: number[]; fail: CalcOutcome | null } {
  const block = sliceSheet(sheet, ref.trim());
  if (block === null || block.header.length === 0) {
    return { vals: [], fail: fail(make(ERROR_CODES.REF, '区域引用不合法', '请填写合法的单元格区域')) };
  }
  const vals: number[] = [];
  for (const v of columnOf(block, 0)) {
    if (v === null || v === '') continue; // 空单元格忽略
    if (typeof v === 'number') vals.push(v);
    else if (typeof v === 'boolean') vals.push(v ? 1 : 0);
    else {
      const n = toNumber(v);
      vals.push(n === null ? 0 : n);
    }
  }
  return { vals, fail: null };
}

function avgArr(a: number[]): number {
  return a.reduce((x, y) => x + y, 0) / a.length;
}

/** 一元线性回归，返回斜率与截距；分母为 0 时 slope=null */
function linreg(xs: number[], ys: number[]): { slope: number | null; intercept: number } {
  const n = xs.length;
  const mx = avgArr(xs);
  const my = avgArr(ys);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i += 1) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (ys[i] - my) * (xs[i] - mx);
  }
  if (sxx === 0) return { slope: null, intercept: my };
  const slope = sxy / sxx;
  return { slope, intercept: my - slope * mx };
}

/** Pearson 相关系数 */
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = avgArr(xs);
  const my = avgArr(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return NaN;
  return sxy / Math.sqrt(sxx * syy);
}

/* ====================================================================== */
/* PERCENTILE.EXC / PERCENTILE.INC                                         */
/* ====================================================================== */
export const percentileExcCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const k = toNumber(ctx.args.k);
  if (k === null) return fail(make(ERROR_CODES.VALUE, 'k 必须是数字', '请输入 0 到 1 之间的数字'));
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  const r = percentileExc(nums, k);
  if (Number.isNaN(r)) return fail(make(ERROR_CODES.NUM, 'k 必须介于 0 和 1 之间', 'k 取值区间为 (0,1)'));
  return ok(r, formatNumber(r));
};

export const percentileIncCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const k = toNumber(ctx.args.k);
  if (k === null) return fail(make(ERROR_CODES.VALUE, 'k 必须是数字', '请输入 0 到 1 之间的数字'));
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  const r = percentileInc(nums, k);
  if (Number.isNaN(r)) return fail(make(ERROR_CODES.NUM, 'k 必须介于 0 和 1 之间', 'k 取值区间为 [0,1]'));
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* QUARTILE.EXC / QUARTILE.INC                                             */
/* ====================================================================== */
export const quartileExcCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const q = toNumber(ctx.args.quart);
  if (q === null) return fail(make(ERROR_CODES.VALUE, 'quart 必须是数字', 'quart 取 1/2/3'));
  if (!Number.isInteger(q) || q < 1 || q > 3) {
    return fail(make(ERROR_CODES.NUM, 'quart 必须是 1、2 或 3', 'QUARTILE.EXC 仅支持 1~3'));
  }
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  const r = percentileExc(nums, q / 4);
  if (Number.isNaN(r)) return fail(make(ERROR_CODES.NUM, '无法计算四分位', '请检查数据区域'));
  return ok(r, formatNumber(r));
};

export const quartileIncCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const q = toNumber(ctx.args.quart);
  if (q === null) return fail(make(ERROR_CODES.VALUE, 'quart 必须是数字', 'quart 取 0~4'));
  if (!Number.isInteger(q) || q < 0 || q > 4) {
    return fail(make(ERROR_CODES.NUM, 'quart 必须是 0 到 4 的整数', 'QUARTILE.INC 支持 0~4'));
  }
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  const r = percentileInc(nums, q / 4);
  if (Number.isNaN(r)) return fail(make(ERROR_CODES.NUM, '无法计算四分位', '请检查数据区域'));
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* RANK.AVG / RANK.EQ                                                      */
/* ====================================================================== */
export const rankAvgCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const target = toNumber(ctx.args.number);
  if (target === null) return fail(make(ERROR_CODES.VALUE, 'number 必须是数字', '请输入要排名的数值'));
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.ref ?? '');
  if (f) return f;
  const order: 0 | 1 = ctx.args.order === '1' ? 1 : 0;
  const r = rankAvg(target, nums, order);
  if (Number.isNaN(r)) return fail(make(ERROR_CODES.NA, '要排名的数值不在区域内', 'number 必须是 ref 区域中的某个值'));
  return ok(r, formatNumber(r));
};

export const rankEqCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const target = toNumber(ctx.args.number);
  if (target === null) return fail(make(ERROR_CODES.VALUE, 'number 必须是数字', '请输入要排名的数值'));
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.ref ?? '');
  if (f) return f;
  const order: 0 | 1 = ctx.args.order === '1' ? 1 : 0;
  let found = false;
  for (const v of nums) if (v === target) { found = true; break; }
  if (!found) return fail(make(ERROR_CODES.NA, '要排名的数值不在区域内', 'number 必须是 ref 区域中的某个值'));
  let count = 0;
  for (const v of nums) {
    if (order === 0 ? v > target : v < target) count += 1;
  }
  return ok(count + 1, formatNumber(count + 1));
};

/* ====================================================================== */
/* RSQ / SLOPE / STEYX / TREND                                            */
/* ====================================================================== */
function twoCols(ctx: CalcContext): { ys: number[]; xs: number[]; fail: CalcOutcome | null } {
  const a = sliceNums(ctx.sheet, ctx.args['known_ys'] ?? '');
  const b = sliceNums(ctx.sheet, ctx.args['known_xs'] ?? '');
  if (a.fail) return { ys: [], xs: [], fail: a.fail };
  if (b.fail) return { ys: [], xs: [], fail: b.fail };
  if (a.nums.length !== b.nums.length) {
    return { ys: [], xs: [], fail: fail(make(ERROR_CODES.NA, '两组数据的个数不一致', 'known_ys 与 known_xs 元素个数需相等')) };
  }
  return { ys: a.nums, xs: b.nums, fail: null };
}

export const rsqCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { ys, xs, fail: f } = twoCols(ctx);
  if (f) return f;
  const r = pearson(xs, ys);
  if (Number.isNaN(r)) return fail(make(ERROR_CODES.DIV0, '无法计算相关系数', '两组数据需有变化'));
  return ok(r * r, formatNumber(r * r));
};

export const slopeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { ys, xs, fail: f } = twoCols(ctx);
  if (f) return f;
  const { slope } = linreg(xs, ys);
  if (slope === null) return fail(make(ERROR_CODES.DIV0, 'x 为常数，斜率无定义', 'known_xs 不能全相等'));
  return ok(slope, formatNumber(slope));
};

export const steyxCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { ys, xs, fail: f } = twoCols(ctx);
  if (f) return f;
  const n = xs.length;
  if (n < 3) return fail(make(ERROR_CODES.DIV0, '数据点不足', '至少需要 3 个点'));
  const { slope, intercept } = linreg(xs, ys);
  if (slope === null) return fail(make(ERROR_CODES.DIV0, 'x 为常数', 'known_xs 不能全相等'));
  let sse = 0;
  for (let i = 0; i < n; i += 1) {
    const yh = intercept + slope * xs[i];
    sse += (ys[i] - yh) ** 2;
  }
  const se = Math.sqrt(sse / (n - 2));
  return ok(se, formatNumber(se));
};

export const trendCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { ys, xs, fail: f } = twoCols(ctx);
  if (f) return f;
  const nx = toNumber(ctx.args.new_x);
  if (nx === null) return fail(make(ERROR_CODES.VALUE, 'new_x 必须是数字', '请输入要预测的自变量'));
  const { slope, intercept } = linreg(xs, ys);
  if (slope === null) return fail(make(ERROR_CODES.DIV0, 'x 为常数，无法拟合', 'known_xs 不能全相等'));
  const yh = intercept + slope * nx;
  return ok(yh, formatNumber(yh));
};

/* ====================================================================== */
/* SKEW / SMALL / TRIMMEAN                                                */
/* ====================================================================== */
export const skewCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  const n = nums.length;
  if (n < 3) return fail(make(ERROR_CODES.DIV0, '数据点不足 3 个', 'SKEW 至少需要 3 个数值'));
  const m = avgArr(nums);
  const s = Math.sqrt(avgArr(nums.map((x) => (x - m) ** 2)) * n / (n - 1)); // 样本标准差
  let sum = 0;
  for (const x of nums) sum += ((x - m) / s) ** 3;
  const r = (n / ((n - 1) * (n - 2))) * sum;
  return ok(r, formatNumber(r));
};

export const smallCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const k = toNumber(ctx.args.k);
  if (k === null) return fail(make(ERROR_CODES.VALUE, 'k 必须是数字', '请输入整数 k'));
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (k < 1 || k > nums.length || !Number.isInteger(k)) {
    return fail(make(ERROR_CODES.NUM, 'k 超出范围', 'k 应为 1 到区域元素个数之间的整数'));
  }
  const sorted = nums.slice().sort((a, b) => a - b);
  return ok(sorted[k - 1], formatNumber(sorted[k - 1]));
};

export const trimmeanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = toNumber(ctx.args.percent);
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'percent 必须是数字', '请输入 0 到 1 之间的比例'));
  if (p < 0 || p >= 1) return fail(make(ERROR_CODES.NUM, 'percent 必须介于 0 和 1 之间', 'percent 取 (0,1)'));
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  const n = nums.length;
  const exclude = Math.floor((p / 2) * n);
  const sorted = nums.slice().sort((a, b) => a - b);
  const kept = sorted.slice(exclude, n - exclude);
  if (kept.length === 0) return fail(make(ERROR_CODES.NUM, '裁剪后无剩余数据', '请减小 percent'));
  return ok(avgArr(kept), formatNumber(avgArr(kept)));
};

/* ====================================================================== */
/* STDEV.P / STDEV.S / STDEVA / STDEVPA                                   */
/* ====================================================================== */
function variance(nums: number[], population: boolean): number {
  const n = nums.length;
  const m = avgArr(nums);
  const ss = nums.reduce((s, x) => s + (x - m) ** 2, 0);
  return ss / (population ? n : n - 1);
}

export const stdevPCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (nums.length < 1) return fail(make(ERROR_CODES.DIV0, '区域中没有数字', '区域需至少包含一个数字'));
  const r = Math.sqrt(variance(nums, true));
  return ok(r, formatNumber(r));
};

export const stdevSCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (nums.length < 2) return fail(make(ERROR_CODES.DIV0, '样本数据不足 2 个', 'STDEV.S 至少需要 2 个数值'));
  const r = Math.sqrt(variance(nums, false));
  return ok(r, formatNumber(r));
};

export const stdevaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { vals, fail: f } = sliceA(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (vals.length < 2) return fail(make(ERROR_CODES.DIV0, '样本数据不足 2 个', 'STDEVA 至少需要 2 个有效值'));
  const r = Math.sqrt(variance(vals, false));
  return ok(r, formatNumber(r));
};

export const stdevpaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { vals, fail: f } = sliceA(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (vals.length < 1) return fail(make(ERROR_CODES.DIV0, '区域中没有有效值', '区域需至少包含一个非空白值'));
  const r = Math.sqrt(variance(vals, true));
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* VAR.P / VAR.S / VARA / VARPA                                           */
/* ====================================================================== */
export const varPCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (nums.length < 1) return fail(make(ERROR_CODES.DIV0, '区域中没有数字', '区域需至少包含一个数字'));
  const r = variance(nums, true);
  return ok(r, formatNumber(r));
};

export const varSCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, fail: f } = sliceNums(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (nums.length < 2) return fail(make(ERROR_CODES.DIV0, '样本数据不足 2 个', 'VAR.S 至少需要 2 个数值'));
  const r = variance(nums, false);
  return ok(r, formatNumber(r));
};

export const varaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { vals, fail: f } = sliceA(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (vals.length < 2) return fail(make(ERROR_CODES.DIV0, '样本数据不足 2 个', 'VARA 至少需要 2 个有效值'));
  const r = variance(vals, false);
  return ok(r, formatNumber(r));
};

export const varpaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { vals, fail: f } = sliceA(ctx.sheet, ctx.args.array ?? '');
  if (f) return f;
  if (vals.length < 1) return fail(make(ERROR_CODES.DIV0, '区域中没有有效值', '区域需至少包含一个非空白值'));
  const r = variance(vals, true);
  return ok(r, formatNumber(r));
};

/* ====================================================================== */
/* POISSON.DIST / T.DIST / PERMUTATIONA                                   */
/* ====================================================================== */
export const poissonDistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = toNumber(ctx.args.x);
  const mean = toNumber(ctx.args.mean);
  const cumRaw = (ctx.args.cumulative ?? '').toString().trim().toUpperCase();
  const cumulative = cumRaw === 'TRUE' || cumRaw === '1';
  if (x === null || mean === null) return fail(make(ERROR_CODES.VALUE, '参数必须是数字', '请输入数字'));
  if (!Number.isInteger(x) || x < 0) return fail(make(ERROR_CODES.NUM, 'x 必须为非负整数', '发生次数 x 取 0 及以上的整数'));
  if (mean <= 0) return fail(make(ERROR_CODES.NUM, '均值必须为正数', 'mean 需大于 0'));
  if (!cumulative) {
    const pmf = Math.exp(-mean + x * Math.log(mean) - lngamma(x + 1));
    return ok(pmf, formatNumber(pmf));
  }
  const cdf = upperRegGamma(x + 1, mean);
  return ok(cdf, formatNumber(cdf));
};

function tDistPdf(t: number, df: number): number {
  const logc = lngamma((df + 1) / 2) - lngamma(df / 2) - 0.5 * Math.log(df * Math.PI);
  return Math.exp(logc) * (1 + (t * t) / df) ** (-(df + 1) / 2);
}

function tDistCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const ib = lowerRegBeta(df / 2, 0.5, x);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

export const tDistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const t = toNumber(ctx.args.x);
  const df = toNumber(ctx.args.deg_freedom);
  const cumRaw = (ctx.args.cumulative ?? '').toString().trim().toUpperCase();
  const cumulative = cumRaw === 'TRUE' || cumRaw === '1';
  if (t === null || df === null) return fail(make(ERROR_CODES.VALUE, '参数必须是数字', '请输入数字'));
  if (df < 1) return fail(make(ERROR_CODES.NUM, '自由度必须 ≥ 1', 'deg_freedom 取 ≥ 1 的整数'));
  const r = cumulative ? tDistCdf(t, df) : tDistPdf(t, df);
  return ok(r, formatNumber(r));
};

export const permutationaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = toNumber(ctx.args.number);
  const k = toNumber(ctx.args.number_chosen);
  if (n === null || k === null) return fail(make(ERROR_CODES.VALUE, '参数必须是数字', '请输入数字'));
  if (n < 0 || k < 0) return fail(make(ERROR_CODES.NUM, '参数不能为负', 'number 与 number_chosen 需 ≥ 0'));
  const r = n ** k;
  return ok(r, formatNumber(r));
};
