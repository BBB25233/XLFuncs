import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { cellValue } from '@/core/ref';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, roundDown, toNumber } from './helpers';

/**
 * 数学类补充 23 个函数的在线试算实现：
 *   abs / sign / gcd / lcm / mod / quotient / power / product / sqrt / sumsq /
 *   seriesum / fact / factdouble / multinomial / combin / combina / permut /
 *   roman / base / decimal / arabic / trunc / pi
 *
 * 共享设施（与 math.ts 一致）：
 * - ok / fail / stripQuotes 来自 ./types
 * - ERROR_CODES / make 来自 @/core/errors
 * - formatNumber / roundDown / toNumber 来自 ./helpers
 * - resolveNumber 是 math.ts 的私有 helper 的「本地副本」（未导出，按契约要求复制）
 *
 * 约定：所有数值型字段统一走 resolveNumber；变参函数（gcd/lcm/product/sumsq/
 * multinomial）简化为 number1..number5 五个字段；seriesum 简化为 x/n/m +
 * coefficient1..coefficient4 四个系数字段。空白字段忽略，非数字文本 → #VALUE!。
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

/** 收集若干字段里的数字；遇到非数字文本立即返回 #VALUE! 失败 */
function collectNumbers(
  keys: string[],
  ctx: CalcContext,
): { nums: number[]; error: CalcOutcome | null } {
  const nums: number[] = [];
  for (const key of keys) {
    const raw = (ctx.args[key] ?? '').trim();
    if (raw === '') {
      continue; // 空白字段忽略（Excel 对空单元格宽容）
    }
    const n = resolveNumber(raw, ctx.sheet);
    if (n === null) {
      return {
        nums,
        error: fail(
          make(
            ERROR_CODES.VALUE,
            '参数里混进了文本或空内容，Excel 没法把它当数字算，会报 #VALUE!。',
            '确认填的是数字或装着数字的单元格，文本型数字先用 VALUE() 转一下。',
          ),
        ),
      };
    }
    nums.push(n);
  }
  return { nums, error: null };
}

/* ===================== 纯数学小工具 ===================== */

/** 阶乘（小整数；超过安全范围由调用方判 #NUM!） */
function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i += 1) {
    r *= i;
  }
  return r;
}

/** 最大公约数（对输入取绝对值） */
function gcdOf(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

/** 最小公倍数（对输入取绝对值；任一为 0 则结果为 0） */
function lcmOf(a: number, b: number): number {
  if (a === 0 || b === 0) {
    return 0;
  }
  return (Math.abs(a) * Math.abs(b)) / gcdOf(a, b);
}

/** 组合数 C(top, bottom)；bottom<0 或 top<bottom 时返回 0（供 combina 复用） */
function combinations(top: number, bottom: number): number {
  if (bottom < 0 || top < bottom) {
    return 0;
  }
  bottom = Math.min(bottom, top - bottom);
  let r = 1;
  for (let i = 0; i < bottom; i += 1) {
    r = (r * (top - i)) / (i + 1);
  }
  return r;
}

/** 整数 → 罗马数字（古典形式；1..3999） */
function toRoman(num: number): string {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = num;
  let out = '';
  for (const [value, sym] of table) {
    while (n >= value) {
      out += sym;
      n -= value;
    }
  }
  return out;
}

/** 罗马数字 → 整数；非法字符 / 空串返回 null（空串在 handler 里当作 0） */
function romanToNumber(s: string): number | null {
  const map: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };
  const up = s.toUpperCase();
  if (up === '') {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < up.length; i += 1) {
    const ch = up[i];
    if (!(ch in map)) {
      return null;
    }
    const v = map[ch];
    const next = i + 1 < up.length ? map[up[i + 1]] : 0;
    total += v < next ? -v : v;
  }
  return total;
}

/** 校验文本在指定进制下是否合法，合法则解析为数字，否则返回 null */
function parseByRadix(text: string, radix: number): number | null {
  if (radix < 2 || radix > 36) {
    return null;
  }
  const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const up = text.toUpperCase();
  let total = 0;
  for (const ch of up) {
    const idx = digits.indexOf(ch);
    if (idx < 0 || idx >= radix) {
      return null;
    }
    total = total * radix + idx;
  }
  return total;
}

/* ===================== ABS · 绝对值 ===================== */
export const absCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要取绝对值的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const r = Math.abs(n);
  return ok(r, formatNumber(r));
};

/* ===================== SIGN · 符号 ===================== */
export const signCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要取符号的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const r = n > 0 ? 1 : n < 0 ? -1 : 0;
  return ok(r, formatNumber(r));
};

/* ===================== GCD · 最大公约数 ===================== */
export const gcdCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, error } = collectNumbers(
    ['number1', 'number2', 'number3', 'number4', 'number5'],
    ctx,
  );
  if (error !== null) {
    return error;
  }
  if (nums.length === 0) {
    return fail(
      make(ERROR_CODES.VALUE, 'GCD 至少要有一个数字，现在一个都没填。',
        '在 number1 里填一个数字，或继续填 number2…number5。'),
    );
  }
  let g = nums[0];
  for (let i = 1; i < nums.length; i += 1) {
    g = gcdOf(g, nums[i]);
  }
  return ok(g, formatNumber(g));
};

/* ===================== LCM · 最小公倍数 ===================== */
export const lcmCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, error } = collectNumbers(
    ['number1', 'number2', 'number3', 'number4', 'number5'],
    ctx,
  );
  if (error !== null) {
    return error;
  }
  if (nums.length === 0) {
    return fail(
      make(ERROR_CODES.VALUE, 'LCM 至少要有一个数字，现在一个都没填。',
        '在 number1 里填一个数字，或继续填 number2…number5。'),
    );
  }
  let l = nums[0];
  for (let i = 1; i < nums.length; i += 1) {
    l = lcmOf(l, nums[i]);
  }
  return ok(l, formatNumber(l));
};

/* ===================== MOD · 取余（结果符号跟随除数） ===================== */
export const modCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = resolveNumber(ctx.args.number1 ?? '', ctx.sheet);
  const b = resolveNumber(ctx.args.number2 ?? '', ctx.sheet);
  if (a === null || b === null) {
    return fail(
      make(ERROR_CODES.VALUE, 'MOD 的两个参数都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认被除数和除数都是数字或装着数字的单元格。'),
    );
  }
  if (b === 0) {
    return fail(
      make(ERROR_CODES.DIV0, '除数（第 2 参数）是 0，MOD 没法取余，Excel 报 #DIV/0!。',
        '把除数换成非零值，或用 IFERROR 包一层兜底。'),
    );
  }
  const r = a - b * Math.floor(a / b);
  return ok(r, formatNumber(r));
};

/* ===================== QUOTIENT · 整数商（向零取整） ===================== */
export const quotientCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = resolveNumber(ctx.args.number1 ?? '', ctx.sheet);
  const b = resolveNumber(ctx.args.number2 ?? '', ctx.sheet);
  if (a === null || b === null) {
    return fail(
      make(ERROR_CODES.VALUE, 'QUOTIENT 的两个参数都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认被除数和除数都是数字或装着数字的单元格。'),
    );
  }
  if (b === 0) {
    return fail(
      make(ERROR_CODES.DIV0, '除数（第 2 参数）是 0，QUOTIENT 没法除，Excel 报 #DIV/0!。',
        '把除数换成非零值，或用 IFERROR 包一层兜底。'),
    );
  }
  const r = Math.trunc(a / b);
  return ok(r, formatNumber(r));
};

/* ===================== POWER · 乘方 ===================== */
export const powerCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const base = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  const exp = resolveNumber(ctx.args.power ?? '', ctx.sheet);
  if (base === null || exp === null) {
    return fail(
      make(ERROR_CODES.VALUE, '底数或指数不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格。'),
    );
  }
  if (base < 0 && !Number.isInteger(exp)) {
    return fail(
      make(ERROR_CODES.NUM, '负底数的指数必须是整数，否则会算出复数，Excel 报 #NUM!。',
        '把指数改成整数，或把底数改成非负数。'),
    );
  }
  const r = Math.pow(base, exp);
  return ok(r, formatNumber(r));
};

/* ===================== PRODUCT · 连乘 ===================== */
export const productCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, error } = collectNumbers(
    ['number1', 'number2', 'number3', 'number4', 'number5'],
    ctx,
  );
  if (error !== null) {
    return error;
  }
  const r = nums.reduce((acc, n) => acc * n, 1);
  return ok(r, formatNumber(r));
};

/* ===================== SQRT · 平方根 ===================== */
export const sqrtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要开方的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格。'),
    );
  }
  if (n < 0) {
    return fail(
      make(ERROR_CODES.NUM, '负数不能开实数平方根，Excel 报 #NUM!。',
        '把数字改成非负数；要算虚数请换别的工具。'),
    );
  }
  const r = Math.sqrt(n);
  return ok(r, formatNumber(r));
};

/* ===================== SUMSQ · 平方和 ===================== */
export const sumsqCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, error } = collectNumbers(
    ['number1', 'number2', 'number3', 'number4', 'number5'],
    ctx,
  );
  if (error !== null) {
    return error;
  }
  const r = nums.reduce((acc, n) => acc + n * n, 0);
  return ok(r, formatNumber(r));
};

/* ===================== SERIESUM · 幂级数求和 ===================== */
export const seriesumCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const x = resolveNumber(ctx.args.x ?? '', ctx.sheet);
  const n = resolveNumber(ctx.args.n ?? '', ctx.sheet);
  const m = resolveNumber(ctx.args.m ?? '', ctx.sheet);
  if (x === null || n === null || m === null) {
    return fail(
      make(ERROR_CODES.VALUE, 'x / n / m 三个参数都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认 x、n、m 都是数字或装着数字的单元格。'),
    );
  }
  const coeffs = collectNumbers(
    ['coefficient1', 'coefficient2', 'coefficient3', 'coefficient4'],
    ctx,
  );
  if (coeffs.error !== null) {
    return coeffs.error;
  }
  if (coeffs.nums.length === 0) {
    return fail(
      make(ERROR_CODES.VALUE, 'SERIESUM 至少要有一个系数，现在一个都没填。',
        '在 coefficient1 里填一个数字系数。'),
    );
  }
  let total = 0;
  for (let k = 0; k < coeffs.nums.length; k += 1) {
    total += coeffs.nums[k] * Math.pow(x, n + k * m);
  }
  return ok(total, formatNumber(total));
};

/* ===================== FACT · 阶乘 ===================== */
export const factCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要阶乘的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格。'),
    );
  }
  if (!Number.isInteger(n)) {
    return fail(
      make(ERROR_CODES.NUM, 'FACT 只接受整数，小数会报 #NUM!。',
        '把参数改成整数，如 5。'),
    );
  }
  if (n < 0) {
    return fail(
      make(ERROR_CODES.NUM, '负数不能阶乘，Excel 报 #NUM!。',
        '把参数改成非负整数。'),
    );
  }
  if (n > 170) {
    return fail(
      make(ERROR_CODES.NUM, '170 以上的阶乘会超出 Excel 能表示的最大值，报 #NUM!。',
        '把参数控制在 0…170 之间。'),
    );
  }
  const r = factorial(n);
  return ok(r, formatNumber(r));
};

/* ===================== FACTDOUBLE · 双阶乘 ===================== */
export const factdoubleCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要双阶乘的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格。'),
    );
  }
  if (!Number.isInteger(n)) {
    return fail(
      make(ERROR_CODES.NUM, 'FACTDOUBLE 只接受整数，小数会报 #NUM!。',
        '把参数改成整数，如 7。'),
    );
  }
  if (n < 0) {
    return fail(
      make(ERROR_CODES.NUM, '负数不能双阶乘，Excel 报 #NUM!。',
        '把参数改成非负整数。'),
    );
  }
  let r = 1;
  for (let i = n; i >= 2; i -= 2) {
    r *= i;
  }
  return ok(r, formatNumber(r));
};

/* ===================== MULTINOMIAL · 多项式系数 ===================== */
export const multinomialCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { nums, error } = collectNumbers(
    ['number1', 'number2', 'number3', 'number4', 'number5'],
    ctx,
  );
  if (error !== null) {
    return error;
  }
  if (nums.length === 0) {
    return fail(
      make(ERROR_CODES.VALUE, 'MULTINOMIAL 至少要有一个数字，现在一个都没填。',
        '在 number1 里填一个数字。'),
    );
  }
  if (nums.some((v) => v < 0)) {
    return fail(
      make(ERROR_CODES.NUM, 'MULTINOMIAL 的参数不能是负数，否则报 #NUM!。',
        '把所有参数改成非负整数。'),
    );
  }
  const sum = nums.reduce((acc, v) => acc + v, 0);
  let denom = 1;
  for (const v of nums) {
    denom *= factorial(v);
  }
  const r = factorial(sum) / denom;
  return ok(r, formatNumber(r));
};

/* ===================== COMBIN · 组合数（无重复） ===================== */
export const combinCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  const k = resolveNumber(ctx.args.number2 ?? '', ctx.sheet);
  if (n === null || k === null) {
    return fail(
      make(ERROR_CODES.VALUE, '总数 n 和选取数 k 都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认 n 和 k 都是数字或装着数字的单元格。'),
    );
  }
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    return fail(
      make(ERROR_CODES.NUM, 'COMBIN 的两个参数都必须是整数，小数会报 #NUM!。',
        '把 n 和 k 都改成整数。'),
    );
  }
  if (k < 0) {
    return fail(
      make(ERROR_CODES.NUM, '选取数 k 不能为负数，否则报 #NUM!。',
        '把 k 改成非负整数。'),
    );
  }
  if (k > n) {
    return fail(
      make(ERROR_CODES.NUM, '选取数 k 不能大于总数 n，否则报 #NUM!。',
        '让 k 不超过 n。'),
    );
  }
  const r = combinations(n, k);
  return ok(r, formatNumber(r));
};

/* ===================== COMBINA · 组合数（可重复） ===================== */
export const combinaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  const k = resolveNumber(ctx.args.number2 ?? '', ctx.sheet);
  if (n === null || k === null) {
    return fail(
      make(ERROR_CODES.VALUE, '总数 n 和选取数 k 都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认 n 和 k 都是数字或装着数字的单元格。'),
    );
  }
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    return fail(
      make(ERROR_CODES.NUM, 'COMBINA 的两个参数都必须是整数，小数会报 #NUM!。',
        '把 n 和 k 都改成整数。'),
    );
  }
  if (n < 0 || k < 0) {
    return fail(
      make(ERROR_CODES.NUM, 'n 和 k 都不能为负数，否则报 #NUM!。',
        '把 n 和 k 都改成非负整数。'),
    );
  }
  // COMBINA(n,k) = COMBIN(n+k-1, k)
  const r = combinations(n + k - 1, k);
  return ok(r, formatNumber(r));
};

/* ===================== PERMUT · 排列数 ===================== */
export const permutCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  const k = resolveNumber(ctx.args.number2 ?? '', ctx.sheet);
  if (n === null || k === null) {
    return fail(
      make(ERROR_CODES.VALUE, '总数 n 和选取数 k 都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认 n 和 k 都是数字或装着数字的单元格。'),
    );
  }
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    return fail(
      make(ERROR_CODES.NUM, 'PERMUT 的两个参数都必须是整数，小数会报 #NUM!。',
        '把 n 和 k 都改成整数。'),
    );
  }
  if (k < 0) {
    return fail(
      make(ERROR_CODES.NUM, '选取数 k 不能为负数，否则报 #NUM!。',
        '把 k 改成非负整数。'),
    );
  }
  if (k > n) {
    return fail(
      make(ERROR_CODES.NUM, '选取数 k 不能大于总数 n，否则报 #NUM!。',
        '让 k 不超过 n。'),
    );
  }
  const r = factorial(n) / factorial(n - k);
  return ok(r, formatNumber(r));
};

/* ===================== ROMAN · 转罗马数字 ===================== */
export const romanCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要转换的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格。'),
    );
  }
  if (!Number.isInteger(n)) {
    return fail(
      make(ERROR_CODES.VALUE, 'ROMAN 只接受整数，小数会报 #VALUE!。',
        '把参数改成整数。'),
    );
  }
  if (n <= 0 || n > 3999) {
    return fail(
      make(ERROR_CODES.VALUE, 'ROMAN 只支持 1…3999 的整数，超出范围会报 #VALUE!。',
        '把数字改成 1 到 3999 之间。'),
    );
  }
  const r = toRoman(n);
  return ok(r, r);
};

/* ===================== BASE · 转指定进制文本 ===================== */
export const baseCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  const radix = resolveNumber(ctx.args.radix ?? '', ctx.sheet);
  if (n === null || radix === null) {
    return fail(
      make(ERROR_CODES.VALUE, '数值和进制都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认数字和进制（2…36）都是有效的数字。'),
    );
  }
  if (!Number.isInteger(n)) {
    return fail(
      make(ERROR_CODES.NUM, 'BASE 的数值必须是整数，小数会报 #NUM!。',
        '把数字改成整数。'),
    );
  }
  if (n < 0) {
    return fail(
      make(ERROR_CODES.NUM, 'BASE 的数值不能为负数，否则报 #NUM!。',
        '把数字改成非负整数。'),
    );
  }
  if (!Number.isInteger(radix) || radix < 2 || radix > 36) {
    return fail(
      make(ERROR_CODES.NUM, '进制必须是不小于 2、不大于 36 的整数，否则报 #NUM!。',
        '把进制填成 2…36 之间的整数，如 2、16。'),
    );
  }
  const minLenRaw = (ctx.args.minlen ?? '').trim();
  let minLen = 0;
  if (minLenRaw !== '') {
    const ml = resolveNumber(minLenRaw, ctx.sheet);
    if (ml === null || !Number.isInteger(ml) || ml < 0) {
      return fail(
        make(ERROR_CODES.VALUE, '最小长度（第 3 参数）必须是非负整数，否则报 #VALUE!。',
          '把最小长度填成非负整数，或留空。'),
      );
    }
    minLen = ml;
  }
  const r = n.toString(radix).toUpperCase().padStart(minLen, '0');
  return ok(r, r);
};

/* ===================== DECIMAL · 指定进制文本转数字 ===================== */
export const decimalCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const text = stripQuotes(ctx.args.text ?? '').inner.trim();
  const radix = resolveNumber(ctx.args.radix ?? '', ctx.sheet);
  if (radix === null) {
    return fail(
      make(ERROR_CODES.VALUE, '进制必须是数字，文本或空单元格会报 #VALUE!。',
        '确认进制（2…36）是有效的数字。'),
    );
  }
  if (!Number.isInteger(radix) || radix < 2 || radix > 36) {
    return fail(
      make(ERROR_CODES.NUM, '进制必须是不小于 2、不大于 36 的整数，否则报 #NUM!。',
        '把进制填成 2…36 之间的整数，如 16。'),
    );
  }
  if (text === '') {
    return fail(
      make(ERROR_CODES.VALUE, '要转换的文本是空的，Excel 没法解析，报 #VALUE!。',
        '在文本里填一个非空的数字串，如 "FF"。'),
    );
  }
  const r = parseByRadix(text, radix);
  if (r === null) {
    return fail(
      make(ERROR_CODES.NUM, '文本里有超出当前进制的字符，Excel 报 #NUM!。',
        '确认文本里每个字符都在进制允许的范围内，如十六进制只用 0-9 和 A-F。'),
    );
  }
  return ok(r, formatNumber(r));
};

/* ===================== ARABIC · 罗马数字转数字 ===================== */
export const arabicCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const text = stripQuotes(ctx.args.text ?? '').inner.trim();
  const r = romanToNumber(text);
  if (r === null) {
    return fail(
      make(ERROR_CODES.VALUE, '文本不是合法的罗马数字，Excel 报 #VALUE!。',
        '确认文本只含 I/V/X/L/C/D/M，且是合法的组合，如 "XIV"。'),
    );
  }
  return ok(r, formatNumber(r));
};

/* ===================== TRUNC · 截断（向零取整） ===================== */
export const truncCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const n = resolveNumber(ctx.args.number ?? '', ctx.sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要截断的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格。'),
    );
  }
  const digitsRaw = (ctx.args.digits ?? '').trim();
  let digits = 0;
  if (digitsRaw !== '') {
    const d = resolveNumber(digitsRaw, ctx.sheet);
    if (d === null || !Number.isInteger(d)) {
      return fail(
        make(ERROR_CODES.VALUE, '保留位数（第 2 参数）必须是一个整数，否则报 #VALUE!。',
          '位数填整数：2 留两位、0 到个位、-1 到十位。'),
      );
    }
    digits = d;
  }
  const r = roundDown(n, digits);
  return ok(r, formatNumber(r));
};

/* ===================== PI · 圆周率 ===================== */
export const piCalc: CalcHandler = (): CalcOutcome => {
  const r = Math.PI;
  return ok(r, formatNumber(r));
};
