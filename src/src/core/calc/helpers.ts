import type { CellValue, Sheet } from '@/types';
import { cellValue, columnOf, parseRef, sliceSheet } from '@/core/ref';
import { isNumeric } from '@/core/tsv';

/**
 * 试算引擎共享工具（ADR-A1）：数值 / 文本强制转换、按列读取、聚合统计、
 * 日期序列号 ↔ 部件、四舍五入。所有 handler 复用这一份，避免 55 个函数各写一遍。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/* ===================== 值强制转换 ===================== */

/** 单元格值 → 数字；空白 / 非数字文本 / 布尔 的统一规则：
 * - null / '' → null（聚合时跳过）
 * - 布尔 → 1 / 0（Excel 里 TRUE=1、FALSE=0）
 * - 数字 → 本身；数字型文本 → 解析；其余 → null
 */
export function toNumber(value: CellValue): number | null {
  if (value === null || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  const s = String(value).trim();
  if (s === '') {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** 单元格值 → 展示用文本（trim；布尔转 TRUE / FALSE；null → 空串） */
export function toText(value: CellValue): string {
  if (value === null) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  return String(value).trim();
}

/* ===================== 样表读取 ===================== */

/** 按区域引用（如 'B2:B9'）取一列值；越界 / 非法 → 空数组 */
export function columnFromRef(sheet: Sheet, ref: string): CellValue[] {
  const block = sliceSheet(sheet, ref.trim());
  if (block === null) {
    return [];
  }
  return columnOf(block, 0);
}

/** 读取单个单元格（如 'B2'）；越界 → null */
export function cellFromRef(sheet: Sheet, ref: string): CellValue | null {
  return cellValue(sheet, ref.trim());
}

/** 解析区域引用字符串是否合法（用于字段校验） */
export function isValidRef(ref: string): boolean {
  return parseRef(ref.trim()) !== null;
}

/* ===================== 聚合统计 ===================== */

/** 只取一列里的数字（空白 / 文本跳过） */
export function numericValues(values: CellValue[]): number[] {
  const out: number[] = [];
  for (const v of values) {
    const n = toNumber(v);
    if (n !== null) {
      out.push(n);
    }
  }
  return out;
}

/** 求和（忽略非数字） */
export function sumValues(values: CellValue[]): number {
  return numericValues(values).reduce((acc, n) => acc + n, 0);
}

/** 平均值（无数字 → null） */
export function avgValues(values: CellValue[]): number | null {
  const nums = numericValues(values);
  if (nums.length === 0) {
    return null;
  }
  return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}

/** 最大值（无数字 → null） */
export function maxValues(values: CellValue[]): number | null {
  const nums = numericValues(values);
  return nums.length === 0 ? null : Math.max(...nums);
}

/** 最小值（无数字 → null） */
export function minValues(values: CellValue[]): number | null {
  const nums = numericValues(values);
  return nums.length === 0 ? null : Math.min(...nums);
}

/** COUNT：数字单元格个数（文本 / 布尔 / 空 不计） */
export function countNumbers(values: CellValue[]): number {
  return numericValues(values).length;
}

/** COUNTA：非空单元格个数（含文本与布尔；空白不计） */
export function countNonBlank(values: CellValue[]): number {
  return values.filter((v) => v !== null && v !== '').length;
}

/* ===================== 数字格式化 ===================== */

/** 把数字格式化成展示串：整数不带小数，小数最多 6 位（避免 0.1+0.2 这类浮点尾巴） */
export function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(Math.round(value * 1e6) / 1e6);
}

/* ===================== 四舍五入 / 取整 ===================== */

/** 四舍五入到指定小数位（远离零，和 Excel 一致） */
export function roundHalfUp(value: number, digits: number): number {
  const factor = 10 ** digits;
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * factor)) / factor;
}

/** 向上取整（远离零）到指定小数位，如 ROUNDUP(2.141,2)=2.15 */
export function roundUp(value: number, digits: number): number {
  const factor = 10 ** digits;
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.ceil(Math.abs(value) * factor)) / factor;
}

/** 向下取整（朝向零）到指定小数位，如 ROUNDDOWN(2.149,2)=2.14 */
export function roundDown(value: number, digits: number): number {
  const factor = 10 ** digits;
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.floor(Math.abs(value) * factor)) / factor;
}

/* ===================== 日期（Excel 1900 系统） ===================== */

/** 解析「YYYY-MM-DD」或「YYYY/MM/DD」文本 → {year,month,day}；非法 → null */
export function parseDateText(raw: string): { year: number; month: number; day: number } | null {
  const s = String(raw).trim();
  let matched = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s);
  if (matched === null) {
    // 中文日期：2024年3月15日 / 2024 年 3 月 15 日
    matched = /^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?$/.exec(s);
    if (matched !== null) {
      return { year: Number(matched[1]), month: Number(matched[2]), day: Number(matched[3]) };
    }
    matched = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s);
    if (matched === null) {
      return null;
    }
    return { year: Number(matched[3]), month: Number(matched[1]), day: Number(matched[2]) };
  }
  return { year: Number(matched[1]), month: Number(matched[2]), day: Number(matched[3]) };
}

/** 日期部件 → Excel 序列号（1900-01-01 = 1；含 Excel 的 1900 闰年 bug） */
export function dateToSerial(year: number, month: number, day: number): number {
  const target = Date.UTC(year, month - 1, day);
  const base = Date.UTC(1899, 11, 31);
  const diff = Math.round((target - base) / 86400000);
  // Excel 把 1900 当闰年（虚构 1900-02-29，序列号 60），1900-03-01 起整体后移 1 天
  return diff >= 60 ? diff + 1 : diff;
}

/** 序列号 → 日期部件；越界 → null */
export function serialToParts(serial: number): { year: number; month: number; day: number } | null {
  if (!Number.isFinite(serial) || serial < 1 || serial > 2958465) {
    return null;
  }
  const adjusted = serial >= 61 ? serial - 1 : serial;
  const date = new Date(Date.UTC(1899, 11, 31) + adjusted * 86400000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** 单元格值 → 日期部件（支持日期文本与序列号）；非日期 → null */
export function toDateParts(raw: CellValue): { year: number; month: number; day: number } | null {
  if (raw === null || raw === '') {
    return null;
  }
  if (typeof raw === 'number') {
    return serialToParts(raw);
  }
  if (typeof raw === 'boolean') {
    return null;
  }
  return parseDateText(String(raw));
}

/** 把值当「年份」取出来：序列号按日期取年；文本按日期解析取年；纯数字年（如 2024）直接用 */
export function yearOf(raw: CellValue): number | null {
  if (typeof raw === 'number') {
    const parts = serialToParts(raw);
    return parts === null ? null : parts.year;
  }
  if (raw === null || raw === '') {
    return null;
  }
  if (isNumeric(String(raw))) {
    // 像 2024 这种纯数字，既可能是年份也可能是序列号；这里优先当年份（MONTH/DAY 同理）
    const n = Number(String(raw));
    if (n >= 1900 && n <= 9999) {
      return n;
    }
    return serialToParts(n)?.year ?? null;
  }
  const parts = parseDateText(String(raw));
  return parts === null ? null : parts.year;
}
