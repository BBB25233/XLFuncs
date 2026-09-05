import type { CalcField, CalcFieldType } from '@/types';

/**
 * 公式模板渲染：把 '=VLOOKUP({lookup_value}, ...)' 里的占位符换成用户填的值，
 * 并按字段类型决定是否补引号。
 *
 * 渲染出来的公式必须和 Excel 里真实生效的写法一致 —— 包括「用户忘了加引号」这种
 * 错误写法也要原样呈现，这样用户才能看懂自己错在哪。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/**
 * 按字段类型决定一个值在公式里的写法。
 * - 文本：没加引号的补上（已经带引号 / 以 = 开头的原样输出）
 * - 数字 / 下拉 / 区域引用：原样输出
 */
export function quoteIfText(raw: string, type: CalcFieldType): string {
  const value = raw.trim();
  if (value === '') {
    return '';
  }
  if (type !== 'text') {
    return value;
  }
  // 已经带一对半角双引号，或本身就是一个公式/引用，原样输出
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value;
  }
  if (value.startsWith('=')) {
    return value;
  }
  return `"${value}"`;
}

/** 输入 → 公式里该长什么样（带引号判断） */
export function renderValue(raw: string, field: CalcField | undefined): string {
  const type: CalcFieldType = field === undefined ? 'text' : field.type;
  return quoteIfText(raw, type);
}

/**
 * 把模板里的 {key} 占位符逐个替换成用户输入。
 * 未在 fields 里声明的 key 也会用原始字符串兜底替换，避免把 {xxx} 漏到界面上。
 */
export function render(
  template: string,
  args: Record<string, string>,
  fields: CalcField[] = [],
): string {
  const fieldMap = new Map<string, CalcField>(fields.map((field) => [field.key, field]));

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (matched, key: string) => {
    const raw = args[key];
    if (raw === undefined) {
      return matched;
    }
    return renderValue(raw, fieldMap.get(key));
  });
}

/**
 * 把参数默认值与预置用例合并成一份完整的参数表。
 * 用例里没覆盖到的参数回落到字段默认值，保证公式永远能拼出完整形态。
 */
export function mergeArgs(
  fields: CalcField[],
  overrides: Record<string, string> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of fields) {
    const overridden = overrides[field.key];
    out[field.key] = overridden === undefined ? field.default : overridden;
  }
  // 用例里可能出现 fields 未声明的 key（如 excel_version），也要带上
  for (const [key, value] of Object.entries(overrides)) {
    if (out[key] === undefined) {
      out[key] = value;
    }
  }
  return out;
}
