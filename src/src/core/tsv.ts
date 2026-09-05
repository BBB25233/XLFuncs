/**
 * TSV 解析 / 序列化 + 复制载荷拼装（F23，P0）。
 *
 * TSV = 制表符分隔的文本，是 Excel 剪贴板的原生语言：
 * 单元格之间用 Tab、行之间用换行，粘进 Excel 会自动分列。
 *
 * 复制顺序固定为（ARCHITECTURE §3.7）：
 *   ① 示例标题行 → ② 数据表（表头 + 数据行）→ ③ 空一行 → ④ 公式 → ⑤ 结果说明
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/** 单元格转义规则（ARCHITECTURE §3.7） */
export function escape(cell: string): string {
  let out = cell.replace(/\t/g, '  ').replace(/\r?\n/g, ' ').trim();
  // 以 = + - @ 开头且不是合法数字时，前面补一个半角单引号，避免被当成公式执行
  if (/^[=+\-@]/.test(out) && !isNumeric(out)) {
    out = `'${out}`;
  }
  return out;
}

/** 判断一个字符串是不是纯数字（含负数、小数、科学计数法） */
export function isNumeric(raw: string): boolean {
  const s = raw.trim();
  if (s === '') {
    return false;
  }
  return Number.isFinite(Number(s));
}

/** TSV 文本 → 二维数组（不做转义还原，parse 只负责切分） */
export function parseTsv(tsv: string): string[][] {
  return tsv
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line, index, all) => !(index === all.length - 1 && line === ''))
    .map((line) => line.split('\t'));
}

/** 二维数组 → TSV 文本（单元格逐个 escape，行尾用 \r\n，Windows Excel / WPS 兼容性最好） */
export function stringify(rows: string[][]): string {
  return rows.map((row) => row.map(escape).join('\t')).join('\r\n');
}

/** 复制载荷的输入 */
export interface CopyPayloadInput {
  /** ① 示例标题，如 '示例 1：按工号查姓名（精确匹配）' */
  title: string;
  /** ② 数据表表头 */
  header: string[];
  /** ② 数据表数据行 */
  rows: string[][];
  /** ④ 公式原文（以 = 开头） */
  formula: string;
  /** ⑤ 结果说明 */
  result: string;
}

/**
 * 拼装「复制公式 + 数据」的完整载荷。
 * 第 ③ 步的空行必须有，否则 Excel 会把公式接到表格下面变成一个单元格。
 */
export function buildCopyPayload(input: CopyPayloadInput): string {
  const lines: string[] = [];
  lines.push(escape(input.title));
  lines.push(input.header.map(escape).join('\t'));
  for (const row of input.rows) {
    lines.push(row.map(escape).join('\t'));
  }
  lines.push('');
  lines.push(input.formula);
  lines.push(`结果：${escape(input.result)}`);
  return lines.join('\r\n');
}

/**
 * 拼装「只复制公式」的载荷。
 * 只输出公式原文一行，不加标题、不加结果（PRD §6.4）。
 */
export function buildFormulaPayload(formula: string): string {
  return formula.trim();
}
