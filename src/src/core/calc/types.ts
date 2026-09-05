import type {
  CalcContext,
  CalcFail,
  CalcFailure,
  CalcHandler,
  CalcOutcome,
  CalcSuccess,
  CellValue,
  Sheet,
} from '@/types';

/**
 * 计算层内部类型与结果构造器。
 * 类型真源在 @/types，这里只做再导出 + 提供 ok() / fail() 两个构造器，
 * 保证 5 个计算实现写出来的返回结构完全一致。
 */

export type { CalcContext, CalcFail, CalcFailure, CalcHandler, CalcOutcome, CalcSuccess, CellValue, Sheet };

/** 单元格值 → 展示文本 */
export function displayOf(value: CellValue): string {
  if (value === null) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  return String(value);
}

/** 构造一个成功结果；warning 用于表达「Excel 不报错但结果可能是错的」静默错误 */
export function ok(value: CellValue, display?: string, warning?: string): CalcSuccess {
  const result: CalcSuccess = {
    ok: true,
    value,
    display: display ?? displayOf(value),
  };
  if (warning !== undefined && warning !== '') {
    result.warning = warning;
  }
  return result;
}

/** 构造一个失败结果（错误结构固定为 { error, reason, fix }） */
export function fail(failure: CalcFailure): CalcFail {
  return { ok: false, value: failure };
}

/** Excel 里的空文本（一对紧挨的半角双引号） */
export const EMPTY_TEXT = '""';

/** 判断一个字符串是不是被一对半角双引号包着 */
export function isQuoted(raw: string): boolean {
  const s = raw.trim();
  return s.length >= 2 && s.startsWith('"') && s.endsWith('"');
}

/** 去掉首尾的一对半角双引号，并标记原来是否带引号 */
export function stripQuotes(raw: string): { inner: string; quoted: boolean } {
  const s = raw.trim();
  if (isQuoted(s)) {
    return { inner: s.slice(1, -1), quoted: true };
  }
  return { inner: s, quoted: false };
}
