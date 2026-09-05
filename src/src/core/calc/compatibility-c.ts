import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { ok, fail, stripQuotes } from './types';
import { toNumber, formatNumber, numericValues } from './helpers';
import { sliceSheet } from '@/core/ref';
import { lngamma, upperRegGamma, lowerRegBeta, erf } from './special';
import { percentileInc, rank } from './quantile';

/**
 * Compatibility 类 B15 批次（Excel 2007 兼容统计分布）共 21 个在线试算 handler：
 *   mode negbinomdist normdist norminv normsdist normsinv percentile percentrank
 *   phonetic poisson quartile rank stdev stdevp tdist tinv ttest var varp weibull ztest
 *
 * 公式语义按 Excel 2007「兼容性」分类实现（MODE / NEGBINOMDIST / NORMDIST / NORMINV /
 * NORMSDIST / NORMSINV / PERCENTILE / PERCENTRANK / PHONETIC / POISSON / QUARTILE / RANK /
 * STDEV / STDEVP / TDIST / TINV / TTEST / VAR / VARP / WEIBULL / ZTEST）。
 *
 * 共享设施：ok/fail/stripQuotes 来自 ./types，ERROR_CODES/make 来自 @/core/errors，
 * toNumber/formatNumber/numericValues 来自 ./helpers，sliceSheet 来自 @/core/ref，
 * 特殊函数来自 ./special，分位数/排名来自 ./quantile。其余本地辅助函数在本文件定义。
 */

/* ===================== 本地辅助函数 ===================== */

/** 标准正态 CDF：Φ(z) = 0.5*(1+erf(z/√2)) */
function normCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** 标准正态逆 CDF 求解：解 0.5*(1+erf(z/√2)) === p，区间 [-12,12] 二分 ~120 次 */
function normSinv(p: number): number {
  let lo = -12;
  let hi = 12;
  for (let i = 0; i < 120; i += 1) {
    const mid = (lo + hi) / 2;
    if (normCdf(mid) > p) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return (lo + hi) / 2;
}

/** 一维二分求解 f(x) === target（要求 f 在 [lo,hi] 上单调） */
function invert1d(
  f: (x: number) => number,
  target: number,
  lo: number,
  hi: number,
  iters = 200,
): number {
  const fLo = f(lo);
  const fHi = f(hi);
  const decreasing = fLo > fHi;
  let a = lo;
  let b = hi;
  for (let i = 0; i < iters; i += 1) {
    const mid = (a + b) / 2;
    const fm = f(mid);
    if (decreasing) {
      if (fm > target) {
        a = mid;
      } else {
        b = mid;
      }
    } else if (fm > target) {
      b = mid;
    } else {
      a = mid;
    }
  }
  return (a + b) / 2;
}

/** 解析布尔参数：'TRUE'/'1'/'true' → true，'FALSE'/'0'/'false' → false，其余 → null */
function parseBool(raw: string | undefined): boolean | null {
  if (raw === undefined) {
    return null;
  }
  const s = raw.trim().toUpperCase();
  if (s === 'TRUE' || s === '1') {
    return true;
  }
  if (s === 'FALSE' || s === '0') {
    return false;
  }
  return null;
}

/** 组合数 C(n,k) = exp(lnΓ(n+1) - lnΓ(k+1) - lnΓ(n-k+1)) */
function combo(n: number, k: number): number {
  return Math.exp(lngamma(n + 1) - lngamma(k + 1) - lngamma(n - k + 1));
}

/** 从 ctx.args[key] 读区域并抽出数字（非法引用返回 null） */
function readRange(ctx: CalcContext, key: string): number[] | null {
  const sh = sliceSheet(ctx.sheet, ctx.args[key] ?? '');
  if (!sh) {
    return null;
  }
  return numericValues(sh.rows.flat());
}

/** 算术均值 */
function mean(v: number[]): number {
  let s = 0;
  for (const x of v) {
    s += x;
  }
  return s / v.length;
}

/** 样本方差（除以 n-1） */
function varSample(v: number[]): number {
  const m = mean(v);
  let s = 0;
  for (const x of v) {
    s += (x - m) * (x - m);
  }
  return s / (v.length - 1);
}

/** 总体方差（除以 n） */
function varPop(v: number[]): number {
  const m = mean(v);
  let s = 0;
  for (const x of v) {
    s += (x - m) * (x - m);
  }
  return s / v.length;
}

/** 样本标准差 */
function stdevSample(v: number[]): number {
  return Math.sqrt(varSample(v));
}

/** 总体标准差 */
function stdevPop(v: number[]): number {
  return Math.sqrt(varPop(v));
}

/** Student-t 分布概率（tails: 1 = 单尾，2 = 双尾），供 tdist 与 ttest 复用 */
function tdistValue(x: number, df: number, tails: number): number {
  const p1 = 0.5 * lowerRegBeta(df / 2, 0.5, df / (df + x * x));
  return tails === 1 ? p1 : 2 * p1;
}

/* ===================== 21 个 handler ===================== */

/** MODE · 众数（区域里出现次数最多的数值；全不重复则 #N/A） */
export const modeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'n');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A9。'));
  }
  if (vals.length === 0) {
    return fail(make(ERROR_CODES.NA, '区域里一个数字都没有，没法求众数。', '把区域框到真正有数字的单元格。'));
  }
  const freq = new Map<number, number>();
  for (const v of vals) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  let maxF = -1;
  let result = NaN;
  for (const [val, count] of freq) {
    if (count > maxF) {
      maxF = count;
      result = val;
    }
  }
  if (maxF <= 1) {
    return fail(make(ERROR_CODES.NA, '每个值都只出现一次，没有众数。', '众数要求至少有一个值重复出现。'));
  }
  return ok(result, formatNumber(result));
};

/** NEGBINOMDIST · 负二项分布概率质量 */
export const negbinomdistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const f = toNumber(ctx.args.f);
  const s = toNumber(ctx.args.s);
  const p = toNumber(ctx.args.p);
  if (f === null || s === null || p === null) {
    return fail(make(ERROR_CODES.VALUE, '失败次数 / 成功次数 / 成功概率 必须是数字。', '三个参数都填数字。'));
  }
  if (
    !Number.isInteger(f) || f < 0 ||
    !Number.isInteger(s) || s < 1 ||
    p < 0 || p > 1
  ) {
    return fail(make(ERROR_CODES.NUM, '参数越界：f≥0 且为整数、s≥1 且为整数、0≤p≤1。', '检查参数范围。'));
  }
  const pmf = combo(f + s - 1, s - 1) * Math.pow(p, s) * Math.pow(1 - p, f);
  return ok(pmf, formatNumber(pmf));
};

/** NORMDIST · 正态分布概率密度 / 累积分布 */
export const normdistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = toNumber(ctx.args.x);
  const mean = toNumber(ctx.args.mean);
  const sd = toNumber(ctx.args.sd);
  const cum = parseBool(ctx.args.cum);
  if (x === null || mean === null || sd === null) {
    return fail(make(ERROR_CODES.VALUE, 'x / 均值 / 标准差 必须是数字。', '三个参数都填数字。'));
  }
  if (cum === null) {
    return fail(make(ERROR_CODES.VALUE, '第 4 参数必须填 TRUE（累积）或 FALSE（密度）。', '累积填 TRUE，密度填 FALSE。'));
  }
  if (sd <= 0) {
    return fail(make(ERROR_CODES.NUM, '标准差必须 > 0。', '把标准差换成正数。'));
  }
  const res = cum
    ? normCdf((x - mean) / sd)
    : Math.exp(-0.5 * Math.pow((x - mean) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI));
  return ok(res, formatNumber(res));
};

/** NORMINV · 正态累积分布的反函数 */
export const norminvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = toNumber(ctx.args.p);
  const mean = toNumber(ctx.args.mean);
  const sd = toNumber(ctx.args.sd);
  if (p === null || mean === null || sd === null) {
    return fail(make(ERROR_CODES.VALUE, '概率 / 均值 / 标准差 必须是数字。', '三个参数都填数字。'));
  }
  if (p <= 0 || p >= 1 || sd <= 0) {
    return fail(make(ERROR_CODES.NUM, '概率必须 0<p<1，标准差必须 > 0。', '把概率调到 0 到 1 之间。'));
  }
  const x = mean + sd * normSinv(p);
  return ok(x, formatNumber(x));
};

/** NORMSDIST · 标准正态累积分布 */
export const normsdistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const z = toNumber(ctx.args.z);
  if (z === null) {
    return fail(make(ERROR_CODES.VALUE, 'z 必须是数字。', '填一个数字。'));
  }
  const res = normCdf(z);
  return ok(res, formatNumber(res));
};

/** NORMSINV · 标准正态累积分布的反函数 */
export const normsinvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = toNumber(ctx.args.p);
  if (p === null) {
    return fail(make(ERROR_CODES.VALUE, '概率必须是数字。', '填一个数字。'));
  }
  if (p <= 0 || p >= 1) {
    return fail(make(ERROR_CODES.NUM, '概率必须 0<p<1。', '把概率调到 0 到 1 之间。'));
  }
  const res = normSinv(p);
  return ok(res, formatNumber(res));
};

/** PERCENTILE · 百分位数（k∈[0,1]） */
export const percentileCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'a');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A6。'));
  }
  const k = toNumber(ctx.args.k);
  if (k === null) {
    return fail(make(ERROR_CODES.VALUE, '百分比 k 必须是数字。', '填 0 到 1 之间的数字。'));
  }
  if (k < 0 || k > 1) {
    return fail(make(ERROR_CODES.NUM, 'k 必须落在 0 到 1 之间。', '把 k 调到 0 到 1 之间。'));
  }
  const r = percentileInc(vals, k);
  return ok(r, formatNumber(r));
};

/** PERCENTRANK · 百分比排名 */
export const percentrankCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'a');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A6。'));
  }
  const x = toNumber(ctx.args.x);
  if (x === null) {
    return fail(make(ERROR_CODES.VALUE, '要查排名的值必须是数字。', '填一个数字。'));
  }
  const sigRaw = ctx.args.sig;
  let sig = 3;
  if (sigRaw !== undefined && sigRaw.trim() !== '') {
    const s = toNumber(sigRaw);
    if (s === null) {
      return fail(make(ERROR_CODES.VALUE, '显著性位数必须是数字。', '填一个整数表示保留几位小数。'));
    }
    sig = s;
  }
  const n = vals.length;
  if (n < 2) {
    return fail(make(ERROR_CODES.DIV0, '区域里数字太少，算不出排名。', '至少放两个数字。'));
  }
  let countLess = 0;
  let countEq = 0;
  for (const v of vals) {
    if (v < x) countLess += 1;
    else if (v === x) countEq += 1;
  }
  if (countEq === 0) {
    return fail(make(ERROR_CODES.NA, '要查的值不在区域里，没有它的排名。', '确认这个值确实出现在区域中。'));
  }
  const rp = (countLess + 0.5 * countEq) / (n - 1);
  const factor = Math.pow(10, sig);
  const roundedRp = Math.round(rp * factor) / factor;
  return ok(rp, formatNumber(roundedRp));
};

/** PHONETIC · 提取文本（本实现仅回显首格文字，不存储假名） */
export const phoneticCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const raw = ctx.args.ref ?? '';
  const sh = sliceSheet(ctx.sheet, raw);
  if (!sh || sh.rows.length === 0) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A2。'));
  }
  const cell = sh.rows[0]?.[0] ?? null;
  const txt = cell === null ? '' : stripQuotes(String(cell)).inner;
  return ok(txt, txt);
};

/** POISSON · 泊松分布 */
export const poissonCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = toNumber(ctx.args.x);
  const m = toNumber(ctx.args.m);
  const cum = parseBool(ctx.args.cum);
  if (x === null || m === null) {
    return fail(make(ERROR_CODES.VALUE, 'x / 均值 必须是数字。', '两个参数都填数字。'));
  }
  if (cum === null) {
    return fail(make(ERROR_CODES.VALUE, '第 3 参数必须填 TRUE（累积）或 FALSE（概率质量）。', '累积填 TRUE，概率填 FALSE。'));
  }
  if (!Number.isInteger(x) || x < 0 || m <= 0) {
    return fail(make(ERROR_CODES.NUM, 'x 必须是 ≥0 的整数，均值必须 > 0。', '检查参数范围。'));
  }
  const res = cum
    ? upperRegGamma(x + 1, m)
    : Math.exp(-m + x * Math.log(m) - lngamma(x + 1));
  return ok(res, formatNumber(res));
};

/** QUARTILE · 四分位数（q∈{0,1,2,3,4}） */
export const quartileCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'a');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A6。'));
  }
  const q = toNumber(ctx.args.q);
  if (q === null) {
    return fail(make(ERROR_CODES.VALUE, '四分位点 q 必须是数字。', '填 0、1、2、3 或 4。'));
  }
  if (!Number.isInteger(q) || q < 0 || q > 4) {
    return fail(make(ERROR_CODES.NUM, 'q 必须是 0~4 的整数。', '填 0、1、2、3 或 4。'));
  }
  const r = percentileInc(vals, q / 4);
  return ok(r, formatNumber(r));
};

/** RANK · 排名（order: 0=降序默认，1=升序） */
export const rankCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = toNumber(ctx.args.n);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, '要排名的值必须是数字。', '填一个数字。'));
  }
  const vals = readRange(ctx, 'ref');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A6。'));
  }
  const order = parseBool(ctx.args.order) === true ? 1 : 0;
  const r = rank(n, vals, order === 1 ? 1 : 0);
  if (Number.isNaN(r)) {
    return fail(make(ERROR_CODES.NA, '要排名的值不在区域里。', '确认这个值确实出现在区域中。'));
  }
  return ok(r, formatNumber(r));
};

/** STDEV · 样本标准差（除以 n-1） */
export const stdevCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'n');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A9。'));
  }
  if (vals.length < 2) {
    return fail(make(ERROR_CODES.DIV0, '样本数少于 2，算不出样本标准差。', '至少选两个数字。'));
  }
  return ok(stdevSample(vals), formatNumber(stdevSample(vals)));
};

/** STDEVP · 总体标准差（除以 n） */
export const stdevpCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'n');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A9。'));
  }
  if (vals.length < 1) {
    return fail(make(ERROR_CODES.DIV0, '区域里没有数字，算不出总体标准差。', '至少选一个数字。'));
  }
  return ok(stdevPop(vals), formatNumber(stdevPop(vals)));
};

/** TDIST · Student-t 分布 */
export const tdistCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = toNumber(ctx.args.x);
  const df = toNumber(ctx.args.df);
  const tails = toNumber(ctx.args.tails);
  if (x === null || df === null || tails === null) {
    return fail(make(ERROR_CODES.VALUE, 'x / 自由度 / 尾数 必须是数字。', '三个参数都填数字。'));
  }
  if (tails !== 1 && tails !== 2) {
    return fail(make(ERROR_CODES.NUM, '尾数只能是 1（单尾）或 2（双尾）。', '填 1 或 2。'));
  }
  if (!Number.isInteger(df) || df < 1) {
    return fail(make(ERROR_CODES.NUM, '自由度必须是 ≥1 的整数。', '把自由度换成正整数。'));
  }
  if (x < 0) {
    return fail(make(ERROR_CODES.NUM, 'Excel 的 TDIST 要求 x≥0。', '用 |x|，或用 T.DIST 取负值。'));
  }
  const res = tdistValue(x, df, tails);
  return ok(res, formatNumber(res));
};

/** TINV · 双尾 Student-t 反函数 */
export const tinvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = toNumber(ctx.args.p);
  const df = toNumber(ctx.args.df);
  if (p === null || df === null) {
    return fail(make(ERROR_CODES.VALUE, '概率 / 自由度 必须是数字。', '两个参数都填数字。'));
  }
  if (p <= 0 || p >= 1) {
    return fail(make(ERROR_CODES.NUM, '概率必须 0<p<1。', '把概率调到 0 到 1 之间。'));
  }
  if (!Number.isInteger(df) || df < 1) {
    return fail(make(ERROR_CODES.NUM, '自由度必须是 ≥1 的整数。', '把自由度换成正整数。'));
  }
  const target = p / 2;
  const f = (xx: number): number => 0.5 * lowerRegBeta(df / 2, 0.5, df / (df + xx * xx));
  const x = invert1d(f, target, 0, 1e6, 200);
  return ok(x, formatNumber(x));
};

/** TTEST · t 检验 p 值（type: 1=配对，2=等方差，3=异方差/Welch） */
export const ttestCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const aVals = readRange(ctx, 'a');
  if (aVals === null) {
    return fail(make(ERROR_CODES.REF, '第 1 个区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A6。'));
  }
  const bVals = readRange(ctx, 'b');
  if (bVals === null) {
    return fail(make(ERROR_CODES.REF, '第 2 个区域不存在或写法不对。', '区域写成「左上角:右下角」，如 B2:B6。'));
  }
  const tails = toNumber(ctx.args.tails);
  const type = toNumber(ctx.args.type);
  if (tails === null || type === null) {
    return fail(make(ERROR_CODES.VALUE, '尾数 / 检验类型 必须是数字。', '尾数填 1 或 2，类型填 1、2 或 3。'));
  }
  if (tails !== 1 && tails !== 2) {
    return fail(make(ERROR_CODES.NUM, '尾数只能是 1（单尾）或 2（双尾）。', '填 1 或 2。'));
  }
  if (type !== 1 && type !== 2 && type !== 3) {
    return fail(make(ERROR_CODES.NUM, '检验类型只能是 1（配对）、2（等方差）或 3（异方差）。', '填 1、2 或 3。'));
  }
  const na = aVals.length;
  const nb = bVals.length;
  if (na < 2 || nb < 2) {
    return fail(make(ERROR_CODES.NUM, '每组至少要有 2 个数字才能做 t 检验。', '把每组数据补齐到 2 个以上。'));
  }
  let t: number;
  let df: number;
  if (type === 1) {
    if (na !== nb) {
      return fail(make(ERROR_CODES.VALUE, '配对检验要求两组数据个数一样多。', '两组选同样多的单元格。'));
    }
    const d = aVals.map((v, i) => v - bVals[i]);
    const md = mean(d);
    const sd = stdevSample(d);
    if (sd === 0) {
      return fail(make(ERROR_CODES.NUM, '两组差值完全相同，标准差为 0，无法计算。', '换一组有差异的数据。'));
    }
    t = md / (sd / Math.sqrt(d.length));
    df = d.length - 1;
  } else if (type === 2) {
    const ma = mean(aVals);
    const mb = mean(bVals);
    const va = varSample(aVals);
    const vb = varSample(bVals);
    const spa = ((na - 1) * va + (nb - 1) * vb) / (na + nb - 2);
    const se = Math.sqrt(spa * (1 / na + 1 / nb));
    t = (ma - mb) / se;
    df = na + nb - 2;
  } else {
    const ma = mean(aVals);
    const mb = mean(bVals);
    const va = varSample(aVals);
    const vb = varSample(bVals);
    const se = Math.sqrt(va / na + vb / nb);
    t = (ma - mb) / se;
    df = Math.pow(va / na + vb / nb, 2) /
      (Math.pow(va / na, 2) / (na - 1) + Math.pow(vb / nb, 2) / (nb - 1));
  }
  const p = tails === 1 ? tdistValue(Math.abs(t), df, 1) : tdistValue(Math.abs(t), df, 2);
  return ok(p, formatNumber(p));
};

/** VAR · 样本方差（除以 n-1） */
export const varCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'n');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A9。'));
  }
  if (vals.length < 2) {
    return fail(make(ERROR_CODES.DIV0, '样本数少于 2，算不出样本方差。', '至少选两个数字。'));
  }
  return ok(varSample(vals), formatNumber(varSample(vals)));
};

/** VARP · 总体方差（除以 n） */
export const varpCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'n');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A9。'));
  }
  if (vals.length < 1) {
    return fail(make(ERROR_CODES.DIV0, '区域里没有数字，算不出总体方差。', '至少选一个数字。'));
  }
  return ok(varPop(vals), formatNumber(varPop(vals)));
};

/** WEIBULL · 韦伯分布 */
export const weibullCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = toNumber(ctx.args.x);
  const alpha = toNumber(ctx.args.alpha);
  const beta = toNumber(ctx.args.beta);
  const cum = parseBool(ctx.args.cum);
  if (x === null || alpha === null || beta === null) {
    return fail(make(ERROR_CODES.VALUE, 'x / alpha / beta 必须是数字。', '三个参数都填数字。'));
  }
  if (cum === null) {
    return fail(make(ERROR_CODES.VALUE, '第 4 参数必须填 TRUE（累积）或 FALSE（密度）。', '累积填 TRUE，密度填 FALSE。'));
  }
  if (x < 0 || alpha <= 0 || beta <= 0) {
    return fail(make(ERROR_CODES.NUM, '要求 x≥0、alpha>0、beta>0。', '检查参数范围。'));
  }
  const res = cum
    ? 1 - Math.exp(-Math.pow(x / beta, alpha))
    : (alpha / beta) * Math.pow(x / beta, alpha - 1) * Math.exp(-Math.pow(x / beta, alpha));
  return ok(res, formatNumber(res));
};

/** ZTEST · 单样本 z 检验 */
export const ztestCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = readRange(ctx, 'a');
  if (vals === null) {
    return fail(make(ERROR_CODES.REF, '引用的区域不存在或写法不对。', '区域写成「左上角:右下角」，如 A2:A6。'));
  }
  const x = toNumber(ctx.args.x);
  const sigma = toNumber(ctx.args.sigma);
  if (x === null || sigma === null) {
    return fail(make(ERROR_CODES.VALUE, '检验值 / 总体标准差 必须是数字。', '两个参数都填数字。'));
  }
  const n = vals.length;
  if (n < 1) {
    return fail(make(ERROR_CODES.DIV0, '区域里没有数字，算不出 z 检验。', '至少选一个数字。'));
  }
  if (sigma <= 0) {
    return fail(make(ERROR_CODES.NUM, '总体标准差必须 > 0。', '把标准差换成正数。'));
  }
  const meanA = mean(vals);
  const z = (meanA - x) / (sigma / Math.sqrt(n));
  const p = 1 - normCdf(z);
  return ok(p, formatNumber(p));
};
