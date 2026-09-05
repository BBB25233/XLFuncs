import type { CalcContext, CalcHandler, CalcOutcome, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { cellValue } from '@/core/ref';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber } from './helpers';
import { erf, erfc, erfPrecise, erfcPrecise } from './special';

/**
 * Engineering 类 B11 批次（进制 / 位运算 / 特殊函数）共 23 个在线试算 handler：
 *   bin2dec bin2hex bin2oct dec2bin dec2hex dec2oct hex2bin hex2dec hex2oct
 *   oct2bin oct2dec oct2hex bitand bitor bitxor bitlshift bitrshift
 *   delta gestep erf erf.precise erfc erfc.precise
 *
 * 共享设施与 math-a.ts 一致：ok/fail/stripQuotes 来自 ./types，ERROR_CODES/make 来自
 * @/core/errors，formatNumber/toNumber 来自 ./helpers，erf* 来自 ./special。
 *
 * 说明（与 Excel 的近似 / 简化）：
 * - 进制转换：内部统一用 BigInt，按 Excel 的「定宽补码」语义处理负数
 *   （二进 10 位 / 八进 30 位 / 十六进 40 位）。可选的 [places] 仅当作「最小宽度，
 *   用前导 0 补齐」，且仅对非负结果生效（负数仍按补码满宽输出）。
 * - 位运算：内部一律用 BigInt（JS 原生位运算只有 32 位会溢出）；入参要求非负整数、
 *   落在 [0, 2^48-1]，否则 #NUM!；bitlshift/bitrshift 的位移量可为负。
 * - erf/erfc/erf.precise/erfc.precise：只取单个数值参数（忽略 Excel 的 [upper_limit]），
 *   结果用 formatNumber 展示（≈6 位小数）。非数字 → #VALUE!。
 */

/* ===================== 进制转换底层 ===================== */

const DIGITS = '0123456789ABCDEF';

/**
 * 把进制文本解析成带符号 BigInt（Excel 补码语义）。
 * - radix：源进制（2/8/16）
 * - maxDigits：源允许的最多位数（Excel 均为 10）
 * - fullWidth：补码总位数（二进制 10、八进制 30、十六进制 40）
 * 非法字符 / 空串 / 超出位数 → 返回 { error }。
 */
function parseBase(
  text: string,
  radix: number,
  maxDigits: number,
  fullWidth: number,
): { value: bigint; error?: string } {
  const raw = text.trim().toUpperCase();
  let neg = false;
  let body = raw;
  if (body.startsWith('-')) {
    neg = true;
    body = body.slice(1);
  }
  if (body === '') {
    return { value: 0n, error: ERROR_CODES.NUM };
  }
  if (body.length > maxDigits) {
    return { value: 0n, error: ERROR_CODES.NUM };
  }
  let val = 0n;
  for (const ch of body) {
    const idx = DIGITS.indexOf(ch);
    if (idx < 0 || idx >= radix) {
      return { value: 0n, error: ERROR_CODES.NUM };
    }
    val = val * BigInt(radix) + BigInt(idx);
  }
  if (neg) {
    return { value: -val };
  }
  // 补码：最高位（fullWidth-1）为 1 时记为负数
  const top = 1n << BigInt(fullWidth - 1);
  if (val >= top) {
    val -= 1n << BigInt(fullWidth);
  }
  return { value: val };
}

/** 把带符号 BigInt 按补码转成指定进制的展示串 */
function toBase(value: bigint, radix: number, fullWidth: number): string {
  const mod = 1n << BigInt(fullWidth);
  let v = value % mod;
  if (v < 0n) {
    v += mod;
  }
  return v.toString(radix).toUpperCase();
}

const SRC_RADIX: Record<'bin' | 'oct' | 'hex', number> = { bin: 2, oct: 8, hex: 16 };
const SRC_WIDTH: Record<'bin' | 'oct' | 'hex', { max: number; full: number }> = {
  bin: { max: 10, full: 10 },
  oct: { max: 10, full: 30 },
  hex: { max: 10, full: 40 },
};
const DEST_RADIX: Record<'bin' | 'oct' | 'hex', number> = { bin: 2, oct: 8, hex: 16 };
const DEST_WIDTH: Record<'bin' | 'oct' | 'hex', number> = { bin: 10, oct: 30, hex: 40 };

/** 通用进制转换 handler 工厂 */
function buildBaseCalc(src: 'bin' | 'oct' | 'hex' | 'dec', dest: 'bin' | 'oct' | 'hex' | 'dec'): CalcHandler {
  return (ctx: CalcContext): CalcOutcome => {
    // 取源文本
    let srcText: string;
    if (src === 'dec') {
      srcText = (ctx.args.number ?? '').trim();
    } else {
      srcText = stripQuotes(ctx.args.number ?? '').inner.trim();
    }

    let value: bigint;
    if (src === 'dec') {
      if (srcText === '') {
        return fail(make(ERROR_CODES.NUM, '要转换的十进制数字为空，Excel 报 #NUM!。', '在参数里填一个十进制整数，如 42。'));
      }
      if (!/^-?\d+$/.test(srcText)) {
        return fail(make(ERROR_CODES.NUM, '十进制参数必须是整数，小数或文本会报 #NUM!。', '把参数改成整数，如 42、-5。'));
      }
      value = BigInt(srcText);
      // 十进制源受目标宽度的取值范围限制
      if (dest === 'bin' && (value < -(1n << 9n) || value > (1n << 9n) - 1n)) {
        return fail(make(ERROR_CODES.NUM, 'DEC2BIN 只支持 -512…511 的整数，超范围报 #NUM!。', '把数字控制在 -512 到 511 之间。'));
      }
      if (dest === 'oct' && (value < -(1n << 29n) + 1n || value > (1n << 29n) - 1n)) {
        return fail(make(ERROR_CODES.NUM, 'DEC2OCT 只支持 -2^29+1…2^29-1 的整数，超范围报 #NUM!。', '把数字控制在 -536870911 到 536870911 之间。'));
      }
      if (dest === 'hex' && (value < -(1n << 39n) + 1n || value > (1n << 39n) - 1n)) {
        return fail(make(ERROR_CODES.NUM, 'DEC2HEX 只支持 -2^39+1…2^39-1 的整数，超范围报 #NUM!。', '把数字控制在 -549755813887 到 549755813887 之间。'));
      }
    } else {
      const info = SRC_WIDTH[src];
      const r = parseBase(srcText, SRC_RADIX[src], info.max, info.full);
      if (r.error !== undefined) {
        return fail(make(ERROR_CODES.NUM, '文本里有超出当前进制的字符或位数超限，Excel 报 #NUM!。', '确认文本只含该进制的合法字符（二进制 0/1、八进制 0-7、十六进制 0-9/A-F），且不超过 10 位。'));
      }
      value = r.value;
    }

    if (dest === 'dec') {
      return ok(Number(value), value.toString(10));
    }

    const out = toBase(value, DEST_RADIX[dest], DEST_WIDTH[dest]);
    // [places]：非负结果按最小宽度用前导 0 补齐
    const placesRaw = (ctx.args.places ?? '').trim();
    if (placesRaw !== '' && value >= 0n) {
      const p = parseNumberArg(placesRaw, ctx.sheet);
      if (p !== null && Number.isInteger(p) && p > 0) {
        return ok(out, out.padStart(p, '0'));
      }
    }
    return ok(out, out);
  };
}

/* ===================== 参数解析（支持单元格引用） ===================== */

/** 解析数值参数：像单元格引用则取该格，否则按字面数字处理 */
function parseNumberArg(raw: string, sheet: Sheet): number | null {
  const t = raw.trim();
  if (t !== '' && /^[A-Za-z]+\d+$/.test(t)) {
    return toNumber(cellValue(sheet, t));
  }
  return toNumber(t);
}

/* ===================== 位运算 ===================== */

const BIT_MAX = (1n << 48n) - 1n; // 2^48 - 1

type BitResult = { ok: true; value: bigint } | { ok: false; error: string };

/** 位运算入参：要求非负整数且落在 [0, 2^48-1]，否则 #NUM! */
function bitInput(raw: string, sheet: Sheet): BitResult {
  const n = parseNumberArg(raw, sheet);
  if (n === null || !Number.isFinite(n)) {
    return { ok: false, error: ERROR_CODES.NUM };
  }
  if (!Number.isInteger(n)) {
    return { ok: false, error: ERROR_CODES.NUM };
  }
  if (n < 0) {
    return { ok: false, error: ERROR_CODES.NUM };
  }
  if (n > Number(BIT_MAX)) {
    return { ok: false, error: ERROR_CODES.NUM };
  }
  return { ok: true, value: BigInt(n) };
}

function failBit(code: string): CalcOutcome {
  return fail(
    make(
      code,
      '位运算要求两个非负整数参数，且落在 0…2^48-1；小数、负数或越界都会报 #NUM!。',
      '确认参数是 0 到 281474976710655 之间的整数。',
    ),
  );
}

export const bitandCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = bitInput(ctx.args.number1 ?? '', ctx.sheet);
  const b = bitInput(ctx.args.number2 ?? '', ctx.sheet);
  if (!a.ok) return failBit(a.error);
  if (!b.ok) return failBit(b.error);
  const r = a.value & b.value;
  return ok(Number(r), r.toString(10));
};

export const bitorCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = bitInput(ctx.args.number1 ?? '', ctx.sheet);
  const b = bitInput(ctx.args.number2 ?? '', ctx.sheet);
  if (!a.ok) return failBit(a.error);
  if (!b.ok) return failBit(b.error);
  const r = a.value | b.value;
  return ok(Number(r), r.toString(10));
};

export const bitxorCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = bitInput(ctx.args.number1 ?? '', ctx.sheet);
  const b = bitInput(ctx.args.number2 ?? '', ctx.sheet);
  if (!a.ok) return failBit(a.error);
  if (!b.ok) return failBit(b.error);
  const r = a.value ^ b.value;
  return ok(Number(r), r.toString(10));
};

export const bitlshiftCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = bitInput(ctx.args.number ?? '', ctx.sheet);
  const s = bitInput(ctx.args.shift ?? '', ctx.sheet);
  if (!a.ok) return failBit(a.error);
  if (!s.ok) return failBit(s.error);
  if (!Number.isInteger(Number(s.value))) {
    return failBit(ERROR_CODES.NUM);
  }
  const r = a.value << s.value;
  if (r < 0n || r > BIT_MAX) {
    return failBit(ERROR_CODES.NUM);
  }
  return ok(Number(r), r.toString(10));
};

export const bitrshiftCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = bitInput(ctx.args.number ?? '', ctx.sheet);
  const s = bitInput(ctx.args.shift ?? '', ctx.sheet);
  if (!a.ok) return failBit(a.error);
  if (!s.ok) return failBit(s.error);
  if (!Number.isInteger(Number(s.value))) {
    return failBit(ERROR_CODES.NUM);
  }
  const r = a.value >> s.value;
  if (r < 0n || r > BIT_MAX) {
    return failBit(ERROR_CODES.NUM);
  }
  return ok(Number(r), r.toString(10));
};

/* ===================== DELTA / GESTEP ===================== */

export const deltaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n1 = parseNumberArg(ctx.args.number1 ?? '', ctx.sheet);
  const n2 = parseNumberArg(ctx.args.number2 ?? '', ctx.sheet);
  if (n1 === null) {
    return fail(make(ERROR_CODES.VALUE, '第 1 个参数不是有效数字（可能是文本或空单元格），Excel 报 #VALUE!。', '确认填的是数字或装着数字的单元格。'));
  }
  if (n2 === null) {
    return fail(make(ERROR_CODES.VALUE, '第 2 个参数不是有效数字（可能是文本或空单元格），Excel 报 #VALUE!。', '确认填的是数字或装着数字的单元格。'));
  }
  const equal = n1 === n2;
  return ok(equal ? 1 : 0, equal ? '1' : '0');
};

export const gestepCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = parseNumberArg(ctx.args.number ?? '', ctx.sheet);
  const stepRaw = (ctx.args.step ?? '').trim();
  const step = stepRaw === '' ? 0 : parseNumberArg(stepRaw, ctx.sheet);
  if (n === null) {
    return fail(make(ERROR_CODES.VALUE, '第 1 个参数不是有效数字（可能是文本或空单元格），Excel 报 #VALUE!。', '确认填的是数字或装着数字的单元格。'));
  }
  if (step === null) {
    return fail(make(ERROR_CODES.VALUE, '步长参数不是有效数字（可能是文本或空单元格），Excel 报 #VALUE!。', '确认步长填的是数字。'));
  }
  const ge = n >= step;
  return ok(ge ? 1 : 0, ge ? '1' : '0');
};

/* ===================== ERF / ERFC / ERF.PRECISE / ERFC.PRECISE ===================== */

function erfLikeCalc(fn: (x: number) => number): CalcHandler {
  return (ctx: CalcContext): CalcOutcome => {
    const x = parseNumberArg(ctx.args.lower ?? '', ctx.sheet);
    if (x === null) {
      return fail(make(ERROR_CODES.VALUE, '误差函数的参数必须是数字，文本或空单元格会报 #VALUE!。', '确认填的是数字或装着数字的单元格，如 1。'));
    }
    const r = fn(x);
    return ok(r, formatNumber(r));
  };
}

export const erfCalc: CalcHandler = erfLikeCalc(erf);
export const erfcCalc: CalcHandler = erfLikeCalc(erfc);
export const erfPreciseCalc: CalcHandler = erfLikeCalc(erfPrecise);
export const erfcPreciseCalc: CalcHandler = erfLikeCalc(erfcPrecise);

/* ===================== 进制转换 12 个 ===================== */

export const bin2decCalc: CalcHandler = buildBaseCalc('bin', 'dec');
export const bin2hexCalc: CalcHandler = buildBaseCalc('bin', 'hex');
export const bin2octCalc: CalcHandler = buildBaseCalc('bin', 'oct');
export const dec2binCalc: CalcHandler = buildBaseCalc('dec', 'bin');
export const dec2hexCalc: CalcHandler = buildBaseCalc('dec', 'hex');
export const dec2octCalc: CalcHandler = buildBaseCalc('dec', 'oct');
export const hex2binCalc: CalcHandler = buildBaseCalc('hex', 'bin');
export const hex2decCalc: CalcHandler = buildBaseCalc('hex', 'dec');
export const hex2octCalc: CalcHandler = buildBaseCalc('hex', 'oct');
export const oct2binCalc: CalcHandler = buildBaseCalc('oct', 'bin');
export const oct2decCalc: CalcHandler = buildBaseCalc('oct', 'dec');
export const oct2hexCalc: CalcHandler = buildBaseCalc('oct', 'hex');
