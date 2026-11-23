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
 * - 文本：没说自己是公式/引用的补上引号
 * - 数字 / 下拉 / 区域引用：原样输出
 *
 * 文本字段里也可能装的是「表达式」而不是字面量：`B2>=60`、`AND(B2>70,B2<90)`、
 * `1/0`、`B2+C2`。这些必须原样进公式，否则会变成 `=IF("B2>=60",…)` 这种 Excel
 * 直接 `#VALUE!` 的写法（H 阶段 Excel 对照查出的系统性问题）。
 */
export function quoteIfText(raw: string, type: CalcFieldType): string {
  const value = raw.trim();
  if (value === '') {
    return '';
  }
  if (type !== 'text') {
    return value;
  }
  // 已经带一对半角双引号：若里面是逻辑值/错误码/数字，Excel 里应作为字面量而不是文本
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    const inner = value.slice(1, -1);
    if (
      /^(TRUE|FALSE)$/i.test(inner) ||
      /^#(N\/A|VALUE!|REF!|NAME\?|NUM!|DIV\/0!|NULL!|SPILL!)$/.test(inner)
    ) {
      return inner;
    }
    return value;
  }
  if (value.startsWith('=')) {
    return value;
  }
  // 数组常量 {1,2,3}：直接原样输出
  if (value.startsWith('{') && value.endsWith('}')) {
    return value;
  }
  // 逻辑值、错误码、纯数字：Excel 里是字面量，不是文本
  if (/^(TRUE|FALSE)$/i.test(value) || /^#(N\/A|VALUE!|REF!|NAME\?|NUM!|DIV\/0!|NULL!|SPILL!)$/.test(value)) {
    return value;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return value;
  }
  // 表达式：含比较/算术运算符或函数调用（且不含中文，避免把「A/B 测试」当表达式）。
  // 注意不认减号——日期 2024-03-05 会被误判成算式。
  const exprLike =
    /^(?:[A-Za-z_][A-Za-z0-9_.]*\(|[^一-鿿]*[<>=+*/&^])/.test(value) &&
    /[<>=+*/&^()]/.test(value);
  if (exprLike && !/[一-鿿]/.test(value)) {
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
 * 去掉空参数留下的多余逗号：`SUM(A2,,B2)`、`LOOKUP(A2,A3:A5,)`、`{1,2,}`。
 * 扫描时跳过双引号内的内容，避免把文本里的逗号也删掉。
 */
export function dropEmptyArgs(formula: string): string {
  let out = '';
  let inStr = false;
  for (let i = 0; i < formula.length; i++) {
    const ch = formula[i];
    if (ch === '"') {
      inStr = !inStr;
      out += ch;
      continue;
    }
    if (!inStr && ch === ',') {
      const rest = formula.slice(i + 1).trimStart();
      if (rest.startsWith(')') || rest.startsWith(',') || rest.startsWith('}')) {
        continue; // 空参数，整段逗号扔掉
      }
    }
    out += ch;
  }
  return out;
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

  const filled = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (matched, key: string) => {
    const raw = args[key];
    if (raw === undefined) {
      return matched;
    }
    return renderValue(raw, fieldMap.get(key));
  });
  return dropEmptyArgs(filled);
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
