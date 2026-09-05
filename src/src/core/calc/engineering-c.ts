import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber } from './helpers';
import {
  cCos,
  cCosh,
  cDiv,
  cplx,
  cSin,
  cSinh,
  complexText,
  imAbs,
  imArgument,
  imConjugate,
  imCos,
  imCosh,
  imDiv,
  imExp,
  imImaginary,
  imLn,
  imLog10,
  imLog2,
  imPower,
  imProduct,
  imReal,
  imSin,
  imSinh,
  imSqrt,
  imSub,
  imSum,
  imTan,
  type Complex,
} from './complex';

/**
 * 工程类 B12 批次 26 个复数函数的在线试算实现：
 *   complex / imabs / imaginary / imargument / imconjugate / imcos / imcosh /
 *   imcot / imcsc / imcsch / imdiv / imexp / imln / imlog10 / imlog2 /
 *   impower / improduct / imreal / imsec / imsech / imsin / imsinh /
 *   imsqrt / imsub / imsum / imtan
 *
 * 全部是「纯值变换」：参数就是复数文本 / 数字，不读 sheet。
 * 复数数学全部复用 B0 的 ./complex：
 * - 直接用：imAbs / imReal / imImaginary / imArgument / imConjugate / imExp /
 *   imLn / imLog10 / imLog2 / imSin / imCos / imTan / imSinh / imCosh /
 *   imSqrt / imDiv / imSub / imSum / imProduct / imPower
 * - 自己推导：imcot / imcsc / imsec / imsech / imcsch（complex.ts 里没有现成封装，
 *   一律用 cDiv(分子, cSin/cCos/cSinh/cCosh(…)) 现算）
 *
 * Excel 行为对照：
 * - 复数文本解析失败（含空串）→ #NUM!；传逻辑值 TRUE/FALSE → #VALUE!
 * - 多复数参数的函数（IMSUM/IMSUB/IMPRODUCT/IMDIV）各参数后缀必须同为 i 或同为 j，混用 → #VALUE!
 * - 除以零复数、0 的辐角、0 的对数 → #NUM!
 * - COMPLEX 的实部/虚部非数字、后缀不是 i/j → #VALUE!
 */

/* ===================== 复数文本解析 ===================== */

/** 解析结果：Complex 的实部/虚部 + 后缀（用于回显） */
interface ParsedComplex extends Complex {
  /** 文本里出现的虚部后缀；纯实数（如 "5"）没有后缀 */
  suffix: 'i' | 'j';
  /** 这个参数在文本里是否真的写了 i/j 后缀（用于「后缀必须一致」校验） */
  hasSuffix: boolean;
}

const BOOL_LITERAL = /^(true|false)$/i;

/**
 * 在去掉后缀的复数主体里切出实部串与虚部串。
 * 扫描最后一个「不在开头、且不是科学计数法指数符号」的 +/- 作为分界。
 * 找不到分界 → 整串都属于虚部（如 "2i"、"-3i"、"1e-3i"）。
 */
function splitImaginary(body: string): { reStr: string; imStr: string } {
  for (let i = body.length - 1; i > 0; i -= 1) {
    const ch = body[i];
    if (ch !== '+' && ch !== '-') {
      continue;
    }
    if (body[i - 1] === 'e' || body[i - 1] === 'E') {
      continue; // 1e-3 里的 '-' 是指数符号，不是加减号
    }
    return { reStr: body.slice(0, i), imStr: body.slice(i) };
  }
  return { reStr: '', imStr: body };
}

/**
 * 把 Excel 复数文本解析成 {re, im, suffix}。
 * 支持：3+4i / 3-4j / 2i / -i / i / 5 / -3.5 / 1e-3+2i / 3+4I。
 * 解析不了返回 null（调用方统一报 #NUM!）。
 */
function parseComplexText(raw: string): ParsedComplex | null {
  const s = raw.trim();
  if (s === '' || BOOL_LITERAL.test(s)) {
    return null;
  }
  const last = s[s.length - 1];
  if (last !== 'i' && last !== 'j' && last !== 'I' && last !== 'J') {
    // 没有虚部后缀 → 按纯实数处理（Excel 里 IMABS(5) 合法，等价于 5+0i）
    const n = toNumber(s);
    return n === null ? null : { re: n, im: 0, suffix: 'i', hasSuffix: false };
  }
  const suffix: 'i' | 'j' = last.toLowerCase() === 'j' ? 'j' : 'i';
  const { reStr, imStr } = splitImaginary(s.slice(0, -1));

  let re = 0;
  if (reStr !== '') {
    const n = toNumber(reStr);
    if (n === null) {
      return null;
    }
    re = n;
  }

  let im: number;
  if (imStr === '' || imStr === '+') {
    im = 1; // "i" / "3+i"
  } else if (imStr === '-') {
    im = -1; // "-i" / "3-i"
  } else {
    const n = toNumber(imStr);
    if (n === null) {
      return null;
    }
    im = n;
  }
  return { re, im, suffix, hasSuffix: true };
}

/* ===================== 参数读取与错误构造 ===================== */

/** 读取一个复数参数；非法写法 → #NUM!，逻辑值 → #VALUE! */
function takeComplex(ctx: CalcContext, key: string, label: string): ParsedComplex | CalcOutcome {
  const raw = stripQuotes(ctx.args[key] ?? '').inner.trim();
  if (BOOL_LITERAL.test(raw)) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        `${label}填的是逻辑值 ${raw.toUpperCase()}，Excel 的复数函数一律不接受 TRUE/FALSE，会报 #VALUE!。`,
        `${label}填复数文本（如 "3+4i"）或装着复数文本的单元格引用，别直接填 TRUE/FALSE。`,
      ),
    );
  }
  const z = parseComplexText(raw);
  if (z === null) {
    return fail(
      make(
        ERROR_CODES.NUM,
        `${label}填的「${raw === '' ? '（空）' : raw}」不是 Excel 认得的复数写法，Excel 会报 #NUM!。`,
        '复数要写成 "3+4i"、"3-4j"、"2i"、"5" 这类形式：实部与虚部用 + 或 - 连接，虚部后缀只能用小写的 i 或 j。',
      ),
    );
  }
  return z;
}

/** 多复数参数：凡是写了后缀的参数，后缀必须一致（i 混 j → #VALUE!） */
function ensureSameSuffix(parts: ParsedComplex[], fnName: string): CalcOutcome | null {
  let common: 'i' | 'j' | null = null;
  for (const part of parts) {
    if (!part.hasSuffix) {
      continue; // 纯数字参数没有后缀，不参与一致性校验
    }
    if (common === null) {
      common = part.suffix;
    } else if (common !== part.suffix) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          `${fnName} 的各个复数参数必须统一用同一个后缀，你混用了 i 和 j，Excel 会报 #VALUE!。`,
          '把所有参数的虚部后缀统一成 i（或统一成 j），例如 =IMSUM("3+4i","1+i")。',
        ),
      );
    }
  }
  return null;
}

/* ===================== 结果输出 ===================== */

/** 和 formatNumber 保持一致：最多 6 位小数，避免浮点尾巴 */
function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function isZero(z: Complex): boolean {
  return z.re === 0 && z.im === 0;
}

/** 复数结果 → "a+bi" 文本；实部或虚部不是有限数（除零 / 溢出）→ #NUM! */
function cplxOut(z: Complex, suffix: 'i' | 'j'): CalcOutcome {
  const re = round6(z.re);
  const im = round6(z.im);
  if (!Number.isFinite(re) || !Number.isFinite(im)) {
    return fail(
      make(
        ERROR_CODES.NUM,
        '算出来的实部或虚部不是有效数字（多半是除了 0，或者数值大到溢出），Excel 会报 #NUM!。',
        '换一组参数：别让分母为 0，也别用大到溢出的实部/虚部。',
      ),
    );
  }
  const text = complexText(re, im, suffix);
  return ok(text, text);
}

/** 数值结果 → 数字 + formatNumber 展示串 */
function numOut(n: number): CalcOutcome {
  if (!Number.isFinite(n)) {
    return fail(
      make(
        ERROR_CODES.NUM,
        '算出来的不是有效数字，Excel 会报 #NUM!。',
        '换一组能算出有限值的参数。',
      ),
    );
  }
  return ok(n, formatNumber(n));
}

/** 分母的模小到接近 0 → 视为奇点（除零） */
function nearZero(z: Complex): boolean {
  return Math.hypot(z.re, z.im) < 1e-9;
}

function poleError(fnName: string, denom: string): CalcOutcome {
  return fail(
    make(
      ERROR_CODES.NUM,
      `这个输入让 ${fnName} 的${denom}正好等于 0（落在函数的奇点上），Excel 算不出来，会报 #NUM!。`,
      '把输入稍微挪开一点（实部或虚部加个 0.1），别正好落在奇点上。',
    ),
  );
}

/* ===================== 一元函数（复数 → 复数 / 数字） ===================== */

/** 复数 → 复数 的一元函数骨架 */
function unaryComplex(
  fn: (z: Complex) => Complex,
  ctx: CalcContext,
  key: string,
  zeroReason?: string,
): CalcOutcome {
  const z = takeComplex(ctx, key, '复数');
  if (!('re' in z)) {
    return z;
  }
  if (zeroReason !== undefined && isZero(z)) {
    return fail(
      make(ERROR_CODES.NUM, zeroReason, '换一个非零的复数再算。'),
    );
  }
  return cplxOut(fn(z), z.suffix);
}

/** 复数 → 数字 的一元函数骨架 */
function unaryNumber(
  fn: (z: Complex) => number,
  ctx: CalcContext,
  key: string,
  zeroReason?: string,
): CalcOutcome {
  const z = takeComplex(ctx, key, '复数');
  if (!('re' in z)) {
    return z;
  }
  if (zeroReason !== undefined && isZero(z)) {
    return fail(
      make(ERROR_CODES.NUM, zeroReason, '换一个非零的复数再算。'),
    );
  }
  return numOut(fn(z));
}

/** 倒数型函数骨架：1 / fn(z)，分母为 0 → #NUM! */
function reciprocalComplex(
  denom: (z: Complex) => Complex,
  ctx: CalcContext,
  fnName: string,
  denomName: string,
): CalcOutcome {
  const z = takeComplex(ctx, 'n', '复数');
  if (!('re' in z)) {
    return z;
  }
  const d = denom(z);
  if (nearZero(d)) {
    return poleError(fnName, denomName);
  }
  return cplxOut(cDiv(cplx(1, 0), d), z.suffix);
}

/* ===================== 26 个 handler ===================== */

/** COMPLEX · 由实部/虚部构造复数文本 */
export const complexCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const rawRe = stripQuotes(ctx.args.real ?? '').inner.trim();
  const rawIm = stripQuotes(ctx.args.imag ?? '').inner.trim();
  const rawSuffix = stripQuotes(ctx.args.suffix ?? '').inner.trim();

  const suffix = rawSuffix === '' ? 'i' : rawSuffix.toLowerCase();
  if (suffix !== 'i' && suffix !== 'j') {
    return fail(
      make(
        ERROR_CODES.VALUE,
        `后缀「${rawSuffix === '' ? '（空）' : rawSuffix}」不合法，COMPLEX 的虚部后缀只能是 "i" 或 "j"，Excel 会报 #VALUE!。`,
        '第 3 参数填 "i" 或 "j"（小写、带英文双引号）；留空则默认 i。',
      ),
    );
  }

  const re = toNumber(rawRe);
  if (re === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        `实部「${rawRe === '' ? '（空）' : rawRe}」不是数字，COMPLEX 的实部只认数字，Excel 会报 #VALUE!。`,
        '实部填数字（如 3）或装着数字的单元格引用；文本型数字先用 VALUE() 转成数字。',
      ),
    );
  }

  const im = toNumber(rawIm);
  if (im === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        `虚部「${rawIm === '' ? '（空）' : rawIm}」不是数字，COMPLEX 的虚部只认数字，Excel 会报 #VALUE!。`,
        '虚部填数字（如 4）或装着数字的单元格引用；文本型数字先用 VALUE() 转成数字。',
      ),
    );
  }

  const text = complexText(round6(re), round6(im), suffix);
  return ok(text, text);
};

/** IMABS · 复数模长 */
export const imabsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryNumber(imAbs, ctx, 'n');

/** IMAGINARY · 复数虚部 */
export const imaginaryCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryNumber(imImaginary, ctx, 'n');

/** IMARGUMENT · 复数辐角（弧度） */
export const imargumentCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryNumber(
    imArgument,
    ctx,
    'n',
    '复数 0 停在原点上，没有方向也就没有辐角，Excel 会报 #NUM!。',
  );

/** IMCONJUGATE · 复数共轭 */
export const imconjugateCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imConjugate, ctx, 'n');

/** IMCOS · 复数余弦 */
export const imcosCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imCos, ctx, 'n');

/** IMCOSH · 复数双曲余弦 */
export const imcoshCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imCosh, ctx, 'n');

/** IMCOT · 复数余切 = cos/sin */
export const imcotCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const z = takeComplex(ctx, 'n', '复数');
  if (!('re' in z)) {
    return z;
  }
  const s = cSin(z);
  if (nearZero(s)) {
    return poleError('IMCOT', '分母 sin(z)');
  }
  return cplxOut(cDiv(cCos(z), s), z.suffix);
};

/** IMCSC · 复数余割 = 1/sin */
export const imcscCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  reciprocalComplex(cSin, ctx, 'IMCSC', '分母 sin(z)');

/** IMCSCH · 复数双曲余割 = 1/sinh */
export const imcschCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  reciprocalComplex(cSinh, ctx, 'IMCSCH', '分母 sinh(z)');

/** IMDIV · 复数相除 */
export const imdivCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = takeComplex(ctx, 'a', '第 1 个复数');
  if (!('re' in a)) {
    return a;
  }
  const b = takeComplex(ctx, 'b', '第 2 个复数（除数）');
  if (!('re' in b)) {
    return b;
  }
  const mismatch = ensureSameSuffix([a, b], 'IMDIV');
  if (mismatch !== null) {
    return mismatch;
  }
  if (isZero(b)) {
    return fail(
      make(
        ERROR_CODES.NUM,
        '除数是 0（实部虚部都是 0），复数除法没法做，Excel 会报 #NUM!。',
        '第 2 个参数换成非零复数，比如 "1+i"。',
      ),
    );
  }
  return cplxOut(imDiv(a, b), a.suffix);
};

/** IMEXP · 复数自然指数 */
export const imexpCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imExp, ctx, 'n');

/** IMLN · 复数自然对数 */
export const imlnCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imLn, ctx, 'n', '0 没有对数（ln 0 无定义），Excel 会报 #NUM!。');

/** IMLOG10 · 复数常用对数 */
export const imlog10Calc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imLog10, ctx, 'n', '0 没有对数（log10 0 无定义），Excel 会报 #NUM!。');

/** IMLOG2 · 复数以 2 为底对数 */
export const imlog2Calc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imLog2, ctx, 'n', '0 没有对数（log2 0 无定义），Excel 会报 #NUM!。');

/** IMPOWER · 复数整数次幂 */
export const impowerCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const z = takeComplex(ctx, 'n', '复数');
  if (!('re' in z)) {
    return z;
  }
  const rawP = stripQuotes(ctx.args.p ?? '').inner.trim();
  const p = toNumber(rawP);
  if (p === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        `指数「${rawP === '' ? '（空）' : rawP}」不是数字，IMPOWER 的第 2 参数只认数字，Excel 会报 #VALUE!。`,
        '指数填数字（如 2、0.5、-1），别填文本。',
      ),
    );
  }
  if (p === 0) {
    return ok('1', '1');
  }
  if (isZero(z) && p < 0) {
    return fail(
      make(
        ERROR_CODES.NUM,
        '0 的负数次幂相当于用 0 做除数，Excel 会报 #NUM!。',
        '底数换成非零复数，或者把指数改成 0 及以上的值。',
      ),
    );
  }
  return cplxOut(imPower(z, cplx(p, 0)), z.suffix);
};

/** IMPRODUCT · 多个复数连乘（简化为 2 个参数） */
export const improductCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = takeComplex(ctx, 'a', '第 1 个复数');
  if (!('re' in a)) {
    return a;
  }
  const b = takeComplex(ctx, 'b', '第 2 个复数');
  if (!('re' in b)) {
    return b;
  }
  const mismatch = ensureSameSuffix([a, b], 'IMPRODUCT');
  if (mismatch !== null) {
    return mismatch;
  }
  return cplxOut(imProduct(a, b), a.suffix);
};

/** IMREAL · 复数实部 */
export const imrealCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryNumber(imReal, ctx, 'n');

/** IMSEC · 复数正割 = 1/cos */
export const imsecCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  reciprocalComplex(cCos, ctx, 'IMSEC', '分母 cos(z)');

/** IMSECH · 复数双曲正割 = 1/cosh */
export const imsechCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  reciprocalComplex(cCosh, ctx, 'IMSECH', '分母 cosh(z)');

/** IMSIN · 复数正弦 */
export const imsinCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imSin, ctx, 'n');

/** IMSINH · 复数双曲正弦 */
export const imsinhCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imSinh, ctx, 'n');

/** IMSQRT · 复数平方根（主值） */
export const imsqrtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome =>
  unaryComplex(imSqrt, ctx, 'n');

/** IMSUB · 复数相减 */
export const imsubCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = takeComplex(ctx, 'a', '第 1 个复数（被减数）');
  if (!('re' in a)) {
    return a;
  }
  const b = takeComplex(ctx, 'b', '第 2 个复数（减数）');
  if (!('re' in b)) {
    return b;
  }
  const mismatch = ensureSameSuffix([a, b], 'IMSUB');
  if (mismatch !== null) {
    return mismatch;
  }
  return cplxOut(imSub(a, b), a.suffix);
};

/** IMSUM · 多个复数相加（简化为 2 个参数） */
export const imsumCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = takeComplex(ctx, 'a', '第 1 个复数');
  if (!('re' in a)) {
    return a;
  }
  const b = takeComplex(ctx, 'b', '第 2 个复数');
  if (!('re' in b)) {
    return b;
  }
  const mismatch = ensureSameSuffix([a, b], 'IMSUM');
  if (mismatch !== null) {
    return mismatch;
  }
  return cplxOut(imSum(a, b), a.suffix);
};

/** IMTAN · 复数正切 = sin/cos */
export const imtanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const z = takeComplex(ctx, 'n', '复数');
  if (!('re' in z)) {
    return z;
  }
  const c = cCos(z);
  if (nearZero(c)) {
    return poleError('IMTAN', '分母 cos(z)');
  }
  return cplxOut(imTan(z), z.suffix);
};
