import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { cellValue, parseCell } from '@/core/ref';
import { isNumeric } from '@/core/tsv';
import { fail, ok, stripQuotes } from './types';

/**
 * 信息类 3 个 IS* 探测函数的试算实现（纯函数，零 DOM）。
 *
 * 共享的值解析规则（三个函数一致）：
 *   raw = args.value → stripQuotes
 *   - 带引号（quoted）：v = inner（文本字面值，如 "1002" 算文本）
 *   - 裸值且像单元格引用（/[A-Za-z]+\d+/）：v = cellValue(sheet, inner)
 *   - 裸值且是数字：v = Number(inner)
 *   - 其它：v = inner（当作文本）
 * 空参数（'""' / 省略）→ #VALUE!；越界引用或区域引用 → #REF!。
 *
 * 各函数语义见 src/data/packs/information.ts 的 examples[0].dataTsv：
 *   - isnumber 用 TYPE_TSV（编号,说明，A2=1001 数字, A3=1002 数字, A4=— 文本）
 *   - isblank 用 CONTACT_TSV（姓名,电话，B3 真空）
 *   - iserror 用 CHECK_TSV（公式结果，A3=#N/A, A5=#DIV/0!）
 */

/** Excel 全部错误码字符串（存为单元格内容时被视为「错误值」） */
const ERROR_VALUES = new Set<string>([
  '#N/A',
  '#VALUE!',
  '#REF!',
  '#NAME?',
  '#NUM!',
  '#DIV/0!',
  '#SPILL!',
  '#NULL!',
  '#CALC!',
]);

/** 值解析结果：区分「文本字面量 / 数字字面量 / 单元格 / 无效引用（越界或区域）」 */
type Resolved =
  | { kind: 'text'; v: string }
  | { kind: 'number'; v: number }
  | { kind: 'cell'; v: CellValue }
  | { kind: 'invalid' };

/** 按统一规则解析 value 参数 */
function resolveArg(raw: string, sheet: Sheet): Resolved {
  const { inner, quoted } = stripQuotes(raw);
  if (quoted) {
    return { kind: 'text', v: inner };
  }
  // 多格区域引用（如 A2:A4）→ 视为无效参数
  if (/^[A-Za-z]+\d+:[A-Za-z]+\d+$/.test(inner)) {
    return { kind: 'invalid' };
  }
  // 单格引用
  if (/^[A-Za-z]+\d+$/.test(inner)) {
    const pos = parseCell(inner);
    const anchor = parseCell(sheet.anchor);
    if (pos !== null && anchor !== null) {
      const rowIdx = pos.row - anchor.row;
      const colIdx = pos.col - anchor.col;
      if (rowIdx >= 0 && colIdx >= 0 && rowIdx < sheet.rows.length && colIdx < sheet.header.length) {
        return { kind: 'cell', v: cellValue(sheet, inner) };
      }
    }
    return { kind: 'invalid' };
  }
  // 数字字面量
  if (isNumeric(inner)) {
    return { kind: 'number', v: Number(inner) };
  }
  return { kind: 'text', v: inner };
}

/** 参数是否为空（省略或写成 '""'）→ IS* 系列必填，缺省报 #VALUE! */
function isEmptyArg(raw: string): boolean {
  if (raw.trim() === '') {
    return true;
  }
  const { inner, quoted } = stripQuotes(raw);
  return quoted && inner === '';
}

function failValue(): CalcOutcome {
  return fail(make(ERROR_CODES.VALUE, 'IS 函数缺少必填的 value 参数', '请填写一个单元格引用或值，例如 A2 或 1001。'));
}

function failRef(): CalcOutcome {
  return fail(make(ERROR_CODES.REF, '引用无效或指向了多格区域', '检查单元格引用是否在示例数据范围内，例如 A2；区域引用请改用单个单元格。'));
}

/** 单元格值是否为「真数字」（数字类型，或能解析成数字的文本） */
function isRealNumber(v: CellValue): boolean {
  if (typeof v === 'number') {
    return true;
  }
  if (typeof v === 'string') {
    return isNumeric(v);
  }
  return false;
}

/* ============================ ISNUMBER ============================ */

export const isnumberCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const raw = args.value ?? '';
  if (isEmptyArg(raw)) {
    return failValue();
  }
  const r = resolveArg(raw, sheet);
  if (r.kind === 'invalid') {
    return failRef();
  }
  if (r.kind === 'text') {
    return ok(false); // 文本（含带引号的 "1002"）不是数字
  }
  if (r.kind === 'number') {
    return ok(true);
  }
  return ok(isRealNumber(r.v));
};

/* ============================ ISBLANK ============================ */

export const isblankCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const raw = args.value ?? '';
  if (isEmptyArg(raw)) {
    return failValue();
  }
  const r = resolveArg(raw, sheet);
  if (r.kind === 'invalid') {
    return failRef();
  }
  if (r.kind === 'text' || r.kind === 'number') {
    return ok(false); // 字面量一定非空
  }
  return ok(r.v === null || r.v === ''); // 单元格彻底没内容才算空
};

/* ============================ ISERROR ============================ */

export const iserrorCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const raw = args.value ?? '';
  if (isEmptyArg(raw)) {
    return failValue();
  }
  const r = resolveArg(raw, sheet);
  if (r.kind === 'invalid') {
    return failRef();
  }
  // 文本字面量（含带引号的 "#N/A"）只是文字，不是真正的错误单元格
  if (r.kind === 'text' || r.kind === 'number') {
    return ok(false);
  }
  // 仅当来自单元格且内容正好是错误码字符串才算错误
  return ok(typeof r.v === 'string' && ERROR_VALUES.has(r.v));
};
