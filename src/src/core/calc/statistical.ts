import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, explain } from '@/core/errors';
import { columnOf, sliceSheet } from '@/core/ref';
import {
  avgValues,
  countNonBlank,
  countNumbers,
  formatNumber,
  maxValues,
  minValues,
  toNumber,
} from './helpers';
import { fail, ok } from './types';
import { parseCriterion, type Criterion } from './criteria';

/**
 * 统计类 9 个函数的试算实现（纯函数，零 DOM）。
 *
 * 条件解析（COUNTIF / COUNTIFS / AVERAGEIF / AVERAGEIFS）统一走
 * src/core/calc/criteria.ts 的 parseCriterion(raw, sheet)，与已上线的 SUMIFS 一致。
 *
 * 各函数语义见 src/data/packs/statistical.ts 的 examples[0].dataTsv：
 *  - count / counta / average 用 SCORE_TSV（姓名,成绩，5 行，B=成绩）
 *  - countif / countifs / averageif / averageifs 用 STATUS_TSV（姓名,成绩,状态，5 行，B=成绩,C=状态）
 *  - max / min 用 EXTREME_TSV（姓名,成绩，5 行，B=成绩）
 */

/** 切一片区域并取第一列；区域非法 → 返回失败结果（#REF!），否则返回列数据 */
function sliceColumn(
  sheet: Sheet,
  ref: string,
  fnId: string,
): { column: CellValue[]; fail: CalcOutcome | null } {
  const block = sliceSheet(sheet, ref.trim());
  if (block === null || block.header.length === 0) {
    return { column: [], fail: fail(explain(fnId, ERROR_CODES.REF, 'bad_range')) };
  }
  return { column: columnOf(block, 0), fail: null };
}

/** 把若干 (条件列, 条件) 逐一解析；任一带引号错误 → #NAME?，区域行数不一致 → #VALUE! */
function buildCriteria(
  sheet: Sheet,
  pairs: Array<{ rangeRef: string; criteria: string }>,
  fnId: string,
): { criteria: Criterion[]; fail: CalcOutcome | null; rowCount: number } {
  const criteria: Criterion[] = [];
  let rowCount = 0;
  let first = true;

  for (const pair of pairs) {
    if (pair.criteria.trim() === '') {
      continue; // 第二对可选，空则跳过
    }
    const sliced = sliceColumn(sheet, pair.rangeRef, fnId);
    if (sliced.fail !== null) {
      return { criteria, fail: sliced.fail, rowCount };
    }
    const column = sliced.column;
    if (first) {
      rowCount = column.length;
      first = false;
    } else if (column.length !== rowCount) {
      return {
        criteria,
        fail: fail(explain(fnId, ERROR_CODES.VALUE, 'row_mismatch')),
        rowCount,
      };
    }

    const criterion = parseCriterion(pair.criteria, sheet);
    if (criterion.failure !== null) {
      return { criteria, fail: fail(criterion.failure), rowCount };
    }
    criteria.push({ ...criterion, raw: pair.criteria, column });
  }

  return { criteria, fail: null, rowCount };
}

/* ============================ COUNT ============================ */

export const countCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const ref = (args.range ?? '').trim() || '';
  const sliced = sliceColumn(sheet, ref, 'count');
  if (sliced.fail !== null) {
    return sliced.fail;
  }
  const n = countNumbers(sliced.column);
  return ok(n, formatNumber(n));
};

/* ============================ COUNTA ============================ */

export const countaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const ref = (args.range ?? '').trim() || '';
  const sliced = sliceColumn(sheet, ref, 'counta');
  if (sliced.fail !== null) {
    return sliced.fail;
  }
  const n = countNonBlank(sliced.column);
  return ok(n, formatNumber(n));
};

/* ============================ COUNTIF ============================ */

export const countifCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const ref = (args.range ?? '').trim() || '';
  const sliced = sliceColumn(sheet, ref, 'countif');
  if (sliced.fail !== null) {
    return sliced.fail;
  }
  const column = sliced.column;

  const criterion = parseCriterion(args.criteria ?? '', sheet);
  if (criterion.failure !== null) {
    return fail(criterion.failure);
  }

  let matched = 0;
  for (const cell of column) {
    if (criterion.test(cell ?? null)) {
      matched += 1;
    }
  }
  return ok(matched, formatNumber(matched));
};

/* ============================ COUNTIFS（2 对简化） ============================ */

export const countifsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const built = buildCriteria(sheet, [
    { rangeRef: (args.range1 ?? '').trim(), criteria: args.criteria1 ?? '' },
    { rangeRef: (args.range2 ?? '').trim(), criteria: args.criteria2 ?? '' },
  ], 'countifs');
  if (built.fail !== null) {
    return built.fail;
  }

  let matched = 0;
  for (let i = 0; i < built.rowCount; i += 1) {
    let pass = true;
    for (const criterion of built.criteria) {
      if (!criterion.test(criterion.column[i] ?? null)) {
        pass = false;
        break;
      }
    }
    if (pass) {
      matched += 1;
    }
  }
  return ok(matched, formatNumber(matched));
};

/* ============================ AVERAGE ============================ */

export const averageCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const ref = (args.range ?? '').trim() || '';
  const sliced = sliceColumn(sheet, ref, 'average');
  if (sliced.fail !== null) {
    return sliced.fail;
  }
  const result = avgValues(sliced.column);
  if (result === null) {
    return fail(explain('average', ERROR_CODES.DIV0, 'no_numbers'));
  }
  return ok(result, formatNumber(result));
};

/* ============================ AVERAGEIF ============================ */

export const averageifCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;

  const condSliced = sliceColumn(sheet, (args.range ?? '').trim(), 'averageif');
  if (condSliced.fail !== null) {
    return condSliced.fail;
  }
  const condColumn = condSliced.column;

  const avgRef =
    (args.average_range ?? '').trim() || spec.ranges.average_range || (args.range ?? '').trim();
  const avgSliced = sliceColumn(sheet, avgRef, 'averageif');
  if (avgSliced.fail !== null) {
    return avgSliced.fail;
  }
  const avgColumn = avgSliced.column;
  if (avgColumn.length !== condColumn.length) {
    return fail(explain('averageif', ERROR_CODES.VALUE, 'row_mismatch'));
  }

  const criterion = parseCriterion(args.criteria ?? '', sheet);
  if (criterion.failure !== null) {
    return fail(criterion.failure);
  }

  let sum = 0;
  let count = 0;
  for (let i = 0; i < condColumn.length; i += 1) {
    if (criterion.test(condColumn[i] ?? null)) {
      const num = toNumber(avgColumn[i]);
      if (num !== null) {
        sum += num;
        count += 1;
      }
    }
  }
  if (count === 0) {
    return fail(explain('averageif', ERROR_CODES.DIV0, 'no_match'));
  }
  const result = sum / count;
  return ok(result, formatNumber(result));
};

/* ============================ AVERAGEIFS（2 条件简化，avg_range 在最前） ============================ */

export const averageifsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const avgSliced = sliceColumn(sheet, (args.average_range ?? '').trim(), 'averageifs');
  if (avgSliced.fail !== null) {
    return avgSliced.fail;
  }
  const avgColumn = avgSliced.column;
  const rowCount = avgColumn.length;

  const built = buildCriteria(sheet, [
    { rangeRef: (args.criteria_range1 ?? '').trim(), criteria: args.criteria1 ?? '' },
    { rangeRef: (args.criteria_range2 ?? '').trim(), criteria: args.criteria2 ?? '' },
  ], 'averageifs');
  if (built.fail !== null) {
    return built.fail;
  }
  // 每个条件区域都要和求平均区域行数一致
  for (const criterion of built.criteria) {
    if (criterion.column.length !== rowCount) {
      return fail(explain('averageifs', ERROR_CODES.VALUE, 'row_mismatch'));
    }
  }

  let sum = 0;
  let count = 0;
  for (let i = 0; i < rowCount; i += 1) {
    let pass = true;
    for (const criterion of built.criteria) {
      if (!criterion.test(criterion.column[i] ?? null)) {
        pass = false;
        break;
      }
    }
    if (pass) {
      const num = toNumber(avgColumn[i]);
      if (num !== null) {
        sum += num;
        count += 1;
      }
    }
  }
  if (count === 0) {
    return fail(explain('averageifs', ERROR_CODES.DIV0, 'no_match'));
  }
  const result = sum / count;
  return ok(result, formatNumber(result));
};

/* ============================ MAX ============================ */

export const maxCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const ref = (args.range ?? '').trim() || '';
  const sliced = sliceColumn(sheet, ref, 'max');
  if (sliced.fail !== null) {
    return sliced.fail;
  }
  const result = maxValues(sliced.column);
  if (result === null) {
    return ok(0); // 区域无数字 → 空集合，Excel 返回 0
  }
  return ok(result, formatNumber(result));
};

/* ============================ MIN ============================ */

export const minCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const ref = (args.range ?? '').trim() || '';
  const sliced = sliceColumn(sheet, ref, 'min');
  if (sliced.fail !== null) {
    return sliced.fail;
  }
  const result = minValues(sliced.column);
  if (result === null) {
    return ok(0); // 区域无数字 → 空集合，Excel 返回 0
  }
  return ok(result, formatNumber(result));
};
