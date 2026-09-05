import type { CellValue, Sheet } from '@/types';
import { ERROR_CODES } from '@/core/errors';
import { cellValue } from '@/core/ref';
import { isNumeric } from '@/core/tsv';
import { stripQuotes } from './types';

/**
 * 共享「逻辑表达式求值器」（从 IF 样板抽出，ADR-A1）。
 *
 * 支持的表达式：
 *   - 简单比较：B2>=60 · B2="及格" · C2<>"" 
 *   - 组合：AND(...) · OR(...) · NOT(...)
 *   - 嵌套：IF(...) 作为分支值（最多 64 层）
 *
 * 供 IF / IFS / AND / OR / NOT 全家复用，避免每人重写一遍表达式解析。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/** Excel 对 IF 的嵌套层数上限 */
export const MAX_NESTING = 64;

/** 条件的解析结果 */
export type ConditionResult =
  | { ok: true; value: boolean }
  | { ok: false; scenario: string; code: string };

/** 字面量的解析结果 */
export type LiteralResult =
  | { ok: true; value: CellValue }
  | { ok: false; scenario: string; code: string };

/** 一个分支的求值结果 */
export type BranchResult =
  | { ok: true; value: CellValue }
  | { ok: false; code: string; scenario: string };

export function failCondition(scenario: string, code: string = ERROR_CODES.NAME): ConditionResult {
  return { ok: false, scenario, code };
}

export function failLiteral(scenario: string, code: string = ERROR_CODES.NAME): LiteralResult {
  return { ok: false, scenario, code };
}

/**
 * 解析一个字面量：带引号的文字 / 数字 / TRUE / FALSE / 单元格引用。
 * 不加引号的中文一律 #NAME?（这正是「返回文字忘了加引号」这个坑）。
 */
export function parseLiteral(raw: string, sheet: Sheet): LiteralResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return failLiteral('unquoted_text');
  }

  const { inner, quoted } = stripQuotes(trimmed);
  if (quoted) {
    return { ok: true, value: inner };
  }
  if (/^TRUE$/i.test(inner)) {
    return { ok: true, value: true };
  }
  if (/^FALSE$/i.test(inner)) {
    return { ok: true, value: false };
  }
  if (isNumeric(inner)) {
    return { ok: true, value: Number(inner) };
  }
  if (/^[A-Za-z]+\d+$/.test(inner)) {
    const value = cellValue(sheet, inner);
    if (value === null) {
      return failLiteral('bad_cell', ERROR_CODES.REF);
    }
    return { ok: true, value };
  }
  return failLiteral('unquoted_text');
}

/** 按比较符比两个值 */
export function compareValues(left: CellValue, right: CellValue, op: string): boolean {
  const ln = typeof left === 'number' ? left : Number(left);
  const rn = typeof right === 'number' ? right : Number(right);
  const leftIsNum = left !== null && left !== '' && Number.isFinite(ln);
  const rightIsNum = right !== null && right !== '' && Number.isFinite(rn);

  if (leftIsNum && rightIsNum) {
    switch (op) {
      case '>':
        return ln > rn;
      case '>=':
        return ln >= rn;
      case '<':
        return ln < rn;
      case '<=':
        return ln <= rn;
      case '<>':
        return ln !== rn;
      default:
        return ln === rn;
    }
  }
  const ls = left === null ? '' : String(left).trim().toLowerCase();
  const rs = right === null ? '' : String(right).trim().toLowerCase();
  switch (op) {
    case '>':
      return ls > rs;
    case '>=':
      return ls >= rs;
    case '<':
      return ls < rs;
    case '<=':
      return ls <= rs;
    case '<>':
      return ls !== rs;
    default:
      return ls === rs;
  }
}

/** 解析一个简单比较式，如 B2>=60 */
export function parseComparison(expr: string, sheet: Sheet): ConditionResult {
  const matched = /^([A-Za-z]+\d+)\s*(>=|<=|<>|>|<|=)\s*([\s\S]*)$/.exec(expr.trim());
  if (matched === null) {
    return failCondition('bad_condition');
  }

  const left = cellValue(sheet, matched[1]);
  if (left === null) {
    return failCondition('bad_cell', ERROR_CODES.REF);
  }

  const rightText = matched[3].trim();
  if (rightText === '') {
    return failCondition('bad_condition');
  }
  const right = parseLiteral(rightText, sheet);
  if (!right.ok) {
    return right.scenario === 'bad_cell'
      ? failCondition('bad_cell', ERROR_CODES.REF)
      : failCondition(right.scenario);
  }

  return { ok: true, value: compareValues(left, right.value, matched[2]) };
}

/** 按逗号切分顶层参数（不拆开嵌套括号里的逗号） */
export function splitArgs(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of body) {
    if (ch === '(') {
      depth += 1;
    }
    if (ch === ')') {
      depth -= 1;
    }
    if (ch === ',' && depth === 0) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim() !== '') {
    out.push(current);
  }
  return out;
}

/** 递归解析条件表达式（支持 AND / OR / NOT 与简单比较） */
export function parseCondition(expr: string, sheet: Sheet): ConditionResult {
  const s = expr.trim();
  if (s === '') {
    return failCondition('bad_condition');
  }

  // 编程习惯的双等号
  if (s.includes('==')) {
    return failCondition('double_equal');
  }
  // 中缀 AND / OR：只有在「不是以 AND( 开头」时才算错
  const bareAndOr = /\b(AND|OR)\b/i.test(s) && !/^(AND|OR)\s*\(/i.test(s);
  if (bareAndOr) {
    return failCondition('infix_and_or');
  }

  // AND(...) / OR(...)
  const fn = /^(AND|OR)\s*\(([\s\S]*)\)$/i.exec(s);
  if (fn !== null) {
    const parts = splitArgs(fn[2]);
    if (parts.length === 0) {
      return failCondition('bad_condition');
    }
    const values: boolean[] = [];
    for (const part of parts) {
      const result = parseCondition(part, sheet);
      if (!result.ok) {
        return result;
      }
      values.push(result.value);
    }
    return {
      ok: true,
      value: fn[1].toUpperCase() === 'AND' ? values.every(Boolean) : values.some(Boolean),
    };
  }

  // NOT(...)
  const notFn = /^NOT\s*\(([\s\S]*)\)$/i.exec(s);
  if (notFn !== null) {
    const result = parseCondition(notFn[1], sheet);
    if (!result.ok) {
      return result;
    }
    return { ok: true, value: !result.value };
  }

  // 括号包了一层
  const wrapped = /^\(([\s\S]*)\)$/.exec(s);
  if (wrapped !== null) {
    return parseCondition(wrapped[1], sheet);
  }

  return parseComparison(s, sheet);
}

/** 统计一段文本里 IF( 出现的次数（大小写不敏感） */
export function countIfNesting(text: string): number {
  const matched = text.match(/IF\(/gi);
  return matched === null ? 0 : matched.length;
}

/**
 * 求值一个「分支值」：
 * - 若它本身又是一个 IF(...) 表达式，则递归求值（支持嵌套，Excel 上限 64 层）；
 * - 否则当作字面量（带引号文字 / 数字 / TRUE / FALSE / 单元格引用）。
 */
export function evalBranch(expr: string, sheet: Sheet): BranchResult {
  const s = expr.trim();
  const ifMatch = /^IF\s*\(([\s\S]*)\)$/i.exec(s);
  if (ifMatch !== null) {
    return evalIf(ifMatch[1], sheet);
  }
  const literal = parseLiteral(s, sheet);
  if (!literal.ok) {
    return { ok: false, code: literal.code, scenario: literal.scenario };
  }
  return { ok: true, value: literal.value };
}

/** 递归解析并计算一个 IF(...) 的「体」（不含外层 IF 与括号） */
export function evalIf(body: string, sheet: Sheet): BranchResult {
  const parts = splitArgs(body);
  if (parts.length < 2) {
    return { ok: false, code: ERROR_CODES.NAME, scenario: 'bad_if' };
  }
  const cond = parseCondition(parts[0], sheet);
  if (!cond.ok) {
    return { ok: false, code: cond.code, scenario: cond.scenario };
  }
  if (cond.value) {
    // 第二参数省略 → Excel 返回 0
    if (parts[1].trim() === '') {
      return { ok: true, value: 0 };
    }
    return evalBranch(parts[1], sheet);
  }
  // 第三参数省略 → Excel 返回 FALSE
  if (parts.length < 3 || parts[2].trim() === '') {
    return { ok: true, value: false };
  }
  return evalBranch(parts[2], sheet);
}
