import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok } from './types';
import { formatNumber, toNumber } from './helpers';

/**
 * 财务类 TVM（货币时间价值）5 个函数的在线试算 handler。
 *
 * 全部按标准 Excel 公式实现；type: 0 = 期末（默认），1 = 期初。
 * 所有金额参数统一用 toNumber 转数字；非数字 → #VALUE!。
 *
 * 错误码约定（来自契约）：
 * - 参数非数字 → #VALUE!
 * - 除以 0（rate=0 且 nper=0 / nper=0 等）→ #DIV/0!
 * - 数值算不出来（非有限数 / 迭代不收敛 / nper<=0）→ #NUM!
 */

function valueErr(): CalcOutcome {
  return fail(
    make(ERROR_CODES.VALUE, '有参数不是合法数字', '请确认利率、期数、金额等都填了正确的数字（不要填文本或留空）。'),
  );
}

function div0Err(reason: string, fix: string): CalcOutcome {
  return fail(make(ERROR_CODES.DIV0, reason, fix));
}

function numErr(reason: string, fix: string): CalcOutcome {
  return fail(make(ERROR_CODES.NUM, reason, fix));
}

/** 取可选的 fv / pv 参数：省略或空串按 0 处理 */
function optNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') {
    return 0;
  }
  return toNumber(raw);
}

function optType(raw: string | undefined): number {
  return toNumber(raw ?? '') === 1 ? 1 : 0;
}

export const pmtCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const nper = toNumber(args.nper);
  const pv = toNumber(args.pv);
  const fv = optNumber(args.fv);
  const type = optType(args.type);
  if (rate === null || nper === null || pv === null || fv === null) {
    return valueErr();
  }
  if (nper === 0) {
    return div0Err('期数为 0，没法算每期付款', '期数（nper）必须 > 0，请检查还款/存款总期数。');
  }
  let val: number;
  if (rate === 0) {
    val = -(pv + fv) / nper;
  } else {
    const pow = Math.pow(1 + rate, nper);
    // Excel 口径：贷款（pv 为正）的每期付款是负数（现金流出）
    val = -(rate * (fv + pv * pow)) / ((1 + rate * type) * (pow - 1));
  }
  if (!Number.isFinite(val)) {
    return numErr('算出来的每期付款不是有效数字', '请检查利率、期数、本金是否填得过大或不合理。');
  }
  return ok(val, formatNumber(val));
};

export const pvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const nper = toNumber(args.nper);
  const pmt = toNumber(args.pmt);
  const fv = optNumber(args.fv);
  const type = optType(args.type);
  if (rate === null || nper === null || pmt === null || fv === null) {
    return valueErr();
  }
  if (rate === 0 && nper === 0) {
    return div0Err('利率和期数都是 0，现值算不出来', '利率与期数不能同时为 0，请至少填一个非零值。');
  }
  let val: number;
  if (rate === 0) {
    val = -(fv + pmt * nper);
  } else {
    const pow = Math.pow(1 + rate, nper);
    val = (-(fv + pmt * (1 + rate * type) * (pow - 1) / rate)) / pow;
  }
  if (!Number.isFinite(val)) {
    return numErr('算出来的现值不是有效数字', '请检查利率、期数、每期付款是否填得过大或不合理。');
  }
  return ok(val, formatNumber(val));
};

export const fvCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const nper = toNumber(args.nper);
  const pmt = toNumber(args.pmt);
  const pv = optNumber(args.pv);
  const type = optType(args.type);
  if (rate === null || nper === null || pmt === null || pv === null) {
    return valueErr();
  }
  if (rate === 0 && nper === 0) {
    return div0Err('利率和期数都是 0，终值算不出来', '利率与期数不能同时为 0，请至少填一个非零值。');
  }
  let val: number;
  if (rate === 0) {
    val = -(pv + pmt * nper);
  } else {
    const pow = Math.pow(1 + rate, nper);
    val = -(pv * pow + pmt * (1 + rate * type) * (pow - 1) / rate);
  }
  if (!Number.isFinite(val)) {
    return numErr('算出来的终值不是有效数字', '请检查利率、期数、每期存款是否填得过大或不合理。');
  }
  return ok(val, formatNumber(val));
};

export const nperCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const rate = toNumber(args.rate);
  const pmt = toNumber(args.pmt);
  const pv = toNumber(args.pv);
  const fv = optNumber(args.fv);
  const type = optType(args.type);
  if (rate === null || pmt === null || pv === null || fv === null) {
    return valueErr();
  }
  let val: number;
  if (rate === 0) {
    if (pmt === 0) {
      return div0Err('利率和每期付款都是 0，期数算不出来', '利率与每期付款不能同时为 0，请至少填一个非零值。');
    }
    val = -(pv + fv) / pmt;
  } else {
    const t = 1 + rate * type;
    const denom = pv * rate + pmt * t;
    if (denom === 0) {
      return div0Err('分母为 0，期数算不出来', '当前利率/付款组合无解，请调整参数。');
    }
    const ratio = (pmt * t - fv * rate) / denom;
    if (!(ratio > 0)) {
      return numErr('对数里出现了非正数，期数无解', '请确认现金流方向（pmt 与 fv 一正一负），让方程有实数解。');
    }
    val = Math.log(ratio) / Math.log(1 + rate);
  }
  if (!Number.isFinite(val)) {
    return numErr('算出来的期数不是有效数字', '请检查利率、付款、现值是否填得不合理。');
  }
  return ok(val, formatNumber(val));
};

export const rateCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const nper = toNumber(args.nper);
  const pmt = toNumber(args.pmt);
  const pv = toNumber(args.pv);
  const fv = optNumber(args.fv);
  const type = optType(args.type);
  const guessRaw = args.guess;
  const guess = guessRaw === undefined || guessRaw === '' ? 0.1 : toNumber(guessRaw);
  if (nper === null || pmt === null || pv === null || fv === null || guess === null) {
    return valueErr();
  }
  if (nper <= 0) {
    return numErr('期数必须 > 0 才能反算利率', 'nper 填正整数（总还款/存款期数）。');
  }

  // 让 Excel 方程 f(r) = pv*(1+r)^n + pmt*(1+r*type)*((1+r)^n - 1)/r + fv = 0
  const f = (r: number): number => {
    if (r === -1) {
      return NaN;
    }
    if (r === 0) {
      // 极限式：pv + pmt*nper*(1+rate*type)[rate=0 ⇒ 1] + fv
      return pv + pmt * nper * (1 + 0 * type) + fv;
    }
    const pow = Math.pow(1 + r, nper);
    return pv * pow + pmt * (1 + r * type) * (pow - 1) / r + fv;
  };

  let r = guess;
  let converged = false;
  for (let i = 0; i < 50; i += 1) {
    const fr = f(r);
    if (!Number.isFinite(fr)) {
      break;
    }
    if (Math.abs(fr) < 1e-9) {
      converged = true;
      break;
    }
    const h = 1e-8;
    const fp = (f(r + h) - f(r - h)) / (2 * h);
    if (!Number.isFinite(fp) || fp === 0) {
      break;
    }
    const next = r - fr / fp;
    if (!Number.isFinite(next)) {
      break;
    }
    if (Math.abs(next - r) < 1e-12) {
      r = next;
      converged = true;
      break;
    }
    r = next;
  }

  if (!converged || !Number.isFinite(r) || Math.abs(f(r)) >= 1e-9) {
    return numErr('利率迭代不收敛或无解', '请确认 pmt 与 pv 一正一负、nper>0，或换个 guess 再试。');
  }
  return ok(r, formatNumber(r));
};
