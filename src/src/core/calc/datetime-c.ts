import type { CalcContext, CalcHandler, CalcOutcome, CellValue } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import {
  dateToSerial,
  formatNumber,
  parseDateText,
  serialToParts,
} from './helpers';
import { yearFraction } from './daycount';

/**
 * 日期 / 时间类补充 9 个函数（B7 批次）：
 *   weekday / weeknum / isoweeknum / eomonth / workday / workday-intl /
 *   networkdays / networkdays-intl / yearfrac
 *
 * 约定（与 math-a.ts 一致）：
 * - ok / fail / stripQuotes 来自 ./types
 * - ERROR_CODES / make 来自 @/core/errors
 * - dateToSerial / serialToParts / parseDateText / formatNumber 来自 ./helpers
 * - yearFraction 来自 ./daycount
 *
 * 日期参数支持两种写法：Excel 序列号（如 45292）或日期文本（如 '2024-01-15'），
 * 由 parseDateArg 统一解析。weekday / weeknum / isoweeknum / eomonth / yearfrac
 * 都属于「纯值变换」，handler 不读 sheet，只根据字段字符串计算。
 *
 * 简化说明（按交付要求）：
 * - workday / workday-intl / networkdays / networkdays-intl 的 holidays 列表被忽略；
 * - workday-intl / networkdays-intl 的 weekend 参数被忽略，固定按「标准周末
 *   （周六、周日）」计算。这些是演示版简化，已在 calc.cases 的 note 中说明。
 */

/**
 * 把日期部件转成「Excel 序列号」。
 * 注意：helpers.dateToSerial 产出的是「真实格里高利」序列号（比 Excel 少 1，
 * 因为没算 1900 假闰年），而 helpers.serialToParts 反解时期望的是「Excel 序列号」
 * （≥60 时内部做了 -1 回退）。所以这里统一在 Excel 空间里算：dateToSerial 结果 ≥60
 * 时补 1，保证与 serialToParts 互逆、且 WEEKDAY 的周几与 Excel 一致。
 */
function toExcelSerial(year: number, month: number, day: number): number {
  const t = dateToSerial(year, month, day);
  return t >= 60 ? t + 1 : t;
}

/** 解析日期参数：序列号或日期文本 → {year,month,day}；非法 → null */
function parseDateArg(raw: string): { year: number; month: number; day: number } | null {
  const { inner } = stripQuotes(raw);
  const trimmed = inner.trim();
  if (trimmed === '') {
    return null;
  }
  // 纯数字（可带负号 / 小数）→ 当作 Excel 序列号，直接交给 serialToParts
  if (/^-?\d{1,10}(\.\d+)?$/.test(trimmed)) {
    return serialToParts(Number(trimmed));
  }
  const parts = parseDateText(trimmed);
  if (parts === null) {
    return null;
  }
  // 校验月份是否在 1-12（如 '2024-13-01' 视为非法）
  if (parts.month < 1 || parts.month > 12) {
    return null;
  }
  // 校验日期是否真实存在（如 '2024-02-30' 视为非法）
  const maxDay = new Date(Date.UTC(parts.year, parts.month, 0)).getUTCDate();
  if (parts.day < 1 || parts.day > maxDay) {
    return null;
  }
  return parts;
}

/** 解析日期参数 → Excel 序列号；非法 → null */
function toSerial(raw: string): number | null {
  const parts = parseDateArg(raw);
  if (parts === null) {
    return null;
  }
  return toExcelSerial(parts.year, parts.month, parts.day);
}

/** Excel 序列号 → 周几（0=周日 … 6=周六） */
function dowOf(serial: number): number {
  return ((Math.round(serial) - 1) % 7 + 7) % 7;
}

/** 是否周末（周六 / 周日） */
function isWeekend(serial: number): boolean {
  const dow = dowOf(serial);
  return dow === 0 || dow === 6;
}

/** 校验整数参数；非整数或非法 → 返回 { ok:false, code } 形式通过回调处理 */
function parseIntArg(
  raw: string,
  name: string,
): { value: number | null; error: CalcOutcome | null } {
  const { inner } = stripQuotes(raw);
  const trimmed = inner.trim();
  if (trimmed === '') {
    return { value: null, error: null }; // 交由调用方决定缺省
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return {
      value: null,
      error: fail(
        make(
          ERROR_CODES.VALUE,
          `${name} 不是有效数字（可能是文本，或引用的单元格里不是数字）。`,
          `确认 ${name} 填的是整数或装着整数的单元格。`,
        ),
      ),
    };
  }
  if (!Number.isInteger(n)) {
    return {
      value: null,
      error: fail(
        make(
          ERROR_CODES.NUM,
          `${name} 必须是整数，小数会报 #NUM!。`,
          `把 ${name} 改成整数，如 1。`,
        ),
      ),
    };
  }
  return { value: n, error: null };
}

/** 把整型 dow（0=周日…6=周六）转成「周几」展示数字，按 returnType 映射 */
function weekdayValue(dow: number, returnType: number): number {
  // dw: 周一=1 … 周日=7
  const dw = dow === 0 ? 7 : dow;
  switch (returnType) {
    case 1: // 周日=1
      return ((dw - 7) % 7 + 7) % 7 + 1;
    case 2: // 周一=1
    case 11: // 周一=1
      return ((dw - 1) % 7 + 7) % 7 + 1;
    case 3: // 周一=0
      return ((dw - 1) % 7 + 7) % 7;
    case 12: // 周二=1
      return ((dw - 2) % 7 + 7) % 7 + 1;
    case 13: // 周三=1
      return ((dw - 3) % 7 + 7) % 7 + 1;
    case 14: // 周四=1
      return ((dw - 4) % 7 + 7) % 7 + 1;
    case 15: // 周五=1
      return ((dw - 5) % 7 + 7) % 7 + 1;
    case 16: // 周六=1
      return ((dw - 6) % 7 + 7) % 7 + 1;
    case 17: // 周日=1
      return ((dw - 7) % 7 + 7) % 7 + 1;
    default:
      return NaN;
  }
}

/* ===================== WEEKDAY · 星期几 ===================== */
export const weekdayCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const serial = toSerial(ctx.args.serial_number ?? '');
  if (serial === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-15 或序列号 45292。',
      ),
    );
  }
  const rtRaw = (ctx.args.return_type ?? '').trim();
  let returnType = 1;
  if (rtRaw !== '') {
    const n = Number(rtRaw);
    if (!Number.isFinite(n)) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          'return_type 必须是数字（1/2/3/11-17 之一），文本会报 #VALUE!。',
          '把 return_type 改成 1、2 或 3 等合法整数。',
        ),
      );
    }
    if (!Number.isInteger(n)) {
      return fail(
        make(
          ERROR_CODES.NUM,
          'return_type 必须是整数，小数会报 #NUM!。',
          '把 return_type 改成整数。',
        ),
      );
    }
    if (![1, 2, 3, 11, 12, 13, 14, 15, 16, 17].includes(n)) {
      return fail(
        make(
          ERROR_CODES.NUM,
          'return_type 只能是 1、2、3 或 11-17，其它值 Excel 报 #NUM!。',
          '把 return_type 改成 1（周日=1）、2（周一=1）或 3（周一=0）。',
        ),
      );
    }
    returnType = n;
  }
  const result = weekdayValue(dowOf(serial), returnType);
  return ok(result, formatNumber(result));
};

/* ===================== WEEKNUM · 第几周 ===================== */
export const weeknumCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const serial = toSerial(ctx.args.serial_number ?? '');
  if (serial === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-15 或序列号 45292。',
      ),
    );
  }
  const rtRaw = (ctx.args.return_type ?? '').trim();
  let returnType = 1;
  if (rtRaw !== '') {
    const n = Number(rtRaw);
    if (!Number.isFinite(n)) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          'return_type 必须是数字（1/2/11-17 之一），文本会报 #VALUE!。',
          '把 return_type 改成 1 或 2。',
        ),
      );
    }
    if (!Number.isInteger(n)) {
      return fail(
        make(
          ERROR_CODES.NUM,
          'return_type 必须是整数，小数会报 #NUM!。',
          '把 return_type 改成整数。',
        ),
      );
    }
    const valid = [1, 2, 11, 12, 13, 14, 15, 16, 17];
    if (!valid.includes(n)) {
      return fail(
        make(
          ERROR_CODES.NUM,
          'return_type 只能是 1、2 或 11-17，其它值 Excel 报 #NUM!。',
          '把 return_type 改成 1（周日起）或 2（周一起）。',
        ),
      );
    }
    returnType = n;
  }
  // weekStartDow：0=周日 … 6=周六
  const weekStartDow = returnType <= 2 ? (returnType === 1 ? 0 : 1) : (returnType - 10) % 7;
  const parts = serialToParts(serial)!;
  const jan1 = toExcelSerial(parts.year, 1, 1);
  const jan1Dow = dowOf(jan1);
  const offset = (jan1Dow - weekStartDow + 7) % 7;
  const week = Math.floor((serial - jan1 + offset) / 7) + 1;
  return ok(week, formatNumber(week));
};

/* ===================== ISOWEEKNUM · ISO 周数 ===================== */
export const isoweeknumCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const serial = toSerial(ctx.args.serial_number ?? '');
  if (serial === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-15 或序列号 45292。',
      ),
    );
  }
  const dow = dowOf(serial);
  const thu = serial + (4 - dow); // 移到本周四
  const thuParts = serialToParts(thu)!;
  const year = thuParts.year;
  const jan4 = toExcelSerial(year, 1, 4);
  const jan4Dow = dowOf(jan4);
  const thuW1 = jan4 + (4 - jan4Dow); // 第 1 周的周四
  const week = Math.floor((thu - thuW1) / 7) + 1;
  return ok(week, formatNumber(week));
};

/* ===================== EOMONTH · 月末日期 ===================== */
export const eomonthCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const serial = toSerial(ctx.args.start_date ?? '');
  if (serial === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '开始日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-15 或序列号 45292。',
      ),
    );
  }
  const months = parseIntArg(ctx.args.months ?? '', 'months');
  if (months.error !== null) {
    return months.error;
  }
  if (months.value === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        'months 参数缺失，EOMONTH 必须给出要偏移的月数。',
        '在 months 里填一个整数，如 1 表示往后一个月。',
      ),
    );
  }
  const parts = serialToParts(serial)!;
  const total = parts.year * 12 + (parts.month - 1) + months.value;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  const lastDay = new Date(Date.UTC(newYear, newMonth, 0)).getUTCDate();
  const result = toExcelSerial(newYear, newMonth, lastDay);
  return ok(result, formatNumber(result));
};

/* ===================== WORKDAY · 推算工作日 ===================== */
export const workdayCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const serial = toSerial(ctx.args.start_date ?? '');
  if (serial === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '开始日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-01 或序列号 45292。',
      ),
    );
  }
  const days = parseIntArg(ctx.args.days ?? '', 'days');
  if (days.error !== null) {
    return days.error;
  }
  if (days.value === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        'days 参数缺失，WORKDAY 必须给出要跳过的工作日数。',
        '在 days 里填一个整数，如 10。',
      ),
    );
  }
  // 简化：忽略 holidays 列表
  let s = Math.round(serial);
  const step = days.value >= 0 ? 1 : -1;
  let remaining = Math.abs(days.value);
  while (remaining > 0) {
    s += step;
    if (!isWeekend(s)) {
      remaining -= 1;
    }
  }
  return ok(s, formatNumber(s));
};

/* ===================== WORKDAY.INTL · 推算工作日（国际） ===================== */
export const workdayIntlCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const serial = toSerial(ctx.args.start_date ?? '');
  if (serial === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '开始日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-01 或序列号 45292。',
      ),
    );
  }
  const days = parseIntArg(ctx.args.days ?? '', 'days');
  if (days.error !== null) {
    return days.error;
  }
  if (days.value === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        'days 参数缺失，WORKDAY.INTL 必须给出要跳过的工作日数。',
        '在 days 里填一个整数，如 10。',
      ),
    );
  }
  // 简化：忽略 weekend 与 holidays，固定按标准周末（周六、周日）计算
  let s = Math.round(serial);
  const step = days.value >= 0 ? 1 : -1;
  let remaining = Math.abs(days.value);
  while (remaining > 0) {
    s += step;
    if (!isWeekend(s)) {
      remaining -= 1;
    }
  }
  return ok(s, formatNumber(s));
};

/* ===================== NETWORKDAYS · 工作日天数 ===================== */
export const networkdaysCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const s1 = toSerial(ctx.args.start_date ?? '');
  if (s1 === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '开始日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-01 或序列号 45292。',
      ),
    );
  }
  const s2 = toSerial(ctx.args.end_date ?? '');
  if (s2 === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '结束日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-31 或序列号 45292。',
      ),
    );
  }
  // 简化：忽略 holidays 列表
  const a = Math.min(Math.round(s1), Math.round(s2));
  const b = Math.max(Math.round(s1), Math.round(s2));
  let count = 0;
  for (let s = a; s <= b; s += 1) {
    if (!isWeekend(s)) {
      count += 1;
    }
  }
  return ok(count, formatNumber(count));
};

/* ===================== NETWORKDAYS.INTL · 工作日天数（国际） ===================== */
export const networkdaysIntlCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const s1 = toSerial(ctx.args.start_date ?? '');
  if (s1 === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '开始日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-01 或序列号 45292。',
      ),
    );
  }
  const s2 = toSerial(ctx.args.end_date ?? '');
  if (s2 === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '结束日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-31 或序列号 45292。',
      ),
    );
  }
  // 简化：忽略 weekend 与 holidays，固定按标准周末（周六、周日）计算
  const a = Math.min(Math.round(s1), Math.round(s2));
  const b = Math.max(Math.round(s1), Math.round(s2));
  let count = 0;
  for (let s = a; s <= b; s += 1) {
    if (!isWeekend(s)) {
      count += 1;
    }
  }
  return ok(count, formatNumber(count));
};

/* ===================== YEARFRAC · 日期间隔年数 ===================== */
export const yearfracCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const start = parseDateArg(ctx.args.start_date ?? '');
  if (start === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '开始日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2024-01-01 或序列号 45292。',
      ),
    );
  }
  const end = parseDateArg(ctx.args.end_date ?? '');
  if (end === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '结束日期不是合法日期（文本格式应为 YYYY-MM-DD，或填 Excel 序列号），Excel 报 #VALUE!。',
        '确认填的是真日期，如 2025-01-01 或序列号 45292。',
      ),
    );
  }
  const basisRaw = (ctx.args.basis ?? '').trim();
  let basis = 0;
  if (basisRaw !== '') {
    const n = Number(basisRaw);
    if (!Number.isFinite(n)) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          'basis 必须是数字（0-4 之一），文本会报 #VALUE!。',
          '把 basis 改成 0、1、2、3 或 4。',
        ),
      );
    }
    if (!Number.isInteger(n) || n < 0 || n > 4) {
      return fail(
        make(
          ERROR_CODES.NUM,
          'basis 只能是 0、1、2、3、4，其它值 Excel 报 #NUM!。',
          '把 basis 改成 0（美式 30/360）、1（实际/实际）、2（实际/360）、3（实际/365）或 4（欧式 30/360）。',
        ),
      );
    }
    basis = n;
  }
  const frac = yearFraction(basis as 0 | 1 | 2 | 3 | 4, start, end);
  const value: CellValue = frac;
  return ok(value, formatNumber(frac));
};
