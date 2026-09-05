import type { CalcContext, CalcHandler, CalcOutcome, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { cellValue } from '@/core/ref';
import { dateToSerial, parseDateText, toDateParts } from './helpers';
import { fail, ok, stripQuotes } from './types';

/**
 * 日期与时间类 8 个函数的试算 handler（纯函数，零 DOM）。
 *
 * 易失函数 TODAY / NOW 直接读 new Date()；其余基于共享 helpers 的日期序列号换算。
 * 文本日期一律走 parseDateText / toDateParts；日期→序列号走 dateToSerial；序列号→部件走 serialToParts。
 * 单元格引用（如 'B2'）用 cellValue 解析后再取部件。
 */

/** 把单元格引用或文本日期解析成 {year,month,day}；解析不出 → null */
function resolveDateParts(raw: string, sheet: Sheet): { year: number; month: number; day: number } | null {
  const { inner, quoted } = stripQuotes(raw);
  if (quoted) {
    return parseDateText(inner);
  }
  const cell = cellValue(sheet, inner.trim());
  if (cell !== null) {
    return toDateParts(cell);
  }
  return toDateParts(inner);
}

/** 把 {year,month,day} 格式化成 'YYYY-MM-DD' */
function formatYmd(p: { year: number; month: number; day: number }): string {
  const y = String(p.year).padStart(4, '0');
  const m = String(p.month).padStart(2, '0');
  const d = String(p.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ===================== TODAY ===================== */

export const todayCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  void ctx;
  const now = new Date();
  const date = formatYmd({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
  return ok(date, date);
};

/* ===================== NOW ===================== */

export const nowCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  void ctx;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = formatYmd({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const value = `${date} ${time}`;
  return ok(value, value);
};

/* ===================== DATE ===================== */

export const dateCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;

  const y = Number(args.year);
  const m = Number(args.month);
  const d = Number(args.day);

  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return fail(
      make(ERROR_CODES.VALUE, '年 / 月 / 日必须是数字（DATE 只认数字，文本会报 #VALUE!）。', '去掉引号用数字：=DATE(2024,1,1)。'),
    );
  }
  if (m < 1 || m > 12) {
    return fail(
      make(ERROR_CODES.VALUE, `月份 ${m} 不在 1–12 范围内。`, '月份填 1–12；要进位到下月请用合数的合法月份。'),
    );
  }
  if (d < 1 || d > 31) {
    return fail(
      make(ERROR_CODES.VALUE, `日 ${d} 不在 1–31 范围内。`, '日填 1–31。'),
    );
  }

  const serial = dateToSerial(y, m, d);
  if (!Number.isFinite(serial) || serial < 1 || serial > 2958465) {
    return fail(make(ERROR_CODES.VALUE, '日期超出 Excel 能表示的范围（1900-01-01 ~ 9999-12-31）。', '把年月日换成合理范围的值。'));
  }
  const value = formatYmd({ year: y, month: m, day: d });
  return ok(value, value);
};

/* ===================== YEAR ===================== */

export const yearCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const parts = resolveDateParts(args.date ?? '', sheet);
  if (parts === null) {
    return fail(
      make(ERROR_CODES.VALUE, '参数不是真正的日期（文本日期 "2021-03-15" 或空单元格都会报 #VALUE!）。', '用真日期单元格引用，或 DATE(2021,3,15) 重拼。'),
    );
  }
  return ok(parts.year, String(parts.year));
};

/* ===================== MONTH ===================== */

export const monthCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const parts = resolveDateParts(args.date ?? '', sheet);
  if (parts === null) {
    return fail(
      make(ERROR_CODES.VALUE, '参数不是真正的日期（文本日期会报 #VALUE!）。', '用真日期单元格引用，或 DATE(2021,3,15) 重拼。'),
    );
  }
  return ok(parts.month, String(parts.month));
};

/* ===================== DAY ===================== */

export const dayCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const parts = resolveDateParts(args.date ?? '', sheet);
  if (parts === null) {
    return fail(
      make(ERROR_CODES.VALUE, '参数不是真正的日期（文本日期会报 #VALUE!）。', '用真日期单元格引用，或 DATE(2021,3,15) 重拼。'),
    );
  }
  return ok(parts.day, String(parts.day));
};

/* ===================== DATEDIF ===================== */

export const datedifCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const startParts = resolveDateParts(args.start_date ?? '', sheet);
  const endParts = resolveDateParts(args.end_date ?? '', sheet);
  if (startParts === null || endParts === null) {
    return fail(
      make(ERROR_CODES.VALUE, '开始日 / 结束日不是真正的日期（文本日期会报 #VALUE!）。', '用真日期单元格引用，或 DATE(1990,5,20) 重拼。'),
    );
  }

  const unit = stripQuotes(args.unit ?? 'Y').inner.toUpperCase();
  if (unit !== 'Y' && unit !== 'M' && unit !== 'D') {
    return fail(
      make(ERROR_CODES.VALUE, `单位 ${unit || '空'} 不在 Y / M / D 之内（大小写敏感）。`, '单位填 "Y"（整年）/ "M"（整月）/ "D"（天）。'),
    );
  }

  const s = dateToSerial(startParts.year, startParts.month, startParts.day);
  const e = dateToSerial(endParts.year, endParts.month, endParts.day);
  if (e < s) {
    return fail(
      make(ERROR_CODES.NUM, '结束日早于开始日，DATEDIF 要求开始日 < 结束日。', '把较早的日期放第一个参数；拿不准可用 MIN/MAX 兜底。'),
    );
  }

  let diff: number;
  if (unit === 'D') {
    diff = e - s;
  } else if (unit === 'Y') {
    diff = endParts.year - startParts.year - (endParts.month * 100 + endParts.day < startParts.month * 100 + startParts.day ? 1 : 0);
  } else {
    // 'M'：整月差，若结束日「日」早于开始日「日」则减 1
    diff = (endParts.year - startParts.year) * 12 + (endParts.month - startParts.month) - (endParts.day < startParts.day ? 1 : 0);
  }

  return ok(diff, String(diff));
};

/* ===================== EDATE ===================== */

export const edateCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const startParts = resolveDateParts(args.start_date ?? '', sheet);
  if (startParts === null) {
    return fail(
      make(ERROR_CODES.VALUE, '开始日不是真正的日期（文本日期会报 #VALUE!）。', '用真日期单元格引用，或 DATE(2024,1,15) 重拼。'),
    );
  }

  const months = Number(args.months);
  if (!Number.isInteger(months)) {
    return fail(
      make(ERROR_CODES.VALUE, '月数必须是整数（文本或小数都会报 #VALUE!）。', '月数填数字，如 3；来自文本列先 VALUE() 转换。'),
    );
  }

  // 以「总月数」为单位整体偏移，再回算年月，自动处理跨年进位
  const total = startParts.year * 12 + (startParts.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;

  // 月末边界：目标月没有这一天则退回当月最后一天（如 1月31日 +1月 → 2月28/29日）
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = startParts.day > lastDay ? lastDay : startParts.day;

  const value = formatYmd({ year, month, day });
  return ok(value, value);
};
