/**
 * B0 支撑模块：复数运算（纯函数、零 DOM 依赖）。
 *
 * 提供复数类型与算术 / 初等函数 / 三角函数 / 双曲函数，
 * 以及 Excel「工程」类复数函数（IM* 系列）的薄封装。
 * 仅作为底层数值库被后续批次（复数工程函数 B12 等）导入，
 * 不要在本文件里注册任何用户可见的 Excel 函数。
 */

/** 复数类型：实部 re，虚部 im。 */
export interface Complex {
  re: number;
  im: number;
}

/** 构造复数。 */
export function cplx(re: number, im: number): Complex {
  return { re, im };
}

// ============================================================================
// 基础算术
// ============================================================================

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function cMul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

export function cDiv(a: Complex, b: Complex): Complex {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}

export function cNeg(a: Complex): Complex {
  return { re: -a.re, im: -a.im };
}

export function cConj(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}

/** 模 |z| = hypot(re, im)。 */
export function cAbs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

/** 辐角 arg(z) = atan2(im, re)。 */
export function cArg(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

// ============================================================================
// 初等函数
// ============================================================================

/** 指数 e^z。 */
export function cExp(a: Complex): Complex {
  const r = Math.exp(a.re);
  return { re: r * Math.cos(a.im), im: r * Math.sin(a.im) };
}

/** 主值自然对数 ln(z)。 */
export function cLn(a: Complex): Complex {
  return { re: Math.log(cAbs(a)), im: cArg(a) };
}

/** 主值常用对数 log10(z) = ln(z)/ln(10)。 */
export function cLog10(a: Complex): Complex {
  const l = cLn(a);
  return { re: l.re / Math.LN10, im: l.im / Math.LN10 };
}

/** 主值以 2 为底对数 log2(z) = ln(z)/ln(2)。 */
export function cLog2(a: Complex): Complex {
  const l = cLn(a);
  return { re: l.re / Math.LN2, im: l.im / Math.LN2 };
}

/** 幂 a^b = exp(b · ln a)（取 ln 的主值）。 */
export function cPow(a: Complex, b: Complex): Complex {
  return cExp(cMul(b, cLn(a)));
}

/** 主值平方根 √z。 */
export function cSqrt(a: Complex): Complex {
  const r = cAbs(a);
  const re = Math.sqrt((r + a.re) / 2);
  let im = Math.sqrt((r - a.re) / 2);
  if (a.im < 0) im = -im;
  return { re, im };
}

// ============================================================================
// 三角函数 / 双曲函数
// ============================================================================

export function cSin(a: Complex): Complex {
  return { re: Math.sin(a.re) * Math.cosh(a.im), im: Math.cos(a.re) * Math.sinh(a.im) };
}

export function cCos(a: Complex): Complex {
  return { re: Math.cos(a.re) * Math.cosh(a.im), im: -Math.sin(a.re) * Math.sinh(a.im) };
}

export function cTan(a: Complex): Complex {
  return cDiv(cSin(a), cCos(a));
}

export function cSinh(a: Complex): Complex {
  return { re: Math.sinh(a.re) * Math.cos(a.im), im: Math.cosh(a.re) * Math.sin(a.im) };
}

export function cCosh(a: Complex): Complex {
  return { re: Math.cosh(a.re) * Math.cos(a.im), im: Math.sinh(a.re) * Math.sin(a.im) };
}

export function cTanh(a: Complex): Complex {
  return cDiv(cSinh(a), cCosh(a));
}

// ============================================================================
// 文本格式（Excel 风格 "a+bi" / "a-bi"）
// ============================================================================

/**
 * 把 (re, im) 格式化为 Excel 复数文本。
 * - 纯实数 → "3"
 * - 纯虚数 → "4i"
 * - 一般 → "3+4i" / "3-4i"
 * suffix 默认 'i'，可选 'j'。
 */
export function complexText(re: number, im: number, suffix: 'i' | 'j' = 'i'): string {
  if (im === 0) return String(re);
  const sign = im < 0 ? '-' : '+';
  const imAbs = Math.abs(im);
  if (re === 0) return `${imAbs}${suffix}`;
  return `${re}${sign}${imAbs}${suffix}`;
}

// ============================================================================
// Excel IM* 系列薄封装（供 B12 批次接线；此处统一返回 Complex / number）
// ============================================================================

export function imAbs(z: Complex): number {
  return cAbs(z);
}
export function imReal(z: Complex): number {
  return z.re;
}
export function imImaginary(z: Complex): number {
  return z.im;
}
export function imArgument(z: Complex): number {
  return cArg(z);
}
export function imConjugate(z: Complex): Complex {
  return cConj(z);
}
export function imExp(z: Complex): Complex {
  return cExp(z);
}
export function imLn(z: Complex): Complex {
  return cLn(z);
}
export function imLog10(z: Complex): Complex {
  return cLog10(z);
}
export function imLog2(z: Complex): Complex {
  return cLog2(z);
}
export function imSin(z: Complex): Complex {
  return cSin(z);
}
export function imCos(z: Complex): Complex {
  return cCos(z);
}
export function imTan(z: Complex): Complex {
  return cTan(z);
}
export function imSinh(z: Complex): Complex {
  return cSinh(z);
}
export function imCosh(z: Complex): Complex {
  return cCosh(z);
}
export function imTanh(z: Complex): Complex {
  return cTanh(z);
}
export function imSqrt(z: Complex): Complex {
  return cSqrt(z);
}
export function imDiv(a: Complex, b: Complex): Complex {
  return cDiv(a, b);
}
export function imSub(a: Complex, b: Complex): Complex {
  return cSub(a, b);
}
export function imSum(...zs: Complex[]): Complex {
  return zs.reduce<Complex>((acc, z) => cAdd(acc, z), cplx(0, 0));
}
export function imProduct(...zs: Complex[]): Complex {
  return zs.reduce<Complex>((acc, z) => cMul(acc, z), cplx(1, 0));
}
export function imPower(a: Complex, b: Complex): Complex {
  return cPow(a, b);
}
