import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, explain } from '@/core/errors';
import { columnOf, sliceSheet } from '@/core/ref';
import { fail, ok } from './types';
import { checkSubstringHint, parseCriterion, type Criterion } from './criteria';

/**
 * SUMIFS 试算实现（自研纯函数，ADR-A1）。
 *
 * 条件解析复用 src/core/calc/criteria.ts（COUNTIF / SUMIF / COUNTIFS / AVERAGEIF /
 * AVERAGEIFS 全家共用同一套条件解析）。
 *
 * 覆盖的错误复现（PRD §10.4 ②）：
 * ① 条件区域与求和区域行数不一致 → #VALUE!
 * ② 条件 >1000 忘了加引号 → #NAME?
 * ③ 文本条件 华东 不加引号 → #NAME?
 * ④ 日期写成文本 "2024/3/5" → 结果可能不对（warning）
 * ⑤ 想表达「包含」却忘了加 * / 字面量 * 忘了转义 → 结果可能不对（warning）
 */

export const sumifsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args, spec } = ctx;

  const sumRef = (args.sum_range ?? '').trim() || spec.ranges.sum_range || '';
  const sumBlock = sliceSheet(sheet, sumRef);
  if (sumBlock === null || sumBlock.header.length === 0) {
    return fail(explain('sumifs', ERROR_CODES.REF, 'bad_range'));
  }

  const sumColumn = columnOf(sumBlock, 0);
  const rowCount = sumColumn.length;

  const pairs: Array<{ rangeRef: string; criteria: string }> = [
    {
      rangeRef: (args.criteria_range1 ?? '').trim() || spec.ranges.criteria_range1 || '',
      criteria: args.criteria1 ?? '',
    },
    {
      rangeRef: (args.criteria_range2 ?? '').trim() || spec.ranges.criteria_range2 || '',
      criteria: args.criteria2 ?? '',
    },
  ];

  const criteria: Criterion[] = [];
  const warnings: string[] = [];

  for (const pair of pairs) {
    if (pair.criteria.trim() === '') {
      continue;
    }
    const block = sliceSheet(sheet, pair.rangeRef);
    if (block === null || block.header.length === 0) {
      return fail(explain('sumifs', ERROR_CODES.REF, 'bad_range'));
    }
    const column = columnOf(block, 0);
    if (column.length !== rowCount) {
      return fail(explain('sumifs', ERROR_CODES.VALUE, 'row_mismatch'));
    }

    const criterion = parseCriterion(pair.criteria, sheet);
    if (criterion.failure !== null) {
      return fail(criterion.failure);
    }
    if (criterion.warning !== '') {
      warnings.push(criterion.warning);
    }
    criteria.push({ ...criterion, raw: pair.criteria, column });
  }

  // ---------- 逐行判断并求和 ----------
  let total = 0;
  let matched = 0;
  for (let i = 0; i < rowCount; i += 1) {
    let pass = true;
    for (const criterion of criteria) {
      const target = criterion.column[i] ?? null;
      if (!criterion.test(target)) {
        pass = false;
        break;
      }
    }
    if (!pass) {
      continue;
    }
    matched += 1;
    const cell = sumColumn[i];
    const num = typeof cell === 'number' ? cell : Number(cell);
    if (Number.isFinite(num)) {
      total += num;
    }
  }

  // ---------- 「想表达包含却忘了加 *」的静默错误提示 ----------
  if (matched === 0) {
    for (const criterion of criteria) {
      const hint = checkSubstringHint(criterion);
      if (hint !== null) {
        warnings.push(hint);
        break;
      }
    }
  }

  const display = Number.isInteger(total)
    ? String(total)
    : String(Math.round(total * 1e6) / 1e6);
  return ok(total, display, warnings.length === 0 ? undefined : warnings.join(' '));
};
