import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber } from './helpers';

/**
 * 工程类 B12 批次：4 个贝塞尔函数在线试算实现
 *   besselj / besseli / bessely / besselk
 *
 * 纯值变换：参数就是数字 x（自变量）与 n（整数阶数），不读 sheet。
 * 贝塞尔数学从零实现（./special 没有 Bessel）；
 * - J_n / I_n：幂级数（|x| ≤ 20），|x| > 20 用渐近展开。
 * - Y_n：先由级数算 Y_0、Y_1，再用递推 Y_{k+1}=(2k/x)Y_k - Y_{k-1} 升阶（|x| ≤ 20），
 *         |x| > 20 用汉克尔渐近展开。
 * - K_n：带调和数/双伽玛的级数（x ≤ 12，避免大 x 的相消误差），x > 12 用渐近展开。
 *
 * Excel 行为：x 须 ≥ 0（x < 0 → #NUM!）；Y/K 在 x = 0 处无定义 → #NUM!；
 * n 截断为整数，截断后 n < 0 → #NUM!；x 或 n 非数字 → #VALUE!。
 */

const GAMMA = 0.5772156649015329; // 欧拉-马歇罗尼常数

/* ===================== 数值工具 ===================== */

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i += 1) f *= i;
  return f;
}

/** H_n = 1 + 1/2 + … + 1/n（H_0 = 0） */
function harmonic(n: number): number {
  let h = 0;
  for (let i = 1; i <= n; i += 1) h += 1 / i;
  return h;
}

/** 双伽玛 ψ(m) = -γ + H_{m-1}（m ≥ 1 整数） */
function digamma(m: number): number {
  return m <= 0 ? 0 : -GAMMA + harmonic(m - 1);
}

/* ===================== J_n / I_n 级数 ===================== */

/** 第一类贝塞尔 J_n(x)，x ≥ 0，n 为非负整数 */
function besselJ(x: number, n: number): number {
  if (x === 0) return n === 0 ? 1 : 0;
  if (x > 20) return besselJAsym(x, n);
  const h = x / 2;
  const f = -(h * h);
  let term = Math.pow(h, n) / factorial(n);
  let sum = term;
  for (let k = 1; k < 600; k += 1) {
    term *= f / (k * (k + n));
    sum += term;
    if (Math.abs(term) < 1e-16 * Math.abs(sum)) break;
  }
  return sum;
}

/** 第一类修正贝塞尔 I_n(x)，x ≥ 0，n 为非负整数 */
function besselI(x: number, n: number): number {
  if (x === 0) return n === 0 ? 1 : 0;
  if (x > 20) return besselIAsym(x, n);
  const h = x / 2;
  const f = h * h;
  let term = Math.pow(h, n) / factorial(n);
  let sum = term;
  for (let k = 1; k < 600; k += 1) {
    term *= f / (k * (k + n));
    sum += term;
    if (Math.abs(term) < 1e-16 * Math.abs(sum)) break;
  }
  return sum;
}

/* ===================== Y_n 级数 + 递推 ===================== */

function y0Series(x: number): number {
  const h = x / 2;
  const j0 = besselJ(x, 0);
  let sum = 0;
  for (let k = 1; k < 600; k += 1) {
    const term = (harmonic(k) / Math.pow(factorial(k), 2)) * Math.pow(h, 2 * k);
    sum += (k % 2 === 1 ? 1 : -1) * term; // (-1)^{k+1}
  }
  return (2 / Math.PI) * ((Math.log(h) + GAMMA) * j0 + sum);
}

function y1Series(x: number): number {
  const h = x / 2;
  const j1 = besselJ(x, 1);
  // DLMF 10.8.2：Y_1 = (2/π)(ln(x/2)+γ)J_1 - 2/(πx) - (1/π) Σ_{k≥0} (-1)^k (H_k+H_{k+1})/(k!(k+1)!) (x/2)^{2k+1}
  let sum = 0;
  for (let k = 0; k < 600; k += 1) {
    const term =
      ((harmonic(k) + harmonic(k + 1)) / (factorial(k) * factorial(k + 1))) * Math.pow(h, 2 * k + 1);
    sum += (k % 2 === 0 ? 1 : -1) * term; // (-1)^k
  }
  return (2 / Math.PI) * ((Math.log(h) + GAMMA) * j1) - 2 / (Math.PI * x) - sum / Math.PI;
}

/** 第二类贝塞尔（韦伯）Y_n(x)，x > 0，n 为非负整数 */
function besselY(x: number, n: number): number {
  if (x > 20) return besselYAsym(x, n);
  const y0 = y0Series(x);
  if (n === 0) return y0;
  const y1 = y1Series(x);
  if (n === 1) return y1;
  let prev = y0;
  let cur = y1;
  for (let k = 1; k < n; k += 1) {
    const next = ((2 * k) / x) * cur - prev; // Y_{k+1} = (2k/x)Y_k - Y_{k-1}
    prev = cur;
    cur = next;
  }
  return cur;
}

/* ===================== K_n 级数 ===================== */

/** 第二类修正贝塞尔 K_n(x)，x > 0，n 为非负整数 */
function besselK(x: number, n: number): number {
  if (x > 12) return besselKAsym(x, n);
  const h = x / 2;
  const lnHalf = Math.log(h);
  // 多项式部分：½ (x/2)^{-n} Σ_{k=0}^{n-1} (-1)^k (n-k-1)!/(k!) (x/2)^{2k}
  let poly = 0;
  for (let k = 0; k < n; k += 1) {
    poly += (k % 2 === 0 ? 1 : -1) * (factorial(n - k - 1) / factorial(k)) * Math.pow(h, 2 * k);
  }
  poly *= 0.5 * Math.pow(h, -n);
  // 主级数：(-1)^{n+1} Σ (x/2)^{2k+n}/(k!(n+k)!) · [ln(x/2) - ½(ψ(k+1)+ψ(n+k+1))]
  let ser = 0;
  for (let k = 0; k < 600; k += 1) {
    const kf = factorial(k);
    const nkf = factorial(n + k);
    const t = Math.pow(h, 2 * k + n) / (kf * nkf);
    const bracket = lnHalf - 0.5 * (digamma(k + 1) + digamma(n + k + 1));
    ser += Math.pow(-1, n + 1) * t * bracket;
  }
  return poly + ser;
}

/* ===================== 渐近展开（大 |x|） ===================== */

function besselJAsym(x: number, n: number): number {
  const chi = x - (n * Math.PI) / 2 - Math.PI / 4;
  const inv = 1 / (8 * x);
  const mu = 4 * n * n;
  const p = 1 - ((mu - 1) * (mu - 9) * inv * inv) / 2;
  const q = (mu - 1) * inv - ((mu - 1) * (mu - 9) * (mu - 25) * Math.pow(inv, 3)) / 6;
  return Math.sqrt(2 / (Math.PI * x)) * (p * Math.cos(chi) - q * Math.sin(chi));
}

function besselYAsym(x: number, n: number): number {
  const chi = x - (n * Math.PI) / 2 - Math.PI / 4;
  const inv = 1 / (8 * x);
  const mu = 4 * n * n;
  const p = 1 - ((mu - 1) * (mu - 9) * inv * inv) / 2;
  const q = (mu - 1) * inv - ((mu - 1) * (mu - 9) * (mu - 25) * Math.pow(inv, 3)) / 6;
  return Math.sqrt(2 / (Math.PI * x)) * (p * Math.sin(chi) + q * Math.cos(chi));
}

function besselIAsym(x: number, n: number): number {
  const inv = 1 / (8 * x);
  const mu = 4 * n * n;
  const p = 1 - (mu - 1) * inv + ((mu - 1) * (mu - 9) * inv * inv) / 2;
  return Math.exp(x) / Math.sqrt(2 * Math.PI * x) * p;
}

function besselKAsym(x: number, n: number): number {
  const inv = 1 / (8 * x);
  const mu = 4 * n * n;
  const p = 1 + (mu - 1) * inv + ((mu - 1) * (mu - 9) * inv * inv) / 2;
  return Math.sqrt(Math.PI / (2 * x)) * Math.exp(-x) * p;
}

/* ===================== 参数读取与校验 ===================== */

interface Parsed {
  x: number;
  n: number;
}

function readArgs(ctx: CalcContext): Parsed | CalcOutcome {
  const xRaw = stripQuotes(ctx.args.x ?? '').inner.trim();
  const nRaw = stripQuotes(ctx.args.n ?? '').inner.trim();
  const x = toNumber(xRaw);
  const nVal = toNumber(nRaw);
  if (x === null || nVal === null) {
    return fail(make(ERROR_CODES.VALUE, '参数必须为数字', '请传入数字。'));
  }
  if (x < 0) {
    return fail(make(ERROR_CODES.NUM, 'x 必须大于等于 0', 'BESSEL 系列要求 x ≥ 0。'));
  }
  const n = Math.trunc(nVal);
  if (n < 0) {
    return fail(make(ERROR_CODES.NUM, '阶数 n 必须大于等于 0', 'n 需为非负整数（Excel 会截断小数，但负数阶数报 #NUM!）。'));
  }
  return { x, n };
}

function out(value: number, label: string): CalcOutcome {
  if (!Number.isFinite(value)) {
    return fail(make(ERROR_CODES.NUM, `${label} 算出来不是有效数字（多半溢出了），Excel 会报 #NUM!。`, '换一组能算出有限值的参数。'));
  }
  return ok(value, formatNumber(value));
}

/* ===================== 4 个 handler ===================== */

/** BESSELJ · 第一类贝塞尔函数 J_n(x) */
export const besseljCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = readArgs(ctx);
  if (!('x' in r)) return r;
  return out(besselJ(r.x, r.n), 'BESSELJ');
};

/** BESSELI · 第一类修正贝塞尔函数 I_n(x) */
export const besseliCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = readArgs(ctx);
  if (!('x' in r)) return r;
  return out(besselI(r.x, r.n), 'BESSELI');
};

/** BESSELY · 第二类贝塞尔函数 Y_n(x) */
export const besselyCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = readArgs(ctx);
  if (!('x' in r)) return r;
  if (r.x === 0) {
    return fail(make(ERROR_CODES.NUM, 'x 必须大于 0', 'BESSELY 在 x=0 处无定义，Excel 会报 #NUM!。'));
  }
  return out(besselY(r.x, r.n), 'BESSELY');
};

/** BESSELK · 第二类修正贝塞尔函数 K_n(x) */
export const besselkCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = readArgs(ctx);
  if (!('x' in r)) return r;
  if (r.x === 0) {
    return fail(make(ERROR_CODES.NUM, 'x 必须大于 0', 'BESSELK 在 x=0 处无定义，Excel 会报 #NUM!。'));
  }
  return out(besselK(r.x, r.n), 'BESSELK');
};
