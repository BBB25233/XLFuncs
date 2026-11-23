import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { sliceSheet } from '@/core/ref';
import { parseCriterion } from './criteria';
import { formatNumber, toNumber } from './helpers';

/**
 * DSUM 数据库求和 handler。
 *
 * - database：数据区域（首行是表头）。
 * - field：要求和的列，可用列名文本、列序号（1 基）或列名单元格。
 * - criteria：条件区域（首行是条件列名，第二行起是条件值）。
 *   同一行的多个条件 = 逻辑「与」(AND)；分写在多行 = 逻辑「或」(OR)。
 *
 * 错误：field 不存在 → #VALUE!；criteria 列名不匹配 → #VALUE!；区域非法 → #REF!。
 */


export const dsumCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;

  const dbRef = (args.database ?? '').trim();
  const fieldRaw = args.field ?? '';
  const critRef = (args.criteria ?? '').trim();

  if (dbRef === '') {
    return fail(make(ERROR_CODES.REF, '数据库区域为空', '请填写数据库区域，如 A1:C5。'));
  }
  const dbBlock: Sheet | null = sliceSheet(sheet, dbRef);
  if (dbBlock === null) {
    return fail(make(ERROR_CODES.REF, `数据库区域「${dbRef}」无效`, '区域要写成「左上角:右下角」，如 A1:C5。'));
  }
  const dbHeader = dbBlock.header;
  const dbRows = dbBlock.rows;

  // ---------- 解析 field ----------
  const fieldName = stripQuotes(fieldRaw).inner.trim();
  let targetCol = -1;
  if (/^\d+$/.test(fieldName)) {
    const idx = Number.parseInt(fieldName, 10) - 1; // 1 基
    if (idx >= 0 && idx < dbHeader.length) {
      targetCol = idx;
    }
  } else {
    targetCol = dbHeader.indexOf(fieldName);
  }
  if (targetCol < 0) {
    return fail(
      make(ERROR_CODES.VALUE, `找不到求和列「${fieldName}」`, 'field 用列名文本（与表头一字不差）或列序号（从 1 开始）。'),
    );
  }

  // ---------- 解析 criteria ----------
  if (critRef === '') {
    return fail(make(ERROR_CODES.REF, '条件区域为空', '请填写条件区域，如 A6:A7。'));
  }
  const critBlock = sliceSheet(sheet, critRef);
  if (critBlock === null) {
    return fail(make(ERROR_CODES.REF, `条件区域「${critRef}」无效`, '区域要写成「左上角:右下角」，如 A6:A7。'));
  }
  const critRows = critBlock.rows;

  if (critRows.length <= 1) {
    // 只有表头（或无条件）→ 汇总全部
    const total = sumColumn(dbRows, targetCol);
    return ok(total, formatNumber(total));
  }

  const critHeader = critRows[0];

  // 先校验条件列名是否都在数据库表头里
  for (let j = 0; j < critHeader.length; j += 1) {
    const fname = critHeader[j];
    if (fname === null || String(fname).trim() === '') {
      continue;
    }
    if (dbHeader.indexOf(String(fname).trim()) < 0) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          `条件列名「${String(fname).trim()}」在数据库里找不到`,
          '条件表的表头必须从数据库表头复制，做到一字不差（含空格、大小写）。',
        ),
      );
    }
  }

  // 逐行判断：任一条件行（AND 组合）成立即命中（行与行 = OR）
  let total = 0;
  for (const dbRow of dbRows) {
    let matchedAny = false;
    for (let r = 1; r < critRows.length; r += 1) {
      const condRow = critRows[r];
      let allTrue = true;
      let hasCond = false;
      for (let j = 0; j < critHeader.length; j += 1) {
        const fname = critHeader[j];
        if (fname === null || String(fname).trim() === '') {
          continue;
        }
        const cval = condRow[j];
        if (cval === null || String(cval).trim() === '') {
          continue; // 该格留空 = 不约束此列
        }
        const dbCol = dbHeader.indexOf(String(fname).trim());
        hasCond = true;
        const criterion = parseCriterion(String(cval), sheet, 'cell');
        if (criterion.failure !== null) {
          return fail(criterion.failure);
        }
        if (!criterion.test(dbRow[dbCol])) {
          allTrue = false;
          break;
        }
      }
      if (allTrue && hasCond) {
        matchedAny = true;
        break;
      }
    }
    if (matchedAny) {
      const v = toNumber(dbRow[targetCol]);
      if (v !== null) {
        total += v;
      }
    }
  }

  return ok(total, formatNumber(total));
};

/** 对一列求和（忽略非数字） */
function sumColumn(rows: CellValue[][], col: number): number {
  let total = 0;
  for (const row of rows) {
    const v = toNumber(row[col]);
    if (v !== null) {
      total += v;
    }
  }
  return total;
}