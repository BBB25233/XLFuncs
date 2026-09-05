import type { CalcContext, CalcHandler, CalcOutcome } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { formatNumber, toNumber } from './helpers';

/**
 * Information 类（B8 批次）17 个函数的在线试算实现：
 *   cell / error-type / info / iserr / iseven / isformula / islogical / isna /
 *   isnontext / isodd / isref / istext / n / na / sheet / sheets / type
 *
 * 设计要点（按契约 §0 / §6 的简化约定）：
 * - 纯值变换：calc.sampleTableId 统一设 'sales'，handler 忽略 sheet（除 isref/cell 这种
 *   ref 有意义的，这里也只做静态简化，不读取 sheet 实际内容）。
 * - args[key] 为字段 raw 字符串；文本类参数先 stripQuotes() 取干净内容。
 * - 布尔结果一律用 'TRUE' / 'FALSE' 展示。
 * - 简化说明见各函数注释与最终报告。
 */

/* ===================== 共享小工具 ===================== */

/** 全部 8 个 Excel 标准错误串（ERROR_CODES 不含 #NULL!，这里补全） */
const ERROR_CODES_ALL = [
  '#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A', '#SPILL!',
];

function isKnownError(s: string): boolean {
  return ERROR_CODES_ALL.includes(s);
}

/** 取字段 raw（已 trim） */
function raw(ctx: CalcContext, key: string): string {
  return (ctx.args[key] ?? '').trim();
}

/** 是否为布尔字面量（大小写不敏感） */
function isBoolLiteral(s: string): boolean {
  return /^true$|^false$/i.test(s);
}

/* ===================== ISEVEN · 偶数判断 ===================== */
export const isevenCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'number');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISEVEN 必须提供一个数字。', '在 number 里填一个数字。'),
    );
  }
  const n = toNumber(stripQuotes(r).inner);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, 'ISEVEN 的参数不是有效数字（可能是文本）。',
        '确认填的是数字，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const even = Math.trunc(n) % 2 === 0; // 负数向零截断，与 Excel 一致
  return ok(even, even ? 'TRUE' : 'FALSE');
};

/* ===================== ISODD · 奇数判断 ===================== */
export const isoddCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'number');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISODD 必须提供一个数字。', '在 number 里填一个数字。'),
    );
  }
  const n = toNumber(stripQuotes(r).inner);
  if (n === null) {
    return fail(
      make(ERROR_CODES.VALUE, 'ISODD 的参数不是有效数字（可能是文本）。',
        '确认填的是数字，文本型数字先用 VALUE() 转一下。'),
    );
  }
  const odd = Math.trunc(n) % 2 !== 0;
  return ok(odd, odd ? 'TRUE' : 'FALSE');
};

/* ===================== ISERR · 是否错误值（不含 #N/A） ===================== */
export const iserrCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISERR 必须提供一个值。', '填一个值、单元格引用或错误。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (!isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.VALUE, '无法识别的错误值，Excel 不认识它。',
          '填一个合法的 Excel 错误，如 #DIV/0!。'),
      );
    }
    const truthy = inner !== ERROR_CODES.NA; // 排除 #N/A
    return ok(truthy, truthy ? 'TRUE' : 'FALSE');
  }
  return ok(false, 'FALSE');
};

/* ===================== ISNA · 是否 #N/A ===================== */
export const isnaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISNA 必须提供一个值。', '填一个值、单元格引用或错误。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (!isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.VALUE, '无法识别的错误值，Excel 不认识它。',
          '填一个合法的 Excel 错误，如 #N/A。'),
      );
    }
    const isNa = inner === ERROR_CODES.NA;
    return ok(isNa, isNa ? 'TRUE' : 'FALSE');
  }
  return ok(false, 'FALSE');
};

/* ===================== ISTEXT · 是否文本 ===================== */
export const istextCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISTEXT 必须提供一个值。', '填一个值或单元格引用。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (!isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的 Excel 错误，或普通文本。'),
      );
    }
    return ok(false, 'FALSE'); // 错误不是文本
  }
  if (toNumber(inner) !== null) {
    return ok(false, 'FALSE'); // 数字不是文本
  }
  if (isBoolLiteral(inner)) {
    return ok(false, 'FALSE'); // 逻辑值不是文本
  }
  return ok(true, 'TRUE');
};

/* ===================== ISNONTEXT · 是否非文本 ===================== */
export const isnontextCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISNONTEXT 必须提供一个值。', '填一个值或单元格引用。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (!isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的 Excel 错误，或普通文本。'),
      );
    }
    return ok(true, 'TRUE'); // 错误是非文本
  }
  if (toNumber(inner) !== null) {
    return ok(true, 'TRUE'); // 数字是非文本
  }
  if (isBoolLiteral(inner)) {
    return ok(true, 'TRUE'); // 逻辑值是非文本
  }
  return ok(false, 'FALSE');
};

/* ===================== ISLOGICAL · 是否逻辑值 ===================== */
export const islogicalCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISLOGICAL 必须提供一个值。', '填一个值或单元格引用。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (!isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的 Excel 错误，或 TRUE/FALSE。'),
      );
    }
    return ok(false, 'FALSE'); // 错误不是逻辑值
  }
  const isBool = isBoolLiteral(inner);
  return ok(isBool, isBool ? 'TRUE' : 'FALSE');
};

/* ===================== ISREF · 是否引用（简化） ===================== */
export const isrefCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISREF 必须提供一个引用。', '填一个单元格或区域引用，如 A1。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.REF, '错误值不是合法引用。', '填一个真正的单元格/区域引用。'),
      );
    }
    return fail(
      make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的 Excel 错误，或引用。'),
    );
  }
  // 简化：能匹配单元格/区域引用形态即视为引用，否则当作非引用（FALSE）
  const refRe = /^\$?[A-Za-z]+\$?\d+(:\$?[A-Za-z]+\$?\d+)?$/;
  if (refRe.test(inner)) {
    return ok(true, 'TRUE');
  }
  return ok(false, 'FALSE');
};

/* ===================== ISFORMULA · 是否公式（简化） ===================== */
export const isformulaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'reference');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'ISFORMULA 需要引用一个单元格。', '填一个单元格引用，如 A2。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('=')) {
    return ok(true, 'TRUE'); // 文本里以 = 开头 → 视为公式
  }
  const refRe = /^\$?[A-Za-z]+\$?\d+(:\$?[A-Za-z]+\$?\d+)?$/;
  if (refRe.test(inner)) {
    return ok(false, 'FALSE'); // 引用指向常量
  }
  return fail(
    make(ERROR_CODES.VALUE, 'ISFORMULA 需要一个单元格引用，不是裸值。',
      '传一个单元格引用（如 A2），不要直接传值。'),
  );
};

/* ===================== N · 转为数值 ===================== */
export const nCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return ok(0, '0'); // 空白 → 0
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.NA, 'N 遇到错误值会返回 #N/A。', '先用 IFERROR 处理该错误。'),
      );
    }
    return fail(
      make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的 Excel 错误，或数值/文本。'),
    );
  }
  if (isBoolLiteral(inner)) {
    return ok(inner.toLowerCase() === 'true' ? 1 : 0, inner.toLowerCase() === 'true' ? '1' : '0');
  }
  const num = toNumber(inner);
  if (num !== null) {
    return ok(num, formatNumber(num));
  }
  return ok(0, '0'); // 文本 → 0
};

/* ===================== NA · 永远返回 #N/A ===================== */
export const naCalc: CalcHandler = (): CalcOutcome => {
  return fail(
    make(ERROR_CODES.NA, 'NA 函数永远返回 #N/A，用来占位或配合 IFERROR。',
      '它不接受参数，直接返回 #N/A。'),
  );
};

/* ===================== TYPE · 返回值的类型编号 ===================== */
export const typeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'TYPE 必须提供一个值。', '填一个值或单元格引用。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (!isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的 Excel 错误，或数值/文本。'),
      );
    }
    return ok(16, '16'); // 错误 → 16
  }
  if (toNumber(inner) !== null) {
    return ok(1, '1'); // 数字 → 1
  }
  if (isBoolLiteral(inner)) {
    return ok(4, '4'); // 逻辑 → 4
  }
  return ok(2, '2'); // 文本 → 2
};

/* ===================== ERROR.TYPE · 错误编号 ===================== */
const ERROR_TYPE_MAP: Record<string, number> = {
  '#NULL!': 1,
  '#DIV/0!': 2,
  '#VALUE!': 3,
  '#REF!': 4,
  '#NAME?': 5,
  '#NUM!': 6,
  '#N/A': 7,
  '#SPILL!': 8,
};

export const errorTypeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return fail(
      make(ERROR_CODES.NA, 'ERROR.TYPE 收到非错误值，返回 #N/A。', '先确认值是七种标准错误之一。'),
    );
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    const code = ERROR_TYPE_MAP[inner];
    if (code !== undefined) {
      return ok(code, String(code));
    }
    return fail(
      make(ERROR_CODES.NA, '不是标准的七种错误，ERROR.TYPE 返回 #N/A。', '填标准错误，如 #DIV/0!。'),
    );
  }
  return fail(
    make(ERROR_CODES.NA, 'ERROR.TYPE 只接受错误值，普通值返回 #N/A。', '先确认值是错误值。'),
  );
};

/* ===================== INFO · 系统环境信息（简化） ===================== */
const INFO_MAP: Record<string, string> = {
  numfile: '1',
  release: '16.0',
  system: 'pcdos',
  osversion: 'Windows (32-bit) NT 10.0',
  recalc: 'A',
  memavail: '1048576',
  totmem: '2097152',
  origin: 'A1',
  directory: 'C:\\',
};

export const infoCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'type_text');
  if (r === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'INFO 必须提供类型文本，如 "release"。', '填一个合法的 info 类型。'),
    );
  }
  const key = stripQuotes(r).inner.toLowerCase();
  const hit = INFO_MAP[key];
  if (hit === undefined) {
    return fail(
      make(ERROR_CODES.VALUE, 'INFO 不认识这个类型文本。', '核对 "release"/"system"/"numfile" 等。'),
    );
  }
  return ok(hit, hit);
};

/* ===================== CELL · 单元格信息（简化） ===================== */
const CELL_MAP: Record<string, string> = {
  address: 'A2',
  type: 'v',
  format: 'G',
  row: '2',
  col: '1',
  width: '8.43',
  filename: 'C:\\book1.xlsx',
  color: '0',
  prefix: '',
  contents: '',
};

export const cellCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const infoRaw = raw(ctx, 'info_type');
  if (infoRaw === '') {
    return fail(
      make(ERROR_CODES.VALUE, 'CELL 必须提供 info_type，如 "address"。', '填一个合法的 info_type。'),
    );
  }
  const key = stripQuotes(infoRaw).inner.toLowerCase();
  const hit = CELL_MAP[key];
  if (hit === undefined) {
    return fail(
      make(ERROR_CODES.VALUE, 'CELL 不认识这个 info_type。', '核对 "address"/"row"/"col"/"format" 等。'),
    );
  }
  return ok(hit, hit);
};

/* ===================== SHEET · 工作表序号（简化） ===================== */
export const sheetCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return ok(1, '1'); // 当前表 → 1
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.REF, '错误值不是合法引用，SHEET 返回 #REF!。', '填一个工作表名或单元格引用。'),
      );
    }
    return fail(
      make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的工作表名或引用。'),
    );
  }
  return ok(1, '1'); // 简化：始终返回 1
};

/* ===================== SHEETS · 工作表数量（简化） ===================== */
export const sheetsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const r = raw(ctx, 'value');
  if (r === '') {
    return ok(1, '1'); // 简化：始终返回 1
  }
  const { inner } = stripQuotes(r);
  if (inner.startsWith('#')) {
    if (isKnownError(inner)) {
      return fail(
        make(ERROR_CODES.REF, '错误值不是合法引用，SHEETS 返回 #REF!。', '填一个工作表名或区域引用。'),
      );
    }
    return fail(
      make(ERROR_CODES.VALUE, '无法识别的错误值。', '填一个合法的工作表名或引用。'),
    );
  }
  return ok(1, '1'); // 简化：始终返回 1
};
