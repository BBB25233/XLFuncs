import type { CalcFailure, CellValue, Sheet } from '@/types';
import { ERROR_CODES, explain } from '@/core/errors';
import { cellValue } from '@/core/ref';
import { isNumeric } from '@/core/tsv';
import { stripQuotes } from './types';

/**
 * 条件解析器（从 SUMIFS 抽出，供 COUNTIF / SUMIF / COUNTIFS / SUMIFS /
 * AVERAGEIF / AVERAGEIFS 全家复用，ADR-A1）。
 *
 * 支持的条件写法：
 *   ">10000"（比较）· "华东"（文本相等）· "*东*"（通配符）· "~*"（转义）
 *   ">="&DATE(2024,3,1)（日期）· ">"&H1（单元格引用）· ">=2024/3/1"（文本日期，给警告）
 *
 * 核心坑：除了纯数字，其他写法不带半角双引号一律 #NAME?（见 PRD §10.4 ②）。
 */

/** 一个解析好的条件 */
export interface Criterion {
  /** 失败原因；非 null 时整个计算直接返回这个错误 */
  failure: CalcFailure | null;
  /** 命中判断 */
  test: (value: CellValue) => boolean;
  /** 静默错误提示（Excel 不报错但结果可能不对） */
  warning: string;
  /** 原始条件文本，用于生成「忘了加 *」的提示 */
  raw: string;
  /** 该条件对应的那一列数据 */
  column: CellValue[];
}

const DATE_TEXT = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;

/** 把值统一成可比较形态：能当数字就返回数字（日期转序列号），否则返回小写文本 */
export function comparable(value: CellValue): number | string | null {
  if (value === null || typeof value === 'boolean') {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  const s = String(value).trim();
  if (s === '') {
    return null;
  }
  if (isNumeric(s)) {
    return Number(s);
  }
  const matched = DATE_TEXT.exec(s);
  if (matched !== null) {
    return dateToSerial(Number(matched[1]), Number(matched[2]), Number(matched[3]));
  }
  return s.toLowerCase();
}

/** Excel 1900 日期系统的序列号（1899-12-31 为 0） */
export function dateToSerial(year: number, month: number, day: number): number {
  const target = Date.UTC(year, month - 1, day);
  const base = Date.UTC(1899, 11, 31);
  return Math.round((target - base) / 86400000);
}

/** 文本形式的日期 → 序列号；不是日期返回 null */
export function textDateToSerial(text: string): number | null {
  const matched = DATE_TEXT.exec(text.trim());
  if (matched === null) {
    return null;
  }
  return dateToSerial(Number(matched[1]), Number(matched[2]), Number(matched[3]));
}

/** 通配符转正则：`*` 任意多字符、`?` 单个字符、`~` 后面跟的字符按字面量匹配 */
export function wildcardToRegExp(pattern: string): RegExp {
  let out = '';
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === '~' && i + 1 < pattern.length) {
      out += pattern[i + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i += 1;
      continue;
    }
    if (ch === '*') {
      out += '.*';
      continue;
    }
    if (ch === '?') {
      out += '.';
      continue;
    }
    out += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${out}$`, 'i');
}

/** 是否含未转义的通配符 */
export function hasWildcard(text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '~') {
      i += 1;
      continue;
    }
    if (text[i] === '*' || text[i] === '?') {
      return true;
    }
  }
  return false;
}

/** 构造一个「比较」条件（两边都是数字按数字比，两边都是文本按文本比） */
function makeCompare(op: string, target: number | string, warning = ''): Criterion {
  const comparePair = (left: number | string, right: number | string): boolean => {
    if (typeof left === 'number' && typeof right === 'number') {
      switch (op) {
        case '>':
          return left > right;
        case '>=':
          return left >= right;
        case '<':
          return left < right;
        case '<=':
          return left <= right;
        case '<>':
          return left !== right;
        default:
          return left === right;
      }
    }
    if (typeof left === 'string' && typeof right === 'string') {
      switch (op) {
        case '>':
          return left > right;
        case '>=':
          return left >= right;
        case '<':
          return left < right;
        case '<=':
          return left <= right;
        case '<>':
          return left !== right;
        default:
          return left === right;
      }
    }
    // 一边数字一边文本，Excel 不会认为它们相等
    return op === '<>';
  };

  return {
    failure: null,
    warning,
    raw: '',
    column: [],
    test: (value: CellValue): boolean => {
      if (value === null || String(value).trim() === '') {
        // 空格子只参与「不等于」比较，其余情况不命中
        return op === '<>' && target !== '';
      }
      const left = comparable(value);
      if (left === null) {
        return op === '<>';
      }
      return comparePair(left, target);
    },
  };
}

/** 构造一个通配符条件 */
function makeWildcard(pattern: string): Criterion {
  const re = wildcardToRegExp(pattern);
  return {
    failure: null,
    warning: '',
    raw: '',
    column: [],
    test: (value: CellValue): boolean => value !== null && re.test(String(value).trim()),
  };
}

/** 构造一个「完全等于某文本」的条件 */
function makeTextEqual(text: string): Criterion {
  const lowered = text.toLowerCase();
  return {
    failure: null,
    warning: '',
    raw: '',
    column: [],
    test: (value: CellValue): boolean =>
      value !== null && String(value).trim().toLowerCase() === lowered,
  };
}

/** 构造一个失败条件（failure 非 null 时上层直接返回错误） */
function makeFailure(failure: CalcFailure): Criterion {
  return { failure, warning: '', raw: '', column: [], test: () => true };
}

/**
 * 解析一个条件字符串。
 * 忘了加引号是最常见的错：除了纯数字，其他写法不带半角双引号一律 #NAME?。
 */
export function parseCriterion(raw: string, sheet: Sheet): Criterion {
  const { inner, quoted } = stripQuotes(raw);

  if (inner === '') {
    return { failure: null, warning: '', raw, column: [], test: () => true };
  }

  // ---------- DATE() 形式：">="&DATE(2024,3,1)（兼容引号包裹与裸写两种写法）----------
  const dateCall =
    /^(?:")?\s*(>=|<=|<>|>|<|=)?\s*(?:")?\s*&\s*DATE\(\s*(\d{1,4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)\s*(?:")?$/i.exec(
      inner,
    );
  if (dateCall !== null) {
    const serial = dateToSerial(Number(dateCall[2]), Number(dateCall[3]), Number(dateCall[4]));
    return makeCompare(dateCall[1] ?? '=', serial);
  }

  // ---------- 单元格引用形式：">"&H1（兼容引号包裹与裸写两种写法）----------
  const cellRef =
    /^(?:")?\s*(>=|<=|<>|>|<|=)?\s*(?:")?\s*&\s*([A-Za-z]+\d+)\s*(?:")?$/i.exec(inner);
  if (cellRef !== null) {
    const resolved = cellValue(sheet, cellRef[2]);
    const value = resolved === null ? null : comparable(resolved);
    if (value === null) {
      return makeCompare(cellRef[1] ?? '=', '');
    }
    return makeCompare(cellRef[1] ?? '=', value);
  }

  // ---------- 带比较符：">10000" / ">=2024/3/1" ----------
  const withOp = /^(>=|<=|<>|>|<|=)\s*([\s\S]*)$/.exec(inner);
  if (withOp !== null) {
    const op = withOp[1];
    const rest = withOp[2].trim();

    // 忘了加引号：只要在带比较符的条件下没有用引号包住整段，Excel 就报 #NAME?
    // （纯数字可省略引号，如 ">10000" 必须带引号，裸写 >10000 一律报错）
    if (!quoted || rest === '') {
      return makeFailure(explain('criteria', ERROR_CODES.NAME, 'unquoted_operator'));
    }

    // 日期写成文本 → 能算，但换台电脑可能不准，给警告
    const asDate = textDateToSerial(rest);
    if (asDate !== null) {
      return makeCompare(
        op,
        asDate,
        'Excel 不会报错，但这个值可能不稳：日期写成了文本 "2024/3/1"，它依赖电脑的区域设置来解析，换台电脑可能算出 0。改用 ">="&DATE(2024,3,1)。',
      );
    }

    if (isNumeric(rest)) {
      return makeCompare(op, Number(rest));
    }
    if (hasWildcard(rest)) {
      return makeWildcard(rest);
    }
    return makeCompare(op, rest.toLowerCase());
  }

  // ---------- 无比较符：纯数字 / 通配符 / 纯文本 ----------
  if (!quoted && !isNumeric(inner)) {
    return makeFailure(explain('criteria', ERROR_CODES.NAME, 'unquoted_text'));
  }
  if (isNumeric(inner)) {
    return makeCompare('=', Number(inner));
  }
  if (hasWildcard(inner)) {
    return makeWildcard(inner);
  }
  return makeTextEqual(inner);
}

/**
 * 「想表达包含却忘了加 *」的静默错误提示：当条件按「完全等于」比却 0 命中，
 * 而数据里有人「包含」这个字时，给出加通配符的建议。
 */
export function checkSubstringHint(criterion: Criterion): string | null {
  const { inner, quoted } = stripQuotes(criterion.raw);
  if (!quoted || inner === '' || isNumeric(inner) || hasWildcard(inner)) {
    return null;
  }
  const lookedLikeSubstring = criterion.column.some(
    (value) =>
      value !== null && String(value).includes(inner) && String(value).trim() !== inner,
  );
  if (lookedLikeSubstring) {
    return `Excel 不会报错，但这个结果可能不是你要的：条件 "${inner}" 是按「完全等于」比的，没有一个格子正好等于它。如果本意是「包含 ${inner} 这个字」，要在前后加 *，比如 "*${inner}*"。`;
  }
  return null;
}
