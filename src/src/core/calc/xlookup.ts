import type { CalcContext, CalcHandler, CalcOutcome, CellValue } from '@/types';
import { ERROR_CODES, explain } from '@/core/errors';
import { columnOf, sliceSheet } from '@/core/ref';
import { isNumeric } from '@/core/tsv';
import { fail, ok, stripQuotes } from './types';

/**
 * XLOOKUP 试算实现（自研纯函数，ADR-A1）。
 *
 * 支持 match_mode（0 精确 / -1 精确或下一个较小 / 1 精确或下一个较大 / 2 通配符）
 * 与 search_mode（1 从头 / -1 从尾 / 2 二分查找）。
 *
 * 覆盖的错误复现（PRD §10.4 ④）：
 * ① 查找列与返回列行数不一致 → #VALUE!
 * ② 在 Excel 2016 / 2019 里输入 → #NAME?（版本不支持）
 * ③ 不填第 4 参数且查不到 → #N/A
 * ④ 通配符模式查数字 → #N/A
 * ⑤ 二分查找模式但数据未排序 → 结果错且无报错（warning）
 */

/** 旧版 Excel 没有这个函数的版本代号 */
const UNSUPPORTED_VERSIONS = new Set(['2019', '2016']);

/** 比较两个单元格值 */
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

/** 一列是否按升序排好 */
function isAscending(list: CellValue[]): boolean {
  for (let i = 1; i < list.length; i += 1) {
    if (compare(list[i - 1], list[i]) > 0) {
      return false;
    }
  }
  return true;
}

/** 从头找第一个命中的下标；找不到返回 -1 */
function findFirst(list: CellValue[], target: string): number {
  return list.findIndex((value) => compare(value, target) === 0);
}

/** 从尾找第一个命中的下标；找不到返回 -1 */
function findLast(list: CellValue[], target: string): number {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (compare(list[i], target) === 0) {
      return i;
    }
  }
  return -1;
}

/**
 * 二分查找（升序）。
 * 刻意**不校验排序** —— 这正是「静默错误」的来源：
 * 数据没排序时它跳着比，返回一个看起来找到了的值，并且不报任何错。
 */
function findBinary(list: CellValue[], target: string): number {
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
  return -1;
}

/** 精确或下一个较小：找小于等于目标的最大值所在行 */
function findNextSmaller(list: CellValue[], target: string): number {
  let best = -1;
  for (let i = 0; i < list.length; i += 1) {
    if (compare(list[i], target) <= 0) {
      if (best === -1 || compare(list[i], list[best]) > 0) {
        best = i;
      }
    }
  }
  return best;
}

/** 精确或下一个较大：找大于等于目标的最小值所在行 */
function findNextLarger(list: CellValue[], target: string): number {
  let best = -1;
  for (let i = 0; i < list.length; i += 1) {
    if (compare(list[i], target) >= 0) {
      if (best === -1 || compare(list[i], list[best]) < 0) {
        best = i;
      }
    }
  }
  return best;
}

/** 通配符匹配：* 任意多字符、? 单个字符、~ 转义 */
function wildcardMatch(text: string, pattern: string): boolean {
  let regex = '';
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === '~' && i + 1 < pattern.length) {
      regex += pattern[i + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i += 1;
      continue;
    }
    if (ch === '*') {
      regex += '.*';
      continue;
    }
    if (ch === '?') {
      regex += '.';
      continue;
    }
    regex += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${regex}$`, 'i').test(text);
}

export const xlookupCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;

  // ---------- 0. 版本检查（team-lead Q9：新函数必须显著提示旧版不可用） ----------
  const version = (args.excel_version ?? '365').trim();
  if (UNSUPPORTED_VERSIONS.has(version)) {
    return fail(explain('xlookup', ERROR_CODES.NAME, 'old_version'));
  }

  const lookupRef = (args.lookup_array ?? '').trim() || spec.ranges.lookup_array || '';
  const returnRef = (args.return_array ?? '').trim() || spec.ranges.return_array || '';

  const lookupBlock = sliceSheet(sheet, lookupRef);
  const returnBlock = sliceSheet(sheet, returnRef);
  if (lookupBlock === null || returnBlock === null) {
    return fail(explain('xlookup', ERROR_CODES.REF, 'bad_range'));
  }
  if (lookupBlock.header.length === 0 || returnBlock.header.length === 0) {
    return fail(explain('xlookup', ERROR_CODES.REF, 'bad_range'));
  }

  const lookupColumn = columnOf(lookupBlock, 0);
  const returnColumn = columnOf(returnBlock, 0);

  // ---------- 1. 行数必须一致 ----------
  if (lookupColumn.length !== returnColumn.length) {
    return fail(explain('xlookup', ERROR_CODES.VALUE, 'row_mismatch'));
  }

  const lookupValue = (args.lookup_value ?? '').trim();
  const matchMode = Number(args.match_mode ?? '0');
  const searchMode = Number(args.search_mode ?? '1');

  // ---------- 2. 通配符模式只认文本 ----------
  if (matchMode === 2 && isNumeric(lookupValue)) {
    return fail(explain('xlookup', ERROR_CODES.NA, 'wildcard_number'));
  }

  // ---------- 3. 查找 ----------
  let index = -1;
  let warning = '';

  if (matchMode === 2) {
    // 通配符匹配
    if (searchMode === -1) {
      for (let i = lookupColumn.length - 1; i >= 0; i -= 1) {
        if (lookupColumn[i] !== null && wildcardMatch(String(lookupColumn[i]), lookupValue)) {
          index = i;
          break;
        }
      }
    } else {
      index = lookupColumn.findIndex(
        (value) => value !== null && wildcardMatch(String(value), lookupValue),
      );
    }
  } else if (searchMode === 2) {
    // 二分查找：要求升序，没排序时结果不可信 —— 但 Excel 不会报错
    index = findBinary(lookupColumn, lookupValue);
    if (index >= 0 && !isAscending(lookupColumn)) {
      const firstHit = findFirst(lookupColumn, lookupValue);
      if (firstHit !== index) {
        warning =
          'Excel 不会报错，但这个值可能是错的：二分查找要求查找列已按升序排序，现在这列没排序，它跳着比就返回了一个「看起来找到了」的值，而不是第一个匹配的行。数据量不大时请用「从头到尾」（搜索模式 1）。';
      }
    }
  } else if (matchMode === -1) {
    index = findNextSmaller(lookupColumn, lookupValue);
  } else if (matchMode === 1) {
    index = findNextLarger(lookupColumn, lookupValue);
  } else if (searchMode === -1) {
    index = findLast(lookupColumn, lookupValue);
  } else {
    index = findFirst(lookupColumn, lookupValue);
  }

  // ---------- 4. 没找到 ----------
  if (index < 0 || index >= returnColumn.length) {
    const notFoundRaw = (args.if_not_found ?? '').trim();
    if (notFoundRaw === '') {
      return fail(explain('xlookup', ERROR_CODES.NA, 'not_found'));
    }
    const { inner, quoted } = stripQuotes(notFoundRaw);
    if (!quoted && !isNumeric(inner) && !/^[A-Za-z]+\d+$/.test(inner)) {
      // 第 4 参数同样要加引号，否则 Excel 也认不出来
      return fail(explain('xlookup', ERROR_CODES.NAME, 'not_found'));
    }
    return ok(isNumeric(inner) && !quoted ? Number(inner) : inner);
  }

  const value = returnColumn[index] ?? null;
  return ok(value, undefined, warning === '' ? undefined : warning);
};
