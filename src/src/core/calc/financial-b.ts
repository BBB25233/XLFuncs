import type { CalcContext, CalcHandler, CalcOutcome, CellValue } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber, parseDateText, dateToSerial, serialToParts } from './helpers';
import { dayCount, yearFraction, couponSchedule } from './daycount';
import type { DayCountBasis } from './daycount';

/**
 * 财务类 B 批（第 14 组，前 25 个函数）在线试算 handler。
 *
 * 全部按标准 Excel 公式实现；日期参数接受序列号或「YYYY-MM-DD」文本。
 * 日计数 / 票息 / 久期相关全部复用 daycount.ts 的 dayCount / yearFraction /
 * couponSchedule，不重复造轮子。
 *
 * 错误约定：参数非数字/日期 → #VALUE!；数值域非法（结算≥到期、频率非法、
 * 基准非法、life≤0、salvage>cost 等）→ #NUM!；欧元未知货币 → #VALUE!。
 */

function valueErr(reason: string, fix: string): CalcOutcome {
  return fail(make(ERROR_CODES.VALUE, reason, fix));
}
function numErr(reason: string, fix: string): CalcOutcome {
  return fail(make(ERROR_CODES.NUM, reason, fix));
}
function div0Err(reason: string, fix: string): CalcOutcome {
  return fail(make(ERROR_CODES.DIV0, reason, fix));
}

/* ===================== 共享：日期 / 基准 ===================== */

type YMD = { year: number; month: number; day: number };

function parseDateArg(raw: string | undefined): YMD | null {
  if (raw === undefined || raw === '') return null;
  const n = toNumber(raw);
  if (n !== null) {
    const parts = serialToParts(n);
    if (parts) return parts;
    return null;
  }
  const p = parseDateText(raw);
  if (p) return p;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  }
  return null;
}

function basisArg(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return 0;
  const n = toNumber(raw);
  if (n === null) return null;
  if (n < 0 || n > 4 || !Number.isInteger(n)) return null;
  return n;
}

function ser(d: YMD): number {
  return dateToSerial(d.year, d.month, d.day);
}

/** 转 Excel 序列号（含 1900 闰年 bug 修正：1900-02-28 之后的日期 +1）。 */
function excelSerial(d: YMD): number {
  const s = dateToSerial(d.year, d.month, d.day);
  const t = Date.UTC(d.year, d.month - 1, d.day);
  const base = Date.UTC(1900, 1, 28); // 1900-02-28
  return t > base ? s + 1 : s;
}

/* 本地 addMonths / 日期比较（daycount 内部未导出，这里复制一份） */
function daysInMonthY(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
function addMonths(d: YMD, months: number): YMD {
  const total = d.year * 12 + (d.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.min(d.day, daysInMonthY(year, month));
  return { year, month, day };
}
function dateLessY(a: YMD, b: YMD): boolean {
  if (a.year !== b.year) return a.year < b.year;
  if (a.month !== b.month) return a.month < b.month;
  return a.day < b.day;
}
function sameDateY(a: YMD, b: YMD): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** 票息上下文：返回上一个/下一个票息日、剩余票息期数、月步长 */
function couponContext(settlement: YMD, maturity: YMD, frequency: number, basis: number) {
  const m = 12 / frequency;
  const sched = couponSchedule(settlement, maturity, frequency as 1 | 2 | 4, basis as DayCountBasis);
  const nextCoupon = sched.prevCoupon; // couponSchedule 返回的是「第一个 ≥ settlement 的票息日」
  const prevCoupon = addMonths(nextCoupon, -m);
  const numCoupons = sameDateY(nextCoupon, settlement) ? sched.n - 1 : sched.n;
  return { nextCoupon, prevCoupon, numCoupons, m };
}

/* ===================== 共享：TVM 内部 ===================== */

/** 每期付款额（带 Excel 现金流符号：贷款 pv 为正时返回负数） */
function pmtOf(rate: number, nper: number, pv: number, fv: number, type: number): number {
  if (nper === 0) return NaN;
  if (rate === 0) return -(pv + fv) / nper;
  const pow = Math.pow(1 + rate, nper);
  return (rate * (fv + pv * pow)) / ((1 + rate * type) * (pow - 1));
}

/** 第 per 期利息（Excel 符号：贷款为负）。pmtOf 对贷款返回正数（流出量），故余额里减去付款累积值 */
function ipmtOf(rate: number, per: number, nper: number, pv: number, fv: number, type: number): number {
  const pmt = pmtOf(rate, nper, pv, fv, type); // 贷款为正（流出量的正数）
  let bal: number;
  if (type === 1) {
    if (per === 1) bal = 0; // Excel：期初付款第 1 期不计息
    else {
      bal = pv * Math.pow(1 + rate, per - 1) - pmt * (1 + rate) * ((Math.pow(1 + rate, per - 1) - 1) / rate);
    }
  } else {
    bal = pv * Math.pow(1 + rate, per - 1) - pmt * ((Math.pow(1 + rate, per - 1) - 1) / rate);
  }
  const interest = bal * rate;
  return -interest; // 利息为流出，负
}

/* ===================== ACCRINT ===================== */

export const accrintCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const issue = parseDateArg(args.issue);
  const first = parseDateArg(args.first);
  const settlement = parseDateArg(args.settlement);
  const rate = toNumber(args.rate);
  const par = toNumber(args.par);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!issue || !first || !settlement || rate === null || par === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认发行日/首息日/结算日为合法日期，利率/面值/频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1（年付）、2（半年付）或 4（季付）。');
  }
  if (ser(settlement) < ser(issue)) {
    return numErr('结算日必须晚于发行日', '结算日须晚于发行日，否则没有应计利息。');
  }
  // 应计利息 = 面值 × 票面率 ×（发行日到结算日的年分数）。
  // 由于票息期内利息随时间线性累积，Σ各期 = 票面率 × 总年数，故直接按 issue→settlement 计算即可。
  const accr = par * rate * yearFraction(basis as DayCountBasis, issue, settlement);
  return ok(accr, formatNumber(accr));
};

/* ===================== ACCRINTM ===================== */

export const accrintmCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const issue = parseDateArg(args.issue);
  const maturity = parseDateArg(args.maturity);
  const rate = toNumber(args.rate);
  const par = toNumber(args.par);
  const basis = basisArg(args.basis);
  if (!issue || !maturity || rate === null || par === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认发行日/到期日为合法日期，利率/面值为数字。');
  }
  if (ser(maturity) <= ser(issue)) {
    return numErr('到期日必须晚于发行日', '到期日须晚于发行日。');
  }
  const accr = par * rate * yearFraction(basis as DayCountBasis, issue, maturity);
  return ok(accr, formatNumber(accr));
};

/* ===================== AMORDEGRC ===================== */

const EURO_RATES: Record<string, number> = {
  EUR: 1,
  DEM: 1.95583,
  FRF: 6.55957,
  ITL: 1936.27,
  NLG: 2.20371,
  BEF: 40.3399,
  LUF: 40.3399,
  ESP: 166.386,
  ATS: 13.7603,
  PTE: 200.482,
  FIM: 5.94573,
  GRD: 340.75,
  IEP: 0.787564,
};

export const amordegrcCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const cost = toNumber(args.cost);
  const dateP = parseDateArg(args.date);
  const firstP = parseDateArg(args.first);
  const salvage = toNumber(args.salvage);
  const period = toNumber(args.period);
  const rate = toNumber(args.rate);
  const basis = basisArg(args.basis);
  if (cost === null || !dateP || !firstP || salvage === null || period === null || rate === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认成本/残值/期数/折旧率为数字，买入日/首期为合法日期。');
  }
  if (ser(dateP) >= ser(firstP)) {
    return numErr('买入日须早于首期结束日', 'date_purchased 须早于 first_period。');
  }
  if (rate <= 0) {
    return numErr('折旧率必须 > 0', '折舊率（rate）必须为正。');
  }
  if (salvage >= cost) {
    return numErr('残值须小于成本', 'salvage 必须小于 cost。');
  }
  const life = 1 / rate; // 资产寿命（年）
  let deg: number;
  if (life >= 3 && life <= 4) deg = 1.5;
  else if (life >= 5 && life <= 6) deg = 2;
  else if (life > 6) deg = 2.5;
  else return numErr('资产寿命(1/rate)不在 3–4 / 5–6 / >6 区间', 'life = 1/rate 必须落在有效区间，否则 #NUM!。');
  const oneYear = basis === 3 ? 365 : 360;
  const N = Math.ceil(life);
  let accumulated = 0;
  let result = 0;
  for (let p = 1; p <= period; p += 1) {
    let dep: number;
    if (p === 1) {
      dep = cost * deg * rate * (dayCount(basis as DayCountBasis, dateP, firstP) / oneYear);
    } else if (p === N) {
      dep = (cost - accumulated) * 1; // 最后期：计提 100%
    } else if (p === N - 1) {
      dep = (cost - accumulated) * 0.5; // 倒数第二期：计提 50%
    } else {
      dep = cost * deg * rate;
    }
    if (accumulated + dep > cost - salvage) dep = cost - salvage - accumulated;
    if (dep < 0) dep = 0;
    accumulated += dep;
    result = dep;
  }
  return ok(result, formatNumber(result));
};

/* ===================== AMORLINC ===================== */

export const amorlincCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const cost = toNumber(args.cost);
  const dateP = parseDateArg(args.date);
  const firstP = parseDateArg(args.first);
  const salvage = toNumber(args.salvage);
  const period = toNumber(args.period);
  const rate = toNumber(args.rate);
  const basis = basisArg(args.basis);
  if (cost === null || !dateP || !firstP || salvage === null || period === null || rate === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认成本/残值/期数/折旧率为数字，买入日/首期为合法日期。');
  }
  if (ser(dateP) >= ser(firstP)) {
    return numErr('买入日须早于首期结束日', 'date_purchased 须早于 first_period。');
  }
  if (rate <= 0) {
    return numErr('折旧率必须 > 0', 'rate 必须为正。');
  }
  if (salvage >= cost) {
    return numErr('残值须小于成本', 'salvage 必须小于 cost。');
  }
  const oneYear = basis === 3 ? 365 : 360;
  const N = Math.ceil(1 / rate);
  let accumulated = 0;
  let result = 0;
  for (let p = 1; p <= period; p += 1) {
    let dep: number;
    if (p === 1) {
      dep = cost * rate * (dayCount(basis as DayCountBasis, dateP, firstP) / oneYear);
    } else if (p === N) {
      // 末期：补足到 (cost - salvage)
      dep = cost - salvage - accumulated;
    } else {
      dep = cost * rate;
    }
    if (accumulated + dep > cost - salvage) dep = cost - salvage - accumulated;
    if (dep < 0) dep = 0;
    accumulated += dep;
    result = dep;
  }
  return ok(result, formatNumber(result));
};

/* ===================== COUPDAYBS ===================== */

export const coupdaybsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const cc = couponContext(settlement, maturity, freq, basis);
  const effectivePrev = sameDateY(cc.nextCoupon, settlement) ? cc.nextCoupon : cc.prevCoupon;
  const days = dayCount(basis as DayCountBasis, effectivePrev, settlement);
  return ok(days, formatNumber(days));
};

/* ===================== COUPDAYS ===================== */

export const coupdaysCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const cc = couponContext(settlement, maturity, freq, basis);
  const days = dayCount(basis as DayCountBasis, cc.prevCoupon, cc.nextCoupon);
  return ok(days, formatNumber(days));
};

/* ===================== COUPDAYSNC ===================== */

export const coupdaysncCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const cc = couponContext(settlement, maturity, freq, basis);
  const days = dayCount(basis as DayCountBasis, settlement, cc.nextCoupon);
  return ok(days, formatNumber(days));
};

/* ===================== COUPNCD ===================== */

export const coupncdCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const cc = couponContext(settlement, maturity, freq, basis);
  const s = excelSerial(cc.nextCoupon);
  return ok(s, formatNumber(s));
};

/* ===================== COUPNUM ===================== */

export const coupnumCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const cc = couponContext(settlement, maturity, freq, basis);
  return ok(cc.numCoupons, formatNumber(cc.numCoupons));
};

/* ===================== COUPPCD ===================== */

export const couppcdCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const cc = couponContext(settlement, maturity, freq, basis);
  const s = excelSerial(cc.prevCoupon);
  return ok(s, formatNumber(s));
};

/* ===================== CUMIPMT ===================== */

export const cumipmtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const nper = toNumber(args.nper);
  const pv = toNumber(args.pv);
  const start = toNumber(args.start);
  const end = toNumber(args.end);
  const type = args.type === undefined || args.type === '' ? 0 : toNumber(args.type);
  if (rate === null || nper === null || pv === null || start === null || end === null || type === null) {
    return valueErr('有参数不是合法数字', '请确认利率/期数/现值/起止期为数字。');
  }
  if (nper <= 0) {
    return numErr('期数必须 > 0', 'nper 填正整数。');
  }
  if (start < 1 || end < start || end > nper) {
    return numErr('起止期必须在 1…nper 且 start≤end', 'start/end 需满足 1 ≤ start ≤ end ≤ nper。');
  }
  let total = 0;
  for (let p = start; p <= end; p += 1) {
    total += ipmtOf(rate, p, nper, pv, 0, type);
  }
  return ok(total, formatNumber(total));
};

/* ===================== CUMPRINC ===================== */

export const cumprincCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const nper = toNumber(args.nper);
  const pv = toNumber(args.pv);
  const start = toNumber(args.start);
  const end = toNumber(args.end);
  const type = args.type === undefined || args.type === '' ? 0 : toNumber(args.type);
  if (rate === null || nper === null || pv === null || start === null || end === null || type === null) {
    return valueErr('有参数不是合法数字', '请确认利率/期数/现值/起止期为数字。');
  }
  if (nper <= 0) {
    return numErr('期数必须 > 0', 'nper 填正整数。');
  }
  if (start < 1 || end < start || end > nper) {
    return numErr('起止期必须在 1…nper 且 start≤end', 'start/end 需满足 1 ≤ start ≤ end ≤ nper。');
  }
  const pmt = pmtOf(rate, nper, pv, 0, type);
  let total = 0;
  for (let p = start; p <= end; p += 1) {
    total += -pmt - ipmtOf(rate, p, nper, pv, 0, type);
  }
  return ok(total, formatNumber(total));
};

/* ===================== DB ===================== */

export const dbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const cost = toNumber(args.cost);
  const salvage = toNumber(args.salvage);
  const life = toNumber(args.life);
  const per = toNumber(args.per);
  const month = args.month === undefined || args.month === '' ? 12 : toNumber(args.month);
  if (cost === null || salvage === null || life === null || per === null || month === null) {
    return valueErr('有参数不是合法数字', '请确认成本/残值/寿命/期数为数字。');
  }
  if (cost < 0 || salvage < 0 || life <= 0) {
    return numErr('cost/life 必须为正、salvage 非负', 'cost>0, salvage≥0, life>0。');
  }
  if (per < 1 || per > life) {
    return numErr('期数须在 1…life 之间', 'period 必须满足 1 ≤ period ≤ life。');
  }
  if (month < 1 || month > 12) {
    return numErr('首年月数须在 1…12', 'month 必须在 1 到 12 之间。');
  }
  const rate = 1 - Math.pow(salvage / cost, 1 / life);
  let accumulated = 0;
  let result = 0;
  for (let p = 1; p <= per; p += 1) {
    let dep: number;
    if (p === 1) dep = cost * rate * (month / 12);
    else if (p === life) dep = (cost - accumulated) * rate * ((12 - month) / 12);
    else dep = (cost - accumulated) * rate;
    if (accumulated + dep > cost - salvage) dep = cost - salvage - accumulated;
    if (dep < 0) dep = 0;
    accumulated += dep;
    result = dep;
  }
  return ok(result, formatNumber(result));
};

/* ===================== DDB ===================== */

export const ddbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const cost = toNumber(args.cost);
  const salvage = toNumber(args.salvage);
  const life = toNumber(args.life);
  const per = toNumber(args.per);
  const factor = args.factor === undefined || args.factor === '' ? 2 : toNumber(args.factor);
  if (cost === null || salvage === null || life === null || per === null || factor === null) {
    return valueErr('有参数不是合法数字', '请确认成本/残值/寿命/期数/倍数为数字。');
  }
  if (cost < 0 || salvage < 0 || life <= 0) {
    return numErr('cost/life 必须为正、salvage 非负', 'cost>0, salvage≥0, life>0。');
  }
  if (per < 1 || per > life) {
    return numErr('期数须在 1…life 之间', 'period 必须满足 1 ≤ period ≤ life。');
  }
  if (factor <= 0) {
    return numErr('倍数必须 > 0', 'factor 必须为正（默认 2）。');
  }
  let accumulated = 0;
  let result = 0;
  for (let p = 1; p <= per; p += 1) {
    let dep = (cost - accumulated) * (factor / life);
    const maxDep = cost - salvage - accumulated;
    if (dep > maxDep) dep = maxDep;
    if (dep < 0) dep = 0;
    accumulated += dep;
    result = dep;
  }
  return ok(result, formatNumber(result));
};

/* ===================== DISC ===================== */

export const discCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const pr = toNumber(args.pr);
  const redemption = toNumber(args.redemption);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || pr === null || redemption === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，价格/赎回价为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  if (pr <= 0 || redemption <= 0) {
    return numErr('价格/赎回价必须 > 0', 'pr 与 redemption 必须为正。');
  }
  const yf = yearFraction(basis as DayCountBasis, settlement, maturity);
  if (yf <= 0) return numErr('年分数非正', '日期区间无效。');
  const discVal = ((redemption - pr) / redemption) / yf;
  return ok(discVal, formatNumber(discVal));
};

/* ===================== DOLLARDE ===================== */

export const dollardeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const frac = toNumber(args.frac);
  const fraction = toNumber(args.fraction);
  if (frac === null || fraction === null) {
    return valueErr('有参数不是合法数字', '请确认小数价/分数分母为数字。');
  }
  if (fraction === 0) {
    return div0Err('分数分母不能为 0', 'fraction 必须非 0。');
  }
  const count = decimalDigits(frac);
  const numerator = Math.round((frac - Math.trunc(frac)) * Math.pow(10, count));
  const result = Math.trunc(frac) + numerator / fraction;
  return ok(result, formatNumber(result));
};

/* ===================== DOLLARFR ===================== */

export const dollarfrCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const dec = toNumber(args.dec);
  const fraction = toNumber(args.fraction);
  if (dec === null || fraction === null) {
    return valueErr('有参数不是合法数字', '请确认分数价/分数分母为数字。');
  }
  if (fraction === 0) {
    return div0Err('分数分母不能为 0', 'fraction 必须非 0。');
  }
  const count = intDigits(fraction);
  const result = Math.trunc(dec) + ((dec - Math.trunc(dec)) * fraction) / Math.pow(10, count);
  return ok(result, formatNumber(result));
};

/** 整数部分的位数（用于 DOLLARFR 的分母 10^位数） */
function intDigits(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return String(Math.trunc(Math.abs(n))).length;
}

function decimalDigits(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const idx = s.indexOf('.');
  if (idx < 0) return 0;
  return s.length - idx - 1;
}

/* ===================== DURATION（Macaulay） ===================== */

export const durationCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const coupon = toNumber(args.coupon);
  const yld = toNumber(args.yld);
  const freq = toNumber(args.frequency);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || coupon === null || yld === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，票面率/收益率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  if (coupon < 0 || yld < 0) {
    return numErr('票面率/收益率不能为负', 'coupon 与 yld 必须 ≥ 0。');
  }
  const cc = couponContext(settlement, maturity, freq, basis);
  const E = dayCount(basis as DayCountBasis, cc.prevCoupon, cc.nextCoupon); // 一个票息期的天数
  const m = freq;
  const settleOnCoupon = sameDateY(cc.nextCoupon, settlement);
  // 首个现金流日：若 settlement 恰好落在票息日，则跳过该期（已付息），首笔为下一票息日；
  // 否则就是下一个票息日。
  const startCoupon = settleOnCoupon ? addMonths(cc.nextCoupon, cc.m) : cc.nextCoupon;
  // 统计 startCoupon → maturity（含）之间的票息期数 N
  let c = startCoupon;
  let N = 0;
  let reached = false;
  for (let guard = 0; guard < 100000; guard += 1) {
    if (sameDateY(c, maturity)) { reached = true; break; }
    c = addMonths(c, cc.m);
    N += 1;
  }
  if (!reached) {
    return numErr('到期日不在票息日程上', 'maturity 必须是按 frequency 排列的票息日。');
  }
  N += 1; // 含到期日那期
  const A = dayCount(basis as DayCountBasis, settlement, cc.nextCoupon); // settlement → 下一票息日
  let pvSum = 0;
  let weighted = 0;
  for (let k = 1; k <= N; k += 1) {
    const tPer = settleOnCoupon ? k : (k - 1) + (E === 0 ? 0 : A / E); // 距 settlement 的票息期数
    const cf = k === N ? 100 * coupon / m + 100 : 100 * coupon / m; // 末期含本金 100
    const pv = cf / Math.pow(1 + yld / m, tPer);
    pvSum += pv;
    weighted += (tPer / m) * pv; // 折算成年
  }
  if (pvSum <= 0 || !Number.isFinite(pvSum)) {
    return numErr('无法计算久期', '请检查参数（收益率/频率/日期）。');
  }
  const dur = weighted / pvSum;
  return ok(dur, formatNumber(dur));
};

/* ===================== EFFECT ===================== */

export const effectCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const nominal = toNumber(args.nominal);
  const npery = toNumber(args.npery);
  if (nominal === null || npery === null) {
    return valueErr('有参数不是合法数字', '请确认名义利率/复利次数为数字。');
  }
  const nInt = Math.trunc(npery);
  if (nInt < 1) {
    return numErr('复利次数必须 ≥ 1', 'npery 必须 ≥ 1（会向下取整为整数）。');
  }
  const eff = Math.pow(1 + nominal / nInt, nInt) - 1;
  if (!Number.isFinite(eff)) {
    return numErr('有效利率算不出来', '请检查名义利率与复利次数。');
  }
  return ok(eff, formatNumber(eff));
};

/* ===================== EUROCONVERT ===================== */

export const euroconvertCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const amount = toNumber(args.number);
  const source = stripQuotes(args.source ?? '').inner.trim().toUpperCase();
  const target = stripQuotes(args.target ?? '').inner.trim().toUpperCase();
  if (amount === null) {
    return valueErr('金额不是合法数字', 'number 必须是数字。');
  }
  if (!(source in EURO_RATES) || !(target in EURO_RATES)) {
    return valueErr('未知货币代码', '源/目标货币必须是 12 种欧元 legacy 货币或 EUR 之一（DEM/FRF/ITL/NLG/BEF/LUF/ESP/ATS/PTE/FIM/GRD/IEP/EUR）。');
  }
  const result = (amount / EURO_RATES[source]) * EURO_RATES[target];
  return ok(result, formatNumber(result));
};

/* ===================== FVSCHEDULE ===================== */

function parseNumberList(raw: string | undefined): number[] | null {
  if (raw === undefined) return null;
  const s = stripQuotes(raw).inner;
  const parts = s.split(',').map((x) => x.trim()).filter((x) => x !== '');
  if (parts.length === 0) return null;
  const nums = parts.map((p) => toNumber(p));
  if (nums.some((n) => n === null)) return null;
  return nums as number[];
}

export const fvscheduleCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const principal = toNumber(args.principal);
  const rates = parseNumberList(args.schedule);
  if (principal === null) {
    return valueErr('本金不是合法数字', 'principal 必须是数字。');
  }
  if (rates === null) {
    return valueErr('利率序列不是合法数字列表', 'schedule 必须是逗号分隔的数字列表，如 "0.01,0.02"。');
  }
  let total: CellValue = principal;
  let value = principal;
  for (const r of rates) {
    value = value * (1 + r);
  }
  total = value;
  return ok(total, formatNumber(value));
};

/* ===================== INTRATE ===================== */

export const intrateCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const settlement = parseDateArg(args.settlement);
  const maturity = parseDateArg(args.maturity);
  const investment = toNumber(args.investment);
  const redemption = toNumber(args.redemption);
  const basis = basisArg(args.basis);
  if (!settlement || !maturity || investment === null || redemption === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，投资额/赎回额为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  if (investment <= 0) {
    return numErr('投资额必须 > 0', 'investment 必须为正。');
  }
  const yf = yearFraction(basis as DayCountBasis, settlement, maturity);
  if (yf <= 0) return numErr('年分数非正', '日期区间无效。');
  const rate = ((redemption - investment) / investment) / yf;
  return ok(rate, formatNumber(rate));
};

/* ===================== IPMT ===================== */

export const ipmtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const per = toNumber(args.per);
  const nper = toNumber(args.nper);
  const pv = toNumber(args.pv);
  const fv = args.fv === undefined || args.fv === '' ? 0 : toNumber(args.fv);
  const type = args.type === undefined || args.type === '' ? 0 : toNumber(args.type);
  if (rate === null || per === null || nper === null || pv === null || fv === null || type === null) {
    return valueErr('有参数不是合法数字', '请确认利率/期数/现值/终值/类型为数字。');
  }
  if (nper <= 0) {
    return numErr('期数必须 > 0', 'nper 填正整数。');
  }
  if (per < 1 || per > nper) {
    return numErr('期数须在 1…nper 之间', 'per 必须满足 1 ≤ per ≤ nper。');
  }
  const interest = ipmtOf(rate, per, nper, pv, fv, type);
  if (!Number.isFinite(interest)) {
    return numErr('利息算不出来', '请检查利率/期数/现值/终值。');
  }
  return ok(interest, formatNumber(interest));
};

/* ===================== IRR ===================== */

export const irrCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const list = parseNumberList(args.values);
  if (list === null || list.length < 1) {
    return valueErr('现金流不是合法数字列表', 'values 必须是逗号分隔的数字列表，如 "-100,20,30,40"。');
  }
  const guessRaw = args.guess;
  const guess = guessRaw === undefined || guessRaw === '' ? 0.1 : toNumber(guessRaw);
  if (guess === null) {
    return valueErr('猜测值不是合法数字', 'guess 必须是数字（默认 0.1）。');
  }
  let hasPos = false;
  let hasNeg = false;
  for (const v of list) {
    if (v > 0) hasPos = true;
    if (v < 0) hasNeg = true;
  }
  if (!(hasPos && hasNeg)) {
    return numErr('现金流无正负号变化，IRR 无解', '首笔常为投入（负），后续为回报（正），需同时存在正负值。');
  }
  const npv = (r: number): number => list.reduce((acc, v, i) => acc + v / Math.pow(1 + r, i), 0);
  // 扫描寻找变号区间，再二分
  let low = -0.999999999;
  let high = 1000;
  let flo = npv(low);
  let fhi = npv(high);
  if (flo * fhi > 0) {
    return numErr('IRR 在搜索区间内无根', '现金流可能无内部收益率，换组现金流或 guess 再试。');
  }
  let r = guess;
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    const fm = npv(mid);
    if (Math.abs(fm) < 1e-10) {
      r = mid;
      break;
    }
    if (flo * fm < 0) {
      high = mid;
      fhi = fm;
    } else {
      low = mid;
      flo = fm;
    }
    r = mid;
  }
  if (!Number.isFinite(r) || Math.abs(npv(r)) >= 1e-6) {
    return numErr('IRR 迭代未收敛', '请换 guess 再试。');
  }
  return ok(r, formatNumber(r));
};

/* ===================== ISPMT ===================== */

export const ispmtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const per = toNumber(args.per);
  const nper = toNumber(args.nper);
  const pv = toNumber(args.pv);
  if (rate === null || per === null || nper === null || pv === null) {
    return valueErr('有参数不是合法数字', '请确认利率/期数/现值为数字。');
  }
  if (nper <= 0) {
    return numErr('期数必须 > 0', 'nper 填正整数。');
  }
  if (per < 1 || per > nper) {
    return numErr('期数须在 1…nper 之间', 'per 必须满足 1 ≤ per ≤ nper。');
  }
  // ISPMT 按「等额本金」还款：第 per 期利息 = -pv*rate*(nper-per)/nper
  // （Excel 的 ISPMT 期间从 0 计，故用 (nper-per)/nper）
  const interest = -pv * rate * (nper - per) / nper;
  return ok(interest, formatNumber(interest));
};
