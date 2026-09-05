import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { ok, fail, stripQuotes } from './types';
import { toNumber, formatNumber, numericValues } from './helpers';
import { sliceSheet } from '@/core/ref';
import {
  gamma,
  lngamma,
  lowerRegGamma,
  upperRegGamma,
  lowerRegBeta,
  erf,
} from './special';

/**
 * Compatibility 类（补充批次 B15，21 个函数）：
 *   ASC / DBCS / JIS / BETADIST / BETAINV / BINOMDIST / CHIDIST / CHIINV /
 *   CHITEST / CONFIDENCE / COVAR / CRITBINOM / EXPONDIST / FDIST / FINV /
 *   FTEST / GAMMADIST / GAMMAINV / HYPGEOMDIST / LOGINV / LOGNORMDIST
 *
 * 全部为 Excel 2007「兼容性」分类里的分布 / 文本函数，沿用特殊函数库
 * （./special）的 erf / lngamma / beta / 正则化不完全 Gamma / Beta 实现。
 * 错误码严格遵循 Excel 语义：#NUM!（参数非法）、#VALUE!（类型错）、
 * #REF!（引用无效）、#DIV/0!（除零）、#N/A（长度不匹配）。
 */

/* ============================ 本地辅助函数 ============================ */

/** 逆标准正态 CDF：解 0.5*(1+erf(z/√2)) = p，二分法 [−12,12]，~120 次，tol 1e-12 */
function normSinv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const cdf = (z: number): number => 0.5 * (1 + erf(z / Math.SQRT2));
  let lo = -12;
  let hi = 12;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < p) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** 一维二分求逆：解 f(x)=target；自动识别 f 的单调方向，返回中点 */
function invert1d(
  f: (x: number) => number,
  target: number,
  lo: number,
  hi: number,
  iters = 200,
): number {
  const flo = f(lo) - target;
  const fhi = f(hi) - target;
  const increasing = flo <= 0 && fhi >= 0;
  let a = lo;
  let b = hi;
  for (let i = 0; i < iters; i++) {
    const mid = (a + b) / 2;
    const fm = f(mid) - target;
    if (increasing) {
      if (fm < 0) a = mid;
      else b = mid;
    } else {
      if (fm > 0) a = mid;
      else b = mid;
    }
  }
  return (a + b) / 2;
}

/** 文本型布尔解析：'TRUE'/'1'/'true'→true，'FALSE'/'0'/'false'→false，其余 null */
function parseBool(raw: string | undefined): boolean | null {
  if (raw === undefined) return null;
  const s = raw.trim().toUpperCase();
  if (s === 'TRUE' || s === '1') return true;
  if (s === 'FALSE' || s === '0') return false;
  return null;
}

/** 二项式系数 C(n,k) = exp(lnΓ(n+1) − lnΓ(k+1) − lnΓ(n−k+1)) */
function combo(n: number, k: number): number {
  return Math.exp(lngamma(n + 1) - lngamma(k + 1) - lngamma(n - k + 1));
}

/** 读取区域引用为数字数组；引用非法 / 越界 → null（调用方转 #REF!） */
function readRange(ctx: CalcContext, key: string): number[] | null {
  const sh = sliceSheet(ctx.sheet, ctx.args[key] ?? '');
  if (!sh) return null;
  return numericValues(sh.rows.flat());
}

/** 必填数值参数：缺失 / 非数字 → null（调用方转 #VALUE!） */
function numArg(args: Record<string, string>, key: string): number | null {
  const raw = args[key];
  if (raw === undefined || raw.trim() === '') return null;
  return toNumber(raw);
}

/** 可选数值参数：缺省值 def；提供了但非数字 → NaN（调用方转 #VALUE!） */
function optNum(args: Record<string, string>, key: string, def: number): number {
  const raw = args[key];
  if (raw === undefined || raw.trim() === '') return def;
  const n = toNumber(raw);
  return n === null ? NaN : n;
}

/** 样本方差 Σ(x−mean)²/(n−1) */
function sampleVar(v: number[]): number {
  const n = v.length;
  const mean = v.reduce((s, x) => s + x, 0) / n;
  let acc = 0;
  for (const x of v) acc += (x - mean) * (x - mean);
  return acc / (n - 1);
}

/* ============================ 文本函数 ============================ */

/** ASC：全角 ASCII（U+FF01..U+FF5E）→ 半角（U+0021..U+007E） */
export const ascCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const raw = (ctx.args.t ?? '').trim();
  if (raw === '') {
    return fail(make(ERROR_CODES.VALUE, '缺少要转换的文本', 'ASC 需要一个文本参数，如 =ASC("ＡＢＣ")。'));
  }
  const { inner } = stripQuotes(raw);
  let out = '';
  for (const ch of inner) {
    const c = ch.codePointAt(0) as number;
    if (c >= 0xff01 && c <= 0xff5e) {
      out += String.fromCharCode(c - 0xff01 + 0x21);
    } else {
      out += ch;
    }
  }
  return ok(out, out);
};

/** DBCS：半角 ASCII（U+0021..U+007E）→ 全角（U+FF01..U+FF5E） */
export const dbcsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const raw = (ctx.args.t ?? '').trim();
  if (raw === '') {
    return fail(make(ERROR_CODES.VALUE, '缺少要转换的文本', 'DBCS 需要一个文本参数，如 =DBCS("ABC")。'));
  }
  const { inner } = stripQuotes(raw);
  let out = '';
  for (const ch of inner) {
    const c = ch.codePointAt(0) as number;
    if (c >= 0x21 && c <= 0x7e) {
      out += String.fromCharCode(c - 0x21 + 0xff01);
    } else {
      out += ch;
    }
  }
  return ok(out, out);
};

/** JIS：同 DBCS（半角 → 全角） */
export const jisCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const raw = (ctx.args.t ?? '').trim();
  if (raw === '') {
    return fail(make(ERROR_CODES.VALUE, '缺少要转换的文本', 'JIS 需要一个文本参数，如 =JIS("ABC")。'));
  }
  const { inner } = stripQuotes(raw);
  let out = '';
  for (const ch of inner) {
    const c = ch.codePointAt(0) as number;
    if (c >= 0x21 && c <= 0x7e) {
      out += String.fromCharCode(c - 0x21 + 0xff01);
    } else {
      out += ch;
    }
  }
  return ok(out, out);
};

/* ============================ Beta 分布 ============================ */

/** BETADIST：Beta 分布在 [a,b] 上的 CDF */
export const betadistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = numArg(ctx.args, 'x');
  if (x === null) return fail(make(ERROR_CODES.VALUE, 'x 不是数字', '第 1 参数 x 必须是数字。'));
  const alpha = numArg(ctx.args, 'alpha');
  if (alpha === null) return fail(make(ERROR_CODES.VALUE, 'alpha 不是数字', '第 2 参数 alpha 必须是数字。'));
  const beta = numArg(ctx.args, 'beta');
  if (beta === null) return fail(make(ERROR_CODES.VALUE, 'beta 不是数字', '第 3 参数 beta 必须是数字。'));
  const a = optNum(ctx.args, 'a', 0);
  if (Number.isNaN(a)) return fail(make(ERROR_CODES.VALUE, 'a 不是数字', '区间下界 a 必须是数字。'));
  const b = optNum(ctx.args, 'b', 1);
  if (Number.isNaN(b)) return fail(make(ERROR_CODES.VALUE, 'b 不是数字', '区间上界 b 必须是数字。'));
  if (alpha <= 0 || beta <= 0) {
    return fail(make(ERROR_CODES.NUM, 'alpha、beta 必须为正', 'alpha 和 beta 都要大于 0。'));
  }
  if (b - a <= 0) {
    return fail(make(ERROR_CODES.NUM, '区间下界必须小于上界', 'a 必须小于 b。'));
  }
  if (x < a || x > b) {
    return fail(make(ERROR_CODES.NUM, 'x 落在 [a,b] 之外', 'x 必须大于等于 a 且小于等于 b。'));
  }
  const y = (x - a) / (b - a);
  const r = lowerRegBeta(alpha, beta, y);
  return ok(r, formatNumber(r));
};

/** BETAINV：BETADIST 的逆函数 */
export const betainvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = numArg(ctx.args, 'p');
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'p 不是数字', '第 1 参数 p 必须是数字。'));
  const alpha = numArg(ctx.args, 'alpha');
  if (alpha === null) return fail(make(ERROR_CODES.VALUE, 'alpha 不是数字', '第 2 参数 alpha 必须是数字。'));
  const beta = numArg(ctx.args, 'beta');
  if (beta === null) return fail(make(ERROR_CODES.VALUE, 'beta 不是数字', '第 3 参数 beta 必须是数字。'));
  const a = optNum(ctx.args, 'a', 0);
  if (Number.isNaN(a)) return fail(make(ERROR_CODES.VALUE, 'a 不是数字', '区间下界 a 必须是数字。'));
  const b = optNum(ctx.args, 'b', 1);
  if (Number.isNaN(b)) return fail(make(ERROR_CODES.VALUE, 'b 不是数字', '区间上界 b 必须是数字。'));
  if (p <= 0 || p >= 1 || alpha <= 0 || beta <= 0 || b - a <= 0) {
    return fail(make(ERROR_CODES.NUM, '参数超出合法范围', '需满足 0<p<1、alpha>0、beta>0、a<b。'));
  }
  const y = invert1d((t) => lowerRegBeta(alpha, beta, t), p, 0, 1, 200);
  const x = a + (b - a) * y;
  return ok(x, formatNumber(x));
};

/* ============================ 二项分布 ============================ */

/** BINOMDIST：二项分布概率质量 / 累积分布 */
export const binomdistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const k = numArg(ctx.args, 'k');
  if (k === null) return fail(make(ERROR_CODES.VALUE, 'k 不是数字', '第 1 参数 k 必须是数字。'));
  const n = numArg(ctx.args, 'n');
  if (n === null) return fail(make(ERROR_CODES.VALUE, 'n 不是数字', '第 2 参数 n 必须是数字。'));
  const p = numArg(ctx.args, 'p');
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'p 不是数字', '第 3 参数 p 必须是数字。'));
  const cum = parseBool(ctx.args.cum);
  if (cum === null) return fail(make(ERROR_CODES.VALUE, '第 4 参数不是逻辑值', 'cumulative 填 TRUE 或 FALSE。'));
  if (!Number.isInteger(k) || !Number.isInteger(n)) {
    return fail(make(ERROR_CODES.NUM, 'k、n 必须为整数', 'k 和 n 都要是非负整数。'));
  }
  if (k < 0 || n < 0 || k > n || p < 0 || p > 1) {
    return fail(make(ERROR_CODES.NUM, '参数超出合法范围', '需满足 k≥0、n≥0、k≤n、0≤p≤1。'));
  }
  let r: number;
  if (cum) {
    r = k === n ? 1 : lowerRegBeta(n - k, k + 1, 1 - p);
  } else {
    r = combo(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }
  return ok(r, formatNumber(r));
};

/* ============================ 卡方分布 ============================ */

/** CHIDIST：右尾卡方概率 = Q(df/2, x/2) */
export const chidistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = numArg(ctx.args, 'x');
  if (x === null) return fail(make(ERROR_CODES.VALUE, 'x 不是数字', '第 1 参数 x 必须是数字。'));
  const df = numArg(ctx.args, 'df');
  if (df === null) return fail(make(ERROR_CODES.VALUE, 'df 不是数字', '第 2 参数 df 必须是数字。'));
  if (x < 0) {
    return fail(make(ERROR_CODES.NUM, 'x 不能为负', 'x 必须大于等于 0。'));
  }
  if (!Number.isInteger(df) || df < 1) {
    return fail(make(ERROR_CODES.NUM, '自由度必须 ≥1 且为整数', 'df 应为不小于 1 的整数。'));
  }
  const r = upperRegGamma(df / 2, x / 2);
  return ok(r, formatNumber(r));
};

/** CHIINV：CHIDIST 的逆函数 */
export const chiinvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = numArg(ctx.args, 'p');
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'p 不是数字', '第 1 参数 p 必须是数字。'));
  const df = numArg(ctx.args, 'df');
  if (df === null) return fail(make(ERROR_CODES.VALUE, 'df 不是数字', '第 2 参数 df 必须是数字。'));
  if (!Number.isInteger(df) || df < 1) {
    return fail(make(ERROR_CODES.NUM, '自由度必须 ≥1 且为整数', 'df 应为不小于 1 的整数。'));
  }
  if (p <= 0 || p >= 1) {
    return fail(make(ERROR_CODES.NUM, 'p 必须在 (0,1)', '需满足 0<p<1。'));
  }
  const y = invert1d((t) => upperRegGamma(df / 2, t), p, 0, 1e6, 200);
  const x = 2 * y;
  return ok(x, formatNumber(x));
};

/** CHITEST：卡方独立性检验的右尾概率 */
export const chitestCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const actual = readRange(ctx, 'actual');
  if (actual === null) return fail(make(ERROR_CODES.REF, '实际值区域无效', 'actual 要写成「左上角:右下角」，如 A2:A5。'));
  const expected = readRange(ctx, 'expected');
  if (expected === null) return fail(make(ERROR_CODES.REF, '期望值区域无效', 'expected 要写成「左上角:右下角」，如 B2:B5。'));
  if (actual.length !== expected.length) {
    return fail(make(ERROR_CODES.NA, '两组数据长度不一致', 'actual 与 expected 的单元格个数必须相同。'));
  }
  const m = actual.length;
  if (m < 2) {
    return fail(make(ERROR_CODES.NUM, '数据太少无法检验', '至少需要 2 个数据点（自由度 ≥1）。'));
  }
  let stat = 0;
  for (let i = 0; i < m; i++) {
    const e = expected[i];
    if (e <= 0) {
      return fail(make(ERROR_CODES.DIV0, '期望值中有 0 或负数', '期望值必须全部为正，否则除以零。'));
    }
    const d = actual[i] - e;
    stat += (d * d) / e;
  }
  const df = m - 1;
  const r = upperRegGamma(df / 2, stat / 2);
  return ok(r, formatNumber(r));
};

/* ============================ 置信区间 ============================ */

/** CONFIDENCE：总体均值的置信区间半宽 = z_{1−α/2} · sd/√n */
export const confidenceCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const alpha = numArg(ctx.args, 'alpha');
  if (alpha === null) return fail(make(ERROR_CODES.VALUE, 'alpha 不是数字', '第 1 参数 alpha 必须是数字。'));
  const sd = numArg(ctx.args, 'sd');
  if (sd === null) return fail(make(ERROR_CODES.VALUE, 'sd 不是数字', '第 2 参数 sd 必须是数字。'));
  const n = numArg(ctx.args, 'n');
  if (n === null) return fail(make(ERROR_CODES.VALUE, 'n 不是数字', '第 3 参数 n 必须是数字。'));
  if (!(alpha > 0 && alpha < 1)) {
    return fail(make(ERROR_CODES.NUM, 'alpha 必须在 (0,1)', '显著性水平 alpha 应满足 0<alpha<1。'));
  }
  if (sd <= 0) {
    return fail(make(ERROR_CODES.NUM, '标准差必须为正', 'sd 必须大于 0。'));
  }
  if (!Number.isInteger(n) || n < 1) {
    return fail(make(ERROR_CODES.NUM, '样本量必须 ≥1 且为整数', 'n 应为不小于 1 的整数。'));
  }
  const r = normSinv(1 - alpha / 2) * sd / Math.sqrt(n);
  return ok(r, formatNumber(r));
};

/* ============================ 协方差 ============================ */

/** COVAR：样本协方差 = Σ(aᵢ−ā)(bᵢ−b̄)/(n−1) */
export const covarCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = readRange(ctx, 'a');
  if (a === null) return fail(make(ERROR_CODES.REF, '数组1 区域无效', 'a 要写成「左上角:右下角」，如 A2:A6。'));
  const b = readRange(ctx, 'b');
  if (b === null) return fail(make(ERROR_CODES.REF, '数组2 区域无效', 'b 要写成「左上角:右下角」，如 B2:B6。'));
  if (a.length !== b.length) {
    return fail(make(ERROR_CODES.NA, '两组数据长度不一致', 'array1 与 array2 的单元格个数必须相同。'));
  }
  const n = a.length;
  if (n < 2) {
    return fail(make(ERROR_CODES.DIV0, '数据少于 2 个无法算协方差', '协方差需要 n≥2。'));
  }
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let cov = 0;
  for (let i = 0; i < n; i++) {
    cov += (a[i] - ma) * (b[i] - mb);
  }
  cov /= n - 1;
  return ok(cov, formatNumber(cov));
};

/* ============================ 二项分布临界值 ============================ */

/** CRITBINOM：满足 P(X≤k)≥alpha 的最小 k */
export const critbinomCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = numArg(ctx.args, 'n');
  if (n === null) return fail(make(ERROR_CODES.VALUE, 'n 不是数字', '第 1 参数 n 必须是数字。'));
  const p = numArg(ctx.args, 'p');
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'p 不是数字', '第 2 参数 p 必须是数字。'));
  const alpha = numArg(ctx.args, 'alpha');
  if (alpha === null) return fail(make(ERROR_CODES.VALUE, 'alpha 不是数字', '第 3 参数 alpha 必须是数字。'));
  if (!Number.isInteger(n) || n < 0) {
    return fail(make(ERROR_CODES.NUM, 'n 必须为非负整数', 'n 应是非负整数。'));
  }
  if (p < 0 || p > 1) {
    return fail(make(ERROR_CODES.NUM, 'p 必须在 [0,1]', '需满足 0≤p≤1。'));
  }
  if (alpha < 0 || alpha > 1) {
    return fail(make(ERROR_CODES.NUM, 'alpha 必须在 [0,1]', '需满足 0≤alpha≤1。'));
  }
  for (let k = 0; k <= n; k++) {
    const c = k === n ? 1 : lowerRegBeta(n - k, k + 1, 1 - p);
    if (c >= alpha) {
      return ok(k, formatNumber(k));
    }
  }
  return fail(make(ERROR_CODES.NUM, '找不到满足条件的 k', '当 alpha>1 时无解，请检查 alpha。'));
};

/* ============================ 指数分布 ============================ */

/** EXPONDIST：指数分布密度 / 累积 */
export const expondistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = numArg(ctx.args, 'x');
  if (x === null) return fail(make(ERROR_CODES.VALUE, 'x 不是数字', '第 1 参数 x 必须是数字。'));
  const lambda = numArg(ctx.args, 'lambda');
  if (lambda === null) return fail(make(ERROR_CODES.VALUE, 'lambda 不是数字', '第 2 参数 lambda 必须是数字。'));
  const cum = parseBool(ctx.args.cum);
  if (cum === null) return fail(make(ERROR_CODES.VALUE, '第 3 参数不是逻辑值', 'cumulative 填 TRUE 或 FALSE。'));
  if (x < 0 || lambda <= 0) {
    return fail(make(ERROR_CODES.NUM, '参数超出合法范围', '需满足 x≥0、lambda>0。'));
  }
  const r = cum ? 1 - Math.exp(-lambda * x) : lambda * Math.exp(-lambda * x);
  return ok(r, formatNumber(r));
};

/* ============================ F 分布 ============================ */

/** FDIST：右尾 F 概率 = I_{df2/(df2+df1·x)}(df2/2, df1/2) */
export const fdistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = numArg(ctx.args, 'x');
  if (x === null) return fail(make(ERROR_CODES.VALUE, 'x 不是数字', '第 1 参数 x 必须是数字。'));
  const df1 = numArg(ctx.args, 'df1');
  if (df1 === null) return fail(make(ERROR_CODES.VALUE, 'df1 不是数字', '第 2 参数 df1 必须是数字。'));
  const df2 = numArg(ctx.args, 'df2');
  if (df2 === null) return fail(make(ERROR_CODES.VALUE, 'df2 不是数字', '第 3 参数 df2 必须是数字。'));
  if (x < 0) {
    return fail(make(ERROR_CODES.NUM, 'x 不能为负', 'x 必须大于等于 0。'));
  }
  if (!Number.isInteger(df1) || df1 < 1 || !Number.isInteger(df2) || df2 < 1) {
    return fail(make(ERROR_CODES.NUM, '自由度必须 ≥1 且为整数', 'df1、df2 都应是不小于 1 的整数。'));
  }
  const r = lowerRegBeta(df2 / 2, df1 / 2, df2 / (df2 + df1 * x));
  return ok(r, formatNumber(r));
};

/** FINV：FDIST 的逆函数 */
export const finvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = numArg(ctx.args, 'p');
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'p 不是数字', '第 1 参数 p 必须是数字。'));
  const df1 = numArg(ctx.args, 'df1');
  if (df1 === null) return fail(make(ERROR_CODES.VALUE, 'df1 不是数字', '第 2 参数 df1 必须是数字。'));
  const df2 = numArg(ctx.args, 'df2');
  if (df2 === null) return fail(make(ERROR_CODES.VALUE, 'df2 不是数字', '第 3 参数 df2 必须是数字。'));
  if (!Number.isInteger(df1) || df1 < 1 || !Number.isInteger(df2) || df2 < 1) {
    return fail(make(ERROR_CODES.NUM, '自由度必须 ≥1 且为整数', 'df1、df2 都应是不小于 1 的整数。'));
  }
  if (p <= 0 || p > 1) {
    return fail(make(ERROR_CODES.NUM, 'p 必须在 (0,1]', '需满足 0<p≤1。'));
  }
  const f = (xx: number): number => lowerRegBeta(df2 / 2, df1 / 2, df2 / (df2 + df1 * xx));
  const x = invert1d(f, p, 0, 1e6, 200);
  return ok(x, formatNumber(x));
};

/** FTEST：双样本双尾 F 检验的 p 值 */
export const ftestCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = readRange(ctx, 'a');
  if (a === null) return fail(make(ERROR_CODES.REF, '数组1 区域无效', 'a 要写成「左上角:右下角」，如 A2:A6。'));
  const b = readRange(ctx, 'b');
  if (b === null) return fail(make(ERROR_CODES.REF, '数组2 区域无效', 'b 要写成「左上角:右下角」，如 B2:B6。'));
  const na = a.length;
  const nb = b.length;
  if (na < 2 || nb < 2) {
    return fail(make(ERROR_CODES.DIV0, '样本量不足无法算方差', '两组都需要 n≥2 才能算样本方差。'));
  }
  const va = sampleVar(a);
  const vb = sampleVar(b);
  if (va === 0 || vb === 0) {
    return fail(make(ERROR_CODES.DIV0, '某组方差为 0', '两组数据不能有全相等（方差为 0）的组。'));
  }
  const F = Math.max(va, vb) / Math.min(va, vb);
  const df1 = na - 1;
  const df2 = nb - 1;
  const pRight = lowerRegBeta(df2 / 2, df1 / 2, df2 / (df2 + df1 * F));
  const r = 2 * Math.min(pRight, 1 - pRight);
  return ok(r, formatNumber(r));
};

/* ============================ Gamma 分布 ============================ */

/** GAMMADIST：Gamma 分布密度 / 累积（beta 为尺度参数） */
export const gammadistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = numArg(ctx.args, 'x');
  if (x === null) return fail(make(ERROR_CODES.VALUE, 'x 不是数字', '第 1 参数 x 必须是数字。'));
  const alpha = numArg(ctx.args, 'alpha');
  if (alpha === null) return fail(make(ERROR_CODES.VALUE, 'alpha 不是数字', '第 2 参数 alpha 必须是数字。'));
  const beta = numArg(ctx.args, 'beta');
  if (beta === null) return fail(make(ERROR_CODES.VALUE, 'beta 不是数字', '第 3 参数 beta 必须是数字。'));
  const cum = parseBool(ctx.args.cum);
  if (cum === null) return fail(make(ERROR_CODES.VALUE, '第 4 参数不是逻辑值', 'cumulative 填 TRUE 或 FALSE。'));
  if (x < 0) {
    return fail(make(ERROR_CODES.NUM, 'x 不能为负', 'x 必须大于等于 0。'));
  }
  if (alpha <= 0 || beta <= 0) {
    return fail(make(ERROR_CODES.NUM, 'alpha、beta 必须为正', 'alpha 和 beta 都要大于 0。'));
  }
  let r: number;
  if (cum) {
    r = lowerRegGamma(alpha, x / beta);
  } else {
    r = Math.pow(x, alpha - 1) * Math.exp(-x / beta) / (Math.pow(beta, alpha) * gamma(alpha));
  }
  return ok(r, formatNumber(r));
};

/** GAMMAINV：GAMMADIST 的逆函数 */
export const gammainvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = numArg(ctx.args, 'p');
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'p 不是数字', '第 1 参数 p 必须是数字。'));
  const alpha = numArg(ctx.args, 'alpha');
  if (alpha === null) return fail(make(ERROR_CODES.VALUE, 'alpha 不是数字', '第 2 参数 alpha 必须是数字。'));
  const beta = numArg(ctx.args, 'beta');
  if (beta === null) return fail(make(ERROR_CODES.VALUE, 'beta 不是数字', '第 3 参数 beta 必须是数字。'));
  if (p <= 0 || p >= 1 || alpha <= 0 || beta <= 0) {
    return fail(make(ERROR_CODES.NUM, '参数超出合法范围', '需满足 0<p<1、alpha>0、beta>0。'));
  }
  const y = invert1d((t) => lowerRegGamma(alpha, t), p, 0, 1e6, 200);
  const x = beta * y;
  return ok(x, formatNumber(x));
};

/* ============================ 超几何分布 ============================ */

/** HYPGEOMDIST：超几何分布概率质量 */
export const hypgeomdistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const s = numArg(ctx.args, 's');
  if (s === null) return fail(make(ERROR_CODES.VALUE, 'sample_s 不是数字', '第 1 参数 sample_s 必须是数字。'));
  const n = numArg(ctx.args, 'n');
  if (n === null) return fail(make(ERROR_CODES.VALUE, 'number_sample 不是数字', '第 2 参数 number_sample 必须是数字。'));
  const ps = numArg(ctx.args, 'ps');
  if (ps === null) return fail(make(ERROR_CODES.VALUE, 'population_s 不是数字', '第 3 参数 population_s 必须是数字。'));
  const np = numArg(ctx.args, 'np');
  if (np === null) return fail(make(ERROR_CODES.VALUE, 'number_pop 不是数字', '第 4 参数 number_pop 必须是数字。'));
  if (![s, n, ps, np].every((v) => Number.isInteger(v))) {
    return fail(make(ERROR_CODES.NUM, '四个参数都必须是整数', 'sample_s、number_sample、population_s、number_pop 均取整数。'));
  }
  if (s < 0 || s > ps || ps > np) {
    return fail(make(ERROR_CODES.NUM, '样本成功数超出范围', '需满足 0≤sample_s≤population_s≤number_pop。'));
  }
  if (n < 0 || n > np || s > n) {
    return fail(make(ERROR_CODES.NUM, '抽样数超出范围', '需满足 0≤number_sample≤number_pop 且 sample_s≤number_sample。'));
  }
  const r = (combo(ps, s) * combo(np - ps, n - s)) / combo(np, n);
  return ok(r, formatNumber(r));
};

/* ============================ 对数正态 ============================ */

/** LOGINV：对数正态逆 CDF = exp(mean + sd·Φ⁻¹(p)) */
export const loginvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = numArg(ctx.args, 'p');
  if (p === null) return fail(make(ERROR_CODES.VALUE, 'p 不是数字', '第 1 参数 p 必须是数字。'));
  const mean = numArg(ctx.args, 'mean');
  if (mean === null) return fail(make(ERROR_CODES.VALUE, 'mean 不是数字', '第 2 参数 mean 必须是数字。'));
  const sd = numArg(ctx.args, 'sd');
  if (sd === null) return fail(make(ERROR_CODES.VALUE, 'sd 不是数字', '第 3 参数 sd 必须是数字。'));
  if (p <= 0 || p >= 1) {
    return fail(make(ERROR_CODES.NUM, 'p 必须在 (0,1)', '需满足 0<p<1。'));
  }
  if (sd <= 0) {
    return fail(make(ERROR_CODES.NUM, 'sd 必须为正', 'sd 必须大于 0。'));
  }
  const r = Math.exp(mean + sd * normSinv(p));
  return ok(r, formatNumber(r));
};

/** LOGNORMDIST：对数正态分布密度 / 累积 */
export const lognordistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = numArg(ctx.args, 'x');
  if (x === null) return fail(make(ERROR_CODES.VALUE, 'x 不是数字', '第 1 参数 x 必须是数字。'));
  const mean = numArg(ctx.args, 'mean');
  if (mean === null) return fail(make(ERROR_CODES.VALUE, 'mean 不是数字', '第 2 参数 mean 必须是数字。'));
  const sd = numArg(ctx.args, 'sd');
  if (sd === null) return fail(make(ERROR_CODES.VALUE, 'sd 不是数字', '第 3 参数 sd 必须是数字。'));
  const cum = parseBool(ctx.args.cum);
  if (cum === null) return fail(make(ERROR_CODES.VALUE, '第 4 参数不是逻辑值', 'cumulative 填 TRUE 或 FALSE。'));
  if (x <= 0 || sd <= 0) {
    return fail(make(ERROR_CODES.NUM, '参数超出合法范围', '需满足 x>0、sd>0。'));
  }
  let r: number;
  if (cum) {
    r = 0.5 * (1 + erf((Math.log(x) - mean) / (sd * Math.SQRT2)));
  } else {
    r = Math.exp(-Math.pow(Math.log(x) - mean, 2) / (2 * sd * sd)) / (x * sd * Math.sqrt(2 * Math.PI));
  }
  return ok(r, formatNumber(r));
};
