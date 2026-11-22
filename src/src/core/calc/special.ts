/**
 * B0 支撑模块：特殊函数（数值计算，纯函数、零 DOM 依赖）。
 *
 * 提供误差函数、Gamma / Beta 函数、正则化不完全 Gamma / Beta 函数。
 * 精度目标 ~1e-7（Lanczos 8 项近似 + Numerical Recipes 的级数 / 连分式算法）。
 * 仅作为底层数值库被后续批次（工程复数、统计分布、兼容分布）导入，
 * 不要在本文件里注册任何用户可见的 Excel 函数。
 */

// ============================================================================
// Lanczos 近似（g=7，8 项系数）用于 log-Gamma
// ============================================================================
const LANCZOS_G = 7;
const LANCZOS_COEF = [
  0.99999999999980993,
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

const LOG_2_PI = Math.log(2 * Math.PI);

/** 连分式 / 级数的迭代上限与收敛阈值 */
const MAXIT = 300;
const EPS = 1e-13;
const FPMIN = 1e-300;

// ============================================================================
// Gamma / log-Gamma / Beta
// ============================================================================

/**
 * 对数 Gamma 函数 ln Γ(x)，基于 Lanczos 近似。
 * - lngamma(5) = ln(24) ≈ 3.17805
 * - lngamma(0.5) = ln(√π) ≈ 0.5723649
 * 对 x <= 0 通过反射公式处理（x=0,-1,-2,... 等极点返回 NaN/Infinity）。
 */
export function lngamma(x: number): number {
  if (Number.isNaN(x)) return NaN;
  if (x < 0.5) {
    // 反射公式：Γ(x) = π / (sin(πx) Γ(1-x))
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lngamma(1 - x);
  }
  x -= 1;
  let a = LANCZOS_COEF[0];
  const t = x + LANCZOS_G + 0.5;
  for (let i = 1; i < LANCZOS_COEF.length; i++) {
    a += LANCZOS_COEF[i] / (x + i);
  }
  return LOG_2_PI / 2 + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Gamma 函数 Γ(x) = exp(lngamma(x))。gamma(5)=24，gamma(0.5)=√π≈1.7724539 */
export function gamma(x: number): number {
  return Math.exp(lngamma(x));
}

/** Beta 函数 B(a,b) = Γ(a)Γ(b)/Γ(a+b) = exp(lngamma(a)+lngamma(b)-lngamma(a+b)) */
export function beta(a: number, b: number): number {
  return Math.exp(lngamma(a) + lngamma(b) - lngamma(a + b));
}

// ============================================================================
// 正则化不完全 Gamma 函数 P(s,x) = γ(s,x)/Γ(s)
// ============================================================================

/** 级数展开求 P(s,x)（适用于 x < s+1） */
function lowerRegGammaSeries(s: number, x: number): number {
  const gln = lngamma(s);
  let ap = s;
  let sum = 1 / s;
  let del = sum;
  for (let n = 1; n < MAXIT; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + s * Math.log(x) - gln);
}

/** 连分式求 Q(s,x) = 1 - P(s,x)（适用于 x >= s+1） */
function upperRegGammaCF(s: number, x: number): number {
  const gln = lngamma(s);
  let b = x + 1 - s;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < MAXIT; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + s * Math.log(x) - gln) * h;
}

/**
 * 正则化下不完全 Gamma 函数 P(s,x) ∈ [0,1]。
 * x < s+1 用级数，否则用连分式求 Q 再取 1-Q。
 * - P(1,1) = 1 - e^-1 ≈ 0.6321206
 */
export function lowerRegGamma(s: number, x: number): number {
  if (x < 0 || s <= 0) return NaN;
  if (x === 0) return 0;
  if (x < s + 1) {
    return lowerRegGammaSeries(s, x);
  }
  return 1 - upperRegGammaCF(s, x);
}

/** 正则化上不完全 Gamma 函数 Q(s,x) = 1 - P(s,x) */
export function upperRegGamma(s: number, x: number): number {
  if (x < 0 || s <= 0) return NaN;
  if (x === 0) return 1;
  if (x < s + 1) {
    return 1 - lowerRegGammaSeries(s, x);
  }
  return upperRegGammaCF(s, x);
}

// ============================================================================
// 误差函数 erf / erfc
// ============================================================================

/**
 * 误差函数 erf(x)，基于关系 erf(x) = sign(x) · P(1/2, x²)。
 * - erf(0) = 0
 * - erf(1) ≈ 0.8427007929
 */
export function erf(x: number): number {
  if (x === 0) return 0;
  const ax = Math.abs(x);
  const p = lowerRegGamma(0.5, ax * ax);
  return x >= 0 ? p : -p;
}

/**
 * 互补误差函数 erfc(x) = 1 - erf(x)，对大 |x| 直接用连分式求 Q 保持数值稳定。
 * erfc(1) ≈ 0.1572992071
 */
export function erfc(x: number): number {
  const ax = Math.abs(x);
  const v = 1 - lowerRegGamma(0.5, ax * ax);
  return x >= 0 ? v : 2 - v;
}

/** 更高精度误差函数变体（当前等价于 erf，保留独立导出供后续细化）。 */
export function erfPrecise(x: number): number {
  return erf(x);
}

/** 更高精度互补误差函数变体（当前等价于 erfc）。 */
export function erfcPrecise(x: number): number {
  return erfc(x);
}

// ============================================================================
// 正则化不完全 Beta 函数 I_x(a,b)
// ============================================================================

/** Lentz 连分式求不完全 Beta 连分式项（NR betacf）。 */
function betacf(a: number, b: number, x: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m < MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/**
 * 正则化不完全 Beta 函数 I_x(a,b) ∈ [0,1]，供 Student-t / F 分布使用。
 * x < (a+1)/(a+b+2) 用连分式，否则用对称形式 1 - I_{1-x}(b,a)。
 * - 例：a=1, b=1 时 I_x = x
 */
export function lowerRegBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lngamma(a) + lngamma(b) - lngamma(a + b);
  if (x < (a + 1) / (a + b + 2)) {
    const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) / a;
    return front * betacf(a, b, x);
  }
  // 对称分支：I_x(a,b) = 1 - I_{1-x}(b,a)，前项仍用 x^a·(1-x)^b，
  // 只是除以 b 并改用 betacf(b,a,1-x)。早期这里把 a/b 的指数写反了，
  // 导致 x 落在对称分支时结果错误（如 I_0.95(20,1) 直接返回 1）。
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) / b;
  return 1 - front * betacf(b, a, 1 - x);
}
