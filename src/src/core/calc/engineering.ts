import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber } from './helpers';

/**
 * CONVERT 单位换算 handler。
 *
 * 建一张小单位表：质量（基单位 g）、长度（基单位 cm）。
 * 先把数值转到基单位，再转到目标单位。
 *
 * 错误：单位不在表里 → #N/A；质量与长度混用（不同量纲）→ #N/A；数值非数字 → #VALUE!。
 */

type UnitDef = { cat: 'mass' | 'length'; factor: number };

/** factor = 1 个该单位等于多少基单位（g 或 cm） */
const UNITS: Record<string, UnitDef> = {
  // 质量（基单位 g）
  g: { cat: 'mass', factor: 1 },
  kg: { cat: 'mass', factor: 1000 },
  lb: { cat: 'mass', factor: 453.59237 },
  oz: { cat: 'mass', factor: 28.349523125 },
  // 长度（基单位 cm）
  m: { cat: 'length', factor: 100 },
  cm: { cat: 'length', factor: 1 },
  km: { cat: 'length', factor: 100000 },
  ft: { cat: 'length', factor: 30.48 },
  in: { cat: 'length', factor: 2.54 },
  mi: { cat: 'length', factor: 160934.4 },
};

export const convertCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;

  const num = toNumber(args.number);
  if (num === null) {
    return fail(make(ERROR_CODES.VALUE, '要换算的数值不是数字', 'number 参数请填一个数字。'));
  }

  const from = stripQuotes(args.from_unit).inner.trim();
  const to = stripQuotes(args.to_unit).inner.trim();

  const fu = UNITS[from];
  const tu = UNITS[to];

  if (!fu) {
    return fail(
      make(ERROR_CODES.NA, `不认识的单位「${from}」`, '请使用内置单位缩写，如 "kg"、"lb"、"m"、"mi"、"ft"、"in"、"oz"、"km"。'),
    );
  }
  if (!tu) {
    return fail(
      make(ERROR_CODES.NA, `不认识的单位「${to}」`, '请使用内置单位缩写，如 "kg"、"lb"、"m"、"mi"、"ft"、"in"、"oz"、"km"。'),
    );
  }
  if (fu.cat !== tu.cat) {
    return fail(
      make(
        ERROR_CODES.NA,
        `「${from}」和「${to}」不是同一类单位`,
        '长度不能换质量：两者必须属于同一物理量（如都是长度 m/mi，或都是质量 kg/lb）。',
      ),
    );
  }

  const base = num * fu.factor; // 转到基单位
  const result = base / tu.factor; // 从基单位转到目标单位
  return ok(result, formatNumber(result));
};
