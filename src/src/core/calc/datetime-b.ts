import type { CalcContext, CalcHandler, CalcOutcome, CellValue } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { dateToSerial, formatNumber, parseDateText, serialToParts, toNumber } from './helpers';
import { dayCount, type YMD } from './daycount';

/**
 * 日期时间类（核心时间/日期）8 个函数的在线试算实现：
 *   time / timevalue / hour / minute / second / datevalue / days / days360
 *
 * 共享设施：
 * - ok / fail / stripQuotes 来自 ./types
 * - ERROR_CODES / make 来自 @/core/errors
 * - dateToSerial / parseDateText / serialToParts / formatNumber / toNumber 来自 ./helpers
 * - dayCount / YMD 来自 ./daycount（DAYS360 据此实现 30/360 约定）
 *
 * 约定：这 8 个都是「纯值变换」，handler 忽略 sheet，字段用固定默认值；
 * calc.sampleTableId 设为 'sales'，避免依赖样例表数据。
 */

/* ===================== 参数解析辅助 ===================== */

/** 解析「纯数字」类参数：去引号后当数字处理；空串 / 非数字 → null */
function numArg(raw: string | undefined): number | null {
  const { inner } = stripQuotes((raw ?? '').trim());
  if (inner === '') {
    return null;
  }
  return toNumber(inner);
}

/** 解析「时间文本」HH:MM 或 HH:MM:SS → 当天所占比例（0–1） */
function parseTimeText(s: string): number | null {
  const t = s.trim();
  const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?$/.exec(t);
  if (m === null) {
    return null;
  }
  const h = Number(m[1]);
  const mm = Number(m[2]);
  const ss = Number(m[3] ?? '0');
  if (h > 23 || mm > 59 || ss >= 60) {
    return null;
  }
  const total = h * 3600 + mm * 60 + ss;
  return (total % 86400) / 86400;
}

/** 解析「时间或序列号」参数 → 时间比例（0–1，可含整数天）；非法 → null */
function resolveTimeFrac(raw: string | undefined): number | null {
  const { inner } = stripQuotes((raw ?? '').trim());
  if (inner === '') {
    return null;
  }
  if (/^-?\d+(\.\d+)?$/.test(inner)) {
    return Number(inner);
  }
  return parseTimeText(inner);
}

/** 校验真实存在的日历日期（含闰年 / 月末边界） */
function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

/** 把「日期文本或序列号」解析成 {year,month,day}；非法 → null */
function resolveYMD(raw: string | undefined): YMD | null {
  const { inner } = stripQuotes((raw ?? '').trim());
  if (inner === '') {
    return null;
  }
  let parts: { year: number; month: number; day: number } | null;
  if (/^-?\d+(\.\d+)?$/.test(inner)) {
    parts = serialToParts(Number(inner));
  } else {
    parts = parseDateText(inner);
  }
  if (parts === null) {
    return null;
  }
  if (!isValidDate(parts.year, parts.month, parts.day)) {
    return null;
  }
  return { year: parts.year, month: parts.month, day: parts.day };
}

/** 把「日期文本或序列号」解析成日期序列号（整数天）；非法 → null */
function resolveDateSerial(raw: string | undefined): number | null {
  const { inner } = stripQuotes((raw ?? '').trim());
  if (inner === '') {
    return null;
  }
  if (/^-?\d+(\.\d+)?$/.test(inner)) {
    return Number(inner);
  }
  const parts = parseDateText(inner);
  if (parts === null || !isValidDate(parts.year, parts.month, parts.day)) {
    return null;
  }
  return dateToSerial(parts.year, parts.month, parts.day);
}

/** 时间比例 → 展示用的 {hour,minute,second} */
function partsOfDay(frac: number): { hour: number; minute: number; second: number } {
  const f = frac - Math.floor(frac);
  const totalSeconds = f * 86400;
  const hour = Math.floor(totalSeconds / 3600 + 1e-9);
  const minute = Math.floor(totalSeconds / 60 + 1e-9) % 60;
  const second = Math.floor(totalSeconds + 1e-9) % 60;
  return { hour, minute, second };
}

/* ===================== TIME · 时/分/秒拼时间 ===================== */
export const timeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const h = numArg(ctx.args.hour);
  const m = numArg(ctx.args.minute);
  const s = numArg(ctx.args.second);
  if (h === null || m === null || s === null) {
    return fail(
      make(ERROR_CODES.VALUE, '时/分/秒都必须是数字，文本或空单元格会报 #VALUE!。',
        '确认时、分、秒都是数字或装着数字的单元格。'),
    );
  }
  if (h < 0 || m < 0 || s < 0) {
    return fail(
      make(ERROR_CODES.NUM, '时/分/秒不能为负数，否则报 #NUM!。',
        '把时、分、秒都改成非负数字。'),
    );
  }
  const total = h * 3600 + m * 60 + s;
  const serial = (total % 86400) / 86400;
  return ok(serial, formatNumber(serial));
};

/* ===================== TIMEVALUE · 文本时间转比例 ===================== */
export const timevalueCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { inner } = stripQuotes((ctx.args.time_text ?? '').trim());
  if (inner === '') {
    return fail(
      make(ERROR_CODES.VALUE, '时间文本是空的，Excel 没法解析，报 #VALUE!。',
        '在文本里填一个时间，如 "13:30:00"。'),
    );
  }
  const frac = parseTimeText(inner);
  if (frac === null) {
    return fail(
      make(ERROR_CODES.VALUE, '文本不是合法的时间（只认 HH:MM 或 HH:MM:SS），Excel 报 #VALUE!。',
        '把文本写成 "13:30:00" 这种标准时间写法。'),
    );
  }
  return ok(frac, formatNumber(frac));
};

/* ===================== HOUR · 取小时 ===================== */
export const hourCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const frac = resolveTimeFrac(ctx.args.value);
  if (frac === null) {
    return fail(
      make(ERROR_CODES.VALUE, '参数不是合法的时间或序列号，Excel 报 #VALUE!。',
        '填时间文本（如 "13:30:00"）或时间小数（如 0.5）。'),
    );
  }
  const { hour } = partsOfDay(frac);
  return ok(hour, String(hour));
};

/* ===================== MINUTE · 取分钟 ===================== */
export const minuteCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const frac = resolveTimeFrac(ctx.args.value);
  if (frac === null) {
    return fail(
      make(ERROR_CODES.VALUE, '参数不是合法的时间或序列号，Excel 报 #VALUE!。',
        '填时间文本（如 "13:30:00"）或时间小数（如 0.5）。'),
    );
  }
  const { minute } = partsOfDay(frac);
  return ok(minute, String(minute));
};

/* ===================== SECOND · 取秒 ===================== */
export const secondCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const frac = resolveTimeFrac(ctx.args.value);
  if (frac === null) {
    return fail(
      make(ERROR_CODES.VALUE, '参数不是合法的时间或序列号，Excel 报 #VALUE!。',
        '填时间文本（如 "13:30:45"）或时间小数（如 0.5）。'),
    );
  }
  const { second } = partsOfDay(frac);
  return ok(second, String(second));
};

/* ===================== DATEVALUE · 文本日期转序列号 ===================== */
export const datevalueCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { inner } = stripQuotes((ctx.args.date_text ?? '').trim());
  if (inner === '') {
    return fail(
      make(ERROR_CODES.VALUE, '日期文本是空的，Excel 没法解析，报 #VALUE!。',
        '在文本里填一个日期，如 "2024-1-15"。'),
    );
  }
  const parts = parseDateText(inner);
  if (parts === null || !isValidDate(parts.year, parts.month, parts.day)) {
    return fail(
      make(ERROR_CODES.VALUE, '文本不是合法的日期（只认 2024-1-15 / 2024/1/15），Excel 报 #VALUE!。',
        '把文本写成标准分隔符写法，中文"2024年3月15日"不被识别。'),
    );
  }
  const serial = dateToSerial(parts.year, parts.month, parts.day);
  return ok(serial, formatNumber(serial));
};

/* ===================== DAYS · 真实日历天数差 ===================== */
export const daysCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const end = resolveDateSerial(ctx.args.end);
  const start = resolveDateSerial(ctx.args.start);
  if (end === null || start === null) {
    return fail(
      make(ERROR_CODES.VALUE, '结束日或开始日不是合法的日期，Excel 报 #VALUE!。',
        '填日期文本（如 "2024-3-15"）或日期序列号。'),
    );
  }
  const result = end - start;
  return ok(result, formatNumber(result));
};

/* ===================== DAYS360 · 30/360 约定天数差 ===================== */
export const days360Calc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const s = resolveYMD(ctx.args.start_date);
  const e = resolveYMD(ctx.args.end_date);
  if (s === null || e === null) {
    return fail(
      make(ERROR_CODES.VALUE, '开始日或结束日不是合法的日期，Excel 报 #VALUE!。',
        '填日期文本（如 "2024-1-1"）或日期序列号。'),
    );
  }
  const methodRaw = (ctx.args.method ?? '').trim();
  let basis: 0 | 4 = 0;
  if (methodRaw !== '') {
    const mv = stripQuotes(methodRaw).inner.trim().toUpperCase();
    if (mv === 'TRUE') {
      basis = 4;
    } else if (mv === 'FALSE') {
      basis = 0;
    } else {
      return fail(
        make(ERROR_CODES.VALUE, 'method 只能是 TRUE 或 FALSE（或省略），Excel 报 #VALUE!。',
          '填 TRUE 用欧式 30/360，FALSE 或留空用美式(NASD)。'),
      );
    }
  }
  const abs = dayCount(basis, s, e);
  const ss = dateToSerial(s.year, s.month, s.day);
  const es = dateToSerial(e.year, e.month, e.day);
  const sign = es >= ss ? 1 : -1;
  const result = sign * abs;
  return ok(result as CellValue, formatNumber(result));
};
