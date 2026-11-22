/**
 * daycount.ts — Excel day-count / coupon primitives for bonds (B0 支撑模块).
 *
 * Pure, zero-DOM TypeScript. NOT a registered Excel function — the financial
 * bond batch (B14) imports these helpers from the calc engine.
 */

export interface YMD {
  year: number;
  month: number;
  day: number;
}

/** Day-count basis: 0=US 30/360, 1=Actual/Actual, 2=Actual/360, 3=Actual/365, 4=European 30/360 */
export type DayCountBasis = 0 | 1 | 2 | 3 | 4;

const MS_PER_DAY = 86400000;

function isLeapYear(y: number): boolean {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}

function daysInYear(y: number): number {
  return isLeapYear(y) ? 366 : 365;
}

function daysInMonth(y: number, m: number): number {
  // day 0 of next month == last day of month m
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function isLastDayOfFeb(d: YMD): boolean {
  return d.month === 2 && d.day === daysInMonth(d.year, 2);
}

function actualDays(d1: YMD, d2: YMD): number {
  const t1 = Date.UTC(d1.year, d1.month - 1, d1.day);
  const t2 = Date.UTC(d2.year, d2.month - 1, d2.day);
  return Math.abs(t2 - t1) / MS_PER_DAY;
}

/**
 * Number of days between two dates under the given day-count basis.
 * Always returns a non-negative value.
 */
export function dayCount(basis: DayCountBasis, d1: YMD, d2: YMD): number {
  switch (basis) {
    case 0: {
      // US 30/360（NASD）：
      // 起始日是月末 → 记 30 号；结束日是月末时，起始日早于 30 号 → 顺延到下月 1 日，
      // 否则也记 30 号。早期实现只做了 min(30, day)，会把 1/1→12/31 算成 359。
      let { year: y1, month: m1, day: dd1 } = d1;
      let { year: y2, month: m2, day: dd2 } = d2;
      if (dd1 === daysInMonth(y1, m1)) dd1 = 30;
      if (dd2 === daysInMonth(y2, m2)) {
        if (dd1 < 30) {
          m2 += 1;
          dd2 = 1;
        } else {
          dd2 = 30;
        }
      }
      const v = 360 * (y2 - y1) + 30 * (m2 - m1) + (dd2 - dd1);
      return Math.abs(v);
    }
    case 4: {
      // European 30/360 — always cap day at 30, no Feb special
      let { year: y1, month: m1, day: dd1 } = d1;
      let { year: y2, month: m2, day: dd2 } = d2;
      dd1 = dd1 > 30 ? 30 : dd1;
      dd2 = dd2 > 30 ? 30 : dd2;
      const v = 360 * (y2 - y1) + 30 * (m2 - m1) + (dd2 - dd1);
      return Math.abs(v);
    }
    case 1:
    case 2:
    case 3:
    default:
      // Actual/Actual, Actual/360, Actual/365 all use the true calendar day count here.
      return actualDays(d1, d2);
  }
}

/** Actual/Actual (ISDA) year fraction, split across calendar-year boundaries. */
function yearFractionActualActual(d1: YMD, d2: YMD): number {
  if (d1.year === d2.year) {
    return actualDays(d1, d2) / daysInYear(d1.year);
  }
  let total = 0;
  let cur = d1;
  let y = d1.year;
  while (y < d2.year) {
    const yearEnd: YMD = { year: y, month: 12, day: 31 };
    total += actualDays(cur, yearEnd) / daysInYear(y);
    y += 1;
    cur = { year: y, month: 1, day: 1 };
  }
  total += actualDays(cur, d2) / daysInYear(d2.year);
  return total;
}

/**
 * Year fraction between two dates under the given basis:
 *  - 0,2 -> dayCount / 360
 *  - 3,4 -> dayCount / 365
 *  - 1   -> Actual/Actual (ISDA)
 */
export function yearFraction(basis: DayCountBasis, d1: YMD, d2: YMD): number {
  switch (basis) {
    case 1:
      return yearFractionActualActual(d1, d2);
    case 0:
    case 2:
      return dayCount(basis, d1, d2) / 360;
    case 3:
    case 4:
      return dayCount(basis, d1, d2) / 365;
    default:
      return dayCount(basis, d1, d2) / 365;
  }
}

function addMonths(d: YMD, months: number): YMD {
  const total = d.year * 12 + (d.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.min(d.day, daysInMonth(year, month));
  return { year, month, day };
}

function dateLess(a: YMD, b: YMD): boolean {
  if (a.year !== b.year) return a.year < b.year;
  if (a.month !== b.month) return a.month < b.month;
  return a.day < b.day;
}

function sameDate(a: YMD, b: YMD): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export interface CouponSchedule {
  n: number;
  prevCoupon: YMD;
  nextCoupon: YMD;
}

/**
 * Simplified, deterministic coupon schedule. Assumes the first (and final)
 * coupon falls on `maturity`; steps backward by 12/frequency months. The
 * schedule is clamped to valid month lengths.
 */
export function couponSchedule(
  settlement: YMD,
  maturity: YMD,
  frequency: 1 | 2 | 4,
  _basis: DayCountBasis
): CouponSchedule {
  const m = 12 / frequency;

  // Walk backward from maturity to the latest coupon date on/after settlement.
  let prevCoupon = maturity;
  // Guard against pathological loops.
  for (let i = 0; i < 100000; i++) {
    const candidate = addMonths(prevCoupon, -m);
    if (dateLess(candidate, settlement)) break;
    prevCoupon = candidate;
  }

  const nextCoupon = addMonths(prevCoupon, m);

  // Count remaining coupons from nextCoupon forward to maturity (inclusive).
  let n = 1;
  let c = nextCoupon;
  for (let i = 0; i < 100000 && !sameDate(c, maturity); i++) {
    c = addMonths(c, m);
    n += 1;
  }

  return { n, prevCoupon, nextCoupon };
}
