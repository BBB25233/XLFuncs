import type { CalcContext, CalcHandler, CalcOutcome, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { cellValue } from '@/core/ref';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber } from './helpers';

/**
 * 数学三角函数 / 角度换算 / 舍入类 共 23 个函数的在线试算实现（Math/Trig B 批次）：
 *   sin / cos / tan / asin / acos / atan / atan2 /
 *   sinh / cosh / tanh / asinh / acosh / atanh /
 *   degrees / radians / sqrtpi /
 *   rand / randbetween / ceiling-math / floor-math / mround / even / odd
 *
 * 共享设施（与 math.ts 同套）：
 * - ok / fail / stripQuotes 来自 ./types
 * - ERROR_CODES / make 来自 @/core/errors
 * - toNumber / formatNumber 来自 ./helpers
 * - resolveNumber 是本地拷贝（cell-ref-or-literal 解析），照搬 math.ts 的成熟写法
 *
 * 错误复现（对照各函数 pitfalls）：
 * - asin / acos：参数必须在 [-1,1]，否则 #NUM!
 * - acosh：参数必须 ≥ 1，否则 #NUM!
 * - atanh：参数必须满足 |x| < 1，否则 #NUM!
 * - atan2：两参数都为 0 时 #DIV/0!
 * - sqrtpi：参数为负时 #NUM!
 * - mround：number 与 multiple 异号（且都非 0）时 #NUM!
 * - randbetween：bottom / top 不是整数时 #VALUE!
 * - 任意函数：参数不是有效数值（文本 / 空 / 引用非数字格）时 #VALUE!
 */

/** 解析 number 类参数：若像单元格引用则取该格的值，否则按字面数字处理 */
function resolveNumber(raw: string, sheet: Sheet): number | null {
  const { inner } = stripQuotes(raw);
  const trimmed = inner.trim();
  if (trimmed !== '' && /^[A-Za-z]+\d+$/.test(trimmed)) {
    return toNumber(cellValue(sheet, trimmed));
  }
  return toNumber(trimmed);
}

/* ===================== 三角函数（弧度） ===================== */
export const sinCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'SIN 的参数不是有效数字（可能是文本，或引用的单元格里不是数字）。',
      '确认填的是数字或装着数字的单元格；只有角度时记得先用 RADIANS() 转成弧度。'));
  }
  const result = Math.sin(n);
  return ok(result, formatNumber(result));
};

export const cosCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'COS 的参数不是有效数字（可能是文本，或引用的单元格里不是数字）。',
      '确认填的是数字或装着数字的单元格；只有角度时记得先用 RADIANS() 转成弧度。'));
  }
  const result = Math.cos(n);
  return ok(result, formatNumber(result));
};

export const tanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'TAN 的参数不是有效数字（可能是文本，或引用的单元格里不是数字）。',
      '确认填的是数字或装着数字的单元格；只有角度时记得先用 RADIANS() 转成弧度。'));
  }
  const result = Math.tan(n);
  return ok(result, formatNumber(result));
};

export const asinCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'ASIN 的参数不是有效数字（可能是文本，或引用的单元格里不是数字）。',
      '确认填的是数字或装着数字的单元格。'));
  }
  if (n < -1 || n > 1) {
    return fail(make(ERROR_CODES.NUM, 'ASIN 的参数必须落在 -1 到 1 之间（正弦值不可能超出这个区间）。',
      '把参数限制在 [-1, 1]，例如 =ASIN(0.5)。'));
  }
  const result = Math.asin(n);
  return ok(result, formatNumber(result));
};

export const acosCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'ACOS 的参数不是有效数字（可能是文本，或引用的单元格里不是数字）。',
      '确认填的是数字或装着数字的单元格。'));
  }
  if (n < -1 || n > 1) {
    return fail(make(ERROR_CODES.NUM, 'ACOS 的参数必须落在 -1 到 1 之间（余弦值不可能超出这个区间）。',
      '把参数限制在 [-1, 1]，例如 =ACOS(0.5)。'));
  }
  const result = Math.acos(n);
  return ok(result, formatNumber(result));
};

export const atanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'ATAN 的参数不是有效数字（可能是文本，或引用的单元格里不是数字）。',
      '确认填的是数字或装着数字的单元格。'));
  }
  const result = Math.atan(n);
  return ok(result, formatNumber(result));
};

export const atan2Calc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const y = resolveNumber(args.y ?? '', sheet);
  const x = resolveNumber(args.x ?? '', sheet);
  if (y === null || x === null) {
    return fail(make(ERROR_CODES.VALUE, 'ATAN2 的两个参数（y 与 x）都必须是有效数字。',
      '确认两个参数都是数字或装着数字的单元格。'));
  }
  if (y === 0 && x === 0) {
    return fail(make(ERROR_CODES.DIV0, 'ATAN2 的 y 和 x 不能同时为 0，否则没有确定的角度。',
      '把 y 或 x 至少一个填成非零值，例如 =ATAN2(1,1)。'));
  }
  const result = Math.atan2(y, x);
  return ok(result, formatNumber(result));
};

/* ===================== 双曲函数 ===================== */
export const sinhCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'SINH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  const result = Math.sinh(n);
  return ok(result, formatNumber(result));
};

export const coshCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'COSH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  const result = Math.cosh(n);
  return ok(result, formatNumber(result));
};

export const tanhCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'TANH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  const result = Math.tanh(n);
  return ok(result, formatNumber(result));
};

export const asinhCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'ASINH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  const result = Math.asinh(n);
  return ok(result, formatNumber(result));
};

export const acoshCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'ACOSH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  if (n < 1) {
    return fail(make(ERROR_CODES.NUM, 'ACOSH 的参数必须 ≥ 1（反双曲余弦的定义域是 [1, +∞)）。',
      '把参数填成 ≥ 1 的数，例如 =ACOSH(2)。'));
  }
  const result = Math.acosh(n);
  return ok(result, formatNumber(result));
};

export const atanhCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'ATANH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  if (n <= -1 || n >= 1) {
    return fail(make(ERROR_CODES.NUM, 'ATANH 的参数必须满足 -1 < x < 1（反双曲正切的定义域）。',
      '把参数填成 (-1, 1) 之间的数，例如 =ATANH(0.5)。'));
  }
  const result = Math.atanh(n);
  return ok(result, formatNumber(result));
};

/* ===================== 角度 / 弧度换算 ===================== */
export const degreesCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'DEGREES 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格（弧度值）。'));
  }
  const result = (n * 180) / Math.PI;
  return ok(result, formatNumber(result));
};

export const radiansCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'RADIANS 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格（角度值）。'));
  }
  const result = (n * Math.PI) / 180;
  return ok(result, formatNumber(result));
};

export const sqrtpiCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'SQRTPI 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  if (n < 0) {
    return fail(make(ERROR_CODES.NUM, 'SQRTPI 的参数不能为负数（负数开平方算不出来）。',
      '把参数填成 ≥ 0 的数，例如 =SQRTPI(2)。'));
  }
  const result = Math.sqrt(n * Math.PI);
  return ok(result, formatNumber(result));
};

/* ===================== 随机函数 ===================== */
export const randCalc: CalcHandler = (): CalcOutcome => {
  const result = Math.random();
  return ok(result, formatNumber(result));
};

export const randbetweenCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const bottom = resolveNumber(args.bottom ?? '', sheet);
  const top = resolveNumber(args.top ?? '', sheet);
  if (bottom === null || top === null) {
    return fail(make(ERROR_CODES.VALUE, 'RANDBETWEEN 的上下界都必须是有效数字。',
      '确认 bottom 和 top 都是数字或装着数字的单元格。'));
  }
  if (!Number.isInteger(bottom) || !Number.isInteger(top)) {
    return fail(make(ERROR_CODES.VALUE, 'RANDBETWEEN 的上下界必须是整数（Excel 只接受整数）。',
      '把 bottom 和 top 都填成整数，例如 =RANDBETWEEN(1,10)。'));
  }
  if (bottom > top) {
    return fail(make(ERROR_CODES.NUM, 'RANDBETWEEN 的下界必须 ≤ 上界。',
      '把较小的数放在前面，例如 =RANDBETWEEN(1,10)。'));
  }
  const result = bottom + Math.floor(Math.random() * (top - bottom + 1));
  return ok(result, formatNumber(result));
};

/* ===================== 倍数舍入 ===================== */
export const ceilingMathCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'CEILING.MATH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  let sig = resolveNumber(args.significance ?? '', sheet);
  if (sig === null) sig = 1;
  if (sig === 0) {
    return ok(0, '0');
  }
  const s = Math.abs(sig);
  // Excel 实测（2026-11-23）：默认负数朝 0 进位（-4.3 → -4）；mode 非 0 才远离 0（-5）
  const mode = resolveNumber(args.mode ?? '', sheet) ?? 0;
  const result = n < 0 && mode !== 0 ? Math.floor(n / s) * s : Math.ceil(n / s) * s;
  return ok(result, formatNumber(result));
};

export const floorMathCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'FLOOR.MATH 的参数不是有效数字。',
      '确认填的是数字或装着数字的单元格。'));
  }
  let sig = resolveNumber(args.significance ?? '', sheet);
  if (sig === null) sig = 1;
  if (sig === 0) {
    return ok(0, '0');
  }
  const s = Math.abs(sig);
  // Excel 实测：默认负数朝 -∞ 舍去（-4.3 → -5）；mode 非 0 才朝 0（-4）
  const mode = resolveNumber(args.mode ?? '', sheet) ?? 0;
  const result = n < 0 && mode !== 0 ? Math.ceil(n / s) * s : Math.floor(n / s) * s;
  return ok(result, formatNumber(result));
};

export const mroundCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  const m = resolveNumber(args.multiple ?? '', sheet);
  if (n === null || m === null) {
    return fail(make(ERROR_CODES.VALUE, 'MROUND 的两个参数都必须是有效数字。',
      '确认 number 和 multiple 都是数字或装着数字的单元格。'));
  }
  if (m === 0) {
    return ok(0, '0');
  }
  if (n !== 0 && (n > 0) !== (m > 0)) {
    return fail(make(ERROR_CODES.NUM, 'MROUND 的 number 与 multiple 不能异号（一个正一个负）。',
      '让 number 与 multiple 同号，例如 =MROUND(10,3) 或 =MROUND(-10,-3)。'));
  }
  const denom = Math.abs(m);
  const q = Math.round(Math.abs(n) / denom);
  const result = (n < 0 ? -1 : 1) * q * denom;
  return ok(result, formatNumber(result));
};

/* ===================== 偶数 / 奇数取整 ===================== */
export const evenCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'EVEN 的参数不是有效数字（文本或空单元格会报错）。',
      '确认填的是数字或装着数字的单元格。'));
  }
  let a = Math.ceil(Math.abs(n));
  if (a % 2 !== 0) a += 1;
  const result = n < 0 ? -a : a;
  return ok(result, formatNumber(result));
};

export const oddCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, 'ODD 的参数不是有效数字（文本或空单元格会报错）。',
      '确认填的是数字或装着数字的单元格。'));
  }
  let a = Math.ceil(Math.abs(n));
  if (a % 2 === 0) a += 1;
  const result = n < 0 ? -a : a;
  return ok(result, formatNumber(result));
};
