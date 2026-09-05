import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { cellValue, sliceSheet, columnOf } from '@/core/ref';
import { isNumeric } from '@/core/tsv';
import { fail, ok, stripQuotes } from './types';
import {
  formatNumber,
  roundDown,
  roundHalfUp,
  roundUp,
  sumValues,
  toNumber,
} from './helpers';
import { parseCriterion } from './criteria';

/**
 * 数学类 7 个函数的在线试算实现（ADR-A1）：
 *   sum / sumif / sumproduct / round / roundup / rounddown / int
 *
 * 共享设施：
 * - ok / fail / stripQuotes 来自 ./types
 * - ERROR_CODES / make 来自 @/core/errors
 * - sliceSheet / columnOf / cellValue 来自 @/core/ref
 * - sumValues / toNumber / formatNumber / roundHalfUp / roundUp / roundDown 来自 ./helpers
 * - SUMIF 条件一律走 @/core/calc/criteria 的 parseCriterion
 *
 * 错误复现（对照各函数的 pitfalls）：
 * - sum        区域非法 → #REF!
 * - sumif      条件未带引号 → #NAME?（parseCriterion 的 failure）；条件/求和区域行数不一致 → #VALUE!；区域非法 → #REF!
 * - sumproduct 两组数组大小不一致 → #VALUE!；区域含文本 → #VALUE!；区域非法 → #REF!
 * - round/up/down/int 数字或位数非数字 → #VALUE!
 */

/** 把一个「区域引用」切成子表；非法 / 越界列 / 空表头一律视为 #REF! */
function refBlock(sheet: Sheet, ref: string): Sheet | null {
  const block = sliceSheet(sheet, ref);
  if (block === null || block.header.length === 0 || block.header.includes('')) {
    return null;
  }
  return block;
}

/** 解析 number 类参数：若像单元格引用则取该格的值，否则按字面数字处理 */
function resolveNumber(raw: string, sheet: Sheet): number | null {
  const { inner } = stripQuotes(raw);
  const trimmed = inner.trim();
  if (trimmed !== '' && /^[A-Za-z]+\d+$/.test(trimmed)) {
    return toNumber(cellValue(sheet, trimmed));
  }
  return toNumber(trimmed);
}

/* ===================== SUM · 求和 ===================== */
export const sumCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;
  const ref = (args.range ?? '').trim() || spec.ranges.range || '';
  const block = refBlock(sheet, ref);
  if (block === null) {
    return fail(
      make(ERROR_CODES.REF, '求和区域的写法不是 Excel 认识的引用（正确写法如 F2:F13）。',
        '区域写成「左上角:右下角」的形式，如 F2:F13。'),
    );
  }
  const total = sumValues(columnOf(block, 0));
  return ok(total, formatNumber(total));
};

/* ===================== SUMIF · 条件求和 ===================== */
export const sumifCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;

  const rangeRef = (args.range ?? '').trim() || spec.ranges.range || '';
  const rangeBlock = refBlock(sheet, rangeRef);
  if (rangeBlock === null) {
    return fail(
      make(ERROR_CODES.REF, '条件区域的写法不是 Excel 认识的引用（正确写法如 C2:C13）。',
        '区域写成「左上角:右下角」的形式，如 C2:C13。'),
    );
  }
  const rangeCol = columnOf(rangeBlock, 0);

  const criteriaRaw = args.criteria ?? '';
  const criterion = parseCriterion(criteriaRaw, sheet);
  if (criterion.failure !== null) {
    return fail(criterion.failure);
  }

  const sumRef = (args.sum_range ?? '').trim();
  let sumCol: CellValue[];
  if (sumRef === '') {
    sumCol = rangeCol; // 省略求和区域 → Excel 默认加条件列本身
  } else {
    const sumBlock = refBlock(sheet, sumRef);
    if (sumBlock === null) {
      return fail(
        make(ERROR_CODES.REF, '求和区域的写法不是 Excel 认识的引用（正确写法如 F2:F13）。',
          '区域写成「左上角:右下角」的形式，如 F2:F13。'),
      );
    }
    sumCol = columnOf(sumBlock, 0);
  }

  if (sumCol.length !== rangeCol.length) {
    return fail(
      make(ERROR_CODES.VALUE, '条件区域和求和区域行数不一致，Excel 不知道该拿哪一行去对应哪一行。',
        '把两个区域框成同样的行数，比如统一 C2:C13 与 F2:F13（都是 12 行）。'),
    );
  }

  let total = 0;
  for (let i = 0; i < rangeCol.length; i += 1) {
    if (criterion.test(rangeCol[i] ?? null)) {
      const num = toNumber(sumCol[i]);
      if (num !== null) {
        total += num;
      }
    }
  }
  return ok(total, formatNumber(total), criterion.warning !== '' ? criterion.warning : undefined);
};

/* ===================== SUMPRODUCT · 乘积和 ===================== */
export const sumproductCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;

  const ref1 = (args.array1 ?? '').trim() || spec.ranges.array1 || '';
  const ref2 = (args.array2 ?? '').trim() || spec.ranges.array2 || '';
  const block1 = refBlock(sheet, ref1);
  if (block1 === null) {
    return fail(
      make(ERROR_CODES.REF, '数组1 的区域写法不是 Excel 认识的引用（正确写法如 B2:B5）。',
        '区域写成「左上角:右下角」的形式，如 B2:B5。'),
    );
  }
  const block2 = refBlock(sheet, ref2);
  if (block2 === null) {
    return fail(
      make(ERROR_CODES.REF, '数组2 的区域写法不是 Excel 认识的引用（正确写法如 C2:C5）。',
        '区域写成「左上角:右下角」的形式，如 C2:C5。'),
    );
  }
  const col1 = columnOf(block1, 0);
  const col2 = columnOf(block2, 0);

  if (col1.length !== col2.length) {
    return fail(
      make(ERROR_CODES.VALUE, '两组数组的行数必须完全一致，才能逐行对应相乘。',
        '把所有数组框成一样的范围，如统一 B2:B5 与 C2:C5。'),
    );
  }

  let total = 0;
  for (let i = 0; i < col1.length; i += 1) {
    const v1 = col1[i];
    const v2 = col2[i];
    if (typeof v1 === 'string' && v1.trim() !== '' && !isNumeric(v1)) {
      return fail(
        make(ERROR_CODES.VALUE, '参与运算的区域里混进了文本，SUMPRODUCT 不像 SUMIFS 那样自动忽略文本，直接报错。',
          '先用「分列」或 VALUE() 把文本转成数字，确认区域是纯数字再算。'),
      );
    }
    if (typeof v2 === 'string' && v2.trim() !== '' && !isNumeric(v2)) {
      return fail(
        make(ERROR_CODES.VALUE, '参与运算的区域里混进了文本，SUMPRODUCT 不像 SUMIFS 那样自动忽略文本，直接报错。',
          '先用「分列」或 VALUE() 把文本转成数字，确认区域是纯数字再算。'),
      );
    }
    const n1 = toNumber(v1);
    const n2 = toNumber(v2);
    if (n1 !== null && n2 !== null) {
      total += n1 * n2;
    }
  }
  return ok(total, formatNumber(total));
};

/* ===================== ROUND · 四舍五入 ===================== */
export const roundCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要四舍五入的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const digits = toNumber(args.digits ?? '');
  if (digits === null || !Number.isInteger(digits)) {
    return fail(
      make(ERROR_CODES.VALUE, '保留位数（第 2 参数）必须是一个整数。',
        '位数填整数：2 留两位、0 到个位、-2 到百位。'),
    );
  }
  const result = roundHalfUp(n, digits);
  return ok(result, formatNumber(result));
};

/* ===================== ROUNDUP · 向上舍入 ===================== */
export const roundupCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要向上舍入的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const digits = toNumber(args.digits ?? '');
  if (digits === null || !Number.isInteger(digits)) {
    return fail(
      make(ERROR_CODES.VALUE, '保留位数（第 2 参数）必须是一个整数。',
        '位数填整数：2 留两位、0 到个位、-2 到百位。'),
    );
  }
  const result = roundUp(n, digits);
  return ok(result, formatNumber(result));
};

/* ===================== ROUNDDOWN · 向下舍入 ===================== */
export const rounddownCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要向下舍入的数字不是有效数字（可能是文本，或引用的单元格里不是数字）。',
        '确认填的是数字或装着数字的单元格，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const digits = toNumber(args.digits ?? '');
  if (digits === null || !Number.isInteger(digits)) {
    return fail(
      make(ERROR_CODES.VALUE, '保留位数（第 2 参数）必须是一个整数。',
        '位数填整数：2 留两位、0 到个位、-2 到百位。'),
    );
  }
  const result = roundDown(n, digits);
  return ok(result, formatNumber(result));
};

/* ===================== INT · 向下取整 ===================== */
export const intCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const n = resolveNumber(args.number ?? '', sheet);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, '要取整的数字不是有效数字（INT 不像 SUM 那样宽容，文本会直接报错）。',
        '确认填的是数字或装着数字的单元格，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const result = Math.floor(n);
  return ok(result, formatNumber(result));
};
