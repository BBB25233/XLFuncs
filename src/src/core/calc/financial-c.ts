import type { CalcContext, CalcHandler, CalcOutcome, CellValue } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber, parseDateText, dateToSerial, serialToParts } from './helpers';
import { dayCount, yearFraction, couponSchedule } from './daycount';
import type { DayCountBasis } from './daycount';
import { durationCalc, irrCalc, ipmtCalc } from './financial-b';
import { pmtCalc } from './financial';

/**
 * 财务类 C 批（B14 组，剩余 26 个函数）在线试算 handler。
 *
 * 全部按标准 Excel 公式实现。日期参数接受序列号或「YYYY-MM-DD」文本，
 * 统一用 daycount 的 dayCount / yearFraction / couponSchedule 做日计数与票息日程。
 *
 * 错误约定：参数非数字/日期 → #VALUE!；数值域非法（结算≥到期、频率非法、
 * 基准非法、life≤0、salvage 域非法、期限>1 年等）→ #NUM!；除 0 → #DIV/0!。
 *
 * 复用的既有 handler：MDURATION 复用 durationCalc；PPMT 复用 pmtCalc+ipmtCalc；
 * XIRR 内部用 XNPV 方程；其余按 Excel 公式独立实现。
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

/** 票息上下文：返回上一个/下一个票息日、剩余票息期数、月步长（与 financial-b 一致） */
function couponContext(settlement: YMD, maturity: YMD, frequency: number, basis: number) {
  const m = 12 / frequency;
  const sched = couponSchedule(settlement, maturity, frequency as 1 | 2 | 4, basis as DayCountBasis);
  const nextCoupon = sched.prevCoupon; // couponSchedule 返回「第一个 ≥ settlement 的票息日」
  const prevCoupon = addMonths(nextCoupon, -m);
  const numCoupons = sameDateY(nextCoupon, settlement) ? sched.n - 1 : sched.n;
  return { nextCoupon, prevCoupon, numCoupons, m };
}

/** 解析逗号分隔的数字列表（值/现金流） */
function parseNumberList(raw: string | undefined): number[] | null {
  if (raw === undefined) return null;
  const s = stripQuotes(raw).inner;
  const parts = s.split(',').map((x) => x.trim()).filter((x) => x !== '');
  if (parts.length === 0) return null;
  const nums = parts.map((p) => toNumber(p));
  if (nums.some((n) => n === null)) return null;
  return nums as number[];
}

/** 解析逗号分隔的日期列表 → Excel 序列号数组 */
function parseDateList(raw: string | undefined): number[] | null {
  if (raw === undefined) return null;
  const s = stripQuotes(raw).inner;
  const parts = s.split(',').map((x) => x.trim()).filter((x) => x !== '');
  if (parts.length === 0) return null;
  const out: number[] = [];
  for (const p of parts) {
    const d = parseDateArg(p);
    if (d === null) return null;
    out.push(ser(d));
  }
  return out;
}

/* ===================== 共享：标准债券价格 / 收益求解 ===================== */

/** 标准定期付息债券价格（每 100 面值），PRICE 与 YIELD 共用 */
function priceStandard(
  settlement: YMD,
  maturity: YMD,
  rate: number,
  yld: number,
  redemption: number,
  freq: number,
  basis: number,
): number {
  const cc = couponContext(settlement, maturity, freq, basis);
  const E = dayCount(basis as DayCountBasis, cc.prevCoupon, cc.nextCoupon);
  const settleOnCoupon = sameDateY(settlement, cc.nextCoupon);
  const A = settleOnCoupon ? 0 : dayCount(basis as DayCountBasis, cc.prevCoupon, settlement);
  const DSC = dayCount(basis as DayCountBasis, settlement, cc.nextCoupon);
  const N = cc.numCoupons;
  const f = freq;
  let price = 0;
  for (let k = 1; k <= N; k += 1) {
    const cf = k === N ? 100 * rate / f + 100 : 100 * rate / f;
    const exp = settleOnCoupon ? k : (k - 1) + DSC / E;
    price += cf / Math.pow(1 + yld / f, exp);
  }
  price -= 100 * rate / f * (A / E);
  return price;
}

/** 牛顿/二分法求收益：使 priceFn(y)=target */
function solveYield(priceFn: (y: number) => number, target: number): number | null {
  let low = 1e-7;
  let high = 10;
  let flo = priceFn(low) - target;
  let fhi = priceFn(high) - target;
  if (flo * fhi > 0) {
    // 扫描寻找变号区间
    let found = false;
    for (let i = 1; i <= 200; i += 1) {
      const t = i / 20;
      const ft = priceFn(t) - target;
      if (flo * ft < 0) {
        high = t;
        fhi = ft;
        found = true;
        break;
      }
      flo = ft;
      low = t;
    }
    if (!found) return null;
  }
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    const fm = priceFn(mid) - target;
    if (Math.abs(fm) < 1e-10) return mid;
    if (flo * fm < 0) {
      high = mid;
      fhi = fm;
    } else {
      low = mid;
      flo = fm;
    }
  }
  return (low + high) / 2;
}

/* ===================== MDURATION ===================== */

export const mdurationCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const dRes = durationCalc(ctx);
  if (!dRes.ok) return dRes;
  const yld = toNumber(ctx.args.yld);
  const freq = toNumber(ctx.args.frequency);
  if (yld === null || freq === null || freq === 0) {
    return numErr('收益率/频率非法', '请确认收益率为数字、频率为 1/2/4。');
  }
  const macaulay = dRes.value as number;
  const m = macaulay / (1 + yld / freq);
  return ok(m, formatNumber(m));
};

/* ===================== MIRR ===================== */

export const mirrCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = parseNumberList(ctx.args.values);
  const fin = toNumber(ctx.args.finance);
  const reinv = toNumber(ctx.args.reinvest);
  if (vals === null || fin === null || reinv === null) {
    return valueErr('有参数不是合法数字或现金流列表', '请确认融资率/再投资率为数字，values 为逗号分隔的现金流。');
  }
  let hasPos = false;
  let hasNeg = false;
  for (const v of vals) {
    if (v > 0) hasPos = true;
    if (v < 0) hasNeg = true;
  }
  if (!hasPos || !hasNeg) {
    return div0Err('现金流需同时含正负值', 'MIRR 需要既有投入（负）又有回款（正）的现金流。');
  }
  const n = vals.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    const t = i + 1;
    const v = vals[i];
    if (v > 0) num += v * Math.pow(1 + reinv, n - t);
    else if (v < 0) den += -v / Math.pow(1 + fin, t);
  }
  if (den === 0 || num < 0) {
    return numErr('MIRR 无解', '现金流组合导致分母为 0，请检查正负现金流。');
  }
  const mirr = Math.pow(num / den, 1 / n) - 1;
  if (!Number.isFinite(mirr)) {
    return numErr('MIRR 算不出来', '请检查融资率/再投资率。');
  }
  return ok(mirr, formatNumber(mirr));
};

/* ===================== NOMINAL ===================== */

export const nominalCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const effect = toNumber(ctx.args.effect);
  const npery = toNumber(ctx.args.npery);
  if (effect === null || npery === null) {
    return valueErr('有参数不是合法数字', '请确认有效年利率/复利次数为数字。');
  }
  const nInt = Math.trunc(npery);
  if (nInt < 1) {
    return numErr('复利次数必须 ≥ 1', 'npery 必须 ≥ 1（向下取整为整数）。');
  }
  const nom = nInt * (Math.pow(1 + effect, 1 / nInt) - 1);
  if (!Number.isFinite(nom)) {
    return numErr('名义利率算不出来', '请检查有效年利率（需 > -1）。');
  }
  return ok(nom, formatNumber(nom));
};

/* ===================== NPV ===================== */

export const npvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const rate = toNumber(ctx.args.rate);
  const vals = parseNumberList(ctx.args.value);
  if (rate === null || vals === null) {
    return valueErr('有参数不是合法数字或现金流列表', '请确认折现率为数字、value 为逗号分隔的现金流。');
  }
  let npv = 0;
  for (let i = 0; i < vals.length; i += 1) {
    // Excel NPV 对第一笔现金流也折现一期：第 i 笔按 (i+1) 期折现
    npv += vals[i] / Math.pow(1 + rate, i + 1);
  }
  return ok(npv, formatNumber(npv));
};

/* ===================== PDURATION ===================== */

export const pdurationCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const rate = toNumber(ctx.args.rate);
  const pv = toNumber(ctx.args.pv);
  const fv = toNumber(ctx.args.fv);
  if (rate === null || pv === null || fv === null) {
    return valueErr('有参数不是合法数字', '请确认利率/现值/终值为数字。');
  }
  if (pv <= 0 || fv <= 0) {
    return numErr('现值/终值必须 > 0', 'pv 与 fv 必须为正。');
  }
  if (rate <= -1) {
    return numErr('利率必须 > -1', 'rate 需 > -1。');
  }
  const pd = (Math.log(fv) - Math.log(pv)) / Math.log(1 + rate);
  if (!Number.isFinite(pd)) {
    return numErr('价格久期算不出来', '请检查参数。');
  }
  return ok(pd, formatNumber(pd));
};

/* ===================== PPMT ===================== */

export const ppmtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  // 复用 financial.ts 的 pmtCalc（返回正数幅度）与 financial-b 的 ipmtCalc（返回负利息）
  const pmtRes = pmtCalc(ctx);
  if (!pmtRes.ok) return pmtRes;
  const ipmtRes = ipmtCalc(ctx);
  if (!ipmtRes.ok) return ipmtRes;
  const pmtVal = pmtRes.value as number;
  const ipmtVal = ipmtRes.value as number;
  // PPMT = -(PMT 正幅度) - IPMT(负) = Excel 符号（贷款为负）
  const pp = -pmtVal - ipmtVal;
  return ok(pp, formatNumber(pp));
};

/* ===================== PRICE ===================== */

export const priceCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const rate = toNumber(ctx.args.rate);
  const yld = toNumber(ctx.args.yld);
  const redemption = toNumber(ctx.args.redemption);
  const freq = toNumber(ctx.args.frequency);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || rate === null || yld === null || redemption === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，票面率/收益率/赎回价/频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const price = priceStandard(settlement, maturity, rate, yld, redemption, freq, basis);
  if (!Number.isFinite(price)) {
    return numErr('债券价格算不出来', '请检查参数（收益率/频率/日期）。');
  }
  return ok(price, formatNumber(price));
};

/* ===================== PRICEDISC ===================== */

export const pricediscCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const discount = toNumber(ctx.args.discount);
  const redemption = toNumber(ctx.args.redemption);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || discount === null || redemption === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，贴现率/赎回价为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  if (discount <= 0 || redemption <= 0) {
    return numErr('贴现率/赎回价必须 > 0', 'discount 与 redemption 须为正。');
  }
  const yf = yearFraction(basis as DayCountBasis, settlement, maturity);
  if (yf <= 0) return numErr('年分数非正', '日期区间无效。');
  const price = redemption * (1 - discount * yf);
  return ok(price, formatNumber(price));
};

/* ===================== PRICEMAT ===================== */

export const pricematCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const issue = parseDateArg(ctx.args.issue);
  const rate = toNumber(ctx.args.rate);
  const yld = toNumber(ctx.args.yld);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || !issue || rate === null || yld === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日/发行日为合法日期，票面率/收益率为数字。');
  }
  if (ser(settlement) >= ser(maturity) || ser(issue) > ser(settlement)) {
    return numErr('日期顺序须为 发行日 ≤ 结算日 < 到期日', '请确认 issue ≤ settlement < maturity。');
  }
  const A = yearFraction(basis as DayCountBasis, issue, maturity);
  const B = yearFraction(basis as DayCountBasis, settlement, maturity);
  const E = yearFraction(basis as DayCountBasis, issue, settlement);
  if (B <= 0) return numErr('年分数非正', '日期区间无效。');
  const price = (100 + 100 * rate * A) / (1 + yld * B) - 100 * rate * E;
  if (!Number.isFinite(price)) {
    return numErr('到期债券价格算不出来', '请检查参数。');
  }
  return ok(price, formatNumber(price));
};

/* ===================== RECEIVED ===================== */

export const receivedCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const investment = toNumber(ctx.args.investment);
  const discount = toNumber(ctx.args.discount);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || investment === null || discount === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，投资额/贴现率为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  if (investment <= 0) {
    return numErr('投资额必须 > 0', 'investment 须为正。');
  }
  const yf = yearFraction(basis as DayCountBasis, settlement, maturity);
  if (yf <= 0) return numErr('年分数非正', '日期区间无效。');
  const amount = investment / (1 - discount * yf);
  if (!Number.isFinite(amount)) {
    return numErr('赎回金额算不出来', '请检查贴现率与日期。');
  }
  return ok(amount, formatNumber(amount));
};

/* ===================== RRI ===================== */

export const rriCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const nper = toNumber(ctx.args.nper);
  const pv = toNumber(ctx.args.pv);
  const fv = toNumber(ctx.args.fv);
  if (nper === null || pv === null || fv === null) {
    return valueErr('有参数不是合法数字', '请确认期数/现值/终值为数字。');
  }
  if (nper <= 0) {
    return numErr('期数必须 > 0', 'nper 填正整数。');
  }
  if (pv === 0) {
    return div0Err('现值不能为 0', 'pv 必须非 0。');
  }
  if (fv <= 0) {
    return numErr('终值必须 > 0', 'fv 须为正。');
  }
  const r = Math.pow(fv / pv, 1 / nper) - 1;
  if (!Number.isFinite(r)) {
    return numErr('等价利率算不出来', '请检查参数。');
  }
  return ok(r, formatNumber(r));
};

/* ===================== SLN ===================== */

export const slnCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const cost = toNumber(ctx.args.cost);
  const salvage = toNumber(ctx.args.salvage);
  const life = toNumber(ctx.args.life);
  if (cost === null || salvage === null || life === null) {
    return valueErr('有参数不是合法数字', '请确认原值/残值/寿命为数字。');
  }
  if (life === 0) {
    return div0Err('寿命不能为 0', 'life 必须 > 0。');
  }
  const dep = (cost - salvage) / life;
  return ok(dep, formatNumber(dep));
};

/* ===================== SYD ===================== */

export const sydCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const cost = toNumber(ctx.args.cost);
  const salvage = toNumber(ctx.args.salvage);
  const life = toNumber(ctx.args.life);
  const per = toNumber(ctx.args.per);
  if (cost === null || salvage === null || life === null || per === null) {
    return valueErr('有参数不是合法数字', '请确认原值/残值/寿命/第几期为数字。');
  }
  if (life <= 0) {
    return numErr('寿命必须 > 0', 'life 必须 > 0。');
  }
  if (per < 1 || per > life) {
    return numErr('第几期须在 1…life 之间', 'per 必须满足 1 ≤ per ≤ life。');
  }
  const dep = (cost - salvage) * (life - per + 1) / ((life * (life + 1)) / 2);
  return ok(dep, formatNumber(dep));
};

/* ===================== TBILL 系列 ===================== */

function tbillDays(settlement: YMD, maturity: YMD): number {
  return Math.round(
    (Date.UTC(maturity.year, maturity.month - 1, maturity.day) -
      Date.UTC(settlement.year, settlement.month - 1, settlement.day)) /
      86400000,
  );
}

export const tbilleqCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const discount = toNumber(ctx.args.discount);
  if (!settlement || !maturity || discount === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，贴现率为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const dsm = tbillDays(settlement, maturity);
  if (dsm > 365) {
    return numErr('期限超过 1 年', '国库券期限须 ≤ 365 天。');
  }
  if (discount <= 0) {
    return numErr('贴现率必须 > 0', 'discount 须为正。');
  }
  const eq = (365 * discount) / (360 - discount * dsm);
  if (!Number.isFinite(eq)) {
    return numErr('等价收益算不出来', '请检查贴现率。');
  }
  return ok(eq, formatNumber(eq));
};

export const tbillpriceCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const discount = toNumber(ctx.args.discount);
  if (!settlement || !maturity || discount === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，贴现率为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const dsm = tbillDays(settlement, maturity);
  if (dsm > 365) {
    return numErr('期限超过 1 年', '国库券期限须 ≤ 365 天。');
  }
  if (discount <= 0) {
    return numErr('贴现率必须 > 0', 'discount 须为正。');
  }
  const price = 100 * (1 - discount * dsm / 360);
  return ok(price, formatNumber(price));
};

export const tbillyieldCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const pr = toNumber(ctx.args.pr);
  if (!settlement || !maturity || pr === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，价格为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  const dsm = tbillDays(settlement, maturity);
  if (dsm > 365) {
    return numErr('期限超过 1 年', '国库券期限须 ≤ 365 天。');
  }
  if (pr <= 0) {
    return numErr('价格必须 > 0', 'pr 须为正。');
  }
  const yld = (100 - pr) / pr * (360 / dsm);
  if (!Number.isFinite(yld)) {
    return numErr('收益算不出来', '请检查价格。');
  }
  return ok(yld, formatNumber(yld));
};

/* ===================== VDB ===================== */

export const vdbCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const cost = toNumber(ctx.args.cost);
  const salvage = toNumber(ctx.args.salvage);
  const life = toNumber(ctx.args.life);
  const start = toNumber(ctx.args.start);
  const end = toNumber(ctx.args.end);
  const factor = ctx.args.factor === undefined || ctx.args.factor === '' ? 2 : toNumber(ctx.args.factor);
  const noSwitchRaw = ctx.args.switch;
  const noSwitch = noSwitchRaw !== undefined && noSwitchRaw !== '' && /^(TRUE|true|1)$/.test(String(noSwitchRaw).trim());
  if (cost === null || salvage === null || life === null || start === null || end === null || factor === null) {
    return valueErr('有参数不是合法数字', '请确认原值/残值/寿命/起期/止期/倍数为数字。');
  }
  if (cost < 0 || salvage < 0 || life <= 0) {
    return numErr('cost/life 必须为正、salvage 非负', 'cost>0, salvage≥0, life>0。');
  }
  if (start < 0 || end <= start) {
    return numErr('起期须 < 止期且起期 ≥ 0', 'start 须 ≥ 0 且 end > start。');
  }
  if (factor <= 0) {
    return numErr('倍数必须 > 0', 'factor 必须为正（默认 2）。');
  }
  const cum = (limit: number): number => {
    let t = 0;
    let total = 0;
    let book = cost;
    while (t < limit - 1e-12) {
      const remainingLife = life - t;
      if (remainingLife <= 0) break;
      const step = Math.min(1, limit - t);
      const ddb = book * (factor / life) * step;
      let dep = ddb;
      if (!noSwitch) {
        const sln = (book - salvage) / remainingLife * step;
        if (sln > ddb) dep = sln; // 切换直线法
      }
      if (total + dep > cost - salvage) dep = cost - salvage - total;
      if (dep < 0) dep = 0;
      total += dep;
      book -= dep;
      t += step;
      if (book <= salvage + 1e-9) break;
    }
    return total;
  };
  const dep = cum(end) - cum(start);
  return ok(dep, formatNumber(dep));
};

/* ===================== XNPV ===================== */

function xnpvAt(rate: number, vals: number[], dates: number[]): number {
  const d0 = dates[0];
  let s = 0;
  for (let i = 0; i < vals.length; i += 1) {
    const t = (dates[i] - d0) / 365;
    s += vals[i] / Math.pow(1 + rate, t);
  }
  return s;
}

export const xnpvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const rate = toNumber(ctx.args.rate);
  const vals = parseNumberList(ctx.args.values);
  const dates = parseDateList(ctx.args.dates);
  if (rate === null || vals === null || dates === null) {
    return valueErr('有参数不是合法数字/日期或列表', '请确认折现率为数字，values/dates 为等长的逗号列表。');
  }
  if (vals.length !== dates.length) {
    return numErr('现金流与日期数量不一致', 'values 与 dates 必须一一对应、数量相同。');
  }
  if (vals.length < 1) {
    return numErr('至少需要一笔现金流', 'values 不能为空。');
  }
  const x = xnpvAt(rate, vals, dates);
  if (!Number.isFinite(x)) {
    return numErr('XNPV 算不出来', '请检查折现率与日期。');
  }
  return ok(x, formatNumber(x));
};

/* ===================== XIRR ===================== */

export const xirrCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const vals = parseNumberList(ctx.args.values);
  const dates = parseDateList(ctx.args.dates);
  const guessRaw = ctx.args.guess;
  const guess = guessRaw === undefined || guessRaw === '' ? 0.1 : toNumber(guessRaw);
  if (vals === null || dates === null || guess === null) {
    return valueErr('有参数不是合法数字/日期或列表', '请确认 values/dates 为等长的逗号列表。');
  }
  if (vals.length !== dates.length) {
    return numErr('现金流与日期数量不一致', 'values 与 dates 必须一一对应。');
  }
  if (vals.length < 2) {
    return numErr('至少需要两笔现金流', 'XIRR 需要投入与回款两组数据。');
  }
  let hasPos = false;
  let hasNeg = false;
  for (const v of vals) {
    if (v > 0) hasPos = true;
    if (v < 0) hasNeg = true;
  }
  if (!(hasPos && hasNeg)) {
    return numErr('现金流无正负号变化，XIRR 无解', '需同时存在正负现金流（一笔投入、后续回款）。');
  }
  const f = (r: number): number => xnpvAt(r, vals, dates);
  let low = -0.9999999999;
  let high = 1000;
  let flo = f(low);
  let fhi = f(high);
  if (flo * fhi > 0) {
    return numErr('XIRR 在搜索区间内无根', '现金流可能无内部收益率，换组现金流或 guess 再试。');
  }
  let r = guess;
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    const fm = f(mid);
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
  if (!Number.isFinite(r) || Math.abs(f(r)) >= 1e-6) {
    return numErr('XIRR 迭代未收敛', '请换 guess 再试。');
  }
  return ok(r, formatNumber(r));
};

/* ===================== YIELD ===================== */

export const yieldCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const rate = toNumber(ctx.args.rate);
  const pr = toNumber(ctx.args.pr);
  const redemption = toNumber(ctx.args.redemption);
  const freq = toNumber(ctx.args.frequency);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || rate === null || pr === null || redemption === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，票面率/价格/赎回价/频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  if (pr <= 0 || redemption <= 0) {
    return numErr('价格/赎回价必须 > 0', 'pr 与 redemption 须为正。');
  }
  const target = pr;
  const priceFn = (y: number): number =>
    priceStandard(settlement, maturity, rate, y, redemption, freq, basis);
  const y = solveYield(priceFn, target);
  if (y === null || !Number.isFinite(y) || y < -1) {
    return numErr('收益率迭代不收敛或无解', '请检查价格/票面率/频率，或换组参数。');
  }
  return ok(y, formatNumber(y));
};

/* ===================== YIELDDISC ===================== */

export const yielddiscCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const pr = toNumber(ctx.args.pr);
  const redemption = toNumber(ctx.args.redemption);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || pr === null || redemption === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日为合法日期，价格/赎回价为数字。');
  }
  if (ser(settlement) >= ser(maturity)) {
    return numErr('结算日须早于到期日', 'settlement 须早于 maturity。');
  }
  if (pr <= 0 || redemption <= 0) {
    return numErr('价格/赎回价必须 > 0', 'pr 与 redemption 须为正。');
  }
  const yf = yearFraction(basis as DayCountBasis, settlement, maturity);
  if (yf <= 0) return numErr('年分数非正', '日期区间无效。');
  const yld = (redemption - pr) / (pr * yf);
  if (!Number.isFinite(yld)) {
    return numErr('折价收益算不出来', '请检查价格。');
  }
  return ok(yld, formatNumber(yld));
};

/* ===================== YIELDMAT ===================== */

export const yieldmatCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const issue = parseDateArg(ctx.args.issue);
  const rate = toNumber(ctx.args.rate);
  const pr = toNumber(ctx.args.pr);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || !issue || rate === null || pr === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认结算日/到期日/发行日为合法日期，票面率/价格为数字。');
  }
  if (ser(settlement) >= ser(maturity) || ser(issue) > ser(settlement)) {
    return numErr('日期顺序须为 发行日 ≤ 结算日 < 到期日', '请确认 issue ≤ settlement < maturity。');
  }
  const A = yearFraction(basis as DayCountBasis, issue, maturity);
  const B = yearFraction(basis as DayCountBasis, settlement, maturity);
  const E = yearFraction(basis as DayCountBasis, issue, settlement);
  if (B <= 0) return numErr('年分数非正', '日期区间无效。');
  if (pr <= 0) return numErr('价格必须 > 0', 'pr 须为正。');
  const denom = pr + 100 * rate * E;
  if (denom <= 0) return numErr('收益算不出来', '请检查价格与票面率。');
  const yld = ((100 + 100 * rate * A) / denom - 1) / B;
  if (!Number.isFinite(yld)) {
    return numErr('到期收益算不出来', '请检查参数。');
  }
  return ok(yld, formatNumber(yld));
};

/* ===================== ODDFPRICE / ODDFYIELD ===================== */

/** 奇首期债券价格（短/长首期统一用准票息日程近似） */
function oddfPrice(
  settlement: YMD,
  maturity: YMD,
  issue: YMD,
  firstCoupon: YMD,
  rate: number,
  yld: number,
  redemption: number,
  freq: number,
  basis: number,
): number {
  const m = 12 / freq;
  // 准票息周期长度（以 issue→firstCoupon 这段为准）
  const E = dayCount(basis as DayCountBasis, issue, addMonths(issue, m));
  // 首期奇段：issue → firstCoupon 的实际天数
  const DFC = dayCount(basis as DayCountBasis, issue, firstCoupon);
  // 结算日到下一票息日（firstCoupon 起之后的常规票息）
  const Nq = Math.max(0, Math.floor((ser(settlement) - ser(firstCoupon)) / (E || 1)));
  const nextReg = addMonths(firstCoupon, Nq * m);
  const DSC = dayCount(basis as DayCountBasis, settlement, nextReg);
  // 距 maturity 的常规票息期数（含末期的奇段）
  const N = Math.max(1, Math.ceil(dayCount(basis as DayCountBasis, firstCoupon, maturity) / (E || 1) + 1e-9));
  const f = freq;
  let price = 0;
  for (let k = 1; k <= N; k += 1) {
    const cf = k === N ? 100 * rate / f + 100 : 100 * rate / f;
    const exp = (k - 1) + DSC / E;
    price += cf / Math.pow(1 + yld / f, exp);
  }
  // 首期奇段应计：issue→settlement 占首段比例
  const A = dayCount(basis as DayCountBasis, issue, settlement);
  price -= 100 * rate / f * (DFC / E) * (Math.min(1, A / (DFC || 1)));
  return price;
}

export const oddfpriceCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const issue = parseDateArg(ctx.args.issue);
  const first = parseDateArg(ctx.args.first);
  const rate = toNumber(ctx.args.rate);
  const yld = toNumber(ctx.args.yld);
  const redemption = toNumber(ctx.args.redemption);
  const freq = toNumber(ctx.args.frequency);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || !issue || !first || rate === null || yld === null || redemption === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认各日期合法、利率/收益率/赎回价/频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (!(ser(maturity) > ser(first) && ser(first) > ser(settlement) && ser(settlement) > ser(issue))) {
    return numErr('日期顺序须为 发行日 < 结算日 < 首息日 < 到期日', '请确认 issue < settlement < first_coupon < maturity。');
  }
  if (rate < 0 || yld < 0) {
    return numErr('票面率/收益率不能为负', 'rate 与 yld 必须 ≥ 0。');
  }
  const price = oddfPrice(settlement, maturity, issue, first, rate, yld, redemption, freq, basis);
  if (!Number.isFinite(price)) {
    return numErr('奇首期价格算不出来', '请检查参数。');
  }
  return ok(price, formatNumber(price));
};

export const oddfyieldCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const issue = parseDateArg(ctx.args.issue);
  const first = parseDateArg(ctx.args.first);
  const rate = toNumber(ctx.args.rate);
  const pr = toNumber(ctx.args.pr);
  const redemption = toNumber(ctx.args.redemption);
  const freq = toNumber(ctx.args.frequency);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || !issue || !first || rate === null || pr === null || redemption === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认各日期合法、利率/价格/赎回价/频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (!(ser(maturity) > ser(first) && ser(first) > ser(settlement) && ser(settlement) > ser(issue))) {
    return numErr('日期顺序须为 发行日 < 结算日 < 首息日 < 到期日', '请确认 issue < settlement < first_coupon < maturity。');
  }
  if (rate < 0 || pr <= 0) {
    return numErr('票面率不能为负、价格必须 > 0', 'rate ≥ 0，pr > 0。');
  }
  const priceFn = (y: number): number =>
    oddfPrice(settlement, maturity, issue, first, rate, y, redemption, freq, basis);
  const y = solveYield(priceFn, pr);
  if (y === null || !Number.isFinite(y) || y < -1) {
    return numErr('奇首期收益迭代不收敛或无解', '请检查价格/票面率/频率。');
  }
  return ok(y, formatNumber(y));
};

/* ===================== ODDLPRICE / ODDLYIELD ===================== */

/** 奇末期债券价格（短/长期末统一用准票息日程近似） */
function oddlPrice(
  settlement: YMD,
  maturity: YMD,
  lastInterest: YMD,
  rate: number,
  yld: number,
  redemption: number,
  freq: number,
  basis: number,
): number {
  const m = 12 / freq;
  const E = dayCount(basis as DayCountBasis, lastInterest, addMonths(lastInterest, m));
  const A = dayCount(basis as DayCountBasis, lastInterest, settlement);
  const DSC = dayCount(basis as DayCountBasis, settlement, maturity);
  const N = Math.max(1, Math.ceil(dayCount(basis as DayCountBasis, lastInterest, maturity) / (E || 1) + 1e-9));
  const f = freq;
  let price = 0;
  for (let k = 1; k <= N; k += 1) {
    const cf = k === N ? 100 * rate / f + 100 : 100 * rate / f;
    const exp = (k - 1) + DSC / E;
    price += cf / Math.pow(1 + yld / f, exp);
  }
  price -= 100 * rate / f * (A / E);
  return price;
}

export const oddlpriceCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const last = parseDateArg(ctx.args.last);
  const rate = toNumber(ctx.args.rate);
  const yld = toNumber(ctx.args.yld);
  const redemption = toNumber(ctx.args.redemption);
  const freq = toNumber(ctx.args.frequency);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || !last || rate === null || yld === null || redemption === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认各日期合法、利率/收益率/赎回价/频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (!(ser(maturity) > ser(settlement) && ser(settlement) > ser(last))) {
    return numErr('日期顺序须为 末息日 < 结算日 < 到期日', '请确认 last_interest < settlement < maturity。');
  }
  if (rate < 0 || yld < 0) {
    return numErr('票面率/收益率不能为负', 'rate 与 yld 必须 ≥ 0。');
  }
  const price = oddlPrice(settlement, maturity, last, rate, yld, redemption, freq, basis);
  if (!Number.isFinite(price)) {
    return numErr('奇末期价格算不出来', '请检查参数。');
  }
  return ok(price, formatNumber(price));
};

export const oddlyieldCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const settlement = parseDateArg(ctx.args.settlement);
  const maturity = parseDateArg(ctx.args.maturity);
  const last = parseDateArg(ctx.args.last);
  const rate = toNumber(ctx.args.rate);
  const pr = toNumber(ctx.args.pr);
  const redemption = toNumber(ctx.args.redemption);
  const freq = toNumber(ctx.args.frequency);
  const basis = basisArg(ctx.args.basis);
  if (!settlement || !maturity || !last || rate === null || pr === null || redemption === null || freq === null || basis === null) {
    return valueErr('有参数不是合法数字或日期', '请确认各日期合法、利率/价格/赎回价/频率为数字。');
  }
  if (freq !== 1 && freq !== 2 && freq !== 4) {
    return numErr('频率只能是 1/2/4', 'frequency 填 1/2/4。');
  }
  if (!(ser(maturity) > ser(settlement) && ser(settlement) > ser(last))) {
    return numErr('日期顺序须为 末息日 < 结算日 < 到期日', '请确认 last_interest < settlement < maturity。');
  }
  if (rate < 0 || pr <= 0) {
    return numErr('票面率不能为负、价格必须 > 0', 'rate ≥ 0，pr > 0。');
  }
  const priceFn = (y: number): number =>
    oddlPrice(settlement, maturity, last, rate, y, redemption, freq, basis);
  const y = solveYield(priceFn, pr);
  if (y === null || !Number.isFinite(y) || y < -1) {
    return numErr('奇末期收益迭代不收敛或无解', '请检查价格/票面率/频率。');
  }
  return ok(y, formatNumber(y));
};
