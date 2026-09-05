import type { CalcContext, CalcHandler, CalcOutcome, CellValue } from '@/types';
import { ERROR_CODES, explain } from '@/core/errors';
import { columnOf, sliceSheet } from '@/core/ref';
import { fail, ok } from './types';

/**
 * VLOOKUP 试算实现（自研纯函数，ADR-A1）。
 *
 * 覆盖的错误复现（PRD §10.4 ①）：
 * ① 第 4 参数 = 1 且首列未排序 → **不报错但查出来是别人**（用 warning 表达静默错误）
 * ② 第 3 参数超出区域列数 → #REF!
 * ③ 查找值不存在 → #N/A
 * ④ 区域没加 $ 下拉跑偏 → #N/A
 * ⑤ 数字存成文本 / 带前后空格 → #N/A
 * ⑥ 第 3 参数 = 0 → #VALUE!
 */

/** 比较两个单元格值：都能当数字就按数字比，否则按文本比（大小写不敏感） */
function compare(a: CellValue, b: CellValue): number {
  const an = typeof a === 'number' ? a : Number(a);
  const bn = typeof b === 'number' ? b : Number(b);
  const aIsNum = a !== null && a !== '' && Number.isFinite(an);
  const bIsNum = b !== null && b !== '' && Number.isFinite(bn);

  if (aIsNum && bIsNum) {
    return an === bn ? 0 : an < bn ? -1 : 1;
  }
  const as = a === null ? '' : String(a).trim().toLowerCase();
  const bs = b === null ? '' : String(b).trim().toLowerCase();
  return as === bs ? 0 : as < bs ? -1 : 1;
}

/**
 * 精确匹配用比较：查找值**保留前后空格**，不再 trim。
 * 复现 Excel 的坑：系统导出的数据常带看不见的空格，" A002 " 和 "A002" 就是不一样，
 * 精确匹配查不到就应返回 #N/A（PRD §10.4 ⑤）。
 */
function compareExact(a: CellValue, b: string): number {
  const an = typeof a === 'number' ? a : Number(a);
  const bn = Number(b);
  const aIsNum = a !== null && a !== '' && Number.isFinite(an);
  const bIsNum = b !== '' && Number.isFinite(bn);
  if (aIsNum && bIsNum) {
    return an === bn ? 0 : an < bn ? -1 : 1;
  }
  const as = a === null ? '' : String(a).trim().toLowerCase();
  const bs = b.toLowerCase();
  return as === bs ? 0 : as < bs ? -1 : 1;
}

/** 精确匹配：返回第一个命中的下标，找不到返回 -1 */
function findExact(list: CellValue[], target: string): number {
  return list.findIndex((value) => compareExact(value, target) === 0);
}

/**
 * 模糊匹配（二分查找）。
 * 刻意**不校验排序** —— 这正是「静默错误」的来源：
 * 数据没排序时它会跳着比，返回一个看起来找到了的值，并且不报任何错。
 * 返回 -1 表示目标比所有值都小（Excel 此时报 #N/A）。
 */
function findApprox(list: CellValue[], target: string): number {
  let lo = 0;
  let hi = list.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = compare(list[mid], target);
    if (cmp === 0) {
      return mid;
    }
    if (cmp < 0) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return hi;
}

/** 判断一列是不是按升序排好的（用于给出「没排序」的静默错误提示） */
function isAscending(list: CellValue[]): boolean {
  for (let i = 1; i < list.length; i += 1) {
    if (compare(list[i - 1], list[i]) > 0) {
      return false;
    }
  }
  return true;
}

export const vlookupCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;

  // 注意：查找值**不 trim**，保留前后空格才能复现「带空格查不到 → #N/A」
  const lookupValue = args.lookup_value ?? '';
  const rangeRef = (args.table_array ?? '').trim() || spec.ranges.table_array || '';
  const colRaw = (args.col_index_num ?? '').trim();
  const modeRaw = (args.range_lookup ?? '0').trim();

  // ---------- 1. 校验查找区域 ----------
  const table = sliceSheet(sheet, rangeRef);
  if (table === null || table.header.length === 0) {
    return fail(explain('vlookup', ERROR_CODES.REF, 'bad_range'));
  }
  if (table.rows.length === 0) {
    return fail(explain('vlookup', ERROR_CODES.NA, 'empty_range'));
  }

  const colCount = table.header.length;

  // ---------- 2. 校验第 3 参数 ----------
  if (colRaw === '') {
    return fail(explain('vlookup', ERROR_CODES.VALUE, 'bad_col'));
  }
  const colIndex = Number(colRaw);
  if (!Number.isInteger(colIndex)) {
    return fail(explain('vlookup', ERROR_CODES.VALUE, 'bad_col'));
  }
  if (colIndex < 1) {
    return fail(explain('vlookup', ERROR_CODES.VALUE, 'col_zero'));
  }
  if (colIndex > colCount) {
    return fail(explain('vlookup', ERROR_CODES.REF, 'col_out_of_range'));
  }

  // ---------- 3. 查找 ----------
  const firstColumn = columnOf(table, 0);
  const approximate = modeRaw === '1' || modeRaw.toLowerCase() === 'true';

  let index = -1;
  let warning = '';

  if (approximate) {
    index = findApprox(firstColumn, lookupValue);
    if (index < 0) {
      return fail(explain('vlookup', ERROR_CODES.NA, 'not_found'));
    }
    const exactIndex = findExact(firstColumn, lookupValue);
    if (exactIndex < 0) {
      warning =
        'Excel 不会报错，但这个值可能是错的：模糊匹配（第 4 参数填 1 或省略）返回的是「小于等于查找值的最后一个」，不是和你要的一模一样的那个。日常请永远填 0。';
    }
    if (exactIndex < 0 && !isAscending(firstColumn)) {
      warning =
        'Excel 不会报错，但这个值可能是错的：模糊匹配要求首列已按升序排序，现在这列没排序，返回的结果完全不可信。日常请永远填 0。';
    }
  } else {
    index = findExact(firstColumn, lookupValue);
    if (index < 0) {
      return fail(explain('vlookup', ERROR_CODES.NA, 'not_found'));
    }
  }

  const row = table.rows[index];
  const value = row === undefined ? null : (row[colIndex - 1] ?? null);
  return ok(value, undefined, warning);
};
